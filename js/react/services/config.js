/**
 * 游戏配置 - 现代化版本
 * 使用ES6模块化模式
 */

const CONFIG = {
    VERSION: '2.0.0',
    DEBUG: false,

    ATTRIBUTES: {
        names: {
            intelligence: '智力',
            constitution: '体质',
            charisma: '魅力',
            luck: '运气',
            morality: '道德'
        },
        icons: {
            intelligence: '💡',
            constitution: '💪',
            charisma: '😊',
            luck: '🍀',
            morality: '⚖️'
        },
        descriptions: {
            intelligence: '影响学习能力、职业发展和决策质量',
            constitution: '决定生命值上限、疾病抵抗力和体力',
            charisma: '影响社交成功率、人际关系和NPC态度',
            luck: '调控随机事件触发和意外结果',
            morality: '影响剧情选项、NPC信任度和结局评价'
        },
        defaultValue: 5,
        minValue: 1,
        maxValue: 10,
        initialPoints: 10,
        minInitialValue: 3
    },

    LIFE_STAGES: [
        { id: 'baby', name: '婴儿期', minAge: 0, maxAge: 3, icon: '👶' },
        { id: 'child', name: '童年期', minAge: 4, maxAge: 12, icon: '🧒' },
        { id: 'teen', name: '少年期', minAge: 13, maxAge: 18, icon: '👦' },
        { id: 'young', name: '青年期', minAge: 19, maxAge: 35, icon: '👨' },
        { id: 'middle', name: '中年期', minAge: 36, maxAge: 55, icon: '👨‍🦰' },
        { id: 'elder', name: '老年期', minAge: 56, maxAge: 100, icon: '👴' }
    ],

    GAME: {
        maxAge: 100,
        initialMoney: 1000,
        eventMinInterval: 1,
        eventMaxInterval: 3,
        eventBaseProbability: 0.7,
        autoPlayInterval: 2000,
        fastPlayInterval: 500
    },

    GENDERS: {
        male: { name: '男', icon: '♂', avatarEmoji: '👦' },
        female: { name: '女', icon: '♀', avatarEmoji: '👧' },
        other: { name: '其他', icon: '⚥', avatarEmoji: '🧑' }
    },

    ZODIAC: {
        aries: { name: '白羊座', date: '3.21-4.19', bonus: { constitution: 1 }, emoji: '🐏' },
        leo: { name: '狮子座', date: '7.23-8.22', bonus: { charisma: 1 }, emoji: '🦁' },
        sagittarius: { name: '射手座', date: '11.22-12.21', bonus: { luck: 1 }, emoji: '🏹' },
        taurus: { name: '金牛座', date: '4.20-5.20', bonus: { constitution: 1 }, emoji: '🐂' },
        virgo: { name: '处女座', date: '8.23-9.22', bonus: { intelligence: 1 }, emoji: '👸' },
        capricorn: { name: '摩羯座', date: '12.22-1.19', bonus: { intelligence: 1 }, emoji: '🐐' },
        gemini: { name: '双子座', date: '5.21-6.21', bonus: { charisma: 1 }, emoji: '👯' },
        libra: { name: '天秤座', date: '9.23-10.23', bonus: { charisma: 1 }, emoji: '⚖️' },
        aquarius: { name: '水瓶座', date: '1.20-2.18', bonus: { intelligence: 1 }, emoji: '🏺' },
        cancer: { name: '巨蟹座', date: '6.22-7.22', bonus: { morality: 1 }, emoji: '🦀' },
        scorpio: { name: '天蝎座', date: '10.24-11.21', bonus: { luck: 1 }, emoji: '🦂' },
        pisces: { name: '双鱼座', date: '2.19-3.20', bonus: { morality: 1 }, emoji: '🐟' }
    },

    EVENT_PRIORITY: {
        CRITICAL: 100,
        HIGH: 75,
        NORMAL: 50,
        LOW: 25
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
