const enabledToggle = document.getElementById('enabledToggle');
const autoStartToggle = document.getElementById('autoStartToggle');
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const profileSelect = document.getElementById('profileSelect');
const triggerTabs = document.querySelectorAll('.trigger-tab');
const actionRadios = document.querySelectorAll('input[name="action"]');
const section2Title = document.getElementById('section2Title');

const zenithView = document.getElementById('zenithView');
const appPickerView = document.getElementById('appPickerView');
const commandView = document.getElementById('commandView');

const appSelectTrigger = document.getElementById('appSelectTrigger');
const triggerPlaceholder = document.getElementById('triggerPlaceholder');
const triggerSelectedInfo = document.getElementById('triggerSelectedInfo');
const triggerIconBox = document.getElementById('triggerIconBox');
const triggerAppName = document.getElementById('triggerAppName');
const triggerAppPublisher = document.getElementById('triggerAppPublisher');
const appSelectDropdown = document.getElementById('appSelectDropdown');
const appSearchInput = document.getElementById('appSearchInput');
const appCountTag = document.getElementById('appCountTag');
const appListContainer = document.getElementById('appListContainer');

const cmdPill = document.getElementById('cmdPill');
const psPill = document.getElementById('psPill');
const actionValue = document.getElementById('actionValue');
const helpText = document.getElementById('helpText');
const presetChips = document.querySelectorAll('.preset-chip');

const testBtn = document.getElementById('testBtn');
const saveBtn = document.getElementById('saveBtn');
const statusMessage = document.getElementById('statusMessage');
const minimizeBtn = document.getElementById('minimizeBtn');
const closeBtn = document.getElementById('closeBtn');

let currentConfig = null;
let currentTrigger = 'singlePress';
let installedApps = [];
let selectedApp = null;
let toastTimeout = null;

const defaultAppSvgIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="4" ry="4"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
const circleCheckSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="8.5 12 11 14.5 16 9.5"></polyline></svg>`;

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showStatus(message, type = 'success') {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    const iconSvg = type === 'success'
        ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
        : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    statusMessage.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
    statusMessage.className = `status-message ${type}`;

    toastTimeout = setTimeout(() => {
        statusMessage.className = 'status-message';
        statusMessage.innerHTML = '';
    }, 3200);
}

function updateStatusDisplay() {
    const isEnabled = enabledToggle.checked;
    if (statusBadge) {
        statusBadge.classList.toggle('disabled', !isEnabled);
    }
    if (statusText) {
        statusText.textContent = isEnabled ? 'Active' : 'Disabled';
    }
}

function getActiveProfile() {
    if (!currentConfig || !Array.isArray(currentConfig.profiles)) {
        return null;
    }
    const profile = currentConfig.profiles.find((p) => p.id === currentConfig.activeProfileId);
    return profile || currentConfig.profiles[0];
}

function getCurrentTriggerAction() {
    const profile = getActiveProfile();
    if (!profile || !profile.triggers) {
        return { action: 'zenith', actionValue: '', commandType: 'cmd' };
    }
    if (!profile.triggers[currentTrigger]) {
        profile.triggers[currentTrigger] = { action: 'zenith', actionValue: '', commandType: 'cmd' };
    }
    return profile.triggers[currentTrigger];
}

function syncCurrentTriggerAction() {
    const triggerAction = getCurrentTriggerAction();
    const checkedRadio = document.querySelector(`input[name="action"][value="${triggerAction.action}"]`);
    if (checkedRadio) {
        checkedRadio.checked = true;
    }

    updateRadioCards();
    updateViewMode();

    if (triggerAction.action === 'app') {
        findAndSelectApp(triggerAction.actionValue);
    } else if (triggerAction.action === 'command') {
        actionValue.value = triggerAction.actionValue || '';
        updateCommandTypePills(triggerAction.commandType || 'cmd');
    }
}

function updateRadioCards() {
    actionRadios.forEach((radio) => {
        const card = radio.closest('.radio-card');
        if (card) {
            card.classList.toggle('selected', radio.checked);
        }
    });
}

function updateViewMode() {
    const checkedRadio = document.querySelector('input[name="action"]:checked');
    const selectedAction = checkedRadio ? checkedRadio.value : 'zenith';

    updateRadioCards();

    zenithView.style.display = 'none';
    appPickerView.style.display = 'none';
    commandView.style.display = 'none';

    switch (selectedAction) {
        case 'zenith':
            zenithView.style.display = 'block';
            section2Title.textContent = 'Configuration';
            break;
        case 'app':
            appPickerView.style.display = 'flex';
            section2Title.textContent = 'Application Selection';
            closeAppDropdown();
            break;
        case 'command':
            commandView.style.display = 'flex';
            section2Title.textContent = 'Command Configuration';
            break;
    }
}

function updateCommandTypePills(type) {
    if (type === 'powershell') {
        psPill.classList.add('active');
        cmdPill.classList.remove('active');
        helpText.textContent = 'Enter a cmdlet or script command to execute in PowerShell.';
        actionValue.placeholder = 'e.g. Start-Process notepad or Get-Process';
    } else {
        cmdPill.classList.add('active');
        psPill.classList.remove('active');
        helpText.textContent = 'Enter an executable name or system command to execute in CMD.';
        actionValue.placeholder = 'e.g. wt.exe, notepad.exe, or explorer.exe';
    }
}

function toggleAppDropdown() {
    if (!appSelectDropdown) return;
    const isClosed = appSelectDropdown.style.display === 'none' || !appSelectDropdown.style.display;
    if (isClosed) {
        openAppDropdown();
    } else {
        closeAppDropdown();
    }
}

function openAppDropdown() {
    if (!appSelectDropdown) return;
    appSelectDropdown.style.display = 'flex';
    if (appSelectTrigger) {
        appSelectTrigger.classList.add('open');
        appSelectTrigger.setAttribute('aria-expanded', 'true');
    }
    if (appSearchInput) {
        setTimeout(() => appSearchInput.focus(), 60);
    }
}

function closeAppDropdown() {
    if (!appSelectDropdown) return;
    appSelectDropdown.style.display = 'none';
    if (appSelectTrigger) {
        appSelectTrigger.classList.remove('open');
        appSelectTrigger.setAttribute('aria-expanded', 'false');
    }
}

function updateSelectTrigger() {
    if (!triggerPlaceholder || !triggerSelectedInfo) return;

    if (selectedApp && selectedApp.path) {
        triggerPlaceholder.style.display = 'none';
        triggerSelectedInfo.style.display = 'flex';
        triggerAppName.textContent = selectedApp.name || 'Application';
        triggerAppPublisher.textContent = selectedApp.publisher || 'Program';

        if (selectedApp.icon) {
            triggerIconBox.innerHTML = `<img class="app-trigger-icon" src="${selectedApp.icon}" alt="">`;
        } else {
            triggerIconBox.innerHTML = defaultAppSvgIcon;
        }
    } else {
        triggerPlaceholder.style.display = 'block';
        triggerSelectedInfo.style.display = 'none';
    }
}

function findAndSelectApp(path) {
    if (!path || !installedApps || installedApps.length === 0) {
        selectedApp = null;
        updateSelectTrigger();
        return;
    }
    const cleanPath = path.toLowerCase().trim();
    const found = installedApps.find((a) => a.path && a.path.toLowerCase() === cleanPath);
    selectedApp = found || { name: path.split('\\').pop(), publisher: 'Custom App', path };
    updateSelectTrigger();
}

function renderAppList(apps) {
    if (!appListContainer) return;

    if (!apps || apps.length === 0) {
        appListContainer.innerHTML = `<div class="app-list-loading"><span>No matching applications found</span></div>`;
        if (appCountTag) appCountTag.textContent = '0 applications';
        return;
    }

    if (appCountTag) appCountTag.textContent = `${apps.length} applications`;
    appListContainer.innerHTML = '';

    apps.forEach((app) => {
        const isSelected = selectedApp && selectedApp.path && app.path
            && selectedApp.path.toLowerCase() === app.path.toLowerCase();

        const item = document.createElement('div');
        item.className = `app-card-item ${isSelected ? 'selected' : ''}`;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', isSelected ? 'true' : 'false');

        const iconHtml = app.icon
            ? `<img class="app-card-icon" src="${app.icon}" alt="">`
            : defaultAppSvgIcon;

        item.innerHTML = `
            <div class="app-card-left">
                <div class="app-card-icon-box">
                    ${iconHtml}
                </div>
                <div class="app-card-text">
                    <span class="app-card-name">${escapeHtml(app.name)}</span>
                    <span class="app-card-publisher">${escapeHtml(app.publisher || 'Program')}</span>
                </div>
            </div>
            <div class="app-card-check">
                ${circleCheckSvg}
            </div>
        `;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedApp = app;
            document.querySelectorAll('.app-card-item').forEach((el) => {
                el.classList.remove('selected');
                el.setAttribute('aria-selected', 'false');
            });
            item.classList.add('selected');
            item.setAttribute('aria-selected', 'true');

            const triggerAction = getCurrentTriggerAction();
            triggerAction.action = 'app';
            triggerAction.actionValue = app.path;

            updateSelectTrigger();
            closeAppDropdown();
        });

        appListContainer.appendChild(item);
    });
}

function filterApps(query) {
    if (!query) {
        renderAppList(installedApps);
        return;
    }
    const clean = query.toLowerCase().trim();
    const tokens = clean.split(/\s+/);

    const filtered = installedApps.filter((item) => {
        const name = (item.name || '').toLowerCase();
        const publisher = (item.publisher || '').toLowerCase();
        return tokens.every((tok) => name.includes(tok) || publisher.includes(tok));
    });

    renderAppList(filtered);
}

function renderProfilesSelect() {
    if (!profileSelect || !currentConfig || !Array.isArray(currentConfig.profiles)) {
        return;
    }
    profileSelect.innerHTML = '';
    currentConfig.profiles.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        if (p.id === currentConfig.activeProfileId) {
            opt.selected = true;
        }
        profileSelect.appendChild(opt);
    });
}

async function loadAppConfiguration() {
    try {
        if (!window.api || !window.api.loadConfig) {
            return;
        }

        const response = await window.api.loadConfig();
        if (response.status !== 200 || !response.data) {
            showStatus(response.error || 'Failed to load config', 'error');
            return;
        }

        currentConfig = response.data;
        enabledToggle.checked = currentConfig.enabled !== false;
        autoStartToggle.checked = Boolean(currentConfig.autoStart);
        updateStatusDisplay();

        renderProfilesSelect();
        syncCurrentTriggerAction();

        loadInstalledApps();
    } catch (error) {
        showStatus('Error loading config: ' + error.message, 'error');
    }
}

async function loadInstalledApps() {
    if (!window.api || !window.api.getInstalledApps) {
        return;
    }
    try {
        const response = await window.api.getInstalledApps();
        if (response.status === 200 && Array.isArray(response.data)) {
            installedApps = response.data;
            renderAppList(installedApps);
            const triggerAction = getCurrentTriggerAction();
            if (triggerAction.action === 'app') {
                findAndSelectApp(triggerAction.actionValue);
            }
        }
    } catch (error) {
        console.error('Error loading installed apps:', error);
    }
}

triggerTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        saveCurrentFormToState();
        triggerTabs.forEach((t) => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        currentTrigger = tab.getAttribute('data-trigger') || 'singlePress';
        syncCurrentTriggerAction();
    });
});

profileSelect.addEventListener('change', () => {
    saveCurrentFormToState();
    currentConfig.activeProfileId = profileSelect.value;
    syncCurrentTriggerAction();
});

actionRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
        saveCurrentFormToState();
        updateViewMode();
    });
});

cmdPill.addEventListener('click', () => {
    const triggerAction = getCurrentTriggerAction();
    triggerAction.commandType = 'cmd';
    updateCommandTypePills('cmd');
});

psPill.addEventListener('click', () => {
    const triggerAction = getCurrentTriggerAction();
    triggerAction.commandType = 'powershell';
    updateCommandTypePills('powershell');
});

presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-val');
        if (val) {
            actionValue.value = val;
            const triggerAction = getCurrentTriggerAction();
            triggerAction.actionValue = val;
            actionValue.focus();
        }
    });
});

actionValue.addEventListener('input', () => {
    const triggerAction = getCurrentTriggerAction();
    triggerAction.actionValue = actionValue.value;
});

actionValue.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveBtn.click();
    }
});

enabledToggle.addEventListener('change', () => {
    if (currentConfig) {
        currentConfig.enabled = enabledToggle.checked;
    }
    updateStatusDisplay();
});

autoStartToggle.addEventListener('change', () => {
    if (currentConfig) {
        currentConfig.autoStart = autoStartToggle.checked;
    }
});

if (appSearchInput) {
    appSearchInput.addEventListener('input', (e) => {
        filterApps(e.target.value);
    });
}

if (appSelectTrigger) {
    appSelectTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAppDropdown();
    });

    appSelectTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleAppDropdown();
        } else if (e.key === 'Escape') {
            closeAppDropdown();
        }
    });
}

document.addEventListener('click', (e) => {
    if (appPickerView && !appPickerView.contains(e.target)) {
        closeAppDropdown();
    }
});

function saveCurrentFormToState() {
    if (!currentConfig) return;
    const triggerAction = getCurrentTriggerAction();
    const checkedRadio = document.querySelector('input[name="action"]:checked');
    const selectedAction = checkedRadio ? checkedRadio.value : 'zenith';

    triggerAction.action = selectedAction;

    if (selectedAction === 'app') {
        triggerAction.actionValue = selectedApp && selectedApp.path ? selectedApp.path : '';
    } else if (selectedAction === 'command') {
        triggerAction.actionValue = actionValue.value.trim();
        triggerAction.commandType = psPill.classList.contains('active') ? 'powershell' : 'cmd';
    } else {
        triggerAction.actionValue = '';
    }
}

testBtn.addEventListener('click', async () => {
    saveCurrentFormToState();
    const triggerAction = getCurrentTriggerAction();

    if (triggerAction.action === 'app' && !triggerAction.actionValue) {
        showStatus('Please select an application first', 'error');
        return;
    }

    if (triggerAction.action === 'command' && !triggerAction.actionValue) {
        showStatus('Please enter a command to execute', 'error');
        actionValue.focus();
        return;
    }

    if (!window.api || !window.api.executeAction) {
        showStatus('Executed in preview (201 CREATED)', 'success');
        return;
    }

    try {
        testBtn.disabled = true;
        testBtn.style.opacity = '0.7';

        const response = await window.api.executeAction(triggerAction);
        if (response.status === 201) {
            showStatus('Action executed (201 CREATED)', 'success');
        } else {
            showStatus(response.error || 'Execution failed', 'error');
        }
    } catch (error) {
        showStatus('Execution error: ' + error.message, 'error');
    } finally {
        testBtn.disabled = false;
        testBtn.style.opacity = '1';
    }
});

saveBtn.addEventListener('click', async () => {
    saveCurrentFormToState();

    if (!window.api || !window.api.saveConfig) {
        showStatus('Saved in preview (200 OK)', 'success');
        return;
    }

    try {
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.7';

        currentConfig.enabled = enabledToggle.checked;
        currentConfig.autoStart = autoStartToggle.checked;

        const response = await window.api.saveConfig(currentConfig);
        if (response.status === 200) {
            currentConfig = response.data;
            showStatus('Configuration saved (200 OK)', 'success');
        } else {
            showStatus(response.error || 'Failed to save configuration', 'error');
        }
    } catch (error) {
        showStatus('Save error: ' + error.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';
    }
});

if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
        if (window.api && window.api.windowControl) {
            window.api.windowControl('minimize');
        }
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        if (window.api && window.api.windowControl) {
            window.api.windowControl('close');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadAppConfiguration();
    updateRadioCards();
    updateStatusDisplay();
});
