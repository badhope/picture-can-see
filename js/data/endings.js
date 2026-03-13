/**
 * 结局判定系统
 * 根据玩家属性、选择和flag计算最终结局
 */

const ENDINGS = {
    /**
     * 结局类型定义
     */
    types: {
        legend: {
            id: 'legend',
            name: '传奇人生',
            icon: '🌟',
            description: '改变世界，青史留名',
            color: '#FFD700',
            requirements: {
                minScore: 300,
                flags: ['career_peak', 'has_child'],
                attributes: { intelligence: 9, charisma: 8, morality: 7 }
            }
        },
        academic_master: {
            id: 'academic_master',
            name: '学术大师',
            icon: '🎓',
            description: '学术界权威，桃李满天下',
            color: '#9B59B6',
            requirements: {
                minScore: 200,
                flags: ['grad_school', 'phd'],
                attributes: { intelligence: 8 }
            }
        },
        career_peak: {
            id: 'career_peak',
            name: '人生巅峰',
            icon: '🏆',
            description: '事业有成，社会名流',
            color: '#E74C3C',
            requirements: {
                minScore: 180,
                flags: ['career_peak', 'employed'],
                money: 1000000
            }
        },
        family_happiness: {
            id: 'family_happiness',
            name: '家庭幸福',
            icon: '❤️',
            description: '家庭和睦，人生圆满',
            color: '#E91E63',
            requirements: {
                minScore: 150,
                flags: ['married', 'has_child'],
                attributes: { charisma: 7, morality: 7 }
            }
        },
        wealthy: {
            id: 'wealthy',
            name: '富甲一方',
            icon: '💰',
            description: '财务自由，生活优渥',
            color: '#F39C12',
            requirements: {
                minScore: 150,
                money: 5000000
            }
        },
        ordinary: {
            id: 'ordinary',
            name: '平凡人生',
            icon: '🌱',
            description: '平安是福，知足常乐',
            color: '#27AE60',
            requirements: {
                minScore: 80,
                maxScore: 180,
                flags: []
            }
        },
        tragedy: {
            id: 'tragedy',
            name: '悲剧人生',
            icon: '💀',
            description: '英年早逝或孤独终老',
            color: '#2C3E50',
            requirements: {
                flags: ['tragedy_flag'],
                attributes: { morality: { max: 2 } },
                deathReason: ['意外', '疾病']
            }
        },
        criminal: {
            id: 'criminal',
            name: '锒铛入狱',
            icon: '⛓️',
            description: '违法犯纪，终身悔恨',
            color: '#000000',
            requirements: {
                flags: ['committed_crime'],
                attributes: { morality: { max: 3 } }
            }
        },
        immortal: {
            id: 'immortal',
            name: '修仙成功',
            icon: '🧘',
            description: '长生不老，游戏通关',
            color: '#00BCD4',
            requirements: {
                age: 100,
                attributes: { constitution: 10, morality: 10 },
                health: { min: 50 }
            }
        },
        early_death: {
            id: 'early_death',
            name: '英年早逝',
            icon: '🕯️',
            description: '生命短暂，但曾灿烂',
            color: '#795548',
            requirements: {
                age: { max: 40 },
                isAlive: false
            }
        }
    },

    /**
     * 结局文本模板
     */
    endings: {
        legend: [
            "你成为了改变世界的传奇人物。你的故事被人们传颂，你的发明改变了人类的生活方式。",
            "你成为了一个时代的符号。你的名字被载入史册，你的精神激励着无数后人。",
            "你用自己的智慧和努力，创造了一个商业帝国，成为了无数人眼中的传奇。"
        ],
        academic_master: [
            "你成为了学术界的大师，培养了无数优秀的学生。你的研究成果推动了人类文明的进步。",
            "你获得了诺贝尔奖（或者其他同级别奖项），成为了母校的骄傲，学术界的标杆。",
            "你著书立说，成为了一代宗师。你的思想影响了几代人的成长。"
        ],
        career_peak: [
            "你成为了行业内的领军人物，拥有令人羡慕的事业和社会地位。",
            "你创办的企业成为了行业巨头，你的决策影响着整个市场的走向。",
            "你在职场中一路晋升，最终成为了公司的核心人物，拥有了财富和名誉。"
        ],
        family_happiness: [
            "你拥有了一个和睦的家庭，妻子（丈夫）贤惠，子女孝顺。这是人生最大的幸福。",
            "你与家人共度了无数美好时光虽然没有大富大贵，但家庭温暖让你感到满足。",
            "你注重家庭，珍惜亲情。虽然平凡，但你的家庭是别人眼中羡慕的对象。"
        ],
        wealthy: [
            "你实现了财务自由，不再为金钱发愁。你可以用自己喜欢的方式生活。",
            "你积累了巨额财富，成为了别人眼中的成功人士。虽然失去了很多，但得到了物质的满足。",
            "你善于理财，资产不断增值。最终成为了人人羡慕的富翁。"
        ],
        ordinary: [
            "你过了平凡而真实的一生。没有大富大贵，也没有大起大落。平安是福，知足常乐。",
            "你的人生波澜不惊，但也不失精彩。重要的是，你始终保持着一颗平常心。",
            "你选择了平淡的生活方式，不追求大富大贵，只求平安顺遂。这也是一种幸福。"
        ],
        tragedy: [
            "你的人生充满了悲剧色彩。也许是命运的捉弄，也许是自己的选择，你最终走向了悲剧。",
            "你经历了无数挫折和磨难，最终还是没有能够改变自己的命运。",
            "你的人生充满了遗憾和后悔。如果能重新来过，你会做出不同的选择吗？"
        ],
        criminal: [
            "你因为自己的违法行为付出了代价。监狱的生活让你后悔莫及，但为时已晚。",
            "你的人生因为一次错误的选择而彻底改变。法律不会宽恕你的罪行。",
            "你最终为自己的行为付出了代价。这是你人生中最大的遗憾。"
        ],
        immortal: [
            "你活到了100岁，成为了别人眼中的老寿星。虽然没有大富大贵，但长寿本身就是一种福气。",
            "你成功地活到了游戏设定的最高年龄，恭喜你通关了人生模拟器！"
        ],
        early_death: [
            "你的人生虽然短暂，但也曾经灿烂过。你的故事让人惋惜，也让人铭记。",
            "你英年早逝，留下了无尽的遗憾。如果能活得久一点，也许会有不一样的人生。"
        ]
    }
};

/**
 * 结局判定器
 */
class EndingCalculator {
    constructor(player) {
        this.player = player;
        this.score = 0;
        this.ending = null;
        this.reasons = [];
    }

    /**
     * 计算最终评分
     */
    calculateScore() {
        const attrs = this.player.attributes;
        
        this.score += attrs.intelligence * 10;
        this.score += attrs.constitution * 10;
        this.score += attrs.charisma * 8;
        this.score += attrs.luck * 5;
        this.score += attrs.morality * 8;
        
        if (this.player.money > 10000) {
            this.score += Math.min(50, Math.log10(this.player.money / 10000) * 10);
        }
        
        if (this.player.flags['married']) this.score += 20;
        if (this.player.flags['has_child']) this.score += this.player.family?.children * 10 || 10;
        if (this.player.flags['graduated']) this.score += 15;
        if (this.player.flags['grad_school']) this.score += 20;
        if (this.player.flags['career_peak']) this.score += 30;
        if (this.player.flags['homeowner']) this.score += 10;
        if (this.player.flags['retired']) this.score += 10;
        
        if (this.player.stats?.luckyEvents) {
            this.score += this.player.stats.luckyEvents * 3;
        }
        
        if (this.player.stats?.unluckyEvents) {
            this.score -= this.player.stats.unluckyEvents * 3;
        }
        
        if (this.player.attributes.morality <= 2) {
            this.score -= 30;
            this.player.flags['tragedy_flag'] = true;
        }
        
        if (this.player.attributes.morality <= 3 && this.player.flags['committed_crime']) {
            this.score -= 50;
        }
        
        if (this.player.age < 40 && !this.player.isAlive) {
            this.score -= (40 - this.player.age) * 2;
        }
        
        return this.score;
    }

    /**
     * 判定结局
     */
    determineEnding() {
        this.calculateScore();
        
        if (this.player.age >= 100 && this.player.attributes.constitution >= 10 && this.player.attributes.morality >= 10) {
            return this.createEnding('immortal');
        }
        
        if (this.player.age < 40 && !this.player.isAlive) {
            return this.createEnding('early_death');
        }
        
        if (this.player.flags['committed_crime'] && this.player.attributes.morality <= 3) {
            return this.createEnding('criminal');
        }
        
        if (this.player.attributes.morality <= 2) {
            return this.createEnding('tragedy');
        }
        
        if (this.score >= 300 && this.player.attributes.intelligence >= 9 && this.player.attributes.charisma >= 8) {
            return this.createEnding('legend');
        }
        
        if (this.score >= 200 && (this.player.flags['grad_school'] || this.player.flags['phd']) && this.player.attributes.intelligence >= 8) {
            return this.createEnding('academic_master');
        }
        
        if (this.score >= 180 && this.player.flags['career_peak'] && this.player.money >= 1000000) {
            return this.createEnding('career_peak');
        }
        
        if (this.score >= 150 && this.player.flags['married'] && this.player.flags['has_child'] && 
            this.player.attributes.charisma >= 7 && this.player.attributes.morality >= 7) {
            return this.createEnding('family_happiness');
        }
        
        if (this.player.money >= 5000000) {
            return this.createEnding('wealthy');
        }
        
        if (this.score >= 80 && this.score <= 180) {
            return this.createEnding('ordinary');
        }
        
        return this.createEnding('ordinary');
    }

    /**
     * 创建结局对象
     */
    createEnding(endingId) {
        const endingType = ENDINGS.types[endingId];
        const endings = ENDINGS.endings[endingId] || ['你的人生走到了尽头。'];
        
        this.ending = {
            id: endingId,
            name: endingType.name,
            icon: endingType.icon,
            description: endingType.description,
            color: endingType.color,
            text: endings[Math.floor(Math.random() * endings.length)],
            score: this.score,
            age: this.player.age,
            year: this.player.year,
            deathReason: this.player.deathReason,
            finalAttributes: { ...this.player.attributes },
            finalMoney: this.player.money,
            stats: {
                eventsTriggered: this.player.eventsCount,
                married: this.player.flags['married'] || false,
                children: this.player.family?.children || 0,
                education: this.player.education?.level || 0,
                careerPeak: this.player.flags['career_peak'] || false
            }
        };
        
        return this.ending;
    }

    /**
     * 获取结局统计
     */
    getEndingStats() {
        return {
            score: this.score,
            age: this.player.age,
            year: this.player.year,
            attributes: this.player.attributes,
            money: this.player.money,
            flags: Object.keys(this.player.flags).filter(f => this.player.flags[f]),
            achievements: this.player.achievements || [],
            eventCount: this.player.eventsCount,
            relationships: Object.keys(this.player.relationships || {})
        };
    }
}

/**
 * 计算结局
 */
function calculateEnding(player) {
    const calculator = new EndingCalculator(player);
    return calculator.determineEnding();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ENDINGS, EndingCalculator, calculateEnding };
}
