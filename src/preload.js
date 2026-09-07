const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    loadConfig: () => ipcRenderer.invoke('load-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    executeAction: (triggerAction) => ipcRenderer.invoke('execute-action', triggerAction),
    windowControl: (action) => ipcRenderer.send('window-control', action),
    getInstalledApps: () => ipcRenderer.invoke('get-installed-apps'),
    setActiveProfile: (profileId) => ipcRenderer.invoke('set-active-profile', profileId),
    setAutoStart: (enabled) => ipcRenderer.invoke('set-auto-start', enabled)
});
