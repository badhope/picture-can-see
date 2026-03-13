/**
 * 游戏主入口
 * 负责游戏初始化、事件绑定和整体流程控制
 */

class Game {
    constructor() {
        this.engine = null;
        this.screenManager = null;
        this.uiUpdater = null;
        this.animationManager = null;
        this.soundManager = null;
        
        this.selectedGender = 'male';
        this.selectedZodiac = null;
        this.attributePoints = CONFIG.ATTRIBUTES.initialPoints;
        this.attributes = {
            intelligence: CONFIG.ATTRIBUTES.defaultValue,
            constitution: CONFIG.ATTRIBUTES.defaultValue,
            charisma: CONFIG.ATTRIBUTES.defaultValue,
            luck: CONFIG.ATTRIBUTES.defaultValue,
            morality: CONFIG.ATTRIBUTES.defaultValue
        };
        
        this.loadingTips = [
            '正在加载人生...',
            '准备命运的骰子...',
            '编织命运的丝线...',
            '计算人生可能性...',
            '加载天赋系统...',
            '初始化事件引擎...',
            '准备开始新的人生...'
        ];
        
        this.init();
    }

    async init() {
        await this.showLoadingScreen();
        
        this.animationManager = new AnimationManager();
        this.animationManager.addCSSToDocument();
        
        this.screenManager = new ScreenManager();
        this.uiUpdater = new UIUpdater(this.screenManager);
        this.soundManager = new SoundManager();
        
        this.bindUIEvents();
        this.initZodiacSelect();
        this.initTalentSelect();
        this.checkSaveData();
        this.initParticles();
        
        await this.hideLoadingScreen();
        
        if (CONFIG.DEBUG) {
            console.log('游戏初始化完成');
        }
    }

    async showLoadingScreen() {
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

    async hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            await new Promise(resolve => setTimeout(resolve, 800));
            loadingScreen.remove();
        }
    }

    initParticles() {
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
     * 绑定UI事件
     */
    bindUIEvents() {
        // 开始游戏按钮
        const startBtn = document.getElementById('start-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.screenManager.showCreateScreen();
            });
        }
        
        // 游戏指南按钮
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
        
        // 确认创建按钮
        const confirmBtn = document.getElementById('confirm-create');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.createCharacter();
            });
        }
        
        // 返回标题按钮
        const backBtn = document.getElementById('back-to-title');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.screenManager.showTitleScreen();
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
                this.screenManager.showTitleScreen();
            });
        }
        
        // 性别选择
        const genderBtns = document.querySelectorAll('.gender-btn');
        genderBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                genderBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedGender = btn.dataset.gender;
                this.updateAvatarPreview();
            });
        });

        // 属性分配按钮
        this.bindAttributeButtons();
        
        // 游戏控制按钮
        const autoBtn = document.getElementById('auto-play');
        if (autoBtn) {
            autoBtn.addEventListener('click', () => this.toggleAutoPlay());
        }
        
        const speedBtn = document.getElementById('speed-control');
        if (speedBtn) {
            speedBtn.addEventListener('click', () => this.toggleSpeed());
        }
        
        const saveBtn = document.getElementById('save-game');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveGame());
        }
        
        const endBtn = document.getElementById('end-life');
        if (endBtn) {
            endBtn.addEventListener('click', () => this.confirmEndLife());
        }
    }

    /**
     * 绑定属性分配按钮
     */
    bindAttributeButtons() {
        const minusBtns = document.querySelectorAll('.attr-btn.minus');
        const plusBtns = document.querySelectorAll('.attr-btn.plus');
        
        minusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const attr = btn.dataset.attr;
                this.adjustAttribute(attr, -1);
            });
        });
        
        plusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const attr = btn.dataset.attr;
                this.adjustAttribute(attr, 1);
            });
        });
    }

    /**
     * 调整属性值
     * @param {string} attr - 属性名
     * @param {number} delta - 变化量
     */
    adjustAttribute(attr, delta) {
        const currentValue = this.attributes[attr];
        const newValue = currentValue + delta;
        
        // 检查是否可以调整
        if (delta > 0) {
            // 增加属性
            if (this.attributePoints <= 0) return;
            if (newValue > CONFIG.ATTRIBUTES.maxValue) return;
        } else {
            // 减少属性
            if (newValue < CONFIG.ATTRIBUTES.minInitialValue) return;
        }
        
        // 更新属性值
        this.attributes[attr] = newValue;
        this.attributePoints -= delta;
        
        // 更新显示
        this.updateAttributeDisplay(attr);
        this.updatePointsDisplay();
    }

    /**
     * 更新属性显示
     * @param {string} attr - 属性名
     */
    updateAttributeDisplay(attr) {
        const el = document.getElementById(`attr-${attr}`);
        if (el) {
            el.textContent = this.attributes[attr];
        }
        
        // 更新按钮状态
        this.updateButtonStates(attr);
    }

    /**
     * 更新按钮状态
     * @param {string} attr - 属性名
     */
    updateButtonStates(attr) {
        const minusBtn = document.querySelector(`.attr-btn.minus[data-attr="${attr}"]`);
        const plusBtn = document.querySelector(`.attr-btn.plus[data-attr="${attr}"]`);
        
        if (minusBtn) {
            minusBtn.disabled = this.attributes[attr] <= CONFIG.ATTRIBUTES.minInitialValue;
        }
        
        if (plusBtn) {
            plusBtn.disabled = this.attributes[attr] >= CONFIG.ATTRIBUTES.maxValue || this.attributePoints <= 0;
        }
    }

    /**
     * 更新剩余点数显示
     */
    updatePointsDisplay() {
        const el = document.getElementById('points-remaining');
        if (el) {
            el.textContent = this.attributePoints;
        }
    }

    /**
     * 初始化星座选择
     */
    initZodiacSelect() {
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
                this.selectedZodiac = key;
            });
            
            container.appendChild(btn);
        });
    }

    /**
     * 初始化天赋选择
     */
    initTalentSelect() {
        const container = document.getElementById('talent-select');
        if (!container) return;
        
        this.selectedTalents = [];
        this.maxTalents = 3;
        
        // 随机选择5个天赋供玩家选择
        const availableTalents = this.getRandomTalents(5);
        
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
            rarity.textContent = TALENTS.rarity[talent.rarity].name;
            
            info.appendChild(name);
            info.appendChild(desc);
            
            card.appendChild(icon);
            card.appendChild(info);
            card.appendChild(rarity);
            
            card.addEventListener('click', () => {
                this.toggleTalent(talent.id, card);
            });
            
            container.appendChild(card);
        });
        
        // 添加天赋计数显示
        const countDiv = document.createElement('div');
        countDiv.className = 'talent-count';
        countDiv.innerHTML = `
            <span class="talent-count-text">已选择天赋:</span>
            <span class="talent-count-value" id="talent-count">0</span>
            <span class="talent-count-text">/ ${this.maxTalents}</span>
        `;
        container.appendChild(countDiv);
    }

    /**
     * 随机获取天赋
     * @param {number} count - 数量
     * @returns {Array} 天赋数组
     */
    getRandomTalents(count) {
        const allTalents = [...TALENTS.list];
        const selected = [];
        
        // 按稀有度权重随机选择
        while (selected.length < count && allTalents.length > 0) {
            const roll = Math.random() * 100;
            let rarity;
            
            if (roll < 3) rarity = 'legendary';
            else if (roll < 15) rarity = 'epic';
            else if (roll < 40) rarity = 'rare';
            else rarity = 'common';
            
            // 找到对应稀有度的天赋
            const index = allTalents.findIndex(t => t.rarity === rarity);
            if (index !== -1) {
                selected.push(allTalents[index]);
                allTalents.splice(index, 1);
            } else if (allTalents.length > 0) {
                // 如果没有对应稀有度的，随机选一个
                const randomIndex = Math.floor(Math.random() * allTalents.length);
                selected.push(allTalents[randomIndex]);
                allTalents.splice(randomIndex, 1);
            }
        }
        
        return selected;
    }

    /**
     * 切换天赋选择
     * @param {string} talentId - 天赋ID
     * @param {HTMLElement} card - 卡片元素
     */
    toggleTalent(talentId, card) {
        const index = this.selectedTalents.indexOf(talentId);
        
        if (index !== -1) {
            // 取消选择
            this.selectedTalents.splice(index, 1);
            card.classList.remove('active');
        } else if (this.selectedTalents.length < this.maxTalents) {
            // 选择
            this.selectedTalents.push(talentId);
            card.classList.add('active');
        }
        
        // 更新计数显示
        const countEl = document.getElementById('talent-count');
        if (countEl) {
            countEl.textContent = this.selectedTalents.length;
        }
    }
    
    /**
     * 更新头像预览
     */
    updateAvatarPreview() {
        const preview = document.getElementById('preview-avatar');
        if (preview) {
            const avatars = {
                male: '👦',
                female: '👧',
                other: '🧑'
            };
            preview.textContent = avatars[this.selectedGender] || '👤';
        }
    }

    /**
     * 检查存档数据
     */
    checkSaveData() {
        const hasSave = SaveSystem.hasSave();
        const continueBtn = document.getElementById('continue-game');
        
        if (continueBtn) {
            continueBtn.style.display = hasSave ? 'inline-block' : 'none';
            
            if (hasSave) {
                continueBtn.addEventListener('click', () => this.continueGame());
            }
        }
    }

    /**
     * 创建角色并开始游戏
     */
    createCharacter() {
        // 获取玩家名称并进行XSS过滤
        const nameInput = document.getElementById('player-name');
        const playerName = Utils.sanitizePlayerName(nameInput.value);
        
        // 验证属性点分配
        if (this.attributePoints !== 0) {
            alert('请分配完所有属性点！');
            return;
        }
        
        // 获取星座加成
        let zodiacBonus = {};
        if (this.selectedZodiac && CONFIG.ZODIAC[this.selectedZodiac]) {
            zodiacBonus = CONFIG.ZODIAC[this.selectedZodiac].bonus;
        }
        
        // 获取选中的天赋
        const selectedTalentObjs = this.selectedTalents.map(id => 
            TALENTS.list.find(t => t.id === id)
        ).filter(t => t);
        
        // 创建游戏配置
        const config = {
            name: playerName,
            gender: this.selectedGender,
            intelligence: this.attributes.intelligence,
            constitution: this.attributes.constitution,
            charisma: this.attributes.charisma,
            luck: this.attributes.luck,
            zodiacBonus: zodiacBonus,
            talents: selectedTalentObjs
        };
        
        // 初始化游戏引擎
        this.engine = new GameEngine();
        
        // 绑定引擎回调
        this.bindEngineCallbacks();
        
        // 初始化新游戏
        this.engine.initNewGame(config);
        
        // 显示游戏画面
        this.screenManager.showGameScreen();
        
        // 更新UI
        this.updateGameUI();
        
        // 启动游戏
        this.engine.start();
        
        if (CONFIG.DEBUG) {
            console.log('游戏开始！', config);
        }
    }

    /**
     * 绑定游戏引擎回调
     */
    bindEngineCallbacks() {
        // 事件触发回调
        this.engine.onEventTriggered = (event) => {
            this.uiUpdater.updateEvent(event);
            this.animationManager.pulse(document.querySelector('.event-area'));
        };
        
        // 选择回调
        this.engine.onChoiceMade = (result) => {
            if (result.success) {
                // 显示结果消息
                this.uiUpdater.showResultMessage(result.result);
                
                // 更新属性显示
                this.uiUpdater.updateAttributes(this.engine.player.attributes);
                
                // 更新金钱显示
                this.uiUpdater.updateMoney(this.engine.player.money);
                
                // 动画效果
                const choiceArea = document.querySelector('.event-choices');
                if (choiceArea) {
                    this.animationManager.fadeOut(choiceArea);
                }
                
                // 自动继续或等待
                if (!this.engine.isAutoPlaying) {
                    // 显示确认按钮让玩家继续
                    this.showContinueButton();
                }
            }
        };
        
        // 年龄变化回调
        this.engine.onAgeChanged = (age, stage) => {
            this.uiUpdater.updatePlayerInfo(this.engine.player);
            this.uiUpdater.showAgeChange(age);
        };
        
        // 人生阶段变化回调
        this.engine.onStageChanged = (stage) => {
            this.uiUpdater.updateLifeStage(stage);
            this.animationManager.bounce(document.getElementById('life-stage'));
        };
        
        // 游戏结束回调
        this.engine.onGameOver = (ending) => {
            this.uiUpdater.updateSummary(ending, this.engine.player);
            this.screenManager.showSummaryScreen();
        };
        
        // 属性变化回调
        this.engine.onAttributeChanged = (attributes, changes) => {
            // 显示属性变化动画
            for (const attr in changes) {
                if (attr !== 'money' && attr !== 'cost') {
                    const el = document.getElementById(`display-${attr}`);
                    if (el) {
                        this.animationManager.attributeChange(el, changes[attr]);
                    }
                }
            }
        };
    }

    /**
     * 显示继续按钮
     */
    showContinueButton() {
        const choicesEl = document.getElementById('event-choices');
        if (!choicesEl) return;
        
        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn btn-primary';
        continueBtn.textContent = '继续';
        continueBtn.addEventListener('click', () => {
            // 清除事件显示，显示等待状态
            this.uiUpdater.clearEvent();
            
            // 恢复游戏
            this.engine.resume();
            
            // 移除按钮
            continueBtn.remove();
        });
        
        choicesEl.appendChild(continueBtn);
    }

    /**
     * 更新游戏UI
     */
    updateGameUI() {
        if (!this.engine || !this.engine.player) return;
        
        const player = this.engine.player;
        
        // 更新玩家信息
        this.uiUpdater.updatePlayerInfo(player);
        
        // 更新属性
        this.uiUpdater.updateAttributes(player.attributes);
        
        // 更新金钱
        this.uiUpdater.updateMoney(player.money);
        
        // 更新头像
        this.uiUpdater.updateAvatar(player.lifeStage, player.gender);
    }

    /**
     * 处理玩家选择
     * @param {number} choiceIndex - 选择索引
     */
    makeChoice(choiceIndex) {
        if (!this.engine) return;
        
        const result = this.engine.makeChoice(choiceIndex);
        
        if (!result.success) {
            console.error('选择处理失败:', result.message);
        }
    }

    /**
     * 切换自动播放
     */
    toggleAutoPlay() {
        if (!this.engine) return;
        
        const isAuto = this.engine.toggleAutoPlay();
        this.uiUpdater.updateButtonStates(isAuto, this.engine.playSpeed);
    }

    /**
     * 切换游戏速度
     */
    toggleSpeed() {
        if (!this.engine) return;
        
        const speed = this.engine.toggleSpeed();
        this.uiUpdater.updateButtonStates(this.engine.isAutoPlaying, speed);
    }

    /**
     * 保存游戏
     */
    saveGame() {
        if (!this.engine) return;
        
        const saveData = this.engine.getSaveData();
        const success = SaveSystem.save(saveData, 0);
        
        if (success) {
            alert('游戏已保存！');
        } else {
            alert('保存失败！');
        }
    }

    /**
     * 确认结束人生
     */
    confirmEndLife() {
        if (!this.engine) return;
        
        if (confirm('确定要提前结束人生吗？')) {
            this.engine.forceEndLife();
        }
    }

    /**
     * 继续游戏
     */
    continueGame() {
        const saveData = SaveSystem.load(0);
        
        if (!saveData || !saveData.player) {
            alert('存档已损坏！');
            return;
        }
        
        // 初始化游戏引擎
        this.engine = new GameEngine();
        
        // 绑定回调
        this.bindEngineCallbacks();
        
        // 加载存档
        this.engine.loadGame(saveData);
        
        // 显示游戏画面
        this.screenManager.showGameScreen();
        
        // 更新UI
        this.updateGameUI();
        
        // 启动游戏
        this.engine.start();
        
        if (CONFIG.DEBUG) {
            console.log('继续游戏');
        }
    }

    /**
     * 重新开始游戏
     */
    restart() {
        // 重置属性
        this.attributePoints = CONFIG.ATTRIBUTES.initialPoints;
        this.attributes = {
            intelligence: CONFIG.ATTRIBUTES.defaultValue,
            constitution: CONFIG.ATTRIBUTES.defaultValue,
            charisma: CONFIG.ATTRIBUTES.defaultValue,
            luck: CONFIG.ATTRIBUTES.defaultValue
        };
        
        // 重置选择
        this.selectedGender = 'male';
        this.selectedZodiac = null;
        
        // 重置UI显示
        this.resetCreateUI();
        
        // 显示创建画面
        this.screenManager.showCreateScreen();
    }

    /**
     * 重置创建界面
     */
    resetCreateUI() {
        // 重置名称输入
        const nameInput = document.getElementById('player-name');
        if (nameInput) {
            nameInput.value = '';
        }
        
        // 重置性别选择
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.gender-btn[data-gender="male"]').classList.add('active');
        
        // 重置星座选择
        document.querySelectorAll('.zodiac-btn').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // 重置头像预览
        this.updateAvatarPreview();
        
        // 重置属性显示
        ['intelligence', 'constitution', 'charisma', 'luck'].forEach(attr => {
            this.updateAttributeDisplay(attr);
        });
        this.updatePointsDisplay();
    }

    /**
     * 获取玩家引用
     */
    get player() {
        return this.engine ? this.engine.player : null;
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
