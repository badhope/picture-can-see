import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { ChartBase } from './base.js';

export class BarChart extends ChartBase {
    constructor(container, options = {}) {
        super(container, {
            ...options,
            margin: options.margin || { top: 60, right: 30, bottom: 80, left: 60 }
        });
        this.orientation = options.orientation || 'vertical';
    }

    render() {
        this.clear();
        
        if (!this.data || this.data.length === 0) return;
        
        const headers = Object.keys(this.data[0]);
        const categoryKey = headers[0];
        const valueKeys = headers.slice(1).filter(h => typeof this.data[0][h] === 'number');
        
        if (valueKeys.length === 0) {
            valueKeys.push(headers[1] || headers[0]);
        }
        
        const categories = this.data.map(d => d[categoryKey]);
        const colors = d3.scaleOrdinal()
            .domain(valueKeys)
            .range(['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']);
        
        if (this.orientation === 'vertical') {
            this._renderVertical(categoryKey, valueKeys, categories, colors);
        } else {
            this._renderHorizontal(categoryKey, valueKeys, categories, colors);
        }
    }

    _renderVertical(categoryKey, valueKeys, categories, colors) {
        const x = d3.scaleBand()
            .domain(categories)
            .range([0, this.innerWidth])
            .padding(0.2);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d3.max(valueKeys, k => d[k] || 0)) * 1.1])
            .nice()
            .range([this.innerHeight, 0]);
        
        this.chartArea.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.innerHeight})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end')
            .style('fill', 'var(--text-secondary, #94a3b8)');
        
        this.chartArea.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).ticks(10))
            .selectAll('text')
            .style('fill', 'var(--text-secondary, #94a3b8)');
        
        this.chartArea.selectAll('.domain').style('stroke', 'var(--border-color, #334155)');
        this.chartArea.selectAll('.tick line').style('stroke', 'var(--border-color, #334155)');
        
        valueKeys.forEach((key, keyIndex) => {
            const barWidth = x.bandwidth() / valueKeys.length;
            
            this.chartArea.selectAll(`.bar-${keyIndex}`)
                .data(this.data)
                .enter()
                .append('rect')
                .attr('class', `bar bar-${keyIndex}`)
                .attr('x', d => x(d[categoryKey]) + keyIndex * barWidth)
                .attr('y', this.innerHeight)
                .attr('width', barWidth - 2)
                .attr('height', 0)
                .attr('fill', colors(key))
                .attr('rx', 4)
                .attr('opacity', 0.9)
                .transition()
                .duration(750)
                .delay((d, i) => i * 50)
                .attr('y', d => y(d[key] || 0))
                .attr('height', d => this.innerHeight - y(d[key] || 0));
        });
        
        this._addTooltip(categoryKey, valueKeys, x, y);
    }

    _renderHorizontal(categoryKey, valueKeys, categories, colors) {
        const x = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d3.max(valueKeys, k => d[k] || 0)) * 1.1])
            .nice()
            .range([0, this.innerWidth]);
        
        const y = d3.scaleBand()
            .domain(categories)
            .range([0, this.innerHeight])
            .padding(0.2);
        
        this.chartArea.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.innerHeight})`)
            .call(d3.axisBottom(x).ticks(10))
            .selectAll('text')
            .style('fill', 'var(--text-secondary, #94a3b8)');
        
        this.chartArea.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y))
            .selectAll('text')
            .style('fill', 'var(--text-secondary, #94a3b8)');
        
        this.chartArea.selectAll('.domain').style('stroke', 'var(--border-color, #334155)');
        this.chartArea.selectAll('.tick line').style('stroke', 'var(--border-color, #334155)');
        
        valueKeys.forEach((key, keyIndex) => {
            const barHeight = y.bandwidth() / valueKeys.length;
            
            this.chartArea.selectAll(`.bar-${keyIndex}`)
                .data(this.data)
                .enter()
                .append('rect')
                .attr('class', `bar bar-${keyIndex}`)
                .attr('x', 0)
                .attr('y', d => y(d[categoryKey]) + keyIndex * barHeight)
                .attr('width', 0)
                .attr('height', barHeight - 2)
                .attr('fill', colors(key))
                .attr('rx', 4)
                .attr('opacity', 0.9)
                .transition()
                .duration(750)
                .delay((d, i) => i * 50)
                .attr('width', d => x(d[key] || 0));
        });
    }

    _addTooltip(categoryKey, valueKeys, x, y) {
        const tooltip = d3.select(this.container)
            .append('div')
            .attr('class', 'chart-tooltip')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', 'rgba(30, 41, 59, 0.95)')
            .style('border', '1px solid var(--border-color, #334155)')
            .style('border-radius', '8px')
            .style('padding', '12px')
            .style('font-size', '13px')
            .style('color', 'var(--text-primary, #f1f5f9)')
            .style('pointer-events', 'none')
            .style('z-index', '1000');
        
        this.chartArea.selectAll('.bar')
            .on('mouseover', (event, d) => {
                const values = valueKeys.map(k => `${k}: ${d[k]}`).join('<br>');
                tooltip
                    .html(`<strong>${d[categoryKey]}</strong><br>${values}`)
                    .style('visibility', 'visible');
            })
            .on('mousemove', (event) => {
                tooltip
                    .style('top', `${event.offsetY - 10}px`)
                    .style('left', `${event.offsetX + 10}px`);
            })
            .on('mouseout', () => {
                tooltip.style('visibility', 'hidden');
            });
    }
}

export class LineChart extends ChartBase {
    constructor(container, options = {}) {
        super(container, {
            ...options,
            margin: options.margin || { top: 60, right: 60, bottom: 80, left: 60 }
        });
        this.showArea = options.showArea || false;
        this.showPoints = options.showPoints !== false;
        this.smooth = options.smooth || false;
    }

    render() {
        this.clear();
        
        if (!this.data || this.data.length === 0) return;
        
        const headers = Object.keys(this.data[0]);
        const categoryKey = headers[0];
        const valueKeys = headers.slice(1).filter(h => typeof this.data[0][h] === 'number');
        
        if (valueKeys.length === 0) {
            valueKeys.push(headers[1] || headers[0]);
        }
        
        const categories = this.data.map(d => d[categoryKey]);
        
        const x = d3.scalePoint()
            .domain(categories)
            .range([0, this.innerWidth]);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d3.max(valueKeys, k => d[k] || 0)) * 1.1])
            .nice()
            .range([this.innerHeight, 0]);
        
        const colors = d3.scaleOrdinal()
            .domain(valueKeys)
            .range(['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']);
        
        this.chartArea.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.innerHeight})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end')
            .style('fill', 'var(--text-secondary, #94a3b8)');
        
        this.chartArea.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).ticks(10))
            .selectAll('text')
            .style('fill', 'var(--text-secondary, #94a3b8)');
        
        this.chartArea.selectAll('.domain').style('stroke', 'var(--border-color, #334155)');
        this.chartArea.selectAll('.tick line').style('stroke', 'var(--border-color, #334155)');
        
        this.chartArea.append('g')
            .attr('class', 'grid')
            .selectAll('line')
            .data(y.ticks(10))
            .enter()
            .append('line')
            .attr('x1', 0)
            .attr('x2', this.innerWidth)
            .attr('y1', d => y(d))
            .attr('y2', d => y(d))
            .attr('stroke', 'var(--border-color, #334155)')
            .attr('stroke-opacity', 0.3);
        
        const line = d3.line()
            .x(d => x(d[categoryKey]))
            .y((d, i, data) => y(d[data.key] || 0))
            .curve(this.smooth ? d3.curveMonotoneX : d3.curveLinear);
        
        const area = d3.area()
            .x(d => x(d[categoryKey]))
            .y0(this.innerHeight)
            .y1((d, i, data) => y(d[data.key] || 0))
            .curve(this.smooth ? d3.curveMonotoneX : d3.curveLinear);
        
        valueKeys.forEach(key => {
            const lineData = this.data.map(d => ({ ...d, key }));
            
            if (this.showArea) {
                this.chartArea.append('path')
                    .datum(lineData)
                    .attr('class', `area area-${key}`)
                    .attr('d', area)
                    .attr('fill', colors(key))
                    .attr('opacity', 0.2);
            }
            
            const path = this.chartArea.append('path')
                .datum(lineData)
                .attr('class', `line line-${key}`)
                .attr('fill', 'none')
                .attr('stroke', colors(key))
                .attr('stroke-width', 2.5)
                .attr('d', line);
            
            const totalLength = path.node().getTotalLength();
            path
                .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
                .attr('stroke-dashoffset', totalLength)
                .transition()
                .duration(1500)
                .attr('stroke-dashoffset', 0);
            
            if (this.showPoints) {
                this.chartArea.selectAll(`.point-${key}`)
                    .data(this.data)
                    .enter()
                    .append('circle')
                    .attr('class', `point point-${key}`)
                    .attr('cx', d => x(d[categoryKey]))
                    .attr('cy', d => y(d[key] || 0))
                    .attr('r', 0)
                    .attr('fill', colors(key))
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2)
                    .transition()
                    .delay(1500)
                    .duration(300)
                    .attr('r', 5);
            }
        });
        
        this._addLegend(valueKeys, colors);
    }

    _addLegend(valueKeys, colors) {
        const legend = this.chartArea.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.innerWidth + 10}, 0)`);
        
        valueKeys.forEach((key, i) => {
            const g = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);
            
            g.append('line')
                .attr('x1', 0)
                .attr('x2', 20)
                .attr('y1', 0)
                .attr('y2', 0)
                .attr('stroke', colors(key))
                .attr('stroke-width', 2);
            
            g.append('text')
                .attr('x', 25)
                .attr('y', 4)
                .style('fill', 'var(--text-secondary, #94a3b8)')
                .style('font-size', '12px')
                .text(key);
        });
    }
}

export class PieChart extends ChartBase {
    constructor(container, options = {}) {
        super(container, {
            ...options,
            margin: options.margin || { top: 60, right: 100, bottom: 60, left: 60 }
        });
        this.innerRadius = options.innerRadius || 0;
        this.showLabels = options.showLabels !== false;
    }

    render() {
        this.clear();
        
        if (!this.data || this.data.length === 0) return;
        
        const headers = Object.keys(this.data[0]);
        const categoryKey = headers[0];
        const valueKey = headers.find(h => typeof this.data[0][h] === 'number') || headers[1];
        
        const radius = Math.min(this.innerWidth, this.innerHeight) / 2;
        const colors = d3.scaleOrdinal()
            .domain(this.data.map(d => d[categoryKey]))
            .range(['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']);
        
        const pie = d3.pie()
            .value(d => d[valueKey] || 0)
            .sort(null);
        
        const arc = d3.arc()
            .innerRadius(this.innerRadius * radius)
            .outerRadius(radius);
        
        const arcHover = d3.arc()
            .innerRadius(this.innerRadius * radius)
            .outerRadius(radius + 10);
        
        const labelArc = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius * 0.7);
        
        const g = this.chartArea.append('g')
            .attr('transform', `translate(${this.innerWidth / 2},${this.innerHeight / 2})`);
        
        const slices = g.selectAll('.slice')
            .data(pie(this.data))
            .enter()
            .append('g')
            .attr('class', 'slice');
        
        slices.append('path')
            .attr('d', arc)
            .attr('fill', d => colors(d.data[categoryKey]))
            .attr('stroke', 'var(--bg-primary, #0f172a)')
            .attr('stroke-width', 2)
            .style('opacity', 0.9)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', arcHover);
            })
            .on('mouseout', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', arc);
            })
            .transition()
            .duration(1000)
            .attrTween('d', function(d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return t => arc(interpolate(t));
            });
        
        if (this.showLabels) {
            slices.append('text')
                .attr('transform', d => `translate(${labelArc.centroid(d)})`)
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .style('fill', '#fff')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .style('opacity', 0)
                .text(d => {
                    const percent = (d.endAngle - d.startAngle) / (2 * Math.PI) * 100;
                    return percent > 5 ? `${percent.toFixed(1)}%` : '';
                })
                .transition()
                .delay(1000)
                .duration(300)
                .style('opacity', 1);
        }
        
        this._addLegend(g, categoryKey, colors, radius);
    }

    _addLegend(g, categoryKey, colors, radius) {
        const legend = g.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${radius + 30}, ${-radius})`);
        
        this.data.forEach((d, i) => {
            const item = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);
            
            item.append('rect')
                .attr('width', 12)
                .attr('height', 12)
                .attr('rx', 2)
                .attr('fill', colors(d[categoryKey]));
            
            item.append('text')
                .attr('x', 18)
                .attr('y', 10)
                .style('fill', 'var(--text-secondary, #94a3b8)')
                .style('font-size', '12px')
                .text(d[categoryKey]);
        });
    }
}

export class ScatterChart extends ChartBase {
    constructor(container, options = {}) {
        super(container, options);
        this.showRegression = options.showRegression || false;
    }

    render() {
        this.clear();
        
        if (!this.data || this.data.length === 0) return;
        
        const headers = Object.keys(this.data[0]);
        const numericKeys = headers.filter(h => typeof this.data[0][h] === 'number');
        
        if (numericKeys.length < 2) {
            console.error('Scatter chart requires at least 2 numeric columns');
            return;
        }
        
        const xKey = numericKeys[0];
        const yKey = numericKeys[1];
        const categoryKey = headers.find(h => typeof this.data[0][h] === 'string') || null;
        
        const x = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d[xKey]) * 1.1])
            .nice()
            .range([0, this.innerWidth]);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d[yKey]) * 1.1])
            .nice()
            .range([this.innerHeight, 0]);
        
        const colors = d3.scaleOrdinal()
            .domain(categoryKey ? [...new Set(this.data.map(d => d[categoryKey]))] : ['default'])
            .range(['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']);
        
        this.chartArea.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.innerHeight})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('fill', 'var(--text-secondary, #94a3b8)');
        
        this.chartArea.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y))
            .selectAll('text')
            .style('fill', 'var(--text-secondary, #94a3b8)');
        
        this.chartArea.selectAll('.domain').style('stroke', 'var(--border-color, #334155)');
        this.chartArea.selectAll('.tick line').style('stroke', 'var(--border-color, #334155)');
        
        this.chartArea.append('g')
            .attr('class', 'grid')
            .selectAll('line.horizontal')
            .data(y.ticks(10))
            .enter()
            .append('line')
            .attr('class', 'horizontal')
            .attr('x1', 0)
            .attr('x2', this.innerWidth)
            .attr('y1', d => y(d))
            .attr('y2', d => y(d))
            .attr('stroke', 'var(--border-color, #334155)')
            .attr('stroke-opacity', 0.3);
        
        this.chartArea.selectAll('.point')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('cx', d => x(d[xKey]))
            .attr('cy', d => y(d[yKey]))
            .attr('r', 0)
            .attr('fill', d => categoryKey ? colors(d[categoryKey]) : colors('default'))
            .attr('opacity', 0.7)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .transition()
            .duration(500)
            .delay((d, i) => i * 10)
            .attr('r', 6);
        
        if (this.showRegression) {
            this._addRegressionLine(xKey, yKey, x, y);
        }
    }

    _addRegressionLine(xKey, yKey, xScale, yScale) {
        const xValues = this.data.map(d => d[xKey]);
        const yValues = this.data.map(d => d[yKey]);
        
        const n = xValues.length;
        const sumX = xValues.reduce((a, b) => a + b, 0);
        const sumY = yValues.reduce((a, b) => a + b, 0);
        const sumXY = xValues.reduce((total, xi, i) => total + xi * yValues[i], 0);
        const sumX2 = xValues.reduce((total, xi) => total + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        
        this.chartArea.append('line')
            .attr('class', 'regression-line')
            .attr('x1', xScale(xMin))
            .attr('y1', yScale(slope * xMin + intercept))
            .attr('x2', xScale(xMax))
            .attr('y2', yScale(slope * xMax + intercept))
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0)
            .transition()
            .duration(500)
            .attr('opacity', 1);
    }
}

export class RadarChart extends ChartBase {
    constructor(container, options = {}) {
        super(container, {
            ...options,
            margin: options.margin || { top: 60, right: 60, bottom: 60, left: 60 }
        });
        this.levels = options.levels || 5;
    }

    render() {
        this.clear();
        
        if (!this.data || this.data.length === 0) return;
        
        const headers = Object.keys(this.data[0]);
        const categoryKey = headers[0];
        const valueKeys = headers.slice(1).filter(h => typeof this.data[0][h] === 'number');
        
        if (valueKeys.length < 3) {
            console.error('Radar chart requires at least 3 numeric columns');
            return;
        }
        
        const radius = Math.min(this.innerWidth, this.innerHeight) / 2;
        const angleSlice = (Math.PI * 2) / valueKeys.length;
        
        const maxValues = {};
        valueKeys.forEach(key => {
            maxValues[key] = d3.max(this.data, d => d[key]) * 1.1;
        });
        
        const rScale = d3.scaleLinear()
            .domain([0, d3.max(Object.values(maxValues))])
            .range([0, radius]);
        
        const g = this.chartArea.append('g')
            .attr('transform', `translate(${this.innerWidth / 2},${this.innerHeight / 2})`);
        
        for (let i = 1; i <= this.levels; i++) {
            g.append('circle')
                .attr('r', radius * i / this.levels)
                .attr('fill', 'none')
                .attr('stroke', 'var(--border-color, #334155)')
                .attr('stroke-opacity', 0.3);
        }
        
        const axis = g.selectAll('.axis')
            .data(valueKeys)
            .enter()
            .append('g')
            .attr('class', 'axis');
        
        axis.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', (d, i) => rScale(maxValues[d]) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('y2', (d, i) => rScale(maxValues[d]) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr('stroke', 'var(--border-color, #334155)')
            .attr('stroke-opacity', 0.5);
        
        axis.append('text')
            .attr('x', (d, i) => (radius + 20) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('y', (d, i) => (radius + 20) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .style('fill', 'var(--text-secondary, #94a3b8)')
            .style('font-size', '12px')
            .text(d => d);
        
        const colors = d3.scaleOrdinal()
            .domain(this.data.map(d => d[categoryKey]))
            .range(['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']);
        
        const radarLine = d3.lineRadial()
            .radius(d => rScale(d.value))
            .angle((d, i) => i * angleSlice)
            .curve(d3.curveLinearClosed);
        
        this.data.forEach((row, dataIndex) => {
            const values = valueKeys.map(key => ({
                key,
                value: row[key] || 0
            }));
            
            g.append('path')
                .datum(values)
                .attr('class', `radar-area radar-area-${dataIndex}`)
                .attr('d', radarLine)
                .attr('fill', colors(row[categoryKey]))
                .attr('fill-opacity', 0.2)
                .attr('stroke', colors(row[categoryKey]))
                .attr('stroke-width', 2)
                .attr('opacity', 0)
                .transition()
                .duration(1000)
                .attr('opacity', 1);
            
            g.selectAll(`.radar-point-${dataIndex}`)
                .data(values)
                .enter()
                .append('circle')
                .attr('class', `radar-point radar-point-${dataIndex}`)
                .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
                .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
                .attr('r', 4)
                .attr('fill', colors(row[categoryKey]))
                .attr('stroke', '#fff')
                .attr('stroke-width', 2);
        });
    }
}
