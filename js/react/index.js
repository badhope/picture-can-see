/**
 * React架构 - 模块导出入口
 * 现代化游戏架构的核心模块
 */

import CONFIG from './services/config.js';
import AttributeService from './services/attributeService.js';
import EventService from './services/eventService.js';
import EndingService from './services/endingService.js';
import GameStore from './stores/gameStore.js';
import { createGameLoop } from './hooks/useGameLoop.js';

export {
    CONFIG,
    AttributeService,
    EventService,
    EndingService,
    GameStore,
    createGameLoop
};

export const GameEngine = {
    config: CONFIG,
    services: {
        attribute: AttributeService,
        event: EventService,
        ending: EndingService
    },
    store: GameStore,
    
    init(timelineData, chainsData, randomData, endingsData) {
        this.eventService = new EventService(timelineData, chainsData, randomData);
        this.endingService = new EndingService(endingsData);
        
        return {
            eventService: this.eventService,
            endingService: this.endingService,
            store: GameStore
        };
    },
    
    startGame(config) {
        return GameStore.startGame(config);
    },
    
    getNextEvent(player) {
        if (this.eventService) {
            return this.eventService.getNextEvent(player);
        }
        return null;
    },
    
    calculateEnding(player) {
        if (this.endingService) {
            return this.endingService.calculateEnding(player);
        }
        return null;
    }
};

if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
}
