// ==========================================
// TAB 1: DISPLAY & UC SPACE STUDIO
// ==========================================
var currentDisplayVisView = '3D';

function toggleDisplayVisView(mode) {
  currentDisplayVisView = mode;
  var btn3D = document.getElementById('btnVisView3D');
  var btn2D = document.getElementById('btnVisView2D');
  var badge = document.getElementById('visCurrentViewBadge');

  if (btn3D) btn3D.classList.toggle('active', mode === '3D');
  if (btn2D) btn2D.classList.toggle('active', mode === '2D');
  if (badge) badge.innerText = (mode === '3D') ? 'ACTIVE VIEW: 3D ISOMETRIC ROOM PERSPECTIVE' : 'ACTIVE VIEW: 2D 3-VIEW ORTHOGRAPHIC PROJECTION';

  var isModeA = document.getElementById('containerModeA')?.style.display !== 'none';
  if (isModeA) calculateDisplay();
  else calculateDistance();
}

function updateRoomDepthFromMm() {
  var mm = parseFloat(document.getElementById('depthMmInput').value) || 6000;
  document.getElementById('depthFtInput').value = (mm / 304.8).toFixed(1);
  calculateDisplay();
}

function updateRoomDepthFromFt() {
  var ft = parseFloat(document.getElementById('depthFtInput').value) || 19.7;
  document.getElementById('depthMmInput').value = Math.round(ft * 304.8);
  calculateDisplay();
}

function updateRoomWidthFromMm() {
  var mm = parseFloat(document.getElementById('widthMmInput').value) || 4500;
  document.getElementById('widthFtInput').value = (mm / 304.8).toFixed(1);
  calculateDisplay();
}

function updateRoomWidthFromFt() {
  var ft = parseFloat(document.getElementById('widthFtInput').value) || 14.8;
  document.getElementById('widthMmInput').value = Math.round(ft * 304.8);
  calculateDisplay();
}

function updateDiagFromInches() {
  var inches = parseFloat(document.getElementById('diagInchesInput').value) || 85;
  document.getElementById('diagMmInput').value = Math.round(inches * 25.4);
  calculateDistance();
}

function updateDiagFromMm() {
  var mm = parseFloat(document.getElementById('diagMmInput').value) || 2159;
  document.getElementById('diagInchesInput').value = (mm / 25.4).toFixed(1);
  calculateDistance();
}

function setPresetDiag(inches) {
  var inInp = document.getElementById('diagInchesInput');
  if (inInp) inInp.value = inches;
  updateDiagFromInches();
}

function switchDisplayStudioMode(mode) {
  var btnA = document.getElementById('btnModeA');
  var btnB = document.getElementById('btnModeB');
  var containerA = document.getElementById('containerModeA');
  var containerB = document.getElementById('containerModeB');

  if (mode === 'A') {
    btnA.className = 'mode-toggle-btn active-blue';
    btnB.className = 'mode-toggle-btn';
    containerA.style.display = 'block';
    containerB.style.display = 'none';
    calculateDisplay();
  } else {
    btnA.className = 'mode-toggle-btn';
    btnB.className = 'mode-toggle-btn active-orange';
    containerA.style.display = 'none';
    containerB.style.display = 'block';
    calculateDistance();
  }
}

function calculateDisplay() {
  var DMm = parseFloat(document.getElementById('depthMmInput')?.value) || 6000;
  var WMm = parseFloat(document.getElementById('widthMmInput')?.value) || 4500;
  var HMm = parseFloat(document.getElementById('roomHeightMmInput')?.value) || 2700;
  var affMm = parseFloat(document.getElementById('displayAffInput')?.value) || 950;
  var eyeMm = parseFloat(document.getElementById('seatedEyeHtInput')?.value) || 1200;

  var D = DMm / 1000.0;
  var W = WMm / 1000.0;
  var H_room = HMm / 1000.0;

  var H4 = D / 4.0, H5 = D / 5.0, H6 = D / 6.0, H8 = D / 8.0, H_uc = (D / 6.0) / 0.8;
  var Diag4 = (H4 / 9.0) * Math.sqrt(337) * 39.3701;
  var Diag5 = (H5 / 9.0) * Math.sqrt(337) * 39.3701;
  var Diag6 = (H6 / 9.0) * Math.sqrt(337) * 39.3701;
  var Diag8 = (H8 / 9.0) * Math.sqrt(337) * 39.3701;
  var DiagUc = (H_uc / 9.0) * Math.sqrt(337) * 39.3701;

  var W4 = H4 * (16.0 / 9.0), W5 = H5 * (16.0 / 9.0), W6 = H6 * (16.0 / 9.0), W8 = H8 * (16.0 / 9.0), W_uc = H_uc * (16.0 / 9.0);
  var minFirstPerson = W6 * 1.0;

  var topAffM = (affMm / 1000.0) + H6;
  var vertTilt = Math.atan((topAffM - (eyeMm/1000.0)) / D) * (180 / Math.PI);

  var recBadge = document.getElementById('recSummaryBadge');
  var recDiagV = document.getElementById('recDiagVal');
  var recDiagF = document.getElementById('recDiagFt');
  var recDimsV = document.getElementById('recDimsVal');
  var recDimsF = document.getElementById('recDimsFt');
  var recFirstV = document.getElementById('recFirstPersonVal');
  var recFirstF = document.getElementById('recFirstPersonFt');
  var recLastV = document.getElementById('recLastPersonVal');
  var recLastF = document.getElementById('recLastPersonFt');

  var stdDiag6H = getStandardSize(Diag6);

  if (recBadge) recBadge.textContent = stdDiag6H + ' Widescreen (16:9)';
  if (recDiagV) recDiagV.textContent = Diag6.toFixed(1) + '" (' + Math.round(Diag6 * 25.4) + ' mm)';
  if (recDiagF) recDiagF.textContent = (Diag6 * 25.4 / 304.8).toFixed(2) + ' ft diagonal';
  if (recDimsV) recDimsV.textContent = Math.round(W6 * 1000) + ' × ' + Math.round(H6 * 1000) + ' mm';
  if (recDimsF) recDimsF.textContent = (W6 / 0.3048).toFixed(2) + ' × ' + (H6 / 0.3048).toFixed(2) + ' ft';
  if (recFirstV) recFirstV.textContent = Math.round(minFirstPerson * 1000) + ' mm';
  if (recFirstF) recFirstF.textContent = (minFirstPerson / 0.3048).toFixed(2) + ' ft closest row';
  if (recLastV) recLastV.textContent = Math.round(DMm) + ' mm';
  if (recLastF) recLastF.textContent = (DMm / 304.8).toFixed(2) + ' ft furthest row';

  var el4H = document.getElementById('res4xH');
  if (el4H) {
    document.getElementById('res4xDims').innerText = `${(W4*1000).toFixed(0)} × ${(H4*1000).toFixed(0)} mm`;
    el4H.innerText = H4.toFixed(2) + ' m';
    document.getElementById('res4xDiag').innerText = Diag4.toFixed(1) + '"';
    document.getElementById('res4xCalcSize').innerText = Diag4.toFixed(1) + '"';
    document.getElementById('res4xStd').innerText = getStandardSize(Diag4);

    document.getElementById('res5xDims').innerText = `${(W5*1000).toFixed(0)} × ${(H5*1000).toFixed(0)} mm`;
    document.getElementById('res5xH').innerText = H5.toFixed(2) + ' m';
    document.getElementById('res5xDiag').innerText = Diag5.toFixed(1) + '"';
    document.getElementById('res5xCalcSize').innerText = Diag5.toFixed(1) + '"';
    document.getElementById('res5xStd').innerText = getStandardSize(Diag5);

    document.getElementById('res6xDims').innerText = `${(W6*1000).toFixed(0)} × ${(H6*1000).toFixed(0)} mm`;
    document.getElementById('res6xH').innerText = H6.toFixed(2) + ' m';
    document.getElementById('res6xDiag').innerText = Diag6.toFixed(1) + '"';
    document.getElementById('res6xCalcSize').innerText = Diag6.toFixed(1) + '"';
    document.getElementById('res6xStd').innerText = getStandardSize(Diag6);

    document.getElementById('res8xDims').innerText = `${(W8*1000).toFixed(0)} × ${(H8*1000).toFixed(0)} mm`;
    document.getElementById('res8xH').innerText = H8.toFixed(2) + ' m';
    document.getElementById('res8xDiag').innerText = Diag8.toFixed(1) + '"';
    document.getElementById('res8xCalcSize').innerText = Diag8.toFixed(1) + '"';
    document.getElementById('res8xStd').innerText = getStandardSize(Diag8);

    document.getElementById('resUc80Dims').innerText = `${(W_uc*1000).toFixed(0)} × ${(H_uc*1000).toFixed(0)} mm`;
    document.getElementById('resUc80H').innerText = H_uc.toFixed(2) + ' m';
    document.getElementById('resUc80Diag').innerText = DiagUc.toFixed(1) + '"';
    document.getElementById('resUc80CalcSize').innerText = DiagUc.toFixed(1) + '"';
    document.getElementById('resUc80Std').innerText = getStandardSize(DiagUc);

    document.getElementById('resFirstPerson').innerText = minFirstPerson.toFixed(2) + ' m';
    document.getElementById('resVertTiltVal').innerText = vertTilt.toFixed(1) + '° (' + (vertTilt <= 15 ? 'PASS' : 'EXCEEDS 15°') + ')';

    var b6 = document.getElementById('badge6HCalcSize');
    if (b6) b6.innerText = `${Diag6.toFixed(1)}" (${getStandardSize(Diag6)})`;
    var buc = document.getElementById('badgeUc80CalcSize');
    if (buc) buc.innerText = `${DiagUc.toFixed(1)}" (${getStandardSize(DiagUc)})`;
  }

  renderISO3ViewDisplaySvg(W, D, W6, H6, affMm/1000.0, vertTilt, H_room, eyeMm/1000.0, W_uc, H_uc);
}

function calculateDistance() {
  var diag = parseFloat(document.getElementById('diagInchesInput')?.value) || 85;
  var aspect = document.getElementById('aspectRatioInput')?.value || '16:9';
  var ratio = (aspect === '21:9') ? (21.0/9.0) : ((aspect === '32:9') ? (32.0/9.0) : ((aspect === '16:10') ? (16.0/10.0) : (16.0/9.0)));

  var diagM = diag * 0.0254;
  var H = diagM / Math.sqrt(ratio * ratio + 1);
  var W = H * ratio;

  var d4 = H * 4.0, d5 = H * 5.0, d6 = H * 6.0, d7 = H * 7.0, d8 = H * 8.0, dUC80 = (H * 6.0) * 0.80;
  var minFirst = W * 1.0;

  var WMm = Math.round(W * 1000);
  var HMm = Math.round(H * 1000);
  var WFt = (W / 0.3048).toFixed(2);
  var HFt = (H / 0.3048).toFixed(2);

  var bBadge = document.getElementById('modeBSummaryBadge');
  var bDimsVal = document.getElementById('modeBDimsVal');
  var bDimsFt = document.getElementById('modeBDimsFt');
  var bFirstVal = document.getElementById('modeBFirstPersonVal');
  var bFirstFt = document.getElementById('modeBFirstPersonFt');
  var bLast6HVal = document.getElementById('modeBLast6HVal');
  var bLast6HFt = document.getElementById('modeBLast6HFt');
  var bLast8HVal = document.getElementById('modeBLast8HVal');
  var bLast8HFt = document.getElementById('modeBLast8HFt');

  if (bBadge) bBadge.textContent = diag + '" Display (' + Math.round(diagM * 1000) + ' mm)';
  if (bDimsVal) bDimsVal.textContent = WMm + ' × ' + HMm + ' mm';
  if (bDimsFt) bDimsFt.textContent = WFt + ' × ' + HFt + ' ft';
  if (bFirstVal) bFirstVal.textContent = Math.round(minFirst * 1000) + ' mm';
  if (bFirstFt) bFirstFt.textContent = (minFirst / 0.3048).toFixed(2) + ' ft closest row';
  if (bLast6HVal) bLast6HVal.textContent = Math.round(d6 * 1000) + ' mm';
  if (bLast6HFt) bLast6HFt.textContent = (d6 / 0.3048).toFixed(2) + ' ft furthest row';
  if (bLast8HVal) bLast8HVal.textContent = Math.round(d8 * 1000) + ' mm';
  if (bLast8HFt) bLast8HFt.textContent = (d8 / 0.3048).toFixed(2) + ' ft video limit';

  var dimsEl = document.getElementById('resB_Dims');
  if (dimsEl) {
    dimsEl.innerText = `${WMm} × ${HMm} mm`;
    document.getElementById('resB_Closest').innerText = `${minFirst.toFixed(2)} m`;
    document.getElementById('resB_4xH').innerText = `${d4.toFixed(2)} m`;
    document.getElementById('resB_5xH').innerText = `${d5.toFixed(2)} m`;
    document.getElementById('resB_6xH').innerText = `${d6.toFixed(2)} m`;
    document.getElementById('resB_7xH').innerText = `${d7.toFixed(2)} m`;
    document.getElementById('resB_8xH').innerText = `${d8.toFixed(2)} m`;
    document.getElementById('resB_UC80').innerText = `${dUC80.toFixed(2)} m`;
  }

  renderISO3ViewDisplaySvg(W * 2.2, d6 + 1.0, W, H, 0.95, 12.0, 2.7, 1.2, W / 0.8, H / 0.8);
}

function renderISO3ViewDisplaySvg(roomW, roomD, dispW, dispH, affM, tiltDeg, roomH, eyeM, ucW, ucH) {
  var container = document.getElementById('display3ViewSvgContainer');
  if (!container) return;

  roomH = roomH || 2.7;
  eyeM = eyeM || 1.2;
  ucW = ucW || (dispW * 1.25);
  ucH = ucH || (dispH * 1.25);

  var svgW = 960, svgH = 460;
  var dispWMm = Math.round(dispW * 1000);
  var dispHMm = Math.round(dispH * 1000);
  var affMm = Math.round(affM * 1000);
  var firstPMm = Math.round(dispW * 1000);
  var lastPMm = Math.round(roomD * 1000);

  if (currentDisplayVisView === '3D') {
    container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:10px; box-shadow:inset 0 0 10px rgba(0,0,0,0.02);">
      <defs>
        <!-- Realistic Floor Parquet / Wood Planks -->
        <linearGradient id="floorArchitectural" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="50%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </linearGradient>
        <!-- Table Warm Oak Texture -->
        <linearGradient id="tableOakGrad" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stop-color="#b45309"/>
          <stop offset="40%" stop-color="#d97706"/>
          <stop offset="80%" stop-color="#92400e"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
        <linearGradient id="wallFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f1f5f9"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="wallSide" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
        <!-- Realistic 4K Screen Bezel & Display Glow -->
        <filter id="screenGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0284c7" flood-opacity="0.25"/>
        </filter>
        <linearGradient id="displayGlassWallpaper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="40%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
        <!-- Sightline Volumetric Frustum -->
        <linearGradient id="sightConeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2563eb" stop-opacity="0.30"/>
          <stop offset="70%" stop-color="#0284c7" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.05"/>
        </linearGradient>
      </defs>

      <!-- Room Geometry: Floor -->
      <polygon points="110,360 490,415 880,310 510,250" fill="url(#floorArchitectural)" stroke="#94a3b8" stroke-width="1.5"/>

      <!-- Floor Perspective Tile Joints -->
      <line x1="205" y1="374" x2="605" y2="265" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6"/>
      <line x1="300" y1="387" x2="700" y2="279" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6"/>
      <line x1="395" y1="401" x2="795" y2="294" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6"/>
      <line x1="300" y1="305" x2="695" y2="362" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6"/>

      <!-- Left / Side Wall with Acoustic Wood Slats -->
      <polygon points="110,360 110,120 510,45 510,250" fill="url(#wallSide)" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Acoustic wall slat details -->
      <line x1="160" y1="347" x2="160" y2="110" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="210" y1="334" x2="210" y2="100" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="260" y1="321" x2="260" y2="90" stroke="#cbd5e1" stroke-width="2"/>

      <!-- Back / Front Feature Wall where display is mounted -->
      <polygon points="510,250 510,45 880,95 880,310" fill="url(#wallFront)" stroke="#94a3b8" stroke-width="1.5"/>

      <!-- Ceiling Guideline Wireframe & Recessed Linear Lights -->
      <polygon points="110,120 510,45 880,95 490,170" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4"/>
      <!-- Ceiling Modern Architectural Downlights -->
      <ellipse cx="360" cy="100" rx="14" ry="5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
      <ellipse cx="560" cy="120" rx="14" ry="5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
      <ellipse cx="720" cy="140" rx="14" ry="5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>

      <!-- COMMERCIAL 4K MEETING DISPLAY (Front Wall Mount) -->
      <g transform="translate(180, 160)" filter="url(#screenGlow)">
        <!-- Wall mount bracket shadow -->
        <rect x="18" y="18" width="224" height="136" fill="rgba(15,23,42,0.15)" rx="6"/>
        <!-- Outer Slim Bezel -->
        <polygon points="0,0 230,30 230,155 0,125" fill="#0f172a" stroke="#1e293b" stroke-width="3"/>
        <!-- Active 16:9 4K Screen Area -->
        <polygon points="5,5 180,27 180,148 5,120" fill="url(#displayGlassWallpaper)" stroke="#38bdf8" stroke-width="1.5"/>

        <!-- 80% Content presentation slide layout -->
        <line x1="12" y1="112" x2="173" y2="33" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4,2"/>
        <text x="92" y="70" font-size="9" font-weight="800" fill="#38bdf8" text-anchor="middle" transform="rotate(7.5 92 70)">80% DISCAS CONTENT (${dispWMm} × ${dispHMm} mm)</text>
        <text x="92" y="85" font-size="7.5" font-weight="600" fill="#cbd5e1" text-anchor="middle" transform="rotate(7.5 92 85)">4K UHD Commercial Active Video Surface</text>

        <!-- 20% Gallery Ribbon (Teams / Zoom Front Row) -->
        <polygon points="180,27 225,32 225,152 180,148" fill="#10b981" fill-opacity="0.25" stroke="#10b981" stroke-width="1.5"/>
        <circle cx="203" cy="50" r="5" fill="#38bdf8"/>
        <circle cx="203" cy="74" r="5" fill="#34d399"/>
        <circle cx="203" cy="98" r="5" fill="#facc15"/>
        <circle cx="203" cy="122" r="5" fill="#f43f5e"/>
        <text x="203" y="142" font-size="7.5" font-weight="800" fill="#065f46" text-anchor="middle">20%</text>

        <!-- Bottom AFF Mounting Label Badge -->
        <rect x="30" y="132" width="170" height="22" fill="#ffffff" rx="4" stroke="#2563eb" stroke-width="1.2"/>
        <text x="115" y="147" font-size="9" font-weight="800" fill="#1d4ed8" text-anchor="middle">DISPLAY AFF: ${affMm} mm (${(affM/0.3048).toFixed(1)} ft)</text>
      </g>

      <!-- REALISTIC CONFERENCE TABLE & CHAIRS -->
      <!-- Conference Table Top: Boat-shaped / Chamfered Oak Table -->
      <polygon points="400,300 550,250 630,250 480,300" fill="url(#tableOakGrad)" stroke="#78350f" stroke-width="1.8"/>
      <!-- Table Metal Center Connectivity Trough -->
      <polygon points="450,285 530,258 560,258 480,285" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
      <!-- Table Base Columns -->
      <line x1="450" y1="300" x2="450" y2="330" stroke="#475569" stroke-width="6"/>
      <line x1="570" y1="260" x2="570" y2="290" stroke="#475569" stroke-width="6"/>

      <!-- Chairs around Table -->
      <!-- Chair 1 (First Person Row - Closest Row 1.0xW) -->
      <g transform="translate(420, 275)">
        <ellipse cx="0" cy="0" rx="9" ry="5" fill="#334155"/>
        <path d="M -7 -4 Q 0 -12 7 -4" fill="none" stroke="#1e293b" stroke-width="3"/>
        <circle cx="0" cy="-22" r="7" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
        <text x="0" y="-33" font-size="8.5" font-weight="800" fill="#0369a1" text-anchor="middle">1st Person (1.0xW)</text>
        <text x="0" y="-43" font-size="7.5" font-weight="bold" fill="#64748b" text-anchor="middle">${firstPMm} mm</text>
      </g>

      <!-- Chair 2 (Middle) -->
      <g transform="translate(500, 252)">
        <ellipse cx="0" cy="0" rx="8" ry="4.5" fill="#475569"/>
        <circle cx="0" cy="-18" r="6" fill="#64748b"/>
      </g>

      <!-- Chair 3 (Last Person Row - Furthest Row 6H) -->
      <g transform="translate(680, 310)">
        <!-- Chair Base -->
        <ellipse cx="0" cy="0" rx="11" ry="6" fill="#1e293b"/>
        <path d="M -9 -5 Q 0 -15 9 -5" fill="none" stroke="#0f172a" stroke-width="3.5"/>
        <!-- Viewer Body -->
        <line x1="0" y1="-5" x2="0" y2="-22" stroke="#ea580c" stroke-width="4"/>
        <circle cx="0" cy="-28" r="8" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
        <!-- Eyeline Datum Pointer -->
        <line x1="0" y1="-28" x2="16" y2="-28" stroke="#ea580c" stroke-width="1" stroke-dasharray="2,2"/>
        <text x="0" y="16" font-size="8.5" font-weight="800" fill="#c2410c" text-anchor="middle">Last Person (6H Limit)</text>
        <text x="0" y="27" font-size="7.5" font-weight="bold" fill="#64748b" text-anchor="middle">${lastPMm} mm (${(roomD/0.3048).toFixed(1)} ft)</text>
      </g>

      <!-- DISCAS SIGHTLINE RAYS & VIEWING CONE -->
      <!-- Frustum Cone Polygon -->
      <polygon points="300,230 680,282 720,310" fill="url(#sightConeGrad)"/>
      <line x1="300" y1="230" x2="680" y2="282" stroke="#0284c7" stroke-width="2" stroke-dasharray="5,3"/>

      <!-- Eye Level Datum Ray (1200 mm AFFL) -->
      <line x1="200" y1="280" x2="750" y2="280" stroke="#059669" stroke-width="1" stroke-dasharray="3,3"/>
      <text x="755" y="283" font-size="8" font-weight="bold" fill="#059669">Eye Level: 1200 mm AFFL</text>

      <!-- Bottom Floating Architectural Status Badges -->
      <g transform="translate(30, 415)">
        <rect x="0" y="0" width="280" height="28" fill="#ffffff" rx="6" stroke="#bfdbfe" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))"/>
        <circle cx="14" cy="14" r="5" fill="#2563eb"/>
        <text x="26" y="18" font-size="9.5" font-weight="800" fill="#1e293b">ROOM: ${roomW.toFixed(1)}mW × ${roomD.toFixed(1)}mD × ${roomH.toFixed(1)}mH</text>
        <text x="200" y="18" font-size="8.5" font-weight="bold" fill="#64748b font-mono">(${Math.round(roomW*1000)}×${Math.round(roomD*1000)}mm)</text>
      </g>

      <g transform="translate(640, 415)">
        <rect x="0" y="0" width="290" height="28" fill="#ffffff" rx="6" stroke="${tiltDeg <= 15 ? '#bbf7d0' : '#fecdd3'}" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))"/>
        <circle cx="14" cy="14" r="5" fill="${tiltDeg <= 15 ? '#16a34a' : '#dc2626'}"/>
        <text x="26" y="18" font-size="9.5" font-weight="800" fill="${tiltDeg <= 15 ? '#166534' : '#991b1b'}">
          VERTICAL SIGHTLINE TILT: ${tiltDeg.toFixed(1)}° (${tiltDeg <= 15 ? 'PASS ≤ 15°' : 'EXCEEDS 15°'})
        </text>
      </g>
    </svg>`;
  } else {
    // 2D 3-View Orthographic Projection (Light Architectural Blueprint)
    container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; border-radius:10px;">
      <!-- Grid Background -->
      <defs>
        <pattern id="archGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#archGrid)" />

      <!-- 1. TOP PLAN VIEW -->
      <g transform="translate(30, 25)">
        <rect x="0" y="0" width="430" height="185" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" rx="6"/>
        <rect x="0" y="0" width="430" height="26" fill="#eff6ff" rx="6 6 0 0" stroke="#bfdbfe"/>
        <text x="12" y="17" font-size="11" font-weight="800" fill="#1d4ed8"><tspan fill="#2563eb">1.</tspan> TOP PLAN VIEW (W: ${roomW.toFixed(1)}m × D: ${roomD.toFixed(1)}m)</text>
        
        <!-- Front Wall Display -->
        <rect x="150" y="32" width="130" height="10" fill="#0f172a" rx="2" stroke="#2563eb" stroke-width="1.5"/>
        <text x="215" y="40" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle">4K DISPLAY (${dispWMm}mm)</text>
        
        <!-- Table & Seats -->
        <rect x="165" y="65" width="100" height="85" fill="#fde68a" stroke="#d97706" rx="4"/>
        <rect x="200" y="75" width="30" height="65" fill="#cbd5e1" rx="2"/>
        
        <!-- DISCAS Viewing Cone (HFOV) -->
        <polygon points="150,42 280,42 390,175 40,175" fill="rgba(37,99,235,0.08)" stroke="#2563eb" stroke-width="1.2" stroke-dasharray="4,3"/>
        
        <!-- 1st Person Viewer (1.0xW) -->
        <circle cx="215" cy="80" r="6" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
        <text x="215" y="96" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">1st Person (${firstPMm} mm)</text>
        
        <!-- Last Person Viewer (6H) -->
        <circle cx="215" cy="165" r="7" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
        <text x="215" y="180" font-size="8.5" font-weight="bold" fill="#c2410c" text-anchor="middle">Last Person (${lastPMm} mm)</text>
      </g>

      <!-- 2. FRONT ELEVATION VIEW (80/20 UC SPLIT) -->
      <g transform="translate(490, 25)">
        <rect x="0" y="0" width="440" height="185" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" rx="6"/>
        <rect x="0" y="0" width="440" height="26" fill="#f0fdf4" rx="6 6 0 0" stroke="#bbf7d0"/>
        <text x="12" y="17" font-size="11" font-weight="800" fill="#15803d"><tspan fill="#16a34a">2.</tspan> FRONT ELEVATION (80% CONTENT &amp; 20% UC SPLIT)</text>
        
        <!-- Ground Line -->
        <line x1="20" y1="165" x2="420" y2="165" stroke="#64748b" stroke-width="2"/>
        <text x="30" y="178" font-size="8" font-weight="bold" fill="#64748b">FINISHED FLOOR LEVEL (0 mm AFFL)</text>
        
        <!-- Display Frame -->
        <rect x="110" y="45" width="220" height="100" fill="#0f172a" stroke="#1e293b" stroke-width="2.5" rx="4"/>
        <!-- 80% Content Area -->
        <rect x="112" y="47" width="174" height="96" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
        <text x="199" y="90" font-size="9.5" font-weight="800" fill="#1d4ed8" text-anchor="middle">80% CONTENT ZONE</text>
        <text x="199" y="103" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">${Math.round(dispW*0.8*1000)} × ${dispHMm} mm</text>
        
        <!-- 20% Gallery Ribbon -->
        <rect x="286" y="47" width="42" height="96" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
        <text x="307" y="92" font-size="9" font-weight="800" fill="#059669" text-anchor="middle">20%</text>
        <text x="307" y="104" font-size="7.5" font-weight="bold" fill="#065f46" text-anchor="middle">Ribbon</text>
        
        <!-- Mounting Height AFF Dimension -->
        <line x1="90" y1="165" x2="90" y2="147" stroke="#2563eb" stroke-width="1.5"/>
        <text x="85" y="158" font-size="8.5" font-weight="800" fill="#2563eb" text-anchor="end">AFF: ${affMm} mm</text>
      </g>

      <!-- 3. LEFT SIDE ELEVATION (VERTICAL SIGHTLINE TILT) -->
      <g transform="translate(260, 230)">
        <rect x="0" y="0" width="460" height="195" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" rx="6"/>
        <rect x="0" y="0" width="460" height="26" fill="#fff1f2" rx="6 6 0 0" stroke="#fecdd3"/>
        <text x="12" y="17" font-size="11" font-weight="800" fill="#be123c"><tspan fill="#e11d48">3.</tspan> SIDE ELEVATION SIGHTLINE (TILT: ${tiltDeg.toFixed(1)}°)</text>
        
        <!-- Floor & Ceiling -->
        <line x1="20" y1="170" x2="440" y2="170" stroke="#64748b" stroke-width="2.5"/>
        <line x1="20" y1="35" x2="440" y2="35" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,3"/>
        <text x="380" y="48" font-size="8" font-weight="bold" fill="#64748b">Ceiling: ${Math.round(roomH*1000)} mm</text>
        
        <!-- Display on Wall -->
        <rect x="35" y="65" width="10" height="75" fill="#0f172a" rx="2" stroke="#2563eb"/>
        
        <!-- First Person Seated -->
        <circle cx="160" cy="120" r="7" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
        <line x1="160" y1="120" x2="45" y2="65" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,2"/>
        <text x="160" y="145" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">1st Person (${firstPMm}mm)</text>
        
        <!-- Last Person Seated -->
        <circle cx="390" cy="120" r="8" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
        <line x1="390" y1="120" x2="45" y2="65" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,2"/>
        <text x="390" y="145" font-size="8" font-weight="bold" fill="#c2410c" text-anchor="middle">Last Person (${lastPMm}mm)</text>
        
        <!-- Sightline Angle Badge -->
        <rect x="180" y="70" width="180" height="24" fill="#ffffff" rx="4" stroke="${tiltDeg <= 15 ? '#22c55e' : '#ef4444'}" stroke-width="1.5"/>
        <text x="270" y="86" font-size="9" font-weight="800" fill="${tiltDeg <= 15 ? '#166534' : '#991b1b'}" text-anchor="middle">SIGHTLINE TILT: ${tiltDeg.toFixed(1)}° (${tiltDeg <= 15 ? 'PASS' : 'EXCEEDS 15°'})</text>
      </g>
    </svg>`;
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof calculateDisplay === 'function') calculateDisplay();
    });
  } else {
    setTimeout(function() {
      if (typeof calculateDisplay === 'function') calculateDisplay();
    }, 20);
  }
}
