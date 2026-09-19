const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function getAuthDir() {
    if (app && typeof app.getPath === 'function') {
        return app.getPath('userData');
    }
    return path.join(process.env.APPDATA || process.env.HOME || '.', 'zenith');
}

function getUsersPath() {
    return path.join(getAuthDir(), 'users.json');
}

function getSessionPath() {
    return path.join(getAuthDir(), 'session.json');
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function getLocalUsers() {
    try {
        const filePath = getUsersPath();
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error('Error reading users file:', error);
    }
    return [];
}

function saveLocalUsers(users) {
    try {
        const dir = getAuthDir();
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(getUsersPath(), JSON.stringify(users, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving users file:', error);
    }
}

function getLocalSession() {
    try {
        const filePath = getSessionPath();
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error('Error reading local session:', error);
    }
    return {
        id: 'guest',
        email: '',
        plan: 'free',
        token: '',
        createdAt: new Date().toISOString()
    };
}

function saveLocalSession(session) {
    try {
        const dir = getAuthDir();
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(getSessionPath(), JSON.stringify(session, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving local session:', error);
    }
}

async function registerUser(email, password) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail || !password || password.length < 6) {
        throw new Error('Please provide a valid email and password (minimum 6 characters)');
    }

    const users = getLocalUsers();
    const existing = users.find((u) => u.email === cleanEmail);
    if (existing) {
        throw new Error('An account with this email already exists');
    }

    const passwordHash = hashPassword(password);
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newUser = {
        id: userId,
        email: cleanEmail,
        passwordHash,
        plan: 'free',
        createdAt: now
    };

    users.push(newUser);
    saveLocalUsers(users);

    const session = {
        id: userId,
        email: cleanEmail,
        plan: 'free',
        token: crypto.randomBytes(32).toString('hex'),
        createdAt: now
    };

    saveLocalSession(session);
    return session;
}

async function loginUser(email, password) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail || !password) {
        throw new Error('Please enter your email and password');
    }

    const users = getLocalUsers();
    const passwordHash = hashPassword(password);
    const user = users.find((u) => u.email === cleanEmail && u.passwordHash === passwordHash);

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const session = {
        id: user.id,
        email: user.email,
        plan: user.plan || 'free',
        token: crypto.randomBytes(32).toString('hex'),
        createdAt: new Date().toISOString()
    };

    saveLocalSession(session);
    return session;
}

function logoutUser() {
    const emptySession = {
        id: 'guest',
        email: '',
        plan: 'free',
        token: '',
        createdAt: new Date().toISOString()
    };
    saveLocalSession(emptySession);
    return { loggedOut: true };
}

async function upgradeUserToPro() {
    const session = getLocalSession();
    session.plan = 'pro';

    if (session.email) {
        const users = getLocalUsers();
        const user = users.find((u) => u.email === session.email);
        if (user) {
            user.plan = 'pro';
            saveLocalUsers(users);
        }
    }

    saveLocalSession(session);
    return session;
}

module.exports = {
    getLocalSession,
    saveLocalSession,
    registerUser,
    loginUser,
    logoutUser,
    upgradeUserToPro
};
