// ===== DEFAULTS =====
const DEFAULT_CATEGORIES = ['Lath', 'Gray Coat', 'Color Coat', 'Stone', 'Drywall', 'Painting'];
const DEFAULT_SUPPLIERS = ['Pacific Supply', 'ABC Supply', 'Sherwin Williams'];
const UNITS = ['roll','box','piece','bag','ton','pail','tube','gal','lb','each','bundle','bucket','sheet','sqyd','disc'];
const CALC_TYPES = ['area', 'linear'];

// Shared stucco materials (Pacific Supply + ABC Supply)
const STUCCO_LATH = [
    { name: 'Wire Lath 2.5 lb (36" x 150\')', sku: 'WL-2536150', unit: 'roll', pricePerUnit: 52.00, category: 'Lath', coveragePerUnit: 450, calcType: 'area' },
    { name: '2-Ply 60min Paper (150 sqft)', sku: 'PB-2P60-150', unit: 'roll', pricePerUnit: 28.00, category: 'Lath', coveragePerUnit: 150, calcType: 'area' },
    { name: '7/16" Staples (10,000ct)', sku: 'ST-716-10K', unit: 'box', pricePerUnit: 45.00, category: 'Lath', coveragePerUnit: 2000, calcType: 'area' },
    { name: 'Weep Screed 26ga (10\')', sku: 'WS-26-10', unit: 'piece', pricePerUnit: 8.50, category: 'Lath', coveragePerUnit: 10, calcType: 'linear' },
    { name: 'Corner Aid 26ga (10\')', sku: 'CA-26-10', unit: 'piece', pricePerUnit: 6.75, category: 'Lath', coveragePerUnit: 10, calcType: 'linear' },
    { name: 'Casing Bead 26ga (10\')', sku: 'CB-26-10', unit: 'piece', pricePerUnit: 5.50, category: 'Lath', coveragePerUnit: 10, calcType: 'linear' },
    { name: 'Self-Furring Nails 1.5" (25lb)', sku: 'SFN-15-25', unit: 'box', pricePerUnit: 42.00, category: 'Lath', coveragePerUnit: 1500, calcType: 'area' },
];
const STUCCO_GRAY = [
    { name: 'Portland Cement Type S (94lb)', sku: 'PC-TS-94', unit: 'bag', pricePerUnit: 14.50, category: 'Gray Coat', coveragePerUnit: 25, calcType: 'area' },
    { name: 'Plaster Sand', sku: 'PS-TON', unit: 'ton', pricePerUnit: 45.00, category: 'Gray Coat', coveragePerUnit: 250, calcType: 'area' },
    { name: 'Hydrated Lime Type S (50lb)', sku: 'HL-TS-50', unit: 'bag', pricePerUnit: 12.00, category: 'Gray Coat', coveragePerUnit: 75, calcType: 'area' },
    { name: 'Fiber Mesh (1lb)', sku: 'FM-1LB', unit: 'bag', pricePerUnit: 8.50, category: 'Gray Coat', coveragePerUnit: 300, calcType: 'area' },
    { name: 'Bonding Agent - Weld-Crete (5 gal)', sku: 'BA-WC-5G', unit: 'pail', pricePerUnit: 62.00, category: 'Gray Coat', coveragePerUnit: 500, calcType: 'area' },
];
const STUCCO_COLOR = [
    { name: 'LaHabra X-Kaliber Finish (65lb)', sku: 'LH-XK-65', unit: 'bag', pricePerUnit: 28.00, category: 'Color Coat', coveragePerUnit: 65, calcType: 'area' },
    { name: 'Color Pigment (1lb tube)', sku: 'LH-PIG-1', unit: 'tube', pricePerUnit: 9.50, category: 'Color Coat', coveragePerUnit: 200, calcType: 'area' },
    { name: 'Finish Sand 30-mesh (80lb)', sku: 'FS-30-80', unit: 'bag', pricePerUnit: 12.00, category: 'Color Coat', coveragePerUnit: 100, calcType: 'area' },
    { name: 'Acrylic Additive (1 gal)', sku: 'AA-QR-1G', unit: 'gal', pricePerUnit: 18.00, category: 'Color Coat', coveragePerUnit: 150, calcType: 'area' },
];
const STONE_MATERIALS = [
    { name: 'Manufactured Stone Veneer (flat)', sku: 'SV-FLAT-BOX', unit: 'box', pricePerUnit: 125.00, category: 'Stone', coveragePerUnit: 10, calcType: 'area' },
    { name: 'Stone Corners (linear)', sku: 'SV-CORN-BOX', unit: 'box', pricePerUnit: 85.00, category: 'Stone', coveragePerUnit: 5, calcType: 'linear' },
    { name: 'Stone Mortar Mix (80lb)', sku: 'SM-MRT-80', unit: 'bag', pricePerUnit: 12.50, category: 'Stone', coveragePerUnit: 20, calcType: 'area' },
    { name: 'Stone Grout Bag (50lb)', sku: 'SM-GRT-50', unit: 'bag', pricePerUnit: 14.00, category: 'Stone', coveragePerUnit: 35, calcType: 'area' },
    { name: 'Metal Lath for Stone (2.5 lb)', sku: 'ML-ST-25', unit: 'roll', pricePerUnit: 52.00, category: 'Stone', coveragePerUnit: 450, calcType: 'area' },
    { name: 'Scratch Coat Cement (94lb)', sku: 'SC-ST-94', unit: 'bag', pricePerUnit: 14.50, category: 'Stone', coveragePerUnit: 25, calcType: 'area' },
];
const DRYWALL_MATERIALS = [
    { name: 'Red Dot All-Purpose Joint Compound (4.5 gal)', sku: 'RD-AP-45G', unit: 'bucket', pricePerUnit: 18.00, category: 'Drywall', coveragePerUnit: 230, calcType: 'area' },
    { name: 'TNT Lite Topping Compound (4.5 gal)', sku: 'TNT-LT-45G', unit: 'bucket', pricePerUnit: 22.00, category: 'Drywall', coveragePerUnit: 270, calcType: 'area' },
    { name: 'Sanding Discs 120 Grit (25pk)', sku: 'SD-120-25', unit: 'box', pricePerUnit: 15.00, category: 'Drywall', coveragePerUnit: 1500, calcType: 'area' },
    { name: 'Sanding Discs 150 Grit (25pk)', sku: 'SD-150-25', unit: 'box', pricePerUnit: 15.00, category: 'Drywall', coveragePerUnit: 1500, calcType: 'area' },
    { name: 'Paper Joint Tape (500\')', sku: 'PJT-500', unit: 'roll', pricePerUnit: 4.50, category: 'Drywall', coveragePerUnit: 200, calcType: 'area' },
    { name: 'Mesh Joint Tape (300\')', sku: 'MJT-300', unit: 'roll', pricePerUnit: 7.00, category: 'Drywall', coveragePerUnit: 150, calcType: 'area' },
    { name: 'Corner Bead Metal 8\'', sku: 'CB-MT-8', unit: 'piece', pricePerUnit: 3.50, category: 'Drywall', coveragePerUnit: 8, calcType: 'linear' },
];
const PAINT_MATERIALS = [
    { name: 'Painters Plastic (9\' x 400\')', sku: 'PP-9400', unit: 'roll', pricePerUnit: 18.00, category: 'Painting', coveragePerUnit: 3600, calcType: 'area' },
    { name: 'Primer - Interior/Exterior (1 gal)', sku: 'SW-PRM-1G', unit: 'gal', pricePerUnit: 28.00, category: 'Painting', coveragePerUnit: 400, calcType: 'area' },
    { name: 'Primer - Interior/Exterior (5 gal)', sku: 'SW-PRM-5G', unit: 'bucket', pricePerUnit: 115.00, category: 'Painting', coveragePerUnit: 2000, calcType: 'area' },
    { name: 'A-100 Exterior Latex Paint (1 gal)', sku: 'SW-A100-1G', unit: 'gal', pricePerUnit: 42.00, category: 'Painting', coveragePerUnit: 400, calcType: 'area' },
    { name: 'A-100 Exterior Latex Paint (5 gal)', sku: 'SW-A100-5G', unit: 'bucket', pricePerUnit: 185.00, category: 'Painting', coveragePerUnit: 2000, calcType: 'area' },
];

// Supplier-specific material sets
const SUPPLIER_MATERIALS = {
    'Pacific Supply':    [...STUCCO_LATH, ...STUCCO_GRAY, ...STUCCO_COLOR, ...STONE_MATERIALS, ...DRYWALL_MATERIALS],
    'ABC Supply':        [...STUCCO_LATH, ...STUCCO_GRAY, ...STUCCO_COLOR, ...STONE_MATERIALS, ...DRYWALL_MATERIALS],
    'Sherwin Williams':  [...DRYWALL_MATERIALS, ...PAINT_MATERIALS],
};
const SUPPLIER_PRICE_MODS = { 'Pacific Supply': 1.0, 'ABC Supply': 1.03, 'Sherwin Williams': 1.0 };

// ===== STATE =====
let suppliers = [], categories = [], materialsBySupplier = {}, activeSupplier = '', editingId = null, currentCalc = null, savedJobs = [];
let undoStack = [], redoStack = [];
const MAX_UNDO = 25;
let dragSrcId = null;

// ===== PERSISTENCE =====
function loadData() {
    try {
        const s = localStorage.getItem('stucco_suppliers');
        const c = localStorage.getItem('stucco_categories');
        const m = localStorage.getItem('stucco_materials_v2');
        const j = localStorage.getItem('stucco_saved_jobs');
        const t = localStorage.getItem('stucco_theme');
        if (s && c && m) {
            suppliers = JSON.parse(s);
            categories = JSON.parse(c);
            materialsBySupplier = JSON.parse(m);
            Object.values(materialsBySupplier).forEach(mats => mats.forEach(mat => {
                if (!mat.calcType) mat.calcType = 'area';
            }));
        } else {
            resetAllToDefaults(true);
        }
        if (j) savedJobs = JSON.parse(j);
        if (t) document.documentElement.setAttribute('data-theme', t);
    } catch { resetAllToDefaults(true); }
    if (suppliers.length > 0) activeSupplier = suppliers[0];
}

function saveAll() {
    localStorage.setItem('stucco_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('stucco_categories', JSON.stringify(categories));
    localStorage.setItem('stucco_materials_v2', JSON.stringify(materialsBySupplier));
}

function saveSavedJobs() { localStorage.setItem('stucco_saved_jobs', JSON.stringify(savedJobs)); }

function resetAllToDefaults(silent) {
    suppliers = [...DEFAULT_SUPPLIERS]; categories = [...DEFAULT_CATEGORIES]; materialsBySupplier = {};
    suppliers.forEach(sup => {
        const mod = SUPPLIER_PRICE_MODS[sup] || 1;
        const template = SUPPLIER_MATERIALS[sup] || [...STUCCO_LATH, ...STUCCO_GRAY, ...STUCCO_COLOR];
        materialsBySupplier[sup] = template.map((m, i) => ({
            ...m, id: `${sup.replace(/\s+/g,'-').toLowerCase()}-${i}-${Date.now()}`,
            pricePerUnit: Math.round(m.pricePerUnit * mod * 100) / 100,
        }));
    });
    activeSupplier = suppliers[0]; saveAll();
    if (!silent) notify('All data reset to defaults', 'info');
}

// ===== UNDO / REDO =====
function pushUndo() {
    undoStack.push(JSON.stringify(materialsBySupplier));
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    redoStack = [];
    updateUndoButtons();
}
function undo() {
    if (undoStack.length === 0) return;
    redoStack.push(JSON.stringify(materialsBySupplier));
    materialsBySupplier = JSON.parse(undoStack.pop());
    saveAll(); renderMaterialTable(); updateUndoButtons();
    notify('Undone', 'info');
}
function redo() {
    if (redoStack.length === 0) return;
    undoStack.push(JSON.stringify(materialsBySupplier));
    materialsBySupplier = JSON.parse(redoStack.pop());
    saveAll(); renderMaterialTable(); updateUndoButtons();
    notify('Redone', 'info');
}
function updateUndoButtons() {
    document.getElementById('undoBtn').disabled = undoStack.length === 0;
    document.getElementById('redoBtn').disabled = redoStack.length === 0;
}

// ===== UTILITIES =====
function genId() { return 'mat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7); }
function fmt(n) { return '$' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function escAttr(s) { return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\\/g, '\\\\'); }
function notify(msg, type) {
    const el = document.getElementById('notification');
    el.textContent = msg; el.className = 'notification ' + (type || 'info');
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => el.classList.remove('show'), 3000);
}
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ===== THEME =====
function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('stucco_theme', next);
}

// ===== TAB NAVIGATION =====
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    const map = { pricing: [0,'pricingTab'], calculator: [1,'calculatorTab'], order: [2,'orderTab'], savedJobs: [3,'savedJobsTab'] };
    document.getElementById(map[tabId][1]).classList.add('active');
    document.querySelectorAll('.tab')[map[tabId][0]].classList.add('active');
    if (tabId === 'calculator') { populateCalcSupplierDropdown(); renderPhaseCheckboxes(); }
    if (tabId === 'savedJobs') renderSavedJobs();
}

// ===== SUPPLIER TABS =====
function renderSupplierTabs() {
    const wrap = document.getElementById('supplierTabs');
    wrap.innerHTML = suppliers.map(s =>
        `<button class="supplier-tab${s === activeSupplier ? ' active' : ''}" onclick="switchSupplier('${escAttr(s)}')"
         oncontextmenu="event.preventDefault();confirmDeleteSupplier('${escAttr(s)}')">${escHtml(s)}</button>`
    ).join('') + `<button class="supplier-tab add-btn" onclick="openAddSupplierModal()">+ Supplier</button>`;
}
function switchSupplier(name) { activeSupplier = name; editingId = null; renderSupplierTabs(); renderMaterialTable(); }
function openAddSupplierModal() { document.getElementById('newSupplierName').value = ''; openModal('addSupplierModal'); }
function addSupplier() {
    const name = document.getElementById('newSupplierName').value.trim();
    if (!name) { notify('Enter name','error'); return; }
    if (suppliers.includes(name)) { notify('Already exists','error'); return; }
    pushUndo();
    const copy = document.getElementById('copyDefaultsToSupplier').checked;
    suppliers.push(name);
    const defaultMats = [...STUCCO_LATH, ...STUCCO_GRAY, ...STUCCO_COLOR];
    materialsBySupplier[name] = copy ? defaultMats.map(m => ({...m, id: genId()})) : [];
    activeSupplier = name; saveAll(); renderSupplierTabs(); renderMaterialTable(); populateCategoryFilter();
    closeModal('addSupplierModal'); notify(`"${name}" added`,'success');
}
function confirmDeleteSupplier(name) {
    if (suppliers.length <= 1) { notify('Need at least one supplier','error'); return; }
    document.getElementById('deleteSupplierName').textContent = name;
    document.getElementById('deleteSupplierModal').dataset.supplier = name;
    openModal('deleteSupplierModal');
}
function deleteSupplier() {
    pushUndo();
    const name = document.getElementById('deleteSupplierModal').dataset.supplier;
    suppliers = suppliers.filter(s => s !== name); delete materialsBySupplier[name];
    if (activeSupplier === name) activeSupplier = suppliers[0];
    saveAll(); renderSupplierTabs(); renderMaterialTable(); closeModal('deleteSupplierModal');
    notify(`"${name}" removed`,'success');
}

// ===== CATEGORY =====
function populateCategoryFilter() {
    const sel = document.getElementById('categoryFilter');
    const v = sel.value;
    sel.innerHTML = '<option value="All">All Phases</option>' + categories.map(c => `<option>${c}</option>`).join('');
    if (categories.includes(v) || v === 'All') sel.value = v;
}
function addCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    if (!name) { notify('Enter name','error'); return; }
    if (categories.includes(name)) { notify('Exists','error'); return; }
    categories.push(name); saveAll(); populateCategoryFilter(); populateOrderPhaseFilter();
    closeModal('addCategoryModal'); notify(`Phase "${name}" added`,'success');
}
function openDeleteCategoryModal() {
    document.getElementById('deleteCategorySelect').innerHTML = categories.map(c => `<option>${c}</option>`).join('');
    openModal('deleteCategoryModal');
}
function deleteCategory() {
    pushUndo();
    const name = document.getElementById('deleteCategorySelect').value;
    const scope = document.getElementById('deleteCategoryScope').value;

    if (scope === 'supplier') {
        // Remove materials in this phase from current supplier only
        materialsBySupplier[activeSupplier] = (materialsBySupplier[activeSupplier]||[]).filter(m => m.category !== name);
        saveAll(); renderMaterialTable();
        closeModal('deleteCategoryModal'); notify(`"${name}" removed from ${activeSupplier}`,'success');
    } else {
        // Remove phase globally and all its materials from every supplier
        categories = categories.filter(c => c !== name);
        suppliers.forEach(s => { materialsBySupplier[s] = (materialsBySupplier[s]||[]).filter(m => m.category !== name); });
        saveAll(); populateCategoryFilter(); populateOrderPhaseFilter(); renderMaterialTable();
        closeModal('deleteCategoryModal'); notify(`"${name}" removed from all suppliers`,'success');
    }
}

// ===== MATERIAL TABLE =====
function renderMaterialTable() {
    const filter = document.getElementById('categoryFilter').value;
    const search = (document.getElementById('materialSearch').value || '').toLowerCase();
    let mats = materialsBySupplier[activeSupplier] || [];
    if (filter !== 'All') mats = mats.filter(m => m.category === filter);
    if (search) mats = mats.filter(m => m.name.toLowerCase().includes(search) || m.sku.toLowerCase().includes(search));
    const tbody = document.getElementById('materialTableBody');

    if (mats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding:32px;color:var(--text-muted)">No materials found.</td></tr>';
        return;
    }

    const grouped = {}; categories.forEach(c => grouped[c] = []);
    mats.forEach(m => { if (!grouped[m.category]) grouped[m.category] = []; grouped[m.category].push(m); });

    let html = '';
    categories.forEach((cat, ci) => {
        const items = grouped[cat]; if (!items || !items.length) return;
        const c = ci % 8;
        html += `<tr class="phase-header"><td colspan="9" class="phase-color-${c}">${escHtml(cat)} Phase</td></tr>`;
        items.forEach(m => {
            if (editingId === m.id) {
                html += `<tr><td></td>
                    <td><input class="inline-input" id="edit-name" value="${escAttr(m.name)}"></td>
                    <td><input class="inline-input" id="edit-sku" value="${escAttr(m.sku)}" style="width:100px"></td>
                    <td><select class="inline-select" id="edit-unit">${UNITS.map(u=>`<option${u===m.unit?' selected':''}>${u}</option>`).join('')}</select></td>
                    <td><input class="inline-input" id="edit-price" type="number" step="0.01" min="0" value="${m.pricePerUnit}" style="text-align:right;width:75px"></td>
                    <td><select class="inline-select" id="edit-category">${categories.map(cc=>`<option${cc===m.category?' selected':''}>${cc}</option>`).join('')}</select></td>
                    <td><select class="inline-select" id="edit-calcType">${CALC_TYPES.map(t=>`<option${t===m.calcType?' selected':''}>${t}</option>`).join('')}</select></td>
                    <td><input class="inline-input" id="edit-coverage" type="number" step="0.1" min="0.1" value="${m.coveragePerUnit}" style="text-align:right;width:70px"></td>
                    <td class="text-center" style="white-space:nowrap">
                        <button class="btn btn-success btn-xs" onclick="saveMaterialEdit('${m.id}')">Save</button>
                        <button class="btn btn-secondary btn-xs" onclick="cancelEdit()">Cancel</button>
                    </td></tr>`;
            } else {
                const covLabel = m.calcType === 'linear' ? 'lf' : 'sqft';
                html += `<tr draggable="true" data-id="${m.id}" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondragleave="dragLeave(event)" ondrop="dropRow(event)">
                    <td style="cursor:grab;color:var(--text-muted)">&#9776;</td>
                    <td>${escHtml(m.name)}</td>
                    <td style="color:var(--text-muted);font-family:monospace;font-size:0.78rem">${escHtml(m.sku)}</td>
                    <td>${m.unit}</td>
                    <td class="text-right">${fmt(m.pricePerUnit)}</td>
                    <td><span class="badge phase-bg-${c} phase-color-${c}">${m.category}</span></td>
                    <td><span class="badge-calc">${m.calcType}</span></td>
                    <td class="text-right">${m.coveragePerUnit} ${covLabel}</td>
                    <td class="text-center" style="white-space:nowrap">
                        <button class="btn-icon" onclick="editMaterial('${m.id}')" title="Edit">&#9998;</button>
                        <button class="btn-icon" onclick="openDuplicate('${m.id}')" title="Copy to supplier">&#10697;</button>
                        <button class="btn-icon danger" onclick="deleteMaterial('${m.id}')" title="Delete">&#10005;</button>
                    </td></tr>`;
            }
        });
    });
    tbody.innerHTML = html;
}

function editMaterial(id) { editingId = id; renderMaterialTable(); }
function cancelEdit() { editingId = null; renderMaterialTable(); }

function saveMaterialEdit(id) {
    const mats = materialsBySupplier[activeSupplier] || [];
    const mat = mats.find(m => m.id === id); if (!mat) return;
    const name = document.getElementById('edit-name').value.trim();
    const price = parseFloat(document.getElementById('edit-price').value);
    const coverage = parseFloat(document.getElementById('edit-coverage').value);
    if (!name) { notify('Name required','error'); return; }
    if (isNaN(price) || price < 0) { notify('Invalid price','error'); return; }
    if (isNaN(coverage) || coverage <= 0) { notify('Coverage > 0','error'); return; }
    pushUndo();
    mat.name = name; mat.sku = document.getElementById('edit-sku').value.trim();
    mat.unit = document.getElementById('edit-unit').value; mat.pricePerUnit = price;
    mat.category = document.getElementById('edit-category').value;
    mat.calcType = document.getElementById('edit-calcType').value;
    mat.coveragePerUnit = coverage;
    editingId = null; saveAll(); renderMaterialTable(); notify('Updated','success');
}

function addMaterial() {
    pushUndo();
    const mats = materialsBySupplier[activeSupplier] || [];
    const m = { id: genId(), name: 'New Material', sku: '', unit: 'each', pricePerUnit: 0, category: categories[0]||'Lath', coveragePerUnit: 100, calcType: 'area' };
    mats.push(m); materialsBySupplier[activeSupplier] = mats; saveAll();
    editingId = m.id; document.getElementById('categoryFilter').value = 'All';
    document.getElementById('materialSearch').value = '';
    renderMaterialTable();
    document.getElementById('materialTableBody').lastElementChild?.scrollIntoView({ behavior:'smooth', block:'center' });
}

function deleteMaterial(id) {
    const mats = materialsBySupplier[activeSupplier] || [];
    const mat = mats.find(m => m.id === id);
    if (!mat || !confirm(`Delete "${mat.name}"?`)) return;
    pushUndo();
    materialsBySupplier[activeSupplier] = mats.filter(m => m.id !== id);
    saveAll(); renderMaterialTable(); notify('Deleted','success');
}

function resetToDefaults() {
    if (!confirm('Reset ALL data to defaults?')) return;
    pushUndo(); resetAllToDefaults(false); editingId = null;
    renderSupplierTabs(); populateCategoryFilter(); renderMaterialTable(); populateOrderPhaseFilter();
}

// ===== DUPLICATE TO SUPPLIER =====
let duplicateMatId = null;
function openDuplicate(id) {
    duplicateMatId = id;
    const sel = document.getElementById('duplicateTarget');
    sel.innerHTML = suppliers.filter(s => s !== activeSupplier).map(s => `<option>${s}</option>`).join('');
    if (!sel.innerHTML) { notify('No other suppliers','error'); return; }
    openModal('duplicateModal');
}
function doDuplicate() {
    const target = document.getElementById('duplicateTarget').value;
    const src = (materialsBySupplier[activeSupplier]||[]).find(m => m.id === duplicateMatId);
    if (!src || !target) return;
    pushUndo();
    const copy = { ...src, id: genId() };
    if (!materialsBySupplier[target]) materialsBySupplier[target] = [];
    materialsBySupplier[target].push(copy);
    saveAll(); closeModal('duplicateModal');
    notify(`Copied to ${target}`,'success');
}

// ===== DRAG REORDER =====
function dragStart(e) {
    dragSrcId = e.currentTarget.dataset.id;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}
function dragOver(e) {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    const row = e.currentTarget.closest('tr');
    if (row && row.dataset.id) row.classList.add('drag-over');
}
function dragLeave(e) { e.currentTarget.closest('tr')?.classList.remove('drag-over'); }
function dropRow(e) {
    e.preventDefault();
    const targetId = e.currentTarget.closest('tr')?.dataset.id;
    document.querySelectorAll('.drag-over,.dragging').forEach(el => el.classList.remove('drag-over','dragging'));
    if (!dragSrcId || !targetId || dragSrcId === targetId) return;
    const mats = materialsBySupplier[activeSupplier] || [];
    const srcIdx = mats.findIndex(m => m.id === dragSrcId);
    const tgtIdx = mats.findIndex(m => m.id === targetId);
    if (srcIdx < 0 || tgtIdx < 0) return;
    pushUndo();
    const [item] = mats.splice(srcIdx, 1);
    mats.splice(tgtIdx, 0, item);
    saveAll(); renderMaterialTable();
}

// ===== CSV =====
function parseCSVLine(line) {
    const r=[]; let c='', q=false;
    for (let i=0;i<line.length;i++) {
        const ch=line[i];
        if(q){if(ch==='"'&&line[i+1]==='"'){c+='"';i++;}else if(ch==='"')q=false;else c+=ch;}
        else{if(ch==='"')q=true;else if(ch===','){r.push(c.trim());c='';}else c+=ch;}
    } r.push(c.trim()); return r;
}
function handleCSVImport(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split(/\r?\n/).filter(l=>l.trim());
        if (lines.length < 2) { notify('Empty CSV','error'); return; }
        const hdr = parseCSVLine(lines[0]).map(h=>h.toLowerCase().replace(/[^a-z]/g,''));
        const ni=hdr.findIndex(h=>h==='name'), si=hdr.findIndex(h=>h==='sku'), ui=hdr.findIndex(h=>h==='unit'),
              pi=hdr.findIndex(h=>h.includes('price')), ci=hdr.findIndex(h=>h.includes('category')||h.includes('phase')),
              cvi=hdr.findIndex(h=>h.includes('coverage')), ti=hdr.findIndex(h=>h.includes('type')||h.includes('calctype'));
        if (ni===-1) { notify('Need "name" column','error'); return; }
        pushUndo(); let imp=0, skip=0;
        const mats = materialsBySupplier[activeSupplier]||[];
        for (let i=1;i<lines.length;i++) {
            const f=parseCSVLine(lines[i]); const name=f[ni]?.trim(); if(!name){skip++;continue;}
            const cat=f[ci]?.trim()||categories[0]||'Lath';
            if(!categories.includes(cat)) categories.push(cat);
            const cov=parseFloat(f[cvi])||100; if(cov<=0){skip++;continue;}
            const ct=f[ti]?.trim()||'area';
            mats.push({id:genId(),name,sku:f[si]?.trim()||'',unit:f[ui]?.trim()||'each',pricePerUnit:parseFloat(f[pi])||0,category:cat,coveragePerUnit:cov,calcType:CALC_TYPES.includes(ct)?ct:'area'});
            imp++;
        }
        materialsBySupplier[activeSupplier]=mats; saveAll(); populateCategoryFilter(); renderMaterialTable();
        notify(`${imp} imported`+(skip?`, ${skip} skipped`:''), imp>0?'success':'error');
    };
    reader.readAsText(file); event.target.value='';
}
function exportCSV() {
    const mats = materialsBySupplier[activeSupplier]||[];
    const hdr='name,sku,unit,pricePerUnit,category,coveragePerUnit,calcType';
    const rows = mats.map(m=>`"${m.name.replace(/"/g,'""')}","${m.sku}","${m.unit}",${m.pricePerUnit},"${m.category}",${m.coveragePerUnit},${m.calcType}`);
    const blob=new Blob([[hdr,...rows].join('\n')],{type:'text/csv'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`materials-${activeSupplier.replace(/\s+/g,'-').toLowerCase()}.csv`;
    a.click(); URL.revokeObjectURL(a.href); notify('Exported','success');
}

// ===== CALCULATOR =====
function populateCalcSupplierDropdown() {
    const sel=document.getElementById('calcSupplier'); const p=sel.value;
    sel.innerHTML=suppliers.map(s=>`<option>${s}</option>`).join('');
    if(suppliers.includes(p)) sel.value=p;
}

function getSelectedPhases() {
    const boxes = document.querySelectorAll('#phaseCheckboxes input[type="checkbox"]');
    const selected = [];
    boxes.forEach(cb => { if (cb.checked) selected.push(cb.value); });
    return selected.length > 0 ? selected : categories;
}

function renderPhaseCheckboxes() {
    const wrap = document.getElementById('phaseCheckboxes');
    const supplier = document.getElementById('calcSupplier').value;
    const supplierMats = materialsBySupplier[supplier] || [];
    const supplierPhases = [...new Set(supplierMats.map(m => m.category))];

    wrap.innerHTML = categories.map((cat, i) => {
        const hasMats = supplierPhases.includes(cat);
        const c = i % 8;
        if (!hasMats) return '';
        return `<label class="phase-check checked" onclick="setTimeout(()=>toggleCheckStyle(this),0)">
            <input type="checkbox" value="${escAttr(cat)}" checked> <span class="phase-color-${c}">${escHtml(cat)}</span>
        </label>`;
    }).join('');
}

function toggleCheckStyle(label) {
    const cb = label.querySelector('input');
    if (cb.checked) label.classList.add('checked');
    else label.classList.remove('checked');
}

function calcForSupplier(supplier, sqft, linearFt, waste, selectedPhases) {
    const adjSqft = sqft * (1 + waste/100);
    const adjLinear = linearFt * (1 + waste/100);
    let mats = materialsBySupplier[supplier]||[];
    if (selectedPhases && selectedPhases.length > 0) {
        mats = mats.filter(m => selectedPhases.includes(m.category));
    }
    const phases = {}; categories.forEach(c => phases[c] = {total:0, count:0});
    let materialTotal = 0;
    const items = mats.map(m => {
        const base = m.calcType === 'linear' ? adjLinear : adjSqft;
        const qty = base > 0 ? Math.ceil(base / m.coveragePerUnit) : 0;
        const lineTotal = qty * m.pricePerUnit;
        if (phases[m.category]) { phases[m.category].total += lineTotal; phases[m.category].count++; }
        materialTotal += lineTotal;
        return { id:m.id, name:m.name, sku:m.sku, unit:m.unit, pricePerUnit:m.pricePerUnit, category:m.category, coveragePerUnit:m.coveragePerUnit, calcType:m.calcType, qty, lineTotal };
    });
    return { supplier, phases, items, materialTotal };
}

function calculateJob() {
    const sqft = parseFloat(document.getElementById('calcSqft').value)||0;
    const linearFt = parseFloat(document.getElementById('calcLinearFt').value)||0;
    const waste = parseFloat(document.getElementById('calcWaste').value)||0;
    const profitPct = parseFloat(document.getElementById('calcProfit').value)||0;
    const taxPct = parseFloat(document.getElementById('calcTax').value)||0;
    const laborRate = parseFloat(document.getElementById('calcLabor').value)||0;
    const supplier = document.getElementById('calcSupplier').value;

    if (sqft <= 0 && linearFt <= 0) { notify('Enter sqft or linear ft','error'); return; }
    if (!supplier) { notify('Select supplier','error'); return; }

    const selectedPhases = getSelectedPhases();
    const base = calcForSupplier(supplier, sqft, linearFt, waste, selectedPhases);
    const r = {
        ...base, sqft, linearFt, waste, profitPct, taxPct, laborRate, selectedPhases,
        adjSqft: sqft*(1+waste/100), adjLinear: linearFt*(1+waste/100)
    };
    r.taxAmount = r.materialTotal * (taxPct/100);
    r.materialPlusTax = r.materialTotal + r.taxAmount;
    r.laborTotal = laborRate * sqft;
    r.subtotalBeforeProfit = r.materialPlusTax + r.laborTotal;
    r.profitAmount = r.subtotalBeforeProfit * (profitPct/100);
    r.sellingPrice = r.subtotalBeforeProfit + r.profitAmount;
    r.grossMargin = r.sellingPrice > 0 ? (r.profitAmount / r.sellingPrice * 100) : 0;

    currentCalc = r;
    renderCalcResults(r);
    document.getElementById('comparisonSection').classList.add('hidden');
}

function renderCalcResults(r) {
    document.getElementById('calcResults').classList.remove('hidden');

    document.getElementById('phaseCards').innerHTML = categories.map((cat,i) => {
        const p = r.phases[cat]; if (!p||p.count===0) return '';
        const c = i%8;
        return `<div class="phase-card phase-bg-${c}"><h3>${escHtml(cat)}</h3><div class="amount phase-color-${c}">${fmt(p.total)}</div><div class="items">${p.count} items</div></div>`;
    }).join('');

    let bh = '';
    categories.forEach((cat,ci) => {
        const items = r.items.filter(i=>i.category===cat); if(!items.length) return;
        const c = ci%8;
        bh += `<div style="margin-bottom:16px"><h3 class="section-title phase-color-${c}">${escHtml(cat)} Phase</h3>
        <div class="table-wrap"><table><thead><tr><th>Material</th><th>SKU</th><th>Type</th><th class="text-right">Coverage</th><th class="text-right">Qty</th><th>Unit</th><th class="text-right">Price</th><th class="text-right">Total</th></tr></thead><tbody>
        ${items.map(i=>{const cl=i.calcType==='linear'?'lf':'sqft';return `<tr><td>${escHtml(i.name)}</td><td style="font-family:monospace;font-size:0.78rem;color:var(--text-muted)">${escHtml(i.sku)}</td><td><span class="badge-calc">${i.calcType}</span></td><td class="text-right">${i.coveragePerUnit} ${cl}</td><td class="text-right" style="font-weight:600">${i.qty}</td><td>${i.unit}</td><td class="text-right">${fmt(i.pricePerUnit)}</td><td class="text-right" style="font-weight:600">${fmt(i.lineTotal)}</td></tr>`;}).join('')}
        <tr class="subtotal-row"><td colspan="7" class="text-right">${escHtml(cat)} Subtotal:</td><td class="text-right">${fmt(r.phases[cat].total)}</td></tr>
        </tbody></table></div></div>`;
    });
    document.getElementById('calcBreakdown').innerHTML = bh;

    let sqftLabel = [];
    if (r.sqft > 0) sqftLabel.push(`${r.sqft.toLocaleString()} sqft`);
    if (r.linearFt > 0) sqftLabel.push(`${r.linearFt.toLocaleString()} lf`);
    document.getElementById('calcGrandTotal').innerHTML = `<h3>Material Total (${sqftLabel.join(' + ')} + ${r.waste}% waste) — ${escHtml(r.supplier)}</h3><div class="amount">${fmt(r.materialTotal)}</div>`;

    let sg = `<div class="summary-card"><h4>Material Cost</h4><div class="val">${fmt(r.materialTotal)}</div></div>`;
    if (r.taxPct > 0) sg += `<div class="summary-card"><h4>Tax (${r.taxPct}%)</h4><div class="val">${fmt(r.taxAmount)}</div></div>`;
    if (r.laborTotal > 0) sg += `<div class="summary-card"><h4>Labor ($${r.laborRate}/sqft)</h4><div class="val">${fmt(r.laborTotal)}</div></div>`;
    sg += `<div class="summary-card"><h4>Markup (${r.profitPct}%)</h4><div class="val green">${fmt(r.profitAmount)}</div></div>`;
    sg += `<div class="summary-card"><h4>Selling Price</h4><div class="val blue">${fmt(r.sellingPrice)}</div></div>`;
    sg += `<div class="summary-card"><h4>Gross Margin</h4><div class="val green">${r.grossMargin.toFixed(1)}%</div></div>`;
    document.getElementById('summaryGrid').innerHTML = sg;
}

// ===== SUPPLIER COMPARISON =====
function compareSuppliers() {
    const sqft = parseFloat(document.getElementById('calcSqft').value)||0;
    const linearFt = parseFloat(document.getElementById('calcLinearFt').value)||0;
    const waste = parseFloat(document.getElementById('calcWaste').value)||0;
    if (sqft <= 0 && linearFt <= 0) { notify('Enter sqft or linear ft first','error'); return; }

    if (!currentCalc) calculateJob();

    const selectedPhases = getSelectedPhases();
    const results = suppliers.map(s => {
        const r = calcForSupplier(s, sqft, linearFt, waste, selectedPhases);
        return { supplier: s, total: r.materialTotal, phases: r.phases };
    });

    const minTotal = Math.min(...results.map(r=>r.total));
    const activePhases = selectedPhases.filter(p => results.some(r => r.phases[p]?.count > 0));

    let html = `<div class="comparison-wrap"><h3>Supplier Price Comparison${selectedPhases.length < categories.length ? ' (filtered)' : ''}</h3>
    <div class="table-wrap"><table><thead><tr><th>Supplier</th>`;
    activePhases.forEach(c => { html += `<th class="text-right">${escHtml(c)}</th>`; });
    html += `<th class="text-right">Total</th><th class="text-right">Diff</th></tr></thead><tbody>`;

    results.forEach(r => {
        const isBest = r.total === minTotal;
        html += `<tr${isBest?' class="best-price"':''}>
            <td>${escHtml(r.supplier)}${isBest?' ★':''}</td>`;
        activePhases.forEach(c => {
            html += `<td class="text-right">${fmt(r.phases[c]?.total||0)}</td>`;
        });
        const diff = r.total - minTotal;
        html += `<td class="text-right" style="font-weight:700">${fmt(r.total)}</td>
            <td class="text-right" style="color:${diff===0?'var(--success)':'var(--danger)'}">${diff===0?'Best':'+'+fmt(diff)}</td></tr>`;
    });
    html += '</tbody></table></div></div>';

    document.getElementById('comparisonSection').innerHTML = html;
    document.getElementById('comparisonSection').classList.remove('hidden');
    document.getElementById('calcResults').classList.remove('hidden');
}

// ===== ORDER FORM =====
function populateOrderPhaseFilter() {
    const sel = document.getElementById('orderPhaseFilter'); const v = sel.value;
    sel.innerHTML = '<option value="All">All Phases</option>' + categories.map(c=>`<option>${c}</option>`).join('');
    if (categories.includes(v)||v==='All') sel.value = v;
}

function generateOrderForm() {
    if (!currentCalc) { notify('Calculate first','error'); return; }
    document.getElementById('orderProjectName').value = document.getElementById('calcProjectName').value;
    document.getElementById('orderProjectAddress').value = document.getElementById('calcProjectAddress').value;
    document.getElementById('orderSupplier').value = currentCalc.supplier;
    document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    populateOrderPhaseFilter();
    document.getElementById('orderPhaseFilter').value = 'All';
    document.getElementById('orderEmpty').style.display = 'none';
    document.getElementById('orderContent').classList.remove('hidden');
    renderOrderTable(); showTab('order'); notify('Order form ready','success');
}

function renderOrderTable() {
    if (!currentCalc) return;
    const pf = document.getElementById('orderPhaseFilter').value;
    const tbody = document.getElementById('orderTableBody');
    let html = '', filteredTotal = 0;

    categories.forEach((cat,ci) => {
        if (pf!=='All' && pf!==cat) return;
        const items = currentCalc.items.filter(i=>i.category===cat); if(!items.length) return;
        const c = ci%8;
        html += `<tr class="phase-header"><td colspan="6" class="phase-color-${c}">${escHtml(cat)} Phase</td></tr>`;
        let pt = 0;
        items.forEach(item => {
            html += `<tr data-id="${item.id}"><td style="font-family:monospace;font-size:0.78rem">${escHtml(item.sku)}</td><td>${escHtml(item.name)}</td>
            <td class="text-center"><input type="number" class="order-qty-input" value="${item.qty}" min="0" onchange="updateOrderQty('${item.id}',this.value)"></td>
            <td>${item.unit}</td><td class="text-right">${fmt(item.pricePerUnit)}</td><td class="text-right line-total">${fmt(item.lineTotal)}</td></tr>`;
            pt += item.lineTotal;
        });
        html += `<tr class="subtotal-row"><td colspan="5" class="text-right">${escHtml(cat)} Subtotal:</td><td class="text-right">${fmt(pt)}</td></tr>`;
        filteredTotal += pt;
    });

    if (currentCalc.taxPct > 0) {
        const tax = filteredTotal * (currentCalc.taxPct/100);
        html += `<tr class="tax-row"><td colspan="5" class="text-right">Tax (${currentCalc.taxPct}%):</td><td class="text-right">${fmt(tax)}</td></tr>`;
        filteredTotal += tax;
    }

    html += `<tr class="grand-total-row"><td colspan="5" class="text-right">${pf==='All'?'Grand':escHtml(pf)} Total:</td><td class="text-right">${fmt(filteredTotal)}</td></tr>`;
    tbody.innerHTML = html;

    const notes = document.getElementById('orderNotes').value.trim();
    const notesPrint = document.getElementById('orderNotesPrint');
    if (notes) { notesPrint.innerHTML = `<h4>Notes:</h4>${escHtml(notes)}`; notesPrint.style.display = 'block'; }
    else { notesPrint.style.display = 'none'; }
}

function updateOrderQty(id, val) {
    const qty = Math.max(0, parseInt(val)||0);
    const item = currentCalc.items.find(i=>i.id===id); if(!item) return;
    item.qty = qty; item.lineTotal = qty * item.pricePerUnit;
    renderOrderTable();
}

function printOrder() {
    const notes = document.getElementById('orderNotes').value.trim();
    const notesPrint = document.getElementById('orderNotesPrint');
    if (notes) { notesPrint.innerHTML = `<h4>Notes:</h4>${escHtml(notes)}`; notesPrint.style.display = 'block'; }
    else { notesPrint.style.display = 'none'; }
    window.print();
}

function exportOrderCSV() {
    if (!currentCalc) return;
    const pf = document.getElementById('orderPhaseFilter').value;
    const pn = document.getElementById('orderProjectName').value;
    const pa = document.getElementById('orderProjectAddress').value;
    const sup = document.getElementById('orderSupplier').value;
    const dt = document.getElementById('orderDate').value;
    const po = document.getElementById('orderPO').value;
    const notes = document.getElementById('orderNotes').value;

    let csv = `"Project","${pn}"\n"Address","${pa}"\n"Supplier","${sup}"\n"Date","${dt}"\n"PO#","${po}"\n`;
    if (notes) csv += `"Notes","${notes.replace(/"/g,'""')}"\n`;
    csv += '\nSKU,Material,Phase,Qty,Unit,Unit Price,Line Total\n';
    let total = 0;
    categories.forEach(cat => {
        if (pf!=='All'&&pf!==cat) return;
        currentCalc.items.filter(i=>i.category===cat).forEach(item => {
            csv += `"${item.sku}","${item.name.replace(/"/g,'""')}","${item.category}",${item.qty},"${item.unit}",${item.pricePerUnit},${item.lineTotal}\n`;
            total += item.lineTotal;
        });
    });
    if (currentCalc.taxPct > 0) { const tax = total*(currentCalc.taxPct/100); csv += `,,,,,"Tax (${currentCalc.taxPct}%)",${tax.toFixed(2)}\n`; total += tax; }
    csv += `,,,,,"Total",${total.toFixed(2)}\n`;
    const blob = new Blob([csv],{type:'text/csv'}); const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    const slug = pn.replace(/\s+/g,'-').toLowerCase()||'order';
    const ps = pf==='All'?'all':pf.replace(/\s+/g,'-').toLowerCase();
    a.download = `order-${slug}-${ps}-${dt||'draft'}.csv`;
    a.click(); URL.revokeObjectURL(a.href); notify('Exported','success');
}

// ===== SAVED JOBS =====
function saveJob() {
    if (!currentCalc) { notify('Calculate first','error'); return; }
    const nameEl = document.getElementById('saveJobName');
    nameEl.value = document.getElementById('calcProjectName').value || '';
    openModal('saveJobModal');
    nameEl.focus();
}

function doSaveJob() {
    const name = document.getElementById('saveJobName').value.trim();
    if (!name) { notify('Enter job name','error'); return; }
    const job = {
        id: 'job-' + Date.now(),
        name,
        projectName: document.getElementById('calcProjectName').value,
        projectAddress: document.getElementById('calcProjectAddress').value,
        supplier: currentCalc.supplier,
        sqft: currentCalc.sqft,
        linearFt: currentCalc.linearFt,
        waste: currentCalc.waste,
        profitPct: currentCalc.profitPct,
        taxPct: currentCalc.taxPct,
        laborRate: currentCalc.laborRate,
        selectedPhases: currentCalc.selectedPhases || categories,
        materialTotal: currentCalc.materialTotal,
        sellingPrice: currentCalc.sellingPrice,
        savedAt: new Date().toISOString()
    };
    savedJobs.unshift(job); saveSavedJobs();
    closeModal('saveJobModal'); notify('Job saved','success');
}

function renderSavedJobs() {
    const el = document.getElementById('savedJobsList');
    if (savedJobs.length === 0) {
        el.innerHTML = '<div class="empty-state"><p>No saved jobs yet.</p><p>Calculate a job and click "Save Job" to store it here.</p></div>';
        return;
    }
    el.innerHTML = '<div class="saved-jobs-list">' + savedJobs.map(j => {
        const d = new Date(j.savedAt);
        const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        return `<div class="saved-job-card">
            <h4>${escHtml(j.name)}</h4>
            <div class="meta">
                <span>${escHtml(j.supplier)}</span>
                <span>${(j.sqft||0).toLocaleString()} sqft</span>
                ${j.linearFt?`<span>${j.linearFt.toLocaleString()} lf</span>`:''}
            </div>
            <div class="meta"><span>${fmt(j.materialTotal)} materials</span><span>${fmt(j.sellingPrice)} selling</span></div>
            <div class="meta"><span>${dateStr}</span></div>
            <div class="actions">
                <button class="btn btn-primary btn-xs" onclick="loadJob('${j.id}')">Load</button>
                <button class="btn btn-danger btn-xs" onclick="deleteJob('${j.id}')">Delete</button>
            </div>
        </div>`;
    }).join('') + '</div>';
}

function loadJob(id) {
    const job = savedJobs.find(j=>j.id===id); if (!job) return;
    document.getElementById('calcProjectName').value = job.projectName||'';
    document.getElementById('calcProjectAddress').value = job.projectAddress||'';
    document.getElementById('calcSqft').value = job.sqft||'';
    document.getElementById('calcLinearFt').value = job.linearFt||'';
    document.getElementById('calcWaste').value = job.waste||10;
    document.getElementById('calcProfit').value = job.profitPct||20;
    document.getElementById('calcTax').value = job.taxPct||0;
    document.getElementById('calcLabor').value = job.laborRate||0;
    showTab('calculator');
    setTimeout(() => {
        const sel = document.getElementById('calcSupplier');
        if (suppliers.includes(job.supplier)) sel.value = job.supplier;
        renderPhaseCheckboxes();
        if (job.selectedPhases) {
            document.querySelectorAll('#phaseCheckboxes input[type="checkbox"]').forEach(cb => {
                const checked = job.selectedPhases.includes(cb.value);
                cb.checked = checked;
                cb.closest('.phase-check').classList.toggle('checked', checked);
            });
        }
        calculateJob();
    }, 50);
    notify('Job loaded','info');
}

function deleteJob(id) {
    if (!confirm('Delete this saved job?')) return;
    savedJobs = savedJobs.filter(j=>j.id!==id); saveSavedJobs(); renderSavedJobs();
    notify('Job deleted','success');
}

function clearAllJobs() {
    if (!confirm('Delete ALL saved jobs?')) return;
    savedJobs = []; saveSavedJobs(); renderSavedJobs(); notify('All jobs cleared','info');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderSupplierTabs();
    populateCategoryFilter();
    renderMaterialTable();
    populateOrderPhaseFilter();
    updateUndoButtons();

    document.getElementById('orderNotes')?.addEventListener('input', function() {
        const np = document.getElementById('orderNotesPrint');
        if (this.value.trim()) { np.innerHTML = `<h4>Notes:</h4>${escHtml(this.value)}`; np.style.display='block'; }
        else np.style.display='none';
    });
});
