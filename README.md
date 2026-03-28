<p align="center">
  <img src="desktop/assets/icon.svg" alt="Picture Can See Logo" width="128" height="128">
</p>

<h1 align="center">Picture Can See</h1>

<p align="center">
  <strong>A powerful, intuitive data visualization tool for everyone</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <a href="README_CN.md">简体中文</a> | English
</p>

<p align="center">
  <img src="https://img.shields.io/github/v/release/badhope/picture-can-see?include_prereleases&style=flat-square" alt="GitHub release">
  <img src="https://img.shields.io/github/actions/workflow/status/badhope/picture-can-see/ci.yml?branch=main&style=flat-square&label=CI" alt="CI Status">
  <img src="https://img.shields.io/github/actions/workflow/status/badhope/picture-can-see/build-release.yml?branch=main&style=flat-square&label=Build" alt="Build Status">
  <img src="https://img.shields.io/github/license/badhope/picture-can-see?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/stars/badhope/picture-can-see?style=flat-square" alt="Stars">
  <img src="https://img.shields.io/github/forks/badhope/picture-can-see?style=flat-square" alt="Forks">
  <img src="https://img.shields.io/github/issues/badhope/picture-can-see?style=flat-square" alt="Issues">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Web-blue?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green?style=flat-square" alt="Node.js">
  <img src="https://img.shields.io/badge/Electron-Latest-blue?style=flat-square" alt="Electron">
  <img src="https://img.shields.io/badge/D3.js-7-orange?style=flat-square" alt="D3.js">
</p>

---

## Overview

**Picture Can See** is a modern, cross-platform data visualization application that transforms your raw data into beautiful, insightful charts with minimal effort. Whether you're a data analyst, researcher, student, or business professional, this tool makes data visualization accessible to everyone.

### Why Picture Can See?

- **Zero Learning Curve**: Drag and drop your data files, and get instant visualizations
- **Smart Recommendations**: AI-powered chart type suggestions based on your data characteristics
- **Multiple Export Formats**: Export to PNG, SVG, PDF, or HTML with one click
- **Cross-Platform**: Available as a web application and desktop app (Windows, macOS, Linux)
- **Privacy First**: All processing happens locally - your data never leaves your device
- **No Dependencies**: Works offline with no internet connection required

---

## Features

### Data Input

| Method | Description | Supported Formats |
|--------|-------------|-------------------|
| Drag & Drop | Simply drag files onto the application | CSV, Excel, JSON, TSV, TXT |
| Paste | Paste data directly from clipboard | CSV, JSON |
| Manual Input | Edit data in a spreadsheet-like interface | - |

### Supported Chart Types

| Chart | Icon | Best For | Example Use Case |
|-------|------|----------|------------------|
| Bar Chart | 📊 | Category comparison | Sales by product |
| Line Chart | 📈 | Trends over time | Stock prices, temperature |
| Pie Chart | 🥧 | Part-to-whole relationships | Market share |
| Scatter Plot | ⚬ | Correlation analysis | Height vs weight |
| Radar Chart | 🎯 | Multi-dimensional comparison | Skill assessment |
| Area Chart | 🏔️ | Cumulative trends | Revenue growth |

### Smart Features

- **Automatic Type Detection**: Intelligently identifies numeric, date, categorical, and text data
- **Chart Recommendation**: Suggests the best chart type based on data characteristics
- **Data Validation**: Detects and handles missing values, outliers, and format errors
- **Undo/Redo**: Full history support for all operations

### Export Options

| Format | Description | Use Case |
|--------|-------------|----------|
| PNG | High-resolution raster image | Presentations, reports |
| SVG | Scalable vector graphics | Print, further editing |
| PDF | Portable document | Documentation, sharing |
| HTML | Interactive web page | Web embedding |
| PCV | Project file | Save and continue later |

---

## Installation

### Desktop Application

Download the latest version for your platform:

| Platform | Download | Size |
|----------|----------|------|
| Windows | [picture-can-see-setup.exe](https://github.com/badhope/picture-can-see/releases) | ~80MB |
| macOS | [picture-can-see.dmg](https://github.com/badhope/picture-can-see/releases) | ~90MB |
| Linux | [picture-can-see.AppImage](https://github.com/badhope/picture-can-see/releases) | ~85MB |

### Web Version

Access the web version directly: [https://badhope.github.io/picture-can-see/](https://badhope.github.io/picture-can-see/)

Or run locally:

```bash
git clone https://github.com/badhope/picture-can-see.git
cd picture-can-see/web
npx serve -l 3000
```

### Build from Source

```bash
# Clone the repository
git clone https://github.com/badhope/picture-can-see.git
cd picture-can-see

# Install dependencies
npm install

# Run desktop app in development mode
npm run desktop

# Build for production
npm run desktop:build        # All platforms
npm run desktop:build:win    # Windows only
npm run desktop:build:mac    # macOS only
npm run desktop:build:linux  # Linux only
```

---

## Quick Start

### 1. Import Your Data

**Drag & Drop**: Simply drag your data file onto the application window.

**Or use the menu**: Click "Import Data" and select your file.

### 2. Choose a Chart Type

The application will automatically recommend the best chart type for your data. You can also manually select from:

- Bar Chart
- Line Chart
- Pie Chart
- Scatter Plot
- Radar Chart
- Area Chart

### 3. Customize

Use the configuration panel to:

- Set chart title and subtitle
- Adjust axis labels
- Change color schemes
- Enable/disable legends and tooltips
- Configure animations

### 4. Export

Click "Export" and choose your preferred format.

---

## Documentation

### Project Structure

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
│   │   │   └── state.js       # Reactive state management
│   │   ├── data/              # Data handling
│   │   │   ├── parser.js      # File parsers
│   │   │   ├── source.js      # Data source management
│   │   │   └── input.js       # Input handlers
│   │   ├── transform/         # Data transformation
│   │   │   ├── detector.js    # Type detection
│   │   │   └── transformer.js # Data transformation
│   │   ├── visualization/     # Chart rendering
│   │   │   ├── base.js        # Chart base class
│   │   │   ├── charts.js      # Chart implementations
│   │   │   └── recommender.js # Chart recommendation
│   │   ├── export/            # Export functionality
│   │   │   └── exporter.js    # Export handlers
│   │   └── ui/                # UI components
│   │       └── components.js  # UI components
│   ├── styles/                # Stylesheets
│   ├── locales/               # Internationalization
│   ├── examples/              # Sample data files
│   └── index.html             # Entry point
│
├── desktop/                    # Desktop application
│   ├── src/                   # Source code (shared with web)
│   ├── main.js                # Electron main process
│   ├── preload.js             # Preload script
│   └── index.html             # Entry point
│
├── package.json               # Root package configuration
├── LICENSE                    # MIT License
├── CONTRIBUTING.md            # Contribution guidelines
├── CHANGELOG.md               # Version history
├── SECURITY.md                # Security policy
├── CODE_OF_CONDUCT.md         # Code of conduct
└── README.md                  # This file
```

### Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Visualization | D3.js 7 | Data-driven document manipulation |
| File Parsing | SheetJS (xlsx) | Excel file handling |
| Desktop | Electron | Cross-platform desktop app |
| Build | electron-builder | Application packaging |
| Styling | CSS3 | Modern styling with CSS variables |
| Architecture | ES Modules | Native JavaScript modules |

### Architecture

The application follows a modular, event-driven architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Toolbar  │ │ Sidebar  │ │  Chart   │ │  Config  │   │
│  │          │ │          │ │  Area    │ │  Panel   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Core                      │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │   Event System   │  │  Reactive State  │            │
│  │   (EventEmitter) │  │   (ReactiveState)│            │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Business Logic                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Data   │ │Transform│ │  Chart  │ │ Export  │       │
│  │ Layer   │ │  Layer  │ │  Layer  │ │  Layer  │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────────────────┘
```

### API Reference

#### State Management

```javascript
import { app } from './core/app.js';

const state = app.getState();

state.get('chart.type');
state.set('chart.type', 'bar');
state.subscribe('chart.type', (newValue, oldValue) => {
  console.log(`Chart type changed from ${oldValue} to ${newValue}`);
});
```

#### Event System

```javascript
import { Events } from './core/events.js';

app.on(Events.CHART_RENDERED, (chart) => {
  console.log('Chart rendered:', chart);
});

app.emit(Events.DATA_LOADED, { source: 'file.csv' });
```

---

## Contributing

We welcome contributions from the community! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute

- 🐛 Report bugs via [Issues](https://github.com/badhope/picture-can-see/issues)
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- 🌟 Star the repository

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/picture-can-see.git
cd picture-can-see

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm run desktop

# Commit and push
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# Open a Pull Request
```

---

## Roadmap

### Version 1.1 (Planned)

- [ ] Additional chart types (heatmap, treemap, box plot)
- [ ] Data filtering and aggregation
- [ ] Custom color palettes
- [ ] Chart templates

### Version 1.2 (Planned)

- [ ] Real-time data streaming
- [ ] Dashboard creation
- [ ] Cloud sync (optional)
- [ ] Plugin system

### Version 2.0 (Future)

- [ ] AI-powered insights
- [ ] Natural language queries
- [ ] Collaborative editing
- [ ] Mobile companion app

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024-2025 Picture Can See Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## Acknowledgments

- [D3.js](https://d3js.org/) - Data-Driven Documents
- [Electron](https://www.electronjs.org/) - Build cross-platform desktop apps
- [SheetJS](https://sheetjs.com/) - Spreadsheet data toolkit
- [Feather Icons](https://feathericons.com/) - Beautiful open source icons

---

## Support

- 📖 [Documentation](https://github.com/badhope/picture-can-see/wiki)
- 🐛 [Issue Tracker](https://github.com/badhope/picture-can-see/issues)
- 💬 [Discussions](https://github.com/badhope/picture-can-see/discussions)

---

<p align="center">
  Made with ❤️ by the Picture Can See Team
</p>

<p align="center">
  <a href="https://github.com/badhope/picture-can-see/stargazers">
    <img src="https://img.shields.io/github/stars/badhope/picture-can-see?style=social" alt="Star us on GitHub">
  </a>
</p>
