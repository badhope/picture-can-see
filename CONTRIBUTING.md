# Contributing to Picture Can See

First off, thank you for considering contributing to Picture Can See! It's people like you that make Picture Can See such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Documentation](#documentation)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior via GitHub Issues.

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- A code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/picture-can-see.git
cd picture-can-see
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/badhope/picture-can-see.git
```

---

## Development Setup

### Install Dependencies

```bash
# Install all dependencies (root + workspaces)
npm install

# Or install separately
npm run install:all
```

### Run Development Servers

```bash
# Web version
npm run web
# Open http://localhost:3000

# Desktop version
npm run desktop
# Electron app will launch
```

### Build for Production

```bash
# Build desktop app for all platforms
npm run desktop:build

# Build for specific platform
npm run desktop:build:win    # Windows
npm run desktop:build:mac    # macOS
npm run desktop:build:linux  # Linux
```

---

## Project Structure

```
picture-can-see/
├── .github/                    # GitHub configurations
│   ├── workflows/              # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
│
├── web/                        # Web application
│   ├── src/
│   │   ├── core/              # Core architecture
│   │   │   ├── app.js         # Application core
│   │   │   ├── events.js      # Event system
│   │   │   └── state.js       # State management
│   │   ├── data/              # Data handling
│   │   ├── transform/         # Data transformation
│   │   ├── visualization/     # Chart rendering
│   │   ├── export/            # Export functionality
│   │   └── ui/                # UI components
│   ├── styles/                # Stylesheets
│   ├── locales/               # Internationalization
│   └── examples/              # Sample data
│
├── desktop/                    # Desktop application
│   ├── src/                   # Source (shared with web)
│   ├── main.js                # Electron main process
│   ├── preload.js             # Preload script
│   └── assets/                # Application assets
│
└── [config files]             # Various configuration files
```

### Key Modules

| Module | Purpose |
|--------|---------|
| `core/` | Application core, events, state management |
| `data/` | File parsing, data sources, input handling |
| `transform/` | Type detection, data transformation |
| `visualization/` | Chart rendering, recommendations |
| `export/` | Export to various formats |
| `ui/` | User interface components |

---

## Coding Standards

### Code Style

We use the following tools to maintain code quality:

- **EditorConfig**: `.editorconfig`
- **Prettier**: `.prettierrc`

#### JavaScript Guidelines

- Use 4 spaces for indentation
- Use single quotes for strings
- Add semicolons at statement ends
- Use `const` and `let` instead of `var`
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Add JSDoc comments for public functions

Example:

```javascript
/**
 * Parses CSV content into structured data
 * @param {string} content - Raw CSV content
 * @returns {{headers: string[], data: Object[], errors: string[]}}
 */
parseCSV(content) {
    const lines = this._splitLines(content);
    if (lines.length === 0) {
        return { headers: [], data: [], errors: [] };
    }
    // ... implementation
}
```

### CSS Guidelines

- Use CSS custom properties (variables)
- Follow BEM naming convention for classes
- Mobile-first responsive design
- Use flexbox and grid for layouts

### File Naming

- Use lowercase with hyphens: `chart-base.js`
- Test files: `chart-base.test.js`
- Component files: `ChartBase.js` (PascalCase for classes)

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tools |
| `ci` | CI/CD configuration |
| `revert` | Revert previous commit |

### Examples

```bash
feat(chart): add heatmap chart type

Add support for heatmap visualization with customizable color scales.
Includes legend and tooltip support.

Closes #123
```

```bash
fix(parser): handle empty CSV rows correctly

Empty rows were causing parsing errors. Now they are skipped gracefully.

Fixes #456
```

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

2. **Run tests** (when available):

```bash
npm test
```

3. **Check code style**:

```bash
npm run lint
npm run format
```

4. **Update documentation** if needed

5. **Add tests** for new features

### Submitting

1. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:

```bash
git add .
git commit -m "feat: your feature description"
```

3. Push to your fork:

```bash
git push origin feature/your-feature-name
```

4. Open a Pull Request on GitHub

### PR Template

Fill out the Pull Request template completely:

- Description of changes
- Related issue (if any)
- Type of change (bug fix, feature, etc.)
- Testing performed
- Screenshots (if applicable)

### Review Process

1. At least one maintainer must approve
2. All CI checks must pass
3. No merge conflicts
4. Documentation updated (if needed)

---

## Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported in [Issues](https://github.com/badhope/picture-can-see/issues)
2. Try to reproduce with the latest version
3. Collect information:
   - OS and version
   - Node.js version
   - Steps to reproduce
   - Expected vs actual behavior

### Submit a Bug Report

Use the [Bug Report template](https://github.com/badhope/picture-can-see/issues/new?template=bug_report.yml).

Include:

- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if helpful)
- Environment details

---

## Suggesting Features

### Before Suggesting

1. Check if the feature has already been suggested
2. Check the [Roadmap](README.md#roadmap) to see if it's planned
3. Consider if it fits the project scope

### Submit a Feature Request

Use the [Feature Request template](https://github.com/badhope/picture-can-see/issues/new?template=feature_request.yml).

Include:

- Clear description of the feature
- Use case and benefits
- Possible implementation ideas
- Alternatives considered

---

## Documentation

### Types of Documentation

- **README.md**: Project overview and quick start
- **CHANGELOG.md**: Version history
- **CONTRIBUTING.md**: This file
- **SECURITY.md**: Security policy
- **CODE_OF_CONDUCT.md**: Community guidelines
- **PRODUCT_DESIGN.md**: Product design document
- **Code comments**: Inline documentation

### Improving Documentation

Documentation improvements are always welcome! You can:

- Fix typos or clarify existing docs
- Add examples or tutorials
- Translate documentation
- Update screenshots

---

## Questions?

- Open a [Discussion](https://github.com/badhope/picture-can-see/discussions)
- Check existing [Issues](https://github.com/badhope/picture-can-see/issues)
- Review the [Wiki](https://github.com/badhope/picture-can-see/wiki)

---

## License

By contributing to Picture Can See, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing! 🎉
