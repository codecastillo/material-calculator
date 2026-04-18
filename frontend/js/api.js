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
};

// ===== AUTH UI =====
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = '';
    document.getElementById('appContainer').style.display = 'none';
}
function showAppScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = '';
    if (currentUser) document.getElementById('userName').textContent = currentUser.name || currentUser.email;
}
function showLogin() {
    document.getElementById('loginForm').style.display = '';
    document.getElementById('registerForm').style.display = 'none';
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
    try { await api.login(email, password); errEl.style.display = 'none'; showAppScreen(); initApp(); }
    catch (err) { errEl.textContent = err.message; errEl.style.display = ''; }
}
async function doRegister() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const errEl = document.getElementById('registerError');
    if (!name || !email || !password) { errEl.textContent = 'All fields required'; errEl.style.display = ''; return; }
    try { await api.register(email, password, name); errEl.style.display = 'none'; showAppScreen(); initApp(); }
    catch (err) { errEl.textContent = err.message; errEl.style.display = ''; }
}
function doLogout() { api.setToken(null); currentUser = null; showLoginScreen(); }

async function checkAuth() {
    if (!authToken) { showLoginScreen(); return false; }
    try { await api.getMe(); showAppScreen(); return true; }
    catch { showLoginScreen(); return false; }
}
