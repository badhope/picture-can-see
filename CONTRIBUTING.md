# 贡献指南

感谢您有兴趣为 Picture Can See 做出贡献！

## 🚀 快速开始

### 1. Fork 并克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/picture-can-see.git
cd picture-can-see
```

### 2. 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或者分别安装
cd web && npm install
cd ../desktop && npm install
```

### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
```

## 📝 开发规范

### 代码风格

- 使用 4 空格缩进
- 使用单引号
- 语句末尾加分号
- 遵循 `.editorconfig` 和 `.prettierrc` 配置

### 提交信息

请使用清晰的提交信息：

```
类型: 简短描述

详细描述（可选）
```

类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

### 目录结构

```
picture-can-see/
├── web/          # Web 版本
├── desktop/      # 桌面版本
└── .github/      # GitHub 配置
```

## 🧪 测试

在提交 PR 之前，请确保：

1. Web 版本可以正常启动
2. 桌面版本可以正常启动
3. 新功能正常工作
4. 没有引入新的警告或错误

## 📦 提交 PR

1. 确保代码通过所有检查
2. 更新相关文档
3. 填写 PR 模板
4. 等待审核

## 🐛 报告 Bug

请使用 [Bug Report](https://github.com/badhope/picture-can-see/issues/new?template=bug_report.yml) 模板提交 Issue。

## 💡 功能建议

请使用 [Feature Request](https://github.com/badhope/picture-can-see/issues/new?template=feature_request.yml) 模板提交建议。

## 📄 许可证

通过贡献代码，您同意您的代码将在 MIT 许可证下发布。
