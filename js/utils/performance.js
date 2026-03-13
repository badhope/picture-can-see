/**
 * 性能优化和工具函数
 * 包含性能监控、错误处理、加载优化等功能
 */

const PerformanceUtils = {
    // 性能监控
    metrics: {
        loadTime: 0,
        frameCount: 0,
        lastFpsUpdate: 0,
        fps: 0,
        memoryUsage: 0
    },

    // 初始化性能监控
    init() {
        this.startTime = performance.now();
        this.monitorFPS();
        this.monitorMemory();
        this.logLoadTime();
    },

    // FPS 监控
    monitorFPS() {
        const updateFPS = () => {
            this.metrics.frameCount++;
            const now = performance.now();
            
            if (now - this.metrics.lastFpsUpdate >= 1000) {
                this.metrics.fps = this.metrics.frameCount;
                this.metrics.frameCount = 0;
                this.metrics.lastFpsUpdate = now;
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        requestAnimationFrame(updateFPS);
    },

    // 内存监控
    monitorMemory() {
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
                if (CONFIG.DEBUG) {
                    console.log(`内存使用：${this.metrics.memoryUsage.toFixed(2)} MB`);
                }
            }, 5000);
        }
    },

    // 记录加载时间
    logLoadTime() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now() - this.startTime;
            console.log(`⚡ 加载完成：${this.metrics.loadTime.toFixed(2)}ms`);
            
            // 性能评级
            if (this.metrics.loadTime < 1000) {
                console.log('🎯 性能优秀！');
            } else if (this.metrics.loadTime < 3000) {
                console.log('👍 性能良好');
            } else {
                console.log('⚠️ 加载较慢，建议优化');
            }
        });
    },

    // 获取性能报告
    getPerformanceReport() {
        return {
            fps: this.metrics.fps,
            loadTime: this.metrics.loadTime.toFixed(2) + 'ms',
            memory: this.metrics.memoryUsage.toFixed(2) + 'MB',
            rating: this.getPerformanceRating()
        };
    },

    // 性能评级
    getPerformanceRating() {
        if (this.metrics.fps >= 55 && this.metrics.loadTime < 1000) return '优秀';
        if (this.metrics.fps >= 45 && this.metrics.loadTime < 2000) return '良好';
        if (this.metrics.fps >= 30 && this.metrics.loadTime < 3000) return '一般';
        return '需要优化';
    }
};

// 错误处理系统
const ErrorHandler = {
    errors: [],
    maxErrors: 50,

    init() {
        // 全局错误捕获
        window.addEventListener('error', (e) => {
            this.handleError(e.error || e.message, e.filename, e.lineno, e.colno);
        });

        // 未捕获的 Promise 错误
        window.addEventListener('unhandledrejection', (e) => {
            this.handleError(e.reason, 'Promise', 0, 0);
        });

        // 控制台错误重写
        const originalError = console.error;
        console.error = (...args) => {
            originalError.apply(console, args);
            this.handleError(args.join(' '), 'console', 0, 0);
        };
    },

    handleError(message, filename, lineno, colno) {
        const error = {
            message: message?.toString() || 'Unknown error',
            filename,
            lineno,
            colno,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        this.errors.push(error);
        
        // 限制错误数量
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // 用户友好的错误提示
        this.showUserFriendlyError(error);

        // 开发模式下打印详细错误
        if (CONFIG.DEBUG) {
            console.group('❌ 错误详情');
            console.error('消息:', error.message);
            console.error('文件:', error.filename);
            console.error('位置:', error.lineno, ':', error.colno);
            console.error('时间:', error.timestamp);
            console.groupEnd();
        }
    },

    showUserFriendlyError(error) {
        // 创建错误提示元素
        const errorEl = document.createElement('div');
        errorEl.className = 'error-toast';
        errorEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        errorEl.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">⚠️ 发生错误</div>
            <div style="font-size: 12px; opacity: 0.9;">${error.message.substring(0, 100)}${error.message.length > 100 ? '...' : ''}</div>
        `;
        
        document.body.appendChild(errorEl);
        
        // 3 秒后自动消失
        setTimeout(() => {
            errorEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => errorEl.remove(), 300);
        }, 3000);
    },

    getErrors() {
        return this.errors;
    },

    clearErrors() {
        this.errors = [];
    }
};

// 加载优化
const LoadOptimizer = {
    // 预加载关键资源
    preloadCriticalResources() {
        const criticalResources = [
            'css/glassmorphism.css',
            'css/style.css',
            'js/config.js',
            'js/core/player.js'
        ];

        criticalResources.forEach(src => {
            this.preloadResource(src);
        });
    },

    // 预加载单个资源
    preloadResource(src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = this.getResourceType(src);
        link.href = src;
        document.head.appendChild(link);
    },

    // 获取资源类型
    getResourceType(src) {
        if (src.endsWith('.css')) return 'style';
        if (src.endsWith('.js')) return 'script';
        if (src.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
        if (src.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
        return 'fetch';
    },

    // 懒加载非关键资源
    lazyLoadResources() {
        const lazyElements = document.querySelectorAll('[data-lazy-src]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const src = el.dataset.lazySrc;
                    
                    if (el.tagName === 'IMG') {
                        el.src = src;
                    } else {
                        el.style.backgroundImage = `url(${src})`;
                    }
                    
                    el.removeAttribute('data-lazy-src');
                    observer.unobserve(el);
                }
            });
        }, {
            rootMargin: '50px'
        });

        lazyElements.forEach(el => observer.observe(el));
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 缓存系统
const CacheSystem = {
    cache: new Map(),
    maxSize: 100,

    set(key, value, ttl = 300000) { // 默认 5 分钟 TTL
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            value,
            expiry: Date.now() + ttl
        });
    },

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    },

    clear() {
        this.cache.clear();
    },

    size() {
        return this.cache.size;
    }
};

// 自动初始化
if (typeof CONFIG !== 'undefined' && CONFIG.DEBUG) {
    console.log('🔧 性能优化工具已加载');
}
