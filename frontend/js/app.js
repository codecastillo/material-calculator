// ===== DEFAULTS =====
const DEFAULT_CATEGORIES=['Lath','Gray Coat','Color Coat','Stone','Drywall','Painting'];
const DEFAULT_SUPPLIERS=['Pacific Supply','ABC Supply','Sherwin Williams'];
const UNITS=['roll','box','piece','bag','ton','pail','tube','gal','lb','each','bundle','bucket','sheet','sqyd','disc'];
const CALC_TYPES=['area','linear'];

// Scope grouping: which broad scope each phase belongs to
const SCOPE_GROUPS={
    'Stucco':['Lath','Gray Coat','Color Coat'],
    'Stone':['Stone'],
    'Drywall':['Drywall'],
    'Painting':['Painting']
};

const STUCCO_LATH=[{name:'Wire Lath 2.5 lb (36" x 150\')',sku:'WL-2536150',unit:'roll',pricePerUnit:52,category:'Lath',coveragePerUnit:450,calcType:'area'},{name:'2-Ply 60min Paper (150 sqft)',sku:'PB-2P60-150',unit:'roll',pricePerUnit:28,category:'Lath',coveragePerUnit:150,calcType:'area'},{name:'7/16" Staples (10,000ct)',sku:'ST-716-10K',unit:'box',pricePerUnit:45,category:'Lath',coveragePerUnit:2000,calcType:'area'},{name:'Weep Screed 26ga (10\')',sku:'WS-26-10',unit:'piece',pricePerUnit:8.50,category:'Lath',coveragePerUnit:10,calcType:'linear'},{name:'Corner Aid 26ga (10\')',sku:'CA-26-10',unit:'piece',pricePerUnit:6.75,category:'Lath',coveragePerUnit:10,calcType:'linear'},{name:'Casing Bead 26ga (10\')',sku:'CB-26-10',unit:'piece',pricePerUnit:5.50,category:'Lath',coveragePerUnit:10,calcType:'linear'},{name:'Self-Furring Nails 1.5" (25lb)',sku:'SFN-15-25',unit:'box',pricePerUnit:42,category:'Lath',coveragePerUnit:1500,calcType:'area'}];
const STUCCO_GRAY=[{name:'Portland Cement Type S (94lb)',sku:'PC-TS-94',unit:'bag',pricePerUnit:14.50,category:'Gray Coat',coveragePerUnit:25,calcType:'area'},{name:'Plaster Sand',sku:'PS-TON',unit:'ton',pricePerUnit:45,category:'Gray Coat',coveragePerUnit:250,calcType:'area'},{name:'Hydrated Lime Type S (50lb)',sku:'HL-TS-50',unit:'bag',pricePerUnit:12,category:'Gray Coat',coveragePerUnit:75,calcType:'area'},{name:'Fiber Mesh (1lb)',sku:'FM-1LB',unit:'bag',pricePerUnit:8.50,category:'Gray Coat',coveragePerUnit:300,calcType:'area'},{name:'Bonding Agent - Weld-Crete (5 gal)',sku:'BA-WC-5G',unit:'pail',pricePerUnit:62,category:'Gray Coat',coveragePerUnit:500,calcType:'area'}];
const STUCCO_COLOR=[{name:'LaHabra X-Kaliber Finish (65lb)',sku:'LH-XK-65',unit:'bag',pricePerUnit:28,category:'Color Coat',coveragePerUnit:65,calcType:'area'},{name:'Color Pigment (1lb tube)',sku:'LH-PIG-1',unit:'tube',pricePerUnit:9.50,category:'Color Coat',coveragePerUnit:200,calcType:'area'},{name:'Finish Sand 30-mesh (80lb)',sku:'FS-30-80',unit:'bag',pricePerUnit:12,category:'Color Coat',coveragePerUnit:100,calcType:'area'},{name:'Acrylic Additive (1 gal)',sku:'AA-QR-1G',unit:'gal',pricePerUnit:18,category:'Color Coat',coveragePerUnit:150,calcType:'area'}];
const STONE_MATERIALS=[{name:'Manufactured Stone Veneer (flat)',sku:'SV-FLAT-BOX',unit:'box',pricePerUnit:125,category:'Stone',coveragePerUnit:10,calcType:'area'},{name:'Stone Corners (linear)',sku:'SV-CORN-BOX',unit:'box',pricePerUnit:85,category:'Stone',coveragePerUnit:5,calcType:'linear'},{name:'Stone Mortar Mix (80lb)',sku:'SM-MRT-80',unit:'bag',pricePerUnit:12.50,category:'Stone',coveragePerUnit:20,calcType:'area'},{name:'Stone Grout Bag (50lb)',sku:'SM-GRT-50',unit:'bag',pricePerUnit:14,category:'Stone',coveragePerUnit:35,calcType:'area'},{name:'Metal Lath for Stone (2.5 lb)',sku:'ML-ST-25',unit:'roll',pricePerUnit:52,category:'Stone',coveragePerUnit:450,calcType:'area'},{name:'Scratch Coat Cement (94lb)',sku:'SC-ST-94',unit:'bag',pricePerUnit:14.50,category:'Stone',coveragePerUnit:25,calcType:'area'}];
const DRYWALL_MATERIALS=[{name:'Drywall Sheet 1/2" 4x8',sku:'DW-12-48',unit:'sheet',pricePerUnit:12.50,category:'Drywall',coveragePerUnit:32,calcType:'area',isDrywallSheet:true},{name:'Drywall Sheet 5/8" 4x8',sku:'DW-58-48',unit:'sheet',pricePerUnit:14.50,category:'Drywall',coveragePerUnit:32,calcType:'area',isDrywallSheet:true},{name:'Red Dot Joint Compound (4.5 gal)',sku:'RD-AP-45G',unit:'bucket',pricePerUnit:18,category:'Drywall',coveragePerUnit:230,calcType:'area'},{name:'TNT Lite Topping (4.5 gal)',sku:'TNT-LT-45G',unit:'bucket',pricePerUnit:22,category:'Drywall',coveragePerUnit:270,calcType:'area'},{name:'Sanding Discs 120 Grit (25pk)',sku:'SD-120-25',unit:'box',pricePerUnit:15,category:'Drywall',coveragePerUnit:1500,calcType:'area'},{name:'Sanding Discs 150 Grit (25pk)',sku:'SD-150-25',unit:'box',pricePerUnit:15,category:'Drywall',coveragePerUnit:1500,calcType:'area'},{name:'Paper Joint Tape (500\')',sku:'PJT-500',unit:'roll',pricePerUnit:4.50,category:'Drywall',coveragePerUnit:200,calcType:'area'},{name:'Mesh Joint Tape (300\')',sku:'MJT-300',unit:'roll',pricePerUnit:7,category:'Drywall',coveragePerUnit:150,calcType:'area'},{name:'Corner Bead Metal 8\'',sku:'CB-MT-8',unit:'piece',pricePerUnit:3.50,category:'Drywall',coveragePerUnit:8,calcType:'linear'}];
const PAINT_MATERIALS=[{name:'Painters Plastic (9\' x 400\')',sku:'PP-9400',unit:'roll',pricePerUnit:18,category:'Painting',coveragePerUnit:3600,calcType:'area'},{name:'Primer (1 gal)',sku:'SW-PRM-1G',unit:'gal',pricePerUnit:28,category:'Painting',coveragePerUnit:400,calcType:'area',isPaint:true},{name:'Primer (5 gal)',sku:'SW-PRM-5G',unit:'bucket',pricePerUnit:115,category:'Painting',coveragePerUnit:2000,calcType:'area',isPaint:true},{name:'A-100 Exterior Latex (1 gal)',sku:'SW-A100-1G',unit:'gal',pricePerUnit:42,category:'Painting',coveragePerUnit:400,calcType:'area',isPaint:true},{name:'A-100 Exterior Latex (5 gal)',sku:'SW-A100-5G',unit:'bucket',pricePerUnit:185,category:'Painting',coveragePerUnit:2000,calcType:'area',isPaint:true}];

const SUPPLIER_MATERIALS={'Pacific Supply':[...STUCCO_LATH,...STUCCO_GRAY,...STUCCO_COLOR,...STONE_MATERIALS,...DRYWALL_MATERIALS],'ABC Supply':[...STUCCO_LATH,...STUCCO_GRAY,...STUCCO_COLOR,...STONE_MATERIALS,...DRYWALL_MATERIALS],'Sherwin Williams':[...PAINT_MATERIALS]};
const SUPPLIER_PRICE_MODS={'Pacific Supply':1,'ABC Supply':1.03,'Sherwin Williams':1};

// ===== STATE =====
let suppliers=[],categories=[],materialsBySupplier={},activeSupplier='',editingId=null,currentCalc=null,savedJobs=[];
let undoStack=[],redoStack=[];const MAX_UNDO=25;let dragSrcId=null;
let pageHistory=['dashboard'];

// ===== PERSISTENCE (API + localStorage cache) =====
async function loadData(){
    const t=localStorage.getItem('stucco_theme');
    if(t)document.documentElement.setAttribute('data-theme',t);

    if(api.getToken()){
        try{
            // Load from API
            const [supData,catData,jobData]=await Promise.all([
                api.getSuppliers(),
                api.getCategories(),
                api.getJobs()
            ]);

            // Map API suppliers to our format
            suppliers=supData.suppliers.map(s=>s.name);
            const supplierIdMap={};supData.suppliers.forEach(s=>{supplierIdMap[s.name]=s.id});
            window._supplierIdMap=supplierIdMap; // store for later API calls

            // Map categories
            categories=catData.categories.map(c=>c.name);
            const categoryIdMap={};catData.categories.forEach(c=>{categoryIdMap[c.name]=c.id});
            window._categoryIdMap=categoryIdMap;

            // Load materials for each supplier
            materialsBySupplier={};
            await Promise.all(suppliers.map(async name=>{
                const sid=supplierIdMap[name];
                if(!sid)return;
                const matData=await api.getMaterials(sid);
                materialsBySupplier[name]=(matData.materials||[]).map(m=>({
                    id:m.id,
                    name:m.name,
                    sku:m.sku||'',
                    unit:m.unit||'each',
                    pricePerUnit:m.price_per_unit||0,
                    category:categoryIdMap ? Object.entries(categoryIdMap).find(([n,id])=>id===m.category_id)?.[0]||'Lath' : 'Lath',
                    coveragePerUnit:m.coverage_per_unit||100,
                    calcType:m.calc_type==='linear_ft'?'linear':(m.calc_type||'area'),
                    isPaint:name==='Sherwin Williams'&&(m.name||'').match(/paint|primer|latex/i)?true:false,
                    lastUpdated:m.updated_at?new Date(m.updated_at).getTime():Date.now(),
                    previousPrice:null
                }));
            }));

            // Load jobs
            savedJobs=(jobData.jobs||[]).map(j=>({
                id:j.id,
                name:j.name,
                isTemplate:false,
                projectName:j.project_name||'',
                projectAddress:j.project_address||'',
                supplier:suppliers.find(s=>supplierIdMap[s]===j.supplier_id)||suppliers[0],
                sqft:j.sqft||0,
                linearFt:j.linear_ft||0,
                waste:j.waste_pct||10,
                profitPct:j.profit_pct||20,
                taxPct:j.tax_pct||0,
                laborRate:j.labor_rate||0,
                selectedPhases:j.selected_phases?JSON.parse(j.selected_phases):categories,
                materialTotal:j.material_total||0,
                sellingPrice:j.selling_price||0,
                savedAt:j.created_at||new Date().toISOString()
            }));

            // Cache locally as fallback
            localStorage.setItem('stucco_suppliers',JSON.stringify(suppliers));
            localStorage.setItem('stucco_categories',JSON.stringify(categories));
            localStorage.setItem('stucco_materials_v2',JSON.stringify(materialsBySupplier));
            localStorage.setItem('stucco_saved_jobs',JSON.stringify(savedJobs));

            if(suppliers.length>0)activeSupplier=suppliers[0];
            return;
        }catch(err){
            console.warn('API load failed, using localStorage cache:',err.message);
        }
    }

    // Fallback: load from localStorage
    try{
        const s=localStorage.getItem('stucco_suppliers'),c=localStorage.getItem('stucco_categories'),m=localStorage.getItem('stucco_materials_v2'),j=localStorage.getItem('stucco_saved_jobs');
        if(s&&c&&m){suppliers=JSON.parse(s);categories=JSON.parse(c);materialsBySupplier=JSON.parse(m);Object.values(materialsBySupplier).forEach(ms=>ms.forEach(mt=>{if(!mt.calcType)mt.calcType='area';if(!mt.lastUpdated)mt.lastUpdated=Date.now()}))}else resetAllToDefaults(true);
        if(j)savedJobs=JSON.parse(j);
    }catch{resetAllToDefaults(true)}
    if(suppliers.length>0)activeSupplier=suppliers[0];
}

function saveAll(){
    // Always save to localStorage as cache
    localStorage.setItem('stucco_suppliers',JSON.stringify(suppliers));
    localStorage.setItem('stucco_categories',JSON.stringify(categories));
    localStorage.setItem('stucco_materials_v2',JSON.stringify(materialsBySupplier));
}
function saveSavedJobs(){localStorage.setItem('stucco_saved_jobs',JSON.stringify(savedJobs))}

function resetAllToDefaults(silent){
    localStorage.removeItem('stucco_suppliers');localStorage.removeItem('stucco_categories');localStorage.removeItem('stucco_materials_v2');localStorage.removeItem('stucco_materials_by_supplier');
    suppliers=[...DEFAULT_SUPPLIERS];categories=[...DEFAULT_CATEGORIES];materialsBySupplier={};const now=Date.now();
    suppliers.forEach(sup=>{const mod=SUPPLIER_PRICE_MODS[sup]||1;const tmpl=SUPPLIER_MATERIALS[sup]||[...STUCCO_LATH,...STUCCO_GRAY,...STUCCO_COLOR];
        materialsBySupplier[sup]=tmpl.map((m,i)=>({...m,id:`${sup.replace(/\s+/g,'-').toLowerCase()}-${i}-${now}`,pricePerUnit:Math.round(m.pricePerUnit*mod*100)/100,lastUpdated:now}))});
    activeSupplier=suppliers[0];saveAll();if(!silent)notify('Reset to defaults','info');
}

// Undo/Redo
function pushUndo(){undoStack.push(JSON.stringify(materialsBySupplier));if(undoStack.length>MAX_UNDO)undoStack.shift();redoStack=[];updateUndoButtons()}
function undo(){if(!undoStack.length)return;redoStack.push(JSON.stringify(materialsBySupplier));materialsBySupplier=JSON.parse(undoStack.pop());saveAll();renderMaterialTable();updateUndoButtons();notify('Undone','info')}
function redo(){if(!redoStack.length)return;undoStack.push(JSON.stringify(materialsBySupplier));materialsBySupplier=JSON.parse(redoStack.pop());saveAll();renderMaterialTable();updateUndoButtons();notify('Redone','info')}
function updateUndoButtons(){const u=document.getElementById('undoBtn'),r=document.getElementById('redoBtn');if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length}

// License check
function isLicensed(){
    if(!currentUser)return false;
    if(currentUser.role==='admin')return true;
    if(!currentUser.license_key)return false;
    if(currentUser.license_expires&&new Date(currentUser.license_expires)<new Date())return false;
    return true;
}
function requireLicense(action){
    if(isLicensed())return true;
    notify('Upgrade your license to '+action,'error');
    return false;
}
const FREE_JOB_LIMIT=3;
function togglePrintWatermark(show){const el=document.getElementById('printWatermark');if(el)el.classList.toggle('active',show)}
function printBid(){const showWM=!isLicensed();togglePrintWatermark(showWM);setTimeout(()=>{window.print();togglePrintWatermark(false)},100)}

// Utils
function genId(){return'mat-'+Date.now()+'-'+Math.random().toString(36).substring(2,7)}
function fmt(n){return'$'+Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
function escHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function escAttr(s){return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/\\/g,'\\\\')}
function notify(msg,type){const el=document.getElementById('notification');el.textContent=msg;el.className='notification '+(type||'info');setTimeout(()=>el.classList.add('show'),10);setTimeout(()=>el.classList.remove('show'),3000)}
function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
function toggleTheme(){const c=document.documentElement.getAttribute('data-theme');const n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('stucco_theme',n)}

// ===== NAVIGATION =====
const PAGE_TITLES={dashboard:'Dashboard',pricing:'Material Pricing',calculator:'Job Calculator',order:'Order Form',bid:'Bid Summary',savedJobs:'Saved Jobs',admin:'Admin Panel',account:'Account'};
const PAGES_WITH_BACK=['pricing','calculator','order','bid','savedJobs','admin','account'];
let currentPageId='dashboard';

// Mobile menu
function toggleMobileMenu(){document.getElementById('topnavLinks').classList.toggle('open');document.getElementById('mobileOverlay').classList.toggle('open')}
function closeMobileMenu(){document.getElementById('topnavLinks').classList.remove('open');document.getElementById('mobileOverlay').classList.remove('open')}

function showPage(id){
    currentPageId=id;
    localStorage.setItem('esticount_page',id);
    document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(el=>el.classList.remove('active'));
    document.getElementById(id+'Page').classList.add('active');
    const link=document.querySelector(`.nav-link[data-page="${id}"]`);if(link)link.classList.add('active');
    // Page header with back
    const hdr=document.getElementById('pageHeader');
    if(PAGES_WITH_BACK.includes(id)){hdr.style.display='';document.getElementById('pageTitle').textContent=PAGE_TITLES[id]||id}else{hdr.style.display='none'}
    // Track history
    if(pageHistory[pageHistory.length-1]!==id)pageHistory.push(id);
    // Init page
    if(id==='dashboard')renderDashboard();
    if(id==='pricing'){renderSupplierTabs();populateCategoryFilter();renderMaterialTable();trackRecentMaterials()}
    if(id==='calculator'){populateCalcSupplierDropdown();renderPhaseCheckboxes()}
    if(id==='savedJobs')renderSavedJobs();
    if(id==='admin')renderAdminPanel();
    if(id==='account')renderAccountPage();
}
function goBack(){pageHistory.pop();const prev=pageHistory[pageHistory.length-1]||'dashboard';showPage(prev)}

// ===== SUPPLIERS =====
function renderSupplierTabs(){
    document.getElementById('supplierTabs').innerHTML=suppliers.map(s=>`<button class="supplier-pill${s===activeSupplier?' active':''}" onclick="switchSupplier('${escAttr(s)}')" oncontextmenu="event.preventDefault();confirmDeleteSupplier('${escAttr(s)}')">${escHtml(s)}</button>`).join('')+`<button class="supplier-pill add" onclick="openAddSupplierModal()">+ Supplier</button>`;
}
function switchSupplier(name){activeSupplier=name;editingId=null;renderSupplierTabs();populateCategoryFilter();renderMaterialTable()}
function openAddSupplierModal(){document.getElementById('newSupplierName').value='';openModal('addSupplierModal')}
async function addSupplier(){const name=document.getElementById('newSupplierName').value.trim();if(!name){notify('Enter name','error');return}if(suppliers.includes(name)){notify('Already exists','error');return}pushUndo();suppliers.push(name);materialsBySupplier[name]=[];activeSupplier=name;
    if(api.getToken()){try{const r=await api.createSupplier(name);if(r.supplier&&window._supplierIdMap)window._supplierIdMap[name]=r.supplier.id}catch(e){console.warn('API:',e.message)}}
    saveAll();renderSupplierTabs();renderMaterialTable();populateCategoryFilter();closeModal('addSupplierModal');notify(`"${name}" added`,'success')}
function confirmDeleteSupplier(name){if(suppliers.length<=1){notify('Need at least one','error');return}document.getElementById('deleteSupplierName').textContent=name;document.getElementById('deleteSupplierModal').dataset.supplier=name;openModal('deleteSupplierModal')}
async function deleteSupplier(){pushUndo();const name=document.getElementById('deleteSupplierModal').dataset.supplier;
    if(api.getToken()&&window._supplierIdMap?.[name]){try{await api.deleteSupplier(window._supplierIdMap[name]);delete window._supplierIdMap[name]}catch(e){console.warn('API:',e.message)}}
    suppliers=suppliers.filter(s=>s!==name);delete materialsBySupplier[name];if(activeSupplier===name)activeSupplier=suppliers[0];saveAll();renderSupplierTabs();renderMaterialTable();closeModal('deleteSupplierModal');notify(`"${name}" removed`,'success')}

// ===== CATEGORIES =====
function getSupplierPhases(supplier){const mats=materialsBySupplier[supplier]||[];return[...new Set(mats.map(m=>m.category))].sort((a,b)=>categories.indexOf(a)-categories.indexOf(b))}
function populateCategoryFilter(){const sel=document.getElementById('categoryFilter');const v=sel.value;const sp=getSupplierPhases(activeSupplier);sel.innerHTML='<option value="All">All Phases</option>'+sp.map(c=>`<option>${c}</option>`).join('');if(sp.includes(v)||v==='All')sel.value=v;else sel.value='All'}
async function addCategory(){const name=document.getElementById('newCategoryName').value.trim();if(!name){notify('Enter name','error');return}if(categories.includes(name)){notify('Exists','error');return}categories.push(name);
    if(api.getToken()){try{const r=await api.createCategory(name);if(r.category&&window._categoryIdMap)window._categoryIdMap[name]=r.category.id}catch(e){console.warn('API:',e.message)}}
    saveAll();populateCategoryFilter();populateOrderPhaseFilter();closeModal('addCategoryModal');notify(`Phase "${name}" added`,'success')}
function openDeleteCategoryModal(){const sp=getSupplierPhases(activeSupplier);document.getElementById('deleteCategorySelect').innerHTML=sp.map(c=>`<option>${c}</option>`).join('');if(!sp.length){notify('No phases','error');return}openModal('deleteCategoryModal')}
async function deleteCategory(){
    pushUndo();const name=document.getElementById('deleteCategorySelect').value;const scope=document.getElementById('deleteCategoryScope').value;
    if(scope==='supplier'){
        // Delete materials in this phase from current supplier via API
        if(api.getToken()){const mats=materialsBySupplier[activeSupplier]||[];for(const m of mats.filter(m=>m.category===name)){try{await api.deleteMaterial(m.id)}catch(e){}}}
        materialsBySupplier[activeSupplier]=(materialsBySupplier[activeSupplier]||[]).filter(m=>m.category!==name);
        saveAll();populateCategoryFilter();renderMaterialTable();closeModal('deleteCategoryModal');notify(`"${name}" removed from ${activeSupplier}`,'success');
    }else{
        // Delete category globally via API
        if(api.getToken()&&window._categoryIdMap?.[name]){try{await api.deleteCategory(window._categoryIdMap[name]);delete window._categoryIdMap[name]}catch(e){console.warn('API:',e.message)}}
        categories=categories.filter(c=>c!==name);
        suppliers.forEach(s=>{materialsBySupplier[s]=(materialsBySupplier[s]||[]).filter(m=>m.category!==name)});
        saveAll();populateCategoryFilter();populateOrderPhaseFilter();renderMaterialTable();closeModal('deleteCategoryModal');notify(`Phase "${name}" deleted`,'success');
    }
}

// ===== MATERIAL TABLE with scope grouping =====
function isStale(mat){if(!mat.lastUpdated)return true;return(Date.now()-mat.lastUpdated)>30*24*60*60*1000}

function getScopeForPhase(phase){for(const[scope,phases]of Object.entries(SCOPE_GROUPS)){if(phases.includes(phase))return scope}return phase}

function renderMaterialTable(){
    const filter=document.getElementById('categoryFilter').value;
    const search=(document.getElementById('materialSearch').value||'').toLowerCase();
    let mats=materialsBySupplier[activeSupplier]||[];
    if(filter!=='All')mats=mats.filter(m=>m.category===filter);
    if(search)mats=mats.filter(m=>m.name.toLowerCase().includes(search)||m.sku.toLowerCase().includes(search));
    const container=document.getElementById('scopeGroups');

    if(!mats.length){container.innerHTML='<div class="empty-state"><p>No materials found.</p></div>';updateStatsBar();return}

    // Group by scope then phase
    const scopeMap={};
    mats.forEach(m=>{
        const scope=getScopeForPhase(m.category);
        if(!scopeMap[scope])scopeMap[scope]={};
        if(!scopeMap[scope][m.category])scopeMap[scope][m.category]=[];
        scopeMap[scope][m.category].push(m);
    });

    let html='';
    Object.entries(scopeMap).forEach(([scope,phases])=>{
        html+=`<div class="scope-group"><div class="scope-group-header" onclick="this.classList.toggle('collapsed');this.nextElementSibling.classList.toggle('collapsed')"><h3>${escHtml(scope)}<span style="font-weight:400;font-size:.8rem;color:var(--text3);margin-left:8px">${Object.values(phases).flat().length} items</span></h3><span class="arrow">&#9660;</span></div><div class="scope-group-body">`;
        html+=`<div class="table-wrap"><table><thead><tr><th style="width:28px"></th><th>Name</th><th>SKU</th><th>Unit</th><th class="text-right">Price</th><th>Phase</th><th>Type</th><th class="text-right">Coverage</th><th class="text-center">Actions</th></tr></thead><tbody>`;

        Object.entries(phases).forEach(([cat,items])=>{
            const ci=categories.indexOf(cat)%8;
            html+=`<tr class="phase-header"><td colspan="9" class="pc${ci}">${escHtml(cat)}</td></tr>`;
            items.forEach(m=>{
                if(editingId===m.id){
                    html+=`<tr><td></td><td><input class="inline-input" id="edit-name" value="${escAttr(m.name)}"><input class="inline-input" id="edit-notes" value="${escAttr(m.notes||'')}" placeholder="Notes..." style="margin-top:4px;font-size:.78rem;color:var(--text3)"></td><td><input class="inline-input" id="edit-sku" value="${escAttr(m.sku)}" style="width:100px"></td><td><select class="inline-select" id="edit-unit">${UNITS.map(u=>`<option${u===m.unit?' selected':''}>${u}</option>`).join('')}</select></td><td><input class="inline-input" id="edit-price" type="number" step="0.01" min="0" value="${m.pricePerUnit}" style="text-align:right;width:80px"></td><td><select class="inline-select" id="edit-category">${categories.map(cc=>`<option${cc===m.category?' selected':''}>${cc}</option>`).join('')}</select></td><td><select class="inline-select" id="edit-calcType">${CALC_TYPES.map(t=>`<option${t===m.calcType?' selected':''}>${t}</option>`).join('')}</select></td><td><input class="inline-input" id="edit-coverage" type="number" step="0.1" min="0.1" value="${m.coveragePerUnit}" style="text-align:right;width:74px"></td><td class="text-center" style="white-space:nowrap"><button class="btn btn-success btn-sm" onclick="saveMaterialEdit('${m.id}')">Save</button> <button class="btn btn-secondary btn-sm" onclick="cancelEdit()">Cancel</button></td></tr>`;
                }else{
                    const stale=isStale(m);const covLabel=m.calcType==='linear'?'lf':'sqft';
                    const priceHist=m.previousPrice!=null?(m.previousPrice<m.pricePerUnit?'<span class="price-up">&uarr;</span>':'<span class="price-down">&darr;</span>'):'';
                    html+=`<tr draggable="true" data-id="${m.id}" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondragleave="dragLeave(event)" ondrop="dropRow(event)"><td style="cursor:grab;color:var(--text3)">&#9776;</td><td>${escHtml(m.name)}${stale?'<span class="badge-stale">stale</span>':''}${m.notes?`<div style="font-size:.75rem;color:var(--text3);margin-top:2px">${escHtml(m.notes)}</div>`:''}</td><td class="mono" style="color:var(--text3);font-size:.8rem">${escHtml(m.sku)}</td><td>${m.unit}</td><td class="text-right mono">${fmt(m.pricePerUnit)}${priceHist}</td><td><span class="badge pb${ci} pc${ci}">${m.category}</span></td><td><span class="badge-type">${m.calcType}</span></td><td class="text-right mono">${m.coveragePerUnit} ${covLabel}</td><td class="text-center" style="white-space:nowrap"><button class="btn-icon" onclick="editMaterial('${m.id}')" title="Edit">&#9998;</button><button class="btn-icon" onclick="openDuplicate('${m.id}')" title="Copy">&#10697;</button><button class="btn-icon danger" onclick="deleteMaterial('${m.id}')" title="Delete">&#10005;</button></td></tr>`;
                }
            });
        });
        html+=`</tbody></table></div></div></div>`;
    });
    container.innerHTML=html;
    updateStatsBar();
}

function updateStatsBar(){const mats=materialsBySupplier[activeSupplier]||[];const phases=getSupplierPhases(activeSupplier);const staleCount=mats.filter(isStale).length;document.getElementById('statsBar').innerHTML=`<div class="stat-item"><span class="stat-number">${mats.length}</span><span class="stat-label">Materials</span></div><div class="stat-item"><span class="stat-number">${phases.length}</span><span class="stat-label">Phases</span></div><div class="stat-item"><span class="stat-number">${suppliers.length}</span><span class="stat-label">Suppliers</span></div>${staleCount?`<div class="stat-item"><span class="stat-number" style="color:var(--err)">${staleCount}</span><span class="stat-label">Stale</span></div>`:''}`}

function editMaterial(id){editingId=id;renderMaterialTable()}
function cancelEdit(){editingId=null;renderMaterialTable()}
async function saveMaterialEdit(id){const mats=materialsBySupplier[activeSupplier]||[];const mat=mats.find(m=>m.id===id);if(!mat)return;const name=document.getElementById('edit-name').value.trim();const price=parseFloat(document.getElementById('edit-price').value);const coverage=parseFloat(document.getElementById('edit-coverage').value);if(!name){notify('Name required','error');return}if(isNaN(price)||price<0){notify('Invalid price','error');return}if(isNaN(coverage)||coverage<=0){notify('Coverage > 0','error');return}pushUndo();if(mat.pricePerUnit!==price)mat.previousPrice=mat.pricePerUnit;
    const newCat=document.getElementById('edit-category').value;const newCalcType=document.getElementById('edit-calcType').value;
    const notes=(document.getElementById('edit-notes')?.value||'').trim();
    mat.name=name;mat.sku=document.getElementById('edit-sku').value.trim();mat.unit=document.getElementById('edit-unit').value;mat.pricePerUnit=price;mat.category=newCat;mat.calcType=newCalcType;mat.coveragePerUnit=coverage;mat.notes=notes;mat.lastUpdated=Date.now();
    if(api.getToken()){try{await api.updateMaterial(id,{name:mat.name,sku:mat.sku,unit:mat.unit,price_per_unit:price,category_id:window._categoryIdMap?.[newCat],coverage_per_unit:coverage,calc_type:newCalcType==='linear'?'linear_ft':'sqft',notes})}catch(e){console.warn('API:',e.message)}}
    addToRecent(id,mat.name,activeSupplier);
    editingId=null;saveAll();renderMaterialTable();notify('Updated','success')}
async function addMaterial(){pushUndo();const mats=materialsBySupplier[activeSupplier]||[];
    const catName=categories[0]||'Lath';
    let newId=genId();
    if(api.getToken()&&window._supplierIdMap?.[activeSupplier]){
        try{const r=await api.createMaterial(window._supplierIdMap[activeSupplier],{name:'New Material',sku:'',unit:'each',price_per_unit:0,category_id:window._categoryIdMap?.[catName],coverage_per_unit:100,calc_type:'sqft'});if(r.material)newId=r.material.id}catch(e){console.warn('API:',e.message)}
    }
    const m={id:newId,name:'New Material',sku:'',unit:'each',pricePerUnit:0,category:catName,coveragePerUnit:100,calcType:'area',lastUpdated:Date.now()};
    mats.push(m);materialsBySupplier[activeSupplier]=mats;saveAll();editingId=m.id;document.getElementById('categoryFilter').value='All';document.getElementById('materialSearch').value='';renderMaterialTable()}
async function deleteMaterial(id){const mats=materialsBySupplier[activeSupplier]||[];const mat=mats.find(m=>m.id===id);if(!mat||!confirm(`Delete "${mat.name}"?`))return;pushUndo();
    if(api.getToken()){try{await api.deleteMaterial(id)}catch(e){console.warn('API:',e.message)}}
    materialsBySupplier[activeSupplier]=mats.filter(m=>m.id!==id);saveAll();renderMaterialTable();notify('Deleted','success')}
function resetToDefaults(){if(!confirm('Reset ALL data to defaults?'))return;pushUndo();resetAllToDefaults(false);editingId=null;renderSupplierTabs();populateCategoryFilter();renderMaterialTable();populateOrderPhaseFilter()}

// Duplicate
let duplicateMatId=null;
function openDuplicate(id){duplicateMatId=id;const sel=document.getElementById('duplicateTarget');sel.innerHTML=suppliers.filter(s=>s!==activeSupplier).map(s=>`<option>${s}</option>`).join('');if(!sel.innerHTML){notify('No other suppliers','error');return}openModal('duplicateModal')}
async function doDuplicate(){const target=document.getElementById('duplicateTarget').value;const src=(materialsBySupplier[activeSupplier]||[]).find(m=>m.id===duplicateMatId);if(!src||!target)return;pushUndo();
    let newId=genId();
    if(api.getToken()){try{const r=await api.createMaterial(window._supplierIdMap?.[target],{name:src.name,sku:src.sku,unit:src.unit,price_per_unit:src.pricePerUnit,category_id:window._categoryIdMap?.[src.category],coverage_per_unit:src.coveragePerUnit,calc_type:src.calcType==='linear'?'linear_ft':'sqft'});if(r.material)newId=r.material.id}catch(e){console.warn('API:',e.message)}}
    if(!materialsBySupplier[target])materialsBySupplier[target]=[];materialsBySupplier[target].push({...src,id:newId});saveAll();closeModal('duplicateModal');notify(`Copied to ${target}`,'success')}

// Drag
function dragStart(e){dragSrcId=e.currentTarget.dataset.id;e.currentTarget.classList.add('dragging');e.dataTransfer.effectAllowed='move'}
function dragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';const row=e.currentTarget.closest('tr');if(row?.dataset.id)row.classList.add('drag-over')}
function dragLeave(e){e.currentTarget.closest('tr')?.classList.remove('drag-over')}
function dropRow(e){e.preventDefault();const tid=e.currentTarget.closest('tr')?.dataset.id;document.querySelectorAll('.drag-over,.dragging').forEach(el=>el.classList.remove('drag-over','dragging'));if(!dragSrcId||!tid||dragSrcId===tid)return;const mats=materialsBySupplier[activeSupplier]||[];const si=mats.findIndex(m=>m.id===dragSrcId),ti=mats.findIndex(m=>m.id===tid);if(si<0||ti<0)return;pushUndo();const[item]=mats.splice(si,1);mats.splice(ti,0,item);saveAll();renderMaterialTable()}

// CSV
function parseCSVLine(line){const r=[];let c='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(q){if(ch==='"'&&line[i+1]==='"'){c+='"';i++}else if(ch==='"')q=false;else c+=ch}else{if(ch==='"')q=true;else if(ch===','){r.push(c.trim());c=''}else c+=ch}}r.push(c.trim());return r}
function handleCSVImport(event){const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=function(e){const lines=e.target.result.split(/\r?\n/).filter(l=>l.trim());if(lines.length<2){notify('Empty CSV','error');return}const hdr=parseCSVLine(lines[0]).map(h=>h.toLowerCase().replace(/[^a-z]/g,''));const ni=hdr.findIndex(h=>h==='name'),si=hdr.findIndex(h=>h==='sku'),ui=hdr.findIndex(h=>h==='unit'),pi=hdr.findIndex(h=>h.includes('price')),ci=hdr.findIndex(h=>h.includes('category')||h.includes('phase')),cvi=hdr.findIndex(h=>h.includes('coverage')),ti=hdr.findIndex(h=>h.includes('type')||h.includes('calctype'));if(ni===-1){notify('Need "name" column','error');return}pushUndo();let imp=0,skip=0;const mats=materialsBySupplier[activeSupplier]||[];const now=Date.now();for(let i=1;i<lines.length;i++){const f=parseCSVLine(lines[i]);const name=f[ni]?.trim();if(!name){skip++;continue}const cat=f[ci]?.trim()||categories[0]||'Lath';if(!categories.includes(cat))categories.push(cat);const cov=parseFloat(f[cvi])||100;if(cov<=0){skip++;continue}const ct=f[ti]?.trim()||'area';mats.push({id:genId(),name,sku:f[si]?.trim()||'',unit:f[ui]?.trim()||'each',pricePerUnit:parseFloat(f[pi])||0,category:cat,coveragePerUnit:cov,calcType:CALC_TYPES.includes(ct)?ct:'area',lastUpdated:now});imp++}materialsBySupplier[activeSupplier]=mats;saveAll();populateCategoryFilter();renderMaterialTable();notify(`${imp} imported`+(skip?`, ${skip} skipped`:''),imp>0?'success':'error')};reader.readAsText(file);event.target.value=''}
function exportCSV(){if(!requireLicense('export CSV'))return;const mats=materialsBySupplier[activeSupplier]||[];const hdr='name,sku,unit,pricePerUnit,category,coveragePerUnit,calcType';const rows=mats.map(m=>`"${m.name.replace(/"/g,'""')}","${m.sku}","${m.unit}",${m.pricePerUnit},"${m.category}",${m.coveragePerUnit},${m.calcType}`);const blob=new Blob([[hdr,...rows].join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`materials-${activeSupplier.replace(/\s+/g,'-').toLowerCase()}.csv`;a.click();URL.revokeObjectURL(a.href);notify('Exported','success')}

// ===== CALCULATOR =====
function populateCalcSupplierDropdown(){const sel=document.getElementById('calcSupplier');const p=sel.value;sel.innerHTML='<option>All Suppliers</option>'+suppliers.map(s=>`<option>${s}</option>`).join('');if(suppliers.includes(p)||p==='All Suppliers')sel.value=p}
function getSelectedPhases(){const boxes=document.querySelectorAll('#phaseCheckboxes input[type="checkbox"]');const sel=[];boxes.forEach(cb=>{if(cb.checked)sel.push(cb.value)});return sel.length>0?sel:categories}

function renderPhaseCheckboxes(){
    const wrap=document.getElementById('phaseCheckboxes');const supplier=document.getElementById('calcSupplier').value;
    // Get phases from ALL suppliers if "All Suppliers"
    let sp;
    if(supplier==='All Suppliers'){sp=[...new Set(Object.values(materialsBySupplier).flat().map(m=>m.category))]}
    else{sp=[...new Set((materialsBySupplier[supplier]||[]).map(m=>m.category))]}

    // Group by scope
    const scoped={};sp.forEach(cat=>{const scope=getScopeForPhase(cat);if(!scoped[scope])scoped[scope]=[];scoped[scope].push(cat)});

    let html='';
    Object.entries(scoped).forEach(([scope,phases])=>{
        phases.forEach((cat,i)=>{
            const ci=categories.indexOf(cat)%8;
            const colors=['#d29922','#8b949e','#a371f7','#f778ba','#3fb950','#db6d28','#39d2c0','#7ee787'];
            html+=`<label class="phase-chip checked" onclick="setTimeout(()=>{this.classList.toggle('checked',this.querySelector('input').checked);updatePhaseOptions()},0)"><input type="checkbox" value="${escAttr(cat)}" checked><span class="dot" style="background:${colors[ci]}"></span>${escHtml(cat)}</label>`;
        });
    });
    wrap.innerHTML=html;
    updatePhaseOptions();
}

function toggleCheckStyle(label){label.classList.toggle('checked',label.querySelector('input').checked);updatePhaseOptions()}

function updatePhaseOptions(){
    const checked=document.querySelectorAll('#phaseCheckboxes input[type="checkbox"]:checked');
    const selected=[...checked].map(cb=>cb.value);
    // If nothing checked, phase options hidden
    if(selected.length===0){document.getElementById('phaseOptions').classList.add('hidden');return}
    const hasLinear=selected.some(p=>['Lath','Stone'].includes(p));
    const hasPaint=selected.includes('Painting');
    const hasDrywall=selected.includes('Drywall');
    const showAny=hasLinear||hasPaint||hasDrywall;
    document.getElementById('phaseOptions').classList.toggle('hidden',!showAny);
    document.getElementById('optLinearFt').style.display=hasLinear?'':'none';
    document.getElementById('optPaintCoats').style.display=hasPaint?'':'none';
    document.getElementById('optDrywallSize').style.display=hasDrywall?'':'none';
}

function applyStateTax(){
    const sel=document.getElementById('calcTaxState');const val=sel.value;const ci=document.getElementById('calcTax');
    if(val==='custom'){ci.style.display='block';ci.focus();return}
    if(val.startsWith('fav:')){ci.style.display='none';ci.value=val.split(':')[1];return}
    ci.style.display='none';ci.value=val;
}

function getTaxFavorites(){try{return JSON.parse(localStorage.getItem('stucco_tax_favs'))||[]}catch{return[]}}
function saveTaxFavorite(state,rate){
    const favs=getTaxFavorites();
    if(favs.find(f=>f.state===state))return;
    favs.push({state,rate});
    localStorage.setItem('stucco_tax_favs',JSON.stringify(favs));
    rebuildTaxDropdown();
    notify(`${state} added to favorites`,'success');
}
function removeTaxFavorite(state){
    let favs=getTaxFavorites();
    favs=favs.filter(f=>f.state!==state);
    localStorage.setItem('stucco_tax_favs',JSON.stringify(favs));
    rebuildTaxDropdown();
}
function addCurrentTaxToFavorites(){
    const sel=document.getElementById('calcTaxState');
    const opt=sel.options[sel.selectedIndex];
    if(!opt||opt.value==='0'||opt.value==='custom'||opt.value.startsWith('fav:')){notify('Select a state first','error');return}
    saveTaxFavorite(opt.text.split(' - ')[0],opt.value);
}
function rebuildTaxDropdown(){
    const sel=document.getElementById('calcTaxState');const prev=sel.value;
    const favs=getTaxFavorites();
    let html='<option value="0">No Tax</option>';
    if(favs.length){
        html+='<optgroup label="★ Favorites">';
        favs.forEach(f=>{html+=`<option value="fav:${f.rate}">${f.state} - ${f.rate}%</option>`});
        html+='</optgroup>';
    }
    html+=`<optgroup label="All States">
        <option value="4">AL - 4%</option><option value="0">AK - 0%</option><option value="5.6">AZ - 5.6%</option><option value="6.5">AR - 6.5%</option><option value="7.25">CA - 7.25%</option><option value="2.9">CO - 2.9%</option><option value="6.35">CT - 6.35%</option><option value="0">DE - 0%</option><option value="6">FL - 6%</option><option value="4">GA - 4%</option><option value="4">HI - 4%</option><option value="6">ID - 6%</option><option value="6.25">IL - 6.25%</option><option value="7">IN - 7%</option><option value="6">IA - 6%</option><option value="6.5">KS - 6.5%</option><option value="6">KY - 6%</option><option value="4.45">LA - 4.45%</option><option value="5.5">ME - 5.5%</option><option value="6">MD - 6%</option><option value="6.25">MA - 6.25%</option><option value="6">MI - 6%</option><option value="6.875">MN - 6.875%</option><option value="7">MS - 7%</option><option value="4.225">MO - 4.225%</option><option value="0">MT - 0%</option><option value="5.5">NE - 5.5%</option><option value="6.85">NV - 6.85%</option><option value="0">NH - 0%</option><option value="6.625">NJ - 6.625%</option><option value="5.125">NM - 5.125%</option><option value="4">NY - 4%</option><option value="4.75">NC - 4.75%</option><option value="5">ND - 5%</option><option value="5.75">OH - 5.75%</option><option value="4.5">OK - 4.5%</option><option value="0">OR - 0%</option><option value="6">PA - 6%</option><option value="7">RI - 7%</option><option value="6">SC - 6%</option><option value="4.5">SD - 4.5%</option><option value="7">TN - 7%</option><option value="6.25">TX - 6.25%</option><option value="6.1">UT - 6.1%</option><option value="6">VT - 6%</option><option value="5.3">VA - 5.3%</option><option value="6.5">WA - 6.5%</option><option value="6">WV - 6%</option><option value="5">WI - 5%</option><option value="4">WY - 4%</option>
    </optgroup><option value="custom">Custom...</option>`;
    sel.innerHTML=html;
    if(prev)sel.value=prev;
}

function calcForSupplier(supplier,sqft,linearFt,waste,selectedPhases,opts={}){
    const adjSqft=sqft*(1+waste/100),adjLinear=linearFt*(1+waste/100);const paintCoats=opts.paintCoats||1;
    let mats=materialsBySupplier[supplier]||[];if(selectedPhases?.length>0)mats=mats.filter(m=>selectedPhases.includes(m.category));
    const phases={};categories.forEach(c=>phases[c]={total:0,count:0});let materialTotal=0;
    const items=mats.map(m=>{const base=m.calcType==='linear'?adjLinear:adjSqft;let qty=base>0?Math.ceil(base/m.coveragePerUnit):0;if(m.isPaint&&paintCoats>1)qty=qty*paintCoats;const lineTotal=qty*m.pricePerUnit;if(phases[m.category]){phases[m.category].total+=lineTotal;phases[m.category].count++}materialTotal+=lineTotal;return{id:m.id,name:m.name,sku:m.sku,unit:m.unit,pricePerUnit:m.pricePerUnit,category:m.category,coveragePerUnit:m.coveragePerUnit,calcType:m.calcType,isPaint:m.isPaint,qty,lineTotal}});
    return{supplier,phases,items,materialTotal};
}

function calculateJob(){
    const sqft=parseFloat(document.getElementById('calcSqft').value)||0;
    const linearFt=parseFloat(document.getElementById('calcLinearFt')?.value)||0;
    const waste=parseFloat(document.getElementById('calcWaste').value)||0;
    const profitPct=parseFloat(document.getElementById('calcProfit').value)||0;
    const taxPct=parseFloat(document.getElementById('calcTax').value)||parseFloat(document.getElementById('calcTaxState').value)||0;
    const laborRate=parseFloat(document.getElementById('calcLabor').value)||0;
    const deliveryFee=parseFloat(document.getElementById('calcDelivery').value)||0;
    const ccFeeEnabled=document.getElementById('calcCCFeeToggle').checked;
    const ccFeePct=ccFeeEnabled?(parseFloat(document.getElementById('calcCCFee').value)||0):0;
    const paintCoatsRaw=parseInt(document.getElementById('calcPaintCoats')?.value);
    const paintCoats=paintCoatsRaw>0?paintCoatsRaw:1;
    const supplier=document.getElementById('calcSupplier').value;

    if(sqft<=0&&linearFt<=0){notify('Enter sqft or linear ft','error');return}

    const selectedPhases=getSelectedPhases();
    const isAll=supplier==='All Suppliers';

    let r;
    if(isAll){
        // COMPOSITE: pick the cheapest supplier FOR EACH PHASE separately
        // then combine all the best items into one result
        const phases={};categories.forEach(c=>phases[c]={total:0,count:0});
        let allItems=[];let materialTotal=0;
        const bestPerPhase={};

        selectedPhases.forEach(phase=>{
            let bestSupplier=null,bestTotal=Infinity,bestItems=[];
            suppliers.forEach(s=>{
                const sp=getSupplierPhases(s);
                if(!sp.includes(phase))return; // supplier doesn't carry this phase
                const result=calcForSupplier(s,sqft,linearFt,waste,[phase],{paintCoats});
                if(result.materialTotal>0&&result.materialTotal<bestTotal){
                    bestTotal=result.materialTotal;bestSupplier=s;bestItems=result.items;
                }
            });
            if(bestSupplier){
                bestPerPhase[phase]=bestSupplier;
                bestItems.forEach(item=>{allItems.push(item)});
                phases[phase]={total:bestTotal,count:bestItems.length};
                materialTotal+=bestTotal;
            }
        });

        // Build composite supplier label
        const uniqueSuppliers=[...new Set(Object.values(bestPerPhase))];
        const supplierLabel=uniqueSuppliers.length===1?uniqueSuppliers[0]:'Best per phase';

        r={supplier:supplierLabel,phases,items:allItems,materialTotal,sqft,linearFt,waste,profitPct,taxPct,laborRate,deliveryFee,ccFeePct,paintCoats,selectedPhases,bestPerPhase};
    }else{
        const base=calcForSupplier(supplier,sqft,linearFt,waste,selectedPhases,{paintCoats});
        r={...base,sqft,linearFt,waste,profitPct,taxPct,laborRate,deliveryFee,ccFeePct,paintCoats,selectedPhases};
    }

    r.taxAmount=r.materialTotal*(taxPct/100);r.materialPlusTax=r.materialTotal+r.taxAmount;r.laborTotal=laborRate*sqft;r.deliveryTotal=deliveryFee;
    r.subtotalBeforeProfit=r.materialPlusTax+r.laborTotal+r.deliveryTotal;r.profitAmount=r.subtotalBeforeProfit*(profitPct/100);
    r.sellingBeforeCC=r.subtotalBeforeProfit+r.profitAmount;r.ccFeeAmount=r.sellingBeforeCC*(ccFeePct/100);r.sellingPrice=r.sellingBeforeCC+r.ccFeeAmount;
    r.grossMargin=r.sellingPrice>0?(r.profitAmount/r.sellingPrice*100):0;
    currentCalc=r;renderCalcResults(r);

    // Show comparison if All Suppliers
    if(isAll){renderComparison(sqft,linearFt,waste,selectedPhases,paintCoats)}else{document.getElementById('comparisonSection').innerHTML=''}
}

function renderCalcResults(r){
    document.getElementById('calcResults').classList.remove('hidden');
    const bpp=r.bestPerPhase||{}; // best supplier per phase (only set when All Suppliers)
    document.getElementById('phaseCards').innerHTML=categories.map((cat,i)=>{const p=r.phases[cat];if(!p||p.count===0)return'';const c=i%8;const sup=bpp[cat]?`<span style="font-size:.7rem;font-weight:400;color:var(--text3);display:block;margin-top:2px">via ${escHtml(bpp[cat])}</span>`:'';return`<div class="phase-card pb${c}"><h3>${escHtml(cat)}</h3><div class="amount pc${c}">${fmt(p.total)}</div><div class="items">${p.count} items${sup}</div></div>`}).join('');

    let bh='';categories.forEach((cat,ci)=>{const items=r.items.filter(i=>i.category===cat);if(!items.length)return;const c=ci%8;const supLabel=bpp[cat]?` <span style="font-size:.78rem;font-weight:400;color:var(--text3)">(${escHtml(bpp[cat])})</span>`:'';bh+=`<div style="margin-bottom:20px"><h3 class="section-title pc${c}">${escHtml(cat)} Phase${supLabel}</h3><div class="table-wrap"><table><thead><tr><th>Material</th><th>SKU</th><th>Type</th><th class="text-right">Coverage</th><th class="text-right">Qty</th><th>Unit</th><th class="text-right">Price</th><th class="text-right">Total</th></tr></thead><tbody>${items.map(i=>{const cl=i.calcType==='linear'?'lf':'sqft';return`<tr><td>${escHtml(i.name)}</td><td class="mono" style="font-size:.8rem;color:var(--text3)">${escHtml(i.sku)}</td><td><span class="badge-type">${i.calcType}</span></td><td class="text-right mono">${i.coveragePerUnit} ${cl}</td><td class="text-center"><input type="number" class="order-qty-input" value="${i.qty}" min="0" onchange="overrideCalcQty('${i.id}',this.value)"></td><td>${i.unit}</td><td class="text-right mono">${fmt(i.pricePerUnit)}</td><td class="text-right mono calc-line-total" data-id="${i.id}" style="font-weight:600">${fmt(i.lineTotal)}</td></tr>`}).join('')}<tr class="subtotal-row"><td colspan="7" class="text-right">${escHtml(cat)} Subtotal:</td><td class="text-right mono">${fmt(r.phases[cat].total)}</td></tr></tbody></table></div></div>`});
    document.getElementById('calcBreakdown').innerHTML=bh;

    let sqftLabel=[];if(r.sqft>0)sqftLabel.push(`${r.sqft.toLocaleString()} sqft`);if(r.linearFt>0)sqftLabel.push(`${r.linearFt.toLocaleString()} lf`);
    document.getElementById('calcGrandTotal').innerHTML=`<h3>Material Total (${sqftLabel.join(' + ')} + ${r.waste}% waste) — ${escHtml(r.supplier)}</h3><div class="amount">${fmt(r.materialTotal)}</div>`;

    let sg=`<div class="summary-card"><h4>Materials</h4><div class="val mono">${fmt(r.materialTotal)}</div></div>`;
    if(r.taxPct>0)sg+=`<div class="summary-card"><h4>Tax ${r.taxPct}%</h4><div class="val mono">${fmt(r.taxAmount)}</div></div>`;
    if(r.laborTotal>0)sg+=`<div class="summary-card"><h4>Labor</h4><div class="val mono">${fmt(r.laborTotal)}</div></div>`;
    if(r.deliveryTotal>0)sg+=`<div class="summary-card"><h4>Delivery</h4><div class="val mono">${fmt(r.deliveryTotal)}</div></div>`;
    sg+=`<div class="summary-card"><h4>Markup ${r.profitPct}%</h4><div class="val mono green">${fmt(r.profitAmount)}</div></div>`;
    if(r.ccFeePct>0)sg+=`<div class="summary-card"><h4>CC Fee ${r.ccFeePct}%</h4><div class="val mono">${fmt(r.ccFeeAmount)}</div></div>`;
    sg+=`<div class="summary-card"><h4>Sell Price</h4><div class="val mono blue">${fmt(r.sellingPrice)}</div></div><div class="summary-card"><h4>Margin</h4><div class="val mono green">${r.grossMargin.toFixed(1)}%</div></div>`;
    if(r.paintCoats>1)sg+=`<div class="summary-card"><h4>Paint Coats</h4><div class="val mono">${r.paintCoats}x</div></div>`;
    document.getElementById('summaryGrid').innerHTML=sg;
}

function renderComparison(sqft,linearFt,waste,selectedPhases,paintCoats){
    // Only include suppliers that actually carry at least one of the selected phases
    const relevantSuppliers=suppliers.filter(s=>{
        const sp=getSupplierPhases(s);
        return selectedPhases.some(p=>sp.includes(p));
    });

    if(relevantSuppliers.length<2){document.getElementById('comparisonSection').innerHTML='';return}

    const results=relevantSuppliers.map(s=>{const r=calcForSupplier(s,sqft,linearFt,waste,selectedPhases,{paintCoats});return{supplier:s,total:r.materialTotal,phases:r.phases}});
    // Only consider suppliers with >$0 for "best"
    const nonZero=results.filter(r=>r.total>0);
    const minTotal=nonZero.length?Math.min(...nonZero.map(r=>r.total)):0;
    const activePhases=selectedPhases.filter(p=>results.some(r=>r.phases[p]?.count>0));

    let html=`<div class="comparison-wrap"><h3>Supplier Comparison</h3>`;
    if(relevantSuppliers.length<suppliers.length){html+=`<p style="font-size:.82rem;color:var(--text3);margin-bottom:12px">Showing ${relevantSuppliers.length} of ${suppliers.length} suppliers that carry the selected phases</p>`}
    html+=`<div class="table-wrap"><table><thead><tr><th>Supplier</th>`;
    activePhases.forEach(c=>{html+=`<th class="text-right">${escHtml(c)}</th>`});
    html+=`<th class="text-right">Total</th><th class="text-right">Diff</th></tr></thead><tbody>`;
    results.forEach(r=>{const isBest=r.total===minTotal&&r.total>0;html+=`<tr${isBest?' class="best-price"':''}><td>${escHtml(r.supplier)}${isBest?' ★':''}</td>`;activePhases.forEach(c=>{const val=r.phases[c]?.total||0;html+=`<td class="text-right mono"${val===0?' style="color:var(--text3)"':''}>${val>0?fmt(val):'—'}</td>`});const diff=r.total-minTotal;html+=`<td class="text-right mono" style="font-weight:700">${fmt(r.total)}</td><td class="text-right mono" style="color:${diff===0?'var(--ok)':'var(--err)'}">${diff===0?'Best':'+'+fmt(diff)}</td></tr>`});
    html+='</tbody></table></div></div>';
    document.getElementById('comparisonSection').innerHTML=html;
}

// ===== ORDER =====
function populateOrderPhaseFilter(){const sel=document.getElementById('orderPhaseFilter');const v=sel.value;sel.innerHTML='<option value="All">All Phases</option>'+categories.map(c=>`<option>${c}</option>`).join('');if(categories.includes(v)||v==='All')sel.value=v}
function generateOrderForm(){if(!currentCalc){notify('Calculate first','error');return}document.getElementById('orderProjectName').value=document.getElementById('calcProjectName').value;document.getElementById('orderProjectAddress').value=document.getElementById('calcProjectAddress').value;document.getElementById('orderSupplier').value=currentCalc.supplier;document.getElementById('orderDate').value=new Date().toISOString().split('T')[0];populateOrderPhaseFilter();document.getElementById('orderPhaseFilter').value='All';document.getElementById('orderEmpty').style.display='none';document.getElementById('orderContent').classList.remove('hidden');renderOrderTable();showPage('order');notify('Order ready','success')}
function renderOrderTable(){if(!currentCalc)return;const pf=document.getElementById('orderPhaseFilter').value;const tbody=document.getElementById('orderTableBody');let html='',ft=0;categories.forEach((cat,ci)=>{if(pf!=='All'&&pf!==cat)return;const items=currentCalc.items.filter(i=>i.category===cat);if(!items.length)return;const c=ci%8;html+=`<tr class="phase-header"><td colspan="6" class="pc${c}">${escHtml(cat)}</td></tr>`;let pt=0;items.forEach(item=>{html+=`<tr data-id="${item.id}"><td class="mono" style="font-size:.8rem">${escHtml(item.sku)}</td><td>${escHtml(item.name)}</td><td class="text-center"><input type="number" class="order-qty-input" value="${item.qty}" min="0" onchange="updateOrderQty('${item.id}',this.value)"></td><td>${item.unit}</td><td class="text-right mono">${fmt(item.pricePerUnit)}</td><td class="text-right mono">${fmt(item.lineTotal)}</td></tr>`;pt+=item.lineTotal});html+=`<tr class="subtotal-row"><td colspan="5" class="text-right">${escHtml(cat)} Subtotal:</td><td class="text-right mono">${fmt(pt)}</td></tr>`;ft+=pt});if(currentCalc.taxPct>0){const tax=ft*(currentCalc.taxPct/100);html+=`<tr class="tax-row"><td colspan="5" class="text-right">Tax (${currentCalc.taxPct}%):</td><td class="text-right mono">${fmt(tax)}</td></tr>`;ft+=tax}html+=`<tr class="grand-total-row"><td colspan="5" class="text-right">${pf==='All'?'Grand':escHtml(pf)} Total:</td><td class="text-right mono">${fmt(ft)}</td></tr>`;tbody.innerHTML=html;const notes=document.getElementById('orderNotes').value.trim();const np=document.getElementById('orderNotesPrint');if(notes){np.innerHTML=`<h4>Notes:</h4>${escHtml(notes)}`;np.style.display='block'}else np.style.display='none'}
function updateOrderQty(id,val){const qty=Math.max(0,parseInt(val)||0);const item=currentCalc.items.find(i=>i.id===id);if(!item)return;item.qty=qty;item.lineTotal=qty*item.pricePerUnit;renderOrderTable()}
function printOrder(){const notes=document.getElementById('orderNotes').value.trim();const np=document.getElementById('orderNotesPrint');if(notes){np.innerHTML=`<h4>Notes:</h4>${escHtml(notes)}`;np.style.display='block'}else np.style.display='none';
    const showWM=!isLicensed();togglePrintWatermark(showWM);setTimeout(()=>{window.print();togglePrintWatermark(false)},100)}
function exportOrderCSV(){if(!requireLicense('export CSV'))return;if(!currentCalc)return;const pf=document.getElementById('orderPhaseFilter').value,pn=document.getElementById('orderProjectName').value,pa=document.getElementById('orderProjectAddress').value,sup=document.getElementById('orderSupplier').value,dt=document.getElementById('orderDate').value,po=document.getElementById('orderPO').value,notes=document.getElementById('orderNotes').value;let csv=`"Project","${pn}"\n"Address","${pa}"\n"Supplier","${sup}"\n"Date","${dt}"\n"PO#","${po}"\n`;if(notes)csv+=`"Notes","${notes.replace(/"/g,'""')}"\n`;csv+='\nSKU,Material,Phase,Qty,Unit,Unit Price,Line Total\n';let total=0;categories.forEach(cat=>{if(pf!=='All'&&pf!==cat)return;currentCalc.items.filter(i=>i.category===cat).forEach(item=>{csv+=`"${item.sku}","${item.name.replace(/"/g,'""')}","${item.category}",${item.qty},"${item.unit}",${item.pricePerUnit},${item.lineTotal}\n`;total+=item.lineTotal})});csv+=`,,,,,"Total",${total.toFixed(2)}\n`;const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`order-${(pn||'order').replace(/\s+/g,'-').toLowerCase()}-${dt||'draft'}.csv`;a.click();URL.revokeObjectURL(a.href);notify('Exported','success')}

// ===== BID SUMMARY =====
function generateBidSummary(){if(!currentCalc){notify('Calculate first','error');return}const r=currentCalc;const pn=document.getElementById('calcProjectName').value;const pa=document.getElementById('calcProjectAddress').value;let html=`<div class="bid-header"><img src="assets/logo.png" alt="EstiCount"><h2>${escHtml(pn)||'Project Estimate'}</h2><p>${escHtml(pa)||''}</p><p style="margin-top:6px;font-size:.82rem">${new Date().toLocaleDateString()}</p></div>`;categories.forEach(cat=>{const p=r.phases[cat];if(!p||p.count===0)return;html+=`<div class="bid-row"><span class="label">${escHtml(cat)}</span><span class="value">${fmt(p.total)}</span></div>`});html+=`<div class="bid-row"><span class="label">Material Subtotal</span><span class="value">${fmt(r.materialTotal)}</span></div>`;if(r.taxPct>0)html+=`<div class="bid-row"><span class="label">Sales Tax (${r.taxPct}%)</span><span class="value">${fmt(r.taxAmount)}</span></div>`;if(r.laborTotal>0)html+=`<div class="bid-row"><span class="label">Labor</span><span class="value">${fmt(r.laborTotal)}</span></div>`;if(r.deliveryTotal>0)html+=`<div class="bid-row"><span class="label">Delivery</span><span class="value">${fmt(r.deliveryTotal)}</span></div>`;if(r.ccFeePct>0)html+=`<div class="bid-row"><span class="label">CC Processing (${r.ccFeePct}%)</span><span class="value">${fmt(r.ccFeeAmount)}</span></div>`;html+=`<div class="bid-row total"><span class="label">Total Estimate</span><span class="value">${fmt(r.sellingPrice)}</span></div>`;document.getElementById('bidSummary').innerHTML=html;document.getElementById('bidEmpty').style.display='none';document.getElementById('bidContent').classList.remove('hidden');showPage('bid')}

// ===== SAVED JOBS (merged with templates) =====
function saveJob(){if(!currentCalc){notify('Calculate first','error');return}
    if(!isLicensed()&&savedJobs.length>=FREE_JOB_LIMIT){notify(`Free accounts can save up to ${FREE_JOB_LIMIT} jobs. Activate a license for unlimited.`,'error');return}
    const el=document.getElementById('saveJobName');el.value=document.getElementById('calcProjectName').value||'';document.getElementById('saveAsTemplate').checked=false;openModal('saveJobModal');el.focus()}
async function doSaveJob(){const name=document.getElementById('saveJobName').value.trim();if(!name){notify('Enter name','error');return}const isTemplate=document.getElementById('saveAsTemplate').checked;
    const job={id:'job-'+Date.now(),name,isTemplate,projectName:isTemplate?'':document.getElementById('calcProjectName').value,projectAddress:isTemplate?'':document.getElementById('calcProjectAddress').value,supplier:currentCalc.supplier,sqft:currentCalc.sqft,linearFt:currentCalc.linearFt,waste:currentCalc.waste,profitPct:currentCalc.profitPct,taxPct:currentCalc.taxPct,laborRate:currentCalc.laborRate,selectedPhases:currentCalc.selectedPhases||categories,materialTotal:currentCalc.materialTotal,sellingPrice:currentCalc.sellingPrice,savedAt:new Date().toISOString()};
    savedJobs.unshift(job);saveSavedJobs();
    // Save to API
    if(api.getToken()){
        try{
            const supId=window._supplierIdMap?.[currentCalc.supplier];
            await api.saveJob({name:job.name,project_name:job.projectName,project_address:job.projectAddress,supplier_id:supId,sqft:job.sqft,linear_ft:job.linearFt,waste_pct:job.waste,profit_pct:job.profitPct,tax_pct:job.taxPct,labor_rate:job.laborRate,selected_phases:JSON.stringify(job.selectedPhases),material_total:job.materialTotal,selling_price:job.sellingPrice});
        }catch(err){console.warn('API save failed:',err.message)}
    }
    closeModal('saveJobModal');notify(isTemplate?'Template saved':'Job saved','success')}

function renderSavedJobs(){const el=document.getElementById('savedJobsList');if(!savedJobs.length){el.innerHTML='<div class="dash-empty">No saved jobs yet.</div>';return}el.innerHTML='<div class="saved-jobs-list">'+savedJobs.map(j=>{const d=new Date(j.savedAt);const ds=d.toLocaleDateString()+' '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});return`<div class="saved-job-card"><h4>${escHtml(j.name)}${j.isTemplate?'<span class="tmpl-badge">TEMPLATE</span>':''}</h4><div class="meta"><span>${escHtml(j.supplier)}</span><span>${(j.sqft||0).toLocaleString()} sqft</span>${j.linearFt?`<span>${j.linearFt.toLocaleString()} lf</span>`:''}</div>${!j.isTemplate?`<div class="meta"><span class="mono">${fmt(j.materialTotal)} cost</span><span class="mono">${fmt(j.sellingPrice)} sell</span></div>`:''}<div class="meta"><span>${ds}</span></div><div class="actions"><button class="btn btn-primary btn-sm" onclick="loadJob('${j.id}')">Load</button><button class="btn btn-secondary btn-sm" onclick="duplicateJob('${j.id}')">Duplicate</button><button class="btn btn-danger btn-sm" onclick="deleteJob('${j.id}')">Delete</button></div></div>`}).join('')+'</div>'}

function loadJob(id){const job=savedJobs.find(j=>j.id===id);if(!job)return;document.getElementById('calcProjectName').value=job.isTemplate?'':job.projectName||'';document.getElementById('calcProjectAddress').value=job.isTemplate?'':job.projectAddress||'';document.getElementById('calcSqft').value=job.sqft||'';if(document.getElementById('calcLinearFt'))document.getElementById('calcLinearFt').value=job.linearFt||'';document.getElementById('calcWaste').value=job.waste||10;document.getElementById('calcProfit').value=job.profitPct||20;document.getElementById('calcTax').value=job.taxPct||0;document.getElementById('calcLabor').value=job.laborRate||0;showPage('calculator');setTimeout(()=>{const sel=document.getElementById('calcSupplier');if(suppliers.includes(job.supplier))sel.value=job.supplier;renderPhaseCheckboxes();if(job.selectedPhases)document.querySelectorAll('#phaseCheckboxes input[type="checkbox"]').forEach(cb=>{const ch=job.selectedPhases.includes(cb.value);cb.checked=ch;cb.closest('.phase-chip').classList.toggle('checked',ch)});if(!job.isTemplate)calculateJob()},50);notify(job.isTemplate?'Template loaded — enter project details':'Job loaded','info')}
function duplicateJob(id){const job=savedJobs.find(j=>j.id===id);if(!job)return;savedJobs.unshift({...job,id:'job-'+Date.now(),name:job.name+' (copy)',savedAt:new Date().toISOString()});saveSavedJobs();renderSavedJobs();notify('Duplicated','success')}
async function deleteJob(id){if(!confirm('Delete?'))return;
    if(api.getToken()){try{await api.deleteJob(id)}catch(err){console.warn('API delete failed:',err.message)}}
    savedJobs=savedJobs.filter(j=>j.id!==id);saveSavedJobs();renderSavedJobs();notify('Deleted','success')}
function clearAllJobs(){if(!confirm('Delete ALL saved jobs?'))return;savedJobs=[];saveSavedJobs();renderSavedJobs();notify('Cleared','info')}

// ===== DASHBOARD =====
function renderDashboard(){
    const totalMats=Object.values(materialsBySupplier).reduce((s,m)=>s+m.length,0);const staleCount=Object.values(materialsBySupplier).flat().filter(isStale).length;
    document.getElementById('dashStats').innerHTML=`<div class="dash-stat"><div class="num">${totalMats}</div><div class="label">Materials</div></div><div class="dash-stat"><div class="num">${suppliers.length}</div><div class="label">Suppliers</div></div><div class="dash-stat"><div class="num">${categories.length}</div><div class="label">Phases</div></div><div class="dash-stat"><div class="num">${savedJobs.length}</div><div class="label">Saved Jobs</div></div>${staleCount?`<div class="dash-stat"><div class="num" style="color:var(--err)">${staleCount}</div><div class="label">Stale Prices</div></div>`:''}`;
    const recent=savedJobs.slice(0,4);const recentEl=document.getElementById('dashRecentJobs');
    if(!recent.length){recentEl.innerHTML='<div class="dash-empty">No saved jobs yet.</div>'}else{recentEl.innerHTML='<div class="dash-recent-grid">'+recent.map(j=>{const ds=new Date(j.savedAt).toLocaleDateString();return`<div class="dash-job-card" onclick="loadJob('${j.id}')"><h4>${escHtml(j.name)}${j.isTemplate?'<span class="tmpl-badge">TEMPLATE</span>':''}</h4><div class="meta"><span>${escHtml(j.supplier)}</span><span>${(j.sqft||0).toLocaleString()} sqft</span><span>${ds}</span></div>${!j.isTemplate?`<div class="amounts"><span class="mat">${fmt(j.materialTotal)} cost</span><span class="sell">${fmt(j.sellingPrice)} sell</span></div>`:''}</div>`}).join('')+'</div>'}
    document.getElementById('dashSuppliers').innerHTML=suppliers.map(s=>{const mats=materialsBySupplier[s]||[];const phases=getSupplierPhases(s);return`<div class="dash-supplier-card" onclick="switchSupplier('${escAttr(s)}');showPage('pricing')"><h4>${escHtml(s)}</h4><div class="meta"><span>${mats.length} materials</span><span>${phases.length} phases</span></div><div class="phases">${phases.map(p=>`<span class="badge pb${categories.indexOf(p)%8} pc${categories.indexOf(p)%8}">${p}</span>`).join('')}</div></div>`}).join('');
}

// ===== ACCOUNT =====
async function renderAccountPage(){
    if(!currentUser)return;
    // Re-fetch latest user data from API
    if(api.getToken()){try{const r=await api.getMe();currentUser=r.user}catch(e){}}

    document.getElementById('accountNameDisplay').textContent=currentUser.name||'No name set';
    document.getElementById('accountEmailDisplay').textContent=currentUser.email||'';
    document.getElementById('accountAvatar').textContent=(currentUser.name||'U')[0].toUpperCase();
    document.getElementById('accountNameInput').value=currentUser.name||'';
    document.getElementById('accountEmailInput').value=currentUser.email||'';
    document.getElementById('accountPasswordInput').value='';
    const lt=currentUser.license_type||'trial';
    const hasKey=!!currentUser.license_key;
    const exp=currentUser.license_expires?new Date(currentUser.license_expires):null;
    const isExpired=exp&&exp<new Date();
    const isActive=hasKey&&!isExpired;
    const expStr=exp?exp.toLocaleDateString():'Never';
    let statusText,statusClass;
    if(!hasKey){statusText='Activate a license key below';statusClass='warn';document.getElementById('accountLicense').innerHTML=`
        <div class="license-status"><span class="dot trial"></span><strong style="font-size:.95rem">NO LICENSE</strong></div>
        <div class="license-detail">${statusText}</div>
        <span class="badge" style="background:var(--warn-soft);color:var(--warn)">Inactive</span>`;return}
    if(isExpired){statusText='Expired '+expStr;statusClass='err'}
    else if(lt==='lifetime'){statusText='Never expires';statusClass='ok'}
    else{statusText='Expires: '+expStr;statusClass='ok'}
    document.getElementById('accountLicense').innerHTML=`
        <div class="license-status"><span class="dot ${isActive?'active':'trial'}"></span><strong style="font-size:.95rem">${lt.toUpperCase()}</strong></div>
        <div class="license-detail">${statusText}</div>
        <span class="badge" style="background:var(--${isActive?'ok':'warn'}-soft);color:var(--${isActive?'ok':'warn'})">${isActive?'Active':'Inactive'}</span>`;
}

async function updateProfile(){
    const name=document.getElementById('accountNameInput').value.trim();
    const email=document.getElementById('accountEmailInput').value.trim();
    const password=document.getElementById('accountPasswordInput').value;
    const msg=document.getElementById('profileMessage');
    const data={};
    if(name&&name!==currentUser.name)data.name=name;
    if(email&&email!==currentUser.email)data.email=email;
    if(password)data.password=password;
    if(!Object.keys(data).length){msg.textContent='No changes';msg.style.color='var(--text3)';return}
    try{
        const r=await api.updateProfile(data);
        currentUser=r.user;
        if(r.token)api.setToken(r.token);
        showAppScreen();renderAccountPage();
        msg.textContent='Saved!';msg.style.color='var(--ok)';setTimeout(()=>{msg.textContent=''},3000);
    }catch(e){msg.textContent=e.message;msg.style.color='var(--err)';setTimeout(()=>{msg.textContent=''},5000)}
}

// Admin view toggle
window.adminViewAsUser=false;
function toggleAdminView(){
    window.adminViewAsUser=!window.adminViewAsUser;
    const floatingBtn=document.getElementById('adminFloatingBtn');
    if(window.adminViewAsUser){
        document.getElementById('adminNavLink').style.display='none';
        document.getElementById('licenseBadge').style.display='';
        document.getElementById('licenseBadge').textContent='TRIAL';
        document.getElementById('licenseBadge').className='license-badge trial';
        if(floatingBtn)floatingBtn.style.display='';
        showPage('dashboard');
    }else{
        document.getElementById('adminNavLink').style.display='';
        document.getElementById('licenseBadge').style.display='none';
        if(floatingBtn)floatingBtn.style.display='none';
        showPage('admin');
    }
}
async function activateLicense(){
    const key=document.getElementById('licenseKeyInput').value.trim();
    const msg=document.getElementById('licenseMessage');
    if(!key){msg.textContent='Enter a key';msg.style.display='';msg.style.background='var(--err-soft)';msg.style.color='var(--err)';return}
    try{
        const r=await api.activateLicense(key);
        currentUser=r.user;
        msg.textContent=r.message;msg.style.display='';msg.style.background='var(--ok-soft)';msg.style.color='var(--ok)';
        showAppScreen();renderAccountPage();
    }catch(e){msg.textContent=e.message;msg.style.display='';msg.style.background='var(--err-soft)';msg.style.color='var(--err)'}
}

// ===== ADMIN PANEL =====
async function renderAdminPanel(){
    if(!currentUser||currentUser.role!=='admin')return;
    try{
        const [statsData,keysData,usersData]=await Promise.all([api.getAdminStats(),api.getKeys(),api.getUsers()]);

        // Stats
        const s=statsData.stats;
        const allUsers=usersData.users||[];
        const licensedCount=allUsers.filter(u=>u.license_type&&u.license_type!=='trial').length;
        const trialCount=allUsers.filter(u=>!u.license_type||u.license_type==='trial').length;
        document.getElementById('adminStats').innerHTML=`<div class="dash-stat"><div class="num">${s.users}</div><div class="label">Total Users</div></div><div class="dash-stat"><div class="num">${licensedCount}</div><div class="label">Licensed</div></div><div class="dash-stat"><div class="num">${trialCount}</div><div class="label">Trial</div></div><div class="dash-stat"><div class="num">${s.keys}</div><div class="label">Keys Generated</div></div><div class="dash-stat"><div class="num">${s.jobs}</div><div class="label">Total Jobs</div></div>`;

        // Keys — match keys to users who activated them
        const keys=keysData.keys||[];
        const users=allUsers;
        const keyUserMap={};users.forEach(u=>{if(u.license_key)keyUserMap[u.license_key]=u});

        if(!keys.length){document.getElementById('adminKeysList').innerHTML='<div class="dash-empty">No keys generated yet.</div>'}
        else{document.getElementById('adminKeysList').innerHTML=`<div class="table-wrap"><table><thead><tr><th>Key</th><th>Type</th><th>Duration</th><th>Uses</th><th>Activated By</th><th>Actions</th></tr></thead><tbody>${keys.map(k=>{
            const activatedBy=keyUserMap[k.key];
            return`<tr><td class="mono" style="font-size:.8rem;user-select:all">${escHtml(k.key)}</td><td>${k.type}</td><td>${k.duration_days}d</td><td>${k.times_used}/${k.max_uses}</td><td>${activatedBy?escHtml(activatedBy.name)+' ('+escHtml(activatedBy.email)+')':'<span style="color:var(--text3)">Unused</span>'}</td><td><button class="btn btn-danger btn-sm" onclick="deleteKey(${k.id})">Delete</button></td></tr>`;
        }).join('')}</tbody></table></div>`}

        // Users
        document.getElementById('adminUsersList').innerHTML=`<div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>License</th><th>Key</th><th>Active</th><th>Actions</th></tr></thead><tbody>${users.map(u=>`<tr><td>${escHtml(u.name)}</td><td>${escHtml(u.email)}</td><td><span class="badge" style="background:var(--${u.role==='admin'?'pri':'warn'}-soft);color:var(--${u.role==='admin'?'pri':'warn'})">${u.role}</span></td><td>${u.license_type||'trial'}</td><td class="mono" style="font-size:.75rem;color:var(--text3)">${u.license_key||'—'}</td><td>${u.is_active?'<span style="color:var(--ok)">Yes</span>':'<span style="color:var(--err)">No</span>'}</td><td style="white-space:nowrap">${u.role!=='admin'?`<button class="btn btn-sm btn-secondary" onclick="toggleUserActive(${u.id},${!u.is_active})">${u.is_active?'Deactivate':'Activate'}</button> <button class="btn btn-sm btn-danger" onclick="adminDeleteUser(${u.id})">Delete</button>`:''}</td></tr>`).join('')}</tbody></table></div>`;

        // Populate bulk supplier dropdown from API data
        const sel=document.getElementById('bulkSupplier');
        if(sel){
            const supMap=window._supplierIdMap||{};
            sel.innerHTML=suppliers.map(s=>`<option value="${supMap[s]||''}">${s}</option>`).join('');
            // If map is empty, try fetching supplier IDs
            if(!Object.keys(supMap).length){
                try{const sd=await api.getSuppliers();sd.suppliers.forEach(s=>{supMap[s.name]=s.id});window._supplierIdMap=supMap;
                sel.innerHTML=suppliers.map(s=>`<option value="${supMap[s]||''}">${s}</option>`).join('')}catch(e){}
            }
        }
    }catch(e){notify('Admin load failed: '+e.message,'error')}
}

async function generateKeys(){
    const type=document.getElementById('genKeyType').value;
    const max_uses=parseInt(document.getElementById('genKeyMaxUses').value)||1;
    const count=parseInt(document.getElementById('genKeyCount').value)||1;
    const durationMap={trial:7,monthly:30,yearly:365,lifetime:36500};
    try{
        const r=await api.generateKeys({type,duration_days:durationMap[type]||30,max_uses,count});
        notify(`${r.keys.length} key(s) generated`,'success');
        renderAdminPanel();
    }catch(e){notify(e.message,'error')}
}

async function deleteKey(id){
    if(!confirm('Delete this key?'))return;
    try{await api.deleteKey(id);renderAdminPanel();notify('Key deleted','success')}catch(e){notify(e.message,'error')}
}

async function toggleUserActive(id,active){
    try{await api.updateUser(id,{is_active:active});renderAdminPanel();notify(active?'User activated':'User deactivated','success')}catch(e){notify(e.message,'error')}
}

async function adminDeleteUser(id){
    if(!confirm('Delete this user and all their data?'))return;
    try{await api.deleteUser(id);renderAdminPanel();notify('User deleted','success')}catch(e){notify(e.message,'error')}
}

async function bulkPriceUpdate(){if(!requireLicense('use bulk price update'))return;
    const supplierId=document.getElementById('bulkSupplier').value;
    const pct=parseFloat(document.getElementById('bulkPercent').value);
    if(!supplierId){notify('Select a supplier','error');return}
    if(isNaN(pct)||pct===0){notify('Enter a percentage','error');return}
    if(!confirm(`Update all material prices for this supplier by ${pct>0?'+':''}${pct}%?`))return;
    try{
        const r=await api.bulkPriceUpdate(parseInt(supplierId),pct);
        notify(r.message,'success');
        // Reload data to reflect new prices
        await loadData();
        renderMaterialTable();
    }catch(e){notify(e.message,'error')}
}

// ===== CALC QTY OVERRIDE =====
function overrideCalcQty(id,val){
    if(!currentCalc)return;
    const qty=Math.max(0,parseInt(val)||0);
    const item=currentCalc.items.find(i=>String(i.id)===String(id));if(!item)return;
    item.qty=qty;item.lineTotal=qty*item.pricePerUnit;
    // Update line total display
    const el=document.querySelector(`.calc-line-total[data-id="${id}"]`);if(el)el.textContent=fmt(item.lineTotal);
    // Recalculate phase totals and grand total
    let materialTotal=0;
    categories.forEach(cat=>{const phaseItems=currentCalc.items.filter(i=>i.category===cat);const total=phaseItems.reduce((s,i)=>s+i.lineTotal,0);if(currentCalc.phases[cat])currentCalc.phases[cat].total=total;materialTotal+=total});
    currentCalc.materialTotal=materialTotal;
    // Recalc financials
    const r=currentCalc;
    r.taxAmount=r.materialTotal*(r.taxPct/100);r.materialPlusTax=r.materialTotal+r.taxAmount;r.laborTotal=r.laborRate*(r.sqft||0);r.deliveryTotal=r.deliveryFee||0;
    r.subtotalBeforeProfit=r.materialPlusTax+r.laborTotal+r.deliveryTotal;r.profitAmount=r.subtotalBeforeProfit*(r.profitPct/100);
    r.sellingBeforeCC=r.subtotalBeforeProfit+r.profitAmount;r.ccFeeAmount=r.sellingBeforeCC*(r.ccFeePct/100);r.sellingPrice=r.sellingBeforeCC+r.ccFeeAmount;
    r.grossMargin=r.sellingPrice>0?(r.profitAmount/r.sellingPrice*100):0;
    // Update summary displays
    document.getElementById('calcGrandTotal').querySelector('.amount').textContent=fmt(r.materialTotal);
    const sg=document.getElementById('summaryGrid');if(sg)renderCalcResults(r);
}

// ===== RECENTLY USED MATERIALS =====
function trackRecentMaterials(){
    // Render recently used materials on pricing page
    const el=document.getElementById('recentMaterials');if(!el)return;
    const recent=getRecentMaterials();
    if(!recent.length){el.innerHTML='';return}
    el.innerHTML=`<div style="font-size:.78rem;color:var(--text3);margin-bottom:6px;font-weight:500">Recently Edited</div><div style="display:flex;gap:6px;flex-wrap:wrap">${recent.map(r=>`<button class="btn btn-sm btn-secondary" onclick="jumpToMaterial('${r.id}')" style="font-size:.78rem">${escHtml(r.name)} <span style="color:var(--text3);font-size:.7rem">${escHtml(r.supplier)}</span></button>`).join('')}</div>`;
}
function jumpToMaterial(id){
    // Find which supplier has this material and switch to it
    for(const[sup,mats]of Object.entries(materialsBySupplier)){
        const mat=mats.find(m=>String(m.id)===String(id));
        if(mat){switchSupplier(sup);editMaterial(id);return}
    }
    notify('Material not found','error');
}
function addToRecent(matId,matName,supplierName){
    let recent=JSON.parse(localStorage.getItem('esticount_recent_mats')||'[]');
    recent=recent.filter(r=>r.id!==matId);
    recent.unshift({id:matId,name:matName,supplier:supplierName,time:Date.now()});
    if(recent.length>10)recent=recent.slice(0,10);
    localStorage.setItem('esticount_recent_mats',JSON.stringify(recent));
}
function getRecentMaterials(){return JSON.parse(localStorage.getItem('esticount_recent_mats')||'[]')}

// ===== INIT =====
async function initApp(){
    await loadData();
    // Restore last page BEFORE showing app (prevents flash to dashboard)
    const savedPage=localStorage.getItem('esticount_page');
    if(savedPage&&document.getElementById(savedPage+'Page')){
        // Pre-activate the page without triggering render yet
        document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
        document.getElementById(savedPage+'Page').classList.add('active');
        document.querySelectorAll('.nav-link').forEach(el=>el.classList.remove('active'));
        const link=document.querySelector(`.nav-link[data-page="${savedPage}"]`);if(link)link.classList.add('active');
        currentPageId=savedPage;
    }
    // NOW show app (no flash since correct page is already set)
    showAppScreen();
    // Then trigger page-specific renders
    if(savedPage&&document.getElementById(savedPage+'Page')){showPage(savedPage)}else{showPage('dashboard')}
    updateUndoButtons();rebuildTaxDropdown();
    document.getElementById('orderNotes')?.addEventListener('input',function(){const np=document.getElementById('orderNotesPrint');if(this.value.trim()){np.innerHTML=`<h4>Notes:</h4>${escHtml(this.value)}`;np.style.display='block'}else np.style.display='none'});

    // Auto-recalculate: debounced recalc on any calculator input change
    let recalcTimer=null;
    function autoRecalc(){clearTimeout(recalcTimer);recalcTimer=setTimeout(()=>{if(currentCalc&&currentPageId==='calculator')calculateJob()},500)}
    ['calcSqft','calcWaste','calcProfit','calcTax','calcLabor','calcDelivery','calcCCFee','calcLinearFt'].forEach(id=>{
        const el=document.getElementById(id);if(el)el.addEventListener('input',autoRecalc);
    });

    // Track recently used materials
    trackRecentMaterials();
}

document.addEventListener('DOMContentLoaded', async function(){
    // Check if user has a valid token — if so, skip login
    const loggedIn = await checkAuth();
    if (loggedIn) initApp();
});
