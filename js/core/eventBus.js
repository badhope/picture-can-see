/**
 * 事件总线模块
 * 实现发布 - 订阅模式，用于组件间解耦通信
 * @module core/EventBus
 */

/**
 * 事件总线类
 * 提供全局事件管理功能
 */
export class EventBus {
    /**
     * 创建事件总线实例
     */
    constructor() {
        /** @private */
        this._events = new Map();
    }

    /**
     * 订阅事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {*} [context] - 回调上下文
     * @returns {EventBus} 返回 this 支持链式调用
     */
    on(event, callback, context) {
        if (!this._events.has(event)) {
            this._events.set(event, []);
        }
        
        this._events.get(event).push({ callback, context });
        return this;
    }

    /**
     * 订阅一次性事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {*} [context] - 回调上下文
     * @returns {EventBus} 返回 this 支持链式调用
     */
    once(event, callback, context) {
        const wrapper = (...args) => {
            this.off(event, wrapper);
            callback.apply(context || this, args);
        };
        return this.on(event, wrapper, context);
    }

    /**
     * 取消订阅
     * @param {string} event - 事件名称
     * @param {Function} [callback] - 要移除的回调（不传则移除所有）
     * @returns {EventBus} 返回 this 支持链式调用
     */
    off(event, callback) {
        if (!this._events.has(event)) {
            return this;
        }
        
        if (!callback) {
            this._events.delete(event);
        } else {
            const listeners = this._events.get(event);
            const filtered = listeners.filter(l => l.callback !== callback);
            this._events.set(event, filtered);
        }
        
        return this;
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {...*} args - 事件参数
     * @returns {boolean} 是否有监听器被触发
     */
    emit(event, ...args) {
        if (!this._events.has(event)) {
            return false;
        }
        
        const listeners = this._events.get(event);
        listeners.forEach(({ callback, context }) => {
            try {
                callback.apply(context || this, args);
            } catch (error) {
                console.error(`[EventBus] Error in event "${event}":`, error);
            }
        });
        
        return true;
    }

    /**
     * 获取事件的监听器数量
     * @param {string} event - 事件名称
     * @returns {number} 监听器数量
     */
    listenerCount(event) {
        if (!this._events.has(event)) {
            return 0;
        }
        return this._events.get(event).length;
    }

    /**
     * 移除所有事件监听器
     * @returns {EventBus} 返回 this 支持链式调用
     */
    removeAllListeners() {
        this._events.clear();
        return this;
    }
}

/**
 * 全局事件总线实例
 */
export const globalEventBus = new EventBus();

/**
 * 游戏事件常量
 */
export const GameEvents = Object.freeze({
    // 游戏生命周期
    GAME_INIT: 'game:init',
    GAME_START: 'game:start',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_OVER: 'game:over',
    
    // 玩家相关
    PLAYER_CREATED: 'player:created',
    PLAYER_ATTRIBUTE_CHANGED: 'player:attribute:changed',
    PLAYER_HEALTH_CHANGED: 'player:health:changed',
    PLAYER_MONEY_CHANGED: 'player:money:changed',
    PLAYER_AGE_CHANGED: 'player:age:changed',
    PLAYER_STAGE_CHANGED: 'player:stage:changed',
    PLAYER_DIED: 'player:died',
    
    // 事件相关
    EVENT_TRIGGERED: 'event:triggered',
    EVENT_CHOICE_MADE: 'event:choice:made',
    EVENT_COMPLETED: 'event:completed',
    
    // 剧情相关
    STORY_PROGRESS: 'story:progress',
    STORY_FLAG_SET: 'story:flag:set',
    STORY_RELATIONSHIP_CHANGED: 'story:relationship:changed',
    
    // UI 相关
    UI_UPDATE: 'ui:update',
    UI_SCREEN_CHANGED: 'ui:screen:changed',
    UI_TOAST: 'ui:toast',
    
    // 存档相关
    SAVE_REQUESTED: 'save:requested',
    SAVE_SUCCESS: 'save:success',
    SAVE_ERROR: 'save:error',
    LOAD_REQUESTED: 'load:requested',
    LOAD_SUCCESS: 'load:success',
    LOAD_ERROR: 'load:error'
});
