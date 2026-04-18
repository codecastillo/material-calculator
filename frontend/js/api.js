// ===== API CLIENT =====
const API_BASE = window.location.origin + '/api';
let authToken = localStorage.getItem('esticount_token') || null;
let currentUser = null;

const api = {
    setToken(token) {
        authToken = token;
        if (token) localStorage.setItem('esticount_token', token);
        else localStorage.removeItem('esticount_token');
    },
    getToken() { return authToken; },

    async _fetch(endpoint, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
        try {
            const res = await fetch(API_BASE + endpoint, { ...options, headers });
            if (res.status === 401) {
                api.setToken(null); currentUser = null; showLoginScreen();
                throw new Error('Session expired. Please log in again.');
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed');
            return data;
        } catch (err) {
            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                throw new Error('Cannot connect to server.');
            }
            throw err;
        }
    },

    // Auth
    async login(email, password) {
        const data = await api._fetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        api.setToken(data.token); currentUser = data.user; return data;
    },
    async register(email, password, name) {
        const data = await api._fetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
        api.setToken(data.token); currentUser = data.user; return data;
    },
    async getMe() {
        const data = await api._fetch('/auth/me'); currentUser = data.user; return data;
    },

    // Suppliers
    async getSuppliers() { return api._fetch('/suppliers'); },
    async createSupplier(name) { return api._fetch('/suppliers', { method: 'POST', body: JSON.stringify({ name }) }); },
    async deleteSupplier(id) { return api._fetch('/suppliers/' + id, { method: 'DELETE' }); },

    // Materials
    async getMaterials(supplierId) { return api._fetch('/materials/supplier/' + supplierId); },
    async createMaterial(supplierId, material) { return api._fetch('/materials', { method: 'POST', body: JSON.stringify({ supplier_id: supplierId, ...material }) }); },
    async updateMaterial(id, data) { return api._fetch('/materials/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
    async deleteMaterial(id) { return api._fetch('/materials/' + id, { method: 'DELETE' }); },

    // Categories
    async getCategories() { return api._fetch('/categories'); },
    async createCategory(name) { return api._fetch('/categories', { method: 'POST', body: JSON.stringify({ name }) }); },
    async deleteCategory(id) { return api._fetch('/categories/' + id, { method: 'DELETE' }); },

    // Jobs
    async getJobs() { return api._fetch('/jobs'); },
    async saveJob(job) { return api._fetch('/jobs', { method: 'POST', body: JSON.stringify(job) }); },
    async deleteJob(id) { return api._fetch('/jobs/' + id, { method: 'DELETE' }); },

    // Verification
    async verifyEmail(code) { return api._fetch('/auth/verify', { method: 'POST', body: JSON.stringify({ code }) }); },
    async resendCode() { return api._fetch('/auth/resend-code', { method: 'POST' }); },

    // Password reset (no auth needed, use raw fetch)
    async forgotPassword(email) {
        const res = await fetch(API_BASE + '/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
        return res.json();
    },
    async resetPassword(email, code, password) {
        const res = await fetch(API_BASE + '/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, password }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data;
    },

    // Profile
    async updateProfile(data) { return api._fetch('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }); },

    // License
    async activateLicense(key) { return api._fetch('/auth/activate', { method: 'POST', body: JSON.stringify({ key }) }); },

    // Bulk price update
    async bulkPriceUpdate(supplier_id, percentage, category_id) {
        const body = { supplier_id, percentage };
        if (category_id) body.category_id = category_id;
        return api._fetch('/materials/bulk-price-update', { method: 'POST', body: JSON.stringify(body) });
    },

    // Admin
    async getUsers() { return api._fetch('/admin/users'); },
    async updateUser(id, data) { return api._fetch('/admin/users/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
    async deleteUser(id) { return api._fetch('/admin/users/' + id, { method: 'DELETE' }); },
    async getKeys() { return api._fetch('/admin/keys'); },
    async generateKeys(opts) { return api._fetch('/admin/keys', { method: 'POST', body: JSON.stringify(opts) }); },
    async deleteKey(id) { return api._fetch('/admin/keys/' + id, { method: 'DELETE' }); },
    async getAdminStats() { return api._fetch('/admin/stats'); },
};

// ===== AUTH UI =====
function hideLoadingScreen(){const el=document.getElementById('loadingScreen');if(el)el.style.display='none'}
function showLoginScreen() {
    hideLoadingScreen();
    document.getElementById('loginScreen').classList.add('visible');
    document.getElementById('appContainer').style.display = 'none';
}
function showAppScreen() {
    hideLoadingScreen();
    document.getElementById('loginScreen').classList.remove('visible');
    document.getElementById('appContainer').style.display = '';
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name || currentUser.email;
        // Show/hide admin nav link
        const adminLink = document.getElementById('adminNavLink');
        if (adminLink) adminLink.style.display = currentUser.role === 'admin' ? '' : 'none';
        // Show/hide license badge
        const licenseBadge = document.getElementById('licenseBadge');
        if (licenseBadge) {
            if (currentUser.role === 'admin' && !window.adminViewAsUser) {
                licenseBadge.style.display = 'none';
            } else {
                const lt = currentUser.license_type || 'trial';
                const hasKey = !!currentUser.license_key;
                const exp = currentUser.license_expires ? new Date(currentUser.license_expires) : null;
                const isExpired = exp && exp < new Date();
                const isActive = hasKey && !isExpired;
                licenseBadge.style.display = '';
                licenseBadge.textContent = lt.toUpperCase();
                licenseBadge.className = 'license-badge ' + (isActive ? 'active' : 'trial');
            }
        }
    }
}
function showLogin() {
    document.getElementById('loginForm').style.display = '';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'none';
    document.getElementById('resetForm').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
}
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = '';
    document.getElementById('registerError').style.display = 'none';
}
async function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    if (!email || !password) { errEl.textContent = 'Enter email and password'; errEl.style.display = ''; return; }
    try {
        const r = await api.login(email, password);
        errEl.style.display = 'none';
        if (r.needsVerification) { showVerifyScreen(); return; }
        showAppScreen(); initApp();
    } catch (err) { errEl.textContent = err.message; errEl.style.display = ''; }
}
async function doRegister() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const errEl = document.getElementById('registerError');
    if (!name || !email || !password) { errEl.textContent = 'All fields required'; errEl.style.display = ''; return; }
    try {
        const r = await api.register(email, password, name);
        errEl.style.display = 'none';
        showVerifyScreen();
    } catch (err) { errEl.textContent = err.message; errEl.style.display = ''; }
}

function showVerifyScreen() {
    hideLoadingScreen();
    document.getElementById('loginScreen').classList.remove('visible');
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('verifyScreen').classList.add('visible');
    document.getElementById('verifyEmail').textContent = currentUser?.email || '';
}

async function doVerify() {
    const code = document.getElementById('verifyCodeInput').value.trim();
    const errEl = document.getElementById('verifyError');
    if (!code || code.length !== 6) { errEl.textContent = 'Enter the 6-digit code'; errEl.style.display = ''; return; }
    try {
        const r = await api.verifyEmail(code);
        currentUser = r.user;
        errEl.style.display = 'none';
        document.getElementById('verifyScreen').classList.remove('visible');
        showAppScreen(); initApp();
    } catch (err) { errEl.textContent = err.message; errEl.style.display = ''; }
}

async function doResendCode() {
    try {
        await api.resendCode();
        document.getElementById('verifyError').textContent = 'New code sent! Check your email.';
        document.getElementById('verifyError').style.display = '';
        document.getElementById('verifyError').style.background = 'var(--ok-soft)';
        document.getElementById('verifyError').style.color = 'var(--ok)';
    } catch (err) {
        document.getElementById('verifyError').textContent = err.message;
        document.getElementById('verifyError').style.display = '';
        document.getElementById('verifyError').style.background = '';
        document.getElementById('verifyError').style.color = '';
    }
}
function doLogout() { api.setToken(null); currentUser = null; showLoginScreen(); }

// Forgot password flow
function showForgotPassword() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = '';
    document.getElementById('resetForm').style.display = 'none';
    document.getElementById('forgotError').style.display = 'none';
}

async function doForgotPassword() {
    const email = document.getElementById('forgotEmail').value.trim();
    const msgEl = document.getElementById('forgotError');
    if (!email) { msgEl.textContent = 'Enter your email'; msgEl.style.display = ''; msgEl.style.background = ''; msgEl.style.color = ''; return; }
    try {
        await api.forgotPassword(email);
        msgEl.textContent = 'Code sent! Check your email.';
        msgEl.style.display = '';
        msgEl.style.background = 'var(--ok-soft)';
        msgEl.style.color = 'var(--ok)';
        // Show reset form
        document.getElementById('resetEmail').value = email;
        setTimeout(() => {
            document.getElementById('forgotForm').style.display = 'none';
            document.getElementById('resetForm').style.display = '';
            document.getElementById('resetError').style.display = 'none';
        }, 1500);
    } catch (e) { msgEl.textContent = e.message; msgEl.style.display = ''; msgEl.style.background = ''; msgEl.style.color = ''; }
}

async function doResetPassword() {
    const email = document.getElementById('resetEmail').value.trim();
    const code = document.getElementById('resetCode').value.trim();
    const password = document.getElementById('resetPassword').value;
    const msgEl = document.getElementById('resetError');
    if (!code || !password) { msgEl.textContent = 'Enter code and new password'; msgEl.style.display = ''; msgEl.style.background = ''; msgEl.style.color = ''; return; }
    try {
        await api.resetPassword(email, code, password);
        msgEl.textContent = 'Password reset! Redirecting to sign in...';
        msgEl.style.display = '';
        msgEl.style.background = 'var(--ok-soft)';
        msgEl.style.color = 'var(--ok)';
        setTimeout(() => showLogin(), 2000);
    } catch (e) { msgEl.textContent = e.message; msgEl.style.display = ''; msgEl.style.background = ''; msgEl.style.color = ''; }
}

async function checkAuth() {
    if (!authToken) { showLoginScreen(); return false; }
    try {
        await api.getMe();
        if (currentUser && currentUser.email_verified === false) { showVerifyScreen(); return false; }
        return true;
    } catch { showLoginScreen(); return false; }
}
