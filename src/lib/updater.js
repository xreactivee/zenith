const { app } = require('electron');
const { autoUpdater } = require('electron-updater');

let updateDownloadedInfo = null;
let splashCompleted = false;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowPrerelease = false;

function checkStartupUpdate({ onStatus, onProgress, onDone }) {
    if (splashCompleted) {
        return;
    }

    const finishSplash = () => {
        if (!splashCompleted) {
            splashCompleted = true;
            if (typeof onDone === 'function') {
                onDone();
            }
        }
    };

    const safetyTimeout = setTimeout(() => {
        finishSplash();
    }, 2800);

    if (!app.isPackaged) {
        if (typeof onStatus === 'function') {
            onStatus('Checking for updates...');
        }
        setTimeout(() => {
            if (typeof onStatus === 'function') {
                onStatus('Zenith is up to date');
            }
            setTimeout(() => {
                clearTimeout(safetyTimeout);
                finishSplash();
            }, 600);
        }, 900);
        return;
    }

    autoUpdater.once('checking-for-update', () => {
        if (typeof onStatus === 'function') {
            onStatus('Checking for updates...');
        }
    });

    autoUpdater.once('update-available', (info) => {
        clearTimeout(safetyTimeout);
        if (typeof onStatus === 'function') {
            onStatus(`Downloading update v${info.version}...`);
        }
    });

    autoUpdater.once('update-not-available', () => {
        clearTimeout(safetyTimeout);
        if (typeof onStatus === 'function') {
            onStatus('Zenith is up to date');
        }
        setTimeout(() => {
            finishSplash();
        }, 500);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        const percent = Math.round(progressObj.percent || 0);
        if (typeof onProgress === 'function') {
            onProgress(percent);
        }
        if (typeof onStatus === 'function') {
            onStatus(`Downloading update (${percent}%)...`);
        }
    });

    autoUpdater.once('update-downloaded', (info) => {
        updateDownloadedInfo = info;
        if (typeof onStatus === 'function') {
            onStatus('Restarting Zenith to update...');
        }
        setTimeout(() => {
            autoUpdater.quitAndInstall(false, true);
        }, 700);
    });

    autoUpdater.once('error', (err) => {
        console.warn('Updater startup error:', err && err.message);
        clearTimeout(safetyTimeout);
        finishSplash();
    });

    try {
        autoUpdater.checkForUpdates();
    } catch (err) {
        console.warn('Could not check for updates:', err && err.message);
        clearTimeout(safetyTimeout);
        finishSplash();
    }
}

function startBackgroundUpdateChecker(onUpdateReady) {
    if (!app.isPackaged) {
        return;
    }

    autoUpdater.on('update-downloaded', (info) => {
        updateDownloadedInfo = info;
        if (typeof onUpdateReady === 'function') {
            onUpdateReady(info);
        }
    });

    const checkInterval = 60 * 60 * 1000;
    setInterval(() => {
        try {
            autoUpdater.checkForUpdates();
        } catch (err) {
            console.warn('Background update check error:', err && err.message);
        }
    }, checkInterval);

    setTimeout(() => {
        try {
            autoUpdater.checkForUpdates();
        } catch (err) {
            console.warn('Initial background update check error:', err && err.message);
        }
    }, 15000);
}

function installUpdate() {
    autoUpdater.quitAndInstall(false, true);
}

function getUpdateInfo() {
    return updateDownloadedInfo;
}

module.exports = {
    checkStartupUpdate,
    startBackgroundUpdateChecker,
    installUpdate,
    getUpdateInfo
};
