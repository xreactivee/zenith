const { shell } = require('electron');
const { spawn } = require('child_process');

function executeAction(triggerAction, windowManager) {
    if (!triggerAction || !triggerAction.action) {
        return false;
    }

    try {
        const { action, actionValue, commandType } = triggerAction;

        if (action === 'zenith') {
            if (windowManager && typeof windowManager.showWindow === 'function') {
                windowManager.showWindow();
                return true;
            }
        }

        if (action === 'app') {
            const appPath = (actionValue || '').trim();
            if (!appPath) {
                return false;
            }

            shell.openPath(appPath).then((err) => {
                if (err) {
                    try {
                        const child = spawn(appPath, [], { detached: true, stdio: 'ignore' });
                        child.unref();
                    } catch (spawnErr) {
                        console.error('Spawn fallback error:', spawnErr);
                    }
                }
            }).catch((err) => {
                console.error('Shell openPath error:', err);
                try {
                    const child = spawn(appPath, [], { detached: true, stdio: 'ignore' });
                    child.unref();
                } catch (spawnErr) {
                    console.error('Spawn fallback error:', spawnErr);
                }
            });
            return true;
        }

        if (action === 'command') {
            const cmd = (actionValue || '').trim();
            if (!cmd) {
                return false;
            }

            if (commandType === 'powershell') {
                const child = spawn('powershell.exe', ['-NoProfile', '-Command', cmd], { detached: true, stdio: 'ignore' });
                child.unref();
            } else {
                const child = spawn('cmd.exe', ['/c', cmd], { detached: true, stdio: 'ignore' });
                child.unref();
            }
            return true;
        }
    } catch (error) {
        console.error('Error executing action:', error);
    }
    return false;
}

module.exports = {
    executeAction
};
