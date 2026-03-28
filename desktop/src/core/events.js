export class EventEmitter {
    constructor() {
        this._events = new Map();
    }

    on(event, callback) {
        if (!this._events.has(event)) {
            this._events.set(event, []);
        }
        this._events.get(event).push(callback);
        return () => this.off(event, callback);
    }

    once(event, callback) {
        const wrapper = (...args) => {
            callback(...args);
            this.off(event, wrapper);
        };
        return this.on(event, wrapper);
    }

    off(event, callback) {
        if (!this._events.has(event)) return;
        if (!callback) {
            this._events.delete(event);
            return;
        }
        const callbacks = this._events.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, ...args) {
        if (!this._events.has(event)) return;
        const callbacks = this._events.get(event);
        callbacks.forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event handler for "${event}":`, error);
            }
        });
    }

    clear() {
        this._events.clear();
    }
}

export const Events = {
    DATA_LOADED: 'data:loaded',
    DATA_ERROR: 'data:error',
    DATA_CLEARED: 'data:cleared',
    
    TRANSFORM_START: 'transform:start',
    TRANSFORM_COMPLETE: 'transform:complete',
    
    CHART_TYPE_CHANGED: 'chart:typeChanged',
    CHART_CONFIG_CHANGED: 'chart:configChanged',
    CHART_RENDERED: 'chart:rendered',
    
    EXPORT_START: 'export:start',
    EXPORT_COMPLETE: 'export:complete',
    
    UI_THEME_CHANGED: 'ui:themeChanged',
    UI_LANGUAGE_CHANGED: 'ui:languageChanged',
    UI_PANEL_TOGGLE: 'ui:panelToggle',
    
    PROJECT_SAVED: 'project:saved',
    PROJECT_LOADED: 'project:loaded',
    
    AI_REQUEST: 'ai:request',
    AI_RESPONSE: 'ai:response',
    AI_ERROR: 'ai:error'
};
