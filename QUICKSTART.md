# 快速开始指南

## 🚀 5 分钟上手重构版

### 前置要求

- **浏览器**: Chrome 61+ / Firefox 60+ / Safari 11+ / Edge 16+
- **本地服务器**: Python / Node.js / PHP (任一)
- **代码编辑器**: VSCode (推荐) 或其他支持 ES6 的编辑器

### 第一步：启动游戏

```bash
# 方式 1: Python
python -m http.server 8080

# 方式 2: Node.js
npx http-server -p 8080

# 方式 3: PHP
php -S localhost:8080
```

访问：`http://localhost:8080`

### 第二步：理解新架构

#### 核心概念

1. **模块系统** - 所有核心代码都是 ES6 模块
   ```javascript
   // 导入
   import { CONFIG } from './config.js';
   import { Player } from './core/player.js';
   
   // 导出
   export class MyClass {...}
   ```

2. **事件总线** - 组件间通过事件通信
   ```javascript
   // 订阅事件
   eventBus.on(GameEvents.PLAYER_CREATED, (player) => {
       console.log('玩家创建成功', player);
   });
   
   // 触发事件
   eventBus.emit(GameEvents.PLAYER_CREATED, playerInstance);
   ```

3. **服务定位器** - 统一管理共享服务
   ```javascript
   // 注册服务
   serviceLocator.register('myService', myServiceInstance);
   
   // 获取服务
   const service = serviceLocator.get('myService');
   ```

### 第三步：修改配置

所有配置都在 `js/config.js` 中：

```javascript
// 修改属性最大值
export const CONFIG = Object.freeze({
    ATTRIBUTES: Object.freeze({
        maxValue: 10,  // 改成你想要的值
        // ...
    })
});
```

⚠️ **注意**: 配置是只读的，运行时不能修改！

### 第四步：添加新事件

在 `js/data/events.js` 中添加（保持全局变量模式）：

```javascript
const EVENTS = [
    // ... 现有事件
    
    // 你的新事件
    {
        id: 'my_new_event',
        title: '我的新事件',
        description: '这是一个自定义事件',
        choices: [
            {
                text: '选择 1',
                effects: { intelligence: +1 }
            },
            {
                text: '选择 2',
                effects: { money: +1000 }
            }
        ]
    }
];
```

### 第五步：调试代码

打开浏览器开发者工具 (F12)，使用控制台：

```javascript
// 查看游戏状态
game.engine.getGameState();

// 查看玩家信息
game.engine.player.getStatus();

// 监听事件
game.eventBus.on(GameEvents.EVENT_TRIGGERED, (event) => {
    console.log('事件触发:', event);
});
```

## 📚 常用 API 参考

### 游戏控制

```javascript
// 开始新游戏
game._createCharacter();

// 保存游戏
game.saveGame();

// 重新开始
game.restart();
```

### 玩家操作

```javascript
// 增加属性
game.engine.player.attributes.intelligence += 1;

// 增加金钱
game.engine.player.addMoney(1000);

// 改变生命值
game.engine.player.changeHealth(-10, '生病');
```

### 事件系统

```javascript
// 触发事件
game.eventBus.emit(GameEvents.EVENT_TRIGGERED, eventData);

// 监听事件
game.eventBus.on(GameEvents.GAME_OVER, (ending) => {
    console.log('游戏结束:', ending);
});
```

## 🛠️ 开发技巧

### 1. 热重载开发

使用 Live Server 插件实现自动刷新：

```bash
# VSCode 安装 Live Server 插件
# 右键 index.html -> Open with Live Server
```

### 2. 调试模式

在 `js/config.js` 中开启调试：

```javascript
DEBUG: true,  // 开启详细日志
```

### 3. 性能分析

```javascript
// 在控制台运行
performance.mark('start');
// ... 执行操作
performance.mark('end');
performance.measure('operation', 'start', 'end');
performance.getEntriesByName('operation')[0].duration;
```

## ❓ 常见问题

### Q: 为什么不能直接双击打开 HTML？
A: ES6 模块需要通过 HTTP 协议加载，文件系统协议 (file://) 有安全限制。

### Q: 修改代码后不生效？
A: 清除浏览器缓存或强制刷新 (Ctrl+F5)。

### Q: 如何添加新功能？
A: 
1. 在对应的服务层添加逻辑
2. 通过事件总线通知其他模块
3. 在 UI 层显示结果

### Q: 哪里可以看到更多示例？
A: 查看 `REFACTORING.md` 文档中的详细示例。

## 🎯 下一步学习

1. 阅读 [`REFACTORING_SUMMARY.md`](./REFACTORING_SUMMARY.md) 了解重构详情
2. 查看 [`REFACTORING.md`](./REFACTORING.md) 学习架构设计
3. 阅读源码中的 JSDoc 注释了解 API
4. 尝试修改配置和添加新事件

---

祝你开发愉快！🎮✨
