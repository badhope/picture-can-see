/**
 * 剧情配置系统
 * 包含剧情元数据、世界观、角色背景和扩展机制
 * 支持独立于主代码的持续剧情更新
 */

const STORY_CONFIG = {
    /**
     * 剧情版本信息
     */
    version: '1.2.1',
    lastUpdated: '2026-03-10',
    author: 'CodeCritic',
    
    /**
     * 剧情更新历史
     */
    changelog: [
        { version: '1.2.0', date: '2026-03-10', changes: '剧情系统重构，扩展至100+事件' },
        { version: '1.1.0', date: '2026-03-10', changes: '新增天赋系统，UI优化' },
        { version: '1.0.0', date: '2026-03-10', changes: '初始版本发布' }
    ],

    /**
     * 世界观/时代背景系统
     * 不同的时代背景会影响事件和选择
     */
    eras: {
        modern: {
            id: 'modern',
            name: '现代社会',
            yearRange: [1990, 2025],
            description: '科技快速发展，互联网普及的时代',
            backgroundEvents: [
                { age: 5, event: '你出生在一个互联网普及的年代', type: 'background' },
                { age: 10, event: '你第一次接触智能手机', type: 'background' },
                { age: 18, event: '你参加了高考', type: 'milestone' },
                { age: 22, event: '你大学毕业', type: 'milestone' }
            ],
            technologyLevel: 0.8,
            economicBase: 0.7
        },
        future: {
            id: 'future',
            name: '未来世界',
            yearRange: [2025, 2060],
            description: '人工智能和虚拟现实主导的未来',
            backgroundEvents: [
                { age: 5, event: '你出生在AI技术成熟的时代', type: 'background' },
                { age: 10, event: '你熟练使用脑机接口设备', type: 'background' },
                { age: 18, event: '你参加了虚拟现实高考', type: 'milestone' },
                { age: 22, event: '你在元宇宙中大学毕业', type: 'milestone' }
            ],
            technologyLevel: 1.0,
            economicBase: 0.8
        },
        past: {
            id: 'past',
            name: '九十年代',
            yearRange: [1970, 2000],
            description: '改革开放浪潮中的黄金年代',
            backgroundEvents: [
                { age: 5, event: '你出生在改革开放的浪潮中', type: 'background' },
                { age: 10, event: '你第一次看到彩色电视机', type: 'background' },
                { age: 18, event: '你参加了传统高考', type: 'milestone' },
                { age: 22, event: '你赶上了下海经商的浪潮', type: 'milestone' }
            ],
            technologyLevel: 0.4,
            economicBase: 0.5
        }
    },

    /**
     * 角色出身背景系统
     * 影响初始属性和事件走向
     */
    backgrounds: {
        // 富裕阶层
        wealthy_family: {
            id: 'wealthy_family',
            name: '富裕家庭',
            description: '你出生在一个优渥的家庭，物质条件充裕',
            icon: '🏰',
            initialBonus: { money: 100000, charisma: 1 },
            events: [
                { age: 0, title: '含着金汤匙出生', description: '你出生在一个富裕的家庭，父亲是企业高管，母亲是全职太太。从小锦衣玉食，住着别墅，出门有专车接送。' },
                { age: 5, title: '精英教育', description: '父母为你报了各种兴趣班，钢琴、绘画、围棋...你的人生似乎已经被规划好了。' },
                { age: 15, title: '留学准备', description: '父母计划送你出国读书，你需要开始准备语言考试。' }
            ],
            careerBias: ['business', 'finance', 'politics'],
            personalityTraits: ['confident', 'educated']
        },
        
        // 中产阶层
        middle_class: {
            id: 'middle_class',
            name: '中产家庭',
            description: '你出生在一个普通但温馨的家庭',
            icon: '🏠',
            initialBonus: { money: 20000, intelligence: 1 },
            events: [
                { age: 0, title: '普通但不平凡', description: '你出生在一个普通的工薪家庭，父母都是上班族。虽然不富裕，但家里总是充满欢声笑语。' },
                { age: 5, title: '兴趣培养', description: '父母省吃俭用给你报了兴趣班，希望你能有个一技之长。' },
                { age: 15, title: '升学压力', description: '中考、高考...你开始感受到学业带来的压力。' }
            ],
            careerBias: ['technology', 'education', 'medical'],
            personalityTraits: ['diligent', 'practical']
        },
        
        // 贫困家庭
        poor_family: {
            id: 'poor_family',
            name: '贫困家庭',
            description: '你出生在一个经济拮据的家庭',
            icon: '🏚️',
            initialBonus: { constitution: 1, luck: 1 },
            events: [
                { age: 0, title: '艰难的开始', description: '你出生在一个贫困的农村家庭，父母靠种地为生。出生的那天，家里还在为医药费发愁。' },
                { age: 5, title: '懂事的童年', description: '你很小就学会帮父母做家务，照顾弟妹。穷人的孩子早当家。' },
                { age: 12, title: '辍学危机', description: '家里实在拿不出学费，你差点辍学外出打工。' }
            ],
            careerBias: ['labor', 'business', 'military'],
            personalityTraits: ['resilient', 'hardworking']
        },
        
        // 知识分子家庭
        scholar_family: {
            id: 'scholar_family',
            name: '书香门第',
            description: '你出生在父母都是知识分子的家庭',
            icon: '📚',
            initialBonus: { intelligence: 2, charisma: 1 },
            events: [
                { age: 0, title: '知识的熏陶', description: '你出生在一个知识分子家庭，父母都是大学教师。家里最多的就是书，你从小就在书海中长大。' },
                { age: 5, title: '早期教育', description: '父母从小就教你识字读书，你的起点比同龄人高得多。' },
                { age: 15, title: '期望与压力', description: '父母对你期望很高，要求你必须考上985、211。' }
            ],
            careerBias: ['academic', 'technology', 'medical', 'law'],
            personalityTraits: ['intelligent', 'educated']
        },
        
        // 单亲家庭
        single_parent: {
            id: 'single_parent',
            name: '单亲家庭',
            description: '你由父亲或母亲单独抚养长大',
            icon: '👨‍👧',
            initialBonus: { constitution: 1, intelligence: 1 },
            events: [
                { age: 0, title: '缺失的一半', description: '你出生后不久，父母就离婚了。你跟着妈妈（爸爸）生活，从未见过另一个亲人。' },
                { age: 5, title: '忙碌的母亲', description: '妈妈（爸爸）一个人打两份工，只为给你更好的生活。你很早就学会独立。' },
                { age: 12, title: '成长的烦恼', description: '你开始羡慕其他孩子有完整的家庭，偶尔会感到孤独。' }
            ],
            careerBias: ['versatile'],
            personalityTraits: ['independent', 'sensitive']
        },
        
        // 军人家庭
        military_family: {
            id: 'military_family',
            name: '军人家庭',
            description: '你出生在军人世家',
            icon: '🎖️',
            initialBonus: { constitution: 2, luck: 1 },
            events: [
                { age: 0, title: '军号声中长大', description: '你出生在部队大院里，爸爸是军人。从小听着军号声起床，接受军事化管理。' },
                { age: 5, title: '严格的训练', description: '爸爸对你要求很严格，要求你每天跑步、锻炼。你比同龄孩子更坚强。' },
                { age: 15, title: '继承传统', description: '爸爸希望你将来也当兵，报效国家。' }
            ],
            careerBias: ['military', 'police', 'sports'],
            personalityTraits: ['disciplined', 'patriotic']
        },
        
        // 艺术家家庭
        artist_family: {
            id: 'artist_family',
            name: '艺术家庭',
            description: '你出生在充满艺术氛围的家庭',
            icon: '🎨',
            initialBonus: { charisma: 2, intelligence: 1 },
            events: [
                { age: 0, title: '艺术的熏陶', description: '你出生在一个艺术家庭，爸爸是画家，妈妈是音乐家。从小就接触各种艺术。' },
                { age: 5, title: '天赋展现', description: '你展现出惊人的艺术天赋，画的画让人惊叹。' },
                { age: 15, title: '追梦还是现实', description: '你想追求艺术梦想，但父母希望你能有个"稳定"的工作。' }
            ],
            careerBias: ['arts', 'design', 'entertainment'],
            personalityTraits: ['creative', 'emotional']
        }
    },

    /**
     * 剧情主题设置
     * 不同的主题会影响整体游戏体验
     */
    themes: {
        realistic: {
            id: 'realistic',
            name: '写实风格',
            description: '贴近现实的剧情，探讨真实的人生议题',
            eventTone: 'realistic',
            sensitiveContent: false
        },
        romantic: {
            id: 'romantic',
            name: '浪漫主义',
            description: '充满理想和激情的剧情',
            eventTone: 'idealistic',
            sensitiveContent: false
        },
        dramatic: {
            id: 'dramatic',
            name: '戏剧人生',
            description: '充满戏剧性冲突的剧情',
            eventTone: 'dramatic',
            sensitiveContent: true
        }
    },

    /**
     * 剧情更新机制
     * 支持外部扩展和插件式更新
     */
    updateMechanism: {
        /**
         * 注册新事件
         * @param {string} lifeStage - 人生阶段 (baby/child/teen/young/middle/elder)
         * @param {Object} event - 事件对象
         */
        registerEvent: function(lifeStage, event) {
            if (!EVENTS[lifeStage]) {
                EVENTS[lifeStage] = [];
            }
            event.id = `${lifeStage}_${Date.now()}`;
            EVENTS[lifeStage].push(event);
            console.log(`[剧情系统] 注册新事件: ${event.title}`);
        },

        /**
         * 注册新结局
         * @param {string} endingId - 结局ID
         * @param {Object} ending - 结局对象
         */
        registerEnding: function(endingId, ending) {
            if (!ENDINGS[endingId]) {
                ENDINGS[endingId] = ending;
                console.log(`[剧情系统] 注册新结局: ${ending.name}`);
            }
        },

        /**
         * 注册新天赋
         * @param {Object} talent - 天赋对象
         */
        registerTalent: function(talent) {
            talent.id = `custom_${Date.now()}`;
            TALENTS.list.push(talent);
            console.log(`[剧情系统] 注册新天赋: ${talent.name}`);
        },

        /**
         * 动态加载剧情包
         * @param {Object} storyPackage - 剧情包对象
         */
        loadStoryPackage: function(storyPackage) {
            console.log(`[剧情系统] 加载剧情包: ${storyPackage.name}`);
            
            if (storyPackage.events) {
                for (const [stage, events] of Object.entries(storyPackage.events)) {
                    events.forEach(event => this.registerEvent(stage, event));
                }
            }
            
            if (storyPackage.endings) {
                for (const [id, ending] of Object.entries(storyPackage.endings)) {
                    this.registerEnding(id, ending);
                }
            }
            
            if (storyPackage.talents) {
                storyPackage.talents.forEach(talent => this.registerTalent(talent));
            }
        },

        /**
         * 获取剧情统计
         */
        getStats: function() {
            let totalEvents = 0;
            for (const stage in EVENTS) {
                totalEvents += EVENTS[stage].length;
            }
            
            return {
                version: this.version,
                totalEvents: totalEvents,
                totalEndings: Object.keys(ENDINGS).length,
                totalTalents: TALENTS.list.length,
                eras: Object.keys(this.eras).length,
                backgrounds: Object.keys(this.backgrounds).length
            };
        }
    }
};

/**
 * 剧情辅助函数
 */
const StoryUtils = {
    /**
     * 根据角色属性过滤事件
     */
    filterEventsByAttributes: function(events, player) {
        return events.filter(event => {
            if (event.requiredAttributes) {
                for (const [attr, minValue] of Object.entries(event.requiredAttributes)) {
                    if (player.attributes[attr] < minValue) return false;
                }
            }
            if (event.requiredBackground && player.background !== event.requiredBackground) {
                return false;
            }
            return true;
        });
    },

    /**
     * 生成事件描述变体
     */
    generateEventVariant: function(event, player) {
        let description = event.description;
        let title = event.title;
        
        if (player.background && STORY_CONFIG.backgrounds[player.background]) {
            const bg = STORY_CONFIG.backgrounds[player.background];
            description = description.replace('{background}', bg.description);
            title = title.replace('{background}', bg.name);
        }
        
        return { title, description };
    },

    /**
     * 计算事件与角色的契合度
     */
    calculateEventRelevance: function(event, player) {
        let relevance = 0;
        
        if (event.choices) {
            event.choices.forEach(choice => {
                if (choice.effects) {
                    for (const [attr, value] of Object.entries(choice.effects)) {
                        if (player.attributes[attr]) {
                            relevance += value * (player.attributes[attr] / 10);
                        }
                    }
                }
            });
        }
        
        return relevance;
    },

    /**
     * 获取随机背景事件
     */
    getBackgroundEvent: function(age, player) {
        const background = STORY_CONFIG.backgrounds[player.background];
        if (!background) return null;
        
        return background.events.find(e => e.age === age);
    }
};

/**
 * 打印剧情系统信息
 */
console.log('%c📖 剧情系统已加载', 'color: #6366f1; font-size: 14px; font-weight: bold;');
console.log(`%c版本: ${STORY_CONFIG.version}`, 'color: #94a3b8');
console.log(`%c总事件数: ${STORY_CONFIG.updateMechanism.getStats().totalEvents}`, 'color: #94a3b8');
