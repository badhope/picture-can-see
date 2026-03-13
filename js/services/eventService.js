/**
 * 事件系统模块
 * 负责事件的触发、选择和效果应用
 * @module services/EventService
 */

import { CONFIG } from '../config.js';
import { Utils } from '../utils.js';

/**
 * 事件服务类
 * 提供事件相关的业务逻辑
 */
export class EventService {
    /**
     * 创建事件服务实例
     * @param {Object} player - 玩家对象
     */
    constructor(player) {
        /** @type {Object} */
        this.player = player;
        
        /** @type {Array} */
        this.eventHistory = [];
        
        /** @type {number} */
        this.lastEventYear = -1;
    }

    /**
     * 尝试触发随机事件
     * @returns {Object|null} 事件对象
     */
    tryTriggerRandomEvent() {
        // 检查是否到了触发事件的年份
        if (!this._shouldTriggerEvent()) {
            return null;
        }
        
        // 获取可用事件池
        const availableEvents = this._getAvailableEvents();
        
        if (availableEvents.length === 0) {
            return null;
        }
        
        // 根据权重随机选择一个事件
        const event = this._selectEventByWeight(availableEvents);
        
        // 记录事件历史
        this._recordEvent(event);
        
        return event;
    }

    /**
     * 检查是否应该触发事件
     * @private
     * @returns {boolean} 是否应该触发
     */
    _shouldTriggerEvent() {
        const yearsSinceLastEvent = this.player.year - this.lastEventYear;
        
        // 至少间隔一定年份才能触发新事件
        const minInterval = CONFIG.GAME.eventMinInterval;
        const maxInterval = CONFIG.GAME.eventMaxInterval;
        
        if (yearsSinceLastEvent < minInterval) {
            return false;
        }
        
        // 超过最大间隔必定触发
        if (yearsSinceLastEvent >= maxInterval) {
            return true;
        }
        
        // 根据概率决定是否触发
        const probability = this._calculateTriggerProbability(yearsSinceLastEvent);
        return Math.random() < probability;
    }

    /**
     * 计算事件触发概率
     * @private
     * @param {number} yearsSinceLastEvent - 距离上次事件的年数
     * @returns {number} 触发概率
     */
    _calculateTriggerProbability(yearsSinceLastEvent) {
        const baseProbability = CONFIG.GAME.eventBaseProbability;
        const luckModifier = (this.player.attributes.luck - 5) * 0.05;
        const yearModifier = (yearsSinceLastEvent - CONFIG.GAME.eventMinInterval) * 0.1;
        
        return Math.min(0.9, Math.max(0.1, baseProbability + luckModifier + yearModifier));
    }

    /**
     * 获取可用事件池
     * @private
     * @returns {Array} 事件数组
     */
    _getAvailableEvents() {
        // TODO: 从全局事件数据中过滤可用事件
        const allEvents = window.EVENTS || [];
        
        // 根据年龄、人生阶段、属性等条件过滤
        return allEvents.filter(event => {
            // 检查年龄范围
            if (event.ageRange) {
                const [minAge, maxAge] = event.ageRange;
                if (this.player.age < minAge || this.player.age > maxAge) {
                    return false;
                }
            }
            
            // 检查人生阶段
            if (event.stage && event.stage !== this.player.lifeStage.id) {
                return false;
            }
            
            // 检查属性要求
            if (event.requiredAttributes) {
                if (!Utils.checkAttributeRequirements(event.requiredAttributes, this.player.attributes)) {
                    return false;
                }
            }
            
            // 检查 flag 条件
            if (event.requiredFlags) {
                for (const flag of event.requiredFlags) {
                    if (!this.player.hasFlag(flag)) {
                        return false;
                    }
                }
            }
            
            // 检查互斥 flag
            if (event.excludedFlags) {
                for (const flag of event.excludedFlags) {
                    if (this.player.hasFlag(flag)) {
                        return false;
                    }
                }
            }
            
            // 检查是否已经触发过（如果事件只能触发一次）
            if (event.once && this._hasEventOccurred(event.id)) {
                return false;
            }
            
            return true;
        });
    }

    /**
     * 根据权重选择事件
     * @private
     * @param {Array} events - 事件数组
     * @returns {Object} 选中的事件
     */
    _selectEventByWeight(events) {
        if (events.length === 1) {
            return events[0];
        }
        
        // 提取权重
        const weights = events.map(e => e.weight || 1);
        
        // 使用加权随机选择
        return Utils.weightedRandom(events, weights);
    }

    /**
     * 处理事件选择
     * @param {Object} event - 事件对象
     * @param {number} choiceIndex - 选择索引
     * @returns {Object} 选择结果
     */
    handleChoice(event, choiceIndex) {
        const choice = event.choices[choiceIndex];
        
        if (!choice) {
            return {
                success: false,
                message: '无效的选择'
            };
        }
        
        // 应用效果
        const appliedEffects = this.player.applyEffects(choice.effects || {});
        
        // 设置 flag
        if (choice.setFlags) {
            for (const flag of choice.setFlags) {
                this.player.setFlag(flag);
            }
        }
        
        // 更新金钱
        if (choice.money !== undefined) {
            if (choice.money > 0) {
                this.player.addMoney(choice.money);
            } else {
                this.player.spendMoney(Math.abs(choice.money));
            }
        }
        
        // 记录事件
        this.player.recordEvent(event, choice);
        
        // 更新最后事件年份
        this.lastEventYear = this.player.year;
        
        // 返回结果
        return {
            success: true,
            event: event,
            choice: choice,
            appliedEffects: appliedEffects,
            newAttributes: { ...this.player.attributes }
        };
    }

    /**
     * 检查事件是否已经发生
     * @private
     * @param {string} eventId - 事件 ID
     * @returns {boolean} 是否已发生
     */
    _hasEventOccurred(eventId) {
        return this.eventHistory.some(e => e.eventId === eventId);
    }

    /**
     * 记录事件到历史
     * @private
     * @param {Object} event - 事件对象
     */
    _recordEvent(event) {
        this.eventHistory.push({
            eventId: event.id,
            year: this.player.year,
            age: this.player.age
        });
    }

    /**
     * 获取事件历史
     * @returns {Array} 事件历史数组
     */
    getHistory() {
        return [...this.eventHistory];
    }
}
