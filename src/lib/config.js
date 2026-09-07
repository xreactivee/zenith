const { app } = require('electron');
const path = require('path');
const fs = require('fs');

function getConfigDir() {
    if (app && typeof app.getPath === 'function') {
        return app.getPath('userData');
    }
    return path.join(process.env.APPDATA || process.env.HOME || '.', 'zenith');
}

function getConfigPath() {
    return path.join(getConfigDir(), 'config.json');
}

const defaultConfig = {
    activeProfileId: 'default',
    profiles: [
        {
            id: 'default',
            name: 'Default',
            triggers: {
                singlePress: {
                    action: 'zenith',
                    actionValue: '',
                    commandType: 'cmd'
                },
                doublePress: {
                    action: 'command',
                    actionValue: 'start explorer.exe',
                    commandType: 'cmd'
                },
                longPress: {
                    action: 'command',
                    actionValue: 'taskmgr.exe',
                    commandType: 'cmd'
                }
            }
        },
        {
            id: 'work',
            name: 'Work',
            triggers: {
                singlePress: {
                    action: 'command',
                    actionValue: 'notepad.exe',
                    commandType: 'cmd'
                },
                doublePress: {
                    action: 'command',
                    actionValue: 'start explorer.exe',
                    commandType: 'cmd'
                },
                longPress: {
                    action: 'zenith',
                    actionValue: '',
                    commandType: 'cmd'
                }
            }
        },
        {
            id: 'gaming',
            name: 'Gaming',
            triggers: {
                singlePress: {
                    action: 'command',
                    actionValue: 'calc.exe',
                    commandType: 'cmd'
                },
                doublePress: {
                    action: 'zenith',
                    actionValue: '',
                    commandType: 'cmd'
                },
                longPress: {
                    action: 'command',
                    actionValue: 'taskmgr.exe',
                    commandType: 'cmd'
                }
            }
        }
    ],
    autoStart: false,
    enabled: true,
    hotkey: {
        keyCode: 'win+c',
        keys: ['win', 'c']
    }
};

function ensureConfigDir() {
    const dir = getConfigDir();
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function normalizeConfig(rawConfig) {
    if (!rawConfig || typeof rawConfig !== 'object') {
        return defaultConfig;
    }

    if (rawConfig.action && !rawConfig.profiles) {
        const migratedTriggers = {
            singlePress: {
                action: rawConfig.action || 'zenith',
                actionValue: rawConfig.actionValue || '',
                commandType: rawConfig.commandType || 'cmd'
            },
            doublePress: {
                action: 'command',
                actionValue: 'start explorer.exe',
                commandType: 'cmd'
            },
            longPress: {
                action: 'command',
                actionValue: 'taskmgr.exe',
                commandType: 'cmd'
            }
        };

        return {
            activeProfileId: 'default',
            profiles: [
                {
                    id: 'default',
                    name: 'Default',
                    triggers: migratedTriggers
                }
            ],
            autoStart: Boolean(rawConfig.autoStart),
            enabled: rawConfig.enabled !== false,
            hotkey: rawConfig.hotkey || defaultConfig.hotkey
        };
    }

    const profiles = Array.isArray(rawConfig.profiles) && rawConfig.profiles.length > 0
        ? rawConfig.profiles
        : defaultConfig.profiles;

    const activeProfileId = rawConfig.activeProfileId || profiles[0].id;

    return {
        activeProfileId,
        profiles,
        autoStart: Boolean(rawConfig.autoStart),
        enabled: rawConfig.enabled !== false,
        hotkey: rawConfig.hotkey || defaultConfig.hotkey
    };
}

function loadConfig() {
    try {
        ensureConfigDir();
        const filePath = getConfigPath();
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(fileContent);
            return normalizeConfig(parsed);
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
    return defaultConfig;
}

function applyAutoStartSetting(enabled) {
    try {
        if (app && typeof app.setLoginItemSettings === 'function') {
            app.setLoginItemSettings({
                openAtLogin: enabled,
                openAsHidden: true
            });
        }
    } catch (error) {
        console.error('Error setting login item:', error);
    }
}

function saveConfig(newConfig) {
    try {
        ensureConfigDir();
        const normalized = normalizeConfig(newConfig);
        const filePath = getConfigPath();
        fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), 'utf-8');
        applyAutoStartSetting(normalized.autoStart);
        return normalized;
    } catch (error) {
        console.error('Error saving config:', error);
        return null;
    }
}

function getActiveProfile(config) {
    const currentConfig = config || loadConfig();
    const active = currentConfig.profiles.find((p) => p.id === currentConfig.activeProfileId);
    return active || currentConfig.profiles[0] || defaultConfig.profiles[0];
}

module.exports = {
    defaultConfig,
    loadConfig,
    saveConfig,
    getActiveProfile,
    applyAutoStartSetting
};
