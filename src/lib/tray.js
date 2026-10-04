const { app, Tray, Menu } = require('electron');
const path = require('path');
const { showWindow, setIsQuitting } = require('./window');

let tray = null;
let cachedOnProfileChange = null;
let cachedOnAutoStartChange = null;

function buildContextMenu(config, onProfileChange, onAutoStartChange) {
    const isEnabled = config && config.enabled !== false;
    const isAutoStart = config && config.autoStart === true;
    const profiles = config && Array.isArray(config.profiles) ? config.profiles : [];
    const activeProfileId = config && config.activeProfileId ? config.activeProfileId : 'default';

    const profileMenuItems = profiles.map((p) => ({
        label: p.name,
        type: 'radio',
        checked: p.id === activeProfileId,
        click: () => {
            if (typeof onProfileChange === 'function') {
                onProfileChange(p.id);
            }
        }
    }));

    return Menu.buildFromTemplate([
        {
            label: 'Open Zenith',
            click: () => {
                showWindow();
            }
        },
        {
            label: `Status: ${isEnabled ? 'Active ✓' : 'Disabled ✗'}`,
            enabled: false
        },
        {
            label: 'Start in Background',
            type: 'checkbox',
            checked: isAutoStart,
            click: (menuItem) => {
                if (typeof onAutoStartChange === 'function') {
                    onAutoStartChange(menuItem.checked);
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Profiles',
            submenu: profileMenuItems.length > 0 ? profileMenuItems : [{ label: 'Default', enabled: false }]
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                setIsQuitting(true);
                app.quit();
            }
        }
    ]);
}

function createTray(config, onProfileChange, onAutoStartChange) {
    if (onProfileChange) cachedOnProfileChange = onProfileChange;
    if (onAutoStartChange) cachedOnAutoStartChange = onAutoStartChange;

    if (tray) {
        updateTray(config, cachedOnProfileChange, cachedOnAutoStartChange);
        return tray;
    }

    const iconPath = path.join(__dirname, '..', '..', 'assets', 'icon.png');
    tray = new Tray(iconPath);
    tray.setToolTip('Zenith — Copilot Hotkey Remapper');

    tray.on('click', () => {
        showWindow();
    });

    updateTray(config, cachedOnProfileChange, cachedOnAutoStartChange);
    return tray;
}

function updateTray(config, onProfileChange, onAutoStartChange) {
    if (!tray) {
        return;
    }
    if (onProfileChange) cachedOnProfileChange = onProfileChange;
    if (onAutoStartChange) cachedOnAutoStartChange = onAutoStartChange;

    const contextMenu = buildContextMenu(config, cachedOnProfileChange, cachedOnAutoStartChange);
    tray.setContextMenu(contextMenu);
}

function destroyTray() {
    if (tray) {
        tray.destroy();
        tray = null;
    }
}

module.exports = {
    createTray,
    updateTray,
    destroyTray
};
