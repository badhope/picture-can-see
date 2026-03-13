/**
 * 玩家类模块
 * 管理角色的所有属性、状态和行为
 * @module core/Player
 */

import { CONFIG } from '../config.js';
import { Utils } from '../utils.js';

/**
 * 玩家类
 * 表示游戏中的角色实例
 */
export class Player {
    /**
     * 创建玩家对象
     * @param {Object} config - 初始配置
     * @param {string} [config.name='玩家'] - 玩家名称
     * @param {string} [config.gender='male'] - 性别
     * @param {number} [config.intelligence=5] - 智力属性
     * @param {number} [config.constitution=5] - 体质属性
     * @param {number} [config.charisma=5] - 魅力属性
     * @param {number} [config.luck=5] - 运气属性
     * @param {number} [config.morality=5] - 道德属性
     * @param {Object<string, number>} [config.zodiacBonus={}] - 星座加成
     * @param {Array} [config.talents=[]] - 天赋数组
     */
    constructor(config = {}) {
        /** @private */
        this._name = config.name || '玩家';
        /** @private */
        this._gender = config.gender || 'male';
        /** @private */
        this._age = 0;
        /** @private */
        this._year = 2006;
        /** @private */
        this._money = CONFIG.GAME.initialMoney;
        /** @private */
        this._totalMoney = 0;
        
        /**
         * 属性对象
         * @type {Object<string, number>}
         */
        this.attributes = {
            intelligence: config.intelligence || CONFIG.ATTRIBUTES.defaultValue,
            constitution: config.constitution || CONFIG.ATTRIBUTES.defaultValue,
            charisma: config.charisma || CONFIG.ATTRIBUTES.defaultValue,
            luck: config.luck || CONFIG.ATTRIBUTES.defaultValue,
            morality: config.morality || CONFIG.ATTRIBUTES.defaultValue
        };
        
        /** @type {Object<string, number>} */
        this.initialAttributes = { ...this.attributes };
        /** @type {Object<string, number>} */
        this.maxAttributes = { ...this.attributes };
        /** @type {Object<string, number>} */
        this.minAttributes = { ...this.attributes };
        
        /** @type {Object} */
        this.lifeStage = CONFIG.LIFE_STAGES[0];
        
        /** @private */
        this._eventsCount = 0;
        /** @type {Array} */
        this.eventHistory = [];
        
        /** @type {boolean} */
        this.isAlive = true;
        /** @type {boolean} */
        this.isPaused = false;
        
        /** @type {Object<string, number>} */
        this.zodiacBonus = config.zodiacBonus || {};
        /** @type {Array} */
        this.talents = config.talents || [];
        
        /** @type {number} */
        this.health = 50;
        /** @type {number} */
        this.maxHealth = 50;
        
        /** @type {Object<string, *>} */
        this.flags = {};
        /** @type {Object<string, Object>} */
        this.relationships = {};
        /** @type {Array} */
        this.achievements = [];
        
        /** @type {Object} */
        this.education = { level: 0, major: null, school: null };
        /** @type {Object} */
        this.career = { job: null, position: null, company: null, years: 0 };
        /** @type {Object} */
        this.family = { married: false, spouse: null, children: 0, parents: true };
        
        /** @type {Object} */
        this.stats = {
            totalEarnings: 0,
            totalSpending: 0,
            eventsTriggered: {},
            choicesMade: {},
            chainsCompleted: [],
            luckyEvents: 0,
            unluckyEvents: 0
        };
    }

    /**
     * 获取玩家名称
     * @type {string}
     */
    get name() {
        return this._name;
    }

    /**
     * 设置玩家名称
     * @param {string} value - 新的名称
     */
    set name(value) {
        this._name = Utils.sanitizePlayerName(value);
    }

    /**
     * 获取性别
     * @type {string}
     */
    get gender() {
        return this._gender;
    }

    /**
     * 获取年龄
     * @type {number}
     */
    get age() {
        return this._age;
    }

    /**
     * 获取年份
     * @type {number}
     */
    get year() {
        return this._year;
    }

    /**
     * 获取金钱
     * @type {number}
     */
    get money() {
        return this._money;
    }

    /**
     * 获取总金钱
     * @type {number}
     */
    get totalMoney() {
        return this._totalMoney;
    }

    /**
     * 获取事件数量
     * @type {number}
     */
    get eventsCount() {
        return this._eventsCount;
    }

    /**
     * 应用星座属性加成
     * @returns {void}
     */
    applyZodiacBonus() {
        for (const attr in this.zodiacBonus) {
            if (this.attributes[attr] !== undefined) {
                this.attributes[attr] += this.zodiacBonus[attr];
                // 确保不超过最大值
                if (this.attributes[attr] > CONFIG.ATTRIBUTES.maxValue) {
                    this.attributes[attr] = CONFIG.ATTRIBUTES.maxValue;
                }
            }
        }
        // 更新最高属性
        this.updateMaxAttributes();
    }

    /**
     * 更新最高属性记录
     * @returns {void}
     */
    updateMaxAttributes() {
        for (const attr in this.attributes) {
            if (this.attributes[attr] > this.maxAttributes[attr]) {
                this.maxAttributes[attr] = this.attributes[attr];
            }
        }
    }

    /**
     * 增加年龄
     * @param {number} [years=1] - 增加的年数
     * @returns {boolean} 是否成功
     */
    addAge(years = 1) {
        if (!this.isAlive) return false;
        
        this._age += years;
        this._year += years;
        
        if (this._age >= CONFIG.GAME.maxAge) {
            this._age = CONFIG.GAME.maxAge;
            this.die('自然老死');
            return true;
        }
        
        this.updateLifeStage();
        this.updateMaxHealth();
        this.applyAnnualHealthDecay();
        
        return true;
    }

    /**
     * 更新最大生命值
     * @returns {void}
     */
    updateMaxHealth() {
        this.maxHealth = Utils.calculateMaxHealth(this.attributes.constitution, this.age);
    }

    /**
     * 应用每年生命值自然衰减
     * @returns {void}
     */
    applyAnnualHealthDecay() {
        const decay = Utils.calculateAnnualHealthDecay(this.age);
        this.health = Math.max(0, this.health - decay);
        
        if (this.health <= 0) {
            this.die('因健康衰竭去世');
        }
    }

    /**
     * 改变生命值
     * @param {number} amount - 变化值（正数增加，负数减少）
     * @param {string} [reason='未知'] - 变化原因
     * @returns {boolean} 是否存活
     */
    changeHealth(amount, reason = '未知') {
        this.health = Math.max(0, Math.min(this.maxHealth, this.health + amount));
        
        if (this.health <= 0) {
            this.die(reason);
            return false;
        }
        return true;
    }

    /**
     * 设置 flag
     * @param {string} flag - flag 名称
     * @param {*} [value=true] - flag 值
     * @returns {void}
     */
    setFlag(flag, value = true) {
        this.flags[flag] = value;
    }

    /**
     * 检查 flag
     * @param {string} flag - flag 名称
     * @returns {boolean} flag 是否存在
     */
    hasFlag(flag) {
        return !!this.flags[flag];
    }

    /**
     * 更新关系
     * @param {string} characterId - 角色 ID
     * @param {number} change - 变化值
     * @param {string} [reason=''] - 原因
     * @returns {void}
     */
    updateRelationship(characterId, change, reason = '') {
        if (!this.relationships[characterId]) {
            this.relationships[characterId] = { level: 50, history: [] };
        }
        this.relationships[characterId].level = Math.max(0, Math.min(100, 
            this.relationships[characterId].level + change));
        this.relationships[characterId].history.push({
            change,
            reason,
            year: this.year
        });
    }

    /**
     * 更新人生阶段
     * @returns {boolean} 阶段是否发生变化
     */
    updateLifeStage() {
        const newStage = Utils.getLifeStage(this.age);
        if (newStage.id !== this.lifeStage.id) {
            this.lifeStage = newStage;
            return true; // 阶段发生变化
        }
        return false;
    }

    /**
     * 应用属性变化
     * @param {Object<string, number>} effects - 效果对象
     * @returns {Object<string, number>} 实际应用的效果
     */
    applyEffects(effects) {
        const applied = {};
        
        for (const attr in effects) {
            if (this.attributes[attr] !== undefined) {
                const oldValue = this.attributes[attr];
                const change = effects[attr];
                
                this.attributes[attr] += change;
                
                // 限制在合理范围内
                if (this.attributes[attr] < CONFIG.ATTRIBUTES.minValue) {
                    this.attributes[attr] = CONFIG.ATTRIBUTES.minValue;
                }
                if (this.attributes[attr] > CONFIG.ATTRIBUTES.maxValue) {
                    this.attributes[attr] = CONFIG.ATTRIBUTES.maxValue;
                }
                
                applied[attr] = this.attributes[attr] - oldValue;
                
                // 更新最高属性
                if (this.attributes[attr] > this.maxAttributes[attr]) {
                    this.maxAttributes[attr] = this.attributes[attr];
                }
                
                // 更新最低属性
                if (this.attributes[attr] < this.minAttributes[attr]) {
                    this.minAttributes[attr] = this.attributes[attr];
                }
            }
        }
        
        // 处理金钱变化
        if (effects.money !== undefined) {
            const moneyChange = effects.money;
            this._money += moneyChange;
            if (moneyChange > 0) {
                this._totalMoney += moneyChange;
            }
            applied.money = moneyChange;
        }
        
        // 处理消费
        if (effects.cost !== undefined) {
            this._money -= Math.abs(effects.cost);
            applied.cost = -Math.abs(effects.cost);
        }
        
        return applied;
    }

    /**
     * 增加金钱
     * @param {number} amount - 金额
     * @returns {boolean} 是否成功
     */
    addMoney(amount) {
        if (amount <= 0) return false;
        
        this._money += amount;
        this._totalMoney += amount;
        return true;
    }

    /**
     * 减少金钱
     * @param {number} amount - 金额
     * @returns {boolean} 是否成功
     */
    spendMoney(amount) {
        if (amount <= 0) return false;
        if (this._money < amount) return false;
        
        this._money -= amount;
        return true;
    }

    /**
     * 记录事件
     * @param {Object} event - 事件对象
     * @param {Object} choice - 选择的选项
     * @returns {void}
     */
    recordEvent(event, choice) {
        this._eventsCount++;
        
        const eventRecord = {
            eventId: event.id,
            eventTitle: event.title,
            choice: choice.text,
            age: this.age,
            year: this.year,
            effects: choice.effects || {},
            tags: event.tags || {}
        };
        
        this.eventHistory.push(eventRecord);
        
        if (this.stats.eventsTriggered[event.id] !== undefined) {
            this.stats.eventsTriggered[event.id]++;
        } else {
            this.stats.eventsTriggered[event.id] = 1;
        }
        
        if (choice.text) {
            if (this.stats.choicesMade[choice.text] !== undefined) {
                this.stats.choicesMade[choice.text]++;
            } else {
                this.stats.choicesMade[choice.text] = 1;
            }
        }
    }

    /**
     * 记录正向/负向事件统计
     * @param {'lucky'|'unlucky'} type - lucky 或 unlucky
     * @returns {void}
     */
    recordLuckEvent(type) {
        if (type === 'lucky') {
            this.stats.luckyEvents++;
        } else if (type === 'unlucky') {
            this.stats.unluckyEvents++;
        }
    }

    /**
     * 死亡
     * @param {string} [reason='未知原因'] - 死亡原因
     * @returns {void}
     */
    die(reason = '未知原因') {
        this.isAlive = false;
        this.deathReason = reason;
    }

    /**
     * 获取玩家状态摘要
     * @returns {Object} 状态对象
     */
    getStatus() {
        return {
            name: this.name,
            gender: this.gender,
            age: this.age,
            year: this.year,
            stage: this.lifeStage.name,
            attributes: { ...this.attributes },
            maxAttributes: { ...this.maxAttributes },
            health: this.health,
            maxHealth: this.maxHealth,
            money: this.money,
            totalMoney: this.totalMoney,
            eventsCount: this.eventsCount,
            isAlive: this.isAlive,
            flags: { ...this.flags },
            education: { ...this.education },
            career: { ...this.career },
            family: { ...this.family }
        };
    }

    /**
     * 序列化玩家数据（用于存档）
     * @returns {Object} 序列化后的对象
     */
    serialize() {
        return {
            name: this.name,
            gender: this.gender,
            age: this.age,
            year: this.year,
            money: this.money,
            totalMoney: this.totalMoney,
            attributes: { ...this.attributes },
            maxAttributes: { ...this.maxAttributes },
            minAttributes: { ...this.minAttributes },
            lifeStage: this.lifeStage,
            eventsCount: this.eventsCount,
            eventHistory: this.eventHistory,
            isAlive: this.isAlive,
            deathReason: this.deathReason,
            zodiacBonus: this.zodiacBonus,
            health: this.health,
            maxHealth: this.maxHealth,
            flags: { ...this.flags },
            relationships: { ...this.relationships },
            achievements: [...this.achievements],
            education: { ...this.education },
            career: { ...this.career },
            family: { ...this.family },
            stats: { ...this.stats }
        };
    }

    /**
     * 从存档数据恢复玩家
     * @static
     * @param {Object} data - 存档数据
     * @returns {Player} 玩家对象
     */
    static deserialize(data) {
        const player = new Player({
            name: data.name,
            gender: data.gender,
            intelligence: data.attributes.intelligence,
            constitution: data.attributes.constitution,
            charisma: data.attributes.charisma,
            luck: data.attributes.luck,
            morality: data.attributes.morality,
            zodiacBonus: data.zodiacBonus
        });
        
        player._age = data.age;
        player._year = data.year;
        player._money = data.money;
        player._totalMoney = data.totalMoney;
        player.maxAttributes = { ...data.maxAttributes };
        player.minAttributes = data.minAttributes ? { ...data.minAttributes } : { ...player.initialAttributes };
        player.lifeStage = data.lifeStage;
        player._eventsCount = data.eventsCount;
        player.eventHistory = data.eventHistory || [];
        player.isAlive = data.isAlive;
        player.deathReason = data.deathReason;
        
        if (data.health !== undefined) player.health = data.health;
        if (data.maxHealth !== undefined) player.maxHealth = data.maxHealth;
        if (data.flags) player.flags = { ...data.flags };
        if (data.relationships) player.relationships = { ...data.relationships };
        if (data.achievements) player.achievements = [...data.achievements];
        if (data.education) player.education = { ...data.education };
        if (data.career) player.career = { ...data.career };
        if (data.family) player.family = { ...data.family };
        if (data.stats) player.stats = { ...data.stats };
        
        return player;
    }
}
