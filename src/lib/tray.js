const { app, Tray, Menu } = require('electron');
const path = require('path');
const { showWindow, setIsQuitting } = require('./window');

let tray = null;

function buildContextMenu(config, onProfileChange) {
    const isEnabled = config && config.enabled !== false;
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
            label: 'Settings',
            click: () => {
                showWindow();
            }
        },
        {
            label: `Status: ${isEnabled ? 'Active ✓' : 'Disabled ✗'}`,
            enabled: false
        },
        { type: 'separator' },
        {
            label: 'Profiles',
            submenu: profileMenuItems.length > 0 ? profileMenuItems : [{ label: 'Default', enabled: false }]
        },
        { type: 'separator' },
        {
            label: 'Quit Zenith',
            click: () => {
                setIsQuitting(true);
                app.quit();
            }
        }
    ]);
}

function createTray(config, onProfileChange) {
    if (tray) {
        updateTray(config, onProfileChange);
        return tray;
    }

    const iconPath = path.join(__dirname, '..', '..', 'assets', 'icon.png');
    tray = new Tray(iconPath);
    tray.setToolTip('Zenith — Copilot Hotkey Remapper');

    tray.on('click', () => {
        showWindow();
    });

    updateTray(config, onProfileChange);
    return tray;
}

function updateTray(config, onProfileChange) {
    if (!tray) {
        return;
    }
    const contextMenu = buildContextMenu(config, onProfileChange);
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
