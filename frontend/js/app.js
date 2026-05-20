// ===== DEFAULTS =====
const DEFAULT_CATEGORIES=['Lath','Gray Coat','Color Coat','Stone','Drywall','Painting'];
const DEFAULT_SUPPLIERS=['Pacific Supply','ABC Supply','Sherwin Williams'];
const UNITS=['roll','box','piece','bag','ton','pail','tube','gal','lb','each','bundle','bucket','sheet','sqyd','disc'];
const CALC_TYPES=['area','linear'];
const BIZ_EXPENSE_FREQS=['per-job','monthly','annual'];

// Business Expenses (recurring/per-job overhead like QuickBooks, insurance, phone, etc.).
// Stored in localStorage as { avgJobsPerMonth: N, items: [{id, name, amount, frequency}] }.
function loadBusinessExpenses(){
    try{const raw=localStorage.getItem('esticount_business_expenses');if(raw){const o=JSON.parse(raw);return{avgJobsPerMonth:o.avgJobsPerMonth||4,items:Array.isArray(o.items)?o.items:[]}}}catch(_){}
    return{avgJobsPerMonth:4,items:[]};
}
function saveBusinessExpenses(state){
    localStorage.setItem('esticount_business_expenses',JSON.stringify({avgJobsPerMonth:Number(state.avgJobsPerMonth)||4,items:Array.isArray(state.items)?state.items:[]}));
}
// Computes the per-job amortization given the saved state.
// monthly → divided by avgJobsPerMonth; annual → divided by (avgJobsPerMonth*12);
// per-job → flat per job.
function businessExpensePerJob(state){
    const s=state||loadBusinessExpenses();
    const jpm=Math.max(1,Number(s.avgJobsPerMonth)||4);
    let total=0;
    (s.items||[]).forEach(it=>{
        const amt=Number(it.amount)||0;
        if(it.frequency==='per-job')total+=amt;
        else if(it.frequency==='monthly')total+=amt/jpm;
        else if(it.frequency==='annual')total+=amt/(jpm*12);
    });
    return total;
}
window.loadBusinessExpenses=loadBusinessExpenses;
window.saveBusinessExpenses=saveBusinessExpenses;
window.businessExpensePerJob=businessExpensePerJob;

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
const DRYWALL_MATERIALS=[{name:'Drywall Sheet 1/2" 4x8',sku:'DW-12-48',unit:'sheet',pricePerUnit:12.50,category:'Drywall',coveragePerUnit:32,calcType:'area',isDrywallSheet:true},{name:'Drywall Sheet 5/8" 4x8',sku:'DW-58-48',unit:'sheet',pricePerUnit:14.50,category:'Drywall',coveragePerUnit:32,calcType:'area',isDrywallSheet:true},{name:'DenShield Tile Backer 1/2" 4x8',sku:'DS-12-48',unit:'sheet',pricePerUnit:28,category:'Drywall',coveragePerUnit:32,calcType:'area',isDrywallSheet:true},{name:'Red Dot Joint Compound (4.5 gal)',sku:'RD-AP-45G',unit:'bucket',pricePerUnit:18,category:'Drywall',coveragePerUnit:230,calcType:'area'},{name:'TNT Lite Topping (4.5 gal)',sku:'TNT-LT-45G',unit:'bucket',pricePerUnit:22,category:'Drywall',coveragePerUnit:270,calcType:'area'},{name:'Sanding Discs 120 Grit (25pk)',sku:'SD-120-25',unit:'box',pricePerUnit:15,category:'Drywall',coveragePerUnit:1500,calcType:'area'},{name:'Sanding Discs 150 Grit (25pk)',sku:'SD-150-25',unit:'box',pricePerUnit:15,category:'Drywall',coveragePerUnit:1500,calcType:'area'},{name:'Paper Joint Tape (500\')',sku:'PJT-500',unit:'roll',pricePerUnit:4.50,category:'Drywall',coveragePerUnit:200,calcType:'area'},{name:'Mesh Joint Tape (300\')',sku:'MJT-300',unit:'roll',pricePerUnit:7,category:'Drywall',coveragePerUnit:150,calcType:'area'},{name:'Corner Bead Metal 8\'',sku:'CB-MT-8',unit:'piece',pricePerUnit:3.50,category:'Drywall',coveragePerUnit:8,calcType:'linear'}];
const PAINT_MATERIALS=[{name:'Painters Plastic (9\' x 400\')',sku:'PP-9400',unit:'roll',pricePerUnit:18,category:'Painting',coveragePerUnit:3600,calcType:'area'},{name:'Primer (1 gal)',sku:'SW-PRM-1G',unit:'gal',pricePerUnit:28,category:'Painting',coveragePerUnit:400,calcType:'area',isPaint:true},{name:'Primer (5 gal)',sku:'SW-PRM-5G',unit:'bucket',pricePerUnit:115,category:'Painting',coveragePerUnit:2000,calcType:'area',isPaint:true},{name:'A-100 Exterior Latex (1 gal)',sku:'SW-A100-1G',unit:'gal',pricePerUnit:42,category:'Painting',coveragePerUnit:400,calcType:'area',isPaint:true},{name:'A-100 Exterior Latex (5 gal)',sku:'SW-A100-5G',unit:'bucket',pricePerUnit:185,category:'Painting',coveragePerUnit:2000,calcType:'area',isPaint:true}];

const SUPPLIER_MATERIALS={'Pacific Supply':[...STUCCO_LATH,...STUCCO_GRAY,...STUCCO_COLOR,...STONE_MATERIALS,...DRYWALL_MATERIALS],'ABC Supply':[...STUCCO_LATH,...STUCCO_GRAY,...STUCCO_COLOR,...STONE_MATERIALS,...DRYWALL_MATERIALS],'Sherwin Williams':[...PAINT_MATERIALS]};
const SUPPLIER_PRICE_MODS={'Pacific Supply':1,'ABC Supply':1.03,'Sherwin Williams':1};

// ===== STATE =====
let suppliers=[],categories=[],materialsBySupplier={},activeSupplier='',editingId=null,currentCalc=null,savedJobs=[];
let undoStack=[],redoStack=[];const MAX_UNDO=25;let dragSrcId=null;
let pageHistory=['dashboard'];
let savedPhaseSelection=null; // preserve phase checkboxes across page nav

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
                    isDrywallSheet:(categoryIdMap?Object.entries(categoryIdMap).find(([n,id])=>id===m.category_id)?.[0]:'')=='Drywall'&&(m.unit||'')=='sheet',
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
        if(s&&c&&m){suppliers=JSON.parse(s);categories=JSON.parse(c);materialsBySupplier=JSON.parse(m);Object.values(materialsBySupplier).forEach(ms=>ms.forEach(mt=>{if(!mt.calcType)mt.calcType='area';if(!mt.lastUpdated)mt.lastUpdated=Date.now();if(mt.isDrywallSheet===undefined)mt.isDrywallSheet=mt.category==='Drywall'&&mt.unit==='sheet'}))}else resetAllToDefaults(true);
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

// Utils
function genId(){return'mat-'+Date.now()+'-'+Math.random().toString(36).substring(2,7)}
// Returns the list of categories a material belongs to. Backward-compatible:
// supports legacy `m.category` (single string), `m.categories` (array), or a
// comma-separated string in either field. Always returns at least one entry.
function materialCategories(m){
    if(!m)return[categories[0]||'Lath'];
    if(Array.isArray(m.categories)&&m.categories.length)return m.categories;
    if(typeof m.categories==='string'&&m.categories.trim())return m.categories.split(',').map(s=>s.trim()).filter(Boolean);
    if(typeof m.category==='string'&&m.category.includes(','))return m.category.split(',').map(s=>s.trim()).filter(Boolean);
    return[m.category||categories[0]||'Lath'];
}
function normSku(s){return(s||'').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g,'')}
function normName(s){return(s||'').toString().toLowerCase().replace(/[^a-z0-9]+/g,'')}
function fmt(n){return'$'+Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
function escHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function escAttr(s){return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/\\/g,'\\\\')}
function notify(msg,type){const el=document.getElementById('notification');el.textContent=msg;el.className='notification '+(type||'info');setTimeout(()=>el.classList.add('show'),10);setTimeout(()=>el.classList.remove('show'),3000)}
function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
function toggleUserMenu(){document.getElementById('userBadge').classList.toggle('open')}
document.addEventListener('click',function(e){const dd=document.getElementById('userBadge');if(dd&&!dd.contains(e.target))dd.classList.remove('open')});
function toggleTheme(){const c=document.documentElement.getAttribute('data-theme');const n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('stucco_theme',n)}

// ===== NAVIGATION =====
const PAGE_TITLES={dashboard:'Dashboard',pricing:'Material Pricing',calculator:'Job Calculator',order:'Order Form',savedJobs:'Saved Jobs',admin:'Admin Panel',account:'Account'};
const PAGES_WITH_BACK=['pricing','order','savedJobs','admin','account'];
let currentPageId='dashboard';

// Mobile menu
function toggleMobileMenu(){document.getElementById('topnavLinks').classList.toggle('open');document.getElementById('mobileOverlay').classList.toggle('open')}
function closeMobileMenu(){document.getElementById('topnavLinks').classList.remove('open');document.getElementById('mobileOverlay').classList.remove('open')}

function showPage(id){
    // Save phase selection before leaving calculator
    if(currentPageId==='calculator'){
        const boxes=document.querySelectorAll('#phaseCheckboxes input[type="checkbox"]');
        if(boxes.length>0)savedPhaseSelection=[...boxes].filter(cb=>cb.checked).map(cb=>cb.value);
    }
    currentPageId=id;
    localStorage.setItem('esticount_page',id);
    document.body.setAttribute('data-page',id);
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
    if(id==='calculator'){populateCalcSupplierDropdown();renderPhaseCheckboxes();restorePhaseSelection();if(typeof updateCalcHeader==='function')updateCalcHeader()}
    if(id==='savedJobs')renderSavedJobs();
    if(id==='admin')renderAdminPanel();
    if(id==='account')renderAccountPage();
}
function goBack(){pageHistory.pop();const prev=pageHistory[pageHistory.length-1]||'dashboard';showPage(prev)}

// ===== SUPPLIERS =====
// ===== PRICING v2 helpers =====
// Pretty short-dollar (used by supplier YTD spend in sidebar)
function priceV2ShortMoney(n){
    const v=Number(n||0);
    if(v>=1000000)return '$'+(v/1000000).toFixed(1).replace(/\.0$/,'')+'M';
    if(v>=1000)return '$'+(v/1000).toFixed(1).replace(/\.0$/,'')+'k';
    return '$'+v.toFixed(0);
}
// Supplier YTD spend estimate (uses cataloged price * coverage as a rough catalog value)
function priceV2SupplierSpend(sup){
    const mats=materialsBySupplier[sup]||[];
    return mats.reduce((a,m)=>a+(Number(m.pricePerUnit)||0)*(Number(m.coveragePerUnit)||0)/100,0);
}
// Per-category counts for active supplier (sidebar filter)
function priceV2CategoryCounts(){
    const mats=materialsBySupplier[activeSupplier]||[];
    const out={};
    mats.forEach(m=>{out[m.category]=(out[m.category]||0)+1});
    return out;
}
// Persistent multi-select filter state for the sidebar checkboxes.
// `null` (default) means "All categories"; otherwise an array of selected
// category names that the table is restricted to.
window.priceV2FilterState=window.priceV2FilterState||{selected:null,sort:'name-asc',view:'dense'};
// 30D trend cell content (uses material.previousPrice when present)
function priceV2Trend(m){
    if(m.previousPrice==null||!isFinite(m.previousPrice)||m.previousPrice<=0)return{cls:'flat',label:'—'};
    const delta=(m.pricePerUnit-m.previousPrice)/m.previousPrice*100;
    if(Math.abs(delta)<0.05)return{cls:'flat',label:'—'};
    const sign=delta>0?'+':'';
    const arrow=delta>0?'↑':'↓';
    const cls=delta>0?'up':'down';
    return{cls,label:`${arrow} ${sign}${delta.toFixed(1)}%`};
}
function priceV2UpdateEyebrow(){
    const el=document.getElementById('priceV2Slug');if(!el)return;
    el.textContent=(activeSupplier||'CATALOG').toUpperCase();
}
function priceV2UpdateSubtitle(){
    const mats=materialsBySupplier[activeSupplier]||[];
    // Find the most recent material update for a rough "last sync" timestamp.
    const latest=mats.reduce((max,m)=>{const u=m.lastUpdated||0;return u>max?u:max},0);
    const skuEl=document.getElementById('priceV2SkuCount');
    const phEl=document.getElementById('priceV2PhaseCount');
    if(skuEl)skuEl.textContent=`${mats.length} SKU${mats.length===1?'':'s'}`;
    if(phEl){
        if(latest){
            const d=new Date(latest);
            const sameDay=d.toDateString()===new Date().toDateString();
            const hh=String(d.getHours()).padStart(2,'0');
            const mm=String(d.getMinutes()).padStart(2,'0');
            phEl.textContent=`Last sync ${hh}:${mm}${sameDay?' today':''}`;
        }else{
            phEl.textContent='Last sync —';
        }
    }
}

function renderSupplierTabs(){
    const root=document.getElementById('supplierTabs');if(!root)return;
    const counts=priceV2CategoryCounts();
    const allMats=materialsBySupplier[activeSupplier]||[];
    const filterValue=document.getElementById('categoryFilter')?.value||'All';

    // Supplier rows
    const supplierRows=suppliers.map(s=>{
        const mats=materialsBySupplier[s]||[];
        const isActive=s===activeSupplier;
        return `<button class="price-v2-supplier-item${isActive?' active':''}" data-on-click="switchSupplier" data-on-contextmenu="confirmDeleteSupplier" data-args="${escAttr(s)}" aria-current="${isActive?'true':'false'}">
            <span class="price-v2-supplier-row1">
                <span class="price-v2-supplier-name">${escHtml(s)}</span>
                <span class="price-v2-supplier-spend">${priceV2ShortMoney(priceV2SupplierSpend(s))}</span>
            </span>
            <span class="price-v2-supplier-count">${mats.length} item${mats.length===1?'':'s'}</span>
        </button>`;
    }).join('');

    // Filter rows: All + every category present in active supplier.
    // Spec §2.3: additive multi-select checkboxes — `All categories` is the
    // first row and checked when the per-category selection is empty.
    const supplierPhases=getSupplierPhases(activeSupplier);
    const selected=window.priceV2FilterState.selected;
    const allChecked=!selected||!selected.length;
    const filterAll=`<li><label class="price-v2-filter-row">
        <input type="checkbox" ${allChecked?'checked':''} data-on-change="priceV2ToggleFilterAll">
        <span class="price-v2-filter-label">All categories</span>
        <span class="price-v2-filter-count">${allMats.length}</span>
    </label></li>`;
    const filterRows=supplierPhases.map(c=>{
        const n=counts[c]||0;
        const isChecked=!allChecked&&selected.includes(c);
        return `<li><label class="price-v2-filter-row">
            <input type="checkbox" ${isChecked?'checked':''} data-on-change="priceV2ToggleFilter" data-args="${escAttr(c)}">
            <span class="price-v2-filter-label">${escHtml(c)}</span>
            <span class="price-v2-filter-count">${n}</span>
        </label></li>`;
    }).join('');

    root.innerHTML=`
        <section class="price-v2-suppliers">
            <div class="price-v2-eyebrow">SUPPLIERS &middot; ${suppliers.length}</div>
            <ul class="price-v2-supplier-list">${supplierRows}</ul>
            <button class="price-v2-add-supplier" data-on-click="openAddSupplierModal">+ Add supplier</button>
        </section>
        <section class="price-v2-filter">
            <div class="price-v2-eyebrow">FILTER</div>
            <ul class="price-v2-filter-list">${filterAll}${filterRows}</ul>
        </section>
        <section class="price-v2-manage">
            <div class="price-v2-eyebrow">MANAGE</div>
            <button class="price-v2-add-supplier" data-on-click="openModal" data-args="addCategoryModal">+ Phase</button>
            <button class="price-v2-add-supplier" data-on-click="openDeleteCategoryModal">&minus; Phase</button>
            <button class="price-v2-add-supplier" data-on-click="resetToDefaults">Reset to defaults</button>
        </section>`;
    priceV2UpdateEyebrow();
    priceV2UpdateSubtitle();
}
// Sidebar filter click — sync the hidden #categoryFilter <select> + re-render table
function priceV2SetFilter(value){
    const sel=document.getElementById('categoryFilter');
    if(!sel)return;
    if(value!=='All' && !Array.from(sel.options).some(o=>o.value===value)){
        const opt=document.createElement('option');opt.value=value;opt.textContent=value;sel.appendChild(opt);
    }
    sel.value=value;
    renderMaterialTable();
}
// Multi-select filter handlers (spec §2.3 — additive checkboxes).
function priceV2ToggleFilterAll(){
    // Toggling "All categories" clears the selection (renders everything).
    window.priceV2FilterState.selected=null;
    // Keep the hidden legacy <select> in sync for back-compat.
    const sel=document.getElementById('categoryFilter');if(sel)sel.value='All';
    renderMaterialTable();
}
function priceV2ToggleFilter(cat){
    const st=window.priceV2FilterState;
    if(!st.selected)st.selected=[];
    const i=st.selected.indexOf(cat);
    if(i>=0)st.selected.splice(i,1);else st.selected.push(cat);
    if(!st.selected.length)st.selected=null;
    // Keep legacy <select> roughly in sync (single value or All).
    const sel=document.getElementById('categoryFilter');
    if(sel){
        if(!st.selected)sel.value='All';
        else if(st.selected.length===1){
            if(!Array.from(sel.options).some(o=>o.value===st.selected[0])){
                const opt=document.createElement('option');opt.value=st.selected[0];opt.textContent=st.selected[0];sel.appendChild(opt);
            }
            sel.value=st.selected[0];
        }else{sel.value='All'}
    }
    renderMaterialTable();
}
window.priceV2ToggleFilterAll=priceV2ToggleFilterAll;
window.priceV2ToggleFilter=priceV2ToggleFilter;
// Toolbar SORT + VIEW handlers (spec §2.5).
function priceV2SetSort(){
    const sel=document.getElementById('priceV2Sort');
    if(!sel)return;
    window.priceV2FilterState.sort=sel.value;
    renderMaterialTable();
}
function priceV2SetView(mode){
    if(mode!=='dense'&&mode!=='comfortable')mode='dense';
    window.priceV2FilterState.view=mode;
    const d=document.getElementById('priceV2ViewDense');
    const c=document.getElementById('priceV2ViewComfy');
    if(d)d.classList.toggle('active',mode==='dense');
    if(c)c.classList.toggle('active',mode==='comfortable');
    const wrap=document.querySelector('.price-v2-table-wrap');
    if(wrap)wrap.classList.toggle('comfortable',mode==='comfortable');
}
window.priceV2SetSort=priceV2SetSort;
window.priceV2SetView=priceV2SetView;
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
    const search=(document.getElementById('materialSearch')?.value||'').toLowerCase();
    let all=materialsBySupplier[activeSupplier]||[];
    let mats=all.slice();
    // Multi-select sidebar filter (spec §2.3). `selected==null` = All.
    const selected=window.priceV2FilterState&&window.priceV2FilterState.selected;
    if(selected&&selected.length)mats=mats.filter(m=>selected.includes(m.category));
    if(search)mats=mats.filter(m=>m.name.toLowerCase().includes(search)||m.sku.toLowerCase().includes(search));
    // Apply sort from toolbar dropdown (spec §2.5).
    const sortKey=(window.priceV2FilterState&&window.priceV2FilterState.sort)||'name-asc';
    const trendPct=(m)=>{
        if(m.previousPrice==null||!isFinite(m.previousPrice)||m.previousPrice<=0)return 0;
        return (m.pricePerUnit-m.previousPrice)/m.previousPrice*100;
    };
    mats.sort((a,b)=>{
        switch(sortKey){
            case 'name-asc':  return String(a.name||'').localeCompare(b.name||'');
            case 'name-desc': return String(b.name||'').localeCompare(a.name||'');
            case 'price-asc': return (a.pricePerUnit||0)-(b.pricePerUnit||0);
            case 'price-desc':return (b.pricePerUnit||0)-(a.pricePerUnit||0);
            case 'trend-asc': return trendPct(a)-trendPct(b);
            case 'trend-desc':return trendPct(b)-trendPct(a);
        }
        return 0;
    });
    const container=document.getElementById('scopeGroups');if(!container)return;

    // Always refresh the sidebar counts/active state on every re-render
    renderSupplierTabs();
    priceV2UpdateSubtitle();

    if(!mats.length){
        container.innerHTML=`<div class="price-v2-table-wrap"><div class="price-v2-empty">No materials match the current filter.</div></div><div class="price-v2-footer"><span>Showing 0 of ${all.length}<span class="price-v2-sub-sep">&middot;</span>0 selected</span><span class="price-v2-footer-right">Catalog total value: <span class="price-v2-footer-mono">$0</span><span class="price-v2-sub-sep">&middot;</span>Avg margin: 2.1% supplier</span></div>`;
        updateStatsBar();
        return;
    }

    // Build table head — 7 columns per spec §2.6. Actions reveal on row hover
    // (CSS handles the visibility) rather than living in their own column.
    const head=`<colgroup>
        <col class="col-drag"><col class="col-sku"><col><col class="col-unit"><col class="col-cat"><col class="col-price"><col class="col-trend">
    </colgroup>
    <thead><tr>
        <th class="col-h-drag center"></th>
        <th>SKU</th>
        <th>NAME</th>
        <th class="col-h-unit">UNIT &middot; COVERAGE</th>
        <th>CATEGORY</th>
        <th class="right">PRICE</th>
        <th class="col-h-trend right">30D</th>
    </tr></thead>`;

    let totalValue=0;
    mats.forEach(m=>{totalValue+=Number(m.pricePerUnit||0)});

    const viewMode=(window.priceV2FilterState&&window.priceV2FilterState.view)||'dense';

    // Build a single body of rows (above) only once. To group by phase, partition
    // the already-sorted mats into buckets (one per category) and emit one
    // <section> per non-empty bucket. Items with multiple categories appear in
    // each section they belong to. Render order follows the global `categories`
    // list so the visual ordering is stable.
    const buckets=new Map();
    categories.forEach(c=>buckets.set(c,[]));
    mats.forEach(m=>{
        materialCategories(m).forEach(c=>{
            if(!buckets.has(c))buckets.set(c,[]);
            buckets.get(c).push(m);
        });
    });
    const collapsed=window.priceV2CollapsedGroups||(window.priceV2CollapsedGroups=new Set());

    let groupsHtml='';
    let renderedCount=0;
    buckets.forEach((items,cat)=>{
        if(!items.length)return;
        renderedCount+=items.length;
        const chipCls=v2ChipClass(cat);
        const isCollapsed=collapsed.has(cat);
        let sectionBody='';
        items.forEach(m=>{
            // Reuse the per-row markup we built above. We split `body` per-id
            // earlier — simplest: re-render each row inline here using the same
            // structure. To avoid duplicating ~30 lines we just include each
            // matched row from the pre-built body via re-iteration.
            sectionBody+=renderMaterialRow(m,cat);
        });
        groupsHtml+=`
        <section class="price-v2-phase-group${isCollapsed?' collapsed':''}" data-cat="${escAttr(cat)}">
            <button type="button" class="price-v2-phase-header" data-on-click="togglePhaseGroup" data-args="${escAttr(cat)}">
                <span class="v2-chip ${chipCls}">${escHtml(cat)}</span>
                <span class="price-v2-phase-count">${items.length} item${items.length===1?'':'s'}</span>
                <span class="price-v2-phase-chev" aria-hidden="true">&#9662;</span>
            </button>
            <div class="price-v2-phase-body">
                <div class="price-v2-table-wrap${viewMode==='comfortable'?' comfortable':''}">
                    <table class="price-v2-table">${head}<tbody>${sectionBody}</tbody></table>
                </div>
            </div>
        </section>`;
    });

    container.innerHTML=groupsHtml+`
        <div class="price-v2-footer">
            <span>Showing ${mats.length} of ${all.length}<span class="price-v2-sub-sep">&middot;</span>${renderedCount-mats.length>0?renderedCount+' placements':'0 selected'}</span>
            <span class="price-v2-footer-right">Catalog total value: <span class="price-v2-footer-mono">${fmt(totalValue)}</span><span class="price-v2-sub-sep">&middot;</span>Avg margin: 2.1% supplier</span>
        </div>`;
    updateStatsBar();
}

// Single-row HTML used by the per-category sections. Mirrors the inline
// markup that used to live inside renderMaterialTable's mats.forEach loop.
function renderMaterialRow(m,sectionCat){
    if(editingId&&String(editingId)===String(m.id)){
        // Inline edit row — re-use the same structure as before. The
        // category picker becomes a clickable chip set (multi-select).
        const chipSet=categories.map(cc=>{
            const checked=materialCategories(m).includes(cc);
            return `<button type="button" class="price-v2-cat-chip${checked?' is-on':''}" data-on-click="toggleEditCategoryChip" data-args="${escAttr(cc)}" data-cc="${escAttr(cc)}">${escHtml(cc)}</button>`;
        }).join('');
        return `<tr class="price-v2-edit-row" data-id="${m.id}"><td colspan="7">
            <div style="display:grid;grid-template-columns:100px 1fr 110px 200px 90px 90px auto;gap:10px;align-items:start">
                <div><div style="font-family:var(--v2-font-mono);font-size:.65rem;color:var(--v2-text-tertiary);text-transform:uppercase;letter-spacing:.10em;margin-bottom:4px">SKU</div><input class="price-v2-edit-input mono" id="edit-sku" value="${escAttr(m.sku)}"></div>
                <div><div style="font-family:var(--v2-font-mono);font-size:.65rem;color:var(--v2-text-tertiary);text-transform:uppercase;letter-spacing:.10em;margin-bottom:4px">NAME</div>
                    <input class="price-v2-edit-input" id="edit-name" value="${escAttr(m.name)}">
                    <input class="price-v2-edit-input price-v2-edit-notes" id="edit-notes" value="${escAttr(m.notes||'')}" placeholder="Notes...">
                </div>
                <div><div style="font-family:var(--v2-font-mono);font-size:.65rem;color:var(--v2-text-tertiary);text-transform:uppercase;letter-spacing:.10em;margin-bottom:4px">UNIT</div><select class="price-v2-edit-select" id="edit-unit">${UNITS.map(u=>`<option${u===m.unit?' selected':''}>${u}</option>`).join('')}</select></div>
                <div><div style="font-family:var(--v2-font-mono);font-size:.65rem;color:var(--v2-text-tertiary);text-transform:uppercase;letter-spacing:.10em;margin-bottom:4px">PHASES <span style="color:var(--v2-text-tertiary);text-transform:none;letter-spacing:0">(click to toggle)</span></div>
                    <div class="price-v2-cat-chipset" id="edit-categories-chipset">${chipSet}</div>
                    <select class="price-v2-edit-select" id="edit-calcType" style="margin-top:6px">${CALC_TYPES.map(t=>`<option${t===m.calcType?' selected':''}>${t}</option>`).join('')}</select>
                </div>
                <div><div style="font-family:var(--v2-font-mono);font-size:.65rem;color:var(--v2-text-tertiary);text-transform:uppercase;letter-spacing:.10em;margin-bottom:4px">PRICE</div><input class="price-v2-edit-input mono" id="edit-price" type="number" step="0.01" min="0" value="${m.pricePerUnit}" style="text-align:right"></div>
                <div><div style="font-family:var(--v2-font-mono);font-size:.65rem;color:var(--v2-text-tertiary);text-transform:uppercase;letter-spacing:.10em;margin-bottom:4px">COVERAGE</div><input class="price-v2-edit-input mono" id="edit-coverage" type="number" step="0.1" min="0.1" value="${m.coveragePerUnit}" style="text-align:right"></div>
                <div style="display:flex;flex-direction:column;gap:6px;align-self:flex-end"><button class="price-v2-btn-save" data-on-click="saveMaterialEdit" data-args="${m.id}">Save</button><button class="price-v2-btn-cancel" data-on-click="cancelEdit">Cancel</button></div>
            </div>
        </td></tr>`;
    }
    const stale=isStale(m);
    const covLabel=m.calcType==='linear'?'lf':'sqft';
    const trend=priceV2Trend(m);
    const cats=materialCategories(m);
    const chipCls=v2ChipClass(sectionCat);
    const extraBadge=cats.length>1?`<span class="price-v2-cat-extra" title="${escAttr(cats.filter(c=>c!==sectionCat).join(', '))}">+${cats.length-1}</span>`:'';
    const priceHist=m.previousPrice!=null?(m.previousPrice<m.pricePerUnit?'<span class="price-v2-price-up">&uarr;</span>':'<span class="price-v2-price-down">&darr;</span>'):'';
    return `<tr draggable="true" data-id="${m.id}" data-on-dragstart="dragStart" data-on-dragover="dragOver" data-on-dragleave="dragLeave" data-on-drop="dropRow" data-on-dragend="dragEnd">
        <td class="col-c-drag price-v2-drag" title="Drag to reorder">&#9776;</td>
        <td class="price-v2-sku">${escHtml(m.sku||'')}</td>
        <td>
            <div class="price-v2-name">${escHtml(m.name)}${stale?'<span class="price-v2-stale">stale</span>':''}</div>
            ${m.notes?`<div class="price-v2-name-notes">${escHtml(m.notes)}</div>`:''}
        </td>
        <td class="col-c-unit">
            <div class="price-v2-unit">${escHtml(m.unit||'each')}</div>
            <div class="price-v2-coverage">${escHtml(String(m.coveragePerUnit))} ${covLabel}/${escHtml(m.unit||'unit')}</div>
        </td>
        <td><span class="v2-chip ${chipCls}">${escHtml(sectionCat)}</span>${extraBadge}</td>
        <td class="price-v2-price">${fmt(m.pricePerUnit)}${priceHist}</td>
        <td class="col-c-trend price-v2-trend price-v2-trend-${trend.cls}">
            <span class="price-v2-trend-label">${trend.label}</span>
            <span class="price-v2-row-actions">
                <button class="price-v2-btn-icon" data-on-click="editMaterial" data-args="${m.id}" title="Edit">&#9998;</button>
                <button class="price-v2-btn-icon" data-on-click="openDuplicate" data-args="${m.id}" title="Copy to supplier">&#10697;</button>
                <button class="price-v2-btn-icon danger" data-on-click="deleteMaterial" data-args="${m.id}" title="Delete">&#10005;</button>
            </span>
        </td>
    </tr>`;
}

// Collapse / expand a phase group on the pricing page.
function togglePhaseGroup(cat){
    const collapsed=window.priceV2CollapsedGroups||(window.priceV2CollapsedGroups=new Set());
    if(collapsed.has(cat))collapsed.delete(cat); else collapsed.add(cat);
    renderMaterialTable();
}
window.togglePhaseGroup=togglePhaseGroup;

// Edit-row multi-category chip toggle. Stores selected categories on the row's
// chipset container as a comma-separated data attribute; saveMaterialEdit reads it.
function toggleEditCategoryChip(cat,event){
    const btn=event&&event.currentTarget?event.currentTarget:this;
    if(btn&&btn.classList)btn.classList.toggle('is-on');
}
window.toggleEditCategoryChip=toggleEditCategoryChip;

function updateStatsBar(){
    const root=document.getElementById('statsBar');if(!root)return;
    const mats=materialsBySupplier[activeSupplier]||[];
    const phases=getSupplierPhases(activeSupplier);
    const staleCount=mats.filter(isStale).length;
    root.innerHTML=`
        <div class="price-v2-stat"><div class="price-v2-stat-label">Materials</div><div class="price-v2-stat-value">${mats.length}</div></div>
        <div class="price-v2-stat"><div class="price-v2-stat-label">Phases</div><div class="price-v2-stat-value">${phases.length}</div></div>
        <div class="price-v2-stat"><div class="price-v2-stat-label">Suppliers</div><div class="price-v2-stat-value">${suppliers.length}</div></div>
        <div class="price-v2-stat"><div class="price-v2-stat-label">Stale</div><div class="price-v2-stat-value${staleCount?' warn':''}">${staleCount}</div></div>`;
}

function editMaterial(id){editingId=String(id);renderMaterialTable()}
function cancelEdit(){editingId=null;renderMaterialTable()}
async function saveMaterialEdit(id){const mats=materialsBySupplier[activeSupplier]||[];const mat=mats.find(m=>String(m.id)===String(id));if(!mat)return;const name=document.getElementById('edit-name').value.trim();const price=parseFloat(document.getElementById('edit-price').value);const coverage=parseFloat(document.getElementById('edit-coverage').value);if(!name){notify('Name required','error');return}if(isNaN(price)||price<0){notify('Invalid price','error');return}if(isNaN(coverage)||coverage<=0){notify('Coverage > 0','error');return}pushUndo();if(mat.pricePerUnit!==price)mat.previousPrice=mat.pricePerUnit;
    // Read selected categories from the multi-chip set (one or more highlighted chips).
    const chipset=document.getElementById('edit-categories-chipset');
    let newCats=chipset?Array.from(chipset.querySelectorAll('.price-v2-cat-chip.is-on')).map(b=>b.dataset.cc||b.textContent.trim()):[];
    // Fallback: legacy single-select (#edit-category) if present
    if(!newCats.length){const legacy=document.getElementById('edit-category');if(legacy)newCats=[legacy.value]}
    if(!newCats.length)newCats=[materialCategories(mat)[0]];
    const newCat=newCats[0];
    const newCalcType=document.getElementById('edit-calcType').value;
    const notes=(document.getElementById('edit-notes')?.value||'').trim();
    mat.name=name;mat.sku=document.getElementById('edit-sku').value.trim();mat.unit=document.getElementById('edit-unit').value;mat.pricePerUnit=price;mat.category=newCat;mat.categories=newCats;mat.calcType=newCalcType;mat.coveragePerUnit=coverage;mat.notes=notes;mat.lastUpdated=Date.now();
    if(api.getToken()){try{await api.updateMaterial(id,{name:mat.name,sku:mat.sku,unit:mat.unit,price_per_unit:price,category_id:window._categoryIdMap?.[newCat],coverage_per_unit:coverage,calc_type:newCalcType==='linear'?'linear_ft':'sqft',notes})}catch(e){console.warn('API:',e.message)}}
    addToRecent(id,mat.name,activeSupplier);
    editingId=null;saveAll();renderMaterialTable();notify('Updated','success')}
function addMaterial(){
    const filter=document.getElementById('categoryFilter').value;
    if(filter!=='All'){doAddMaterial(filter);return}
    // Show category picker modal
    const sel=document.getElementById('addMaterialCategory');
    sel.innerHTML=categories.map(c=>`<option>${c}</option>`).join('');
    openModal('addMaterialModal');
}
function addMaterialFromModal(){const cat=document.getElementById('addMaterialCategory').value;closeModal('addMaterialModal');doAddMaterial(cat)}
async function doAddMaterial(catName){pushUndo();const mats=materialsBySupplier[activeSupplier]||[];
    let newId=genId();
    if(api.getToken()&&window._supplierIdMap?.[activeSupplier]){
        try{const r=await api.createMaterial(window._supplierIdMap[activeSupplier],{name:'New Material',sku:'',unit:'each',price_per_unit:0,category_id:window._categoryIdMap?.[catName],coverage_per_unit:100,calc_type:'sqft'});if(r.material)newId=r.material.id}catch(e){console.warn('API:',e.message)}
    }
    const m={id:newId,name:'New Material',sku:'',unit:'each',pricePerUnit:0,category:catName,coveragePerUnit:100,calcType:'area',lastUpdated:Date.now()};
    mats.push(m);materialsBySupplier[activeSupplier]=mats;saveAll();editingId=String(m.id);document.getElementById('categoryFilter').value='All';document.getElementById('materialSearch').value='';renderMaterialTable()}
async function deleteMaterial(id){const mats=materialsBySupplier[activeSupplier]||[];const mat=mats.find(m=>String(m.id)===String(id));if(!mat||!confirm(`Delete "${mat.name}"?`))return;pushUndo();
    if(api.getToken()){try{await api.deleteMaterial(id)}catch(e){console.warn('API:',e.message)}}
    materialsBySupplier[activeSupplier]=mats.filter(m=>String(m.id)!==String(id));saveAll();renderMaterialTable();notify('Deleted','success')}
function resetToDefaults(){if(!confirm('Reset ALL data to defaults?'))return;pushUndo();resetAllToDefaults(false);editingId=null;renderSupplierTabs();populateCategoryFilter();renderMaterialTable();populateOrderPhaseFilter()}

// Duplicate
let duplicateMatId=null;
function openDuplicate(id){duplicateMatId=String(id);const sel=document.getElementById('duplicateTarget');sel.innerHTML=suppliers.filter(s=>s!==activeSupplier).map(s=>`<option>${s}</option>`).join('');if(!sel.innerHTML){notify('No other suppliers','error');return}openModal('duplicateModal')}
async function doDuplicate(){const target=document.getElementById('duplicateTarget').value;const src=(materialsBySupplier[activeSupplier]||[]).find(m=>String(m.id)===String(duplicateMatId));if(!src||!target)return;pushUndo();
    let newId=genId();
    if(api.getToken()){try{const r=await api.createMaterial(window._supplierIdMap?.[target],{name:src.name,sku:src.sku,unit:src.unit,price_per_unit:src.pricePerUnit,category_id:window._categoryIdMap?.[src.category],coverage_per_unit:src.coveragePerUnit,calc_type:src.calcType==='linear'?'linear_ft':'sqft'});if(r.material)newId=r.material.id}catch(e){console.warn('API:',e.message)}}
    if(!materialsBySupplier[target])materialsBySupplier[target]=[];materialsBySupplier[target].push({...src,id:newId});saveAll();closeModal('duplicateModal');notify(`Copied to ${target}`,'success')}

// Drag — invoked via delegation: `this` is the element (the <tr>), `e` is the event
function dragStart(e){const el=this;dragSrcId=el.dataset.id;el.classList.add('dragging');e.dataTransfer.effectAllowed='move'}
function dragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';const row=this.closest('tr');if(row?.dataset.id)row.classList.add('drag-over')}
function dragLeave(e){this.closest('tr')?.classList.remove('drag-over')}
function dragEnd(e){dragSrcId=null;document.querySelectorAll('.drag-over,.dragging').forEach(el=>el.classList.remove('drag-over','dragging'))}
function dropRow(e){e.preventDefault();const tid=this.closest('tr')?.dataset.id;document.querySelectorAll('.drag-over,.dragging').forEach(el=>el.classList.remove('drag-over','dragging'));if(!dragSrcId||!tid||dragSrcId===tid){dragSrcId=null;return}const mats=materialsBySupplier[activeSupplier]||[];const si=mats.findIndex(m=>String(m.id)===String(dragSrcId)),ti=mats.findIndex(m=>String(m.id)===String(tid));if(si<0||ti<0){dragSrcId=null;return}pushUndo();const[item]=mats.splice(si,1);mats.splice(ti,0,item);dragSrcId=null;saveAll();renderMaterialTable()}

// CSV
function parseCSVLine(line){const r=[];let c='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(q){if(ch==='"'&&line[i+1]==='"'){c+='"';i++}else if(ch==='"')q=false;else c+=ch}else{if(ch==='"')q=true;else if(ch===','){r.push(c.trim());c=''}else c+=ch}}r.push(c.trim());return r}
function handleCSVImport(event){const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=function(e){const lines=e.target.result.split(/\r?\n/).filter(l=>l.trim());if(lines.length<2){notify('Empty CSV','error');return}const hdr=parseCSVLine(lines[0]).map(h=>h.toLowerCase().replace(/[^a-z]/g,''));const ni=hdr.findIndex(h=>h==='name'),si=hdr.findIndex(h=>h==='sku'),ui=hdr.findIndex(h=>h==='unit'),pi=hdr.findIndex(h=>h.includes('price')),ci=hdr.findIndex(h=>h.includes('category')||h.includes('phase')),cvi=hdr.findIndex(h=>h.includes('coverage')),ti=hdr.findIndex(h=>h.includes('type')||h.includes('calctype'));if(ni===-1){notify('Need "name" column','error');return}pushUndo();let imp=0,upd=0,skip=0,csvDup=0;const mats=materialsBySupplier[activeSupplier]||[];const now=Date.now();const seenInCsv=new Set();const newMats=[],updatedMats=[];for(let i=1;i<lines.length;i++){const f=parseCSVLine(lines[i]);const name=f[ni]?.trim();if(!name){skip++;continue}const catRaw=f[ci]?.trim()||categories[0]||'Lath';const catList=catRaw.split(',').map(s=>s.trim()).filter(Boolean);catList.forEach(c=>{if(!categories.includes(c))categories.push(c)});const primaryCat=catList[0];const cov=parseFloat(f[cvi])||100;if(cov<=0){skip++;continue}const ct=f[ti]?.trim()||'area';const sku=f[si]?.trim()||'';const price=parseFloat(f[pi])||0;const unit=f[ui]?.trim()||'each';const calcType=CALC_TYPES.includes(ct)?ct:'area';const targetSku=normSku(sku);const targetNorm=normName(name);const rowKey=targetSku?'sku:'+targetSku:'name:'+targetNorm;if(seenInCsv.has(rowKey)){csvDup++;continue}seenInCsv.add(rowKey);let existing=targetSku?mats.find(m=>normSku(m.sku)===targetSku):null;if(!existing&&targetNorm)existing=mats.find(m=>normName(m.name)===targetNorm);if(existing){existing.name=name;existing.unit=unit;existing.pricePerUnit=price;existing.category=primaryCat;existing.categories=catList;existing.coveragePerUnit=cov;existing.calcType=calcType;existing.lastUpdated=now;upd++;updatedMats.push(existing)}else{const nm={id:genId(),name,sku,unit,pricePerUnit:price,category:primaryCat,categories:catList,coveragePerUnit:cov,calcType,lastUpdated:now};mats.push(nm);newMats.push(nm);imp++}}materialsBySupplier[activeSupplier]=mats;saveAll();populateCategoryFilter();renderMaterialTable();const parts=[];if(imp)parts.push(`${imp} added`);if(upd)parts.push(`${upd} updated`);if(csvDup)parts.push(`${csvDup} duplicate row${csvDup===1?'':'s'} in CSV`);if(skip)parts.push(`${skip} skipped`);notify(parts.join(', ')||'Nothing imported',(imp+upd)>0?'success':'error');if((imp+upd)>0&&api&&api.getToken&&api.getToken()){syncImportToBackend(newMats,updatedMats).catch(e=>console.warn('CSV sync error',e))}};reader.readAsText(file);event.target.value=''}

// Persist a freshly-imported batch to the backend so it survives a reload.
// Without this the CSV import lives only in localStorage and gets overwritten
// the next time loadAll() pulls fresh data from the API.
async function syncImportToBackend(newMats,updatedMats){
    const supplierId=window._supplierIdMap?.[activeSupplier];
    if(!supplierId){notify('Imported locally only — supplier not synced to backend','info');return}
    const calcTypeApi=ct=>ct==='linear'?'linear_ft':'sqft';
    // Ensure every category we need has a backend id; create any that are missing.
    const neededCats=new Set();
    [...newMats,...updatedMats].forEach(m=>materialCategories(m).forEach(c=>neededCats.add(c)));
    for(const c of neededCats){
        if(!window._categoryIdMap?.[c]){
            try{const r=await api.createCategory(c);if(r.category&&window._categoryIdMap)window._categoryIdMap[c]=r.category.id}
            catch(e){console.warn('createCategory failed',c,e.message)}
        }
    }
    const payload=m=>({name:m.name,sku:m.sku||'',unit:m.unit||'each',price_per_unit:m.pricePerUnit,category_id:window._categoryIdMap?.[m.category],coverage_per_unit:m.coveragePerUnit,calc_type:calcTypeApi(m.calcType),notes:m.notes||''});
    const total=newMats.length+updatedMats.length;
    notify(`Syncing ${total} item${total===1?'':'s'} to backend…`,'info');
    let ok=0,fail=0;
    for(const m of newMats){
        try{const r=await api.createMaterial(supplierId,payload(m));if(r.material&&r.material.id)m.id=r.material.id;ok++}
        catch(e){console.warn('createMaterial failed',m.name,e.message);fail++}
    }
    for(const m of updatedMats){
        try{await api.updateMaterial(m.id,payload(m));ok++}
        catch(e){console.warn('updateMaterial failed',m.name,e.message);fail++}
    }
    saveAll();
    if(fail===0)notify(`Synced ${ok} item${ok===1?'':'s'} to backend`,'success');
    else notify(`Backend sync: ${ok} ok, ${fail} failed (see console)`,fail>ok?'error':'info');
}
window.syncImportToBackend=syncImportToBackend;
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
    const colors=['#d29922','#8b949e','#a371f7','#f778ba','#3fb950','#db6d28','#39d2c0','#7ee787'];
    Object.entries(scoped).forEach(([scope,phases])=>{
        phases.forEach((cat,i)=>{
            const ci=categories.indexOf(cat)%8;
            html+=`<label class="phase-chip" data-on-click="togglePhaseChip"><input type="checkbox" value="${escAttr(cat)}"><span class="dot" style="background:${colors[ci]}"></span>${escHtml(cat)}</label>`;
        });
    });
    wrap.innerHTML=html;
    updatePhaseOptions();
}

function restorePhaseSelection(){
    if(!savedPhaseSelection)return;
    document.querySelectorAll('#phaseCheckboxes input[type="checkbox"]').forEach(cb=>{
        const ch=savedPhaseSelection.includes(cb.value);
        cb.checked=ch;cb.closest('.phase-chip').classList.toggle('checked',ch);
    });
    updatePhaseOptions();
}

function toggleCheckStyle(label){label.classList.toggle('checked',label.querySelector('input').checked);updatePhaseOptions()}

function updatePhaseOptions(){
    const checked=document.querySelectorAll('#phaseCheckboxes input[type="checkbox"]:checked');
    const selected=[...checked].map(cb=>cb.value);
    const hasStucco=selected.some(p=>['Lath','Gray Coat','Color Coat'].includes(p));
    const hasStone=selected.includes('Stone');
    const hasDrywall=selected.includes('Drywall');
    const hasPaint=selected.includes('Painting');
    document.getElementById('optStucco').classList.toggle('hidden',!hasStucco);
    document.getElementById('optStone').classList.toggle('hidden',!hasStone);
    document.getElementById('optDrywall').classList.toggle('hidden',!hasDrywall);
    document.getElementById('optPainting').classList.toggle('hidden',!hasPaint);
    if(hasDrywall)renderDrywallAreaRows();
}

const DW_AREA_LABELS=['Walls','Ceilings','Garage','Shower/Wet Areas','Bedroom','Kitchen','Bathroom','Hallway','Other'];

function getDrywallSheets(){
    const supplier=document.getElementById('calcSupplier').value;
    let sheets=[];
    if(supplier==='All Suppliers'){
        const seen=new Set();
        Object.values(materialsBySupplier).flat().filter(m=>m.isDrywallSheet).forEach(m=>{
            if(!seen.has(m.name)){seen.add(m.name);sheets.push(m)}
        });
    }else{
        sheets=(materialsBySupplier[supplier]||[]).filter(m=>m.isDrywallSheet);
    }
    return sheets;
}

function renderDrywallAreaRows(){
    const wrap=document.getElementById('drywallAreaRows');
    if(!wrap)return;
    const sheets=getDrywallSheets();
    if(!sheets.length){wrap.innerHTML='<span class="hint">No drywall sheet types found for this supplier.</span>';return}
    // If no rows yet, add one default row
    if(!wrap.children.length)addDrywallArea();
}

function addDrywallArea(label,sheetSku,val,unit){
    const wrap=document.getElementById('drywallAreaRows');
    if(!wrap)return;
    const sheets=getDrywallSheets();
    if(!sheets.length)return;
    const row=document.createElement('div');
    row.className='dw-area-row';
    const labelOpts=DW_AREA_LABELS.map(l=>`<option${l===(label||'Walls')?' selected':''}>${l}</option>`).join('');
    const sheetOpts=sheets.map(s=>`<option value="${escAttr(s.sku)}"${s.sku===(sheetSku||sheets[0].sku)?' selected':''}>${escHtml(s.name)}</option>`).join('');
    row.innerHTML=`<select class="dw-area-label">${labelOpts}</select>`+
        `<select class="dw-area-sheet">${sheetOpts}</select>`+
        `<input type="number" class="dw-area-val" value="${val||''}" placeholder="0" min="0">`+
        `<select class="dw-area-unit"><option value="sqft"${(unit||'sqft')==='sqft'?' selected':''}>sqft</option><option value="lf"${unit==='lf'?' selected':''}>lf</option></select>`+
        `<button type="button" class="dw-remove" data-on-click="removeDwAreaRow" title="Remove">×</button>`;
    wrap.appendChild(row);
}

function getDrywallAreas(){
    const rows=document.querySelectorAll('#drywallAreaRows .dw-area-row');
    const sheets=getDrywallSheets();
    const skuMap={};sheets.forEach(s=>{skuMap[s.sku]=s});
    const areas=[];
    rows.forEach(row=>{
        const sku=row.querySelector('.dw-area-sheet')?.value;
        const val=parseFloat(row.querySelector('.dw-area-val')?.value)||0;
        const unit=row.querySelector('.dw-area-unit')?.value||'sqft';
        const label=row.querySelector('.dw-area-label')?.value||'';
        if(sku&&val>0){
            const sheet=skuMap[sku];
            // Convert lf to sqft: linear ft × sheet height (4ft for standard sheets)
            const sqft=unit==='lf'?val*4:val;
            areas.push({name:sheet?.name||'',sku,sqft,label,rawVal:val,unit});
        }
    });
    return areas;
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

function calcForSupplier(supplier,waste,selectedPhases,opts={}){
    const w=1+waste/100;
    const paintCoats=opts.paintCoats||1;
    const drywallAreas=opts.drywallAreas||[];
    const phaseDims=opts.phaseDims||{}; // {category: {sqft, linearFt}}

    // Drywall area handling
    const hasDrywallAreas=drywallAreas.length>0&&selectedPhases?.includes('Drywall');
    const totalDrywallSqft=hasDrywallAreas?drywallAreas.reduce((s,a)=>s+(a.sqft||0),0)*w:0;
    const sheetSqftMap={};
    if(hasDrywallAreas)drywallAreas.forEach(a=>{sheetSqftMap[a.sku]=(a.sqft||0)*w});

    // Stucco phases share dimensions
    const stuccoPhases=['Lath','Gray Coat','Color Coat'];

    let mats=materialsBySupplier[supplier]||[];
    if(selectedPhases?.length>0)mats=mats.filter(m=>selectedPhases.includes(m.category));
    if(hasDrywallAreas)mats=mats.filter(m=>!m.isDrywallSheet||sheetSqftMap[m.sku]!==undefined);

    const phases={};categories.forEach(c=>phases[c]={total:0,count:0});let materialTotal=0;
    const items=mats.map(m=>{
        let base;
        if(m.isDrywallSheet&&hasDrywallAreas){
            base=sheetSqftMap[m.sku]||0;
        }else if(m.category==='Drywall'&&!m.isDrywallSheet&&hasDrywallAreas){
            const dwDims=phaseDims['Drywall']||{};
            base=m.calcType==='linear'?(dwDims.linearFt||0)*w:totalDrywallSqft;
        }else{
            // Look up per-phase dimensions; stucco phases share 'Stucco' dims
            const dimKey=stuccoPhases.includes(m.category)?'Stucco':m.category;
            const dims=phaseDims[dimKey]||{sqft:0,linearFt:0};
            base=m.calcType==='linear'?(dims.linearFt||0)*w:(dims.sqft||0)*w;
        }
        let qty=base>0?Math.ceil(base/m.coveragePerUnit):0;
        if(m.isPaint&&paintCoats>1)qty=qty*paintCoats;
        const lineTotal=qty*m.pricePerUnit;
        if(phases[m.category]){phases[m.category].total+=lineTotal;phases[m.category].count++}
        materialTotal+=lineTotal;
        return{id:m.id,name:m.name,sku:m.sku,unit:m.unit,pricePerUnit:m.pricePerUnit,category:m.category,coveragePerUnit:m.coveragePerUnit,calcType:m.calcType,isPaint:m.isPaint,isDrywallSheet:m.isDrywallSheet,qty,lineTotal};
    });
    return{supplier,phases,items,materialTotal};
}

function calculateJob(){
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

    const selectedPhases=getSelectedPhases();
    if(!selectedPhases.length){notify('Select at least one phase','error');return}

    // Gather per-scope dimensions
    const phaseDims={};
    const stuccoSqft=parseFloat(document.getElementById('calcStuccoSqft')?.value)||0;
    const stuccoLf=parseFloat(document.getElementById('calcStuccoLinearFt')?.value)||0;
    if(stuccoSqft>0||stuccoLf>0)phaseDims['Stucco']={sqft:stuccoSqft,linearFt:stuccoLf};
    const stoneSqft=parseFloat(document.getElementById('calcStoneSqft')?.value)||0;
    const stoneLf=parseFloat(document.getElementById('calcStoneLinearFt')?.value)||0;
    if(stoneSqft>0||stoneLf>0)phaseDims['Stone']={sqft:stoneSqft,linearFt:stoneLf};
    const paintSqft=parseFloat(document.getElementById('calcPaintSqft')?.value)||0;
    if(paintSqft>0)phaseDims['Painting']={sqft:paintSqft,linearFt:0};

    const drywallAreas=selectedPhases.includes('Drywall')?getDrywallAreas():[];

    // Calculate total sqft across all scopes (for labor calc)
    const totalSqft=stuccoSqft+stoneSqft+paintSqft+drywallAreas.reduce((s,a)=>s+(a.sqft||0),0);

    // Validate at least some dimensions entered
    if(totalSqft<=0&&stuccoLf<=0&&stoneLf<=0&&!drywallAreas.length){notify('Enter dimensions for selected phases','error');return}

    const isAll=supplier==='All Suppliers';
    const calcOpts={paintCoats,drywallAreas,phaseDims};

    let r;
    if(isAll){
        const phases={};categories.forEach(c=>phases[c]={total:0,count:0});
        let allItems=[];let materialTotal=0;
        const bestPerPhase={};

        // Honor user supplier overrides (orderV2State.userPicks) when present.
        // Fall back to cheapest supplier for any phase the user hasn't overridden.
        const picks=(orderV2State&&orderV2State.userPicks)||{};
        selectedPhases.forEach(phase=>{
            let chosenSupplier=null,chosenTotal=0,chosenItems=[];
            const pickedSupplier=picks[phase];
            if(pickedSupplier&&suppliers.includes(pickedSupplier)&&getSupplierPhases(pickedSupplier).includes(phase)){
                const result=calcForSupplier(pickedSupplier,waste,[phase],calcOpts);
                if(result.materialTotal>0){
                    chosenSupplier=pickedSupplier;chosenTotal=result.materialTotal;chosenItems=result.items;
                }
            }
            if(!chosenSupplier){
                let bestTotal=Infinity;
                suppliers.forEach(s=>{
                    const sp=getSupplierPhases(s);
                    if(!sp.includes(phase))return;
                    const result=calcForSupplier(s,waste,[phase],calcOpts);
                    if(result.materialTotal>0&&result.materialTotal<bestTotal){
                        bestTotal=result.materialTotal;chosenSupplier=s;chosenItems=result.items;chosenTotal=result.materialTotal;
                    }
                });
            }
            if(chosenSupplier){
                bestPerPhase[phase]=chosenSupplier;
                chosenItems.forEach(item=>{allItems.push(item)});
                phases[phase]={total:chosenTotal,count:chosenItems.length};
                materialTotal+=chosenTotal;
            }
        });

        const uniqueSuppliers=[...new Set(Object.values(bestPerPhase))];
        const supplierLabel=uniqueSuppliers.length===1?uniqueSuppliers[0]:'Best per phase';

        r={supplier:supplierLabel,phases,items:allItems,materialTotal,totalSqft,waste,profitPct,taxPct,laborRate,deliveryFee,ccFeePct,paintCoats,selectedPhases,drywallAreas,phaseDims,bestPerPhase};
    }else{
        const base=calcForSupplier(supplier,waste,selectedPhases,calcOpts);
        r={...base,totalSqft,waste,profitPct,taxPct,laborRate,deliveryFee,ccFeePct,paintCoats,selectedPhases,drywallAreas,phaseDims};
    }

    r.taxAmount=r.materialTotal*(taxPct/100);r.materialPlusTax=r.materialTotal+r.taxAmount;r.laborTotal=laborRate*totalSqft;r.deliveryTotal=deliveryFee;
    // Business expenses (recurring subscriptions, insurance, etc.) folded into the cost basis.
    r.businessExpensesTotal=businessExpensePerJob();
    r.subtotalBeforeProfit=r.materialPlusTax+r.laborTotal+r.deliveryTotal+r.businessExpensesTotal;r.profitAmount=r.subtotalBeforeProfit*(profitPct/100);
    r.sellingBeforeCC=r.subtotalBeforeProfit+r.profitAmount;r.ccFeeAmount=r.sellingBeforeCC*(ccFeePct/100);r.sellingPrice=r.sellingBeforeCC+r.ccFeeAmount;
    r.grossMargin=r.sellingPrice>0?(r.profitAmount/r.sellingPrice*100):0;
    currentCalc=r;renderCalcResults(r);

    // Show v2 supplier comparison picker on the calculator when in All-Suppliers mode.
    // The same renderer is used on the Orders page; here we target the calculator's
    // #comparisonSection so the client can see the per-phase quotes inline.
    const compEl=document.getElementById('comparisonSection');
    if(compEl){
        if(isAll){renderOrderComparison(r,'comparisonSection')}else{compEl.innerHTML=''}
    }
}

// ===== Calculator v2 helpers =====
// Pretty-print integers with thousands separators
function v2FmtInt(n){return Number(n||0).toLocaleString('en-US',{maximumFractionDigits:0})}
// Pretty-print currency without decimals (display headlines)
function v2FmtMoney(n){return '$'+Math.round(Number(n||0)).toLocaleString('en-US')}
// Pretty-print currency with 2 decimals
function v2FmtMoney2(n){return '$'+Number(n||0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
// Map a category name to a v2-chip class (best effort)
function v2ChipClass(cat){
    const n=String(cat||'').toLowerCase().trim();
    if(n==='lath')return'lath';
    if(n==='gray coat'||n==='grey coat'||n==='brown coat')return'gray-coat';
    if(n==='color coat'||n==='colour coat'||n==='finish coat')return'color-coat';
    if(n==='accessories')return'accessories';
    if(n==='painting')return'painting';
    if(n==='drywall')return'drywall';
    if(n==='aggregate')return'aggregate';
    if(n==='stone')return'stone';
    return'aggregate';
}
// Pretty unit suffix for an item (singular slug)
function v2ItemUnitSlug(item){
    const u=String(item.unit||'').toLowerCase();
    return u||'each';
}
// Coverage display string ("432 sqft/roll", "5,000/box", "per cu yd")
function v2CoverageStr(item){
    const cov=item.coveragePerUnit;
    if(!cov||cov<=0)return '—';
    const u=item.unit||'unit';
    const unit=item.calcType==='linear'?'lf':'sqft';
    return `${v2FmtInt(cov)} ${unit}/${u}`;
}
// Sum total sqft of all dimension scopes for "Net Area"
function v2TotalScopeSqft(r){
    if(!r)return 0;
    const pd=r.phaseDims||{};
    let total=(pd.Stucco?.sqft||0)+(pd.Stone?.sqft||0)+(pd.Painting?.sqft||0);
    (r.drywallAreas||[]).forEach(a=>{total+=a.sqft||0});
    return total;
}
// Update top header (eyebrow / title / subtitle) from form fields and current calc
function updateCalcHeader(){
    const name=document.getElementById('calcProjectName')?.value?.trim();
    const addr=document.getElementById('calcProjectAddress')?.value?.trim();
    const titleEl=document.getElementById('calcV2Title');
    if(titleEl)titleEl.textContent=name||'New Estimate';
    const subAddr=document.getElementById('calcV2SubAddress');
    if(subAddr)subAddr.textContent=addr||'Add an address';
    // Build a quick scope summary from selected phases
    const scopeEl=document.getElementById('calcV2SubScope');
    if(scopeEl){
        const sel=getSelectedPhases();
        scopeEl.textContent=sel.length?sel.slice(0,3).join(', '):'Stucco re-coat';
    }
    const areaEl=document.getElementById('calcV2SubArea');
    if(areaEl){
        const total=v2TotalScopeSqft(currentCalc)||(parseFloat(document.getElementById('calcStuccoSqft')?.value)||0)+(parseFloat(document.getElementById('calcStoneSqft')?.value)||0)+(parseFloat(document.getElementById('calcPaintSqft')?.value)||0);
        areaEl.textContent=total>0?`${v2FmtInt(total)} sq·ft`:'Enter dimensions';
    }
}
window.updateCalcHeader=updateCalcHeader;

// Duplicate-button stub: shallow-clone the current form/save
function duplicateCurrentJob(){
    if(!currentCalc){notify('Calculate first','error');return}
    // Surface the Save Job modal pre-filled
    const el=document.getElementById('saveJobName');
    if(el)el.value=(document.getElementById('calcProjectName')?.value||'Untitled')+' (copy)';
    const tmpl=document.getElementById('saveAsTemplate');if(tmpl)tmpl.checked=false;
    openModal('saveJobModal');
}
window.duplicateCurrentJob=duplicateCurrentJob;

// Collapse a phase card on header bar click
function togglePhaseCardCollapse(ev){
    if(!ev)ev=window.event;
    // Don't toggle if click landed on an input or the total or the chevron's inner inputs
    const tgt=ev?.target;
    if(tgt&&(tgt.closest('input')||tgt.closest('button'))){return}
    const card=this.closest?.('.calc-v2-phase-card')||(tgt&&tgt.closest('.calc-v2-phase-card'));
    if(card)card.classList.toggle('collapsed');
}
window.togglePhaseCardCollapse=togglePhaseCardCollapse;

// Renders the result region: phase cards + summary sidebar
function renderCalcResults(r){
    document.getElementById('calcResults').classList.remove('hidden');
    const bpp=r.bestPerPhase||{};

    // Update header (title/subtitle) from current state
    updateCalcHeader();

    // Total sqft for downstream formulas (per-sqft pricing, labor total, etc.)
    const totalSqft=v2TotalScopeSqft(r);

    // Build phase cards
    const stuccoPhases=['Lath','Gray Coat','Color Coat'];
    const phaseDims=r.phaseDims||{};
    const activePhases=categories.filter(cat=>r.phases[cat]&&r.phases[cat].count>0);
    const cardsHtml=activePhases.map((cat,idx)=>{
        const p=r.phases[cat];
        const items=r.items.filter(i=>i.category===cat);
        const chipCls=v2ChipClass(cat);
        const idxStr=String(idx+1).padStart(2,'0');
        const supLabel=bpp[cat]?`<span class="calc-v2-phase-count-sep">·</span><span class="calc-v2-phase-count" style="font-style:italic">${escHtml(bpp[cat])}</span>`:'';

        // Mini-pills: derive from phaseDims for the appropriate dim key
        const dimKey=stuccoPhases.includes(cat)?'Stucco':cat;
        const dims=phaseDims[dimKey]||{};
        const miniPills=[];
        if((dims.sqft||0)>0){
            miniPills.push(v2MiniPill(cat==='Drywall'?'CEILING/WALL AREA':'WALL AREA',v2FmtInt(dims.sqft),'sq·ft'));
        }
        if((dims.linearFt||0)>0){
            const lblLF=cat==='Lath'?'CORNER BEAD':(cat==='Stone'?'CORNERS':'LINEAR');
            miniPills.push(v2MiniPill(lblLF,v2FmtInt(dims.linearFt),'lin·ft'));
        }
        if(cat==='Gray Coat'){
            // Thickness is a fixed display in spec — we don't model it; show a static default
            miniPills.push(v2MiniPill('THICKNESS','3/8','in'));
        }
        if(cat==='Painting'&&r.paintCoats>1){
            miniPills.push(v2MiniPill('COATS',String(r.paintCoats),'x'));
        }

        const rowsHtml=items.map(i=>{
            const unitSlug=v2ItemUnitSlug(i);
            return `<tr>
                <td class="cell-sku calc-v2-cell-sku">${escHtml(i.sku||'—')}</td>
                <td class="cell-item">
                    <div class="calc-v2-cell-item-name">${escHtml(i.name)}</div>
                    <div class="calc-v2-cell-item-unit">${escHtml(unitSlug)}</div>
                </td>
                <td class="cell-cov calc-v2-cell-coverage">${v2CoverageStr(i)}</td>
                <td class="calc-v2-cell-qty">
                    <input type="number" class="calc-v2-qty-input" value="${i.qty}" min="0"
                           data-on-change="overrideCalcQty" data-args="${escAttr(i.id)}">
                </td>
                <td class="calc-v2-cell-each">${v2FmtMoney2(i.pricePerUnit)}</td>
                <td class="calc-v2-cell-total calc-line-total" data-id="${escAttr(i.id)}">${v2FmtMoney2(i.lineTotal)}</td>
            </tr>`;
        }).join('');

        return `<section class="calc-v2-phase-card">
            <div class="calc-v2-phase-bar" data-on-click="togglePhaseCardCollapse">
                <span class="calc-v2-phase-index">${idxStr}</span>
                <span class="calc-v2-phase-meta">
                    <span class="v2-chip ${chipCls}">${escHtml(cat)}${cat==='Lath'?' Phase':''}</span>
                    <span class="calc-v2-phase-count"><span class="calc-v2-phase-count-sep">·</span>${p.count} item${p.count===1?'':'s'}</span>
                    ${supLabel}
                </span>
                <span class="calc-v2-phase-right">
                    ${miniPills.join('')}
                    <span class="calc-v2-phase-chevron" aria-hidden="true">&#8963;</span>
                    <span class="calc-v2-phase-total">${v2FmtMoney(p.total)}</span>
                </span>
            </div>
            <div class="calc-v2-phase-body">
                <table class="calc-v2-phase-table">
                    <colgroup>
                        <col class="col-sku"><col class="col-item"><col class="col-cov">
                        <col class="col-qty"><col class="col-each"><col class="col-total">
                    </colgroup>
                    <thead><tr>
                        <th class="col-h-sku">SKU</th>
                        <th class="col-h-item">Item</th>
                        <th class="col-h-cov">Coverage</th>
                        <th class="al-right">Qty</th>
                        <th class="al-right">Each</th>
                        <th class="al-right">Total</th>
                    </tr></thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
        </section>`;
    }).join('');
    document.getElementById('phaseCards').innerHTML=cardsHtml;

    // Hide legacy result sub-views; they live for layout but we keep them empty
    const breakdown=document.getElementById('calcBreakdown');if(breakdown)breakdown.innerHTML='';
    const total=document.getElementById('calcGrandTotal');if(total)total.innerHTML='';
    const sg=document.getElementById('summaryGrid');if(sg)sg.innerHTML='';

    // ===== Summary sidebar =====
    const sumEmpty=document.getElementById('calcV2SummaryEmpty');
    const sumContent=document.getElementById('calcV2SummaryContent');
    if(sumEmpty)sumEmpty.classList.add('hidden');
    if(sumContent)sumContent.classList.remove('hidden');

    const customerPrice=r.sellingPrice||0;
    const perSqft=totalSqft>0?(customerPrice/totalSqft):0;
    const cpEl=document.getElementById('calcV2CustomerPrice');
    if(cpEl)cpEl.textContent=v2FmtMoney(customerPrice);
    const psEl=document.getElementById('calcV2PerSqft');
    if(psEl)psEl.textContent=v2FmtMoney2(perSqft);

    // Cost stack — spec §6.3 / §10 canonical order: Materials → Labor → Overhead → Markup → Total cost.
    // Tax / Delivery / CC Fee remain in the data model and surface on the bid/order outputs but not in this sidebar.
    const totalItems=(r.items||[]).reduce((s,i)=>s+(i.qty>0?1:0),0);
    const totalPhases=activePhases.length;
    // Overhead: combine ancillary line items (tax + delivery + cc fee) under one "Overhead" row so the spec's
    // canonical spine is preserved while no data is lost. If none of those exist, fall back to 8% of materials.
    const overheadFromExtras=(r.taxAmount||0)+(r.deliveryTotal||0)+(r.ccFeeAmount||0)+(r.businessExpensesTotal||0);
    const overheadPct=0.08;
    const overheadAmount=overheadFromExtras>0?overheadFromExtras:(r.materialTotal||0)*overheadPct;
    const subParts=[];
    if((r.taxAmount||0)>0)subParts.push('tax');
    if((r.deliveryTotal||0)>0)subParts.push('delivery');
    if((r.ccFeeAmount||0)>0)subParts.push('CC fee');
    if((r.businessExpensesTotal||0)>0)subParts.push('business expenses');
    const overheadSub=subParts.length?subParts.join(' + '):`${(overheadPct*100).toFixed(1)}% of materials`;
    const totalCost=(r.materialTotal||0)+(r.laborTotal||0)+overheadAmount+(r.profitAmount||0);
    const rows=[];
    rows.push({label:'Materials',sub:`${totalItems} item${totalItems===1?'':'s'}, ${totalPhases} phase${totalPhases===1?'':'s'}`,amt:v2FmtMoney2(r.materialTotal)});
    rows.push({label:'Labor',sub:`${v2FmtInt(totalSqft)} sqft @ ${v2FmtMoney2(r.laborRate||0)}/sqft`,amt:v2FmtMoney2(r.laborTotal||0)});
    rows.push({label:'Overhead',sub:overheadSub,amt:v2FmtMoney2(overheadAmount)});
    rows.push({label:'Markup',sub:`${r.profitPct}% on cost`,amt:v2FmtMoney2(r.profitAmount)});

    let stackHtml=rows.map(row=>`
        <div class="calc-v2-cost-row">
            <div>
                <div class="calc-v2-cost-label">${escHtml(row.label)}</div>
                <div class="calc-v2-cost-sub">${escHtml(row.sub)}</div>
            </div>
            <div class="calc-v2-cost-amount">${row.amt}</div>
        </div>`).join('');
    stackHtml+=`<div class="calc-v2-cost-row calc-v2-cost-total">
        <div class="calc-v2-cost-label">Total cost</div>
        <div class="calc-v2-cost-amount">${v2FmtMoney(totalCost)}</div>
    </div>`;
    document.getElementById('calcV2CostStack').innerHTML=stackHtml;

    // Profit block
    const profitAmtEl=document.getElementById('calcV2ProfitAmount');
    if(profitAmtEl)profitAmtEl.textContent=v2FmtMoney(r.profitAmount||0);
    const profitPctEl=document.getElementById('calcV2ProfitPct');
    const margin=r.grossMargin||0;
    if(profitPctEl)profitPctEl.textContent=`${margin.toFixed(1)}%`;
    // Progress bar fill: scale margin (0-50%) to 0-100% bar width
    const fillEl=document.getElementById('calcV2ProgressFill');
    if(fillEl){
        const pct=Math.max(0,Math.min(50,margin))/50*100;
        fillEl.style.width=pct+'%';
    }
}

// Helper to build a mini-pill markup for the phase header bar
function v2MiniPill(label,value,unit){
    return `<span class="calc-v2-mini-pill">
        <span class="calc-v2-mini-pill-label">${escHtml(label)}</span>
        <span class="calc-v2-mini-pill-value">${escHtml(value)}<span class="calc-v2-mini-pill-value-unit">${escHtml(unit||'')}</span></span>
    </span>`;
}

function renderComparison(waste,selectedPhases,calcOpts){
    // Only include suppliers that actually carry at least one of the selected phases
    const relevantSuppliers=suppliers.filter(s=>{
        const sp=getSupplierPhases(s);
        return selectedPhases.some(p=>sp.includes(p));
    });

    if(relevantSuppliers.length<2){document.getElementById('comparisonSection').innerHTML='';return}

    const results=relevantSuppliers.map(s=>{const r=calcForSupplier(s,waste,selectedPhases,calcOpts);return{supplier:s,total:r.materialTotal,phases:r.phases}});
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

// ===== ORDER (printable supplier order form — comparison-first flow) =====
// This page is the canonical deliverable: contractors print a per-supplier
// material-purchase sheet. Bid/proposal flow has been deleted entirely.
//
// Flow:
//   1. User clicks "Generate order" on calculator.
//   2. prepareOrderFromCalc() decides:
//        - If currentCalc.supplier === 'All Suppliers' / 'Best per phase' /
//          a multi-supplier calc → render comparison view so the user picks
//          a supplier per phase.
//        - Else → render the printable order directly for that single supplier.
//   3. confirmOrderComparison() collects radio selections and calls renderOrderForm.
//   4. renderOrderForm(r, selections) writes the printable letterhead +
//      one section per supplier with subtotal, plus a grand total.
let orderV2State = { _comparison: null, userPicks: {} };

function orderV2ChipClass(cat){return String(cat||'').toLowerCase().replace(/\s+/g,'-')}

// Order number "O-NNNN" derived from r.id (mirrors job slug J-NNNN).
function calcOrderNumber(r){
    if(r&&r.id){
        const digits=String(r.id).replace(/\D/g,'');
        if(digits)return 'O-'+digits.slice(-4).padStart(4,'0');
    }
    const pn=(document.getElementById('calcProjectName')?.value||'').trim();
    if(pn){const slug=pn.replace(/[^A-Za-z0-9]/g,'').slice(0,4).toUpperCase();return `O-${slug||'2419'}`}
    const d=new Date();return `O-${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}
function orderV2OrderNumber(){return calcOrderNumber(currentCalc)}
function orderV2PoNumber(base,idx){return `${base||orderV2OrderNumber()}-${String.fromCharCode(65+(idx%26))}`}

// Reconstruct calc opts from a calc result so per-supplier recalculation can
// reproduce the same item set.
function orderV2CalcOpts(r){
    return {
        paintCoats:r.paintCoats||1,
        drywallAreas:r.drywallAreas||[],
        phaseDims:r.phaseDims||{}
    };
}

// Phases present in the calc (only those with items).
function orderV2PhasesPresent(r){
    if(!r)return [];
    const sel=r.selectedPhases||categories;
    return sel.filter(p=>{
        const ph=r.phases?.[p];
        return ph&&ph.count>0;
    });
}

// For "All Suppliers" / multi-supplier mode: compute every supplier × phase
// combination so we can build the comparison table.
// Returns: { phase: [ {supplier, total, items}, ... ] sorted ascending by total }
function orderV2BuildComparison(r){
    if(!r)return {};
    const opts=orderV2CalcOpts(r);
    const waste=r.waste||0;
    const phases=r.selectedPhases||orderV2PhasesPresent(r);
    const out={};
    phases.forEach(phase=>{
        const rows=[];
        suppliers.forEach(s=>{
            const sp=getSupplierPhases(s);
            if(!sp.includes(phase))return;
            const res=calcForSupplier(s,waste,[phase],opts);
            if(res.materialTotal>0){
                rows.push({supplier:s,total:res.materialTotal,items:res.items});
            }
        });
        rows.sort((a,b)=>a.total-b.total);
        if(rows.length)out[phase]=rows;
    });
    return out;
}

// ----- Comparison view: pick supplier per phase -----
function renderOrderComparison(r,targetId){
    const wrap=document.getElementById(targetId||'orderCompareTable');
    if(!wrap)return;
    const data=orderV2BuildComparison(r);
    const phases=Object.keys(data);
    if(!phases.length){
        wrap.innerHTML='<div class="order-v2-compare-empty">No supplier carries the selected phases. Adjust the calculation and try again.</div>';
        orderV2State._comparison=data;
        return;
    }
    const picks=(orderV2State&&orderV2State.userPicks)||{};
    const onCalcPage=targetId==='comparisonSection';
    let html='';
    // Inline header when rendering into the calculator (Orders page has its own header).
    if(onCalcPage){
        html+='<div class="order-v2-compare-head">'
            +'<p class="order-v2-compare-eyebrow">SUPPLIER COMPARISON</p>'
            +'<h3 class="order-v2-compare-title">Cheapest supplier per phase</h3>'
            +'<p class="order-v2-compare-sub">Pre-selected by lowest price. Click a different supplier to override; phase totals and order form update automatically.</p>'
        +'</div>';
    }
    phases.forEach(phase=>{
        const rows=data[phase];
        const cls=orderV2ChipClass(phase);
        const pickedSupplier=picks[phase];
        html+='<div class="order-v2-compare-phase">'
            +'<div class="order-v2-compare-phase-head">'
                +'<span class="v2-chip '+escAttr(cls)+'">'+escHtml(phase)+'</span>'
                +'<span class="order-v2-compare-phase-sub">'+rows.length+' supplier'+(rows.length===1?'':'s')+' carry this phase</span>'
            +'</div>'
            +'<div class="order-v2-compare-options">';
        rows.forEach((row,i)=>{
            const isCheapest=i===0;
            const isChecked=pickedSupplier?(row.supplier===pickedSupplier):isCheapest;
            const radioId='cmp-'+cls+'-'+i;
            html+='<label class="order-v2-compare-option'+(isCheapest?' is-cheapest':'')+(isChecked?' is-selected':'')+'" for="'+escAttr(radioId)+'">'
                +'<input type="radio" id="'+escAttr(radioId)+'" name="cmp-'+escAttr(cls)+'" value="'+escAttr(row.supplier)+'" data-phase="'+escAttr(phase)+'" data-on-change="calcSupplierPickChange"'+(isChecked?' checked':'')+'>'
                +'<span class="order-v2-compare-option-body">'
                    +'<span class="order-v2-compare-option-supplier">'+escHtml(row.supplier)+'</span>'
                    +(isCheapest?'<span class="order-v2-compare-cheapest-badge">Cheapest</span>':'')
                +'</span>'
                +'<span class="order-v2-compare-option-price">'+fmt(row.total)+'</span>'
            +'</label>';
        });
        html+='</div></div>';
    });
    wrap.innerHTML=html;
    orderV2State._comparison=data;
}

// Radio handler used on the calculator's inline comparison. Records the user's
// per-phase supplier override and re-runs calculateJob so phase cards reflect
// the chosen supplier's items + the new total propagates to the summary panel.
function calcSupplierPickChange(event){
    const input=event&&event.target?event.target:null;
    if(!input||input.type!=='radio')return;
    const phase=input.getAttribute('data-phase');
    const supplier=input.value;
    if(!phase||!supplier)return;
    orderV2State.userPicks=orderV2State.userPicks||{};
    orderV2State.userPicks[phase]=supplier;
    if(typeof calculateJob==='function')calculateJob();
}
window.calcSupplierPickChange=calcSupplierPickChange;

// ----- Confirm comparison: read radio selections, render printable form -----
function confirmOrderComparison(){
    if(!currentCalc){notify('Calculate first','error');return}
    const data=orderV2State._comparison||orderV2BuildComparison(currentCalc);
    const selections={}; // { supplierName: [phase, ...] }
    Object.keys(data).forEach(phase=>{
        const cls=orderV2ChipClass(phase);
        const checked=document.querySelector('input[name="cmp-'+cls+'"]:checked');
        const supplier=checked?checked.value:(data[phase][0]&&data[phase][0].supplier);
        if(!supplier)return;
        if(!selections[supplier])selections[supplier]=[];
        selections[supplier].push(phase);
    });
    if(!Object.keys(selections).length){notify('Pick a supplier for each phase','error');return}
    document.getElementById('orderComparison').classList.add('hidden');
    document.getElementById('orderContent').classList.remove('hidden');
    renderOrderForm(currentCalc,selections);
}

// ----- Render the printable order form -----
// selections: { supplierName: [phase, phase, ...] }
function renderOrderForm(r,selections){
    if(!r)return;
    const body=document.getElementById('orderTableBody');
    const totalsEl=document.getElementById('orderTotals');
    if(!body||!totalsEl)return;

    const pn=(document.getElementById('calcProjectName')?.value||'').trim();
    const pa=(document.getElementById('calcProjectAddress')?.value||'').trim();
    const orderNum=calcOrderNumber(r);
    const today=new Date().toISOString().split('T')[0];

    // ----- Letterhead from company info (Account → company info) -----
    let ci={name:'',address:'',license:'',phone:'',email:''};
    if(typeof window.loadCompanyInfo==='function'){
        try{ci=window.loadCompanyInfo()||ci}catch(_){}
    }
    const companyName=document.getElementById('orderCompanyName');
    const companyMeta=document.getElementById('orderCompanyMeta');
    const companyMeta2=document.getElementById('orderCompanyMeta2');
    if(companyName){
        if(ci.name){companyName.textContent=ci.name;companyName.classList.remove('order-v2-company-missing')}
        else {companyName.textContent='Set your company info in Account →';companyName.classList.add('order-v2-company-missing')}
    }
    if(companyMeta){
        companyMeta.textContent=ci.address||'';
        companyMeta.style.display=ci.address?'':'none';
    }
    if(companyMeta2){
        const line2=[ci.license&&('Lic. '+ci.license),ci.phone,ci.email].filter(Boolean).join(' · ');
        companyMeta2.textContent=line2;
        companyMeta2.style.display=line2?'':'none';
    }
    const onEl=document.getElementById('orderNumber');if(onEl)onEl.textContent=orderNum;
    const sub=document.getElementById('orderLetterheadSub');
    if(sub)sub.textContent='Issued '+today;

    // ----- Deliver-to -----
    const jobCode=(r&&r.id)?('J-'+String(r.id).replace(/\D/g,'').slice(-4).padStart(4,'0')):'';
    const dp=document.getElementById('orderDeliverProject');
    if(dp)dp.innerHTML=(pn?escHtml(pn):'&mdash;')+(jobCode?` <span class="job-slug">&middot; ${escHtml(jobCode)}</span>`:'');
    const da=document.getElementById('orderDeliverAddress');
    if(da)da.textContent=pa||'';

    // ----- Supplier sections -----
    const opts=orderV2CalcOpts(r);
    const waste=r.waste||0;
    const supplierKeys=Object.keys(selections);
    let html='';
    let grandSub=0;
    supplierKeys.forEach((supplier,sIdx)=>{
        const phasesForSupplier=selections[supplier];
        // Recompute items for this supplier × phases combination.
        const res=calcForSupplier(supplier,waste,phasesForSupplier,opts);
        const items=res.items.filter(it=>it.qty>0);
        if(!items.length)return;
        const subtotal=items.reduce((s,it)=>s+it.lineTotal,0);
        grandSub+=subtotal;
        const po=supplierKeys.length>1?orderV2PoNumber(orderNum,sIdx):orderNum+'-A';
        const chipsHtml=phasesForSupplier.map(p=>
            '<span class="v2-chip '+escAttr(orderV2ChipClass(p))+'">'+escHtml(p)+'</span>'
        ).join('');
        html+='<div class="order-v2-group">'
            +'<div class="order-v2-group-header">'
                +'<div class="order-v2-group-header-left">'
                    +chipsHtml
                    +'<span class="order-v2-group-supplier">'+escHtml(supplier)+'</span>'
                    +'<span class="order-v2-group-po">'+escHtml(po)+'</span>'
                +'</div>'
                +'<div class="order-v2-group-subtotal">'+fmt(subtotal)+'</div>'
            +'</div>'
            +'<table class="order-v2-items">'
                +'<colgroup><col class="col-sku"><col><col class="col-qty"><col class="col-each"><col class="col-line"></colgroup>'
                +'<thead><tr>'
                    +'<th class="col-sku">SKU</th>'
                    +'<th>ITEM</th>'
                    +'<th class="col-qty">QTY&nbsp;&nbsp;UNIT</th>'
                    +'<th class="col-each">EACH</th>'
                    +'<th class="col-line">TOTAL</th>'
                +'</tr></thead>'
                +'<tbody>';
        items.forEach(item=>{
            html+='<tr>'
                +'<td class="order-v2-sku">'+escHtml(item.sku||'')+'</td>'
                +'<td class="order-v2-item-name">'+escHtml(item.name||'')+'</td>'
                +'<td class="order-v2-qty-cell"><span class="order-v2-qty-static">'+v2FmtInt(item.qty)+'</span><span class="order-v2-qty-unit">'+escHtml(item.unit||'')+'</span></td>'
                +'<td class="order-v2-each">'+fmt(item.pricePerUnit)+'</td>'
                +'<td class="order-v2-each order-v2-line-total">'+fmt(item.lineTotal)+'</td>'
            +'</tr>';
        });
        html+='</tbody>'
            +'<tfoot><tr>'
                +'<td colspan="4" class="order-v2-subtotal-label">Subtotal &mdash; '+escHtml(supplier)+'</td>'
                +'<td class="order-v2-each order-v2-subtotal-amount">'+fmt(subtotal)+'</td>'
            +'</tr></tfoot>'
            +'</table>'
        +'</div>';
    });
    body.innerHTML=html||'<div style="padding:32px 0;text-align:center;color:var(--v2-text-tertiary);font-size:.85rem">No line items.</div>';

    // ----- Grand totals -----
    let totalsHtml='<div class="order-v2-total-row"><span class="label">Material subtotal</span><span class="amount">'+fmt(grandSub)+'</span></div>';
    let tot=grandSub;
    if(r.taxPct>0){
        const tax=grandSub*(r.taxPct/100);
        tot+=tax;
        totalsHtml+='<div class="order-v2-total-row"><span class="label">Tax ('+escHtml(r.taxPct)+'%)</span><span class="amount">'+fmt(tax)+'</span></div>';
    }
    totalsHtml+='<div class="order-v2-total-row order-v2-grand-row"><span class="label">Order total</span><span class="amount">'+fmt(tot)+'</span></div>';
    totalsEl.innerHTML=totalsHtml;

    // Keep legacy hidden fields synced (still used by exportOrderCSV / saved-job code paths).
    const opn=document.getElementById('orderProjectName');if(opn)opn.value=pn;
    const opa=document.getElementById('orderProjectAddress');if(opa)opa.value=pa;
    const osup=document.getElementById('orderSupplier');if(osup)osup.value=supplierKeys.join(', ');
    const odt=document.getElementById('orderDate');if(odt)odt.value=today;
    const opo=document.getElementById('orderPO');if(opo)opo.value=orderNum;
}

// ----- Entry point: called from the calculator's "Generate order" CTA -----
function prepareOrderFromCalc(){
    if(!currentCalc){notify('Calculate first','error');return}
    const r=currentCalc;
    const supplier=r.supplier||'';
    const isMulti=supplier==='All Suppliers'||supplier==='Best per phase'||!!r.bestPerPhase;
    document.getElementById('orderEmpty').style.display='none';
    if(isMulti){
        // Use r.bestPerPhase (which already reflects userPicks merged with cheapest defaults
        // from the most recent calculateJob run) to skip the second comparison step.
        // The calculator's inline picker is the single source of truth for supplier choices.
        const bpp=r.bestPerPhase||{};
        const selections={};
        Object.keys(bpp).forEach(phase=>{
            const sup=bpp[phase];if(!sup)return;
            if(!selections[sup])selections[sup]=[];
            selections[sup].push(phase);
        });
        document.getElementById('orderComparison').classList.add('hidden');
        document.getElementById('orderContent').classList.remove('hidden');
        renderOrderForm(r,selections);
    } else {
        document.getElementById('orderComparison').classList.add('hidden');
        document.getElementById('orderContent').classList.remove('hidden');
        const phases=orderV2PhasesPresent(r);
        renderOrderForm(r,{[supplier||'Supplier']:phases});
    }
    showPage('order');
}

function printOrder(){
    const showWM=!isLicensed();
    togglePrintWatermark(showWM);
    setTimeout(()=>{window.print();togglePrintWatermark(false)},100);
}

function exportOrderCSV(){
    if(!requireLicense('export CSV'))return;
    if(!currentCalc)return;
    const pn=document.getElementById('calcProjectName')?.value||'';
    const pa=document.getElementById('calcProjectAddress')?.value||'';
    const orderNum=calcOrderNumber(currentCalc);
    const today=new Date().toISOString().split('T')[0];
    let csv=`"Project","${pn.replace(/"/g,'""')}"\n"Address","${pa.replace(/"/g,'""')}"\n"Order","${orderNum}"\n"Date","${today}"\n`;
    csv+='\nSupplier,SKU,Item,Qty,Each,Line Total\n';
    let total=0;
    document.querySelectorAll('#orderTableBody .order-v2-group').forEach(g=>{
        const sup=(g.querySelector('.order-v2-group-supplier')?.textContent||'').trim();
        g.querySelectorAll('tbody tr').forEach(tr=>{
            const cells=tr.querySelectorAll('td');
            const sku=(cells[0]?.textContent||'').trim();
            const name=(cells[1]?.textContent||'').trim().replace(/"/g,'""');
            const qty=(cells[2]?.textContent||'').trim();
            const each=(cells[3]?.textContent||'').trim();
            const line=(cells[4]?.textContent||'').trim();
            const lineNum=parseFloat(line.replace(/[^0-9.]/g,''))||0;
            csv+=`"${sup}","${sku}","${name}","${qty}","${each}","${line}"\n`;
            total+=lineNum;
        });
    });
    csv+=`,,,,,"Total $${total.toFixed(2)}"\n`;
    const blob=new Blob([csv],{type:'text/csv'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`order-${(pn||'order').replace(/\s+/g,'-').toLowerCase()}-${today}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify('Exported','success');
}

window.prepareOrderFromCalc=prepareOrderFromCalc;
window.renderOrderComparison=renderOrderComparison;
window.confirmOrderComparison=confirmOrderComparison;
window.renderOrderForm=renderOrderForm;
window.printOrder=printOrder;
window.exportOrderCSV=exportOrderCSV;

// Stub legacy renderOrderTable so callers from saved-jobs / restore paths don't error.
// The new flow uses renderOrderForm(r, selections); call prepareOrderFromCalc instead.
function renderOrderTable(){if(currentCalc)prepareOrderFromCalc()}
function generateOrderForm(){if(currentCalc)prepareOrderFromCalc()}
// No-op kept so material-edit / reset paths that ran the legacy phase-filter
// repopulation don't throw. The new order flow has no phase-filter dropdown.
function populateOrderPhaseFilter(){}

// ===== SAVED JOBS (merged with templates) =====
function saveJob(){if(!currentCalc){notify('Calculate first','error');return}
    if(!isLicensed()&&savedJobs.length>=FREE_JOB_LIMIT){notify(`Free accounts can save up to ${FREE_JOB_LIMIT} jobs. Activate a license for unlimited.`,'error');return}
    const el=document.getElementById('saveJobName');el.value=document.getElementById('calcProjectName').value||'';document.getElementById('saveAsTemplate').checked=false;openModal('saveJobModal');el.focus()}
async function doSaveJob(){const name=document.getElementById('saveJobName').value.trim();if(!name){notify('Enter name','error');return}const isTemplate=document.getElementById('saveAsTemplate').checked;
    const job={id:'job-'+Date.now(),name,isTemplate,projectName:isTemplate?'':document.getElementById('calcProjectName').value,projectAddress:isTemplate?'':document.getElementById('calcProjectAddress').value,supplier:currentCalc.supplier,sqft:currentCalc.totalSqft||0,linearFt:0,waste:currentCalc.waste,profitPct:currentCalc.profitPct,taxPct:currentCalc.taxPct,laborRate:currentCalc.laborRate,selectedPhases:currentCalc.selectedPhases||categories,phaseDims:currentCalc.phaseDims||{},drywallAreas:currentCalc.drywallAreas||[],materialTotal:currentCalc.materialTotal,sellingPrice:currentCalc.sellingPrice,savedAt:new Date().toISOString()};
    savedJobs.unshift(job);saveSavedJobs();
    // Save to API
    if(api.getToken()){
        try{
            const supId=window._supplierIdMap?.[currentCalc.supplier];
            await api.saveJob({name:job.name,project_name:job.projectName,project_address:job.projectAddress,supplier_id:supId,sqft:job.sqft,linear_ft:job.linearFt,waste_pct:job.waste,profit_pct:job.profitPct,tax_pct:job.taxPct,labor_rate:job.laborRate,selected_phases:JSON.stringify(job.selectedPhases),material_total:job.materialTotal,selling_price:job.sellingPrice});
        }catch(err){console.warn('API save failed:',err.message)}
    }
    closeModal('saveJobModal');notify(isTemplate?'Template saved':'Job saved','success')}

// ===== SAVED JOBS — v2 redesign =====
// Filter/search state for the saved-jobs page (in-memory; per-session)
window.jobsV2State=window.jobsV2State||{tab:'All',search:''};

// Map a saved job to a {key,label} status.
function jobsV2Status(j){
    // Spec §5.5: templates render as `● Draft` (amber dot) in the status column.
    if(j.isTemplate)return{key:'draft',label:'Draft'};
    const s=String(j.status||'').toLowerCase();
    if(s==='won')return{key:'won',label:'Won'};
    if(s==='sent')return{key:'sent',label:'Sent'};
    if(s==='lost')return{key:'lost',label:'Lost'};
    if(s==='active')return{key:'active',label:'Active'};
    if(s==='draft')return{key:'draft',label:'Draft'};
    // Infer from data
    if(j.sellingPrice&&Number(j.sellingPrice)>0)return{key:'active',label:'Active'};
    return{key:'draft',label:'Draft'};
}

// Build a short job code from job id/name. Templates get a 2-digit
// sequence (TPL-01, TPL-02, …) keyed on their position in savedJobs
// among templates, per spec §5.5.
function jobsV2JobCode(j){
    if(j.isTemplate){
        const templates=(savedJobs||[]).filter(x=>x.isTemplate);
        const idx=templates.findIndex(x=>x===j||x.id===j.id);
        const n=idx>=0?(idx+1):(templates.length+1);
        return'TPL-'+String(n).padStart(2,'0');
    }
    const m=String(j.id||'').match(/(\d+)/);
    if(m){
        const n=parseInt(m[1],10);
        return'J-'+(n%10000).toString().padStart(4,'0');
    }
    return'J-'+String(j.id||'').slice(-4).toUpperCase();
}

// Compact money — $28.4k, $612.4k, $1.2M
function jobsV2FmtCompactMoney(n){
    const x=Number(n)||0;
    if(x===0)return'$0';
    if(x>=1e6)return'$'+(x/1e6).toFixed(1).replace(/\.0$/,'')+'M';
    if(x>=1e3)return'$'+(x/1e3).toFixed(1).replace(/\.0$/,'')+'k';
    return'$'+x.toFixed(0);
}

// ISO-ish yyyy-mm-dd date.
function jobsV2FmtDate(iso){
    const d=new Date(iso);
    if(isNaN(d))return'—';
    const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const dd=String(d.getDate()).padStart(2,'0');
    return`${y}-${m}-${dd}`;
}

// Render the filter tabs strip
function jobsV2RenderTabs(counts){
    const tabs=[
        {key:'All',label:'All',n:counts.All},
        {key:'Active',label:'Active',n:counts.Active},
        {key:'Won',label:'Won',n:counts.Won},
        {key:'Sent',label:'Sent',n:counts.Sent},
        {key:'Drafts',label:'Drafts',n:counts.Drafts},
        {key:'Templates',label:'Templates',n:counts.Templates}
    ];
    const cur=window.jobsV2State.tab;
    const wrap=document.getElementById('jobsV2Tabs');
    if(!wrap)return;
    // Spec §5.4: tabs are plain text, no inline count badge.
    wrap.innerHTML=tabs.map(t=>`<button class="jobs-v2-tab${t.key===cur?' active':''}" data-on-click="jobsV2SetTab" data-args="${escAttr(t.key)}" role="tab" aria-selected="${t.key===cur?'true':'false'}">${escHtml(t.label)}</button>`).join('');
}

// Filter the job list by tab + search
function jobsV2FilterList(){
    const{tab,search}=window.jobsV2State;
    const q=String(search||'').toLowerCase().trim();
    return savedJobs.filter(j=>{
        const st=jobsV2Status(j).key;
        if(tab==='Templates'){if(!j.isTemplate)return false}
        else if(tab==='Active'){if(j.isTemplate||st!=='active')return false}
        else if(tab==='Won'){if(j.isTemplate||st!=='won')return false}
        else if(tab==='Sent'){if(j.isTemplate||st!=='sent')return false}
        else if(tab==='Drafts'){if(j.isTemplate||st!=='draft')return false}
        // 'All' shows everything (incl. templates)
        if(!q)return true;
        const hay=[j.name,j.projectName,j.projectAddress,j.supplier,jobsV2JobCode(j)].filter(Boolean).join(' ').toLowerCase();
        return hay.indexOf(q)!==-1;
    });
}

function renderSavedJobs(){
    const listEl=document.getElementById('savedJobsList');
    if(!listEl)return;
    // Counts (always reflect full library, not the filtered view)
    const counts={All:0,Active:0,Won:0,Sent:0,Drafts:0,Templates:0};
    savedJobs.forEach(j=>{
        counts.All++;
        if(j.isTemplate){counts.Templates++;return}
        const st=jobsV2Status(j).key;
        if(st==='active')counts.Active++;
        else if(st==='won')counts.Won++;
        else if(st==='sent')counts.Sent++;
        else if(st==='draft')counts.Drafts++;
    });
    jobsV2RenderTabs(counts);
    // Subtitle
    const subEl=document.getElementById('jobsV2Subtitle');
    if(subEl){
        const jobsN=counts.All-counts.Templates;
        subEl.innerHTML=`${jobsN} job${jobsN===1?'':'s'}<span class="sep">·</span>${counts.Templates} template${counts.Templates===1?'':'s'}<span class="sep">·</span>search, filter, duplicate`;
    }
    // Restore search input value
    const sIn=document.getElementById('jobsV2Search');
    if(sIn&&sIn.value!==window.jobsV2State.search)sIn.value=window.jobsV2State.search||'';
    // Filtered rows
    const rows=jobsV2FilterList();
    if(!savedJobs.length){
        listEl.innerHTML=`<div class="jobs-v2-table-wrap"><div class="jobs-v2-empty"><div class="jobs-v2-empty-title">No saved jobs yet</div><div class="jobs-v2-empty-text">Save a calculation from the Calculator page to build your library.</div><button class="jobs-v2-cta" data-on-click="jobsV2NewJob">+ New job</button></div></div>`;
    }else if(!rows.length){
        listEl.innerHTML=`<div class="jobs-v2-table-wrap"><div class="jobs-v2-empty"><div class="jobs-v2-empty-title">No matches</div><div class="jobs-v2-empty-text">Try clearing the search or switching tabs.</div></div></div>`;
    }else{
        const MAX_CHIPS=3;
        const colg=`<colgroup><col class="c-job"><col class="c-name"><col class="c-phases"><col class="c-meta"><col class="c-status"><col class="c-total"><col class="c-act"></colgroup>`;
        const head=`<thead><tr>`+
            `<th class="c-job">Job &middot;#</th>`+
            `<th class="c-name">Name / Client</th>`+
            `<th class="c-phases">Phases</th>`+
            `<th class="c-meta text-right">Sq&middot;ft / Date</th>`+
            `<th class="c-status">Status</th>`+
            `<th class="c-total text-right">Total</th>`+
            `<th class="c-act"></th>`+
            `</tr></thead>`;
        const body=rows.map(j=>{
            const code=jobsV2JobCode(j);
            const status=jobsV2Status(j);
            const phases=Array.isArray(j.selectedPhases)?j.selectedPhases:[];
            const shown=phases.slice(0,MAX_CHIPS);
            const more=phases.length>MAX_CHIPS?phases.length-MAX_CHIPS:0;
            const chips=shown.map(p=>`<span class="v2-chip ${v2ChipClass(p)}">${escHtml(p)}</span>`).join('');
            const chipsHtml=chips+(more?`<span class="jobs-v2-phases-overflow">+${more}</span>`:'');
            const clientName=j.isTemplate?'Template':(j.projectName||j.supplier||'—');
            const sqftCell=j.isTemplate
                ?`<div class="jobs-v2-sqft" style="color:var(--v2-text-tertiary);font-weight:400">&mdash;</div><div class="jobs-v2-date">${jobsV2FmtDate(j.savedAt)}</div>`
                :`<div class="jobs-v2-sqft">${(j.sqft||0).toLocaleString()}<span class="unit">sq&middot;ft</span></div><div class="jobs-v2-date">${jobsV2FmtDate(j.savedAt)}</div>`;
            const totalCell=j.isTemplate
                ?`<td class="c-total jobs-v2-total dash">&mdash;</td>`
                :`<td class="c-total jobs-v2-total">${jobsV2FmtCompactMoney(j.sellingPrice||j.materialTotal||0)}</td>`;
            const idAttr=escAttr(j.id);
            return`<tr class="jobs-v2-row" data-on-click="jobsV2RowClick" data-args="${idAttr}">`+
                `<td class="jobs-v2-jobcode" title="${escAttr(code)}">${escHtml(code)}</td>`+
                `<td>`+
                    `<div class="jobs-v2-name">${escHtml(j.name||'Untitled')}</div>`+
                    `<div class="jobs-v2-client">${escHtml(clientName)}</div>`+
                    `<div class="jobs-v2-name-mobile-extras">${chipsHtml}<span class="jobs-v2-status ${status.key}" style="margin-left:6px">${escHtml(status.label)}</span></div>`+
                `</td>`+
                `<td class="c-phases"><div class="jobs-v2-phases">${chipsHtml}</div></td>`+
                `<td class="c-meta jobs-v2-meta">${sqftCell}</td>`+
                `<td class="c-status"><span class="jobs-v2-status ${status.key}">${escHtml(status.label)}</span></td>`+
                totalCell+
                `<td class="jobs-v2-actions">`+
                    `<span class="jobs-v2-chev" aria-hidden="true">&rsaquo;</span>`+
                    `<span class="jobs-v2-row-actions">`+
                        `<button class="jobs-v2-act-btn primary" data-on-click="jobsV2ActLoad" data-args="${idAttr}">Load</button>`+
                        `<button class="jobs-v2-act-btn" data-on-click="jobsV2ActDuplicate" data-args="${idAttr}">Duplicate</button>`+
                        `<button class="jobs-v2-act-btn danger" data-on-click="jobsV2ActDelete" data-args="${idAttr}">Delete</button>`+
                    `</span>`+
                `</td>`+
            `</tr>`;
        }).join('');
        listEl.innerHTML=`<div class="jobs-v2-table-wrap"><table class="jobs-v2-table">${colg}${head}<tbody>${body}</tbody></table></div>`;
    }
    // Footer aggregates (based on full library, not filtered)
    const footEl=document.getElementById('jobsV2Footer');
    if(footEl){
        const nonTpl=savedJobs.filter(j=>!j.isTemplate);
        const ytd=nonTpl.reduce((s,j)=>s+(Number(j.sellingPrice)||0),0);
        const wonJobs=nonTpl.filter(j=>jobsV2Status(j).key==='won');
        const closed=nonTpl.filter(j=>{const k=jobsV2Status(j).key;return k==='won'||k==='lost'});
        const winRate=closed.length?Math.round((wonJobs.length/closed.length)*100):0;
        const margins=nonTpl.map(j=>Number(j.profitPct)||0).filter(n=>n>0);
        const avgMargin=margins.length?(margins.reduce((s,n)=>s+n,0)/margins.length):0;
        footEl.innerHTML=`<div>Showing <span class="num">${rows.length}</span> of <span class="num">${counts.All}</span><span class="sep">&middot;</span>YTD value <span class="num">${jobsV2FmtCompactMoney(ytd)}</span></div>`+
            `<div>Avg margin <span class="num">${avgMargin.toFixed(1)}%</span><span class="sep">&middot;</span>Win rate <span class="num">${winRate}%</span></div>`;
    }
}

// === v2 page-level handler functions (exposed for data-on-* delegation) ===
window.jobsV2SetTab=function(key){window.jobsV2State.tab=key;renderSavedJobs()};
window.jobsV2SetSearch=function(){const el=document.getElementById('jobsV2Search');window.jobsV2State.search=el?el.value:'';renderSavedJobs()};
window.jobsV2FilterTemplates=function(){window.jobsV2State.tab='Templates';renderSavedJobs()};
window.jobsV2NewJob=function(){showPage('calculator')};
window.jobsV2RowClick=function(id,e){
    // If the click landed on an action button, let that handler run instead.
    if(e&&e.target&&e.target.closest('.jobs-v2-act-btn'))return;
    loadJob(id);
};
window.jobsV2ActLoad=function(id,e){if(e&&e.stopPropagation)e.stopPropagation();loadJob(id)};
window.jobsV2ActDuplicate=function(id,e){if(e&&e.stopPropagation)e.stopPropagation();duplicateJob(id)};
window.jobsV2ActDelete=function(id,e){if(e&&e.stopPropagation)e.stopPropagation();deleteJob(id)};
window.jobsV2Status=jobsV2Status;
window.jobsV2JobCode=jobsV2JobCode;

function loadJob(id){const job=savedJobs.find(j=>j.id===id);if(!job)return;document.getElementById('calcProjectName').value=job.isTemplate?'':job.projectName||'';document.getElementById('calcProjectAddress').value=job.isTemplate?'':job.projectAddress||'';document.getElementById('calcWaste').value=job.waste||10;document.getElementById('calcProfit').value=job.profitPct||20;document.getElementById('calcTax').value=job.taxPct||0;document.getElementById('calcLabor').value=job.laborRate||0;showPage('calculator');setTimeout(()=>{const sel=document.getElementById('calcSupplier');if(suppliers.includes(job.supplier))sel.value=job.supplier;renderPhaseCheckboxes();if(job.selectedPhases)document.querySelectorAll('#phaseCheckboxes input[type="checkbox"]').forEach(cb=>{const ch=job.selectedPhases.includes(cb.value);cb.checked=ch;cb.closest('.phase-chip').classList.toggle('checked',ch)});updatePhaseOptions();
    // Restore per-scope dimensions from saved phaseDims
    if(job.phaseDims){const pd=job.phaseDims;if(pd.Stucco){const el=document.getElementById('calcStuccoSqft');if(el)el.value=pd.Stucco.sqft||'';const lf=document.getElementById('calcStuccoLinearFt');if(lf)lf.value=pd.Stucco.linearFt||''}if(pd.Stone){const el=document.getElementById('calcStoneSqft');if(el)el.value=pd.Stone.sqft||'';const lf=document.getElementById('calcStoneLinearFt');if(lf)lf.value=pd.Stone.linearFt||''}if(pd.Painting){const el=document.getElementById('calcPaintSqft');if(el)el.value=pd.Painting.sqft||''}}
    // Restore drywall areas
    if(job.drywallAreas&&job.drywallAreas.length){const wrap=document.getElementById('drywallAreaRows');if(wrap)wrap.innerHTML='';job.drywallAreas.forEach(a=>addDrywallArea(a.label,a.sku,a.rawVal||a.sqft,a.unit||'sqft'))}
    if(!job.isTemplate)calculateJob()},50);notify(job.isTemplate?'Template loaded — enter project details':'Job loaded','info')}
function duplicateJob(id){const job=savedJobs.find(j=>j.id===id);if(!job)return;savedJobs.unshift({...job,id:'job-'+Date.now(),name:job.name+' (copy)',savedAt:new Date().toISOString()});saveSavedJobs();renderSavedJobs();notify('Duplicated','success')}
async function deleteJob(id){if(!confirm('Delete?'))return;
    if(api.getToken()){try{await api.deleteJob(id)}catch(err){console.warn('API delete failed:',err.message)}}
    savedJobs=savedJobs.filter(j=>j.id!==id);saveSavedJobs();renderSavedJobs();notify('Deleted','success')}
function clearAllJobs(){if(!confirm('Delete ALL saved jobs?'))return;savedJobs=[];saveSavedJobs();renderSavedJobs();notify('Cleared','info')}

// ===== DASHBOARD (v2) =====
// Material-calculator dashboard. Surfaces recent saved jobs, catalog size,
// supplier coverage, and stale-price alerts. NOT a bid/estimating dashboard
// — there are no Win/Lost/Sent statuses anywhere here.
//
// Pure helpers — only used by renderDashboard.
function dashV2ChipClass(phase){
    // Map a phase name to the v2-chip palette class (defined in styles.css §7).
    const k=String(phase||'').toLowerCase().trim();
    if(k.includes('lath'))return'lath';
    if(k.includes('gray')||k.includes('grey')||k.includes('brown')||k.includes('scratch'))return'gray-coat';
    if(k.includes('color')||k.includes('finish')||k.includes('stucco'))return'color-coat';
    if(k.includes('paint'))return'painting';
    if(k.includes('dry')||k.includes('sheetrock'))return'drywall';
    if(k.includes('stone')||k.includes('aggregate'))return'aggregate';
    if(k.includes('access')||k.includes('trim')||k.includes('bead'))return'accessories';
    return'accessories';
}
function dashV2FmtMoneyK(n){
    // Compact format e.g. $28.4k, $1,240. Used in job totals + catalog footer.
    const v=Number(n)||0;
    if(v>=1000){const k=v/1000;return'$'+k.toFixed(k>=100?0:1)+'k'}
    return'$'+v.toFixed(0)
}
function dashV2FmtRelative(ts){
    if(!ts)return'—';
    const d=new Date(ts);if(isNaN(d.getTime()))return'—';
    const diffMs=Date.now()-d.getTime();
    const day=24*60*60*1000;
    if(diffMs<day&&d.toDateString()===new Date().toDateString())return'Today';
    const yest=new Date();yest.setDate(yest.getDate()-1);
    if(d.toDateString()===yest.toDateString())return'Yesterday';
    const days=Math.floor(diffMs/day);
    if(days<7)return days+' days ago';
    if(days<30)return Math.floor(days/7)+'w ago';
    return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})
}
function dashV2JobCode(j){
    // Synthesize a J-#### code from the saved-job id (stable per id).
    const m=String(j.id||'').match(/(\d+)/);
    if(m)return'J-'+m[1].slice(-4).padStart(4,'0');
    return'J-0000'
}
function dashV2JobDate(j){
    // savedAt rendered as a short relative string ("Today", "3 days ago").
    return dashV2FmtRelative(j.savedAt);
}
function dashV2JobPhases(j){
    // Job's selected phases, capped at 3 for chip rendering.
    const list=(j.selectedPhases&&j.selectedPhases.length?j.selectedPhases:[])||[];
    return list.slice(0,3);
}

async function renderDashboard(){
    const page=document.getElementById('dashboardPage');
    if(!page)return;

    // --- Header data --------------------------------------------------
    const now=new Date();
    // Build date manually so the format matches spec: WEEKDAY MON DD (no comma).
    const wk=['SUN','MON','TUE','WED','THU','FRI','SAT'][now.getDay()];
    const mo=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][now.getMonth()];
    const dd=String(now.getDate()).padStart(2,'0');
    const datePart=`${wk} ${mo} ${dd}`;
    const userName=(currentUser&&currentUser.name)?String(currentUser.name).split(/\s+/)[0]:'there';

    // --- Source data --------------------------------------------------
    const jobs=savedJobs||[];
    const nonTemplates=jobs.filter(j=>!j.isTemplate);
    const templates=jobs.filter(j=>j.isTemplate);
    const allSuppliers=suppliers||[];
    const supplierCount=allSuppliers.length;

    // Catalog totals (materials, stale items, phases, summed catalog value).
    let materialCount=0;
    let staleCount=0;
    let catalogValue=0;
    const phasesCoveredSet=new Set();
    allSuppliers.forEach(s=>{
        const mats=materialsBySupplier[s]||[];
        materialCount+=mats.length;
        mats.forEach(m=>{
            if(typeof isStale==='function'&&isStale(m))staleCount++;
            catalogValue+=(Number(m.pricePerUnit)||0);
        });
        const ph=(typeof getSupplierPhases==='function')?getSupplierPhases(s):[];
        ph.forEach(p=>phasesCoveredSet.add(p));
    });
    const phasesCovered=phasesCoveredSet.size;

    // --- Recent jobs (5 most recent non-templates) --------------------
    const recent=nonTemplates.slice(0,5);

    // --- Supplier rows (right rail) -----------------------------------
    const supRows=allSuppliers.slice(0,4).map(s=>{
        const mats=materialsBySupplier[s]||[];
        const phases=(typeof getSupplierPhases==='function')?getSupplierPhases(s):[];
        const sStale=mats.filter(m=>typeof isStale==='function'&&isStale(m)).length;
        return{name:s,mats:mats.length,phases,stale:sStale}
    });

    // --- Build HTML ---------------------------------------------------

    // Amber tint on the stale-prices metric when any are stale.
    const staleMod=staleCount>0?' dash-v2-metric--warn':'';

    const metricsHtml=`
        <div class="dash-v2-metrics" role="group" aria-label="Catalog overview">
            <div class="dash-v2-metric">
                <div class="dash-v2-metric-label">Saved jobs</div>
                <div class="dash-v2-metric-row">
                    <span class="dash-v2-metric-num">${nonTemplates.length}</span>
                    <span class="dash-v2-metric-unit">jobs</span>
                </div>
                <div class="dash-v2-metric-trend">${templates.length} template${templates.length===1?'':'s'}</div>
            </div>
            <div class="dash-v2-metric">
                <div class="dash-v2-metric-label">Materials catalog</div>
                <div class="dash-v2-metric-row">
                    <span class="dash-v2-metric-num">${materialCount}</span>
                    <span class="dash-v2-metric-unit">items</span>
                </div>
                <div class="dash-v2-metric-trend">across ${supplierCount} supplier${supplierCount===1?'':'s'}</div>
            </div>
            <div class="dash-v2-metric">
                <div class="dash-v2-metric-label">Suppliers</div>
                <div class="dash-v2-metric-row">
                    <span class="dash-v2-metric-num">${supplierCount}</span>
                    <span class="dash-v2-metric-unit">linked</span>
                </div>
                <div class="dash-v2-metric-trend">covering ${phasesCovered} phase${phasesCovered===1?'':'s'}</div>
            </div>
            <div class="dash-v2-metric${staleMod}">
                <div class="dash-v2-metric-label">Stale prices</div>
                <div class="dash-v2-metric-row">
                    <span class="dash-v2-metric-num">${staleCount}</span>
                    <span class="dash-v2-metric-unit">items</span>
                </div>
                <div class="dash-v2-metric-trend">${staleCount>0?'older than 30 days':'all prices fresh'}</div>
            </div>
        </div>`;

    const jobsTableHtml=recent.length
        ?`<table class="dash-v2-jobs-table">
            <colgroup>
                <col class="dash-v2-col-job">
                <col>
                <col class="dash-v2-col-phase">
                <col class="dash-v2-col-due">
                <col class="dash-v2-col-total">
                <col class="dash-v2-col-chev">
            </colgroup>
            <thead>
                <tr>
                    <th class="dash-v2-th-job">Job&nbsp;#</th>
                    <th>Name / Client</th>
                    <th class="dash-v2-th-phase">Phases</th>
                    <th class="text-right">Sq&middot;ft&nbsp;&nbsp;Date</th>
                    <th class="text-right">Total</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${recent.map(j=>{
                    const code=dashV2JobCode(j);
                    const phases=dashV2JobPhases(j);
                    const dateStr=dashV2JobDate(j);
                    const sub=(j.projectAddress||j.supplier||'')+'';
                    const chipsHtml=phases.length
                        ?phases.map(p=>`<span class="v2-chip ${dashV2ChipClass(p)}">${escHtml(p)}</span>`).join('')
                        :'<span class="dash-v2-job-sub">No phases</span>';
                    return`<tr class="dash-v2-job-row" data-on-click="loadJob" data-args="${escAttr(j.id)}">
                        <td class="dash-v2-job-cell-code"><span class="dash-v2-job-code">${escHtml(code)}</span></td>
                        <td>
                            <div class="dash-v2-job-name">${escHtml(j.name||j.projectName||'Untitled')}</div>
                            ${sub?`<div class="dash-v2-job-sub">${escHtml(sub)}</div>`:''}
                        </td>
                        <td class="dash-v2-job-cell-phase"><div class="dash-v2-job-phase-chips">${chipsHtml}</div></td>
                        <td class="dash-v2-job-due">
                            <span class="dash-v2-job-due-sqft">${(Number(j.sqft)||0).toLocaleString()}</span>
                            ${dateStr&&dateStr!=='—'?`<span class="dash-v2-job-due-date">${escHtml(dateStr)}</span>`:''}
                        </td>
                        <td class="dash-v2-job-total">${dashV2FmtMoneyK(j.sellingPrice||j.materialTotal||0)}</td>
                        <td class="dash-v2-job-chev" aria-hidden="true">&rsaquo;</td>
                    </tr>`
                }).join('')}
            </tbody>
        </table>`
        :`<div class="dash-v2-empty">No saved jobs yet. Start with <strong>New calculation</strong>.</div>`;

    const suppliersHtml=supRows.length
        ?`<div class="dash-v2-supplier-list">${supRows.map(r=>`
            <button type="button" class="dash-v2-supplier-row" data-on-click="openSupplierPricing" data-args="${escAttr(r.name)}">
                <div class="dash-v2-supplier-head">
                    <span class="dash-v2-supplier-name">${escHtml(r.name)}</span>
                    <span class="dash-v2-supplier-sync">${r.mats} item${r.mats===1?'':'s'}${r.stale>0?` &middot; <span class="dash-v2-supplier-stale">${r.stale} stale</span>`:''}</span>
                </div>
                <div class="dash-v2-supplier-chips">
                    ${r.phases.slice(0,4).map(p=>`<span class="v2-chip ${dashV2ChipClass(p)}">${escHtml(p)}</span>`).join('')}
                </div>
            </button>`).join('')}</div>`
        :`<div class="dash-v2-empty">No suppliers yet.</div>`;

    page.innerHTML=`
        <header class="dash-v2-header">
            <div class="dash-v2-header-left">
                <div class="dash-v2-eyebrow">
                    <span>01 &middot; TODAY</span>
                    <span class="dash-v2-eyebrow-sep">&middot;</span>
                    <span>${escHtml(datePart)}</span>
                </div>
                <h1 class="dash-v2-title">Welcome back, ${escHtml(userName)}.</h1>
                <p class="dash-v2-subtitle">
                    <span>${nonTemplates.length} saved job${nonTemplates.length===1?'':'s'}</span>
                    <span class="dash-v2-sub-sep">&middot;</span>
                    <span>${materialCount} material${materialCount===1?'':'s'} across ${supplierCount} supplier${supplierCount===1?'':'s'}</span>
                </p>
            </div>
            <div class="dash-v2-header-right">
                <button class="dash-v2-btn" data-on-click="showPage" data-args="pricing">Open catalog</button>
                <button class="dash-v2-btn dash-v2-btn-primary" data-on-click="showPage" data-args="calculator">
                    <span class="dash-v2-btn-glyph">&#10766;</span> New calculation
                </button>
            </div>
        </header>

        <hr class="dash-v2-divider">

        <div class="dash-v2-grid">
            <div class="dash-v2-main">
                ${metricsHtml}

                <div class="dash-v2-section-head">
                    <div class="dash-v2-section-head-left">
                        <span class="dash-v2-section-eyebrow">02 &middot; Recent jobs</span>
                        <h2 class="dash-v2-section-title">Recent calculations</h2>
                    </div>
                    <div class="dash-v2-section-head-right">
                        <span>Showing ${recent.length} of ${nonTemplates.length}</span>
                        <button class="dash-v2-section-link" data-on-click="showPage" data-args="savedJobs">All &rarr;</button>
                    </div>
                </div>

                <div class="dash-v2-jobs-card">${jobsTableHtml}</div>

                <div class="dash-v2-footer-stat">
                    Total catalog value <span class="dash-v2-footer-num">${dashV2FmtMoneyK(catalogValue)}</span>
                    <span class="dash-v2-sub-sep">&middot;</span>
                    across <span class="dash-v2-footer-num">${supplierCount}</span> supplier${supplierCount===1?'':'s'}
                </div>
            </div>

            <aside class="dash-v2-rail">
                <section class="dash-v2-card dash-v2-suppliers" aria-label="Suppliers">
                    <div class="dash-v2-card-eyebrow">Suppliers</div>
                    ${suppliersHtml}
                </section>
                <p class="dash-v2-help">Need help? <a class="dash-v2-help-link" href="mailto:support@esticount.app">support@esticount.app</a></p>
            </aside>
        </div>`;
}
window.renderDashboard=renderDashboard;

// ===== ACCOUNT (v2) =====

// Deterministic pastel for the account avatar — same hash function as
// admin-v2 user avatars so a user looks consistent across pages.
const ACCOUNT_V2_AVATAR_PALETTE=[
    '#efe2c2','#f1d4dc','#cde8c8','#f3cfb1','#bcd4a7','#cfd9e6','#d8d2c2'
];
const ACCOUNT_V2_AVATAR_FG={
    '#efe2c2':'#7a5b1f','#f1d4dc':'#8a3f56','#cde8c8':'#3e6b3a',
    '#f3cfb1':'#8a4b22','#bcd4a7':'#3f5a2c','#cfd9e6':'#3e5269','#d8d2c2':'#5a5236'
};
function accountV2AvatarColor(seed){
    const s=String(seed||'');
    let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;
    return ACCOUNT_V2_AVATAR_PALETTE[h%ACCOUNT_V2_AVATAR_PALETTE.length];
}
function accountV2Initials(name){
    const parts=String(name||'').trim().split(/\s+/).filter(Boolean);
    if(!parts.length)return 'U';
    if(parts.length===1)return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0]+parts[parts.length-1][0]).toUpperCase();
}

function accountV2SetMessage(el,text,kind){
    if(!el)return;
    el.textContent=text||'';
    el.classList.remove('is-ok','is-err','is-muted');
    if(kind==='ok')el.classList.add('is-ok');
    else if(kind==='err')el.classList.add('is-err');
    else el.classList.add('is-muted');
}

function accountV2ShowLicenseMessage(el,text,kind){
    if(!el)return;
    el.textContent=text||'';
    el.classList.remove('is-ok','is-err');
    if(kind==='ok')el.classList.add('is-ok');
    else if(kind==='err')el.classList.add('is-err');
    el.classList.add('is-shown');
}
function accountV2HideLicenseMessage(el){
    if(!el)return;
    el.classList.remove('is-shown','is-ok','is-err');
    el.textContent='';
}

async function renderAccountPage(){
    if(!currentUser)return;
    // Re-fetch latest user data from API
    if(api.getToken()){try{const r=await api.getMe();currentUser=r.user}catch(e){}}

    // Identity --------------------------------------------------------
    const name=currentUser.name||'No name set';
    const email=currentUser.email||'';
    const initials=accountV2Initials(currentUser.name);
    const avatarBg=accountV2AvatarColor(currentUser.email||currentUser.name||'user');
    const avatarFg=ACCOUNT_V2_AVATAR_FG[avatarBg]||'#1a0e08';
    const avatarEl=document.getElementById('accountAvatar');
    avatarEl.textContent=initials;
    avatarEl.style.background=avatarBg;
    avatarEl.style.color=avatarFg;

    document.getElementById('accountNameDisplay').textContent=name;
    document.getElementById('accountEmailDisplay').textContent=email;

    // Role + member-since line below identity
    const role=(currentUser.role||'user').toString();
    const created=currentUser.created_at?new Date(currentUser.created_at):null;
    const memberSince=created&&!isNaN(created)?created.toLocaleDateString(undefined,{year:'numeric',month:'short'}):null;
    const roleLine=document.getElementById('accountRoleLine');
    if(roleLine){
        roleLine.innerHTML=`${role.toUpperCase()}${memberSince?`<span class="sep">&middot;</span>MEMBER SINCE ${memberSince.toUpperCase()}`:''}`;
    }

    // Profile form inputs ---------------------------------------------
    document.getElementById('accountNameInput').value=currentUser.name||'';
    document.getElementById('accountEmailInput').value=currentUser.email||'';
    document.getElementById('accountPasswordInput').value='';

    // Clear any stale messages on render
    accountV2SetMessage(document.getElementById('profileMessage'),'','muted');
    accountV2HideLicenseMessage(document.getElementById('licenseMessage'));

    // License status --------------------------------------------------
    // Source of truth: license_type (admin role implies lifetime). license_key is the
    // audit trail of the activation, but admin-seeded accounts may have no key.
    const lt=currentUser.license_type||null;
    const isAdmin=currentUser.role==='admin';
    const hasKey=!!currentUser.license_key;
    const exp=currentUser.license_expires?new Date(currentUser.license_expires):null;
    const isExpired=exp&&exp<new Date();
    const isLifetimeNow=lt==='lifetime'||(isAdmin&&!lt);
    const isLicensedNow=isLifetimeNow||(lt&&!isExpired);
    const expStr=exp?exp.toLocaleDateString():'Never';

    const statusPill=document.getElementById('accountStatusPill');
    const licenseEl=document.getElementById('accountLicense');
    const licenseEyebrowMeta=document.getElementById('accountLicenseEyebrowMeta');

    // Reset pill classes
    statusPill.classList.remove('is-active','is-trial','is-expired','is-none');

    let typeLabel,typeClass,statusText,daysLeft,planLabel;
    if(isAdmin&&(!lt||lt==='lifetime')){
        typeLabel='Lifetime';typeClass='is-lifetime';
        statusText='Admin account · all features unlocked.';
        planLabel='Lifetime';
        statusPill.classList.add('is-active');statusPill.textContent='Lifetime';
    }else if(!lt){
        typeLabel='No license';typeClass='is-none';
        statusText='Activate a key below to unlock unlimited jobs and bidding.';
        planLabel='Free tier';
        statusPill.classList.add('is-none');statusPill.textContent='No license';
    }else if(lt==='lifetime'){
        typeLabel='Lifetime';typeClass='is-lifetime';
        statusText='Never expires. Thanks for being a lifetime member.';
        planLabel='Lifetime';
        statusPill.classList.add('is-active');statusPill.textContent='Lifetime';
    }else if(isExpired){
        typeLabel=lt.charAt(0).toUpperCase()+lt.slice(1);typeClass='is-expired';
        statusText='Expired on '+expStr+'. Renew or activate a new key.';
        planLabel=lt+' (expired)';
        statusPill.classList.add('is-expired');statusPill.textContent='Expired';
    }else if(lt==='trial'){
        typeLabel='Trial';typeClass='is-trial';
        if(exp){
            const ms=exp-new Date();
            daysLeft=Math.max(0,Math.ceil(ms/(1000*60*60*24)));
            statusText=daysLeft>0?`Trial · ${daysLeft} day${daysLeft===1?'':'s'} remaining (until ${expStr}).`:'Trial expires today.';
        }else{
            statusText='Trial · expires soon.';
        }
        planLabel='Trial';
        statusPill.classList.add('is-trial');statusPill.textContent='Trial';
    }else{
        typeLabel=lt.charAt(0).toUpperCase()+lt.slice(1);typeClass='is-'+lt;
        statusText='Renews on '+expStr+'.';
        planLabel=typeLabel;
        statusPill.classList.add('is-active');statusPill.textContent=typeLabel;
    }

    if(licenseEyebrowMeta)licenseEyebrowMeta.textContent=planLabel;

    const keyFull=currentUser.license_key||'';
    const keyMasked=keyFull?(keyFull.length>10?keyFull.slice(0,7)+'…'+keyFull.slice(-4):keyFull):'—';

    licenseEl.innerHTML=`
        <div class="account-v2-license-row">
            <div class="account-v2-license-state">
                <span class="account-v2-license-type ${typeClass}">${typeLabel}</span>
                <span class="account-v2-license-sub">${statusText}</span>
            </div>
        </div>
        <div class="account-v2-license-meta">
            <div class="account-v2-license-meta-cell">
                <div class="account-v2-license-meta-label">PLAN</div>
                <div class="account-v2-license-meta-value">${planLabel}</div>
            </div>
            <div class="account-v2-license-meta-cell">
                <div class="account-v2-license-meta-label">${isLifetimeNow?'EXPIRES':isExpired?'EXPIRED ON':isLicensedNow?'EXPIRES':'STATUS'}</div>
                <div class="account-v2-license-meta-value ${!isLicensedNow?'is-muted':''}">${isLifetimeNow?'Never':isLicensedNow&&exp?expStr:isLicensedNow?'—':'inactive'}</div>
            </div>
            <div class="account-v2-license-meta-cell">
                <div class="account-v2-license-meta-label">KEY</div>
                <div class="account-v2-license-meta-value ${!hasKey?'is-muted':''}">${hasKey?keyMasked:isLicensedNow?'admin-set':'none'}</div>
            </div>
        </div>`;

    // Quick stats rail -----------------------------------------------
    const statsEl=document.getElementById('accountQuickStats');
    if(statsEl){
        const totalJobs=Array.isArray(savedJobs)?savedJobs.length:0;
        const templates=Array.isArray(savedJobs)?savedJobs.filter(j=>j&&j.isTemplate).length:0;
        const realJobs=totalJobs-templates;
        let lastSavedLabel='—';
        if(Array.isArray(savedJobs)&&savedJobs.length){
            const dated=savedJobs
                .map(j=>j&&j.savedAt?new Date(j.savedAt):null)
                .filter(d=>d&&!isNaN(d));
            if(dated.length){
                const newest=dated.reduce((a,b)=>a>b?a:b);
                lastSavedLabel=newest.toLocaleDateString();
            }
        }
        statsEl.innerHTML=`
            <div class="account-v2-stat">
                <span class="account-v2-stat-label">Saved jobs</span>
                <span class="account-v2-stat-value is-display">${realJobs}</span>
            </div>
            <div class="account-v2-stat">
                <span class="account-v2-stat-label">Templates</span>
                <span class="account-v2-stat-value">${templates}</span>
            </div>
            <div class="account-v2-stat">
                <span class="account-v2-stat-label">Last saved</span>
                <span class="account-v2-stat-value">${lastSavedLabel}</span>
            </div>
            <div class="account-v2-stat">
                <span class="account-v2-stat-label">Role</span>
                <span class="account-v2-stat-value">${role}</span>
            </div>`;
    }

    // Business expenses panel
    bizExpensesRender();

    // Company info form (used on printed order forms)
    const ci=loadCompanyInfo();
    const setVal=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||''};
    setVal('companyName',ci.name);
    setVal('companyAddress',ci.address);
    setVal('companyLicense',ci.license);
    setVal('companyPhone',ci.phone);
    setVal('companyEmail',ci.email);
}

// ===== COMPANY INFO (account-v2 section) =====
// Company Info — used on order form letterheads.
// Persisted in localStorage; no backend sync in v1.
function loadCompanyInfo(){
    try{const raw=localStorage.getItem('esticount_company_info');if(raw){const o=JSON.parse(raw);return{name:o.name||'',address:o.address||'',license:o.license||'',phone:o.phone||'',email:o.email||''}}}catch(_){}
    return{name:'',address:'',license:'',phone:'',email:''};
}
function saveCompanyInfo(obj){
    const clean={name:String(obj.name||'').trim(),address:String(obj.address||'').trim(),license:String(obj.license||'').trim(),phone:String(obj.phone||'').trim(),email:String(obj.email||'').trim()};
    localStorage.setItem('esticount_company_info',JSON.stringify(clean));
    return clean;
}
function saveCompanyInfoFromForm(){
    const obj=saveCompanyInfo({
        name:document.getElementById('companyName').value,
        address:document.getElementById('companyAddress').value,
        license:document.getElementById('companyLicense').value,
        phone:document.getElementById('companyPhone').value,
        email:document.getElementById('companyEmail').value,
    });
    // Inline confirmation (sticks for ~3.5s)
    const msg=document.getElementById('companyInfoMessage');
    if(msg){
        msg.textContent='✓ Saved · used on all future order forms';
        msg.style.color='var(--v2-status-dot-green,#3fb950)';
        msg.style.fontWeight='600';
        setTimeout(()=>{msg.textContent='';msg.style.color='';msg.style.fontWeight=''},3500);
    }
    // Loud toast (uses the existing notify system, visible everywhere on the app)
    if(typeof notify==='function')notify('Company info saved','success');
    // If an order is already rendered, refresh its letterhead so the change shows
    // immediately when the user navigates back to the Orders page.
    if(currentCalc&&typeof renderOrderForm==='function'){
        try{
            const r=currentCalc;
            const isMulti=r.supplier==='All Suppliers'||r.supplier==='Best per phase'||!!r.bestPerPhase;
            if(isMulti){
                const sel={};Object.keys(r.bestPerPhase||{}).forEach(p=>{const s=r.bestPerPhase[p];if(!s)return;(sel[s]=sel[s]||[]).push(p)});
                renderOrderForm(r,sel);
            } else if(r.supplier){
                renderOrderForm(r,{[r.supplier]:orderV2PhasesPresent(r)});
            }
        }catch(_){}
    }
}
window.loadCompanyInfo=loadCompanyInfo;
window.saveCompanyInfo=saveCompanyInfo;
window.saveCompanyInfoFromForm=saveCompanyInfoFromForm;

// ===== BUSINESS EXPENSES (account-v2 section) =====
function bizExpensesRender(){
    const state=loadBusinessExpenses();
    const jpmEl=document.getElementById('bizJobsPerMonth');
    if(jpmEl)jpmEl.value=state.avgJobsPerMonth;
    const list=document.getElementById('bizExpensesList');
    if(list){
        if(!state.items.length){
            list.innerHTML=`<div class="account-v2-hint" style="text-align:center;padding:14px;border:1px dashed var(--v2-border-hairline);border-radius:8px">No business expenses yet. Click "+ Add expense" to add one.</div>`;
        }else{
            list.innerHTML=`<div style="display:flex;flex-direction:column;gap:8px">${state.items.map((it,idx)=>`
                <div style="display:grid;grid-template-columns:1.6fr 1fr 1fr auto;gap:8px;align-items:center">
                    <input type="text" class="account-v2-input" placeholder="QuickBooks, insurance, etc." value="${escAttr(it.name||'')}" data-on-input="bizExpensesUpdate" data-args='["${it.id}","name"]'>
                    <input type="number" class="account-v2-input" placeholder="0.00" step="0.01" min="0" value="${Number(it.amount)||0}" data-on-input="bizExpensesUpdate" data-args='["${it.id}","amount"]'>
                    <select class="account-v2-input" data-on-change="bizExpensesUpdate" data-args='["${it.id}","frequency"]'>
                        ${BIZ_EXPENSE_FREQS.map(f=>`<option value="${f}"${f===it.frequency?' selected':''}>${f}</option>`).join('')}
                    </select>
                    <button class="account-v2-btn-cancel" data-on-click="bizExpensesRemove" data-args="${it.id}" title="Remove">&times;</button>
                </div>
            `).join('')}</div>`;
        }
    }
    const perJobEl=document.getElementById('bizExpensesPerJob');
    if(perJobEl){
        const perJob=businessExpensePerJob(state);
        perJobEl.textContent=perJob>0?`≈ ${fmt(perJob)} per job`:'';
    }
}
function bizExpensesAdd(){
    const state=loadBusinessExpenses();
    state.items.push({id:'be-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),name:'',amount:0,frequency:'monthly'});
    saveBusinessExpenses(state);
    bizExpensesRender();
}
function bizExpensesRemove(id){
    const state=loadBusinessExpenses();
    state.items=state.items.filter(it=>it.id!==id);
    saveBusinessExpenses(state);
    bizExpensesRender();
}
function bizExpensesUpdate(id,field,event){
    const state=loadBusinessExpenses();
    const it=state.items.find(x=>x.id===id);
    if(!it)return;
    const el=event&&event.target?event.target:null;
    if(!el)return;
    if(field==='amount')it.amount=parseFloat(el.value)||0;
    else if(field==='frequency')it.frequency=BIZ_EXPENSE_FREQS.includes(el.value)?el.value:'monthly';
    else it.name=el.value;
    saveBusinessExpenses(state);
    // Live-update the per-job display
    const perJobEl=document.getElementById('bizExpensesPerJob');
    if(perJobEl){const p=businessExpensePerJob(state);perJobEl.textContent=p>0?`≈ ${fmt(p)} per job`:''}
}
function bizExpensesSave(){
    const state=loadBusinessExpenses();
    const jpmEl=document.getElementById('bizJobsPerMonth');
    if(jpmEl)state.avgJobsPerMonth=Math.max(1,parseInt(jpmEl.value)||4);
    saveBusinessExpenses(state);
    const perJobEl=document.getElementById('bizExpensesPerJob');
    if(perJobEl){const p=businessExpensePerJob(state);perJobEl.textContent=p>0?`≈ ${fmt(p)} per job`:''}
}
window.bizExpensesRender=bizExpensesRender;
window.bizExpensesAdd=bizExpensesAdd;
window.bizExpensesRemove=bizExpensesRemove;
window.bizExpensesUpdate=bizExpensesUpdate;
window.bizExpensesSave=bizExpensesSave;

async function updateProfile(){
    const name=document.getElementById('accountNameInput').value.trim();
    const email=document.getElementById('accountEmailInput').value.trim();
    const password=document.getElementById('accountPasswordInput').value;
    const msg=document.getElementById('profileMessage');
    const data={};
    if(name&&name!==currentUser.name)data.name=name;
    if(email&&email!==currentUser.email)data.email=email;
    if(password)data.password=password;
    if(!Object.keys(data).length){accountV2SetMessage(msg,'No changes to save','muted');return}
    try{
        const r=await api.updateProfile(data);
        currentUser=r.user;
        if(r.token)api.setToken(r.token);
        showAppScreen();renderAccountPage();
        accountV2SetMessage(msg,'Saved.','ok');
        setTimeout(()=>{accountV2SetMessage(msg,'','muted')},3000);
    }catch(e){
        accountV2SetMessage(msg,e.message,'err');
        setTimeout(()=>{accountV2SetMessage(msg,'','muted')},5000);
    }
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
    if(!key){accountV2ShowLicenseMessage(msg,'Enter a license key.','err');return}
    try{
        const r=await api.activateLicense(key);
        currentUser=r.user;
        accountV2ShowLicenseMessage(msg,r.message||'License activated.','ok');
        showAppScreen();renderAccountPage();
        // After re-render the message gets cleared; re-show success briefly.
        const m2=document.getElementById('licenseMessage');
        accountV2ShowLicenseMessage(m2,r.message||'License activated.','ok');
        setTimeout(()=>{accountV2HideLicenseMessage(m2)},4000);
    }catch(e){accountV2ShowLicenseMessage(msg,e.message,'err')}
}

// ===== ADMIN PANEL (v2) =====

// Avatar palette — deterministic mapping so the same user always gets the
// same color across the app. Soft, slightly desaturated swatches.
const ADMIN_V2_AVATAR_PALETTE=[
    '#3e6b3a','#7a5b1f','#8a3f56','#3e5269','#5a5236',
    '#8a4b22','#3f5a2c','#4a5260','#6b4f7a','#3a5a6e'
];
function adminV2Initials(name){
    const parts=String(name||'').trim().split(/\s+/).filter(Boolean);
    if(!parts.length)return '?';
    if(parts.length===1)return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0]+parts[parts.length-1][0]).toUpperCase();
}
function adminV2AvatarColor(seed){
    const s=String(seed||'');
    let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;
    return ADMIN_V2_AVATAR_PALETTE[h%ADMIN_V2_AVATAR_PALETTE.length];
}
function adminV2PrefixFor(type){
    return ({trial:'EC-TRI-XXXXXX&hellip;',monthly:'EC-MON-XXXXXX&hellip;',yearly:'EC-YRL-XXXXXX&hellip;',lifetime:'EC-LIF-XXXXXX&hellip;'})[type]||'EC-XXXXXX&hellip;';
}
function adminV2DurLabel(type,days){
    if(type==='lifetime')return '∞';
    if(typeof days==='number'&&days>0)return days+'d';
    return ({trial:'7d',monthly:'30d',yearly:'365d'})[type]||'—';
}
function adminV2ShortName(name){
    const parts=String(name||'').trim().split(/\s+/).filter(Boolean);
    if(!parts.length)return '';
    if(parts.length===1)return parts[0];
    return parts[0]+' '+parts[parts.length-1][0]+'.';
}

async function renderAdminPanel(){
    if(!currentUser||currentUser.role!=='admin')return;
    const metricsEl=document.getElementById('adminStats');
    const keysEl=document.getElementById('adminKeysList');
    const usersEl=document.getElementById('adminUsersList');
    try{
        const [statsData,keysData,usersData]=await Promise.all([
            api.getAdminStats().catch(()=>({stats:{}})),
            api.getKeys(),
            api.getUsers()
        ]);
        const allUsers=usersData.users||[];
        const keys=keysData.keys||[];
        const s=(statsData&&statsData.stats)||{};

        // ---- Metrics (5-up) -------------------------------------------
        const totalUsers=typeof s.users==='number'?s.users:allUsers.length;
        const activeUsers=typeof s.active==='number'?s.active:allUsers.filter(u=>u.is_active).length;
        const lifetimeUsers=allUsers.filter(u=>u.license_type==='lifetime').length;
        const monthlyUsers=allUsers.filter(u=>u.license_type==='monthly'||u.license_type==='yearly').length;
        const trialUsers=allUsers.filter(u=>!u.license_type||u.license_type==='trial').length;
        const keysUnused=keys.filter(k=>(k.times_used||0)<(k.max_uses||1)).length;
        const keysTotal=keys.length;
        const trialExpired=allUsers.filter(u=>u.license_type==='trial'&&u.license_expires&&new Date(u.license_expires)<new Date()).length;
        const mrrMonthly=allUsers.filter(u=>u.license_type==='monthly').length*29;
        const mrrYearly=Math.round(allUsers.filter(u=>u.license_type==='yearly').length*290/12);
        const mrr=mrrMonthly+mrrYearly;
        const upcoming=allUsers
            .filter(u=>u.license_type==='monthly'&&u.license_expires)
            .map(u=>new Date(u.license_expires))
            .filter(d=>!isNaN(d)&&d>new Date())
            .sort((a,b)=>a-b)[0];
        const renewLabel=upcoming?'renews '+String(upcoming.getMonth()+1).padStart(2,'0')+'-'+String(upcoming.getDate()).padStart(2,'0'):'no renewals due';

        metricsEl.innerHTML=`
            <div class="admin-v2-metric">
                <div class="admin-v2-metric-label">ACTIVE USERS</div>
                <div class="admin-v2-metric-value">${activeUsers}<span class="admin-v2-metric-denom">/ ${totalUsers||0}</span></div>
                <div class="admin-v2-metric-sub">${trialUsers} trial</div>
            </div>
            <div class="admin-v2-metric">
                <div class="admin-v2-metric-label">LIFETIME</div>
                <div class="admin-v2-metric-value">${lifetimeUsers}</div>
                <div class="admin-v2-metric-sub">no expiry</div>
            </div>
            <div class="admin-v2-metric">
                <div class="admin-v2-metric-label">MONTHLY</div>
                <div class="admin-v2-metric-value">${monthlyUsers}</div>
                <div class="admin-v2-metric-sub">${escHtml(renewLabel)}</div>
            </div>
            <div class="admin-v2-metric">
                <div class="admin-v2-metric-label">KEYS UNUSED</div>
                <div class="admin-v2-metric-value">${keysUnused}<span class="admin-v2-metric-denom">/ ${keysTotal}</span></div>
                <div class="admin-v2-metric-sub">${trialExpired} trial expired</div>
            </div>
            <div class="admin-v2-metric">
                <div class="admin-v2-metric-label">MRR</div>
                <div class="admin-v2-metric-value">$${mrr.toLocaleString()}</div>
                <div class="admin-v2-metric-sub"><span class="arrow">&uarr;</span> +12% MoM</div>
            </div>`;

        // ---- Keys table -----------------------------------------------
        const keysEyebrow=document.getElementById('adminKeysEyebrow');
        if(keysEyebrow)keysEyebrow.textContent='LICENSE KEYS · '+keys.length;
        const keyUserMap={};allUsers.forEach(u=>{if(u.license_key)keyUserMap[u.license_key]=u});
        if(!keys.length){
            keysEl.innerHTML='<div class="admin-v2-empty">No keys generated yet.</div>';
        }else{
            keysEl.innerHTML='<table class="admin-v2-table"><thead><tr><th>KEY</th><th style="width:90px">TYPE</th><th style="width:60px">DUR</th><th style="width:60px">USES</th><th style="width:120px">BY</th><th style="width:40px"></th></tr></thead><tbody>'+keys.map(k=>{
                const u=keyUserMap[k.key];
                const by=u?'<span class="admin-v2-by">'+escHtml(adminV2ShortName(u.name||u.email))+'</span>':'<span class="admin-v2-by unused">Unused</span>';
                return '<tr data-on-click="copyKey" data-args="'+escAttr(k.key)+'"><td class="admin-v2-key-cell">'+escHtml(k.key)+'</td><td><span class="admin-v2-type '+escHtml(k.type)+'">'+escHtml(k.type)+'</span></td><td class="admin-v2-mono-muted">'+adminV2DurLabel(k.type,k.duration_days)+'</td><td class="admin-v2-mono-muted">'+(k.times_used||0)+'/'+(k.max_uses||1)+'</td><td>'+by+'</td><td class="align-center"><button type="button" class="admin-v2-rowaction" title="Delete key" data-on-click="deleteKey" data-args="'+k.id+'">×</button></td></tr>';
            }).join('')+'</tbody></table>';
        }

        // ---- Users table ----------------------------------------------
        const usersEyebrow=document.getElementById('adminUsersEyebrow');
        if(usersEyebrow)usersEyebrow.textContent='USERS · '+allUsers.length;
        if(!allUsers.length){
            usersEl.innerHTML='<div class="admin-v2-empty">No users.</div>';
        }else{
            usersEl.innerHTML='<table class="admin-v2-table"><thead><tr><th>NAME</th><th style="width:160px">ROLE / LICENSE</th><th class="align-center" style="width:60px">STATUS</th><th style="width:90px"></th></tr></thead><tbody>'+allUsers.map(u=>{
                const role=u.role||'user';
                const lic=u.license_type||'trial';
                const expired=u.license_expires&&new Date(u.license_expires)<new Date();
                const licClass=(expired&&lic!=='lifetime')?'expired':'';
                const licLabel=(expired&&lic!=='lifetime')?'expired':lic;
                const color=adminV2AvatarColor(u.email||u.name||String(u.id));
                const initials=adminV2Initials(u.name||u.email);
                const isAdmin=role==='admin';
                const actions=isAdmin?'':'<button type="button" class="admin-v2-rowaction" title="'+(u.is_active?'Deactivate':'Activate')+'" data-on-click="toggleUserActive" data-args=\'['+u.id+', '+(!u.is_active)+']\'>'+(u.is_active?'⏸':'▶')+'</button><button type="button" class="admin-v2-rowaction" title="Delete user" data-on-click="adminDeleteUser" data-args="'+u.id+'">×</button>';
                return '<tr><td><div class="admin-v2-user-cell"><span class="admin-v2-avatar" style="background:'+color+';color:#fff">'+escHtml(initials)+'</span><span class="admin-v2-user-meta"><span class="admin-v2-user-name">'+escHtml(u.name||'(no name)')+'</span><span class="admin-v2-user-email">'+escHtml(u.email||'')+'</span></span></div></td><td><div class="admin-v2-role-cell"><span class="admin-v2-role '+escHtml(role)+'">'+escHtml(role)+'</span><span class="admin-v2-license '+licClass+'">'+escHtml(licLabel)+'</span></div></td><td class="align-center"><span class="admin-v2-status-dot'+(u.is_active?'':' inactive')+'" title="'+(u.is_active?'active':'inactive')+'"></span></td><td class="align-right"><div class="admin-v2-user-actions">'+actions+'</div></td></tr>';
            }).join('')+'</tbody></table>';
        }

        // Refresh helper text after data reload
        updateGenKeysHelper();
    }catch(e){
        if(metricsEl)metricsEl.innerHTML='<div class="admin-v2-empty" style="grid-column:1/-1">Admin load failed: '+escHtml(e.message||String(e))+'</div>';
        notify('Admin load failed: '+e.message,'error');
    }
}

// Helper-text + prefix updater for the generate-keys form. Wired via
// data-on-input / data-on-change on each field.
function updateGenKeysHelper(){
    const typeSel=document.getElementById('genKeyType');
    const maxEl=document.getElementById('genKeyMaxUses');
    const countEl=document.getElementById('genKeyCount');
    const helperEl=document.getElementById('adminGenHelper');
    const prefixEl=document.getElementById('adminGenPrefix');
    if(!typeSel||!helperEl||!prefixEl)return;
    const type=typeSel.value;
    const max=Math.max(1,parseInt(maxEl&&maxEl.value)||1);
    const count=Math.max(1,parseInt(countEl&&countEl.value)||1);
    const durLabel=({trial:'7d',monthly:'30d',yearly:'365d',lifetime:'lifetime'})[type]||'30d';
    const useLabel=max===1?'single-use':(max+' uses each');
    helperEl.textContent=count+' key'+(count===1?'':'s')+' · '+durLabel+' each · '+useLabel+' · downloadable as CSV';
    prefixEl.innerHTML=adminV2PrefixFor(type);
}

// CTA scroll-to-form
function focusGenerateKeys(){
    const form=document.getElementById('adminGenForm');
    if(!form)return;
    form.scrollIntoView({behavior:'smooth',block:'start'});
    const t=document.getElementById('genKeyType');
    if(t)setTimeout(function(){t.focus()},250);
}

// Click-to-copy a license key row
function copyKey(key,ev){
    // Avoid copying when the user clicked an action button inside the row
    if(ev&&ev.target&&ev.target.closest&&ev.target.closest('button'))return;
    if(!key)return;
    const tr=ev&&ev.target&&ev.target.closest?ev.target.closest('tr'):null;
    const finish=function(){
        notify('Copied: '+key,'success');
        if(tr){tr.classList.remove('flash');void tr.offsetWidth;tr.classList.add('flash')}
    };
    try{
        if(navigator.clipboard&&navigator.clipboard.writeText){
            navigator.clipboard.writeText(key).then(finish,function(){finish()});
        }else{
            const ta=document.createElement('textarea');ta.value=key;document.body.appendChild(ta);ta.select();
            try{document.execCommand('copy')}catch(_){}
            document.body.removeChild(ta);finish();
        }
    }catch(_){finish()}
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
    // When invoked via delegation, `this` is the input and `val` is the event; pull value from the element.
    if(this&&this.tagName==='INPUT')val=this.value;
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
    r.taxAmount=r.materialTotal*(r.taxPct/100);r.materialPlusTax=r.materialTotal+r.taxAmount;r.laborTotal=r.laborRate*(r.totalSqft||r.sqft||0);r.deliveryTotal=r.deliveryFee||0;
    r.subtotalBeforeProfit=r.materialPlusTax+r.laborTotal+r.deliveryTotal;r.profitAmount=r.subtotalBeforeProfit*(r.profitPct/100);
    r.sellingBeforeCC=r.subtotalBeforeProfit+r.profitAmount;r.ccFeeAmount=r.sellingBeforeCC*(r.ccFeePct/100);r.sellingPrice=r.sellingBeforeCC+r.ccFeeAmount;
    r.grossMargin=r.sellingPrice>0?(r.profitAmount/r.sellingPrice*100):0;
    // Re-render full results so summary + phase totals stay in sync with the override
    renderCalcResults(r);
}

// ===== RECENTLY USED MATERIALS =====
function trackRecentMaterials(){
    // Render recently used materials on pricing page (v2 styling)
    const el=document.getElementById('recentMaterials');if(!el)return;
    const recent=getRecentMaterials();
    if(!recent.length){el.innerHTML='';return}
    el.innerHTML=`<div class="price-v2-recent-label">Recently edited</div>
        <div class="price-v2-recent-list">${recent.map(r=>`<button class="price-v2-recent-chip" data-on-click="jumpToMaterial" data-args="${r.id}">${escHtml(r.name)} <span class="price-v2-recent-chip-sup">${escHtml(r.supplier)}</span></button>`).join('')}</div>`;
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
    ['calcWaste','calcProfit','calcTax','calcLabor','calcDelivery','calcCCFee','calcStuccoSqft','calcStuccoLinearFt','calcStoneSqft','calcStoneLinearFt','calcPaintSqft'].forEach(id=>{
        const el=document.getElementById(id);if(el)el.addEventListener('input',autoRecalc);
    });
    // Auto-recalc on drywall area and paint coats changes (delegated since rows are dynamic)
    const dwWrap=document.getElementById('drywallAreaRows');
    if(dwWrap){dwWrap.addEventListener('input',autoRecalc);dwWrap.addEventListener('change',autoRecalc)}
    document.getElementById('calcPaintCoats')?.addEventListener('change',autoRecalc);

    // Track recently used materials
    trackRecentMaterials();
}

document.addEventListener('DOMContentLoaded', async function(){
    // Check if user has a valid token — if so, skip login
    const loggedIn = await checkAuth();
    if (loggedIn) initApp();
});

// === Inline handler wrappers (post-CSP refactor) ===
// These named functions replace inline JS that previously lived in onXxx= attributes.
// All are invoked through the data-on-* delegation in handlers.js; `this` is the element.

// Scope-group header: toggle collapsed state on header and the sibling body
function toggleScopeGroup(){this.classList.toggle('collapsed');this.nextElementSibling.classList.toggle('collapsed')}
window.toggleScopeGroup = toggleScopeGroup;

// Phase chip label: defer one tick so the bubbled change updates the checkbox, then sync the label class
function togglePhaseChip(){var el=this;setTimeout(function(){el.classList.toggle('checked',el.querySelector('input').checked);updatePhaseOptions()},0)}
window.togglePhaseChip = togglePhaseChip;

// Drywall area row: remove the closest .dw-area-row from the DOM
function removeDwAreaRow(){this.closest('.dw-area-row').remove()}
window.removeDwAreaRow = removeDwAreaRow;

// Dashboard supplier card: switch active supplier and jump to the pricing page
function openSupplierPricing(name){switchSupplier(name);showPage('pricing')}
window.openSupplierPricing = openSupplierPricing;

// Pricing v2: sidebar filter radio handler (called via data-on-change="priceV2SetFilter")
window.priceV2SetFilter = priceV2SetFilter;

// Expose handlers referenced by the delegation system so window[fnName] resolves
window.switchSupplier = switchSupplier;
window.confirmDeleteSupplier = confirmDeleteSupplier;
window.openAddSupplierModal = openAddSupplierModal;
window.saveMaterialEdit = saveMaterialEdit;
window.cancelEdit = cancelEdit;
window.editMaterial = editMaterial;
window.openDuplicate = openDuplicate;
window.deleteMaterial = deleteMaterial;
window.dragStart = dragStart;
window.dragOver = dragOver;
window.dragLeave = dragLeave;
window.dropRow = dropRow;
window.dragEnd = dragEnd;
window.overrideCalcQty = overrideCalcQty;
window.loadJob = loadJob;
window.duplicateJob = duplicateJob;
window.deleteJob = deleteJob;
window.deleteKey = deleteKey;
window.toggleUserActive = toggleUserActive;
window.adminDeleteUser = adminDeleteUser;
window.jumpToMaterial = jumpToMaterial;
