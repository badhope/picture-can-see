/**
 * 玩家类
 * 管理角色的所有属性、状态和行为
 */

class Player {
    /**
     * 创建玩家对象
     * @param {Object} config - 初始配置
     */
    constructor(config = {}) {
        this.name = config.name || '玩家';
        this.gender = config.gender || 'male';
        this.age = 0;
        this.year = 2006;
        this.money = CONFIG.GAME.initialMoney;
        this.totalMoney = 0;
        
        this.attributes = {
            intelligence: config.intelligence || CONFIG.ATTRIBUTES.defaultValue,
            constitution: config.constitution || CONFIG.ATTRIBUTES.defaultValue,
            charisma: config.charisma || CONFIG.ATTRIBUTES.defaultValue,
            luck: config.luck || CONFIG.ATTRIBUTES.defaultValue,
            morality: config.morality || CONFIG.ATTRIBUTES.defaultValue
        };
        
        this.initialAttributes = { ...this.attributes };
        this.maxAttributes = { ...this.attributes };
        this.minAttributes = { ...this.attributes };
        
        this.lifeStage = CONFIG.LIFE_STAGES[0];
        
        this.eventsCount = 0;
        this.eventHistory = [];
        
        this.isAlive = true;
        this.isPaused = false;
        
        this.zodiacBonus = config.zodiacBonus || {};
        this.talents = config.talents || [];
        
        this.health = 50;
        this.maxHealth = 50;
        
        this.flags = {};
        this.relationships = {};
        this.achievements = [];
        
        this.education = { level: 0, major: null, school: null };
        this.career = { job: null, position: null, company: null, years: 0 };
        this.family = { married: false, spouse: null, children: 0, parents: true };
        
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
     * 应用星座属性加成
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
     * @param {number} years - 增加的年数
     * @returns {boolean} 是否成功
     */
    addAge(years = 1) {
        if (!this.isAlive) return false;
        
        this.age += years;
        this.year += years;
        
        if (this.age >= CONFIG.GAME.maxAge) {
            this.age = CONFIG.GAME.maxAge;
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
     */
    updateMaxHealth() {
        this.maxHealth = Utils.calculateMaxHealth(this.attributes.constitution, this.age);
    }

    /**
     * 应用每年生命值自然衰减
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
     * @param {string} reason - 变化原因
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
     * 设置flag
     * @param {string} flag - flag名称
     * @param {*} value - flag值
     */
    setFlag(flag, value = true) {
        this.flags[flag] = value;
    }

    /**
     * 检查flag
     * @param {string} flag - flag名称
     * @returns {boolean} flag是否存在
     */
    hasFlag(flag) {
        return !!this.flags[flag];
    }

    /**
     * 更新关系
     * @param {string} characterId - 角色ID
     * @param {number} change - 变化值
     * @param {string} reason - 原因
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
     * @param {Object} effects - 效果对象
     * @returns {Object} 实际应用的效果
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
            this.money += moneyChange;
            if (moneyChange > 0) {
                this.totalMoney += moneyChange;
            }
            applied.money = moneyChange;
        }
        
        // 处理消费
        if (effects.cost !== undefined) {
            this.money -= Math.abs(effects.cost);
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
        
        this.money += amount;
        this.totalMoney += amount;
        return true;
    }

    /**
     * 减少金钱
     * @param {number} amount - 金额
     * @returns {boolean} 是否成功
     */
    spendMoney(amount) {
        if (amount <= 0) return false;
        if (this.money < amount) return false;
        
        this.money -= amount;
        return true;
    }

    /**
     * 记录事件
     * @param {Object} event - 事件对象
     * @param {Object} choice - 选择的选项
     */
    recordEvent(event, choice) {
        this.eventsCount++;
        
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
     * @param {string} type - lucky 或 unlucky
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
     * @param {string} reason - 死亡原因
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
        
        player.age = data.age;
        player.year = data.year;
        player.money = data.money;
        player.totalMoney = data.totalMoney;
        player.maxAttributes = { ...data.maxAttributes };
        player.minAttributes = data.minAttributes ? { ...data.minAttributes } : { ...player.initialAttributes };
        player.lifeStage = data.lifeStage;
        player.eventsCount = data.eventsCount;
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
