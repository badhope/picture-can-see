/**
 * 游戏引擎
 * 核心游戏循环和流程控制
 */

class GameEngine {
    /**
     * 创建游戏引擎实例
     */
    constructor() {
        this.player = null;
        this.eventSystem = null;
        this.storyEngine = null;
        this.isRunning = false;
        this.isAutoPlaying = false;
        this.playSpeed = 1;  // 1: 正常, 2: 快速
        this.gameLoop = null;
        this.currentEvent = null;
        
        // 回调函数
        this.onEventTriggered = null;
        this.onChoiceMade = null;
        this.onAgeChanged = null;
        this.onStageChanged = null;
        this.onGameOver = null;
        this.onAttributeChanged = null;
        this.onStoryProgress = null;
    }

    /**
     * 初始化新游戏
     * @param {Object} config - 游戏配置
     */
    initNewGame(config) {
        // 创建玩家
        this.player = new Player(config);
        
        // 应用星座加成
        this.player.applyZodiacBonus();
        
        // 应用天赋效果
        this.applyTalentEffects(config.talents);
        
        // 创建事件系统
        this.eventSystem = new EventSystem(this.player);
        
        // 创建剧情引擎
        this.storyEngine = new StoryEngine(this.player);
        this.storyEngine.init();
        
        // 应用背景初始加成
        this.applyBackgroundEffects(config.background);
        
        // 重置游戏状态
        this.isRunning = true;
        this.isAutoPlaying = false;
        
        // 触发初始事件
        this.triggerInitialEvent();
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
        
        // 检查玩家是否存活
        if (!this.player.isAlive) {
            this.endGame();
            return;
        }
        
        // 计算当前间隔
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
        // 年龄增长
        this.player.addAge(1);
        
        if (this.onAgeChanged) {
            this.onAgeChanged(this.player.age, this.player.lifeStage);
        }
        
        // 检查人生阶段变化
        const stageChanged = this.player.updateLifeStage();
        if (stageChanged && this.onStageChanged) {
            this.onStageChanged(this.player.lifeStage);
        }
        
        // 首先检查剧情事件
        const storyEvent = this.checkStoryEvents();
        if (storyEvent) {
            this.currentEvent = storyEvent;
            
            if (this.onEventTriggered) {
                this.onEventTriggered(storyEvent);
            }
            
            this.pause();
            return;
        }
        
        // 尝试触发普通事件
        const event = this.eventSystem.tryTriggerEvent();
        
        if (event) {
            this.currentEvent = event;
            
            if (this.onEventTriggered) {
                this.onEventTriggered(event);
            }
            
            // 暂停游戏循环，等待玩家选择
            this.pause();
        }
        
        // 检查玩家是否死亡
        if (!this.player.isAlive) {
            this.endGame();
        }
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
