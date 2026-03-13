/**
 * 工具函数模块
 * 提供通用的辅助函数和计算逻辑
 * @module utils
 */

import { CONFIG } from './config.js';

/**
 * 工具函数集合
 */
export const Utils = Object.freeze({
    /**
     * 生成指定范围内的随机整数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机整数
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * 生成指定范围内的随机浮点数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机浮点数
     */
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * 根据权重随机选择
     * @param {Array} items - 选项数组
     * @param {Array<number>} weights - 权重数组
     * @returns {*} 选中的选项
     */
    weightedRandom: function(items, weights) {
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        return items[items.length - 1];
    },
    
    /**
     * 深拷贝对象
     * @template T
     * @param {T} obj - 要拷贝的对象
     * @returns {T} 拷贝后的对象
     */
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * 格式化数字（添加千分位分隔符）
     * @param {number} num - 数字
     * @returns {string} 格式化后的字符串
     */
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    /**
     * 计算属性影响值
     * @param {number} baseValue - 基础值
     * @param {number} attribute - 属性值
     * @param {number} multiplier - 乘数
     * @returns {number} 影响后的值
     */
    calculateAttributeEffect: function(baseValue, attribute, multiplier = 0.1) {
        return Math.round(baseValue * (1 + (attribute - 5) * multiplier));
    },
    
    /**
     * 获取当前人生阶段
     * @param {number} age - 年龄
     * @returns {Object} 人生阶段对象
     */
    getLifeStage: function(age) {
        for (const stage of CONFIG.LIFE_STAGES) {
            if (age >= stage.minAge && age <= stage.maxAge) {
                return stage;
            }
        }
        return CONFIG.LIFE_STAGES[CONFIG.LIFE_STAGES.length - 1];
    },
    
    /**
     * XSS 过滤 - 转义 HTML 特殊字符
     * @param {string} str - 要过滤的字符串
     * @returns {string} 过滤后的安全字符串
     */
    escapeHtml: function(str) {
        if (typeof str !== 'string') return str;
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return str.replace(/[&<>"'/]/g, char => escapeMap[char]);
    },
    
    /**
     * 清理并验证玩家名称
     * @param {string} name - 玩家名称
     * @param {number} maxLength - 最大长度
     * @returns {string} 清理后的名称
     */
    sanitizePlayerName: function(name, maxLength = 20) {
        if (typeof name !== 'string') return '玩家';
        let sanitized = name.trim().substring(0, maxLength);
        sanitized = this.escapeHtml(sanitized);
        if (sanitized.length === 0) return '玩家';
        return sanitized;
    },

    /**
     * 计算生命值上限
     * @param {number} constitution - 体质属性
     * @param {number} age - 年龄
     * @returns {number} 生命值上限
     */
    calculateMaxHealth: function(constitution, age) {
        let maxHealth = constitution * 10;
        if (age > 60) {
            maxHealth -= (age - 60) * 0.5;
        }
        if (age > 80) {
            maxHealth -= (age - 80) * 1;
        }
        return Math.max(10, Math.round(maxHealth));
    },

    /**
     * 计算每年自然生命值衰减
     * @param {number} age - 年龄
     * @returns {number} 每年衰减的生命值
     */
    calculateAnnualHealthDecay: function(age) {
        if (age < 30) return 0;
        if (age < 50) return 0.2;
        if (age < 70) return 0.5;
        if (age < 85) return 1;
        return 2;
    },

    /**
     * 计算疾病概率
     * @param {number} constitution - 体质属性
     * @param {number} age - 年龄
     * @param {number} eraModifier - 时代修正（疫情等）
     * @returns {number} 疾病概率 (0-1)
     */
    calculateIllnessProbability: function(constitution, age, eraModifier = 1) {
        let baseProb = 0.15;
        baseProb -= (constitution - 5) * 0.02;
        if (age < 10) baseProb += 0.05;
        if (age > 50) baseProb += (age - 50) * 0.005;
        if (age > 70) baseProb += (age - 70) * 0.01;
        return Math.max(0.02, Math.min(0.5, baseProb * eraModifier));
    },

    /**
     * 计算学业成功率
     * @param {number} intelligence - 智力属性
     * @param {number} luck - 运气属性
     * @returns {number} 成功率 (0-1)
     */
    calculateAcademicSuccess: function(intelligence, luck) {
        let base = 0.5 + (intelligence - 5) * 0.1;
        base += (luck - 5) * 0.05;
        return Math.max(0.1, Math.min(0.95, base));
    },

    /**
     * 计算社交成功率
     * @param {number} charisma - 魅力属性
     * @param {number} intelligence - 智力属性
     * @returns {number} 成功率 (0-1)
     */
    calculateSocialSuccess: function(charisma, intelligence) {
        let base = 0.4 + charisma * 0.08 + intelligence * 0.04;
        return Math.max(0.1, Math.min(0.95, base));
    },

    /**
     * 计算随机事件触发概率
     * @param {number} luck - 运气属性
     * @param {number} baseProbability - 基础概率
     * @returns {number} 最终概率
     */
    calculateRandomEventProbability: function(luck, baseProbability) {
        return baseProbability * (0.5 + luck * 0.1);
    },

    /**
     * 根据属性判断是否能解锁选项
     * @param {Object<string, number|Object>} requiredAttrs - 需要的属性 {attr: value}
     * @param {Object<string, number>} playerAttrs - 玩家当前属性
     * @returns {boolean} 是否满足条件
     */
    checkAttributeRequirements: function(requiredAttrs, playerAttrs) {
        for (const attr in requiredAttrs) {
            const required = requiredAttrs[attr];
            const playerValue = playerAttrs[attr];
            
            if (typeof required === 'number') {
                if (playerValue < required) return false;
            } else if (typeof required === 'object') {
                if (required.min !== undefined && playerValue < required.min) return false;
                if (required.max !== undefined && playerValue > required.max) return false;
            }
        }
        return true;
    },

    /**
     * 计算最终评分（用于结局判定）
     * @param {Object<string, number>} attributes - 五大属性
     * @param {Object} stats - 游戏统计数据
     * @returns {number} 最终评分
     */
    calculateFinalScore: function(attributes, stats) {
        let score = 0;
        score += attributes.intelligence * 10;
        score += attributes.constitution * 10;
        score += attributes.charisma * 8;
        score += attributes.luck * 5;
        score += attributes.morality * 8;
        
        if (stats.money > 100000) score += Math.log10(stats.money / 100000) * 10;
        if (stats.achievements) score += stats.achievements.length * 5;
        if (stats.married) score += 20;
        if (stats.children) score += stats.children * 10;
        
        return Math.round(score);
    }
});
