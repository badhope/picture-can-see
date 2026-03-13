/**
 * 事件服务
 * 负责事件匹配、触发和逻辑链管理
 */

class EventService {
    constructor(timelineData, chainsData, randomData) {
        this.timeline = timelineData;
        this.chains = chainsData;
        this.random = randomData;
        this.eventHistory = [];
    }

    getNextEvent(player) {
        const timelineEvent = this.checkTimelineEvents(player);
        if (timelineEvent) return timelineEvent;

        const chainEvent = this.checkChainEvents(player);
        if (chainEvent) return chainEvent;

        const randomEvent = this.tryTriggerRandomEvent(player);
        if (randomEvent) return randomEvent;

        return null;
    }

    checkTimelineEvents(player) {
        const stageId = player.lifeStage?.id || this.getStageByAge(player.age);
        const stageEvents = this.timeline[stageId] || [];

        const available = this.filterEventsByConditions(stageEvents, player);
        
        if (available.length > 0) {
            const alreadyTriggered = available.filter(e => 
                !this.hasEventOccurred(e.id)
            );
            if (alreadyTriggered.length > 0) {
                return alreadyTriggered[0];
            }
        }

        return null;
    }

    checkChainEvents(player) {
        if (!player.activeChains || player.activeChains.length === 0) {
            return null;
        }

        for (const chainId of player.activeChains) {
            const chain = this.chains[chainId];
            if (!chain) continue;

            const currentStageIndex = chain.stages.indexOf(player.lifeStage?.id);
            if (currentStageIndex < 0 || currentStageIndex >= chain.chain.length) {
                continue;
            }

            const chainNode = chain.chain[currentStageIndex];
            if (this.checkChainCondition(chainNode.condition, player)) {
                const event = this.findEventById(chainNode.event);
                if (event && !this.hasEventOccurred(event.id)) {
                    return event;
                }
            }
        }

        return null;
    }

    tryTriggerRandomEvent(player) {
        const luck = player.attributes.luck;
        const age = player.age;

        const eventTypes = ['positive', 'negative', 'neutral'];
        const weights = [
            0.3 + (luck - 5) * 0.05,
            0.4 - (luck - 5) * 0.05,
            0.3
        ];

        const selectedType = this.weightedRandom(eventTypes, weights);
        const eventsOfType = this.random[selectedType] || [];

        const suitableEvents = eventsOfType.filter(e => {
            if (e.ageRange) {
                if (age < e.ageRange[0] || age > e.ageRange[1]) return false;
            }

            let probability = e.baseProbability || 0.05;

            if (e.luckMultiplier) {
                probability *= (1 + (luck - 5) * e.luckMultiplier * 0.1);
            }

            return Math.random() < probability;
        });

        if (suitableEvents.length > 0) {
            const event = suitableEvents[Math.floor(Math.random() * suitableEvents.length)];
            return {
                id: event.id,
                title: event.title,
                description: event.description,
                type: 'random',
                randomEventType: selectedType,
                choices: [
                    {
                        text: '接受',
                        effects: event.effects || {},
                        healthChange: event.healthChange || 0
                    }
                ]
            };
        }

        return null;
    }

    filterEventsByConditions(events, player) {
        return events.filter(event => {
            if (this.hasEventOccurred(event.id)) return false;

            const conditions = event.conditions || {};
            const tags = event.tags || {};

            if (conditions.age) {
                if (player.age < conditions.age.min || player.age > conditions.age.max) {
                    return false;
                }
            }

            if (conditions.flags && conditions.flags.length > 0) {
                for (const flag of conditions.flags) {
                    if (!player.hasFlag(flag)) return false;
                }
            }

            if (conditions.attributes) {
                for (const [attr, min] of Object.entries(conditions.attributes)) {
                    if (player.attributes[attr] < min) return false;
                }
            }

            let probability = conditions.probability || 0.7;
            const luck = player.attributes.luck;
            probability *= (0.8 + (luck - 5) * 0.05);

            return Math.random() < probability;
        });
    }

    checkChainCondition(condition, player) {
        if (!condition) return true;

        if (condition.flag) {
            if (!player.hasFlag(condition.flag)) return false;
        }

        if (condition.flags) {
            for (const flag of condition.flags) {
                if (!player.hasFlag(flag)) return false;
            }
        }

        if (condition.attributes) {
            for (const [attr, min] of Object.entries(condition.attributes)) {
                if (player.attributes[attr] < min) return false;
            }
        }

        return true;
    }

    findEventById(eventId) {
        for (const stageEvents of Object.values(this.timeline)) {
            const event = stageEvents.find(e => e.id === eventId);
            if (event) return event;
        }
        return null;
    }

    hasEventOccurred(eventId) {
        return this.eventHistory.some(e => e.eventId === eventId);
    }

    recordEvent(eventId, choiceIndex) {
        this.eventHistory.push({ eventId, choiceIndex, timestamp: Date.now() });
    }

    weightedRandom(items, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * total;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) return items[i];
        }
        
        return items[items.length - 1];
    }

    getStageByAge(age) {
        if (age <= 3) return 'baby';
        if (age <= 12) return 'child';
        if (age <= 18) return 'teen';
        if (age <= 35) return 'young';
        if (age <= 55) return 'middle';
        return 'elder';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventService;
}
