/**
 * 剧情引擎
 * 管理完整的剧情逻辑链、分支跳转和状态追踪
 * 确保剧情连贯性和因果关系
 */

class StoryEngine {
    constructor(player) {
        this.player = player;
        this.storyState = {};
        this.flags = {};
        this.variables = {};
        this.completedStorylines = new Set();
        this.activeStorylines = new Map();
        this.storyHistory = [];
        this.relationships = new Map();
        this.achievements_unlocked = new Set();
    }

    /**
     * 初始化剧情状态
     */
    init() {
        this.storyState = {
            currentArc: null,
            currentChapter: null,
            flags: {},
            variables: {
                karma: 0,
                reputation: 50,
                happiness: 50,
                stress: 0,
                relationships: {}
            }
        };
        
        this.initStorylines();
        this.initRelationships();
    }

    /**
     * 初始化剧情线
     */
    initStorylines() {
        this.storylines = {
            education: {
                id: 'education',
                name: '求学之路',
                description: '从幼儿园到大学的求学经历',
                stages: ['child', 'teen', 'young'],
                chapters: [
                    { id: 'kindergarten', name: '幼儿园', triggerAge: 4, requiredFlags: [] },
                    { id: 'primary', name: '小学', triggerAge: 6, requiredFlags: ['kindergarten_complete'] },
                    { id: 'middle', name: '初中', triggerAge: 12, requiredFlags: ['primary_complete'] },
                    { id: 'high', name: '高中', triggerAge: 15, requiredFlags: ['middle_complete'] },
                    { id: 'university', name: '大学', triggerAge: 18, requiredFlags: ['high_complete'] }
                ],
                impact: {
                    intelligence: 2,
                    charisma: 1
                }
            },
            career: {
                id: 'career',
                name: '职业发展',
                description: '从初入职场到事业有成',
                stages: ['young', 'middle'],
                chapters: [
                    { id: 'first_job', name: '第一份工作', triggerAge: 22, requiredFlags: [] },
                    { id: 'career_growth', name: '职业成长', triggerAge: 28, requiredFlags: ['first_job_complete'] },
                    { id: 'midlife_crisis', name: '中年危机', triggerAge: 40, requiredFlags: ['career_growth_complete'] },
                    { id: 'career_peak', name: '事业巅峰', triggerAge: 45, requiredFlags: ['midlife_crisis_complete'] }
                ],
                impact: {
                    money: 100000,
                    intelligence: 1
                }
            },
            romance: {
                id: 'romance',
                name: '爱情故事',
                description: '从初恋到婚姻的人生情感经历',
                stages: ['teen', 'young', 'middle'],
                chapters: [
                    { id: 'first_love', name: '初恋', triggerAge: 16, requiredFlags: [] },
                    { id: 'dating', name: '恋爱', triggerAge: 22, requiredFlags: ['first_love_complete'] },
                    { id: 'marriage', name: '婚姻', triggerAge: 28, requiredFlags: ['dating_complete'] },
                    { id: 'family', name: '家庭', triggerAge: 32, requiredFlags: ['marriage_complete'] }
                ],
                impact: {
                    charisma: 2,
                    happiness: 20
                }
            },
            health: {
                id: 'health',
                name: '健康人生',
                description: '从年轻到老年的健康历程',
                stages: ['young', 'middle', 'elder'],
                chapters: [
                    { id: 'youth_health', name: '青春活力', triggerAge: 20, requiredFlags: [] },
                    { id: 'middle_health', name: '中年保健', triggerAge: 40, requiredFlags: ['youth_health_complete'] },
                    { id: 'elder_health', name: '老年养生', triggerAge: 60, requiredFlags: ['middle_health_complete'] }
                ],
                impact: {
                    constitution: 2
                }
            },
            wealth: {
                id: 'wealth',
                name: '财富积累',
                description: '从贫穷到富裕的财富之路',
                stages: ['young', 'middle', 'elder'],
                chapters: [
                    { id: 'savings', name: '储蓄起步', triggerAge: 25, requiredFlags: [] },
                    { id: 'investment', name: '投资理财', triggerAge: 35, requiredFlags: ['savings_complete'] },
                    { id: 'wealth_peak', name: '财富自由', triggerAge: 50, requiredFlags: ['investment_complete'] }
                ],
                impact: {
                    money: 500000
                }
            },
            social: {
                id: 'social',
                name: '社交网络',
                description: '从孤独到人脉广阔的社交历程',
                stages: ['child', 'teen', 'young', 'middle'],
                chapters: [
                    { id: 'childhood_friends', name: '童年玩伴', triggerAge: 8, requiredFlags: [] },
                    { id: 'school_friends', name: '校园友谊', triggerAge: 14, requiredFlags: ['childhood_friends_complete'] },
                    { id: 'work_network', name: '职场人脉', triggerAge: 25, requiredFlags: ['school_friends_complete'] },
                    { id: 'social_influence', name: '社会影响力', triggerAge: 40, requiredFlags: ['work_network_complete'] }
                ],
                impact: {
                    charisma: 2,
                    luck: 1
                }
            }
        };
    }

    /**
     * 初始化关系系统
     */
    initRelationships() {
        this.relationshipTypes = {
            family: { name: '家人', maxLevel: 100, decay: 0 },
            friend: { name: '朋友', maxLevel: 100, decay: 1 },
            lover: { name: '恋人', maxLevel: 100, decay: 2 },
            spouse: { name: '配偶', maxLevel: 100, decay: 0 },
            colleague: { name: '同事', maxLevel: 80, decay: 3 },
            rival: { name: '对手', maxLevel: 50, decay: 1 },
            mentor: { name: '导师', maxLevel: 100, decay: 2 }
        };
    }

    /**
     * 设置剧情标记
     * @param {string} flag - 标记名称
     * @param {*} value - 标记值
     */
    setFlag(flag, value = true) {
        this.flags[flag] = value;
        this.storyState.flags[flag] = value;
    }

    /**
     * 检查剧情标记
     * @param {string} flag - 标记名称
     * @returns {*} 标记值
     */
    hasFlag(flag) {
        return this.flags[flag] !== undefined;
    }

    /**
     * 获取剧情标记
     * @param {string} flag - 标记名称
     * @param {*} defaultValue - 默认值
     * @returns {*} 标记值
     */
    getFlag(flag, defaultValue = null) {
        return this.flags[flag] !== undefined ? this.flags[flag] : defaultValue;
    }

    /**
     * 设置变量
     * @param {string} key - 变量名
     * @param {*} value - 变量值
     */
    setVariable(key, value) {
        this.variables[key] = value;
        if (this.storyState.variables) {
            this.storyState.variables[key] = value;
        }
    }

    /**
     * 获取变量
     * @param {string} key - 变量名
     * @param {*} defaultValue - 默认值
     * @returns {*} 变量值
     */
    getVariable(key, defaultValue = 0) {
        return this.variables[key] !== undefined ? this.variables[key] : defaultValue;
    }

    /**
     * 增加变量值
     * @param {string} key - 变量名
     * @param {number} amount - 增加量
     */
    addVariable(key, amount) {
        const current = this.getVariable(key, 0);
        this.setVariable(key, current + amount);
    }

    /**
     * 检查剧情线是否可以触发
     * @param {Object} storyline - 剧情线对象
     * @returns {Object|null} 可触发的章节
     */
    checkStorylineTrigger(storyline) {
        if (!storyline.stages.includes(this.player.lifeStage.id)) {
            return null;
        }

        for (const chapter of storyline.chapters) {
            if (this.hasFlag(`${chapter.id}_complete`)) {
                continue;
            }

            if (this.player.age >= chapter.triggerAge) {
                const allFlagsMet = chapter.requiredFlags.every(flag => this.hasFlag(flag));
                if (allFlagsMet) {
                    return chapter;
                }
            }
        }

        return null;
    }

    /**
     * 获取所有可触发的剧情事件
     * @returns {Array} 可触发的剧情事件数组
     */
    getAvailableStoryEvents() {
        const availableEvents = [];

        for (const [id, storyline] of Object.entries(this.storylines)) {
            const chapter = this.checkStorylineTrigger(storyline);
            if (chapter) {
                availableEvents.push({
                    storyline: storyline,
                    chapter: chapter,
                    priority: EVENT_PRIORITY.HIGH,
                    type: 'storyline'
                });
            }
        }

        return availableEvents;
    }

    /**
     * 完成剧情章节
     * @param {string} storylineId - 剧情线ID
     * @param {string} chapterId - 章节ID
     */
    completeChapter(storylineId, chapterId) {
        this.setFlag(`${chapterId}_complete`, true);
        
        const storyline = this.storylines[storylineId];
        if (storyline) {
            this.storyHistory.push({
                storyline: storylineId,
                chapter: chapterId,
                age: this.player.age,
                timestamp: Date.now()
            });

            const chapterIndex = storyline.chapters.findIndex(c => c.id === chapterId);
            if (chapterIndex === storyline.chapters.length - 1) {
                this.completedStorylines.add(storylineId);
                this.activeStorylines.delete(storylineId);
            }
        }
    }

    /**
     * 添加关系
     * @param {string} characterId - 角色ID
     * @param {string} type - 关系类型
     * @param {string} name - 角色名称
     * @param {number} initialLevel - 初始亲密度
     */
    addRelationship(characterId, type, name, initialLevel = 50) {
        this.relationships.set(characterId, {
            id: characterId,
            type: type,
            name: name,
            level: initialLevel,
            history: []
        });
    }

    /**
     * 更新关系
     * @param {string} characterId - 角色ID
     * @param {number} change - 变化量
     * @param {string} reason - 原因
     */
    updateRelationship(characterId, change, reason = '') {
        const relationship = this.relationships.get(characterId);
        if (relationship) {
            const typeConfig = this.relationshipTypes[relationship.type];
            relationship.level = Math.max(0, Math.min(typeConfig.maxLevel, relationship.level + change));
            relationship.history.push({
                change: change,
                reason: reason,
                age: this.player.age,
                timestamp: Date.now()
            });
        }
    }

    /**
     * 获取关系
     * @param {string} characterId - 角色ID
     * @returns {Object|null} 关系对象
     */
    getRelationship(characterId) {
        return this.relationships.get(characterId) || null;
    }

    /**
     * 获取所有关系
     * @param {string} type - 关系类型（可选）
     * @returns {Array} 关系数组
     */
    getAllRelationships(type = null) {
        const all = Array.from(this.relationships.values());
        if (type) {
            return all.filter(r => r.type === type);
        }
        return all;
    }

    /**
     * 计算因果影响
     * 根据之前的选择影响当前事件
     * @param {Object} event - 事件对象
     * @returns {Object} 修改后的事件
     */
    calculateCausalImpact(event) {
        if (!event.causalFlags) {
            return event;
        }

        const modifiedEvent = { ...event };
        modifiedEvent.choices = event.choices.map(choice => {
            const modifiedChoice = { ...choice };
            
            if (choice.causalEffects) {
                for (const [flag, effects] of Object.entries(choice.causalEffects)) {
                    if (this.hasFlag(flag)) {
                        modifiedChoice.effects = { ...modifiedChoice.effects, ...effects };
                    }
                }
            }

            return modifiedChoice;
        });

        return modifiedEvent;
    }

    /**
     * 生成事件分支
     * 根据玩家状态生成不同的事件变体
     * @param {Object} baseEvent - 基础事件
     * @returns {Object} 分支事件
     */
    generateEventBranch(baseEvent) {
        const branch = { ...baseEvent };
        
        if (baseEvent.branches) {
            for (const branchCondition of baseEvent.branches) {
                if (this.evaluateCondition(branchCondition.condition)) {
                    branch.title = branchCondition.title || baseEvent.title;
                    branch.description = branchCondition.description || baseEvent.description;
                    branch.choices = branchCondition.choices || baseEvent.choices;
                    break;
                }
            }
        }

        return branch;
    }

    /**
     * 评估条件
     * @param {Object} condition - 条件对象
     * @returns {boolean} 是否满足条件
     */
    evaluateCondition(condition) {
        if (condition.flags) {
            for (const flag of condition.flags) {
                if (!this.hasFlag(flag)) return false;
            }
        }

        if (condition.flagsNot) {
            for (const flag of condition.flagsNot) {
                if (this.hasFlag(flag)) return false;
            }
        }

        if (condition.attributes) {
            for (const [attr, value] of Object.entries(condition.attributes)) {
                if (this.player.attributes[attr] < value) return false;
            }
        }

        if (condition.age) {
            if (condition.age.min && this.player.age < condition.age.min) return false;
            if (condition.age.max && this.player.age > condition.age.max) return false;
        }

        if (condition.money) {
            if (condition.money.min && this.player.money < condition.money.min) return false;
        }

        if (condition.variables) {
            for (const [key, value] of Object.entries(condition.variables)) {
                if (this.getVariable(key) < value) return false;
            }
        }

        return true;
    }

    /**
     * 处理事件后果
     * 事件选择后触发的连锁反应
     * @param {Object} event - 事件对象
     * @param {Object} choice - 选择对象
     * @returns {Object} 后果对象
     */
    processConsequences(event, choice) {
        const consequences = {
            flags: [],
            variables: [],
            relationships: [],
            nextEvents: [],
            messages: []
        };

        if (choice.setFlags) {
            for (const [flag, value] of Object.entries(choice.setFlags)) {
                this.setFlag(flag, value);
                consequences.flags.push({ flag, value });
            }
        }

        if (choice.setVariables) {
            for (const [key, value] of Object.entries(choice.setVariables)) {
                this.setVariable(key, value);
                consequences.variables.push({ key, value });
            }
        }

        if (choice.relationshipEffects) {
            for (const effect of choice.relationshipEffects) {
                this.updateRelationship(effect.characterId, effect.change, effect.reason);
                consequences.relationships.push(effect);
            }
        }

        if (choice.nextEvent) {
            consequences.nextEvents.push(choice.nextEvent);
        }

        if (choice.karmaChange) {
            this.addVariable('karma', choice.karmaChange);
            consequences.variables.push({ key: 'karma', change: choice.karmaChange });
        }

        if (choice.reputationChange) {
            this.addVariable('reputation', choice.reputationChange);
        }

        if (choice.happinessChange) {
            this.addVariable('happiness', choice.happinessChange);
        }

        return consequences;
    }

    /**
     * 获取剧情状态摘要
     * @returns {Object} 状态摘要
     */
    getStorySummary() {
        return {
            completedStorylines: Array.from(this.completedStorylines),
            activeStorylines: Array.from(this.activeStorylines.keys()),
            totalFlags: Object.keys(this.flags).length,
            relationships: this.getAllRelationships().length,
            karma: this.getVariable('karma', 0),
            reputation: this.getVariable('reputation', 50),
            happiness: this.getVariable('happiness', 50)
        };
    }

    /**
     * 序列化剧情状态
     * @returns {Object} 序列化数据
     */
    serialize() {
        return {
            flags: { ...this.flags },
            variables: { ...this.variables },
            completedStorylines: Array.from(this.completedStorylines),
            storyHistory: [...this.storyHistory],
            relationships: Array.from(this.relationships.entries())
        };
    }

    /**
     * 反序列化剧情状态
     * @param {Object} data - 序列化数据
     */
    deserialize(data) {
        if (data.flags) this.flags = { ...data.flags };
        if (data.variables) this.variables = { ...data.variables };
        if (data.completedStorylines) this.completedStorylines = new Set(data.completedStorylines);
        if (data.storyHistory) this.storyHistory = [...data.storyHistory];
        if (data.relationships) this.relationships = new Map(data.relationships);
    }
}

/**
 * 预定义的剧情事件链
 */
const STORY_CHAINS = {
    education_path: {
        id: 'education_path',
        name: '求学之路',
        events: [
            {
                id: 'school_entry',
                title: '入学',
                description: '你到了上学的年龄，父母为你准备了新书包和新文具。',
                age: 6,
                choices: [
                    { text: '认真学习', effects: { intelligence: 1 }, setFlags: { 'diligent_student': true } },
                    { text: '贪玩逃课', effects: { charisma: 1, intelligence: -1 }, setFlags: { 'playful_student': true } }
                ],
                nextEvent: 'school_performance'
            },
            {
                id: 'school_performance',
                title: '学业表现',
                description: '期末考试结束了，你的成绩如何？',
                age: 7,
                condition: { flags: ['school_entry_complete'] },
                branches: [
                    {
                        condition: { flags: ['diligent_student'] },
                        title: '优秀学生',
                        description: '因为你平时认真学习，这次考试你取得了优异的成绩！',
                        choices: [
                            { text: '继续努力', effects: { intelligence: 1 }, setFlags: { 'excellent_student': true } }
                        ]
                    },
                    {
                        condition: { flags: ['playful_student'] },
                        title: '成绩下滑',
                        description: '因为你经常逃课玩耍，这次考试成绩不太理想。',
                        choices: [
                            { text: '开始努力', effects: { intelligence: 1 }, setFlags: { 'reformed_student': true } },
                            { text: '继续玩耍', effects: { charisma: 1 }, setFlags: { 'carefree_student': true } }
                        ]
                    }
                ]
            }
        ]
    },

    career_path: {
        id: 'career_path',
        name: '职业发展',
        events: [
            {
                id: 'first_job_hunt',
                title: '求职',
                description: '大学毕业了，你开始寻找第一份工作。',
                age: 22,
                choices: [
                    { 
                        text: '投递大公司', 
                        effects: { intelligence: 1 }, 
                        probability: 0.4,
                        setFlags: { 'big_company_attempt': true },
                        nextEvent: 'big_company_result'
                    },
                    { 
                        text: '选择创业公司', 
                        effects: { charisma: 1, luck: 1 }, 
                        setFlags: { 'startup_choice': true },
                        nextEvent: 'startup_journey'
                    },
                    { 
                        text: '考公务员', 
                        effects: { constitution: 1 }, 
                        probability: 0.3,
                        setFlags: { 'civil_service_attempt': true },
                        nextEvent: 'civil_service_result'
                    }
                ]
            },
            {
                id: 'big_company_result',
                title: '大公司面试结果',
                description: '你收到了大公司的面试通知...',
                age: 22,
                condition: { flags: ['big_company_attempt'] },
                branches: [
                    {
                        condition: { attributes: { intelligence: 7 } },
                        description: '凭借出色的能力，你成功进入了大公司！',
                        choices: [
                            { text: '努力工作', effects: { intelligence: 1 }, money: 10000, setFlags: { 'big_company_success': true } }
                        ]
                    },
                    {
                        condition: {},
                        description: '面试不太顺利，你被拒绝了。',
                        choices: [
                            { text: '继续寻找', effects: { luck: -1 }, nextEvent: 'first_job_hunt' }
                        ]
                    }
                ]
            }
        ]
    },

    romance_path: {
        id: 'romance_path',
        name: '爱情故事',
        events: [
            {
                id: 'first_crush',
                title: '初恋',
                description: '青春期到了，你对班上的某个人产生了好感。',
                age: 15,
                choices: [
                    { 
                        text: '勇敢表白', 
                        effects: { charisma: 1 }, 
                        probability: 0.3,
                        relationshipEffects: [{ characterId: 'first_love', change: 30, reason: '表白' }],
                        setFlags: { 'confessed_first_love': true }
                    },
                    { 
                        text: '默默暗恋', 
                        effects: { intelligence: 1 }, 
                        setFlags: { 'secret_crush': true }
                    },
                    { 
                        text: '专注学业', 
                        effects: { intelligence: 1 }, 
                        setFlags: { 'focus_on_study': true }
                    }
                ]
            },
            {
                id: 'dating_phase',
                title: '恋爱',
                description: '你遇到了一个特别的人，你们开始交往。',
                age: 22,
                condition: { flagsNot: ['focus_on_study'] },
                choices: [
                    { 
                        text: '认真交往', 
                        effects: { charisma: 1, happiness: 10 },
                        relationshipEffects: [{ characterId: 'partner', change: 20, reason: '认真交往' }],
                        setFlags: { 'serious_relationship': true }
                    },
                    { 
                        text: '保持距离', 
                        effects: { intelligence: 1 },
                        setFlags: { 'casual_dating': true }
                    }
                ]
            },
            {
                id: 'marriage_decision',
                title: '婚姻',
                description: '你们的关系发展到了谈婚论嫁的阶段。',
                age: 28,
                condition: { flags: ['serious_relationship'] },
                choices: [
                    { 
                        text: '步入婚姻', 
                        effects: { charisma: 1, constitution: 1 },
                        money: -50000,
                        setFlags: { 'married': true },
                        relationshipEffects: [{ characterId: 'partner', type: 'spouse', change: 30, reason: '结婚' }]
                    },
                    { 
                        text: '继续恋爱', 
                        effects: { charisma: 1 },
                        setFlags: { 'long_term_dating': true }
                    },
                    { 
                        text: '分手', 
                        effects: { charisma: -1, happiness: -20 },
                        setFlags: { 'broken_up': true }
                    }
                ]
            }
        ]
    }
};

/**
 * 剧情事件生成器
 */
const StoryEventGenerator = {
    /**
     * 根据玩家状态生成动态事件
     * @param {Object} player - 玩家对象
     * @param {Object} storyEngine - 剧情引擎实例
     * @returns {Object|null} 生成的事件
     */
    generateDynamicEvent(player, storyEngine) {
        const age = player.age;
        const stage = player.lifeStage.id;

        if (age === 6 && !storyEngine.hasFlag('school_started')) {
            return this.generateSchoolEvent(player, storyEngine);
        }

        if (age === 18 && !storyEngine.hasFlag('college_decision')) {
            return this.generateCollegeEvent(player, storyEngine);
        }

        if (age === 22 && !storyEngine.hasFlag('career_started')) {
            return this.generateCareerStartEvent(player, storyEngine);
        }

        if (age >= 25 && age <= 35 && !storyEngine.hasFlag('marriage_considered') && storyEngine.hasFlag('serious_relationship')) {
            return this.generateMarriageEvent(player, storyEngine);
        }

        return null;
    },

    generateSchoolEvent(player, storyEngine) {
        return {
            id: 'dynamic_school_start',
            title: '入学第一天',
            description: '今天是你上学的第一天，父母为你准备了新书包，你既紧张又兴奋。',
            type: 'milestone',
            priority: EVENT_PRIORITY.CRITICAL,
            choices: [
                {
                    text: '认真听讲',
                    effects: { intelligence: 1 },
                    setFlags: { 'school_started': true, 'diligent_student': true }
                },
                {
                    text: '交朋友',
                    effects: { charisma: 1 },
                    setFlags: { 'school_started': true, 'social_student': true }
                },
                {
                    text: '发呆走神',
                    effects: { luck: 1 },
                    setFlags: { 'school_started': true, 'daydreamer': true }
                }
            ]
        };
    },

    generateCollegeEvent(player, storyEngine) {
        const intelligence = player.attributes.intelligence;
        let description = '';
        let choices = [];

        if (intelligence >= 8) {
            description = '你的成绩优异，收到了多所名校的录取通知书！';
            choices = [
                { text: '选择顶尖名校', effects: { intelligence: 2 }, setFlags: { 'college_decision': true, 'elite_college': true } },
                { text: '选择专业强校', effects: { intelligence: 1, charisma: 1 }, setFlags: { 'college_decision': true, 'specialized_college': true } }
            ];
        } else if (intelligence >= 6) {
            description = '你的成绩不错，收到了几所大学的录取通知。';
            choices = [
                { text: '选择综合大学', effects: { intelligence: 1, charisma: 1 }, setFlags: { 'college_decision': true, 'regular_college': true } },
                { text: '选择职业学院', effects: { constitution: 1 }, setFlags: { 'college_decision': true, 'vocational_college': true } }
            ];
        } else {
            description = '高考成绩不太理想，你需要做出选择。';
            choices = [
                { text: '复读一年', effects: { intelligence: 1, constitution: -1 }, setFlags: { 'college_decision': true, 'repeat_year': true } },
                { text: '直接工作', effects: { constitution: 1, luck: 1 }, setFlags: { 'college_decision': true, 'skip_college': true } }
            ];
        }

        return {
            id: 'dynamic_college_decision',
            title: '高考志愿',
            description: description,
            type: 'milestone',
            priority: EVENT_PRIORITY.CRITICAL,
            choices: choices
        };
    },

    generateCareerStartEvent(player, storyEngine) {
        return {
            id: 'dynamic_career_start',
            title: '步入职场',
            description: '大学毕业后，你开始寻找工作，这是人生的重要转折点。',
            type: 'milestone',
            priority: EVENT_PRIORITY.CRITICAL,
            choices: [
                {
                    text: '投递大企业',
                    effects: { intelligence: 1 },
                    probability: 0.5,
                    setFlags: { 'career_started': true, 'corporate_path': true },
                    money: 15000
                },
                {
                    text: '加入创业公司',
                    effects: { charisma: 1, luck: 1 },
                    setFlags: { 'career_started': true, 'startup_path': true },
                    money: 8000
                },
                {
                    text: '自主创业',
                    effects: { charisma: 1, constitution: -1 },
                    setFlags: { 'career_started': true, 'entrepreneur_path': true },
                    money: -20000
                },
                {
                    text: '继续深造',
                    effects: { intelligence: 2 },
                    setFlags: { 'career_started': true, 'academic_path': true },
                    money: -30000
                }
            ]
        };
    },

    generateMarriageEvent(player, storyEngine) {
        return {
            id: 'dynamic_marriage',
            title: '婚姻大事',
            description: '你们的关系发展到了谈婚论嫁的阶段，是时候做出决定了。',
            type: 'milestone',
            priority: EVENT_PRIORITY.CRITICAL,
            choices: [
                {
                    text: '盛大婚礼',
                    effects: { charisma: 2, happiness: 20 },
                    money: -100000,
                    setFlags: { 'married': true, 'grand_wedding': true }
                },
                {
                    text: '简单婚礼',
                    effects: { constitution: 1, happiness: 15 },
                    money: -30000,
                    setFlags: { 'married': true, 'simple_wedding': true }
                },
                {
                    text: '旅行结婚',
                    effects: { luck: 1, happiness: 18 },
                    money: -50000,
                    setFlags: { 'married': true, 'travel_wedding': true }
                },
                {
                    text: '暂时不考虑',
                    effects: { intelligence: 1 },
                    setFlags: { 'marriage_postponed': true }
                }
            ]
        };
    }
};
