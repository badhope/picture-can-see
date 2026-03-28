# 📊 Picture Can See

一个强大的本地数据可视化工具，支持多种数据输入方式、智能图表推荐和AI辅助分析。

## ✨ 核心特性

### 数据输入
- 📁 **拖拽上传** - 支持 CSV、Excel、JSON、TSV 文件
- 📋 **粘贴数据** - 直接粘贴 CSV 或 JSON 格式数据
- ✏️ **手动输入** - 表格形式手动编辑数据
- 🔗 **URL导入** - 从远程URL获取数据

### 智能推荐
- 🤖 **自动分析** - 自动识别数据类型
- 💡 **图表推荐** - 智能推荐最佳图表类型
- 📝 **推荐理由** - 解释为什么推荐该图表

### 图表类型
- 📊 柱状图（支持横向/纵向）
- 📈 折线图（支持平滑曲线）
- 🥧 饼图（支持环形图）
- ⚬ 散点图（支持回归线）
- 🎯 雷达图
- 🏔️ 面积图

### 导出功能
- 🖼️ PNG 图片
- 📐 SVG 矢量图
- 📄 PDF 文档
- 💻 HTML 代码
- 💾 项目文件（可再次编辑）

### AI 辅助（规划中）
- 自然语言生成图表
- 数据洞察分析
- 智能问答

## 🚀 快速开始

### 网页版（阉割版）
```bash
# 克隆仓库
git clone https://github.com/your-username/picture-can-see.git

# 进入目录
cd picture-can-see

# 启动本地服务器
python -m http.server 8080
# 或
npx serve

# 访问 http://localhost:8080
```

### 桌面版（完整版）
下载桌面版获取完整功能：
- 更大的数据处理能力（百万行级别）
- 数据库连接（SQLite、MySQL、PostgreSQL、MongoDB）
- 本地AI模型支持
- 项目文件保存/加载
- 更多图表类型

## 📁 项目结构

```
picture-can-see/
├── index.html              # 网页版入口
├── src/
│   ├── core/               # 核心架构
│   │   ├── app.js          # 应用核心
│   │   ├── events.js       # 事件系统
│   │   └── state.js        # 状态管理
│   ├── data/               # 数据层
│   │   ├── parser.js       # 文件解析
│   │   ├── source.js       # 数据源管理
│   │   └── input.js        # 输入组件
│   ├── transform/          # 数据转换
│   │   ├── detector.js     # 类型检测
│   │   └── transformer.js  # 数据转换
│   ├── visualization/      # 可视化
│   │   ├── base.js         # 图表基类
│   │   ├── charts.js       # 图表组件
│   │   └── recommender.js  # 图表推荐
│   ├── export/             # 导出
│   │   └── exporter.js     # 导出功能
│   ├── ui/                 # UI组件
│   │   └── components.js   # 界面组件
│   └── main.js             # 主入口
├── styles/
│   └── main.css            # 样式文件
├── locales/                # 多语言
│   └── index.js            # 语言包
├── assets/                 # 资源文件
├── libs/                   # 第三方库
├── PRODUCT_DESIGN.md       # 产品设计文档
└── README.md
```

## 🛠️ 技术栈

### 网页版
- HTML5 / CSS3 / JavaScript (ES6+)
- [D3.js](https://d3js.org/) - 数据可视化
- [SheetJS](https://sheetjs.com/) - Excel 解析
- [jsPDF](https://github.com/parallax/jsPDF) - PDF 导出

### 桌面版（规划中）
- C# / .NET 8
- WinUI 3 - UI框架
- ScottPlot - 图表渲染

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

## 🎯 使用场景

- ✅ 快速出图（办公）
- ✅ 学术/报告图表
- ✅ 个人数据探索
- ✅ 商业展示

## 🌐 多语言支持

- 🇨🇳 简体中文
- 🇺🇸 English
- 🇯🇵 日本語

## 📄 许可证

[MIT License](LICENSE)

---

⭐ 如果这个项目对你有帮助，请点个 Star！
