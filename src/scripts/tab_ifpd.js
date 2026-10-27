// ==========================================
// TAB: INTERACTIVE DISPLAY STUDIO (DISCAS)
// ==========================================
const ifpdState = {
  mode: 'recommend', // 'recommend' (Room-First) or 'verify' (Display-First)
  roomAudienceType: 'training', // 'training' (Adults) or 'classroom_kids' (Kids K-8)
  roomLengthMm: 8000,
  roomWidthMm: 5500,
  diagonalInches: 86,
  imageWidthMm: 1904,
  imageHeightMm: 1071,
  verticalRes: 2160,
  afflMm: 900,
  eyeHeightMm: 1200,
  presenterBufferMm: 1500,
  taskType: 'BDM', // 'BDM' or 'ADM'
  ehPercent: 3.0,
  activeTab: '2d',
  inspectorDistM: 4.5,
  isoAngle: 30, // For interactive 3D orbit
  isoPitch: 20
};

function setIfpdRoomApplication(appType) {
  ifpdState.roomAudienceType = appType;
  var inAffl = document.getElementById('in-affl-mm');
  var inEye = document.getElementById('in-eye-height-mm');
  var inBuffer = document.getElementById('in-presenter-buffer-mm');
  var badge = document.getElementById('badge-audience-type');
  var btnTrain = document.getElementById('btn-ifpd-app-training');
  var btnKids = document.getElementById('btn-ifpd-app-kids');

  if (appType === 'classroom_kids') {
    ifpdState.eyeHeightMm = 900;
    ifpdState.afflMm = 650; // Lower mounting height for child touch reach
    ifpdState.presenterBufferMm = 1200;
    if (badge) badge.innerText = "Kids Classroom (Lower Eye Level: 900mm | Touch AFFL: 650mm)";
    if (btnTrain) { btnTrain.classList.remove('btn-primary', 'active'); btnTrain.classList.add('btn-outline-primary'); }
    if (btnKids) { btnKids.classList.remove('btn-outline-primary'); btnKids.classList.add('btn-primary', 'active'); }
  } else {
    ifpdState.eyeHeightMm = 1200;
    ifpdState.afflMm = 900; // Standard adult AFFL
    ifpdState.presenterBufferMm = 1500;
    if (badge) badge.innerText = "Adult Training Room (Seated Eye Level: 1200mm | Touch AFFL: 900mm)";
    if (btnTrain) { btnTrain.classList.remove('btn-outline-primary'); btnTrain.classList.add('btn-primary', 'active'); }
    if (btnKids) { btnKids.classList.remove('btn-primary', 'active'); btnKids.classList.add('btn-outline-primary'); }
  }

  if (inAffl) inAffl.value = ifpdState.afflMm;
  if (inEye) inEye.value = ifpdState.eyeHeightMm;
  if (inBuffer) inBuffer.value = ifpdState.presenterBufferMm;

  recalculateIfpd();
}

const IFPD_MM_TO_FT = 0.00328084;
const IFPD_FT_TO_MM = 304.8;
const IFPD_ASPECT_RATIO_FACTOR = 16 / 9;
const IFPD_ASPECT_DIAG_FACTOR = Math.sqrt(16*16 + 9*9) / 9; // ~2.04015

const IFPD_COMMERCIAL_PRESETS = [
  { diag: 55, w: 1217, h: 685, aspect: '16:9', res: '4K UHD', tech: 'IR / Zero Bonding', brands: 'Samsung, LG, ViewSonic, Promethean, SMART' },
  { diag: 65, w: 1439, h: 809, aspect: '16:9', res: '4K UHD', tech: 'Zero Bonding IR', brands: 'Samsung, ViewSonic, BenQ, SMART, Promethean' },
  { diag: 75, w: 1660, h: 934, aspect: '16:9', res: '4K UHD', tech: 'Capacitive P-Cap / IR', brands: 'Maxhub, ViewSonic, LG, Optoma, Promethean' },
  { diag: 85, w: 1882, h: 1058, aspect: '16:9', res: '4K UHD', tech: 'InGlass / P-Cap', brands: 'Samsung Flip Pro, Sony, ViewSonic, Sharp/NEC' },
  { diag: 86, w: 1904, h: 1071, aspect: '16:9', res: '4K UHD', tech: 'Optical Bonding IR', brands: 'Maxhub, Promethean, BenQ, SMART, ViewSonic' },
  { diag: 92, w: 2154, h: 923, aspect: '21:9', res: '5K UW', tech: 'P-Cap Touch', brands: 'Jupiter Pana 92, Avocor L-Series, iiyama ProLite' },
  { diag: 98, w: 2169, h: 1220, aspect: '16:9', res: '4K UHD', tech: 'Zero Gap IR / D-LED', brands: 'Maxhub, Samsung, LG CreateBoard, ViewSonic, TCL' },
  { diag: 105, w: 2457, h: 1053, aspect: '21:9', res: '5K UW', tech: 'UltraWide P-Cap', brands: 'ViewSonic 21:9, Jupiter Pana 105, Promethean, iiyama' },
  { diag: 110, w: 2435, h: 1370, aspect: '16:9', res: '4K UHD', tech: 'Direct-LED Multi-Touch', brands: 'Hisense Interactive, BOE Commercial, TCL CSOT' },
  { diag: 115, w: 2546, h: 1432, aspect: '16:9', res: '4K QD-Mini', tech: 'QD-MiniLED Touch', brands: 'TCL QM89/CSOT Enterprise IFPD, Skyworth' },
  { diag: 120, w: 2656, h: 1494, aspect: '16:9', res: '4K UHD', tech: 'MegaTouch Surface', brands: 'Hisense 120 Laser IFPD, BOE Commercial' },
  { diag: 135, w: 2988, h: 1681, aspect: '16:9', res: 'FHD / 4K', tech: 'All-in-One Foldable Touch', brands: 'Maxhub Raptor IFPD, ViewSonic LDS135, Leyard Planar' },
  { diag: 136, w: 3010, h: 1693, aspect: '16:9', res: '4K COB', tech: 'COB Active Touch', brands: 'LG MAGNIT All-in-One, Samsung The Wall Touch, Hisense' },
  { diag: 146, w: 3226, h: 1815, aspect: '16:9', res: '4K MicroLED', tech: 'Monolithic MicroLED Touch', brands: 'Samsung The Wall IWA Touch, Leyard Carbon IFPD' },
  { diag: 163, w: 3600, h: 2025, aspect: '16:9', res: '4K UHD', tech: 'All-in-One dvLED IFPD', brands: 'Maxhub Ultra IFPD 163, ViewSonic LDS163, Leyard Planar' },
  { diag: 171, w: 4000, h: 1714, aspect: '21:9', res: '5K UW', tech: 'UltraWide Seamless Touch', brands: 'Jupiter Pana 171 Signature Room, Leyard 21:9 All-in-One' }
];

function initIfpdStudio() {
  setupIfpdEventListeners();
  recalculateIfpd();
}

function setupIfpdEventListeners() {
  const inLenMm = document.getElementById('in-room-len-mm');
  const inLenFt = document.getElementById('in-room-len-ft');
  if (inLenMm && inLenFt) {
    inLenMm.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      ifpdState.roomLengthMm = val;
      inLenFt.value = (val * IFPD_MM_TO_FT).toFixed(2);
      recalculateIfpd();
    });
    inLenFt.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      ifpdState.roomLengthMm = Math.round(val * IFPD_FT_TO_MM);
      inLenMm.value = ifpdState.roomLengthMm;
      recalculateIfpd();
    });
  }

  const inWidMm = document.getElementById('in-room-wid-mm');
  const inWidFt = document.getElementById('in-room-wid-ft');
  if (inWidMm && inWidFt) {
    inWidMm.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      ifpdState.roomWidthMm = val;
      inWidFt.value = (val * IFPD_MM_TO_FT).toFixed(2);
      recalculateIfpd();
    });
    inWidFt.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      ifpdState.roomWidthMm = Math.round(val * IFPD_FT_TO_MM);
      inWidMm.value = ifpdState.roomWidthMm;
      recalculateIfpd();
    });
  }

  const inDiag = document.getElementById('in-custom-diag');
  if (inDiag) {
    inDiag.addEventListener('input', (e) => {
      const diag = parseFloat(e.target.value) || 86;
      ifpdState.diagonalInches = diag;
      const diagMm = diag * 25.4;
      ifpdState.imageHeightMm = Math.round(diagMm / IFPD_ASPECT_DIAG_FACTOR);
      ifpdState.imageWidthMm = Math.round(ifpdState.imageHeightMm * IFPD_ASPECT_RATIO_FACTOR);
      const wInp = document.getElementById('in-custom-width-mm');
      if (wInp) wInp.value = ifpdState.imageWidthMm;
      recalculateIfpd();
    });
  }

  const inWmm = document.getElementById('in-custom-width-mm');
  if (inWmm) {
    inWmm.addEventListener('input', (e) => {
      const w = parseFloat(e.target.value) || 1904;
      ifpdState.imageWidthMm = w;
      ifpdState.imageHeightMm = Math.round(w / IFPD_ASPECT_RATIO_FACTOR);
      const diagMm = Math.sqrt(ifpdState.imageWidthMm ** 2 + ifpdState.imageHeightMm ** 2);
      ifpdState.diagonalInches = Math.round(diagMm / 25.4);
      const dInp = document.getElementById('in-custom-diag');
      if (dInp) dInp.value = ifpdState.diagonalInches;
      recalculateIfpd();
    });
  }

  const resSel = document.getElementById('in-res-vr');
  if (resSel) {
    resSel.addEventListener('change', (e) => {
      ifpdState.verticalRes = parseInt(e.target.value);
      recalculateIfpd();
    });
  }

  const inAffl = document.getElementById('in-affl-mm');
  if (inAffl) {
    inAffl.addEventListener('input', (e) => {
      ifpdState.afflMm = parseFloat(e.target.value) || 900;
      recalculateIfpd();
    });
  }

  const inEye = document.getElementById('in-eye-height-mm');
  if (inEye) {
    inEye.addEventListener('input', (e) => {
      ifpdState.eyeHeightMm = parseFloat(e.target.value) || 1200;
      recalculateIfpd();
    });
  }

  const inBuffer = document.getElementById('in-presenter-buffer-mm');
  if (inBuffer) {
    inBuffer.addEventListener('input', (e) => {
      ifpdState.presenterBufferMm = parseFloat(e.target.value) || 1500;
      recalculateIfpd();
    });
  }

  document.querySelectorAll('input[name="ifpd-viewing-task"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      ifpdState.taskType = e.target.value;
      const sliderBox = document.getElementById('ifpd-bdm-slider-container');
      if (sliderBox) {
        if (ifpdState.taskType === 'BDM') {
          sliderBox.classList.remove('opacity-40', 'pointer-events-none');
        } else {
          sliderBox.classList.add('opacity-40', 'pointer-events-none');
        }
      }
      recalculateIfpd();
    });
  });

  const ehSlider = document.getElementById('in-eh-percent');
  if (ehSlider) {
    ehSlider.addEventListener('input', (e) => {
      ifpdState.ehPercent = parseFloat(e.target.value);
      let label = `${ifpdState.ehPercent.toFixed(1)}%`;
      if (ifpdState.ehPercent === 3.0) label += " (Standard Teaching)";
      else if (ifpdState.ehPercent < 2.5) label += " (Fine Code/Text)";
      else if (ifpdState.ehPercent > 3.8) label += " (Large Headings)";
      const ehText = document.getElementById('val-eh-text');
      if (ehText) ehText.textContent = label;
      recalculateIfpd();
    });
  }

  const inspectSlider = document.getElementById('in-inspector-slider');
  if (inspectSlider) {
    inspectSlider.addEventListener('input', (e) => {
      ifpdState.inspectorDistM = parseFloat(e.target.value);
      updateIfpdInspectorOutput();
      renderIfpd2DPlan();
      renderIfpd3DIsometric();
    });
  }
}

function setIfpdCalculationMode(mode) {
  ifpdState.mode = mode;
  const btnRec = document.getElementById('btn-ifpd-mode-recommend');
  const btnVer = document.getElementById('btn-ifpd-mode-verify');
  const badgeHeader = document.getElementById('badge-ifpd-mode-header');

  if (mode === 'recommend') {
    if (btnRec) btnRec.className = "px-3 py-1.5 rounded-lg font-semibold bg-white text-sky-700 shadow-sm border border-slate-200 transition";
    if (btnVer) btnVer.className = "px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition";
    if (badgeHeader) badgeHeader.textContent = "ROOM-FIRST DISPLAY RECOMMENDATION";
  } else {
    if (btnVer) btnVer.className = "px-3 py-1.5 rounded-lg font-semibold bg-white text-sky-700 shadow-sm border border-slate-200 transition";
    if (btnRec) btnRec.className = "px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition";
    if (badgeHeader) badgeHeader.textContent = "DISPLAY-FIRST SIGHTLINE VERIFICATION";
  }
  recalculateIfpd();
}

function setIfpdPresetDiagonal(diag) {
  const preset = IFPD_COMMERCIAL_PRESETS.find(p => p.diag === diag);
  if (preset) {
    ifpdState.diagonalInches = preset.diag;
    ifpdState.imageWidthMm = preset.w;
    ifpdState.imageHeightMm = preset.h;
    const dInp = document.getElementById('in-custom-diag');
    if (dInp) dInp.value = preset.diag;
    const wInp = document.getElementById('in-custom-width-mm');
    if (wInp) wInp.value = preset.w;
    recalculateIfpd();
  }
}

function recalculateIfpd() {
  const lenFt = (ifpdState.roomLengthMm * IFPD_MM_TO_FT).toFixed(2);
  const lblLen = document.getElementById('label-len-summary');
  if (lblLen) lblLen.textContent = `${ifpdState.roomLengthMm} mm / ${lenFt} ft`;

  const widFt = (ifpdState.roomWidthMm * IFPD_MM_TO_FT).toFixed(2);
  const lblWid = document.getElementById('label-wid-summary');
  if (lblWid) lblWid.textContent = `${ifpdState.roomWidthMm} mm / ${widFt} ft`;

  const areaM2 = ((ifpdState.roomLengthMm / 1000) * (ifpdState.roomWidthMm / 1000)).toFixed(1);
  const areaSqFt = (areaM2 * 10.7639).toFixed(1);
  const elArea = document.getElementById('val-floor-area');
  if (elArea) elArea.textContent = `${areaM2} m² (${areaSqFt} sq.ft)`;

  let reqHeightMm = 0;
  if (ifpdState.taskType === 'BDM') {
    const multiplier = (ifpdState.ehPercent * 200) / 100;
    reqHeightMm = Math.round(ifpdState.roomLengthMm / multiplier);
  } else {
    reqHeightMm = Math.round((ifpdState.roomLengthMm * ifpdState.verticalRes) / 3438);
  }

  const reqWidthMm = Math.round(reqHeightMm * IFPD_ASPECT_RATIO_FACTOR);
  const reqDiagMm = Math.sqrt(reqWidthMm**2 + reqHeightMm**2);
  const reqDiagInches = Math.round(reqDiagMm / 25.4);

  if (ifpdState.mode === 'recommend') {
    let recommendedPreset = IFPD_COMMERCIAL_PRESETS.reduce((prev, curr) => {
      return (Math.abs(curr.diag - reqDiagInches) < Math.abs(prev.diag - reqDiagInches)) ? curr : prev;
    });

    ifpdState.diagonalInches = recommendedPreset.diag;
    ifpdState.imageWidthMm = recommendedPreset.w;
    ifpdState.imageHeightMm = recommendedPreset.h;

    const dInp = document.getElementById('in-custom-diag');
    if (dInp) dInp.value = recommendedPreset.diag;
    const wInp = document.getElementById('in-custom-width-mm');
    if (wInp) wInp.value = recommendedPreset.w;
  }

  const activeH = ifpdState.imageHeightMm;
  const activeW = ifpdState.imageWidthMm;

  const screenTopMm = ifpdState.afflMm + activeH;
  const deltaEyeTopMm = screenTopMm - ifpdState.eyeHeightMm;
  let dCvGeoMm = (deltaEyeTopMm > 0) ? (deltaEyeTopMm / Math.tan(30 * Math.PI / 180)) : 500;
  const dCvEffectiveMm = Math.max(dCvGeoMm, ifpdState.presenterBufferMm);

  let dFvMm = 0;
  if (ifpdState.taskType === 'BDM') {
    const mult = (ifpdState.ehPercent * 200) / 100;
    dFvMm = Math.round(activeH * mult);
  } else {
    dFvMm = Math.round((activeH * 3438) / ifpdState.verticalRes);
  }

  const heroTitle = document.getElementById('hero-display-title');
  if (heroTitle) heroTitle.textContent = `${ifpdState.diagonalInches}" Interactive Flat Panel`;
  const statDiag = document.getElementById('stat-hero-diag');
  if (statDiag) statDiag.textContent = `${ifpdState.diagonalInches}" (${Math.round(ifpdState.diagonalInches * 2.54)} cm)`;
  const statDiagExact = document.getElementById('stat-hero-diag-exact');
  if (statDiagExact) statDiagExact.textContent = `Exact calculated req: ${reqDiagInches}" (${reqWidthMm}×${reqHeightMm} mm)`;
  
  const statW = document.getElementById('stat-hero-width-mm');
  if (statW) statW.textContent = `${activeW} mm`;
  const statWFt = document.getElementById('stat-hero-width-ft');
  if (statWFt) statWFt.textContent = `${(activeW * IFPD_MM_TO_FT).toFixed(2)} ft (${Math.round(activeW/25.4)} in)`;
  
  const statH = document.getElementById('stat-hero-height-mm');
  if (statH) statH.textContent = `${activeH} mm`;
  const statHFt = document.getElementById('stat-hero-height-ft');
  if (statHFt) statHFt.textContent = `${(activeH * IFPD_MM_TO_FT).toFixed(2)} ft (${Math.round(activeH/25.4)} in)`;

  const statAffl = document.getElementById('stat-hero-affl');
  if (statAffl) statAffl.textContent = `${ifpdState.afflMm} mm`;
  const statTop = document.getElementById('stat-hero-top');
  if (statTop) statTop.textContent = `Screen Top: ${screenTopMm} mm (${(screenTopMm*IFPD_MM_TO_FT).toFixed(2)} ft)`;

  const dCvM = (dCvEffectiveMm / 1000).toFixed(2);
  const dCvFt = (dCvEffectiveMm * IFPD_MM_TO_FT).toFixed(2);
  const statDcv = document.getElementById('stat-dcv-val');
  if (statDcv) statDcv.textContent = `${dCvM} m (${dCvEffectiveMm} mm / ${dCvFt} ft)`;

  const dFvM = (dFvMm / 1000).toFixed(2);
  const dFvFt = (dFvMm * IFPD_MM_TO_FT).toFixed(2);
  const statDfv = document.getElementById('stat-dfv-val');
  if (statDfv) statDfv.textContent = `${dFvM} m (${dFvMm} mm / ${dFvFt} ft)`;

  const heroBadge = document.getElementById('hero-status-badge');
  if (heroBadge) {
    if (dFvMm >= ifpdState.roomLengthMm) {
      heroBadge.textContent = "✓ Covers Full Room Depth";
      heroBadge.className = "px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
    } else {
      const diffM = ((ifpdState.roomLengthMm - dFvMm) / 1000).toFixed(2);
      heroBadge.textContent = `⚠ Undersized for Rear ${diffM}m`;
      heroBadge.className = "px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40";
    }
  }

  renderIfpdPresetMatrix(reqDiagInches);

  const gaze1stRad = Math.atan2(deltaEyeTopMm, dCvEffectiveMm);
  const gaze1stDeg = (gaze1stRad * 180 / Math.PI).toFixed(1);
  const metricGaze1 = document.getElementById('metric-vert-gaze-cv');
  if (metricGaze1) metricGaze1.textContent = `${gaze1stDeg}° (Max 30°)`;

  const gazeLastRad = Math.atan2(deltaEyeTopMm, dFvMm);
  const gazeLastDeg = (gazeLastRad * 180 / Math.PI).toFixed(1);
  const metricGazeLast = document.getElementById('metric-vert-gaze-fv');
  if (metricGazeLast) metricGazeLast.textContent = `${gazeLastDeg}° Comfortable`;

  const maxUsableMm = Math.min(dFvMm, ifpdState.roomLengthMm);
  const seatingSpanM = Math.max(0, (maxUsableMm - dCvEffectiveMm) / 1000).toFixed(2);
  const seatingSpanFt = (seatingSpanM * 3.28084).toFixed(1);
  const metricDepth = document.getElementById('metric-seating-depth');
  if (metricDepth) metricDepth.textContent = `${seatingSpanM} m (${seatingSpanFt} ft)`;

  updateIfpdInspectorOutput();
  renderIfpd2DPlan(dCvEffectiveMm, dFvMm);
  renderIfpd3DIsometric(dCvEffectiveMm, dFvMm);
}

function renderIfpdPresetMatrix(reqDiagInches) {
  const container = document.getElementById('container-ifpd-preset-matrix');
  if (!container) return;

  container.innerHTML = IFPD_COMMERCIAL_PRESETS.map(p => {
    const isSelected = p.diag === ifpdState.diagonalInches;
    const maxReachM = (p.h * (ifpdState.ehPercent * 2) / 1000).toFixed(1);
    const fitsRoom = (p.h * (ifpdState.ehPercent * 2)) >= ifpdState.roomLengthMm;
    const wFt = (p.w * IFPD_MM_TO_FT).toFixed(1);
    const hFt = (p.h * IFPD_MM_TO_FT).toFixed(1);
    const isUltrawide = p.aspect === '21:9';
    
    let statusTag = "";
    let borderStyle = isSelected 
      ? "border-sky-500 bg-sky-50 ring-2 ring-sky-500 shadow-md" 
      : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm";

    if (p.diag === reqDiagInches) {
      statusTag = `<span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-600 text-white">★ Ideal Fit</span>`;
    } else if (fitsRoom) {
      statusTag = `<span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-sky-600 text-white">✓ Full Reach</span>`;
    } else {
      statusTag = `<span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300">Reach ${maxReachM}m</span>`;
    }

    const aspectBadge = isUltrawide 
      ? `<span class="badge bg-purple-700 text-white font-mono text-[9px] px-1.5 py-0.5">21:9 UW</span>`
      : `<span class="badge bg-slate-700 text-white font-mono text-[9px] px-1.5 py-0.5">16:9</span>`;

    return `
      <button type="button" onclick="setIfpdPresetDiagonal(${p.diag})" 
        class="p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${borderStyle} w-100">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-sm text-slate-900 font-mono">${p.diag}"</span>
            ${aspectBadge}
          </div>
          ${statusTag}
        </div>
        <div class="text-[11.5px] font-mono text-slate-800 font-bold">
          ${p.w} × ${p.h} mm
        </div>
        <div class="text-[10px] font-mono text-slate-500">
          (${wFt} × ${hFt} ft) • <strong class="text-sky-700">${p.res || '4K UHD'}</strong>
        </div>
        <div class="text-[9.5px] font-semibold text-emerald-700 mt-1">
          <i class="fa-solid fa-hand-pointer me-1"></i>${p.tech || 'Touch Surface'}
        </div>
        <div class="text-[9.5px] text-slate-500 mt-1 pt-1 border-t border-slate-100 truncate" title="${p.brands || ''}">
          <i class="fa-solid fa-tag me-1 text-sky-600"></i>${p.brands || 'Global Standard'}
        </div>
      </button>
    `;
  }).join('');
}

function updateIfpdInspectorOutput() {
  const distMm = ifpdState.inspectorDistM * 1000;
  const screenTopMm = ifpdState.afflMm + ifpdState.imageHeightMm;
  const deltaEyeTopMm = screenTopMm - ifpdState.eyeHeightMm;
  
  const gazeRad = Math.atan2(deltaEyeTopMm, distMm);
  const gazeDeg = (gazeRad * 180 / Math.PI).toFixed(1);

  const elDist = document.getElementById('val-inspector-dist');
  if (elDist) {
    elDist.textContent = `Distance: ${ifpdState.inspectorDistM.toFixed(2)} m (${(ifpdState.inspectorDistM * 3.28084).toFixed(1)} ft)`;
  }

  const statusEl = document.getElementById('inspect-status-text');
  const angleEl = document.getElementById('inspect-angle-text');
  if (angleEl) angleEl.textContent = `Vertical Gaze Angle: ${gazeDeg}°`;

  const mult = (ifpdState.ehPercent * 200) / 100;
  const maxFvMm = ifpdState.imageHeightMm * mult;

  if (statusEl) {
    if (distMm < ifpdState.presenterBufferMm) {
      statusEl.textContent = "⚠ Inside Instructor Walking Buffer Zone";
      statusEl.className = "text-amber-600 font-semibold";
    } else if (distMm <= maxFvMm) {
      statusEl.textContent = "✓ Excellent text legibility & seating comfort";
      statusEl.className = "text-emerald-700 font-semibold";
    } else {
      statusEl.textContent = "⚠ Exceeds font legibility threshold";
      statusEl.className = "text-red-600 font-semibold";
    }
  }
}

// 2D SVG Blueprint
function renderIfpd2DPlan(dCvMm, dFvMm) {
  const svg = document.getElementById('svg-ifpd-floorplan');
  if (!svg) return;

  dCvMm = dCvMm || 1500;
  dFvMm = dFvMm || 6400;

  const svgW = 1000;
  const svgH = 650;
  const margin = 75;

  const roomL = ifpdState.roomLengthMm;
  const roomW = ifpdState.roomWidthMm;

  const maxDrawW = svgW - (margin * 2);
  const maxDrawH = svgH - (margin * 2);

  const scale = Math.min(maxDrawW / roomW, maxDrawH / roomL);
  const drawRoomW = roomW * scale;
  const drawRoomL = roomL * scale;

  const originX = (svgW - drawRoomW) / 2;
  const originY = margin;

  const screenWidthScaled = Math.min(drawRoomW * 0.9, ifpdState.imageWidthMm * scale);
  const screenX1 = originX + (drawRoomW / 2) - (screenWidthScaled / 2);
  const screenX2 = screenX1 + screenWidthScaled;
  const screenY = originY;

  const centerX = originX + (drawRoomW / 2);
  const dCvY = originY + (dCvMm * scale);
  const dFvY = originY + (dFvMm * scale);
  const inspectorY = originY + (ifpdState.inspectorDistM * 1000 * scale);

  const coneDepthMm = Math.min(dFvMm, roomL);
  const coneDepthScaled = coneDepthMm * scale;
  const coneLeftX = Math.max(originX, centerX - coneDepthScaled);
  const coneRightX = Math.min(originX + drawRoomW, centerX + coneDepthScaled);

  const deskRows = [];
  const rowStartY = dCvY + 15;
  const rowEndY = Math.min(originY + drawRoomL - 30, dFvY);
  const rowSpacing = 35;

  for (let y = rowStartY; y <= rowEndY; y += rowSpacing) {
    deskRows.push(y);
  }

  svg.innerHTML = `
    <defs>
      <pattern id="hatch-buffer-light" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="12" stroke="#f59e0b" stroke-width="1.5" stroke-opacity="0.3" />
      </pattern>
      <linearGradient id="cone-grad-light" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.02" />
      </linearGradient>
    </defs>

    <rect x="${originX}" y="${originY}" width="${drawRoomW}" height="${drawRoomL}" rx="8" 
      fill="#f8fafc" stroke="#334155" stroke-width="3" />

    <polygon points="${centerX},${screenY} ${coneLeftX},${screenY + coneDepthScaled} ${coneRightX},${screenY + coneDepthScaled}" 
      fill="url(#cone-grad-light)" stroke="#6366f1" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.5"/>

    <rect x="${originX + 1}" y="${originY + 1}" width="${drawRoomW - 2}" height="${ifpdState.presenterBufferMm * scale}" 
      fill="url(#hatch-buffer-light)" />

    ${deskRows.map(ry => `
      <g opacity="0.75">
        <rect x="${centerX - (drawRoomW * 0.35)}" y="${ry}" width="${drawRoomW * 0.7}" height="12" rx="3" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" />
        <circle cx="${centerX - (drawRoomW * 0.2)}" cy="${ry + 18}" r="4" fill="#64748b" />
        <circle cx="${centerX}" cy="${ry + 18}" r="4" fill="#64748b" />
        <circle cx="${centerX + (drawRoomW * 0.2)}" cy="${ry + 18}" r="4" fill="#64748b" />
      </g>
    `).join('')}

    <circle cx="${centerX}" cy="${originY + ((ifpdState.presenterBufferMm * scale) / 2)}" r="9" fill="#d97706" />
    <text x="${centerX + 14}" y="${originY + ((ifpdState.presenterBufferMm * scale) / 2) + 4}" fill="#b45309" font-size="10" font-family="JetBrains Mono" font-weight="600">Instructor Zone (${(ifpdState.presenterBufferMm/1000).toFixed(1)}m)</text>

    <rect x="${screenX1}" y="${screenY - 10}" width="${screenWidthScaled}" height="16" rx="4" 
      fill="#0284c7" stroke="#0369a1" stroke-width="2" />
    <line x1="${screenX1}" y1="${screenY + 6}" x2="${screenX2}" y2="${screenY + 6}" stroke="#38bdf8" stroke-width="3" />
    <text x="${centerX}" y="${screenY - 16}" text-anchor="middle" fill="#0369a1" font-size="11" font-family="JetBrains Mono" font-weight="700">
      ${ifpdState.diagonalInches}" IFPD (${ifpdState.imageWidthMm} × ${ifpdState.imageHeightMm} mm)
    </text>

    <line x1="${originX}" y1="${dCvY}" x2="${originX + drawRoomW}" y2="${dCvY}" 
      stroke="#0284c7" stroke-width="2" stroke-dasharray="6 3" />
    <text x="${originX + 26}" y="${dCvY - 6}" fill="#0284c7" font-size="11" font-family="JetBrains Mono" font-weight="700">
      1st Student Row (D_cv): ${(dCvMm / 1000).toFixed(2)} m / ${(dCvMm * IFPD_MM_TO_FT).toFixed(1)} ft
    </text>

    ${dFvY <= originY + drawRoomL ? `
      <line x1="${originX}" y1="${dFvY}" x2="${originX + drawRoomW}" y2="${dFvY}" 
        stroke="#d97706" stroke-width="2" stroke-dasharray="6 3" />
      <text x="${originX + 26}" y="${dFvY - 6}" fill="#d97706" font-size="11" font-family="JetBrains Mono" font-weight="700">
        Last Student Row (D_fv): ${(dFvMm / 1000).toFixed(2)} m / ${(dFvMm * IFPD_MM_TO_FT).toFixed(1)} ft
      </text>
    ` : `
      <line x1="${originX}" y1="${originY + drawRoomL}" x2="${originX + drawRoomW}" y2="${originY + drawRoomL}" 
        stroke="#dc2626" stroke-width="3" />
      <text x="${centerX}" y="${originY + drawRoomL + 20}" text-anchor="middle" fill="#dc2626" font-size="11" font-family="JetBrains Mono" font-weight="700">
        D_fv (${(dFvMm / 1000).toFixed(2)}m) reaches beyond back wall (${(roomL / 1000).toFixed(2)}m)
      </text>
    `}

    ${inspectorY <= originY + drawRoomL ? `
      <circle cx="${centerX}" cy="${inspectorY}" r="7" fill="#4f46e5" stroke="#ffffff" stroke-width="2" />
      <line x1="${centerX}" y1="${screenY + 6}" x2="${centerX}" y2="${inspectorY}" stroke="#4f46e5" stroke-width="1.5" stroke-dasharray="2 2" />
    ` : ''}

    <g stroke="#94a3b8" stroke-width="1">
      <line x1="${originX}" y1="${originY - 32}" x2="${originX + drawRoomW}" y2="${originY - 32}" />
      <line x1="${originX}" y1="${originY - 38}" x2="${originX}" y2="${originY - 26}" />
      <line x1="${originX + drawRoomW}" y1="${originY - 38}" x2="${originX + drawRoomW}" y2="${originY - 26}" />
    </g>
    <text x="${centerX}" y="${originY - 40}" text-anchor="middle" fill="#475569" font-size="11" font-family="JetBrains Mono" font-weight="600">
      Room Width: ${(roomW / 1000).toFixed(2)} m (${(roomW * IFPD_MM_TO_FT).toFixed(1)} ft)
    </text>

    <g stroke="#94a3b8" stroke-width="1">
      <line x1="${originX + drawRoomW + 32}" y1="${originY}" x2="${originX + drawRoomW + 32}" y2="${originY + drawRoomL}" />
      <line x1="${originX + drawRoomW + 26}" y1="${originY}" x2="${originX + drawRoomW + 38}" y2="${originY}" />
      <line x1="${originX + drawRoomW + 26}" y1="${originY + drawRoomL}" x2="${originX + drawRoomW + 38}" y2="${originY + drawRoomL}" />
    </g>
    <text x="${originX + drawRoomW + 42}" y="${originY + (drawRoomL / 2)}" text-anchor="start" dominant-baseline="middle" 
      fill="#475569" font-size="11" font-family="JetBrains Mono" font-weight="600" transform="rotate(90 ${originX + drawRoomW + 42} ${originY + (drawRoomL / 2)})">
      Room Length: ${(roomL / 1000).toFixed(2)} m (${(roomL * IFPD_MM_TO_FT).toFixed(1)} ft)
    </text>
  `;
}

// 3D Isometric View with Realistic Textures, Sightline Cone and Full-Window Scaling
function renderIfpd3DIsometric(dCvMm, dFvMm) {
  const svg = document.getElementById('svg-ifpd-isometric');
  if (!svg) return;

  dCvMm = dCvMm || 1500;
  dFvMm = dFvMm || 6400;

  const roomL = ifpdState.roomLengthMm;
  const roomW = ifpdState.roomWidthMm;
  const ceilingH = 3000;
  const w2 = roomW / 2;
  const actualLastMm = Math.min(dFvMm, roomL);

  // Raw isometric projection (without scale/offset)
  const cos30 = 0.866025;
  const sin30 = 0.5;
  function rawProject(x, y, z) {
    return {
      x: (y * cos30) - (x * cos30),
      y: (y * sin30) + (x * sin30) - z
    };
  }

  // Key architectural bounding points
  const testPoints = [
    rawProject(-w2, 0, 0),
    rawProject(w2, 0, 0),
    rawProject(w2, roomL, 0),
    rawProject(-w2, roomL, 0),
    rawProject(-w2, 0, ceilingH),
    rawProject(w2, 0, ceilingH),
    rawProject(w2, roomL, ceilingH),
    rawProject(-w2, roomL, ceilingH)
  ];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  testPoints.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const rawW = maxX - minX;
  const rawH = maxY - minY;

  // ViewBox bounds: 1000 x 640 with balanced padding
  const svgW = 1000;
  const svgH = 640;
  const padX = 60;
  const padY = 50;

  const availW = svgW - padX * 2;
  const availH = svgH - padY * 2;
  const scale = Math.min(availW / rawW, availH / rawH);

  const offsetX = padX + (availW - rawW * scale) / 2 - minX * scale;
  const offsetY = padY + (availH - rawH * scale) / 2 - minY * scale;

  function project(x, y, z) {
    const raw = rawProject(x, y, z);
    return {
      x: offsetX + raw.x * scale,
      y: offsetY + raw.y * scale
    };
  }

  const pFrontLeft = project(-w2, 0, 0);
  const pFrontRight = project(w2, 0, 0);
  const pBackRight = project(w2, roomL, 0);
  const pBackLeft = project(-w2, roomL, 0);

  const pFrontLeftTop = project(-w2, 0, ceilingH);
  const pFrontRightTop = project(w2, 0, ceilingH);
  const pBackRightTop = project(w2, roomL, ceilingH);
  const pBackLeftTop = project(-w2, roomL, ceilingH);

  const sw2 = ifpdState.imageWidthMm / 2;
  const dBottom = ifpdState.afflMm;
  const dTop = ifpdState.afflMm + ifpdState.imageHeightMm;

  const pDispBL = project(-sw2, 0, dBottom);
  const pDispBR = project(sw2, 0, dBottom);
  const pDispTR = project(sw2, 0, dTop);
  const pDispTL = project(-sw2, 0, dTop);

  const presY = Math.min(ifpdState.presenterBufferMm * 0.6, 900);
  const pPresFoot = project(0, presY, 0);
  const pPresHead = project(0, presY, 1750);

  const pView1Foot = project(0, dCvMm, 0);
  const pView1Eye = project(0, dCvMm, ifpdState.eyeHeightMm);

  const pViewLastFoot = project(0, actualLastMm, 0);
  const pViewLastEye = project(0, actualLastMm, ifpdState.eyeHeightMm);

  const pScreenCenterTop = project(0, 0, dTop);
  const pScreenCenterBottom = project(0, 0, dBottom);

    // Generate Student Desks & Seated Students in Multiple Rows
    const isKids = ifpdState.roomAudienceType === 'classroom_kids';
    const deskW = isKids ? 1000 : 1200;
    const deskD = isKids ? 500 : 600;
    const deskH = isKids ? 600 : 720;
    const chairEyeH = ifpdState.eyeHeightMm;

    function renderStudentAtDesk(centerX, centerY, isFirstRow, isLastRow, label) {
      // 3D coordinates for desk
      const dTL = project(centerX - deskW / 2, centerY - deskD / 2, deskH);
      const dTR = project(centerX + deskW / 2, centerY - deskD / 2, deskH);
      const dBR = project(centerX + deskW / 2, centerY + deskD / 2, deskH);
      const dBL = project(centerX - deskW / 2, centerY + deskD / 2, deskH);

      // Desk legs
      const leg1Base = project(centerX - deskW / 2 + 30, centerY - deskD / 2 + 30, 0);
      const leg2Base = project(centerX + deskW / 2 - 30, centerY - deskD / 2 + 30, 0);
      const leg3Base = project(centerX + deskW / 2 - 30, centerY + deskD / 2 - 30, 0);
      const leg4Base = project(centerX - deskW / 2 + 30, centerY + deskD / 2 - 30, 0);

      // Chair position (slightly behind desk)
      const chairY = centerY + deskD / 2 + (isKids ? 200 : 250);
      const chairSeatH = isKids ? 350 : 450;
      const cBase = project(centerX, chairY, 0);
      const cSeat = project(centerX, chairY, chairSeatH);
      const cBack = project(centerX, chairY + 80, chairSeatH + (isKids ? 300 : 400));

      // Student Head & Body
      const sHead = project(centerX, chairY, chairEyeH);
      const sTorsoBase = project(centerX, chairY, chairSeatH);
      const sHands = project(centerX, centerY, deskH + 20);

      const colorMain = isFirstRow ? '#0284c7' : (isLastRow ? '#ea580c' : '#475569');
      const headColor = isFirstRow ? '#38bdf8' : (isLastRow ? '#fb923c' : '#64748b');

      return `
        <!-- Desk Legs -->
        <line x1="${dTL.x}" y1="${dTL.y}" x2="${leg1Base.x}" y2="${leg1Base.y}" stroke="#64748b" stroke-width="2"/>
        <line x1="${dTR.x}" y1="${dTR.y}" x2="${leg2Base.x}" y2="${leg2Base.y}" stroke="#64748b" stroke-width="2"/>
        <line x1="${dBR.x}" y1="${dBR.y}" x2="${leg3Base.x}" y2="${leg3Base.y}" stroke="#64748b" stroke-width="2"/>
        <line x1="${dBL.x}" y1="${dBL.y}" x2="${leg4Base.x}" y2="${leg4Base.y}" stroke="#64748b" stroke-width="2"/>

        <!-- Desk Surface -->
        <polygon points="${dTL.x},${dTL.y} ${dTR.x},${dTR.y} ${dBR.x},${dBR.y} ${dBL.x},${dBL.y}"
          fill="${isKids ? '#fef08a' : '#f1f5f9'}" stroke="#94a3b8" stroke-width="1.5" />
        
        <!-- Notebook / Laptop on Desk -->
        ${isKids ? `
          <rect x="${dBL.x + 20}" y="${dBL.y - 14}" width="22" height="15" fill="#f43f5e" rx="2" stroke="#e11d48"/>
          <rect x="${dBL.x + 48}" y="${dBL.y - 12}" width="18" height="12" fill="#38bdf8" rx="2"/>
        ` : `
          <polygon points="${dBL.x + 25},${dBL.y - 8} ${dBL.x + 55},${dBL.y - 8} ${dBL.x + 50},${dBL.y - 20} ${dBL.x + 30},${dBL.y - 20}" fill="#334155" stroke="#0284c7" stroke-width="1.2"/>
        `}

        <!-- Chair -->
        <line x1="${cBase.x}" y1="${cBase.y}" x2="${cSeat.x}" y2="${cSeat.y}" stroke="#475569" stroke-width="3"/>
        <ellipse cx="${cSeat.x}" cy="${cSeat.y}" rx="${isKids ? 10 : 13}" ry="${isKids ? 5 : 7}" fill="#334155"/>
        <line x1="${cSeat.x}" y1="${cSeat.y}" x2="${cBack.x}" y2="${cBack.y}" stroke="#1e293b" stroke-width="3.5"/>

        <!-- Seated Student Body -->
        <line x1="${sTorsoBase.x}" y1="${sTorsoBase.y}" x2="${sHead.x}" y2="${sHead.y + 12}" stroke="${colorMain}" stroke-width="${isKids ? 4 : 5}"/>
        <line x1="${sHead.x}" y1="${sHead.y + 16}" x2="${sHands.x}" y2="${sHands.y}" stroke="${colorMain}" stroke-width="2.5"/>
        
        <!-- Student Head -->
        <circle cx="${sHead.x}" cy="${sHead.y}" r="${isKids ? 6.5 : 8}" fill="${headColor}" stroke="#ffffff" stroke-width="1.5"/>

        <!-- Label Callout -->
        ${label ? `
          <rect x="${sHead.x - 55}" y="${sHead.y - 32}" width="110" height="18" fill="#ffffff" rx="4" stroke="${colorMain}" stroke-width="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"/>
          <text x="${sHead.x}" y="${sHead.y - 20}" font-size="8" font-weight="bold" fill="${colorMain}" text-anchor="middle" font-family="JetBrains Mono">${label}</text>
        ` : ''}
      `;
    }

    // Render 1st Row Students (Left, Center, Right)
    const row1Svg = `
      ${renderStudentAtDesk(-w2 * 0.45, dCvMm, true, false, '')}
      ${renderStudentAtDesk(0, dCvMm, true, false, `1st Row: ${(dCvMm).toFixed(0)} mm`)}
      ${renderStudentAtDesk(w2 * 0.45, dCvMm, true, false, '')}
    `;

    // Render Middle Row Students
    const midY = (dCvMm + actualLastMm) / 2;
    const midRowSvg = `
      ${renderStudentAtDesk(-w2 * 0.45, midY, false, false, '')}
      ${renderStudentAtDesk(0, midY, false, false, `Mid: ${(midY).toFixed(0)} mm`)}
      ${renderStudentAtDesk(w2 * 0.45, midY, false, false, '')}
    `;

    // Render Last Row Students (Legibility Limit)
    const lastRowSvg = `
      ${renderStudentAtDesk(-w2 * 0.45, actualLastMm, false, true, '')}
      ${renderStudentAtDesk(0, actualLastMm, false, true, `Last Row: ${(actualLastMm).toFixed(0)} mm`)}
      ${renderStudentAtDesk(w2 * 0.45, actualLastMm, false, true, '')}
    `;

    svg.innerHTML = `
    <defs>
      <linearGradient id="iso-wall-light" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#e2e8f0" />
      </linearGradient>
      <linearGradient id="iso-side-wall" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f1f5f9" />
        <stop offset="100%" stop-color="#cbd5e1" />
      </linearGradient>
      <linearGradient id="sightline-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.10" />
      </linearGradient>
      <linearGradient id="iso-floor-architect" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f1f5f9" />
        <stop offset="100%" stop-color="#e2e8f0" />
      </linearGradient>
    </defs>

    <!-- Floor Surface -->
    <polygon points="${pFrontLeft.x},${pFrontLeft.y} ${pFrontRight.x},${pFrontRight.y} ${pBackRight.x},${pBackRight.y} ${pBackLeft.x},${pBackLeft.y}" 
      fill="url(#iso-floor-architect)" stroke="#cbd5e1" stroke-width="1.5" />

    <!-- Front Wall -->
    <polygon points="${pFrontLeft.x},${pFrontLeft.y} ${pFrontRight.x},${pFrontRight.y} ${pFrontRightTop.x},${pFrontRightTop.y} ${pFrontLeftTop.x},${pFrontLeftTop.y}" 
      fill="url(#iso-wall-light)" stroke="#cbd5e1" stroke-width="1.5" />

    <!-- Left Side Wall -->
    <polygon points="${pFrontLeft.x},${pFrontLeft.y} ${pBackLeft.x},${pBackLeft.y} ${pBackLeftTop.x},${pBackLeftTop.y} ${pFrontLeftTop.x},${pFrontLeftTop.y}" 
      fill="url(#iso-side-wall)" stroke="#cbd5e1" stroke-width="1" />

    <!-- Presenter Buffer Zone (1.5m / 1.2m) -->
    ${(() => {
      const pbFL = project(-w2, 0, 0);
      const pbFR = project(w2, 0, 0);
      const pbBR = project(w2, ifpdState.presenterBufferMm, 0);
      const pbBL = project(-w2, ifpdState.presenterBufferMm, 0);
      return `<polygon points="${pbFL.x},${pbFL.y} ${pbFR.x},${pbFR.y} ${pbBR.x},${pbBR.y} ${pbBL.x},${pbBL.y}" 
        fill="#fef3c7" fill-opacity="0.4" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="4 3" />`;
    })()}

    <!-- 1st Row Guide Line -->
    ${(() => {
      const rL = project(-w2 * 0.85, dCvMm, 0);
      const rR = project(w2 * 0.85, dCvMm, 0);
      return `<line x1="${rL.x}" y1="${rL.y}" x2="${rR.x}" y2="${rR.y}" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="5 3" />`;
    })()}

    <!-- Last Row Guide Line -->
    ${(() => {
      const rL = project(-w2 * 0.85, actualLastMm, 0);
      const rR = project(w2 * 0.85, actualLastMm, 0);
      return `<line x1="${rL.x}" y1="${rL.y}" x2="${rR.x}" y2="${rR.y}" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="5 3" />`;
    })()}

    <!-- Seated Students at Desks (All 3 Rows) -->
    ${lastRowSvg}
    ${midRowSvg}
    ${row1Svg}

    <!-- INTERACTIVE TOUCH FLAT PANEL (IFPD) ON WALL -->
    <polygon points="${pDispBL.x},${pDispBL.y} ${pDispBR.x},${pDispBR.y} ${pDispTR.x},${pDispTR.y} ${pDispTL.x},${pDispTL.y}" 
      fill="#0f172a" stroke="#2563eb" stroke-width="3" />
    <!-- Whiteboard Writing Canvas -->
    <polygon points="${pDispBL.x + 3},${pDispBL.y - 3} ${pDispBR.x - 3},${pDispBR.y - 3} ${pDispTR.x - 3},${pDispTR.y + 3} ${pDispTL.x + 3},${pDispTL.y + 3}" 
      fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <text x="${(pDispBL.x + pDispTR.x) / 2}" y="${(pDispBL.y + pDispTR.y) / 2}" fill="#38bdf8" font-size="11" font-family="JetBrains Mono" font-weight="bold" text-anchor="middle">
      ${ifpdState.diagonalInches}" IFPD (${ifpdState.imageWidthMm} × ${ifpdState.imageHeightMm} mm)
    </text>

    <!-- Height & AFFL Annotation -->
    <line x1="${pDispBR.x + 10}" y1="${pDispBR.y}" x2="${pDispTR.x + 10}" y2="${pDispTR.y}" stroke="#2563eb" stroke-width="1.8" />
    <text x="${pDispTR.x + 16}" y="${pDispTR.y + 14}" fill="#1d4ed8" font-size="9.5" font-family="JetBrains Mono" font-weight="bold">
      Screen H: ${ifpdState.imageHeightMm} mm | AFFL: ${ifpdState.afflMm} mm
    </text>

    <!-- STANDING INSTRUCTOR / TEACHER WITH STYLUS -->
    <g stroke="#d97706" stroke-width="2.5">
      <line x1="${pPresFoot.x}" y1="${pPresFoot.y}" x2="${pPresHead.x}" y2="${pPresHead.y + 14}" stroke="#b45309" stroke-width="4"/>
      <circle cx="${pPresHead.x}" cy="${pPresHead.y}" r="7" fill="#d97706" stroke="#ffffff" stroke-width="1.5"/>
      <!-- Arm pointing to display with interactive pen -->
      <line x1="${pPresHead.x}" y1="${pPresHead.y + 16}" x2="${pDispBL.x + 35}" y2="${pDispBL.y - 35}" stroke="#d97706" stroke-width="2" />
      <circle cx="${pDispBL.x + 35}" cy="${pDispBL.y - 35}" r="3" fill="#22c55e" />
    </g>
    <text x="${pPresHead.x - 30}" y="${pPresHead.y - 12}" fill="#b45309" font-size="9" font-family="JetBrains Mono" font-weight="bold">Teacher (Stylus Touch)</text>

    <!-- SIGHTLINES: 1ST ROW SIGHTLINE CONE (Max 30° Vertical Gaze) -->
    <polygon points="${pView1Eye.x},${pView1Eye.y} ${pScreenCenterTop.x},${pScreenCenterTop.y} ${pScreenCenterBottom.x},${pScreenCenterBottom.y}" 
      fill="url(#sightline-cyan)" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="4 2" />

    <line x1="${pView1Eye.x}" y1="${pView1Eye.y}" x2="${pScreenCenterTop.x}" y2="${pScreenCenterTop.y}" stroke="#0284c7" stroke-width="2" />
    <text x="${pView1Eye.x - 70}" y="${pView1Eye.y - 14}" fill="#0284c7" font-size="10" font-family="JetBrains Mono" font-weight="bold">
      Max 30° Vertical Gaze (PASS)
    </text>

    <!-- SIGHTLINES: LAST ROW LEGIBILITY SIGHTLINE -->
    <line x1="${pViewLastEye.x}" y1="${pViewLastEye.y}" x2="${pScreenCenterTop.x}" y2="${pScreenCenterTop.y}" stroke="#ea580c" stroke-width="1.8" stroke-dasharray="4 3" />

    <!-- FLOATING RECOMMENDATION HUD BANNER -->
    <g transform="translate(40, 40)">
      <rect x="0" y="0" width="360" height="62" fill="#ffffff" rx="8" stroke="#2563eb" stroke-width="1.5" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.06))"/>
      <circle cx="16" cy="18" r="5" fill="#2563eb"/>
      <text x="28" y="22" font-size="10.5" font-weight="800" fill="#1e293b" font-family="Inter">RECOMMENDED DISPLAY SIZING:</text>
      <text x="200" y="22" font-size="10.5" font-weight="800" fill="#2563eb" font-family="JetBrains Mono">${ifpdState.diagonalInches}" IFPD</text>
      <text x="14" y="40" font-size="8.5" font-weight="bold" fill="#0284c7" font-family="JetBrains Mono">
        1st Person: ${(dCvMm).toFixed(0)} mm | Last Person: ${(actualLastMm).toFixed(0)} mm
      </text>
      <text x="14" y="53" font-size="8" font-weight="bold" fill="#64748b" font-family="Inter">
        Profile: ${isKids ? 'Kids Classroom (AFFL 650mm | Eye 900mm)' : 'Adult Training (AFFL 900mm | Eye 1200mm)'}
      </text>
    </g>
  `;
}

function switchIfpdVisualTab(tab) {
  ifpdState.activeTab = tab;
  const container2D = document.getElementById('container-ifpd-visual-2d');
  const container3D = document.getElementById('container-ifpd-visual-3d');
  const btn2D = document.getElementById('btn-ifpd-tab-2d');
  const btn3D = document.getElementById('btn-ifpd-tab-3d');

  if (tab === '2d') {
    if (container2D) container2D.classList.remove('hidden');
    if (container3D) container3D.classList.add('hidden');
    if (btn2D) btn2D.className = "px-3 py-1.5 rounded-lg font-semibold bg-white text-sky-700 shadow-sm border border-slate-200 transition";
    if (btn3D) btn3D.className = "px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition";
  } else {
    if (container2D) container2D.classList.add('hidden');
    if (container3D) container3D.classList.remove('hidden');
    if (btn3D) btn3D.className = "px-3 py-1.5 rounded-lg font-semibold bg-white text-sky-700 shadow-sm border border-slate-200 transition";
    if (btn2D) btn2D.className = "px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition";
  }
}

function toggleIfpdAccordion(btn) {
  const parent = btn.closest('.accordion');
  if (parent) parent.classList.toggle('accordion-open');
}

function resetIfpdDefaults() {
  ifpdState.mode = 'recommend';
  ifpdState.roomLengthMm = 8000;
  ifpdState.roomWidthMm = 5500;
  ifpdState.diagonalInches = 86;
  ifpdState.imageWidthMm = 1904;
  ifpdState.imageHeightMm = 1071;
  ifpdState.verticalRes = 2160;
  ifpdState.afflMm = 900;
  ifpdState.eyeHeightMm = 1200;
  ifpdState.presenterBufferMm = 1500;
  ifpdState.taskType = 'BDM';
  ifpdState.ehPercent = 3.0;

  const lenMm = document.getElementById('in-room-len-mm');
  if (lenMm) lenMm.value = 8000;
  const lenFt = document.getElementById('in-room-len-ft');
  if (lenFt) lenFt.value = (8000 * IFPD_MM_TO_FT).toFixed(2);
  const widMm = document.getElementById('in-room-wid-mm');
  if (widMm) widMm.value = 5500;
  const widFt = document.getElementById('in-room-wid-ft');
  if (widFt) widFt.value = (5500 * IFPD_MM_TO_FT).toFixed(2);
  const dInp = document.getElementById('in-custom-diag');
  if (dInp) dInp.value = 86;
  const wInp = document.getElementById('in-custom-width-mm');
  if (wInp) wInp.value = 1904;
  const rInp = document.getElementById('in-res-vr');
  if (rInp) rInp.value = "2160";
  const afflInp = document.getElementById('in-affl-mm');
  if (afflInp) afflInp.value = 900;
  const eyeInp = document.getElementById('in-eye-height-mm');
  if (eyeInp) eyeInp.value = 1200;
  const buffInp = document.getElementById('in-presenter-buffer-mm');
  if (buffInp) buffInp.value = 1500;
  const ehInp = document.getElementById('in-eh-percent');
  if (ehInp) ehInp.value = 3.0;
  const ehTxt = document.getElementById('val-eh-text');
  if (ehTxt) ehTxt.textContent = "3.0% (Standard Teaching)";

  const bdmRadio = document.querySelector('input[name="ifpd-viewing-task"][value="BDM"]');
  if (bdmRadio) bdmRadio.checked = true;

  setIfpdCalculationMode('recommend');
}
