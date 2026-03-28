export class Toolbar {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.buttons = new Map();
        this._render();
    }

    _render() {
        this.container.innerHTML = `
            <div class="toolbar">
                <div class="toolbar-left">
                    <div class="toolbar-group">
                        <span class="group-label">文件</span>
                        <button class="toolbar-btn" data-action="new" title="新建项目">
                            <span class="icon">📄</span>
                            <span class="text">新建</span>
                        </button>
                        <button class="toolbar-btn" data-action="open" title="打开项目">
                            <span class="icon">📂</span>
                            <span class="text">打开</span>
                        </button>
                        <button class="toolbar-btn" data-action="save" title="保存项目">
                            <span class="icon">💾</span>
                            <span class="text">保存</span>
                        </button>
                    </div>
                    <div class="toolbar-divider"></div>
                    <div class="toolbar-group">
                        <span class="group-label">数据</span>
                        <button class="toolbar-btn" data-action="import" title="导入数据文件">
                            <span class="icon">📥</span>
                            <span class="text">导入数据</span>
                        </button>
                        <button class="toolbar-btn" data-action="paste" title="粘贴数据 (Ctrl+V)">
                            <span class="icon">📋</span>
                            <span class="text">粘贴数据</span>
                        </button>
                    </div>
                    <div class="toolbar-divider"></div>
                    <div class="toolbar-group">
                        <span class="group-label">编辑</span>
                        <button class="toolbar-btn" data-action="undo" title="撤销 (Ctrl+Z)" disabled>
                            <span class="icon">↩️</span>
                        </button>
                        <button class="toolbar-btn" data-action="redo" title="重做 (Ctrl+Y)" disabled>
                            <span class="icon">↪️</span>
                        </button>
                    </div>
                </div>
                <div class="toolbar-center">
                    <span class="project-name" id="projectName">未命名项目</span>
                </div>
                <div class="toolbar-right">
                    <div class="toolbar-group">
                        <span class="group-label">导出</span>
                        <button class="toolbar-btn" data-action="export-png" title="导出为PNG">
                            <span class="icon">🖼️</span>
                            <span class="text">PNG</span>
                        </button>
                        <button class="toolbar-btn" data-action="export-svg" title="导出为SVG">
                            <span class="icon">📐</span>
                            <span class="text">SVG</span>
                        </button>
                        <button class="toolbar-btn primary" data-action="export" title="导出图表">
                            <span class="icon">📤</span>
                            <span class="text">导出</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (this.options.onAction) {
                    this.options.onAction(action);
                }
            });
        });
    }

    setProjectName(name) {
        const el = this.container.querySelector('#projectName');
        if (el) el.textContent = name;
    }

    setUndoEnabled(enabled) {
        const btn = this.container.querySelector('[data-action="undo"]');
        if (btn) btn.disabled = !enabled;
    }

    setRedoEnabled(enabled) {
        const btn = this.container.querySelector('[data-action="redo"]');
        if (btn) btn.disabled = !enabled;
    }
}

export class Sidebar {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.collapsed = false;
        this.charts = [];
        this.activeChartId = null;
        this._render();
    }

    _render() {
        this.container.innerHTML = `
            <div class="sidebar ${this.collapsed ? 'collapsed' : ''}">
                <div class="sidebar-header">
                    <div class="sidebar-title">
                        <span class="icon">📊</span>
                        <span class="text">图表管理</span>
                    </div>
                    <button class="sidebar-toggle" title="折叠">
                        <span class="icon">◀</span>
                    </button>
                </div>
                <div class="sidebar-content">
                    <div class="panel-section">
                        <div class="section-header">
                            <span class="title">数据预览</span>
                        </div>
                        <div class="data-preview" id="dataPreview">
                            <div class="empty-state">
                                <span class="icon">📁</span>
                                <span class="text">点击顶部"导入数据"开始</span>
                            </div>
                        </div>
                    </div>
                    <div class="panel-section">
                        <div class="section-header">
                            <span class="title">已生成图表</span>
                            <button class="btn-icon" id="generateAllChartsBtn" title="生成所有类型图表">⚡</button>
                        </div>
                        <div class="charts-list" id="chartsList">
                            <div class="empty-state">
                                <span class="icon">📈</span>
                                <span class="text">导入数据后生成图表</span>
                            </div>
                        </div>
                    </div>
                    <div class="panel-section">
                        <button class="btn-generate-chart" id="generateChartBtn">
                            <span class="icon">📊</span>
                            <span class="text">智能生成图表</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this._bindEvents();
    }

    _bindEvents() {
        const toggleBtn = this.container.querySelector('.sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.collapsed = !this.collapsed;
                this._updateCollapsed();
            });
        }

        const generateBtn = this.container.querySelector('#generateChartBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                if (this.options.onAction) {
                    this.options.onAction('generate-chart');
                }
            });
        }

        const generateAllBtn = this.container.querySelector('#generateAllChartsBtn');
        if (generateAllBtn) {
            generateAllBtn.addEventListener('click', () => {
                if (this.options.onAction) {
                    this.options.onAction('generate-all-charts');
                }
            });
        }
    }

    _updateCollapsed() {
        const sidebar = this.container.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed', this.collapsed);
        }
    }

    setDataPreview(headers, data) {
        const preview = this.container.querySelector('#dataPreview');
        if (!preview) return;

        if (!data || data.length === 0) {
            preview.innerHTML = `
                <div class="empty-state">
                    <span class="icon">📁</span>
                    <span class="text">点击顶部"导入数据"开始</span>
                </div>
            `;
            return;
        }

        const displayData = data.slice(0, 5);
        const displayHeaders = headers || Object.keys(data[0] || {});

        preview.innerHTML = `
            <div class="preview-info">
                <span class="rows">${data.length} 行数据</span>
                <span class="cols">${displayHeaders.length} 列</span>
            </div>
            <div class="preview-table-wrapper">
                <table class="preview-table">
                    <thead>
                        <tr>
                            ${displayHeaders.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${displayData.map(row => `
                            <tr>
                                ${displayHeaders.map(h => `<td>${row[h] !== null ? row[h] : '-'}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setChartsList(charts, activeId) {
        this.charts = charts;
        this.activeChartId = activeId;
        const list = this.container.querySelector('#chartsList');
        if (!list) return;

        if (!charts || charts.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <span class="icon">📈</span>
                    <span class="text">导入数据后生成图表</span>
                </div>
            `;
            return;
        }

        list.innerHTML = charts.map(chart => `
            <div class="chart-item ${chart.id === activeId ? 'active' : ''}" data-id="${chart.id}">
                <span class="chart-icon">${this._getChartIcon(chart.type)}</span>
                <div class="chart-info">
                    <span class="chart-name">${chart.name || this._getChartName(chart.type)}</span>
                    <span class="chart-type">${this._getChartName(chart.type)}</span>
                </div>
                <button class="chart-delete" data-id="${chart.id}" title="删除">×</button>
            </div>
        `).join('');

        list.querySelectorAll('.chart-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('chart-delete')) {
                    e.stopPropagation();
                    if (this.options.onChartDelete) {
                        this.options.onChartDelete(item.dataset.id);
                    }
                } else {
                    if (this.options.onChartSelect) {
                        this.options.onChartSelect(item.dataset.id);
                    }
                }
            });
        });
    }

    setActiveChart(chartId) {
        this.activeChartId = chartId;
        this.container.querySelectorAll('.chart-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === chartId);
        });
    }

    _getChartIcon(type) {
        const icons = {
            bar: '📊',
            line: '📈',
            pie: '🥧',
            scatter: '⚬',
            radar: '🎯',
            area: '🏔️'
        };
        return icons[type] || '📊';
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

    collapse() {
        this.collapsed = true;
        this._updateCollapsed();
    }

    expand() {
        this.collapsed = false;
        this._updateCollapsed();
    }
}
                    this.options.onTabChange(this.activeTab);
                }
            });
        });

        const toggleBtn = this.container.querySelector('.sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.collapsed = !this.collapsed;
                this._updateCollapsed();
                if (this.options.onToggle) {
                    this.options.onToggle(this.collapsed);
                }
            });
        }

        this.container.querySelectorAll('.btn-icon').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (this.options.onAction) {
                    this.options.onAction(action);
                }
            });
        });

        const generateBtn = this.container.querySelector('#generateChartBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                if (this.options.onAction) {
                    this.options.onAction('generate-chart');
                }
            });
        }
    }

    _updateTabs() {
        this.container.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === this.activeTab);
        });
        this.container.querySelectorAll('.sidebar-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === this.activeTab);
        });
    }

    _updateCollapsed() {
        const sidebar = this.container.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed', this.collapsed);
        }
        const icon = this.container.querySelector('.sidebar-toggle .icon');
        if (icon) {
            icon.textContent = this.collapsed ? '▶' : '◀';
        }
    }

    setDataSources(sources, activeId) {
        const list = this.container.querySelector('#dataSourcesList');
        if (!list) return;

        if (!sources || sources.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <span class="icon">📁</span>
                    <span class="text">拖入文件或点击导入</span>
                </div>
            `;
            return;
        }

        list.innerHTML = sources.map(source => `
            <div class="data-source-item ${source.id === activeId ? 'active' : ''}" data-id="${source.id}">
                <span class="icon">📄</span>
                <span class="name">${source.name}</span>
                <span class="size">${this._formatSize(source.size)}</span>
                <button class="btn-remove" data-id="${source.id}" title="移除">×</button>
            </div>
        `).join('');

        list.querySelectorAll('.data-source-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-remove')) {
                    if (this.options.onSourceSelect) {
                        this.options.onSourceSelect(item.dataset.id);
                    }
                }
            });
        });

        list.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.options.onSourceRemove) {
                    this.options.onSourceRemove(btn.dataset.id);
                }
            });
        });
    }

    setDataPreview(headers, data) {
        const preview = this.container.querySelector('#dataPreview');
        if (!preview) return;

        if (!data || data.length === 0) {
            preview.innerHTML = `<div class="empty-state"><span class="text">暂无数据</span></div>`;
            return;
        }

        const displayData = data.slice(0, 10);
        
        preview.innerHTML = `
            <div class="preview-info">${data.length} 行 × ${headers.length} 列</div>
            <div class="preview-table-wrapper">
                <table class="preview-table">
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${displayData.map(row => `
                            <tr>
                                ${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${data.length > 10 ? `<div class="preview-more">显示前 10 行，共 ${data.length} 行</div>` : ''}
        `;
    }

    setChartsList(charts, activeId) {
        const list = this.container.querySelector('#chartsList');
        if (!list) return;

        if (!charts || charts.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <span class="icon">📈</span>
                    <span class="text">暂无图表</span>
                </div>
            `;
            return;
        }

        list.innerHTML = charts.map(chart => `
            <div class="chart-item ${chart.id === activeId ? 'active' : ''}" data-id="${chart.id}">
                <div class="chart-thumbnail" data-type="${chart.type}"></div>
                <span class="chart-name">${chart.name}</span>
            </div>
        `).join('');

        list.querySelectorAll('.chart-item').forEach(item => {
            item.addEventListener('click', () => {
                if (this.options.onChartSelect) {
                    this.options.onChartSelect(item.dataset.id);
                }
            });
        });
    }

    _formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

export class ConfigPanel {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.collapsed = false;
        this._render();
    }

    _render() {
        this.container.innerHTML = `
            <div class="config-panel ${this.collapsed ? 'collapsed' : ''}">
                <div class="config-header">
                    <span class="title">配置</span>
                    <button class="config-toggle" title="折叠">
                        <span class="icon">▶</span>
                    </button>
                </div>
                <div class="config-content">
                    <div class="config-section">
                        <div class="section-title">图表类型</div>
                        <div class="chart-types" id="chartTypes">
                            <button class="chart-type-btn active" data-type="bar" title="柱状图">
                                <span class="icon">📊</span>
                            </button>
                            <button class="chart-type-btn" data-type="line" title="折线图">
                                <span class="icon">📈</span>
                            </button>
                            <button class="chart-type-btn" data-type="pie" title="饼图">
                                <span class="icon">🥧</span>
                            </button>
                            <button class="chart-type-btn" data-type="scatter" title="散点图">
                                <span class="icon">⚬</span>
                            </button>
                            <button class="chart-type-btn" data-type="radar" title="雷达图">
                                <span class="icon">🎯</span>
                            </button>
                            <button class="chart-type-btn" data-type="area" title="面积图">
                                <span class="icon">🏔️</span>
                            </button>
                        </div>
                    </div>
                    <div class="config-section">
                        <div class="section-title">AI 推荐</div>
                        <div class="ai-recommendation" id="aiRecommendation">
                            <div class="empty-state">
                                <span class="text">导入数据后显示推荐</span>
                            </div>
                        </div>
                    </div>
                    <div class="config-section">
                        <div class="section-title">标题</div>
                        <input type="text" class="config-input" id="chartTitle" placeholder="图表标题">
                        <input type="text" class="config-input" id="chartSubtitle" placeholder="副标题（可选）">
                    </div>
                    <div class="config-section">
                        <div class="section-title">配色方案</div>
                        <div class="color-schemes" id="colorSchemes">
                            <button class="color-scheme-btn active" data-scheme="default">
                                <span class="preview" style="background: linear-gradient(90deg, #6366f1, #22c55e, #f59e0b)"></span>
                            </button>
                            <button class="color-scheme-btn" data-scheme="warm">
                                <span class="preview" style="background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)"></span>
                            </button>
                            <button class="color-scheme-btn" data-scheme="cool">
                                <span class="preview" style="background: linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)"></span>
                            </button>
                            <button class="color-scheme-btn" data-scheme="mono">
                                <span class="preview" style="background: linear-gradient(90deg, #64748b, #94a3b8, #cbd5e1)"></span>
                            </button>
                        </div>
                    </div>
                    <div class="config-section">
                        <div class="section-title">显示选项</div>
                        <label class="config-checkbox">
                            <input type="checkbox" id="showLegend" checked>
                            <span>显示图例</span>
                        </label>
                        <label class="config-checkbox">
                            <input type="checkbox" id="showTooltip" checked>
                            <span>显示提示</span>
                        </label>
                        <label class="config-checkbox">
                            <input type="checkbox" id="enableAnimation" checked>
                            <span>启用动画</span>
                        </label>
                    </div>
                </div>
            </div>
        `;

        this._bindEvents();
    }

    _bindEvents() {
        const toggleBtn = this.container.querySelector('.config-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.collapsed = !this.collapsed;
                this._updateCollapsed();
                if (this.options.onToggle) {
                    this.options.onToggle(this.collapsed);
                }
            });
        }

        this.container.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (this.options.onChartTypeChange) {
                    this.options.onChartTypeChange(btn.dataset.type);
                }
            });
        });

        this.container.querySelectorAll('.color-scheme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.color-scheme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (this.options.onColorSchemeChange) {
                    this.options.onColorSchemeChange(btn.dataset.scheme);
                }
            });
        });

        ['chartTitle', 'chartSubtitle'].forEach(id => {
            const input = this.container.querySelector(`#${id}`);
            if (input) {
                input.addEventListener('input', () => {
                    if (this.options.onConfigChange) {
                        this.options.onConfigChange(id, input.value);
                    }
                });
            }
        });

        ['showLegend', 'showTooltip', 'enableAnimation'].forEach(id => {
            const checkbox = this.container.querySelector(`#${id}`);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    if (this.options.onConfigChange) {
                        this.options.onConfigChange(id, checkbox.checked);
                    }
                });
            }
        });
    }

    _updateCollapsed() {
        const panel = this.container.querySelector('.config-panel');
        if (panel) {
            panel.classList.toggle('collapsed', this.collapsed);
        }
        const icon = this.container.querySelector('.config-toggle .icon');
        if (icon) {
            icon.textContent = this.collapsed ? '◀' : '▶';
        }
    }

    setChartType(type) {
        this.container.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
    }

    setRecommendation(recommendations) {
        const el = this.container.querySelector('#aiRecommendation');
        if (!el) return;

        if (!recommendations || recommendations.length === 0) {
            el.innerHTML = `<div class="empty-state"><span class="text">导入数据后显示推荐</span></div>`;
            return;
        }

        el.innerHTML = recommendations.slice(0, 3).map((rec, i) => `
            <div class="recommendation-item ${i === 0 ? 'primary' : ''}" data-type="${rec.type}">
                <span class="icon">${this._getChartIcon(rec.type)}</span>
                <div class="info">
                    <span class="name">${this._getChartName(rec.type)}</span>
                    <span class="reason">${rec.reason}</span>
                </div>
                <span class="confidence">${Math.round(rec.confidence * 100)}%</span>
            </div>
        `).join('');

        el.querySelectorAll('.recommendation-item').forEach(item => {
            item.addEventListener('click', () => {
                if (this.options.onRecommendationSelect) {
                    this.options.onRecommendationSelect(item.dataset.type);
                }
            });
        });
    }

    _getChartIcon(type) {
        const icons = {
            bar: '📊',
            line: '📈',
            pie: '🥧',
            scatter: '⚬',
            radar: '🎯',
            area: '🏔️'
        };
        return icons[type] || '📊';
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

export class DropOverlay {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.visible = false;
        this._render();
    }

    _render() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'drop-overlay';
        this.overlay.innerHTML = `
            <div class="drop-content">
                <span class="icon">📥</span>
                <span class="text">释放文件以导入数据</span>
                <span class="hint">支持 CSV、Excel、JSON 格式</span>
            </div>
        `;
        this.overlay.style.display = 'none';
        this.container.appendChild(this.overlay);
    }

    show() {
        this.visible = true;
        this.overlay.style.display = 'flex';
    }

    hide() {
        this.visible = false;
        this.overlay.style.display = 'none';
    }

    destroy() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
}

export class Toast {
    constructor(container) {
        this.container = container || document.body;
        this.toasts = [];
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this._getIcon(type)}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">×</button>
        `;

        this.container.appendChild(toast);
        this.toasts.push(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this._remove(toast));

        if (duration > 0) {
            setTimeout(() => this._remove(toast), duration);
        }

        return toast;
    }

    _remove(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    _getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    clear() {
        this.toasts.forEach(toast => this._remove(toast));
    }
}

export const toast = new Toast();
