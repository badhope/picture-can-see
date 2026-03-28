import { EventEmitter, Events } from './events.js';
import { ReactiveState } from './state.js';

class AppCore extends EventEmitter {
    constructor() {
        super();
        this.modules = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        this.state = new ReactiveState({
            data: {
                sources: [],
                activeSourceId: null,
                rawData: null,
                processedData: null,
                headers: [],
                types: {}
            },
            chart: {
                type: 'bar',
                config: {
                    title: '',
                    subtitle: '',
                    titlePosition: 'center',
                    titleFontSize: 18,
                    xAxisTitle: '',
                    yAxisTitle: '',
                    showXAxis: true,
                    showYAxis: true,
                    showXAxisLine: true,
                    showYAxisLine: true,
                    colorScheme: 'default',
                    animationType: 'auto',
                    animationDuration: 1000,
                    animationEasing: 'cubicInOut',
                    enableTooltip: true,
                    enableLegend: true,
                    enableDataZoom: false,
                    legendPosition: 'right',
                    legendLayout: 'horizontal'
                }
            },
            ui: {
                theme: 'dark',
                language: 'zh-CN',
                sidebarCollapsed: false,
                configPanelCollapsed: false,
                activeTab: 'data'
            },
            project: {
                name: '未命名项目',
                modified: false,
                path: null
            },
            ai: {
                enabled: false,
                provider: null,
                apiKey: null,
                model: null
            }
        });

        this.initialized = true;
        this.emit('app:initialized');
    }

    registerModule(name, module) {
        if (this.modules.has(name)) {
            console.warn(`Module "${name}" already registered`);
            return;
        }
        this.modules.set(name, module);
        
        if (module.init) {
            module.init(this);
        }
    }

    getModule(name) {
        return this.modules.get(name);
    }

    getState() {
        return this.state;
    }
}

export const app = new AppCore();
export { Events } from './events.js';
export { ReactiveState } from './state.js';
