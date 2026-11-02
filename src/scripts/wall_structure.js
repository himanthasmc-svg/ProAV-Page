// ==========================================
// AV WALL STRUCTURE & PATTRESS ENGINEERING DESIGN ENGINE
// Calculates full design load with Factor of Safety (FOS = 4.0),
// overturning moment, anchor pull-out tension, shear, pattress dimensions,
// and renders dual-view interactive SVGs (Side Elevation + Front Stud Layout).
// ==========================================

const WALL_SUBSTRATES = {
  concrete: {
    name: 'Reinforced Concrete (C25/30 / M25)',
    category: 'Solid Masonry',
    icon: 'fa-cubes',
    badgeClass: 'bg-primary',
    anchorType: 'M10 / M12 Heavy-Duty Wedge Anchors (HST3 / FAZ II)',
    embedmentDepth: '80 mm effective embedment',
    drillHoleDia: '10 mm / 12 mm',
    allowableTensionPerAnchor: 7800, // N (per anchor safe working load with FOS included)
    allowableShearPerAnchor: 9500, // N
    pattressRequired: false,
    pattressNote: 'Direct mechanical fixing to concrete substrate via minimum 4x to 6x expansion wedge anchors. Pattress not strictly required unless leveling uneven cast concrete.',
    minAnchors: 4
  },
  brick: {
    name: 'Solid Clay Brick / Solid Masonry',
    category: 'Solid Masonry',
    icon: 'fa-brick',
    badgeClass: 'bg-danger',
    anchorType: 'M10 Chemical Epoxy Injection Rods or Heavy Sleeve Anchors',
    embedmentDepth: '90 mm embedment with HIT-HY 270 resin',
    drillHoleDia: '12 mm',
    allowableTensionPerAnchor: 5200,
    allowableShearPerAnchor: 6800,
    pattressRequired: false,
    pattressNote: 'Anchor into solid brick masonry units (never into weak mortar joints). Use chemical injection anchoring or structural backing plate for high point-load dispersion.',
    minAnchors: 4
  },
  metal_stud: {
    name: 'Light Gauge Metal Stud Drywall (64/92mm C-Studs)',
    category: 'Framed Drywall',
    icon: 'fa-table-columns',
    badgeClass: 'bg-warning text-dark',
    anchorType: 'Structural Marine Ply Pattress + M8/M10 Machine Bolts & Snaptoggles',
    embedmentDepth: 'Through-bolted into 18mm/25mm Pattress spanning ≥ 3 Studs',
    drillHoleDia: '13 mm (for 1/2" Snaptoggle)',
    allowableTensionPerAnchor: 3200,
    allowableShearPerAnchor: 3800,
    pattressRequired: true,
    pattressNote: 'MANDATORY: Hollow drywall gypsum alone has near-zero tensile pull-out resistance. Minimum 18mm or 25mm structural marine plywood pattress MUST be securely fixed across minimum 3 metal studs with 4.8x38mm self-drilling wafer head screws at 150mm centers.',
    minAnchors: 6
  },
  wood_stud: {
    name: 'Timber Stud Drywall (38x89mm / 2x4 Lumber)',
    category: 'Framed Drywall',
    icon: 'fa-tree',
    badgeClass: 'bg-success',
    anchorType: '18mm/25mm Plywood Pattress + 8.0x75mm Structural Timber Lag Screws',
    embedmentDepth: '65 mm penetration into center of structural studs',
    drillHoleDia: '5 mm pilot hole',
    allowableTensionPerAnchor: 4100,
    allowableShearPerAnchor: 4800,
    pattressRequired: true,
    pattressNote: 'Pattress plate recessed flush between timber studs or surface-mounted across 3 studs. Fix bracket with minimum 4x heavy-duty M8/M10 Grade 8.8 lag screws directly into wood stud centerline plus pattress perimeter fixings.',
    minAnchors: 4
  },
  cmu_hollow: {
    name: 'Hollow CMU Block (Concrete Masonry Unit)',
    category: 'Hollow Masonry',
    icon: 'fa-square',
    badgeClass: 'bg-secondary',
    anchorType: 'M10 Injection Chemical Anchors with Perforated Mesh Sleeves',
    embedmentDepth: '85 mm sleeve with HIT-HY 70 resin injection',
    drillHoleDia: '16 mm (for mesh sleeve)',
    allowableTensionPerAnchor: 3600,
    allowableShearPerAnchor: 4500,
    pattressRequired: false,
    pattressNote: 'Perforated plastic/steel mesh screen tubes with epoxy resin create a solid mechanical lock inside the hollow block web. Surface pattress plate recommended if block face is fragile.',
    minAnchors: 6
  },
  unistrut_grid: {
    name: 'Unistrut Floor-to-Ceiling / Slab Structural Grid',
    category: 'Engineered Steel Rigging',
    icon: 'fa-grip-lines-vertical',
    badgeClass: 'bg-info text-dark',
    anchorType: 'P1000 (41x41mm) Heavy Gauge Steel Channels + M10/M12 Spring Channel Nuts',
    embedmentDepth: 'Slab-to-slab structural channel fixation with Hilti HSL-3 M12 anchors',
    drillHoleDia: 'M12 bolted connection',
    allowableTensionPerAnchor: 12000,
    allowableShearPerAnchor: 14000,
    pattressRequired: false,
    pattressNote: 'Continuous structural P1000/P3300 channels secured top and bottom to concrete slab/steel beams. Eliminates all drywall loading; wall acts merely as partition cladding.',
    minAnchors: 4
  }
};

const WALL_EQUIP_PRESETS = {
  display_85: { name: '85" Commercial Display', type: 'display', w: 1899, h: 1068, weight: 45, mount: 8, cog: 110, span: 600, clearance: 1000 },
  display_98: { name: '98" Large Format Display', type: 'display', w: 2190, h: 1245, weight: 72, mount: 12, cog: 130, span: 800, clearance: 950 },
  display_110: { name: '110" All-in-One dvLED / LCD', type: 'display', w: 2435, h: 1370, weight: 95, mount: 18, cog: 140, span: 900, clearance: 900 },
  led_wall: { name: 'DV-LED Cabinet Array (3.6m × 2.0m)', type: 'led_wall', w: 3600, h: 2025, weight: 220, mount: 45, cog: 200, span: 750, clearance: 1000 },
  video_bar: { name: 'All-in-One Video Bar (e.g. Rally Bar / Neat)', type: 'video_bar', w: 1200, h: 160, weight: 8.5, mount: 2.5, cog: 140, span: 120, clearance: 1100 },
  ptz_camera: { name: 'PTZ Camera on Wall Bracket', type: 'ptz_camera', w: 220, h: 250, weight: 3.2, mount: 1.8, cog: 280, span: 180, clearance: 1800 },
  wall_speaker: { name: 'Wall Column Loudspeaker / Soundbar', type: 'speaker', w: 180, h: 850, weight: 12, mount: 3.0, cog: 160, span: 500, clearance: 1400 },
  switcher_box: { name: 'AV In-Wall Switcher / Wall Box', type: 'switcher', w: 450, h: 400, weight: 14, mount: 4.0, cog: 150, span: 350, clearance: 1200 }
};

let currentWallSvgMode = 'side'; // 'side' or 'front'
let wallLoadMode = 'preset'; // 'preset', 'multi', 'direct'
let multiDeviceList = [
  { id: 'dev_aio', name: 'All-in-One Video Wall / Main Display', weight: 180, height: 1650, width: 3000, cog: 160, enabled: true },
  { id: 'dev_vbar', name: 'All-in-One UC Video Bar (Under Display)', weight: 12, height: 160, width: 1200, cog: 140, enabled: true },
  { id: 'dev_camera', name: 'PTZ Conference Camera (Wall Mount)', weight: 4.5, height: 220, width: 220, cog: 260, enabled: false },
  { id: 'dev_spk', name: 'L/R Wall Column Speakers (Pair)', weight: 22, height: 850, width: 180, cog: 150, enabled: true },
  { id: 'dev_box', name: 'In-Wall Equipment Box & Switcher', weight: 16, height: 400, width: 450, cog: 120, enabled: false }
];

function setWallLoadMode(mode) {
  wallLoadMode = mode;
  var secPreset = document.getElementById('wallLoadSec_preset');
  var secMulti = document.getElementById('wallLoadSec_multi');
  var secDirect = document.getElementById('wallLoadSec_direct');

  if (secPreset) secPreset.style.display = (mode === 'preset') ? 'block' : 'none';
  if (secMulti) secMulti.style.display = (mode === 'multi') ? 'block' : 'none';
  if (secDirect) secDirect.style.display = (mode === 'direct') ? 'block' : 'none';

  ['preset', 'multi', 'direct'].forEach(function(m) {
    var btn = document.getElementById('btnWallLoadMode_' + m);
    if (btn) {
      if (m === mode) {
        btn.className = 'btn btn-primary btn-xs font-mono fw-bold py-1 px-2.5 active shadow-xs';
      } else {
        btn.className = 'btn btn-outline-secondary btn-xs font-mono fw-bold py-1 px-2.5';
      }
    }
  });

  calculateWallStructure();
}

function toggleMultiDeviceItem(idx) {
  if (multiDeviceList[idx]) {
    multiDeviceList[idx].enabled = !multiDeviceList[idx].enabled;
    renderMultiDeviceListUi();
    calculateWallStructure();
  }
}

function updateMultiDeviceProp(idx, prop, val) {
  if (multiDeviceList[idx]) {
    multiDeviceList[idx][prop] = parseFloat(val) || 0;
    calculateWallStructure();
  }
}

function addCustomMultiDevice() {
  var id = 'dev_' + Date.now();
  multiDeviceList.push({
    id: id,
    name: 'Custom AV Device ' + (multiDeviceList.length + 1),
    weight: 15,
    height: 300,
    width: 600,
    cog: 150,
    enabled: true
  });
  renderMultiDeviceListUi();
  calculateWallStructure();
}

function removeMultiDeviceItem(idx) {
  if (multiDeviceList.length > 1) {
    multiDeviceList.splice(idx, 1);
    renderMultiDeviceListUi();
    calculateWallStructure();
  }
}

function renderMultiDeviceListUi() {
  var container = document.getElementById('multiDeviceListContainer');
  if (!container) return;

  var html = multiDeviceList.map(function(dev, idx) {
    return `
      <div class="p-2 mb-1.5 rounded border ${dev.enabled ? 'border-primary-subtle bg-white' : 'border-slate-200 bg-light opacity-75'} font-mono small">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <div class="form-check form-switch mb-0">
            <input class="form-check-input" type="checkbox" id="chkMultiDev_${idx}" ${dev.enabled ? 'checked' : ''} onchange="toggleMultiDeviceItem(${idx})">
            <label class="form-check-label fw-bold text-dark" for="chkMultiDev_${idx}" style="font-size:0.75rem;">
              ${dev.name}
            </label>
          </div>
          ${multiDeviceList.length > 1 ? `
            <button type="button" class="btn btn-link text-danger p-0 border-0" onclick="removeMultiDeviceItem(${idx})" title="Remove Device" style="font-size:0.7rem;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          ` : ''}
        </div>
        <div class="row g-1 align-items-center" style="font-size:0.7rem;">
          <div class="col-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text py-0 px-1 bg-light text-muted" style="font-size:0.65rem;">Mass:</span>
              <input type="number" class="form-control form-control-sm font-mono fw-bold py-0 px-1 text-center" value="${dev.weight}" min="1" max="1000" step="0.5" oninput="updateMultiDeviceProp(${idx}, 'weight', this.value)">
              <span class="input-group-text py-0 px-1 font-mono" style="font-size:0.65rem;">kg</span>
            </div>
          </div>
          <div class="col-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text py-0 px-1 bg-light text-muted" style="font-size:0.65rem;">Height:</span>
              <input type="number" class="form-control form-control-sm font-mono py-0 px-1 text-center" value="${dev.height}" min="50" max="8000" step="10" oninput="updateMultiDeviceProp(${idx}, 'height', this.value)">
              <span class="input-group-text py-0 px-1 font-mono" style="font-size:0.65rem;">mm</span>
            </div>
          </div>
          <div class="col-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text py-0 px-1 bg-light text-muted" style="font-size:0.65rem;">CoG:</span>
              <input type="number" class="form-control form-control-sm font-mono py-0 px-1 text-center" value="${dev.cog}" min="20" max="600" step="5" oninput="updateMultiDeviceProp(${idx}, 'cog', this.value)" title="Center of gravity offset from wall">
              <span class="input-group-text py-0 px-1 font-mono" style="font-size:0.65rem;">mm</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function initWallStructureModule() {
  renderMultiDeviceListUi();
  calculateWallStructure();
}

function applyWallEquipPreset(key) {
  var p = WALL_EQUIP_PRESETS[key];
  if (!p) return;
  setWallLoadMode('preset');
  var elW = document.getElementById('wallScreenWidth');
  var elH = document.getElementById('wallScreenHeight');
  var elWeight = document.getElementById('wallEquipWeight');
  var elMount = document.getElementById('wallMountWeight');
  var elCog = document.getElementById('wallCogOffset');
  var elSpan = document.getElementById('wallBracketSpan');
  var elClear = document.getElementById('wallFloorClearance');
  var elType = document.getElementById('wallEquipType');

  if (elW) elW.value = p.w;
  if (elH) elH.value = p.h;
  if (elWeight) elWeight.value = p.weight;
  if (elMount) elMount.value = p.mount;
  if (elCog) elCog.value = p.cog;
  if (elSpan) elSpan.value = p.span;
  if (elClear) elClear.value = p.clearance;
  if (elType) elType.value = p.type;

  calculateWallStructure();
}

function switchWallSvgView(mode) {
  currentWallSvgMode = mode;
  document.querySelectorAll('.wall-svg-view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === mode);
  });
  renderWallStructureSvg();
}

function exportWallStructureSvg() {
  var svgEl = document.querySelector('#wallStructureSvgContainer svg');
  if (!svgEl) {
    alert('No active wall structure SVG found.');
    return;
  }
  var svgData = new XMLSerializer().serializeToString(svgEl);
  var blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'AV_Wall_Structure_Pattress_Engineering_' + currentWallSvgMode + '_view.svg';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function calculateWallStructure() {
  // Inputs
  var equipType = document.getElementById('wallEquipType')?.value || 'led_wall';
  var screenWidthMm = parseFloat(document.getElementById('wallScreenWidth')?.value) || 3600;
  var screenHeightMm = parseFloat(document.getElementById('wallScreenHeight')?.value) || 2025;
  var equipWeightKg = parseFloat(document.getElementById('wallEquipWeight')?.value) || 220;
  var mountWeightKg = parseFloat(document.getElementById('wallMountWeight')?.value) || 45;
  var cogOffsetMm = parseFloat(document.getElementById('wallCogOffset')?.value) || 200;
  var bracketSpanMm = parseFloat(document.getElementById('wallBracketSpan')?.value) || 750;
  var floorClearanceMm = parseFloat(document.getElementById('wallFloorClearance')?.value) || 1000;
  var wallSubstrate = document.getElementById('wallSubstrateSelect')?.value || 'metal_stud';
  var pattressMat = document.getElementById('wallPattressMaterial')?.value || 'marine_ply_25';
  var studSpacingMm = parseFloat(document.getElementById('wallStudSpacing')?.value) || 400;
  var sheetSizeVal = document.getElementById('wallSheetSizeSelect')?.value || '8x4';

  var subInfo = WALL_SUBSTRATES[wallSubstrate] || WALL_SUBSTRATES.metal_stud;

  // Handle Load Calculation Modes
  var activeEquipTitle = 'DV-LED CABINET ARRAY';
  var assemblyDevicesSummary = '';

  if (wallLoadMode === 'multi') {
    // Mode B: Multi-Device Wall Assembly
    var activeDevs = multiDeviceList.filter(d => d.enabled);
    if (activeDevs.length > 0) {
      equipWeightKg = activeDevs.reduce((sum, d) => sum + (d.weight || 0), 0);
      mountWeightKg = Math.max(15, equipWeightKg * 0.18);
      
      var totalMoment = activeDevs.reduce((sum, d) => sum + ((d.weight || 0) * (d.cog || 150)), 0);
      cogOffsetMm = Math.round(totalMoment / (equipWeightKg || 1));
      
      screenWidthMm = Math.max.apply(null, activeDevs.map(d => d.width || 1200));
      screenHeightMm = activeDevs.reduce((sum, d) => sum + (d.height || 200), 0);
      bracketSpanMm = Math.max(400, Math.min(screenHeightMm * 0.7, 900));

      activeEquipTitle = 'MULTI-DEVICE ASSEMBLY (' + activeDevs.length + ' DEVICES)';
      assemblyDevicesSummary = activeDevs.map(d => d.name + ' (' + d.weight + 'kg)').join(' + ');
    }
  } else if (wallLoadMode === 'direct') {
    // Mode C: Direct Total Load Entry
    var dirEquip = parseFloat(document.getElementById('wallDirectEquipLoad')?.value) || 280;
    var dirMount = parseFloat(document.getElementById('wallDirectMountLoad')?.value) || 45;
    var dirCog = parseFloat(document.getElementById('wallDirectCogOffset')?.value) || 180;
    var dirSpan = parseFloat(document.getElementById('wallDirectBracketSpan')?.value) || 750;
    var dirH = parseFloat(document.getElementById('wallDirectHeight')?.value) || 2000;
    var dirW = parseFloat(document.getElementById('wallDirectWidth')?.value) || 3500;

    equipWeightKg = dirEquip;
    mountWeightKg = dirMount;
    cogOffsetMm = dirCog;
    bracketSpanMm = dirSpan;
    screenHeightMm = dirH;
    screenWidthMm = dirW;
    activeEquipTitle = 'DIRECT SPECIFIED STRUCTURAL LOAD';
    assemblyDevicesSummary = 'Direct Equipment: ' + equipWeightKg + ' kg + Rigging: ' + mountWeightKg + ' kg';
  } else {
    // Mode A: Single Equipment Preset
    activeEquipTitle = (equipType === 'led_wall') ? 'DV-LED CABINET ARRAY' : (equipType === 'display' ? 'COMMERCIAL DISPLAY' : 'AV EQUIPMENT');
    assemblyDevicesSummary = activeEquipTitle + ' (' + equipWeightKg + ' kg)';
  }

  // 1. Weight and FOS 4.0 calculations
  var totalStaticMassKg = equipWeightKg + mountWeightKg;
  var fos = 4.0;
  var totalDesignMassKg = totalStaticMassKg * fos;
  var g = 9.80665;
  var staticForceN = totalStaticMassKg * g;
  var designForceN = totalDesignMassKg * g;
  var designForceKn = designForceN / 1000.0;

  // 2. Overturning Moment (Cantilever action from wall plane to Center of Gravity)
  var cogOffsetM = cogOffsetMm / 1000.0;
  var overturningMomentNm = designForceN * cogOffsetM;

  // 3. Top Anchor Pull-out Tension
  // Moment arm is bracket vertical span d_a
  var bracketSpanM = Math.max(0.2, bracketSpanMm / 1000.0);
  var totalPulloutTensionN = overturningMomentNm / bracketSpanM;
  var totalPulloutTensionKg = totalPulloutTensionN / g;

  // Top anchor count based on substrate and width
  var topAnchorCount = Math.max(2, Math.ceil(screenWidthMm / 800));
  if (wallSubstrate === 'metal_stud') topAnchorCount = Math.max(4, Math.ceil(screenWidthMm / 600));
  var tensionPerTopAnchorN = totalPulloutTensionN / topAnchorCount;

  // 4. Shear Load
  var totalAnchorCount = topAnchorCount * 2;
  var shearPerAnchorN = designForceN / totalAnchorCount;

  // Substrate Safety Check
  var tensionCapacity = subInfo.allowableTensionPerAnchor;
  var shearCapacity = subInfo.allowableShearPerAnchor;
  var tensionRatio = tensionPerTopAnchorN / tensionCapacity;
  var shearRatio = shearPerAnchorN / shearCapacity;
  var combinedUtilization = Math.sqrt(Math.pow(tensionRatio, 2) + Math.pow(shearRatio, 2));
  var isStructurallySafe = (combinedUtilization <= 1.0);

  // 5. Pattress Sizing
  // Width: Spanning ≥ 3 studs. For LED walls, span entire cabinet array + 200mm margin
  var minStudsToSpan = Math.max(3, Math.ceil((screenWidthMm + 200) / studSpacingMm) + 1);
  var pattressWidthMm = Math.max((minStudsToSpan - 1) * studSpacingMm + 150, screenWidthMm + 200);
  var pattressHeightMm = Math.max(bracketSpanMm + 250, screenHeightMm * 0.7);
  var pattressThicknessMm = pattressMat.includes('25') ? 25 : (pattressMat.includes('steel') ? 4 : (pattressMat.includes('12') ? 12 : (pattressMat.includes('32') ? 32 : 18)));
  var pattressAreaSqm = (pattressWidthMm * pattressHeightMm) / 1e6;

  // Sheet sizing calculation (8x4ft: 2440x1220, 7x4ft: 2140x1220, 6x4ft: 1830x1220)
  var sheetW = 2440, sheetH = 1220, sheetLabel = '8ft × 4ft (2440 × 1220 mm)';
  if (sheetSizeVal === '7x4') { sheetW = 2140; sheetH = 1220; sheetLabel = '7ft × 4ft (2140 × 1220 mm)'; }
  else if (sheetSizeVal === '6x4') { sheetW = 1830; sheetH = 1220; sheetLabel = '6ft × 4ft (1830 × 1220 mm)'; }

  var sheetsAcross = Math.ceil(pattressWidthMm / sheetW);
  var sheetsDown = Math.ceil(pattressHeightMm / sheetH);
  var totalSheetsNeeded = Math.max(1, sheetsAcross * sheetsDown);
  var perimeterMm = 2 * (pattressWidthMm + pattressHeightMm);
  var perimeterScrews = Math.ceil(perimeterMm / 150); // 150mm C/C perimeter fixings
  var fieldScrews = Math.ceil((pattressAreaSqm * 1e6) / (300 * 300)); // 300mm C/C field grid
  var totalPattressScrews = perimeterScrews + fieldScrews;

  // 6. Elevation AFFL
  var bottomAfflMm = floorClearanceMm;
  var centerAfflMm = floorClearanceMm + (screenHeightMm / 2.0);
  var topAfflMm = floorClearanceMm + screenHeightMm;

  // Update DOM Results
  var elStaticMass = document.getElementById('resWallStaticMass');
  if (elStaticMass) elStaticMass.innerText = `${totalStaticMassKg.toFixed(1)} kg (${(totalStaticMassKg * 2.20462).toFixed(1)} lbs)`;

  var elDesignLoad = document.getElementById('resWallDesignLoad');
  if (elDesignLoad) elDesignLoad.innerText = `${totalDesignMassKg.toFixed(1)} kg (${designForceKn.toFixed(2)} kN)`;

  var elMoment = document.getElementById('resWallOverturningMoment');
  if (elMoment) elMoment.innerText = `${overturningMomentNm.toFixed(1)} N·m`;

  var elTension = document.getElementById('resWallTopTension');
  if (elTension) elTension.innerText = `${totalPulloutTensionN.toFixed(0)} N (${totalPulloutTensionKg.toFixed(1)} kgf)`;

  var elPattressSheetCount = document.getElementById('resWallSheetCount');
  if (elPattressSheetCount) elPattressSheetCount.innerText = `${totalSheetsNeeded} Standard Sheet(s) (${sheetLabel})`;

  var elScrewSchedule = document.getElementById('resWallScrewSchedule');
  if (elScrewSchedule) elScrewSchedule.innerText = `${totalPattressScrews} Screws (4.8×38mm Wafer Head @ 150mm perimeter / 300mm field)`;

  var elAnchorTension = document.getElementById('resWallAnchorTension');
  if (elAnchorTension) elAnchorTension.innerText = `${tensionPerTopAnchorN.toFixed(0)} N / top anchor (${topAnchorCount} top fixings)`;

  var elAnchorShear = document.getElementById('resWallAnchorShear');
  if (elAnchorShear) elAnchorShear.innerText = `${shearPerAnchorN.toFixed(0)} N / anchor (${totalAnchorCount} total)`;

  var elPattressDims = document.getElementById('resWallPattressDims');
  if (elPattressDims) elPattressDims.innerText = `${Math.round(pattressWidthMm)} mm (W) × ${Math.round(pattressHeightMm)} mm (H) × ${pattressThicknessMm} mm (T)`;

  var elStudsSpanned = document.getElementById('resWallStudsSpanned');
  if (elStudsSpanned) elStudsSpanned.innerText = `${minStudsToSpan} Vertical Studs Spanned @ ${studSpacingMm}mm C/C`;

  var elBottomAffl = document.getElementById('resWallBottomAffl');
  if (elBottomAffl) elBottomAffl.innerText = `${Math.round(bottomAfflMm)} mm AFFL`;

  var elCenterAffl = document.getElementById('resWallCenterAffl');
  if (elCenterAffl) elCenterAffl.innerText = `${Math.round(centerAfflMm)} mm AFFL`;

  var elTopAffl = document.getElementById('resWallTopAffl');
  if (elTopAffl) elTopAffl.innerText = `${Math.round(topAfflMm)} mm AFFL`;

  // Status Badge
  var statusBox = document.getElementById('wallStructuralStatusBox');
  if (statusBox) {
    if (isStructurallySafe) {
      statusBox.className = 'p-3 rounded border border-emerald-300 bg-emerald-50 text-emerald-950 mb-3';
      statusBox.innerHTML = `
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-success font-mono px-2 py-1"><i class="fa-solid fa-circle-check me-1"></i>STRUCTURALLY VERIFIED (FOS 4.0)</span>
            <strong class="text-emerald-900 small">Combined Stress Ratio: ${(combinedUtilization * 100).toFixed(1)}% &le; 100%</strong>
          </div>
          <span class="text-emerald-800 font-mono small fw-bold">Design Capacity OK for ${subInfo.name}</span>
        </div>
        <div class="small text-emerald-800 mt-1" style="font-size:0.75rem;">
          Fastener load is safely distributed across <strong>${totalAnchorCount} structural fixings</strong>. Anchor tension utilization is ${(tensionRatio * 100).toFixed(1)}%, and shear utilization is ${(shearRatio * 100).toFixed(1)}%.
        </div>
      `;
    } else {
      statusBox.className = 'p-3 rounded border border-rose-300 bg-rose-50 text-rose-950 mb-3';
      statusBox.innerHTML = `
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-danger font-mono px-2 py-1"><i class="fa-solid fa-triangle-exclamation me-1"></i>LOAD EXCEEDED (FOS 4.0 REQUIREMENT)</span>
            <strong class="text-rose-900 small">Stress Ratio: ${(combinedUtilization * 100).toFixed(1)}% &gt; 100%</strong>
          </div>
          <span class="text-rose-800 font-mono small fw-bold">Pattress / Unistrut Grid Strengthening Required</span>
        </div>
        <div class="small text-rose-800 mt-1" style="font-size:0.75rem;">
          Tensile pull-out load exceeds single fixing limits. <strong>Remedy:</strong> Increase vertical bracket span, add additional top fixing points, or utilize Floor-to-Ceiling Unistrut channel rigging.
        </div>
      `;
    }
  }

  // Update wall specification notes
  var specContainer = document.getElementById('wallSpecContentBox');
  if (specContainer) {
    specContainer.innerHTML = `
      <div class="p-3 rounded border border-slate-200 bg-white">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="d-flex align-items-center gap-2">
            <span class="badge ${subInfo.badgeClass} font-mono px-2 py-1"><i class="fa-solid ${subInfo.icon} me-1"></i>${subInfo.category.toUpperCase()}</span>
            <strong class="text-dark small">${subInfo.name}</strong>
          </div>
          <span class="badge bg-light text-secondary border font-mono" style="font-size:0.68rem;">FOS 4.0 Certified</span>
        </div>
        <div class="row g-2 small text-secondary">
          <div class="col-md-6">
            <div><strong class="text-dark">Specified Anchor:</strong> ${subInfo.anchorType}</div>
            <div><strong class="text-dark">Minimum Embedment:</strong> ${subInfo.embedmentDepth}</div>
            <div><strong class="text-dark">Drill Hole:</strong> ${subInfo.drillHoleDia}</div>
          </div>
          <div class="col-md-6">
            <div><strong class="text-dark">Allowable Tension / Anchor:</strong> ${(subInfo.allowableTensionPerAnchor / 9.80665).toFixed(0)} kgf (${subInfo.allowableTensionPerAnchor} N)</div>
            <div><strong class="text-dark">Allowable Shear / Anchor:</strong> ${(subInfo.allowableShearPerAnchor / 9.80665).toFixed(0)} kgf (${subInfo.allowableShearPerAnchor} N)</div>
            <div><strong class="text-dark">Pattress Backing:</strong> <span class="${subInfo.pattressRequired ? 'text-danger fw-bold' : 'text-success'}">${subInfo.pattressRequired ? 'MANDATORY FOR DRYWALL' : 'Optional / Direct Concrete Fixing'}</span></div>
          </div>
        </div>
        <div class="mt-2 pt-2 border-top border-slate-100 text-muted small" style="font-size:0.75rem; line-height:1.35;">
          <strong>Engineering Guideline:</strong> ${subInfo.pattressNote}
        </div>
      </div>
    `;
  }

  // Store active state for SVG
  window.activeWallStructureState = {
    equipType, screenWidthMm, screenHeightMm, equipWeightKg, mountWeightKg,
    cogOffsetMm, bracketSpanMm, floorClearanceMm, wallSubstrate, pattressMat,
    studSpacingMm, subInfo, totalStaticMassKg, totalDesignMassKg, designForceKn,
    designForceN, overturningMomentNm, totalPulloutTensionN, totalPulloutTensionKg,
    shearPerAnchorN, topAnchorCount, totalAnchorCount, pattressWidthMm,
    pattressHeightMm, pattressThicknessMm, minStudsToSpan, bottomAfflMm,
    centerAfflMm, topAfflMm, isStructurallySafe, activeEquipTitle, assemblyDevicesSummary,
    wallLoadMode
  };

  renderWallStructureSvg();
}

function renderWallStructureSvg() {
  var container = document.getElementById('wallStructureSvgContainer');
  if (!container) return;

  var s = window.activeWallStructureState;
  if (!s) return;

  if (currentWallSvgMode === 'side') {
    renderSideElevationSvg(container, s);
  } else {
    renderFrontElevationSvg(container, s);
  }
}

// 1. SIDE ELEVATION CROSS-SECTION SVG (Pristine Non-Overlapping Layout)
function renderSideElevationSvg(container, s) {
  var w = 980;
  var h = 540;

  var floorY = 470;
  var wallX = 260;
  var wallThick = 95;

  // Scaling display height onto SVG
  var maxDispSvgHeight = 230;
  var scaleY = maxDispSvgHeight / Math.max(1200, s.screenHeightMm);

  var screenH = Math.max(130, s.screenHeightMm * scaleY);
  var clearanceH = Math.min(150, Math.max(50, s.floorClearanceMm * scaleY * 0.75));
  var bottomY = floorY - clearanceH;
  var topY = bottomY - screenH;
  var centerY = bottomY - (screenH / 2.0);

  var mountDepth = Math.max(30, (s.cogOffsetMm / 10.0) * 0.85);
  var screenThick = 36;
  var mountX = wallX + wallThick;
  var screenX = mountX + mountDepth;

  // Bracket
  var bracketH = Math.min(screenH * 0.85, Math.max(70, s.bracketSpanMm * scaleY));
  var bracketTopY = centerY - (bracketH / 2.0);
  var bracketBottomY = centerY + (bracketH / 2.0);

  // Pattress
  var pattressThick = 20;
  var pattressH = bracketH + 60;
  var pattressTopY = bracketTopY - 30;
  var pattressX = wallX + wallThick - (s.wallSubstrate.includes('concrete') ? 0 : 25);

  // Dedicated Callout Card Stack (Right Column: X = 530 to 950, zero overlap)
  var cardX = 530;
  var cardW = 420;

  var svg = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; font-family:'JetBrains Mono', monospace; font-size:11px;">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8"/>
        </marker>
        <marker id="arrow-danger" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ef4444"/>
        </marker>
        <marker id="arrow-warning" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#f59e0b"/>
        </marker>
        <pattern id="concreteHatch" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="20" x2="20" y2="0" stroke="#334155" stroke-width="1.2"/>
          <circle cx="5" cy="5" r="1.5" fill="#475569"/>
          <circle cx="15" cy="14" r="1.2" fill="#475569"/>
        </pattern>
        <pattern id="pattressWood" width="10" height="10" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#d97706" stroke-width="1" opacity="0.6"/>
          <line x1="5" y1="0" x2="5" y2="10" stroke="#b45309" stroke-width="1" opacity="0.4"/>
        </pattern>
        <pattern id="floorTiles" width="25" height="15" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="25" y2="0" stroke="#475569" stroke-width="1"/>
          <line x1="0" y1="0" x2="0" y2="15" stroke="#334155" stroke-width="1"/>
        </pattern>
      </defs>

      <!-- Grid lines -->
      <g stroke="#1e293b" stroke-width="0.5" stroke-dasharray="3,3">
        <line x1="20" y1="${floorY}" x2="${w-20}" y2="${floorY}"/>
        <line x1="${wallX}" y1="35" x2="${wallX}" y2="${floorY}"/>
      </g>

      <!-- ================= 1. WALL SUBSTRATE ================= -->
      <g id="wallGroup">
        <rect x="${wallX}" y="35" width="${wallThick}" height="${floorY - 35}" fill="${s.wallSubstrate.includes('concrete') ? 'url(#concreteHatch)' : '#1e293b'}" stroke="#475569" stroke-width="2"/>
        <text x="${wallX + wallThick/2}" y="55" fill="#94a3b8" font-size="9" text-anchor="middle" font-weight="bold">${s.subInfo.name.toUpperCase().substring(0, 26)}</text>
        
        <!-- Drywall gypsum boards if metal stud -->
        ${s.wallSubstrate === 'metal_stud' || s.wallSubstrate === 'wood_stud' ? `
          <rect x="${wallX + 15}" y="35" width="60" height="${floorY - 35}" fill="#0f172a" stroke="#64748b" stroke-dasharray="2,2"/>
          <rect x="${wallX + wallThick - 12}" y="35" width="12" height="${floorY - 35}" fill="#334155" stroke="#64748b" stroke-width="1"/>
          <text x="${wallX + wallThick - 6}" y="${centerY}" fill="#cbd5e1" font-size="8" text-anchor="middle" transform="rotate(-90, ${wallX + wallThick - 6}, ${centerY})">12.5mm GYPSUM</text>
        ` : ''}
      </g>

      <!-- ================= 2. STRUCTURAL PATTRESS BACKING PLATE ================= -->
      <g id="pattressGroup">
        <rect x="${pattressX}" y="${pattressTopY}" width="${pattressThick}" height="${pattressH}" fill="url(#pattressWood)" stroke="#f59e0b" stroke-width="2" rx="2"/>
        
        <!-- Pattress Callout Box (Angled above wall - zero collision) -->
        <path d="M ${pattressX + pattressThick/2} ${pattressTopY} L ${pattressX - 10} ${pattressTopY - 18} L ${wallX - 35} ${pattressTopY - 18}" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2"/>
        <circle cx="${pattressX + pattressThick/2}" cy="${pattressTopY}" r="3" fill="#f59e0b"/>
        
        <rect x="${wallX - 90}" y="${pattressTopY - 36}" width="160" height="26" rx="4" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="${wallX - 10}" y="${pattressTopY - 19}" fill="#fbbf24" font-size="9" font-weight="bold" text-anchor="middle">
          🧱 ${s.pattressThicknessMm}mm PATTRESS PLATE
        </text>
      </g>

      <!-- ================= 3. WALL MOUNTING BRACKET & ANCHORS ================= -->
      <g id="bracketGroup">
        <rect x="${mountX}" y="${bracketTopY}" width="16" height="${bracketH}" fill="#334155" stroke="#94a3b8" stroke-width="1.5" rx="2"/>
        <line x1="${mountX + 16}" y1="${bracketTopY + 15}" x2="${screenX}" y2="${bracketTopY + 15}" stroke="#94a3b8" stroke-width="3"/>
        <line x1="${mountX + 16}" y1="${bracketBottomY - 15}" x2="${screenX}" y2="${bracketBottomY - 15}" stroke="#94a3b8" stroke-width="3"/>
        <line x1="${screenX}" y1="${bracketTopY + 15}" x2="${screenX}" y2="${bracketBottomY - 15}" stroke="#94a3b8" stroke-width="3"/>

        <!-- Top & Bottom Anchor Bolts -->
        <circle cx="${mountX + 6}" cy="${bracketTopY + 15}" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="${mountX + 6}" cy="${bracketBottomY - 15}" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>

        <!-- Tension Arrow outward from top anchor -->
        <line x1="${mountX + 6}" y1="${bracketTopY + 15}" x2="${mountX + 50}" y2="${bracketTopY + 15}" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow-warning)"/>
      </g>

      <!-- ================= 4. DISPLAY / LED WALL BODY & COG ================= -->
      <g id="displayGroup">
        <rect x="${screenX}" y="${topY}" width="${screenThick}" height="${screenH}" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" rx="3"/>
        <line x1="${screenX + screenThick}" y1="${topY + 2}" x2="${screenX + screenThick}" y2="${topY + screenH - 2}" stroke="#00f2fe" stroke-width="3"/>
        
        <!-- CoG Glyph -->
        <g transform="translate(${screenX + screenThick/2}, ${centerY})">
          <circle cx="0" cy="0" r="8" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M 0 -8 A 8 8 0 0 1 8 0 L 0 0 Z M 0 8 A 8 8 0 0 1 -8 0 L 0 0 Z" fill="#000000"/>
        </g>

        <!-- Downward Gravity Force Vector from CoG -->
        <line x1="${screenX + screenThick/2}" y1="${centerY + 10}" x2="${screenX + screenThick/2}" y2="${centerY + 65}" stroke="#ef4444" stroke-width="3" marker-end="url(#arrow-danger)"/>
      </g>

      <!-- ================= 5. DEDICATED ENGINEERING CARDS STACK (RIGHT COLUMN - ZERO OVERLAP) ================= -->
      <g id="engineeringCardsStack">
        <!-- CARD 1: Equipment Specification & Assembly -->
        <path d="M ${screenX + screenThick} ${topY + 15} L ${cardX - 10} ${topY + 15} L ${cardX} 55" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="3,2"/>
        <circle cx="${screenX + screenThick}" cy="${topY + 15}" r="3" fill="#38bdf8"/>
        
        <rect x="${cardX}" y="35" width="${cardW}" height="48" rx="5" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="${cardX + 12}" y="52" fill="#38bdf8" font-size="10.5" font-weight="bold">
          📺 ${s.activeEquipTitle}
        </text>
        <text x="${cardX + 12}" y="67" fill="#94a3b8" font-size="8.5">
          Total Mass: ${s.totalStaticMassKg.toFixed(0)} kg (Equip: ${s.equipWeightKg.toFixed(0)}kg + Rig: ${s.mountWeightKg.toFixed(0)}kg) | H: ${s.screenHeightMm}mm &times; W: ${s.screenWidthMm}mm
        </text>

        <!-- CARD 2: Top Anchors Pull-out Tension Force -->
        <path d="M ${mountX + 50} ${bracketTopY + 15} L ${cardX - 15} ${bracketTopY + 15} L ${cardX} 115" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="3,2"/>
        <circle cx="${mountX + 6}" cy="${bracketTopY + 15}" r="2" fill="#f59e0b"/>

        <rect x="${cardX}" y="95" width="${cardW}" height="48" rx="5" fill="#451a03" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="${cardX + 12}" y="112" fill="#fbbf24" font-size="10" font-weight="bold">
          ⚡ TOP ANCHORS TENSION: T_pull = ${s.totalPulloutTensionN.toFixed(0)} N (${s.totalPulloutTensionKg.toFixed(1)} kgf)
        </text>
        <text x="${cardX + 12}" y="127" fill="#fed7aa" font-size="8.5">
          ${s.topAnchorCount} Top Fixings &bull; Load / Anchor: ${(s.totalPulloutTensionN / s.topAnchorCount).toFixed(0)} N (Allowable: ${s.subInfo.allowableTensionPerAnchor} N)
        </text>

        <!-- CARD 3: Center of Gravity (CoG) & Overturning Torque -->
        <path d="M ${screenX + screenThick/2} ${centerY} L ${cardX - 15} ${centerY} L ${cardX} 175" fill="none" stroke="#eab308" stroke-width="1.2" stroke-dasharray="3,2"/>
        <circle cx="${screenX + screenThick/2}" cy="${centerY}" r="2" fill="#eab308"/>

        <rect x="${cardX}" y="155" width="${cardW}" height="48" rx="5" fill="#1e1b4b" stroke="#eab308" stroke-width="1.5"/>
        <text x="${cardX + 12}" y="172" fill="#fde047" font-size="10" font-weight="bold">
          ⯁ OVERTURNING MOMENT: ${s.overturningMomentNm.toFixed(0)} N&middot;m
        </text>
        <text x="${cardX + 12}" y="187" fill="#cbd5e1" font-size="8.5">
          Center of Gravity: ${s.cogOffsetMm} mm from wall &bull; Bracket Vertical Arm: ${s.bracketSpanMm} mm
        </text>

        <!-- CARD 4: FOS 4.0 Structural Design Load -->
        <path d="M ${screenX + screenThick/2} ${centerY + 65} L ${cardX - 15} ${centerY + 65} L ${cardX} 235" fill="none" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="3,2"/>

        <rect x="${cardX}" y="215" width="${cardW}" height="48" rx="5" fill="#450a0a" stroke="#ef4444" stroke-width="1.5"/>
        <text x="${cardX + 12}" y="232" fill="#fca5a5" font-size="10" font-weight="bold">
          🔻 FOS 4.0 DESIGN LOAD: F_design = ${s.designForceKn.toFixed(2)} kN (${s.totalDesignMassKg.toFixed(0)} kg)
        </text>
        <text x="${cardX + 12}" y="247" fill="#fecaca" font-size="8.5">
          Mandatory Safety Factor: 4.0 &bull; Base Static Mass: ${s.totalStaticMassKg.toFixed(0)} kg
        </text>

        <!-- CARD 5: Bottom Anchors Shear Force -->
        <path d="M ${mountX + 6} ${bracketBottomY - 15} L ${cardX - 15} ${bracketBottomY - 15} L ${cardX} 295" fill="none" stroke="#0ea5e9" stroke-width="1.2" stroke-dasharray="3,2"/>
        <circle cx="${mountX + 6}" cy="${bracketBottomY - 15}" r="2" fill="#0ea5e9"/>

        <rect x="${cardX}" y="275" width="${cardW}" height="48" rx="5" fill="#0c4a6e" stroke="#0ea5e9" stroke-width="1.5"/>
        <text x="${cardX + 12}" y="292" fill="#7dd3fc" font-size="10" font-weight="bold">
          ⚓ BOTTOM FIXINGS (SHEAR): ${(s.shearPerAnchorN).toFixed(0)} N / anchor
        </text>
        <text x="${cardX + 12}" y="307" fill="#bae6fd" font-size="8.5">
          ${s.totalAnchorCount} Total Anchors &bull; Allowable Shear: ${s.subInfo.allowableShearPerAnchor} N / anchor (FOS Verified)
        </text>

        <!-- CARD 6: Substrate & Pattress Specification Badge -->
        <rect x="${cardX}" y="335" width="${cardW}" height="48" rx="5" fill="#0f172a" stroke="#22c55e" stroke-width="1.5"/>
        <text x="${cardX + 12}" y="352" fill="#4ade80" font-size="10" font-weight="bold">
          🌲 ${s.pattressThicknessMm}mm ${s.wallSubstrate === 'metal_stud' ? 'MARINE PLYWOOD PATTRESS' : 'STRUCTURAL SUBSTRATE'}
        </text>
        <text x="${cardX + 12}" y="367" fill="#94a3b8" font-size="8.5">
          Spanning ${s.minStudsToSpan} studs &bull; Fasteners: ${s.subInfo.anchorType.substring(0, 42)}
        </text>
      </g>

      <!-- ================= 6. ELEVATION DATUM LADDER (FAR-LEFT - ZERO OVERLAP) ================= -->
      <g id="elevationDatumLadder">
        <!-- Vertical Reference Datum Line on Left -->
        <line x1="170" y1="35" x2="170" y2="${floorY}" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,3"/>

        <!-- 1. Top AFFL Level -->
        <line x1="170" y1="${topY}" x2="${screenX}" y2="${topY}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
        <circle cx="170" cy="${topY}" r="3" fill="#cbd5e1"/>
        <rect x="15" y="${topY - 12}" width="145" height="24" rx="4" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.2"/>
        <text x="87" y="${topY + 4}" fill="#f8fafc" font-size="9" font-weight="bold" text-anchor="middle">
          ▲ TOP: ${s.topAfflMm} mm
        </text>

        <!-- 2. Centerline AFFL Level -->
        <line x1="170" y1="${centerY}" x2="${screenX + screenThick/2}" y2="${centerY}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3"/>
        <circle cx="170" cy="${centerY}" r="3" fill="#f59e0b"/>
        <rect x="15" y="${centerY - 12}" width="145" height="24" rx="4" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="87" y="${centerY + 4}" fill="#fbbf24" font-size="9" font-weight="bold" text-anchor="middle">
          ⯁ CL: ${Math.round(s.centerAfflMm)} mm
        </text>

        <!-- 3. Bottom AFFL Clearance Level -->
        <line x1="170" y1="${bottomY}" x2="${screenX}" y2="${bottomY}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3"/>
        <circle cx="170" cy="${bottomY}" r="3" fill="#38bdf8"/>
        <rect x="15" y="${bottomY - 12}" width="145" height="24" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="87" y="${bottomY + 4}" fill="#7dd3fc" font-size="9" font-weight="bold" text-anchor="middle">
          ▼ CLEAR: ${s.bottomAfflMm} mm
        </text>

        <!-- 4. Finished Floor Datum (AFFL 0.0) -->
        <circle cx="170" cy="${floorY}" r="4" fill="#22c55e"/>
        <rect x="15" y="${floorY - 26}" width="145" height="22" rx="4" fill="#052e16" stroke="#22c55e" stroke-width="1.2"/>
        <text x="87" y="${floorY - 11}" fill="#4ade80" font-size="9" font-weight="bold" text-anchor="middle">
          ⏚ AFFL 0.0 mm
        </text>
      </g>

      <!-- ================= 7. FLOOR LINE & FINISHED GRADE ================= -->
      <g id="floorLine">
        <rect x="15" y="${floorY}" width="${w - 30}" height="45" fill="url(#floorTiles)" stroke="#64748b" stroke-width="2"/>
        <line x1="15" y1="${floorY}" x2="${w - 15}" y2="${floorY}" stroke="#ffffff" stroke-width="2"/>
      </g>
    </svg>
  `;

  container.innerHTML = svg;
}

// 2. FRONT ELEVATION & STUD LAYOUT SVG
function renderFrontElevationSvg(container, s) {
  var w = 820;
  var h = 540;
  var floorY = 480;

  var centerScreenX = w / 2;
  var scaleX = 460 / Math.max(2000, s.screenWidthMm);
  var screenSvgW = Math.max(200, s.screenWidthMm * scaleX);
  var screenSvgH = Math.max(120, s.screenHeightMm * scaleX * (s.screenHeightMm / s.screenWidthMm) * 1.7);

  var screenLeft = centerScreenX - (screenSvgW / 2);
  var screenRight = centerScreenX + (screenSvgW / 2);

  var clearanceSvgH = Math.min(160, Math.max(50, s.floorClearanceMm * scaleX * 0.7));
  var bottomY = floorY - clearanceSvgH;
  var topY = bottomY - screenSvgH;

  var pattressSvgW = Math.min(w - 100, Math.max(screenSvgW + 50, s.pattressWidthMm * scaleX));
  var pattressSvgH = Math.min(screenSvgH + 80, s.pattressHeightMm * scaleX * 1.2);
  var pattressLeft = centerScreenX - (pattressSvgW / 2);
  var pattressTop = topY + (screenSvgH / 2) - (pattressSvgH / 2);

  // Vertical Stud Spacing calculation
  var studIntervalSvg = Math.max(45, s.studSpacingMm * scaleX);
  var studCount = Math.floor((w - 120) / studIntervalSvg);
  var studStartX = centerScreenX - (Math.floor(studCount / 2) * studIntervalSvg);

  var studsSvg = '';
  for (var i = 0; i < studCount; i++) {
    var curStudX = studStartX + (i * studIntervalSvg);
    var isUnderPattress = (curStudX >= pattressLeft && curStudX <= pattressLeft + pattressSvgW);
    studsSvg += `
      <g>
        <line x1="${curStudX}" y1="50" x2="${curStudX}" y2="${floorY}" stroke="${isUnderPattress ? '#38bdf8' : '#334155'}" stroke-width="${isUnderPattress ? '5' : '3'}" opacity="${isUnderPattress ? '0.9' : '0.4'}"/>
        <text x="${curStudX}" y="42" fill="${isUnderPattress ? '#38bdf8' : '#64748b'}" font-size="8" text-anchor="middle">STUD ${i+1}</text>
      </g>
    `;
  }

  var svg = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; font-family:'JetBrains Mono', monospace; font-size:11px;">
      <defs>
        <marker id="arrow2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8"/>
        </marker>
        <pattern id="pattressWood2" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#78350f" opacity="0.3"/>
          <line x1="0" y1="0" x2="12" y2="12" stroke="#d97706" stroke-width="0.8" opacity="0.5"/>
        </pattern>
      </defs>

      <!-- 1. VERTICAL WALL STUDS -->
      <g id="studsLayer">
        ${studsSvg}
      </g>

      <!-- Stud Centers Callout -->
      <g stroke="#64748b" stroke-width="1">
        <line x1="${studStartX}" y1="465" x2="${studStartX + studIntervalSvg}" y2="465" marker-start="url(#arrow2)" marker-end="url(#arrow2)"/>
        <text x="${studStartX + studIntervalSvg/2}" y="458" fill="#94a3b8" font-size="8" text-anchor="middle">${s.studSpacingMm}mm C/C</text>
      </g>

      <!-- 2. PATTRESS BACKING PLATE (Spanning Studs) -->
      <g id="frontPattress">
        <rect x="${pattressLeft}" y="${pattressTop}" width="${pattressSvgW}" height="${pattressSvgH}" fill="url(#pattressWood2)" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="5,3" rx="4"/>
        <text x="${pattressLeft + 12}" y="${pattressTop + 18}" fill="#f59e0b" font-size="10" font-weight="bold">
          STRUCTURAL PATTRESS (${Math.round(s.pattressWidthMm)} × ${Math.round(s.pattressHeightMm)} × ${s.pattressThicknessMm}mm)
        </text>
        <text x="${pattressLeft + 12}" y="${pattressTop + 32}" fill="#fbbf24" font-size="8">
          Spanning ${s.minStudsToSpan} Structural Studs &bull; Perimeter fixed @ 150mm C/C
        </text>
      </g>

      <!-- 3. DISPLAY MOUNT RAILS -->
      <g id="mountRails" stroke="#94a3b8" stroke-width="2">
        <line x1="${screenLeft + 30}" y1="${topY + screenSvgH*0.25}" x2="${screenRight - 30}" y2="${topY + screenSvgH*0.25}" stroke-width="4"/>
        <line x1="${screenLeft + 30}" y1="${topY + screenSvgH*0.75}" x2="${screenRight - 30}" y2="${topY + screenSvgH*0.75}" stroke-width="4"/>
        <!-- Anchor Bolt Circles across Studs -->
        ${[0.2, 0.4, 0.6, 0.8].map(ratio => `
          <circle cx="${screenLeft + screenSvgW * ratio}" cy="${topY + screenSvgH*0.25}" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="${screenLeft + screenSvgW * ratio}" cy="${topY + screenSvgH*0.75}" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
        `).join('')}
      </g>

      <!-- 4. SCREEN PROFILE OUTLINE -->
      <g id="frontScreen">
        <rect x="${screenLeft}" y="${topY}" width="${screenSvgW}" height="${screenSvgH}" fill="#1e293b" fill-opacity="0.85" stroke="#38bdf8" stroke-width="2.5" rx="4"/>
        <text x="${centerScreenX}" y="${topY + screenSvgH/2 - 8}" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">
          ${s.screenWidthMm} mm (W) &times; ${s.screenHeightMm} mm (H)
        </text>
        <text x="${centerScreenX}" y="${topY + screenSvgH/2 + 10}" fill="#38bdf8" font-size="10" text-anchor="middle">
          ${s.equipType === 'led_wall' ? 'LED Video Wall Array' : 'Commercial Display'} (${s.totalStaticMassKg.toFixed(0)} kg)
        </text>
        <text x="${centerScreenX}" y="${topY + screenSvgH/2 + 25}" fill="#22c55e" font-size="9" text-anchor="middle">
          FOS 4.0 Design Load: ${s.totalDesignMassKg.toFixed(0)} kg (${s.designForceKn.toFixed(2)} kN)
        </text>
      </g>

      <!-- 5. FLOOR & ELEVATION DIMENSIONS -->
      <g id="frontFloor">
        <line x1="50" y1="${floorY}" x2="${w - 50}" y2="${floorY}" stroke="#22c55e" stroke-width="2"/>
        <text x="70" y="${floorY - 6}" fill="#22c55e" font-size="10" font-weight="bold">FINISHED FLOOR LINE (AFFL 0.0 mm)</text>

        <!-- Floor to Bottom Display clearance -->
        <line x1="${screenRight + 20}" y1="${bottomY}" x2="${screenRight + 20}" y2="${floorY}" stroke="#38bdf8" stroke-width="1.5" marker-start="url(#arrow2)" marker-end="url(#arrow2)"/>
        <text x="${screenRight + 28}" y="${bottomY + clearanceSvgH/2 + 4}" fill="#38bdf8" font-size="10" font-weight="bold">
          ${s.bottomAfflMm} mm AFFL (Clearance)
        </text>
      </g>
    </svg>
  `;

  container.innerHTML = svg;
}

// Window exports
window.initWallStructureModule = initWallStructureModule;
window.calculateWallStructure = calculateWallStructure;
window.switchWallSvgView = switchWallSvgView;
window.applyWallEquipPreset = applyWallEquipPreset;
window.exportWallStructureSvg = exportWallStructureSvg;
window.setWallLoadMode = setWallLoadMode;
window.toggleMultiDeviceItem = toggleMultiDeviceItem;
window.updateMultiDeviceProp = updateMultiDeviceProp;
window.addCustomMultiDevice = addCustomMultiDevice;
window.removeMultiDeviceItem = removeMultiDeviceItem;
window.renderMultiDeviceListUi = renderMultiDeviceListUi;
window.WALL_SUBSTRATES = WALL_SUBSTRATES;
window.WALL_EQUIP_PRESETS = WALL_EQUIP_PRESETS;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof calculateWallStructure === 'function') {
      calculateWallStructure();
    }
  });
}
