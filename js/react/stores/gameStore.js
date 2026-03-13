/**
 * 游戏状态Store
 * 使用简单的状态管理模式（类Zustand风格）
 */

class GameStore {
    constructor() {
        this.state = {
            gameState: 'title',
            isPlaying: false,
            isPaused: true,
            playSpeed: 1,
            player: null,
            currentEvent: null,
            eventHistory: [],
            currentYear: 2006,
            currentAge: 0,
            lifeStage: { id: 'baby', name: '婴儿期', icon: '👶' }
        };
        
        this.listeners = new Set();
    }

    getState() {
        return this.state;
    }

    setState(partial) {
        const prevState = this.state;
        this.state = { ...this.state, ...partial };
        
        this.listeners.forEach(listener => {
            listener(this.state, prevState);
        });
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    startGame(config) {
        const player = {
            name: config.name || '玩家',
            gender: config.gender || 'male',
            zodiac: config.zodiac || null,
            attributes: { ...config.attributes },
            age: 0,
            year: 2006,
            health: 100,
            maxHealth: 100,
            money: 1000,
            totalMoney: 1000,
            lifeStage: { id: 'baby', name: '婴儿期', icon: '👶' },
            flags: {},
            relationships: {},
            achievements: [],
            stats: { luckyEvents: 0, unluckyEvents: 0 }
        };

        if (config.zodiac && CONFIG.ZODIAC[config.zodiac]) {
            const bonus = CONFIG.ZODIAC[config.zodiac].bonus;
            for (const [attr, value] of Object.entries(bonus)) {
                player.attributes[attr] = Math.min(10, player.attributes[attr] + value);
            }
        }

        if (config.background && STORY_CONFIG.backgrounds[config.background]) {
            const bgData = STORY_CONFIG.backgrounds[config.background];
            if (bgData.initialBonus) {
                for (const [attr, value] of Object.entries(bgData.initialBonus)) {
                    if (player.attributes[attr] !== undefined) {
                        player.attributes[attr] = Math.min(10, player.attributes[attr] + value);
                    } else if (attr === 'money') {
                        player.money += value;
                        player.totalMoney += value;
                    }
                }
            }
        }

        player.health = this.calculateMaxHealth(player);
        player.maxHealth = player.health;

        this.setState({
            gameState: 'playing',
            isPlaying: true,
            isPaused: false,
            player,
            currentEvent: null,
            eventHistory: [],
            currentYear: 2006,
            currentAge: 0,
            lifeStage: player.lifeStage
        });

        return player;
    }

    calculateMaxHealth(player) {
        const con = player.attributes.constitution;
        const base = 50 + (con * 5);
        const ageFactor = Math.max(0.5, 1 - (player.age * 0.005));
        return Math.round(base * ageFactor);
    }

    nextTurn() {
        const { player } = this.state;
        if (!player) return;

        player.age++;
        player.year++;
        
        this.updateLifeStage(player);

        const maxHealth = this.calculateMaxHealth(player);
        player.maxHealth = maxHealth;
        
        const naturalDecay = Math.max(0.5, 0.5 - (player.attributes.constitution * 0.03));
        player.health = Math.min(maxHealth, player.health - naturalDecay);

        this.setState({
            player,
            currentAge: player.age,
            currentYear: player.year,
            lifeStage: player.lifeStage
        });

        if (player.health <= 0) {
            this.endGame();
            return;
        }

        return player;
    }

    updateLifeStage(player) {
        const stages = CONFIG.LIFE_STAGES;
        for (const stage of stages) {
            if (player.age >= stage.minAge && player.age <= stage.maxAge) {
                const prevStage = player.lifeStage;
                player.lifeStage = stage;
                
                if (prevStage && prevStage.id !== stage.id) {
                    if (player.onStageChange) {
                        player.onStageChange(stage, prevStage);
                    }
                }
                return;
            }
        }
    }

    setCurrentEvent(event) {
        this.setState({ currentEvent: event, isPaused: true });
    }

    makeChoice(choiceIndex) {
        const { player, currentEvent } = this.state;
        if (!player || !currentEvent) return null;

        const choice = currentEvent.choices?.[choiceIndex];
        if (!choice) return null;

        const effects = choice.effects || {};
        
        for (const [key, value] of Object.entries(effects)) {
            if (key === 'money' || key === 'cost') {
                player.money = Math.max(0, player.money + value);
                player.totalMoney += value;
                continue;
            }

            if (typeof value === 'number' && player.attributes[key] !== undefined) {
                player.attributes[key] = Math.max(1, Math.min(10, player.attributes[key] + value));
            }
        }

        if (choice.setFlags) {
            for (const [flag, value] of Object.entries(choice.setFlags)) {
                player.flags[flag] = value;
            }
        }

        if (choice.healthChange) {
            player.health = Math.max(0, Math.min(player.maxHealth, player.health + choice.healthChange));
        }

        const eventRecord = {
            eventId: currentEvent.id,
            eventTitle: currentEvent.title,
            choiceIndex,
            choiceText: choice.text,
            age: player.age,
            year: player.year,
            effects: effects
        };

        this.setState({
            player,
            eventHistory: [...this.state.eventHistory, eventRecord]
        });

        return { success: true, effects, player };
    }

    resume() {
        this.setState({ isPaused: false });
    }

    pause() {
        this.setState({ isPaused: true });
    }

    togglePlaySpeed() {
        const speeds = [1, 2, 3];
        const currentIndex = speeds.indexOf(this.state.playSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        const newSpeed = speeds[nextIndex];
        
        this.setState({ playSpeed: newSpeed });
        return newSpeed;
    }

    endGame() {
        this.setState({
            gameState: 'ended',
            isPlaying: false,
            isPaused: true
        });
    }

    reset() {
        this.setState({
            gameState: 'title',
            isPlaying: false,
            isPaused: true,
            playSpeed: 1,
            player: null,
            currentEvent: null,
            eventHistory: [],
            currentYear: 2006,
            currentAge: 0,
            lifeStage: { id: 'baby', name: '婴儿期', icon: '👶' }
        });
    }
}

const gameStore = new GameStore();
