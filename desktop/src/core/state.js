import { EventEmitter, Events } from './events.js';

export class ReactiveState {
    constructor(initialState = {}) {
        this._state = initialState;
        this._emitter = new EventEmitter();
        this._history = [];
        this._historyIndex = -1;
        this._maxHistory = 50;
    }

    get(path) {
        if (!path) return this._state;
        const keys = path.split('.');
        let value = this._state;
        for (const key of keys) {
            if (value === null || value === undefined) return undefined;
            value = value[key];
        }
        return value;
    }

    set(path, value, recordHistory = true) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = this._state;
        
        for (const key of keys) {
            if (target[key] === undefined) {
                target[key] = {};
            }
            target = target[key];
        }
        
        const oldValue = target[lastKey];
        target[lastKey] = value;
        
        if (recordHistory) {
            this._recordHistory(path, oldValue, value);
        }
        
        this._emitter.emit(`change:${path}`, value, oldValue);
        this._emitter.emit('change', path, value, oldValue);
        
        return value;
    }

    update(updates, recordHistory = true) {
        const changes = [];
        for (const [path, value] of Object.entries(updates)) {
            const oldValue = this.get(path);
            this.set(path, value, false);
            changes.push({ path, oldValue, newValue: value });
        }
        
        if (recordHistory && changes.length > 0) {
            this._recordBatchHistory(changes);
        }
        
        changes.forEach(({ path, oldValue, newValue }) => {
            this._emitter.emit(`change:${path}`, newValue, oldValue);
        });
        this._emitter.emit('change', 'batch', changes);
    }

    subscribe(path, callback) {
        if (typeof path === 'function') {
            return this._emitter.on('change', path);
        }
        return this._emitter.on(`change:${path}`, callback);
    }

    unsubscribe(path, callback) {
        if (typeof path === 'function') {
            this._emitter.off('change', path);
        } else {
            this._emitter.off(`change:${path}`, callback);
        }
    }

    _recordHistory(path, oldValue, newValue) {
        if (this._historyIndex < this._history.length - 1) {
            this._history = this._history.slice(0, this._historyIndex + 1);
        }
        
        this._history.push({
            type: 'single',
            path,
            oldValue,
            newValue,
            timestamp: Date.now()
        });
        
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        } else {
            this._historyIndex++;
        }
    }

    _recordBatchHistory(changes) {
        if (this._historyIndex < this._history.length - 1) {
            this._history = this._history.slice(0, this._historyIndex + 1);
        }
        
        this._history.push({
            type: 'batch',
            changes,
            timestamp: Date.now()
        });
        
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        } else {
            this._historyIndex++;
        }
    }

    canUndo() {
        return this._historyIndex >= 0;
    }

    canRedo() {
        return this._historyIndex < this._history.length - 1;
    }

    undo() {
        if (!this.canUndo()) return false;
        
        const record = this._history[this._historyIndex];
        
        if (record.type === 'single') {
            this.set(record.path, record.oldValue, false);
        } else {
            record.changes.forEach(({ path, oldValue }) => {
                this.set(path, oldValue, false);
            });
        }
        
        this._historyIndex--;
        return true;
    }

    redo() {
        if (!this.canRedo()) return false;
        
        this._historyIndex++;
        const record = this._history[this._historyIndex];
        
        if (record.type === 'single') {
            this.set(record.path, record.newValue, false);
        } else {
            record.changes.forEach(({ path, newValue }) => {
                this.set(path, newValue, false);
            });
        }
        
        return true;
    }

    clearHistory() {
        this._history = [];
        this._historyIndex = -1;
    }

    getState() {
        return JSON.parse(JSON.stringify(this._state));
    }

    setState(newState, recordHistory = true) {
        const oldState = this._state;
        this._state = newState;
        
        if (recordHistory) {
            this._history.push({
                type: 'full',
                oldState,
                newState,
                timestamp: Date.now()
            });
            this._historyIndex = this._history.length - 1;
        }
        
        this._emitter.emit('change', 'full', newState, oldState);
    }
}

export const createStore = (initialState) => {
    return new ReactiveState(initialState);
};
