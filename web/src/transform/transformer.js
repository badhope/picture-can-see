import { typeDetector } from './detector.js';

export class DataCleaner {
    constructor() {
        this.strategies = {
            empty: 'remove',
            duplicate: 'remove',
            outlier: 'mark'
        };
    }

    clean(data, options = {}) {
        let result = [...data];
        const report = {
            original: data.length,
            removed: 0,
            modified: 0,
            issues: []
        };

        if (options.removeEmpty !== false) {
            const before = result.length;
            result = this._removeEmptyRows(result);
            report.removed += before - result.length;
        }

        if (options.removeDuplicates !== false) {
            const before = result.length;
            result = this._removeDuplicates(result);
            report.removed += before - result.length;
        }

        if (options.trimWhitespace !== false) {
            result = this._trimWhitespace(result);
            report.modified += result.length;
        }

        if (options.normalizeNulls !== false) {
            result = this._normalizeNulls(result);
        }

        report.final = result.length;
        return { data: result, report };
    }

    _removeEmptyRows(data) {
        return data.filter(row => {
            const values = Object.values(row);
            const nonEmpty = values.filter(v => 
                v !== null && v !== undefined && v !== '' && v !== 'null' && v !== 'NA'
            );
            return nonEmpty.length > 0;
        });
    }

    _removeDuplicates(data) {
        const seen = new Set();
        return data.filter(row => {
            const key = JSON.stringify(row);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    _trimWhitespace(data) {
        return data.map(row => {
            const newRow = {};
            for (const [key, value] of Object.entries(row)) {
                if (typeof value === 'string') {
                    newRow[key] = value.trim();
                } else {
                    newRow[key] = value;
                }
            }
            return newRow;
        });
    }

    _normalizeNulls(data) {
        const nullValues = ['null', 'NULL', 'NA', 'N/A', 'None', 'none', 'undefined', ''];
        
        return data.map(row => {
            const newRow = {};
            for (const [key, value] of Object.entries(row)) {
                if (nullValues.includes(String(value).trim())) {
                    newRow[key] = null;
                } else {
                    newRow[key] = value;
                }
            }
            return newRow;
        });
    }

    detectOutliers(data, column, method = 'iqr') {
        const values = data
            .map(row => parseFloat(row[column]))
            .filter(v => !isNaN(v));

        if (values.length === 0) return [];

        const outliers = [];

        if (method === 'iqr') {
            const sorted = [...values].sort((a, b) => a - b);
            const q1 = sorted[Math.floor(sorted.length * 0.25)];
            const q3 = sorted[Math.floor(sorted.length * 0.75)];
            const iqr = q3 - q1;
            const lower = q1 - 1.5 * iqr;
            const upper = q3 + 1.5 * iqr;

            data.forEach((row, index) => {
                const value = parseFloat(row[column]);
                if (!isNaN(value) && (value < lower || value > upper)) {
                    outliers.push({ index, value, reason: 'iqr' });
                }
            });
        }

        return outliers;
    }
}

export class DataTransformer {
    constructor() {
        this.cleaner = new DataCleaner();
    }

    transform(data, operations) {
        let result = [...data];

        for (const op of operations) {
            switch (op.type) {
                case 'filter':
                    result = this._filter(result, op.condition);
                    break;
                case 'sort':
                    result = this._sort(result, op.column, op.direction);
                    break;
                case 'map':
                    result = this._map(result, op.mapping);
                    break;
                case 'aggregate':
                    result = this._aggregate(result, op.groupBy, op.aggregations);
                    break;
                case 'pivot':
                    result = this._pivot(result, op.index, op.columns, op.values);
                    break;
                case 'calculate':
                    result = this._calculate(result, op.newColumn, op.formula);
                    break;
                case 'clean':
                    const cleanResult = this.cleaner.clean(result, op.options);
                    result = cleanResult.data;
                    break;
            }
        }

        return result;
    }

    _filter(data, condition) {
        return data.filter(row => {
            return this._evaluateCondition(row, condition);
        });
    }

    _evaluateCondition(row, condition) {
        const { column, operator, value } = condition;
        const cellValue = row[column];

        switch (operator) {
            case 'eq': return cellValue == value;
            case 'ne': return cellValue != value;
            case 'gt': return cellValue > value;
            case 'gte': return cellValue >= value;
            case 'lt': return cellValue < value;
            case 'lte': return cellValue <= value;
            case 'contains': return String(cellValue).includes(value);
            case 'startsWith': return String(cellValue).startsWith(value);
            case 'endsWith': return String(cellValue).endsWith(value);
            case 'isEmpty': return cellValue === null || cellValue === undefined || cellValue === '';
            case 'isNotEmpty': return cellValue !== null && cellValue !== undefined && cellValue !== '';
            default: return true;
        }
    }

    _sort(data, column, direction = 'asc') {
        return [...data].sort((a, b) => {
            const aVal = a[column];
            const bVal = b[column];

            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            let comparison = 0;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal;
            } else {
                comparison = String(aVal).localeCompare(String(bVal));
            }

            return direction === 'desc' ? -comparison : comparison;
        });
    }

    _map(data, mapping) {
        return data.map(row => {
            const newRow = {};
            for (const [newKey, oldKey] of Object.entries(mapping)) {
                newRow[newKey] = row[oldKey];
            }
            return newRow;
        });
    }

    _aggregate(data, groupBy, aggregations) {
        const groups = new Map();

        for (const row of data) {
            const key = row[groupBy];
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(row);
        }

        const result = [];
        for (const [key, rows] of groups) {
            const aggregated = { [groupBy]: key };

            for (const agg of aggregations) {
                const { column, type, as } = agg;
                const values = rows.map(r => parseFloat(r[column])).filter(v => !isNaN(v));

                switch (type) {
                    case 'sum':
                        aggregated[as || `${column}_sum`] = values.reduce((a, b) => a + b, 0);
                        break;
                    case 'mean':
                        aggregated[as || `${column}_mean`] = values.length > 0 
                            ? values.reduce((a, b) => a + b, 0) / values.length 
                            : 0;
                        break;
                    case 'count':
                        aggregated[as || `${column}_count`] = rows.length;
                        break;
                    case 'min':
                        aggregated[as || `${column}_min`] = Math.min(...values);
                        break;
                    case 'max':
                        aggregated[as || `${column}_max`] = Math.max(...values);
                        break;
                }
            }

            result.push(aggregated);
        }

        return result;
    }

    _pivot(data, index, columns, values) {
        const pivotMap = new Map();
        const columnSet = new Set();

        for (const row of data) {
            const indexKey = row[index];
            const columnKey = row[columns];
            const value = row[values];

            columnSet.add(columnKey);

            if (!pivotMap.has(indexKey)) {
                pivotMap.set(indexKey, { [index]: indexKey });
            }

            pivotMap.get(indexKey)[columnKey] = value;
        }

        return Array.from(pivotMap.values());
    }

    _calculate(data, newColumn, formula) {
        return data.map(row => {
            const newRow = { ...row };
            
            try {
                const value = this._evaluateFormula(row, formula);
                newRow[newColumn] = value;
            } catch (error) {
                newRow[newColumn] = null;
            }
            
            return newRow;
        });
    }

    _evaluateFormula(row, formula) {
        const variables = Object.keys(row);
        const values = Object.values(row);
        
        const fn = new Function(...variables, `return ${formula}`);
        return fn(...values);
    }
}

export const dataCleaner = new DataCleaner();
export const dataTransformer = new DataTransformer();
