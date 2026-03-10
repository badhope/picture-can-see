/**
 * 事件系统
 * 负责事件的触发、选择、结果计算等逻辑
 */

/**
 * 获取指定人生阶段的所有事件
 * @param {string} stageId - 人生阶段ID (baby/child/teen/young/middle/elder)
 * @returns {Array} 事件数组
 */
function getAllEventsForStage(stageId) {
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
    
    // 合并阶段事件和通用事件
    const stageEvents = EVENTS[eventKey] || [];
    const universalEvents = EVENTS.universal || [];
    
    return [...stageEvents, ...universalEvents];
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
        this.cooldown = 0;  // 事件冷却
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

        // 根据概率决定是否触发事件
        if (Math.random() > CONFIG.GAME.eventBaseProbability) {
            return null;
        }

        // 获取当前阶段的事件列表
        const stageId = this.player.lifeStage.id;
        const availableEvents = getAllEventsForStage(stageId);

        if (availableEvents.length === 0) {
            return null;
        }

        // 根据属性和运气筛选事件
        const filteredEvents = this.filterEvents(availableEvents);
        
        if (filteredEvents.length === 0) {
            return null;
        }

        // 随机选择一个事件
        const event = filteredEvents[Utils.randomInt(0, filteredEvents.length - 1)];
        
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

        // 清理当前事件
        this.currentEvent = null;

        return {
            success: true,
            event: event,
            choice: choice,
            result: result,
            appliedEffects: appliedEffects,
            newAttributes: { ...this.player.attributes },
            attributeChanges: appliedEffects
        };
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
     * 检查是否满足职业要求
     * @param {Object} career - 职业对象
     * @returns {boolean} 是否满足
     */
    meetsCareerRequirements(career) {
        if (!career.required) return true;
        
        for (const attr in career.required) {
            if (this.player.attributes[attr] < career.required[attr]) {
                return false;
            }
        }
        return true;
    }

    /**
     * 建议适合的职业
     * @returns {Array} 适合的职业数组
     */
    suggestCareers() {
        const allCareers = [];
        
        for (const category in CAREERS) {
            for (const career of CAREERS[category]) {
                if (this.meetsCareerRequirements(career)) {
                    allCareers.push({
                        ...career,
                        category: category
                    });
                }
            }
        }
        
        // 按薪资排序
        allCareers.sort((a, b) => b.salary - a.salary);
        
        return allCareers.slice(0, 5);
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
