/**
 * 天赋系统数据
 * 包含各种天赋类型、效果和获取条件
 */

const TALENTS = {
    /**
     * 稀有度定义
     */
    rarity: {
        common: { name: '普通', color: '#94a3b8', weight: 60 },
        rare: { name: '稀有', color: '#06b6d4', weight: 25 },
        epic: { name: '史诗', color: '#8b5cf6', weight: 12 },
        legendary: { name: '传说', color: '#f59e0b', weight: 3 }
    },

    /**
     * 天赋列表
     */
    list: [
        {
            id: 'genius',
            name: '天才',
            icon: '🧠',
            rarity: 'epic',
            description: '天生智力超群，学习能力极强',
            effect: { intelligence: 2 },
            condition: { minIntelligence: 8 }
        },
        {
            id: 'healthy',
            name: '健康宝宝',
            icon: '💪',
            rarity: 'rare',
            description: '出生时体质极佳，很少生病',
            effect: { constitution: 1 },
            condition: { minConstitution: 7 }
        },
        {
            id: 'charming',
            name: '万人迷',
            icon: '😊',
            rarity: 'rare',
            description: '天生具有超凡的魅力',
            effect: { charisma: 2 },
            condition: { minCharisma: 7 }
        },
        {
            id: 'lucky',
            name: '天选之人',
            icon: '🍀',
            rarity: 'epic',
            description: '运气极佳，总能逢凶化吉',
            effect: { luck: 2 },
            condition: { minLuck: 7 }
        },
        {
            id: 'wealthy_family',
            name: '富二代',
            icon: '🏦',
            rarity: 'legendary',
            description: '出生于富裕家庭，起点高于常人',
            effect: { money: 100000 },
            condition: { minMoney: 50000 }
        },
        {
            id: 'scholar_family',
            name: '书香门第',
            icon: '📚',
            rarity: 'rare',
            description: '父母都是知识分子',
            effect: { intelligence: 1, charisma: 1 },
            condition: { minIntelligence: 6 }
        },
        {
            id: 'athletic',
            name: '运动健将',
            icon: '🏃',
            rarity: 'rare',
            description: '具有出色的运动天赋',
            effect: { constitution: 2 },
            condition: { minConstitution: 6 }
        },
        {
            id: 'musical',
            name: '音乐天才',
            icon: '🎵',
            rarity: 'epic',
            description: '具有非凡的音乐才能',
            effect: { charisma: 1, luck: 1 },
            condition: { minCharisma: 6 }
        },
        {
            id: 'sociable',
            name: '社交达人',
            icon: '🤝',
            rarity: 'common',
            description: '善于与人交往，人缘好',
            effect: { charisma: 1 },
            condition: { minCharisma: 5 }
        },
        {
            id: 'diligent',
            name: '勤奋努力',
            icon: '📖',
            rarity: 'common',
            description: '做任何事都非常努力',
            effect: { intelligence: 1 },
            condition: { minIntelligence: 5 }
        },
        {
            id: 'optimist',
            name: '乐天派',
            icon: '😄',
            rarity: 'common',
            description: '总是保持积极乐观的心态',
            effect: { constitution: 1 },
            condition: { minConstitution: 5 }
        },
        {
            id: 'adventurous',
            name: '冒险家',
            icon: '🗺️',
            rarity: 'rare',
            description: '喜欢尝试新事物，勇于冒险',
            effect: { luck: 1, constitution: 1 },
            condition: { minLuck: 5 }
        },
        {
            id: 'persistence',
            name: '坚持不懈',
            icon: '💎',
            rarity: 'epic',
            description: '永不放弃，坚持到底',
            effect: { intelligence: 1, constitution: 1, luck: 1 },
            condition: { minIntelligence: 7, minConstitution: 7 }
        },
        {
            id: 'charismatic_leader',
            name: '领袖气质',
            icon: '👑',
            rarity: 'legendary',
            description: '天生具有领导才能',
            effect: { charisma: 3 },
            condition: { minCharisma: 8 }
        },
        {
            id: 'photogenic',
            name: '上镜',
            icon: '📸',
            rarity: 'common',
            description: '长得好看，怎么拍都好看',
            effect: { charisma: 1 },
            condition: { minCharisma: 5 }
        },
        {
            id: 'quick_learner',
            name: '过目不忘',
            icon: '📝',
            rarity: 'epic',
            description: '学习新东西特别快',
            effect: { intelligence: 2 },
            condition: { minIntelligence: 7 }
        },
        {
            id: 'iron_stomach',
            name: '铁胃',
            icon: '🍖',
            rarity: 'common',
            description: '怎么吃都不会出问题',
            effect: { constitution: 1 },
            condition: { minConstitution: 4 }
        },
        {
            id: 'night_owl',
            name: '夜猫子',
            icon: '🦉',
            rarity: 'common',
            description: '晚上精神特别好',
            effect: { intelligence: 1 },
            condition: { minIntelligence: 4 }
        },
        {
            id: 'people_person',
            name: '人见人爱',
            icon: '❤️',
            rarity: 'rare',
            description: '每个人都喜欢你',
            effect: { charisma: 2 },
            condition: { minCharisma: 6 }
        },
        {
            id: 'serendipity',
            name: '福星高照',
            icon: '⭐',
            rarity: 'legendary',
            description: '总能在正确的时间出现在正确的地方',
            effect: { luck: 3 },
            condition: { minLuck: 8 }
        }
    ],

    /**
     * 根据条件获取可用的天赋
     */
    getAvailableTalents: function(player) {
        const available = this.list.filter(talent => {
            if (!talent.condition) return true;
            
            for (const [attr, minValue] of Object.entries(talent.condition)) {
                if (player[attr] < minValue) return false;
            }
            return true;
        });
        
        return available;
    },

    /**
     * 随机获取指定数量的天赋
     */
    getRandomTalents: function(player, count = 2) {
        const available = this.getAvailableTalents(player);
        const talents = [];
        const usedIds = new Set();

        for (let i = 0; i < count && available.length > 0; i++) {
            const availableWithWeights = available.filter(t => !usedIds.has(t.id));
            if (availableWithWeights.length === 0) break;

            const totalWeight = availableWithWeights.reduce((sum, t) => 
                sum + this.rarity[t.rarity].weight, 0);
            
            let random = Math.random() * totalWeight;
            
            for (const talent of availableWithWeights) {
                random -= this.rarity[talent.rarity].weight;
                if (random <= 0) {
                    talents.push(talent);
                    usedIds.add(talent.id);
                    break;
                }
            }
        }

        return talents;
    },

    /**
     * 应用天赋效果
     */
    applyTalentEffect: function(player, talent) {
        if (talent.effect) {
            for (const [attr, value] of Object.entries(talent.effect)) {
                if (attr === 'money') {
                    player.money += value;
                    player.totalMoney += value;
                } else if (player.attributes && player.attributes[attr] !== undefined) {
                    player.attributes[attr] = Math.min(10, player.attributes[attr] + value);
                }
            }
        }
    },

    /**
     * 获取天赋描述
     */
    getTalentDescription: function(talent) {
        const effects = [];
        if (talent.effect) {
            for (const [attr, value] of Object.entries(talent.effect)) {
                const attrNames = {
                    intelligence: '智力',
                    constitution: '体质',
                    charisma: '魅力',
                    luck: '运气',
                    money: '金钱'
                };
                const sign = value > 0 ? '+' : '';
                effects.push(`${attrNames[attr] || attr}: ${sign}${value}`);
            }
        }
        return effects.join(', ');
    }
};
