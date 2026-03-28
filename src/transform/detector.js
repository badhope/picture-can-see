export class TypeDetector {
    constructor() {
        this.patterns = {
            integer: /^-?\d+$/,
            float: /^-?\d+\.\d+$/,
            percentage: /^-?\d+(\.\d+)?%$/,
            currency: /^[¥$€£]\s*-?\d+(\.\d+)?$/,
            date: [
                /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/,
                /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/,
                /^\d{4}年\d{1,2}月\d{1,2}日$/
            ],
            time: [
                /^\d{1,2}:\d{2}(:\d{2})?$/,
                /^\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM|am|pm)?$/
            ],
            datetime: [
                /^\d{4}[-/]\d{1,2}[-/]\d{1,2}[T\s]\d{1,2}:\d{2}(:\d{2})?/
            ],
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            url: /^https?:\/\/[^\s]+$/,
            phone: /^[\d\s\-+()]{7,}$/,
            boolean: /^(true|false|yes|no|是|否|真|假|1|0)$/i,
            empty: /^(null|undefined|na|n\/a|none|空)?$/i
        };
    }

    detect(value) {
        if (value === null || value === undefined || value === '') {
            return { type: 'empty', confidence: 1 };
        }

        const strValue = String(value).trim();

        if (this.patterns.empty.test(strValue)) {
            return { type: 'empty', confidence: 1 };
        }

        if (this.patterns.boolean.test(strValue)) {
            return { type: 'boolean', confidence: 0.95 };
        }

        if (this.patterns.percentage.test(strValue)) {
            return { type: 'percentage', confidence: 0.95 };
        }

        if (this.patterns.currency.test(strValue)) {
            return { type: 'currency', confidence: 0.95 };
        }

        for (const pattern of this.patterns.datetime) {
            if (pattern.test(strValue)) {
                return { type: 'datetime', confidence: 0.9 };
            }
        }

        for (const pattern of this.patterns.date) {
            if (pattern.test(strValue)) {
                return { type: 'date', confidence: 0.9 };
            }
        }

        for (const pattern of this.patterns.time) {
            if (pattern.test(strValue)) {
                return { type: 'time', confidence: 0.9 };
            }
        }

        if (this.patterns.email.test(strValue)) {
            return { type: 'email', confidence: 0.95 };
        }

        if (this.patterns.url.test(strValue)) {
            return { type: 'url', confidence: 0.95 };
        }

        if (this.patterns.phone.test(strValue)) {
            return { type: 'phone', confidence: 0.8 };
        }

        if (this.patterns.integer.test(strValue)) {
            return { type: 'integer', confidence: 0.95 };
        }

        if (this.patterns.float.test(strValue)) {
            return { type: 'float', confidence: 0.95 };
        }

        if (!isNaN(parseFloat(strValue))) {
            return { type: 'number', confidence: 0.7 };
        }

        return { type: 'string', confidence: 0.5 };
    }

    detectColumn(values) {
        const typeCounts = new Map();
        const sampleSize = Math.min(values.length, 100);

        for (let i = 0; i < sampleSize; i++) {
            const value = values[i];
            if (value === null || value === undefined || value === '') continue;

            const result = this.detect(value);
            const type = result.type;
            
            typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
        }

        if (typeCounts.size === 0) {
            return { type: 'empty', confidence: 1 };
        }

        let maxType = 'string';
        let maxCount = 0;
        let totalValid = 0;

        for (const [type, count] of typeCounts) {
            totalValid += count;
            if (count > maxCount) {
                maxCount = count;
                maxType = type;
            }
        }

        const confidence = maxCount / totalValid;

        if (confidence < 0.7) {
            return { type: 'string', confidence: confidence };
        }

        return { type: maxType, confidence };
    }

    analyze(data, headers) {
        const analysis = {};
        
        for (const header of headers) {
            const values = data.map(row => row[header]);
            analysis[header] = {
                ...this.detectColumn(values),
                stats: this._calculateStats(values)
            };
        }
        
        return analysis;
    }

    _calculateStats(values) {
        const numericValues = values
            .filter(v => v !== null && v !== undefined && v !== '')
            .map(v => parseFloat(v))
            .filter(n => !isNaN(n));

        const stats = {
            total: values.length,
            valid: values.filter(v => v !== null && v !== undefined && v !== '').length,
            empty: values.filter(v => v === null || v === undefined || v === '').length,
            unique: new Set(values.filter(v => v !== null && v !== undefined)).size
        };

        if (numericValues.length > 0) {
            stats.numeric = {
                min: Math.min(...numericValues),
                max: Math.max(...numericValues),
                sum: numericValues.reduce((a, b) => a + b, 0),
                mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
                median: this._median(numericValues)
            };
        }

        return stats;
    }

    _median(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    }
}

export const typeDetector = new TypeDetector();
