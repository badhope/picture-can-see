import { typeDetector } from '../transform/detector.js';

export class ChartRecommender {
    constructor() {
        this.rules = [
            {
                name: 'bar',
                condition: (analysis) => {
                    const numericCount = Object.values(analysis).filter(a => 
                        ['integer', 'float', 'number'].includes(a.type)
                    ).length;
                    const categoryCount = Object.values(analysis).filter(a => 
                        a.type === 'string'
                    ).length;
                    
                    return categoryCount >= 1 && numericCount >= 1;
                },
                reason: '适合比较不同类别的数值大小',
                priority: 1
            },
            {
                name: 'line',
                condition: (analysis) => {
                    const headers = Object.keys(analysis);
                    const hasDate = headers.some(h => 
                        ['date', 'datetime', 'time'].includes(analysis[h].type)
                    );
                    const hasNumeric = Object.values(analysis).some(a => 
                        ['integer', 'float', 'number'].includes(a.type)
                    );
                    
                    return hasDate && hasNumeric;
                },
                reason: '适合展示时间序列数据的趋势变化',
                priority: 2
            },
            {
                name: 'pie',
                condition: (analysis) => {
                    const numericCount = Object.values(analysis).filter(a => 
                        ['integer', 'float', 'number'].includes(a.type)
                    ).length;
                    const categoryCount = Object.values(analysis).filter(a => 
                        a.type === 'string'
                    ).length;
                    const rows = Object.values(analysis)[0]?.stats?.total || 0;
                    
                    return categoryCount >= 1 && numericCount >= 1 && rows <= 10;
                },
                reason: '适合展示少量类别的占比分布',
                priority: 3
            },
            {
                name: 'scatter',
                condition: (analysis) => {
                    const numericCount = Object.values(analysis).filter(a => 
                        ['integer', 'float', 'number'].includes(a.type)
                    ).length;
                    
                    return numericCount >= 2;
                },
                reason: '适合分析两个数值变量之间的关系',
                priority: 2
            },
            {
                name: 'radar',
                condition: (analysis) => {
                    const numericCount = Object.values(analysis).filter(a => 
                        ['integer', 'float', 'number'].includes(a.type)
                    ).length;
                    
                    return numericCount >= 3 && numericCount <= 8;
                },
                reason: '适合多维度数据的综合对比',
                priority: 3
            },
            {
                name: 'area',
                condition: (analysis) => {
                    const headers = Object.keys(analysis);
                    const hasDate = headers.some(h => 
                        ['date', 'datetime', 'time'].includes(analysis[h].type)
                    );
                    const numericCount = Object.values(analysis).filter(a => 
                        ['integer', 'float', 'number'].includes(a.type)
                    ).length;
                    
                    return hasDate && numericCount >= 1;
                },
                reason: '适合展示累积趋势和数值大小',
                priority: 2
            }
        ];
    }

    recommend(data, headers) {
        if (!data || data.length === 0) {
            return [];
        }

        const analysis = typeDetector.analyze(data, headers);
        const recommendations = [];

        for (const rule of this.rules) {
            try {
                if (rule.condition(analysis)) {
                    recommendations.push({
                        type: rule.name,
                        reason: rule.reason,
                        priority: rule.priority,
                        confidence: this._calculateConfidence(rule, analysis)
                    });
                }
            } catch (error) {
                console.warn(`Rule ${rule.name} failed:`, error);
            }
        }

        recommendations.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return b.confidence - a.confidence;
        });

        return recommendations;
    }

    _calculateConfidence(rule, analysis) {
        let confidence = 0.5;
        
        const headers = Object.keys(analysis);
        const numericCount = headers.filter(h => 
            ['integer', 'float', 'number', 'percentage', 'currency'].includes(analysis[h].type)
        ).length;
        const categoryCount = headers.filter(h => 
            analysis[h].type === 'string'
        ).length;
        const dateCount = headers.filter(h => 
            ['date', 'datetime', 'time'].includes(analysis[h].type)
        ).length;

        switch (rule.name) {
            case 'bar':
                if (categoryCount >= 1 && numericCount >= 1) confidence += 0.3;
                if (numericCount <= 3) confidence += 0.1;
                break;
            case 'line':
                if (dateCount >= 1) confidence += 0.3;
                if (numericCount >= 1) confidence += 0.1;
                break;
            case 'pie':
                const rows = Object.values(analysis)[0]?.stats?.total || 0;
                if (rows <= 6) confidence += 0.3;
                else if (rows <= 10) confidence += 0.1;
                break;
            case 'scatter':
                if (numericCount >= 2) confidence += 0.3;
                if (numericCount >= 3) confidence += 0.1;
                break;
            case 'radar':
                if (numericCount >= 4 && numericCount <= 6) confidence += 0.3;
                break;
            case 'area':
                if (dateCount >= 1) confidence += 0.3;
                break;
        }

        return Math.min(confidence, 1);
    }

    getBestChart(data, headers) {
        const recommendations = this.recommend(data, headers);
        return recommendations.length > 0 ? recommendations[0] : null;
    }

    explainRecommendation(recommendation) {
        if (!recommendation) return '';
        
        return `推荐使用${this._getChartName(recommendation.type)}，因为：${recommendation.reason}`;
    }

    _getChartName(type) {
        const names = {
            bar: '柱状图',
            line: '折线图',
            pie: '饼图',
            scatter: '散点图',
            radar: '雷达图',
            area: '面积图'
        };
        return names[type] || type;
    }
}

export const chartRecommender = new ChartRecommender();
