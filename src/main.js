const { app, ipcMain } = require('electron');
const { ok, created, badRequest, internalError } = require('./lib/response');
const { loadConfig, saveConfig, getActiveProfile } = require('./lib/config');
const { setupHotkey, stopHotkeyListener } = require('./lib/hotkey');
const { executeAction } = require('./lib/executor');
const { getInstalledApps } = require('./lib/appScanner');
const {
    createWindow,
    showWindow,
    minimizeWindow,
    closeWindow,
    setIsQuitting,
    getMainWindow
} = require('./lib/window');
const { createTray, updateTray, destroyTray } = require('./lib/tray');

let currentConfig = loadConfig();

function handleTrigger(triggerType) {
    if (!currentConfig || !currentConfig.enabled) {
        return;
    }
    const profile = getActiveProfile(currentConfig);
    if (!profile || !profile.triggers) {
        return;
    }
    const actionItem = profile.triggers[triggerType] || profile.triggers.singlePress;
    executeAction(actionItem, { showWindow });
}

function handleProfileChange(profileId) {
    currentConfig.activeProfileId = profileId;
    saveConfig(currentConfig);
    updateTray(currentConfig, handleProfileChange);
    const win = getMainWindow();
    if (win && win.webContents) {
        win.webContents.send('profile-changed', profileId);
    }
}

function setupIpcHandlers() {
    ipcMain.on('window-control', (event, action) => {
        if (action === 'minimize') {
            minimizeWindow();
        } else if (action === 'close') {
            closeWindow();
        }
    });

    ipcMain.handle('load-config', () => {
        try {
            currentConfig = loadConfig();
            return ok(currentConfig);
        } catch (error) {
            return internalError(error.message);
        }
    });

    ipcMain.handle('save-config', (event, newConfig) => {
        try {
            const saved = saveConfig(newConfig);
            if (saved) {
                currentConfig = saved;
                setupHotkey(currentConfig, handleTrigger);
                updateTray(currentConfig, handleProfileChange);
                return ok(saved);
            }
            return badRequest('Failed to save configuration');
        } catch (error) {
            return internalError(error.message);
        }
    });

    ipcMain.handle('execute-action', (event, triggerAction) => {
        try {
            const success = executeAction(triggerAction, { showWindow });
            if (success) {
                return created({ executed: true });
            }
            return badRequest('Failed to execute action');
        } catch (error) {
            return internalError(error.message);
        }
    });

    ipcMain.handle('get-installed-apps', async () => {
        try {
            const apps = await getInstalledApps();
            return ok(apps);
        } catch (error) {
            return internalError(error.message);
        }
    });

    ipcMain.handle('set-active-profile', (event, profileId) => {
        try {
            handleProfileChange(profileId);
            return ok(currentConfig);
        } catch (error) {
            return internalError(error.message);
        }
    });

    ipcMain.handle('set-auto-start', (event, enabled) => {
        try {
            currentConfig.autoStart = Boolean(enabled);
            saveConfig(currentConfig);
            return ok({ autoStart: currentConfig.autoStart });
        } catch (error) {
            return internalError(error.message);
        }
    });
}

app.on('ready', () => {
    setupIpcHandlers();
    createWindow();
    createTray(currentConfig, handleProfileChange);
    setupHotkey(currentConfig, handleTrigger);
    getInstalledApps();
});

app.on('before-quit', () => {
    setIsQuitting(true);
    stopHotkeyListener();
    destroyTray();
});
