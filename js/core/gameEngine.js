/**
 * 事件总线系统
 * 实现发布/订阅模式，用于解耦组件间的通信
 */
export class EventBus {
    constructor() {
        /** @type {Map<string, Array<Function>>} */
        this.listeners = new Map();
    }

    /**
     * 订阅事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * 取消订阅事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 要移除的回调函数
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
            if (callbacks.length === 0) {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * 发布事件
     * @param {string} event - 事件名称
     * @param {*} data - 传递的数据
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            // 创建回调函数副本，防止在执行过程中被修改
            const callbacks = [...this.listeners.get(event)];
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * 清空所有事件监听器
     */
    clear() {
        this.listeners.clear();
    }
}

/**
 * 游戏事件常量
 */
export const GameEvents = {
    // 游戏状态相关
    GAME_START: 'game:start',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_OVER: 'game:over',
    
    // 玩家状态相关
    PLAYER_CREATED: 'player:created',
    PLAYER_AGE_CHANGED: 'player:ageChanged',
    PLAYER_STAGE_CHANGED: 'player:stageChanged',
    PLAYER_ATTRIBUTE_CHANGED: 'player:attributeChanged',
    PLAYER_HEALTH_CHANGED: 'player:healthChanged',
    PLAYER_MONEY_CHANGED: 'player:moneyChanged',
    
    // 事件系统相关
    EVENT_TRIGGERED: 'event:triggered',
    EVENT_CHOICE_MADE: 'event:choiceMade',
    STORY_PROGRESS: 'story:progress'
};
/**
 * 游戏引擎
 * 核心游戏循环和流程控制
 * 整合时间轴事件和逻辑链系统
 */

class GameEngine {
    /**
     * 创建游戏引擎实例
     */
    constructor() {
        this.player = null;
        this.eventSystem = null;
        this.storyEngine = null;
        this.chainManager = null;
        this.isRunning = false;
        this.isAutoPlaying = false;
        this.playSpeed = 1;
        this.gameLoop = null;
        this.currentEvent = null;
        this.currentTimelineEvent = null;
        this.eventQueue = [];
        
        this.onEventTriggered = null;
        this.onChoiceMade = null;
        this.onAgeChanged = null;
        this.onStageChanged = null;
        this.onGameOver = null;
        this.onAttributeChanged = null;
        this.onStoryProgress = null;
        this.onHealthChanged = null;
    }

    /**
     * 初始化新游戏
     * @param {Object} config - 游戏配置
     */
    initNewGame(config) {
        this.player = new Player(config);
        
        this.player.applyZodiacBonus();
        this.applyTalentEffects(config.talents);
        
        this.eventSystem = new EventSystem(this.player);
        
        this.storyEngine = new StoryEngine(this.player);
        this.storyEngine.init();
        
        this.chainManager = new EventChainManager(this.player);
        
        this.applyBackgroundEffects(config.background);
        
        this.player.updateMaxHealth();
        
        this.isRunning = true;
        this.isAutoPlaying = false;
        
        this.triggerBirthEvent();
    }

    /**
     * 触发出生事件
     */
    triggerBirthEvent() {
        const birthYear = 2006;
        this.player.year = birthYear;
        
        const babyEvents = TIMELINE_EVENTS.baby || [];
        const birthEvent = babyEvents.find(e => e.id === 'birth_2006');
        
        if (birthEvent) {
            this.currentTimelineEvent = birthEvent;
            
            if (this.onEventTriggered) {
                this.onEventTriggered(birthEvent);
            }
        } else {
            this.triggerInitialEvent();
        }
    }

    /**
     * 应用背景效果
     * @param {string} background - 背景ID
     */
    applyBackgroundEffects(background) {
        if (!background || !STORY_CONFIG.backgrounds[background]) return;
        
        const bgData = STORY_CONFIG.backgrounds[background];
        this.player.background = background;
        
        if (bgData.initialBonus) {
            for (const [attr, value] of Object.entries(bgData.initialBonus)) {
                if (this.player.attributes[attr] !== undefined) {
                    this.player.attributes[attr] += value;
                } else if (attr === 'money') {
                    this.player.money += value;
                    this.player.totalMoney += value;
                }
            }
        }
        
        this.storyEngine.setFlag(`background_${background}`, true);
    }

    /**
     * 应用天赋效果
     * @param {Array} talents - 天赋数组
     */
    applyTalentEffects(talents) {
        if (!talents || talents.length === 0) return;
        
        talents.forEach(talent => {
            if (talent.effect) {
                // 应用属性加成
                for (const attr in talent.effect) {
                    if (this.player.attributes[attr] !== undefined) {
                        this.player.attributes[attr] += talent.effect[attr];
                        // 确保不超过最大值
                        if (this.player.attributes[attr] > CONFIG.ATTRIBUTES.maxValue) {
                            this.player.attributes[attr] = CONFIG.ATTRIBUTES.maxValue;
                        }
                    } else if (attr === 'money') {
                        // 金钱加成
                        this.player.money += talent.effect[attr];
                        this.player.totalMoney += talent.effect[attr];
                    }
                }
            }
        });
        
        // 更新最高属性记录
        this.player.updateMaxAttributes();
        // 更新初始属性记录（天赋加成后的属性）
        this.player.initialAttributes = { ...this.player.attributes };
    }

    /**
     * 加载存档
     * @param {Object} saveData - 存档数据
     */
    loadGame(saveData) {
        this.player = Player.deserialize(saveData.player);
        this.eventSystem = new EventSystem(this.player);
        
        // 加载剧情引擎
        this.storyEngine = new StoryEngine(this.player);
        this.storyEngine.init();
        if (saveData.storyEngine) {
            this.storyEngine.deserialize(saveData.storyEngine);
        }
        
        this.isRunning = true;
        this.isAutoPlaying = false;
    }

    /**
     * 触发初始事件
     */
    triggerInitialEvent() {
        const initialEvent = {
            id: 'birth',
            title: '出生',
            description: '你出生了！这是全新人生的开始，祝你有一个精彩的人生！',
            choices: [
                { text: '哇哇大哭', effects: { constitution: 1, charisma: 1 } },
                { text: '安静睡觉', effects: { constitution: 1, luck: 1 } }
            ]
        };
        
        this.currentEvent = initialEvent;
        
        if (this.onEventTriggered) {
            this.onEventTriggered(initialEvent);
        }
    }

    /**
     * 开始游戏循环
     */
    start() {
        if (!this.isRunning) return;
        
        this.isRunning = true;
        this.runGameLoop();
    }

    /**
     * 暂停游戏
     */
    pause() {
        this.isRunning = false;
        this.stopAutoPlay();
        
        if (this.gameLoop) {
            clearTimeout(this.gameLoop);
            this.gameLoop = null;
        }
    }

    /**
     * 恢复游戏
     */
    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.runGameLoop();
        }
    }

    /**
     * 运行游戏循环
     */
    runGameLoop() {
        if (!this.isRunning) return;
        
        if (!this.player.isAlive) {
            this.endGame();
            return;
        }
        
        const interval = this.getInterval();
        
        this.gameLoop = setTimeout(() => {
            this.processGameTick();
            this.runGameLoop();
        }, interval);
    }

    /**
     * 处理游戏 tick
     */
    processGameTick() {
        this.player.addAge(1);
        
        if (this.onAgeChanged) {
            this.onAgeChanged(this.player.age, this.player.year, this.player.lifeStage);
        }
        
        const stageChanged = this.player.updateLifeStage();
        if (stageChanged && this.onStageChanged) {
            this.onStageChanged(this.player.lifeStage);
        }
        
        this.player.updateMaxHealth();
        
        const timelineEvent = this.checkTimelineEvents();
        if (timelineEvent) {
            this.currentTimelineEvent = timelineEvent;
            
            if (this.onEventTriggered) {
                this.onEventTriggered(timelineEvent);
            }
            
            this.pause();
            return;
        }
        
        const chainEvent = this.checkChainEvents();
        if (chainEvent) {
            this.currentEvent = chainEvent;
            
            if (this.onEventTriggered) {
                this.onEventTriggered(chainEvent);
            }
            
            this.pause();
            return;
        }
        
        const randomEvent = this.eventSystem.tryTriggerRandomEvent();
        if (randomEvent) {
            this.currentEvent = randomEvent;
            
            if (this.onEventTriggered) {
                this.onEventTriggered(randomEvent);
            }
            
            this.pause();
            return;
        }
        
        if (!this.player.isAlive) {
            this.endGame();
        }
    }

    /**
     * 检查时间轴事件
     * @returns {Object|null} 时间轴事件
     */
    checkTimelineEvents() {
        const stageId = this.player.lifeStage.id;
        const stageEvents = TIMELINE_EVENTS[stageId] || [];
        
        const available = filterEventsByConditions(stageEvents, this.player);
        
        if (available.length > 0) {
            return available[0];
        }
        
        return null;
    }

    /**
     * 检查逻辑链事件
     * @returns {Object|null} 逻辑链事件
     */
    checkChainEvents() {
        if (!this.chainManager) return null;
        
        const chainEvents = this.chainManager.getChainEventsForAge(this.player.age);
        
        for (const ce of chainEvents) {
            const stageId = this.player.lifeStage.id;
            const stageEvents = TIMELINE_EVENTS[stageId] || [];
            const event = stageEvents.find(e => e.id === ce.eventId);
            
            if (event) {
                const conditions = event.conditions || {};
                
                let canTrigger = true;
                
                if (conditions.flags) {
                    for (const flag of conditions.flags) {
                        if (!this.player.hasFlag(flag)) {
                            canTrigger = false;
                            break;
                        }
                    }
                }
                
                if (conditions.attributes) {
                    for (const attr in conditions.attributes) {
                        const required = conditions.attributes[attr];
                        if (typeof required === 'number') {
                            if (this.player.attributes[attr] < required) {
                                canTrigger = false;
                                break;
                            }
                        }
                    }
                }
                
                if (canTrigger) {
                    return event;
                }
            }
        }
        
        return null;
    }

    /**
     * 检查剧情事件
     * @returns {Object|null} 剧情事件
     */
    checkStoryEvents() {
        if (!this.storyEngine) return null;
        
        // 检查动态生成的剧情事件
        const dynamicEvent = StoryEventGenerator.generateDynamicEvent(this.player, this.storyEngine);
        if (dynamicEvent) {
            return dynamicEvent;
        }
        
        // 检查剧情线事件
        const storyEvents = this.storyEngine.getAvailableStoryEvents();
        if (storyEvents.length > 0) {
            const storyEvent = storyEvents[0];
            return {
                id: storyEvent.chapter.id,
                title: storyEvent.chapter.name,
                description: `${storyEvent.storyline.name}: ${storyEvent.chapter.name}`,
                type: 'storyline',
                priority: storyEvent.priority,
                storyline: storyEvent.storyline,
                chapter: storyEvent.chapter,
                choices: [
                    { text: '继续', effects: {} }
                ]
            };
        }
        
        // 检查预定义的剧情事件
        const stageId = this.player.lifeStage.id;
        const events = getStoryEvents(stageId, this.player, this.storyEngine);
        if (events.length > 0) {
            return events[0];
        }
        
        return null;
    }

    /**
     * 处理玩家选择
     * @param {number} choiceIndex - 选择索引
     * @returns {Object} 选择结果
     */
    makeChoice(choiceIndex) {
        if (!this.currentEvent) {
            return { success: false, message: '没有当前事件' };
        }
        
        let result;
        
        // 检查是否是剧情事件
        if (this.currentEvent.type === 'storyline' || this.currentEvent.setFlags || this.currentEvent.nextEvent) {
            result = this.handleStoryChoice(choiceIndex);
        } else {
            result = this.eventSystem.handleChoice(choiceIndex);
        }
        
        if (this.onChoiceMade) {
            this.onChoiceMade(result);
        }
        
        if (this.onAttributeChanged) {
            this.onAttributeChanged(this.player.attributes, result.appliedEffects);
        }
        
        // 清理当前事件
        this.currentEvent = null;
        
        // 恢复游戏循环
        if (this.isAutoPlaying) {
            this.resume();
        } else {
            // 手动模式下，让玩家确认后继续
        }
        
        return result;
    }

    /**
     * 处理剧情选择
     * @param {number} choiceIndex - 选择索引
     * @returns {Object} 选择结果
     */
    handleStoryChoice(choiceIndex) {
        const event = this.currentEvent;
        const choice = event.choices[choiceIndex];
        
        if (!choice) {
            return { success: false, message: '无效的选择' };
        }
        
        // 应用效果
        const effects = choice.effects || {};
        const appliedEffects = this.player.applyEffects(effects);
        
        // 处理剧情标记
        if (choice.setFlags && this.storyEngine) {
            for (const [flag, value] of Object.entries(choice.setFlags)) {
                this.storyEngine.setFlag(flag, value);
            }
        }
        
        // 处理变量变化
        if (choice.setVariables && this.storyEngine) {
            for (const [key, value] of Object.entries(choice.setVariables)) {
                this.storyEngine.setVariable(key, value);
            }
        }
        
        // 处理关系变化
        if (choice.relationshipEffects && this.storyEngine) {
            for (const effect of choice.relationshipEffects) {
                if (!this.storyEngine.getRelationship(effect.characterId)) {
                    this.storyEngine.addRelationship(
                        effect.characterId, 
                        effect.type || 'friend',
                        effect.name || effect.characterId,
                        50
                    );
                }
                this.storyEngine.updateRelationship(effect.characterId, effect.change, effect.reason);
            }
        }
        
        // 处理金钱变化
        if (choice.money !== undefined) {
            this.player.money += choice.money;
            if (choice.money > 0) {
                this.player.totalMoney += choice.money;
            }
        }
        
        // 标记事件完成
        if (this.storyEngine) {
            this.storyEngine.setFlag(`${event.id}_complete`, true);
            
            // 如果是剧情线事件，完成章节
            if (event.storyline && event.chapter) {
                this.storyEngine.completeChapter(event.storyline.id, event.chapter.id);
            }
        }
        
        // 记录事件
        this.player.recordEvent(event, choice);
        
        // 检查是否有后续事件
        if (choice.nextEvent) {
            // 后续事件将在下一个tick触发
        }
        
        // 触发剧情进度回调
        if (this.onStoryProgress && this.storyEngine) {
            this.onStoryProgress(this.storyEngine.getStorySummary());
        }
        
        return {
            success: true,
            event: event,
            choice: choice,
            result: { effects, messages: [] },
            appliedEffects: appliedEffects,
            newAttributes: { ...this.player.attributes }
        };
    }

    /**
     * 跳过当前事件（使用默认选项）
     */
    skipCurrentEvent() {
        if (!this.currentEvent) return;
        
        // 使用第一个选项
        this.makeChoice(0);
    }

    /**
     * 开启自动播放
     */
    startAutoPlay() {
        this.isAutoPlaying = true;
        this.resume();
    }

    /**
     * 停止自动播放
     */
    stopAutoPlay() {
        this.isAutoPlaying = false;
    }

    /**
     * 切换自动播放状态
     */
    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
        return this.isAutoPlaying;
    }

    /**
     * 设置游戏速度
     * @param {number} speed - 速度 (1: 正常, 2: 快速)
     */
    setSpeed(speed) {
        this.playSpeed = speed;
        
        // 如果正在运行，需要重启循环
        if (this.isRunning) {
            this.pause();
            this.resume();
        }
    }

    /**
     * 切换游戏速度
     */
    toggleSpeed() {
        this.playSpeed = this.playSpeed === 1 ? 2 : 1;
        return this.playSpeed;
    }

    /**
     * 获取当前游戏间隔
     * @returns {number} 间隔时间（毫秒）
     */
    getInterval() {
        const baseInterval = this.playSpeed === 1 
            ? CONFIG.GAME.autoPlayInterval 
            : CONFIG.GAME.fastPlayInterval;
        
        // 如果有事件在等待，延长间隔
        if (this.currentEvent) {
            return baseInterval * 3;
        }
        
        return baseInterval;
    }

    /**
     * 手动推进一年（不触发事件）
     */
    advanceYear() {
        this.player.addAge(1);
        
        if (this.onAgeChanged) {
            this.onAgeChanged(this.player.age, this.player.lifeStage);
        }
        
        const stageChanged = this.player.updateLifeStage();
        if (stageChanged && this.onStageChanged) {
            this.onStageChanged(this.player.lifeStage);
        }
        
        // 尝试触发事件
        const event = this.eventSystem.tryTriggerEvent();
        
        if (event) {
            this.currentEvent = event;
            
            if (this.onEventTriggered) {
                this.onEventTriggered(event);
            }
        }
        
        // 检查游戏结束
        if (!this.player.isAlive) {
            this.endGame();
        }
    }

    /**
     * 手动触发事件（用于按钮触发）
     */
    triggerEvent() {
        const event = this.eventSystem.tryTriggerEvent();
        
        if (event) {
            this.currentEvent = event;
            
            if (this.onEventTriggered) {
                this.onEventTriggered(event);
            }
        }
        
        return event;
    }

    /**
     * 结束游戏
     */
    endGame() {
        this.isRunning = false;
        this.stopAutoPlay();
        
        if (this.gameLoop) {
            clearTimeout(this.gameLoop);
            this.gameLoop = null;
        }
        
        // 计算结局
        const ending = ENDINGS.calculateEnding(this.player);
        
        if (this.onGameOver) {
            this.onGameOver(ending);
        }
        
        return ending;
    }

    /**
     * 强制结束人生
     */
    forceEndLife() {
        this.player.die('主动结束人生');
        this.endGame();
    }

    /**
     * 获取游戏状态
     * @returns {Object} 游戏状态
     */
    getGameState() {
        return {
            isRunning: this.isRunning,
            isAutoPlaying: this.isAutoPlaying,
            playSpeed: this.playSpeed,
            player: this.player ? this.player.getStatus() : null,
            currentEvent: this.currentEvent,
            storySummary: this.storyEngine ? this.storyEngine.getStorySummary() : null
        };
    }

    /**
     * 获取存档数据
     * @returns {Object} 存档数据
     */
    getSaveData() {
        return {
            version: CONFIG.VERSION,
            timestamp: Date.now(),
            player: this.player ? this.player.serialize() : null,
            eventSystem: {
                eventHistory: this.eventSystem.getHistory()
            },
            storyEngine: this.storyEngine ? this.storyEngine.serialize() : null
        };
    }
}
