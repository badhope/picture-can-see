import { app, Events } from './core/app.js';
import { DataSourceManager } from './data/source.js';
import { DropZone, PasteHandler } from './data/input.js';
import { typeDetector } from './transform/detector.js';
import { chartRecommender } from './visualization/recommender.js';
import { BarChart, LineChart, PieChart, ScatterChart, RadarChart } from './visualization/charts.js';
import { exporter, projectExporter } from './export/exporter.js';
import { Toolbar, Sidebar, ConfigPanel, DropOverlay, Toast } from './ui/components.js';
import { t, setLanguage } from '../locales/index.js';

const isElectron = typeof window !== 'undefined' && window.electronAPI;

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

class DesktopApplication {
    constructor() {
        this.chartManager = new ChartManager();
        this.currentChartInstance = null;
        this.toast = new Toast();
        this.rawData = null;
        this.headers = null;
        this.currentFilePath = null;
        this.isModified = false;
    }

    async init() {
        await app.init();
        
        this._initUI();
        this._initDataLayer();
        this._initVisualization();
        this._initEventListeners();
        this._initKeyboardShortcuts();
        this._initElectronMenu();
        
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
                        if (e.shiftKey) {
                            this._saveProjectAs();
                        } else {
                            this._handleToolbarAction('save');
                        }
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
                        if (!isElectron) {
                            e.preventDefault();
                            this._handleToolbarAction('paste');
                        }
                        break;
                }
            }
        });
    }

    _initElectronMenu() {
        if (isElectron) {
            window.electronAPI.onMenuAction((action) => {
                this._handleToolbarAction(action);
            });
        }
    }

    async _handleFilesDrop(files) {
        this.dropOverlay.hide();
        
        for (const file of files) {
            try {
                if (isElectron && file.path) {
                    const result = await window.electronAPI.readFile(file.path);
                    if (result.success) {
                        const source = await this._parseFileContent(result.data, file.name, result.ext);
                        if (source) {
                            this.toast.show(`成功导入: ${file.name}`, 'success');
                        }
                    } else {
                        this.toast.show(`导入失败: ${result.error}`, 'error');
                    }
                } else {
                    const source = await this.dataSourceManager.loadFile(file);
                    if (source) {
                        this.toast.show(`成功导入: ${file.name}`, 'success');
                        this.rawData = app.state.get('data.rawData');
                        this.headers = app.state.get('data.headers');
                        this._updateDataPreview();
                        this._updateRecommendations();
                    }
                }
            } catch (error) {
                this.toast.show(`导入失败: ${error.message}`, 'error');
            }
        }
    }

    async _parseFileContent(content, fileName, ext) {
        try {
            const { fileParser } = await import('./data/parser.js');
            let result;
            
            if (ext === '.json') {
                result = fileParser.parseText(content, 'json');
            } else if (ext === '.tsv') {
                result = fileParser.parseText(content, 'tsv');
            } else if (['.xlsx', '.xls'].includes(ext)) {
                const XLSX = await import('xlsx');
                const arrayBuffer = content instanceof Uint8Array 
                    ? content 
                    : new Uint8Array(content);
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                if (jsonData.length > 0) {
                    const headers = jsonData[0];
                    const data = jsonData.slice(1).map(row => {
                        const obj = {};
                        headers.forEach((h, i) => {
                            obj[h] = row[i] !== undefined ? row[i] : null;
                        });
                        return obj;
                    });
                    result = { headers, data, errors: [] };
                } else {
                    result = { headers: [], data: [], errors: ['空文件'] };
                }
            } else {
                result = fileParser.parseText(content, 'csv');
            }
            
            if (result.errors && result.errors.length > 0) {
                this.toast.show(`解析警告: ${result.errors.join(', ')}`, 'warning');
            }
            
            const source = this.dataSourceManager.loadFromText(
                JSON.stringify(result.data),
                'json',
                fileName
            );
            
            this.rawData = result.data;
            this.headers = result.headers;
            app.state.update({
                'data.rawData': result.data,
                'data.headers': result.headers
            });
            
            return source;
        } catch (error) {
            this.toast.show(`解析失败: ${error.message}`, 'error');
            console.error('Parse error:', error);
            return null;
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

    async _handleToolbarAction(action) {
        switch (action) {
            case 'new':
                this._newProject();
                break;
            case 'open':
                await this._openProject();
                break;
            case 'save':
                await this._saveProject();
                break;
            case 'import':
                await this._showImportDialog();
                break;
            case 'paste':
                await this._handlePasteAction();
                break;
            case 'export':
                this._showExportDialog();
                break;
            case 'export-png':
                await this._exportChart('png');
                break;
            case 'export-svg':
                await this._exportChart('svg');
                break;
            case 'export-pdf':
                await this._exportChart('pdf');
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
        
        app.state.set('chart.type', type);
    }

    _handleColorSchemeChange(scheme) {
        app.state.set('chart.config.colorScheme', scheme);
        
        const activeChart = this.chartManager.getActiveChart();
        if (activeChart) {
            activeChart.config.colorScheme = scheme;
            this._renderChartInstance(activeChart);
        }
    }

    _handleConfigChange(key, value) {
        app.state.set(`chart.config.${key}`, value);
        
        const activeChart = this.chartManager.getActiveChart();
        if (activeChart) {
            activeChart.config[key] = value;
            this._renderChartInstance(activeChart);
        }
    }

    _handleConfigToggle(collapsed) {
        app.state.set('ui.configPanelCollapsed', collapsed);
    }

    _newProject() {
        this.chartManager.clear();
        this.rawData = null;
        this.headers = null;
        this.currentFilePath = null;
        this.isModified = false;

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
        if (isElectron) {
            const result = await window.electronAPI.openFileDialog({
                filters: [{ name: '项目文件', extensions: ['pcv'] }]
            });
            
            if (result.canceled || !result.filePaths.length) return;
            
            const filePath = result.filePaths[0];
            const fileResult = await window.electronAPI.readFile(filePath);
            
            if (fileResult.success) {
                try {
                    const project = JSON.parse(fileResult.data);
                    await this._loadProjectData(project, filePath);
                } catch (error) {
                    this.toast.show(`加载失败: ${error.message}`, 'error');
                }
            }
        } else {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pcv,.json';

            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    const text = await file.text();
                    const project = JSON.parse(text);
                    await this._loadProjectData(project, file.name);
                } catch (error) {
                    this.toast.show(`加载失败: ${error.message}`, 'error');
                }
            };

            input.click();
        }
    }

    async _loadProjectData(project, filePath) {
        app.state.update({
            'project.name': project.name,
            'data.sources': project.data.sources,
            'data.activeSourceId': project.data.activeSourceId,
            'chart.type': project.chart.type,
            'chart.config': project.chart.config
        });

        const activeSource = project.data.sources?.find(
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

        if (project.charts) {
            project.charts.forEach(c => {
                this.chartManager.charts.set(c.id, c);
            });
            if (project.activeChartId) {
                this.chartManager.activeChartId = project.activeChartId;
            }
        }

        this.currentFilePath = typeof filePath === 'string' ? filePath : null;
        this._updateDataPreview();
        this._updateChartsList();
        
        const activeChart = this.chartManager.getActiveChart();
        if (activeChart) {
            this._renderChartInstance(activeChart);
        }
        
        this.toast.show('项目加载成功', 'success');
    }

    async _saveProject() {
        if (this.currentFilePath) {
            await this._saveToPath(this.currentFilePath);
        } else {
            await this._saveProjectAs();
        }
    }

    async _saveProjectAs() {
        if (isElectron) {
            const result = await window.electronAPI.saveFileDialog({
                defaultPath: `${app.state.get('project.name') || '未命名项目'}.pcv`,
                filters: [{ name: '项目文件', extensions: ['pcv'] }]
            });
            
            if (result.canceled || !result.filePath) return;
            
            await this._saveToPath(result.filePath);
        } else {
            const blob = projectExporter.exportProject(app.state);
            const name = app.state.get('project.name') || '未命名项目';
            exporter.download(blob, `${name}.pcv`);
            app.state.set('project.modified', false);
            this.toast.show('项目已保存', 'success');
        }
    }

    async _saveToPath(filePath) {
        const projectData = {
            name: app.state.get('project.name') || '未命名项目',
            version: '1.0.0',
            createdAt: Date.now(),
            data: {
                sources: app.state.get('data.sources') || [],
                activeSourceId: app.state.get('data.activeSourceId')
            },
            chart: {
                type: app.state.get('chart.type'),
                config: app.state.get('chart.config')
            },
            charts: this.chartManager.getAllCharts(),
            activeChartId: this.chartManager.activeChartId
        };
        
        const result = await window.electronAPI.writeFile(filePath, JSON.stringify(projectData, null, 2));
        
        if (result.success) {
            this.currentFilePath = filePath;
            this.isModified = false;
            app.state.set('project.modified', false);
            app.state.set('project.name', filePath.split(/[\\/]/).pop().replace(/\.pcv$/, ''));
            this.toast.show('项目已保存', 'success');
        } else {
            this.toast.show(`保存失败: ${result.error}`, 'error');
        }
    }

    async _showImportDialog() {
        if (isElectron) {
            const result = await window.electronAPI.openFileDialog({
                filters: [
                    { name: '数据文件', extensions: ['csv', 'json', 'xlsx', 'xls', 'tsv', 'txt'] }
                ]
            });
            
            if (result.canceled || !result.filePaths.length) return;
            
            for (const filePath of result.filePaths) {
                const fileName = filePath.split(/[\\/]/).pop();
                const fileResult = await window.electronAPI.readFile(filePath);
                
                if (fileResult.success) {
                    await this._parseFileContent(fileResult.data, fileName, fileResult.ext);
                    this.toast.show(`成功导入: ${fileName}`, 'success');
                } else {
                    this.toast.show(`导入失败: ${fileResult.error}`, 'error');
                }
            }
        } else {
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
    }

    async _handlePasteAction() {
        if (isElectron) {
            const text = await window.electronAPI.getClipboardText();
            if (text) {
                this._handlePaste(text, 'csv');
            } else {
                this.toast.show('剪贴板没有内容', 'warning');
            }
        } else {
            navigator.clipboard.readText().then(text => {
                if (text) {
                    this._handlePaste(text, 'csv');
                } else {
                    this.toast.show('剪贴板没有内容', 'warning');
                }
            }).catch(() => {
                this.toast.show('无法读取剪贴板', 'error');
            });
        }
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

    _showExportDialog() {
        this._exportChart('png');
    }

    async _exportChart(format) {
        if (!this.currentChartInstance) {
            this.toast.show('请先创建图表', 'warning');
            return;
        }

        try {
            const svgElement = this.chartContainer.querySelector('svg');
            if (!svgElement) {
                this.toast.show('无法导出：未找到图表', 'error');
                return;
            }

            const svgData = new XMLSerializer().serializeToString(svgElement);
            
            if (format === 'svg') {
                if (isElectron) {
                    const result = await window.electronAPI.saveFileDialog({
                        defaultPath: `chart_${Date.now()}.svg`,
                        filters: [{ name: 'SVG 图片', extensions: ['svg'] }]
                    });
                    
                    if (!result.canceled && result.filePath) {
                        await window.electronAPI.writeFile(result.filePath, svgData);
                        this.toast.show('SVG 已导出', 'success');
                    }
                } else {
                    const blob = new Blob([svgData], { type: 'image/svg+xml' });
                    exporter.download(blob, `chart_${Date.now()}.svg`);
                    this.toast.show('SVG 已导出', 'success');
                }
            } else if (format === 'png') {
                const canvas = await this._svgToCanvas(svgElement);
                const dataUrl = canvas.toDataURL('image/png');
                
                if (isElectron) {
                    const result = await window.electronAPI.saveImage({
                        defaultPath: `chart_${Date.now()}.png`,
                        data: dataUrl,
                        format: 'png'
                    });
                    
                    if (result.success) {
                        this.toast.show('PNG 已导出', 'success');
                    }
                } else {
                    const link = document.createElement('a');
                    link.download = `chart_${Date.now()}.png`;
                    link.href = dataUrl;
                    link.click();
                    this.toast.show('PNG 已导出', 'success');
                }
            }
        } catch (error) {
            this.toast.show(`导出失败: ${error.message}`, 'error');
        }
    }

    async _svgToCanvas(svgElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const rect = svgElement.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, rect.width, rect.height);
        
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                resolve(canvas);
            };
            img.onerror = reject;
            img.src = url;
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

const application = new DesktopApplication();

document.addEventListener('DOMContentLoaded', () => {
    application.init();
});

export default application;
