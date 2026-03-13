/**
 * 游戏主入口
 * 负责游戏初始化、事件绑定和整体流程控制
 * @module main
 */

import { CONFIG } from './config.js';
import { GameEngine } from './core/gameEngine.js';
import { EventBus, GameEvents } from './core/eventBus.js';

/**
 * 游戏主类
 */
class Game {
    /**
     * 创建游戏实例
     */
    constructor() {
        /** @type {GameEngine|null} */
        this.engine = null;
        
        /** @type {EventBus} */
        this.eventBus = new EventBus();
        
        /** @type {Object} */
        this.state = {
            selectedGender: 'male',
            selectedZodiac: null,
            attributePoints: CONFIG.ATTRIBUTES.initialPoints,
            attributes: {
                intelligence: CONFIG.ATTRIBUTES.defaultValue,
                constitution: CONFIG.ATTRIBUTES.defaultValue,
                charisma: CONFIG.ATTRIBUTES.defaultValue,
                luck: CONFIG.ATTRIBUTES.defaultValue,
                morality: CONFIG.ATTRIBUTES.defaultValue
            },
            selectedTalents: [],
            maxTalents: 3
        };
        
        /** @type {Array<string>} */
        this.loadingTips = [
            '正在加载人生...',
            '准备命运的骰子...',
            '编织命运的丝线...',
            '计算人生可能性...',
            '加载天赋系统...',
            '初始化事件引擎...',
            '准备开始新的人生...'
        ];
        
        // 初始化
        this._init();
    }

    /**
     * 异步初始化方法
     * @private
     */
    async _init() {
        try {
            await this._showLoadingScreen();
            
            // 初始化动画管理器
            if (typeof AnimationManager !== 'undefined') {
                this.animationManager = new AnimationManager();
                this.animationManager.addCSSToDocument();
            }
            
            // 初始化屏幕管理器
            if (typeof ScreenManager !== 'undefined') {
                this.screenManager = new ScreenManager(this.eventBus);
            }
            
            // 绑定 UI 事件
            this._bindUIEvents();
            
            // 初始化星座选择
            this._initZodiacSelect();
            
            // 初始化天赋选择
            this._initTalentSelect();
            
            // 检查存档
            this._checkSaveData();
            
            // 初始化粒子效果
            this._initParticles();
            
            // 隐藏加载屏幕
            await this._hideLoadingScreen();
            
            // 触发游戏初始化完成事件
            this.eventBus.emit(GameEvents.GAME_INIT);
            
            if (CONFIG.DEBUG) {
                console.log('游戏初始化完成');
            }
        } catch (error) {
            console.error('[Game] Initialization failed:', error);
            this._handleInitializationError(error);
        }
    }

    /**
     * 显示加载屏幕
     * @private
     * @returns {Promise<void>}
     */
    _showLoadingScreen() {
        const progressBar = document.getElementById('loading-progress');
        const tipsEl = document.getElementById('loading-tips');
        let progress = 0;
        
        return new Promise(resolve => {
            const interval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress > 100) progress = 100;
                
                if (progressBar) {
                    progressBar.style.width = progress + '%';
                }
                
                if (tipsEl && Math.random() > 0.7) {
                    const randomTip = this.loadingTips[Math.floor(Math.random() * this.loadingTips.length)];
                    tipsEl.textContent = randomTip;
                }
                
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(resolve, 300);
                }
            }, 100);
        });
    }

    /**
     * 隐藏加载屏幕
     * @private
     * @returns {Promise<void>}
     */
    _hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            return new Promise(resolve => {
                setTimeout(() => {
                    loadingScreen.remove();
                    resolve();
                }, 800);
            });
        }
        return Promise.resolve();
    }

    /**
     * 初始化粒子效果
     * @private
     */
    _initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (6 + Math.random() * 4) + 's';
            particle.style.opacity = 0.2 + Math.random() * 0.4;
            particle.style.width = (2 + Math.random() * 3) + 'px';
            particle.style.height = particle.style.width;
            
            const colors = ['var(--primary-400)', 'var(--info)', 'var(--success)'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            container.appendChild(particle);
        }
    }

    /**
     * 处理初始化错误
     * @private
     * @param {Error} error - 错误对象
     */
    _handleInitializationError(error) {
        alert('游戏初始化失败，请刷新页面重试。错误信息：' + error.message);
    }

    /**
     * 绑定 UI 事件
     * @private
     */
    _bindUIEvents() {
        // 开始游戏按钮
        const startBtn = document.getElementById('start-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.screenManager?.showCreateScreen();
            });
        }
        
        // 游戏指南按钮
        this._setupHelpModal();
        
        // 确认创建按钮
        const confirmBtn = document.getElementById('confirm-create');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this._createCharacter();
            });
        }
        
        // 返回标题按钮
        const backBtn = document.getElementById('back-to-title');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.screenManager?.showTitleScreen();
            });
        }
        
        // 下一年按钮
        const nextBtn = document.getElementById('next-year');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.engine) this.engine.nextYear();
            });
        }
        
        // 重新开始按钮
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restart();
            });
        }
        
        // 从总结返回标题
        const backSummaryBtn = document.getElementById('back-to-title-from-summary');
        if (backSummaryBtn) {
            backSummaryBtn.addEventListener('click', () => {
                this.screenManager?.showTitleScreen();
            });
        }
        
        // 性别选择
        const genderBtns = document.querySelectorAll('.gender-btn');
        genderBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                genderBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.selectedGender = btn.dataset.gender;
                this._updateAvatarPreview();
            });
        });

        // 属性分配按钮
        this._bindAttributeButtons();
        
        // 游戏控制按钮
        this._setupGameControls();
    }

    /**
     * 设置游戏帮助弹窗
     * @private
     */
    _setupHelpModal() {
        const helpBtn = document.getElementById('help-btn');
        const helpModal = document.getElementById('help-modal');
        const closeHelpBtn = document.getElementById('close-help');
        
        if (helpBtn && helpModal) {
            helpBtn.addEventListener('click', () => {
                helpModal.classList.add('active');
            });
        }
        
        if (closeHelpBtn && helpModal) {
            closeHelpBtn.addEventListener('click', () => {
                helpModal.classList.remove('active');
            });
            
            helpModal.addEventListener('click', (e) => {
                if (e.target === helpModal) {
                    helpModal.classList.remove('active');
                }
            });
        }
    }

    /**
     * 设置游戏控制按钮
     * @private
     */
    _setupGameControls() {
        const autoBtn = document.getElementById('auto-play');
        if (autoBtn) {
            autoBtn.addEventListener('click', () => this._toggleAutoPlay());
        }
        
        const speedBtn = document.getElementById('speed-control');
        if (speedBtn) {
            speedBtn.addEventListener('click', () => this._toggleSpeed());
        }
        
        const saveBtn = document.getElementById('save-game');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveGame());
        }
        
        const endBtn = document.getElementById('end-life');
        if (endBtn) {
            endBtn.addEventListener('click', () => this._confirmEndLife());
        }
    }

    /**
     * 绑定属性分配按钮
     * @private
     */
    _bindAttributeButtons() {
        const minusBtns = document.querySelectorAll('.attr-btn.minus');
        const plusBtns = document.querySelectorAll('.attr-btn.plus');
        
        minusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const attr = btn.dataset.attr;
                this._adjustAttribute(attr, -1);
            });
        });
        
        plusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const attr = btn.dataset.attr;
                this._adjustAttribute(attr, 1);
            });
        });
    }

    /**
     * 调整属性值
     * @private
     * @param {string} attr - 属性名
     * @param {number} delta - 变化量
     */
    _adjustAttribute(attr, delta) {
        const currentValue = this.state.attributes[attr];
        const newValue = currentValue + delta;
        
        // 检查是否可以调整
        if (delta > 0) {
            if (this.state.attributePoints <= 0) return;
            if (newValue > CONFIG.ATTRIBUTES.maxValue) return;
        } else {
            if (newValue < CONFIG.ATTRIBUTES.minInitialValue) return;
        }
        
        // 更新属性值
        this.state.attributes[attr] = newValue;
        this.state.attributePoints -= delta;
        
        // 更新显示
        this._updateAttributeDisplay(attr);
        this._updatePointsDisplay();
    }

    /**
     * 更新属性显示
     * @private
     * @param {string} attr - 属性名
     */
    _updateAttributeDisplay(attr) {
        const el = document.getElementById(`attr-${attr}`);
        if (el) {
            el.textContent = this.state.attributes[attr];
        }
        this._updateButtonStates(attr);
    }

    /**
     * 更新按钮状态
     * @private
     * @param {string} attr - 属性名
     */
    _updateButtonStates(attr) {
        const minusBtn = document.querySelector(`.attr-btn.minus[data-attr="${attr}"]`);
        const plusBtn = document.querySelector(`.attr-btn.plus[data-attr="${attr}"]`);
        
        if (minusBtn) {
            minusBtn.disabled = this.state.attributes[attr] <= CONFIG.ATTRIBUTES.minInitialValue;
        }
        
        if (plusBtn) {
            plusBtn.disabled = this.state.attributes[attr] >= CONFIG.ATTRIBUTES.maxValue || this.state.attributePoints <= 0;
        }
    }

    /**
     * 更新剩余点数显示
     * @private
     */
    _updatePointsDisplay() {
        const el = document.getElementById('points-remaining');
        if (el) {
            el.textContent = this.state.attributePoints;
        }
    }

    /**
     * 初始化星座选择
     * @private
     */
    _initZodiacSelect() {
        const container = document.getElementById('zodiac-select');
        if (!container) return;
        
        const zodiacList = Object.entries(CONFIG.ZODIAC);
        
        zodiacList.forEach(([key, zodiac]) => {
            const btn = document.createElement('div');
            btn.className = 'zodiac-btn';
            
            const icon = document.createElement('span');
            icon.className = 'zodiac-icon';
            icon.textContent = zodiac.emoji;
            
            const name = document.createElement('span');
            name.className = 'zodiac-name';
            name.textContent = zodiac.name;
            
            btn.appendChild(icon);
            btn.appendChild(name);
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.zodiac-btn').forEach(o => o.classList.remove('active'));
                btn.classList.add('active');
                this.state.selectedZodiac = key;
            });
            
            container.appendChild(btn);
        });
    }

    /**
     * 初始化天赋选择
     * @private
     */
    _initTalentSelect() {
        const container = document.getElementById('talent-select');
        if (!container) return;
        
        this.state.selectedTalents = [];
        
        // 随机选择 5 个天赋供玩家选择
        const availableTalents = this._getRandomTalents(5);
        
        availableTalents.forEach(talent => {
            const card = document.createElement('div');
            card.className = 'talent-card';
            card.dataset.id = talent.id;
            
            const icon = document.createElement('div');
            icon.className = 'talent-icon';
            icon.textContent = talent.icon;
            
            const info = document.createElement('div');
            info.className = 'talent-info';
            
            const name = document.createElement('div');
            name.className = 'talent-name';
            name.textContent = talent.name;
            
            const desc = document.createElement('div');
            desc.className = 'talent-desc';
            desc.textContent = talent.description;
            
            const rarity = document.createElement('span');
            rarity.className = `talent-rarity ${talent.rarity}`;
            rarity.textContent = window.TALENTS?.rarity[talent.rarity]?.name || '';
            
            info.appendChild(name);
            info.appendChild(desc);
            
            card.appendChild(icon);
            card.appendChild(info);
            card.appendChild(rarity);
            
            card.addEventListener('click', () => {
                this._toggleTalent(talent.id, card);
            });
            
            container.appendChild(card);
        });
        
        // 添加天赋计数显示
        const countDiv = document.createElement('div');
        countDiv.className = 'talent-count';
        countDiv.innerHTML = `
            <span class="talent-count-text">已选择天赋:</span>
            <span class="talent-count-value" id="talent-count">0</span>
            <span class="talent-count-text">/ ${this.state.maxTalents}</span>
        `;
        container.appendChild(countDiv);
    }

    /**
     * 随机获取天赋
     * @private
     * @param {number} count - 数量
     * @returns {Array} 天赋数组
     */
    _getRandomTalents(count) {
        const allTalents = [...(window.TALENTS?.list || [])];
        const selected = [];
        
        while (selected.length < count && allTalents.length > 0) {
            const roll = Math.random() * 100;
            let rarity;
            
            if (roll < 3) rarity = 'legendary';
            else if (roll < 15) rarity = 'epic';
            else if (roll < 40) rarity = 'rare';
            else rarity = 'common';
            
            const index = allTalents.findIndex(t => t.rarity === rarity);
            if (index !== -1) {
                selected.push(allTalents[index]);
                allTalents.splice(index, 1);
            } else if (allTalents.length > 0) {
                const randomIndex = Math.floor(Math.random() * allTalents.length);
                selected.push(allTalents[randomIndex]);
                allTalents.splice(randomIndex, 1);
            }
        }
        
        return selected;
    }

    /**
     * 切换天赋选择
     * @private
     * @param {string} talentId - 天赋 ID
     * @param {HTMLElement} card - 卡片元素
     */
    _toggleTalent(talentId, card) {
        const index = this.state.selectedTalents.indexOf(talentId);
        
        if (index !== -1) {
            this.state.selectedTalents.splice(index, 1);
            card.classList.remove('active');
        } else if (this.state.selectedTalents.length < this.state.maxTalents) {
            this.state.selectedTalents.push(talentId);
            card.classList.add('active');
        }
        
        const countEl = document.getElementById('talent-count');
        if (countEl) {
            countEl.textContent = this.state.selectedTalents.length;
        }
    }
    
    /**
     * 更新头像预览
     * @private
     */
    _updateAvatarPreview() {
        const preview = document.getElementById('preview-avatar');
        if (preview) {
            const avatars = {
                male: '👦',
                female: '👧',
                other: '🧑'
            };
            preview.textContent = avatars[this.state.selectedGender] || '👤';
        }
    }

    /**
     * 检查存档数据
     * @private
     */
    _checkSaveData() {
        const hasSave = typeof SaveSystem !== 'undefined' && SaveSystem.hasSave();
        const continueBtn = document.getElementById('continue-game');
        
        if (continueBtn) {
            continueBtn.style.display = hasSave ? 'inline-block' : 'none';
            
            if (hasSave) {
                continueBtn.addEventListener('click', () => this._continueGame());
            }
        }
    }

    /**
     * 创建角色并开始游戏
     * @private
     */
    _createCharacter() {
        try {
            // 获取玩家名称并进行 XSS 过滤
            const nameInput = document.getElementById('player-name');
            const playerName = typeof Utils !== 'undefined' 
                ? Utils.sanitizePlayerName(nameInput.value) 
                : nameInput.value.trim() || '玩家';
            
            // 验证属性点分配
            if (this.state.attributePoints !== 0) {
                alert('请分配完所有属性点！');
                return;
            }
            
            // 获取星座加成
            let zodiacBonus = {};
            if (this.state.selectedZodiac && CONFIG.ZODIAC[this.state.selectedZodiac]) {
                zodiacBonus = CONFIG.ZODIAC[this.state.selectedZodiac].bonus;
            }
            
            // 获取选中的天赋
            const selectedTalentObjs = this.state.selectedTalents.map(id => 
                window.TALENTS?.list.find(t => t.id === id)
            ).filter(t => t);
            
            // 创建游戏配置
            const config = {
                name: playerName,
                gender: this.state.selectedGender,
                intelligence: this.state.attributes.intelligence,
                constitution: this.state.attributes.constitution,
                charisma: this.state.attributes.charisma,
                luck: this.state.attributes.luck,
                morality: this.state.attributes.morality,
                zodiacBonus: zodiacBonus,
                talents: selectedTalentObjs
            };
            
            // 初始化游戏引擎
            this.engine = new GameEngine(this.eventBus);
            
            // 绑定引擎回调
            this._bindEngineCallbacks();
            
            // 初始化新游戏
            this.engine.initNewGame(config);
            
            // 显示游戏画面
            this.screenManager?.showGameScreen();
            
            // 更新 UI
            this._updateGameUI();
            
            // 启动游戏
            this.engine.start();
            
            if (CONFIG.DEBUG) {
                console.log('游戏开始！', config);
            }
        } catch (error) {
            console.error('[Game] Failed to create character:', error);
            alert('创建角色失败：' + error.message);
        }
    }

    /**
     * 绑定游戏引擎回调
     * @private
     */
    _bindEngineCallbacks() {
        if (!this.engine) return;
        
        // 事件触发回调
        this.eventBus.on(GameEvents.EVENT_TRIGGERED, (event) => {
            if (typeof UIUpdater !== 'undefined' && this.screenManager) {
                UIUpdater.updateEvent(event);
            }
            if (this.animationManager) {
                this.animationManager.pulse(document.querySelector('.event-area'));
            }
        });
        
        // 选择回调
        this.eventBus.on(GameEvents.EVENT_CHOICE_MADE, (data) => {
            if (data.success) {
                // 显示结果消息
                if (typeof UIUpdater !== 'undefined') {
                    UIUpdater.showResultMessage(data.result);
                }
                
                // 自动继续或等待
                if (!this.engine.isAutoPlaying) {
                    this._showContinueButton();
                }
            }
        });
        
        // 年龄变化回调
        this.eventBus.on(GameEvents.PLAYER_AGE_CHANGED, (data) => {
            if (typeof UIUpdater !== 'undefined' && this.engine) {
                UIUpdater.updatePlayerInfo(this.engine.player);
                UIUpdater.showAgeChange(data.age);
            }
        });
        
        // 人生阶段变化回调
        this.eventBus.on(GameEvents.PLAYER_STAGE_CHANGED, (stage) => {
            if (typeof UIUpdater !== 'undefined') {
                UIUpdater.updateLifeStage(stage);
            }
            if (this.animationManager) {
                this.animationManager.bounce(document.getElementById('life-stage'));
            }
        });
        
        // 游戏结束回调
        this.eventBus.on(GameEvents.GAME_OVER, (ending) => {
            if (typeof UIUpdater !== 'undefined' && this.engine) {
                UIUpdater.updateSummary(ending, this.engine.player);
                this.screenManager?.showSummaryScreen();
            }
        });
        
        // 属性变化回调
        this.eventBus.on(GameEvents.PLAYER_ATTRIBUTE_CHANGED, (data) => {
            if (this.animationManager) {
                const el = document.getElementById(`display-${data.attribute}`);
                if (el) {
                    this.animationManager.attributeChange(el, data.change);
                }
            }
        });
    }

    /**
     * 显示继续按钮
     * @private
     */
    _showContinueButton() {
        const choicesEl = document.getElementById('event-choices');
        if (!choicesEl) return;
        
        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn btn-primary';
        continueBtn.textContent = '继续';
        continueBtn.addEventListener('click', () => {
            if (typeof UIUpdater !== 'undefined') {
                UIUpdater.clearEvent();
            }
            if (this.engine) {
                this.engine.resume();
            }
            continueBtn.remove();
        });
        
        choicesEl.appendChild(continueBtn);
    }

    /**
     * 更新游戏 UI
     * @private
     */
    _updateGameUI() {
        if (!this.engine || !this.engine.player) return;
        
        const player = this.engine.player;
        
        if (typeof UIUpdater !== 'undefined') {
            UIUpdater.updatePlayerInfo(player);
            UIUpdater.updateAttributes(player.attributes);
            UIUpdater.updateMoney(player.money);
            UIUpdater.updateAvatar(player.lifeStage, player.gender);
        }
    }

    /**
     * 切换自动播放
     * @private
     */
    _toggleAutoPlay() {
        if (!this.engine) return;
        
        const isAuto = this.engine.toggleAutoPlay();
        if (typeof UIUpdater !== 'undefined') {
            UIUpdater.updateButtonStates(isAuto, this.engine.playSpeed);
        }
    }

    /**
     * 切换游戏速度
     * @private
     */
    _toggleSpeed() {
        if (!this.engine) return;
        
        const speed = this.engine.toggleSpeed();
        if (typeof UIUpdater !== 'undefined') {
            UIUpdater.updateButtonStates(this.engine.isAutoPlaying, speed);
        }
    }

    /**
     * 保存游戏
     * @returns {void}
     */
    saveGame() {
        if (!this.engine) return;
        
        try {
            const saveData = this.engine.getSaveData();
            const success = typeof SaveSystem !== 'undefined' 
                ? SaveSystem.save(saveData, 0) 
                : false;
            
            if (success) {
                alert('游戏已保存！');
                this.eventBus.emit(GameEvents.SAVE_SUCCESS);
            } else {
                alert('保存失败！');
                this.eventBus.emit(GameEvents.SAVE_ERROR);
            }
        } catch (error) {
            console.error('[Game] Save failed:', error);
            alert('保存失败：' + error.message);
            this.eventBus.emit(GameEvents.SAVE_ERROR, error);
        }
    }

    /**
     * 确认结束人生
     * @private
     */
    _confirmEndLife() {
        if (!this.engine) return;
        
        if (confirm('确定要提前结束人生吗？')) {
            this.engine.forceEndLife();
        }
    }

    /**
     * 继续游戏
     * @private
     */
    _continueGame() {
        try {
            const saveData = typeof SaveSystem !== 'undefined' 
                ? SaveSystem.load(0) 
                : null;
            
            if (!saveData || !saveData.player) {
                alert('存档已损坏！');
                return;
            }
            
            // 初始化游戏引擎
            this.engine = new GameEngine(this.eventBus);
            
            // 绑定回调
            this._bindEngineCallbacks();
            
            // TODO: 实现读取存档逻辑
            
            // 显示游戏画面
            this.screenManager?.showGameScreen();
            
            // 更新 UI
            this._updateGameUI();
            
            // 启动游戏
            this.engine.start();
            
            if (CONFIG.DEBUG) {
                console.log('继续游戏');
            }
        } catch (error) {
            console.error('[Game] Failed to continue game:', error);
            alert('继续游戏失败：' + error.message);
        }
    }

    /**
     * 重新开始游戏
     * @returns {void}
     */
    restart() {
        // 重置属性
        this.state.attributePoints = CONFIG.ATTRIBUTES.initialPoints;
        this.state.attributes = {
            intelligence: CONFIG.ATTRIBUTES.defaultValue,
            constitution: CONFIG.ATTRIBUTES.defaultValue,
            charisma: CONFIG.ATTRIBUTES.defaultValue,
            luck: CONFIG.ATTRIBUTES.defaultValue,
            morality: CONFIG.ATTRIBUTES.defaultValue
        };
        
        // 重置选择
        this.state.selectedGender = 'male';
        this.state.selectedZodiac = null;
        this.state.selectedTalents = [];
        
        // 重置 UI 显示
        this._resetCreateUI();
        
        // 显示创建画面
        this.screenManager?.showCreateScreen();
    }

    /**
     * 重置创建界面 UI
     * @private
     */
    _resetCreateUI() {
        // 重置性别选择
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.gender === 'male');
        });
        
        // 重置星座选择
        document.querySelectorAll('.zodiac-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 重置天赋选择
        document.querySelectorAll('.talent-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // 重置属性显示
        Object.keys(this.state.attributes).forEach(attr => {
            this._updateAttributeDisplay(attr);
        });
        
        this._updatePointsDisplay();
        this._updateAvatarPreview();
    }
}

// 导出游戏实例
export const game = new Game();

// 导出 Game 类供测试使用
export { Game };
