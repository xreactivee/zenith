const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    loadConfig: () => ipcRenderer.invoke('load-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    executeAction: (triggerAction) => ipcRenderer.invoke('execute-action', triggerAction),
    windowControl: (action) => ipcRenderer.send('window-control', action),
    getInstalledApps: () => ipcRenderer.invoke('get-installed-apps'),
    setActiveProfile: (profileId) => ipcRenderer.invoke('set-active-profile', profileId),
    createProfile: (name) => ipcRenderer.invoke('create-profile', name),
    renameProfile: (profileId, name) => ipcRenderer.invoke('rename-profile', profileId, name),
    deleteProfile: (profileId) => ipcRenderer.invoke('delete-profile', profileId),
    setAutoStart: (enabled) => ipcRenderer.invoke('set-auto-start', enabled),
    login: (credentials) => ipcRenderer.invoke('auth-login', credentials),
    register: (credentials) => ipcRenderer.invoke('auth-register', credentials),
    logout: () => ipcRenderer.invoke('auth-logout'),
    getSession: () => ipcRenderer.invoke('auth-get-session'),
    upgradeToPro: () => ipcRenderer.invoke('auth-upgrade-pro'),
    installUpdate: () => ipcRenderer.invoke('updater-install'),
    checkForUpdates: () => ipcRenderer.invoke('updater-check'),
    onUpdateReady: (callback) => {
        ipcRenderer.on('update-ready', (event, info) => callback(info));
    }
});

