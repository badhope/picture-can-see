export class Exporter {
    constructor() {
        this.supportedFormats = ['png', 'svg', 'pdf', 'html'];
    }

    async exportAsPNG(svgElement, options = {}) {
        const scale = options.scale || 2;
        const backgroundColor = options.backgroundColor || '#0f172a';
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        
        return new Promise((resolve, reject) => {
            img.onload = () => {
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                ctx.scale(scale, scale);
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, img.width, img.height);
                ctx.drawImage(img, 0, 0);
                
                URL.revokeObjectURL(url);
                
                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create PNG blob'));
                    }
                }, 'image/png');
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load SVG'));
            };
            
            img.src = url;
        });
    }

    async exportAsSVG(svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        return blob;
    }

    async exportAsPDF(svgElement, options = {}) {
        const { jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2/+esm');
        
        const scale = options.scale || 2;
        const pngBlob = await this.exportAsPNG(svgElement, { scale });
        
        const imgData = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(pngBlob);
        });
        
        const img = new Image();
        await new Promise(resolve => {
            img.onload = resolve;
            img.src = imgData;
        });
        
        const pdf = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [img.width / scale, img.height / scale]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, img.width / scale, img.height / scale);
        
        return pdf.output('blob');
    }

    async exportAsHTML(svgElement, options = {}) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        
        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.title || 'Chart Export'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: ${options.backgroundColor || '#0f172a'};
        }
        .chart-container {
            max-width: 100%;
            overflow: auto;
        }
        svg {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="chart-container">
        ${svgData}
    </div>
</body>
</html>`;
        
        return new Blob([html], { type: 'text/html;charset=utf-8' });
    }

    async export(svgElement, format, options = {}) {
        switch (format.toLowerCase()) {
            case 'png':
                return this.exportAsPNG(svgElement, options);
            case 'svg':
                return this.exportAsSVG(svgElement);
            case 'pdf':
                return this.exportAsPDF(svgElement, options);
            case 'html':
                return this.exportAsHTML(svgElement, options);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async copyToClipboard(blob) {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }
}

export class ProjectExporter {
    constructor() {
        this.version = '1.0.0';
    }

    exportProject(state) {
        const project = {
            version: this.version,
            name: state.get('project.name') || '未命名项目',
            created: new Date().toISOString(),
            data: {
                sources: state.get('data.sources'),
                activeSourceId: state.get('data.activeSourceId')
            },
            chart: {
                type: state.get('chart.type'),
                config: state.get('chart.config')
            },
            ui: {
                theme: state.get('ui.theme'),
                language: state.get('ui.language')
            }
        };
        
        return new Blob([JSON.stringify(project, null, 2)], { 
            type: 'application/json' 
        });
    }

    importProject(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const project = JSON.parse(e.target.result);
                    
                    if (!project.version) {
                        throw new Error('Invalid project file');
                    }
                    
                    resolve(project);
                } catch (error) {
                    reject(new Error('Failed to parse project file: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}

export const exporter = new Exporter();
export const projectExporter = new ProjectExporter();
