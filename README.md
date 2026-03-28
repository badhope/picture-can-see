# 📊 Picture Can See

[![CI](https://github.com/badhope/picture-can-see/actions/workflows/ci.yml/badge.svg)](https://github.com/badhope/picture-can-see/actions/workflows/ci.yml)
[![Build & Release](https://github.com/badhope/picture-can-see/actions/workflows/build-release.yml/badge.svg)](https://github.com/badhope/picture-can-see/actions/workflows/build-release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/badhope/picture-can-see?include_prereleases)](https://github.com/badhope/picture-can-see/releases)

一个强大的数据可视化工具，提供 **Web 版**（在线展示）和 **桌面版**（完整功能）两种使用方式。

[在线演示](#) | [下载桌面版](#-下载安装) | [功能特性](#-核心功能) | [开发文档](#-开发指南)

---

## 📦 版本说明

| 版本 | 目录 | 说明 | 适用场景 |
|------|------|------|----------|
| 🌐 **Web 版** | `/web` | 轻量级在线版本 | 快速展示、在线试用 |
| 💻 **桌面版** | `/desktop` | 完整功能桌面应用 | 日常使用、数据处理 |

---

## ✨ 核心功能

### 📥 数据输入
- 📁 **拖拽上传** - 支持 CSV、Excel、JSON、TSV、TXT 文件
- 📋 **粘贴数据** - 直接粘贴 CSV 或 JSON 格式数据
- ✏️ **手动输入** - 表格形式手动编辑数据

### 🤖 智能推荐
- 🔍 **自动分析** - 自动识别数据类型
- 💡 **图表推荐** - 智能推荐最佳图表类型
- 📝 **推荐理由** - 解释为什么推荐该图表

### 📊 图表类型
| 图表 | 图标 | 适用场景 |
|------|------|----------|
| 柱状图 | 📊 | 类别比较 |
| 折线图 | 📈 | 趋势变化 |
| 饼图 | 🥧 | 占比分布 |
| 散点图 | ⚬ | 相关性分析 |
| 雷达图 | 🎯 | 多维对比 |
| 面积图 | 🏔️ | 累积趋势 |

### 📤 导出功能
- 🖼️ PNG 图片（高清）
- 📐 SVG 矢量图
- 📄 PDF 文档
- 🌐 HTML 代码
- 💾 项目文件（.pcv 格式，可再次编辑）

---

## 🚀 快速开始

### 在线体验 (Web 版)

```bash
# 克隆仓库
git clone https://github.com/badhope/picture-can-see.git
cd picture-can-see/web

# 启动本地服务器
npx serve -l 3000

# 访问 http://localhost:3000
```

### 桌面版开发

```bash
# 克隆仓库
git clone https://github.com/badhope/picture-can-see.git
cd picture-can-see/desktop

# 安装依赖
npm install

# 启动开发模式
npm start
```

---

## 📥 下载安装

### 桌面版下载

前往 [Releases](https://github.com/badhope/picture-can-see/releases) 页面下载最新版本：

| 平台 | 格式 | 说明 |
|------|------|------|
| Windows | `.exe` / `.zip` | 安装版 / 便携版 |
| macOS | `.dmg` | 磁盘镜像 |
| Linux | `.AppImage` / `.deb` | 通用二进制 / Debian包 |

### 从源码构建

```bash
# 构建所有平台
npm run desktop:build

# 构建特定平台
npm run desktop:build:win    # Windows
npm run desktop:build:mac    # macOS
npm run desktop:build:linux  # Linux
```

---

## 📁 项目结构

```
picture-can-see/
├── .github/                # GitHub 配置
│   ├── workflows/          # CI/CD 工作流
│   ├── ISSUE_TEMPLATE/     # Issue 模板
│   └── ……
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
│   └── index.html         # 入口文件
│
├── desktop/               # 桌面版（完整功能）
│   ├── src/               # 源代码（与Web版共用核心）
│   ├── styles/            # 样式文件
│   ├── locales/           # 多语言
│   ├── examples/          # 示例数据
│   ├── assets/            # 应用资源
│   ├── main.js            # Electron 主进程
│   ├── preload.js         # 预加载脚本
│   └── index.html         # 入口文件
│
├── package.json           # 根项目配置
├── .gitignore             # Git 忽略规则
├── .editorconfig          # 编辑器配置
├── .prettierrc            # Prettier 配置
├── PRODUCT_DESIGN.md      # 产品设计文档
└── README.md              # 项目说明
```

---

## 🛠️ 技术栈

### 共用技术
| 技术 | 用途 |
|------|------|
| **D3.js** | 数据可视化核心库 |
| **SheetJS (xlsx)** | Excel 文件解析 |
| **原生 JavaScript (ES6+)** | 无框架依赖 |

### Web 版
| 技术 | 用途 |
|------|------|
| HTML5 / CSS3 | 页面结构与样式 |
| ES Modules | 模块化 |

### 桌面版
| 技术 | 用途 |
|------|------|
| **Electron** | 跨平台桌面应用框架 |
| **electron-builder** | 打包工具 |

---

## 🌐 多语言支持

| 语言 | 代码 | 状态 |
|------|------|------|
| 🇨🇳 简体中文 | `zh-CN` | ✅ 完成 |
| 🇺🇸 English | `en-US` | ✅ 完成 |
| 🇯🇵 日本語 | `ja-JP` | ✅ 完成 |

---

## 🎯 使用场景

- ✅ 快速出图（办公报告）
- ✅ 学术论文图表
- ✅ 个人数据探索分析
- ✅ 商业数据展示
- ✅ 教学演示

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

## 🔧 开发指南

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 开发命令

```bash
# 安装所有依赖
npm run install:all

# 启动 Web 版
npm run web

# 启动桌面版
npm run desktop

# 清理依赖
npm run clean
```

### 代码规范
- 使用 [Prettier](https://prettier.io/) 进行代码格式化
- 使用 [EditorConfig](https://editorconfig.org/) 统一编辑器配置

---

## 🤝 贡献指南

欢迎贡献代码！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

---

## 🙏 致谢

- [D3.js](https://d3js.org/) - 数据可视化库
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [SheetJS](https://sheetjs.com/) - Excel 解析库

---

⭐ 如果这个项目对你有帮助，请点个 Star！
