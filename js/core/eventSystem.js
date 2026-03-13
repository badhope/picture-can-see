/**
 * 事件系统
 * 负责事件的触发、选择、结果计算等逻辑
 * 支持事件优先级、事件链、调试工具等高级功能
 */

/**
 * 事件优先级配置
 */
const EVENT_PRIORITY = {
    CRITICAL: 100,   // 关键事件（人生转折点）
    HIGH: 75,       // 高优先级事件
    NORMAL: 50,     // 普通事件
    LOW: 25,        // 低优先级事件
    RANDOM: 10      // 随机事件
};

/**
 * 事件链管理器
 */
class EventChainManager {
    constructor() {
        this.activeChains = new Map();
        this.completedChains = new Set();
    }

    registerChain(chainId, events, conditions) {
        this.activeChains.set(chainId, {
            events: events,
            currentIndex: 0,
            conditions: conditions,
            progress: 0
        });
    }

    checkChainProgress(player, eventId) {
        for (const [chainId, chain] of this.activeChains) {
            if (chain.currentIndex < chain.events.length) {
                const expectedEvent = chain.events[chain.currentIndex];
                if (expectedEvent.id === eventId) {
                    chain.currentIndex++;
                    chain.progress = chain.currentIndex / chain.events.length;
                    
                    if (chain.currentIndex >= chain.events.length) {
                        this.completedChains.add(chainId);
                        this.activeChains.delete(chainId);
                        return { completed: true, chainId };
                    }
                    return { progress: chain.progress, chainId };
                }
            }
        }
        return null;
    }

    getActiveChain() {
        for (const [chainId, chain] of this.activeChains) {
            if (chain.currentIndex < chain.events.length) {
                return chain.events[chain.currentIndex];
            }
        }
        return null;
    }

    isEventInChain(eventId) {
        for (const [chainId, chain] of this.activeChains) {
            const targetEvent = chain.events[chain.currentIndex];
            if (targetEvent && targetEvent.id === eventId) {
                return true;
            }
        }
        return false;
    }

    reset() {
        this.activeChains.clear();
        this.completedChains.clear();
    }
}

/**
 * 事件调试工具
 */
const EventDebugger = {
    enabled: false,
    eventLog: [],
    maxLogSize: 100,

    enable() {
        this.enabled = true;
        if (CONFIG.DEBUG) console.log('[事件调试] 调试模式已开启');
    },

    disable() {
        this.enabled = false;
        if (CONFIG.DEBUG) console.log('[事件调试] 调试模式已关闭');
    },

    log(event, action, details = {}) {
        if (!this.enabled) return;

        const logEntry = {
            timestamp: Date.now(),
            eventId: event.id,
            eventTitle: event.title,
            action,
            details,
            playerAge: window.game?.player?.age || 0
        };

        this.eventLog.push(logEntry);
        if (this.eventLog.length > this.maxLogSize) {
            this.eventLog.shift();
        }

        if (CONFIG.DEBUG) console.log(`[事件调试] ${action}: ${event.title}`, details);
    },

    getLog() {
        return [...this.eventLog];
    },

    clearLog() {
        this.eventLog = [];
        if (CONFIG.DEBUG) console.log('[事件调试] 日志已清空');
    },

    exportLog() {
        return JSON.stringify(this.eventLog, null, 2);
    },

    getEventStats() {
        const stats = {
            total: this.eventLog.length,
            byAction: {},
            byAge: {}
        };

        this.eventLog.forEach(entry => {
            stats.byAction[entry.action] = (stats.byAction[entry.action] || 0) + 1;
            const ageGroup = Math.floor(entry.playerAge / 10) * 10;
            stats.byAge[ageGroup] = (stats.byAge[ageGroup] || 0) + 1;
        });

        return stats;
    }
};

if (typeof window !== 'undefined') {
    window.EventDebugger = EventDebugger;
}

/**
 * 获取指定人生阶段的所有事件（带优先级排序）
 * @param {string} stageId - 人生阶段ID
 * @param {Object} player - 玩家对象
 * @returns {Array} 排序后的事件数组
 */
function getAllEventsForStage(stageId, player = null) {
    const stageMapping = {
        'baby': 'baby',
        'child': 'child',
        'teen': 'teen',
        'young': 'young',
        'middle': 'middle',
        'elder': 'elder'
    };
    
    const eventKey = stageMapping[stageId];
    if (!eventKey || !EVENTS[eventKey]) {
        return [];
    }
    
    const stageEvents = EVENTS[eventKey] || [];
    const universalEvents = EVENTS.universal || [];
    const allEvents = [...stageEvents, ...universalEvents];

    if (player) {
        return sortEventsByPriority(allEvents, player);
    }
    
    return allEvents;
}

/**
 * 根据优先级和玩家属性对事件进行排序
 * @param {Array} events - 事件数组
 * @param {Object} player - 玩家对象
 * @returns {Array} 排序后的事件数组
 */
function sortEventsByPriority(events, player) {
    return events.map(event => {
        let priority = event.priority || EVENT_PRIORITY.NORMAL;
        
        if (player) {
            if (event.type === 'milestone') {
                priority = EVENT_PRIORITY.CRITICAL;
            } else if (event.type === 'career' && player.age >= 18) {
                priority = EVENT_PRIORITY.HIGH;
            } else if (event.type === 'relationship' && player.attributes.charisma > 7) {
                priority = Math.min(priority + 20, EVENT_PRIORITY.HIGH);
            } else if (event.type === 'health' && player.attributes.constitution < 4) {
                priority = Math.min(priority + 25, EVENT_PRIORITY.HIGH);
            }
        }
        
        return { ...event, _priority: priority };
    }).sort((a, b) => b._priority - a._priority);
}

class EventSystem {

    /**
     * 创建事件系统实例
     * @param {Player} player - 玩家对象
     */
    constructor(player) {
        this.player = player;
        this.currentEvent = null;
        this.eventHistory = [];
        this.cooldown = 0;
        this.chainManager = new EventChainManager();
    }

    /**
     * 尝试触发新事件
     * @returns {Object|null} 事件对象，如果没有事件触发则返回null
     */
    tryTriggerEvent() {
        // 检查冷却
        if (this.cooldown > 0) {
            this.cooldown--;
            return null;
        }

        // 首先检查是否有活跃的事件链
        const chainEvent = this.chainManager.getActiveChain();
        if (chainEvent) {
            if (!this.hasEventOccurred(chainEvent.id)) {
                EventDebugger.log(chainEvent, 'CHAIN_EVENT_TRIGGER');
                this.cooldown = Utils.randomInt(1, 2);
                this.currentEvent = chainEvent;
                return chainEvent;
            }
        }

        // 根据概率决定是否触发事件
        if (Math.random() > CONFIG.GAME.eventBaseProbability) {
            return null;
        }

        // 获取当前阶段的事件列表（带优先级排序）
        const stageId = this.player.lifeStage.id;
        const availableEvents = getAllEventsForStage(stageId, this.player);

        if (availableEvents.length === 0) {
            return null;
        }

        // 优先触发高优先级事件
        const highPriorityEvents = availableEvents.filter(e => 
            (e._priority || 50) >= EVENT_PRIORITY.HIGH && !this.hasEventOccurred(e.id)
        );
        
        let selectedEvents = highPriorityEvents.length > 0 
            ? highPriorityEvents 
            : availableEvents;
        
        // 根据属性和运气筛选事件
        const filteredEvents = this.filterEvents(selectedEvents);
        
        if (filteredEvents.length === 0) {
            return null;
        }

        // 按优先级排序后选择
        filteredEvents.sort((a, b) => (b._priority || 50) - (a._priority || 50));
        
        // 随机选择一个事件（高优先级有更高几率）
        let eventIndex;
        if (filteredEvents.length > 1 && (filteredEvents[0]._priority || 50) > (filteredEvents[1]._priority || 50)) {
            eventIndex = 0; // 高优先级事件直接选择第一个
        } else {
            eventIndex = Utils.randomInt(0, filteredEvents.length - 1);
        }
        
        const event = filteredEvents[eventIndex];
        
        // 检查事件概率
        if (event.probability !== undefined) {
            if (Math.random() > event.probability) {
                return null;
            }
        }

        // 设置冷却
        this.cooldown = Utils.randomInt(
            CONFIG.GAME.eventMinInterval,
            CONFIG.GAME.eventMaxInterval
        );

        this.currentEvent = event;
        
        // 调试日志
        EventDebugger.log(event, 'EVENT_TRIGGER', { 
            priority: event._priority,
            age: this.player.age,
            stage: stageId
        });
        
        return event;
    }

    /**
     * 根据玩家属性过滤事件
     * @param {Array} events - 事件数组
     * @returns {Array} 过滤后的事件数组
     */
    filterEvents(events) {
        return events.filter(event => {
            // 过滤掉已经发生过的事件（避免重复）
            if (this.hasEventOccurred(event.id)) {
                return false;
            }

            // 根据玩家属性调整触发概率
            // 高智力玩家更容易触发学习相关事件
            // 高魅力玩家更容易触发社交相关事件
            // 高体质玩家更容易触发健康相关事件
            // 高运气玩家事件概率全面提升
            
            let probability = 1.0;
            
            // 基础概率受运气影响
            probability *= (0.8 + (this.player.attributes.luck - 5) * 0.05);
            
            return Math.random() < probability;
        });
    }

    /**
     * 检查事件是否已经发生过
     * @param {string} eventId - 事件ID
     * @returns {boolean} 是否发生过
     */
    hasEventOccurred(eventId) {
        return this.eventHistory.some(e => e.eventId === eventId);
    }

    /**
     * 处理玩家选择
     * @param {number} choiceIndex - 选择索引
     * @returns {Object} 选择结果
     */
    handleChoice(choiceIndex) {
        if (!this.currentEvent) {
            return { success: false, message: '没有当前事件' };
        }

        const event = this.currentEvent;
        const choice = event.choices[choiceIndex];

        if (!choice) {
            return { success: false, message: '无效的选择' };
        }

        // 调试日志
        EventDebugger.log(event, 'EVENT_CHOICE', { 
            choiceIndex, 
            choice: choice.text 
        });

        // 计算选择结果
        const result = this.calculateResult(choice);

        // 应用效果
        const appliedEffects = this.player.applyEffects(result.effects);

        // 记录事件
        this.player.recordEvent(event, choice);
        this.eventHistory.push({
            eventId: event.id,
            eventTitle: event.title,
            choiceIndex: choiceIndex,
            age: this.player.age,
            effects: appliedEffects
        });

        // 检查事件链进度
        const chainResult = this.chainManager.checkChainProgress(this.player, event.id);
        if (chainResult) {
            EventDebugger.log(event, 'CHAIN_PROGRESS', chainResult);
            if (chainResult.completed) {
                result.messages.push(`🎉 事件链完成: ${chainResult.chainId}`);
            }
        }

        // 检查是否有后续事件需要触发
        if (event.nextEvent) {
            this.queueNextEvent(event.nextEvent);
        }

        // 清理当前事件
        this.currentEvent = null;

        return {
            success: true,
            event: event,
            choice: choice,
            result: result,
            appliedEffects: appliedEffects,
            newAttributes: { ...this.player.attributes },
            attributeChanges: appliedEffects,
            chainProgress: chainResult
        };
    }

    /**
     * 队列下一个事件
     * @param {string|Object} nextEvent - 下一个事件ID或事件对象
     */
    queueNextEvent(nextEvent) {
        if (typeof nextEvent === 'string') {
            const eventData = this.findEventById(nextEvent);
            if (eventData) {
                this.currentEvent = eventData;
            }
        } else if (nextEvent.trigger === 'immediate') {
            this.currentEvent = nextEvent;
        }
    }

    /**
     * 尝试触发随机事件
     * @returns {Object|null} 随机事件
     */
    tryTriggerRandomEvent() {
        const luck = this.player.attributes.luck;
        const age = this.player.age;
        
        const eventTypes = ['positive', 'negative', 'neutral'];
        const weights = [0.3 + (luck - 5) * 0.05, 0.4 - (luck - 5) * 0.05, 0.3];
        
        const selectedType = Utils.weightedRandom(eventTypes, weights);
        const eventsOfType = RANDOM_EVENTS[selectedType] || [];
        
        const suitableEvents = eventsOfType.filter(e => {
            if (e.ageRange) {
                if (age < e.ageRange[0] || age > e.ageRange[1]) return false;
            }
            
            let probability = e.baseProbability || 0.05;
            
            if (e.luckMultiplier) {
                probability *= (1 + (luck - 5) * e.luckMultiplier * 0.1);
            }
            if (e.constitutionMultiplier && selectedType === 'negative') {
                probability *= (1 + (5 - this.player.attributes.constitution) * e.constitutionMultiplier * 0.1);
            }
            if (e.intelligenceMultiplier) {
                probability *= (1 + (this.player.attributes.intelligence - 5) * e.intelligenceMultiplier * 0.1);
            }
            if (e.charismaMultiplier && selectedType === 'positive') {
                probability *= (1 + (this.player.attributes.charisma - 5) * e.charismaMultiplier * 0.1);
            }
            if (e.moralityMultiplier && selectedType === 'neutral') {
                probability *= (1 + (this.player.attributes.morality - 5) * e.moralityMultiplier * 0.1);
            }
            
            return Math.random() < probability;
        });
        
        if (suitableEvents.length > 0) {
            const event = suitableEvents[Math.floor(Math.random() * suitableEvents.length)];
            
            const randomEvent = {
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
            
            this.currentEvent = randomEvent;
            
            if (selectedType === 'positive') {
                this.player.recordLuckEvent('lucky');
            } else if (selectedType === 'negative') {
                this.player.recordLuckEvent('unlucky');
            }
            
            return randomEvent;
        }
        
        return null;
    }

    /**
     * 根据ID查找事件
     * @param {string} eventId - 事件ID
     * @returns {Object|null} 事件对象
     */
    findEventById(eventId) {
        for (const key in EVENTS) {
            const found = EVENTS[key].find(e => e.id === eventId);
            if (found) return found;
        }
        return null;
    }

    /**
     * 计算选择结果
     * @param {Object} choice - 选项对象
     * @returns {Object} 结果对象
     */
    calculateResult(choice) {
        const effects = { ...choice.effects };
        const messages = [];

        // 处理概率性效果
        if (choice.probability !== undefined) {
            const roll = Math.random();
            if (roll > choice.probability) {
                // 概率未通过，效果反转或失效
                messages.push('很遗憾，这次没有成功...');
                for (const attr in effects) {
                    if (typeof effects[attr] === 'number' && attr !== 'money' && attr !== 'cost') {
                        effects[attr] = -Math.abs(effects[attr]);
                    }
                }
            } else {
                messages.push('成功了！');
            }
        }

        // 运气对结果的修正
        if (effects.luck > 0) {
            const luckBonus = Math.floor(this.player.attributes.luck / 3);
            if (luckBonus > 0) {
                messages.push(`运气不错，效果额外+${luckBonus}！`);
            }
        }

        // 智力对学习和思考类效果的加成
        if (effects.intelligence > 0) {
            const intBonus = Math.floor((this.player.attributes.intelligence - 5) * 0.3);
            if (intBonus > 0) {
                effects.intelligence += intBonus;
            }
        }

        // 魅力对社交类效果的加成
        if (effects.charisma > 0) {
            const chaBonus = Math.floor((this.player.attributes.charisma - 5) * 0.3);
            if (chaBonus > 0) {
                effects.charisma += chaBonus;
            }
        }

        // 体质对健康类效果的加成
        if (effects.constitution > 0) {
            const conBonus = Math.floor((this.player.attributes.constitution - 5) * 0.3);
            if (conBonus > 0) {
                effects.constitution += conBonus;
            }
        }

        // 随机事件处理
        if (choice.money !== undefined) {
            const moneyChange = choice.money;
            if (moneyChange > 0) {
                messages.push(`获得了 ${Utils.formatNumber(moneyChange)} 元！`);
            } else {
                messages.push(`支出了 ${Utils.formatNumber(Math.abs(moneyChange))} 元`);
            }
        }

        if (choice.cost !== undefined) {
            messages.push(`花费了 ${Utils.formatNumber(choice.cost)} 元`);
        }

        return {
            effects: effects,
            messages: messages,
            success: true
        };
    }

    /**
     * 获取当前事件描述
     * @returns {string} 事件描述
     */
    getEventDescription() {
        if (!this.currentEvent) {
            return '暂无事件';
        }
        return this.currentEvent.description;
    }

    /**
     * 获取当前事件的选项
     * @returns {Array} 选项数组
     */
    getEventChoices() {
        if (!this.currentEvent) {
            return [];
        }
        return this.currentEvent.choices;
    }

    /**
     * 重置事件系统
     */
    reset() {
        this.currentEvent = null;
        this.eventHistory = [];
        this.cooldown = 0;
    }

    /**
     * 获取事件历史
     * @returns {Array} 历史记录
     */
    getHistory() {
        return this.eventHistory;
    }
}
