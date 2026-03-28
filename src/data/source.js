import { fileParser } from './parser.js';
import { Events } from '../core/events.js';

export class DataSourceManager {
    constructor(app) {
        this.app = app;
        this.sources = new Map();
        this.activeSourceId = null;
    }

    async loadFile(file) {
        const result = await fileParser.parse(file);
        
        if (result.errors.length > 0) {
            this.app.emit(Events.DATA_ERROR, { 
                file: file.name, 
                errors: result.errors 
            });
            return null;
        }

        const sourceId = this._generateId();
        const source = {
            id: sourceId,
            name: file.name,
            type: 'file',
            headers: result.headers,
            data: result.data,
            size: file.size,
            loadedAt: Date.now()
        };

        this.sources.set(sourceId, source);
        this.activeSourceId = sourceId;

        this._updateAppState(source);
        
        this.app.emit(Events.DATA_LOADED, { 
            sourceId, 
            source,
            stats: this._calculateStats(source.data)
        });

        return source;
    }

    async loadMultipleFiles(files) {
        const results = [];
        for (const file of files) {
            const result = await this.loadFile(file);
            if (result) {
                results.push(result);
            }
        }
        return results;
    }

    loadFromText(text, format = 'csv', name = '粘贴数据') {
        const result = fileParser.parseText(text, format);
        
        const sourceId = this._generateId();
        const source = {
            id: sourceId,
            name,
            type: 'paste',
            headers: result.headers,
            data: result.data,
            size: text.length,
            loadedAt: Date.now()
        };

        this.sources.set(sourceId, source);
        this.activeSourceId = sourceId;

        this._updateAppState(source);
        
        this.app.emit(Events.DATA_LOADED, { 
            sourceId, 
            source,
            stats: this._calculateStats(source.data)
        });

        return source;
    }

    loadFromUrl(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP错误: ${response.status}`);
                }

                const contentType = response.headers.get('content-type') || '';
                let format = 'csv';
                
                if (contentType.includes('json')) {
                    format = 'json';
                } else if (url.endsWith('.json')) {
                    format = 'json';
                } else if (url.endsWith('.tsv')) {
                    format = 'tsv';
                }

                const text = await response.text();
                const source = this.loadFromText(text, format, url.split('/').pop());
                resolve(source);
            } catch (error) {
                this.app.emit(Events.DATA_ERROR, { 
                    source: url, 
                    errors: [error.message] 
                });
                reject(error);
            }
        });
    }

    setActiveSource(sourceId) {
        if (!this.sources.has(sourceId)) {
            console.warn(`Source ${sourceId} not found`);
            return false;
        }

        this.activeSourceId = sourceId;
        const source = this.sources.get(sourceId);
        this._updateAppState(source);
        
        this.app.emit(Events.DATA_LOADED, { 
            sourceId, 
            source,
            stats: this._calculateStats(source.data)
        });

        return true;
    }

    getActiveSource() {
        if (!this.activeSourceId) return null;
        return this.sources.get(this.activeSourceId);
    }

    getSource(sourceId) {
        return this.sources.get(sourceId);
    }

    getAllSources() {
        return Array.from(this.sources.values());
    }

    removeSource(sourceId) {
        if (!this.sources.has(sourceId)) return false;
        
        this.sources.delete(sourceId);
        
        if (this.activeSourceId === sourceId) {
            const remaining = Array.from(this.sources.keys());
            this.activeSourceId = remaining.length > 0 ? remaining[0] : null;
            
            if (this.activeSourceId) {
                this.setActiveSource(this.activeSourceId);
            } else {
                this._clearAppState();
            }
        }
        
        return true;
    }

    clearAll() {
        this.sources.clear();
        this.activeSourceId = null;
        this._clearAppState();
        this.app.emit(Events.DATA_CLEARED);
    }

    _updateAppState(source) {
        this.app.state.update({
            'data.sources': this.getAllSources(),
            'data.activeSourceId': source.id,
            'data.rawData': source.data,
            'data.processedData': source.data,
            'data.headers': source.headers
        });
    }

    _clearAppState() {
        this.app.state.update({
            'data.activeSourceId': null,
            'data.rawData': null,
            'data.processedData': null,
            'data.headers': []
        });
    }

    _calculateStats(data) {
        if (!data || data.length === 0) {
            return { rows: 0, columns: 0 };
        }

        return {
            rows: data.length,
            columns: Object.keys(data[0]).length
        };
    }

    _generateId() {
        return `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
