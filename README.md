# 📊 Picture Can See

一个强大的数据可视化工具，提供 **Web 版**（在线展示）和 **桌面版**（完整功能）两种使用方式。

## 📦 版本说明

| 版本 | 目录 | 说明 | 适用场景 |
|------|------|------|----------|
| 🌐 **Web 版** | `/web` | 轻量级在线版本 | 快速展示、在线试用 |
| 💻 **桌面版** | `/desktop` | 完整功能桌面应用 | 日常使用、数据处理 |

---

## 🌐 Web 版（在线展示）

轻量级网页版本，适合在线展示和快速试用。

### 功能特性
- ✅ 拖拽上传数据文件（CSV、JSON、Excel）
- ✅ 粘贴数据导入
- ✅ 智能图表推荐
- ✅ 多图表类型（柱状图、折线图、饼图、散点图、雷达图、面积图）
- ✅ 图表导出（PNG、SVG）
- ✅ 项目保存/加载

### 快速启动
```bash
cd web
npx serve -l 3000
# 访问 http://localhost:3000
```

---

## 💻 桌面版（完整功能）

基于 Electron 的桌面应用，提供完整的数据可视化功能。

### 额外功能
- ✅ **原生文件系统访问** - 直接读写本地文件
- ✅ **离线使用** - 无需网络连接
- ✅ **系统菜单** - 完整的菜单栏支持
- ✅ **快捷键** - 系统级快捷键支持
- ✅ **Excel 原生支持** - 更好的 Excel 文件处理
- ✅ **一键安装** - Windows/Mac/Linux 安装包

### 开发运行
```bash
cd desktop
npm install
npm start
```

### 打包发布
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

---

## ✨ 核心功能

### 数据输入
- 📁 **拖拽上传** - 支持 CSV、Excel、JSON、TSV、TXT 文件
- 📋 **粘贴数据** - 直接粘贴 CSV 或 JSON 格式数据
- ✏️ **手动输入** - 表格形式手动编辑数据

### 智能推荐
- 🤖 **自动分析** - 自动识别数据类型
- 💡 **图表推荐** - 智能推荐最佳图表类型
- 📝 **推荐理由** - 解释为什么推荐该图表

### 图表类型
| 图表 | 图标 | 适用场景 |
|------|------|----------|
| 柱状图 | 📊 | 类别比较 |
| 折线图 | 📈 | 趋势变化 |
| 饼图 | 🥧 | 占比分布 |
| 散点图 | ⚬ | 相关性分析 |
| 雷达图 | 🎯 | 多维对比 |
| 面积图 | 🏔️ | 累积趋势 |

### 导出功能
- 🖼️ PNG 图片（高清）
- 📐 SVG 矢量图
- 💾 项目文件（.pcv 格式，可再次编辑）

---

## 📁 项目结构

```
picture-can-see/
├── web/                    # Web 版（在线展示）
│   ├── src/               # 源代码
│   │   ├── core/          # 核心架构
│   │   ├── data/          # 数据处理
│   │   ├── transform/     # 数据转换
│   │   ├── visualization/ # 图表渲染
│   │   ├── export/        # 导出功能
│   │   └── ui/            # UI组件
│   ├── styles/            # 样式文件
│   ├── locales/           # 多语言
│   ├── examples/          # 示例数据
│   ├── index.html         # 入口文件
│   └── package.json
│
├── desktop/               # 桌面版（完整功能）
│   ├── src/               # 源代码（与Web版共用核心）
│   ├── styles/            # 样式文件
│   ├── locales/           # 多语言
│   ├── examples/          # 示例数据
│   ├── assets/            # 应用资源
│   ├── main.js            # Electron 主进程
│   ├── preload.js         # 预加载脚本
│   ├── index.html         # 入口文件
│   └── package.json
│
├── PRODUCT_DESIGN.md      # 产品设计文档
└── README.md
```

---

## 🛠️ 技术栈

### 共用技术
- **D3.js** - 数据可视化核心库
- **SheetJS (xlsx)** - Excel 文件解析
- **原生 JavaScript (ES6+)** - 无框架依赖

### Web 版
- HTML5 / CSS3
- ES Modules

### 桌面版
- **Electron** - 跨平台桌面应用框架
- **electron-builder** - 打包工具

---

## 📝 数据格式示例

### CSV 格式
```csv
名称,销量,利润
产品A,120,45
产品B,200,78
产品C,150,52
```

### JSON 格式
```json
[
  {"名称": "产品A", "销量": 120, "利润": 45},
  {"名称": "产品B", "销量": 200, "利润": 78},
  {"名称": "产品C", "销量": 150, "利润": 52}
]
```

---

## 🚀 快速开始

### 在线体验
直接访问在线版本（部署后）

### 本地运行 Web 版
```bash
git clone https://github.com/badhope/picture-can-see.git
cd picture-can-see/web
npx serve -l 3000
```

### 本地运行桌面版
```bash
git clone https://github.com/badhope/picture-can-see.git
cd picture-can-see/desktop
npm install
npm start
```

---

## 🎯 使用场景

- ✅ 快速出图（办公报告）
- ✅ 学术论文图表
- ✅ 个人数据探索分析
- ✅ 商业数据展示
- ✅ 教学演示

---

## 🌐 多语言支持

- 🇨🇳 简体中文
- 🇺🇸 English
- 🇯🇵 日本語

---

## 📄 许可证

[MIT License](LICENSE)

---

⭐ 如果这个项目对你有帮助，请点个 Star！
