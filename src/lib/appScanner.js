const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let cachedApps = null;

async function extractAppIcon(item) {
    try {
        const targetFile = item.iconFile || item.path;
        if (targetFile && fs.existsSync(targetFile)) {
            if (targetFile.toLowerCase().endsWith('.ico')) {
                const buffer = fs.readFileSync(targetFile);
                return `data:image/x-icon;base64,${buffer.toString('base64')}`;
            }
            const nativeImg = await app.getFileIcon(targetFile, { size: 'normal' });
            return nativeImg.toDataURL();
        }
    } catch (error) {
        console.warn(`Could not extract icon for ${item.name}:`, error.message);
    }
    return null;
}

function getInstalledApps() {
    if (cachedApps && cachedApps.length > 0) {
        return Promise.resolve(cachedApps);
    }

    return new Promise((resolve) => {
        const psScriptPath = path.join(__dirname, '..', 'get-apps.ps1');
        const ps = spawn('powershell.exe', [
            '-NoProfile',
            '-ExecutionPolicy', 'Bypass',
            '-File', psScriptPath
        ], {
            windowsHide: true
        });

        let stdoutData = '';
        let stderrData = '';

        ps.stdout.on('data', (data) => {
            stdoutData += data.toString('utf8');
        });

        ps.stderr.on('data', (data) => {
            stderrData += data.toString('utf8');
        });

        ps.on('close', async () => {
            try {
                if (!stdoutData.trim()) {
                    console.warn('PowerShell returned empty stdout. Stderr:', stderrData);
                    return resolve([]);
                }

                const rawApps = JSON.parse(stdoutData.trim());
                const appList = Array.isArray(rawApps) ? rawApps : [rawApps];

                const populated = await Promise.all(appList.map(async (item) => {
                    const iconData = await extractAppIcon(item);
                    return {
                        name: item.name,
                        publisher: item.publisher || 'Application',
                        path: item.path || '',
                        icon: iconData
                    };
                }));

                cachedApps = populated.filter((a) => a.name && a.path);
                resolve(cachedApps);
            } catch (error) {
                console.error('Error parsing installed apps:', error, stdoutData);
                resolve([]);
            }
        });
    });
}

function searchApps(apps, query) {
    if (!query) return apps;
    const cleanQuery = query.toLowerCase().trim();
    const tokens = cleanQuery.split(/\s+/);

    return apps.filter((item) => {
        const name = (item.name || '').toLowerCase();
        const publisher = (item.publisher || '').toLowerCase();

        return tokens.every((token) => name.includes(token) || publisher.includes(token));
    });
}

module.exports = {
    getInstalledApps,
    searchApps
};
