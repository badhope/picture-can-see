/**
 * 人生结局数据
 * 包含各种结局类型、达成条件和评价
 */

const ENDINGS = {
    /**
     * 结局类型定义
     */
    types: [
        { id: 'legendary', name: '传奇人生', emoji: '👑', color: '#FFD700' },
        { id: 'successful', name: '人生赢家', emoji: '🏆', color: '#22c55e' },
        { id: 'comfortable', name: '平淡是真', emoji: '🌟', color: '#3b82f6' },
        { id: 'tragic', name: '命运多舛', emoji: '💔', color: '#ef4444' },
        { id: 'unlucky', name: '运气不佳', emoji: '😢', color: '#f59e0b' },
        { id: 'average', name: '普通人', emoji: '👤', color: '#64748b' },
        { id: 'rich', name: '富甲一方', emoji: '💎', color: '#8b5cf6' },
        { id: 'wise', name: '智慧老人', emoji: '🎓', color: '#06b6d4' },
        { id: 'healthy', name: '健康长寿', emoji: '🏃', color: '#10b981' },
        { id: 'love', name: '情圣', emoji: '💕', color: '#ec4899' },
        { id: 'career', name: '事业有成', emoji: '💼', color: '#f97316' },
        { id: 'centenarian', name: '百岁老人', emoji: '🎂', color: '#FFD700' },
        { id: 'philanthropist', name: '慈善家', emoji: '❤️', color: '#ec4899' },
        { id: 'artist', name: '艺术大师', emoji: '🎨', color: '#8b5cf6' },
        { id: 'explorer', name: '探险家', emoji: '🗺️', color: '#10b981' },
        { id: 'hermit', name: '隐士', emoji: '🏔️', color: '#64748b' },
        { id: 'rebel', name: '叛逆者', emoji: '🔥', color: '#ef4444' },
        { id: 'prodigy', name: '天才少年', emoji: '🌟', color: '#f59e0b' }
    ],

    /**
     * 结局评价模板
     */
    evaluations: {
        legendary: [
            '你的人生堪称传奇！从默默无闻到名满天下，你的故事将被后人传颂。',
            '你是时代的骄子，命运的宠儿。你的成就前无古人，后无来者。',
            '你的名字将被载入史册，成为后人学习的榜样。这就是传奇的人生！'
        ],
        successful: [
            '你是一个成功人士！事业有成，家庭幸福，你是很多人羡慕的对象。',
            '你完美地平衡了事业和生活，是人生赢家的典范。',
            '你的努力得到了回报，你的选择让你走上了人生巅峰。'
        ],
        comfortable: [
            '你选择了平淡而真实的人生。没有大起大落，却有满满的幸福。',
            '平凡也是一种美。你在平淡中找到了生活的真谛。',
            '知足常乐，你用平和的心态过出了精彩的人生。'
        ],
        tragic: [
            '命运对你不公，但你依然坚强地走完了这一生。',
            '你的人生充满坎坷，但你的坚韧令人敬佩。',
            '虽然经历了很多苦难，但你从未放弃。这种精神值得尊敬。'
        ],
        unlucky: [
            '运气似乎总是与你作对，但你依然坚强地生活着。',
            '人生不如意十之八九，你都遇到了。但你坚持到了最后。',
            '虽然命运多舛，但你依然保持着对生活的热爱。'
        ],
        average: [
            '你是一个普通人，过着平凡的大多数人的生活。这就是生活。',
            '没有特别的成功，也没有特别的失败。你的人生平淡而真实。',
            '普通人也有普通人的幸福。知足常乐，平淡是真。'
        ],
        rich: [
            '你积累了巨额财富，富甲一方！金钱对你来说只是一个数字。',
            '你是商业奇才，财富自由的人生令人羡慕。',
            '虽然金钱不是万能的，但你拥有了足够的资本去追求想要的生活。'
        ],
        wise: [
            '你学识渊博，是众人尊敬的智者。你的智慧照亮了很多人的人生。',
            '活到老学到老，你用一生诠释了什么是真正的智慧。',
            '你的知识和见解深刻影响了这个时代，你是无价的宝藏。'
        ],
        healthy: [
            '你拥有一个健康的身体，这是人生最大的财富！',
            '生命在于运动，你用健康的生活方式活到了高龄。',
            '身体健康是你一生最大的成就，也是家人的福气。'
        ],
        love: [
            '你收获了真挚的爱情和友情，人生因爱而精彩！',
            '你是情感大师，懂得如何去爱和被爱。',
            '你的人生充满了爱与被爱，这是最珍贵的财富。'
        ],
        career: [
            '你在事业上取得了巨大成功，是行业的标杆！',
            '你的职业成就令人瞩目，是很多人学习的榜样。',
            '事业是你人生的重要组成部分，而你做得非常出色。'
        ],
        centenarian: [
            '你活到了100岁以上，是真正的长寿之人！你的生命故事令人敬佩。',
            '跨越世纪的见证者，你的人生经历比任何书籍都精彩。',
            '百岁人生，你见证了时代的变迁，活出了生命的厚度。'
        ],
        philanthropist: [
            '你用财富帮助了无数人，是真正的慈善家！你的善举将被铭记。',
            '金钱对你来说只是工具，你用它创造了更多的幸福。',
            '你的人生价值不在于拥有多少，而在于给予了多少。'
        ],
        artist: [
            '你用艺术诠释了人生，你的作品将永远流传。',
            '艺术是你生命的全部，你用创造力点亮了这个世界。',
            '你是真正的艺术家，用灵魂创作出了永恒的作品。'
        ],
        explorer: [
            '你的人生是一场精彩的冒险，你探索了未知的世界！',
            '你从不满足于安逸，勇敢地踏上了每一次冒险之旅。',
            '探险家的精神在你身上得到了完美的诠释。'
        ],
        hermit: [
            '你选择了远离喧嚣的生活，在宁静中找到了内心的平和。',
            '隐士的生活让你远离了世俗的纷扰，获得了精神的自由。',
            '你用独处换来了内心的宁静，这是另一种人生智慧。'
        ],
        rebel: [
            '你从不随波逐流，用叛逆书写了与众不同的人生。',
            '你挑战了所有的规则和束缚，活出了真正的自我。',
            '叛逆不是错误，而是你追求自由的方式。'
        ],
        prodigy: [
            '你年少成名，是真正的天才！你的才华令人叹为观止。',
            '天赋异禀的你，用实力证明了什么叫做天才。',
            '你的才华在年轻时就已经绽放，是真正的少年天才。'
        ]
    },

    /**
     * 计算结局类型
     * @param {Object} player - 玩家对象
     * @returns {Object} 结局对象
     */
    calculateEnding: function(player) {
        const stats = this.calculateStats(player);
        
        // 计算综合得分
        let score = 0;
        score += player.maxAttributes.intelligence * 10;
        score += player.maxAttributes.constitution * 8;
        score += player.maxAttributes.charisma * 8;
        score += player.maxAttributes.luck * 12;
        score += player.totalMoney / 10000;
        score += player.eventsCount * 2;
        
        // 年龄加成
        if (player.age >= 80) score += 20;
        if (player.age >= 90) score += 30;
        if (player.age >= 100) score += 50;
        
        // 运气修正
        if (player.maxAttributes.luck >= 8) score *= 1.2;
        if (player.maxAttributes.luck <= 3) score *= 0.8;
        
        // 特殊结局检测（优先级高于普通结局）
        // 百岁老人结局：活到100岁以上
        if (player.age >= 100) {
            return this.createEnding('centenarian', stats, player);
        }
        // 慈善家结局：金钱超过500万且魅力高
        if (player.totalMoney >= 5000000 && player.maxAttributes.charisma >= 7) {
            return this.createEnding('philanthropist', stats, player);
        }
        // 艺术大师结局：魅力和运气都高
        if (player.maxAttributes.charisma >= 8 && player.maxAttributes.luck >= 7) {
            return this.createEnding('artist', stats, player);
        }
        // 探险家结局：运气和体质都高
        if (player.maxAttributes.luck >= 8 && player.maxAttributes.constitution >= 7) {
            return this.createEnding('explorer', stats, player);
        }
        // 天才少年结局：年轻但智力极高
        if (player.age < 30 && player.maxAttributes.intelligence >= 9) {
            return this.createEnding('prodigy', stats, player);
        }
        // 隐士结局：活到老年但财富很少
        if (player.age >= 70 && player.totalMoney < 50000) {
            return this.createEnding('hermit', stats, player);
        }
        // 叛逆者结局：运气低但活到了中年
        if (player.maxAttributes.luck <= 3 && player.age >= 40) {
            return this.createEnding('rebel', stats, player);
        }
        // 财富结局：金钱达到100万且占总评分主导
        if (player.totalMoney >= 1000000 && player.totalMoney / 10000 > player.maxAttributes.intelligence + player.maxAttributes.charisma) {
            return this.createEnding('rich', stats, player);
        }
        // 智慧结局：智力达到9以上
        if (player.maxAttributes.intelligence >= 9) {
            return this.createEnding('wise', stats, player);
        }
        // 健康结局：体质达到9以上且活到60岁以上
        if (player.maxAttributes.constitution >= 9 && player.age >= 60) {
            return this.createEnding('healthy', stats, player);
        }
        // 情圣结局：魅力达到9以上
        if (player.maxAttributes.charisma >= 9) {
            return this.createEnding('love', stats, player);
        }
        // 事业结局：年龄35以上且赚钱超过50万
        if (player.age >= 35 && player.totalMoney >= 500000) {
            return this.createEnding('career', stats, player);
        }
        
        // 根据分数确定结局
        if (score >= 200) {
            return this.createEnding('legendary', stats, player);
        } else if (score >= 140) {
            return this.createEnding('successful', stats, player);
        } else if (score >= 80) {
            return this.createEnding('comfortable', stats, player);
        } else if (score >= 50) {
            return this.createEnding('average', stats, player);
        } else if (score >= 30) {
            return this.createEnding('unlucky', stats, player);
        } else {
            return this.createEnding('tragic', stats, player);
        }
    },

    /**
     * 创建结局对象
     * @param {string} typeId - 结局类型ID
     * @param {Object} stats - 统计数据
     * @param {Object} player - 玩家对象
     * @returns {Object} 结局对象
     */
    createEnding: function(typeId, stats, player) {
        const type = this.types.find(t => t.id === typeId);
        const evaluations = this.evaluations[typeId];
        const evaluation = evaluations[Utils.randomInt(0, evaluations.length - 1)];
        
        // 计算排名
        const rank = this.calculateRank(stats);
        
        return {
            type: type,
            evaluation: evaluation,
            stats: stats,
            rank: rank,
            achievements: this.getAchievements(player)
        };
    },

    /**
     * 计算玩家统计数据
     * @param {Object} player - 玩家对象
     * @returns {Object} 统计数据
     */
    calculateStats: function(player) {
        return {
            age: player.age,
            gender: CONFIG.GENDERS[player.gender].name,
            maxIntelligence: player.maxAttributes.intelligence,
            maxConstitution: player.maxAttributes.constitution,
            maxCharisma: player.maxAttributes.charisma,
            maxLuck: player.maxAttributes.luck,
            totalMoney: player.totalMoney,
            eventsCount: player.eventsCount,
            lifeStage: player.lifeStage.name
        };
    },

    /**
     * 计算人生排名
     * @param {Object} stats - 统计数据
     * @returns {string} 排名描述
     */
    calculateRank: function(stats) {
        let score = 0;
        score += stats.maxIntelligence * 10;
        score += stats.maxConstitution * 8;
        score += stats.maxCharisma * 8;
        score += stats.maxLuck * 12;
        score += stats.totalMoney / 10000;
        score += stats.eventsCount;
        
        if (score >= 200) return 'SSS - 传奇王者';
        if (score >= 160) return 'SS - 超级强者';
        if (score >= 130) return 'S - 人生赢家';
        if (score >= 100) return 'A - 成功人士';
        if (score >= 70) return 'B - 中产阶层';
        if (score >= 50) return 'C - 普通大众';
        if (score >= 30) return 'D - 生活艰辛';
        return 'E - 命运多舛';
    },

    /**
     * 获取成就列表
     * @param {Object} player - 玩家对象
     * @returns {Array} 成就数组
     */
    getAchievements: function(player) {
        const achievements = [];
        
        // 年龄成就
        if (player.age >= 100) achievements.push({ name: '百岁老人', emoji: '🎂', desc: '活到了100岁以上' });
        else if (player.age >= 90) achievements.push({ name: '长寿者', emoji: '🧓', desc: '活到了90岁以上' });
        else if (player.age >= 80) achievements.push({ name: '长寿', emoji: '👴', desc: '活到了80岁以上' });
        
        // 财富成就
        if (player.totalMoney >= 1000000) achievements.push({ name: '千万富翁', emoji: '💎', desc: '累计赚取1000万' });
        else if (player.totalMoney >= 100000) achievements.push({ name: '百万富翁', emoji: '🏦', desc: '累计赚取100万' });
        else if (player.totalMoney >= 50000) achievements.push({ name: '小有积蓄', emoji: '💰', desc: '累计赚取5万' });
        
        // 属性成就
        if (player.maxAttributes.intelligence >= 10) achievements.push({ name: '天资聪慧', emoji: '🧠', desc: '智力达到10点' });
        if (player.maxAttributes.constitution >= 10) achievements.push({ name: '身强体壮', emoji: '💪', desc: '体质达到10点' });
        if (player.maxAttributes.charisma >= 10) achievements.push({ name: '魅力四射', emoji: '✨', desc: '魅力达到10点' });
        if (player.maxAttributes.luck >= 10) achievements.push({ name: '超级幸运', emoji: '🍀', desc: '运气达到10点' });
        
        // 事件成就
        if (player.eventsCount >= 50) achievements.push({ name: '经历丰富', emoji: '📚', desc: '经历50个以上事件' });
        
        // 人生阶段成就
        if (player.lifeStage.id === 'elder') achievements.push({ name: '安享晚年', emoji: '🏡', desc: '活到了老年期' });
        
        return achievements;
    },

    /**
     * 获取所有结局类型
     * @returns {Array} 结局类型数组
     */
    getAllTypes: function() {
        return this.types;
    }
};

/**
 * 成就系统
 */
const ACHIEVEMENTS = {
    /**
     * 成就列表定义
     */
    list: [
        // 财富成就
        { id: 'rich_1', name: '万元户', emoji: '💵', desc: '累计赚取1万元', condition: (p) => p.totalMoney >= 10000 },
        { id: 'rich_2', name: '十万富翁', emoji: '💴', desc: '累计赚取10万元', condition: (p) => p.totalMoney >= 100000 },
        { id: 'rich_3', name: '百万富翁', emoji: '🏦', desc: '累计赚取100万元', condition: (p) => p.totalMoney >= 1000000 },
        { id: 'rich_4', name: '千万富翁', emoji: '💎', desc: '累计赚取1000万元', condition: (p) => p.totalMoney >= 10000000 },
        { id: 'rich_5', name: '亿万富翁', emoji: '👑', desc: '累计赚取1亿元', condition: (p) => p.totalMoney >= 100000000 },
        { id: 'rich_6', name: '白手起家', emoji: '📈', desc: '从零开始赚取100万', condition: (p) => p.totalMoney >= 1000000 && p.attributes.luck <= 5 },
        
        // 年龄成就
        { id: 'age_1', name: '而立之年', emoji: '👨', desc: '活到30岁', condition: (p) => p.age >= 30 },
        { id: 'age_2', name: '不惑之年', emoji: '👨‍🦱', desc: '活到40岁', condition: (p) => p.age >= 40 },
        { id: 'age_3', name: '知命之年', emoji: '👨‍🦰', desc: '活到50岁', condition: (p) => p.age >= 50 },
        { id: 'age_4', name: '花甲之年', emoji: '👴', desc: '活到60岁', condition: (p) => p.age >= 60 },
        { id: 'age_5', name: '古稀之年', emoji: '🧓', desc: '活到70岁', condition: (p) => p.age >= 70 },
        { id: 'age_6', name: '杖朝之年', emoji: '🏳️', desc: '活到80岁', condition: (p) => p.age >= 80 },
        { id: 'age_7', name: '期颐之年', emoji: '🎂', desc: '活到100岁', condition: (p) => p.age >= 100 },
        { id: 'age_8', name: '长寿秘诀', emoji: '🌟', desc: '活到110岁', condition: (p) => p.age >= 110 },
        
        // 属性成就
        { id: 'attr_1', name: '智力超群', emoji: '🧠', desc: '智力达到8点', condition: (p) => p.maxAttributes.intelligence >= 8 },
        { id: 'attr_2', name: '智力巅峰', emoji: '🎓', desc: '智力达到10点', condition: (p) => p.maxAttributes.intelligence >= 10 },
        { id: 'attr_3', name: '身强体壮', emoji: '💪', desc: '体质达到8点', condition: (p) => p.maxAttributes.constitution >= 8 },
        { id: 'attr_4', name: '铜墙铁壁', emoji: '🛡️', desc: '体质达到10点', condition: (p) => p.maxAttributes.constitution >= 10 },
        { id: 'attr_5', name: '万人迷', emoji: '😍', desc: '魅力达到8点', condition: (p) => p.maxAttributes.charisma >= 8 },
        { id: 'attr_6', name: '倾国倾城', emoji: '👑', desc: '魅力达到10点', condition: (p) => p.maxAttributes.charisma >= 10 },
        { id: 'attr_7', name: '福星高照', emoji: '🍀', desc: '运气达到8点', condition: (p) => p.maxAttributes.luck >= 8 },
        { id: 'attr_8', name: '天命之人', emoji: '⭐', desc: '运气达到10点', condition: (p) => p.maxAttributes.luck >= 10 },
        { id: 'attr_9', name: '全能天才', emoji: '🏆', desc: '四项属性都达到7点', condition: (p) => 
            p.maxAttributes.intelligence >= 7 && p.maxAttributes.constitution >= 7 && 
            p.maxAttributes.charisma >= 7 && p.maxAttributes.luck >= 7 },
        { id: 'attr_10', name: '完美人生', emoji: '✨', desc: '四项属性都达到8点', condition: (p) => 
            p.maxAttributes.intelligence >= 8 && p.maxAttributes.constitution >= 8 && 
            p.maxAttributes.charisma >= 8 && p.maxAttributes.luck >= 8 },
        
        // 事件成就
        { id: 'event_1', name: '人生百态', emoji: '📖', desc: '经历10个事件', condition: (p) => p.eventsCount >= 10 },
        { id: 'event_2', name: '经历丰富', emoji: '📚', desc: '经历30个事件', condition: (p) => p.eventsCount >= 30 },
        { id: 'event_3', name: '人生百科', emoji: '🌍', desc: '经历50个事件', condition: (p) => p.eventsCount >= 50 },
        { id: 'event_4', name: '传奇人生', emoji: '📜', desc: '经历80个事件', condition: (p) => p.eventsCount >= 80 },
        
        // 特殊成就
        { id: 'special_1', name: '人生赢家', emoji: '🎯', desc: '活到80岁且累计财富100万', condition: (p) => p.age >= 80 && p.totalMoney >= 1000000 },
        { id: 'special_2', name: '平凡人生', emoji: '🏠', desc: '活到70岁但财富不超过10万', condition: (p) => p.age >= 70 && p.totalMoney < 100000 },
        { id: 'special_3', name: '英年早逝', emoji: '😢', desc: '30岁前结束人生', condition: (p) => p.age < 30 },
        { id: 'special_4', name: '大器晚成', emoji: '🌅', desc: '50岁后累计财富超过100万', condition: (p) => p.age >= 50 && p.totalMoney >= 1000000 },
        { id: 'special_5', name: '天赋异禀', emoji: '🌟', desc: '初始属性总和超过30点', condition: (p) => p.initialAttributes && 
            (p.initialAttributes.intelligence + p.initialAttributes.constitution + 
             p.initialAttributes.charisma + p.initialAttributes.luck) > 30 },
        { id: 'special_6', name: '逆袭人生', emoji: '🔥', desc: '初始运气低于3但活到60岁', condition: (p) => p.initialAttributes && p.initialAttributes.luck <= 3 && p.age >= 60 },
        { id: 'special_7', name: '健康达人', emoji: '🏃', desc: '体质从未低于5点', condition: (p) => p.minAttributes && p.minAttributes.constitution >= 5 },
        { id: 'special_8', name: '学霸之路', emoji: '📖', desc: '智力从未低于5点', condition: (p) => p.minAttributes && p.minAttributes.intelligence >= 5 },
        { id: 'special_9', name: '社交达人', emoji: '🤝', desc: '魅力从未低于5点', condition: (p) => p.minAttributes && p.minAttributes.charisma >= 5 },
        { id: 'special_10', name: '幸运儿', emoji: '🌈', desc: '运气从未低于5点', condition: (p) => p.minAttributes && p.minAttributes.luck >= 5 }
    ],

    /**
     * 玩家已解锁的成就
     * @param {Object} player - 玩家对象
     * @returns {Array} 已解锁成就数组
     */
    getUnlocked: function(player) {
        return this.list.filter(achievement => achievement.condition(player));
    },

    /**
     * 获取新解锁的成就
     * @param {Object} player - 玩家对象
     * @param {Object} prevPlayer - 上一次状态的玩家对象
     * @returns {Array} 新成就数组
     */
    getNewAchievements: function(player, prevPlayer) {
        const prevUnlocked = this.getUnlocked(prevPlayer);
        const currUnlocked = this.getUnlocked(player);
        
        return currUnlocked.filter(achievement => 
            !prevUnlocked.some(u => u.id === achievement.id)
        );
    }
};
