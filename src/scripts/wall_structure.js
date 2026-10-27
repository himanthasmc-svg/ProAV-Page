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

let currentWallSvgMode = 'side'; // 'side' or 'front'

function initWallStructureModule() {
  calculateWallStructure();
}

function switchWallSvgView(mode) {
  currentWallSvgMode = mode;
  document.querySelectorAll('.wall-svg-view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === mode);
  });
  renderWallStructureSvg();
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

  var subInfo = WALL_SUBSTRATES[wallSubstrate] || WALL_SUBSTRATES.metal_stud;

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
  var pattressThicknessMm = pattressMat.includes('25') ? 25 : (pattressMat.includes('steel') ? 4 : 18);
  var pattressAreaSqm = (pattressWidthMm * pattressHeightMm) / 1e6;

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
    centerAfflMm, topAfflMm, isStructurallySafe
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

// 1. SIDE ELEVATION CROSS-SECTION SVG
function renderSideElevationSvg(container, s) {
  var w = 980;
  var h = 560;

  var floorY = 490;
  var wallX = 330;
  var wallThick = 95;

  // Scaling display height onto SVG
  var maxDispSvgHeight = 250;
  var scaleY = maxDispSvgHeight / Math.max(1200, s.screenHeightMm);

  var screenH = Math.max(140, s.screenHeightMm * scaleY);
  var clearanceH = Math.min(170, Math.max(60, s.floorClearanceMm * scaleY * 0.8));
  var bottomY = floorY - clearanceH;
  var topY = bottomY - screenH;
  var centerY = bottomY - (screenH / 2.0);

  var mountDepth = Math.max(30, (s.cogOffsetMm / 10.0) * 0.85);
  var screenThick = 32;
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
        <line x1="${wallX}" y1="40" x2="${wallX}" y2="${floorY}"/>
      </g>

      <!-- ================= 1. WALL SUBSTRATE ================= -->
      <g id="wallGroup">
        <rect x="${wallX}" y="40" width="${wallThick}" height="${floorY - 40}" fill="${s.wallSubstrate.includes('concrete') ? 'url(#concreteHatch)' : '#1e293b'}" stroke="#475569" stroke-width="2"/>
        <text x="${wallX + wallThick/2}" y="65" fill="#94a3b8" font-size="10" text-anchor="middle" font-weight="bold">${s.subInfo.name.toUpperCase()}</text>
        
        <!-- Drywall gypsum boards if metal stud -->
        ${s.wallSubstrate === 'metal_stud' || s.wallSubstrate === 'wood_stud' ? `
          <!-- Metal C-stud core -->
          <rect x="${wallX + 15}" y="40" width="60" height="${floorY - 40}" fill="#0f172a" stroke="#64748b" stroke-dasharray="2,2"/>
          <!-- Drywall Skin Layer -->
          <rect x="${wallX + wallThick - 12}" y="40" width="12" height="${floorY - 40}" fill="#334155" stroke="#64748b" stroke-width="1"/>
          <text x="${wallX + wallThick - 6}" y="${centerY}" fill="#cbd5e1" font-size="8" text-anchor="middle" transform="rotate(-90, ${wallX + wallThick - 6}, ${centerY})">12.5mm GYPSUM</text>
        ` : ''}
      </g>

      <!-- ================= 2. STRUCTURAL PATTRESS BACKING PLATE ================= -->
      <g id="pattressGroup">
        <rect x="${pattressX}" y="${pattressTopY}" width="${pattressThick}" height="${pattressH}" fill="url(#pattressWood)" stroke="#f59e0b" stroke-width="2" rx="2"/>
        
        <!-- Pattress Callout Box (Positioned Above Pattress with Angled Leader Line - Zero Overlap) -->
        <path d="M ${pattressX + pattressThick/2} ${pattressTopY} L ${pattressX + pattressThick/2} ${pattressTopY - 14} L ${wallX + 50} ${pattressTopY - 22}" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2"/>
        <circle cx="${pattressX + pattressThick/2}" cy="${pattressTopY}" r="3" fill="#f59e0b"/>
        
        <rect x="${wallX - 35}" y="${pattressTopY - 48}" width="185" height="26" rx="4" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="${wallX + 57}" y="${pattressTopY - 31}" fill="#fbbf24" font-size="9.5" font-weight="bold" text-anchor="middle">
          🧱 ${s.pattressThicknessMm}mm PATTRESS PLATE
        </text>
      </g>

      <!-- ================= 3. WALL MOUNTING BRACKET & ANCHORS ================= -->
      <g id="bracketGroup">
        <!-- Vertical mount rail -->
        <rect x="${mountX}" y="${bracketTopY}" width="16" height="${bracketH}" fill="#334155" stroke="#94a3b8" stroke-width="1.5" rx="2"/>
        <!-- Arm extensions -->
        <line x1="${mountX + 16}" y1="${bracketTopY + 15}" x2="${screenX}" y2="${bracketTopY + 15}" stroke="#94a3b8" stroke-width="3"/>
        <line x1="${mountX + 16}" y1="${bracketBottomY - 15}" x2="${screenX}" y2="${bracketBottomY - 15}" stroke="#94a3b8" stroke-width="3"/>
        <line x1="${screenX}" y1="${bracketTopY + 15}" x2="${screenX}" y2="${bracketBottomY - 15}" stroke="#94a3b8" stroke-width="3"/>

        <!-- Top & Bottom Anchor Bolts -->
        <circle cx="${mountX + 6}" cy="${bracketTopY + 15}" r="4.5" fill="#ef4444" stroke="#ffffff" stroke-width="1.2"/>
        <circle cx="${mountX + 6}" cy="${bracketBottomY - 15}" r="4.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.2"/>

        <!-- Top Anchor Callout Box (Positioned Above-Right of Bracket - Clear from Wall & Elevation) -->
        <path d="M ${mountX + 6} ${bracketTopY + 15} L ${mountX + 25} ${bracketTopY - 15} L ${mountX + 35} ${bracketTopY - 33}" fill="none" stroke="#ef4444" stroke-width="1.5"/>
        <rect x="${mountX + 35}" y="${bracketTopY - 46}" width="210" height="26" rx="4" fill="#450a0a" stroke="#ef4444" stroke-width="1.5"/>
        <text x="${mountX + 140}" y="${bracketTopY - 29}" fill="#fca5a5" font-size="9" font-weight="bold" text-anchor="middle">
          ⚡ TOP ANCHORS (TENSION LOAD)
        </text>

        <!-- Bottom Anchor Shear Callout -->
        <path d="M ${mountX + 6} ${bracketBottomY - 15} L ${mountX + 6} ${bracketBottomY + 24} L ${mountX + 25} ${bracketBottomY + 24}" fill="none" stroke="#38bdf8" stroke-width="1.5"/>
        <rect x="${mountX + 25}" y="${bracketBottomY + 12}" width="190" height="24" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="${mountX + 120}" y="${bracketBottomY + 28}" fill="#7dd3fc" font-size="9" font-weight="bold" text-anchor="middle">
          ⚓ SHEAR: ${(s.shearPerAnchorN).toFixed(0)} N / fixing
        </text>
      </g>

      <!-- ================= 4. DISPLAY / LED WALL BODY ================= -->
      <g id="displayGroup">
        <!-- Display Frame -->
        <rect x="${screenX}" y="${topY}" width="${screenThick}" height="${screenH}" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" rx="3"/>
        <!-- Active LED Face -->
        <line x1="${screenX + screenThick}" y1="${topY + 2}" x2="${screenX + screenThick}" y2="${topY + screenH - 2}" stroke="#00f2fe" stroke-width="3"/>
        
        <!-- Center of Gravity (CoG) Symbol -->
        <g transform="translate(${screenX + screenThick/2}, ${centerY})">
          <circle cx="0" cy="0" r="8" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M 0 -8 A 8 8 0 0 1 8 0 L 0 0 Z M 0 8 A 8 8 0 0 1 -8 0 L 0 0 Z" fill="#000000"/>
          <text x="14" y="4" fill="#f59e0b" font-size="10" font-weight="bold">CoG (${s.cogOffsetMm}mm)</text>
        </g>

        <!-- Display Tag Box -->
        <rect x="${screenX + screenThick + 12}" y="${topY}" width="220" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1" opacity="0.95"/>
        <text x="${screenX + screenThick + 20}" y="${topY + 17}" fill="#38bdf8" font-size="10.5" font-weight="bold">
          ${s.equipType === 'led_wall' ? 'DV-LED CABINET ARRAY' : 'COMMERCIAL DISPLAY'}
        </text>
        <text x="${screenX + screenThick + 20}" y="${topY + 33}" fill="#94a3b8" font-size="9">
          Weight: ${s.totalStaticMassKg.toFixed(0)} kg | Height: ${s.screenHeightMm} mm
        </text>
      </g>

      <!-- ================= 5. FORCE VECTORS (FOS = 4.0) ================= -->
      <g id="forceVectorsGroup">
        <!-- Gravity Load Vector F_design downwards -->
        <line x1="${screenX + screenThick/2}" y1="${centerY + 10}" x2="${screenX + screenThick/2}" y2="${centerY + 75}" stroke="#ef4444" stroke-width="3" marker-end="url(#arrow-danger)"/>
        <rect x="${screenX + screenThick + 12}" y="${centerY + 55}" width="240" height="24" rx="4" fill="#450a0a" stroke="#ef4444" stroke-width="1"/>
        <text x="${screenX + screenThick + 20}" y="${centerY + 71}" fill="#fca5a5" font-size="9" font-weight="bold">
          F_design (FOS 4) = ${(s.designForceKn).toFixed(2)} kN (${s.totalDesignMassKg.toFixed(0)} kg)
        </text>

        <!-- Overturning Pull-out Tension Vector T_pull outwards -->
        <line x1="${mountX + 16}" y1="${bracketTopY + 15}" x2="${mountX + 75}" y2="${bracketTopY + 15}" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow-warning)"/>
        <text x="${mountX + 85}" y="${bracketTopY + 19}" fill="#f59e0b" font-size="9" font-weight="bold">
          T_pull = ${s.totalPulloutTensionN.toFixed(0)} N (${s.totalPulloutTensionKg.toFixed(1)} kgf)
        </text>
      </g>

      <!-- ================= 6. ELEVATION DATUM LADDER (FAR-LEFT - ZERO OVERLAP) ================= -->
      <g id="elevationDatumLadder">
        <!-- Vertical Reference Datum Line on Left -->
        <line x1="230" y1="40" x2="230" y2="${floorY}" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,3"/>

        <!-- 1. Top AFFL Level -->
        <line x1="230" y1="${topY}" x2="${screenX}" y2="${topY}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
        <circle cx="230" cy="${topY}" r="3" fill="#cbd5e1"/>
        <rect x="25" y="${topY - 12}" width="195" height="24" rx="4" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.2"/>
        <text x="122" y="${topY + 4}" fill="#f8fafc" font-size="9.5" font-weight="bold" text-anchor="middle">
          ▲ TOP AFFL: ${s.topAfflMm} mm
        </text>

        <!-- 2. Centerline AFFL Level -->
        <line x1="230" y1="${centerY}" x2="${screenX + screenThick/2}" y2="${centerY}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3"/>
        <circle cx="230" cy="${centerY}" r="3" fill="#f59e0b"/>
        <rect x="25" y="${centerY - 12}" width="195" height="24" rx="4" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="122" y="${centerY + 4}" fill="#fbbf24" font-size="9.5" font-weight="bold" text-anchor="middle">
          ⯁ CENTERLINE AFFL: ${Math.round(s.centerAfflMm)} mm
        </text>

        <!-- 3. Bottom AFFL Clearance Level -->
        <line x1="230" y1="${bottomY}" x2="${screenX}" y2="${bottomY}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3"/>
        <circle cx="230" cy="${bottomY}" r="3" fill="#38bdf8"/>
        <rect x="25" y="${bottomY - 12}" width="195" height="24" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="122" y="${bottomY + 4}" fill="#7dd3fc" font-size="9.5" font-weight="bold" text-anchor="middle">
          ▼ BOTTOM AFFL: ${s.bottomAfflMm} mm
        </text>

        <!-- 4. Finished Floor Datum (AFFL 0.0) -->
        <circle cx="230" cy="${floorY}" r="4" fill="#22c55e"/>
        <rect x="25" y="${floorY - 26}" width="195" height="22" rx="4" fill="#052e16" stroke="#22c55e" stroke-width="1.2"/>
        <text x="122" y="${floorY - 11}" fill="#4ade80" font-size="9.5" font-weight="bold" text-anchor="middle">
          ⏚ AFFL 0.0 mm (FINISHED FLOOR)
        </text>
      </g>

      <!-- ================= 7. FLOOR LINE & RIGHT-SIDE DIMENSIONS ================= -->
      <g id="floorAndRightDimensions">
        <!-- Floor Hatch -->
        <rect x="20" y="${floorY}" width="${w - 40}" height="45" fill="url(#floorTiles)" stroke="#64748b" stroke-width="2"/>
        <line x1="20" y1="${floorY}" x2="${w - 20}" y2="${floorY}" stroke="#ffffff" stroke-width="2"/>

        <!-- Clearance Height Dimension (Floor to Bottom of Display) on Right -->
        <g stroke="#38bdf8" stroke-width="1.2">
          <!-- Extension lines -->
          <line x1="${screenX + screenThick + 5}" y1="${bottomY}" x2="${w - 140}" y2="${bottomY}" stroke-dasharray="2,2"/>
          <line x1="${screenX + screenThick + 5}" y1="${floorY}" x2="${w - 140}" y2="${floorY}" stroke-dasharray="2,2"/>
          <!-- Dimension line with arrows -->
          <line x1="${w - 150}" y1="${bottomY}" x2="${w - 150}" y2="${floorY}" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
        </g>
        <rect x="${w - 225}" y="${bottomY + (clearanceH/2) - 12}" width="150" height="24" fill="#0f172a" stroke="#38bdf8" stroke-width="1" rx="4"/>
        <text x="${w - 150}" y="${bottomY + (clearanceH/2) + 4}" fill="#38bdf8" font-size="9.5" font-weight="bold" text-anchor="middle">
          CLEARANCE: ${s.bottomAfflMm} mm
        </text>

        <!-- Screen Height Dimension on Far Right -->
        <g stroke="#a855f7" stroke-width="1.2">
          <line x1="${screenX + screenThick + 5}" y1="${topY}" x2="${w - 55}" y2="${topY}" stroke-dasharray="2,2"/>
          <line x1="${screenX + screenThick + 5}" y1="${bottomY}" x2="${w - 55}" y2="${bottomY}" stroke-dasharray="2,2"/>
          <line x1="${w - 65}" y1="${topY}" x2="${w - 65}" y2="${bottomY}" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
        </g>
        <rect x="${w - 115}" y="${topY + (screenH/2) - 12}" width="100" height="24" fill="#0f172a" stroke="#a855f7" stroke-width="1" rx="4"/>
        <text x="${w - 65}" y="${topY + (screenH/2) + 4}" fill="#c084fc" font-size="9.5" font-weight="bold" text-anchor="middle">
          H: ${s.screenHeightMm} mm
        </text>
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
window.WALL_SUBSTRATES = WALL_SUBSTRATES;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof calculateWallStructure === 'function') {
      calculateWallStructure();
    }
  });
}
