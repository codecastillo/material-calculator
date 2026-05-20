// UI handler wrappers for static markup in index.html.
// These are dispatched by handlers.js via data-on-* attributes.
// (Multi-statement inline onclick handlers were extracted here during the CSP refactor.)

// --- Nav links (page switch + close mobile menu) ---
function navDashboard()  { showPage('dashboard');  closeMobileMenu(); }
function navPricing()    { showPage('pricing');    closeMobileMenu(); }
function navCalculator() { showPage('calculator'); closeMobileMenu(); }
function navOrder()      { showPage('order');      closeMobileMenu(); }
function navSavedJobs()  { showPage('savedJobs'); closeMobileMenu(); }
function navAdmin()      { showPage('admin');     closeMobileMenu(); }
function navAccount()    { showPage('account');   closeMobileMenu(); }

// --- User dropdown logout (logout then close menu) ---
function logoutAndCloseMenu() { doLogout(); toggleUserMenu(); }

// --- User dropdown Account/Admin navigation (navigate then close menu) ---
function navAccountFromMenu() { showPage('account'); toggleUserMenu(); }
function navAdminFromMenu()   { showPage('admin');   toggleUserMenu(); }
window.navAccountFromMenu = navAccountFromMenu;
window.navAdminFromMenu   = navAdminFromMenu;

// --- CSV import trigger (proxy click to hidden file input) ---
function triggerCsvImport() {
  const el = document.getElementById('csvFileInput');
  if (el) el.click();
}

// --- Credit Card Fee toggle (enable/disable the % input based on the checkbox) ---
function toggleCCFeeInput(event) {
  const cb = event && event.target ? event.target : this;
  const inp = document.getElementById('calcCCFee');
  if (inp) inp.disabled = !cb.checked;
}

// --- Save Template: open the Save Job modal pre-checked as a template
// (M12: the "Save template" header link previously called saveJob directly,
//  which left the template flag unchecked — the label promises a template save). ---
function saveTemplate() {
  if (typeof saveJob !== 'function') return;
  saveJob();
  // saveJob() defaults the checkbox to false; force it true after the modal opens.
  const tmpl = document.getElementById('saveAsTemplate');
  if (tmpl) tmpl.checked = true;
}

// --- Activate License from the login-v2 screen.
// The existing activateLicense() in app.js reads from #licenseKeyInput (which lives
// inside #appContainer's Account page). The login-v2 redesign introduces a separate
// activate input (#loginLicenseKeyInput) so the two contexts don't collide.
// This helper proxies the value into the legacy input element and dispatches the
// existing handler, so server-side wiring and post-success navigation are unchanged.
async function activateLicenseFromLogin() {
  const src = document.getElementById('loginLicenseKeyInput');
  const errEl = document.getElementById('loginError');
  const key = src ? src.value.trim() : '';
  if (!key) {
    if (errEl) { errEl.textContent = 'Enter a license key'; errEl.style.display = ''; }
    return;
  }
  if (errEl) errEl.style.display = 'none';
  try {
    const r = await api.activateLicense(key);
    currentUser = r.user;
    showAppScreen();
    if (typeof renderAccountPage === 'function') renderAccountPage();
  } catch (e) {
    if (errEl) { errEl.textContent = e.message || 'Activation failed'; errEl.style.display = ''; }
  }
}

// --- Sign-in: prefill the email field with the last-used address (spec §7.4),
// and treat a valid-shaped license key as a visual cue on the Activate button. ---
function loginV2PrefillEmail() {
    const el = document.getElementById('loginEmail');
    if (!el) return;
    try {
        const stored = localStorage.getItem('esticount_last_email');
        if (stored && !el.value) el.value = stored;
    } catch (_) { /* localStorage may be unavailable */ }
}
function loginV2RememberEmail() {
    const el = document.getElementById('loginEmail');
    if (!el) return;
    const v = String(el.value || '').trim();
    if (v && /@/.test(v)) {
        try { localStorage.setItem('esticount_last_email', v); } catch (_) {}
    }
}
function loginV2KeyShape(k) {
    return /^EC-[A-Z]{3}-[0-9A-F]{16,}$/i.test(String(k || '').trim());
}
function loginV2UpdateActivateBtn() {
    const input = document.getElementById('loginLicenseKeyInput');
    const btn = document.querySelector('.login-v2-activate-btn');
    if (!input || !btn) return;
    btn.classList.toggle('is-valid', loginV2KeyShape(input.value));
}
window.loginV2PrefillEmail = loginV2PrefillEmail;
window.loginV2RememberEmail = loginV2RememberEmail;
window.loginV2UpdateActivateBtn = loginV2UpdateActivateBtn;

// Run prefill + wire input listeners as soon as the DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    loginV2PrefillEmail();
    const emailEl = document.getElementById('loginEmail');
    if (emailEl) emailEl.addEventListener('blur', loginV2RememberEmail);
    const keyEl = document.getElementById('loginLicenseKeyInput');
    if (keyEl) keyEl.addEventListener('input', loginV2UpdateActivateBtn);
});

// Expose wrappers on window so the delegated handler in handlers.js can resolve them.
window.navDashboard      = navDashboard;
window.navPricing        = navPricing;
window.navCalculator     = navCalculator;
window.navOrder          = navOrder;
window.navSavedJobs      = navSavedJobs;
window.navAdmin          = navAdmin;
window.navAccount        = navAccount;
window.logoutAndCloseMenu = logoutAndCloseMenu;
window.triggerCsvImport  = triggerCsvImport;
window.toggleCCFeeInput  = toggleCCFeeInput;
window.saveTemplate      = saveTemplate;
window.activateLicenseFromLogin = activateLicenseFromLogin;
