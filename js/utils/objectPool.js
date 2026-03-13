/**
 * 对象池系统
 * 优化频繁创建/销毁的对象，减少内存分配和 GC 压力
 */

class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];
        
        // 预创建对象
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    // 获取对象
    acquire() {
        if (this.pool.length > 0) {
            const obj = this.pool.pop();
            this.active.push(obj);
            return obj;
        }
        
        // 池为空时创建新对象
        const obj = this.createFn();
        this.active.push(obj);
        return obj;
    }
    
    // 释放对象
    release(obj) {
        const index = this.active.indexOf(obj);
        if (index !== -1) {
            this.active.splice(index, 1);
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }
    
    // 释放所有对象
    releaseAll() {
        while (this.active.length > 0) {
            const obj = this.active.pop();
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }
    
    // 获取池统计
    getStats() {
        return {
            poolSize: this.pool.length,
            activeCount: this.active.length,
            totalCount: this.pool.length + this.active.length
        };
    }
}

// 事件对象池
const EventObjectPool = {
    pool: null,
    
    init() {
        this.pool = new ObjectPool(
            // 创建函数
            () => ({
                id: '',
                title: '',
                description: '',
                effects: {},
                choices: [],
                triggered: false
            }),
            // 重置函数
            (obj) => {
                obj.id = '';
                obj.title = '';
                obj.description = '';
                obj.effects = {};
                obj.choices = [];
                obj.triggered = false;
            },
            20 // 初始大小
        );
    },
    
    acquire() {
        if (!this.pool) this.init();
        return this.pool.acquire();
    },
    
    release(event) {
        if (this.pool) this.pool.release(event);
    }
};

// 玩家属性对象池
const AttributePool = {
    pool: null,
    
    init() {
        this.pool = new ObjectPool(
            () => ({
                intelligence: 5,
                constitution: 5,
                charisma: 5,
                luck: 5,
                morality: 5
            }),
            (obj) => {
                obj.intelligence = 5;
                obj.constitution = 5;
                obj.charisma = 5;
                obj.luck = 5;
                obj.morality = 5;
            },
            5
        );
    },
    
    acquire() {
        if (!this.pool) this.init();
        return this.pool.acquire();
    },
    
    release(attrs) {
        if (this.pool) this.pool.release(attrs);
    }
};

/**
 * 事件批处理系统
 * 批量处理事件，减少 DOM 操作
 */
class EventBatchProcessor {
    constructor(batchSize = 5, processDelay = 100) {
        this.batchSize = batchSize;
        this.processDelay = processDelay;
        this.queue = [];
        this.isProcessing = false;
        this.onBatchComplete = null;
    }
    
    // 添加事件到队列
    add(event) {
        this.queue.push(event);
        
        if (!this.isProcessing) {
            this.processBatch();
        }
    }
    
    // 批量处理
    async processBatch() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            if (this.onBatchComplete) {
                this.onBatchComplete();
            }
            return;
        }
        
        this.isProcessing = true;
        
        // 取出一批事件
        const batch = this.queue.splice(0, this.batchSize);
        
        // 处理这批事件
        for (const event of batch) {
            await this.processEvent(event);
        }
        
        // 延迟后处理下一批
        setTimeout(() => this.processBatch(), this.processDelay);
    }
    
    // 处理单个事件
    async processEvent(event) {
        // 这里可以是事件触发、UI 更新等操作
        return new Promise(resolve => {
            // 模拟异步处理
            setTimeout(() => {
                if (event.callback) {
                    event.callback();
                }
                resolve();
            }, 10);
        });
    }
    
    // 清空队列
    clear() {
        this.queue = [];
        this.isProcessing = false;
    }
}

/**
 * 防抖和节流优化
 */
const OptimizeUtils = {
    // 防抖：频繁触发时只执行最后一次
    debounce(func, wait, immediate = false) {
        let timeout;
        return function(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            
            if (callNow) {
                func.apply(this, args);
            }
        };
    },
    
    // 节流：固定时间间隔内只执行一次
    throttle(func, limit) {
        let inThrottle;
        let lastFunc;
        let lastRan;
        
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                lastRan = Date.now();
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },
    
    // 请求动画帧优化
    rafDebounce(func) {
        let rafId = null;
        return function(...args) {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(() => {
                func.apply(this, args);
                rafId = null;
            });
        };
    }
};

// 自动初始化
if (typeof CONFIG !== 'undefined' && CONFIG.DEBUG) {
    console.log('🎯 对象池系统已加载');
}
