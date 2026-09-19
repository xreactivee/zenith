const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('splashApi', {
    onStatus: (callback) => {
        ipcRenderer.on('splash-status', (event, text) => callback(text));
    },
    onProgress: (callback) => {
        ipcRenderer.on('splash-progress', (event, percent) => callback(percent));
    }
});
