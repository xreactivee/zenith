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

const updateReadyBtn = document.getElementById('updateReadyBtn');
const updateVersionText = document.getElementById('updateVersionText');

const authPillBtn = document.getElementById('authPillBtn');
const authPillText = document.getElementById('authPillText');
const authPlanBadge = document.getElementById('authPlanBadge');
const doublePressCrown = document.getElementById('doublePressCrown');
const longPressCrown = document.getElementById('longPressCrown');

const newProfileBtn = document.getElementById('newProfileBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const deleteProfileBtn = document.getElementById('deleteProfileBtn');

const authModal = document.getElementById('authModal');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const authModalTitle = document.getElementById('authModalTitle');
const authFormView = document.getElementById('authFormView');
const authProfileView = document.getElementById('authProfileView');
const authTabLogin = document.getElementById('authTabLogin');
const authTabRegister = document.getElementById('authTabRegister');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authErrorMsg = document.getElementById('authErrorMsg');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authSubmitText = document.getElementById('authSubmitText');
const accountEmailDisplay = document.getElementById('accountEmailDisplay');
const accountPlanBadge = document.getElementById('accountPlanBadge');
const upgradePromptBtn = document.getElementById('upgradePromptBtn');
const logoutBtn = document.getElementById('logoutBtn');

const profileModal = document.getElementById('profileModal');
const profileModalTitle = document.getElementById('profileModalTitle');
const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
const profileForm = document.getElementById('profileForm');
const profileNameInput = document.getElementById('profileNameInput');
const profileErrorMsg = document.getElementById('profileErrorMsg');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');

const deleteProfileModal = document.getElementById('deleteProfileModal');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const deleteModalPrompt = document.getElementById('deleteModalPrompt');
const deleteErrorMsg = document.getElementById('deleteErrorMsg');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const upgradeModal = document.getElementById('upgradeModal');
const closeUpgradeModalBtn = document.getElementById('closeUpgradeModalBtn');
const wizardDot1 = document.getElementById('wizardDot1');
const wizardDot2 = document.getElementById('wizardDot2');
const wizardDot3 = document.getElementById('wizardDot3');
const upgradeStep1 = document.getElementById('upgradeStep1');
const upgradeStep2 = document.getElementById('upgradeStep2');
const upgradeStep3 = document.getElementById('upgradeStep3');
const pricingMonthly = document.getElementById('pricingMonthly');
const pricingAnnual = document.getElementById('pricingAnnual');
const billingMonthly = document.getElementById('billingMonthly');
const billingAnnual = document.getElementById('billingAnnual');
const toStep2Btn = document.getElementById('toStep2Btn');
const checkoutSelectedPlan = document.getElementById('checkoutSelectedPlan');
const checkoutTotalPrice = document.getElementById('checkoutTotalPrice');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutErrorMsg = document.getElementById('checkoutErrorMsg');
const backToStep1Btn = document.getElementById('backToStep1Btn');
const submitPaymentBtn = document.getElementById('submitPaymentBtn');
const paymentBtnText = document.getElementById('paymentBtnText');
const finishUpgradeBtn = document.getElementById('finishUpgradeBtn');

let currentConfig = null;
let currentTrigger = 'singlePress';
let installedApps = [];
let selectedApp = null;
let toastTimeout = null;
let currentSession = { id: 'guest', email: '', plan: 'free' };
let profileToEdit = null;
let profileToDelete = null;
let authMode = 'login';
let selectedBilling = 'annual';

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

function openModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
}

function closeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
}

function updateSessionDisplay(session) {
    currentSession = session || { id: 'guest', email: '', plan: 'free' };
    const isPro = currentSession.plan === 'pro';

    if (authPillText) {
        if (currentSession.email) {
            const shortName = currentSession.email.split('@')[0];
            authPillText.textContent = shortName;
        } else {
            authPillText.textContent = 'Sign In';
        }
    }

    if (authPlanBadge) {
        authPlanBadge.textContent = isPro ? 'PRO' : 'FREE';
        authPlanBadge.className = `plan-badge ${isPro ? 'pro' : 'free'}`;
    }

    if (accountPlanBadge) {
        accountPlanBadge.textContent = isPro ? 'PRO' : 'FREE';
        accountPlanBadge.className = `plan-badge ${isPro ? 'pro' : 'free'}`;
    }

    if (accountEmailDisplay) {
        accountEmailDisplay.textContent = currentSession.email || 'Guest User';
    }

    if (upgradePromptBtn) {
        upgradePromptBtn.style.display = isPro ? 'none' : 'inline-flex';
    }

    if (doublePressCrown) {
        doublePressCrown.style.display = isPro ? 'none' : 'inline-flex';
    }

    if (longPressCrown) {
        longPressCrown.style.display = isPro ? 'none' : 'inline-flex';
    }

    if (authFormView && authProfileView) {
        if (currentSession.email) {
            authFormView.style.display = 'none';
            authProfileView.style.display = 'block';
            authModalTitle.textContent = 'Account Details';
        } else {
            authFormView.style.display = 'block';
            authProfileView.style.display = 'none';
            authModalTitle.textContent = authMode === 'login' ? 'Sign In to Zenith' : 'Create Zenith Account';
        }
    }
}

function setWizardStep(step) {
    wizardDot1.classList.toggle('active', step === 1);
    wizardDot2.classList.toggle('active', step === 2);
    wizardDot3.classList.toggle('active', step === 3);

    upgradeStep1.style.display = step === 1 ? 'block' : 'none';
    upgradeStep2.style.display = step === 2 ? 'block' : 'none';
    upgradeStep3.style.display = step === 3 ? 'block' : 'none';
}

function openUpgradeWizard() {
    setWizardStep(1);
    checkoutErrorMsg.style.display = 'none';
    checkoutErrorMsg.textContent = '';
    openModal(upgradeModal);
}

async function loadAppConfiguration() {
    try {
        if (!window.api) {
            return;
        }

        if (window.api.getSession) {
            const sessionRes = await window.api.getSession();
            if (sessionRes && sessionRes.status === 200 && sessionRes.data) {
                updateSessionDisplay(sessionRes.data);
            }
        }

        if (window.api.loadConfig) {
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
        }

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
        const triggerType = tab.getAttribute('data-trigger') || 'singlePress';
        if (currentSession.plan !== 'pro' && triggerType !== 'singlePress') {
            openUpgradeWizard();
            return;
        }

        saveCurrentFormToState();
        triggerTabs.forEach((t) => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        currentTrigger = triggerType;
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

if (authPillBtn) {
    authPillBtn.addEventListener('click', () => {
        authErrorMsg.style.display = 'none';
        authErrorMsg.textContent = '';
        openModal(authModal);
    });
}

if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', () => closeModal(authModal));
}

if (authTabLogin) {
    authTabLogin.addEventListener('click', () => {
        authMode = 'login';
        authTabLogin.classList.add('active');
        authTabRegister.classList.remove('active');
        authSubmitText.textContent = 'Sign In';
        authModalTitle.textContent = 'Sign In to Zenith';
        authErrorMsg.style.display = 'none';
        authErrorMsg.textContent = '';
    });
}

if (authTabRegister) {
    authTabRegister.addEventListener('click', () => {
        authMode = 'register';
        authTabRegister.classList.add('active');
        authTabLogin.classList.remove('active');
        authSubmitText.textContent = 'Create Account';
        authModalTitle.textContent = 'Create Zenith Account';
        authErrorMsg.style.display = 'none';
        authErrorMsg.textContent = '';
    });
}

if (authForm) {
    authForm.addEventListener('submit', async () => {
        const email = authEmail.value.trim();
        const password = authPassword.value;

        if (!email || !password) {
            authErrorMsg.textContent = 'Please enter both email and password';
            authErrorMsg.style.display = 'block';
            return;
        }

        try {
            authSubmitBtn.disabled = true;
            authErrorMsg.style.display = 'none';

            let response;
            if (authMode === 'login') {
                response = await window.api.login({ email, password });
            } else {
                response = await window.api.register({ email, password });
            }

            if (response && (response.status === 200 || response.status === 201) && response.data) {
                updateSessionDisplay(response.data);
                closeModal(authModal);
                authEmail.value = '';
                authPassword.value = '';
                showStatus(authMode === 'login' ? 'Signed in (200 OK)' : 'Account created (201 CREATED)', 'success');
            } else {
                authErrorMsg.textContent = (response && response.error) || 'Authentication failed';
                authErrorMsg.style.display = 'block';
            }
        } catch (error) {
            authErrorMsg.textContent = error.message || 'Authentication error';
            authErrorMsg.style.display = 'block';
        } finally {
            authSubmitBtn.disabled = false;
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await window.api.logout();
            if (response && response.status === 200) {
                updateSessionDisplay({ id: 'guest', email: '', plan: 'free' });
                closeModal(authModal);
                showStatus('Signed out (200 OK)', 'success');
            }
        } catch (error) {
            showStatus('Error signing out: ' + error.message, 'error');
        }
    });
}

if (upgradePromptBtn) {
    upgradePromptBtn.addEventListener('click', () => {
        closeModal(authModal);
        openUpgradeWizard();
    });
}

if (newProfileBtn) {
    newProfileBtn.addEventListener('click', () => {
        if (currentSession.plan !== 'pro' && currentConfig && currentConfig.profiles && currentConfig.profiles.length >= 2) {
            openUpgradeWizard();
            return;
        }
        profileToEdit = null;
        profileModalTitle.textContent = 'New Profile';
        profileNameInput.value = '';
        profileErrorMsg.style.display = 'none';
        profileErrorMsg.textContent = '';
        openModal(profileModal);
        setTimeout(() => profileNameInput.focus(), 60);
    });
}

if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        const active = getActiveProfile();
        if (!active) return;
        profileToEdit = active;
        profileModalTitle.textContent = 'Rename Profile';
        profileNameInput.value = active.name;
        profileErrorMsg.style.display = 'none';
        profileErrorMsg.textContent = '';
        openModal(profileModal);
        setTimeout(() => profileNameInput.focus(), 60);
    });
}

if (closeProfileModalBtn) {
    closeProfileModalBtn.addEventListener('click', () => closeModal(profileModal));
}

if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener('click', () => closeModal(profileModal));
}

if (profileForm) {
    profileForm.addEventListener('submit', async () => {
        const name = profileNameInput.value.trim();
        if (!name) {
            profileErrorMsg.textContent = 'Please enter a profile name';
            profileErrorMsg.style.display = 'block';
            return;
        }

        try {
            saveProfileBtn.disabled = true;
            profileErrorMsg.style.display = 'none';

            let response;
            if (profileToEdit) {
                response = await window.api.renameProfile(profileToEdit.id, name);
            } else {
                response = await window.api.createProfile(name);
            }

            if (response && (response.status === 200 || response.status === 201) && response.data) {
                currentConfig = response.data;
                renderProfilesSelect();
                syncCurrentTriggerAction();
                closeModal(profileModal);
                showStatus(profileToEdit ? 'Profile renamed (200 OK)' : 'Profile created (201 CREATED)', 'success');
            } else {
                profileErrorMsg.textContent = (response && response.error) || 'Operation failed';
                profileErrorMsg.style.display = 'block';
            }
        } catch (error) {
            profileErrorMsg.textContent = error.message || 'Error saving profile';
            profileErrorMsg.style.display = 'block';
        } finally {
            saveProfileBtn.disabled = false;
        }
    });
}

if (deleteProfileBtn) {
    deleteProfileBtn.addEventListener('click', () => {
        if (!currentConfig || !Array.isArray(currentConfig.profiles) || currentConfig.profiles.length <= 1) {
            showStatus('Cannot delete the only remaining profile', 'error');
            return;
        }
        const active = getActiveProfile();
        if (!active) return;
        profileToDelete = active;
        deleteModalPrompt.textContent = `Are you sure you want to delete profile "${active.name}"?`;
        deleteErrorMsg.style.display = 'none';
        deleteErrorMsg.textContent = '';
        openModal(deleteProfileModal);
    });
}

if (closeDeleteModalBtn) {
    closeDeleteModalBtn.addEventListener('click', () => closeModal(deleteProfileModal));
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => closeModal(deleteProfileModal));
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!profileToDelete) return;
        try {
            confirmDeleteBtn.disabled = true;
            const response = await window.api.deleteProfile(profileToDelete.id);
            if (response && response.status === 200 && response.data) {
                currentConfig = response.data;
                renderProfilesSelect();
                syncCurrentTriggerAction();
                closeModal(deleteProfileModal);
                showStatus('Profile deleted (200 OK)', 'success');
            } else {
                deleteErrorMsg.textContent = (response && response.error) || 'Failed to delete profile';
                deleteErrorMsg.style.display = 'block';
            }
        } catch (error) {
            deleteErrorMsg.textContent = error.message || 'Error deleting profile';
            deleteErrorMsg.style.display = 'block';
        } finally {
            confirmDeleteBtn.disabled = false;
            profileToDelete = null;
        }
    });
}

if (pricingMonthly) {
    pricingMonthly.addEventListener('click', () => {
        selectedBilling = 'monthly';
        billingMonthly.checked = true;
        pricingMonthly.classList.add('selected');
        pricingAnnual.classList.remove('selected');
    });
}

if (pricingAnnual) {
    pricingAnnual.addEventListener('click', () => {
        selectedBilling = 'annual';
        billingAnnual.checked = true;
        pricingAnnual.classList.add('selected');
        pricingMonthly.classList.remove('selected');
    });
}

if (toStep2Btn) {
    toStep2Btn.addEventListener('click', () => {
        if (selectedBilling === 'monthly') {
            checkoutSelectedPlan.textContent = 'Zenith Pro Monthly';
            checkoutTotalPrice.textContent = '$3.99';
        } else {
            checkoutSelectedPlan.textContent = 'Zenith Pro Annual';
            checkoutTotalPrice.textContent = '$29.99';
        }
        setWizardStep(2);
    });
}

if (backToStep1Btn) {
    backToStep1Btn.addEventListener('click', () => {
        setWizardStep(1);
    });
}

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async () => {
        try {
            submitPaymentBtn.disabled = true;
            paymentBtnText.textContent = 'Processing...';
            checkoutErrorMsg.style.display = 'none';

            await new Promise((resolve) => setTimeout(resolve, 500));

            const response = await window.api.upgradeToPro();
            if (response && response.status === 200 && response.data) {
                updateSessionDisplay(response.data);
                setWizardStep(3);
                showStatus('Upgraded to Zenith Pro (200 OK)', 'success');
            } else {
                checkoutErrorMsg.textContent = (response && response.error) || 'Upgrade failed';
                checkoutErrorMsg.style.display = 'block';
            }
        } catch (error) {
            checkoutErrorMsg.textContent = error.message || 'Payment processing error';
            checkoutErrorMsg.style.display = 'block';
        } finally {
            submitPaymentBtn.disabled = false;
            paymentBtnText.textContent = 'Complete & Upgrade';
        }
    });
}

if (finishUpgradeBtn) {
    finishUpgradeBtn.addEventListener('click', () => {
        closeModal(upgradeModal);
    });
}

if (closeUpgradeModalBtn) {
    closeUpgradeModalBtn.addEventListener('click', () => closeModal(upgradeModal));
}

[authModal, profileModal, deleteProfileModal, upgradeModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
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

if (updateReadyBtn) {
    updateReadyBtn.addEventListener('click', async () => {
        showStatus('Restarting Zenith to apply update...', 'success');
        if (window.api && window.api.installUpdate) {
            await window.api.installUpdate();
        }
    });
}

if (window.api && window.api.onUpdateReady) {
    window.api.onUpdateReady((info) => {
        if (updateReadyBtn) {
            updateReadyBtn.style.display = 'inline-flex';
        }
        if (updateVersionText && info && info.version) {
            updateVersionText.textContent = `v${info.version}`;
        }
        showStatus(`Update ready${info && info.version ? `: v${info.version}` : ''}. Click to install.`, 'success');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadAppConfiguration();
    updateRadioCards();
    updateStatusDisplay();
});

