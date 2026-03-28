# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added

#### Core Features
- Initial release of Picture Can See
- Web application for online data visualization
- Desktop application for Windows, macOS, and Linux
- Drag and drop file import (CSV, Excel, JSON, TSV, TXT)
- Clipboard paste support for CSV and JSON data
- Manual data input interface

#### Chart Types
- Bar Chart (vertical and horizontal)
- Line Chart
- Pie Chart
- Scatter Plot
- Radar Chart
- Area Chart

#### Smart Features
- Automatic data type detection
- Intelligent chart type recommendation
- Data validation and error handling
- Undo/Redo support for all operations

#### Export Options
- PNG export (high resolution)
- SVG export (vector graphics)
- PDF export (via jsPDF)
- HTML export (interactive)
- Project file export (.pcv format)

#### User Interface
- Dark theme with modern design
- Collapsible sidebar and configuration panel
- Real-time chart preview
- Responsive layout
- Toast notifications
- Loading indicators

#### Internationalization
- English (en-US)
- Chinese Simplified (zh-CN)
- Japanese (ja-JP)

#### Architecture
- Modular ES6+ codebase
- Event-driven architecture
- Reactive state management
- No external framework dependencies

#### Development
- Electron-based desktop application
- GitHub Actions CI/CD pipeline
- Automated builds for all platforms
- Dependabot for dependency updates

### Technical Details

#### Data Processing
- CSV parser with quote handling
- JSON parser with validation
- Excel parser via SheetJS
- TSV and TXT support
- Automatic encoding detection

#### Visualization
- D3.js v7 for chart rendering
- Smooth animations and transitions
- Interactive tooltips
- Responsive chart sizing
- Custom color schemes

#### Desktop Features
- Native file dialogs
- System menu integration
- Keyboard shortcuts
- Auto-update support (planned)

### Security
- Context isolation enabled
- Node integration disabled
- Secure IPC via preload scripts
- No remote code execution
- Local data processing only

### Documentation
- README with installation guide
- CONTRIBUTING guide
- Code of Conduct
- Security Policy
- Product Design document

---

## [Unreleased]

### Planned Features

#### Version 1.1
- [ ] Heatmap chart type
- [ ] Treemap chart type
- [ ] Box plot chart type
- [ ] Data filtering and aggregation
- [ ] Custom color palettes
- [ ] Chart templates
- [ ] Improved error messages
- [ ] Performance optimizations

#### Version 1.2
- [ ] Real-time data streaming
- [ ] Dashboard creation
- [ ] Cloud sync (optional)
- [ ] Plugin system
- [ ] Custom themes
- [ ] Chart annotations

#### Version 2.0
- [ ] AI-powered insights
- [ ] Natural language queries
- [ ] Collaborative editing
- [ ] Mobile companion app
- [ ] Advanced data transformation
- [ ] Statistical analysis tools

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2024-01-15 | Initial release with core features |

---

[1.0.0]: https://github.com/badhope/picture-can-see/releases/tag/v1.0.0
