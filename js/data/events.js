/**
 * 游戏事件数据 - 扩展版
 * 包含所有随机事件、职业事件、特殊事件等
 * 事件按人生阶段和类型分类，总计100+事件
 * 
 * 事件结构说明：
 * - id: 唯一标识符
 * - title: 事件标题
 * - description: 事件描述（支持{person}等变量）
 * - choices: 选项数组
 *   - text: 选项文本
 *   - effects: 属性变化 {属性名: 变化值}
 *   - cost: 金钱变化（负数表示支出）
 *   - probability: 触发概率（可选，默认1）
 *   - requiredBackground: 需要的背景（可选）
 *   - weight: 事件权重（影响随机选择）
 */

const EVENTS = {
    /**
     * 婴儿期事件 (0-3岁)
     * 关键词：成长、健康、家庭温暖
     */
    baby: [
        {
            id: 'baby_1',
            title: '降生的世界',
            description: '伴随着清脆的哭声，你来到了这个世界。你的父母欣喜若狂，这是他们期盼已久的礼物。产房外，爷爷奶奶、外公外婆都赶来迎接这个新生命。',
            choices: [
                { text: '大声啼哭', effects: { constitution: 1 } }
            ]
        },
        {
            id: 'baby_2',
            title: '母乳的温暖',
            description: '母亲坚持用母乳喂养你。科学研究表明，母乳喂养的孩子往往更加健康、免疫力更强。',
            choices: [
                { text: '健康成长', effects: { constitution: 1 } }
            ]
        },
        {
            id: 'baby_3',
            title: '人生第一步',
            description: '一岁半的你开始尝试走路。在父母的鼓励下，你摇摇晃晃地迈出了人生的第一步。这是一个里程碑式的时刻。',
            choices: [
                { text: '勇敢前行', effects: { constitution: 1, luck: 1 } }
            ]
        },
        {
            id: 'baby_4',
            title: '第一次发烧',
            description: '幼儿时期的你发了一场高烧，父母彻夜未眠地照顾你。凌晨的医院急诊室，留下了他们疲惫却关切的身影。',
            choices: [
                { text: '坚强面对', effects: { constitution: -1, luck: 1 } }
            ]
        },
        {
            id: 'baby_5',
            title: '亲子互动',
            description: '每天晚上，父母都会给你讲故事、唱儿歌。这些温馨的时刻，在你心里种下了爱与安全的种子。',
            choices: [
                { text: '幸福成长', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'baby_6',
            title: '第一次微笑',
            description: '三个月大的你，第一次对妈妈露出了微笑。那纯真的笑容，让所有辛苦都变得值得。',
            choices: [
                { text: '快乐天使', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'baby_7',
            title: '添加辅食',
            description: '半岁了，该添加辅食了。妈妈精心准备了各种营养均衡的食物，希望你能健康成长。',
            choices: [
                { text: '胃口大开', effects: { constitution: 1 } }
            ]
        },
        {
            id: 'baby_8',
            title: '婴儿SPA',
            description: '父母带你去婴儿游泳馆，你在水里欢快地扑腾着。游泳不仅锻炼身体，还能促进智力发育。',
            choices: [
                { text: '爱上运动', effects: { constitution: 1 } }
            ]
        },
        {
            id: 'baby_9',
            title: '早教启蒙',
            description: '父母给你报了早教班，希望你能赢在起跑线上。色彩斑斓的玩具和老师的耐心引导，让你的世界更加丰富多彩。',
            choices: [
                { text: '努力学习', effects: { intelligence: 1 }, cost: 500 },
                { text: '尽情玩耍', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'baby_10',
            title: '第一个玩具',
            description: '父母给你买了第一个玩具——一个会唱歌的布娃娃。你爱不释手，每天抱着它入睡。',
            choices: [
                { text: '童年美好', effects: { luck: 1 } }
            ]
        },
        {
            id: 'baby_11',
            title: '周岁抓周',
            description: '按照传统习俗，你周岁那天进行了抓周仪式。你一把抓住了书本，展现出对知识的渴望。',
            choices: [
                { text: '知识之星', effects: { intelligence: 1 } }
            ]
        },
        {
            id: 'baby_12',
            title: '家庭聚会',
            description: '节假日里，亲戚们都来做客。大家争着抱你、逗你，你成为了全家的焦点。',
            choices: [
                { text: '万人迷', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'baby_13',
            title: '第一次生病住院',
            description: '一场突如其来的肺炎，让你不得不住院治疗。消毒水的气味和白色的病房，成为你最初的记忆。',
            choices: [
                { text: '坚强对抗', effects: { constitution: -1, luck: 1 } }
            ]
        },
        {
            id: 'baby_14',
            title: '户外探索',
            description: '天气好的时候，父母会带你到公园晒太阳。你好奇地观察着周围的一切，花草树木都变得新奇。',
            choices: [
                { text: '好奇宝宝', effects: { intelligence: 1, constitution: 1 } }
            ]
        },
        {
            id: 'baby_15',
            title: '语言启蒙',
            description: '两岁的你开始学说话爸爸妈妈每天教你叫"爸爸"、"妈妈"。终于，你清晰地喊出了第一声。',
            choices: [
                { text: '语言天才', effects: { intelligence: 1 } }
            ]
        }
    ],

    /**
     * 童年期事件 (4-12岁)
     * 关键词：友谊、学习、兴趣爱好
     */
    child: [
        {
            id: 'child_1',
            title: '幼儿园第一天',
            description: '三岁的你第一次离开父母，进入幼儿园。你哭泣着不肯放手，但最终在老师的安抚下慢慢适应。',
            choices: [
                { text: '适应新环境', effects: { charisma: 1 }, probability: 0.7 },
                { text: '哭闹不止', effects: { constitution: -1 }, probability: 0.3 }
            ]
        },
        {
            id: 'child_2',
            title: '第一个朋友',
            description: '在幼儿园，你遇到了一个小朋友，你们成为了最好的朋友。每天一起玩耍、分享零食，童年因此变得五彩斑斓。',
            choices: [
                { text: '珍惜友谊', effects: { charisma: 1, luck: 1 } }
            ]
        },
        {
            id: 'child_3',
            title: '兴趣班选择',
            description: '父母想给你报一个兴趣班，看看你在哪方面有天赋。',
            choices: [
                { text: '钢琴课', effects: { intelligence: 1, charisma: 1 }, cost: 5000, probability: 0.4 },
                { text: '绘画班', effects: { intelligence: 1, luck: 1 }, cost: 3000, probability: 0.4 },
                { text: '跆拳道', effects: { constitution: 2 }, cost: 3000, probability: 0.5 },
                { text: '不需要', effects: { luck: -1 } }
            ]
        },
        {
            id: 'child_4',
            title: '小学入学',
            description: '六岁那年，你正式成为一名小学生。背上新书包的那一刻，你感受到了成长的重量。',
            choices: [
                { text: '品学兼优', effects: { intelligence: 1, charisma: 1 } }
            ]
        },
        {
            id: 'child_5',
            title: '班长选举',
            description: '班级里选举班长，你积极参与竞争。这是一个锻炼领导能力的好机会。',
            choices: [
                { text: '努力竞选', effects: { charisma: 2, intelligence: 1 }, probability: 0.5 },
                { text: '投票支持朋友', effects: { charisma: 1, luck: 1 }, probability: 0.6 },
                { text: '漠不关心', effects: { luck: -1 } }
            ]
        },
        {
            id: 'child_6',
            title: '奥数竞赛',
            description: '学校推荐你参加奥数竞赛，这是对智力的极大挑战。',
            choices: [
                { text: '认真准备', effects: { intelligence: 2 }, probability: 0.6 },
                { text: '应付了事', effects: { luck: -1 } }
            ]
        },
        {
            id: 'child_7',
            title: '校园欺凌',
            description: '班上的几个调皮同学总是欺负你。你不知道该如何应对，感到很困扰。',
            choices: [
                { text: '告诉老师', effects: { charisma: 1, luck: 1 }, probability: 0.6 },
                { text: '告诉家长', effects: { constitution: 1, luck: 1 }, probability: 0.7 },
                { text: '默默忍受', effects: { charisma: -1, constitution: -1 } },
                { text: '奋起反击', effects: { constitution: 1, charisma: -1 }, probability: 0.4 }
            ]
        },
        {
            id: 'child_8',
            title: '夏令营活动',
            description: '暑假里，学校组织夏令营。你将离开父母一周，体验独立生活。',
            choices: [
                { text: '积极参与', effects: { constitution: 1, charisma: 1, luck: 1 }, cost: 2000 },
                { text: '不想参加', effects: { luck: -1 } }
            ]
        },
        {
            id: 'child_9',
            title: '电子产品',
            description: '父母给你买了第一部智能手机。这让你兴奋不已，也打开了新世界的大门。',
            choices: [
                { text: '沉迷游戏', effects: { intelligence: -1, luck: -1 }, probability: 0.6 },
                { text: '合理使用', effects: { intelligence: 1, luck: 1 }, probability: 0.4 },
                { text: '交给父母保管', effects: { constitution: 1 } }
            ]
        },
        {
            id: 'child_10',
            title: '课外阅读',
            description: '你迷上了阅读课外书。书中的世界让你如痴如醉，知识面迅速扩展。',
            choices: [
                { text: '博览群书', effects: { intelligence: 2, charisma: 1 } }
            ]
        },
        {
            id: 'child_11',
            title: '运动会长跑',
            description: '学校运动会，你报名参加了长跑项目。',
            choices: [
                { text: '全力拼搏', effects: { constitution: 2, charisma: 1 }, probability: 0.6 },
                { text: '重在参与', effects: { constitution: 1 } }
            ]
        },
        {
            id: 'child_12',
            title: '压岁钱',
            description: '过年了，你收到了厚厚的压岁钱。如何使用这笔"巨款"，让你绞尽脑汁。',
            choices: [
                { text: '交给父母', effects: { luck: 1, charisma: 1 }, probability: 0.7 },
                { text: '自己存着', effects: { intelligence: 1 } },
                { text: '全部花掉', effects: { luck: -1 }, probability: 0.4 }
            ]
        },
        {
            id: 'child_13',
            title: '小升初考试',
            description: '六年级了，面临着小升初的压力。你需要参加选拔考试，进入好的初中。',
            choices: [
                { text: '努力学习', effects: { intelligence: 2 }, probability: 0.6 },
                { text: '参加培训班', effects: { intelligence: 1, luck: 1 }, cost: 10000, probability: 0.7 },
                { text: '顺其自然', effects: { luck: -1 } }
            ]
        },
        {
            id: 'child_14',
            title: '宠物伙伴',
            description: '你缠着父母买了一只小狗或小猫。毛茸茸的小家伙成为你最亲密的伙伴。',
            choices: [
                { text: '细心照顾', effects: { constitution: 1, charisma: 1, luck: 1 }, cost: 2000 },
                { text: '新鲜感过了', effects: { luck: -1 } }
            ]
        },
        {
            id: 'child_15',
            title: '才艺展示',
            description: '学校举办才艺展示活动，你有机会在舞台上展现自己的特长。',
            choices: [
                { text: '展示才艺', effects: { charisma: 2, intelligence: 1 }, probability: 0.6 },
                { text: '台下鼓掌', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'child_16',
            title: '家庭旅行',
            description: '父母带你出去旅行，看看外面的世界。壮丽的山河让你心旷神怡。',
            choices: [
                { text: '开阔眼界', effects: { intelligence: 1, luck: 1, constitution: 1 }, cost: 5000 }
            ]
        },
        {
            id: 'child_17',
            title: '作文比赛',
            description: '你的作文被老师推荐参加比赛。这是一个展示写作才华的机会。',
            choices: [
                { text: '认真准备', effects: { intelligence: 2, charisma: 1 }, probability: 0.6 },
                { text: '应付了事', effects: { luck: -1 } }
            ]
        },
        {
            id: 'child_18',
            title: '近视困扰',
            description: '由于用眼不当，你的视力开始下降，不得不戴上眼镜。',
            choices: [
                { text: '保护视力', effects: { constitution: -1, intelligence: 1 } }
            ]
        },
        {
            id: 'child_19',
            title: '课外兼职',
            description: '你开始帮父母做一些简单的家务活，赚取零花钱。',
            choices: [
                { text: '勤劳致富', effects: { intelligence: 1, constitution: 1 }, money: 500 }
            ]
        },
        {
            id: 'child_20',
            title: '友谊危机',
            description: '你最好的朋友转学了。失去挚友的痛苦让你很伤心。',
            choices: [
                { text: '努力挽留', effects: { charisma: 1, luck: 1 }, probability: 0.4 },
                { text: '接受现实', effects: { constitution: 1 } },
                { text: '交新朋友', effects: { charisma: 1 } }
            ]
        }
    ],

    /**
     * 少年期事件 (13-18岁)
     * 关键词：学业、叛逆、梦想、爱情萌芽
     */
    teen: [
        {
            id: 'teen_1',
            title: '初中入学',
            description: '你进入了青春期，面临着全新的环境和挑战。初中三年，将决定你的人生走向。',
            choices: [
                { text: '努力学习', effects: { intelligence: 1, charisma: 1 } },
                { text: '享受青春', effects: { charisma: 2, luck: 1 }, probability: 0.5 }
            ]
        },
        {
            id: 'teen_2',
            title: '情窦初开',
            description: '你暗恋班上的某个同学。这是青春期的萌动，单纯而美好。',
            choices: [
                { text: '勇敢表白', effects: { charisma: 2, luck: -1 }, probability: 0.3 },
                { text: '默默喜欢', effects: { charisma: 1, intelligence: -1 } },
                { text: '专注于学习', effects: { intelligence: 1, luck: 1 } }
            ]
        },
        {
            id: 'teen_3',
            title: '网吧上网',
            description: '同学们约你去网吧上网，这是许多青少年必经的"体验"。',
            choices: [
                { text: '欣然前往', effects: { intelligence: -1, charisma: 1, luck: -1 }, probability: 0.6 },
                { text: '拒绝诱惑', effects: { intelligence: 1, constitution: 1 }, probability: 0.4 }
            ]
        },
        {
            id: 'teen_4',
            title: '中考冲刺',
            description: '初三了，面临着人生第一次重大考试——中考。这是改变命运的关键一年。',
            choices: [
                { text: '废寝忘食', effects: { intelligence: 2, constitution: -1 }, probability: 0.7 },
                { text: '请家教', effects: { intelligence: 2, luck: 1 }, cost: 20000, probability: 0.7 },
                { text: '顺其自然', effects: { luck: -1 } }
            ]
        },
        {
            id: 'teen_5',
            title: '高中入学',
            description: '经过中考的洗礼，你进入了高中。这是一个全新的起点，也意味着更激烈的竞争。',
            choices: [
                { text: '重新开始', effects: { intelligence: 1, charisma: 1 } }
            ]
        },
        {
            id: 'teen_6',
            title: '社团活动',
            description: '高中社团丰富多彩，你有机会加入感兴趣的社团，展现才华。',
            choices: [
                { text: '加入学生会', effects: { charisma: 2, intelligence: 1 }, probability: 0.4 },
                { text: '加入兴趣社', effects: { charisma: 1, intelligence: 1 }, probability: 0.6 },
                { text: '专心学习', effects: { intelligence: 2, charisma: -1 } }
            ]
        },
        {
            id: 'teen_7',
            title: '初恋',
            description: '你开始了人生第一段恋爱。青春期的感情炽热而纯粹，却往往没有结果。',
            choices: [
                { text: '认真投入', effects: { charisma: 2, constitution: -1, intelligence: -1 }, probability: 0.5 },
                { text: '玩世不恭', effects: { charisma: 1, luck: -1 }, probability: 0.3 },
                { text: '保持距离', effects: { intelligence: 1, constitution: 1 } }
            ]
        },
        {
            id: 'teen_8',
            title: '与父母冲突',
            description: '进入青春期，你开始有了自己的想法。与父母之间的矛盾似乎越来越多。',
            choices: [
                { text: '沟通理解', effects: { charisma: 1, intelligence: 1 }, probability: 0.5 },
                { text: '坚持自我', effects: { constitution: 1, charisma: -1 }, probability: 0.5 },
                { text: '叛逆对抗', effects: { constitution: -1, luck: -1 } }
            ]
        },
        {
            id: 'teen_9',
            title: '学习方法',
            description: '你开始探索适合自己的学习方法。好的方法能让学习事半功倍。',
            choices: [
                { text: '题海战术', effects: { intelligence: 2, constitution: -1 } },
                { text: '理解记忆', effects: { intelligence: 2, constitution: 1 } },
                { text: '边玩边学', effects: { intelligence: 1, luck: 1 }, probability: 0.4 }
            ]
        },
        {
            id: 'teen_10',
            title: '校园运动会',
            description: '你是选择参加项目为班级争光，还是在场边做后勤？',
            choices: [
                { text: '参加比赛', effects: { constitution: 2, charisma: 1 }, probability: 0.6 },
                { text: '做志愿者', effects: { charisma: 1, luck: 1 } },
                { text: '观众加油', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'teen_11',
            title: '文理分科',
            description: '高中二年级，面临着人生第一次重大选择：文科还是理科？这将影响你的一生。',
            choices: [
                { text: '选择理科', effects: { intelligence: 1 }, probability: 0.5 },
                { text: '选择文科', effects: { charisma: 1, intelligence: 1 }, probability: 0.5 },
                { text: '随心选择', effects: { luck: 1 } }
            ]
        },
        {
            id: 'teen_12',
            title: '课外阅读',
            description: '你开始阅读一些有深度的书籍，思想的种子在心中萌芽。',
            choices: [
                { text: '哲学入门', effects: { intelligence: 2, charisma: 1 } },
                { text: '文学经典', effects: { charisma: 2, intelligence: 1 } },
                { text: '科幻小说', effects: { intelligence: 1, luck: 1 } }
            ]
        },
        {
            id: 'teen_13',
            title: '高考倒计时',
            description: '高三了，黑板上的倒计时时刻提醒着你。这是人生最关键的战役。',
            choices: [
                { text: '全力冲刺', effects: { intelligence: 2, constitution: -1 }, probability: 0.8 },
                { text: '劳逸结合', effects: { intelligence: 1, constitution: 1 }, probability: 0.6 },
                { text: '压力过大', effects: { constitution: -2, intelligence: -1 }, probability: 0.3 }
            ]
        },
        {
            id: 'teen_14',
            title: '高考',
            description: '经过十二年的寒窗苦读，你终于走进了高考考场。这是改变命运的时刻。',
            choices: [
                { text: '超常发挥', effects: { intelligence: 1, luck: 2 }, probability: 0.2 },
                { text: '正常发挥', effects: { intelligence: 1, luck: 1 }, probability: 0.6 },
                { text: '发挥失常', effects: { intelligence: -1, luck: -1 }, probability: 0.2 }
            ]
        },
        {
            id: 'teen_15',
            title: '等待录取',
            description: '高考结束，等待录取通知书的日子是最难熬的。你每天刷新着官网，心情忐忑。',
            choices: [
                { text: '耐心等待', effects: { constitution: 1 } },
                { text: '提前准备', effects: { intelligence: 1 } },
                { text: '放松玩耍', effects: { charisma: 1, luck: 1 } }
            ]
        },
        {
            id: 'teen_16',
            title: '大学录取',
            description: '你收到了梦寐以求的大学录取通知书！寒窗十二年，终于有了回报。',
            choices: [
                { text: '庆祝一番', effects: { charisma: 1, luck: 1 }, cost: 5000 },
                { text: '继续学习', effects: { intelligence: 1 } }
            ]
        },
        {
            id: 'teen_17',
            title: '毕业旅行',
            description: '高中毕业了，你和同学们一起组织毕业旅行。这是青春的告别仪式。',
            choices: [
                { text: '国内旅游', effects: { constitution: 1, charisma: 1, luck: 1 }, cost: 5000 },
                { text: '出境旅游', effects: { intelligence: 1, charisma: 1 }, cost: 20000, probability: 0.4 },
                { text: '打工赚经验', effects: { constitution: 1, luck: 1 }, money: 3000 }
            ]
        },
        {
            id: 'teen_18',
            title: '人生理想',
            description: '十八岁的你，开始认真思考人生的意义和理想。未来有无限可能。',
            choices: [
                { text: '成为成功人士', effects: { intelligence: 1, charisma: 1 } },
                { text: '追求幸福生活', effects: { constitution: 1, luck: 1 } },
                { text: '为理想奋斗', effects: { intelligence: 1, constitution: 1, luck: 1 } }
            ]
        },
        {
            id: 'teen_19',
            title: '割双眼皮',
            description: '你对自己的外貌开始在意，考虑通过整形改变自己。',
            choices: [
                { text: '勇敢尝试', effects: { charisma: 3, constitution: -1 }, cost: 20000, probability: 0.6 },
                { text: '自然最美', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'teen_20',
            title: '矫正牙齿',
            description: '你决定做牙齿矫正，虽然过程痛苦，但为了美观值得。',
            choices: [
                { text: '矫正牙齿', effects: { charisma: 2, constitution: -1 }, cost: 15000 },
                { text: '自然牙齿', effects: { constitution: 1 } }
            ]
        }
    ],

    /**
     * 青年期事件 (19-35岁)
     * 关键词：事业、爱情、婚姻、创业
     */
    young: [
        {
            id: 'young_1',
            title: '大学入学',
            description: '你怀着期待和忐忑的心情走进了大学校园。这里是半个社会，也是梦开始的地方。',
            choices: [
                { text: '努力学习', effects: { intelligence: 2 } },
                { text: '参加社团', effects: { charisma: 2 } },
                { text: '打工赚钱', effects: { constitution: 1, luck: 1 }, money: 5000 }
            ]
        },
        {
            id: 'young_2',
            title: '刻骨铭心的恋爱',
            description: '你在大学里遇到了生命中的那个TA。这段感情可能改变你的一生。',
            choices: [
                { text: '认真经营', effects: { charisma: 2, luck: 1 } },
                { text: '随心所欲', effects: { charisma: 1, luck: -1 }, probability: 0.5 },
                { text: '以事业为重', effects: { intelligence: 1, luck: 1 }, probability: 0.4 }
            ]
        },
        {
            id: 'young_3',
            title: '实习机会',
            description: '你获得了一家知名公司的实习机会。这是职场的第一步。',
            choices: [
                { text: '好好表现', effects: { intelligence: 1, charisma: 1, luck: 1 }, probability: 0.7 },
                { text: '敷衍了事', effects: { luck: -1 } }
            ]
        },
        {
            id: 'young_4',
            title: '毕业求职',
            description: '大学毕业后，你开始了求职之路。这是一个残酷的战场。',
            choices: [
                { text: '大公司', effects: { intelligence: 1, charisma: 1 }, probability: 0.4 },
                { text: '创业', effects: { luck: -1, charisma: 2 }, probability: 0.3 },
                { text: '稳定工作', effects: { constitution: 1, luck: 1 } },
                { text: '继续深造', effects: { intelligence: 2 }, cost: 50000, probability: 0.3 }
            ]
        },
        {
            id: 'young_5',
            title: '第一份工作',
            description: '你找到了人生中的第一份工作。职场之路正式开启。',
            choices: [
                { text: '努力奋斗', effects: { intelligence: 2, constitution: 1 } },
                { text: '得过且过', effects: { luck: -1 } }
            ]
        },
        {
            id: 'young_6',
            title: '职场竞争',
            description: '公司内部晋升机会，你和同事之间形成了竞争。',
            choices: [
                { text: '凭实力竞争', effects: { intelligence: 2, constitution: -1 }, probability: 0.6 },
                { text: '搞好人际关系', effects: { charisma: 2, intelligence: -1 }, probability: 0.5 },
                { text: '顺其自然', effects: { luck: 1 } }
            ]
        },
        {
            id: 'young_7',
            title: '职场PUA',
            description: '你遇到了一个糟糕的上司，每天被各种打压。你不知道该如何应对。',
            choices: [
                { text: '忍气吞声', effects: { constitution: -1, luck: 1 }, probability: 0.5 },
                { text: '果断辞职', effects: { constitution: 1, luck: -1 }, probability: 0.5 },
                { text: '收集证据维权', effects: { intelligence: 1, charisma: 1 }, probability: 0.4 }
            ]
        },
        {
            id: 'young_8',
            title: '副业发展',
            description: '你开始发展自己的副业，可能成为未来的另一条出路。',
            choices: [
                { text: '做自媒体', effects: { charisma: 2, luck: 1 }, probability: 0.5 },
                { text: '做家教', effects: { intelligence: 1, money: 10000 },
                { text: '开网店', effects: { intelligence: 1, luck: 1 }, probability: 0.4 }
            ]
        },
        {
            id: 'young_9',
            title: '买房',
            description: '你决定买房安定下来，这是人生中的大事。',
            choices: [
                { text: '贷款买房', effects: { luck: 1 }, cost: -500000 },
                { text: '租房观望', effects: { luck: -1 } },
                { text: '回老家建房', effects: { luck: 1 }, cost: -300000 }
            ]
        },
        {
            id: 'young_10',
            title: '结婚',
            description: '你遇到了对的人，决定携手共度余生。婚礼是人生重要的仪式。',
            choices: [
                { text: '豪华婚礼', effects: { charisma: 1, luck: 1 }, cost: -300000 },
                { text: '浪漫婚礼', effects: { charisma: 1 }, cost: -100000 },
                { text: '简单温馨', effects: { charisma: 1 }, cost: -30000 }
            ]
        },
        {
            id: 'young_11',
            title: '生子',
            description: '你们爱情的结晶诞生了！新生命的到来让家庭更加完整。',
            choices: [
                { text: '精心培养', effects: { constitution: -1, luck: 1 }, cost: -50000 },
                { text: '顺其自然', effects: { luck: -1 }, cost: -20000 }
            ]
        },
        {
            id: 'young_12',
            title: '投资理财',
            description: '你有了一些积蓄，考虑投资理财让钱生钱。',
            choices: [
                { text: '股票投资', effects: { luck: 2 }, money: 50000, probability: 0.2 },
                { text: '基金理财', effects: { luck: 1 }, money: 20000, probability: 0.6 },
                { text: '稳健理财', effects: { luck: 1 }, money: 10000 },
                { text: '银行存款', effects: { luck: 0 }, money: 3000 }
            ]
        },
        {
            id: 'young_13',
            title: '职业转型',
            description: '你对当前工作产生了倦怠感，考虑转型。',
            choices: [
                { text: '转行', effects: { intelligence: 1, luck: -1 }, probability: 0.5 },
                { text: '创业', effects: { luck: -1, charisma: 2, intelligence: 1 }, probability: 0.3 },
                { text: '继续坚持', effects: { constitution: 1 } }
            ]
        },
        {
            id: 'young_14',
            title: '遭遇裁员',
            description: '公司业绩下滑，你不幸遭遇裁员。失业的打击让人沮丧。',
            choices: [
                { text: '积极求职', effects: { intelligence: 1, charisma: 1 }, probability: 0.7 },
                { text: '创业自救', effects: { luck: -1, charisma: 1 }, probability: 0.3 },
                { text: '休息调整', effects: { constitution: 1, luck: -1 } }
            ]
        },
        {
            id: 'young_15',
            title: '成为管理者',
            description: '你凭借出色的能力被提升为管理者。这是一个重要的转折点。',
            choices: [
                { text: '勤勉管理', effects: { intelligence: 2, charisma: 1 } },
                { text: '以身作则', effects: { constitution: 2, charisma: 1 } }
            ]
        },
        {
            id: 'young_16',
            title: '获得专利',
            description: '你在工作中有了创新突破，申请了专利。',
            choices: [
                { text: '申请专利', effects: { intelligence: 2, charisma: 1 } },
                { text: '与公司分享', effects: { charisma: 1, money: 50000 } }
            ]
        },
        {
            id: 'young_17',
            title: '购置新车',
            description: '你决定买一辆车来改善出行条件。',
            choices: [
                { text: '豪华品牌', effects: { charisma: 2, luck: 1 }, cost: -500000 },
                { text: '经济实惠', effects: { constitution: 1 }, cost: -150000 },
                { text: '二手车', effects: { luck: -1 }, cost: -50000 }
            ]
        },
        {
            id: 'young_18',
            title: '带家人旅游',
            description: '你工作稳定了，决定带家人出国旅游。',
            choices: [
                { text: '欧洲游', effects: { constitution: 1, charisma: 1, luck: 1 }, cost: -100000 },
                { text: '亚洲游', effects: { constitution: 1, luck: 1 }, cost: -30000 },
                { text: '国内游', effects: { constitution: 1 }, cost: -10000 }
            ]
        },
        {
            id: 'young_19',
            title: '职称评定',
            description: '你参见了职称评定，这是职业发展的重要里程碑。',
            choices: [
                { text: '认真准备', effects: { intelligence: 2, charisma: 1 }, probability: 0.7 },
                { text: '顺其自然', effects: { luck: 1 } }
            ]
        },
        {
            id: 'young_20',
            title: '股票大涨',
            description: '你多年前买的股票突然大涨，获得了可观的收益。',
            choices: [
                { text: '及时止盈', effects: { luck: 1 }, money: 100000 },
                { text: '继续持有', effects: { luck: 1 }, money: 50000, probability: 0.6 },
                { text: '全部抛售', effects: { luck: 2 }, money: 200000, probability: 0.3 }
            ]
        },
        {
            id: 'young_21',
            title: '二宝降生',
            description: '你们决定再生一个孩子，家庭更加热闹了。',
            choices: [
                { text: '欢迎新生命', effects: { constitution: -1, charisma: 1, luck: 1 }, cost: -30000 },
                { text: '专心工作', effects: { intelligence: 1, luck: -1 } }
            ]
        },
        {
            id: 'young_22',
            title: '职场小人',
            description: '你遇到了职场小人，背后搞小动作陷害你。',
            choices: [
                { text: '正面刚', effects: { charisma: 1, luck: -1 }, probability: 0.4 },
                { text: '搜集证据', effects: { intelligence: 1, charisma: 1 }, probability: 0.6 },
                { text: '忍气吞声', effects: { constitution: -1, luck: 1 } }
            ]
        },
        {
            id: 'young_23',
            title: '获得表彰',
            description: '你因为出色的工作表现，获得了公司表彰。',
            choices: [
                { text: '再接再厉', effects: { intelligence: 1, charisma: 1, luck: 1 } },
                { text: '低调行事', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'young_24',
            title: '换大房子',
            description: '家庭成员增加了，你需要换一套更大的房子。',
            choices: [
                { text: '买大平层', effects: { charisma: 2, luck: 1 }, cost: -800000 },
                { text: '买别墅', effects: { charisma: 2, luck: 2 }, cost: -2000000, probability: 0.3 },
                { text: '继续凑合', effects: { constitution: -1, luck: -1 } }
            ]
        },
        {
            id: 'young_25',
            title: '35岁危机',
            description: '你到了职场的敏感年龄，面临着各种压力和挑战。',
            choices: [
                { text: '提升自己', effects: { intelligence: 2, constitution: 1 } },
                { text: '保持稳定', effects: { constitution: 1, luck: 1 } },
                { text: '另寻出路', effects: { luck: -1, charisma: 1 }, probability: 0.5 }
            ]
        },
        {
            id: 'young_career_path',
            title: '职业规划',
            description: '你需要进行职业规划，这将影响你的未来发展。',
            type: 'career',
            priority: 75,
            choices: [
                { text: '技术路线', effects: { intelligence: 2 } },
                { text: '管理路线', effects: { charisma: 2 } },
                { text: '创业路线', effects: { luck: -1, charisma: 1 }, probability: 0.4 }
            ]
        },
        {
            id: 'young_investment',
            title: '投资理财',
            description: '你有了些积蓄，考虑进行投资理财。',
            type: 'wealth',
            priority: 50,
            choices: [
                { text: '股票投资', effects: { luck: 2 }, probability: 0.3, money: 50000 },
                { text: '购买房产', effects: { constitution: 1 }, money: -200000 },
                { text: '存入银行', effects: { luck: 1 }, money: 10000 }
            ]
        },
        {
            id: 'young_milestone_marriage',
            title: '婚姻大事',
            description: '你遇到了生命中的另一半，考虑步入婚姻的殿堂。',
            type: 'milestone',
            priority: 100,
            choices: [
                { text: '盛大婚礼', effects: { charisma: 1, luck: 1 }, money: -100000, probability: 0.6 },
                { text: '简单婚礼', effects: { constitution: 1, luck: 1 }, money: -30000 },
                { text: '再等等', effects: { intelligence: 1 }, probability: 0.4 }
            ]
        },
        {
            id: 'young_milestone_child',
            title: '喜得贵子',
            description: '你的孩子出生了，生命的延续让你感到无比幸福。',
            type: 'milestone',
            priority: 100,
            choices: [
                { text: '全职带娃', effects: { constitution: -1, charisma: 1 } },
                { text: '请保姆', effects: { money: -50000 }, probability: 0.5 },
                { text: '父母帮忙', effects: { charisma: 1, luck: 1 } }
            ]
        }
    ],

    /**
     * 中年期事件 (36-55岁)
     * 关键词：稳定、危机、健康、家庭
     */
    middle: [
        {
            id: 'middle_1',
            title: '事业高峰期',
            description: '你的事业进入了高峰期，成为了公司或行业的佼佼者。',
            choices: [
                { text: '继续扩张', effects: { intelligence: 1, charisma: 1, luck: 1 } },
                { text: '稳健发展', effects: { constitution: 1, luck: 1 } }
            ]
        },
        {
            id: 'middle_2',
            title: '中年危机',
            description: '你突然感到迷茫，不知道人生的下半场该如何度过。',
            choices: [
                { text: '寻找新目标', effects: { intelligence: 1, constitution: 1, luck: 1 } },
                { text: '回归家庭', effects: { charisma: 1, constitution: 1 } },
                { text: '自我反思', effects: { intelligence: 2 } }
            ]
        },
        {
            id: 'middle_3',
            title: '父母生病',
            description: '你的父母年事已高，开始生病住院。你需要照顾他们。',
            choices: [
                { text: '亲自照顾', effects: { constitution: -1, charisma: 1 }, cost: -20000 },
                { text: '请护工', effects: { luck: 1 }, cost: -50000 },
                { text: '轮流照看', effects: { constitution: -1 } }
            ]
        },
        {
            id: 'middle_4',
            title: '孩子升学',
            description: '你的孩子面临着升学压力，你需要为他们的未来规划。',
            choices: [
                { text: '报辅导班', effects: { intelligence: 1, charisma: 1 }, cost: -50000 },
                { text: '买学区房', effects: { intelligence: 1, luck: 1 }, cost: -1000000, probability: 0.4 },
                { text: '顺其自然', effects: { luck: -1 } }
            ]
        },
        {
            id: 'middle_5',
            title: '身体报警',
            description: '你的身体开始出现各种小问题，需要开始注意健康了。',
            choices: [
                { text: '开始锻炼', effects: { constitution: 2, intelligence: 1 } },
                { text: '定期体检', effects: { constitution: 1, luck: 1 }, cost: 5000 },
                { text: '继续忽视', effects: { constitution: -2, luck: -1 } }
            ]
        },
        {
            id: 'middle_6',
            title: '投资失败',
            description: '你的一笔投资失败了，损失惨重。',
            choices: [
                { text: '及时止损', effects: { constitution: 1, luck: -1 }, money: -100000 },
                { text: '追加投资', effects: { luck: -2 }, money: -200000, probability: 0.3 },
                { text: '总结经验', effects: { intelligence: 1, constitution: 1 } }
            ]
        },
        {
            id: 'middle_7',
            title: '再买一套房',
            description: '你考虑再买一套房子，可能是投资也可能是为孩子准备。',
            choices: [
                { text: '投资房产', effects: { luck: 1 }, cost: -500000, probability: 0.6 },
                { text: '为孩子准备', effects: { charisma: 1, luck: 1 }, cost: -800000 },
                { text: '不买', effects: { luck: -1 } }
            ]
        },
        {
            id: 'middle_8',
            title: '婚姻危机',
            description: '你和配偶之间出现了矛盾，婚姻面临考验。',
            choices: [
                { text: '沟通解决', effects: { charisma: 1, constitution: 1 }, probability: 0.6 },
                { text: '冷战', effects: { constitution: -1, charisma: -1 } },
                { text: '寻求帮助', effects: { charisma: 1, luck: 1 }, cost: 10000 }
            ]
        },
        {
            id: 'middle_9',
            title: '孩子毕业',
            description: '你的孩子终于大学毕业了，你感到自豪和欣慰。',
            choices: [
                { text: '庆祝一番', effects: { charisma: 1, luck: 1 }, cost: 20000 },
                { text: '帮找工作', effects: { charisma: 1, luck: 1 }, cost: 10000 },
                { text: '让孩子自己闯', effects: { constitution: 1, luck: 1 } }
            ]
        },
        {
            id: 'middle_10',
            title: '职位晋升',
            description: '你获得了更高的职位，成为公司高层。',
            choices: [
                { text: '接受挑战', effects: { intelligence: 2, charisma: 2, constitution: -1 } },
                { text: '婉拒', effects: { constitution: 1, luck: 1 } }
            ]
        },
        {
            id: 'middle_11',
            title: '被挖角',
            description: '其他公司开出高薪来挖你，这是对你能力的认可。',
            choices: [
                { text: '跳槽', effects: { intelligence: 1, luck: 1 }, money: 100000 },
                { text: '留下', effects: { charisma: 1, luck: 1 }, money: 50000 },
                { text: '创业', effects: { luck: -1, charisma: 2, intelligence: 1 }, probability: 0.4 }
            ]
        },
        {
            id: 'middle_12',
            title: '更年期',
            description: '你和配偶都进入了更年期，情绪波动较大。',
            choices: [
                { text: '相互理解', effects: { constitution: 1, charisma: 1 } },
                { text: '各自调节', effects: { constitution: -1, luck: -1 } }
            ]
        },
        {
            id: 'middle_13',
            title: '孙辈出生',
            description: '你的孩子结婚生子，你升级当爷爷/奶奶/外公/外婆了！',
            choices: [
                { text: '帮忙带孙子', effects: { constitution: -1, charisma: 1, luck: 1 } },
                { text: '给红包', effects: { luck: 1 }, cost: 10000 },
                { text: '偶尔看看', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'middle_14',
            title: '慢性病',
            description: '你被诊断出了一些慢性病，需要长期调养。',
            choices: [
                { text: '积极治疗', effects: { constitution: 1, luck: 1 }, cost: 20000 },
                { text: '改变生活方式', effects: { constitution: 2 } },
                { text: '不以为意', effects: { constitution: -2, luck: -1 } }
            ]
        },
        {
            id: 'middle_15',
            title: '退休规划',
            description: '你开始考虑退休后的生活，需要提前规划。',
            choices: [
                { text: '继续工作', effects: { intelligence: 1, constitution: 1 } },
                { text: '提前退休', effects: { constitution: 1, luck: -1 }, probability: 0.5 },
                { text: '开始理财', effects: { intelligence: 1, luck: 1 } }
            ]
        },
        {
            id: 'middle_16',
            title: '社交圈子',
            description: '你的社交圈子发生了变化，老朋友渐行渐远。',
            choices: [
                { text: '维护老友', effects: { charisma: 1 } },
                { text: '拓展新友', effects: { charisma: 2, luck: 1 }, probability: 0.6 },
                { text: '享受独处', effects: { constitution: 1 } }
            ]
        },
        {
            id: 'middle_17',
            title: '兴趣培养',
            description: '你开始培养一些兴趣爱好，让生活更加充实。',
            choices: [
                { text: '学习乐器', effects: { intelligence: 1, charisma: 1 }, cost: 10000 },
                { text: '运动健身', effects: { constitution: 2 }, cost: 5000 },
                { text: '园艺钓鱼', effects: { constitution: 1, luck: 1 } }
            ]
        },
        {
            id: 'middle_18',
            title: '父母离世',
            description: '你最亲近的人离你而去，这是人生必经的别离。',
            choices: [
                { text: '坚强面对', effects: { constitution: -1, intelligence: 1 } },
                { text: '悲伤欲绝', effects: { constitution: -2, charisma: -1 } }
            ]
        },
        {
            id: 'middle_19',
            title: '孩子结婚',
            description: '你的孩子找到了人生的伴侣，组建了自己的家庭。',
            choices: [
                { text: '风风光光办', effects: { charisma: 2, luck: 1 }, cost: 200000 },
                { text: '简单温馨', effects: { charisma: 1 }, cost: 50000 }
            ]
        },
        {
            id: 'middle_20',
            title: '职场边缘化',
            description: '你逐渐被边缘化，失去了核心位置。',
            choices: [
                { text: '另寻出路', effects: { intelligence: 1, luck: -1 }, probability: 0.5 },
                { text: '做好本分', effects: { constitution: 1, charisma: 1 } },
                { text: '提前退休', effects: { constitution: 1, luck: -1 } }
            ]
        }
    ],

    /**
     * 老年期事件 (56-100岁)
     * 关键词：回忆、健康、传承、平静
     */
    elder: [
        {
            id: 'elder_1',
            title: '正式退休',
            description: '你正式退休了，离开了工作了大半辈子的岗位。',
            choices: [
                { text: '开启新生活', effects: { constitution: 1, luck: 1 } },
                { text: '发挥余热', effects: { intelligence: 1, charisma: 1 } }
            ]
        },
        {
            id: 'elder_2',
            title: '养宠物',
            description: '你养了一只宠物，让生活更加充实。',
            choices: [
                { text: '精心照顾', effects: { constitution: 1, luck: 1 }, cost: 5000 },
                { text: '简单喂养', effects: { constitution: 1 } }
            ]
        },
        {
            id: 'elder_3',
            title: '老年大学',
            description: '你去老年大学学习，圆年轻时的大学梦。',
            choices: [
                { text: '学习新知识', effects: { intelligence: 1, constitution: 1 }, cost: 3000 },
                { text: '结交朋友', effects: { charisma: 2, luck: 1 }, cost: 3000 }
            ]
        },
        {
            id: 'elder_4',
            title: '养生保健',
            description: '你开始注重养生保健，希望能延年益寿。',
            choices: [
                { text: '坚持运动', effects: { constitution: 2 }, cost: 5000 },
                { text: '食疗调理', effects: { constitution: 1, luck: 1 }, cost: 10000 },
                { text: '顺其自然', effects: { constitution: -1 } }
            ]
        },
        {
            id: 'elder_5',
            title: '回忆往昔',
            description: '你常常回忆过去，怀念那些峥嵘岁月。',
            choices: [
                { text: '写回忆录', effects: { intelligence: 1, charisma: 1 } },
                { text: '整理照片', effects: { constitution: 1, luck: 1 } },
                { text: '向后代讲述', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'elder_6',
            title: '旅游观光',
            description: '你终于有时间出去走走了，看看祖国的大好河山。',
            choices: [
                { text: '国内游', effects: { constitution: 1, luck: 1 }, cost: 20000 },
                { text: '出境游', effects: { constitution: 1, charisma: 1, luck: 1 }, cost: 50000 },
                { text: '周边走走', effects: { constitution: 1 } }
            ]
        },
        {
            id: 'elder_7',
            title: '带孙辈',
            description: '你在帮忙带孙子/孙女，享受天伦之乐。',
            choices: [
                { text: '细心照顾', effects: { constitution: -1, charisma: 2, luck: 1 } },
                { text: '偶尔帮忙', effects: { charisma: 1, constitution: 1 } }
            ]
        },
        {
            id: 'elder_8',
            title: '老伴身体',
            description: '你的老伴身体不如从前，需要你更多照顾。',
            choices: [
                { text: '精心照顾', effects: { constitution: -1, charisma: 1, luck: 1 } },
                { text: '请保姆', effects: { luck: 1 }, cost: 30000 },
                { text: '子女轮流', effects: { constitution: -1 } }
            ]
        },
        {
            id: 'elder_9',
            title: '突发疾病',
            description: '你突发了一场大病，差点危及生命。',
            choices: [
                { text: '积极治疗', effects: { constitution: 1, luck: 1 }, cost: 100000, probability: 0.6 },
                { text: '保守治疗', effects: { constitution: -1, luck: -1 }, cost: 30000 },
                { text: '放弃治疗', effects: { constitution: -2, luck: -2 } }
            ]
        },
        {
            id: 'elder_10',
            title: '老友相聚',
            description: '你与多年未见的老同学、老同事重逢，回忆往事。',
            choices: [
                { text: '热情相聚', effects: { charisma: 1, luck: 1 }, cost: 5000 },
                { text: '简单聊聊', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'elder_11',
            title: '遗产规划',
            description: '你开始考虑遗产的分配问题。',
            choices: [
                { text: '提前公证', effects: { intelligence: 1, luck: 1 }, cost: 10000 },
                { text: '口头分配', effects: { luck: -1 } },
                { text: '不留遗产', effects: { charisma: 1, constitution: 1 } }
            ]
        },
        {
            id: 'elder_12',
            title: '参加葬礼',
            description: '你熟悉的同龄人开始相继离世，感受到生命的无常。',
            choices: [
                { text: '珍惜当下', effects: { constitution: 1, intelligence: 1 } },
                { text: '感伤身心的', effects: { constitution: -1 } }
            ]
        },
        {
            id: 'elder_13',
            title: '信仰选择',
            description: '你开始思考人生的意义，或选择某种信仰寻求精神寄托。',
            choices: [
                { text: '皈依宗教', effects: { constitution: 1, luck: 1 } },
                { text: '哲学思考', effects: { intelligence: 2 } },
                { text: '及时行乐', effects: { constitution: 1, luck: 1 } }
            ]
        },
        {
            id: 'elder_14',
            title: '成为曾祖父母',
            description: '你的孙子也结婚生子了，你升级成为曾祖父母！',
            choices: [
                { text: '四世同堂', effects: { charisma: 1, luck: 2 } },
                { text: '给红包', effects: { luck: 1 }, cost: 5000 }
            ]
        },
        {
            id: 'elder_15',
            title: '最后的心愿',
            description: '你列出了人生最后的愿望清单。',
            choices: [
                { text: '努力实现', effects: { constitution: 1, luck: 1 }, cost: 50000 },
                { text: '顺其自然', effects: { constitution: 1 } },
                { text: '分享经验', effects: { charisma: 2 } }
            ]
        }
    ],

    /**
     * 通用事件（适用于所有阶段）
     */
    universal: [
        {
            id: 'universal_1',
            title: '彩票中奖',
            description: '你偶然买了一张彩票，竟然中奖了！',
            choices: [
                { text: '高兴', effects: { luck: 3, charisma: 1 }, money: 1000000, probability: 0.0001 }
            ]
        },
        {
            id: 'universal_2',
            title: '意外之财',
            description: '你意外获得了一笔钱，可能是遗产、赠予或赔偿。',
            choices: [
                { text: '欣然接受', effects: { luck: 2 }, money: 50000 }
            ]
        },
        {
            id: 'universal_3',
            title: '飞来横祸',
            description: '你遭遇了一场意外事故。',
            choices: [
                { text: '坚强面对', effects: { constitution: -2, luck: 1 }, cost: 50000, probability: 0.8 },
                { text: '一蹶不振', effects: { constitution: -3, charisma: -1 }, probability: 0.2 }
            ]
        },
        {
            id: 'universal_4',
            title: '贵人相助',
            description: '在你最困难的时候，出现了贵人帮助了你。',
            choices: [
                { text: '感激不尽', effects: { luck: 2, charisma: 1 } }
            ]
        },
        {
            id: 'universal_5',
            title: '选择朋友',
            description: '你遇到了一个志同道合的朋友，相见恨晚。',
            choices: [
                { text: '深入交往', effects: { charisma: 2, luck: 1 } },
                { text: '保持距离', effects: { luck: -1 } }
            ]
        },
        {
            id: 'universal_6',
            title: '健康体检',
            description: '你做了一次全面体检，了解自己的身体状况。',
            choices: [
                { text: '全面检查', effects: { constitution: 1, luck: 1 }, cost: 3000 },
                { text: '简单检查', effects: { constitution: 1 }, cost: 1000 }
            ]
        },
        {
            id: 'universal_7',
            title: '整形手术',
            description: '你对外貌有了新的追求，考虑做整形手术。',
            choices: [
                { text: '大胆尝试', effects: { charisma: 3, constitution: -1 }, cost: 50000, probability: 0.6 },
                { text: '自然最美', effects: { charisma: 1 } }
            ]
        },
        {
            id: 'universal_8',
            title: '搬家',
            description: '你决定换一个生活环境，搬到新的城市。',
            choices: [
                { text: '大城市', effects: { intelligence: 1, luck: -1, charisma: 1 }, cost: 100000 },
                { text: '小城市', effects: { constitution: 1, luck: 1 }, cost: 30000 },
                { text: '农村养老', effects: { constitution: 2, luck: 1 }, cost: 20000 }
            ]
        },
        {
            id: 'universal_9',
            title: '信仰危机',
            description: '你对自己一直坚持的信念产生了怀疑。',
            choices: [
                { text: '重新审视', effects: { intelligence: 2 } },
                { text: '坚持不疑', effects: { constitution: 1, charisma: 1 } },
                { text: '转变信仰', effects: { luck: 1 } }
            ]
        },
        {
            id: 'universal_10',
            title: '慈善捐款',
            description: '你决定为慈善事业贡献一份力量。',
            choices: [
                { text: '大额捐赠', effects: { charisma: 2, luck: 2 }, cost: 100000 },
                { text: '小额捐赠', effects: { charisma: 1, luck: 1 }, cost: 1000 },
                { text: '拒绝', effects: { luck: -1 } }
            ]
        },
        {
            id: 'universal_treasure_hunt',
            title: '寻宝之旅',
            description: '你听说了一个传说中的宝藏，决定去探险。',
            type: 'adventure',
            priority: 60,
            choices: [
                { text: '深入探索', effects: { luck: 3 }, probability: 0.2, money: 100000 },
                { text: '浅尝辄止', effects: { constitution: -1, luck: 1 }, money: 5000 },
                { text: '放弃', effects: { luck: -1 } }
            ]
        },
        {
            id: 'universal_sudden_opportunity',
            title: '天降机遇',
            description: '一个千载难逢的机会突然出现在你面前。',
            type: 'opportunity',
            priority: 80,
            nextEvent: { trigger: 'conditional', condition: 'high_luck' },
            choices: [
                { text: '紧紧抓住', effects: { intelligence: 2, charisma: 2, luck: 2 }, probability: 0.4 },
                { text: '谨慎观望', effects: { intelligence: 1, constitution: -1 }, probability: 0.6 },
                { text: '错失良机', effects: { luck: -2 } }
            ]
        },
        {
            id: 'universal_lottery_win',
            title: '幸运降临',
            description: '你最近运气特别好，各种好事接连不断。',
            type: 'luck',
            priority: 70,
            choices: [
                { text: '乘胜追击', effects: { luck: 2, charisma: 1 }, probability: 0.5 },
                { text: '见好就收', effects: { luck: 1, constitution: 1 } }
            ]
        }
    ]
};

/**
 * 事件过滤器函数
 * 根据玩家状态过滤可用事件
 */
function filterEvents(events, player) {
    return events.filter(event => {
        // 检查概率
        if (event.probability !== undefined) {
            if (Math.random() > event.probability) return false;
        }
        
        // 检查属性要求
        if (event.requiredAttributes) {
            for (const [attr, minValue] of Object.entries(event.requiredAttributes)) {
                if (player.attributes[attr] < minValue) return false;
            }
        }
        
        // 检查背景要求
        if (event.requiredBackground) {
            if (player.background !== event.requiredBackground) return false;
        }
        
        return true;
    });
}

/**
 * 打印事件统计信息（仅开发模式）
 */
function printEventStats() {
    if (typeof CONFIG !== 'undefined' && CONFIG.DEBUG) {
        let total = 0;
        const stats = {};
        
        for (const [stage, events] of Object.entries(EVENTS)) {
            if (Array.isArray(events)) {
                stats[stage] = events.length;
                total += events.length;
            }
        }
        
        console.log('%c📊 事件统计', 'color: #6366f1; font-size: 14px; font-weight: bold;');
        console.log(`%c总计: ${total} 个事件`, 'color: #94a3b8');
        console.table(stats);
    }
}
