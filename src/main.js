const { app, ipcMain } = require('electron');
const { ok, created, badRequest, internalError } = require('./lib/response');
const {
    loadConfig,
    saveConfig,
    getActiveProfile,
    createProfile,
    renameProfile,
    deleteProfile
} = require('./lib/config');
const {
    getLocalSession,
    loginUser,
    registerUser,
    logoutUser,
    upgradeUserToPro
} = require('./lib/auth');
const { setupHotkey, stopHotkeyListener } = require('./lib/hotkey');
const { executeAction } = require('./lib/executor');
const { getInstalledApps } = require('./lib/appScanner');
const {
    createWindow,
    showWindow,
    minimizeWindow,
    closeWindow,
    createSplashWindow,
    closeSplashWindow,
    getSplashWindow,
    setIsQuitting,
    getMainWindow
} = require('./lib/window');
const { createTray, updateTray, destroyTray } = require('./lib/tray');
const {
    checkStartupUpdate,
    startBackgroundUpdateChecker,
    installUpdate,
    getUpdateInfo
} = require('./lib/updater');

let currentConfig = loadConfig();

function handleTrigger(triggerType) {
    if (!currentConfig || !currentConfig.enabled) {
        return;
    }
    const session = getLocalSession();
    if (session.plan !== 'pro' && triggerType !== 'singlePress') {
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

    ipcMain.handle('create-profile', (event, name) => {
        try {
            const session = getLocalSession();
            const saved = createProfile(name, session.plan || 'free');
            if (saved) {
                currentConfig = saved;
                updateTray(currentConfig, handleProfileChange);
                return created(saved);
            }
            return badRequest('Failed to create profile');
        } catch (error) {
            return badRequest(error.message);
        }
    });

    ipcMain.handle('rename-profile', (event, profileId, name) => {
        try {
            const saved = renameProfile(profileId, name);
            if (saved) {
                currentConfig = saved;
                updateTray(currentConfig, handleProfileChange);
                return ok(saved);
            }
            return badRequest('Failed to rename profile');
        } catch (error) {
            return badRequest(error.message);
        }
    });

    ipcMain.handle('delete-profile', (event, profileId) => {
        try {
            const saved = deleteProfile(profileId);
            if (saved) {
                currentConfig = saved;
                updateTray(currentConfig, handleProfileChange);
                return ok(saved);
            }
            return badRequest('Failed to delete profile');
        } catch (error) {
            return badRequest(error.message);
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

    ipcMain.handle('auth-login', async (event, credentials) => {
        try {
            const session = await loginUser(credentials.email, credentials.password);
            return ok(session);
        } catch (error) {
            return badRequest(error.message);
        }
    });

    ipcMain.handle('auth-register', async (event, credentials) => {
        try {
            const session = await registerUser(credentials.email, credentials.password);
            return created(session);
        } catch (error) {
            return badRequest(error.message);
        }
    });

    ipcMain.handle('auth-logout', () => {
        try {
            const result = logoutUser();
            return ok(result);
        } catch (error) {
            return internalError(error.message);
        }
    });

    ipcMain.handle('auth-get-session', () => {
        try {
            const session = getLocalSession();
            return ok(session);
        } catch (error) {
            return internalError(error.message);
        }
    });

    ipcMain.handle('auth-upgrade-pro', async () => {
        try {
            const updated = await upgradeUserToPro();
            return ok(updated);
        } catch (error) {
            return internalError(error.message);
        }
    });

    ipcMain.handle('updater-install', () => {
        try {
            installUpdate();
            return ok({ installing: true });
        } catch (error) {
            return internalError(error.message);
        }
    });

    ipcMain.handle('updater-check', () => {
        try {
            const info = getUpdateInfo();
            return ok(info);
        } catch (error) {
            return internalError(error.message);
        }
    });
}

app.on('ready', () => {
    setupIpcHandlers();
    createWindow({ show: false });
    createTray(currentConfig, handleProfileChange);
    setupHotkey(currentConfig, handleTrigger);
    getInstalledApps();

    const splash = createSplashWindow();

    checkStartupUpdate({
        onStatus: (text) => {
            if (splash && !splash.isDestroyed() && splash.webContents) {
                splash.webContents.send('splash-status', text);
            }
        },
        onProgress: (percent) => {
            if (splash && !splash.isDestroyed() && splash.webContents) {
                splash.webContents.send('splash-progress', percent);
            }
        },
        onDone: () => {
            closeSplashWindow();
            showWindow();
            startBackgroundUpdateChecker((info) => {
                const win = getMainWindow();
                if (win && !win.isDestroyed() && win.webContents) {
                    win.webContents.send('update-ready', info);
                }
            });
        }
    });
});

app.on('before-quit', () => {
    setIsQuitting(true);
    stopHotkeyListener();
    destroyTray();
});
