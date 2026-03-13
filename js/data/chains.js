/**
 * 事件逻辑链系统
 * 管理事件的因果关系和连锁反应
 * 类似瘟疫公司的传播逻辑
 */

const EVENT_CHAINS = {
    /**
     * 教育链 - 从幼儿园到大学
     * 逻辑：入学 → 学习 → 升学 → 毕业
     */
    education: {
        id: 'education',
        name: '求学之路',
        description: '从幼儿园到大学的求学经历',
        stages: ['kindergarten', 'primary', 'middle', 'high', 'university', 'graduate'],
        
        chain: [
            { event: 'kindergarten_2009', next: 'primary_school_2012', condition: null },
            { event: 'primary_school_2012', next: 'middle_school_2016', condition: null },
            { event: 'middle_school_2016', next: 'gaokao_2024', condition: null },
            { event: 'gaokao_2024', next: 'university_2024', condition: { flag: 'good_university' } },
            { event: 'gaokao_2024', next: 'first_job_2024', condition: { flag: 'enter_workforce' } },
            { event: 'university_2024', next: 'graduation_2028', condition: null },
            { event: 'graduation_2028', next: 'first_job_2028', condition: { flag: 'enter_workforce' } },
            { event: 'graduation_2028', next: 'phd_2031', condition: { flag: 'grad_school' } }
        ],
        
        attributeRequirements: {
            university_2024: { intelligence: 5 },
            grad_school: { intelligence: 7 }
        },
        
        failureBranches: {
            'gaokao_2024': [
                { flag: 'retake_gaokao', nextEvent: 'gaokao_2025', probability: 0.3 },
                { flag: 'enter_workforce', nextEvent: 'first_job_2024', probability: 0.7 }
            ]
        }
    },

    /**
     * 职业链 - 从第一份工作到事业巅峰
     */
    career: {
        id: 'career',
        name: '职业发展',
        description: '从职场新人到行业精英',
        stages: ['entry', 'growth', 'mid_career', 'peak', 'decline'],
        
        chain: [
            { event: 'first_job_2028', next: 'career_advancement', condition: { flag: 'career_ambitious' } },
            { event: 'first_job_2028', next: 'job_hop', condition: { flag: 'job_hopper' } },
            { event: 'career_advancement', next: 'midlife_2045', condition: null },
            { event: 'midlife_2045', next: 'career_peak_2050', condition: { flag: 'career_continued' } },
            { event: 'midlife_2045', next: 'second_venture', condition: { flag: 'second_venture' } },
            { event: 'career_peak_2050', next: 'retirement_2060', condition: null }
        ],
        
        unlocksByStage: {
            entry: ['workplace_friends', 'first_bonus'],
            growth: ['promotion', 'salary_raise'],
            mid_career: ['team_leader', 'industry_recognition'],
            peak: ['industry_award', 'career_book']
        }
    },

    /**
     * 家庭链 - 从恋爱到家庭
     */
    family: {
        id: 'family',
        name: '家庭生活',
        description: '从单身到组建家庭',
        stages: ['single', 'dating', 'marriage', 'parenthood', 'empty_nest'],
        
        chain: [
            { event: 'first_love', next: 'dating', condition: null },
            { event: 'dating', next: 'marriage_2030', condition: { flag: 'relationship_stable' } },
            { event: 'marriage_2030', next: 'first_child_2032', condition: null },
            { event: 'first_child_2032', next: 'children_grow_2055', condition: null },
            { event: 'children_grow_2055', next: 'empty_nest', condition: null }
        ],
        
        alternateBranches: {
            'first_love': [
                { condition: { flag: 'breakup' }, nextEvent: 'healing', probability: 0.6 },
                { condition: { flag: 'stay_together' }, nextEvent: 'long_relationship', probability: 0.4 }
            ]
        }
    },

    /**
     * 健康链 - 从年轻健康到老年保健
     */
    health: {
        id: 'health',
        name: '健康人生',
        description: '身体是革命的本钱',
        stages: ['youth', 'prime', 'middle_health', 'elder_health'],
        
        chain: [
            { event: 'baby_2006', next: 'healthy_child', condition: { flag: 'healthy_baby' } },
            { event: 'healthy_child', next: 'youth_fitness', condition: null },
            { event: 'youth_fitness', next: 'midlife_health', condition: { age: 40 } },
            { event: 'midlife_health', next: 'health_issues_2070', condition: null },
            { event: 'health_issues_2070', next: 'final_moments', condition: null }
        ],
        
        healthImpacts: {
            gaming_addicted: { modifier: -5, description: '长期沉迷游戏影响健康' },
            fitness_routine: { modifier: 10, description: '坚持锻炼带来健康' },
            health_conscious: { modifier: 5, description: '注重养生' },
            stress_career: { modifier: -8, description: '工作压力大影响健康' }
        }
    },

    /**
     * 财富链 - 从零开始到财务自由
     */
    wealth: {
        id: 'wealth',
        name: '财富积累',
        description: '理财观念决定财富水平',
        stages: ['savings', 'investment', 'wealth_building', 'financial_freedom'],
        
        chain: [
            { event: 'first_job_2028', next: 'first_savings', condition: null },
            { event: 'first_savings', next: 'investment_start', condition: { money: 50000 } },
            { event: 'investment_start', next: 'house_purchase_2030', condition: null },
            { event: 'house_purchase_2030', next: 'wealth_peak', condition: { money: 1000000 } },
            { event: 'wealth_peak', next: 'retirement_fund', condition: null }
        ],
        
        moneyThresholds: {
            first_savings: 10000,
            investment_start: 50000,
            house_purchase: 200000,
            wealth_peak: 1000000,
            financial_freedom: 5000000
        }
    },

    /**
     * 疫情链 - 2020新冠疫情
     */
    covid19: {
        id: 'covid19',
        name: '疫情经历',
        description: '新冠疫情对人生的影响',
        stages: ['outbreak', 'lockdown', 'recovery', 'post_pandemic'],
        
        chain: [
            { event: 'covid_2020', next: 'covid_normal_2021', condition: null },
            { event: 'covid_normal_2021', next: 'post_covid_2022', condition: null },
            { event: 'post_covid_2022', next: 'covid_impact_summary', condition: { year: 2023 } }
        ],
        
        effects: {
            onHealth: { constitution: -1 },
            onCareer: { modifier: -0.2 },
            onEducation: { modifier: -0.3 },
            onSocial: { modifier: -0.4 }
        }
    },

    /**
     * AI革命链 - 2023年开始的技术革命
     */
    ai_revolution: {
        id: 'ai_revolution',
        name: 'AI革命',
        description: '人工智能如何改变人生',
        stages: ['awareness', 'adoption', 'integration', 'ai_career'],
        
        chain: [
            { event: 'ai_boom_2023', next: 'ai_adoption_2024', condition: { flag: 'ai_learner' } },
            { event: 'ai_adoption_2024', next: 'ai_career_2027', condition: null },
            { event: 'ai_career_2027', next: 'ai_expert_2030', condition: null }
        ],
        
        unlocks: {
            'ai_learner': ['tech_career', 'ai_entrepreneurship', 'digital_nomad'],
            'ai_expert': ['tech_ceo', 'ai_researcher', 'consultant']
        }
    }
};

/**
 * 事件链管理器类
 */
class EventChainManager {
    constructor(player) {
        this.player = player;
        this.activeChains = new Map();
        this.completedEvents = new Set();
        this.pendingEvents = new Map();
        this.chainProgress = {};
        
        this.initChains();
    }

    /**
     * 初始化所有链
     */
    initChains() {
        for (const chainId in EVENT_CHAINS) {
            const chain = EVENT_CHAINS[chainId];
            this.chainProgress[chainId] = {
                currentStage: 0,
                events: [],
                completed: false
            };
        }
    }

    /**
     * 注册事件完成
     */
    registerEventCompletion(eventId) {
        this.completedEvents.add(eventId);
        
        for (const chainId in EVENT_CHAINS) {
            const chain = EVENT_CHAINS[chainId];
            const chainItem = chain.chain.find(c => c.event === eventId);
            
            if (chainItem && chainItem.next) {
                this.scheduleEvent(chainItem.next, chainItem.condition);
            }
        }
    }

    /**
     * 安排未来事件
     */
    scheduleEvent(eventId, condition) {
        if (!this.pendingEvents.has(eventId)) {
            this.pendingEvents.set(eventId, []);
        }
        this.pendingEvents.get(eventId).push({ condition, scheduledAt: this.player.age });
    }

    /**
     * 检查待处理事件是否满足条件
     */
    checkPendingEvents() {
        const available = [];
        
        for (const [eventId, conditions] of this.pendingEvents) {
            let canTrigger = true;
            
            for (const cond of conditions) {
                if (cond.condition) {
                    if (cond.condition.flag && !this.player.hasFlag(cond.condition.flag)) {
                        canTrigger = false;
                        break;
                    }
                    if (cond.condition.age && this.player.age < cond.condition.age) {
                        canTrigger = false;
                        break;
                    }
                    
                    if (cond.condition.attributes) {
                        for (const attr in cond.condition.attributes) {
                            if (this.player.attributes[attr] < cond.condition.attributes[attr]) {
                                canTrigger = false;
                                break;
                            }
                        }
                    }
                }
            }
            
            if (canTrigger) {
                available.push(eventId);
                this.pendingEvents.delete(eventId);
            }
        }
        
        return available;
    }

    /**
     * 获取当前年龄可触发的事件（基于链）
     */
    getChainEventsForAge(age) {
        const events = [];
        
        for (const chainId in EVENT_CHAINS) {
            const chain = EVENT_CHAINS[chainId];
            
            for (const item of chain.chain) {
                if (this.completedEvents.has(item.event)) continue;
                
                if (item.condition) {
                    if (item.condition.age) {
                        if (age < item.condition.age) continue;
                    }
                    if (item.condition.flag && !this.player.hasFlag(item.condition.flag)) continue;
                }
                
                events.push({ eventId: item.event, chain: chainId });
            }
        }
        
        return events;
    }

    /**
     * 检查事件是否在链中
     */
    isEventInChain(eventId) {
        for (const chainId in EVENT_CHAINS) {
            const chain = EVENT_CHAINS[chainId];
            if (chain.chain.some(c => c.event === eventId)) {
                return { inChain: true, chainId, chain: chain };
            }
        }
        return { inChain: false };
    }

    /**
     * 获取下一个链事件
     */
    getNextChainEvent(chainId) {
        const chain = EVENT_CHAINS[chainId];
        if (!chain) return null;
        
        const progress = this.chainProgress[chainId];
        if (progress.completed) return null;
        
        const currentStageItem = chain.chain[progress.currentStage];
        if (!currentStageItem) {
            progress.completed = true;
            return null;
        }
        
        return currentStageItem;
    }

    /**
     * 获取链的当前阶段
     */
    getChainStage(chainId) {
        return this.chainProgress[chainId]?.currentStage || 0;
    }

    /**
     * 推进链的阶段
     */
    advanceChain(chainId) {
        if (this.chainProgress[chainId]) {
            this.chainProgress[chainId].currentStage++;
            
            const chain = EVENT_CHAINS[chainId];
            if (this.chainProgress[chainId].currentStage >= chain.chain.length) {
                this.chainProgress[chainId].completed = true;
            }
        }
    }

    /**
     * 获取所有活跃链
     */
    getActiveChains() {
        const active = [];
        for (const chainId in this.chainProgress) {
            if (!this.chainProgress[chainId].completed) {
                active.push({
                    id: chainId,
                    ...EVENT_CHAINS[chainId],
                    ...this.chainProgress[chainId]
                });
            }
        }
        return active;
    }

    /**
     * 检查是否有特定flag链
     */
    hasFlagChain(flag) {
        for (const chainId in EVENT_CHAINS) {
            const chain = EVENT_CHAINS[chainId];
            for (const item of chain.chain) {
                if (item.condition?.flag === flag) {
                    return { chainId, event: item.event, nextEvent: item.next };
                }
            }
        }
        return null;
    }

    /**
     * 获取链的完整进度百分比
     */
    getChainProgressPercentage(chainId) {
        const chain = EVENT_CHAINS[chainId];
        const progress = this.chainProgress[chainId];
        if (!chain || !progress) return 0;
        
        return Math.round((progress.currentStage / chain.chain.length) * 100);
    }

    /**
     * 重置所有链
     */
    reset() {
        this.activeChains.clear();
        this.completedEvents.clear();
        this.pendingEvents.clear();
        this.initChains();
    }

    /**
     * 序列化链数据
     */
    serialize() {
        return {
            completedEvents: Array.from(this.completedEvents),
            pendingEvents: Array.from(this.pendingEvents.entries()),
            chainProgress: this.chainProgress
        };
    }

    /**
     * 从存档恢复链数据
     */
    deserialize(data) {
        if (data.completedEvents) {
            this.completedEvents = new Set(data.completedEvents);
        }
        if (data.chainProgress) {
            this.chainProgress = data.chainProgress;
        }
        if (data.pendingEvents) {
            this.pendingEvents = new Map(data.pendingEvents);
        }
    }
}

/**
 * 根据玩家状态获取应该触发的事件
 */
function getEventsForPlayer(player, chainManager, eventPool) {
    const events = [];
    
    const availableChainEvents = chainManager.getChainEventsForAge(player.age);
    for (const ce of availableChainEvents) {
        const event = eventPool.find(e => e.id === ce.eventId);
        if (event) {
            events.push({ ...event, source: 'chain', chain: ce.chain });
        }
    }
    
    const pendingEvents = chainManager.checkPendingEvents();
    for (const pe of pendingEvents) {
        const event = eventPool.find(e => e.id === pe);
        if (event) {
            events.push({ ...event, source: 'pending', priority: 'high' });
        }
    }
    
    return events;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EVENT_CHAINS, EventChainManager, getEventsForPlayer };
}
