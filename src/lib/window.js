const { BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;
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

function createWindow() {
    if (mainWindow) {
        showWindow();
        return mainWindow;
    }

    mainWindow = new BrowserWindow({
        width: 620,
        height: 640,
        resizable: false,
        maximizable: false,
        frame: false,
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
        createWindow();
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
    setIsQuitting,
    getIsQuitting
};
