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
        this.money = CONFIG.GAME.initialMoney;
        this.totalMoney = 0;  // 累计赚取金额
        
        // 属性值
        this.attributes = {
            intelligence: config.intelligence || CONFIG.ATTRIBUTES.defaultValue,
            constitution: config.constitution || CONFIG.ATTRIBUTES.defaultValue,
            charisma: config.charisma || CONFIG.ATTRIBUTES.defaultValue,
            luck: config.luck || CONFIG.ATTRIBUTES.defaultValue
        };
        
        // 初始属性记录（用于成就判定）
        this.initialAttributes = { ...this.attributes };
        
        // 历史最高属性
        this.maxAttributes = { ...this.attributes };
        
        // 历史最低属性（用于成就判定）
        this.minAttributes = { ...this.attributes };
        
        // 人生阶段
        this.lifeStage = CONFIG.LIFE_STAGES[0];
        
        // 事件统计
        this.eventsCount = 0;
        this.eventHistory = [];
        
        // 游戏状态
        this.isAlive = true;
        this.isPaused = false;
        
        // 星座加成
        this.zodiacBonus = config.zodiacBonus || {};
        
        // 天赋
        this.talents = config.talents || [];
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
        
        // 检查是否超过最大年龄
        if (this.age >= CONFIG.GAME.maxAge) {
            this.age = CONFIG.GAME.maxAge;
            this.die('自然老死');
            return true;
        }
        
        // 更新人生阶段
        this.updateLifeStage();
        
        return true;
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
        this.eventHistory.push({
            eventId: event.id,
            eventTitle: event.title,
            choice: choice.text,
            age: this.age,
            effects: choice.effects
        });
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
            stage: this.lifeStage.name,
            attributes: { ...this.attributes },
            maxAttributes: { ...this.maxAttributes },
            money: this.money,
            totalMoney: this.totalMoney,
            eventsCount: this.eventsCount,
            isAlive: this.isAlive
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
            money: this.money,
            totalMoney: this.totalMoney,
            attributes: { ...this.attributes },
            maxAttributes: { ...this.maxAttributes },
            lifeStage: this.lifeStage,
            eventsCount: this.eventsCount,
            eventHistory: this.eventHistory,
            isAlive: this.isAlive,
            zodiacBonus: this.zodiacBonus
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
            zodiacBonus: data.zodiacBonus
        });
        
        player.age = data.age;
        player.money = data.money;
        player.totalMoney = data.totalMoney;
        player.maxAttributes = { ...data.maxAttributes };
        player.lifeStage = data.lifeStage;
        player.eventsCount = data.eventsCount;
        player.eventHistory = data.eventHistory || [];
        player.isAlive = data.isAlive;
        
        return player;
    }
}
