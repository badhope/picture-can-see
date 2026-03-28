const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    const iconOptions = fs.existsSync(iconPath) ? { icon: iconPath } : {};
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        title: 'Picture Can See - 数据可视化工具',
        ...iconOptions,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        frame: true,
        backgroundColor: '#0f172a',
        show: false
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    createMenu();
}

function createMenu() {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '新建项目',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow.webContents.send('menu-action', 'new')
                },
                {
                    label: '打开项目',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => mainWindow.webContents.send('menu-action', 'open')
                },
                {
                    label: '保存项目',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => mainWindow.webContents.send('menu-action', 'save')
                },
                { type: 'separator' },
                {
                    label: '导入数据',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => mainWindow.webContents.send('menu-action', 'import')
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: '编辑',
            submenu: [
                {
                    label: '撤销',
                    accelerator: 'CmdOrCtrl+Z',
                    click: () => mainWindow.webContents.send('menu-action', 'undo')
                },
                {
                    label: '重做',
                    accelerator: 'CmdOrCtrl+Shift+Z',
                    click: () => mainWindow.webContents.send('menu-action', 'redo')
                },
                { type: 'separator' },
                {
                    label: '粘贴数据',
                    accelerator: 'CmdOrCtrl+V',
                    click: () => mainWindow.webContents.send('menu-action', 'paste')
                }
            ]
        },
        {
            label: '导出',
            submenu: [
                {
                    label: '导出为 PNG',
                    accelerator: 'CmdOrCtrl+Shift+P',
                    click: () => mainWindow.webContents.send('menu-action', 'export-png')
                },
                {
                    label: '导出为 SVG',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => mainWindow.webContents.send('menu-action', 'export-svg')
                },
                {
                    label: '导出为 PDF',
                    click: () => mainWindow.webContents.send('menu-action', 'export-pdf')
                }
            ]
        },
        {
            label: '视图',
            submenu: [
                { role: 'reload', label: '重新加载' },
                { role: 'toggleDevTools', label: '开发者工具' },
                { type: 'separator' },
                { role: 'resetZoom', label: '重置缩放' },
                { role: 'zoomIn', label: '放大' },
                { role: 'zoomOut', label: '缩小' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: '全屏' }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于 Picture Can See',
                            message: 'Picture Can See - 数据可视化工具',
                            detail: '版本: 1.0.0\n\n一款强大的本地数据可视化工具，支持多种图表类型和智能推荐。'
                        });
                    }
                },
                {
                    label: '查看文档',
                    click: () => shell.openExternal('https://github.com/badhope/picture-can-see')
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('open-file-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: '数据文件', extensions: ['csv', 'json', 'xlsx', 'xls', 'tsv', 'txt'] },
            { name: '项目文件', extensions: ['pcv'] },
            { name: '所有文件', extensions: ['*'] }
        ],
        ...options
    });
    return result;
});

ipcMain.handle('save-file-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        filters: [
            { name: '项目文件', extensions: ['pcv'] },
            { name: 'PNG 图片', extensions: ['png'] },
            { name: 'SVG 图片', extensions: ['svg'] },
            { name: 'PDF 文档', extensions: ['pdf'] }
        ],
        ...options
    });
    return result;
});

ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        if (['.xlsx', '.xls'].includes(ext)) {
            return { success: true, data: content, type: 'buffer', ext };
        } else {
            const text = content.toString('utf-8');
            return { success: true, data: text, type: 'text', ext };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        if (Buffer.isBuffer(data)) {
            fs.writeFileSync(filePath, data);
        } else {
            fs.writeFileSync(filePath, data, 'utf-8');
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-image', async (event, options) => {
    const { defaultPath, data, format } = options;
    
    const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath,
        filters: [
            { name: format.toUpperCase(), extensions: [format] }
        ]
    });
    
    if (result.canceled || !result.filePath) {
        return { success: false, canceled: true };
    }
    
    try {
        const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(result.filePath, buffer);
        return { success: true, path: result.filePath };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-app-path', async () => {
    return {
        appPath: app.getAppPath(),
        userData: app.getPath('userData'),
        documents: app.getPath('documents'),
        desktop: app.getPath('desktop')
    };
});

ipcMain.handle('show-message', async (event, options) => {
    return await dialog.showMessageBox(mainWindow, options);
});

ipcMain.handle('open-external', async (event, url) => {
    await shell.openExternal(url);
    return { success: true };
});

ipcMain.handle('get-clipboard-text', async () => {
    const { clipboard } = require('electron');
    return clipboard.readText();
});

ipcMain.handle('set-clipboard-text', async (event, text) => {
    const { clipboard } = require('electron');
    clipboard.writeText(text);
    return { success: true };
});
