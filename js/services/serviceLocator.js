/**
 * 服务定位器模块
 * 提供全局服务管理和依赖注入
 * @module services/ServiceLocator
 */

/**
 * 服务定位器类
 * 单例模式，管理所有游戏服务的注册和获取
 */
export class ServiceLocator {
    /**
     * 创建服务定位器实例
     * @private
     */
    constructor() {
        if (ServiceLocator._instance) {
            throw new Error('ServiceLocator 是单例，请使用 getInstance() 获取实例');
        }
        
        /** @type {Map<string, *>} */
        this._services = new Map();
        
        /** @type {boolean} */
        this._initialized = false;
    }

    /**
     * 获取单例实例
     * @static
     * @returns {ServiceLocator} 服务定位器实例
     */
    static getInstance() {
        if (!ServiceLocator._instance) {
            ServiceLocator._instance = new ServiceLocator();
        }
        return ServiceLocator._instance;
    }

    /**
     * 初始化所有服务
     * @param {Object} dependencies - 依赖对象
     * @returns {void}
     */
    initialize(dependencies = {}) {
        if (this._initialized) {
            console.warn('[ServiceLocator] 已经初始化过');
            return;
        }
        
        // 注册基础服务
        this.register('eventBus', dependencies.eventBus);
        this.register('player', dependencies.player);
        
        // 根据条件注册其他服务
        if (dependencies.engine) {
            this.register('engine', dependencies.engine);
        }
        
        if (dependencies.screenManager) {
            this.register('screenManager', dependencies.screenManager);
        }
        
        this._initialized = true;
        
        console.log('[ServiceLocator] 服务初始化完成');
    }

    /**
     * 注册服务
     * @template T
     * @param {string} name - 服务名称
     * @param {T} service - 服务实例
     * @throws {Error} 如果服务已经存在
     * @returns {void}
     */
    register(name, service) {
        if (this._services.has(name)) {
            console.warn(`[ServiceLocator] 服务 "${name}" 已存在，将被覆盖`);
        }
        
        this._services.set(name, service);
        console.log(`[ServiceLocator] 注册服务：${name}`);
    }

    /**
     * 获取服务
     * @template T
     * @param {string} name - 服务名称
     * @returns {T} 服务实例
     * @throws {Error} 如果服务不存在
     */
    get(name) {
        const service = this._services.get(name);
        
        if (!service) {
            throw new Error(`[ServiceLocator] 未找到服务：${name}`);
        }
        
        return service;
    }

    /**
     * 检查服务是否存在
     * @param {string} name - 服务名称
     * @returns {boolean} 是否存在
     */
    has(name) {
        return this._services.has(name);
    }

    /**
     * 移除服务
     * @param {string} name - 服务名称
     * @returns {boolean} 是否成功移除
     */
    remove(name) {
        return this._services.delete(name);
    }

    /**
     * 获取所有已注册的服务名称
     * @returns {Array<string>} 服务名称数组
     */
    getServiceNames() {
        return Array.from(this._services.keys());
    }

    /**
     * 清空所有服务
     * @returns {void}
     */
    clear() {
        this._services.clear();
        this._initialized = false;
    }

    /**
     * 批量获取服务
     * @param {Array<string>} names - 服务名称数组
     * @returns {Object} 服务对象
     */
    getAll(names) {
        const result = {};
        for (const name of names) {
            try {
                result[name] = this.get(name);
            } catch (error) {
                console.warn(`[ServiceLocator] 无法获取服务 "${name}":`, error.message);
            }
        }
        return result;
    }
}

// 导出单例实例
export const serviceLocator = ServiceLocator.getInstance();
