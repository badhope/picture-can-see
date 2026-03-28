import { app, Events } from './core/app.js';
import { DataSourceManager } from './data/source.js';
import { DropZone, PasteHandler } from './data/input.js';
import { typeDetector } from './transform/detector.js';
import { chartRecommender } from './visualization/recommender.js';
import { BarChart, LineChart, PieChart, ScatterChart, RadarChart } from './visualization/charts.js';
import { exporter, projectExporter } from './export/exporter.js';
import { Toolbar, Sidebar, ConfigPanel, DropOverlay, Toast } from './ui/components.js';
import { t, setLanguage } from '../locales/index.js';

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.activeChartId = null;
        this.chartCounter = 0;
    }

    createChart(type, data, config = {}) {
        const id = `chart_${++this.chartCounter}`;
        const chart = {
            id,
            type,
            data,
            config,
            name: this._getChartName(type),
            createdAt: Date.now()
        };
        this.charts.set(id, chart);
        return chart;
    }

    getChart(id) {
        return this.charts.get(id);
    }

    getActiveChart() {
        if (!this.activeChartId) return null;
        return this.charts.get(this.activeChartId);
    }

    setActiveChart(id) {
        if (this.charts.has(id)) {
            this.activeChartId = id;
            return true;
        }
        return false;
    }

    removeChart(id) {
        if (id === this.activeChartId) {
            this.activeChartId = null;
        }
        return this.charts.delete(id);
    }

    getAllCharts() {
        return Array.from(this.charts.values());
    }

    clear() {
        this.charts.clear();
        this.activeChartId = null;
        this.chartCounter = 0;
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
        return names[type] || '图表';
    }
}

class Application {
    constructor() {
        this.chartManager = new ChartManager();
        this.currentChartInstance = null;
        this.toast = new Toast();
        this.rawData = null;
        this.headers = null;
    }

    async init() {
        await app.init();
        
        this._initUI();
        this._initDataLayer();
        this._initVisualization();
        this._initEventListeners();
        this._initKeyboardShortcuts();
        
        this.toast.show('欢迎使用 Picture Can See！点击顶部"导入数据"开始', 'info', 5000);
    }

    _initUI() {
        this.toolbar = new Toolbar(document.getElementById('toolbar'), {
            onAction: (action) => this._handleToolbarAction(action)
        });

        this.sidebar = new Sidebar(document.getElementById('sidebar'), {
            onChartSelect: (id) => this._handleChartSelect(id),
            onChartDelete: (id) => this._handleChartDelete(id),
            onAction: (action) => this._handleSidebarAction(action)
        });

        this.configPanel = new ConfigPanel(document.getElementById('configPanel'), {
            onToggle: (collapsed) => this._handleConfigToggle(collapsed),
            onChartTypeChange: (type) => this._handleChartTypeChange(type),
            onColorSchemeChange: (scheme) => this._handleColorSchemeChange(scheme),
            onConfigChange: (key, value) => this._handleConfigChange(key, value),
            onRecommendationSelect: (type) => this._handleChartTypeChange(type)
        });

        this.dropOverlay = new DropOverlay(document.getElementById('mainContent'));
        this.chartContainer = document.getElementById('chartContainer');
    }

    _initDataLayer() {
        this.dataSourceManager = new DataSourceManager(app);

        const dropZone = new DropZone(document.body, {
            accept: ['.csv', '.json', '.xlsx', '.xls', '.tsv', '.txt'],
            multiple: true,
            onDrop: (files) => this._handleFilesDrop(files),
            onDragEnter: () => this.dropOverlay.show(),
            onDragLeave: () => this.dropOverlay.hide()
        });

        const pasteHandler = new PasteHandler(document.body, {
            onPaste: (text, format) => this._handlePaste(text, format)
        });
    }

    _initVisualization() {
        this.chartFactories = {
            bar: (container) => new BarChart(container),
            line: (container) => new LineChart(container),
            pie: (container) => new PieChart(container),
            scatter: (container) => new ScatterChart(container),
            radar: (container) => new RadarChart(container),
            area: (container) => new LineChart(container, { showArea: true })
        };
    }

    _initEventListeners() {
        app.state.subscribe('data.rawData', (data) => {
            if (data) {
                this.rawData = data;
                this._updateDataPreview();
                this._updateRecommendations();
            }
        });

        app.state.subscribe('data.headers', (headers) => {
            this.headers = headers;
            this._updateDataPreview();
        });
    }

    _initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        this._handleToolbarAction('save');
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            app.state.redo();
                        } else {
                            app.state.undo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        app.state.redo();
                        break;
                    case 'o':
                        e.preventDefault();
                        this._handleToolbarAction('open');
                        break;
                    case 'v':
                        e.preventDefault();
                        this._handleToolbarAction('paste');
                        break;
                }
            }
        });
    }

    async _handleFilesDrop(files) {
        this.dropOverlay.hide();
        
        for (const file of files) {
            try {
                const source = await this.dataSourceManager.loadFile(file);
                if (source) {
                    this.toast.show(`成功导入: ${file.name}`, 'success');
                    this.rawData = app.state.get('data.rawData');
                    this.headers = app.state.get('data.headers');
                    this._updateDataPreview();
                    this._updateRecommendations();
                }
            } catch (error) {
                this.toast.show(`导入失败: ${error.message}`, 'error');
            }
        }
    }

    _handlePaste(text, format) {
        try {
            const source = this.dataSourceManager.loadFromText(text, format);
            if (source) {
                this.toast.show('数据已粘贴导入', 'success');
                this.rawData = app.state.get('data.rawData');
                this.headers = app.state.get('data.headers');
                this._updateDataPreview();
                this._updateRecommendations();
            }
        } catch (error) {
            this.toast.show(`粘贴导入失败: ${error.message}`, 'error');
        }
    }

    _handleToolbarAction(action) {
        switch (action) {
            case 'new':
                this._newProject();
                break;
            case 'open':
                this._openProject();
                break;
            case 'save':
                this._saveProject();
                break;
            case 'import':
                this._showImportDialog();
                break;
            case 'paste':
                this._handlePasteAction();
                break;
            case 'export':
                this._showExportDialog();
                break;
            case 'export-png':
                this._exportChart('png');
                break;
            case 'export-svg':
                this._exportChart('svg');
                break;
            case 'undo':
                app.state.undo();
                break;
            case 'redo':
                app.state.redo();
                break;
        }
    }

    _handleSidebarAction(action) {
        switch (action) {
            case 'generate-chart':
                this._generateSmartChart();
                break;
            case 'generate-all-charts':
                this._generateAllCharts();
                break;
        }
    }

    _handleChartSelect(chartId) {
        const chart = this.chartManager.getChart(chartId);
        if (chart) {
            this.chartManager.setActiveChart(chartId);
            this._renderChartInstance(chart);
            this.sidebar.setActiveChart(chartId);
            this.configPanel.setChartType(chart.type);
        }
    }

    _handleChartDelete(chartId) {
        this.chartManager.removeChart(chartId);
        this._updateChartsList();
        
        const charts = this.chartManager.getAllCharts();
        if (charts.length > 0) {
            this._handleChartSelect(charts[0].id);
        } else {
            this._showEmptyState();
        }
        
        this.toast.show('图表已删除', 'info');
    }

    _handleConfigToggle(collapsed) {
        app.state.set('ui.configPanelCollapsed', collapsed);
    }

    _handleChartTypeChange(type) {
        if (!this.rawData || this.rawData.length === 0) {
            this.toast.show('请先导入数据', 'warning');
            return;
        }

        const config = app.state.get('chart.config') || {};
        const chart = this.chartManager.createChart(type, this.rawData, config);
        
        this.chartManager.setActiveChart(chart.id);
        this._renderChartInstance(chart);
        this._updateChartsList();
        this.configPanel.setChartType(type);
    }

    _handleColorSchemeChange(scheme) {
        app.state.update({
            'chart.config.colorScheme': scheme
        });
        
        const activeChart = this.chartManager.getActiveChart();
        if (activeChart) {
            activeChart.config.colorScheme = scheme;
            this._renderChartInstance(activeChart);
        }
    }

    _handleConfigChange(key, value) {
        const configMap = {
            chartTitle: 'chart.config.title',
            chartSubtitle: 'chart.config.subtitle',
            showLegend: 'chart.config.enableLegend',
            showTooltip: 'chart.config.enableTooltip',
            enableAnimation: 'chart.config.animationDuration'
        };

        if (configMap[key]) {
            app.state.set(configMap[key], value);
            
            const activeChart = this.chartManager.getActiveChart();
            if (activeChart) {
                if (key === 'chartTitle') {
                    activeChart.config.title = value;
                } else if (key === 'chartSubtitle') {
                    activeChart.config.subtitle = value;
                }
                this._renderChartInstance(activeChart);
            }
        }
    }

    _showImportDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.json,.xlsx,.xls,.tsv,.txt';
        input.multiple = true;
        
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                await this._handleFilesDrop(files);
            }
        };
        
        input.click();
    }

    _handlePasteAction() {
        navigator.clipboard.readText().then(text => {
            if (text) {
                this._handlePaste(text, 'csv');
            } else {
                this.toast.show('剪贴板没有内容', 'warning');
            }
        }).catch(err => {
            this.toast.show('无法读取剪贴板', 'error');
        });
    }

    _updateDataPreview() {
        this.sidebar.setDataPreview(this.headers, this.rawData);
    }

    _updateChartsList() {
        const charts = this.chartManager.getAllCharts();
        const activeId = this.chartManager.activeChartId;
        this.sidebar.setChartsList(charts, activeId);
    }

    _updateRecommendations() {
        if (!this.rawData || !this.headers) return;

        const recommendations = chartRecommender.recommend(this.rawData, this.headers);
        this.configPanel.setRecommendation(recommendations);
    }

    _generateSmartChart() {
        if (!this.rawData || this.rawData.length === 0) {
            this.toast.show('请先导入数据', 'warning');
            return;
        }

        const recommendations = chartRecommender.recommend(this.rawData, this.headers);
        
        if (recommendations.length > 0) {
            const best = recommendations[0];
            this._handleChartTypeChange(best.type);
            this.toast.show(`已智能生成${this._getChartTypeName(best.type)}`, 'success');
        } else {
            this._handleChartTypeChange('bar');
            this.toast.show('已生成柱状图', 'success');
        }
    }

    _generateAllCharts() {
        if (!this.rawData || this.rawData.length === 0) {
            this.toast.show('请先导入数据', 'warning');
            return;
        }

        const recommendations = chartRecommender.recommend(this.rawData, this.headers);
        const types = recommendations.length > 0 
            ? recommendations.map(r => r.type)
            : ['bar', 'line', 'pie', 'scatter', 'radar', 'area'];

        const config = app.state.get('chart.config') || {};
        
        types.forEach((type, index) => {
            const chart = this.chartManager.createChart(type, this.rawData, config);
            if (index === 0) {
                this.chartManager.setActiveChart(chart.id);
            }
        });

        this._updateChartsList();
        
        const firstChart = this.chartManager.getAllCharts()[0];
        if (firstChart) {
            this._renderChartInstance(firstChart);
            this.configPanel.setChartType(firstChart.type);
        }

        this.toast.show(`已生成 ${types.length} 个图表`, 'success');
    }

    _renderChartInstance(chart) {
        if (!chart || !chart.data) {
            this._showEmptyState();
            return;
        }

        this._hideEmptyState();
        this._showLoading();

        requestAnimationFrame(() => {
            setTimeout(() => {
                try {
                    if (this.currentChartInstance) {
                        this.currentChartInstance.destroy();
                        this.currentChartInstance = null;
                    }

                    this.chartContainer.innerHTML = '';

                    const factory = this.chartFactories[chart.type];
                    if (!factory) {
                        console.error(`Unknown chart type: ${chart.type}`);
                        this._hideLoading();
                        return;
                    }

                    this.currentChartInstance = factory(this.chartContainer);
                    this.currentChartInstance.init();
                    this.currentChartInstance.setData(chart.data);
                    this.currentChartInstance.render();

                    if (chart.config.title || chart.config.subtitle) {
                        this.currentChartInstance.setTitle(chart.config.title, chart.config.subtitle);
                    }

                    this._hideLoading();
                } catch (error) {
                    console.error('Chart render error:', error);
                    this._hideLoading();
                    this.toast.show(`图表渲染失败: ${error.message}`, 'error');
                }
            }, 50);
        });
    }

    _showLoading() {
        let loader = document.getElementById('chartLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'chartLoader';
            loader.className = 'chart-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <span class="loader-text">加载中...</span>
                </div>
            `;
            this.chartContainer.parentNode.appendChild(loader);
        }
        loader.style.display = 'flex';
    }

    _hideLoading() {
        const loader = document.getElementById('chartLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    _showEmptyState() {
        const placeholder = document.getElementById('chartPlaceholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
        }
        if (this.chartContainer) {
            this.chartContainer.style.display = 'none';
        }
    }

    _hideEmptyState() {
        const placeholder = document.getElementById('chartPlaceholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        if (this.chartContainer) {
            this.chartContainer.style.display = 'block';
        }
    }

    _newProject() {
        if (app.state.get('project.modified')) {
            if (!confirm('当前项目未保存，是否继续新建？')) {
                return;
            }
        }

        this.dataSourceManager.clearAll();
        this.chartManager.clear();
        this.rawData = null;
        this.headers = null;

        if (this.currentChartInstance) {
            this.currentChartInstance.destroy();
            this.currentChartInstance = null;
        }

        app.state.update({
            'project.name': '未命名项目',
            'project.modified': false,
            'project.path': null
        });

        this._updateDataPreview();
        this._updateChartsList();
        this._showEmptyState();
        this.toast.show('已创建新项目', 'success');
    }

    async _openProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pcv,.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const project = await projectExporter.importProject(file);
                
                app.state.update({
                    'project.name': project.name,
                    'data.sources': project.data.sources,
                    'data.activeSourceId': project.data.activeSourceId,
                    'chart.type': project.chart.type,
                    'chart.config': project.chart.config
                });

                const activeSource = project.data.sources.find(
                    s => s.id === project.data.activeSourceId
                );

                if (activeSource) {
                    this.rawData = activeSource.data;
                    this.headers = activeSource.headers;
                    app.state.update({
                        'data.rawData': activeSource.data,
                        'data.headers': activeSource.headers
                    });
                }

                this._updateDataPreview();
                this.toast.show('项目加载成功', 'success');
            } catch (error) {
                this.toast.show(`加载失败: ${error.message}`, 'error');
            }
        };

        input.click();
    }

    async _saveProject() {
        const blob = projectExporter.exportProject(app.state);
        const name = app.state.get('project.name') || '未命名项目';
        exporter.download(blob, `${name}.pcv`);
        
        app.state.set('project.modified', false);
        this.toast.show('项目已保存', 'success');
    }

    _exportChart(format) {
        if (!this.currentChartInstance) {
            this.toast.show('请先创建图表', 'warning');
            return;
        }

        try {
            const svgElement = this.chartContainer.querySelector('svg');
            if (!svgElement) {
                this.toast.show('图表未渲染完成', 'warning');
                return;
            }

            exporter.export(svgElement, format).then(blob => {
                const name = app.state.get('project.name') || 'chart';
                exporter.download(blob, `${name}.${format}`);
                this.toast.show(`已导出为 ${format.toUpperCase()}`, 'success');
            }).catch(error => {
                this.toast.show(`导出失败: ${error.message}`, 'error');
            });
        } catch (error) {
            this.toast.show(`导出失败: ${error.message}`, 'error');
        }
    }

    async _showExportDialog() {
        if (!this.currentChartInstance) {
            this.toast.show('请先创建图表', 'warning');
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'export-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>导出图表</h3>
                    <button class="dialog-close">×</button>
                </div>
                <div class="dialog-body">
                    <div class="export-options">
                        <button class="export-option" data-format="png">
                            <span class="icon">🖼️</span>
                            <span class="label">PNG 图片</span>
                        </button>
                        <button class="export-option" data-format="svg">
                            <span class="icon">📐</span>
                            <span class="label">SVG 矢量图</span>
                        </button>
                        <button class="export-option" data-format="pdf">
                            <span class="icon">📄</span>
                            <span class="label">PDF 文档</span>
                        </button>
                        <button class="export-option" data-format="html">
                            <span class="icon">🌐</span>
                            <span class="label">HTML 代码</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('.dialog-close').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.querySelectorAll('.export-option').forEach(btn => {
            btn.addEventListener('click', async () => {
                const format = btn.dataset.format;
                await this._exportChart(format);
                document.body.removeChild(dialog);
            });
        });
    }

    _getChartTypeName(type) {
        const names = {
            bar: '柱状图',
            line: '折线图',
            pie: '饼图',
            scatter: '散点图',
            radar: '雷达图',
            area: '面积图'
        };
        return names[type] || '图表';
    }
}

const application = new Application();

document.addEventListener('DOMContentLoaded', () => {
    application.init();
});

export default application;
