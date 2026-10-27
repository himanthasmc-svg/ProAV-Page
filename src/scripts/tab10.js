// ==========================================
// TAB 10: SPATIAL ROOM MATRIX LOGIC
// ==========================================
let roomRowsCount = 0;
let roomScaledChart = null;
let activeMatrixVisView = '3D';
let activeMatrixRoomData = null;
let showSpeakerOverlap = true;
let showAcousticHeatmap = true;

// Dynamic Color Palettes for Floors and Room Types
var FLOOR_COLOR_PALETTES = {
  '01': { name: 'Ground / Floor 1', bgLight: '#f0fdf4', bgBorder: '#86efac', text: '#166534', badgeBg: '#15803d', badgeText: '#ffffff', excelBg: '#e8f5e9', excelHeader: '#1e3a8a' }, // Emerald / Green
  '02': { name: 'Floor 2',          bgLight: '#eff6ff', bgBorder: '#93c5fd', text: '#1e40af', badgeBg: '#2563eb', badgeText: '#ffffff', excelBg: '#e3f2fd', excelHeader: '#0369a1' }, // Blue
  '03': { name: 'Floor 3',          bgLight: '#f5f3ff', bgBorder: '#c4b5fd', text: '#5b21b6', badgeBg: '#7c3aed', badgeText: '#ffffff', excelBg: '#ede7f6', excelHeader: '#6a1b9a' }, // Purple
  '04': { name: 'Floor 4',          bgLight: '#fffbeb', bgBorder: '#fcd34d', text: '#92400e', badgeBg: '#d97706', badgeText: '#ffffff', excelBg: '#fff8e1', excelHeader: '#f57f17' }, // Amber
  '05': { name: 'Floor 5',          bgLight: '#fff1f2', bgBorder: '#fda4af', text: '#9f1239', badgeBg: '#e11d48', badgeText: '#ffffff', excelBg: '#ffebee', excelHeader: '#c2185b' }, // Rose
  '06': { name: 'Floor 6',          bgLight: '#f0fdfa', bgBorder: '#5eead4', text: '#115e59', badgeBg: '#0d9488', badgeText: '#ffffff', excelBg: '#e0f2f1', excelHeader: '#00695c' }, // Teal
  '07': { name: 'Floor 7',          bgLight: '#fdf4ff', bgBorder: '#f0abfc', text: '#86198f', badgeBg: '#c026d3', badgeText: '#ffffff', excelBg: '#f3e5f5', excelHeader: '#8e24aa' }, // Fuchsia
  'B1': { name: 'Basement 1',       bgLight: '#f1f5f9', bgBorder: '#cbd5e1', text: '#334155', badgeBg: '#475569', badgeText: '#ffffff', excelBg: '#eceff1', excelHeader: '#37474f' }, // Slate
  'B2': { name: 'Basement 2',       bgLight: '#e2e8f0', bgBorder: '#94a3b8', text: '#1e293b', badgeBg: '#334155', badgeText: '#ffffff', excelBg: '#cfd8dc', excelHeader: '#263238' }  // Dark Slate
};

function getFloorPalette(floorStr) {
  var fl = (floorStr || '01').toString().trim().toUpperCase();
  if (FLOOR_COLOR_PALETTES[fl]) return FLOOR_COLOR_PALETTES[fl];
  var num = parseInt(fl.replace(/\D/g, ''), 10);
  if (!isNaN(num) && num > 0) {
    var keys = ['01', '02', '03', '04', '05', '06', '07'];
    var key = keys[(num - 1) % keys.length];
    return FLOOR_COLOR_PALETTES[key];
  }
  var hash = 0;
  for (var i = 0; i < fl.length; i++) hash = (hash << 5) - hash + fl.charCodeAt(i);
  var paletteKeys = ['01', '02', '03', '04', '05', '06', '07'];
  var pick = paletteKeys[Math.abs(hash) % paletteKeys.length];
  return FLOOR_COLOR_PALETTES[pick];
}

var ROOM_PURPOSE_PALETTES = {
  meeting:     { label: 'Meeting Room (6H)',       badgeBg: '#2563eb', badgeText: '#ffffff', excelBg: '#dbeafe', excelBorder: '#3b82f6', hex: '#1d4ed8' },
  uc:          { label: 'UC Room (5H)',            badgeBg: '#0891b2', badgeText: '#ffffff', excelBg: '#cffafe', excelBorder: '#06b6d4', hex: '#0e7490' },
  videowall:   { label: 'Videowall (dvLED AVIXA)', badgeBg: '#7c3aed', badgeText: '#ffffff', excelBg: '#ede9fe', excelBorder: '#8b5cf6', hex: '#6d28d9' },
  interactive: { label: 'Interactive Touch (6H)',  badgeBg: '#059669', badgeText: '#ffffff', excelBg: '#d1fae5', excelBorder: '#10b981', hex: '#047857' },
  bdm:         { label: 'Basic Viewing (BDM 8H)',  badgeBg: '#d97706', badgeText: '#ffffff', excelBg: '#fef3c7', excelBorder: '#f59e0b', hex: '#b45309' },
  adm:         { label: 'Analytical (ADM 4H)',     badgeBg: '#db2777', badgeText: '#ffffff', excelBg: '#fce7f3', excelBorder: '#ec4899', hex: '#be185d' }
};

function getRoomPurposePalette(purpose) {
  purpose = (purpose || 'meeting').toLowerCase();
  return ROOM_PURPOSE_PALETTES[purpose] || ROOM_PURPOSE_PALETTES.meeting;
}

function onFloorChanged(inputEl) {
  var tr = inputEl.closest('tr');
  if (!tr) return;
  var floorVal = inputEl.value;
  var pal = getFloorPalette(floorVal);
  tr.style.backgroundColor = pal.bgLight;
  tr.style.borderLeft = `5px solid ${pal.badgeBg}`;
  tr.setAttribute('data-floor', floorVal);
  inputEl.style.backgroundColor = pal.bgLight;
  inputEl.style.color = pal.text;
  inputEl.style.borderColor = pal.badgeBg;
  var slBadge = tr.querySelector('.sl-no-cell .badge');
  if (slBadge) slBadge.style.backgroundColor = pal.badgeBg;
  var colorPicker = tr.querySelector('.inp-color');
  if (colorPicker) colorPicker.value = rgbToHex(pal.bgLight);
  updateMatrixTotalsAndSummary();
}

function onPurposeChanged(selectEl) {
  var tr = selectEl.closest('tr');
  if (!tr) return;
  var purpPal = getRoomPurposePalette(selectEl.value);
  selectEl.style.borderColor = purpPal.badgeBg;
  selectEl.style.color = purpPal.hex;
  var nameEl = tr.querySelector('.inp-name');
  if (nameEl) nameEl.style.borderLeft = `3px solid ${purpPal.badgeBg}`;
  recalcRoomRow(tr);
}

const initialRoomData = [
  { floor: "01", name: "Executive Boardroom", qty: 1, seats: 16, w: 6000, l: 9000, h: 2700, purpose: "meeting", pitch: 1.25, spkSize: '6.5"', camD1: 2.5, camWspan: 3.5, camModel: 'auto', camZoomFactor: 12, camFraming: 'auto', videoBar: 'auto', micType: 'auto', note: "VIP Boardroom", color: "#f0fdf4" },
  { floor: "01", name: "Teams UC Room 101", qty: 2, seats: 8, w: 4500, l: 6000, h: 2700, purpose: "uc", pitch: 1.25, spkSize: '6.5"', camD1: 1.8, camWspan: 2.6, camModel: 'auto', camZoomFactor: 5, camFraming: 'auto', videoBar: 'auto', micType: 'auto', note: "Teams Bar", color: "#f0fdf4" },
  { floor: "02", name: "Training Lab 201", qty: 1, seats: 24, w: 5500, l: 8000, h: 2700, purpose: "interactive", pitch: 1.25, spkSize: '6.5"', camD1: 2.2, camWspan: 3.8, camModel: 'auto', camZoomFactor: 12, camFraming: 'auto', videoBar: 'none', micType: 'auto', note: "Touch IFPD", color: "#eff6ff" },
  { floor: "02", name: "Main Auditorium", qty: 1, seats: 120, w: 15000, l: 20000, h: 5000, purpose: "videowall", pitch: 1.5, spkSize: '8"', camD1: 4.5, camWspan: 8.0, camModel: 'auto', camZoomFactor: 20, camFraming: 'auto', videoBar: 'none', micType: 'auto', note: "dvLED Wall", color: "#eff6ff" },
  { floor: "03", name: "Design Huddle 301", qty: 3, seats: 6, w: 4000, l: 5000, h: 2700, purpose: "meeting", pitch: 1.25, spkSize: '4"', camD1: 1.5, camWspan: 2.0, camModel: 'auto', camZoomFactor: 1, camFraming: 'auto', videoBar: 'compact', micType: 'auto', note: "Acoustic Clouds", color: "#f5f3ff" },
  { floor: "04", name: "Operations NOC 401", qty: 1, seats: 18, w: 7000, l: 11000, h: 3000, purpose: "adm", pitch: 0.9, spkSize: '6.5"', camD1: 3.0, camWspan: 4.5, camModel: 'auto', camZoomFactor: 20, camFraming: 'auto', videoBar: 'none', micType: 'auto', note: "24/7 Command Center", color: "#fffbeb" }
];

function initSpatialMatrix() {
  const tbody = document.getElementById('matrixTableBody');
  if (tbody) tbody.innerHTML = '';
  roomRowsCount = 0;

  var loaded = loadProjectLocal();
  if (!loaded) {
    initialRoomData.forEach(r => addRoomRowWithData(r));
  }
  updateMatrixTotalsAndSummary();

  var firstRow = tbody ? tbody.querySelector('tr') : null;
  if (firstRow) {
    selectMatrixRoomFor3D(firstRow);
  }
  initMatrixTooltips();
}

function initMatrixTooltips() {
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    try {
      var tooltipTriggerList = document.querySelectorAll('#Tab10 [data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach(function(el) {
        if (!bootstrap.Tooltip.getInstance(el)) {
          new bootstrap.Tooltip(el, { container: 'body' });
        }
      });
    } catch (e) {}
  }
}

function addRoomRow() {
  var tbody = document.getElementById('matrixTableBody');
  var lastTr = tbody ? tbody.lastElementChild : null;
  var nextFloor = lastTr ? (lastTr.querySelector('.inp-floor')?.value || '01') : '01';
  var pal = getFloorPalette(nextFloor);
  addRoomRowWithData({
    floor: nextFloor,
    name: "Meeting Room " + (roomRowsCount + 1),
    qty: 1,
    seats: 10,
    w: 5000,
    l: 7000,
    h: 2700,
    purpose: "meeting",
    pitch: 1.25,
    note: "",
    color: pal.bgLight
  });
  updateMatrixTotalsAndSummary();
  var lastRow = tbody ? tbody.lastElementChild : null;
  if (lastRow) {
    selectMatrixRoomFor3D(lastRow);
  }
}

function calculateDisplayForPurpose(lm_mm, purpose, pitch_mm) {
  var D = lm_mm / 1000.0;
  var diagIn = 85, diagStr = "85\"", w_m = 1.88, h_m = 1.06, firstP = 1.88, lastP = 6.0;

  if (purpose === 'meeting') {
    // AVIXA DISCAS Meeting Room: 6H standard
    var H = D / 6.0;
    var Diag = (H / 9.0) * Math.sqrt(337) * 39.3701;
    diagIn = Diag;
    diagStr = getStandardSize(Diag) + " (6H)";
    w_m = H * (16.0 / 9.0);
    h_m = H;
    firstP = Math.max(1.2, w_m * 1.0);
    lastP = H * 6.0;
  } else if (purpose === 'uc') {
    // AVIXA DISCAS UC Room: 5H standard
    var H_uc = D / 5.0;
    var Diag_uc = (H_uc / 9.0) * Math.sqrt(337) * 39.3701;
    diagIn = Diag_uc;
    diagStr = getStandardSize(Diag_uc) + " (UC 5H)";
    w_m = H_uc * (16.0 / 9.0);
    h_m = H_uc;
    firstP = Math.max(1.2, w_m * 1.0);
    lastP = H_uc * 5.0;
  } else if (purpose === 'videowall') {
    // AVIXA DISCAS dvLED Videowall sizing + Visual Acuity standard
    pitch_mm = parseFloat(pitch_mm) || 1.25;
    var H_led = Math.max(1.5, D / 6.0); // 6H AVIXA baseline
    var W_led = H_led * (16.0 / 9.0);
    var Diag_led = Math.sqrt(W_led*W_led + H_led*H_led) * 39.3701;
    var acuityDist = (pitch_mm * 3.44).toFixed(1);
    diagIn = Diag_led;
    diagStr = `${Math.round(Diag_led)}" dvLED (P${pitch_mm})`;
    w_m = W_led;
    h_m = H_led;
    firstP = parseFloat(acuityDist);
    lastP = H_led * 6.0;
  } else if (purpose === 'interactive') {
    // AVIXA DISCAS Interactive Touch standard: 6H
    var H_ifpd = D / 6.0;
    var Diag_ifpd = (H_ifpd / 9.0) * Math.sqrt(337) * 39.3701;
    diagIn = Diag_ifpd;
    diagStr = getStandardSize(Diag_ifpd) + " IFPD (6H)";
    w_m = H_ifpd * (16.0 / 9.0);
    h_m = H_ifpd;
    firstP = Math.max(1.5, w_m * 1.0); // 1.5m presenter buffer
    lastP = H_ifpd * 6.0;
  } else if (purpose === 'bdm') {
    // AVIXA DISCAS Basic Decision Making (BDM): 8H
    var H_bdm = D / 8.0;
    var Diag_bdm = (H_bdm / 9.0) * Math.sqrt(337) * 39.3701;
    diagIn = Diag_bdm;
    diagStr = getStandardSize(Diag_bdm) + " (BDM 8H)";
    w_m = H_bdm * (16.0 / 9.0);
    h_m = H_bdm;
    firstP = Math.max(1.2, w_m * 1.0);
    lastP = H_bdm * 8.0;
  } else if (purpose === 'adm') {
    // AVIXA DISCAS Analytical Decision Making (ADM): 4H
    var H_adm = D / 4.0;
    var Diag_adm = (H_adm / 9.0) * Math.sqrt(337) * 39.3701;
    diagIn = Diag_adm;
    diagStr = getStandardSize(Diag_adm) + " (ADM 4H)";
    w_m = H_adm * (16.0 / 9.0);
    h_m = H_adm;
    firstP = Math.max(1.2, w_m * 1.0);
    lastP = H_adm * 4.0;
  }

  return {
    diagIn: diagIn,
    diagStr: diagStr,
    w_mm: Math.round(w_m * 1000),
    h_mm: Math.round(h_m * 1000),
    firstP: firstP,
    lastP: lastP
  };
}

// 1. CEILING SPEAKER REQUIREMENT ENGINE
// Calculates number of ceiling speakers based on room dimensions, ceiling height, and speaker driver size
function calculateCeilingSpeakers(lm_mm, wm_mm, hm_mm, spkSize) {
  var L = (parseFloat(lm_mm) || 7000) / 1000.0;
  var W = (parseFloat(wm_mm) || 5000) / 1000.0;
  var H = (parseFloat(hm_mm) || 2700) / 1000.0;
  spkSize = spkSize || '6.5"';

  // Listener ear height: seated = 1.2m
  var listenerEarH = 1.2;
  var hDiff = Math.max(1.0, H - listenerEarH);

  var dispersionDeg = 100;
  if (spkSize === '2.5"' || spkSize.startsWith('2.5')) dispersionDeg = 150;
  else if (spkSize === '3"' || spkSize.startsWith('3')) dispersionDeg = 140;
  else if (spkSize === '4"' || spkSize.startsWith('4')) dispersionDeg = 130;
  else if (spkSize === '5.25"' || spkSize.startsWith('5.25')) dispersionDeg = 110;
  else if (spkSize === '6.5"' || spkSize.startsWith('6.5')) dispersionDeg = 100;
  else if (spkSize === '8"' || spkSize.startsWith('8')) dispersionDeg = 90;
  else if (spkSize === '10"' || spkSize.startsWith('10')) dispersionDeg = 80;
  else if (spkSize === '12"' || spkSize.startsWith('12')) dispersionDeg = 70;
  else if (spkSize.includes('pendant_8') || spkSize.includes('Pendant 8')) dispersionDeg = 85;
  else if (spkSize.includes('pendant') || spkSize.includes('Pendant')) dispersionDeg = 95;

  var coverageRadius = hDiff * Math.tan((dispersionDeg / 2.0) * (Math.PI / 180.0));
  var coverageDiameter = coverageRadius * 2.0;

  // Nominal spacing for square grid
  var idealSpacing = Math.max(1.8, Math.min(6.0, coverageRadius * 1.414));
  var cols = Math.max(1, Math.round(L / idealSpacing));
  var rows = Math.max(1, Math.round(W / idealSpacing));
  var count = cols * rows;

  var actualSpacingL = L / cols;
  var actualSpacingW = W / rows;
  var avgActualSpacing = (actualSpacingL + actualSpacingW) / 2.0;

  // Overlap percentage: (Diameter - Spacing) / Diameter * 100
  var overlapRatio = Math.max(0, (coverageDiameter - avgActualSpacing) / coverageDiameter);
  var overlapPercent = Math.min(85, Math.round(overlapRatio * 100));
  var overlapType = overlapPercent >= 45 ? 'Heavy Overlap (+4 to +6dB)' : (overlapPercent >= 25 ? 'Optimal Minimum Overlap (+3dB)' : (overlapPercent > 5 ? 'Edge-to-Edge (+1dB)' : 'Nominal Gaps Present'));

  return {
    count: count,
    cols: cols,
    rows: rows,
    size: spkSize,
    dispersionDeg: dispersionDeg,
    coverageRadius: coverageRadius,
    coverageDiameter: coverageDiameter.toFixed(1),
    spacing: avgActualSpacing.toFixed(1),
    spacingL: actualSpacingL.toFixed(1),
    spacingW: actualSpacingW.toFixed(1),
    overlapPercent: overlapPercent,
    overlapType: overlapType,
    text: `${count} × ${spkSize} (${cols}×${rows})`
  };
}

// Calculates base camera count from room dimensions, seating, and placement
function calculateBaseCameraCount(lm_mm, wm_mm, seats, camPos) {
  var L = (parseFloat(lm_mm) || 7000) / 1000.0;
  var W = (parseFloat(wm_mm) || 5000) / 1000.0;
  var seatsCount = parseInt(seats) || 10;
  var area = L * W;

  if (camPos === 'both_lr' || camPos === 'above_and_opposite') {
    return 2;
  }
  if (area > 80 || L > 14.0 || seatsCount >= 24) {
    return 3;
  }
  if (area > 35 || L > 7.5 || seatsCount >= 14) {
    return 2;
  }
  return 1;
}

function onSpkExtraInput(input) {
  var tr = input.closest('tr');
  if (!tr) return;
  var extra = parseInt(input.value) || 0;
  if (extra < 0) extra = 0;
  var base = parseInt(tr.dataset.spkBaseQty) || 0;
  var totInp = tr.querySelector('.inp-spk-qty');
  if (totInp) {
    totInp.dataset.userOverridden = '';
    totInp.value = base + extra;
  }
  recalcRoomRow(tr);
}

function onSpkTotalInput(input) {
  var tr = input.closest('tr');
  if (!tr) return;
  input.dataset.userOverridden = 'true';
  var tot = parseInt(input.value) || 0;
  var base = parseInt(tr.dataset.spkBaseQty) || 0;
  var extraInp = tr.querySelector('.inp-spk-extra');
  if (extraInp) extraInp.value = Math.max(0, tot - base);
  recalcRoomRow(tr);
}

function onCamExtraInput(input) {
  var tr = input.closest('tr');
  if (!tr) return;
  var extra = parseInt(input.value) || 0;
  if (extra < 0) extra = 0;
  var base = parseInt(tr.dataset.camBaseQty) || 1;
  var totInp = tr.querySelector('.inp-cam-qty');
  if (totInp) {
    totInp.dataset.userOverridden = '';
    totInp.value = base + extra;
  }
  recalcRoomRow(tr);
}

function onCamTotalInput(input) {
  var tr = input.closest('tr');
  if (!tr) return;
  input.dataset.userOverridden = 'true';
  var tot = parseInt(input.value) || 0;
  var base = parseInt(tr.dataset.camBaseQty) || 1;
  var extraInp = tr.querySelector('.inp-cam-extra');
  if (extraInp) extraInp.value = Math.max(0, tot - base);
  recalcRoomRow(tr);
}

function onMicExtraInput(input) {
  var tr = input.closest('tr');
  if (!tr) return;
  var extra = parseInt(input.value) || 0;
  if (extra < 0) extra = 0;
  var base = parseInt(tr.dataset.micBaseQty) || 1;
  var totInp = tr.querySelector('.inp-mic-qty');
  if (totInp) {
    totInp.dataset.userOverridden = '';
    totInp.value = base + extra;
  }
  recalcRoomRow(tr);
}

function onMicTotalInput(input) {
  var tr = input.closest('tr');
  if (!tr) return;
  input.dataset.userOverridden = 'true';
  var tot = parseInt(input.value) || 0;
  var base = parseInt(tr.dataset.micBaseQty) || 1;
  var extraInp = tr.querySelector('.inp-mic-extra');
  if (extraInp) extraInp.value = Math.max(0, tot - base);
  recalcRoomRow(tr);
}

// 2. CAMERA HFOV & RECOMMENDATION ENGINE
// User formula:
// Mount: Center of the front display wall
// D1: Distance from camera wall to 1st seated row
// Wspan: Distance between 2 outermost seated persons in first row
// HFOV = 2 * arctan(Wspan / (2 * D1)) * (180 / PI)
// Dlast = max(D1 + 1.0, L - 1.2)
// Recommendation:
// HFOV > 95°: 120° Wide ePTZ (Bar) with 4K auto group-framing
// 78° <= HFOV <= 95°: 85° Wide PTZ (3x/5x Zoom) (or Dual-Eye PTZ if Dlast > 7m)
// 60° <= HFOV < 78°: 72° Standard 12x Optical Zoom PTZ (or Dual-Eye Auto-Track if Dlast > 9m)
// ==========================================
// CAMERA SPECIFICATIONS & HARDWARE ZOOMING CAPABILITIES
// ==========================================
const cameraModelSpecs = {
  '120° Wide ePTZ (Bar)': {
    lensHfov: 120.0,
    opticalZoom: '1x (Fixed Ultra-Wide)',
    digitalZoom: '4x / 5x Lossless ePTZ',
    zoomCapability: '1x Optical &bull; 4x/5x Digital ePTZ',
    zoomSummary: '4x ePTZ (Digital)',
    maxEffectiveDist: 4.5,
    maxSpanFactor: 3.46, // 2 * tan(60) = 3.464
    safeSpanFactor: 3.0,
    type: 'ePTZ Video Bar',
    recommendedFor: 'Huddle & Small Spaces (Dlast ≤ 4.5m)'
  },
  '85° PTZ (3x/5x Zoom)': {
    lensHfov: 85.0,
    opticalZoom: '3x / 5x Optical Zoom',
    digitalZoom: '12x Digital Zoom',
    zoomCapability: '3x–5x Optical Zoom (Tele: 24°–18°)',
    zoomSummary: '3x/5x Optical',
    maxEffectiveDist: 7.5,
    maxSpanFactor: 1.83, // 2 * tan(42.5) = 1.832
    safeSpanFactor: 1.6,
    type: 'Medium Conference PTZ',
    recommendedFor: 'Medium Conference Rooms (Dlast ≤ 7.5m)'
  },
  '72° PTZ (12x Zoom)': {
    lensHfov: 72.0,
    opticalZoom: '12x Optical Zoom',
    digitalZoom: '16x Digital Zoom',
    zoomCapability: '12x Optical Zoom (Tele: 6.3°)',
    zoomSummary: '12x Optical',
    maxEffectiveDist: 14.0,
    maxSpanFactor: 1.45, // 2 * tan(36) = 1.453
    safeSpanFactor: 1.3,
    type: 'Boardroom / Large Room PTZ',
    recommendedFor: 'Boardrooms & Training Rooms (Dlast ≤ 14m)'
  },
  '60° PTZ (20x/30x Zoom)': {
    lensHfov: 60.0,
    opticalZoom: '20x / 30x Optical Zoom',
    digitalZoom: '16x Digital Zoom',
    zoomCapability: '20x–30x Optical Zoom (Tele: 2.3°)',
    zoomSummary: '20x/30x Optical',
    maxEffectiveDist: 28.0,
    maxSpanFactor: 1.15, // 2 * tan(30) = 1.155
    safeSpanFactor: 1.0,
    type: 'Auditorium Broadcast PTZ',
    recommendedFor: 'Auditoriums & Deep Halls (Dlast ≤ 28m)'
  },
  'Dual-Eye Auto-Track': {
    lensHfov: 110.0, // panoramic reference
    opticalZoom: '12x Optical Telephoto + Panoramic Sensor',
    digitalZoom: 'AI Multi-Stream Framing',
    zoomCapability: '12x Optical + 110° AI Panoramic Reference',
    zoomSummary: '12x Optical + Dual-Lens AI',
    maxEffectiveDist: 16.0,
    maxSpanFactor: 2.85,
    safeSpanFactor: 2.5,
    type: 'Dual-Camera Director PTZ',
    recommendedFor: 'Executive & Multi-Camera Spaces (Dlast ≤ 16m)'
  },
  '360° Tabletop Center': {
    lensHfov: 360.0,
    opticalZoom: 'Panoramic Center Ring',
    digitalZoom: 'AI Quad-Split ePTZ',
    zoomCapability: '360° Panoramic + AI Quad ePTZ',
    zoomSummary: '360° Quad ePTZ',
    maxEffectiveDist: 3.5,
    maxSpanFactor: 5.0,
    safeSpanFactor: 4.0,
    type: 'Center Table 360° Camera',
    recommendedFor: 'Round / Square Huddle Pods (Radius ≤ 3.5m)'
  }
};

function calculateCameraHFOV(lm_mm, wm_mm, customD1, customWspan, overrideModel, customZoomFactor) {
  var L = (parseFloat(lm_mm) || 7000) / 1000.0;
  var W = (parseFloat(wm_mm) || 5000) / 1000.0;

  // Default D1 = max(1.5, L * 0.28) if not specified
  var d1 = parseFloat(customD1);
  if (isNaN(d1) || d1 <= 0.5) d1 = Math.max(1.5, Math.min(L - 1.2, L * 0.28));

  // Default Wspan = max(1.6, W * 0.55) if not specified
  var wSpan = parseFloat(customWspan);
  if (isNaN(wSpan) || wSpan <= 0.8) wSpan = Math.max(1.6, Math.min(W * 0.85, W * 0.55));

  // Calculate HFOV in degrees
  var hfovRad = 2.0 * Math.atan(wSpan / (2.0 * d1));
  var hfovDeg = hfovRad * (180.0 / Math.PI);

  var dLast = Math.max(d1 + 1.0, L - 1.2);

  // Recommended Camera Engine based on optical geometry
  var autoModel = '';
  var recLabel = '';
  if (hfovDeg > 95.0) {
    autoModel = '120° Wide ePTZ (Bar)';
    recLabel = '120° Wide ePTZ (Bar) w/ 4K Framing';
  } else if (hfovDeg >= 78.0 && hfovDeg <= 95.0) {
    if (dLast > 7.0) {
      autoModel = 'Dual-Eye Auto-Track';
      recLabel = 'Dual-Eye PTZ (85° Wide + Tele, Dlast>7m)';
    } else {
      autoModel = '85° PTZ (3x/5x Zoom)';
      recLabel = '85° Wide PTZ (3x/5x Zoom)';
    }
  } else if (hfovDeg >= 60.0 && hfovDeg < 78.0) {
    if (dLast > 9.0) {
      autoModel = 'Dual-Eye Auto-Track';
      recLabel = 'Dual-Eye Auto-Track (12x, Dlast>9m)';
    } else {
      autoModel = '72° PTZ (12x Zoom)';
      recLabel = '72° PTZ (12x Optical Zoom)';
    }
  } else {
    autoModel = '60° PTZ (20x/30x Zoom)';
    recLabel = '20x/30x Broadcast PTZ (Long Throw)';
  }

  var selectedModel = (overrideModel && overrideModel !== 'auto') ? overrideModel : autoModel;

  // Retrieve Camera Zoom Specifications & Evaluate Limits Warning System
  var spec = cameraModelSpecs[selectedModel] || cameraModelSpecs['85° PTZ (3x/5x Zoom)'];
  var maxHardSpanAtD1 = d1 * spec.maxSpanFactor;
  var maxSafeSpanAtD1 = d1 * spec.safeSpanFactor;

  // Default rated zoom factor for model
  var defaultZoom = 1;
  if (selectedModel.includes('20x/30x')) defaultZoom = 20;
  else if (selectedModel.includes('12x') || selectedModel.includes('Dual-Eye')) defaultZoom = 12;
  else if (selectedModel.includes('3x/5x')) defaultZoom = 5;
  else if (selectedModel.includes('120°')) defaultZoom = 1;

  var zoomFactor = (customZoomFactor !== undefined && customZoomFactor !== null && !isNaN(parseFloat(customZoomFactor))) 
    ? parseFloat(customZoomFactor) 
    : defaultZoom;

  // Dynamic optical reach based on zoom factor
  var dynamicEffectiveDist = spec.maxEffectiveDist;
  if (zoomFactor > 1) {
    dynamicEffectiveDist = Math.max(spec.maxEffectiveDist * 0.7, (spec.lensHfov <= 75 ? 1.15 : 1.35) * zoomFactor + 1.0);
  }

  var isHfovExceeded = hfovDeg > (spec.lensHfov + 0.8);
  var isSpanExceeded = wSpan > (maxHardSpanAtD1 + 0.05);
  var isZoomExceeded = dLast > (dynamicEffectiveDist + 0.5);

  var hasWarning = isHfovExceeded || isSpanExceeded || isZoomExceeded;
  var warningShort = '';
  var warningDetails = '';

  if (isHfovExceeded) {
    warningShort = `HFOV Exceeded (${hfovDeg.toFixed(1)}° > ${spec.lensHfov}° Lens)`;
    warningDetails = `Required optical HFOV (${hfovDeg.toFixed(1)}°) exceeds selected camera max lens HFOV (${spec.lensHfov}°). First-row participants outside the angle will be cropped. Increase D1 distance or select 120° Wide ePTZ.`;
  } else if (isSpanExceeded) {
    warningShort = `Span Exceeded (${wSpan.toFixed(1)}m > Max ${maxHardSpanAtD1.toFixed(1)}m)`;
    warningDetails = `First-row seating span (${wSpan.toFixed(1)}m) exceeds maximum optical coverage (${maxHardSpanAtD1.toFixed(1)}m) achievable by ${selectedModel} at D1 = ${d1.toFixed(1)}m. Edge viewers will be cut off.`;
  } else if (isZoomExceeded) {
    warningShort = `Zoom Undersized (Dlast ${dLast.toFixed(1)}m > ${dynamicEffectiveDist.toFixed(1)}m)`;
    warningDetails = `Furthest participant distance (${dLast.toFixed(1)}m) exceeds optical zoom reach (${dynamicEffectiveDist.toFixed(1)}m) with ${zoomFactor}x zoom for facial identification. Increase optical zoom factor slider or select 20x/30x PTZ.`;
  }

  var zoomSummary = `${zoomFactor}x Optical`;
  if (zoomFactor !== defaultZoom) {
    zoomSummary = `${zoomFactor}x (Fine-tuned)`;
  }

  return {
    d1: d1,
    wSpan: wSpan,
    dLast: dLast,
    hfovDeg: hfovDeg,
    hfovStr: hfovDeg.toFixed(1) + '°',
    autoModel: autoModel,
    selectedModel: selectedModel,
    recLabel: recLabel,
    spec: spec,
    zoomFactor: zoomFactor,
    defaultZoom: defaultZoom,
    zoomCapability: spec.zoomCapability,
    opticalZoom: `${zoomFactor}x Optical Zoom`,
    zoomSummary: zoomSummary,
    maxEffectiveDist: dynamicEffectiveDist.toFixed(1),
    maxHardSpanAtD1: maxHardSpanAtD1,
    isHfovExceeded: isHfovExceeded,
    isSpanExceeded: isSpanExceeded,
    isZoomExceeded: isZoomExceeded,
    hasWarning: hasWarning,
    warningShort: warningShort,
    warningDetails: warningDetails
  };
}

// CAMERA AI AUTO-FRAMING CAPABILITIES ENGINE
// Calculates required framing mode based on room layout, seating, purpose & HFOV
function calculateCameraFramingMode(purpose, seats, length_mm, width_mm, d1, hfovDeg, camModel, overrideMode) {
  var L = (parseFloat(length_mm) || 7000) / 1000.0;
  var W = (parseFloat(width_mm) || 5000) / 1000.0;
  var seatsCount = parseInt(seats) || 10;
  var d1_val = parseFloat(d1) || 2.0;
  var hfov = parseFloat(hfovDeg) || 70.0;

  var modeMetadata = {
    'Group Framing (Auto-Frame)': {
      desc: 'Continuous optical framing of all present meeting participants',
      icon: 'fa-users-viewfinder',
      badgeBg: '#4f46e5'
    },
    'Speaker Tracking (Voice AI)': {
      desc: 'Voice-directed PTZ zoom triggered by beamforming mic DOA',
      icon: 'fa-microphone-lines',
      badgeBg: '#f59e0b'
    },
    'Presenter Tracking (Follow)': {
      desc: 'AI tracks presenter moving across front whiteboard / stage',
      icon: 'fa-person-chalkboard',
      badgeBg: '#10b981'
    },
    'People Framing (Multi-Stream)': {
      desc: 'Individual facial tiles for Teams Front Row / Zoom Smart Gallery',
      icon: 'fa-table-cells-large',
      badgeBg: '#0284c7'
    },
    'Dual-Camera Studio Director': {
      desc: 'Panoramic reference + 12x/20x PTZ active speaker close-up',
      icon: 'fa-clapperboard',
      badgeBg: '#8b5cf6'
    },
    'Auto ePTZ (Digital Frame)': {
      desc: '4K digital group crop for compact huddle collaboration',
      icon: 'fa-crop-simple',
      badgeBg: '#06b6d4'
    },
    'Manual Preset PTZ': {
      desc: 'Fixed optical presets recalled via touch panel controller',
      icon: 'fa-gamepad',
      badgeBg: '#64748b'
    }
  };

  var autoMode = 'Group Framing (Auto-Frame)';

  // AI Framing Mode selection based on room seating layout and optical HFOV:
  if (purpose === 'uc' || (hfov >= 85.0 && seatsCount >= 6)) {
    // Teams Front Row / UltraWide layout or wide seating span requiring multi-stream individual participant crops
    autoMode = 'People Framing (Multi-Stream)';
  } else if (purpose === 'interactive' || (L >= 8.5 && seatsCount >= 14)) {
    // Stage or presenter podium where presenter moves across front wall/display
    autoMode = 'Presenter Tracking (Follow)';
  } else if (L >= 12.0 || seatsCount >= 24) {
    // Large venue / deep hall requiring dual optical sensors (overview + robotic tracking)
    autoMode = 'Dual-Camera Studio Director';
  } else if (seatsCount >= 8 && d1_val >= 2.0 && hfov <= 82.0) {
    // Standard conference table where voice-guided tracking frames whoever speaks
    autoMode = 'Speaker Tracking (Voice AI)';
  } else if (seatsCount <= 6 && (d1_val <= 1.8 || hfov >= 80.0)) {
    // Compact focus / huddle space where ePTZ digital framing fits the wide-angle proximity
    autoMode = 'Auto ePTZ (Digital Frame)';
  } else {
    // General meeting room where continuous group optical framing provides best coverage
    autoMode = 'Group Framing (Auto-Frame)';
  }

  var selectedMode = (overrideMode && overrideMode !== 'auto') ? overrideMode : autoMode;
  var meta = modeMetadata[selectedMode] || modeMetadata[autoMode] || {
    desc: 'Continuous optical framing of all participants',
    icon: 'fa-users-viewfinder',
    badgeBg: '#4f46e5'
  };

  return {
    autoMode: autoMode,
    selectedMode: selectedMode,
    desc: meta.desc,
    icon: meta.icon,
    badgeBg: meta.badgeBg
  };
}

function toggleMatrixQuickGuide() {
  var el = document.getElementById('spatialMatrixQuickGuideContent');
  var btn = document.getElementById('btnToggleMatrixQuickGuide');
  if (!el) return;
  var isHidden = el.style.display === 'none' || getComputedStyle(el).display === 'none';
  if (isHidden) {
    el.style.display = 'block';
    if (btn) btn.innerHTML = '<i class="fa-solid fa-eye-slash me-1"></i>Hide Details &amp; Visual Guide';
  } else {
    el.style.display = 'none';
    if (btn) btn.innerHTML = '<i class="fa-solid fa-eye me-1"></i>Show Details &amp; Visual Guide';
  }
}

// 3. MICROPHONE REQUIREMENT ENGINE
// Calculates beamforming ceiling arrays vs tabletop boundary mics based on room dimensions & capacity
function calculateMicrophones(lm_mm, wm_mm, seats, overrideType) {
  var L = (parseFloat(lm_mm) || 7000) / 1000.0;
  var W = (parseFloat(wm_mm) || 5000) / 1000.0;
  var seatsCount = parseInt(seats) || 10;
  var area = L * W;

  var autoType = 'ceiling_array';
  var autoDesc = '';
  var qty = 1;

  if (area <= 18 && seatsCount <= 6) {
    // Small Huddle / Small Meeting: All-In-One Bar or Tabletop Boundary
    autoType = 'table_boundary';
    qty = 1;
    autoDesc = '1 × Tabletop Boundary Mic (or All-In-One Bar Mic)';
  } else if (area <= 45 && seatsCount <= 14) {
    // Medium Boardroom / Conference: 1 Ceiling Beamforming Array or 2 Table mics
    autoType = 'ceiling_array';
    qty = 1;
    autoDesc = '1 × Ceiling Beamforming Array (Shure MXA920 / Sennheiser TCC2)';
  } else if (area <= 85 && seatsCount <= 26) {
    // Large Boardroom / Training: 2 Ceiling Beamforming Arrays
    autoType = 'ceiling_array';
    qty = 2;
    autoDesc = '2 × Ceiling Beamforming Arrays (Even Coverage)';
  } else if (area <= 160) {
    // Extra Large / Divisible: 3-4 Ceiling Arrays
    autoType = 'ceiling_array';
    qty = Math.max(3, Math.round(area / 40));
    autoDesc = `${qty} × Ceiling Beamforming Arrays (Multi-Zone)`;
  } else {
    // Auditorium / Hall: Ceiling arrays + Wireless Handheld/Lapel Speech Mics
    autoType = 'hybrid_wireless';
    qty = Math.max(4, Math.round(area / 45));
    autoDesc = `${qty} × Ceiling Arrays + Wireless Mics (Dante DSP)`;
  }

  var type = overrideType || 'auto';
  var displayDesc = autoDesc;
  if (type === 'ceiling_array') {
    var cQty = Math.max(1, Math.round(area / 40));
    displayDesc = `${cQty} × Ceiling Beamforming Array${cQty > 1 ? 's' : ''}`;
  } else if (type === 'table_boundary') {
    var tQty = Math.max(1, Math.round(seatsCount / 4));
    displayDesc = `${tQty} × Tabletop Boundary Mic${tQty > 1 ? 's' : ''}`;
  } else if (type === 'table_gooseneck') {
    displayDesc = `${seatsCount} × Table Gooseneck Mics (1 per seat)`;
  } else if (type === 'bar_builtin') {
    displayDesc = '1 × Video Bar Integrated Mic Array';
  } else if (type === 'pendant_mic') {
    var pQty = Math.max(1, Math.round(area / 25));
    displayDesc = `${pQty} × Ceiling Pendant Mic${pQty > 1 ? 's' : ''}`;
  }

  return {
    type: type,
    autoType: autoType,
    displayDesc: displayDesc,
    qty: qty
  };
}

// 4. ALL-IN-ONE VIDEO BAR ENGINE
// Determines optimal all-in-one UC video bar (inbuilt Camera, Beamforming Mic & Stereo Speakers)
function calculateVideoBar(lm_mm, wm_mm, seats, overrideBar) {
  var L = (parseFloat(lm_mm) || 7000) / 1000.0;
  var W = (parseFloat(wm_mm) || 5000) / 1000.0;
  var seatsCount = parseInt(seats) || 8;

  // Determine auto recommendation based on room geometry and capacity
  var autoBar = 'none';
  var autoName = 'None (Discrete AV)';
  var autoDesc = 'Discrete PTZ Camera, Ceiling Speakers & Mic Array';
  var autoPrice = 0;
  var autoIcon = 'fa-ban';
  var badgeBg = '#64748b';

  if (seatsCount <= 5 && L <= 4.5) {
    autoBar = 'compact';
    autoName = 'Compact 4K ePTZ Bar';
    autoDesc = '120° 4K ePTZ + 4.5m 6-Mic Array + 10W Stereo Spk';
    autoPrice = 99000;
    autoIcon = 'fa-cube';
    badgeBg = '#0d9488';
  } else if (seatsCount <= 10 && L <= 6.5) {
    autoBar = 'mid';
    autoName = 'Mid-Size AI Video Bar';
    autoDesc = '90° 4K PTZ + 6m Steerable Mic + Dual Woofers';
    autoPrice = 198000;
    autoIcon = 'fa-cube';
    badgeBg = '#0284c7';
  } else if (seatsCount <= 16 && L <= 9.0) {
    autoBar = 'large';
    autoName = 'Large Dual-Cam Bar';
    autoDesc = 'Dual 4K Sensors (120° + 70°) + 8m Mic + Subwoofer';
    autoPrice = 315000;
    autoIcon = 'fa-layer-group';
    badgeBg = '#7c3aed';
  } else {
    // For large venues or auditoriums, discrete component AV is recommended
    autoBar = 'none';
    autoName = 'None (Discrete AV)';
    autoDesc = 'Discrete PTZ Cameras & Ceiling Tile Array Recommended';
    autoPrice = 0;
    autoIcon = 'fa-diagram-project';
    badgeBg = '#475569';
  }

  var selected = overrideBar || 'auto';
  var activeBar = selected === 'auto' ? autoBar : selected;
  var name = autoName;
  var desc = autoDesc;
  var price = autoPrice;
  var icon = autoIcon;
  var bg = badgeBg;

  // Triad Engineering Specifications: Camera, Speaker & Microphone
  var camMaxReach = 6.5;
  var camHfov = '90° (3x PTZ)';
  var spkMaxThrow = 6.5;
  var spkPowerDesc = '30W Stereo (90 dB SPL @ 1m)';
  var micMaxReach = 6.0;
  var micDesc = '6–8 Element Steerable Array';

  if (selected === 'compact' || activeBar === 'compact') {
    name = 'Compact 4K ePTZ Bar';
    desc = '120° 4K ePTZ + 4.5m 6-Mic Array + 10W Stereo';
    price = 99000;
    icon = 'fa-cube';
    bg = '#0d9488';
    camMaxReach = 4.5; camHfov = '120° ePTZ';
    spkMaxThrow = 4.5; spkPowerDesc = '10W Stereo (86 dB SPL @ 1m)';
    micMaxReach = 4.5; micDesc = '6-Element MEMS Array';
  } else if (selected === 'mid' || activeBar === 'mid') {
    name = 'Mid-Size AI Video Bar';
    desc = '90° 4K PTZ + 6m Steerable Mic + Dual Woofers';
    price = 198000;
    icon = 'fa-cube';
    bg = '#0284c7';
    camMaxReach = 6.5; camHfov = '90° (3x–5x PTZ)';
    spkMaxThrow = 6.5; spkPowerDesc = '30W Stereo (90 dB SPL @ 1m)';
    micMaxReach = 6.0; micDesc = '6–8 Element Steerable Array';
  } else if (selected === 'large' || activeBar === 'large') {
    name = 'Large Dual-Cam Bar';
    desc = 'Dual 4K Sensors (120° + 70°) + 8m Mic + Subwoofer';
    price = 315000;
    icon = 'fa-layer-group';
    bg = '#7c3aed';
    camMaxReach = 9.0; camHfov = 'Dual 120° + 70° (10x Zoom)';
    spkMaxThrow = 9.0; spkPowerDesc = '40W Stereo + Subwoofer (94 dB SPL @ 1m)';
    micMaxReach = 8.0; micDesc = '8-Element Multi-Beam Tracking';
  } else if (selected === 'exec' || activeBar === 'exec') {
    name = 'Executive Dual-Screen Bar';
    desc = 'Dual Displays + Multi-Stream AI Tiles + 10m Mics';
    price = 430000;
    icon = 'fa-crown';
    bg = '#d97706';
    camMaxReach = 11.0; camHfov = 'Dual 4K Directors (15x Zoom)';
    spkMaxThrow = 11.0; spkPowerDesc = '60W Dual Subwoofers (98 dB SPL @ 1m)';
    micMaxReach = 10.0; micDesc = '12-Element Line Array';
  } else if (selected === 'none' || activeBar === 'none') {
    name = 'None (Discrete AV)';
    desc = 'No Video Bar &bull; Using Discrete Cam, Spk & Mics';
    price = 0;
    icon = 'fa-ban';
    bg = '#64748b';
    camMaxReach = 0; camHfov = 'N/A';
    spkMaxThrow = 0; spkPowerDesc = 'N/A';
    micMaxReach = 0; micDesc = 'N/A';
  }

  var isBarActive = activeBar !== 'none';
  var camPass = (L <= camMaxReach);
  var spkPass = (L <= spkMaxThrow);
  var micPass = (L <= micMaxReach);
  var extMicsNeeded = (!micPass && isBarActive) ? Math.ceil((L - micMaxReach) / 2.2) : 0;

  return {
    selected: selected,
    activeBar: activeBar,
    isBarActive: isBarActive,
    autoBar: autoBar,
    autoName: autoName,
    autoDesc: autoDesc,
    name: name,
    desc: desc,
    price: price,
    icon: icon,
    badgeBg: bg,
    camMaxReach: camMaxReach,
    camHfov: camHfov,
    camPass: camPass,
    spkMaxThrow: spkMaxThrow,
    spkPowerDesc: spkPowerDesc,
    spkPass: spkPass,
    micMaxReach: micMaxReach,
    micDesc: micDesc,
    micPass: micPass,
    extMicsNeeded: extMicsNeeded
  };
}

// ==========================================
// HARDWARE DEVICE PRICING PRESETS & RATE CARD ENGINE (INR - ₹)
// Standard Indian commercial enterprise MSRP pricing derived from Tier-1 manufacturers:
// Cisco, Logitech, Poly/HP, Shure, Sennheiser, Q-SYS, Biamp, JBL Pro & Extron
// ==========================================
const DEFAULT_DEVICE_PRICING = {
  // 1. All-in-One Video Bars
  compactBar: 99000,
  midBar: 198000,
  largeBar: 315000,
  execBar: 430000,
  // 2. Discrete PTZ Cameras
  cam120: 78000,
  cam85: 135000,
  cam72: 198000,
  cam60: 315000,
  camDual: 395000,
  cam360: 105000,
  // 3. Ceiling Loudspeakers (Unit Costs)
  spk25: 9800,
  spk30: 11500,
  spk40: 13200,
  spk525: 15600,
  spk65: 19800,
  spk80: 28500,
  spk100: 39000,
  spk120: 54000,
  spkPendant65: 31000,
  spkPendant80: 38000,
  spkAmpBudget: 28000,
  // 4. Microphones
  micCeilingArray: 265000,
  micTableBoundary: 28500,
  micTableGooseneck: 36500,
  micPendant: 49000
};

function getDevicePricingRates() {
  try {
    var stored = localStorage.getItem('proav_device_pricing_rates_inr');
    if (stored) {
      return Object.assign({}, DEFAULT_DEVICE_PRICING, JSON.parse(stored));
    }
  } catch(e) {}
  return Object.assign({}, DEFAULT_DEVICE_PRICING);
}

function saveDevicePricingRates(rates) {
  try {
    localStorage.setItem('proav_device_pricing_rates_inr', JSON.stringify(rates));
  } catch(e) {}
}

// Format Indian Rupee Currency helper (₹ Indian Numbering System)
function formatINR(amount) {
  var val = Math.round(Number(amount) || 0);
  return '₹' + val.toLocaleString('en-IN');
}

// 5. ESTIMATED HARDWARE BUDGET CALCULATION ENGINE (INR - ₹)
// Supports individual device exclusion (setting quantity to 0) directly in the table
function calculateRoomHardwareBudget(trOrData) {
  if (!trOrData) return { roomCost: 0, totalForQty: 0, qty: 1, roomCostStr: '₹0', totalForQtyStr: '₹0', breakdown: { videoBar:0, barName:'None', speakers:0, spkModel:'None', camera:0, camModel:'None', microphones:0, micModel:'None', spkCount:0, spkUnitPrice:0, isBarExcluded:true, isCamExcluded:true, isSpkExcluded:true, isMicExcluded:true } };

  var rates = getDevicePricingRates();
  var isTr = trOrData && trOrData.nodeType === 1;

  var qty = isTr ? (parseInt(trOrData.querySelector('.inp-qty')?.value) || 1) : (parseInt(trOrData.qty) || 1);
  var seats = isTr ? (parseInt(trOrData.querySelector('.inp-seats')?.value) || 10) : (parseInt(trOrData.seats) || 10);
  var lm = isTr ? (parseFloat(trOrData.querySelector('.inp-lm')?.value) || 7000) : (parseFloat(trOrData.l) || 7000);
  var wm = isTr ? (parseFloat(trOrData.querySelector('.inp-wm')?.value) || 5000) : (parseFloat(trOrData.w) || 5000);
  var hm = isTr ? (parseFloat(trOrData.querySelector('.inp-hm')?.value) || 2700) : (parseFloat(trOrData.h) || 2700);

  // Subsystem exclusion / quantity controls
  var dispQty = isTr ? (trOrData.querySelector('.inp-disp-qty') ? parseInt(trOrData.querySelector('.inp-disp-qty').value) : 1) : (trOrData.dispQty !== undefined ? parseInt(trOrData.dispQty) : 1);
  var isDispExcluded = dispQty === 0;

  var videoBarType = isTr ? (trOrData.querySelector('.inp-video-bar')?.value || 'auto') : (trOrData.videoBar || 'auto');
  var barQty = isTr ? (trOrData.querySelector('.inp-bar-qty') ? parseInt(trOrData.querySelector('.inp-bar-qty').value) : (videoBarType === 'none' ? 0 : 1)) : (trOrData.barQty !== undefined ? parseInt(trOrData.barQty) : (videoBarType === 'none' ? 0 : 1));
  if (isNaN(barQty) || barQty < 0) barQty = 0;
  var isBarExcluded = (videoBarType === 'none' || barQty === 0);

  var camModel = isTr ? (trOrData.querySelector('.inp-cam-model')?.value || 'auto') : (trOrData.camModel || 'auto');
  var camQty = isTr ? (trOrData.querySelector('.inp-cam-qty') ? parseInt(trOrData.querySelector('.inp-cam-qty').value) : (camModel === 'none' ? 0 : 1)) : (trOrData.camQty !== undefined ? parseInt(trOrData.camQty) : (camModel === 'none' ? 0 : 1));
  if (isNaN(camQty) || camQty < 0) camQty = 0;
  var isCamExcluded = (camModel === 'none' || camQty === 0);

  var spkSize = isTr ? (trOrData.querySelector('.inp-spk-size')?.value || '6.5"') : (trOrData.spkSize || '6.5"');
  var spkCalc = calculateCeilingSpeakers(lm, wm, hm, spkSize);
  var spkQtyRaw = isTr ? (trOrData.querySelector('.inp-spk-qty') ? parseInt(trOrData.querySelector('.inp-spk-qty').value) : spkCalc.count) : (trOrData.spkQty !== undefined ? parseInt(trOrData.spkQty) : spkCalc.count);
  var spkQty = isNaN(spkQtyRaw) ? spkCalc.count : spkQtyRaw;
  var isSpkExcluded = (spkSize === 'none' || spkQty === 0);

  var micType = isTr ? (trOrData.querySelector('.inp-mic-type')?.value || 'auto') : (trOrData.micType || 'auto');
  var micCalc = calculateMicrophones(lm, wm, seats, micType);
  var micQtyRaw = isTr ? (trOrData.querySelector('.inp-mic-qty') ? parseInt(trOrData.querySelector('.inp-mic-qty').value) : micCalc.qty) : (trOrData.micQty !== undefined ? parseInt(trOrData.micQty) : micCalc.qty);
  var micQty = isNaN(micQtyRaw) ? micCalc.qty : micQtyRaw;
  var isMicExcluded = (micType === 'none' || micQty === 0);

  var camD1 = isTr ? trOrData.querySelector('.inp-cam-d1')?.value : trOrData.camD1;
  var camWspan = isTr ? trOrData.querySelector('.inp-cam-wspan')?.value : trOrData.camWspan;
  var camZoomFactor = isTr ? (parseFloat(trOrData.querySelector('.inp-cam-zoom-num')?.value) || 12) : (trOrData.camZoomFactor || 12);

  var barCalc = calculateVideoBar(lm, wm, seats, videoBarType);
  var camCalc = calculateCameraHFOV(lm, wm, camD1, camWspan, camModel, camZoomFactor);

  // 1. Video Bar Hardware Cost (INR)
  var barCost = 0;
  var barName = '0 - None (Discrete / Excluded)';
  if (!isBarExcluded && barCalc.isBarActive) {
    var barUnitPrice = rates.midBar;
    if (barCalc.activeBar === 'compact') barUnitPrice = rates.compactBar;
    else if (barCalc.activeBar === 'mid') barUnitPrice = rates.midBar;
    else if (barCalc.activeBar === 'large') barUnitPrice = rates.largeBar;
    else if (barCalc.activeBar === 'exec') barUnitPrice = rates.execBar;
    barCost = barQty * barUnitPrice;
    barName = `${barCalc.name} (${barQty} Unit${barQty > 1 ? 's' : ''})`;
  }

  // 2. Camera Hardware Cost (INR)
  var camCost = 0;
  var camModelName = '0 - None (Camera Excluded)';
  if (isCamExcluded) {
    camCost = 0;
    camModelName = '0 - None (Camera Excluded)';
  } else if (!isBarExcluded && barCalc.isBarActive) {
    camCost = 0; // Camera is integrated inside all-in-one video bar
    camModelName = 'Built-in Video Bar Lens (Integrated)';
  } else {
    var activeCam = camCalc.selectedModel || '';
    var camUnitPrice = rates.cam72;
    if (activeCam.includes('120° Wide ePTZ')) camUnitPrice = rates.cam120;
    else if (activeCam.includes('85° PTZ')) camUnitPrice = rates.cam85;
    else if (activeCam.includes('72° PTZ')) camUnitPrice = rates.cam72;
    else if (activeCam.includes('60° PTZ')) camUnitPrice = rates.cam60;
    else if (activeCam.includes('Dual-Eye')) camUnitPrice = rates.camDual;
    else if (activeCam.includes('360°')) camUnitPrice = rates.cam360;
    camCost = camQty * camUnitPrice;
    camModelName = `${camCalc.selectedModel} (${camQty} Unit${camQty > 1 ? 's' : ''})`;
  }

  // 3. Speaker Hardware Cost (INR)
  var spkCost = 0;
  var spkModelName = '0 - None (Speakers Excluded)';
  var spkUnitPrice = rates.spk65;
  if (spkSize.includes('2.5"')) spkUnitPrice = rates.spk25;
  else if (spkSize.includes('3"')) spkUnitPrice = rates.spk30;
  else if (spkSize.includes('4"')) spkUnitPrice = rates.spk40;
  else if (spkSize.includes('5.25"')) spkUnitPrice = rates.spk525;
  else if (spkSize.includes('6.5"')) spkUnitPrice = rates.spk65;
  else if (spkSize.includes('8"')) spkUnitPrice = rates.spk80;
  else if (spkSize.includes('10"')) spkUnitPrice = rates.spk100;
  else if (spkSize.includes('12"')) spkUnitPrice = rates.spk120;
  else if (spkSize.includes('pendant_8')) spkUnitPrice = rates.spkPendant80;
  else if (spkSize.includes('pendant')) spkUnitPrice = rates.spkPendant65;

  if (isSpkExcluded) {
    spkCost = 0;
    spkModelName = '0 - None (Speakers Excluded)';
  } else if (!isBarExcluded && barCalc.isBarActive && seats <= 6) {
    spkCost = 0; // Built-in bar speakers handle small rooms
    spkModelName = 'Built-in Video Bar Stereo Loudspeakers (Integrated)';
  } else {
    spkCost = (spkQty * spkUnitPrice) + (spkQty > 0 ? rates.spkAmpBudget : 0);
    spkModelName = `${spkSize} Loudspeakers (${spkQty} Units)`;
  }

  // 4. Microphone Hardware Cost (INR)
  var micCost = 0;
  var micModelName = '0 - None (Microphones Excluded)';
  if (isMicExcluded) {
    micCost = 0;
    micModelName = '0 - None (Microphones Excluded)';
  } else if (!isBarExcluded && barCalc.isBarActive && (micType === 'auto' || micType === 'bar_builtin')) {
    micCost = 0; // Built into video bar
    micModelName = 'Integrated Video Bar Beamforming Array (Integrated)';
  } else {
    var micUnitRate = rates.micTableBoundary;
    if (micCalc.type === 'ceiling_array') micUnitRate = rates.micCeilingArray;
    else if (micCalc.type === 'table_boundary') micUnitRate = rates.micTableBoundary;
    else if (micCalc.type === 'table_gooseneck') micUnitRate = rates.micTableGooseneck;
    else if (micCalc.type === 'pendant_mic') micUnitRate = rates.micPendant;

    if (micCalc.type === 'table_gooseneck') {
      micCost = seats * micUnitRate;
      micModelName = `${seats} × Table Goosenecks`;
    } else {
      micCost = micQty * micUnitRate;
      micModelName = `${micCalc.displayDesc} (${micQty} Unit${micQty > 1 ? 's' : ''})`;
    }
  }

  // Total Room Hardware Cost (INR) strictly summing only active devices
  var roomCost = barCost + spkCost + camCost + micCost;
  var totalForQty = roomCost * qty;

  return {
    roomCost: roomCost,
    totalForQty: totalForQty,
    qty: qty,
    breakdown: {
      videoBar: barCost,
      barName: barName,
      isBarExcluded: isBarExcluded,
      barQty: isBarExcluded ? 0 : barQty,

      camera: camCost,
      camModel: camModelName,
      isCamExcluded: isCamExcluded,
      camQty: isCamExcluded ? 0 : camQty,

      speakers: spkCost,
      spkModel: spkModelName,
      isSpkExcluded: isSpkExcluded,
      spkCount: isSpkExcluded ? 0 : spkQty,
      spkUnitPrice: spkUnitPrice,

      microphones: micCost,
      micModel: micModelName,
      isMicExcluded: isMicExcluded,
      micQty: isMicExcluded ? 0 : micQty,

      isDispExcluded: isDispExcluded,
      dispQty: dispQty
    },
    roomCostStr: formatINR(roomCost),
    totalForQtyStr: formatINR(totalForQty)
  };
}

// ==========================================
// 6. POWER SOCKETS & LAN REQUIREMENTS ENGINE
// Sockets counted in 3 locations:
// 1. Behind the Display
// 2. On the Table
// 3. On the Wall
// Formula: Devices placed in location + 1 EXTRA convenience socket
// LAN: Default 1 on Wall and 1 on Table + IP endpoints
// 15A Validator: Alerts if combined branch load exceeds 15A (or 12A 80% threshold)
// ==========================================
function calculateRoomPowerAndLan(trOrData) {
  if (!trOrData) {
    return {
      behindDisplay: { devices: 0, totalSockets: 0, sockets5A: 0, sockets15A: 0, watts: 0, amps: 0 },
      onTable: { devices: 0, totalSockets: 0, sockets5A: 0, sockets15A: 0, watts: 0, amps: 0 },
      onWall: { devices: 0, totalSockets: 0, sockets5A: 0, sockets15A: 0, watts: 0, amps: 0 },
      totalSockets: 0, total5A: 0, total15A: 0,
      lan: { total: 2, display: 0, table: 1, wall: 1 },
      validator: { status: 'ok', badgeClass: 'bg-success', icon: 'fa-check-double', text: 'Circuit OK', maxAmps: 0, isOverloaded: false, isHighLoad: false }
    };
  }

  var isTr = trOrData && trOrData.nodeType === 1;

  var qty = isTr ? (parseInt(trOrData.querySelector('.inp-qty')?.value) || 1) : (parseInt(trOrData.qty) || 1);
  var seatsCount = isTr ? (parseInt(trOrData.querySelector('.inp-seats')?.value) || 10) : (parseInt(trOrData.seats) || 10);
  var lm = isTr ? (parseFloat(trOrData.querySelector('.inp-lm')?.value) || 7000) : (parseFloat(trOrData.l) || 7000);
  var wm = isTr ? (parseFloat(trOrData.querySelector('.inp-wm')?.value) || 5000) : (parseFloat(trOrData.w) || 5000);
  var hm = isTr ? (parseFloat(trOrData.querySelector('.inp-hm')?.value) || 2700) : (parseFloat(trOrData.h) || 2700);
  var purpose = isTr ? (trOrData.querySelector('.inp-purpose')?.value || 'meeting') : (trOrData.purpose || 'meeting');
  var pitch = isTr ? (parseFloat(trOrData.querySelector('.inp-pitch')?.value) || 1.25) : (parseFloat(trOrData.pitch) || 1.25);

  var dispQty = isTr ? (trOrData.querySelector('.inp-disp-qty') ? parseInt(trOrData.querySelector('.inp-disp-qty').value) : 1) : (trOrData.dispQty !== undefined ? parseInt(trOrData.dispQty) : 1);
  var dispCalc = calculateDisplayForPurpose(lm, purpose, pitch);

  var spkSize = isTr ? (trOrData.querySelector('.inp-spk-size')?.value || '6.5"') : (trOrData.spkSize || '6.5"');
  var spkPos = isTr ? (trOrData.querySelector('.inp-spk-pos')?.value || 'ceiling') : (trOrData.spkPos || 'ceiling');
  var spkCalc = calculateCeilingSpeakers(lm, wm, hm, spkSize);
  var spkQty = isTr ? (trOrData.querySelector('.inp-spk-qty') ? parseInt(trOrData.querySelector('.inp-spk-qty').value) : spkCalc.count) : (trOrData.spkQty !== undefined ? parseInt(trOrData.spkQty) : spkCalc.count);
  if (spkSize === 'none') spkQty = 0;

  var camModel = isTr ? (trOrData.querySelector('.inp-cam-model')?.value || 'auto') : (trOrData.camModel || 'auto');
  var camPos = isTr ? (trOrData.querySelector('.inp-cam-pos')?.value || 'above') : (trOrData.camPos || 'above');
  var camQty = isTr ? (trOrData.querySelector('.inp-cam-qty') ? parseInt(trOrData.querySelector('.inp-cam-qty').value) : 1) : (trOrData.camQty !== undefined ? parseInt(trOrData.camQty) : 1);
  if (camModel === 'none') camQty = 0;

  var videoBar = isTr ? (trOrData.querySelector('.inp-video-bar')?.value || 'auto') : (trOrData.videoBar || 'auto');
  var barPos = isTr ? (trOrData.querySelector('.inp-bar-pos')?.value || 'below') : (trOrData.barPos || 'below');
  var barQty = isTr ? (trOrData.querySelector('.inp-bar-qty') ? parseInt(trOrData.querySelector('.inp-bar-qty').value) : (videoBar === 'none' ? 0 : 1)) : (trOrData.barQty !== undefined ? parseInt(trOrData.barQty) : (videoBar === 'none' ? 0 : 1));
  if (videoBar === 'none') barQty = 0;

  var micType = isTr ? (trOrData.querySelector('.inp-mic-type')?.value || 'auto') : (trOrData.micType || 'auto');
  var micPos = isTr ? (trOrData.querySelector('.inp-mic-pos')?.value || (seatsCount <= 6 ? 'table' : 'ceiling')) : (trOrData.micPos || (seatsCount <= 6 ? 'table' : 'ceiling'));
  var micCalc = calculateMicrophones(lm, wm, seatsCount, micType);
  var micQty = isTr ? (trOrData.querySelector('.inp-mic-qty') ? parseInt(trOrData.querySelector('.inp-mic-qty').value) : micCalc.qty) : (trOrData.micQty !== undefined ? parseInt(trOrData.micQty) : micCalc.qty);
  if (micType === 'none') micQty = 0;

  // 1. BEHIND THE DISPLAY (Display Wall)
  var dispDevices = 0;
  var dispWatts = 0;
  var disp15ACount = 0;
  var disp5ACount = 0;

  if (dispQty > 0) {
    dispDevices += dispQty;
    if (purpose === 'videowall') {
      var w_m = (dispCalc.w_mm || 3000) / 1000.0;
      var h_m = (dispCalc.h_mm || 1700) / 1000.0;
      var ledArea = Math.max(1.2, w_m * h_m);
      var ledWatts = Math.round(ledArea * 480);
      dispWatts += ledWatts;
      var ledCircuits = Math.max(1, Math.ceil(ledWatts / 2500));
      disp15ACount += ledCircuits;
    } else {
      var diag = dispCalc.diagIn || 85;
      var pwr = diag >= 98 ? 480 : (diag >= 75 ? 320 : (diag >= 55 ? 160 : 110));
      dispWatts += (pwr * dispQty);
      if (diag >= 75) {
        disp15ACount += dispQty;
      } else {
        disp5ACount += dispQty;
      }
    }
    // Behind-display presentation switcher / media player
    dispDevices += 1;
    dispWatts += 65;
    disp5ACount += 1;
  }

  // Video bar on display wall?
  if (barQty > 0 && (barPos === 'below' || barPos === 'above' || barPos === 'display_wall' || barPos === 'wall')) {
    dispDevices += barQty;
    dispWatts += (barQty * 60);
    disp5ACount += barQty;
  }

  // Camera on display wall?
  if (camQty > 0 && (camPos === 'above' || camPos === 'below' || camPos === 'left' || camPos === 'right' || camPos === 'both_lr' || camPos === 'above_and_opposite' || camPos === 'display_wall')) {
    var cCount = (camPos === 'both_lr' || camPos === 'above_and_opposite') ? Math.min(camQty, 2) : 1;
    dispDevices += cCount;
    dispWatts += (cCount * 25);
    disp5ACount += cCount;
  }

  // Speakers on display wall?
  if (spkQty > 0 && (spkPos === 'top' || spkPos === 'bottom' || spkPos === 'left' || spkPos === 'right' || spkPos === 'left_right' || spkPos === 'display_wall')) {
    dispDevices += 1;
    dispWatts += 180;
    disp5ACount += 1;
  }

  // Microphones on display wall?
  if (micQty > 0 && (micPos === 'top' || micPos === 'bottom' || micPos === 'left' || micPos === 'right' || micPos === 'left_right' || micPos === 'display_wall')) {
    dispDevices += 1;
    dispWatts += 15;
    disp5ACount += 1;
  }

  // Formula: Count of devices + 1 Extra power socket (5A convenience outlet)
  var behindDisplaySockets = dispDevices > 0 ? (dispDevices + 1) : 0;
  if (dispDevices > 0) disp5ACount += 1;

  // 2. ON THE TABLE
  var tableDevices = 0;
  var tableWatts = 0;
  var table5ACount = 0;
  var table15ACount = 0;

  // BYOD retractor box / laptop chargers
  tableDevices += 1;
  var chargersWatt = Math.min(6, Math.max(2, Math.round(seatsCount / 2))) * 65;
  tableWatts += (chargersWatt + 40);
  table5ACount += 1;

  // Table Touch Controller
  tableDevices += 1;
  tableWatts += 20;
  table5ACount += 1;

  // Video bar on table?
  if (barQty > 0 && barPos === 'table') {
    tableDevices += barQty;
    tableWatts += (barQty * 50);
    table5ACount += barQty;
  }

  // Camera on table?
  if (camQty > 0 && (camPos === 'table' || camModel === '360° Tabletop Center')) {
    tableDevices += 1;
    tableWatts += 30;
    table5ACount += 1;
  }

  // Microphones on table?
  if (micQty > 0 && (micPos === 'table' || micPos === 'table_and_opposite' || micType === 'table_boundary' || micType === 'table_gooseneck')) {
    tableDevices += 1;
    tableWatts += 25;
    table5ACount += 1;
  }

  // Speakers on table?
  if (spkQty > 0 && spkPos === 'table') {
    tableDevices += 1;
    tableWatts += 45;
    table5ACount += 1;
  }

  // Formula: Count of devices + 1 Extra power socket (5A convenience outlet)
  var onTableSockets = tableDevices + 1;
  table5ACount += 1;

  // 3. ON THE WALL (Peripheral Walls)
  var wallDevices = 0;
  var wallWatts = 0;
  var wall5ACount = 0;
  var wall15ACount = 0;

  // Camera on peripheral wall?
  if (camQty > 0 && (camPos === 'opposite' || camPos === 'above_and_opposite' || camPos === 'wall')) {
    wallDevices += 1;
    wallWatts += 25;
    wall5ACount += 1;
  }

  // Speakers on peripheral wall?
  if (spkQty > 0 && (spkPos === 'opposite' || spkPos === 'surround' || spkPos === 'wall')) {
    wallDevices += 1;
    wallWatts += 150;
    wall5ACount += 1;
  }

  // Microphones on peripheral wall?
  if (micQty > 0 && (micPos === 'opposite' || micPos === 'wall')) {
    wallDevices += 1;
    wallWatts += 15;
    wall5ACount += 1;
  }

  // Video Bar on peripheral wall?
  if (barQty > 0 && barPos === 'wall' && dispDevices === 0) {
    wallDevices += barQty;
    wallWatts += (barQty * 60);
    wall5ACount += barQty;
  }

  // Formula: Count of devices + 1 Extra power socket (5A convenience outlet)
  var onWallSockets = wallDevices + 1;
  wall5ACount += 1;

  var totalSockets = behindDisplaySockets + onTableSockets + onWallSockets;
  var total5A = disp5ACount + table5ACount + wall5ACount;
  var total15A = disp15ACount + table15ACount + wall15ACount;

  // LAN REQUIREMENTS (Default 1 on Wall and 1 on Table + IP endpoints)
  var lanWall = 1;
  var lanTable = 1;
  var lanDisplay = 0;

  if (dispQty > 0) lanDisplay += 1; // Display SoC / IP Signage
  if (barQty > 0) {
    if (barPos === 'table') lanTable += 1;
    else lanDisplay += 1;
  }
  if (camQty > 0) {
    if (camPos === 'table' || camModel === '360° Tabletop Center') lanTable += 1;
    else if (camPos === 'opposite' || camPos === 'wall') lanWall += 1;
    else lanDisplay += 1;
  }
  if (micQty > 0 && micType === 'ceiling_array') lanWall += 1; // Dante ceiling mic bridge
  lanTable += 1; // Touch panel PoE

  var totalLan = lanDisplay + lanTable + lanWall;

  // 15A CIRCUIT POWER REQUIREMENTS VALIDATOR (Commercial 230V circuits)
  var dispAmps = parseFloat((dispWatts / 230).toFixed(2));
  var tableAmps = parseFloat((tableWatts / 230).toFixed(2));
  var wallAmps = parseFloat((wallWatts / 230).toFixed(2));
  var maxCircuitAmps = Math.max(dispAmps, tableAmps, wallAmps);

  var isOverloaded = maxCircuitAmps > 15.0;
  var isHighLoad = maxCircuitAmps > 12.0 && maxCircuitAmps <= 15.0;

  var validatorStatus = 'ok';
  var validatorBadgeClass = 'bg-success text-white';
  var validatorIcon = 'fa-check-double';
  var validatorText = '';

  if (isOverloaded) {
    validatorStatus = 'overload';
    validatorBadgeClass = 'bg-danger text-white';
    validatorIcon = 'fa-triangle-exclamation';
    var loc = dispAmps > 15.0 ? 'Display Wall' : (tableAmps > 15.0 ? 'Table' : 'Wall');
    validatorText = `⚠️ Overload (${maxCircuitAmps.toFixed(1)}A > 15A limit): Split ${loc} into 2 Dedicated 15A Circuits!`;
  } else if (isHighLoad) {
    validatorStatus = 'warning';
    validatorBadgeClass = 'bg-warning text-dark';
    validatorIcon = 'fa-triangle-exclamation';
    validatorText = `⚠️ High Load (${maxCircuitAmps.toFixed(1)}A): Exceeds 80% continuous threshold (12A). Recommend dual circuits.`;
  } else {
    validatorStatus = 'ok';
    validatorBadgeClass = 'bg-success text-white';
    validatorIcon = 'fa-check-double';
    validatorText = `✓ Circuit OK: Max branch load ${maxCircuitAmps.toFixed(1)}A (<15A Capacity).`;
  }

  return {
    behindDisplay: { devices: dispDevices, totalSockets: behindDisplaySockets, sockets5A: disp5ACount, sockets15A: disp15ACount, watts: dispWatts, amps: dispAmps },
    onTable: { devices: tableDevices, totalSockets: onTableSockets, sockets5A: table5ACount, sockets15A: table15ACount, watts: tableWatts, amps: tableAmps },
    onWall: { devices: wallDevices, totalSockets: onWallSockets, sockets5A: wall5ACount, sockets15A: wall15ACount, watts: wallWatts, amps: wallAmps },
    totalSockets: totalSockets,
    total5A: total5A,
    total15A: total15A,
    lan: { total: totalLan, display: lanDisplay, table: lanTable, wall: lanWall },
    validator: { status: validatorStatus, badgeClass: validatorBadgeClass, icon: validatorIcon, text: validatorText, maxAmps: maxCircuitAmps, isOverloaded: isOverloaded, isHighLoad: isHighLoad }
  };
}

function renderSocketsCellHtml(pwr) {
  return `
    <div class="p-1 rounded text-center mb-1 socket-pulse-target" style="background:#f0fdf4; border:1px solid #86efac;">
      <div class="d-flex align-items-center justify-content-between px-1 mb-1">
        <span class="badge bg-emerald-700 text-white" style="font-size:0.60rem;"><i class="fa-solid fa-plug me-1"></i>Sockets</span>
        <strong class="text-emerald-800 font-mono" style="font-size:0.80rem;">${pwr.totalSockets} Plugs</strong>
      </div>
      <div class="p-1 rounded bg-white border border-emerald-200 text-start font-mono" style="font-size:0.58rem; line-height:1.25; color:#1e293b;">
        <div>&bull; <strong>Behind Disp:</strong> ${pwr.behindDisplay.totalSockets} (${pwr.behindDisplay.devices} dev + 1 ex)${pwr.behindDisplay.sockets15A > 0 ? ` <span class="badge bg-amber-600 text-white p-0.5" style="font-size:0.52rem;">${pwr.behindDisplay.sockets15A}x 15A</span>` : ''}</div>
        <div>&bull; <strong>On Table:</strong> ${pwr.onTable.totalSockets} (${pwr.onTable.devices} dev + 1 ex)</div>
        <div>&bull; <strong>On Wall:</strong> ${pwr.onWall.totalSockets} (${pwr.onWall.devices} dev + 1 ex)</div>
      </div>
      <div class="d-flex justify-content-between align-items-center mt-1 px-1">
        <span class="badge bg-emerald-100 text-emerald-900 border" style="font-size:0.56rem;">${pwr.total5A} × 5A</span>
        <span class="badge bg-amber-100 text-amber-900 border" style="font-size:0.56rem;">${pwr.total15A} × 15A</span>
      </div>
    </div>
  `;
}

function renderLanCellHtml(pwr) {
  return `
    <div class="p-1 rounded text-center mb-1 socket-pulse-target" style="background:#eff6ff; border:1px solid #93c5fd;">
      <div class="d-flex align-items-center justify-content-between px-1 mb-1">
        <span class="badge bg-blue-700 text-white" style="font-size:0.60rem;"><i class="fa-solid fa-network-wired me-1"></i>LAN (RJ45)</span>
        <strong class="text-blue-800 font-mono" style="font-size:0.80rem;">${pwr.lan.total} Ports</strong>
      </div>
      <div class="p-1 rounded bg-white border border-blue-200 text-start font-mono" style="font-size:0.58rem; line-height:1.25; color:#1e293b;">
        <div>&bull; <strong>Disp Wall:</strong> ${pwr.lan.display} RJ45</div>
        <div>&bull; <strong>On Table:</strong> ${pwr.lan.table} RJ45 <span class="text-muted">(1 def + dev)</span></div>
        <div>&bull; <strong>On Wall:</strong> ${pwr.lan.wall} RJ45 <span class="text-muted">(1 def + dev)</span></div>
      </div>
      <div class="text-center mt-1">
        <span class="badge bg-blue-100 text-blue-900 border font-mono" style="font-size:0.56rem;">Cat6A Shielded S/FTP</span>
      </div>
    </div>
  `;
}

function renderPowerCellHtml(pwr) {
  var v = pwr.validator;
  return `
    <div class="p-1 rounded text-center mb-1 socket-pulse-target" style="background:${v.isOverloaded ? '#fef2f2' : (v.isHighLoad ? '#fffbeb' : '#f8fafc')}; border:1px solid ${v.isOverloaded ? '#f87171' : (v.isHighLoad ? '#fcd34d' : '#cbd5e1')};">
      <div class="d-flex align-items-center justify-content-between px-1 mb-1">
        <span class="badge ${v.badgeClass} font-mono" style="font-size:0.60rem;"><i class="fa-solid ${v.icon} me-1"></i>${v.maxAmps}A Load</span>
        <span class="badge bg-secondary text-white" style="font-size:0.56rem;">15A Circuit</span>
      </div>
      <div class="badge ${v.badgeClass} text-wrap text-start w-100 p-1 mb-1 shadow-xs" style="font-size:0.58rem; line-height:1.2;" title="${v.text}">
        ${v.text}
      </div>
      <div class="d-flex justify-content-between text-muted font-mono px-1" style="font-size:0.54rem;">
        <span>Disp: ${pwr.behindDisplay.amps}A</span>
        <span>Table: ${pwr.onTable.amps}A</span>
        <span>Wall: ${pwr.onWall.amps}A</span>
      </div>
    </div>
  `;
}

function addRoomRowWithData(data) {
  roomRowsCount++;
  const tbody = document.getElementById('matrixTableBody');
  if (!tbody) return;

  var floorPal = getFloorPalette(data.floor);
  var purpPal = getRoomPurposePalette(data.purpose);
  var rowColorHex = rgbToHex(data.color && data.color !== '#ffffff' ? data.color : floorPal.bgLight);
  const rowIdx = roomRowsCount;
  var tr = document.createElement('tr');
  tr.className = 'matrix-room-row';
  tr.style.cursor = 'pointer';
  tr.style.backgroundColor = rowColorHex;
  tr.style.borderLeft = `5px solid ${floorPal.badgeBg}`;
  tr.setAttribute('data-floor', data.floor || '01');
  tr.onclick = function(e) {
    selectMatrixRoomFor3D(this);
  };
  tr.addEventListener('focusin', function() {
    selectMatrixRoomFor3D(this);
  });

  var wFt = (data.w / 304.8).toFixed(1);
  var lFt = (data.l / 304.8).toFixed(1);
  var hFt = (data.h / 304.8).toFixed(1);
  var sqm = (data.w * data.l) / 1e6;

  var purpose = data.purpose || 'meeting';
  var pitch = data.pitch || 1.25;

  var dispCalc = calculateDisplayForPurpose(data.l, purpose, pitch);

  // Speech RT60 Calculation (Standard Target 0.45 - 0.60s)
  var l_m = (data.l / 1000.0);
  var w_m = (data.w / 1000.0);
  var h_m = (data.h / 1000.0);
  var v_m3 = l_m * w_m * h_m;
  var s_walls = 2 * (l_m * h_m) + 2 * (w_m * h_m);
  var a_0 = (l_m * w_m * 0.65) + (l_m * w_m * 0.30) + (s_walls * 0.05);
  var rt60_val = a_0 > 0 ? (0.161 * v_m3) / a_0 : 0.55;
  var a_target = (0.161 * v_m3) / 0.50; // 0.50s optimal speech
  var delta_a = Math.max(0, a_target - a_0);
  var panels_req = delta_a / 0.85;

  var speechRating = (rt60_val >= 0.45 && rt60_val <= 0.60) ? 'Optimal Speech' : (rt60_val > 0.60 ? 'Excessive Echo' : 'Dry Speech');
  var speechBadgeClass = (rt60_val >= 0.45 && rt60_val <= 0.60) ? 'bg-success text-white' : (rt60_val > 0.60 ? 'bg-warning text-dark' : 'bg-info text-dark');

  var spkSize = data.spkSize || '6.5"';
  var spkCalc = calculateCeilingSpeakers(data.l, data.w, data.h, spkSize);

  var lMtr = data.l / 1000.0;
  var wMtr = data.w / 1000.0;
  var camD1 = data.camD1 !== undefined ? parseFloat(data.camD1) : Math.max(1.5, Math.min(lMtr - 1.2, lMtr * 0.28)).toFixed(1);
  var camWspan = data.camWspan !== undefined ? parseFloat(data.camWspan) : Math.max(1.6, Math.min(wMtr * 0.85, wMtr * 0.55)).toFixed(1);
  var camModel = data.camModel || 'auto';
  var camPos = data.camPos || 'above';
  var camZoomFactor = data.camZoomFactor !== undefined ? parseFloat(data.camZoomFactor) : (camModel.includes('20x') ? 20 : (camModel.includes('12x') ? 12 : 5));
  var camCalc = calculateCameraHFOV(data.l, data.w, camD1, camWspan, camModel, camZoomFactor);

  var camFraming = data.camFraming || 'auto';
  var framingCalc = calculateCameraFramingMode(purpose, data.seats, data.l, data.w, camD1, camCalc.hfovDeg, camCalc.selectedModel, camFraming);

  // Subsystem quantity & exclusion presets
  var dispQty = data.dispQty !== undefined ? parseInt(data.dispQty) : 1;

  var spkPos = data.spkPos || 'ceiling';
  var spkBaseQty = spkCalc.count;
  var spkExtraQty = data.spkExtraQty !== undefined ? parseInt(data.spkExtraQty) : 0;
  var spkQty = data.spkQty !== undefined ? parseInt(data.spkQty) : (spkBaseQty + spkExtraQty);

  var camBaseQty = calculateBaseCameraCount(data.l, data.w, data.seats, camPos);
  var camExtraQty = data.camExtraQty !== undefined ? parseInt(data.camExtraQty) : 0;
  var camQty = data.camQty !== undefined ? parseInt(data.camQty) : (camModel === 'none' ? 0 : (camBaseQty + camExtraQty));

  var micType = data.micType || 'auto';
  var micPos = data.micPos || (data.seats <= 6 ? 'table' : 'ceiling');
  var micCalc = calculateMicrophones(data.l, data.w, data.seats, micType);
  var micBaseQty = micCalc.qty;
  var micExtraQty = data.micExtraQty !== undefined ? parseInt(data.micExtraQty) : 0;
  var micQty = data.micQty !== undefined ? parseInt(data.micQty) : (micType === 'none' ? 0 : (micBaseQty + micExtraQty));

  var videoBarType = data.videoBar || 'auto';
  var barPos = data.barPos || 'below';
  var barQty = data.barQty !== undefined ? parseInt(data.barQty) : (videoBarType === 'none' ? 0 : 1);

  tr.dataset.spkBaseQty = spkBaseQty;
  tr.dataset.camBaseQty = camBaseQty;
  tr.dataset.micBaseQty = micBaseQty;

  // If camera limits are exceeded and camera is active, apply warning highlight
  if (camCalc.hasWarning && camQty > 0 && camModel !== 'none') {
    tr.classList.add('table-camera-warning-row');
    tr.style.backgroundColor = '#fef2f2';
    tr.style.borderLeft = '6px solid #ef4444 !important';
  }

  var barCalc = calculateVideoBar(data.l, data.w, data.seats, videoBarType);
  var budget = calculateRoomHardwareBudget({
    qty: data.qty,
    seats: data.seats,
    l: data.l,
    w: data.w,
    h: data.h,
    dispQty: dispQty,
    spkSize: spkSize,
    spkQty: spkQty,
    spkPos: spkPos,
    spkExtraQty: spkExtraQty,
    camD1: camD1,
    camWspan: camWspan,
    camModel: camModel,
    camPos: camPos,
    camQty: camQty,
    camExtraQty: camExtraQty,
    camZoomFactor: camZoomFactor,
    micType: micType,
    micPos: micPos,
    micQty: micQty,
    micExtraQty: micExtraQty,
    videoBar: videoBarType,
    barPos: barPos,
    barQty: barQty
  });

  var pwr = calculateRoomPowerAndLan({
    qty: data.qty,
    seats: data.seats,
    l: data.l,
    w: data.w,
    h: data.h,
    purpose: purpose,
    pitch: pitch,
    dispQty: dispQty,
    spkSize: spkSize,
    spkPos: spkPos,
    spkQty: spkQty,
    camModel: camModel,
    camPos: camPos,
    camQty: camQty,
    videoBar: videoBarType,
    barPos: barPos,
    barQty: barQty,
    micType: micType,
    micPos: micPos,
    micQty: micQty
  });

  tr.innerHTML = `
    <td class="matrix-td text-center sl-no-cell col-sl" style="background:${floorPal.bgLight};">
      <span class="badge" style="background:${floorPal.badgeBg}; color:#fff; font-size:0.75rem; font-weight:700;">${String(rowIdx).padStart(2, '0')}</span>
    </td>
    <td class="matrix-td col-floor text-center">
      <input type="text" class="form-control matrix-input inp-floor fw-bold text-center shadow-xs mx-auto" value="${data.floor}" style="width:48px; height:22px; font-size:0.72rem; background:${floorPal.bgLight}; color:${floorPal.text}; border:2px solid ${floorPal.badgeBg}; border-radius:4px; padding:1px 2px;" oninput="onFloorChanged(this)" title="Floor ${data.floor} (${floorPal.name})">
    </td>
    <td class="matrix-td col-name">
      <div class="d-flex align-items-center gap-1">
        <input type="color" class="form-control form-control-color p-0 inp-color" value="${rowColorHex}" title="Custom Row Color Tint" style="width:20px; height:22px; min-width:20px; cursor:pointer;" onchange="applyRowColor(this)">
        <textarea class="form-control matrix-input inp-name fw-bold" rows="1" style="width:98px; font-size:0.75rem; padding:1px 3px; border-left:3px solid ${purpPal.badgeBg}; resize:vertical; word-break:break-word; white-space:pre-wrap;" oninput="updateMatrixTotalsAndSummary()">${data.name}</textarea>
      </div>
    </td>
    <td class="matrix-td col-qty text-center"><input type="number" class="form-control matrix-input inp-qty fw-bold text-primary text-center mx-auto" value="${data.qty}" min="1" style="width:48px; height:22px; font-size:0.76rem; padding:1px 2px;" oninput="updateMatrixTotalsAndSummary()" title="Quantity of Rooms"></td>
    <td class="matrix-td col-seats text-center"><input type="number" class="form-control matrix-input inp-seats fw-bold text-success text-center mx-auto" value="${data.seats}" style="width:48px; height:22px; font-size:0.76rem; padding:1px 2px;" oninput="updateMatrixTotalsAndSummary()" title="Seats per Room"></td>
    <td class="matrix-td col-dim" style="width:86px; min-width:86px;">
      <input type="number" class="form-control matrix-input inp-lm" value="${data.l}" placeholder="mm" style="height:22px; font-size:0.74rem; font-weight:700; padding:1px 3px;" oninput="updateDimFromMmRow(this, 'l')" title="Length mm">
      <div class="text-secondary font-monospace" style="font-size:0.60rem; line-height:1.1; margin-top:1px;">${lFt} ft</div>
      <input type="hidden" class="inp-lft" value="${lFt}">
    </td>
    <td class="matrix-td col-dim" style="width:86px; min-width:86px;">
      <input type="number" class="form-control matrix-input inp-wm" value="${data.w}" placeholder="mm" style="height:22px; font-size:0.74rem; font-weight:700; padding:1px 3px;" oninput="updateDimFromMmRow(this, 'w')" title="Width mm">
      <div class="text-secondary font-monospace" style="font-size:0.60rem; line-height:1.1; margin-top:1px;">${wFt} ft</div>
      <input type="hidden" class="inp-wft" value="${wFt}">
    </td>
    <td class="matrix-td col-dim" style="width:86px; min-width:86px;">
      <input type="number" class="form-control matrix-input inp-hm" value="${data.h}" placeholder="mm" style="height:22px; font-size:0.74rem; font-weight:700; padding:1px 3px;" oninput="updateDimFromMmRow(this, 'h')" title="Height mm">
      <div class="text-secondary font-monospace" style="font-size:0.60rem; line-height:1.1; margin-top:1px;">${hFt} ft</div>
      <input type="hidden" class="inp-hft" value="${hFt}">
    </td>
    <td class="matrix-td bg-calc text-center col-area" style="width:78px;">
      <div class="p-1 rounded bg-white border" style="line-height:1.15;">
        <span class="out-sqm text-primary fw-bold" style="font-size:0.72rem;">${sqm.toFixed(2)} m²</span>
        <div class="out-sqft text-secondary font-monospace" style="font-size:0.60rem;">${(sqm*10.7639).toFixed(1)} ft²</div>
      </div>
    </td>
    <td class="matrix-td bg-calc text-center discas-cell col-display" style="width:160px; min-width:160px;">
      <div class="p-1 rounded bg-white border mb-1">
        <select class="form-select form-select-sm matrix-input inp-purpose fw-bold mb-1 shadow-xs" style="font-size:0.70rem; height:25px; padding:1px 18px 1px 4px; border-color:${purpPal.badgeBg}; color:${purpPal.hex};" onchange="onPurposeChanged(this)">
          <option value="meeting" ${purpose === 'meeting' ? 'selected' : ''}>Meeting (6H)</option>
          <option value="uc" ${purpose === 'uc' ? 'selected' : ''}>UC Room (5H)</option>
          <option value="videowall" ${purpose === 'videowall' ? 'selected' : ''}>Videowall dvLED</option>
          <option value="interactive" ${purpose === 'interactive' ? 'selected' : ''}>Touch IFPD (6H)</option>
          <option value="bdm" ${purpose === 'bdm' ? 'selected' : ''}>Basic (BDM 8H)</option>
          <option value="adm" ${purpose === 'adm' ? 'selected' : ''}>Analytical (ADM 4H)</option>
        </select>
        <div class="d-flex align-items-center justify-content-between px-0.5 mb-1 gap-1">
          <span class="badge bg-amber-700 text-white" style="font-size:0.62rem; white-space:nowrap;">Disp Qty:</span>
          <div class="d-flex align-items-center gap-1">
            <input type="number" class="form-control matrix-input inp-disp-qty fw-bold text-center text-amber-900" value="${dispQty}" min="0" max="64" style="width:62px; height:24px; font-size:0.80rem; padding:1px 4px;" oninput="recalcRoomRow(this.closest('tr'))" title="Variable Display Quantity: Set any screen count (0 for none, 1 single, 2 dual, 3 triple, 4 quad, etc.)">
            <span class="small font-mono text-muted" style="font-size:0.60rem;">Screens</span>
          </div>
        </div>
        <div class="box-pitch-input mb-1 ${purpose === 'videowall' ? '' : 'd-none'}">
          <div class="input-group input-group-sm">
            <span class="input-group-text p-0.5" style="font-size:0.62rem;">P:</span>
            <input type="number" class="form-control matrix-input inp-pitch p-0 text-center fw-bold" value="${pitch}" step="0.05" min="0.5" max="10" style="height:24px; font-size:0.75rem;" placeholder="mm" oninput="recalcRoomRow(this.closest('tr'))">
            <span class="input-group-text p-0.5" style="font-size:0.62rem;">mm</span>
          </div>
        </div>
        <div class="p-1 rounded text-center discas-result-box ${dispQty === 0 ? 'opacity-50' : ''}" style="background:#eff6ff; border:1px solid #bfdbfe;">
          <strong class="text-primary out-calc-diag" style="font-size:0.78rem;">${dispQty === 0 ? '0 (None / Excluded)' : (dispQty > 1 ? `${dispQty} × ${dispCalc.diagStr}` : dispCalc.diagStr)}</strong>
          <div class="small text-muted out-calc-dims" style="font-size:0.60rem; line-height:1.1;">${dispQty === 0 ? 'No display considered' : `${dispCalc.w_mm} × ${dispCalc.h_mm} mm`}</div>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-1 px-1">
          <span class="small text-secondary out-calc-dist font-monospace" style="font-size:0.58rem;">1st: ${dispCalc.firstP.toFixed(1)}m</span>
          <a href="javascript:void(0)" onclick="sendRoomToDisplayTab(this)" class="small fw-bold text-primary text-decoration-none" style="font-size:0.62rem;" title="Test in Tab 1 Display Studio"><i class="fa-solid fa-arrow-up-right-from-square me-0.5"></i>Tab 1</a>
        </div>
      </div>
    </td>

    <!-- Column 1: Loudspeakers Requirement (Placement + Room Size Calculation + Extra Quantities) -->
    <td class="matrix-td bg-calc text-center spk-cell col-speaker" style="width:160px; min-width:160px;">
      <div class="p-1 rounded text-center mb-1 ${spkQty === 0 ? 'border-secondary opacity-75' : ''}" style="background:#f0f9ff; border:1px solid #bae6fd;">
        <select class="form-select form-select-sm matrix-input inp-spk-size fw-bold mb-1 shadow-xs" style="font-size:0.68rem; height:24px; padding:1px 18px 1px 4px; border-color:#0284c7; color:#0369a1;" onchange="recalcRoomRow(this.closest('tr'))">
          <option value="2.5\"" ${spkSize === '2.5"' ? 'selected' : ''}>2.5" Micro (150°)</option>
          <option value="3\"" ${spkSize === '3"' ? 'selected' : ''}>3" Micro (140°)</option>
          <option value="4\"" ${spkSize === '4"' ? 'selected' : ''}>4" Compact (130°)</option>
          <option value="5.25\"" ${spkSize === '5.25"' ? 'selected' : ''}>5.25" Medium (110°)</option>
          <option value="6.5\"" ${spkSize === '6.5"' ? 'selected' : ''}>6.5" Standard (100°)</option>
          <option value="8\"" ${spkSize === '8"' ? 'selected' : ''}>8" High Ceiling (90°)</option>
          <option value="10\"" ${spkSize === '10"' ? 'selected' : ''}>10" High Output (80°)</option>
          <option value="12\"" ${spkSize === '12"' ? 'selected' : ''}>12" Atrium Throw (70°)</option>
          <option value="pendant_6.5\"" ${spkSize === 'pendant_6.5"' || spkSize === 'pendant' ? 'selected' : ''}>Pendant 6.5" (95°)</option>
          <option value="pendant_8\"" ${spkSize === 'pendant_8"' ? 'selected' : ''}>Pendant 8" (85°)</option>
        </select>

        <!-- Speaker Placement Selector -->
        <div class="d-flex align-items-center justify-content-between px-0.5 mb-1 gap-1">
          <span class="badge bg-sky-800 text-white" style="font-size:0.59rem; white-space:nowrap;" data-bs-toggle="tooltip" title="Loudspeaker Placement relative to Display & Room">Placement:</span>
          <select class="form-select form-select-sm matrix-input inp-spk-pos fw-bold text-center" style="width:105px; height:23px; font-size:0.65rem; padding:1px 14px 1px 3px; border-color:#0284c7; color:#0369a1;" onchange="recalcRoomRow(this.closest('tr'))">
            <option value="ceiling" ${spkPos === 'ceiling' ? 'selected' : ''}>☁️ Ceiling Grid</option>
            <option value="display_wall" ${spkPos === 'display_wall' || spkPos === 'bottom' ? 'selected' : ''}>🖥️ Behind/Below Display</option>
            <option value="left_right" ${spkPos === 'left_right' ? 'selected' : ''}>↔️ Display L/R Wall</option>
            <option value="table" ${spkPos === 'table' ? 'selected' : ''}>🪑 On Table</option>
            <option value="wall" ${spkPos === 'wall' || spkPos === 'opposite' ? 'selected' : ''}>🧱 On Wall (Peripheral)</option>
            <option value="top" ${spkPos === 'top' ? 'selected' : ''}>⬆️ Top of Display</option>
            <option value="surround" ${spkPos === 'surround' ? 'selected' : ''}>🔲 L/R + Opposite</option>
          </select>
        </div>

        <!-- Room-Size Authoritative Calculated Quantity -->
        <div class="py-1 px-1.5 rounded bg-sky-50 border border-sky-200 text-center mb-1">
          <div class="d-flex align-items-center justify-content-center gap-1">
            <i class="fa-solid fa-calculator text-primary" style="font-size:0.68rem;"></i>
            <span class="badge bg-primary text-white font-mono px-2 py-0.5 out-spk-calc-badge" style="font-size:0.72rem;"><span class="out-spk-calc-num">${spkCalc.count}</span> Speakers</span>
          </div>
          <div class="small text-muted font-mono" style="font-size:0.58rem; margin-top:2px;">Room-size calculated</div>
          <input type="hidden" class="inp-spk-qty" value="${spkCalc.count}">
          <input type="hidden" class="inp-spk-extra" value="0">
        </div>

        <div class="py-0.5 px-1 rounded bg-white border border-sky-200 mb-1">
          <div class="out-spk-status-box">
            ${spkQty === 0 
              ? `<span class="badge bg-secondary text-white py-0.5" style="font-size:0.62rem;"><i class="fa-solid fa-ban me-1"></i>0 (Excluded)</span>` 
              : `<span class="badge bg-info text-dark fw-bold py-0.5" style="font-size:0.62rem;">${spkQty} Units &bull; ${spkPos === 'ceiling' ? `${spkCalc.cols}×${spkCalc.rows} Grid` : spkPos.toUpperCase()}</span>`}
          </div>
          <div class="small text-muted out-spk-grid" style="font-size:0.58rem; line-height:1.1; margin-top:1px;">
            ${spkQty === 0 ? 'No speakers budgeted' : (spkPos === 'ceiling' ? `${spkCalc.spacing}m Spacing &bull; ${spkCalc.overlapPercent}% Overlap` : `Mounted: ${spkPos.replace('_', ' ')}`)}
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center px-1">
          <span class="badge bg-light text-secondary border out-spk-overlap-badge" style="font-size:0.58rem;">${spkCalc.overlapPercent}% Overlap</span>
          <a href="javascript:void(0)" onclick="sendRoomToSpeakerTab(this)" class="small fw-bold text-primary text-decoration-none" style="font-size:0.62rem;" title="Test in Tab 5 Loudspeaker Studio"><i class="fa-solid fa-arrow-up-right-from-square me-0.5"></i>Tab 5</a>
        </div>
      </div>
    </td>

    <!-- Column 2: Camera Requirement (D1, Span, HFOV, Zoom Slider, Quantity & Placement: Left/Right/Top/Bottom/Opposite) -->
    <td class="matrix-td bg-calc text-center cam-cell col-camera" style="width:225px; min-width:225px;">
      <div class="p-1 rounded text-center mb-1 ${camQty === 0 || camModel === 'none' ? 'border-secondary opacity-75' : (camCalc.hasWarning ? 'border-danger' : '')}" style="background:${camQty === 0 || camModel === 'none' ? '#f8fafc' : (camCalc.hasWarning ? '#fff1f2' : '#f5f3ff')}; border:1px solid ${camQty === 0 || camModel === 'none' ? '#cbd5e1' : (camCalc.hasWarning ? '#f87171' : '#ddd6fe')};">
        
        <!-- D1 and Span Inputs with Stacked Flex-Direction: Column Layout (Clean inputs, no popups) -->
        <div class="d-flex align-items-stretch justify-content-between gap-1 mb-1 px-0.5">
          <div class="d-flex flex-column align-items-center cam-d1-container inp-cam-d1-container flex-fill p-1 rounded bg-white border border-indigo-100 shadow-xs" style="flex-direction: column !important;">
            <span class="badge bg-indigo-100 text-indigo-900 border mb-1 w-100 text-center" style="font-size:0.60rem; padding:2px 2px;">D1 (Dist)</span>
            <div class="d-flex align-items-center justify-content-center gap-0.5 w-100">
              <input type="number" class="form-control matrix-input inp-cam-d1 text-center fw-bold text-indigo-950" value="${camD1}" step="0.1" min="0.5" max="50" style="width:58px; height:25px; font-size:0.82rem; padding:1px 3px;" oninput="recalcRoomRow(this.closest('tr'))">
              <span class="font-monospace text-muted" style="font-size:0.62rem;">m</span>
            </div>
          </div>
          <div class="d-flex flex-column align-items-center cam-span-container inp-cam-wspan-container flex-fill p-1 rounded bg-white border border-indigo-100 shadow-xs" style="flex-direction: column !important;">
            <span class="badge bg-indigo-100 text-indigo-900 border mb-1 w-100 text-center" style="font-size:0.60rem; padding:2px 2px;">Span (Width)</span>
            <div class="d-flex align-items-center justify-content-center gap-0.5 w-100">
              <input type="number" class="form-control matrix-input inp-cam-wspan text-center fw-bold text-indigo-950" value="${camWspan}" step="0.1" min="0.5" max="50" style="width:58px; height:25px; font-size:0.82rem; padding:1px 3px;" oninput="recalcRoomRow(this.closest('tr'))">
              <span class="font-monospace text-muted" style="font-size:0.62rem;">m</span>
            </div>
          </div>
        </div>

        <select class="form-select form-select-sm matrix-input inp-cam-model fw-bold shadow-xs mb-1" style="font-size:0.68rem; height:25px; padding:1px 18px 1px 4px; border-color:${camCalc.hasWarning && camQty > 0 ? '#ef4444' : '#818cf8'}; color:#3730a3;" onchange="recalcRoomRow(this.closest('tr'))">
          <option value="auto" ${camModel === 'auto' ? 'selected' : ''}>⚡ Auto: ${camCalc.autoModel}</option>
          <option value="none" ${camModel === 'none' ? 'selected' : ''}>❌ 0 - None (Excluded)</option>
          <option value="120° Wide ePTZ (Bar)" ${camModel === '120° Wide ePTZ (Bar)' ? 'selected' : ''}>120° Wide ePTZ (Bar)</option>
          <option value="85° PTZ (3x/5x Zoom)" ${camModel === '85° PTZ (3x/5x Zoom)' ? 'selected' : ''}>85° PTZ (3x/5x Zoom)</option>
          <option value="72° PTZ (12x Zoom)" ${camModel === '72° PTZ (12x Zoom)' ? 'selected' : ''}>72° PTZ (12x Zoom)</option>
          <option value="60° PTZ (20x/30x Zoom)" ${camModel === '60° PTZ (20x/30x Zoom)' ? 'selected' : ''}>60° PTZ (20x/30x Zoom)</option>
          <option value="Dual-Eye Auto-Track" ${camModel === 'Dual-Eye Auto-Track' ? 'selected' : ''}>Dual-Eye Auto-Track</option>
          <option value="360° Tabletop Center" ${camModel === '360° Tabletop Center' ? 'selected' : ''}>360° Tabletop Center</option>
        </select>

        <!-- Camera Mount Position Selector (Left, Right, Top, Bottom, Table, Wall, Opposite) -->
        <div class="d-flex align-items-center justify-content-between px-0.5 mb-1 gap-1">
          <span class="badge bg-indigo-900 text-white" style="font-size:0.60rem; white-space:nowrap;" data-bs-toggle="tooltip" data-bs-placement="left" title="Camera mounting position relative to display & room">Cam Mount:</span>
          <select class="form-select form-select-sm matrix-input inp-cam-pos fw-bold text-center" style="width:130px; height:24px; font-size:0.65rem; padding:1px 14px 1px 3px; border-color:#818cf8; color:#3730a3;" onchange="recalcRoomRow(this.closest('tr'))" data-bs-toggle="tooltip" data-bs-placement="top" title="Select camera position: Top (Above Display), Bottom (Below Display), On Table (Center/360), On Wall (Peripheral), Left/Right of Display, or Opposite (Presenter)">
            <option value="above" ${camPos === 'above' ? 'selected' : ''}>⬆️ Top (Above Disp)</option>
            <option value="below" ${camPos === 'below' ? 'selected' : ''}>⬇️ Bottom (Below Disp)</option>
            <option value="display_wall" ${camPos === 'display_wall' ? 'selected' : ''}>🖥️ Display Wall</option>
            <option value="table" ${camPos === 'table' ? 'selected' : ''}>🪑 On Table (Center/360)</option>
            <option value="wall" ${camPos === 'wall' ? 'selected' : ''}>🧱 On Wall (Peripheral)</option>
            <option value="left" ${camPos === 'left' ? 'selected' : ''}>⬅️ Left of Display</option>
            <option value="right" ${camPos === 'right' ? 'selected' : ''}>➡️ Right of Display</option>
            <option value="opposite" ${camPos === 'opposite' ? 'selected' : ''}>🔄 Opposite (Presenter)</option>
            <option value="both_lr" ${camPos === 'both_lr' ? 'selected' : ''}>↔️ Left &amp; Right</option>
            <option value="above_and_opposite" ${camPos === 'above_and_opposite' ? 'selected' : ''}>🔀 Top + Opposite</option>
          </select>
        </div>

        <!-- Base from Room Size + Extra Quantity + Total -->
        <div class="d-flex align-items-center justify-content-between px-0.5 mb-1 gap-1">
          <span class="badge bg-indigo-800 text-white out-cam-base-badge" style="font-size:0.58rem;" title="Base calculated camera count according to room dimensions">Base: ${camBaseQty}</span>
          <div class="d-flex align-items-center gap-0.5" title="Add extra quantities as required">
            <span class="small font-mono fw-bold text-muted" style="font-size:0.60rem;">+Ex:</span>
            <input type="number" class="form-control matrix-input inp-cam-extra fw-bold text-center text-indigo-700" value="${camExtraQty}" min="0" max="16" style="width:36px; height:22px; font-size:0.75rem; padding:0 1px;" oninput="onCamExtraInput(this)">
          </div>
          <div class="d-flex align-items-center gap-0.5" title="Total Camera Quantity (Base + Extra)">
            <span class="badge bg-indigo-600 text-white" style="font-size:0.58rem;">Tot:</span>
            <input type="number" class="form-control matrix-input inp-cam-qty fw-bold text-center text-indigo-700" value="${camQty}" min="0" max="32" style="width:40px; height:22px; font-size:0.78rem; padding:0 1px;" oninput="onCamTotalInput(this)">
          </div>
          <span class="badge ${camCalc.hasWarning && camQty > 0 ? 'bg-danger' : 'bg-indigo-600'} text-white out-cam-hfov" style="font-size:0.60rem;">${camQty === 0 || camModel === 'none' ? '0 Excluded' : camCalc.hfovStr}</span>
        </div>

        <!-- CAMERA OPTICAL ZOOM FACTOR OVERRIDE SLIDER & NUMBER FIELD -->
        <div class="box-cam-zoom-override p-1 rounded bg-white border border-indigo-200 mb-1 text-start ${camQty === 0 || camModel === 'none' ? 'd-none' : ''}">
          <div class="d-flex justify-content-between align-items-center mb-0.5">
            <span class="text-indigo-900 fw-bold" style="font-size:0.60rem;"><i class="fa-solid fa-magnifying-glass-plus text-primary me-0.5"></i>Zoom:</span>
            <span class="badge bg-indigo-600 text-white font-monospace out-zoom-factor-badge" style="font-size:0.60rem;">${camZoomFactor}x</span>
          </div>
          <div class="d-flex align-items-center gap-1">
            <input type="range" class="form-range inp-cam-zoom-slider" min="1" max="30" step="1" value="${camZoomFactor}" style="height:12px; cursor:pointer;" oninput="syncCamZoomSlider(this)" title="Fine-tune Optical Zoom Factor (1x–30x)">
            <input type="number" class="form-control matrix-input inp-cam-zoom-num text-center font-monospace fw-bold p-0" min="1" max="30" step="1" value="${camZoomFactor}" style="width:48px; height:24px; font-size:0.80rem;" oninput="syncCamZoomNum(this)" title="Manual Optical Zoom Factor">
          </div>
          <div class="out-cam-reach-info text-secondary font-monospace" style="font-size:0.58rem; margin-top:1px;">Opt Reach: <strong>${camCalc.maxEffectiveDist}m</strong></div>
        </div>

        <div class="box-cam-warning ${camCalc.hasWarning && camQty > 0 && camModel !== 'none' ? '' : 'd-none'} mb-1">
          <div class="badge bg-danger text-white w-100 py-0.5 text-wrap text-start out-cam-warning-badge shadow-xs" style="font-size:0.59rem; line-height:1.15;" data-bs-toggle="tooltip" data-bs-placement="top" title="${camCalc.warningDetails}">
            <i class="fa-solid fa-triangle-exclamation me-0.5 text-warning"></i>${camCalc.warningShort}
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center px-1">
          <a href="javascript:void(0)" onclick="openCameraD1SpanGuideModal()" class="small text-indigo-700 fw-bold text-decoration-none" style="font-size:0.60rem;" title="What is D1 & Span? Click for diagram"><i class="fa-solid fa-circle-question me-0.5 text-primary"></i>D1 Guide</a>
          <a href="javascript:void(0)" onclick="sendRoomToCameraTab(this)" class="small fw-bold text-indigo-700 text-decoration-none" style="font-size:0.62rem;" title="Test in Tab 4 Camera Studio"><i class="fa-solid fa-arrow-up-right-from-square me-0.5"></i>Tab 4</a>
        </div>
      </div>
    </td>

    <!-- Column 2b: Camera Framing Mode -->
    <td class="matrix-td bg-calc text-center framing-cell col-framing" style="width:150px; min-width:150px;">
      <div class="p-1 rounded text-center mb-1" style="background:#eef2ff; border:1px solid #c7d2fe;">
        <select class="form-select form-select-sm matrix-input inp-cam-framing fw-bold shadow-xs mb-1" style="font-size:0.68rem; height:25px; padding:1px 18px 1px 4px; border-color:#6366f1; color:#3730a3;" onchange="recalcRoomRow(this.closest('tr'))">
          <option value="auto" ${camFraming === 'auto' ? 'selected' : ''}>⚡ Auto: ${framingCalc.autoMode}</option>
          <option value="Group Framing (Auto-Frame)" ${camFraming === 'Group Framing (Auto-Frame)' ? 'selected' : ''}>Group Framing</option>
          <option value="Speaker Tracking (Voice AI)" ${camFraming === 'Speaker Tracking (Voice AI)' ? 'selected' : ''}>Speaker Track</option>
          <option value="Presenter Tracking (Follow)" ${camFraming === 'Presenter Tracking (Follow)' ? 'selected' : ''}>Presenter Track</option>
          <option value="People Framing (Multi-Stream)" ${camFraming === 'People Framing (Multi-Stream)' ? 'selected' : ''}>People Framing</option>
          <option value="Dual-Camera Studio Director" ${camFraming === 'Dual-Camera Studio Director' ? 'selected' : ''}>Dual-Cam Director</option>
          <option value="Auto ePTZ (Digital Frame)" ${camFraming === 'Auto ePTZ (Digital Frame)' ? 'selected' : ''}>Auto ePTZ</option>
          <option value="Manual Preset PTZ" ${camFraming === 'Manual Preset PTZ' ? 'selected' : ''}>Manual Presets</option>
        </select>
        <div class="p-1 rounded bg-white border border-indigo-200">
          <span class="badge text-white out-framing-badge" style="background:${framingCalc.badgeBg}; font-size:0.62rem;">
            <i class="fa-solid ${framingCalc.icon} me-0.5"></i>${camQty === 0 || camModel === 'none' ? 'N/A (No Cam)' : framingCalc.selectedMode}
          </span>
          <div class="small text-secondary out-framing-desc" style="font-size:0.58rem; line-height:1.1; margin-top:2px;">${camQty === 0 || camModel === 'none' ? 'Camera excluded' : framingCalc.desc}</div>
        </div>
      </div>
    </td>

    <!-- Column 2c: All-in-One Video Bar (Unified UC Hardware) -->
    <td class="matrix-td bg-calc text-center bar-cell col-bar" style="width:145px; min-width:145px;">
      <div class="p-1 rounded text-center mb-1" style="background:#f0fdfa; border:1px solid #99f6e4;">
        <select class="form-select form-select-sm matrix-input inp-video-bar fw-bold mb-1 shadow-xs" style="font-size:0.68rem; height:25px; padding:1px 18px 1px 4px; border-color:#0d9488; color:#115e59;" onchange="recalcRoomRow(this.closest('tr'))">
          <option value="auto" ${videoBarType === 'auto' ? 'selected' : ''}>⚡ Auto: ${barCalc.autoName || barCalc.name || 'AI Video Bar'}</option>
          <option value="compact" ${videoBarType === 'compact' ? 'selected' : ''}>Compact Bar</option>
          <option value="mid" ${videoBarType === 'mid' ? 'selected' : ''}>Mid-Size Bar</option>
          <option value="large" ${videoBarType === 'large' ? 'selected' : ''}>Large Dual Bar</option>
          <option value="exec" ${videoBarType === 'exec' ? 'selected' : ''}>Exec Dual-Screen</option>
          <option value="none" ${videoBarType === 'none' ? 'selected' : ''}>❌ None (Discrete AV)</option>
        </select>

        <!-- Video Bar Mount Position Selector (Below Display, Above Display, Table, Wall) -->
        <div class="d-flex align-items-center justify-content-between px-0.5 mb-1 gap-1">
          <span class="badge bg-teal text-white" style="font-size:0.59rem; background:#0d9488; white-space:nowrap;" data-bs-toggle="tooltip" data-bs-placement="left" title="Video Bar Mounting Position relative to Display">Bar Mount:</span>
          <select class="form-select form-select-sm matrix-input inp-bar-pos fw-bold text-center" style="width:122px; height:24px; font-size:0.68rem; padding:1px 16px 1px 4px; border-color:#0d9488; color:#115e59;" onchange="recalcRoomRow(this.closest('tr'))" data-bs-toggle="tooltip" data-bs-placement="top" title="Select whether Video Bar is installed Below Display, Above Display, On Table, or On Wall">
            <option value="below" ${barPos === 'below' ? 'selected' : ''}>⬇️ Below Display</option>
            <option value="above" ${barPos === 'above' ? 'selected' : ''}>⬆️ Above Display</option>
            <option value="table" ${barPos === 'table' ? 'selected' : ''}>🪑 On Table</option>
            <option value="wall" ${barPos === 'wall' || barPos === 'display_wall' ? 'selected' : ''}>🧱 On Wall</option>
          </select>
        </div>

        <div class="d-flex align-items-center justify-content-between px-1 mb-1">
          <span class="badge bg-teal text-white" style="font-size:0.62rem; background:#0d9488;">Bar Qty:</span>
          <input type="number" class="form-control matrix-input inp-bar-qty fw-bold text-center text-teal-800" value="${barQty}" min="0" max="3" style="width:60px; height:25px; font-size:0.84rem; padding:1px 4px;" oninput="recalcRoomRow(this.closest('tr'))" title="Video Bar Quantity: Enter 0 to exclude video bar">
        </div>
        <div class="p-0.5 rounded bg-white border border-teal-200">
          <span class="badge text-white out-bar-badge" style="background:${barCalc.badgeBg}; font-size:0.60rem;">
            <i class="fa-solid ${barCalc.icon} me-0.5"></i>${barQty === 0 || videoBarType === 'none' ? '0 (None / Discrete)' : barCalc.name}
          </span>
        </div>
        <div class="d-flex justify-content-end mt-1 px-1">
          <a href="javascript:void(0)" onclick="sendRoomToVideoBar(this)" class="small fw-bold text-teal-700 text-decoration-none" style="font-size:0.62rem;" title="Test Video Bar In Tab 4"><i class="fa-solid fa-arrow-up-right-from-square me-0.5"></i>Tab 4</a>
        </div>
      </div>
    </td>

    <!-- Column 3: Microphone Requirement (Placement + Room Size Calculation + Extra Quantities) -->
    <td class="matrix-td bg-calc text-center mic-cell col-mic" style="width:160px; min-width:160px;">
      <div class="p-1 rounded text-center mb-1 ${micQty === 0 || micType === 'none' ? 'border-secondary opacity-75' : ''}" style="background:#fffbeb; border:1px solid #fde68a;">
        <select class="form-select form-select-sm matrix-input inp-mic-type fw-bold mb-1 shadow-xs" style="font-size:0.68rem; height:25px; padding:1px 18px 1px 4px; border-color:#f59e0b; color:#92400e;" onchange="recalcRoomRow(this.closest('tr'))">
          <option value="auto" ${micType === 'auto' ? 'selected' : ''}>⚡ Auto: Recommended</option>
          <option value="none" ${micType === 'none' ? 'selected' : ''}>❌ 0 - None (Excluded)</option>
          <option value="ceiling_array" ${micType === 'ceiling_array' ? 'selected' : ''}>Ceiling Beamforming Array</option>
          <option value="table_boundary" ${micType === 'table_boundary' ? 'selected' : ''}>Table Boundary Mics</option>
          <option value="table_gooseneck" ${micType === 'table_gooseneck' ? 'selected' : ''}>Table Gooseneck Mics</option>
          <option value="bar_builtin" ${micType === 'bar_builtin' ? 'selected' : ''}>Video Bar Mic Array</option>
          <option value="pendant_mic" ${micType === 'pendant_mic' ? 'selected' : ''}>Ceiling Pendant Mics</option>
        </select>

        <!-- Microphone Placement Selector -->
        <div class="d-flex align-items-center justify-content-between px-0.5 mb-1 gap-1">
          <span class="badge bg-amber-800 text-white" style="font-size:0.59rem; white-space:nowrap;" data-bs-toggle="tooltip" title="Microphone Placement relative to Display & Room">Placement:</span>
          <select class="form-select form-select-sm matrix-input inp-mic-pos fw-bold text-center" style="width:105px; height:23px; font-size:0.65rem; padding:1px 14px 1px 3px; border-color:#f59e0b; color:#92400e;" onchange="recalcRoomRow(this.closest('tr'))">
            <option value="ceiling" ${micPos === 'ceiling' ? 'selected' : ''}>☁️ Ceiling Array</option>
            <option value="table" ${micPos === 'table' ? 'selected' : ''}>🪑 On Table</option>
            <option value="display_wall" ${micPos === 'display_wall' ? 'selected' : ''}>🖥️ Display Wall</option>
            <option value="wall" ${micPos === 'wall' ? 'selected' : ''}>🧱 On Wall (Peripheral)</option>
            <option value="top" ${micPos === 'top' ? 'selected' : ''}>⬆️ Top of Display</option>
            <option value="bottom" ${micPos === 'bottom' ? 'selected' : ''}>⬇️ Bottom of Display</option>
            <option value="left" ${micPos === 'left' ? 'selected' : ''}>⬅️ Left of Display</option>
            <option value="right" ${micPos === 'right' ? 'selected' : ''}>➡️ Right of Display</option>
            <option value="left_right" ${micPos === 'left_right' ? 'selected' : ''}>↔️ Left &amp; Right</option>
            <option value="opposite" ${micPos === 'opposite' ? 'selected' : ''}>🔄 Opposite (Presenter)</option>
            <option value="table_and_opposite" ${micPos === 'table_and_opposite' ? 'selected' : ''}>🔀 Table + Opposite</option>
          </select>
        </div>

        <!-- Room-Size Authoritative Calculated Quantity -->
        <div class="py-1 px-1.5 rounded bg-amber-50 border border-amber-200 text-center mb-1">
          <div class="d-flex align-items-center justify-content-center gap-1">
            <i class="fa-solid fa-calculator text-amber-700" style="font-size:0.68rem;"></i>
            <span class="badge bg-amber-700 text-white font-mono px-2 py-0.5 out-mic-calc-badge" style="font-size:0.72rem;"><span class="out-mic-calc-num">${micCalc.qty}</span> Mics</span>
          </div>
          <div class="small text-muted font-mono" style="font-size:0.58rem; margin-top:2px;">Room-size calculated</div>
          <input type="hidden" class="inp-mic-qty" value="${micCalc.qty}">
          <input type="hidden" class="inp-mic-extra" value="0">
        </div>

        <div class="p-0.5 rounded bg-white border border-amber-200">
          <strong class="text-amber-800 out-mic-desc" style="color:#b45309; font-size:0.62rem; line-height:1.15; display:block;">${micQty === 0 || micType === 'none' ? '0 (Excluded)' : micCalc.displayDesc}</strong>
        </div>
        <div class="d-flex justify-content-end mt-1 px-1">
          <a href="javascript:void(0)" onclick="sendRoomToMicrophoneTab(this)" class="small fw-bold text-amber-700 text-decoration-none" style="font-size:0.62rem;" title="Test in Tab 5 Microphone Studio"><i class="fa-solid fa-arrow-up-right-from-square me-0.5"></i>Tab 5</a>
        </div>
      </div>
    </td>

    <!-- Column 4: Room Acoustics -->
    <td class="matrix-td bg-calc text-center acoustics-cell col-acoustics" style="width:105px; min-width:105px;">
      <div class="p-1 rounded mb-1 text-center" style="background:#f0fdf4; border:1px solid #bbf7d0;">
        <div class="d-flex justify-content-between align-items-center px-1">
          <span class="badge bg-success" style="font-size:0.58rem;">RT60</span>
          <strong class="text-success out-rt60" style="font-size:0.75rem;">${rt60_val.toFixed(2)}s</strong>
        </div>
        <div class="badge ${speechBadgeClass} my-0.5" style="font-size:0.58rem;">
          ${speechRating}
        </div>
        <div class="small text-secondary out-panels" style="font-size:0.58rem; line-height:1.1;">Panels: ${panels_req.toFixed(1)}m²</div>
        <div class="d-flex justify-content-end mt-0.5 px-0.5">
          <a href="javascript:void(0)" onclick="sendRoomToAcousticsTab(this)" class="small fw-bold text-success text-decoration-none" style="font-size:0.60rem;" title="Open in Tab 6 Acoustics Designer"><i class="fa-solid fa-arrow-up-right-from-square me-0.5"></i>Tab 6</a>
        </div>
      </div>
    </td>

    <!-- Column 5: Estimated Hardware Budget (INR) -->
    <td class="matrix-td bg-calc text-center budget-cell col-budget" style="width:130px; min-width:130px;">
      <div class="p-1 rounded text-center mb-1" style="background:#ecfdf5; border:1px solid #a7f3d0;">
        <div class="d-flex justify-content-between align-items-center px-1 mb-0.5">
          <span class="badge text-white" style="background:#059669; font-size:0.60rem;">Per Rm</span>
          <strong class="out-budget-room text-success font-monospace" style="font-size:0.80rem;">${budget.roomCostStr}</strong>
        </div>
        <div class="d-flex justify-content-between align-items-center px-1 mb-1">
          <span class="badge bg-light text-secondary border" style="font-size:0.58rem;">${data.qty} Rms</span>
          <strong class="out-budget-total font-monospace" style="font-size:0.76rem; color:#047857;">${budget.totalForQtyStr}</strong>
        </div>
        <div class="p-1 rounded bg-white border border-emerald-200 text-start out-budget-breakdown font-mono" style="font-size:0.58rem; line-height:1.2; color:#334155;">
          ${budget.breakdown.isBarExcluded ? '<div class="text-muted" style="text-decoration:line-through;">&bull; Bar: 0 (Excluded)</div>' : (budget.breakdown.videoBar > 0 ? `<div>&bull; Bar: <strong>₹${budget.breakdown.videoBar.toLocaleString('en-IN')}</strong></div>` : '')}
          ${budget.breakdown.isCamExcluded ? '<div class="text-muted" style="text-decoration:line-through;">&bull; Cam: 0 (Excluded)</div>' : (budget.breakdown.camera > 0 ? `<div>&bull; Cam: <strong>₹${budget.breakdown.camera.toLocaleString('en-IN')}</strong></div>` : '')}
          ${budget.breakdown.isSpkExcluded ? '<div class="text-muted" style="text-decoration:line-through;">&bull; Spk: 0 (Excluded)</div>' : (budget.breakdown.speakers > 0 ? `<div>&bull; Spk (${budget.breakdown.spkCount}x): <strong>₹${budget.breakdown.speakers.toLocaleString('en-IN')}</strong></div>` : '')}
          ${budget.breakdown.isMicExcluded ? '<div class="text-muted" style="text-decoration:line-through;">&bull; Mic: 0 (Excluded)</div>' : (budget.breakdown.microphones > 0 ? `<div>&bull; Mic: <strong>₹${budget.breakdown.microphones.toLocaleString('en-IN')}</strong></div>` : '')}
        </div>
      </div>
      <button type="button" class="btn btn-outline-success p-0 px-1 w-100" style="font-size:0.62rem; font-weight:700; color:#059669; border-color:#34d399;" onclick="showRoomBudgetDetails(this)" title="Click to view detailed itemized cost breakdown & edit device rates"><i class="fa-solid fa-receipt me-1"></i>Cost Breakdown</button>
    </td>

    <!-- Column 6: Power Sockets (Behind Display, On Table, On Wall + 1 Extra) -->
    <td class="matrix-td bg-calc text-center sockets-cell col-sockets" style="width:145px; min-width:145px;">
      ${renderSocketsCellHtml(pwr)}
    </td>

    <!-- Column 7: LAN Requirement (Default 1 Wall, 1 Table + IP Endpoints) -->
    <td class="matrix-td bg-calc text-center lan-cell col-lan" style="width:140px; min-width:140px;">
      ${renderLanCellHtml(pwr)}
    </td>

    <!-- Column 8: 15A Circuit Power Requirements Validator -->
    <td class="matrix-td bg-calc text-center power-cell col-power" style="width:145px; min-width:145px;">
      ${renderPowerCellHtml(pwr)}
    </td>

    <td class="matrix-td col-note" style="width:80px; max-width:80px;"><input type="text" class="form-control matrix-input inp-note" value="${data.note || ''}" placeholder="Notes..." style="width:76px; height:22px; font-size:0.68rem; padding:1px 2px;" oninput="updateMatrixTotalsAndSummary()"></td>
    <td class="matrix-td text-center col-action" style="width:65px;">
      <div class="d-flex justify-content-center gap-1">
        <button type="button" class="btn btn-xs btn-outline-primary py-0 px-1" onclick="copyRoomRow(this)" title="Duplicate Room Row"><i class="fa-solid fa-copy"></i></button>
        <button type="button" class="btn btn-xs btn-outline-danger py-0 px-1" onclick="removeRoomRow(this)" title="Delete Room Row"><i class="fa-solid fa-trash"></i></button>
      </div>
    </td>
  `;
  tbody.appendChild(tr);
  applyCurrentColumnVisibility(tr);
  initMatrixTooltips();
}

function applyRowColor(inputElem) {
  var tr = inputElem.closest('tr');
  if (tr) {
    var hexVal = rgbToHex(inputElem.value);
    tr.style.backgroundColor = hexVal;
    inputElem.value = hexVal;
  }
  saveProjectLocal();
}

function copyRoomRow(btnElem) {
  var tr = btnElem.closest('tr');
  if (!tr) return;

  var fl = tr.querySelector('.inp-floor')?.value || '01';
  var name = tr.querySelector('.inp-name')?.value || 'Room';
  var qty = parseInt(tr.querySelector('.inp-qty')?.value) || 1;
  var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;
  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 7000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 5000;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;
  var purpose = tr.querySelector('.inp-purpose')?.value || 'meeting';
  var pitch = parseFloat(tr.querySelector('.inp-pitch')?.value) || 1.25;
  var spkSize = tr.querySelector('.inp-spk-size')?.value || '6.5"';
  var camD1 = tr.querySelector('.inp-cam-d1')?.value;
  var camWspan = tr.querySelector('.inp-cam-wspan')?.value;
  var camModel = tr.querySelector('.inp-cam-model')?.value || 'auto';
  var camPos = tr.querySelector('.inp-cam-pos')?.value || 'above';
  var camZoomFactor = tr.querySelector('.inp-cam-zoom-num')?.value || 12;
  var videoBar = tr.querySelector('.inp-video-bar')?.value || 'auto';
  var barPos = tr.querySelector('.inp-bar-pos')?.value || 'below';
  var dispQty = tr.querySelector('.inp-disp-qty')?.value || 1;
  var spkQty = tr.querySelector('.inp-spk-qty')?.value || 4;
  var camQty = tr.querySelector('.inp-cam-qty')?.value || 1;
  var barQty = tr.querySelector('.inp-bar-qty')?.value || 1;
  var micType = tr.querySelector('.inp-mic-type')?.value || 'auto';
  var micQty = tr.querySelector('.inp-mic-qty')?.value || 1;
  var note = tr.querySelector('.inp-note')?.value || '';
  var color = tr.querySelector('.inp-color')?.value || '#ffffff';

  addRoomRowWithData({
    floor: fl, name: name, qty: qty, seats: seats, w: wm, l: lm, h: hm,
    purpose: purpose, pitch: pitch, dispQty: dispQty, spkSize: spkSize, spkQty: spkQty,
    camD1: camD1, camWspan: camWspan, camModel: camModel, camPos: camPos,
    camZoomFactor: camZoomFactor, camQty: camQty, camFraming: camFraming,
    videoBar: videoBar, barPos: barPos, barQty: barQty,
    micType: micType, micQty: micQty, note: note, color: color
  });
  updateMatrixTotalsAndSummary();
}

function sortMatrixFloorWise() {
  const tbody = document.getElementById('matrixTableBody');
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll('tr'));
  rows.sort((a, b) => {
    var flA = a.querySelector('.inp-floor')?.value.trim() || '';
    var flB = b.querySelector('.inp-floor')?.value.trim() || '';
    return flA.localeCompare(flB, undefined, { numeric: true, sensitivity: 'base' });
  });

  rows.forEach((r, idx) => {
    tbody.appendChild(r);
    var slCell = r.querySelector('.sl-no-cell');
    if (slCell) slCell.innerText = String(idx + 1).padStart(2, '0');
  });

  updateMatrixTotalsAndSummary();
}

function updateDimFromMmRow(inputElem, dimType) {
  var tr = inputElem.closest('tr');
  if (!tr) return;

  if (dimType === 'w') {
    var mm = parseFloat(tr.querySelector('.inp-wm').value) || 0;
    tr.querySelector('.inp-wft').value = (mm / 304.8).toFixed(1);
  } else if (dimType === 'l') {
    var mm = parseFloat(tr.querySelector('.inp-lm').value) || 0;
    tr.querySelector('.inp-lft').value = (mm / 304.8).toFixed(1);
  } else if (dimType === 'h') {
    var mm = parseFloat(tr.querySelector('.inp-hm').value) || 0;
    tr.querySelector('.inp-hft').value = (mm / 304.8).toFixed(1);
  }
  recalcRoomRow(tr);
}

function updateDimFromFtRow(inputElem, dimType) {
  var tr = inputElem.closest('tr');
  if (!tr) return;

  if (dimType === 'w') {
    var ft = parseFloat(tr.querySelector('.inp-wft').value) || 0;
    tr.querySelector('.inp-wm').value = Math.round(ft * 304.8);
  } else if (dimType === 'l') {
    var ft = parseFloat(tr.querySelector('.inp-lft').value) || 0;
    tr.querySelector('.inp-lm').value = Math.round(ft * 304.8);
  } else if (dimType === 'h') {
    var ft = parseFloat(tr.querySelector('.inp-hft').value) || 0;
    tr.querySelector('.inp-hm').value = Math.round(ft * 304.8);
  }
  recalcRoomRow(tr);
}



function recalcRoomRow(tr) {
  if (!tr) return;

  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 0;
  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 0;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;

  var sqm = (wm * lm) / 1e6;
  var sqmEl = tr.querySelector('.out-sqm');
  var sqftEl = tr.querySelector('.out-sqft');
  if (sqmEl) sqmEl.innerText = `${sqm.toFixed(2)} m²`;
  if (sqftEl) sqftEl.innerText = `${(sqm*10.7639).toFixed(1)} ft²`;

  var purpose = tr.querySelector('.inp-purpose')?.value || 'meeting';
  var pitchInp = tr.querySelector('.inp-pitch');
  var pitch = pitchInp ? parseFloat(pitchInp.value) || 1.25 : 1.25;

  var pitchBox = tr.querySelector('.box-pitch-input');
  if (pitchBox) {
    if (purpose === 'videowall') pitchBox.classList.remove('d-none');
    else pitchBox.classList.add('d-none');
  }

  var dispCalc = calculateDisplayForPurpose(lm, purpose, pitch);

  // Subsystem exclusion / quantity controls
  var dispQty = tr.querySelector('.inp-disp-qty') ? parseInt(tr.querySelector('.inp-disp-qty').value) : 1;
  var outDiag = tr.querySelector('.out-calc-diag');
  var outDims = tr.querySelector('.out-calc-dims');
  var outDist = tr.querySelector('.out-calc-dist');
  var discasBox = tr.querySelector('.discas-result-box');

  if (dispQty === 0) {
    if (outDiag) outDiag.innerText = '0 (None / Excluded)';
    if (outDims) outDims.innerText = 'No display considered';
    if (outDist) outDist.innerText = '0 Units';
    if (discasBox) discasBox.classList.add('opacity-50');
  } else {
    if (outDiag) outDiag.innerText = dispCalc.diagStr;
    if (outDims) outDims.innerText = `${dispCalc.w_mm} × ${dispCalc.h_mm} mm`;
    if (outDist) outDist.innerText = `1st: ${dispCalc.firstP.toFixed(1)}m | Last: ${dispCalc.lastP.toFixed(1)}m`;
    if (discasBox) discasBox.classList.remove('opacity-50');
  }

  // Speech RT60 (0.45 - 0.60s)
  var l_m = (lm / 1000.0);
  var w_m = (wm / 1000.0);
  var h_m = (hm / 1000.0);
  var v_m3 = l_m * w_m * h_m;
  var s_walls = 2 * (l_m * h_m) + 2 * (w_m * h_m);
  var a_0 = (l_m * w_m * 0.65) + (l_m * w_m * 0.30) + (s_walls * 0.05);
  var rt60_val = a_0 > 0 ? (0.161 * v_m3) / a_0 : 0.55;
  var a_target = (0.161 * v_m3) / 0.50;
  var delta_a = Math.max(0, a_target - a_0);
  var panels_req = delta_a / 0.85;

  var outRt60 = tr.querySelector('.out-rt60');
  if (outRt60) outRt60.innerText = `${rt60_val.toFixed(2)}s`;
  var outPanels = tr.querySelector('.out-panels');
  if (outPanels) outPanels.innerText = `Panels: ${panels_req.toFixed(1)}m²`;

  // Dynamic Ceiling Speakers Recalculation (Authoritative Room-Size Calculated Qty)
  var spkSize = tr.querySelector('.inp-spk-size')?.value || '6.5"';
  var spkCalc = calculateCeilingSpeakers(lm, wm, hm, spkSize);
  var spkQty = (spkSize === 'none') ? 0 : spkCalc.count;
  var spkInp = tr.querySelector('.inp-spk-qty');
  if (spkInp) spkInp.value = spkQty;
  var spkNumEl = tr.querySelector('.out-spk-calc-num');
  if (spkNumEl) spkNumEl.innerText = spkQty;
  var isSpkExcluded = (spkSize === 'none' || spkQty === 0);

  var spkStatusBox = tr.querySelector('.out-spk-status-box');
  var outSpkGrid = tr.querySelector('.out-spk-grid');
  var spkCellDiv = tr.querySelector('.spk-cell > div');
  var spkOverlapBadge = tr.querySelector('.out-spk-overlap-badge');

  if (isSpkExcluded) {
    if (spkStatusBox) spkStatusBox.innerHTML = `<span class="badge bg-secondary text-white py-0.5" style="font-size:0.62rem;"><i class="fa-solid fa-ban me-1"></i>0 (Excluded)</span>`;
    if (outSpkGrid) outSpkGrid.innerText = 'No speakers budgeted';
    if (spkCellDiv) spkCellDiv.classList.add('opacity-75');
    if (spkOverlapBadge) spkOverlapBadge.innerText = '0% (No Audio)';
  } else {
    if (spkStatusBox) spkStatusBox.innerHTML = `<span class="badge bg-info text-dark fw-bold py-0.5" style="font-size:0.62rem;">${spkQty} Units &bull; ${spkCalc.cols}×${spkCalc.rows} Grid</span>`;
    if (outSpkGrid) outSpkGrid.innerText = `${spkCalc.spacing}m Spacing &bull; ${spkCalc.overlapPercent}% Overlap`;
    if (spkCellDiv) spkCellDiv.classList.remove('opacity-75');
    if (spkOverlapBadge) spkOverlapBadge.innerText = `${spkCalc.overlapPercent}% Overlap`;
  }

  // Dynamic Camera HFOV, Optical Zoom Override & Limit Warnings Recalculation
  var camD1 = tr.querySelector('.inp-cam-d1')?.value;
  var camWspan = tr.querySelector('.inp-cam-wspan')?.value;
  var camModel = tr.querySelector('.inp-cam-model')?.value || 'auto';
  var camQtyRaw = tr.querySelector('.inp-cam-qty') ? parseInt(tr.querySelector('.inp-cam-qty').value) : (camModel === 'none' ? 0 : 1);
  var camQty = isNaN(camQtyRaw) ? 1 : camQtyRaw;
  var isCamExcluded = (camModel === 'none' || camQty === 0);

  var camZoomNum = tr.querySelector('.inp-cam-zoom-num');
  var camZoomFactor = camZoomNum ? (parseFloat(camZoomNum.value) || 12) : 12;
  var camCalc = calculateCameraHFOV(lm, wm, camD1, camWspan, camModel, camZoomFactor);

  var outCamHfov = tr.querySelector('.out-cam-hfov');
  var zoomOverrideBox = tr.querySelector('.box-cam-zoom-override');
  var zoomBadge = tr.querySelector('.out-zoom-factor-badge');
  var zoomReach = tr.querySelector('.out-cam-reach-info');
  var camContainer = tr.querySelector('.cam-cell > div');
  var camWarnBox = tr.querySelector('.box-cam-warning');

  if (isCamExcluded) {
    if (outCamHfov) {
      outCamHfov.innerText = '0 Excluded';
      outCamHfov.className = 'badge bg-secondary text-white out-cam-hfov';
    }
    if (zoomOverrideBox) zoomOverrideBox.classList.add('d-none');
    if (camContainer) camContainer.classList.add('opacity-75');
    tr.classList.remove('table-camera-warning-row');
    if (camWarnBox) camWarnBox.classList.add('d-none');
  } else {
    if (outCamHfov) {
      outCamHfov.innerText = camCalc.hfovStr;
      outCamHfov.className = `badge ${camCalc.hasWarning ? 'bg-danger' : 'bg-indigo-600'} text-white out-cam-hfov`;
    }
    if (zoomOverrideBox) zoomOverrideBox.classList.remove('d-none');
    if (zoomBadge) zoomBadge.innerText = `${camCalc.zoomFactor}x`;
    if (zoomReach) zoomReach.innerHTML = `Opt Reach: <strong>${camCalc.maxEffectiveDist}m</strong>`;
    if (camContainer) camContainer.classList.remove('opacity-75');

    // Warning System: Highlight row in red only if camera is active and limits are exceeded
    if (camCalc.hasWarning) {
      tr.classList.add('table-camera-warning-row');
      tr.style.setProperty('background-color', '#fee2e2', 'important');
      tr.style.setProperty('border-left', '6px solid #dc2626', 'important');
      if (camContainer) {
        camContainer.classList.add('border-danger');
        camContainer.style.background = '#fff1f2';
        camContainer.style.border = '1px solid #f87171';
      }
      if (camWarnBox) {
        camWarnBox.classList.remove('d-none');
        var badge = camWarnBox.querySelector('.out-cam-warning-badge');
        if (badge) {
          badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1 text-warning"></i>${camCalc.warningShort}`;
          badge.setAttribute('title', camCalc.warningDetails);
        }
      }
    } else {
      tr.classList.remove('table-camera-warning-row');
      var rowColor = tr.querySelector('.inp-color')?.value || '#ffffff';
      tr.style.removeProperty('border-left');
      tr.style.backgroundColor = rowColor;
      if (camContainer) {
        camContainer.classList.remove('border-danger');
        camContainer.style.background = '#f5f3ff';
        camContainer.style.border = '1px solid #ddd6fe';
      }
      if (camWarnBox) {
        camWarnBox.classList.add('d-none');
      }
    }
  }

  var autoOpt = tr.querySelector('.inp-cam-model option[value="auto"]');
  if (autoOpt) autoOpt.innerText = `⚡ Auto: ${camCalc.autoModel}`;

  // Dynamic Camera Framing Mode Recalculation
  var seatsCount = parseInt(tr.querySelector('.inp-seats')?.value) || 10;
  var camFraming = tr.querySelector('.inp-cam-framing')?.value || 'auto';
  var framingCalc = calculateCameraFramingMode(purpose, seatsCount, lm, wm, camD1, camCalc.hfovDeg, camCalc.selectedModel, camFraming);
  var framingAutoOpt = tr.querySelector('.inp-cam-framing option[value="auto"]');
  if (framingAutoOpt) framingAutoOpt.innerText = `⚡ Auto: ${framingCalc.autoMode}`;
  var outFramingBadge = tr.querySelector('.out-framing-badge');
  var outFramingDesc = tr.querySelector('.out-framing-desc');

  if (isCamExcluded) {
    if (outFramingBadge) {
      outFramingBadge.style.backgroundColor = '#64748b';
      outFramingBadge.innerHTML = `<i class="fa-solid fa-ban me-1"></i>N/A (No Cam)`;
    }
    if (outFramingDesc) outFramingDesc.innerText = 'Camera excluded from design';
  } else {
    if (outFramingBadge) {
      outFramingBadge.style.backgroundColor = framingCalc.badgeBg;
      outFramingBadge.innerHTML = `<i class="fa-solid ${framingCalc.icon} me-1"></i>${framingCalc.selectedMode}`;
    }
    if (outFramingDesc) outFramingDesc.innerText = framingCalc.desc;
  }

  // Dynamic Video Bar Recalculation (Allows Qty = 0)
  var videoBarType = tr.querySelector('.inp-video-bar')?.value || 'auto';
  var barQtyRaw = tr.querySelector('.inp-bar-qty') ? parseInt(tr.querySelector('.inp-bar-qty').value) : (videoBarType === 'none' ? 0 : 1);
  var barQty = isNaN(barQtyRaw) ? 0 : barQtyRaw;
  var isBarExcluded = (videoBarType === 'none' || barQty === 0);
  var barCalc = calculateVideoBar(lm, wm, seatsCount, videoBarType);
  var barAutoOpt = tr.querySelector('.inp-video-bar option[value="auto"]');
  if (barAutoOpt) barAutoOpt.innerText = `⚡ Auto: ${barCalc.autoName || barCalc.name || 'AI Video Bar'}`;
  var outBarBadge = tr.querySelector('.out-bar-badge');
  if (outBarBadge) {
    if (isBarExcluded) {
      outBarBadge.style.backgroundColor = '#64748b';
      outBarBadge.innerHTML = `<i class="fa-solid fa-ban me-1"></i>0 (None / Discrete)`;
    } else {
      outBarBadge.style.backgroundColor = barCalc.badgeBg;
      outBarBadge.innerHTML = `<i class="fa-solid ${barCalc.icon} me-1"></i>${barCalc.name}`;
    }
  }

  // Dynamic Microphone Requirement Recalculation (Authoritative Room-Size Calculated Qty)
  var micType = tr.querySelector('.inp-mic-type')?.value || 'auto';
  var micCalc = calculateMicrophones(lm, wm, seatsCount, micType);
  var micQty = (micType === 'none') ? 0 : micCalc.qty;
  var micInp = tr.querySelector('.inp-mic-qty');
  if (micInp) micInp.value = micQty;
  var micNumEl = tr.querySelector('.out-mic-calc-num');
  if (micNumEl) micNumEl.innerText = micQty;
  var isMicExcluded = (micType === 'none' || micQty === 0);

  var outMicDesc = tr.querySelector('.out-mic-desc');
  var micCellDiv = tr.querySelector('.mic-cell > div');
  if (outMicDesc) {
    if (isMicExcluded) {
      outMicDesc.innerText = '0 (Excluded / No Mic)';
      if (micCellDiv) micCellDiv.classList.add('opacity-75');
    } else {
      outMicDesc.innerText = micCalc.displayDesc;
      if (micCellDiv) micCellDiv.classList.remove('opacity-75');
    }
  }

  // Dynamic Estimated Budget Recalculation (INR)
  var budget = calculateRoomHardwareBudget(tr);
  var outBudgetRoom = tr.querySelector('.out-budget-room');
  if (outBudgetRoom) outBudgetRoom.innerText = budget.roomCostStr;
  var outBudgetTotal = tr.querySelector('.out-budget-total');
  if (outBudgetTotal) outBudgetTotal.innerText = budget.totalForQtyStr;
  var outBudgetBreakdown = tr.querySelector('.out-budget-breakdown');
  if (outBudgetBreakdown) {
    var b = budget.breakdown;
    outBudgetBreakdown.innerHTML = `
      ${b.isBarExcluded ? '<div class="text-muted" style="text-decoration:line-through;">&bull; Bar: 0 (Excluded)</div>' : (b.videoBar > 0 ? `<div>&bull; Bar: <strong>₹${b.videoBar.toLocaleString('en-IN')}</strong></div>` : '')}
      ${b.isCamExcluded ? '<div class="text-muted" style="text-decoration:line-through;">&bull; Cam: 0 (Excluded)</div>' : (b.camera > 0 ? `<div>&bull; Cam: <strong>₹${b.camera.toLocaleString('en-IN')}</strong></div>` : '')}
      ${b.isSpkExcluded ? '<div class="text-muted" style="text-decoration:line-through;">&bull; Spk: 0 (Excluded)</div>' : (b.speakers > 0 ? `<div>&bull; Spk (${b.spkCount}x): <strong>₹${b.speakers.toLocaleString('en-IN')}</strong></div>` : '')}
      ${b.isMicExcluded ? '<div class="text-muted" style="text-decoration:line-through;">&bull; Mic: 0 (Excluded)</div>' : (b.microphones > 0 ? `<div>&bull; Mic: <strong>₹${b.microphones.toLocaleString('en-IN')}</strong></div>` : '')}
    `;
  }

  // Dynamic Sockets, LAN & Power Requirements Recalculation
  var pwr = calculateRoomPowerAndLan(tr);
  var socketsCell = tr.querySelector('.col-sockets');
  if (socketsCell) {
    socketsCell.innerHTML = renderSocketsCellHtml(pwr);
    var target = socketsCell.querySelector('.socket-pulse-target');
    if (target) {
      target.classList.add('socket-pulse');
      setTimeout(function() { if (target) target.classList.remove('socket-pulse'); }, 1200);
    }
  }
  var lanCell = tr.querySelector('.col-lan');
  if (lanCell) {
    lanCell.innerHTML = renderLanCellHtml(pwr);
    var targetLan = lanCell.querySelector('.socket-pulse-target');
    if (targetLan) {
      targetLan.classList.add('socket-pulse');
      setTimeout(function() { if (targetLan) targetLan.classList.remove('socket-pulse'); }, 1200);
    }
  }
  var powerCell = tr.querySelector('.col-power');
  if (powerCell) {
    powerCell.innerHTML = renderPowerCellHtml(pwr);
  }

  updateMatrixTotalsAndSummary();

  // Live update 3D Spatial Room Visualizer whenever this row is recalculated or edited
  selectMatrixRoomFor3D(tr);
}

function syncCamZoomSlider(sliderElem) {
  var tr = sliderElem.closest('tr');
  if (!tr) return;
  var val = parseInt(sliderElem.value) || 1;
  var numElem = tr.querySelector('.inp-cam-zoom-num');
  if (numElem) numElem.value = val;
  var badgeElem = tr.querySelector('.out-zoom-factor-badge');
  if (badgeElem) badgeElem.innerText = val + 'x';
  recalcRoomRow(tr);
}

function syncCamZoomNum(numElem) {
  var tr = numElem.closest('tr');
  if (!tr) return;
  var val = parseInt(numElem.value) || 1;
  val = Math.max(1, Math.min(30, val));
  numElem.value = val;
  var sliderElem = tr.querySelector('.inp-cam-zoom-slider');
  if (sliderElem) sliderElem.value = val;
  var badgeElem = tr.querySelector('.out-zoom-factor-badge');
  if (badgeElem) badgeElem.innerText = val + 'x';
  recalcRoomRow(tr);
}

function removeRoomRow(btnElem) {
  var tr = btnElem.closest('tr');
  if (tr) tr.remove();

  const rows = document.querySelectorAll('#matrixTableBody tr');
  rows.forEach((r, idx) => {
    var slCell = r.querySelector('.sl-no-cell');
    if (slCell) slCell.innerText = String(idx + 1).padStart(2, '0');
  });
  roomRowsCount = rows.length;

  updateMatrixTotalsAndSummary();
}

function updateMatrixTotalsAndSummary() {
  let totalsByName = {};
  let grandTotalRoomsCount = 0, grandTotalAreaSqm = 0, grandTotalVolCum = 0, grandTotalBudget = 0;

  const rows = document.querySelectorAll('#matrixTableBody tr');
  rows.forEach(tr => {
    var fl = tr.querySelector('.inp-floor')?.value || '01';
    var name = tr.querySelector('.inp-name')?.value || 'Meeting Room';
    var qty = parseInt(tr.querySelector('.inp-qty')?.value) || 1;
    var note = tr.querySelector('.inp-note')?.value || '';

    var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 0;
    var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 0;
    var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;

    var sqm = (wm * lm) / 1e6;
    var cum = sqm * (hm / 1000.0);

    var budget = calculateRoomHardwareBudget(tr);

    if (!totalsByName[name]) {
      totalsByName[name] = { qty: 0, floors: new Set(), notes: new Set(), totalBudget: 0 };
    }
    totalsByName[name].qty += qty;
    totalsByName[name].totalBudget += budget.totalForQty;
    if (fl) totalsByName[name].floors.add(fl);
    if (note) totalsByName[name].notes.add(note);

    grandTotalRoomsCount += qty;
    grandTotalAreaSqm += (sqm * qty);
    grandTotalVolCum += (cum * qty);
    grandTotalBudget += budget.totalForQty;
  });

  var elTotR = document.getElementById('matrixTotalRoomsBadge');
  if (elTotR) elTotR.innerText = grandTotalRoomsCount;
  var elTotA = document.getElementById('matrixTotalAreaBadge');
  if (elTotA) elTotA.innerText = grandTotalAreaSqm.toFixed(1) + ' m²';
  var elTotV = document.getElementById('matrixTotalVolBadge');
  if (elTotV) elTotV.innerText = grandTotalVolCum.toFixed(1) + ' m³';
  var elTotB = document.getElementById('matrixTotalBudgetBadge');
  if (elTotB) elTotB.innerText = '₹' + grandTotalBudget.toLocaleString('en-IN') + ' INR';

  var tbody = document.getElementById('summaryTableBody');
  if (tbody) {
    var html = '';
    var sortedNames = Object.keys(totalsByName).sort((a, b) => {
      var flA = Array.from(totalsByName[a].floors)[0] || '';
      var flB = Array.from(totalsByName[b].floors)[0] || '';
      return flA.localeCompare(flB, undefined, { numeric: true, sensitivity: 'base' });
    });

    sortedNames.forEach(name => {
      var floorStr = Array.from(totalsByName[name].floors).sort((x, y) => x.localeCompare(y, undefined, { numeric: true })).join(', ');
      var notesStr = Array.from(totalsByName[name].notes).join('; ');
      var avgRoomBudget = totalsByName[name].qty > 0 ? Math.round(totalsByName[name].totalBudget / totalsByName[name].qty) : 0;
      html += `<tr>
        <td class="fw-bold text-start ps-3">${name}</td>
        <td class="text-center" style="width: 80px; max-width: 80px;"><span class="badge bg-light text-dark border font-mono">${floorStr}</span></td>
        <td class="fw-bold text-primary text-center">${totalsByName[name].qty} Rooms Logged</td>
        <td class="text-center text-success font-monospace fw-semibold">₹${avgRoomBudget.toLocaleString('en-IN')} INR</td>
        <td class="text-center text-success font-monospace fw-bold fs-6">₹${totalsByName[name].totalBudget.toLocaleString('en-IN')} INR</td>
        <td class="text-start ps-2 small text-muted">${notesStr || '-'}</td>
      </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="6" class="text-muted text-center">No rooms entered.</td></tr>';
  }

  var sumTotalCell = document.getElementById('summaryTotalRoomsCell');
  if (sumTotalCell) {
    sumTotalCell.innerText = `${grandTotalRoomsCount} Rooms Total`;
  }
  var sumTotalBudget = document.getElementById('summaryTotalBudgetCell');
  if (sumTotalBudget) {
    sumTotalBudget.innerText = '₹' + grandTotalBudget.toLocaleString('en-IN') + ' INR';
  }

  saveProjectLocal();
  if (typeof renderMatrixMobileCards === 'function') {
    renderMatrixMobileCards();
  }
  if (typeof aggregateProjectBudget === 'function') {
    aggregateProjectBudget();
  }
}

function getMultiProjectsStore() {
  try {
    var raw = localStorage.getItem('spatial_matrix_multi_projects');
    return raw ? JSON.parse(raw) : {};
  } catch(e) {
    return {};
  }
}

function updateSavedProjectsDropdown() {
  var select = document.getElementById('savedProjectsSelect');
  if (!select) return;

  var store = getMultiProjectsStore();
  var keys = Object.keys(store);
  
  var html = '<option value="">-- Recall Saved Project --</option>';
  keys.forEach(k => {
    html += `<option value="${k}">${k} (${store[k].rooms?.length || 0} rooms)</option>`;
  });
  select.innerHTML = html;
}

function saveProjectByName() {
  var projName = document.getElementById('matrixProjectNameInput')?.value.trim() || 'Pro AV Architectural Schedule';
  
  var rowsData = [];
  const rows = document.querySelectorAll('#matrixTableBody tr');
  rows.forEach(tr => {
    rowsData.push({
      floor: tr.querySelector('.inp-floor')?.value || '01',
      name: tr.querySelector('.inp-name')?.value || 'Room',
      qty: parseInt(tr.querySelector('.inp-qty')?.value) || 1,
      seats: parseInt(tr.querySelector('.inp-seats')?.value) || 10,
      l: parseFloat(tr.querySelector('.inp-lm')?.value) || 7000,
      w: parseFloat(tr.querySelector('.inp-wm')?.value) || 5000,
      h: parseFloat(tr.querySelector('.inp-hm')?.value) || 2700,
      purpose: tr.querySelector('.inp-purpose')?.value || 'meeting',
      pitch: parseFloat(tr.querySelector('.inp-pitch')?.value) || 1.25,
      dispQty: parseInt(tr.querySelector('.inp-disp-qty')?.value) || 1,
      spkSize: tr.querySelector('.inp-spk-size')?.value || '6.5"',
      spkPos: tr.querySelector('.inp-spk-pos')?.value || 'ceiling',
      spkQty: parseInt(tr.querySelector('.inp-spk-qty')?.value) || 4,
      spkExtraQty: parseInt(tr.querySelector('.inp-spk-extra')?.value) || 0,
      camD1: tr.querySelector('.inp-cam-d1')?.value,
      camWspan: tr.querySelector('.inp-cam-wspan')?.value,
      camModel: tr.querySelector('.inp-cam-model')?.value || 'auto',
      camFraming: tr.querySelector('.inp-cam-framing')?.value || 'auto',
      camPos: tr.querySelector('.inp-cam-pos')?.value || 'above',
      camQty: parseInt(tr.querySelector('.inp-cam-qty')?.value) || 1,
      camExtraQty: parseInt(tr.querySelector('.inp-cam-extra')?.value) || 0,
      camZoomFactor: parseFloat(tr.querySelector('.inp-cam-zoom-num')?.value) || 12,
      videoBar: tr.querySelector('.inp-video-bar')?.value || 'auto',
      barPos: tr.querySelector('.inp-bar-pos')?.value || 'below',
      barQty: parseInt(tr.querySelector('.inp-bar-qty')?.value) || 1,
      micType: tr.querySelector('.inp-mic-type')?.value || 'auto',
      micPos: tr.querySelector('.inp-mic-pos')?.value || 'ceiling',
      micQty: parseInt(tr.querySelector('.inp-mic-qty')?.value) || 1,
      micExtraQty: parseInt(tr.querySelector('.inp-mic-extra')?.value) || 0,
      note: tr.querySelector('.inp-note')?.value || '',
      color: rgbToHex(tr.querySelector('.inp-color')?.value || '#ffffff')
    });
  });

  var state = { projectName: projName, rooms: rowsData, timestamp: Date.now() };
  var store = getMultiProjectsStore();
  store[projName] = state;
  try {
    localStorage.setItem('spatial_matrix_multi_projects', JSON.stringify(store));
    localStorage.setItem('spatial_matrix_project_7day', JSON.stringify(state));
    updateSavedProjectsDropdown();
    var select = document.getElementById('savedProjectsSelect');
    if (select) select.value = projName;
    alert(`Project "${projName}" saved successfully!`);
  } catch(e) {
    alert("Error saving project: " + e.message);
  }
}

function saveProjectLocal() {
  try {
    var projName = document.getElementById('matrixProjectNameInput')?.value || 'Pro AV Architectural Schedule';
    var rowsData = [];
    const rows = document.querySelectorAll('#matrixTableBody tr');
    rows.forEach(tr => {
      rowsData.push({
        floor: tr.querySelector('.inp-floor')?.value || '01',
        name: tr.querySelector('.inp-name')?.value || 'Room',
        qty: parseInt(tr.querySelector('.inp-qty')?.value) || 1,
        seats: parseInt(tr.querySelector('.inp-seats')?.value) || 10,
        l: parseFloat(tr.querySelector('.inp-lm')?.value) || 7000,
        w: parseFloat(tr.querySelector('.inp-wm')?.value) || 5000,
        h: parseFloat(tr.querySelector('.inp-hm')?.value) || 2700,
        purpose: tr.querySelector('.inp-purpose')?.value || 'meeting',
        pitch: parseFloat(tr.querySelector('.inp-pitch')?.value) || 1.25,
        dispQty: parseInt(tr.querySelector('.inp-disp-qty')?.value) || 1,
        spkSize: tr.querySelector('.inp-spk-size')?.value || '6.5"',
        spkPos: tr.querySelector('.inp-spk-pos')?.value || 'ceiling',
        spkQty: parseInt(tr.querySelector('.inp-spk-qty')?.value) || 4,
        spkExtraQty: parseInt(tr.querySelector('.inp-spk-extra')?.value) || 0,
        camD1: tr.querySelector('.inp-cam-d1')?.value,
        camWspan: tr.querySelector('.inp-cam-wspan')?.value,
        camModel: tr.querySelector('.inp-cam-model')?.value || 'auto',
        camFraming: tr.querySelector('.inp-cam-framing')?.value || 'auto',
        camPos: tr.querySelector('.inp-cam-pos')?.value || 'above',
        camQty: parseInt(tr.querySelector('.inp-cam-qty')?.value) || 1,
        camExtraQty: parseInt(tr.querySelector('.inp-cam-extra')?.value) || 0,
        camZoomFactor: parseFloat(tr.querySelector('.inp-cam-zoom-num')?.value) || 12,
        videoBar: tr.querySelector('.inp-video-bar')?.value || 'auto',
        barPos: tr.querySelector('.inp-bar-pos')?.value || 'below',
        barQty: parseInt(tr.querySelector('.inp-bar-qty')?.value) || 1,
        micType: tr.querySelector('.inp-mic-type')?.value || 'auto',
        micPos: tr.querySelector('.inp-mic-pos')?.value || 'ceiling',
        micQty: parseInt(tr.querySelector('.inp-mic-qty')?.value) || 1,
        micExtraQty: parseInt(tr.querySelector('.inp-mic-extra')?.value) || 0,
        note: tr.querySelector('.inp-note')?.value || '',
        color: rgbToHex(tr.querySelector('.inp-color')?.value || '#ffffff')
      });
    });

    var state = { projectName: projName, rooms: rowsData, timestamp: Date.now() };
    localStorage.setItem('spatial_matrix_project_7day', JSON.stringify(state));

    if (typeof triggerAutoSave === 'function') {
      triggerAutoSave();
    }
  } catch(e) {}
}

function loadSelectedProject() {
  var select = document.getElementById('savedProjectsSelect');
  if (!select || !select.value) return;

  var projName = select.value;
  var store = getMultiProjectsStore();
  var state = store[projName];
  if (!state || !state.rooms) {
    alert("Selected project could not be found.");
    return;
  }

  var pInp = document.getElementById('matrixProjectNameInput');
  if (pInp) pInp.value = state.projectName || projName;
  const tbody = document.getElementById('matrixTableBody');
  if (tbody) tbody.innerHTML = '';
  roomRowsCount = 0;

  state.rooms.forEach(r => addRoomRowWithData(r));
  updateMatrixTotalsAndSummary();
}

function deleteSelectedProject() {
  var select = document.getElementById('savedProjectsSelect');
  if (!select || !select.value) {
    alert("Please select a saved project from the dropdown to delete.");
    return;
  }

  var projName = select.value;
  if (confirm(`Are you sure you want to delete saved project "${projName}"?`)) {
    var store = getMultiProjectsStore();
    delete store[projName];
    localStorage.setItem('spatial_matrix_multi_projects', JSON.stringify(store));
    updateSavedProjectsDropdown();
    alert(`Project "${projName}" deleted.`);
  }
}

function createNewProject() {
  if (confirm("Start a new project? Unsaved changes in the current table will be lost.")) {
    var pInp = document.getElementById('matrixProjectNameInput');
    if (pInp) pInp.value = "New Pro AV Architectural Project";
    const tbody = document.getElementById('matrixTableBody');
    if (tbody) tbody.innerHTML = '';
    roomRowsCount = 0;
    addRoomRowWithData({ floor: "01", name: "Conference Room 1", qty: 1, seats: 10, w: 5000, l: 7000, h: 2700, purpose: "meeting", pitch: 1.25, note: "", color: "#ffffff" });
    updateMatrixTotalsAndSummary();
  }
}

function loadProjectLocal() {
  updateSavedProjectsDropdown();
  try {
    var raw = localStorage.getItem('spatial_matrix_project_7day');
    if (!raw) return false;
    var state = JSON.parse(raw);
    if (state.projectName) {
      var pInp = document.getElementById('matrixProjectNameInput');
      if (pInp) pInp.value = state.projectName;
    }
    if (state.rooms && Array.isArray(state.rooms) && state.rooms.length > 0) {
      const tbody = document.getElementById('matrixTableBody');
      if (tbody) tbody.innerHTML = '';
      roomRowsCount = 0;
      state.rooms.forEach(r => addRoomRowWithData(r));
      return true;
    }
  } catch(e) {}
  return false;
}

function addRoomFromQuickForm() {
  var fl = document.getElementById('quickFloorInput')?.value.trim() || '01';
  var name = document.getElementById('quickNameInput')?.value.trim() || 'Meeting Room';
  var qty = parseInt(document.getElementById('quickQtyInput')?.value) || 1;
  var seats = parseInt(document.getElementById('quickSeatsInput')?.value) || 10;
  var l = parseFloat(document.getElementById('quickLMmInput')?.value) || 7000;
  var w = parseFloat(document.getElementById('quickWMmInput')?.value) || 5000;
  var h = parseFloat(document.getElementById('quickHMmInput')?.value) || 2700;
  var note = document.getElementById('quickNoteInput')?.value.trim() || '';
  var color = document.getElementById('quickColorInput')?.value || '#ffffff';

  addRoomRowWithData({ floor: fl, name: name, qty: qty, seats: seats, w: w, l: l, h: h, purpose: "meeting", pitch: 1.25, note: note, color: color });
  updateMatrixTotalsAndSummary();

  var nameInp = document.getElementById('quickNameInput');
  if (nameInp) nameInp.value = '';
  var noteInp = document.getElementById('quickNoteInput');
  if (noteInp) noteInp.value = '';
}

function renderRoomDistributionScaledChart(totalsByName) {
  var ctx = document.getElementById('roomDistributionScaledChart');
  if (!ctx) return;

  var labels = [], data = [], colors = [];
  const palette = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#64748b"];
  var colorIdx = 0;

  Object.keys(totalsByName).forEach(name => {
    labels.push(name);
    data.push(totalsByName[name].qty);
    colors.push(palette[colorIdx % palette.length]);
    colorIdx++;
  });

  if (roomScaledChart) roomScaledChart.destroy();

  roomScaledChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length > 0 ? labels : ['No Rooms'],
      datasets: [{
        label: 'Quantity of Rooms',
        data: data.length > 0 ? data : [0],
        backgroundColor: colors.length > 0 ? colors : ['#cbd5e1'],
        borderRadius: 6,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Inter', weight: 'bold' } } },
        x: { ticks: { font: { family: 'Inter', size: 10, weight: 'bold' } } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// 2 DEDICATED EXCEL EXPORT FUNCTIONS (METRIC MM vs IMPERIAL FT) WITH MULTI-COLORED HEADERS & FLOOR PALETTES
function exportToExcel(unitMode, customOptions) {
  unitMode = unitMode || 'mm';
  var isMetric = unitMode === 'mm';
  var unitTitle = isMetric ? 'Metric Units (mm / m)' : 'Imperial Units (ft / in)';

  var opts = customOptions || {
    isMetric: isMetric,
    includeDisplay: true,
    includeCamera: true,
    includeFraming: true,
    includeBar: true,
    includeSpeaker: true,
    includeMic: true,
    includeAcoustics: true,
    includeBudget: true
  };

  try {
    var projTitle = document.getElementById('matrixProjectNameInput')?.value || 'Pro AV Architectural Schedule';
    var rows = document.querySelectorAll('#matrixTableBody tr');
    if (!rows || rows.length === 0) {
      alert('No room schedule data available to export.');
      return;
    }

    var html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8">
      <style>
        table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; width: 100%; margin-top: 10px; }
        th { font-weight: bold; padding: 10px 8px; text-align: center; vertical-align: middle; }
        td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: center; vertical-align: middle; }
      </style>
    </head><body>
      <h2 style="color:#0f172a; margin-bottom:4px;">Pro AV Spatial Room Architectural Matrix Schedule</h2>
      <div style="display:inline-block; padding:4px 12px; background:#fef2f2; border:2px solid #dc2626; color:#dc2626; font-weight:bold; font-size:11pt; border-radius:4px; margin-bottom:10px;">
        [SECURITY WATERMARK: HCMM CERTIFIED ARCHITECTURAL SPECIFICATION]
      </div>
      <h4 style="color:#2563eb; margin-top:2px; margin-bottom:8px;">PROJECT: ${projTitle} &bull; ${unitTitle}</h4>
      <p style="font-size:9pt; color:#64748b; margin-top:0;">Color-Coded Multi-Floor &amp; Room-Type Engineering Matrix &bull; Device Zeroing Respected</p>
      <table>
        <thead>
          <tr>
            <th style="background-color: #1e3a8a; color: #ffffff; border: 1px solid #172554;">SL NO</th>
            <th style="background-color: #0369a1; color: #ffffff; border: 1px solid #082f49;">FLOOR</th>
            <th style="background-color: #0284c7; color: #ffffff; border: 1px solid #075985;">ROOM NAME</th>
            <th style="background-color: #7c3aed; color: #ffffff; border: 1px solid #4c1d95;">ROOM PURPOSE</th>
            <th style="background-color: #047857; color: #ffffff; border: 1px solid #064e3b;">QTY</th>
            <th style="background-color: #059669; color: #ffffff; border: 1px solid #065f46;">SEATING</th>
            <th style="background-color: #0f766e; color: #ffffff; border: 1px solid #134e4a;">${isMetric ? 'LENGTH (mm)' : 'LENGTH (ft)'}</th>
            <th style="background-color: #0e7490; color: #ffffff; border: 1px solid #164e63;">${isMetric ? 'WIDTH (mm)' : 'WIDTH (ft)'}</th>
            <th style="background-color: #0891b2; color: #ffffff; border: 1px solid #155e75;">${isMetric ? 'HEIGHT (mm)' : 'HEIGHT (ft)'}</th>
            <th style="background-color: #4f46e5; color: #ffffff; border: 1px solid #312e81;">${isMetric ? 'AREA (m²)' : 'AREA (ft²)'}</th>
            <th style="background-color: #6366f1; color: #ffffff; border: 1px solid #3730a3;">VOLUME (m³)</th>
            ${opts.includeDisplay ? '<th style="background-color: #d97706; color: #ffffff; border: 1px solid #78350f;">DISCAS DISPLAY</th>' : ''}
            ${opts.includeSpeaker ? '<th style="background-color: #0284c7; color: #ffffff; border: 1px solid #0369a1;">SPEAKER COUNT</th>' : ''}
            ${opts.includeCamera ? '<th style="background-color: #4338ca; color: #ffffff; border: 1px solid #312e81;">CAMERA HFOV &amp; ZOOM</th>' : ''}
            ${opts.includeFraming ? '<th style="background-color: #6366f1; color: #ffffff; border: 1px solid #4338ca;">CAMERA FRAMING MODE</th>' : ''}
            ${opts.includeBar ? '<th style="background-color: #0d9488; color: #ffffff; border: 1px solid #115e59;">ALL-IN-ONE VIDEO BAR</th>' : ''}
            ${opts.includeMic ? '<th style="background-color: #b45309; color: #ffffff; border: 1px solid #78350f;">MICROPHONES</th>' : ''}
            ${opts.includeAcoustics ? '<th style="background-color: #15803d; color: #ffffff; border: 1px solid #14532d;">SPEECH RT60</th>' : ''}
            ${opts.includeBudget ? '<th style="background-color: #047857; color: #ffffff; border: 1px solid #065f46;">EST. BUDGET (INR / RM)</th>' : ''}
            ${opts.includeBudget ? '<th style="background-color: #065f46; color: #ffffff; border: 1px solid #022c22;">TOTAL BUDGET (INR)</th>' : ''}
            <th style="background-color: #475569; color: #ffffff; border: 1px solid #1e293b;">NOTES</th>
          </tr>
        </thead>
        <tbody>`;

    var colSpanCount = 12;
    if (opts.includeDisplay) colSpanCount++;
    if (opts.includeSpeaker) colSpanCount++;
    if (opts.includeCamera) colSpanCount++;
    if (opts.includeFraming) colSpanCount++;
    if (opts.includeBar) colSpanCount++;
    if (opts.includeMic) colSpanCount++;
    if (opts.includeAcoustics) colSpanCount++;
    if (opts.includeBudget) colSpanCount += 2;

    var lastFloorSeenExcel = null;
    rows.forEach(function(tr, idx) {
      var sl = String(idx + 1).padStart(2, '0');
      var fl = tr.querySelector('.inp-floor')?.value || '01';
      var name = tr.querySelector('.inp-name')?.value || ('Room ' + (idx + 1));
      var qty = tr.querySelector('.inp-qty')?.value || '1';
      var seats = tr.querySelector('.inp-seats')?.value || '10';

      var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 0;
      var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 0;
      var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 0;

      var lenStr = isMetric ? lm : (lm / 304.8).toFixed(2);
      var widStr = isMetric ? wm : (wm / 304.8).toFixed(2);
      var hgtStr = isMetric ? hm : (hm / 304.8).toFixed(2);

      var sqm = (lm * wm) / 1e6;
      var areaStr = isMetric ? sqm.toFixed(2) : (sqm * 10.7639).toFixed(1);
      var volStr = (sqm * (hm / 1000.0)).toFixed(2);

      var purpose = tr.querySelector('.inp-purpose')?.value || 'meeting';

      var dispQtyRaw = tr.querySelector('.inp-disp-qty') ? parseInt(tr.querySelector('.inp-disp-qty').value) : 1;
      var isDispExcluded = dispQtyRaw === 0;
      var diagStr = tr.querySelector('.out-calc-diag')?.innerText || '';
      var dimsStr = tr.querySelector('.out-calc-dims')?.innerText || '';
      var dispCell = isDispExcluded ? '0 (None / Excluded)' : (isMetric ? `${diagStr} (${dimsStr})` : `${diagStr} (${(wm/304.8).toFixed(1)} × ${(hm/304.8).toFixed(1)} ft)`);

      var spkSize = tr.querySelector('.inp-spk-size')?.value || '6.5"';
      var spkCalc = calculateCeilingSpeakers(lm, wm, hm, spkSize);
      var spkQty = (spkSize === 'none') ? 0 : spkCalc.count;
      var spkCount = (spkSize === 'none' || spkQty === 0) ? '0 (Excluded)' : `${spkQty} Units (${spkCalc.cols}×${spkCalc.rows} Grid)`;

      var camQtyRaw = tr.querySelector('.inp-cam-qty') ? parseInt(tr.querySelector('.inp-cam-qty').value) : 1;
      var camModel = tr.querySelector('.inp-cam-model')?.value || 'auto';
      var isCamExcluded = (camModel === 'none' || camQtyRaw === 0);
      var camZoom = tr.querySelector('.inp-cam-zoom-num')?.value || '12';
      var camPos = tr.querySelector('.inp-cam-pos')?.value || 'above';
      var camHfovRaw = tr.querySelector('.out-cam-hfov')?.innerText?.trim() || '';
      var camMatch = camHfovRaw.match(/(\d+(\.\d+)?)/);
      var camHfov = isCamExcluded ? '0 (Excluded)' : (camMatch ? `${parseFloat(camMatch[1]).toFixed(1)}° (${camZoom}x Zoom, ${camPos === 'below' ? 'Below Display' : 'Above Display'})` : `78.0° (${camZoom}x Zoom, ${camPos === 'below' ? 'Below Display' : 'Above Display'})`);

      var camFraming = isCamExcluded ? 'N/A (No Cam)' : (tr.querySelector('.out-framing-badge')?.innerText?.trim() || tr.querySelector('.inp-cam-framing')?.value || 'Group Framing');

      var barQtyRaw = tr.querySelector('.inp-bar-qty') ? parseInt(tr.querySelector('.inp-bar-qty').value) : 1;
      var barModel = tr.querySelector('.inp-video-bar')?.value || 'auto';
      var barPos = tr.querySelector('.inp-bar-pos')?.value || 'below';
      var isBarExcluded = (barModel === 'none' || barQtyRaw === 0);
      var barName = isBarExcluded ? '0 (None / Excluded)' : `${tr.querySelector('.out-bar-badge')?.innerText?.trim() || barModel || 'Auto Bar'} (${barPos === 'above' ? 'Above Display' : 'Below Display'})`;

      var micType = tr.querySelector('.inp-mic-type')?.value || 'auto';
      var micCalc = calculateMicrophones(lm, wm, seats, micType);
      var micQty = (micType === 'none') ? 0 : micCalc.qty;
      var micDesc = (micType === 'none' || micQty === 0) ? '0 (Excluded)' : `${micQty}x ${micCalc.displayDesc || micType}`;

      var rt60Str = tr.querySelector('.out-rt60')?.innerText?.trim() || '';
      var budgetRoom = tr.querySelector('.out-budget-room')?.innerText?.trim() || '₹0';
      var budgetTotal = tr.querySelector('.out-budget-total')?.innerText?.trim() || '₹0';
      var note = tr.querySelector('.inp-note')?.value || '';

      var floorPal = getFloorPalette(fl);
      var purpPal = getRoomPurposePalette(purpose);

      if (fl !== lastFloorSeenExcel) {
        html += `<tr style="background-color: ${floorPal.badgeBg}; color: #ffffff;">
          <td colspan="${colSpanCount}" style="background-color: ${floorPal.badgeBg}; color: #ffffff; font-weight: 800; font-size: 11pt; text-align: left; padding: 8px 12px; letter-spacing: 0.5px;">
            &bull; FLOOR ${fl} &mdash; ${floorPal.name.toUpperCase()} (COLOR ACCENT: ${floorPal.badgeBg})
          </td>
        </tr>`;
        lastFloorSeenExcel = fl;
      }

      html += `<tr style="background-color: ${floorPal.excelBg}; border-bottom: 2px solid ${floorPal.bgBorder};">
        <td style="background-color: ${floorPal.excelBg}; color: ${floorPal.text}; font-weight: bold;">${sl}</td>
        <td style="background-color: ${floorPal.badgeBg}; color: #ffffff; font-weight: 800; border-radius: 4px;">FL ${fl}</td>
        <td style="text-align: left; font-weight: bold; color: ${floorPal.text}; border-left: 3px solid ${floorPal.badgeBg};">${name}</td>
        <td style="background-color: ${purpPal.excelBg}; color: ${purpPal.hex}; font-weight: bold; border: 1px solid ${purpPal.excelBorder}; border-radius: 4px;">${purpPal.label}</td>
        <td style="font-weight: bold; color: #1e3a8a;">${qty}</td>
        <td style="font-weight: bold; color: #065f46;">${seats}</td>
        <td>${lenStr}</td>
        <td>${widStr}</td>
        <td>${hgtStr}</td>
        <td style="font-weight: bold; color: #312e81;">${areaStr}</td>
        <td style="color: #4338ca;">${volStr}</td>
        ${opts.includeDisplay ? `<td style="background-color: #eff6ff; color: #1e40af; font-weight: bold;">${dispCell}</td>` : ''}
        ${opts.includeSpeaker ? `<td style="background-color: #f0f9ff; color: #0284c7; font-weight: bold; text-align: center;">${spkCount}</td>` : ''}
        ${opts.includeCamera ? `<td style="background-color: #f5f3ff; color: #4338ca; font-weight: bold; text-align: center;">${camHfov}</td>` : ''}
        ${opts.includeFraming ? `<td style="background-color: #eef2ff; color: #3730a3; font-weight: bold; text-align: center;">${camFraming}</td>` : ''}
        ${opts.includeBar ? `<td style="background-color: #f0fdfa; color: #0d9488; font-weight: bold; text-align: center;">${barName}</td>` : ''}
        ${opts.includeMic ? `<td style="background-color: #fffbeb; color: #92400e; font-weight: bold; text-align: left;">${micDesc}</td>` : ''}
        ${opts.includeAcoustics ? `<td style="background-color: #f0fdf4; color: #15803d; font-weight: bold; text-align: center;">${rt60Str}</td>` : ''}
        ${opts.includeBudget ? `<td style="background-color: #ecfdf5; color: #047857; font-weight: bold; text-align: right;">${budgetRoom}</td>` : ''}
        ${opts.includeBudget ? `<td style="background-color: #d1fae5; color: #065f46; font-weight: 800; text-align: right;">${budgetTotal}</td>` : ''}
        <td style="text-align: left; color: #475569;">${note}</td>
      </tr>`;
    });

    html += `</tbody></table><br><br><h3 style="color:#0f172a;">Consolidation Summary &bull; [WATERMARK: HCMM]</h3>`;
    var sumNode = document.getElementById('summaryTable');
    if (sumNode) { html += sumNode.outerHTML; }
    html += `<div style="margin-top:20px; font-size:9pt; color:#64748b; border-top:1px solid #cbd5e1; padding-top:6px;">
      Pro AV System Architect &bull; Multi-Floor Color Matrix &bull; HCMM Verified Engineering
    </div></body></html>`;

    var safeFileName = `${projTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_HCMM_${isMetric ? 'Metric_mm' : 'Imperial_ft'}`;
    var blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${safeFileName}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch(err) {
    alert("Export to Excel Failed: " + err.message);
  }
}

function exportToCSV(customOptions) {
  var opts = customOptions || {
    isMetric: true,
    includeDisplay: true,
    includeCamera: true,
    includeFraming: true,
    includeBar: true,
    includeSpeaker: true,
    includeMic: true,
    includeAcoustics: true,
    includeBudget: true
  };

  try {
    var projTitle = document.getElementById('matrixProjectNameInput')?.value || 'Pro AV Architectural Schedule';
    var rows = document.querySelectorAll('#matrixTableBody tr');
    if (!rows || rows.length === 0) {
      alert('No room schedule data available to export.');
      return;
    }

    var csvRows = [];
    csvRows.push(['# PROJECT', projTitle]);
    csvRows.push(['# SECURITY WATERMARK', 'HCMM CERTIFIED ARCHITECTURAL SPECIFICATION']);
    csvRows.push(['# GENERATED BY', 'Pro AV System Architect & Spatial Matrix']);
    csvRows.push(['# EXPORT DATE', new Date().toISOString()]);
    csvRows.push([]);

    var headers = [
      '[ID] SL No',
      '[FLOOR ZONE] Floor Level',
      '[IDENTITY] Room Name',
      '[PURPOSE] Room Classification',
      '[CAPACITY] Quantity',
      '[CAPACITY] Seating Capacity',
      '[DIMENSIONS] Net Length (mm)',
      '[DIMENSIONS] Net Width (mm)',
      '[DIMENSIONS] Net Height (mm)',
      '[IMPERIAL] Length (ft)',
      '[IMPERIAL] Width (ft)',
      '[IMPERIAL] Height (ft)',
      '[AREA] Area (sqm)',
      '[AREA] Area (sqft)',
      '[VOLUME] Volume (m3)'
    ];

    if (opts.includeDisplay) {
      headers.push('[AV DISPLAY] DISCAS Display Size');
      headers.push('[AV DIMS] Dimensions (mm)');
    }
    if (opts.includeSpeaker) headers.push('[AUDIO] Speaker Count');
    if (opts.includeCamera) headers.push('[VIDEO] Camera HFOV & Zoom');
    if (opts.includeFraming) headers.push('[VIDEO] Camera Framing Mode');
    if (opts.includeBar) headers.push('[AV HARDWARE] All-In-One Video Bar');
    if (opts.includeMic) headers.push('[AUDIO] Microphone Type & Qty');
    if (opts.includeAcoustics) headers.push('[ACOUSTICS] Speech RT60 (s)');
    if (opts.includeBudget) {
      headers.push('[BUDGET INR] Est. Room Budget (INR)');
      headers.push('[BUDGET INR] Total Floor Budget (INR)');
    }
    headers.push('[NOTES] Notes');
    csvRows.push(headers);

    var totalQty = 0;
    var totalSeats = 0;
    var totalAreaSqm = 0;
    var totalVolumeM3 = 0;
    var grandTotalCsvBudget = 0;
    var lastFloorSeen = null;

    rows.forEach(function(tr, idx) {
      var sl = String(idx + 1).padStart(2, '0');
      var fl = tr.querySelector('.inp-floor')?.value || '01';
      var name = tr.querySelector('.inp-name')?.value || ('Room ' + (idx + 1));
      var qty = parseInt(tr.querySelector('.inp-qty')?.value) || 1;
      var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;

      var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 0;
      var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 0;
      var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 0;

      var lenFt = (lm / 304.8).toFixed(2);
      var widFt = (wm / 304.8).toFixed(2);
      var hgtFt = (hm / 304.8).toFixed(2);

      var sqm = (lm * wm) / 1e6;
      var sqft = (sqm * 10.7639).toFixed(1);
      var m3 = (sqm * (hm / 1000.0)).toFixed(2);

      var purpose = tr.querySelector('.inp-purpose')?.value || 'meeting';

      var dispQtyRaw = tr.querySelector('.inp-disp-qty') ? parseInt(tr.querySelector('.inp-disp-qty').value) : 1;
      var isDispExcluded = dispQtyRaw === 0;
      var diagStr = isDispExcluded ? '0 (None / Excluded)' : (tr.querySelector('.out-calc-diag')?.innerText || '');
      var dimsStr = isDispExcluded ? 'Excluded' : (tr.querySelector('.out-calc-dims')?.innerText || '');

      var spkSize = tr.querySelector('.inp-spk-size')?.value || '6.5"';
      var spkCalc = calculateCeilingSpeakers(lm, wm, hm, spkSize);
      var spkQty = (spkSize === 'none') ? 0 : spkCalc.count;
      var spkCount = (spkSize === 'none' || spkQty === 0) ? '0 (Excluded)' : `${spkQty} Units`;

      var camQtyRaw = tr.querySelector('.inp-cam-qty') ? parseInt(tr.querySelector('.inp-cam-qty').value) : 1;
      var camModel = tr.querySelector('.inp-cam-model')?.value || 'auto';
      var isCamExcluded = (camModel === 'none' || camQtyRaw === 0);
      var camZoom = tr.querySelector('.inp-cam-zoom-num')?.value || '12';
      var camPos = tr.querySelector('.inp-cam-pos')?.value || 'above';
      var camHfovRaw = tr.querySelector('.out-cam-hfov')?.innerText?.trim() || '';
      var camMatch = camHfovRaw.match(/(\d+(\.\d+)?)/);
      var camHfov = isCamExcluded ? '0 (Excluded)' : (camMatch ? `${parseFloat(camMatch[1]).toFixed(1)} deg (${camZoom}x Zoom, ${camPos === 'below' ? 'Below Display' : 'Above Display'})` : `78.0 deg (${camZoom}x Zoom, ${camPos === 'below' ? 'Below Display' : 'Above Display'})`);

      var camFraming = isCamExcluded ? 'N/A (No Cam)' : (tr.querySelector('.out-framing-badge')?.innerText?.trim() || tr.querySelector('.inp-cam-framing')?.value || 'Group Framing');

      var barQtyRaw = tr.querySelector('.inp-bar-qty') ? parseInt(tr.querySelector('.inp-bar-qty').value) : 1;
      var barModel = tr.querySelector('.inp-video-bar')?.value || 'auto';
      var barPos = tr.querySelector('.inp-bar-pos')?.value || 'below';
      var isBarExcluded = (barModel === 'none' || barQtyRaw === 0);
      var barName = isBarExcluded ? '0 (None / Excluded)' : `${tr.querySelector('.out-bar-badge')?.innerText?.trim() || barModel || 'Auto Bar'} (${barPos === 'above' ? 'Above Display' : 'Below Display'})`;

      var micType = tr.querySelector('.inp-mic-type')?.value || 'auto';
      var micCalc = calculateMicrophones(lm, wm, seats, micType);
      var micQty = (micType === 'none') ? 0 : micCalc.qty;
      var micDesc = (micType === 'none' || micQty === 0) ? '0 (Excluded)' : `${micQty}x ${micCalc.displayDesc || micType}`;

      var rt60Str = tr.querySelector('.out-rt60')?.innerText?.trim() || '';
      var budgetRoom = tr.querySelector('.out-budget-room')?.innerText?.trim() || '₹0';
      var budgetTotal = tr.querySelector('.out-budget-total')?.innerText?.trim() || '₹0';
      var budgetObj = calculateRoomHardwareBudget(tr);
      grandTotalCsvBudget += budgetObj.totalForQty;

      var note = tr.querySelector('.inp-note')?.value || '';
      var floorPal = getFloorPalette(fl);
      var purpPal = getRoomPurposePalette(purpose);

      if (fl !== lastFloorSeen) {
        csvRows.push([
          `# >>> FLOOR ${fl} (${floorPal.name.toUpperCase()} - COLOR ACCENT: ${floorPal.badgeBg}) <<<`
        ]);
        lastFloorSeen = fl;
      }

      totalQty += qty;
      totalSeats += (seats * qty);
      totalAreaSqm += (sqm * qty);
      totalVolumeM3 += (parseFloat(m3) * qty);

      var rowData = [
        sl,
        `FL ${fl} [${floorPal.name}]`,
        name,
        `[${purpPal.label}]`,
        qty,
        seats,
        lm,
        wm,
        hm,
        lenFt,
        widFt,
        hgtFt,
        sqm.toFixed(2),
        sqft,
        m3
      ];

      if (opts.includeDisplay) {
        rowData.push(diagStr);
        rowData.push(dimsStr);
      }
      if (opts.includeSpeaker) rowData.push(spkCount);
      if (opts.includeCamera) rowData.push(camHfov);
      if (opts.includeFraming) rowData.push(camFraming);
      if (opts.includeBar) rowData.push(barName);
      if (opts.includeMic) rowData.push(micDesc);
      if (opts.includeAcoustics) rowData.push(rt60Str);
      if (opts.includeBudget) {
        rowData.push(budgetRoom);
        rowData.push(budgetTotal);
      }
      rowData.push(note);
      csvRows.push(rowData);
    });

    csvRows.push([]);
    csvRows.push(['# SUMMARY CONSOLIDATION &bull; HCMM VERIFIED']);
    csvRows.push(['Total Unique Room Types', rows.length]);
    csvRows.push(['Total Room Quantity', totalQty]);
    csvRows.push(['Total Seating Capacity', totalSeats]);
    csvRows.push(['Total Net Area (sqm)', totalAreaSqm.toFixed(2)]);
    csvRows.push(['Total Net Area (sqft)', (totalAreaSqm * 10.7639).toFixed(1)]);
    csvRows.push(['Total Volume (m3)', totalVolumeM3.toFixed(2)]);
    csvRows.push(['Total Estimated Hardware Budget (INR)', '₹' + grandTotalCsvBudget.toLocaleString('en-IN') + ' INR']);

    var csvContent = csvRows.map(function(row) {
      return row.map(function(cell) {
        if (cell === null || cell === undefined) return '""';
        var str = String(cell);
        if (str.search(/("|,|\n)/g) >= 0) {
          str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      }).join(',');
    }).join('\r\n');

    var safeFileName = `${projTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_HCMM_Schedule.csv`;
    var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = safeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert("Export to CSV Failed: " + err.message);
  }
}

// Quick export alias for Excel
function quickExportExcel(unitMode) {
  exportToExcel(unitMode);
}

// =========================================================================
// COLUMN VISIBILITY MANAGEMENT (Eliminate side scrolling & customize view)
// =========================================================================
function getHiddenMatrixColumns() {
  try {
    var raw = localStorage.getItem('proav_matrix_hidden_columns');
    if (raw) return new Set(JSON.parse(raw));
  } catch(e) {}
  return new Set();
}

function saveHiddenMatrixColumns(colSet) {
  try {
    localStorage.setItem('proav_matrix_hidden_columns', JSON.stringify(Array.from(colSet)));
  } catch(e) {}
}

function toggleColumnVisibility(colClass, btnElem) {
  var hidden = getHiddenMatrixColumns();
  if (hidden.has(colClass)) {
    hidden.delete(colClass);
  } else {
    hidden.add(colClass);
  }
  saveHiddenMatrixColumns(hidden);
  applyAllColumnVisibility();
}

function toggleMatrixColumnDirect(colClass, isVisible) {
  var hidden = getHiddenMatrixColumns();
  if (isVisible) {
    hidden.delete(colClass);
  } else {
    hidden.add(colClass);
  }
  saveHiddenMatrixColumns(hidden);
  applyAllColumnVisibility();
}

function showAllMatrixColumns() {
  saveHiddenMatrixColumns(new Set());
  applyAllColumnVisibility();
}

function focusAvSubsystemsColumns() {
  var hidden = new Set(['col-framing', 'col-acoustics', 'col-budget', 'col-sockets', 'col-lan', 'col-power']);
  saveHiddenMatrixColumns(hidden);
  applyAllColumnVisibility();
}

function applyAllColumnVisibility() {
  var hidden = getHiddenMatrixColumns();
  var allCols = [
    'col-display', 'col-camera', 'col-framing', 'col-bar', 
    'col-speaker', 'col-mic', 'col-acoustics', 'col-budget',
    'col-sockets', 'col-lan', 'col-power'
  ];

  allCols.forEach(function(colClass) {
    var isHidden = hidden.has(colClass);
    document.querySelectorAll('.' + colClass).forEach(function(el) {
      if (isHidden) {
        el.classList.add('d-none-col');
      } else {
        el.classList.remove('d-none-col');
      }
    });

    var btn = document.querySelector(`.col-filter-btn[data-col="${colClass}"]`);
    if (btn) {
      btn.classList.toggle('active', !isHidden);
      btn.classList.toggle('btn-outline-primary', !isHidden);
      btn.classList.toggle('btn-outline-secondary', isHidden);
      btn.style.opacity = isHidden ? '0.6' : '1';
    }

    var chk = document.querySelector(`.matrix-col-toggle-chk[data-col="${colClass}"]`);
    if (chk) {
      chk.checked = !isHidden;
    }
  });
}

function applyCurrentColumnVisibility(targetTr) {
  var hidden = getHiddenMatrixColumns();
  if (!targetTr) return;
  hidden.forEach(function(colClass) {
    targetTr.querySelectorAll('.' + colClass).forEach(function(el) {
      el.classList.add('d-none-col');
    });
  });
}

// =========================================================================
// UNIVERSAL STUDIO TARGET ROOM SYNCHRONIZATION ENGINE
// Allows any studio tab (Tabs 1, 1.5, 2, 2.5, 3, 4, 5, 6, Wall Structure)
// to target any specific room in the Spatial Room Matrix, load its geometry,
// apply studio engineering specifications, and highlight the updated row!
// =========================================================================
var ALL_STUDIO_ROOM_DROPDOWN_IDS = [
  'targetRoom_tab1',
  'targetRoom_tab1_5',
  'targetRoom_tab2',
  'targetRoom_tab2_5',
  'targetRoom_tab3',
  'targetRoom_tab4_cam',
  'vbTargetRoomSelect',
  'targetRoom_tab5',
  'targetRoom_tab6',
  'acMatrixRoomSelect',
  'targetRoom_wall'
];

function refreshAllStudioTargetRoomDropdowns() {
  var rows = document.querySelectorAll('#matrixTableBody tr');
  
  ALL_STUDIO_ROOM_DROPDOWN_IDS.forEach(function(id) {
    var sel = document.getElementById(id);
    if (!sel) return;
    var prevVal = sel.value;
    sel.innerHTML = '';

    if (rows.length === 0) {
      var opt = document.createElement('option');
      opt.value = 'new';
      opt.textContent = '+ Create New Room in Spatial Matrix';
      sel.appendChild(opt);
      return;
    }

    rows.forEach(function(tr, idx) {
      var name = tr.querySelector('.inp-name')?.value || ('Room ' + (idx + 1));
      var fl = tr.querySelector('.inp-floor')?.value || '01';
      var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 7000;
      var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 5000;
      var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;
      var seats = tr.querySelector('.inp-seats')?.value || '10';
      var opt = document.createElement('option');
      opt.value = idx.toString();
      opt.textContent = `Room ${idx + 1}: ${name} (Fl ${fl} • ${(lm/1000).toFixed(1)}m × ${(wm/1000).toFixed(1)}m • ${seats} seats)`;
      sel.appendChild(opt);
    });

    var newOpt = document.createElement('option');
    newOpt.value = 'new';
    newOpt.textContent = '+ Add as New Room in Spatial Matrix';
    sel.appendChild(newOpt);

    if (prevVal && sel.querySelector(`option[value="${prevVal}"]`)) {
      sel.value = prevVal;
    }
  });

  if (typeof refreshVbTargetRoomsDropdown === 'function') {
    refreshVbTargetRoomsDropdown();
  }
}

// Load selected Spatial Room Matrix room into a studio
function loadSelectedMatrixRoomToStudio(studioKey, selEl) {
  if (!selEl || selEl.value === 'new') return;
  var idx = parseInt(selEl.value);
  var rows = document.querySelectorAll('#matrixTableBody tr');
  var row = rows[idx];
  if (!row) return;

  var lm = parseFloat(row.querySelector('.inp-lm')?.value) || 7000;
  var wm = parseFloat(row.querySelector('.inp-wm')?.value) || 5000;
  var hm = parseFloat(row.querySelector('.inp-hm')?.value) || 2700;
  var seats = parseInt(row.querySelector('.inp-seats')?.value) || 10;
  var name = row.querySelector('.inp-name')?.value || `Room ${idx + 1}`;
  var purpose = row.querySelector('.inp-purpose')?.value || 'meeting';

  // Specific studio input field assignments
  if (studioKey === 'tab1' || studioKey === 'discas') {
    var lInp = document.getElementById('roomLength') || document.getElementById('discasRoomLength');
    var wInp = document.getElementById('roomWidth') || document.getElementById('discasRoomWidth');
    var hInp = document.getElementById('ceilingHeight') || document.getElementById('discasCeilingHeight');
    var sInp = document.getElementById('roomSeats') || document.getElementById('discasSeats');
    if (lInp) { lInp.value = (lm / 1000.0).toFixed(1); lInp.dispatchEvent(new Event('input')); }
    if (wInp) { wInp.value = (wm / 1000.0).toFixed(1); wInp.dispatchEvent(new Event('input')); }
    if (hInp) { hInp.value = (hm / 1000.0).toFixed(1); hInp.dispatchEvent(new Event('input')); }
    if (sInp) { sInp.value = seats; sInp.dispatchEvent(new Event('input')); }
    if (typeof calcDiscas === 'function') calcDiscas();
    else if (typeof calculateDISCAS === 'function') calculateDISCAS();
  } else if (studioKey === 'tab1_5' || studioKey === 'ifpd') {
    var lInp = document.getElementById('ifpdRoomLength');
    var wInp = document.getElementById('ifpdRoomWidth');
    var hInp = document.getElementById('ifpdRoomHeight');
    var sInp = document.getElementById('ifpdRoomSeats');
    if (lInp) { lInp.value = (lm / 1000.0).toFixed(1); lInp.dispatchEvent(new Event('input')); }
    if (wInp) { wInp.value = (wm / 1000.0).toFixed(1); wInp.dispatchEvent(new Event('input')); }
    if (hInp) { hInp.value = (hm / 1000.0).toFixed(1); hInp.dispatchEvent(new Event('input')); }
    if (sInp) { sInp.value = seats; sInp.dispatchEvent(new Event('input')); }
    if (typeof calcIfpd === 'function') calcIfpd();
    else if (typeof calculateIFPD === 'function') calculateIFPD();
  } else if (studioKey === 'tab2' || studioKey === 'dvled') {
    var lInp = document.getElementById('ledRoomLength');
    var wInp = document.getElementById('ledRoomWidth');
    var hInp = document.getElementById('ledRoomHeight');
    if (lInp) { lInp.value = (lm / 1000.0).toFixed(1); lInp.dispatchEvent(new Event('input')); }
    if (wInp) { wInp.value = (wm / 1000.0).toFixed(1); wInp.dispatchEvent(new Event('input')); }
    if (hInp) { hInp.value = (hm / 1000.0).toFixed(1); hInp.dispatchEvent(new Event('input')); }
    if (typeof calcLedWall === 'function') calcLedWall();
  } else if (studioKey === 'tab2_5') {
    var lInp = document.getElementById('ledWallDistInput');
    if (lInp) { lInp.value = (lm / 1000.0).toFixed(1); lInp.dispatchEvent(new Event('input')); }
    if (typeof calcLedPitchFromMode === 'function') calcLedPitchFromMode();
  } else if (studioKey === 'tab3' || studioKey === 'projection') {
    var lInp = document.getElementById('projRoomLength');
    var wInp = document.getElementById('projRoomWidth');
    var hInp = document.getElementById('projRoomHeight');
    if (lInp) { lInp.value = (lm / 1000.0).toFixed(1); lInp.dispatchEvent(new Event('input')); }
    if (wInp) { wInp.value = (wm / 1000.0).toFixed(1); wInp.dispatchEvent(new Event('input')); }
    if (hInp) { hInp.value = (hm / 1000.0).toFixed(1); hInp.dispatchEvent(new Event('input')); }
    if (typeof calcProjection === 'function') calcProjection();
  } else if (studioKey === 'tab4_cam' || studioKey === 'camera') {
    var d1_m = parseFloat(row.querySelector('.inp-cam-d1')?.value) || (lm * 0.28 / 1000.0);
    var span_m = parseFloat(row.querySelector('.inp-cam-wspan')?.value) || (wm * 0.55 / 1000.0);
    var d1Inp = document.getElementById('camD1Input') || document.getElementById('cameraD1');
    var spanInp = document.getElementById('camSpanInput') || document.getElementById('cameraSpan');
    var lInp = document.getElementById('cameraRoomLength');
    var wInp = document.getElementById('cameraRoomWidth');
    if (d1Inp) { d1Inp.value = d1_m.toFixed(1); d1Inp.dispatchEvent(new Event('input')); }
    if (spanInp) { spanInp.value = span_m.toFixed(1); spanInp.dispatchEvent(new Event('input')); }
    if (lInp) { lInp.value = (lm / 1000.0).toFixed(1); lInp.dispatchEvent(new Event('input')); }
    if (wInp) { wInp.value = (wm / 1000.0).toFixed(1); wInp.dispatchEvent(new Event('input')); }
    if (typeof calcCameraHFOV === 'function') calcCameraHFOV();
  } else if (studioKey === 'tab5' || studioKey === 'audio') {
    var lInp = document.getElementById('spkRoomLength') || document.getElementById('audioRoomLength');
    var wInp = document.getElementById('spkRoomWidth') || document.getElementById('audioRoomWidth');
    var hInp = document.getElementById('spkRoomHeight') || document.getElementById('audioCeilingHeight');
    var sInp = document.getElementById('audioSeats');
    if (lInp) { lInp.value = (lm / 1000.0).toFixed(1); lInp.dispatchEvent(new Event('input')); }
    if (wInp) { wInp.value = (wm / 1000.0).toFixed(1); wInp.dispatchEvent(new Event('input')); }
    if (hInp) { hInp.value = (hm / 1000.0).toFixed(1); hInp.dispatchEvent(new Event('input')); }
    if (sInp) { sInp.value = seats; sInp.dispatchEvent(new Event('input')); }
    if (typeof calcCeilingSpeakersStudio === 'function') calcCeilingSpeakersStudio();
  } else if (studioKey === 'tab6' || studioKey === 'acoustics') {
    var lInp = document.getElementById('acRoomLength');
    var wInp = document.getElementById('acRoomWidth');
    var hInp = document.getElementById('acRoomHeight');
    if (lInp) { lInp.value = (lm / 1000.0).toFixed(1); lInp.dispatchEvent(new Event('input')); }
    if (wInp) { wInp.value = (wm / 1000.0).toFixed(1); wInp.dispatchEvent(new Event('input')); }
    if (hInp) { hInp.value = (hm / 1000.0).toFixed(1); hInp.dispatchEvent(new Event('input')); }
    if (typeof calcAcousticsStudio === 'function') calcAcousticsStudio();
  } else if (studioKey === 'wall') {
    var wInp = document.getElementById('wallLengthInput') || document.getElementById('wallRoomWidth');
    var hInp = document.getElementById('wallHeightInput') || document.getElementById('wallRoomHeight');
    if (wInp) { wInp.value = (wm / 1000.0).toFixed(1); wInp.dispatchEvent(new Event('input')); }
    if (hInp) { hInp.value = (hm / 1000.0).toFixed(1); hInp.dispatchEvent(new Event('input')); }
    if (typeof calcWallStructure === 'function') calcWallStructure();
  }
}

// Apply studio calculations directly to target row in Spatial Room Matrix
function applyStudioToSpatialMatrix(studioKey) {
  var selId = 'targetRoom_' + studioKey;
  if (studioKey === 'tab4_bar') selId = 'vbTargetRoomSelect';
  var sel = document.getElementById(selId);
  var targetVal = sel ? sel.value : '0';
  var rows = document.querySelectorAll('#matrixTableBody tr');
  var targetRow = null;
  var targetRoomIdx = 1;
  var targetRoomName = '';
  var specDesc = 'Studio Specifications';

  if (targetVal === 'new' || rows.length === 0) {
    if (typeof addRoomRowWithData === 'function') {
      addRoomRowWithData({
        floor: '01',
        name: 'New AV Space',
        qty: 1,
        seats: 10,
        l: 7000,
        w: 5000,
        h: 2700,
        purpose: 'meeting',
        pitch: 1.25
      });
      rows = document.querySelectorAll('#matrixTableBody tr');
      targetRow = rows[rows.length - 1];
      targetRoomIdx = rows.length;
      targetRoomName = targetRow.querySelector('.inp-name')?.value || ('Room ' + targetRoomIdx);
    }
  } else {
    var idx = parseInt(targetVal) || 0;
    targetRow = rows[idx] || rows[0];
    targetRoomIdx = idx + 1;
    targetRoomName = targetRow.querySelector('.inp-name')?.value || ('Room ' + targetRoomIdx);
  }

  if (!targetRow) return;

  // Apply parameters from specific studios
  if (studioKey === 'tab1' || studioKey === 'discas') {
    var purposeSel = targetRow.querySelector('.inp-purpose');
    if (purposeSel) purposeSel.value = 'meeting';
    specDesc = 'DISCAS Display Sizing Specifications';
  } else if (studioKey === 'tab1_5' || studioKey === 'ifpd') {
    var purposeSel = targetRow.querySelector('.inp-purpose');
    if (purposeSel) purposeSel.value = 'interactive';
    specDesc = 'Interactive Touch IFPD Sizing';
  } else if (studioKey === 'tab2' || studioKey === 'dvled') {
    var purposeSel = targetRow.querySelector('.inp-purpose');
    if (purposeSel) purposeSel.value = 'videowall';
    var pitchInp = targetRow.querySelector('.inp-pitch');
    var sourcePitch = document.getElementById('ledPitchSelect')?.value || 1.25;
    if (pitchInp) pitchInp.value = sourcePitch;
    specDesc = 'dvLED Video Wall Array Specifications';
  } else if (studioKey === 'tab4_cam') {
    var camModelInp = document.getElementById('camModelSelect');
    if (camModelInp && targetRow.querySelector('.inp-cam-model')) {
      targetRow.querySelector('.inp-cam-model').value = camModelInp.value;
    }
    var d1Inp = document.getElementById('camD1Input');
    if (d1Inp && targetRow.querySelector('.inp-cam-d1')) {
      targetRow.querySelector('.inp-cam-d1').value = d1Inp.value;
    }
    specDesc = 'PTZ Camera System & Optical HFOV';
  } else if (studioKey === 'tab5') {
    var spkSizeSel = document.getElementById('spkSizeSelect');
    if (spkSizeSel && targetRow.querySelector('.inp-spk-size')) {
      targetRow.querySelector('.inp-spk-size').value = spkSizeSel.value;
    }
    specDesc = 'Loudspeaker & Microphone System Architecture';
  } else if (studioKey === 'tab6') {
    specDesc = 'Acoustics & RT60 Absorption Design';
  } else if (studioKey === 'tab3') {
    specDesc = 'Laser Projection System Specifications';
  } else if (studioKey === 'tab2_5') {
    specDesc = 'dvLED Pixel Pitch & Display Sizing';
  } else if (studioKey === 'wall') {
    specDesc = 'Wall Structural Anchor & Load Bearing Specs';
  }

  // Recalculate row
  if (typeof recalcRoomRow === 'function') {
    recalcRoomRow(targetRow);
  }
  if (typeof updateMatrixTotalsAndSummary === 'function') {
    updateMatrixTotalsAndSummary();
  }

  // Green pulse animation on Sockets & LAN
  targetRow.querySelectorAll('.socket-pulse-target').forEach(function(el) {
    el.classList.add('socket-pulse');
    setTimeout(function() { el.classList.remove('socket-pulse'); }, 1400);
  });

  // Highlight row
  document.querySelectorAll('#matrixTableBody tr').forEach(function(r) { r.classList.remove('table-active-room'); });
  targetRow.classList.add('table-active-room');

  // Show inline confirmation banner in that studio tab
  var bannerId = 'syncBanner_' + studioKey;
  var bannerEl = document.getElementById(bannerId);
  var toastMsg = `✓ Successfully applied ${specDesc} to Room ${targetRoomIdx} ("${targetRoomName}") in the Spatial Room Matrix!`;
  
  if (bannerEl) {
    bannerEl.innerHTML = `
      <div class="alert alert-success d-flex align-items-center justify-content-between p-2 mb-2 font-mono shadow-sm" style="font-size:0.80rem;">
        <div><i class="fa-solid fa-circle-check me-2 text-success"></i>${toastMsg}</div>
        <button type="button" class="btn btn-sm btn-outline-success fw-bold py-0.5 px-2 ms-2" onclick="openTab(null, 'Tab10')">View Room in Matrix →</button>
      </div>
    `;
    bannerEl.style.display = 'block';
  }

  refreshAllStudioTargetRoomDropdowns();
}

// =========================================================================
// DEVICE PRICING PRESETS & RATES MODAL (INR ₹)
// Explains the commercial pricing basis and allows user overrides
// =========================================================================
function openDevicePricingModal() {
  var rates = getDevicePricingRates();

  var map = {
    'rateSmallBar': rates.smallBar,
    'rateMidBar': rates.midBar,
    'rateLargeBar': rates.largeBar,
    'rateExecBar': rates.execBar,
    'rateCam120': rates.cam120,
    'rateCam85': rates.cam85,
    'rateCam72': rates.cam72,
    'rateCam60': rates.cam60,
    'rateCamDual': rates.camDual,
    'rateCam360': rates.cam360,
    'rateSpk25': rates.spk25,
    'rateSpk40': rates.spk40,
    'rateSpk525': rates.spk525,
    'rateSpk65': rates.spk65,
    'rateSpk80': rates.spk80,
    'rateSpk100': rates.spk100,
    'rateSpk120': rates.spk120,
    'rateSpkPendant65': rates.spkPendant65,
    'rateSpkAmpBudget': rates.spkAmpBudget,
    'rateMicCeilingArray': rates.micCeilingArray,
    'rateMicTableBoundary': rates.micTableBoundary,
    'rateMicTableGooseneck': rates.micTableGooseneck,
    'rateMicPendant': rates.micPendant
  };

  Object.keys(map).forEach(function(id) {
    var el = document.getElementById(id);
    if (el && map[id] !== undefined) el.value = map[id];
  });

  var modalEl = document.getElementById('devicePricingModal');
  if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function saveCustomPricingFromModal() {
  var newRates = {
    smallBar: parseFloat(document.getElementById('rateSmallBar')?.value) || 165000,
    midBar: parseFloat(document.getElementById('rateMidBar')?.value) || 225000,
    largeBar: parseFloat(document.getElementById('rateLargeBar')?.value) || 315000,
    execBar: parseFloat(document.getElementById('rateExecBar')?.value) || 430000,
    cam120: parseFloat(document.getElementById('rateCam120')?.value) || 78000,
    cam85: parseFloat(document.getElementById('rateCam85')?.value) || 135000,
    cam72: parseFloat(document.getElementById('rateCam72')?.value) || 198000,
    cam60: parseFloat(document.getElementById('rateCam60')?.value) || 315000,
    camDual: parseFloat(document.getElementById('rateCamDual')?.value) || 395000,
    cam360: parseFloat(document.getElementById('rateCam360')?.value) || 105000,
    spk25: parseFloat(document.getElementById('rateSpk25')?.value) || 9800,
    spk40: parseFloat(document.getElementById('rateSpk40')?.value) || 13200,
    spk525: parseFloat(document.getElementById('rateSpk525')?.value) || 15600,
    spk65: parseFloat(document.getElementById('rateSpk65')?.value) || 19800,
    spk80: parseFloat(document.getElementById('rateSpk80')?.value) || 28500,
    spk100: parseFloat(document.getElementById('rateSpk100')?.value) || 39000,
    spk120: parseFloat(document.getElementById('rateSpk120')?.value) || 54000,
    spkPendant65: parseFloat(document.getElementById('rateSpkPendant65')?.value) || 31000,
    spkPendant80: 38000,
    spkAmpBudget: parseFloat(document.getElementById('rateSpkAmpBudget')?.value) || 28000,
    micCeilingArray: parseFloat(document.getElementById('rateMicCeilingArray')?.value) || 265000,
    micTableBoundary: parseFloat(document.getElementById('rateMicTableBoundary')?.value) || 28500,
    micTableGooseneck: parseFloat(document.getElementById('rateMicTableGooseneck')?.value) || 36500,
    micPendant: parseFloat(document.getElementById('rateMicPendant')?.value) || 49000
  };

  saveDevicePricingRates(newRates);

  // Recalculate all rooms in the matrix table
  document.querySelectorAll('#matrixTableBody tr').forEach(function(tr) {
    recalcRoomRow(tr);
  });
  updateMatrixTotalsAndSummary();

  var modalEl = document.getElementById('devicePricingModal');
  if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    var modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
}

function resetPricingModalToDefaults() {
  saveDevicePricingRates(DEFAULT_DEVICE_PRICING);
  openDevicePricingModal();

  document.querySelectorAll('#matrixTableBody tr').forEach(function(tr) {
    recalcRoomRow(tr);
  });
  updateMatrixTotalsAndSummary();
}

// =========================================================================
// CUSTOMIZED EXPORT OPTIONS MODAL (Metric/Imperial + Subsystem Selectors)
// =========================================================================
function openExportOptionsModal() {
  var modalEl = document.getElementById('exportOptionsModal');
  if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function setExportOptionsAll(checked) {
  ['expColDisplay', 'expColCamera', 'expColFraming', 'expColBar', 'expColSpeaker', 'expColMic', 'expColAcoustics', 'expColBudget'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.checked = checked;
  });
}

function setExportOptionsDefaults() {
  setExportOptionsAll(true);
  var metricRadio = document.getElementById('expUnitMetric');
  if (metricRadio) metricRadio.checked = true;
}

function getSelectedExportOptions() {
  var isMetric = document.getElementById('expUnitImperial')?.checked ? false : true;
  return {
    isMetric: isMetric,
    unitMode: isMetric ? 'mm' : 'ft',
    includeDisplay: document.getElementById('expColDisplay') ? document.getElementById('expColDisplay').checked : true,
    includeCamera: document.getElementById('expColCamera') ? document.getElementById('expColCamera').checked : true,
    includeFraming: document.getElementById('expColFraming') ? document.getElementById('expColFraming').checked : true,
    includeBar: document.getElementById('expColBar') ? document.getElementById('expColBar').checked : true,
    includeSpeaker: document.getElementById('expColSpeaker') ? document.getElementById('expColSpeaker').checked : true,
    includeMic: document.getElementById('expColMic') ? document.getElementById('expColMic').checked : true,
    includeAcoustics: document.getElementById('expColAcoustics') ? document.getElementById('expColAcoustics').checked : true,
    includeBudget: document.getElementById('expColBudget') ? document.getElementById('expColBudget').checked : true
  };
}

function triggerCustomExport(format) {
  var opts = getSelectedExportOptions();
  var modalEl = document.getElementById('exportOptionsModal');
  if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    var modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  if (format === 'excel') {
    exportToExcel(opts.unitMode, opts);
  } else if (format === 'csv') {
    exportToCSV(opts);
  } else if (format === 'pdf') {
    exportToPDF('landscape', opts);
  }
}


function exportToJSON() {
  try {
    var projTitle = document.getElementById('matrixProjectNameInput')?.value || 'Pro AV Architectural Schedule';
    var rows = document.querySelectorAll('#matrixTableBody tr');
    if (!rows || rows.length === 0) {
      alert('No room schedule data available to export.');
      return;
    }

    var totalQty = 0;
    var totalSeats = 0;
    var totalAreaSqm = 0;
    var totalVolumeM3 = 0;

    var roomList = [];

    rows.forEach((tr, idx) => {
      var fl = tr.querySelector('.inp-floor')?.value || '';
      var name = tr.querySelector('.inp-name')?.value || '';
      var qty = parseInt(tr.querySelector('.inp-qty')?.value) || 1;
      var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;

      var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 0;
      var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 0;
      var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 0;

      var lenFt = parseFloat((lm / 304.8).toFixed(2));
      var widFt = parseFloat((wm / 304.8).toFixed(2));
      var hgtFt = parseFloat((hm / 304.8).toFixed(2));

      var sqm = parseFloat(((lm * wm) / 1e6).toFixed(2));
      var sqft = parseFloat((sqm * 10.7639).toFixed(1));
      var m3 = parseFloat((sqm * (hm / 1000.0)).toFixed(2));

      var purpose = tr.querySelector('.inp-purpose')?.value || 'meeting';
      var pitch = parseFloat(tr.querySelector('.inp-pitch')?.value) || 1.25;
      var diagStr = tr.querySelector('.out-calc-diag')?.innerText || '';
      var dimsStr = tr.querySelector('.out-calc-dims')?.innerText || '';
      var rt60Str = tr.querySelector('.out-rt60')?.innerText || '';
      var note = tr.querySelector('.inp-note')?.value || '';

      totalQty += qty;
      totalSeats += (seats * qty);
      totalAreaSqm += (sqm * qty);
      totalVolumeM3 += (m3 * qty);

      var purposeLabel = '5H Standard Meeting Room';
      if (purpose === 'uc') purposeLabel = '4.5H Unified Communications (80% Content)';
      if (purpose === 'videowall') purposeLabel = `dvLED Direct View Video Wall (P${pitch}mm)`;
      if (purpose === 'interactive') purposeLabel = '6H Interactive Touch IFPD';

      roomList.push({
        slNo: idx + 1,
        floor: fl,
        roomName: name,
        quantity: qty,
        seatsPerRoom: seats,
        totalSeats: seats * qty,
        dimensions: {
          netLengthMm: lm,
          netWidthMm: wm,
          netHeightMm: hm,
          lengthFt: lenFt,
          widthFt: widFt,
          heightFt: hgtFt,
          areaSqm: sqm,
          areaSqft: sqft,
          volumeM3: m3
        },
        displayEngineering: {
          purposeKey: purpose,
          purposeDescription: purposeLabel,
          pitchMm: (purpose === 'videowall') ? pitch : null,
          recommendedDiagonal: diagStr,
          activeDimensionsMm: dimsStr,
          furthestViewerDistanceM: parseFloat((lm / 1000.0).toFixed(2)),
          closestViewerDistanceM: parseFloat(((wm / 1000.0) * 1.0).toFixed(2))
        },
        acoustics: {
          speechRT60Seconds: rt60Str,
          recommendedTarget: '0.45s - 0.65s (Good Speech Intelligibility)'
        },
        notes: note
      });
    });

    var exportObject = {
      project: projTitle,
      exportTimestamp: new Date().toISOString(),
      standards: [
        'AVIXA DISCAS 5H Meeting Room Standard',
        'AVIXA Unified Communications 80% Content Rule',
        'Sabine RT60 Acoustic Formula',
        'Physical Clear Usable Interior Net Dimensioning'
      ],
      consolidationSummary: {
        totalUniqueRoomTypes: rows.length,
        totalRoomQuantity: totalQty,
        totalSeatingCapacity: totalSeats,
        totalAreaSqm: parseFloat(totalAreaSqm.toFixed(2)),
        totalAreaSqft: parseFloat((totalAreaSqm * 10.7639).toFixed(1)),
        totalVolumeM3: parseFloat(totalVolumeM3.toFixed(2))
      },
      rooms: roomList
    };

    var jsonContent = JSON.stringify(exportObject, null, 2);
    var safeFileName = `${projTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Matrix_Schedule.json`;
    var blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = safeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert("Export to JSON Failed: " + err.message);
  }
}

// ==========================================
// INTERACTIVE 3D ROOM SCHEDULE VISUALIZER
// ==========================================
function switchMatrixVisView(mode) {
  activeMatrixVisView = mode;
  document.querySelectorAll('.matrix-vis-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === mode);
  });
  if (activeMatrixRoomData) {
    renderMatrix3DRoomVisualizer(activeMatrixRoomData);
  }
}

function toggleSpeakerOverlap() {
  showSpeakerOverlap = !showSpeakerOverlap;
  var btn = document.getElementById('btnToggleOverlap');
  var badge = document.getElementById('badgeOverlapStatus');
  if (badge) {
    badge.innerText = showSpeakerOverlap ? 'ON' : 'OFF';
    badge.className = showSpeakerOverlap ? 'badge bg-emerald-500 text-black px-1.5 py-0.5 ms-1 fw-bold' : 'badge bg-secondary text-white px-1.5 py-0.5 ms-1 fw-bold';
  }
  if (btn) {
    btn.classList.toggle('active', showSpeakerOverlap);
    btn.style.borderColor = showSpeakerOverlap ? '#10b981' : '#64748b';
    btn.style.color = showSpeakerOverlap ? '#34d399' : '#94a3b8';
  }
  if (activeMatrixRoomData) {
    renderMatrix3DRoomVisualizer(activeMatrixRoomData);
  }
}

function toggleAcousticHeatmap() {
  showAcousticHeatmap = !showAcousticHeatmap;
  var btn = document.getElementById('btnToggleAcousticHeatmap');
  var badge = document.getElementById('badgeHeatmapStatus');
  if (badge) {
    badge.innerText = showAcousticHeatmap ? 'ON' : 'OFF';
    badge.className = showAcousticHeatmap ? 'badge bg-cyan-500 text-black px-1.5 py-0.5 ms-1 fw-bold' : 'badge bg-secondary text-white px-1.5 py-0.5 ms-1 fw-bold';
  }
  if (btn) {
    btn.classList.toggle('active', showAcousticHeatmap);
    btn.style.borderColor = showAcousticHeatmap ? '#06b6d4' : '#64748b';
    btn.style.color = showAcousticHeatmap ? '#22d3ee' : '#94a3b8';
  }
  if (activeMatrixRoomData) {
    renderMatrix3DRoomVisualizer(activeMatrixRoomData);
  }
}

function selectMatrixRoomFor3D(tr) {
  if (!tr) return;
  document.querySelectorAll('#matrixTableBody tr').forEach(r => r.classList.remove('table-active-room'));
  tr.classList.add('table-active-room');

  var fl = tr.querySelector('.inp-floor')?.value || '01';
  var name = tr.querySelector('.inp-name')?.value || 'Room';
  var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;
  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 7000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 5000;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;
  var purpose = tr.querySelector('.inp-purpose')?.value || 'meeting';
  var pitch = parseFloat(tr.querySelector('.inp-pitch')?.value) || 1.25;
  var rt60 = tr.querySelector('.out-rt60')?.innerText || '0.52s';
  var diag = tr.querySelector('.out-calc-diag')?.innerText || '85"';
  var dims = tr.querySelector('.out-calc-dims')?.innerText || '1882 × 1058 mm';

  var dispQty = tr.querySelector('.inp-disp-qty') ? parseInt(tr.querySelector('.inp-disp-qty').value) : 1;
  var spkSize = tr.querySelector('.inp-spk-size')?.value || '6.5"';
  var spkCalc = calculateCeilingSpeakers(lm, wm, hm, spkSize);
  var spkQtyRaw = tr.querySelector('.inp-spk-qty') ? parseInt(tr.querySelector('.inp-spk-qty').value) : spkCalc.count;
  var spkQty = isNaN(spkQtyRaw) ? spkCalc.count : spkQtyRaw;

  var camD1 = parseFloat(tr.querySelector('.inp-cam-d1')?.value) || Math.max(1.5, (lm/1000)*0.28);
  var camWspan = parseFloat(tr.querySelector('.inp-cam-wspan')?.value) || Math.max(1.6, (wm/1000)*0.55);
  var camModel = tr.querySelector('.inp-cam-model')?.value || 'auto';
  var camQtyRaw = tr.querySelector('.inp-cam-qty') ? parseInt(tr.querySelector('.inp-cam-qty').value) : (camModel === 'none' ? 0 : 1);
  var camQty = isNaN(camQtyRaw) ? (camModel === 'none' ? 0 : 1) : camQtyRaw;
  var camPos = tr.querySelector('.inp-cam-pos')?.value || 'above';
  var camZoomFactor = parseFloat(tr.querySelector('.inp-cam-zoom-num')?.value) || 12;
  var camFraming = tr.querySelector('.inp-cam-framing')?.value || 'auto';

  var videoBarType = tr.querySelector('.inp-video-bar')?.value || 'auto';
  var barPos = tr.querySelector('.inp-bar-pos')?.value || 'below';
  var barQty = tr.querySelector('.inp-bar-qty') ? parseInt(tr.querySelector('.inp-bar-qty').value) : 1;

  var micType = tr.querySelector('.inp-mic-type')?.value || 'auto';
  var micCalc = calculateMicrophones(lm, wm, seats, micType);
  var micQtyRaw = tr.querySelector('.inp-mic-qty') ? parseInt(tr.querySelector('.inp-mic-qty').value) : micCalc.qty;
  var micQty = isNaN(micQtyRaw) ? micCalc.qty : micQtyRaw;

  var spkPos = tr.querySelector('.inp-spk-pos')?.value || 'ceiling';
  var micPos = tr.querySelector('.inp-mic-pos')?.value || 'ceiling';

  var camCalc = calculateCameraHFOV(lm, wm, camD1, camWspan, camModel, camZoomFactor);
  var dispCalc = calculateDisplayForPurpose(lm, purpose, pitch);
  var framingCalc = calculateCameraFramingMode(purpose, seats, lm, wm, camD1, camCalc.hfovDeg, camCalc.selectedModel, camFraming);

  activeMatrixRoomData = {
    tr: tr,
    floor: fl, name: name, seats: seats, l: lm, w: wm, h: hm,
    purpose: purpose, pitch: pitch, rt60: rt60,
    dispQty: dispQty,
    diag: dispQty === 0 ? '0 (None / Excluded)' : (dispCalc.diagStr || diag),
    dims: `${dispCalc.w_mm} × ${dispCalc.h_mm} mm`,
    w_mm: dispCalc.w_mm, h_mm: dispCalc.h_mm,
    firstP: dispCalc.firstP, lastP: dispCalc.lastP,
    spkSize: spkSize, spkCount: spkQty === 0 ? 0 : spkCalc.count,
    spkQty: spkQty, spkPos: spkPos, spkCols: spkCalc.cols, spkRows: spkCalc.rows,
    spkSpacing: spkCalc.spacing, spkOverlapPercent: spkCalc.overlapPercent,
    spkGrid: `Grid: ${spkCalc.cols} × ${spkCalc.rows}`,
    camD1: camCalc.d1, camWspan: camCalc.wSpan, camHfov: camCalc.hfovStr,
    camModel: camCalc.selectedModel, camQty: camQty, camPos: camPos,
    camZoomFactor: camCalc.zoomFactor, camReach: camCalc.maxEffectiveDist,
    camFraming: camFraming, framingName: framingCalc.selectedMode,
    videoBar: videoBarType, barPos: barPos, barQty: barQty,
    micType: micCalc.type, micPos: micPos, micDesc: micQty === 0 ? '0 (Excluded)' : micCalc.displayDesc, micQty: micQty
  };

  renderMatrix3DRoomVisualizer(activeMatrixRoomData);
}

function renderMatrix3DRoomVisualizer(d) {
  var container = document.getElementById('matrixRoom3DSvgContainer');
  if (!container) return;

  container.style.display = 'block';
  container.style.minHeight = '480px';
  container.style.width = '100%';

  if (!d) return;

  var hudEl = document.getElementById('matrixRoom3DHud');
  if (hudEl) {
    hudEl.innerHTML = `
      <div class="d-flex align-items-center gap-2 flex-wrap p-2 rounded bg-slate-900 border border-slate-800 shadow-sm mb-2">
        <span class="badge bg-primary px-2 py-1 fs-7"><i class="fa-solid fa-cube me-1"></i>[FL ${d.floor}] ${d.name}</span>
        <span class="badge bg-dark border border-slate-700 text-info" title="Room Dimensions & Seating Capacity">
          <i class="fa-solid fa-ruler-combined me-1"></i>${(d.l/1000).toFixed(1)}m × ${(d.w/1000).toFixed(1)}m × ${(d.h/1000).toFixed(1)}m &bull; ${(d.l*d.w/1e6).toFixed(1)} m² &bull; ${d.seats} Seats
        </span>
        <span class="badge bg-dark border border-blue-500 text-blue-300" title="DISCAS Screen Sizing">
          <i class="fa-solid fa-tv me-1 text-primary"></i>Display: <strong>${d.dispQty === 0 ? '0 (Excluded)' : `${d.dispQty} × ${d.diag}`}</strong>
        </span>
        <span class="badge bg-dark border border-cyan-500 text-cyan-300" title="Loudspeaker Placement & Coverage">
          <i class="fa-solid fa-volume-high me-1 text-info"></i>Speakers: <strong>${d.spkQty === 0 ? '0 (Excluded)' : `${d.spkQty} Units &bull; ${d.spkPos.toUpperCase().replace('_', ' ')} (${d.spkSize})`}</strong>
        </span>
        <span class="badge bg-dark border border-indigo-500 text-indigo-300" title="PTZ Camera Optical Field of View & Placement">
          <i class="fa-solid fa-video me-1 text-indigo-400"></i>Camera: <strong>${d.camQty === 0 ? '0 (Excluded)' : `${d.camQty} Units &bull; ${d.camPos.toUpperCase().replace('_', ' ')} &bull; ${d.camHfov}`}</strong>
        </span>
        <span class="badge bg-dark border border-teal-500 text-teal-300" title="Unified Video Bar Hardware & Mounting Position">
          <i class="fa-solid fa-bars-staggered me-1 text-teal-400"></i>Video Bar: <strong>${(d.videoBar && d.videoBar !== 'none' && d.barQty > 0) ? `${d.barQty}x ${d.videoBar.toUpperCase()} [${d.barPos === 'above' ? 'Above Display' : 'Below Display'}]` : 'Excluded'}</strong>
        </span>
        <span class="badge bg-dark border border-purple-500 text-purple-300" title="Camera Framing Mode">
          <i class="fa-solid fa-expand me-1 text-purple-400"></i>Framing: <strong>${d.camQty === 0 ? 'N/A' : d.framingName}</strong>
        </span>
        <span class="badge bg-dark border border-amber-500 text-amber-300" title="Microphone Pickup & Placement">
          <i class="fa-solid fa-microphone me-1 text-warning"></i>Mic: <strong>${d.micQty === 0 ? '0 (Excluded)' : `${d.micQty} Units &bull; ${d.micPos.toUpperCase().replace('_', ' ')} &bull; ${d.micDesc}`}</strong>
        </span>
        <span class="badge bg-dark border border-emerald-500 text-emerald-300" title="Reverberation Time RT60">
          <i class="fa-solid fa-wave-square me-1 text-success"></i>RT60: <strong>${d.rt60}</strong>
        </span>
      </div>
    `;
  }

  var svgW = 960, svgH = 480;
  var L = d.l / 1000.0;
  var W = d.w / 1000.0;
  var H = d.h / 1000.0;
  var cols = Math.max(1, d.spkCols || 2);
  var rows = Math.max(1, d.spkRows || 2);
  var isSpkActive = d.spkQty > 0 && d.spkSize !== 'none';
  var isCamActive = d.camQty > 0 && d.camModel !== 'none';

  if (activeMatrixVisView === '3D') {
    // Generate dynamic ceiling loudspeaker grid in isometric perspective
    var spkIsometricSvg = '';
    var heatmapIsometricSvg = '';
    var spkFloorFootprints = [];

    if (isSpkActive) {
      var spkCounter = 1;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var u = cols === 1 ? 0.5 : (c + 0.5) / cols;
          var v = rows === 1 ? 0.5 : (r + 0.5) / rows;

          // Ceiling Quad mapping:
          // Front ceiling: (160, 142) -> (500, 190)
          // Back ceiling:  (520, 72)  -> (860, 122)
          var pFrontX = 160 + u * (500 - 160);
          var pFrontY = 142 + u * (190 - 142);
          var pBackX = 520 + u * (860 - 520);
          var pBackY = 72 + u * (122 - 72);
          var sx = pFrontX + v * (pBackX - pFrontX);
          var sy = pFrontY + v * (pBackY - pFrontY);

          // Floor Quad mapping:
          // Front floor: (140, 360) -> (480, 410)
          // Back floor:  (540, 260) -> (880, 310)
          var fFrontX = 140 + u * (480 - 140);
          var fFrontY = 360 + u * (410 - 360);
          var fBackX = 540 + u * (880 - 540);
          var fBackY = 260 + u * (310 - 260);
          var fx = fFrontX + v * (fBackX - fFrontX);
          var fy = fFrontY + v * (fBackY - fFrontY);

          var coneSpread = 24 + (parseFloat(d.spkSize) || 6.5) * 1.8;
          var earPlaneY = fy - 28; // Seated ear level AFFL 1.2m
          spkFloorFootprints.push({ sx: sx, sy: sy, fx: fx, fy: fy, earY: earPlaneY, spread: coneSpread, r: r, c: c, id: spkCounter });

          // Heatmap floor spot underneath each loudspeaker
          if (showAcousticHeatmap) {
            heatmapIsometricSvg += `
              <ellipse cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="${(coneSpread * 1.35).toFixed(1)}" ry="${(coneSpread * 0.65).toFixed(1)}" fill="url(#mIsoHeatmapGrad)" opacity="0.75"/>
              <ellipse cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="${(coneSpread * 0.75).toFixed(1)}" ry="${(coneSpread * 0.35).toFixed(1)}" fill="#06b6d4" opacity="0.32"/>
            `;
          }

          // Overlap indicators on floor/ear plane
          var overlapRingsSvg = '';
          if (showSpeakerOverlap) {
            overlapRingsSvg = `
              <ellipse cx="${fx.toFixed(1)}" cy="${earPlaneY.toFixed(1)}" rx="${(coneSpread * 1.05).toFixed(1)}" ry="${(coneSpread * 0.50).toFixed(1)}" fill="rgba(16,185,129,0.12)" stroke="#10b981" stroke-width="1.2" stroke-dasharray="3,2"/>
              <ellipse cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="${coneSpread.toFixed(1)}" ry="${(coneSpread * 0.45).toFixed(1)}" fill="rgba(6,182,212,0.06)" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2,2"/>
            `;
          }

          spkIsometricSvg += `
            <g>
              ${overlapRingsSvg}
              <!-- Dispersion Cone from ceiling down to floor footprint -->
              <polygon points="${sx.toFixed(1)},${sy.toFixed(1)} ${(fx - coneSpread).toFixed(1)},${earPlaneY.toFixed(1)} ${(fx + coneSpread).toFixed(1)},${earPlaneY.toFixed(1)}" fill="url(#mSpkConeGrad)" stroke="rgba(56,189,248,0.22)" stroke-width="0.8" stroke-dasharray="2,2"/>
              <!-- Ceiling Speaker Driver -->
              <ellipse cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" rx="8" ry="4" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
              <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="2.5" fill="#ffffff"/>
              <text x="${(sx + 10).toFixed(1)}" y="${(sy + 3).toFixed(1)}" font-size="7.5" font-weight="bold" fill="#7dd3fc">Spk ${spkCounter} (${d.spkSize})</text>
            </g>
          `;
          spkCounter++;
        }
      }

      // Add dynamic overlap interconnect lines between adjacent speakers when overlap is ON
      if (showSpeakerOverlap && spkFloorFootprints.length > 1) {
        var overlapLinesSvg = '';
        for (var i = 0; i < spkFloorFootprints.length; i++) {
          for (var j = i + 1; j < spkFloorFootprints.length; j++) {
            var s1 = spkFloorFootprints[i];
            var s2 = spkFloorFootprints[j];
            var isNeighbor = (Math.abs(s1.r - s2.r) + Math.abs(s1.c - s2.c)) === 1;
            if (isNeighbor) {
              var midX = (s1.fx + s2.fx) / 2.0;
              var midY = (s1.earY + s2.earY) / 2.0;
              overlapLinesSvg += `
                <line x1="${s1.fx.toFixed(1)}" y1="${s1.earY.toFixed(1)}" x2="${s2.fx.toFixed(1)}" y2="${s2.earY.toFixed(1)}" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3"/>
                <ellipse cx="${midX.toFixed(1)}" cy="${midY.toFixed(1)}" rx="10" ry="5" fill="#10b981" opacity="0.4"/>
              `;
            }
          }
        }
        spkIsometricSvg = overlapLinesSvg + spkIsometricSvg;
      }
    } else {
      spkIsometricSvg = `
        <g transform="translate(480, 110)">
          <rect x="-140" y="-14" width="280" height="28" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="0" y="4" font-size="9" font-weight="bold" fill="#94a3b8" text-anchor="middle"><i class="fa-solid fa-ban me-1"></i>Ceiling Loudspeakers Excluded (0 Units Budgeted)</text>
        </g>
      `;
    }

    // Generate dynamic microphone architecture in 3D
    var micIsometricSvg = '';
    if (d.micQty === 0 || d.micType === 'none') {
      micIsometricSvg = `
        <g transform="translate(560, 310)">
          <text x="0" y="0" font-size="8" font-weight="bold" fill="#94a3b8" text-anchor="middle">Microphones Excluded (0 Units)</text>
        </g>
      `;
    } else if (d.micType === 'table_boundary') {
      var bCount = Math.min(Math.max(1, Math.round(d.seats / 4)), 4);
      for (var b = 0; b < bCount; b++) {
        var frac = bCount === 1 ? 0.5 : (b + 0.5) / bCount;
        var bx = 470 + frac * 130;
        var by = 318 - frac * 12;
        micIsometricSvg += `
          <g>
            <ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="26" ry="13" fill="rgba(6,182,212,0.18)" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2,2"/>
            <ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="6" ry="3.5" fill="#0f172a" stroke="#22d3ee" stroke-width="1.5"/>
            <circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="2" fill="#06b6d4"/>
            <text x="${bx.toFixed(1)}" y="${(by - 8).toFixed(1)}" font-size="7" font-weight="bold" fill="#22d3ee" text-anchor="middle">Table Boundary ${b+1}</text>
          </g>
        `;
      }
    } else if (d.micType === 'table_gooseneck') {
      var gCount = Math.min(d.seats, 12);
      for (var g = 0; g < gCount; g++) {
        var frac = g / gCount;
        var gx = 450 + frac * 160;
        var gy = (g % 2 === 0) ? (292 + frac * 10) : (332 - frac * 10);
        micIsometricSvg += `
          <g>
            <circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="2.5" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/>
            <line x1="${gx.toFixed(1)}" y1="${gy.toFixed(1)}" x2="${gx.toFixed(1)}" y2="${(gy - 12).toFixed(1)}" stroke="#cbd5e1" stroke-width="1.5"/>
            <circle cx="${gx.toFixed(1)}" cy="${(gy - 12).toFixed(1)}" r="2" fill="#ef4444" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M ${(gx-6).toFixed(1)} ${(gy-12).toFixed(1)} C ${(gx-8).toFixed(1)} ${(gy-20).toFixed(1)}, ${(gx+8).toFixed(1)} ${(gy-20).toFixed(1)}, ${(gx+6).toFixed(1)} ${(gy-12).toFixed(1)} Z" fill="rgba(239,68,68,0.22)" stroke="#ef4444" stroke-width="0.8"/>
          </g>
        `;
      }
      micIsometricSvg += `<text x="530" y="278" font-size="8" font-weight="bold" fill="#f87171" text-anchor="middle">${d.seats} × Table Goosenecks</text>`;
    } else if (d.micType === 'bar_builtin') {
      micIsometricSvg = `
        <g transform="translate(230, 295)">
          <polygon points="0,0 190,25 190,38 0,13" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <line x1="20" y1="5" x2="170" y2="25" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2"/>
          <polygon points="95,12 360,65 240,115" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,2"/>
          <text x="95" y="32" font-size="8" font-weight="bold" fill="#fbbf24" text-anchor="middle" transform="rotate(7.6 95 32)">Video Bar Mic Array</text>
        </g>
      `;
    } else {
      // Ceiling Array
      var cCount = Math.min(Math.max(1, Math.round((d.l * d.w / 1e6) / 40)), 2);
      for (var c = 0; c < cCount; c++) {
        var cx = cCount === 1 ? 520 : (460 + c * 120);
        var cy = cCount === 1 ? 130 : (120 + c * 15);
        micIsometricSvg += `
          <g transform="translate(${cx}, ${cy})">
            <polygon points="0,0 -85,165 85,165" fill="url(#mMicBeamGrad)" stroke="rgba(251,191,36,0.5)" stroke-width="1.5" stroke-dasharray="3,2"/>
            <polygon points="-18,-6 18,-1 14,8 -22,3" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
            <circle cx="0" cy="0" r="3" fill="#f59e0b"/>
            <text x="22" y="4" font-size="8.5" font-weight="bold" fill="#fbbf24">Ceiling Array ${cCount > 1 ? (c+1) : ''} (${d.micDesc})</text>
          </g>
        `;
      }
    }

    container.innerHTML = `
      <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; min-height: 460px; max-height: 520px; aspect-ratio: 960 / 480; display: block; background: #080d1a; border-radius: 10px;">
        <defs>
          <linearGradient id="mFloorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e293b"/><stop offset="50%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/>
          </linearGradient>
          <linearGradient id="mWallLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#334155"/>
          </linearGradient>
          <linearGradient id="mWallBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="mSightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.05"/>
          </linearGradient>
          <linearGradient id="mCamFrustumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.08"/>
          </linearGradient>
          <linearGradient id="mSpkConeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.05"/>
          </linearGradient>
          <linearGradient id="mMicBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#d97706" stop-opacity="0.08"/>
          </linearGradient>
          <!-- Acoustic Heatmap 3D Elliptical Gradient -->
          <radialGradient id="mIsoHeatmapGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.6"/>
            <stop offset="45%" stop-color="#10b981" stop-opacity="0.45"/>
            <stop offset="75%" stop-color="#f59e0b" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
          </radialGradient>
        </defs>

        <!-- Floor Polygon (Isometric 3D Room Grid) -->
        <polygon points="140,360 480,410 880,310 540,260" fill="url(#mFloorGrad)" stroke="#334155" stroke-width="2"/>
        <line x1="225" y1="372" x2="625" y2="272" stroke="rgba(56,189,248,0.12)" stroke-width="1"/>
        <line x1="310" y1="385" x2="710" y2="285" stroke="rgba(56,189,248,0.12)" stroke-width="1"/>
        <line x1="395" y1="397" x2="795" y2="297" stroke="rgba(56,189,248,0.12)" stroke-width="1"/>

        <!-- Walls -->
        <polygon points="540,260 540,70 880,120 880,310" fill="url(#mWallBack)" stroke="#1e293b" stroke-width="2"/>
        <polygon points="140,360 140,140 540,70 540,260" fill="url(#mWallLeft)" stroke="#38bdf8" stroke-width="2"/>

        <!-- Ceiling Line Indicator (Top Outline) -->
        <line x1="140" y1="140" x2="540" y2="70" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,3"/>
        <line x1="540" y1="70" x2="880" y2="120" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,3"/>

        <!-- Acoustic Wall Absorber Panels (Side Wall) -->
        <polygon points="170,245 220,235 220,185 170,195" fill="#3b82f6" fill-opacity="0.3" stroke="#60a5fa" stroke-width="1.5"/>
        <polygon points="460,195 510,185 510,135 460,145" fill="#3b82f6" fill-opacity="0.3" stroke="#60a5fa" stroke-width="1.5"/>
        <!-- Acoustic Panels on Back Wall -->
        <polygon points="610,135 670,145 670,195 610,185" fill="#10b981" fill-opacity="0.25" stroke="#34d399" stroke-width="1.5"/>
        <polygon points="760,158 820,168 820,218 760,208" fill="#10b981" fill-opacity="0.25" stroke="#34d399" stroke-width="1.5"/>

        <!-- ACOUSTIC COVERAGE HEATMAP LAYER (Floor / Ear Level Density) -->
        ${heatmapIsometricSvg}

        <!-- DYNAMIC CEILING SPEAKERS & ACOUSTIC DISPERSION CONES -->
        ${spkIsometricSvg}

        <!-- DYNAMIC MICROPHONE ACOUSTIC ARCHITECTURE -->
        ${micIsometricSvg}

        <!-- WALL-MOUNTED DISPLAY -->
        <g transform="translate(230, 180)">
          ${d.dispQty === 0 ? `
            <polygon points="0,0 190,25 190,135 0,110" fill="#0f172a" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,3"/>
            <text x="95" y="70" font-size="9" font-weight="bold" fill="#94a3b8" text-anchor="middle" transform="rotate(7.6 95 70)">Display Excluded (0 Screens)</text>
          ` : `
            <polygon points="0,0 190,25 190,135 0,110" fill="#0f172a" stroke="#0284c7" stroke-width="3"/>
            <polygon points="4,4 186,28 186,131 4,107" fill="#020617"/>
            <text x="95" y="68" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle" transform="rotate(7.6 95 68)">${d.purpose === 'videowall' ? `dvLED P${d.pitch}mm Wall` : (d.purpose === 'uc' ? 'Teams 21:9 UC' : 'DISCAS Display')}</text>
            <rect x="15" y="115" width="165" height="20" rx="4" fill="#020617" stroke="#38bdf8"/>
            <text x="97" y="129" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle">${d.diag} (${d.dims})</text>
          `}

          <!-- CAMERA MOUNTED ABOVE OR BELOW DISPLAY WITH DYNAMIC OPTICAL ZOOM & FRUSTUM -->
          ${isCamActive ? (d.camPos === 'below' ? `
            <g transform="translate(95, 126)">
              <rect x="-12" y="0" width="24" height="12" rx="3" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
              <circle cx="0" cy="6" r="4" fill="#6366f1" stroke="#ffffff" stroke-width="1"/>
              <!-- Camera HFOV Optical Frustum extending out from below display -->
              <polygon points="0,10 200,60 300,90" fill="url(#mCamFrustumGrad)" stroke="rgba(129,140,248,0.5)" stroke-width="1" stroke-dasharray="3,2"/>
              <text x="0" y="24" font-size="8" font-weight="bold" fill="#a5b4fc" text-anchor="middle">PTZ Camera (Below Display): ${d.camHfov} &bull; ${d.camZoomFactor}x Zoom (${d.framingName})</text>
            </g>
          ` : `
            <g transform="translate(95, -6)">
              <rect x="-12" y="-14" width="24" height="12" rx="3" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
              <circle cx="0" cy="-8" r="4" fill="#6366f1" stroke="#ffffff" stroke-width="1"/>
              <!-- Camera HFOV Optical Frustum extending down towards seating with reach indicator -->
              <polygon points="0,-2 220,110 320,150" fill="url(#mCamFrustumGrad)" stroke="rgba(129,140,248,0.5)" stroke-width="1" stroke-dasharray="3,2"/>
              <text x="0" y="-18" font-size="8" font-weight="bold" fill="#a5b4fc" text-anchor="middle">PTZ Camera (Above Display): ${d.camHfov} &bull; ${d.camZoomFactor}x Zoom (${d.framingName})</text>
            </g>
          `) : `
            <g transform="translate(95, -6)">
              <rect x="-14" y="-12" width="28" height="10" rx="2" fill="#334155" stroke="#64748b" stroke-width="1"/>
              <text x="0" y="-16" font-size="7.5" fill="#94a3b8" text-anchor="middle">Camera Excluded (Qty 0)</text>
            </g>
          `}

          <!-- UNIFIED VIDEO BAR (MOUNTED ABOVE OR BELOW DISPLAY IN 3D ISOMETRIC) -->
          ${(d.videoBar && d.videoBar !== 'none' && d.barQty > 0) ? (d.barPos === 'above' ? `
            <g transform="translate(20, -18)">
              <polygon points="0,0 150,20 150,30 0,10" fill="#134e4a" stroke="#2dd4bf" stroke-width="1.5"/>
              <circle cx="75" cy="10" r="3" fill="#0d9488" stroke="#ffffff" stroke-width="1"/>
              <text x="75" y="-3" font-size="7.5" font-weight="bold" fill="#2dd4bf" text-anchor="middle">Video Bar (Above Display): ${d.videoBar.toUpperCase()}</text>
            </g>
          ` : `
            <g transform="translate(20, 118)">
              <polygon points="0,0 150,20 150,30 0,10" fill="#134e4a" stroke="#2dd4bf" stroke-width="1.5"/>
              <circle cx="75" cy="10" r="3" fill="#0d9488" stroke="#ffffff" stroke-width="1"/>
              <text x="75" y="38" font-size="7.5" font-weight="bold" fill="#2dd4bf" text-anchor="middle">Video Bar (Below Display): ${d.videoBar.toUpperCase()}</text>
            </g>
          `) : ''}
        </g>

        <!-- Conference Table & Chairs -->
        <g transform="translate(450, 310)">
          <polygon points="0,15 150,-20 180,-15 30,20" fill="#334155" stroke="#64748b" stroke-width="2"/>
          <polygon points="0,15 30,20 30,30 0,25" fill="#1e293b"/>
          ${(() => {
            var chairsHtml = '';
            var count = Math.min(d.seats, 16);
            for (var ch = 0; ch < count; ch++) {
              var f = ch / count;
              var cx = f * 160;
              var cy = (ch % 2 === 0) ? (-25 + f * 10) : (25 - f * 10);
              var col = (ch === 0) ? '#eab308' : '#38bdf8';
              chairsHtml += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="${col}" stroke="#ffffff" stroke-width="1"/>`;
            }
            return chairsHtml;
          })()}
        </g>

        <!-- Furthest Viewer & Sightline Cone -->
        <g transform="translate(680, 320)">
          <circle cx="0" cy="-28" r="8" fill="#eab308" stroke="#fef08a" stroke-width="1.5"/>
          <line x1="0" y1="-20" x2="0" y2="12" stroke="#eab308" stroke-width="3"/>
          <text x="0" y="24" font-size="9" font-weight="bold" fill="#fef08a" text-anchor="middle">Furthest Viewer (${d.lastP ? d.lastP.toFixed(1) : (L-1.0).toFixed(1)}m)</text>
        </g>
        <polygon points="325,240 680,292 720,320" fill="url(#mSightGrad)"/>
        <line x1="325" y1="240" x2="680" y2="292" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,2"/>

        <!-- Overlap & Heatmap Indicator Badges Top Right -->
        <g transform="translate(670, 24)">
          <rect x="0" y="0" width="270" height="24" rx="4" fill="#020617" stroke="#10b981" stroke-width="1"/>
          <circle cx="12" cy="12" r="5" fill="${showSpeakerOverlap ? '#10b981' : '#64748b'}"/>
          <text x="24" y="15" font-size="8" font-weight="bold" fill="#34d399">Dynamic Overlap: ${isSpkActive ? `${d.spkOverlapPercent}% (${d.spkCols}×${d.spkRows} Grid)` : 'Excluded'}</text>
          <circle cx="160" cy="12" r="5" fill="${showAcousticHeatmap ? '#06b6d4' : '#64748b'}"/>
          <text x="172" y="15" font-size="8" font-weight="bold" fill="#22d3ee">Heatmap: ${showAcousticHeatmap ? '82–86 dB' : 'OFF'}</text>
        </g>

        <!-- Bottom Engineering Badges -->
        <g transform="translate(20, 440)">
          <rect x="0" y="0" width="280" height="28" fill="#020617" rx="5" stroke="#38bdf8"/>
          <text x="140" y="18" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle">DISPLAY: ${d.dispQty === 0 ? '0 (EXCLUDED)' : d.diag} &bull; CAM: ${isCamActive ? `${d.camHfov} (${d.camZoomFactor}x)` : 'EXCLUDED'}</text>
        </g>
        <g transform="translate(320, 440)">
          <rect x="0" y="0" width="310" height="28" fill="#020617" rx="5" stroke="#06b6d4"/>
          <text x="155" y="18" font-size="9" font-weight="bold" fill="#22d3ee" text-anchor="middle">AUDIO: ${isSpkActive ? `${d.spkCount} × ${d.spkSize} &bull; ${d.spkGrid} (${d.spkSpacing}m)` : '0 SPEAKERS (EXCLUDED)'}</text>
        </g>
        <g transform="translate(650, 440)">
          <rect x="0" y="0" width="290" height="28" fill="#020617" rx="5" stroke="#f59e0b"/>
          <text x="145" y="18" font-size="9" font-weight="bold" fill="#fbbf24" text-anchor="middle">MIC: ${d.micQty === 0 ? '0 (EXCLUDED)' : d.micDesc.substring(0, 30)}</text>
        </g>
      </svg>
    `;
  } else if (activeMatrixVisView === 'PLAN') {
    // 2D Top Plan View with acoustic heatmap and live speaker grid
    var planSpkSvg = '';
    var planHeatmapSvg = '';
    var startX = 220;
    var endX = 740;
    var startY = 110;
    var endY = 350;
    var dx = cols > 1 ? (endX - startX) / (cols - 1) : 0;
    var dy = rows > 1 ? (endY - startY) / (rows - 1) : 0;
    var spkPlanCounter = 1;
    var planFootprints = [];

    if (isSpkActive) {
      for (var pr = 0; pr < rows; pr++) {
        for (var pc = 0; pc < cols; pc++) {
          var sx = cols === 1 ? 480 : (startX + pc * dx);
          var sy = rows === 1 ? 230 : (startY + pr * dy);
          var dispRadius = 45 + (parseFloat(d.spkSize) || 6.5) * 2.2;
          planFootprints.push({ x: sx, y: sy, r: dispRadius, row: pr, col: pc, id: spkPlanCounter });

          // Acoustic coverage heatmap radial gradients in Plan view
          if (showAcousticHeatmap) {
            planHeatmapSvg += `
              <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(dispRadius * 1.3).toFixed(1)}" fill="url(#mPlanHeatmapGrad)" opacity="0.65"/>
              <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(dispRadius * 0.7).toFixed(1)}" fill="#06b6d4" opacity="0.25"/>
            `;
          }

          // Dynamic cone overlap circles and tangent indicators
          var overlapCircleSvg = '';
          if (showSpeakerOverlap) {
            overlapCircleSvg = `
              <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${dispRadius.toFixed(1)}" fill="rgba(16,185,129,0.14)" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,2"/>
              <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(dispRadius * 0.5).toFixed(1)}" fill="rgba(6,182,212,0.1)" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2,2"/>
            `;
          } else {
            overlapCircleSvg = `
              <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${dispRadius.toFixed(1)}" fill="rgba(56,189,248,0.06)" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,2"/>
            `;
          }

          planSpkSvg += `
            <g>
              ${overlapCircleSvg}
              <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="9" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
              <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3" fill="#ffffff"/>
              <text x="${sx.toFixed(1)}" y="${(sy-12).toFixed(1)}" font-size="8" font-weight="bold" fill="#7dd3fc" text-anchor="middle">Spk ${spkPlanCounter} (${d.spkSize})</text>
            </g>
          `;
          spkPlanCounter++;
        }
      }

      // Interconnect grid lines when overlap is ON
      if (showSpeakerOverlap && planFootprints.length > 1) {
        var planOverlapLines = '';
        for (var p1 = 0; p1 < planFootprints.length; p1++) {
          for (var p2 = p1 + 1; p2 < planFootprints.length; p2++) {
            var f1 = planFootprints[p1];
            var f2 = planFootprints[p2];
            var isAdj = (Math.abs(f1.row - f2.row) + Math.abs(f1.col - f2.col)) === 1;
            if (isAdj) {
              planOverlapLines += `
                <line x1="${f1.x.toFixed(1)}" y1="${f1.y.toFixed(1)}" x2="${f2.x.toFixed(1)}" y2="${f2.y.toFixed(1)}" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3"/>
                <circle cx="${((f1.x+f2.x)/2).toFixed(1)}" cy="${((f1.y+f2.y)/2).toFixed(1)}" r="5" fill="#10b981" opacity="0.6"/>
              `;
            }
          }
        }
        planSpkSvg = planOverlapLines + planSpkSvg;
      }
    } else {
      planSpkSvg = `
        <g transform="translate(480, 230)">
          <rect x="-140" y="-14" width="280" height="28" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="0" y="4" font-size="9" font-weight="bold" fill="#94a3b8" text-anchor="middle">Ceiling Loudspeakers Excluded (0 Units)</text>
        </g>
      `;
    }

    // Dynamic Plan Microphones
    var planMicSvg = '';
    if (d.micQty === 0 || d.micType === 'none') {
      planMicSvg = `<text x="480" y="270" font-size="8" fill="#94a3b8" text-anchor="middle">Microphones Excluded</text>`;
    } else if (d.micType === 'table_boundary') {
      var pbCount = Math.min(Math.max(1, Math.round(d.seats / 4)), 4);
      for (var pb = 0; pb < pbCount; pb++) {
        var fpb = pbCount === 1 ? 0.5 : (pb + 0.5) / pbCount;
        var pbx = 380 + fpb * 200;
        var pby = 225;
        planMicSvg += `
          <g>
            <circle cx="${pbx.toFixed(1)}" cy="${pby}" r="32" fill="rgba(6,182,212,0.15)" stroke="#06b6d4" stroke-width="1" stroke-dasharray="3,2"/>
            <circle cx="${pbx.toFixed(1)}" cy="${pby}" r="7" fill="#0f172a" stroke="#22d3ee" stroke-width="2"/>
            <circle cx="${pbx.toFixed(1)}" cy="${pby}" r="2.5" fill="#06b6d4"/>
            <text x="${pbx.toFixed(1)}" y="${pby + 16}" font-size="7" font-weight="bold" fill="#22d3ee" text-anchor="middle">Boundary ${pb+1}</text>
          </g>
        `;
      }
    } else if (d.micType === 'table_gooseneck') {
      planMicSvg = `
        <g>
          <text x="480" y="225" font-size="9" font-weight="bold" fill="#f87171" text-anchor="middle">${d.seats} × Table Goosenecks at Seating Positions</text>
        </g>
      `;
    } else if (d.micType === 'bar_builtin') {
      planMicSvg = `
        <g transform="translate(480, 52)">
          <rect x="-80" y="0" width="160" height="8" rx="2" fill="#f59e0b" stroke="#ffffff" stroke-width="1"/>
          <polygon points="0,8 -140,120 140,120" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,2"/>
          <text x="0" y="24" font-size="8" font-weight="bold" fill="#fbbf24" text-anchor="middle">Video Bar Array (Tracking Coverage)</text>
        </g>
      `;
    } else {
      // Ceiling Array
      planMicSvg = `
        <g transform="translate(480, 225)">
          <rect x="-24" y="-16" width="48" height="32" rx="4" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
          <circle cx="0" cy="0" r="4" fill="#f59e0b"/>
          <ellipse cx="0" cy="0" rx="90" ry="55" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,2"/>
          <text x="0" y="4" font-size="8" font-weight="bold" fill="#92400e" text-anchor="middle">MIC ARRAY</text>
          <text x="0" y="-22" font-size="8" font-weight="bold" fill="#fbbf24" text-anchor="middle">${d.micDesc}</text>
        </g>
      `;
    }

    container.innerHTML = `
      <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; min-height: 460px; max-height: 520px; aspect-ratio: 960 / 480; display: block; background: #080d1a; border-radius: 10px;">
        <defs>
          <radialGradient id="mPlanHeatmapGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.55"/>
            <stop offset="50%" stop-color="#10b981" stop-opacity="0.38"/>
            <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
          </radialGradient>
        </defs>

        <rect x="70" y="35" width="820" height="385" fill="#0b1120" stroke="#334155" stroke-width="3" rx="8"/>
        <text x="90" y="65" font-size="13" font-weight="bold" fill="#38bdf8">2D ARCHITECTURAL TOP PLAN VIEW: [FL ${d.floor}] ${d.name} (${L.toFixed(1)}m × ${W.toFixed(1)}m)</text>
        
        <!-- Wall Display on Top Wall -->
        ${d.dispQty === 0 ? `
          <rect x="370" y="37" width="220" height="14" fill="#1e293b" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,2" rx="3"/>
          <text x="480" y="70" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="middle">Display Excluded (0 Screens)</text>
        ` : `
          <rect x="370" y="37" width="220" height="14" fill="#0284c7" stroke="#38bdf8" stroke-width="2" rx="3"/>
          <text x="480" y="70" font-size="10" font-weight="bold" fill="#38bdf8" text-anchor="middle">DISPLAY: ${d.diag} (${d.dims}) &bull; ${d.purpose.toUpperCase()}</text>
        `}

        <!-- PTZ Camera atop Display with HFOV angle lines -->
        ${isCamActive ? `
          <circle cx="480" cy="44" r="6" fill="#818cf8" stroke="#ffffff" stroke-width="1.5"/>
          <line x1="480" y1="44" x2="310" y2="180" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="3,3"/>
          <line x1="480" y1="44" x2="650" y2="180" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="3,3"/>
          <text x="480" y="25" font-size="9" font-weight="bold" fill="#a5b4fc" text-anchor="middle">Camera HFOV: ${d.camHfov} &bull; ${d.camZoomFactor}x Zoom (Reach ${d.camReach}m) &bull; [${d.framingName}]</text>
        ` : `
          <circle cx="480" cy="44" r="4" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
          <text x="480" y="25" font-size="8" fill="#94a3b8" text-anchor="middle">Camera Excluded (Qty 0)</text>
        `}

        <!-- Sightline Viewing Cone -->
        <polygon points="370,51 590,51 770,390 190,390" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4,3"/>

        <!-- ACOUSTIC COVERAGE HEATMAP LAYER -->
        ${planHeatmapSvg}

        <!-- DYNAMIC CEILING SPEAKERS GRID -->
        ${planSpkSvg}

        <!-- Conference Table -->
        <rect x="360" y="170" width="240" height="110" rx="18" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
        <text x="480" y="248" font-size="10" font-weight="bold" fill="#cbd5e1" text-anchor="middle">${d.seats} Conference Seats</text>

        <!-- DYNAMIC PLAN MICROPHONES -->
        ${planMicSvg}

        <!-- Chairs around table -->
        ${(() => {
          var chairs = '';
          for (var i = 0; i < 6; i++) {
            chairs += `<circle cx="${380 + i*40}" cy="155" r="6" fill="#60a5fa" stroke="#ffffff" stroke-width="1"/>`;
            chairs += `<circle cx="${380 + i*40}" cy="295" r="6" fill="#60a5fa" stroke="#ffffff" stroke-width="1"/>`;
          }
          return chairs;
        })()}

        <!-- Furthest Viewer Position -->
        <circle cx="480" cy="380" r="8" fill="#eab308" stroke="#ffffff" stroke-width="1.5"/>
        <text x="480" y="404" font-size="9" font-weight="bold" fill="#fef08a" text-anchor="middle">Furthest Seated Viewer (${d.lastP ? d.lastP.toFixed(1) : (L-1.0).toFixed(1)}m)</text>

        <!-- Overlap & Heatmap Indicator Badges Top Right -->
        <g transform="translate(620, 48)">
          <rect x="0" y="0" width="260" height="22" rx="4" fill="#020617" stroke="#10b981" stroke-width="1"/>
          <text x="130" y="15" font-size="8" font-weight="bold" fill="#34d399" text-anchor="middle">Acoustic Overlap: ${isSpkActive ? `${d.spkOverlapPercent}% (${d.spkGrid})` : 'Excluded'} &bull; Heatmap: ${showAcousticHeatmap ? 'ON' : 'OFF'}</text>
        </g>

        <!-- Bottom Specs Callouts -->
        <rect x="80" y="435" width="260" height="26" fill="#020617" rx="4" stroke="#38bdf8"/>
        <text x="210" y="452" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle">DISPLAY: ${d.dispQty === 0 ? 'EXCLUDED' : d.diag} &bull; ${d.dims}</text>

        <rect x="360" y="435" width="280" height="26" fill="#020617" rx="4" stroke="#06b6d4"/>
        <text x="500" y="452" font-size="9" font-weight="bold" fill="#22d3ee" text-anchor="middle">SPEAKERS: ${isSpkActive ? `${d.spkCount} × ${d.spkSize} &bull; ${d.spkGrid}` : '0 SPEAKERS (EXCLUDED)'}</text>

        <rect x="660" y="435" width="230" height="26" fill="#020617" rx="4" stroke="#f59e0b"/>
        <text x="775" y="452" font-size="9" font-weight="bold" fill="#fbbf24" text-anchor="middle">MIC: ${d.micQty === 0 ? 'EXCLUDED' : d.micDesc.substring(0, 24)}</text>
      </svg>
    `;
  } else {
    // Front Elevation View
    container.innerHTML = `
      <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; min-height: 460px; max-height: 520px; aspect-ratio: 960 / 480; display: block; background: #080d1a; border-radius: 10px;">
        <rect x="70" y="35" width="820" height="385" fill="#0b1120" stroke="#334155" stroke-width="3" rx="8"/>
        <text x="90" y="65" font-size="13" font-weight="bold" fill="#4ade80">FRONT ELEVATION & ACOUSTIC WALL VIEW: [FL ${d.floor}] ${d.name}</text>
        
        <!-- Finished Ceiling line -->
        <line x1="70" y1="80" x2="890" y2="80" stroke="#64748b" stroke-width="3" stroke-dasharray="5,3"/>
        <text x="90" y="76" font-size="9" fill="#94a3b8">Finished Ceiling Level (AFFL ${H.toFixed(2)}m)</text>

        <!-- Finished Floor line -->
        <line x1="70" y1="360" x2="890" y2="360" stroke="#64748b" stroke-width="4"/>
        <text x="90" y="380" font-size="9" fill="#94a3b8">Finished Floor Level (AFFL 0.0m)</text>

        <!-- Acoustic Wall Panels Left & Right -->
        <rect x="110" y="130" width="130" height="170" rx="4" fill="#3b82f6" fill-opacity="0.3" stroke="#60a5fa" stroke-width="2"/>
        <text x="175" y="215" font-size="10" font-weight="bold" fill="#93c5fd" text-anchor="middle">Acoustic Panels</text>
        <text x="175" y="230" font-size="8" fill="#bfdbfe" text-anchor="middle">NRC &ge; 0.85</text>

        <rect x="720" y="130" width="130" height="170" rx="4" fill="#3b82f6" fill-opacity="0.3" stroke="#60a5fa" stroke-width="2"/>
        <text x="785" y="215" font-size="10" font-weight="bold" fill="#93c5fd" text-anchor="middle">Acoustic Panels</text>
        <text x="785" y="230" font-size="8" fill="#bfdbfe" text-anchor="middle">NRC &ge; 0.85</text>

        <!-- CEILING LOUDSPEAKERS -->
        ${isSpkActive ? `
          <g transform="translate(290, 80)">
            <polygon points="0,0 -50,160 50,160" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,2"/>
            <rect x="-14" y="-3" width="28" height="6" rx="2" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>
            <text x="0" y="-8" font-size="8" font-weight="bold" fill="#7dd3fc" text-anchor="middle">Speaker (${d.spkSize})</text>
          </g>
          <g transform="translate(670, 80)">
            <polygon points="0,0 -50,160 50,160" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,2"/>
            <rect x="-14" y="-3" width="28" height="6" rx="2" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>
            <text x="0" y="-8" font-size="8" font-weight="bold" fill="#7dd3fc" text-anchor="middle">Speaker (${d.spkSize})</text>
          </g>
        ` : `
          <text x="480" y="100" font-size="9" fill="#94a3b8" text-anchor="middle">Speakers Excluded from Design</text>
        `}

        <!-- DYNAMIC ELEVATION MICROPHONE -->
        ${d.micQty === 0 || d.micType === 'none' ? `
          <text x="480" y="320" font-size="8" fill="#94a3b8" text-anchor="middle">Microphone Excluded</text>
        ` : d.micType === 'bar_builtin' ? `
          <g transform="translate(480, 298)">
            <rect x="-80" y="0" width="160" height="14" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
            <polygon points="0,14 -120,60 120,60" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2"/>
            <text x="0" y="10" font-size="8" font-weight="bold" fill="#fbbf24" text-anchor="middle">Video Bar Array</text>
          </g>
        ` : d.micType === 'table_boundary' || d.micType === 'table_gooseneck' ? `
          <g transform="translate(480, 310)">
            <ellipse cx="0" cy="0" rx="14" ry="4" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5"/>
            <polygon points="0,0 -40,-80 40,-80" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,2"/>
            <text x="0" y="-10" font-size="8" font-weight="bold" fill="#fbbf24" text-anchor="middle">${d.micDesc}</text>
          </g>
        ` : `
          <g transform="translate(480, 80)">
            <polygon points="0,0 -60,180 60,180" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2"/>
            <rect x="-20" y="-4" width="40" height="8" rx="2" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5"/>
            <text x="0" y="-10" font-size="8" font-weight="bold" fill="#fbbf24" text-anchor="middle">Ceiling Mic Array (${d.micDesc})</text>
          </g>
        `}

        <!-- Center Display Screen -->
        ${d.dispQty === 0 ? `
          <rect x="330" y="120" width="300" height="170" rx="6" fill="#020617" stroke="#64748b" stroke-width="2" stroke-dasharray="5,3"/>
          <text x="480" y="210" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle">Display Excluded (0 Screens)</text>
        ` : `
          <rect x="330" y="120" width="300" height="170" rx="6" fill="#020617" stroke="#0284c7" stroke-width="4"/>
          <text x="480" y="195" font-size="16" font-weight="bold" fill="#38bdf8" text-anchor="middle">${d.diag}</text>
          <text x="480" y="220" font-size="11" font-weight="bold" fill="#cbd5e1" text-anchor="middle">${d.dims}</text>
          <text x="480" y="240" font-size="10" fill="#94a3b8" text-anchor="middle">${d.purpose.toUpperCase()} STANDARD</text>
        `}

        <!-- UNIFIED VIDEO BAR (MOUNTED ABOVE OR BELOW DISPLAY) -->
        ${(d.videoBar && d.videoBar !== 'none' && d.barQty > 0) ? (d.barPos === 'above' ? `
          <g transform="translate(480, ${isCamActive && d.camPos === 'above' ? 90 : 104})">
            <rect x="-90" y="-12" width="180" height="12" rx="3" fill="#134e4a" stroke="#2dd4bf" stroke-width="2"/>
            <circle cx="0" cy="-6" r="4" fill="#0d9488" stroke="#ffffff" stroke-width="1"/>
            <text x="0" y="-16" font-size="8" font-weight="bold" fill="#2dd4bf" text-anchor="middle">Video Bar (Above Display): ${d.videoBar.toUpperCase()}</text>
          </g>
        ` : `
          <g transform="translate(480, ${isCamActive && d.camPos === 'below' ? 318 : 296})">
            <rect x="-90" y="0" width="180" height="12" rx="3" fill="#134e4a" stroke="#2dd4bf" stroke-width="2"/>
            <circle cx="0" cy="6" r="4" fill="#0d9488" stroke="#ffffff" stroke-width="1"/>
            <text x="0" y="24" font-size="8" font-weight="bold" fill="#2dd4bf" text-anchor="middle">Video Bar (Below Display): ${d.videoBar.toUpperCase()}</text>
          </g>
        `) : ''}

        <!-- PTZ Camera Mounted Directly Above or Below Display -->
        ${isCamActive ? (d.camPos === 'below' ? `
          <g transform="translate(480, ${(d.videoBar && d.videoBar !== 'none' && d.barQty > 0 && d.barPos === 'below') ? 304 : 306})">
            <rect x="-14" y="0" width="28" height="13" rx="3" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
            <circle cx="0" cy="6" r="4.5" fill="#6366f1" stroke="#ffffff" stroke-width="1"/>
            <text x="0" y="24" font-size="8" font-weight="bold" fill="#a5b4fc" text-anchor="middle">PTZ Camera (Below Display): ${d.camHfov} &bull; ${d.camZoomFactor}x Zoom</text>
          </g>
        ` : `
          <g transform="translate(480, ${(d.videoBar && d.videoBar !== 'none' && d.barQty > 0 && d.barPos === 'above') ? 106 : 105})">
            <rect x="-14" y="-13" width="28" height="13" rx="3" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
            <circle cx="0" cy="-6" r="4.5" fill="#6366f1" stroke="#ffffff" stroke-width="1"/>
            <text x="0" y="-17" font-size="8" font-weight="bold" fill="#a5b4fc" text-anchor="middle">PTZ Camera (Above Display): ${d.camHfov} &bull; ${d.camZoomFactor}x Zoom</text>
          </g>
        `) : ''}

        <!-- AFFL Dimension line -->
        <line x1="310" y1="290" x2="310" y2="360" stroke="#f59e0b" stroke-width="2"/>
        <text x="300" y="330" font-size="10" font-weight="bold" fill="#fbbf24" text-anchor="end">AFFL: 950 mm</text>

        <!-- Bottom Specs Callouts -->
        <rect x="80" y="435" width="260" height="26" fill="#020617" rx="4" stroke="#38bdf8"/>
        <text x="210" y="452" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle">DISPLAY: ${d.dispQty === 0 ? 'EXCLUDED' : d.diag} &bull; ${d.dims}</text>

        <rect x="360" y="435" width="280" height="26" fill="#020617" rx="4" stroke="#06b6d4"/>
        <text x="500" y="452" font-size="9" font-weight="bold" fill="#22d3ee" text-anchor="middle">SPEAKERS: ${isSpkActive ? `${d.spkCount} × ${d.spkSize} &bull; ${d.spkGrid}` : '0 SPEAKERS (EXCLUDED)'}</text>

        <rect x="660" y="435" width="230" height="26" fill="#020617" rx="4" stroke="#f59e0b"/>
        <text x="775" y="452" font-size="9" font-weight="bold" fill="#fbbf24" text-anchor="middle">MIC: ${d.micQty === 0 ? 'EXCLUDED' : d.micDesc.substring(0, 24)}</text>
    `;
  }
}


// ==========================================
// CROSS-STUDIO TESTING & NAVIGATION HELPERS
// Connects Spatial Room Matrix rows directly to Tabs 1, 4, 5, 6
// ==========================================
function sendRoomToDisplayTab(btn) {
  var tr = btn.closest('tr');
  if (!tr) return;
  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 6000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 4500;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;

  var depthMm = document.getElementById('depthMmInput');
  var widthMm = document.getElementById('widthMmInput');
  var heightMm = document.getElementById('roomHeightMmInput');
  if (depthMm) depthMm.value = lm;
  if (widthMm) widthMm.value = wm;
  if (heightMm) heightMm.value = hm;

  var depthFt = document.getElementById('depthFtInput');
  var widthFt = document.getElementById('widthFtInput');
  if (depthFt) depthFt.value = (lm / 304.8).toFixed(1);
  if (widthFt) widthFt.value = (wm / 304.8).toFixed(1);

  if (typeof calculateDisplay === 'function') calculateDisplay();
  var tab1Btn = document.querySelector(".tab-button[onclick*='Tab1']");
  if (tab1Btn) tab1Btn.click();
}

function sendRoomToCameraTab(btn) {
  var tr = btn.closest('tr');
  if (!tr) return;
  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 6000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 4500;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;
  var camD1 = parseFloat(tr.querySelector('.inp-cam-d1')?.value) || 2.5;
  var camWspan = parseFloat(tr.querySelector('.inp-cam-wspan')?.value) || 3.0;

  var hfovRad = 2.0 * Math.atan(camWspan / (2.0 * camD1));
  var hfovDeg = Math.round(hfovRad * (180.0 / Math.PI));

  var camL = document.getElementById('camRoomLength');
  var camW = document.getElementById('camRoomWidth');
  var camH = document.getElementById('camRoomHeight');
  var camHfov = document.getElementById('camHfovInput');

  if (camL) camL.value = lm;
  if (camW) camW.value = wm;
  if (camH) camH.value = hm;
  if (camHfov) camHfov.value = Math.max(25, Math.min(130, hfovDeg));

  if (typeof syncCamVfovFromHfov === 'function') syncCamVfovFromHfov();
  else if (typeof calcCameraStudio === 'function') calcCameraStudio();

  var tab4Btn = document.querySelector(".tab-button[onclick*='Tab4']");
  if (tab4Btn) tab4Btn.click();
}

function sendRoomToSpeakerTab(btn) {
  var tr = btn.closest('tr');
  if (!tr) return;
  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 6000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 4500;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;
  var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;
  var spkSize = tr.querySelector('.inp-spk-size')?.value || '6.5"';

  var spkL = document.getElementById('spkRoomLength');
  var spkW = document.getElementById('spkRoomWidth');
  var spkH = document.getElementById('spkRoomHeight');
  var spkSeats = document.getElementById('spkParticipantsCount');

  if (spkL) spkL.value = lm;
  if (spkW) spkW.value = wm;
  if (spkH) spkH.value = hm;
  if (spkSeats) spkSeats.value = seats;

  var spkAngle = document.getElementById('spkConeAngleSelect');
  if (spkAngle) {
    if (spkSize.includes('2.5') || spkSize.includes('3')) spkAngle.value = '140';
    else if (spkSize.includes('4')) spkAngle.value = '120';
    else if (spkSize.includes('5.25')) spkAngle.value = '105';
    else if (spkSize.includes('6.5')) spkAngle.value = '105';
    else if (spkSize.includes('8')) spkAngle.value = '90';
    else if (spkSize.includes('10') || spkSize.includes('12')) spkAngle.value = '75';
  }

  if (typeof calcSpeakerAndMicAll === 'function') calcSpeakerAndMicAll();
  else if (typeof calcSpeakerStudio === 'function') calcSpeakerStudio();

  var tab5Btn = document.querySelector(".tab-button[onclick*='Tab5']");
  if (tab5Btn) tab5Btn.click();
}

function sendRoomToMicrophoneTab(btn) {
  var tr = btn.closest('tr');
  if (!tr) return;
  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 6000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 4500;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;
  var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;

  var spkL = document.getElementById('spkRoomLength');
  var spkW = document.getElementById('spkRoomWidth');
  var spkH = document.getElementById('spkRoomHeight');
  var spkSeats = document.getElementById('spkParticipantsCount');

  if (spkL) spkL.value = lm;
  if (spkW) spkW.value = wm;
  if (spkH) spkH.value = hm;
  if (spkSeats) spkSeats.value = seats;

  if (typeof calcSpeakerAndMicAll === 'function') calcSpeakerAndMicAll();

  var tab5Btn = document.querySelector(".tab-button[onclick*='Tab5']");
  if (tab5Btn) tab5Btn.click();
}

function sendRoomToAcousticsTab(btn) {
  var tr = btn.closest('tr');
  if (!tr) return;
  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 6000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 4500;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;

  var acL = document.getElementById('acRoomLength');
  var acW = document.getElementById('acRoomWidth');
  var acH = document.getElementById('acRoomHeight');

  if (acL) acL.value = lm;
  if (acW) acW.value = wm;
  if (acH) acH.value = hm;

  if (typeof calcAcousticsFull === 'function') calcAcousticsFull();

  var tab6Btn = document.querySelector(".tab-button[onclick*='Tab6']");
  if (tab6Btn) tab6Btn.click();
}

function sendRoomToVideoBar(btn) {
  var tr = btn.closest('tr');
  if (!tr) return;
  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 7000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 5000;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2800;
  var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;
  var camD1 = parseFloat(tr.querySelector('.inp-cam-d1')?.value) || 2.0;
  var wSpan = parseFloat(tr.querySelector('.inp-cam-wspan')?.value) || 3.2;
  var barType = tr.querySelector('.inp-video-bar')?.value || 'auto';
  var barPos = tr.querySelector('.inp-bar-pos')?.value || 'below';

  ['vbRoomLength', 'vbarRoomLength'].forEach(id => { var el = document.getElementById(id); if (el) el.value = (lm / 1000).toFixed(1); });
  ['vbRoomWidth', 'vbarRoomWidth'].forEach(id => { var el = document.getElementById(id); if (el) el.value = (wm / 1000).toFixed(1); });
  ['vbRoomHeight', 'vbarRoomHeight'].forEach(id => { var el = document.getElementById(id); if (el) el.value = (hm / 1000).toFixed(1); });
  ['vbRoomSeats', 'vbarRoomSeats'].forEach(id => { var el = document.getElementById(id); if (el) el.value = seats; });
  ['vbDistD1', 'vbarD1Dist'].forEach(id => { var el = document.getElementById(id); if (el) el.value = camD1.toFixed(1); });
  ['vbSpanW', 'vbarSpanW'].forEach(id => { var el = document.getElementById(id); if (el) el.value = wSpan.toFixed(1); });
  ['vbBarTierSelect', 'vbarTierSel'].forEach(id => { var el = document.getElementById(id); if (el) el.value = barType; });
  ['vbPlacementSelect', 'vbarPlacementSel'].forEach(id => { var el = document.getElementById(id); if (el) el.value = barPos; });

  if (typeof refreshVbTargetRoomsDropdown === 'function') {
    refreshVbTargetRoomsDropdown();
  }
  var allRows = Array.from(document.querySelectorAll('#matrixTableBody tr'));
  var rowIdx = allRows.indexOf(tr);
  var targetSel = document.getElementById('vbTargetRoomSelect');
  if (targetSel && rowIdx >= 0) {
    targetSel.value = rowIdx.toString();
  }

  if (typeof calculateVideoBarStudio === 'function') {
    calculateVideoBarStudio();
  }

  var barBtn = document.querySelector(".tab-button[onclick*='Tab_VideoBar']");
  if (barBtn) barBtn.click();
  else if (typeof openTab === 'function') openTab(null, 'Tab_VideoBar');
}

function openVideoBarSpecsModal(btn) {
  var tr = btn.closest('tr');
  if (!tr) return;
  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 7000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 5000;
  var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;
  var barType = tr.querySelector('.inp-video-bar')?.value || 'auto';
  var barPos = tr.querySelector('.inp-bar-pos')?.value || 'below';
  var roomName = tr.querySelector('.inp-name')?.value || 'Meeting Room';

  var barCalc = calculateVideoBar(lm, wm, seats, barType);

  var modalTitle = document.getElementById('vbarSpecModalRoomTitle');
  if (modalTitle) modalTitle.innerText = `${roomName} (${(lm/1000).toFixed(1)}m × ${(wm/1000).toFixed(1)}m • ${seats} Seats)`;

  var modalBarName = document.getElementById('vbarSpecModalBarName');
  if (modalBarName) modalBarName.innerText = barCalc.name;

  var modalCam = document.getElementById('vbarSpecModalCamDetails');
  if (modalCam) modalCam.innerHTML = `<strong>Camera Reach:</strong> ${barCalc.camMaxReach}m &bull; HFOV: ${barCalc.camHfov} &bull; ${barCalc.camPass ? '<span class="badge bg-success">In-Bounds ✓</span>' : '<span class="badge bg-warning text-dark">Warning: Room length exceeds framing ⚠️</span>'}`;

  var modalSpk = document.getElementById('vbarSpecModalSpkDetails');
  if (modalSpk) modalSpk.innerHTML = `<strong>Loudspeaker Throw:</strong> ${barCalc.spkMaxThrow}m &bull; Power: ${barCalc.spkPowerDesc} &bull; ${barCalc.spkPass ? '<span class="badge bg-success">Adequate SPL (≥70 dBA) ✓</span>' : '<span class="badge bg-danger">Acoustic Drop: Add distributed ceiling speakers!</span>'}`;

  var modalMic = document.getElementById('vbarSpecModalMicDetails');
  if (modalMic) modalMic.innerHTML = `<strong>Microphone Pickup:</strong> ${barCalc.micMaxReach}m radius (${barCalc.micDesc}) &bull; ${barCalc.micPass ? '<span class="badge bg-success">Covers all seated participants ✓</span>' : `<span class="badge bg-danger">+${barCalc.extMicsNeeded} Table Extension Mic Pods Required</span>`}`;

  var modalMount = document.getElementById('vbarSpecModalMountDetails');
  if (modalMount) modalMount.innerHTML = `<strong>Mounting Position:</strong> ${barPos.toUpperCase()} DISPLAY &bull; ${barPos === 'below' ? 'Optimizes participant eye-level sightlines.' : 'Clears credenzas & table obstructions.'}`;

  var modalEl = document.getElementById('videoBarRoomSpecsModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
  }
}

// Toggle View Mode: Desktop Table vs Mobile Cards
var matrixActiveViewMode = 'table';
function setMatrixViewMode(mode) {
  matrixActiveViewMode = mode;
  var tblWrapper = document.getElementById('matrixTableExportWrapper');
  var cardsWrapper = document.getElementById('matrixMobileCardsContainer');
  var btnTbl = document.getElementById('btnMatrixViewTable');
  var btnCards = document.getElementById('btnMatrixViewCards');

  if (mode === 'cards') {
    if (tblWrapper) tblWrapper.classList.add('d-none');
    if (cardsWrapper) cardsWrapper.classList.remove('d-none');
    if (btnTbl) btnTbl.classList.remove('active', 'btn-primary'), btnTbl.classList.add('btn-outline-primary');
    if (btnCards) btnCards.classList.add('active', 'btn-primary'), btnCards.classList.remove('btn-outline-primary');
    renderMatrixMobileCards();
  } else {
    if (tblWrapper) tblWrapper.classList.remove('d-none');
    if (cardsWrapper) cardsWrapper.classList.add('d-none');
    if (btnTbl) btnTbl.classList.add('active', 'btn-primary'), btnTbl.classList.remove('btn-outline-primary');
    if (btnCards) btnCards.classList.remove('active', 'btn-primary'), btnCards.classList.add('btn-outline-primary');
  }
}

// Render Mobile Cards View
function renderMatrixMobileCards() {
  var container = document.getElementById('matrixMobileCardsContainer');
  if (!container) return;

  var rows = document.querySelectorAll('#matrixTableBody tr');
  if (!rows || rows.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-4 text-muted">
        <i class="fa-solid fa-folder-open fs-2 mb-2"></i>
        <div>No rooms available. Use "Quick Room Entry" or "+ Add Room Row" above.</div>
      </div>
    `;
    return;
  }

  var html = '';
  rows.forEach(function(tr, idx) {
    var floor = tr.querySelector('.inp-floor')?.value || '01';
    var name = tr.querySelector('.inp-name')?.value || `Room ${idx+1}`;
    var qty = parseInt(tr.querySelector('.inp-qty')?.value) || 1;
    var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;
    var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 7000;
    var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 5000;
    var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;
    var sqm = (lm * wm) / 1e6;

    var dispDiag = tr.querySelector('.out-calc-diag')?.innerText || '85"';
    var dispDims = tr.querySelector('.out-calc-dims')?.innerText || '';

    var barType = tr.querySelector('.inp-video-bar')?.value || 'auto';
    var barCalc = calculateVideoBar(lm, wm, seats, barType);

    var camModel = tr.querySelector('.inp-cam-model')?.value || 'auto';
    var camHfov = tr.querySelector('.out-cam-hfov')?.innerText || '69.9°';
    var camFraming = tr.querySelector('.out-framing-badge')?.innerText || 'Auto';

    var spkQty = tr.querySelector('.inp-spk-qty')?.value || '4';
    var spkSize = tr.querySelector('.inp-spk-size')?.value || '6.5"';
    var micDesc = tr.querySelector('.out-mic-desc')?.innerText || 'Ceiling Array';

    var rt60 = tr.querySelector('.out-rt60')?.innerText || '0.54s';
    var panels = tr.querySelector('.out-panels')?.innerText || '0 m²';
    var estBudget = tr.querySelector('.out-budget-room')?.innerText || '₹0';

    var floorPal = typeof getFloorPalette === 'function' ? getFloorPalette(floor) : { badgeBg: '#2563eb' };

    html += `
      <div class="col-12 col-md-6 col-xl-4 mb-3">
        <div class="card shadow-sm border-0 h-100 room-mobile-card" style="border-left: 5px solid ${floorPal.badgeBg} !important; border-radius: 12px; background:#ffffff;">
          <div class="card-header bg-white border-bottom py-2.5 px-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-1.5 flex-wrap">
              <span class="badge text-white fw-bold px-2 py-1" style="background:${floorPal.badgeBg}; font-size:0.68rem;">FL ${floor}</span>
              <h6 class="fw-bold mb-0 text-dark" style="font-size:0.90rem;">${name}</h6>
              <span class="badge bg-purple-100 text-purple-900 border" style="font-size:0.65rem;">×${qty}</span>
            </div>
            <span class="badge bg-emerald-100 text-emerald-800 border border-emerald-300 font-monospace" style="font-size:0.72rem;">
              <i class="fa-solid fa-users me-1"></i>${seats} Seats
            </span>
          </div>

          <div class="card-body p-3">
            <!-- Dimensions Bar -->
            <div class="d-flex align-items-center justify-content-between p-2 rounded bg-slate-50 border border-slate-200 mb-2.5 font-monospace text-center" style="font-size:0.75rem;">
              <div><span class="text-muted d-block" style="font-size:0.60rem;">L</span><strong>${(lm/1000).toFixed(1)}m</strong></div>
              <div class="text-muted">&times;</div>
              <div><span class="text-muted d-block" style="font-size:0.60rem;">W</span><strong>${(wm/1000).toFixed(1)}m</strong></div>
              <div class="text-muted">&times;</div>
              <div><span class="text-muted d-block" style="font-size:0.60rem;">H</span><strong>${(hm/1000).toFixed(1)}m</strong></div>
              <div class="border-start ps-2"><span class="text-muted d-block" style="font-size:0.60rem;">AREA</span><strong class="text-primary">${sqm.toFixed(1)} m²</strong></div>
            </div>

            <!-- Subsystems Grid -->
            <div class="row g-2 mb-2" style="font-size:0.72rem;">
              <!-- Display -->
              <div class="col-6">
                <div class="p-2 rounded border bg-amber-50/70 border-amber-200 h-100">
                  <div class="text-amber-800 fw-bold mb-0.5" style="font-size:0.65rem;"><i class="fa-solid fa-tv me-1"></i>DISPLAY (DISCAS)</div>
                  <div class="fw-bold text-dark font-monospace">${dispDiag}</div>
                  <div class="small text-muted text-truncate" style="font-size:0.63rem;">${dispDims}</div>
                </div>
              </div>
              <!-- Video Bar -->
              <div class="col-6">
                <div class="p-2 rounded border bg-teal-50/70 border-teal-200 h-100">
                  <div class="text-teal-800 fw-bold mb-0.5" style="font-size:0.65rem;"><i class="fa-solid fa-cube me-1"></i>VIDEO BAR</div>
                  <div class="fw-bold text-dark font-monospace text-truncate">${barCalc.name}</div>
                  <div class="small text-teal-700 font-monospace" style="font-size:0.62rem;">Spk: ${barCalc.spkMaxThrow}m | Mic: ${barCalc.micMaxReach}m</div>
                </div>
              </div>
              <!-- Camera -->
              <div class="col-6">
                <div class="p-2 rounded border bg-indigo-50/70 border-indigo-200 h-100">
                  <div class="text-indigo-800 fw-bold mb-0.5" style="font-size:0.65rem;"><i class="fa-solid fa-video me-1"></i>CAMERA &amp; OPTICS</div>
                  <div class="fw-bold text-dark font-monospace text-truncate">${camModel}</div>
                  <div class="small text-indigo-700 font-monospace" style="font-size:0.62rem;">HFOV: ${camHfov} &bull; ${camFraming}</div>
                </div>
              </div>
              <!-- Audio -->
              <div class="col-6">
                <div class="p-2 rounded border bg-sky-50/70 border-sky-200 h-100">
                  <div class="text-sky-800 fw-bold mb-0.5" style="font-size:0.65rem;"><i class="fa-solid fa-volume-high me-1"></i>AUDIO &amp; MICS</div>
                  <div class="fw-bold text-dark font-monospace">${spkQty} × ${spkSize}</div>
                  <div class="small text-muted font-monospace text-truncate" style="font-size:0.62rem;">${micDesc}</div>
                </div>
              </div>
            </div>

            <!-- RT60 & Budget Strip -->
            <div class="d-flex align-items-center justify-content-between p-2 rounded bg-light border" style="font-size:0.75rem;">
              <div>
                <span class="text-muted me-1">RT60:</span><strong class="font-monospace">${rt60}</strong>
                <span class="text-muted ms-2">${panels}</span>
              </div>
              <div class="text-end">
                <span class="text-muted small">Est: </span><strong class="text-success font-monospace">${estBudget}</strong>
              </div>
            </div>
          </div>

          <div class="card-footer bg-white border-top py-2 px-3 d-flex justify-content-between align-items-center">
            <button type="button" class="btn btn-xs btn-outline-primary fw-bold" onclick="selectRowForVisualizerFromIndex(${idx})" style="font-size:0.70rem;">
              <i class="fa-solid fa-cube me-1"></i>3D Visualizer
            </button>
            <div class="d-flex gap-1">
              <button type="button" class="btn btn-xs btn-outline-secondary" onclick="sendRoomToStudioFromIndex(${idx}, 'Tab1')" title="Test in Display Studio">Tab 1</button>
              <button type="button" class="btn btn-xs btn-outline-secondary" onclick="sendRoomToStudioFromIndex(${idx}, 'Tab4')" title="Test in Camera Studio">Tab 4</button>
              <button type="button" class="btn btn-xs btn-outline-teal" onclick="sendRoomToStudioFromIndex(${idx}, 'Tab_VideoBar')" title="Test in Video Bar Studio">Bar</button>
              <button type="button" class="btn btn-xs btn-outline-danger" onclick="deleteRoomFromIndex(${idx})" title="Delete Room"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function selectRowForVisualizerFromIndex(idx) {
  var rows = document.querySelectorAll('#matrixTableBody tr');
  if (rows && rows[idx]) {
    rows[idx].click();
    var visEl = document.getElementById('matrix3DRoomVisualizerSection');
    if (visEl) visEl.scrollIntoView({ behavior: 'smooth' });
  }
}

function sendRoomToStudioFromIndex(idx, tabName) {
  var rows = document.querySelectorAll('#matrixTableBody tr');
  if (rows && rows[idx]) {
    if (tabName === 'Tab1') sendRoomToDisplayTab(rows[idx].querySelector('button') || rows[idx]);
    else if (tabName === 'Tab4') sendRoomToCameraTab(rows[idx].querySelector('button') || rows[idx]);
    else if (tabName === 'Tab_VideoBar') sendRoomToVideoBar(rows[idx].querySelector('button') || rows[idx]);
  }
}

function deleteRoomFromIndex(idx) {
  var rows = document.querySelectorAll('#matrixTableBody tr');
  if (rows && rows[idx]) {
    deleteRoomRow(rows[idx].querySelector('.btn-outline-danger') || rows[idx]);
  }
}

function exportToPDF(orientation) {
  if (typeof html2pdf === 'undefined') {
    alert('html2pdf library is loading or blocked. Please retry in a moment.');
    return;
  }

  // If called without orientation or invalid value, open orientation modal
  if (!orientation || (orientation !== 'portrait' && orientation !== 'landscape')) {
    if (typeof openPrintPdfModal === 'function') {
      openPrintPdfModal('matrix');
      return;
    }
    orientation = 'landscape';
  }

  var sourceElement = document.getElementById('matrixTableExportWrapper');
  if (!sourceElement) return;

  var projTitle = document.getElementById('matrixProjectNameInput')?.value.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Spatial_Room_Matrix';
  var isLandscape = (orientation === 'landscape');

  // Create print-optimized wrapper with HCMM watermark
  var wrapper = document.createElement('div');
  wrapper.id = 'tempMatrixPdfRenderWrapper';
  wrapper.style.position = 'relative';
  wrapper.style.overflow = 'hidden';
  wrapper.style.padding = isLandscape ? '16px 22px' : '20px 24px';
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.color = '#0f172a';
  wrapper.style.fontFamily = 'Inter, Arial, sans-serif';
  wrapper.style.width = isLandscape ? '1080px' : '780px';
  wrapper.style.maxWidth = isLandscape ? '1080px' : '780px';

  // Large diagonal HCMM watermark overlay
  var watermarkHtml = `
    <div style="position: absolute; top: 48%; left: 50%; transform: translate(-50%, -50%) rotate(-25deg); font-size: ${isLandscape ? '150px' : '110px'}; font-weight: 900; color: rgba(15, 23, 42, 0.08); letter-spacing: 20px; font-family: 'Inter', Arial, sans-serif; pointer-events: none; z-index: 9999; user-select: none; white-space: nowrap;">
      HCMM
    </div>
    <div style="border-bottom: 3px solid #dc2626; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2;">
      <div>
        <div style="font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
          PRO AV SPATIAL ROOM MATRIX SPECIFICATION SCHEDULE
        </div>
        <div style="font-size: 11px; font-weight: 600; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
          Color-Coded Multi-Floor Architectural Schedule &bull; ${orientation.toUpperCase()}
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 10px; font-weight: 800; color: #dc2626; border: 1.5px solid #dc2626; border-radius: 4px; padding: 2px 8px; background: #fef2f2; font-family: 'JetBrains Mono', monospace;">
          WATERMARK: HCMM
        </span>
        <span style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace;">
          ${new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  `;

  var clone = sourceElement.cloneNode(true);
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#0f172a';

  var footerHtml = `
    <div style="margin-top: 14px; border-top: 1px solid #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; position: relative; z-index: 2;">
      <span>Pro AV Spatial Room Matrix &bull; Multi-Floor Color Matrix</span>
      <span style="font-weight: 700; color: #dc2626; font-family: 'JetBrains Mono', monospace;">HCMM CERTIFIED &bull; [WATERMARK: HCMM]</span>
      <span>Orientation: ${orientation.toUpperCase()} &bull; Page 1 of 1</span>
    </div>
  `;

  wrapper.innerHTML = watermarkHtml;
  wrapper.appendChild(clone);
  var footEl = document.createElement('div');
  footEl.innerHTML = footerHtml;
  wrapper.appendChild(footEl);
  document.body.appendChild(wrapper);

  var opt = {
    margin: isLandscape ? [6, 6, 6, 6] : [8, 8, 8, 8],
    filename: `${projTitle}_HCMM_${orientation.toUpperCase()}_Schedule_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: orientation }
  };

  html2pdf().set(opt).from(wrapper).save().then(function() {
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  }).catch(function(err) {
    console.error('Matrix PDF error:', err);
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  });
}

// ==========================================
// MOBILE QR CODE HUB & MOBILE SUMMARY LOGIC
// ==========================================
var activeMobileSummaryData = null;

function getMatrixCurrentProjectData() {
  var projTitle = document.getElementById('matrixProjectNameInput')?.value || 'Pro AV Architectural Schedule';
  var rows = document.querySelectorAll('#matrixTableBody tr');
  var totalQty = 0;
  var totalSeats = 0;
  var totalAreaSqm = 0;
  var rooms = [];

  rows.forEach((tr, idx) => {
    var fl = tr.querySelector('.inp-floor')?.value || '01';
    var name = tr.querySelector('.inp-name')?.value || ('Room ' + (idx + 1));
    var qty = parseInt(tr.querySelector('.inp-qty')?.value) || 1;
    var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;
    var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 0;
    var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 0;
    var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 0;
    var sqm = parseFloat(((lm * wm) / 1e6).toFixed(2));
    var purpose = tr.querySelector('.inp-purpose')?.value || 'meeting';
    var diag = tr.querySelector('.out-calc-diag')?.innerText || '';
    var dims = tr.querySelector('.out-calc-dims')?.innerText || '';
    var rt60 = tr.querySelector('.out-rt60')?.innerText || '0.52s';
    var note = tr.querySelector('.inp-note')?.value || '';

    totalQty += qty;
    totalSeats += (seats * qty);
    totalAreaSqm += (sqm * qty);

    var spkSize = tr.querySelector('.inp-spk-size')?.value || '6.5"';
    var spkCalc = calculateCeilingSpeakers(lm, wm, hm, spkSize);
    var spkQty = (spkSize === 'none') ? 0 : spkCalc.count;

    var micType = tr.querySelector('.inp-mic-type')?.value || 'auto';
    var micCalc = calculateMicrophones(lm, wm, seats, micType);
    var micQty = (micType === 'none') ? 0 : micCalc.qty;

    rooms.push({
      fl: fl,
      floor: fl,
      name: name,
      qty: qty,
      seats: seats,
      l: lm,
      w: wm,
      h: hm,
      sqm: sqm,
      purpose: purpose,
      pitch: parseFloat(tr.querySelector('.inp-pitch')?.value) || 1.25,
      diag: diag,
      dims: dims,
      rt60: rt60,
      dispQty: parseInt(tr.querySelector('.inp-disp-qty')?.value) || 1,
      spkSize: spkSize,
      spkPos: tr.querySelector('.inp-spk-pos')?.value || 'ceiling',
      spkQty: spkQty,
      spkExtraQty: 0,
      camD1: tr.querySelector('.inp-cam-d1')?.value,
      camWspan: tr.querySelector('.inp-cam-wspan')?.value,
      camModel: tr.querySelector('.inp-cam-model')?.value || 'auto',
      camFraming: tr.querySelector('.inp-cam-framing')?.value || 'auto',
      camPos: tr.querySelector('.inp-cam-pos')?.value || 'above',
      camQty: parseInt(tr.querySelector('.inp-cam-qty')?.value) || 1,
      camExtraQty: parseInt(tr.querySelector('.inp-cam-extra')?.value) || 0,
      camZoomFactor: parseFloat(tr.querySelector('.inp-cam-zoom-num')?.value) || 12,
      videoBar: tr.querySelector('.inp-video-bar')?.value || 'auto',
      barPos: tr.querySelector('.inp-bar-pos')?.value || 'below',
      barQty: parseInt(tr.querySelector('.inp-bar-qty')?.value) || 1,
      micType: micType,
      micPos: tr.querySelector('.inp-mic-pos')?.value || 'ceiling',
      micQty: micQty,
      micExtraQty: 0,
      note: note,
      color: rgbToHex(tr.querySelector('.inp-color')?.value || '#ffffff')
    });
  });

  return {
    project: projTitle,
    generatedAt: new Date().toLocaleString(),
    totalRooms: totalQty,
    uniqueRooms: rows.length,
    totalSeats: totalSeats,
    totalAreaSqm: parseFloat(totalAreaSqm.toFixed(2)),
    totalAreaSqft: parseFloat((totalAreaSqm * 10.7639).toFixed(1)),
    rooms: rooms
  };
}

function openCameraD1SpanGuideModal() {
  var d1Input = document.getElementById('modalCamD1Input');
  var spanInput = document.getElementById('modalCamSpanInput');
  if (activeMatrixRoomData) {
    if (d1Input && activeMatrixRoomData.camD1) d1Input.value = parseFloat(activeMatrixRoomData.camD1).toFixed(1);
    if (spanInput && activeMatrixRoomData.camWspan) spanInput.value = parseFloat(activeMatrixRoomData.camWspan).toFixed(1);
  }
  calcModalHFOV();
  var modalEl = document.getElementById('cameraD1SpanModal');
  if (modalEl) {
    var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function calcModalHFOV() {
  var d1 = parseFloat(document.getElementById('modalCamD1Input')?.value) || 2.0;
  var span = parseFloat(document.getElementById('modalCamSpanInput')?.value) || 2.2;
  var halfAngleRad = Math.atan((span / 2.0) / Math.max(0.2, d1));
  var hfovDeg = (halfAngleRad * 2.0) * (180.0 / Math.PI);
  var hfovStr = hfovDeg.toFixed(1) + '°';

  var model = '72° PTZ (12x Zoom)';
  if (hfovDeg > 100) model = '120° Wide ePTZ (Bar)';
  else if (hfovDeg > 78) model = '85° PTZ (3x/5x Zoom)';
  else if (hfovDeg > 68) model = '72° PTZ (12x Zoom)';
  else model = '60° PTZ (20x/30x Zoom)';

  var hfovEl = document.getElementById('modalCalculatedHfov');
  if (hfovEl) hfovEl.innerText = hfovStr;
  var modelEl = document.getElementById('modalCalculatedModel');
  if (modelEl) modelEl.innerText = model;
}

function openAvArchitecturalGuideModal(section) {
  var key = 'cam';
  if (section === 'display' || section === 'disp') key = 'disp';
  else if (section === 'speaker' || section === 'spk') key = 'spk';
  else if (section === 'microphone' || section === 'mic') key = 'mic';
  else if (section === 'camera' || section === 'cam') key = 'cam';

  var modalEl = document.getElementById('cameraD1SpanModal');
  if (modalEl) {
    var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
    setTimeout(function() {
      switchAvGuideModalTab(key);
    }, 60);
  }
}

function switchAvGuideModalTab(tabKey) {
  var key = tabKey || 'cam';
  var validKeys = ['cam', 'disp', 'spk', 'mic'];
  if (!validKeys.includes(key)) key = 'cam';

  // 1. Update pills
  validKeys.forEach(function(k) {
    var btn = document.getElementById('tab-btn-guide-' + k);
    if (btn) {
      if (k === key) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    }
  });

  // 2. Update panes
  validKeys.forEach(function(k) {
    var pane = document.getElementById('tab-pane-guide-' + k);
    if (pane) {
      if (k === key) {
        pane.classList.add('active', 'show');
        pane.style.setProperty('display', 'block', 'important');
        pane.style.setProperty('opacity', '1', 'important');
        pane.style.setProperty('visibility', 'visible', 'important');
      } else {
        pane.classList.remove('active', 'show');
        pane.style.setProperty('display', 'none', 'important');
      }
    }
  });

  // 3. Trigger recalculation for the activated tab
  if (key === 'cam') {
    calcModalHFOV();
  } else if (key === 'disp') {
    calcModalDISCAS();
  } else if (key === 'spk') {
    calcModalSpeaker();
  } else if (key === 'mic') {
    calcModalMic();
  }
}

function toggleGuideSvgDetails(btn) {
  if (!btn) return;
  var container = btn.closest('.border.mb-4') || btn.closest('.rounded.border');
  if (!container) return;
  var body = container.querySelector('.guide-svg-body');
  if (!body) return;

  var isHidden = body.style.display === 'none';
  if (isHidden) {
    body.style.display = 'block';
    btn.innerHTML = '<i class="fa-solid fa-eye-slash me-1"></i>Hide Details';
  } else {
    body.style.display = 'none';
    btn.innerHTML = '<i class="fa-solid fa-eye me-1"></i>Show Details';
  }
}

function calcModalDISCAS() {
  var dist = parseFloat(document.getElementById('modalDispDistInput')?.value) || 6.0;
  var aspect = document.getElementById('modalDispAspectInput')?.value || '16:9';
  
  // BDM (6H): Height = Dist / 6
  var h_bdm_m = dist / 6.0;
  var w_bdm_m = aspect === '21:9' ? h_bdm_m * (21.0 / 9.0) : h_bdm_m * (16.0 / 9.0);
  var diag_bdm_in = Math.round((Math.sqrt(h_bdm_m * h_bdm_m + w_bdm_m * w_bdm_m) / 0.0254));

  // ADM (4H): Height = Dist / 4
  var h_adm_m = dist / 4.0;
  var w_adm_m = aspect === '21:9' ? h_adm_m * (21.0 / 9.0) : h_adm_m * (16.0 / 9.0);
  var diag_adm_in = Math.round((Math.sqrt(h_adm_m * h_adm_m + w_adm_m * w_adm_m) / 0.0254));

  var elBdm = document.getElementById('modalCalculatedBdm');
  if (elBdm) elBdm.innerText = `${diag_bdm_in}" Diagonal (${h_bdm_m.toFixed(2)}m H × ${w_bdm_m.toFixed(2)}m W)`;
  var elAdm = document.getElementById('modalCalculatedAdm');
  if (elAdm) elAdm.innerText = `${diag_adm_in}" Diagonal (${h_adm_m.toFixed(2)}m H × ${w_adm_m.toFixed(2)}m W)`;
}

function calcModalSpeaker() {
  var ceilH = parseFloat(document.getElementById('modalSpkCeilInput')?.value) || 2.8;
  var size = document.getElementById('modalSpkSizeInput')?.value || '6.5"';
  
  var theta = 100;
  if (size.includes('2.5')) theta = 150;
  else if (size.includes('3')) theta = 140;
  else if (size.includes('4')) theta = 130;
  else if (size.includes('5.25')) theta = 110;
  else if (size.includes('6.5')) theta = 100;
  else if (size.includes('8')) theta = 90;
  else if (size.includes('10')) theta = 80;
  else if (size.includes('12')) theta = 70;

  var h_listener = Math.max(0.6, ceilH - 1.2);
  var rad = (theta / 2.0) * (Math.PI / 180.0);
  var spacing = (2.0 * h_listener * Math.tan(rad)).toFixed(2);
  var coverageDia = (2.0 * h_listener * Math.tan(rad)).toFixed(2);

  var elSpace = document.getElementById('modalCalculatedSpkSpacing');
  if (elSpace) elSpace.innerText = `${spacing} m Grid Spacing`;
  var elCov = document.getElementById('modalCalculatedSpkCoverage');
  if (elCov) elCov.innerText = `${coverageDia} m Ear-Level Coverage Cone`;
}

function calcModalMic() {
  var lm = parseFloat(document.getElementById('modalMicLInput')?.value) || 7.0;
  var wm = parseFloat(document.getElementById('modalMicWInput')?.value) || 5.0;
  var seats = parseInt(document.getElementById('modalMicSeatsInput')?.value) || 12;

  var recType = 'Ceiling Beamforming Array';
  var recDeploy = '1 × Ceiling Tile (Shure MXA920 / Sennheiser TCC2)';

  if (seats <= 6 && lm <= 4.5) {
    recType = 'All-in-One Video Bar Microphone Array';
    recDeploy = 'Integrated 6-element Steerable Bar Array (4.5m Reach)';
  } else if (seats > 20 || lm > 12.0) {
    var tiles = Math.ceil(lm / 7.0);
    recType = 'Distributed Ceiling Beamforming Arrays';
    recDeploy = `${tiles} × Steerable Ceiling Tiles with Dante DSP AEC`;
  } else if (seats <= 12 && wm <= 4.5) {
    recType = 'Ceiling Beamforming Array';
    recDeploy = '1 × MXA920 Ceiling Tile (Covers entire table)';
  }

  var elType = document.getElementById('modalCalculatedMicType');
  if (elType) elType.innerText = recType;
  var elDeploy = document.getElementById('modalCalculatedMicQty');
  if (elDeploy) elDeploy.innerText = recDeploy;
}

function showRoomBudgetDetails(btn) {
  var tr = btn.closest('tr');
  if (!tr) return;

  var fl = tr.querySelector('.inp-floor')?.value || '01';
  var name = tr.querySelector('.inp-name')?.value || 'Meeting Room';
  var qty = parseInt(tr.querySelector('.inp-qty')?.value) || 1;
  var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;

  var budget = calculateRoomHardwareBudget(tr);

  var flEl = document.getElementById('budgetModalFloorBadge');
  if (flEl) flEl.innerText = `Floor ${fl}`;
  var nameEl = document.getElementById('budgetModalRoomName');
  if (nameEl) nameEl.innerText = name;
  var qtyEl = document.getElementById('budgetModalRoomQty');
  if (qtyEl) qtyEl.innerText = `${qty} Room${qty > 1 ? 's' : ''}`;
  var seatsEl = document.getElementById('budgetModalSeats');
  if (seatsEl) seatsEl.innerText = `${seats} Seats / rm`;

  var tbody = document.getElementById('budgetModalTableBody');
  if (tbody) {
    var b = budget.breakdown;
    tbody.innerHTML = `
      <tr>
        <td class="text-start ps-3 fw-bold text-teal-400"><i class="fa-solid fa-cube me-1"></i>Video Bar (AIO)</td>
        <td class="text-start ps-2 text-white">${b.barName}</td>
        <td>${b.videoBar > 0 ? '1' : '0'}</td>
        <td class="text-secondary">₹${b.videoBar.toLocaleString('en-IN')}</td>
        <td class="fw-bold text-success">₹${b.videoBar.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td class="text-start ps-3 fw-bold text-indigo-400"><i class="fa-solid fa-video me-1"></i>Camera System</td>
        <td class="text-start ps-2 text-white">${b.camModel}</td>
        <td>${b.camera > 0 ? '1' : '0 (Built-in)'}</td>
        <td class="text-secondary">₹${b.camera.toLocaleString('en-IN')}</td>
        <td class="fw-bold text-success">₹${b.camera.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td class="text-start ps-3 fw-bold text-cyan-400"><i class="fa-solid fa-volume-high me-1"></i>Ceiling Speakers</td>
        <td class="text-start ps-2 text-white">${b.spkModel}</td>
        <td>${b.spkCount}</td>
        <td class="text-secondary">₹${b.spkUnitPrice.toLocaleString('en-IN')}</td>
        <td class="fw-bold text-success">₹${b.speakers.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td class="text-start ps-3 fw-bold text-amber-400"><i class="fa-solid fa-microphone me-1"></i>Microphone System</td>
        <td class="text-start ps-2 text-white">${b.micModel}</td>
        <td>${b.microphones > 0 ? '1 System' : '0 (Built-in)'}</td>
        <td class="text-secondary">₹${b.microphones.toLocaleString('en-IN')}</td>
        <td class="fw-bold text-success">₹${b.microphones.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }

  var perRoomEl = document.getElementById('budgetModalPerRoomTotal');
  if (perRoomEl) perRoomEl.innerText = budget.roomCostStr + ' INR';
  var grandEl = document.getElementById('budgetModalGrandTotal');
  if (grandEl) grandEl.innerText = budget.totalForQtyStr + ` INR (${qty}x Multiplier)`;

  var modalEl = document.getElementById('roomBudgetDetailModal');
  if (modalEl) {
    var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function sendRoomToVideoBar(btn) {
  var tr = btn.closest('tr');
  if (!tr) return;

  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 7000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 5000;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;
  var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;
  var d1 = parseFloat(tr.querySelector('.inp-cam-d1')?.value) || 2.0;
  var wSpan = parseFloat(tr.querySelector('.inp-cam-wspan')?.value) || 3.2;
  var barPos = tr.querySelector('.inp-bar-pos')?.value || 'below';
  var barType = tr.querySelector('.inp-video-bar')?.value || 'auto';

  ['vbRoomLength', 'vbarRoomLength'].forEach(id => { var el = document.getElementById(id); if (el) el.value = (lm / 1000).toFixed(1); });
  ['vbRoomWidth', 'vbarRoomWidth'].forEach(id => { var el = document.getElementById(id); if (el) el.value = (wm / 1000).toFixed(1); });
  ['vbRoomHeight', 'vbarRoomHeight'].forEach(id => { var el = document.getElementById(id); if (el) el.value = (hm / 1000).toFixed(1); });
  ['vbRoomSeats', 'vbarRoomSeats'].forEach(id => { var el = document.getElementById(id); if (el) el.value = seats; });
  ['vbDistD1', 'vbarD1Dist'].forEach(id => { var el = document.getElementById(id); if (el) el.value = d1.toFixed(1); });
  ['vbSpanW', 'vbarSpanW'].forEach(id => { var el = document.getElementById(id); if (el) el.value = wSpan.toFixed(1); });
  ['vbBarTierSelect', 'vbarTierSel'].forEach(id => { var el = document.getElementById(id); if (el) el.value = barType; });
  ['vbPlacementSelect', 'vbarPlacementSel'].forEach(id => { var el = document.getElementById(id); if (el) el.value = barPos; });

  if (typeof refreshVbTargetRoomsDropdown === 'function') {
    refreshVbTargetRoomsDropdown();
  }
  var allRows = Array.from(document.querySelectorAll('#matrixTableBody tr'));
  var rowIdx = allRows.indexOf(tr);
  var targetSel = document.getElementById('vbTargetRoomSelect');
  if (targetSel && rowIdx >= 0) {
    targetSel.value = rowIdx.toString();
  }

  if (typeof calculateVideoBarStudio === 'function') {
    calculateVideoBarStudio();
  }
  if (typeof openTab === 'function') {
    openTab(null, 'Tab_VideoBar');
  }
}

// Open Dedicated Video Bar Triad Coverage Modal
function openVideoBarSpecsModal(btn) {
  var tr = btn.closest('tr') || document.querySelector('#matrixTableBody tr');
  if (!tr) return;

  var fl = tr.querySelector('.inp-floor')?.value || '01';
  var name = tr.querySelector('.inp-name')?.value || 'Meeting Room';
  var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;
  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 7000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 5000;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;
  var barType = tr.querySelector('.inp-video-bar')?.value || 'auto';
  var barPos = tr.querySelector('.inp-bar-pos')?.value || 'below';

  var L = lm / 1000.0;
  var W = wm / 1000.0;
  var dLast = L - 0.5;

  var barCalc = calculateVideoBar(lm, wm, seats, barType);

  var modalTitle = document.getElementById('vbModalRoomTitle');
  if (modalTitle) modalTitle.innerText = `${name} (Floor ${fl})`;
  var modalDim = document.getElementById('vbModalRoomDims');
  if (modalDim) modalDim.innerText = `${L.toFixed(1)}m L × ${W.toFixed(1)}m W × ${(hm/1000).toFixed(1)}m H (${seats} Seats)`;

  var modalBarName = document.getElementById('vbModalBarName');
  if (modalBarName) modalBarName.innerText = barCalc.name;
  var modalBarDesc = document.getElementById('vbModalBarDesc');
  if (modalBarDesc) modalBarDesc.innerText = barCalc.desc;

  // Triad - 1. Camera
  var modalCamHfov = document.getElementById('vbModalCamHfov');
  if (modalCamHfov) modalCamHfov.innerText = barCalc.camHfov;
  var modalCamReach = document.getElementById('vbModalCamReach');
  if (modalCamReach) modalCamReach.innerText = `${barCalc.camMaxReach}m Reach (${barCalc.camPass ? 'In-Bounds ✓' : 'Room Exceeds Reach ⚠️'})`;

  // Triad - 2. Speaker & SPL
  var modalSpkPower = document.getElementById('vbModalSpkPower');
  if (modalSpkPower) modalSpkPower.innerText = barCalc.spkPowerDesc;
  var splDecay = barCalc.spkPowerDesc.includes('86') ? (86 - 10*Math.log10(Math.max(1, dLast))) : (barCalc.spkPowerDesc.includes('90') ? (90 - 10*Math.log10(Math.max(1, dLast))) : (94 - 10*Math.log10(Math.max(1, dLast))));
  var modalSpkSpl = document.getElementById('vbModalSpkSpl');
  if (modalSpkSpl) modalSpkSpl.innerText = `~${splDecay.toFixed(1)} dBA at ${dLast.toFixed(1)}m (${splDecay >= 70 ? 'AVIXA Pass ≥70 dBA ✓' : 'Soft Speech ⚠️'})`;

  // Triad - 3. Microphone & Extension Pods
  var modalMicDesc = document.getElementById('vbModalMicDesc');
  if (modalMicDesc) modalMicDesc.innerText = `${barCalc.micDesc} (${barCalc.micMaxReach}m Pickup Radius)`;
  var modalMicPods = document.getElementById('vbModalMicPods');
  if (modalMicPods) {
    modalMicPods.innerText = barCalc.micPass ? 'Native Bar Sufficient (0 Extension Pods Needed)' : `⚠️ Add ${barCalc.extMicsNeeded} Table Extension Mic Pod(s) to cover ${L.toFixed(1)}m length`;
  }

  // Placement
  var modalPlacement = document.getElementById('vbModalPlacement');
  if (modalPlacement) {
    modalPlacement.innerText = barPos === 'above' ? '⬆️ Mounted Above Display (Downward Tilt ≤ 15°)' : '⬇️ Mounted Below Display (Eye-Level 1.2m Sightline)';
  }

  var modalEl = document.getElementById('videoBarRoomSpecsModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
  }
}

// Toggle between Desktop Table and Mobile Card-based Matrix View
function setMatrixViewMode(mode) {
  var tableWrap = document.getElementById('matrixTableExportWrapper');
  var cardsWrap = document.getElementById('matrixMobileCardsContainer');
  var btnTable = document.getElementById('btnMatrixViewTable');
  var btnCards = document.getElementById('btnMatrixViewCards');

  if (mode === 'cards') {
    if (tableWrap) tableWrap.classList.add('d-none');
    if (cardsWrap) cardsWrap.classList.remove('d-none');
    if (btnTable) { btnTable.classList.remove('btn-primary', 'active'); btnTable.classList.add('btn-outline-primary'); }
    if (btnCards) { btnCards.classList.remove('btn-outline-primary'); btnCards.classList.add('btn-primary', 'active'); }
    renderMatrixMobileCards();
  } else {
    if (tableWrap) tableWrap.classList.remove('d-none');
    if (cardsWrap) cardsWrap.classList.add('d-none');
    if (btnTable) { btnTable.classList.remove('btn-outline-primary'); btnTable.classList.add('btn-primary', 'active'); }
    if (btnCards) { btnCards.classList.remove('btn-primary', 'active'); btnCards.classList.add('btn-outline-primary'); }
  }
}

// Render Mobile-Responsive Room Cards
function renderMatrixMobileCards() {
  var container = document.getElementById('matrixMobileCardsContainer');
  if (!container) return;

  var rows = document.querySelectorAll('#matrixTableBody tr');
  if (!rows || rows.length === 0) {
    container.innerHTML = '<div class="alert alert-info font-mono small text-center">No rooms entered. Click "+ Add Room" to log spaces.</div>';
    return;
  }

  var html = '<div class="row g-3">';
  rows.forEach(function(tr, idx) {
    var fl = tr.querySelector('.inp-floor')?.value || '01';
    var name = tr.querySelector('.inp-name')?.value || ('Room ' + (idx + 1));
    var qty = parseInt(tr.querySelector('.inp-qty')?.value) || 1;
    var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 10;
    var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 7000;
    var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 5000;
    var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;
    var purpose = tr.querySelector('.inp-purpose')?.value || 'meeting';

    var L_m = (lm / 1000).toFixed(1);
    var W_m = (wm / 1000).toFixed(1);
    var H_m = (hm / 1000).toFixed(1);
    var sqm = ((lm * wm) / 1e6).toFixed(1);
    var cum = (sqm * (hm / 1000)).toFixed(1);

    var diagStr = tr.querySelector('.out-calc-diag')?.innerText || '85"';
    var dimsStr = tr.querySelector('.out-calc-dims')?.innerText || '';

    var barType = tr.querySelector('.inp-video-bar')?.value || 'auto';
    var barPos = tr.querySelector('.inp-bar-pos')?.value || 'below';
    var barCalc = calculateVideoBar(lm, wm, seats, barType);

    var camModel = tr.querySelector('.inp-cam-model')?.value || 'auto';
    var camHfov = tr.querySelector('.out-cam-hfov')?.innerText || '78°';
    var camZoom = tr.querySelector('.inp-cam-zoom-num')?.value || '12';

    var spkSize = tr.querySelector('.inp-spk-size')?.value || '6.5"';
    var spkCount = tr.querySelector('.out-spk-calc-badge')?.innerText || '4 Spk';

    var micType = tr.querySelector('.inp-mic-type')?.value || 'auto';
    var micDesc = tr.querySelector('.out-mic-desc')?.innerText || 'Ceiling Array';

    var rt60 = tr.querySelector('.out-rt60')?.innerText || '0.52s';
    var budgetRoom = tr.querySelector('.out-budget-room')?.innerText || '₹0';
    var budgetTotal = tr.querySelector('.out-budget-total')?.innerText || '₹0';
    var note = tr.querySelector('.inp-note')?.value || '';

    var floorPal = getFloorPalette(fl);
    var purpPal = getRoomPurposePalette(purpose);

    html += `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="card h-100 border shadow-xs" style="border-top: 4px solid ${floorPal.badgeBg} !important; border-radius: 10px; background:#ffffff;">
          <!-- Card Header -->
          <div class="p-2.5 pb-2 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-1" style="background:#f8fafc;">
            <div class="d-flex align-items-center gap-1.5">
              <span class="badge text-white font-mono" style="background:${floorPal.badgeBg}; font-size:0.72rem;">FL ${fl}</span>
              <span class="fw-bold text-dark fs-6">${name}</span>
            </div>
            <div class="d-flex align-items-center gap-1">
              <span class="badge" style="background:${purpPal.bg}; color:${purpPal.hex}; border:1px solid ${purpPal.excelBorder}; font-size:0.68rem;">${purpPal.label}</span>
              <span class="badge bg-primary font-mono" style="font-size:0.68rem;">${qty}x Rm &bull; ${seats} Seats</span>
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-2.5">
            <!-- Dimensions Bar -->
            <div class="p-2 rounded bg-light border font-mono small mb-2 d-flex justify-content-between align-items-center flex-wrap gap-1" style="font-size:0.75rem;">
              <div><strong>${L_m}L &times; ${W_m}W &times; ${H_m}H m</strong> <span class="text-muted">(${(lm/304.8).toFixed(1)}&times;${(wm/304.8).toFixed(1)} ft)</span></div>
              <div class="text-success fw-bold">${sqm} m² &bull; ${cum} m³</div>
            </div>

            <!-- Display & Video Bar Summary -->
            <div class="row g-2 mb-2 font-mono small" style="font-size:0.75rem;">
              <div class="col-6">
                <div class="p-2 rounded border h-100" style="background:#fffbeb; border-color:#fde68a !important;">
                  <span class="text-secondary fw-bold" style="font-size:0.70rem;"><i class="fa-solid fa-tv me-1 text-warning"></i>DISCAS DISPLAY</span>
                  <div class="fw-bold text-dark fs-7">${diagStr}</div>
                  <div class="text-muted" style="font-size:0.68rem;">${dimsStr || 'Standard 16:9'}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="p-2 rounded border h-100" style="background:#f0fdfa; border-color:#99f6e4 !important;">
                  <span class="text-secondary fw-bold" style="font-size:0.70rem;"><i class="fa-solid fa-cube me-1 text-teal"></i>VIDEO BAR</span>
                  <div class="fw-bold text-teal-900 fs-7 text-truncate" title="${barCalc.name}">${barCalc.name}</div>
                  <div class="text-muted" style="font-size:0.68rem;">${barPos === 'above' ? '⬆️ Above Disp' : '⬇️ Below Disp'}</div>
                </div>
              </div>
            </div>

            <!-- Triad Coverage Badges -->
            <div class="p-2 rounded border mb-2 font-mono" style="background:#f8fafc; font-size:0.72rem;">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span><i class="fa-solid fa-camera text-indigo me-1"></i>Cam: <strong class="text-dark">${camModel === 'none' ? 'None' : (barCalc.isBarActive ? barCalc.camHfov : camHfov)}</strong></span>
                <span class="badge bg-indigo-100 text-indigo-900">${camZoom}x Zoom</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span><i class="fa-solid fa-volume-high text-primary me-1"></i>Spk: <strong class="text-dark">${spkSize === 'none' ? 'None' : (barCalc.isBarActive ? barCalc.spkPowerDesc : spkCount)}</strong></span>
                <span class="badge ${barCalc.meetsAvixaSpeech || !barCalc.isBarActive ? 'bg-success' : 'bg-warning text-dark'}">AVIXA ${barCalc.isBarActive ? (barCalc.meetsAvixaSpeech ? 'Pass' : 'Low SPL') : 'Pass'}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span><i class="fa-solid fa-microphone text-amber-600 me-1"></i>Mic: <strong class="text-dark">${micType === 'none' ? 'None' : (barCalc.isBarActive ? barCalc.micDesc : micDesc)}</strong></span>
                <span class="badge ${barCalc.micPass || !barCalc.isBarActive ? 'bg-teal text-white' : 'bg-danger text-white'}" style="${barCalc.isBarActive ? 'background:#0d9488;' : ''}">
                  ${barCalc.isBarActive ? (barCalc.micPass ? '0 Pods' : `+${barCalc.extMicsNeeded} Pods`) : 'Array OK'}
                </span>
              </div>
            </div>

            <!-- Acoustics & Budget Row -->
            <div class="d-flex justify-content-between align-items-center p-2 rounded bg-light border font-mono small mb-2" style="font-size:0.75rem;">
              <div><i class="fa-solid fa-wave-square me-1 text-info"></i>RT60: <strong class="text-info">${rt60}</strong></div>
              <div class="text-end">
                <span class="text-muted" style="font-size:0.68rem;">Total Budget:</span>
                <strong class="text-success ms-1">${budgetTotal}</strong>
              </div>
            </div>

            ${note ? `<div class="p-1.5 rounded bg-amber-50 border border-amber-200 small text-amber-900 font-mono mb-2" style="font-size:0.70rem;"><i class="fa-solid fa-note-sticky text-warning me-1"></i>${note}</div>` : ''}

            <!-- Quick Action Buttons -->
            <div class="d-flex justify-content-between align-items-center pt-1 border-top gap-1 flex-wrap">
              <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-outline-teal btn-xs py-1 px-2 fw-bold font-mono" style="font-size:0.70rem; color:#0d9488; border-color:#0d9488;" onclick="sendRoomToVideoBar(this)" title="Test in Video Bar Studio">
                  <i class="fa-solid fa-cube me-1"></i>Bar Studio
                </button>
                <button type="button" class="btn btn-outline-primary btn-xs py-1 px-2 fw-bold font-mono" style="font-size:0.70rem;" onclick="sendRoomToDisplayTab(this)" title="Display Studio">
                  <i class="fa-solid fa-tv me-1"></i>Display
                </button>
                <button type="button" class="btn btn-outline-info btn-xs py-1 px-2 fw-bold font-mono" style="font-size:0.70rem;" onclick="selectMatrixRoomFor3D(document.querySelectorAll('#matrixTableBody tr')[${idx}])" title="View in 3D">
                  <i class="fa-solid fa-cube me-1"></i>3D Room
                </button>
              </div>
              <div class="btn-group btn-group-sm ms-auto">
                <button type="button" class="btn btn-outline-secondary btn-xs py-1 px-2" onclick="copyRoomRow(document.querySelectorAll('#matrixTableBody tr')[${idx}].querySelector('.btn-copy-room'))" title="Duplicate Room">
                  <i class="fa-solid fa-copy"></i>
                </button>
                <button type="button" class="btn btn-outline-danger btn-xs py-1 px-2" onclick="removeRoomRow(document.querySelectorAll('#matrixTableBody tr')[${idx}].querySelector('.btn-remove-room'))" title="Delete Room">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function openCameraZoomSpecsModal() {
  calcModalZoomRequirements();
  var modalEl = document.getElementById('cameraZoomSpecsModal');
  if (modalEl) {
    var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function calcModalZoomRequirements() {
  var dist = parseFloat(document.getElementById('modalZoomDistInput')?.value) || 12.0;
  var target = document.getElementById('modalZoomTargetType')?.value || 'bust';
  
  var reqZoom = '12x Optical Zoom';
  var recModel = '72° PTZ (12x Zoom)';
  
  if (dist <= 4.5 && target !== 'tight') {
    reqZoom = '1x–4x Digital ePTZ';
    recModel = '120° Wide ePTZ (Bar)';
  } else if (dist <= 7.5) {
    reqZoom = '3x–5x Optical Zoom';
    recModel = '85° PTZ (3x/5x Zoom)';
  } else if (dist <= 14.0) {
    reqZoom = '12x Optical Zoom';
    recModel = '72° PTZ (12x Zoom)';
  } else {
    reqZoom = '20x–30x Optical Zoom';
    recModel = '60° PTZ (20x/30x Zoom)';
  }
  
  var zOut = document.getElementById('modalCalculatedZoomRatio');
  if (zOut) zOut.innerText = reqZoom;
  var mOut = document.getElementById('modalCalculatedZoomModel');
  if (mOut) mOut.innerText = recModel;
}

function openSpatialMatrixUserGuideModal() {
  var modalEl = document.getElementById('spatialMatrixUserGuideModal');
  if (modalEl) {
    var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function openMatrixQrCodeModal() {
  var data = getMatrixCurrentProjectData();
  activeMobileSummaryData = data;

  var titleEl = document.getElementById('qrProjectTitle');
  if (titleEl) titleEl.innerText = data.project;
  var timeEl = document.getElementById('qrGeneratedTime');
  if (timeEl) timeEl.innerText = data.generatedAt;
  var roomsEl = document.getElementById('qrTotalRooms');
  if (roomsEl) roomsEl.innerText = `${data.totalRooms} Rooms (${data.uniqueRooms} Unique)`;
  var seatsEl = document.getElementById('qrTotalSeats');
  if (seatsEl) seatsEl.innerText = `${data.totalSeats} Total Seats`;
  var areaEl = document.getElementById('qrTotalArea');
  if (areaEl) areaEl.innerText = `${data.totalAreaSqm} m² (${data.totalAreaSqft} ft²)`;

  var compactJson = JSON.stringify(data);
  try {
    localStorage.setItem('pro_av_mobile_project', compactJson);
  } catch(e) {}

  var baseOrigin = window.location.origin + window.location.pathname;
  var encodedData = encodeURIComponent(btoa(unescape(encodeURIComponent(compactJson))));
  var mobileUrl = baseOrigin + '#mobile-summary';
  if (encodedData.length < 1800) {
    mobileUrl = baseOrigin + '#mobile-summary?d=' + encodedData;
  }

  window.lastGeneratedMobileUrl = mobileUrl;

  var canvas = document.getElementById('matrixQrCodeCanvas');
  if (canvas) {
    if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
      QRCode.toCanvas(canvas, mobileUrl, {
        width: 220,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }, function(err) {
        if (err) {
          drawQrFallback(canvas, mobileUrl);
        }
      });
    } else {
      drawQrFallback(canvas, mobileUrl);
    }
  }

  var modalEl = document.getElementById('matrixQrCodeModal');
  if (modalEl) {
    var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function drawQrFallback(canvas, mobileUrl) {
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    ctx.drawImage(img, 0, 0, 220, 220);
  };
  img.onerror = function() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 220, 220);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code Ready', 110, 100);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText('Tap Copy Link below', 110, 125);
  };
  img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(mobileUrl);
}

function downloadQrCodeImage() {
  var canvas = document.getElementById('matrixQrCodeCanvas');
  if (!canvas) return;
  var projTitle = document.getElementById('matrixProjectNameInput')?.value.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Spatial_Matrix';
  var link = document.createElement('a');
  link.download = `${projTitle}_Mobile_QR.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function copyMobileSummaryLink(btn) {
  var url = window.lastGeneratedMobileUrl || (window.location.origin + window.location.pathname + '#mobile-summary');
  navigator.clipboard.writeText(url).then(function() {
    var orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check text-success me-1"></i>Copied Mobile Link!';
    btn.classList.add('border-success');
    setTimeout(function() {
      btn.innerHTML = orig;
      btn.classList.remove('border-success');
    }, 2000);
  }).catch(function() {
    prompt('Copy this mobile summary link:', url);
  });
}

function openDirectMobileSummaryView() {
  var modalEl = document.getElementById('matrixQrCodeModal');
  if (modalEl) {
    var modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
  setTimeout(function() {
    renderMobileSummaryScreen(activeMobileSummaryData || getMatrixCurrentProjectData());
  }, 250);
}

function renderMobileSummaryScreen(data) {
  if (!data) return;
  activeMobileSummaryData = data;

  var titleEl = document.getElementById('mobileModalProjectTitle');
  if (titleEl) titleEl.innerText = data.project || 'Project Summary';

  var rEl = document.getElementById('mobStatRooms');
  if (rEl) rEl.innerText = data.totalRooms || data.rooms?.length || 0;
  var sEl = document.getElementById('mobStatSeats');
  if (sEl) sEl.innerText = data.totalSeats || 0;
  var aEl = document.getElementById('mobStatArea');
  if (aEl) aEl.innerText = (data.totalAreaSqm || 0) + ' m²';

  renderMobileRoomCards(data.rooms || []);

  var mobModalEl = document.getElementById('mobileProjectSummaryModal');
  if (mobModalEl) {
    var mobModal = bootstrap.Modal.getInstance(mobModalEl) || new bootstrap.Modal(mobModalEl);
    mobModal.show();
  }
}

function renderMobileRoomCards(rooms) {
  var container = document.getElementById('mobileRoomCardsList');
  if (!container) return;

  if (!rooms || rooms.length === 0) {
    container.innerHTML = '<div class="text-center text-muted p-4 font-mono small">No rooms found.</div>';
    return;
  }

  var html = '';
  rooms.forEach(r => {
    var purposeBadge = 'bg-primary';
    var purposeLabel = 'Meeting Room';
    if (r.purpose === 'uc') { purposeBadge = 'bg-success'; purposeLabel = 'Teams UC'; }
    else if (r.purpose === 'videowall') { purposeBadge = 'bg-purple-600'; purposeLabel = 'dvLED Wall'; }
    else if (r.purpose === 'interactive') { purposeBadge = 'bg-warning text-dark'; purposeLabel = 'Touch IFPD'; }

    html += `
      <div class="p-3 rounded border border-secondary mb-1" style="background:#0f172a;">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <div class="fw-bold text-white font-mono" style="font-size:0.95rem;">
            <span class="badge bg-secondary me-1 font-mono">Fl ${r.fl}</span> ${r.name}
          </div>
          <span class="badge ${purposeBadge} font-mono">${purposeLabel}</span>
        </div>
        <div class="d-flex justify-content-between align-items-center small text-slate-400 font-mono mb-2" style="font-size:0.75rem;">
          <span>Qty: <strong class="text-white">${r.qty}</strong></span>
          <span>Seats: <strong class="text-warning">${r.seats} Seats/room</strong> (${r.seats * r.qty} Total)</span>
        </div>
        <div class="row g-1 small font-mono text-slate-300" style="font-size:0.75rem;">
          <div class="col-6">
            <div class="p-1 rounded bg-dark border border-secondary">
              <span class="text-slate-400">Dimensions:</span><br>
              <strong class="text-cyan">${(r.l/1000).toFixed(1)}L &times; ${(r.w/1000).toFixed(1)}W &times; ${(r.h/1000).toFixed(1)}H m</strong>
              <div class="text-muted" style="font-size:0.65rem;">${(r.l/304.8).toFixed(1)} &times; ${(r.w/304.8).toFixed(1)} ft</div>
            </div>
          </div>
          <div class="col-6">
            <div class="p-1 rounded bg-dark border border-secondary">
              <span class="text-slate-400">Area &amp; Volume:</span><br>
              <strong class="text-success">${r.sqm} m²</strong> <span class="text-muted" style="font-size:0.65rem;">(${(r.sqm*10.7639).toFixed(1)} ft²)</span>
              <div class="text-muted" style="font-size:0.65rem;">Vol: ${(r.sqm * (r.h/1000)).toFixed(1)} m³</div>
            </div>
          </div>
          <div class="col-6">
            <div class="p-1 rounded bg-dark border border-secondary mt-1">
              <span class="text-slate-400"><i class="fa-solid fa-tv me-1 text-warning"></i>DISCAS Display:</span><br>
              <strong class="text-white">${r.diag}</strong>
              <div class="text-muted" style="font-size:0.65rem;">${r.dims}</div>
            </div>
          </div>
          <div class="col-6">
            <div class="p-1 rounded bg-dark border border-secondary mt-1">
              <span class="text-slate-400"><i class="fa-solid fa-wave-square me-1 text-info"></i>Speech RT60:</span><br>
              <strong class="text-info">${r.rt60}</strong>
              <div class="text-muted" style="font-size:0.65rem;">Intelligibility Clear</div>
            </div>
          </div>
        </div>
        ${r.note ? `<div class="mt-2 p-1 rounded bg-dark border border-secondary small text-slate-300 font-mono" style="font-size:0.7rem;"><i class="fa-solid fa-note-sticky text-warning me-1"></i>${r.note}</div>` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

function filterMobileRooms() {
  if (!activeMobileSummaryData || !activeMobileSummaryData.rooms) return;
  var q = (document.getElementById('mobileSearchInput')?.value || '').toLowerCase().trim();
  if (!q) {
    renderMobileRoomCards(activeMobileSummaryData.rooms);
    return;
  }
  var filtered = activeMobileSummaryData.rooms.filter(r => {
    return (r.name && r.name.toLowerCase().includes(q)) ||
           (r.fl && r.fl.toLowerCase().includes(q)) ||
           (r.purpose && r.purpose.toLowerCase().includes(q)) ||
           (r.note && r.note.toLowerCase().includes(q));
  });
  renderMobileRoomCards(filtered);
}

function checkUrlMobileSummaryHash() {
  if (window.location.hash.startsWith('#mobile-summary')) {
    var query = window.location.hash.split('?')[1];
    if (query && query.startsWith('d=')) {
      try {
        var base64 = decodeURIComponent(query.substring(2));
        var jsonStr = decodeURIComponent(escape(atob(base64)));
        var parsed = JSON.parse(jsonStr);
        setTimeout(function() {
          renderMobileSummaryScreen(parsed);
        }, 500);
        return;
      } catch(e) {
        console.warn('Could not parse mobile summary payload from hash:', e);
      }
    }

    try {
      var saved = localStorage.getItem('pro_av_mobile_project');
      if (saved) {
        var parsedSaved = JSON.parse(saved);
        setTimeout(function() {
          renderMobileSummaryScreen(parsedSaved);
        }, 500);
        return;
      }
    } catch(e) {}

    setTimeout(function() {
      renderMobileSummaryScreen(getMatrixCurrentProjectData());
    }, 500);
  }
}

window.addEventListener('hashchange', checkUrlMobileSummaryHash);
document.addEventListener('DOMContentLoaded', function() {
  checkUrlMobileSummaryHash();
});

function handleUrlDeepLinkRouting() {
  try {
    var urlParams = new URLSearchParams(window.location.search);
    var hash = window.location.hash || '';

    // Check for target tab
    var targetTab = null;
    if (urlParams.get('tab')) {
      targetTab = urlParams.get('tab');
    } else if (hash.includes('tab=')) {
      var tMatch = hash.match(/tab=([^&]+)/);
      if (tMatch) targetTab = tMatch[1];
    }

    if (targetTab && typeof openTab === 'function') {
      openTab(null, targetTab);
    } else {
      if (typeof calculateDisplay === 'function') calculateDisplay();
    }

    // Check for shared cloud project
    var projId = urlParams.get('project');
    if (!projId && hash.includes('project=')) {
      var pMatch = hash.match(/project=([^&]+)/);
      if (pMatch) projId = pMatch[1];
    }
    if (projId && typeof autoLoadUrlSharedProject === 'function') {
      autoLoadUrlSharedProject(projId);
    }
  } catch(e) {
    if (typeof calculateDisplay === 'function') calculateDisplay();
  }
}

window.addEventListener('hashchange', function() {
  checkUrlMobileSummaryHash();
  handleUrlDeepLinkRouting();
});

// FAST DEFERRED INITIALIZATION ON STARTUP (Ensure core UI components render first)
function initAppCalculationSuite() {
  // Yield thread so browser can paint header, buttons, and layout immediately
  requestAnimationFrame(function() {
    setTimeout(function() {
      // 1. Initialize matrix table
      initSpatialMatrix();

      // 2. Open active tab and run only its calculation
      handleUrlDeepLinkRouting();
    }, 0);
  });
}

if (document.readyState === 'complete') {
  initAppCalculationSuite();
} else {
  window.addEventListener('load', initAppCalculationSuite);
}

// Global window bindings
window.exportToCSV = exportToCSV;
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;
window.exportToJSON = exportToJSON;
window.initSpatialMatrix = initSpatialMatrix;
window.addRoomRow = addRoomRow;
window.sortMatrixFloorWise = sortMatrixFloorWise;
window.onFloorChanged = onFloorChanged;
window.onPurposeChanged = onPurposeChanged;
window.getFloorPalette = getFloorPalette;
window.getRoomPurposePalette = getRoomPurposePalette;
window.openCameraD1SpanGuideModal = openCameraD1SpanGuideModal;
window.calcModalHFOV = calcModalHFOV;
window.openSpatialMatrixUserGuideModal = openSpatialMatrixUserGuideModal;
window.switchMatrixVisView = switchMatrixVisView;
window.selectMatrixRoomFor3D = selectMatrixRoomFor3D;
window.renderMatrix3DRoomVisualizer = renderMatrix3DRoomVisualizer;
window.recalcRoomRow = recalcRoomRow;
window.applyRowColor = applyRowColor;
window.copyRoomRow = copyRoomRow;
window.removeRoomRow = removeRoomRow;
window.updateDimFromMmRow = updateDimFromMmRow;
window.updateDimFromFtRow = updateDimFromFtRow;
window.sendRoomToDisplayTab = sendRoomToDisplayTab;
window.sendRoomToCameraTab = sendRoomToCameraTab;
window.sendRoomToSpeakerTab = sendRoomToSpeakerTab;
window.sendRoomToMicrophoneTab = sendRoomToMicrophoneTab;
window.sendRoomToAcousticsTab = sendRoomToAcousticsTab;
window.addRoomFromQuickForm = addRoomFromQuickForm;
window.saveProjectByName = saveProjectByName;
window.loadSelectedProject = loadSelectedProject;
window.deleteSelectedProject = deleteSelectedProject;
window.createNewProject = createNewProject;
window.openMatrixQrCodeModal = openMatrixQrCodeModal;
window.downloadQrCodeImage = downloadQrCodeImage;
window.copyMobileSummaryLink = copyMobileSummaryLink;
window.openDirectMobileSummaryView = openDirectMobileSummaryView;
window.toggleMatrixQuickGuide = toggleMatrixQuickGuide;
window.openCameraZoomSpecsModal = openCameraZoomSpecsModal;
window.calcModalZoomRequirements = calcModalZoomRequirements;
window.openAvArchitecturalGuideModal = openAvArchitecturalGuideModal;
window.switchAvGuideModalTab = switchAvGuideModalTab;
window.toggleGuideSvgDetails = toggleGuideSvgDetails;
window.calcModalDISCAS = calcModalDISCAS;
window.calcModalSpeaker = calcModalSpeaker;
window.calcModalMic = calcModalMic;
window.showRoomBudgetDetails = showRoomBudgetDetails;
window.sendRoomToVideoBar = sendRoomToVideoBar;
window.calculateVideoBar = calculateVideoBar;
window.calculateRoomHardwareBudget = calculateRoomHardwareBudget;
window.formatINR = formatINR;
window.quickExportExcel = quickExportExcel;
window.openExportOptionsModal = openExportOptionsModal;
window.setExportOptionsAll = setExportOptionsAll;
window.setExportOptionsDefaults = setExportOptionsDefaults;
window.getSelectedExportOptions = getSelectedExportOptions;
window.triggerCustomExport = triggerCustomExport;
window.openDevicePricingModal = openDevicePricingModal;
window.saveCustomPricingFromModal = saveCustomPricingFromModal;
window.resetPricingModalToDefaults = resetPricingModalToDefaults;
window.getHiddenMatrixColumns = getHiddenMatrixColumns;
window.toggleColumnVisibility = toggleColumnVisibility;
window.applyAllColumnVisibility = applyAllColumnVisibility;
window.applyCurrentColumnVisibility = applyCurrentColumnVisibility;
window.toggleSpeakerOverlap = toggleSpeakerOverlap;
window.toggleAcousticHeatmap = toggleAcousticHeatmap;
window.syncCamZoomSlider = syncCamZoomSlider;
window.syncCamZoomNum = syncCamZoomNum;
window.openVideoBarSpecsModal = openVideoBarSpecsModal;
window.setMatrixViewMode = setMatrixViewMode;
window.renderMatrixMobileCards = renderMatrixMobileCards;
window.calculateRoomPowerAndLan = calculateRoomPowerAndLan;
window.renderSocketsCellHtml = renderSocketsCellHtml;
window.renderLanCellHtml = renderLanCellHtml;
window.renderPowerCellHtml = renderPowerCellHtml;
window.refreshAllStudioTargetRoomDropdowns = refreshAllStudioTargetRoomDropdowns;
window.loadSelectedMatrixRoomToStudio = loadSelectedMatrixRoomToStudio;
window.applyStudioToSpatialMatrix = applyStudioToSpatialMatrix;
window.toggleMatrixColumnDirect = toggleMatrixColumnDirect;
window.showAllMatrixColumns = showAllMatrixColumns;
window.focusAvSubsystemsColumns = focusAvSubsystemsColumns;

