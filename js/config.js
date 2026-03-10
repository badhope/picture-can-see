/**
 * 游戏配置文件
 * 包含游戏常量、系统参数和配置数据
 */

const CONFIG = {
    // 游戏版本
    VERSION: '1.2.0',
    
    // 属性配置
    ATTRIBUTES: {
        // 属性名称映射（用于显示）
        names: {
            intelligence: '智力',
            constitution: '体质',
            charisma: '魅力',
            luck: '运气'
        },
        // 属性图标映射
        icons: {
            intelligence: '💡',
            constitution: '💪',
            charisma: '😊',
            luck: '🍀'
        },
        // 属性初始值
        defaultValue: 5,
        // 属性最小值
        minValue: 1,
        // 属性最大值
        maxValue: 10,
        // 可分配的属性点
        initialPoints: 10,
        // 最低分配值
        minInitialValue: 3
    },
    
    // 人生阶段配置
    LIFE_STAGES: [
        { id: 'baby', name: '婴儿期', minAge: 0, maxAge: 3, icon: '👶' },
        { id: 'child', name: '童年期', minAge: 4, maxAge: 12, icon: '🧒' },
        { id: 'teen', name: '少年期', minAge: 13, maxAge: 18, icon: '👦' },
        { id: 'young', name: '青年期', minAge: 19, maxAge: 35, icon: '👨' },
        { id: 'middle', name: '中年期', minAge: 36, maxAge: 55, icon: '👨‍🦰' },
        { id: 'elder', name: '老年期', minAge: 56, maxAge: 100, icon: '👴' }
    ],
    
    // 游戏配置
    GAME: {
        // 最大年龄
        maxAge: 100,
        // 默认初始金钱
        initialMoney: 1000,
        // 每年触发事件的最小间隔（岁）
        eventMinInterval: 1,
        // 每年触发事件的最大间隔（岁）
        eventMaxInterval: 3,
        // 事件触发基础概率
        eventBaseProbability: 0.7,
        // 自动播放间隔（毫秒）
        autoPlayInterval: 2000,
        // 快速播放间隔（毫秒）
        fastPlayInterval: 500
    },
    
    // 性别配置
    GENDERS: {
        male: { name: '男', icon: '♂', avatarEmoji: '👦' },
        female: { name: '女', icon: '♀', avatarEmoji: '👧' },
        other: { name: '其他', icon: '⚥', avatarEmoji: '🧑' }
    },
    
    // 星座配置（影响初始属性加成）
    ZODIAC: {
        // 火象星座 - 体质加成
        fire: {
            name: '白羊座',
            date: '3.21-4.19',
            bonus: { constitution: 1 },
            emoji: '🐏'
        },
        leo: {
            name: '狮子座',
            date: '7.23-8.22',
            bonus: { charisma: 1 },
            emoji: '🦁'
        },
        sagittarius: {
            name: '射手座',
            date: '11.22-12.21',
            bonus: { luck: 1 },
            emoji: '🏹'
        },
        // 土象星座 - 智力加成
        taurus: {
            name: '金牛座',
            date: '4.20-5.20',
            bonus: { intelligence: 1 },
            emoji: '🐂'
        },
        virgo: {
            name: '处女座',
            date: '8.23-9.22',
            bonus: { intelligence: 1 },
            emoji: '👸'
        },
        capricorn: {
            name: '摩羯座',
            date: '12.22-1.19',
            bonus: { constitution: 1 },
            emoji: '🐐'
        },
        // 风象星座 - 魅力加成
        gemini: {
            name: '双子座',
            date: '5.21-6.21',
            bonus: { charisma: 1 },
            emoji: '👯'
        },
        libra: {
            name: '天秤座',
            date: '9.23-10.23',
            bonus: { charisma: 1 },
            emoji: '⚖️'
        },
        aquarius: {
            name: '水瓶座',
            date: '1.20-2.18',
            bonus: { luck: 1 },
            emoji: '🏺'
        },
        // 水象星座 - 运气加成
        cancer: {
            name: '巨蟹座',
            date: '6.22-7.22',
            bonus: { luck: 1 },
            emoji: '🦀'
        },
        scorpio: {
            name: '天蝎座',
            date: '10.24-11.21',
            bonus: { constitution: 1 },
            emoji: '🦂'
        },
        pisces: {
            name: '双鱼座',
            date: '2.19-3.20',
            bonus: { charisma: 1 },
            emoji: '🐟'
        }
    },
    
    // 存档配置
    SAVE: {
        key: 'lifeRestart_saveData',
        maxSlots: 3
    },
    
    // 动画配置
    ANIMATION: {
        fadeInDuration: 300,
        fadeOutDuration: 300,
        transitionDuration: 500
    }
};

/**
 * 工具函数集合
 */
const Utils = {
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
     * @param {Array} weights - 权重数组
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
     * @param {*} obj - 要拷贝的对象
     * @returns {*} 拷贝后的对象
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
    }
};
