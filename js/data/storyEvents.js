/**
 * 剧情事件数据
 * 包含完整的逻辑链、因果关系和分支跳转
 * 每个事件都有明确的触发条件和后续影响
 */

const STORY_EVENTS = {
    baby: [
        {
            id: 'birth',
            title: '降生',
            description: '你来到了这个世界，发出了人生的第一声啼哭。',
            type: 'milestone',
            priority: 100,
            probability: 1,
            choices: [
                { text: '大声啼哭', effects: { constitution: 1 }, setFlags: { 'healthy_baby': true } },
                { text: '安静观察', effects: { intelligence: 1 }, setFlags: { 'observant_baby': true } }
            ]
        },
        {
            id: 'first_steps',
            title: '蹒跚学步',
            description: '你开始尝试走路，摇摇晃晃地迈出了人生的第一步。',
            type: 'milestone',
            priority: 90,
            age: { min: 1, max: 2 },
            choices: [
                { text: '勇敢尝试', effects: { constitution: 1 }, setFlags: { 'brave_walker': true } },
                { text: '小心翼翼', effects: { intelligence: 1 }, setFlags: { 'cautious_walker': true } }
            ]
        },
        {
            id: 'first_words',
            title: '牙牙学语',
            description: '你开始尝试说话，发出了人生的第一句话。',
            type: 'milestone',
            priority: 90,
            age: { min: 1, max: 2 },
            choices: [
                { text: '叫"妈妈"', effects: { charisma: 1 }, setFlags: { 'mommys_child': true } },
                { text: '叫"爸爸"', effects: { charisma: 1 }, setFlags: { 'daddys_child': true } }
            ]
        }
    ],

    child: [
        {
            id: 'kindergarten',
            title: '幼儿园',
            description: '你到了上幼儿园的年龄，这是你第一次离开父母，进入集体生活。',
            type: 'milestone',
            priority: 100,
            age: { min: 3, max: 4 },
            choices: [
                { 
                    text: '开心融入', 
                    effects: { charisma: 1 }, 
                    setFlags: { 'kindergarten_complete': true, 'social_child': true },
                    nextEvent: 'kindergarten_friends'
                },
                { 
                    text: '哭闹不止', 
                    effects: { constitution: 1 }, 
                    setFlags: { 'kindergarten_complete': true, 'shy_child': true }
                },
                { 
                    text: '安静观察', 
                    effects: { intelligence: 1 }, 
                    setFlags: { 'kindergarten_complete': true, 'observant_child': true }
                }
            ]
        },
        {
            id: 'kindergarten_friends',
            title: '幼儿园伙伴',
            description: '你在幼儿园交到了第一个好朋友。',
            type: 'relationship',
            priority: 80,
            condition: { flags: ['social_child'] },
            choices: [
                { 
                    text: '一起玩耍', 
                    effects: { charisma: 1 },
                    relationshipEffects: [{ characterId: 'childhood_friend', type: 'friend', change: 20, reason: '一起玩耍' }],
                    setFlags: { 'has_childhood_friend': true }
                }
            ]
        },
        {
            id: 'primary_school',
            title: '小学入学',
            description: '你正式成为一名小学生了！背上新书包，踏入校园。',
            type: 'milestone',
            priority: 100,
            age: { min: 6, max: 7 },
            choices: [
                { 
                    text: '认真学习', 
                    effects: { intelligence: 1 }, 
                    setFlags: { 'primary_school_complete': true, 'diligent_student': true },
                    nextEvent: 'primary_school_grades'
                },
                { 
                    text: '交朋友', 
                    effects: { charisma: 1 }, 
                    setFlags: { 'primary_school_complete': true, 'social_student': true }
                },
                { 
                    text: '调皮捣蛋', 
                    effects: { luck: 1, constitution: -1 }, 
                    setFlags: { 'primary_school_complete': true, 'mischievous_student': true },
                    nextEvent: 'primary_school_trouble'
                }
            ]
        },
        {
            id: 'primary_school_grades',
            title: '学业表现',
            description: '期末考试结束了，你的成绩如何？',
            type: 'education',
            priority: 85,
            condition: { flags: ['diligent_student'] },
            branches: [
                {
                    condition: { attributes: { intelligence: 7 } },
                    description: '因为你平时认真学习，这次考试你取得了优异的成绩！老师当众表扬了你。',
                    choices: [
                        { text: '继续努力', effects: { intelligence: 1 }, setFlags: { 'excellent_grades': true } }
                    ]
                },
                {
                    condition: {},
                    description: '虽然你认真学习了，但成绩只是中等水平。',
                    choices: [
                        { text: '更加努力', effects: { intelligence: 1, constitution: -1 }, setFlags: { 'average_grades': true } },
                        { text: '接受现实', effects: { charisma: 1 }, setFlags: { 'accept_grades': true } }
                    ]
                }
            ]
        },
        {
            id: 'primary_school_trouble',
            title: '惹祸了',
            description: '你因为调皮捣蛋被老师叫家长了。',
            type: 'negative',
            priority: 80,
            condition: { flags: ['mischievous_student'] },
            choices: [
                { text: '诚恳道歉', effects: { charisma: 1 }, setFlags: { 'learned_lesson': true } },
                { text: '不以为然', effects: { luck: -1 }, setFlags: { 'rebellious': true }, nextEvent: 'more_trouble' }
            ]
        },
        {
            id: 'hobby_discovery',
            title: '发现兴趣',
            description: '你在课外活动中发现了自己的兴趣所在。',
            type: 'personal',
            priority: 70,
            age: { min: 8, max: 11 },
            choices: [
                { 
                    text: '学习音乐', 
                    effects: { charisma: 2 }, 
                    money: -5000,
                    setFlags: { 'music_talent': true, 'has_hobby': true },
                    nextEvent: 'music_development'
                },
                { 
                    text: '学习绘画', 
                    effects: { intelligence: 1, charisma: 1 }, 
                    money: -3000,
                    setFlags: { 'art_talent': true, 'has_hobby': true }
                },
                { 
                    text: '学习体育', 
                    effects: { constitution: 2 }, 
                    money: -2000,
                    setFlags: { 'sports_talent': true, 'has_hobby': true },
                    nextEvent: 'sports_development'
                },
                { 
                    text: '专注学业', 
                    effects: { intelligence: 1 }, 
                    setFlags: { 'academic_focus': true }
                }
            ]
        },
        {
            id: 'music_development',
            title: '音乐之路',
            description: '你在音乐方面展现出天赋，老师建议你继续深造。',
            type: 'talent',
            priority: 75,
            condition: { flags: ['music_talent'] },
            age: { min: 10, max: 12 },
            choices: [
                { 
                    text: '报考艺术学校', 
                    effects: { charisma: 2 }, 
                    money: -10000,
                    setFlags: { 'art_school': true },
                    probability: 0.6
                },
                { 
                    text: '作为爱好继续', 
                    effects: { charisma: 1, happiness: 5 }, 
                    setFlags: { 'music_hobby': true }
                }
            ]
        },
        {
            id: 'sports_development',
            title: '体育特长',
            description: '你在体育方面表现出色，被选入校队。',
            type: 'talent',
            priority: 75,
            condition: { flags: ['sports_talent'] },
            age: { min: 10, max: 12 },
            choices: [
                { 
                    text: '加入校队', 
                    effects: { constitution: 2, charisma: 1 }, 
                    setFlags: { 'school_team': true },
                    nextEvent: 'sports_competition'
                },
                { 
                    text: '保持锻炼', 
                    effects: { constitution: 1 }, 
                    setFlags: { 'casual_sports': true }
                }
            ]
        }
    ],

    teen: [
        {
            id: 'middle_school',
            title: '初中生活',
            description: '你升入初中，开始了新的学习生活。',
            type: 'milestone',
            priority: 100,
            age: { min: 12, max: 13 },
            choices: [
                { 
                    text: '努力学习', 
                    effects: { intelligence: 1 }, 
                    setFlags: { 'middle_school_complete': true, 'academic_teen': true }
                },
                { 
                    text: '发展社交', 
                    effects: { charisma: 1 }, 
                    setFlags: { 'middle_school_complete': true, 'social_teen': true }
                },
                { 
                    text: '叛逆期', 
                    effects: { luck: 1, charisma: -1 }, 
                    setFlags: { 'middle_school_complete': true, 'rebellious_teen': true },
                    nextEvent: 'teen_rebellion'
                }
            ]
        },
        {
            id: 'teen_rebellion',
            title: '叛逆期',
            description: '你进入了叛逆期，开始和父母产生冲突。',
            type: 'personal',
            priority: 80,
            condition: { flags: ['rebellious_teen'] },
            choices: [
                { 
                    text: '继续叛逆', 
                    effects: { charisma: -1, luck: -1 }, 
                    setFlags: { 'deep_rebellion': true },
                    relationshipEffects: [{ characterId: 'parents', type: 'family', change: -20, reason: '叛逆期冲突' }]
                },
                { 
                    text: '尝试沟通', 
                    effects: { charisma: 1, intelligence: 1 }, 
                    setFlags: { 'rebellion_resolved': true },
                    relationshipEffects: [{ characterId: 'parents', type: 'family', change: 10, reason: '尝试沟通' }]
                }
            ]
        },
        {
            id: 'first_love',
            title: '青涩初恋',
            description: '青春期到了，你对班上的某个人产生了好感。',
            type: 'romance',
            priority: 85,
            age: { min: 14, max: 16 },
            condition: { flagsNot: ['focus_on_study_only'] },
            choices: [
                { 
                    text: '勇敢表白', 
                    effects: { charisma: 1 }, 
                    probability: 0.3,
                    setFlags: { 'first_love_confessed': true },
                    relationshipEffects: [{ characterId: 'first_love_interest', type: 'lover', change: 30, reason: '表白' }],
                    nextEvent: 'first_love_result'
                },
                { 
                    text: '默默暗恋', 
                    effects: { intelligence: 1, happiness: -5 }, 
                    setFlags: { 'secret_first_love': true }
                },
                { 
                    text: '专注学业', 
                    effects: { intelligence: 1 }, 
                    setFlags: { 'focus_on_study_only': true }
                }
            ]
        },
        {
            id: 'first_love_result',
            title: '初恋结果',
            description: '你的表白有了结果...',
            type: 'romance',
            priority: 90,
            condition: { flags: ['first_love_confessed'] },
            branches: [
                {
                    condition: { attributes: { charisma: 7 } },
                    description: '对方接受了你的表白，你们开始交往！',
                    choices: [
                        { 
                            text: '认真交往', 
                            effects: { charisma: 1, happiness: 20 },
                            setFlags: { 'first_relationship': true }
                        }
                    ]
                },
                {
                    condition: {},
                    description: '对方婉拒了你，说现在想专注学业。',
                    choices: [
                        { text: '接受现实', effects: { intelligence: 1 }, setFlags: { 'first_rejection': true } },
                        { text: '继续等待', effects: { charisma: -1 }, setFlags: { 'persistent_crush': true } }
                    ]
                }
            ]
        },
        {
            id: 'high_school',
            title: '高中入学',
            description: '你升入高中，高考的压力开始逼近。',
            type: 'milestone',
            priority: 100,
            age: { min: 15, max: 16 },
            choices: [
                { 
                    text: '全力以赴', 
                    effects: { intelligence: 2, constitution: -1 }, 
                    setFlags: { 'high_school_complete': true, 'hardworking_high': true }
                },
                { 
                    text: '劳逸结合', 
                    effects: { intelligence: 1, charisma: 1 }, 
                    setFlags: { 'high_school_complete': true, 'balanced_high': true }
                },
                { 
                    text: '随波逐流', 
                    effects: { luck: 1 }, 
                    setFlags: { 'high_school_complete': true, 'casual_high': true }
                }
            ]
        },
        {
            id: 'gaokao',
            title: '高考',
            description: '人生最重要的考试来了，你准备好了吗？',
            type: 'milestone',
            priority: 100,
            age: { min: 18, max: 18 },
            branches: [
                {
                    condition: { flags: ['hardworking_high'], attributes: { intelligence: 8 } },
                    description: '你平时努力学习，高考发挥出色，成绩优异！',
                    choices: [
                        { text: '选择顶尖名校', effects: { intelligence: 2 }, setFlags: { 'elite_university': true, 'gaokao_complete': true } }
                    ]
                },
                {
                    condition: { flags: ['hardworking_high'] },
                    description: '你努力了，成绩还不错。',
                    choices: [
                        { text: '选择重点大学', effects: { intelligence: 1 }, setFlags: { 'good_university': true, 'gaokao_complete': true } }
                    ]
                },
                {
                    condition: { flags: ['balanced_high'] },
                    description: '你成绩中等，有几所大学可以选择。',
                    choices: [
                        { text: '选择普通本科', effects: { intelligence: 1, charisma: 1 }, setFlags: { 'regular_university': true, 'gaokao_complete': true } },
                        { text: '选择专科', effects: { constitution: 1 }, setFlags: { 'vocational_college': true, 'gaokao_complete': true } }
                    ]
                },
                {
                    condition: { flags: ['casual_high'] },
                    description: '高考成绩不太理想，你需要做出选择。',
                    choices: [
                        { text: '复读一年', effects: { intelligence: 1, constitution: -1, happiness: -10 }, setFlags: { 'repeat_year': true, 'gaokao_complete': false }, nextEvent: 'repeat_year_struggle' },
                        { text: '直接工作', effects: { constitution: 1, luck: 1 }, setFlags: { 'skip_university': true, 'gaokao_complete': true } }
                    ]
                }
            ]
        },
        {
            id: 'repeat_year_struggle',
            title: '复读之路',
            description: '你选择了复读，这是艰难的一年。',
            type: 'education',
            priority: 90,
            condition: { flags: ['repeat_year'] },
            choices: [
                { 
                    text: '咬牙坚持', 
                    effects: { intelligence: 2, constitution: -1 }, 
                    probability: 0.7,
                    setFlags: { 'repeat_success': true, 'gaokao_complete': true },
                    nextEvent: 'repeat_result'
                },
                { 
                    text: '中途放弃', 
                    effects: { charisma: -1, luck: -1 }, 
                    setFlags: { 'repeat_failed': true, 'skip_university': true, 'gaokao_complete': true }
                }
            ]
        }
    ],

    young: [
        {
            id: 'university_life',
            title: '大学生活',
            description: '你开始了大学生活，这是一个全新的世界。',
            type: 'milestone',
            priority: 100,
            age: { min: 18, max: 19 },
            condition: { flagsNot: ['skip_university'] },
            choices: [
                { 
                    text: '专注学业', 
                    effects: { intelligence: 2 }, 
                    setFlags: { 'academic_university': true }
                },
                { 
                    text: '参加社团', 
                    effects: { charisma: 2 }, 
                    setFlags: { 'social_university': true },
                    nextEvent: 'club_activities'
                },
                { 
                    text: '兼职打工', 
                    effects: { constitution: 1 }, 
                    money: 5000,
                    setFlags: { 'working_student': true }
                },
                { 
                    text: '谈恋爱', 
                    effects: { charisma: 1, happiness: 10 }, 
                    setFlags: { 'university_romance': true },
                    condition: { flagsNot: ['first_relationship'] }
                }
            ]
        },
        {
            id: 'club_activities',
            title: '社团活动',
            description: '你在社团中表现出色，获得了认可。',
            type: 'social',
            priority: 80,
            condition: { flags: ['social_university'] },
            choices: [
                { 
                    text: '成为社长', 
                    effects: { charisma: 2, intelligence: 1 }, 
                    setFlags: { 'club_president': true }
                },
                { 
                    text: '专注活动', 
                    effects: { charisma: 1 }, 
                    setFlags: { 'active_member': true }
                }
            ]
        },
        {
            id: 'graduation',
            title: '毕业',
            description: '大学生活结束了，你即将踏入社会。',
            type: 'milestone',
            priority: 100,
            age: { min: 22, max: 22 },
            condition: { flagsNot: ['skip_university'] },
            branches: [
                {
                    condition: { flags: ['elite_university', 'academic_university'] },
                    description: '你从顶尖名校毕业，前途一片光明！',
                    choices: [
                        { text: '继续深造', effects: { intelligence: 2 }, money: -20000, setFlags: { 'graduate_school': true } },
                        { text: '进入名企', effects: { intelligence: 1, money: 20000 }, setFlags: { 'top_company': true } }
                    ]
                },
                {
                    condition: { flags: ['good_university'] },
                    description: '你顺利毕业，准备开始职业生涯。',
                    choices: [
                        { text: '找工作', effects: { constitution: 1 }, setFlags: { 'job_hunting': true }, nextEvent: 'first_job' },
                        { text: '考研', effects: { intelligence: 1 }, probability: 0.5, setFlags: { 'grad_school_attempt': true } }
                    ]
                },
                {
                    condition: {},
                    description: '你完成了大学学业，准备面对社会。',
                    choices: [
                        { text: '找工作', effects: { constitution: 1 }, setFlags: { 'job_hunting': true }, nextEvent: 'first_job' }
                    ]
                }
            ]
        },
        {
            id: 'first_job',
            title: '第一份工作',
            description: '你开始了职业生涯的第一步。',
            type: 'career',
            priority: 100,
            age: { min: 22, max: 24 },
            choices: [
                { 
                    text: '大公司', 
                    effects: { intelligence: 1 }, 
                    probability: 0.4,
                    money: 15000,
                    setFlags: { 'corporate_job': true, 'career_started': true }
                },
                { 
                    text: '创业公司', 
                    effects: { charisma: 1, luck: 1 }, 
                    money: 8000,
                    setFlags: { 'startup_job': true, 'career_started': true }
                },
                { 
                    text: '公务员', 
                    effects: { constitution: 1 }, 
                    probability: 0.2,
                    money: 10000,
                    setFlags: { 'civil_servant': true, 'career_started': true }
                },
                { 
                    text: '自主创业', 
                    effects: { charisma: 2 }, 
                    money: -50000,
                    setFlags: { 'entrepreneur': true, 'career_started': true },
                    nextEvent: 'startup_journey'
                }
            ]
        },
        {
            id: 'serious_relationship',
            title: '认真恋爱',
            description: '你遇到了一个特别的人，你们开始认真交往。',
            type: 'romance',
            priority: 85,
            age: { min: 24, max: 28 },
            condition: { flagsNot: ['married'] },
            choices: [
                { 
                    text: '认真发展', 
                    effects: { charisma: 1, happiness: 15 }, 
                    setFlags: { 'serious_dating': true },
                    relationshipEffects: [{ characterId: 'partner', type: 'lover', change: 30, reason: '认真交往' }]
                },
                { 
                    text: '保持距离', 
                    effects: { intelligence: 1 }, 
                    setFlags: { 'casual_dating': true }
                }
            ]
        },
        {
            id: 'marriage_proposal',
            title: '求婚',
            description: '你们的关系发展到了谈婚论嫁的阶段。',
            type: 'romance',
            priority: 100,
            age: { min: 26, max: 32 },
            condition: { flags: ['serious_dating'] },
            choices: [
                { 
                    text: '浪漫求婚', 
                    effects: { charisma: 2, happiness: 25 }, 
                    money: -30000,
                    setFlags: { 'engaged': true },
                    nextEvent: 'wedding'
                },
                { 
                    text: '简单求婚', 
                    effects: { charisma: 1, happiness: 20 }, 
                    money: -5000,
                    setFlags: { 'engaged': true },
                    nextEvent: 'wedding'
                },
                { 
                    text: '再等等', 
                    effects: { intelligence: 1 }, 
                    setFlags: { 'marriage_delayed': true }
                }
            ]
        },
        {
            id: 'wedding',
            title: '婚礼',
            description: '你们即将步入婚姻的殿堂。',
            type: 'milestone',
            priority: 100,
            condition: { flags: ['engaged'] },
            choices: [
                { 
                    text: '盛大婚礼', 
                    effects: { charisma: 2, happiness: 30 }, 
                    money: -100000,
                    setFlags: { 'married': true, 'grand_wedding': true },
                    relationshipEffects: [{ characterId: 'partner', type: 'spouse', change: 40, reason: '结婚' }]
                },
                { 
                    text: '简单婚礼', 
                    effects: { constitution: 1, happiness: 25 }, 
                    money: -30000,
                    setFlags: { 'married': true, 'simple_wedding': true },
                    relationshipEffects: [{ characterId: 'partner', type: 'spouse', change: 30, reason: '结婚' }]
                },
                { 
                    text: '旅行结婚', 
                    effects: { luck: 1, happiness: 28 }, 
                    money: -50000,
                    setFlags: { 'married': true, 'travel_wedding': true },
                    relationshipEffects: [{ characterId: 'partner', type: 'spouse', change: 35, reason: '结婚' }]
                }
            ]
        },
        {
            id: 'first_child',
            title: '第一个孩子',
            description: '你们迎来了第一个孩子，人生进入了新的阶段。',
            type: 'milestone',
            priority: 100,
            age: { min: 28, max: 35 },
            condition: { flags: ['married'] },
            choices: [
                { 
                    text: '喜悦迎接', 
                    effects: { charisma: 1, constitution: 1, happiness: 40 }, 
                    money: -20000,
                    setFlags: { 'has_child': true, 'first_time_parent': true }
                },
                { 
                    text: '压力山大', 
                    effects: { intelligence: 1, happiness: -10 }, 
                    money: -20000,
                    setFlags: { 'has_child': true, 'stressed_parent': true }
                }
            ]
        },
        {
            id: 'career_advancement',
            title: '职业晋升',
            description: '你在工作中表现出色，获得了晋升机会。',
            type: 'career',
            priority: 85,
            age: { min: 28, max: 35 },
            condition: { flags: ['career_started'] },
            branches: [
                {
                    condition: { flags: ['corporate_job'], attributes: { intelligence: 7 } },
                    description: '你在大公司表现出色，被提拔为部门主管！',
                    choices: [
                        { text: '接受晋升', effects: { intelligence: 1, charisma: 1 }, money: 30000, setFlags: { 'promoted': true } }
                    ]
                },
                {
                    condition: { flags: ['startup_job'], attributes: { charisma: 7 } },
                    description: '创业公司发展良好，你成为了合伙人！',
                    choices: [
                        { text: '成为合伙人', effects: { charisma: 2, luck: 1 }, money: 50000, setFlags: { 'partner': true } }
                    ]
                },
                {
                    condition: { flags: ['civil_servant'] },
                    description: '你在公务员岗位上稳步前进。',
                    choices: [
                        { text: '继续努力', effects: { constitution: 1 }, setFlags: { 'steady_career': true } }
                    ]
                }
            ]
        }
    ],

    middle: [
        {
            id: 'midlife_crisis',
            title: '中年危机',
            description: '人到中年，你开始思考人生的意义。',
            type: 'personal',
            priority: 90,
            age: { min: 40, max: 45 },
            choices: [
                { 
                    text: '重新规划', 
                    effects: { intelligence: 1, charisma: 1 }, 
                    setFlags: { 'midlife_reflection': true }
                },
                { 
                    text: '保持现状', 
                    effects: { constitution: 1 }, 
                    setFlags: { 'midlife_stable': true }
                },
                { 
                    text: '追求刺激', 
                    effects: { luck: 1, charisma: -1 }, 
                    setFlags: { 'midlife_adventure': true },
                    nextEvent: 'midlife_changes'
                }
            ]
        },
        {
            id: 'midlife_changes',
            title: '中年转变',
            description: '你决定做出一些改变...',
            type: 'personal',
            priority: 85,
            condition: { flags: ['midlife_adventure'] },
            choices: [
                { 
                    text: '学习新技能', 
                    effects: { intelligence: 2 }, 
                    money: -10000,
                    setFlags: { 'new_skills': true }
                },
                { 
                    text: '换工作', 
                    effects: { charisma: 1, luck: 1 }, 
                    probability: 0.5,
                    setFlags: { 'career_change': true }
                },
                { 
                    text: '环游世界', 
                    effects: { charisma: 2, happiness: 20 }, 
                    money: -100000,
                    setFlags: { 'world_travel': true }
                }
            ]
        },
        {
            id: 'children_growing',
            title: '子女成长',
            description: '你的孩子渐渐长大，开始有了自己的生活。',
            type: 'family',
            priority: 85,
            age: { min: 45, max: 55 },
            condition: { flags: ['has_child'] },
            choices: [
                { 
                    text: '支持孩子', 
                    effects: { charisma: 1, happiness: 15 }, 
                    money: -50000,
                    setFlags: { 'supportive_parent': true }
                },
                { 
                    text: '放手让孩子独立', 
                    effects: { intelligence: 1 }, 
                    setFlags: { 'independent_children': true }
                }
            ]
        },
        {
            id: 'health_concerns',
            title: '健康警钟',
            description: '体检报告显示你需要关注健康了。',
            type: 'health',
            priority: 90,
            age: { min: 45, max: 55 },
            choices: [
                { 
                    text: '开始锻炼', 
                    effects: { constitution: 2 }, 
                    setFlags: { 'healthy_lifestyle': true }
                },
                { 
                    text: '调整饮食', 
                    effects: { constitution: 1 }, 
                    setFlags: { 'diet_change': true }
                },
                { 
                    text: '不以为然', 
                    effects: { constitution: -1, luck: -1 }, 
                    setFlags: { 'ignoring_health': true },
                    nextEvent: 'health_decline'
                }
            ]
        },
        {
            id: 'wealth_management',
            title: '财富规划',
            description: '你开始认真考虑财务规划和养老问题。',
            type: 'finance',
            priority: 80,
            age: { min: 45, max: 55 },
            choices: [
                { 
                    text: '稳健投资', 
                    effects: { intelligence: 1 }, 
                    probability: 0.8,
                    money: 100000,
                    setFlags: { 'conservative_investor': true }
                },
                { 
                    text: '风险投资', 
                    effects: { luck: 2 }, 
                    probability: 0.3,
                    money: 300000,
                    setFlags: { 'risky_investor': true }
                },
                { 
                    text: '存银行', 
                    effects: { constitution: 1 }, 
                    money: 20000,
                    setFlags: { 'saver': true }
                }
            ]
        },
        {
            id: 'career_peak',
            title: '事业巅峰',
            description: '你达到了职业生涯的顶峰。',
            type: 'career',
            priority: 95,
            age: { min: 50, max: 58 },
            condition: { flags: ['promoted', 'partner'] },
            choices: [
                { 
                    text: '继续奋斗', 
                    effects: { intelligence: 1, constitution: -1 }, 
                    money: 100000,
                    setFlags: { 'career_peak': true }
                },
                { 
                    text: '培养接班人', 
                    effects: { charisma: 2 }, 
                    setFlags: { 'mentor_role': true }
                },
                { 
                    text: '准备退休', 
                    effects: { happiness: 20 }, 
                    setFlags: { 'preparing_retirement': true }
                }
            ]
        }
    ],

    elder: [
        {
            id: 'retirement',
            title: '退休',
            description: '你正式退休了，开始了人生的另一个阶段。',
            type: 'milestone',
            priority: 100,
            age: { min: 60, max: 65 },
            choices: [
                { 
                    text: '享受生活', 
                    effects: { charisma: 1, happiness: 30 }, 
                    setFlags: { 'retired': true, 'enjoying_retirement': true }
                },
                { 
                    text: '继续工作', 
                    effects: { intelligence: 1, constitution: -1 }, 
                    setFlags: { 'working_senior': true }
                },
                { 
                    text: '发挥余热', 
                    effects: { charisma: 2 }, 
                    setFlags: { 'retired': true, 'active_senior': true },
                    nextEvent: 'volunteer_work'
                }
            ]
        },
        {
            id: 'volunteer_work',
            title: '志愿服务',
            description: '你开始参与社区志愿服务，帮助他人。',
            type: 'social',
            priority: 80,
            condition: { flags: ['active_senior'] },
            choices: [
                { 
                    text: '教导年轻人', 
                    effects: { charisma: 1, intelligence: 1 }, 
                    setFlags: { 'mentor': true }
                },
                { 
                    text: '社区服务', 
                    effects: { charisma: 2, happiness: 15 }, 
                    setFlags: { 'community_volunteer': true }
                }
            ]
        },
        {
            id: 'grandchildren',
            title: '含饴弄孙',
            description: '你有了孙辈，享受天伦之乐。',
            type: 'family',
            priority: 90,
            age: { min: 55, max: 70 },
            condition: { flags: ['has_child'] },
            choices: [
                { 
                    text: '帮忙带孙子', 
                    effects: { charisma: 1, constitution: -1, happiness: 25 }, 
                    setFlags: { 'grandparent': true, 'helping_grandkids': true }
                },
                { 
                    text: '偶尔探望', 
                    effects: { happiness: 15 }, 
                    setFlags: { 'grandparent': true }
                }
            ]
        },
        {
            id: 'health_decline',
            title: '健康下滑',
            description: '你的身体开始出现各种问题。',
            type: 'health',
            priority: 95,
            age: { min: 65, max: 80 },
            condition: { flags: ['ignoring_health'] },
            choices: [
                { 
                    text: '积极治疗', 
                    effects: { constitution: 1 }, 
                    money: -50000,
                    setFlags: { 'treating_health': true }
                },
                { 
                    text: '顺其自然', 
                    effects: { luck: 1 }, 
                    setFlags: { 'accepting_health': true }
                }
            ]
        },
        {
            id: 'life_reflection',
            title: '人生回顾',
            description: '你开始回顾自己的一生，思考人生的意义。',
            type: 'personal',
            priority: 90,
            age: { min: 70, max: 85 },
            choices: [
                { 
                    text: '感到满足', 
                    effects: { happiness: 30 }, 
                    setFlags: { 'satisfied_life': true }
                },
                { 
                    text: '有些遗憾', 
                    effects: { intelligence: 1, happiness: -10 }, 
                    setFlags: { 'life_regrets': true }
                },
                { 
                    text: '平静接受', 
                    effects: { charisma: 1, constitution: 1 }, 
                    setFlags: { 'peaceful_elder': true }
                }
            ]
        },
        {
            id: 'final_days',
            title: '人生终点',
            description: '你的人生即将走到尽头，回顾这一生...',
            type: 'milestone',
            priority: 100,
            age: { min: 80, max: 100 },
            branches: [
                {
                    condition: { flags: ['satisfied_life', 'married', 'has_child'] },
                    description: '你度过了幸福圆满的一生，家人陪伴在身边。',
                    choices: [
                        { text: '安详离去', effects: { happiness: 50 }, setFlags: { 'good_ending': true } }
                    ]
                },
                {
                    condition: { flags: ['career_peak'] },
                    description: '你事业有成，留下了丰厚的遗产。',
                    choices: [
                        { text: '含笑而终', effects: { happiness: 30 }, setFlags: { 'wealthy_ending': true } }
                    ]
                },
                {
                    condition: {},
                    description: '你平静地走完了人生旅程。',
                    choices: [
                        { text: '平静离去', effects: { happiness: 20 }, setFlags: { 'normal_ending': true } }
                    ]
                }
            ]
        }
    ],

    universal: [
        {
            id: 'unexpected_windfall',
            title: '意外之财',
            description: '你意外获得了一笔钱财。',
            type: 'random',
            priority: 50,
            probability: 0.05,
            choices: [
                { text: '存起来', effects: { intelligence: 1 }, money: 50000 },
                { text: '花掉', effects: { charisma: 1, happiness: 10 }, money: 50000 },
                { text: '捐出去', effects: { charisma: 2, happiness: 15 }, money: 0 }
            ]
        },
        {
            id: 'sudden_illness',
            title: '突发疾病',
            description: '你突然生病了，需要住院治疗。',
            type: 'health',
            priority: 80,
            probability: 0.08,
            condition: { attributes: { constitution: 4 } },
            choices: [
                { text: '积极治疗', effects: { constitution: -1 }, money: -30000 },
                { text: '保守治疗', effects: { constitution: -2 }, money: -10000 }
            ]
        },
        {
            id: 'lucky_encounter',
            title: '贵人相助',
            description: '你遇到了一位愿意帮助你的贵人。',
            type: 'random',
            priority: 70,
            probability: 0.06,
            condition: { attributes: { luck: 7 } },
            choices: [
                { text: '接受帮助', effects: { charisma: 1, luck: 1 }, money: 20000, setFlags: { 'met_mentor': true } },
                { text: '婉言谢绝', effects: { charisma: 2 }, setFlags: { 'independent': true } }
            ]
        },
        {
            id: 'family_tragedy',
            title: '家庭变故',
            description: '家里发生了一些不幸的事情。',
            type: 'negative',
            priority: 90,
            probability: 0.04,
            choices: [
                { text: '坚强面对', effects: { constitution: 1, happiness: -20 }, money: -50000 },
                { text: '寻求帮助', effects: { charisma: 1, happiness: -15 }, money: -30000 }
            ]
        },
        {
            id: 'friend_betrayal',
            title: '朋友背叛',
            description: '一个你信任的朋友背叛了你。',
            type: 'negative',
            priority: 85,
            probability: 0.03,
            condition: { flagsNot: ['no_close_friends'] },
            choices: [
                { text: '原谅对方', effects: { charisma: 1, happiness: -10 }, setFlags: { 'forgiving': true } },
                { text: '断绝关系', effects: { intelligence: 1, happiness: -15 }, setFlags: { 'no_close_friends': true } }
            ]
        }
    ]
};

/**
 * 获取剧情事件
 * @param {string} stage - 人生阶段
 * @param {Object} player - 玩家对象
 * @param {Object} storyEngine - 剧情引擎
 * @returns {Array} 可用的事件数组
 */
function getStoryEvents(stage, player, storyEngine) {
    const stageEvents = STORY_EVENTS[stage] || [];
    const universalEvents = STORY_EVENTS.universal || [];
    const allEvents = [...stageEvents, ...universalEvents];
    
    return allEvents.filter(event => {
        if (event.condition) {
            if (event.condition.flags) {
                for (const flag of event.condition.flags) {
                    if (!storyEngine.hasFlag(flag)) return false;
                }
            }
            if (event.condition.flagsNot) {
                for (const flag of event.condition.flagsNot) {
                    if (storyEngine.hasFlag(flag)) return false;
                }
            }
            if (event.condition.attributes) {
                for (const [attr, value] of Object.entries(event.condition.attributes)) {
                    if (player.attributes[attr] < value) return false;
                }
            }
            if (event.condition.age) {
                if (event.condition.age.min && player.age < event.condition.age.min) return false;
                if (event.condition.age.max && player.age > event.condition.age.max) return false;
            }
        }
        
        if (event.probability !== undefined) {
            if (Math.random() > event.probability) return false;
        }
        
        return true;
    }).map(event => {
        if (event.branches) {
            for (const branch of event.branches) {
                if (evaluateBranchCondition(branch.condition, player, storyEngine)) {
                    return {
                        ...event,
                        title: branch.title || event.title,
                        description: branch.description || event.description,
                        choices: branch.choices || event.choices
                    };
                }
            }
        }
        return event;
    });
}

/**
 * 评估分支条件
 */
function evaluateBranchCondition(condition, player, storyEngine) {
    if (!condition) return true;
    
    if (condition.flags) {
        for (const flag of condition.flags) {
            if (!storyEngine.hasFlag(flag)) return false;
        }
    }
    
    if (condition.attributes) {
        for (const [attr, value] of Object.entries(condition.attributes)) {
            if (player.attributes[attr] < value) return false;
        }
    }
    
    return true;
}
