const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
    saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
    saveImage: (options) => ipcRenderer.invoke('save-image', options),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    showMessage: (options) => ipcRenderer.invoke('show-message', options),
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    getClipboardText: () => ipcRenderer.invoke('get-clipboard-text'),
    setClipboardText: (text) => ipcRenderer.invoke('set-clipboard-text', text),
    
    onMenuAction: (callback) => {
        ipcRenderer.on('menu-action', (event, action) => callback(action));
    },
    
    removeMenuActionListener: () => {
        ipcRenderer.removeAllListeners('menu-action');
    }
});
