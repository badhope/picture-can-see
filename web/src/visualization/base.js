import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export class ChartBase {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        this.options = {
            width: options.width || 800,
            height: options.height || 500,
            margin: options.margin || { top: 40, right: 30, bottom: 50, left: 60 },
            ...options
        };
        
        this.svg = null;
        this.chartArea = null;
        this.data = null;
    }

    init() {
        this.container.innerHTML = '';
        
        const rect = this.container.getBoundingClientRect();
        this.options.width = rect.width > 0 ? rect.width : this.options.width;
        this.options.height = rect.height > 0 ? rect.height : this.options.height;
        
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.options.width} ${this.options.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('class', 'chart-svg');
        
        this.chartArea = this.svg.append('g')
            .attr('class', 'chart-area')
            .attr('transform', `translate(${this.options.margin.left},${this.options.margin.top})`);
        
        this.innerWidth = this.options.width - this.options.margin.left - this.options.margin.right;
        this.innerHeight = this.options.height - this.options.margin.top - this.options.margin.bottom;
        
        this._setupDefs();
    }

    _setupDefs() {
        const defs = this.svg.append('defs');
        
        const gradient = defs.append('linearGradient')
            .attr('id', 'chart-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');
        
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'var(--primary, #6366f1)')
            .attr('stop-opacity', 0.8);
        
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'var(--primary, #6366f1)')
            .attr('stop-opacity', 0.3);
    }

    setData(data) {
        this.data = data;
    }

    render() {
        throw new Error('render() must be implemented by subclass');
    }

    resize(width, height) {
        this.options.width = width;
        this.options.height = height;
        
        this.svg
            .attr('width', width)
            .attr('height', height);
        
        this.innerWidth = width - this.options.margin.left - this.options.margin.right;
        this.innerHeight = height - this.options.margin.top - this.options.margin.bottom;
        
        this.chartArea.attr('transform', `translate(${this.options.margin.left},${this.options.margin.top})`);
        
        if (this.data) {
            this.render();
        }
    }

    clear() {
        if (this.chartArea) {
            this.chartArea.selectAll('*').remove();
        }
    }

    destroy() {
        if (this.svg) {
            this.svg.remove();
            this.svg = null;
        }
        if (this.container) {
            const tooltips = this.container.querySelectorAll('.chart-tooltip');
            tooltips.forEach(t => t.remove());
        }
        this.chartArea = null;
        this.data = null;
    }

    setTitle(title, subtitle) {
        this.svg.selectAll('.chart-title').remove();
        
        const titleGroup = this.svg.append('g')
            .attr('class', 'chart-title');
        
        if (title) {
            titleGroup.append('text')
                .attr('x', this.options.width / 2)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .attr('class', 'title-text')
                .style('font-size', '18px')
                .style('font-weight', 'bold')
                .style('fill', 'var(--text-primary, #f1f5f9)')
                .text(title);
        }
        
        if (subtitle) {
            titleGroup.append('text')
                .attr('x', this.options.width / 2)
                .attr('y', 38)
                .attr('text-anchor', 'middle')
                .attr('class', 'subtitle-text')
                .style('font-size', '12px')
                .style('fill', 'var(--text-secondary, #94a3b8)')
                .text(subtitle);
        }
    }
}
