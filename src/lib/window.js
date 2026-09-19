const { BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;
let splashWindow = null;
let isQuitting = false;

function setIsQuitting(value) {
    isQuitting = Boolean(value);
}

function getIsQuitting() {
    return isQuitting;
}

function getMainWindow() {
    return mainWindow;
}

function getSplashWindow() {
    return splashWindow;
}

function createSplashWindow() {
    if (splashWindow) {
        return splashWindow;
    }

    splashWindow = new BrowserWindow({
        width: 320,
        height: 350,
        resizable: false,
        maximizable: false,
        frame: false,
        show: true,
        center: true,
        backgroundColor: '#09090b',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '..', 'splashPreload.js')
        },
        icon: path.join(__dirname, '..', '..', 'assets', 'icon.png')
    });

    splashWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'splash.html'));

    splashWindow.on('closed', () => {
        splashWindow = null;
    });

    return splashWindow;
}

function closeSplashWindow() {
    if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
        splashWindow = null;
    }
}

function createWindow(options = {}) {
    if (mainWindow) {
        if (options.show !== false) {
            showWindow();
        }
        return mainWindow;
    }

    mainWindow = new BrowserWindow({
        width: 620,
        height: 640,
        resizable: false,
        maximizable: false,
        frame: false,
        show: options.show !== false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, '..', '..', 'assets', 'icon.png')
    });

    mainWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    return mainWindow;
}

function showWindow() {
    if (!mainWindow) {
        createWindow({ show: true });
        return;
    }

    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
}

function minimizeWindow() {
    if (mainWindow) {
        mainWindow.minimize();
    }
}

function closeWindow() {
    if (mainWindow) {
        mainWindow.close();
    }
}

module.exports = {
    createWindow,
    showWindow,
    minimizeWindow,
    closeWindow,
    getMainWindow,
    createSplashWindow,
    closeSplashWindow,
    getSplashWindow,
    setIsQuitting,
    getIsQuitting
};
