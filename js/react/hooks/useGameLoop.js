/**
 * 游戏循环Hook
 * 管理游戏的自动播放和时间推进
 */

class GameLoop {
    constructor(store, eventService, getNextEventCallback) {
        this.store = store;
        this.eventService = eventService;
        this.getNextEventCallback = getNextEventCallback;
        this.timer = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.runLoop();
    }

    stop() {
        this.isRunning = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    runLoop() {
        if (!this.isRunning) return;

        const state = this.store.getState();
        
        if (!state.isPlaying || state.isPaused || state.gameState === 'ended') {
            this.stop();
            return;
        }

        const speedIntervals = {
            1: 2000,
            2: 1000,
            3: 500
        };
        
        const interval = speedIntervals[state.playSpeed] || 2000;

        this.timer = setTimeout(() => {
            this.processTurn();
            this.runLoop();
        }, interval);
    }

    processTurn() {
        const state = this.store.getState();
        
        if (!state.player || state.gameState === 'ended') {
            this.stop();
            return;
        }

        const player = this.store.nextTurn();
        
        if (!player) {
            this.stop();
            return;
        }

        if (player.health <= 0) {
            this.store.setState({ gameState: 'ended' });
            this.stop();
            return;
        }

        const event = this.getNextEventCallback(player);
        
        if (event) {
            this.store.setCurrentEvent(event);
            this.stop();
        }
    }

    setSpeed(speed) {
        this.store.setState({ playSpeed: speed });
        
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }
}

function createGameLoop(store, eventService, getNextEventCallback) {
    return new GameLoop(store, eventService, getNextEventCallback);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameLoop, createGameLoop };
}
