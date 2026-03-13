/**
 * 历史时间轴事件系统
 * 包含2006-2035年的完整历史事件
 * 每个事件都有标签、触发条件、逻辑链关联
 */

const TIMELINE_EVENTS = {
    /**
     * 婴儿期 (0-3岁，2006-2009)
     * 标签: era=2006, stage=baby, type=fated, chain=birth
     */
    baby: [
        {
            id: 'birth_2006',
            title: '降生于这个世界',
            year: 2006,
            description: '伴随着清脆的哭声，你来到了这个世界。这是一个飞速发展的时代——2006年，中国经济蓬勃发展，房价开始起飞，互联网悄然改变着人们的生活。你的父母欣喜若狂，这是他们期盼已久的礼物。',
            tags: {
                era: ['2006', '婴儿潮'],
                stage: ['baby'],
                type: ['fated', 'milestone'],
                chain: 'birth'
            },
            conditions: {
                age: { min: 0, max: 0 },
                probability: 1.0,
                flags: [],
                attributes: {}
            },
            prerequisites: {
                chainEvents: [],
                chainType: 'none'
            },
            consequences: {
                flags: { 'born': true, 'year_2006': true },
                unlocks: [],
                attributeChanges: {},
                healthChanges: 5
            },
            branches: [
                {
                    condition: { background: 'wealthy' },
                    description: '你含着金汤匙出生，家庭条件优渥，一出生就住进了VIP病房。'
                },
                {
                    condition: { background: 'poor' },
                    description: '你出生在一个普通甚至有些拮据的家庭，但家人对你的爱一点不少。'
                },
                {
                    condition: {},
                    description: '你来到了这个世界，发出了人生的第一声啼哭。'
                }
            ],
            choices: [
                { text: '大声啼哭', effects: { constitution: 1 }, setFlags: { 'healthy_baby': true }, healthChange: 0 },
                { text: '安静观察', effects: { intelligence: 1 }, setFlags: { 'observant_baby': true }, healthChange: 0 }
            ]
        },
        {
            id: 'first_steps_2007',
            title: '摇摇晃晃的第一步',
            year: 2007,
            description: '一岁半的你开始尝试走路。在父母的鼓励下，你摇摇晃晃地迈出了人生的第一步。2007年，iPhone发布了，智能手机时代悄然开启，而你的人生才刚刚起步。',
            tags: {
                era: ['2007', '智能手机元年'],
                stage: ['baby'],
                type: ['fated', 'milestone'],
                chain: 'growth'
            },
            conditions: {
                age: { min: 1, max: 2 },
                probability: 1.0
            },
            consequences: {
                flags: { 'first_steps': true },
                attributeChanges: { constitution: 1, luck: 1 }
            },
            choices: [
                { text: '勇敢前行', effects: { constitution: 1, luck: 1 } },
                { text: '小心翼翼', effects: { intelligence: 1, charisma: 1 } }
            ]
        },
        {
            id: 'first_words_2008',
            title: '牙牙学语',
            year: 2008,
            description: '两岁的你开始学说话。2008年，这是载入史册的一年——北京奥运会举世瞩目，金融危机席卷全球。你的第一句话是"爸爸"还是"妈妈"？',
            tags: {
                era: ['2008', '北京奥运', '金融危机'],
                stage: ['baby'],
                type: ['fated', 'milestone']
            },
            conditions: {
                age: { min: 1, max: 2 },
                year: 2008,
                probability: 1.0
            },
            consequences: {
                flags: { 'can_speak': true, 'experienced_2008_crisis': true },
                attributeChanges: { intelligence: 1 }
            },
            branches: [
                {
                    condition: { attributes: { intelligence: 7 } },
                    description: '你展现出惊人的语言天赋，两岁就能说完整的句子。'
                },
                {
                    condition: {},
                    description: '你开始尝试说话，发出了人生的第一句话。'
                }
            ],
            choices: [
                { text: '叫"妈妈"', effects: { charisma: 1 }, setFlags: { 'mommys_child': true } },
                { text: '叫"爸爸"', effects: { charisma: 1 }, setFlags: { 'daddys_child': true } },
                { text: '喊"爷爷"', effects: { luck: 1 }, setFlags: { 'grandpas_child': true } }
            ]
        },
        {
            id: 'kindergarten_2009',
            title: '进入幼儿园',
            year: 2009,
            description: '三岁的你该上幼儿园了。这是第一次离开父母，进入集体生活。2009年，3G网络普及，人们开始用手机上网，世界正在发生巨变。',
            tags: {
                era: ['2009', '3G时代'],
                stage: ['baby', 'child'],
                type: ['fated', 'milestone'],
                chain: 'education'
            },
            conditions: {
                age: { min: 3, max: 3 },
                year: 2009,
                probability: 1.0
            },
            consequences: {
                flags: { 'kindergarten': true, 'social_life_start': true },
                attributeChanges: { charisma: 1 }
            },
            branches: [
                {
                    condition: { attributes: { charisma: 7 } },
                    description: '你很快适应了幼儿园生活，成为了小朋友中最受欢迎的那个。'
                },
                {
                    condition: { attributes: { charisma: { max: 4 } } },
                    description: '你有些害羞，不太愿意和其他小朋友交流。'
                },
                {
                    condition: {},
                    description: '你开始进入集体生活，认识了很多新朋友。'
                }
            ],
            choices: [
                { text: '开心融入', effects: { charisma: 2 }, setFlags: { 'social_child': true }, nextEvent: 'kindergarten_friends' },
                { text: '哭闹不止', effects: { constitution: 1 }, setFlags: { 'shy_child': true } },
                { text: '安静观察', effects: { intelligence: 1 }, setFlags: { 'observant_child': true } }
            ]
        }
    ],

    /**
     * 童年期 (4-12岁，2010-2018)
     */
    child: [
        {
            id: 'smartphone_era_2010',
            title: '智能手机时代来临',
            year: 2010,
            description: '2010年，iPad发布，智能手机开始普及。你开始接触电子产品。地铁上、餐厅里，每个人都在低头玩手机。这是一个属于屏幕时代的童年。',
            tags: {
                era: ['2010', '移动互联网', '智能设备'],
                stage: ['child'],
                type: ['era', 'influence']
            },
            conditions: {
                age: { min: 4, max: 8 },
                year: 2010,
                probability: 0.8
            },
            consequences: {
                flags: { 'smartphone_era': true },
                attributeChanges: {},
                probabilityModifiers: { 'digital_life': 1.5 }
            },
            choices: [
                { text: '沉迷电子产品', effects: { intelligence: -1, luck: 1 }, setFlags: { 'tech_addicted': true } },
                { text: '适度使用', effects: { intelligence: 1 }, setFlags: { 'balanced_tech': true } },
                { text: '远离电子产品', effects: { constitution: 1, charisma: -1 }, setFlags: { 'traditional_child': true } }
            ]
        },
        {
            id: 'primary_school_2012',
            title: '小学入学',
            year: 2012,
            description: '6岁的你正式成为一名小学生！2012年，伦敦奥运会举办，中国金牌榜第一。你戴上红领巾，踏入了人生的新阶段。',
            tags: {
                era: ['2012', '伦敦奥运'],
                stage: ['child'],
                type: ['fated', 'milestone'],
                chain: 'education'
            },
            conditions: {
                age: { min: 6, max: 7 },
                year: [2011, 2012, 2013],
                probability: 1.0
            },
            consequences: {
                flags: { 'primary_school': true, 'education_start': true },
                attributeChanges: { intelligence: 1 }
            },
            branches: [
                {
                    condition: { attributes: { intelligence: 7 } },
                    description: '你展现出优异的学习能力，成为班上的学霸。'
                },
                {
                    condition: { attributes: { charisma: 7 } },
                    description: '你人缘很好，很快成为了孩子王。'
                },
                {
                    condition: {},
                    description: '你正式成为一名小学生，背着书包走进校园。'
                }
            ],
            choices: [
                { text: '认真学习', effects: { intelligence: 2 }, setFlags: { 'diligent_student': true }, nextEvent: 'primary_grades' },
                { text: '广交朋友', effects: { charisma: 2 }, setFlags: { 'social_student': true }, nextEvent: 'childhood_friends' },
                { text: '调皮捣蛋', effects: { luck: 1, constitution: -1 }, setFlags: { 'mischievous': true }, nextEvent: 'school_trouble' }
            ]
        },
        {
            id: 'wechat_2013',
            title: '微信改变生活',
            year: 2013,
            description: '2013年，微信用户突破3亿。你发现大人们都在用这个软件发消息、抢红包。这是移动互联网爆发的前夜。',
            tags: {
                era: ['2013', '微信', '移动互联网'],
                stage: ['child'],
                type: ['era', 'influence']
            },
            conditions: {
                age: { min: 6, max: 10 },
                year: 2013,
                probability: 0.7
            },
            consequences: {
                flags: { 'wechat_era': true },
                unlocks: ['teen_social_media']
            },
            choices: [
                { text: '好奇观察', effects: { intelligence: 1 } },
                { text: '漠不关心', effects: { charisma: -1 } }
            ]
        },
        {
            id: 'mobile_internet_2015',
            title: '移动互联网爆发',
            year: 2015,
            description: '2015年，4G网络全面普及，移动互联网爆发。外卖、网约车、共享单车...你和家人生活方式正在被彻底改变。你开始用手机看动画片、玩游戏。',
            tags: {
                era: ['2015', '4G时代', '移动互联网爆发'],
                stage: ['child'],
                type: ['era', 'influence'],
                chain: 'digital_life'
            },
            conditions: {
                age: { min: 8, max: 12 },
                year: 2015,
                probability: 0.9
            },
            consequences: {
                flags: { 'mobile_internet_era': true },
                attributeChanges: {},
                probabilityModifiers: { 'gaming_addiction': 1.3 }
            },
            branches: [
                {
                    condition: { attributes: { intelligence: 7 } },
                    description: '你开始用手机学习新知识，展现出超强的信息获取能力。'
                },
                {
                    condition: { attributes: { constitution: 7 } },
                    description: '你懂得节制，每周只玩固定的時間。'
                },
                {
                    condition: {},
                    description: '你深深被手机吸引，开始了与屏幕为伴的童年。'
                }
            ],
            choices: [
                { text: '沉迷游戏', effects: { intelligence: -2, constitution: -1, luck: 1 }, setFlags: { 'gaming_addicted': true } },
                { text: '用于学习', effects: { intelligence: 2, constitution: -1 }, setFlags: { 'tech_savvy': true } },
                { text: '偶尔娱乐', effects: { charisma: 1 }, setFlags: { 'balanced': true } }
            ]
        },
        {
            id: 'middle_school_2016',
            title: '初中入学',
            year: 2016,
            description: '12岁的你进入初中！2016年，里约奥运会举办，AlphaGo击败李世石，人工智能开始进入大众视野。学业压力突然变大，你需要面对更多考试和竞争。',
            tags: {
                era: ['2016', '里约奥运', 'AI元年'],
                stage: ['child', 'teen'],
                type: ['fated', 'milestone'],
                chain: 'education'
            },
            conditions: {
                age: { min: 12, max: 13 },
                year: [2015, 2016, 2017, 2018],
                probability: 1.0
            },
            consequences: {
                flags: { 'middle_school': true, 'teenager': true },
                attributeChanges: { intelligence: 1 },
                healthChanges: -2
            },
            branches: [
                {
                    condition: { flags: ['diligent_student'] },
                    description: '凭借小学打下的基础，你很快适应了初中生活。'
                },
                {
                    condition: { flags: ['mischievous'] },
                    description: '初中课程难度加大，你开始感到吃力。'
                },
                {
                    condition: {},
                    description: '你进入了新的学校，面临全新的环境和挑战。'
                }
            ],
            choices: [
                { text: '努力学习', effects: { intelligence: 2, constitution: -1 }, setFlags: { 'hard_studying': true }, nextEvent: 'high_school_exam' },
                { text: '发展兴趣爱好', effects: { charisma: 1, luck: 1 }, setFlags: { 'hobbyist': true } },
                { text: '社交为主', effects: { charisma: 2, intelligence: -1 }, setFlags: { 'social_teen': true } }
            ]
        },
        {
            id: 'gaokao_awareness_2018',
            title: '高考压力来临',
            year: 2018,
            description: '2018年，你感受到高考的脚步声越来越近。这是中国最残酷的考试，也是无数学子改变命运的通道。你开始思考自己的未来。',
            tags: {
                era: ['2018', '高考'],
                stage: ['teen'],
                type: ['fated', 'milestone'],
                chain: 'education'
            },
            conditions: {
                age: { min: 15, max: 16 },
                year: 2018,
                probability: 0.9
            },
            consequences: {
                flags: { 'gaokao_awareness': true },
                attributeChanges: { intelligence: 1 }
            },
            choices: [
                { text: '全力备考', effects: { intelligence: 2, constitution: -2 }, setFlags: { 'gaokao_prep': true } },
                { text: '保持平衡', effects: { intelligence: 1, charisma: 1 }, setFlags: { 'balanced_teen': true } },
                { text: '考虑其他出路', effects: { luck: 1 }, setFlags: { 'alternative_path': true } }
            ]
        }
    ],

    /**
     * 少年期 (13-18岁，2019-2024)
     */
    teen: [
        {
            id: 'covid_2020',
            title: '新冠疫情爆发',
            year: 2020,
            description: '2020年，新冠疫情爆发！这是一场百年未遇的全球公共卫生危机。学校停课、居家学习、口罩成为必需品。你经历了人生中第一次大规模突发事件。',
            tags: {
                era: ['2020', '新冠疫情', '全球危机'],
                stage: ['teen'],
                type: ['era', 'crisis', 'fated'],
                chain: 'covid19'
            },
            conditions: {
                age: { min: 13, max: 18 },
                year: 2020,
                probability: 1.0
            },
            consequences: {
                flags: { 'experienced_covid': true, 'online_education': true },
                attributeChanges: {},
                healthChanges: -3,
                unlocks: ['covid_recovery_2021', 'post_covid_2022']
            },
            branches: [
                {
                    condition: { attributes: { constitution: 8 } },
                    description: '你免疫力强，平安度过了疫情。'
                },
                {
                    condition: { attributes: { constitution: { max: 4 } } },
                    description: '你感染了新冠，经过治疗后康复，但身体受到了一定影响。'
                },
                {
                    condition: {},
                    description: '疫情改变了你的生活节奏，居家学习的日子里，你有了更多思考的时间。'
                }
            ],
            choices: [
                { text: '认真上网课', effects: { intelligence: 2, constitution: -1 }, setFlags: { 'online_studious': true } },
                { text: '趁机放松', effects: { charisma: 1, intelligence: -1 }, setFlags: { 'relaxed_teen': true } },
                { text: '帮助家人', effects: { morality: 2, charisma: 1 }, setFlags: { 'family_carer': true } }
            ]
        },
        {
            id: 'covid_normal_2021',
            title: '疫情常态化',
            year: 2021,
            description: '2021年，疫情进入常态化防控阶段。疫苗开始普及，但生活仍未完全恢复正常。你逐渐适应了这种新常态。',
            tags: {
                era: ['2021', '疫情常态化', '疫苗'],
                stage: ['teen'],
                type: ['era', 'continuation'],
                chain: 'covid19'
            },
            conditions: {
                age: { min: 14, max: 19 },
                year: 2021,
                probability: 0.9,
                flags: ['experienced_covid']
            },
            consequences: {
                flags: { 'covid_adapted': true },
                healthChanges: 2
            },
            choices: [
                { text: '积极防疫', effects: { constitution: 1 }, setFlags: { 'health_conscious': true } },
                { text: '恢复正常社交', effects: { charisma: 2 }, setFlags: { 'social_recovery': true } },
                { text: '专注学习', effects: { intelligence: 1 }, setFlags: { 'focused_student': true } }
            ]
        },
        {
            id: 'gaokao_2024',
            title: '高考',
            year: 2024,
            description: '2024年，你参加了高考！这是人生中最重要的考试之一。十几年的寒窗苦读，将在这一刻得到检验。',
            tags: {
                era: ['2024', '高考'],
                stage: ['teen'],
                type: ['fated', 'milestone', 'career'],
                chain: 'education',
                chainStage: 3
            },
            conditions: {
                age: { min: 17, max: 19 },
                year: 2024,
                probability: 1.0,
                flags: ['middle_school']
            },
            consequences: {
                flags: { 'took_gaokao': true, 'education_phase_1': true },
                attributeChanges: {},
                probabilityModifiers: { 'future_career': 1.5 }
            },
            branches: [
                {
                    condition: { attributes: { intelligence: 8 } },
                    description: '你超常发挥，考出了优异成绩！'
                },
                {
                    condition: { attributes: { intelligence: 6, luck: 7 } },
                    description: '你正常发挥，成绩在意料之中。'
                },
                {
                    condition: { attributes: { intelligence: { max: 4 } } },
                    description: '成绩不理想，你面临着人生的重要抉择。'
                },
                {
                    condition: { flags: ['gaokao_prep'] },
                    description: '多年苦读的你，终于迎来了这一天。'
                }
            ],
            choices: [
                { 
                    text: '填报顶尖名校', 
                    requiredAttrs: { intelligence: 7 },
                    effects: { intelligence: 1, luck: -1 }, 
                    setFlags: { 'top_university': true },
                    nextEvent: 'university_2024',
                    probability: 0.15
                },
                { 
                    text: '选择适合自己的学校', 
                    effects: { intelligence: 1, charisma: 1 }, 
                    setFlags: { 'good_university': true },
                    nextEvent: 'university_2024'
                },
                { 
                    text: '考虑复读', 
                    effects: { intelligence: 1, money: -5000 }, 
                    setFlags: { 'retake_gaokao': true },
                    probability: 0.1
                },
                { 
                    text: '直接工作', 
                    effects: { charisma: 1, intelligence: -1 }, 
                    setFlags: { 'enter_workforce': true },
                    nextEvent: 'first_job_2024'
                }
            ]
        },
        {
            id: 'ai_boom_2023',
            title: 'AI革命来临',
            year: 2023,
            description: '2023年，ChatGPT引爆全球AI热潮。人工智能不再是科幻，而是开始进入日常生活。你如何看待这场技术革命？',
            tags: {
                era: ['2023', 'AI革命', 'ChatGPT'],
                stage: ['teen'],
                type: ['era', 'influence', 'opportunity']
            },
            conditions: {
                age: { min: 15, max: 20 },
                year: 2023,
                probability: 0.8
            },
            consequences: {
                flags: { 'experienced_ai_boom': true },
                unlocks: ['ai_career_2025'],
                probabilityModifiers: { 'tech_opportunity': 1.5 }
            },
            branches: [
                {
                    condition: { attributes: { intelligence: 7 } },
                    description: '你敏锐地意识到AI是未来的趋势，开始学习相关知识。'
                },
                {
                    condition: {},
                    description: '你见证了这场技术变革，但对AI的看法各有不同。'
                }
            ],
            choices: [
                { text: '学习AI技术', effects: { intelligence: 2 }, setFlags: { 'ai_learner': true }, nextEvent: 'ai_career_2027' },
                { text: '保持观望', effects: { luck: 1 } },
                { text: '担忧AI影响', effects: { morality: 1 } }
            ]
        }
    ],

    /**
     * 青年期 (19-35岁，2025-2041)
     */
    young: [
        {
            id: 'university_2024',
            title: '大学入学',
            year: 2024,
            description: '你收到了大学录取通知书！2024年，你正式成为一名大学生。新的环境、新的同学、新的人生阶段即将开启。',
            tags: {
                era: ['2024', '大学'],
                stage: ['young'],
                type: ['fated', 'milestone'],
                chain: 'education',
                chainStage: 4
            },
            conditions: {
                age: { min: 18, max: 20 },
                year: [2024, 2025],
                probability: 1.0,
                flags: ['took_gaokao', 'top_university', 'good_university']
            },
            consequences: {
                flags: { 'university': true, 'higher_education': true },
                attributeChanges: { intelligence: 1, charisma: 1 },
                unlocks: ['university_life', 'first_love']
            },
            choices: [
                { text: '专注学业', effects: { intelligence: 2 }, setFlags: { 'academic_focus': true }, nextEvent: 'grad_school' },
                { text: '拓展社交', effects: { charisma: 2 }, setFlags: { 'social_butterfly': true }, nextEvent: 'campus_romance' },
                { text: '创业尝试', effects: { luck: 1, intelligence: 1, money: -10000 }, setFlags: { 'entrepreneur': true }, nextEvent: 'startup' }
            ]
        },
        {
            id: 'graduation_2028',
            title: '大学毕业',
            year: 2028,
            description: '2028年，你大学毕业了！四年的大学生活即将结束，你需要做出人生中重要的选择：继续深造还是步入社会？',
            tags: {
                era: ['2028', '毕业季'],
                stage: ['young'],
                type: ['fated', 'milestone', 'career'],
                chain: 'education',
                chainStage: 5
            },
            conditions: {
                age: { min: 22, max: 24 },
                year: [2027, 2028, 2029],
                probability: 1.0,
                flags: ['university']
            },
            consequences: {
                flags: { 'graduated': true, 'education_complete': true },
                attributeChanges: { intelligence: 1 },
                unlocks: ['career_start', 'marriage']
            },
            choices: [
                { text: '考研深造', effects: { intelligence: 2, money: -20000 }, setFlags: { 'grad_school': true }, nextEvent: 'phd_or_not' },
                { text: '直接就业', effects: { charisma: 1 }, setFlags: { 'enter_workforce': true }, nextEvent: 'first_job_2028' },
                { text: '创业', effects: { luck: 1, intelligence: 1, money: -50000 }, setFlags: { 'startup': true }, nextEvent: 'startup_journey' },
                { text: '出国发展', effects: { money: -100000, intelligence: 1 }, setFlags: { 'overseas': true }, nextEvent: 'overseas_life' }
            ]
        },
        {
            id: 'first_job_2028',
            title: '第一份工作',
            year: 2028,
            description: '2028年，你找到了第一份工作。初入职场，有期待也有迷茫。你将开始自己的职业发展之路。',
            tags: {
                era: ['2028', '职场'],
                stage: ['young'],
                type: ['fated', 'milestone', 'career'],
                chain: 'career'
            },
            conditions: {
                age: { min: 22, max: 26 },
                year: [2027, 2028, 2029],
                probability: 1.0,
                flags: ['enter_workforce', 'graduated']
            },
            consequences: {
                flags: { 'employed': true, 'career_start': true },
                attributeChanges: { intelligence: 1 },
                moneyChanges: 5000
            },
            branches: [
                {
                    condition: { attributes: { intelligence: 7 } },
                    description: '你进入了一家知名企业，起薪不错。'
                },
                {
                    condition: {},
                    description: '你找到了一份普通的工作，虽然起点不高，但这是职业生涯的开始。'
                }
            ],
            choices: [
                { text: '努力晋升', effects: { intelligence: 2, constitution: -1 }, setFlags: { 'career_ambitious': true }, nextEvent: 'career_advancement' },
                { text: '保持稳定', effects: { charisma: 1, constitution: 1 }, setFlags: { 'work_life_balance': true } },
                { text: '准备跳槽', effects: { luck: 1, intelligence: 1 }, setFlags: { 'job_hopper': true }, nextEvent: 'job_hop' }
            ]
        },
        {
            id: 'marriage_2030',
            title: '婚姻大事',
            year: 2030,
            description: '2030年，你遇到了生命中的另一半。恋爱、相处、最终走向婚姻的殿堂。你准备好了吗？',
            tags: {
                era: ['2030', '婚姻'],
                stage: ['young', 'middle'],
                type: ['fated', 'milestone', 'family'],
                chain: 'family'
            },
            conditions: {
                age: { min: 25, max: 35 },
                year: [2029, 2030, 2031, 2032],
                probability: 0.6,
                flags: ['graduated']
            },
            consequences: {
                flags: { 'married': true },
                attributeChanges: { charisma: 1, morality: 1 },
                familyChanges: { married: true },
                unlocks: ['children', 'midlife_crisis']
            },
            branches: [
                {
                    condition: { attributes: { charisma: 7 } },
                    description: '你遇到了理想的伴侣，婚礼浪漫而温馨。'
                },
                {
                    condition: {},
                    description: '你和对象经过多年恋爱，终于修成正果。'
                }
            ],
            choices: [
                { text: '盛大的婚礼', effects: { charisma: 1, money: -100000 }, setFlags: { 'grand_wedding': true } },
                { text: '简单的婚礼', effects: { morality: 1, money: -20000 }, setFlags: { 'simple_wedding': true } },
                { text: '先同居不急结婚', effects: { luck: 1 }, setFlags: { 'cohabitation': true } }
            ]
        },
        {
            id: 'first_child_2032',
            title: '第一个孩子',
            year: 2032,
            description: '2032年，你升级当父母了！新生命的诞生给家庭带来了无限欢乐，也带来了责任和压力。',
            tags: {
                era: ['2032', '育儿'],
                stage: ['young', 'middle'],
                type: ['fated', 'milestone', 'family'],
                chain: 'family'
            },
            conditions: {
                age: { min: 25, max: 40 },
                year: [2031, 2032, 2033, 2034],
                probability: 0.7,
                flags: ['married']
            },
            consequences: {
                flags: { 'has_child': true },
                attributeChanges: { morality: 1, constitution: -1 },
                familyChanges: { children: 1 },
                healthChanges: -5
            },
            choices: [
                { text: '全职带孩子', effects: { charisma: 1, money: -50000 }, setFlags: { 'full_time_parent': true } },
                { text: '请保姆帮忙', effects: { money: -100000 }, setFlags: { 'nanny': true } },
                { text: '让父母帮忙', effects: { morality: 1, constitution: 1 }, setFlags: { 'grandparent_help': true } }
            ]
        },
        {
            id: 'house_purchase_2030',
            title: '买房安家',
            year: 2030,
            description: '在中国，买房是人生大事。2028年，你决定安定下来，买一套属于自己的房子。',
            tags: {
                era: ['2030', '房产'],
                stage: ['young'],
                type: ['milestone', 'wealth'],
                chain: 'wealth'
            },
            conditions: {
                age: { min: 25, max: 35 },
                year: [2029, 2030, 2031],
                probability: 0.7,
                flags: ['married', 'employed']
            },
            consequences: {
                flags: { 'homeowner': true },
                moneyChanges: -500000,
                attributeChanges: {}
            },
            branches: [
                {
                    condition: { money: 800000 },
                    description: '你全款买下了房子，无需背负贷款压力。'
                },
                {
                    condition: {},
                    description: '你贷款买了房，每个月要还房贷。'
                }
            ],
            choices: [
                { text: '贷款买房', effects: { money: -500000, charisma: 1 }, setFlags: { 'mortgage': true }, debt: 500000 },
                { text: '租房观望', effects: { money: -50000, luck: 1 }, setFlags: { 'renting': true } },
                { text: '回老家发展', effects: { money: -100000, intelligence: -1 }, setFlags: { 'return_hometown': true } }
            ]
        }
    ],

    /**
     * 中年期 (36-55岁，2042-2061)
     */
    middle: [
        {
            id: 'midlife_2045',
            title: '中年危机',
            year: 2045,
            description: '2045年，你40多岁了。工作了二十多年，你开始思考人生的意义。是继续拼搏还是享受生活？',
            tags: {
                era: ['2045', '中年危机'],
                stage: ['middle'],
                type: ['fated', 'milestone', 'reflection']
            },
            conditions: {
                age: { min: 40, max: 45 },
                year: [2044, 2045, 2046, 2047],
                probability: 0.6,
                flags: ['employed']
            },
            consequences: {
                flags: { 'midlife_reflection': true },
                attributeChanges: {},
                healthChanges: -5
            },
            choices: [
                { text: '重新创业', effects: { luck: 1, money: -200000 }, setFlags: { 'second_venture': true } },
                { text: '专注家庭', effects: { charisma: 1, morality: 1 }, setFlags: { 'family_focus': true } },
                { text: '继续奋斗', effects: { intelligence: 1, constitution: -1 }, setFlags: { 'career_continued': true } },
                { text: '追求健康', effects: { constitution: 2, intelligence: -1 }, setFlags: { 'health_focus': true } }
            ]
        },
        {
            id: 'career_peak_2050',
            title: '事业巅峰',
            year: 2050,
            description: '2050年，你来到了事业的巅峰。经过二十多年的努力，你终于达到了职业生涯的最高点。',
            tags: {
                era: ['2050', '事业巅峰'],
                stage: ['middle'],
                type: ['milestone', 'career', 'achievement']
            },
            conditions: {
                age: { min: 45, max: 55 },
                year: [2048, 2050, 2052],
                probability: 0.3,
                flags: ['career_ambitious', 'employed']
            },
            consequences: {
                flags: { 'career_peak': true },
                moneyChanges: 500000,
                attributeChanges: { charisma: 1 }
            },
            choices: [
                { text: '继续扩张', effects: { intelligence: 1, constitution: -2 }, setFlags: { 'expansion': true } },
                { text: '急流勇退', effects: { constitution: 2, intelligence: -1 }, setFlags: { 'retire_early': true } },
                { text: '培养新人', effects: { morality: 2, charisma: 1 }, setFlags: { 'mentor': true } }
            ]
        },
        {
            id: 'children_grow_2055',
            title: '子女成长',
            year: 2055,
            description: '2055年，你的孩子已经长大成人。他们开始面临自己的人生选择，就像当年的你一样。',
            tags: {
                era: ['2055', '代际'],
                stage: ['middle', 'elder'],
                type: ['family', 'reflection']
            },
            conditions: {
                age: { min: 50, max: 60 },
                year: [2054, 2055, 2056],
                probability: 0.8,
                flags: ['has_child']
            },
            consequences: {
                flags: { 'children_adult': true },
                attributeChanges: { morality: 1 }
            },
            choices: [
                { text: '尊重他们的选择', effects: { charisma: 1, morality: 1 }, setFlags: { 'supportive_parent': true } },
                { text: '给出建议', effects: { intelligence: 1 }, setFlags: { 'advisor_parent': true } },
                { text: '包办一切', effects: { charisma: -1, money: -200000 }, setFlags: { 'helicopter_parent': true } }
            ]
        }
    ],

    /**
     * 老年期 (56-100岁，2062-2106)
     */
    elder: [
        {
            id: 'retirement_2060',
            title: '退休生活',
            year: 2060,
            description: '2060年，你退休了！工作了大半辈子，是时候享受生活了。你可以旅行、学习新技能、含饴弄孙。',
            tags: {
                era: ['2060', '退休'],
                stage: ['elder'],
                type: ['fated', 'milestone', 'lifestyle']
            },
            conditions: {
                age: { min: 55, max: 65 },
                year: [2058, 2060, 2062],
                probability: 1.0,
                flags: ['employed']
            },
            consequences: {
                flags: { 'retired': true },
                attributeChanges: { constitution: 1 },
                healthChanges: 5
            },
            choices: [
                { text: '周游世界', effects: { luck: 2, money: -300000 }, setFlags: { 'world_traveler': true } },
                { text: '含饴弄孙', effects: { charisma: 1, constitution: 1 }, setFlags: { 'grandparenting': true } },
                { text: '学习新技能', effects: { intelligence: 2 }, setFlags: { 'lifelong_learner': true } },
                { text: '发挥余热', effects: { morality: 2, intelligence: 1 }, setFlags: { 'volunteer': true } }
            ]
        },
        {
            id: 'health_issues_2070',
            title: '健康衰退',
            year: 2070,
            description: '2070年，你明显感到身体不如从前。各种老年病开始找上门来，你需要更加注意保养。',
            tags: {
                era: ['2070', '老年健康'],
                stage: ['elder'],
                type: ['negative', 'inevitable']
            },
            conditions: {
                age: { min: 65, max: 80 },
                year: [2068, 2070, 2072],
                probability: 0.7
            },
            consequences: {
                flags: { 'health_decline': true },
                healthChanges: -15,
                attributeChanges: { constitution: -1 }
            },
            choices: [
                { text: '积极治疗', effects: { money: -100000, constitution: 1 }, setFlags: { 'proactive_treatment': true } },
                { text: '顺其自然', effects: { morality: 1, constitution: -1 }, setFlags: { 'accepting': true } },
                { text: '锻炼养生', effects: { constitution: 1, money: -30000 }, setFlags: { 'fitness_routine': true } }
            ]
        },
        {
            id: 'life_review_2080',
            title: '人生总结',
            year: 2080,
            description: '2080年，你已经走过了人生的大部分旅程。回首往事，你感慨万千。你的人生会是怎样的结局？',
            tags: {
                era: ['2080', '人生总结'],
                stage: ['elder'],
                type: ['reflection', 'ending']
            },
            conditions: {
                age: { min: 75, max: 90 },
                year: [2078, 2080, 2082],
                probability: 0.9
            },
            consequences: {
                flags: { 'life_review': true }
            },
            choices: [
                { text: '此生无憾', effects: { luck: 1 }, setFlags: { 'no_regrets': true } },
                { text: '如果能重来', effects: { intelligence: 1 }, setFlags: { 'regretful': true } },
                { text: '珍惜当下', effects: { morality: 1, charisma: 1 }, setFlags: { 'present_minded': true } }
            ]
        },
        {
            id: 'final_moments_2090',
            title: '生命的终点',
            year: 2090,
            description: '你的生命即将走到尽头。回顾这一生，你经历了无数风雨，也收获了许多美好。',
            tags: {
                era: ['2090', '终点'],
                stage: ['elder'],
                type: ['ending', 'fated']
            },
            conditions: {
                age: { min: 80, max: 100 },
                probability: 1.0
            },
            consequences: {
                flags: { 'life_ended': true },
                healthChanges: -100
            },
            choices: [
                { text: '安详离世', effects: { morality: 1 }, setFlags: { 'peaceful_death': true } },
                { text: '与家人告别', effects: { charisma: 1 }, setFlags: { 'family_farewell': true } },
                { text: '留下遗言', effects: { intelligence: 1 }, setFlags: { 'last_words': true } }
            ]
        }
    ]
};

/**
 * 随机事件库
 * 根据运气属性和年龄触发
 */
const RANDOM_EVENTS = {
    positive: [
        {
            id: 'lottery_win',
            title: '彩票中奖',
            description: '你买的彩票居然中奖了！',
            baseProbability: 0.0001,
            luckMultiplier: 5,
            effects: { luck: 1, money: 1000000 },
            healthChange: 0
        },
        {
            id: 'inheritance',
            title: '意外继承',
            description: '远房亲戚去世，你意外继承了一笔遗产。',
            baseProbability: 0.0005,
            luckMultiplier: 3,
            effects: { luck: 1, money: 500000 },
            healthChange: 0
        },
        {
            id: 'promotion',
            title: '意外晋升',
            description: '公司人事变动，你意外获得了晋升机会。',
            baseProbability: 0.02,
            luckMultiplier: 2,
            effects: { intelligence: 1, money: 50000 },
            ageRange: [25, 50]
        },
        {
            id: '贵人相助',
            title: '遇到贵人',
            description: '在人生关键节点，有人帮助了你。',
            baseProbability: 0.03,
            charismaMultiplier: 2,
            effects: { charisma: 1, luck: 1 },
            ageRange: [20, 40]
        },
        {
            id: 'healthy_lifestyle',
            title: '养成健康习惯',
            description: '你开始坚持锻炼，身体越来越好。',
            baseProbability: 0.05,
            constitutionMultiplier: 2,
            effects: { constitution: 2 },
            ageRange: [30, 60]
        },
        {
            id: 'investment_success',
            title: '投资成功',
            description: '你的投资获得了丰厚回报！',
            baseProbability: 0.03,
            intelligenceMultiplier: 2,
            effects: { intelligence: 1, money: 100000 },
            ageRange: [25, 55]
        }
    ],
    negative: [
        {
            id: 'illness',
            title: '生病住院',
            description: '你生了一场大病，需要住院治疗。',
            baseProbability: 0.1,
            constitutionMultiplier: -3,
            effects: { constitution: -2 },
            healthChange: -15,
            ageRange: [0, 100]
        },
        {
            id: 'accident',
            title: '意外受伤',
            description: '发生了意外，你受伤了。',
            baseProbability: 0.05,
            luckMultiplier: -3,
            effects: { constitution: -1, luck: -1 },
            healthChange: -10,
            ageRange: [10, 70]
        },
        {
            id: 'fraud',
            title: '遭遇诈骗',
            description: '你被人骗了，钱财损失惨重。',
            baseProbability: 0.02,
            intelligenceMultiplier: -2,
            effects: { intelligence: -1, money: -50000 },
            ageRange: [20, 60]
        },
        {
            id: 'job_loss',
            title: '失业',
            description: '公司裁员，你失业了。',
            baseProbability: 0.05,
            luckMultiplier: -2,
            effects: { luck: -1, money: -30000 },
            ageRange: [25, 55]
        },
        {
            id: 'relationship_break',
            title: '感情破裂',
            description: '与重要的人关系出现了裂痕。',
            baseProbability: 0.03,
            charismaMultiplier: -2,
            effects: { charisma: -1, morality: -1 },
            ageRange: [18, 50]
        },
        {
            id: 'family_tragedy',
            title: '家庭变故',
            description: '家庭发生了重大变故。',
            baseProbability: 0.02,
            effects: { morality: -1, charisma: -1 },
            healthChange: -10,
            ageRange: [20, 70]
        }
    ],
    neutral: [
        {
            id: 'travel',
            title: '旅行',
            description: '你去旅行，增长了见识。',
            baseProbability: 0.05,
            effects: { intelligence: 1, charisma: 1, money: -10000 },
            ageRange: [18, 65]
        },
        {
            id: 'new_skill',
            title: '学会新技能',
            description: '你学会了一项新技能。',
            baseProbability: 0.08,
            intelligenceMultiplier: 2,
            effects: { intelligence: 1 },
            ageRange: [15, 80]
        },
        {
            id: 'good_deed',
            title: '做了一件好事',
            description: '你做了一件好事，感到很满足。',
            baseProbability: 0.06,
            moralityMultiplier: 2,
            effects: { morality: 2 },
            ageRange: [10, 90]
        },
        {
            id: 'stranger_encounter',
            title: '与陌生人交流',
            description: '你和陌生人有了特别的交流。',
            baseProbability: 0.04,
            charismaMultiplier: 1.5,
            effects: { charisma: 1 },
            ageRange: [15, 60]
        }
    ]
};

/**
 * 获取所有时间轴事件的函数
 */
function getTimelineEventsByAge(age) {
    const stage = Utils.getLifeStage(age).id;
    return TIMELINE_EVENTS[stage] || [];
}

function getTimelineEventsByYear(year) {
    const baseYear = 2006;
    const age = year - baseYear;
    return getTimelineEventsByAge(age).filter(e => e.year === year || e.conditions?.year?.includes(year));
}

/**
 * 根据条件筛选事件
 */
function filterEventsByConditions(events, player, additionalModifiers = {}) {
    return events.filter(event => {
        const c = event.conditions || {};
        
        if (c.age) {
            if (c.age.min !== undefined && player.age < c.age.min) return false;
            if (c.age.max !== undefined && player.age > c.age.max) return false;
        }
        
        if (c.year) {
            if (Array.isArray(c.year)) {
                if (!c.year.includes(player.year)) return false;
            } else if (c.year !== player.year) {
                return false;
            }
        }
        
        if (c.flags && c.flags.length > 0) {
            const hasAllFlags = c.flags.every(f => player.hasFlag(f));
            if (!hasAllFlags) return false;
        }
        
        if (c.attributes) {
            for (const attr in c.attributes) {
                const required = c.attributes[attr];
                if (typeof required === 'number') {
                    if (player.attributes[attr] < required) return false;
                }
            }
        }
        
        let probability = c.probability || 1.0;
        probability *= additionalModifiers[event.id] || 1;
        
        if (Math.random() > probability) return false;
        
        return true;
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TIMELINE_EVENTS, RANDOM_EVENTS, getTimelineEventsByAge, getTimelineEventsByYear, filterEventsByConditions };
}
