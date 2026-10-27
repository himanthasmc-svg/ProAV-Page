// ==========================================
// TAB 3: PROJECTOR & SCREEN STUDIO
// ==========================================
var currentProjStudioMode = 'A';

function updateProjModeBDiagFromInches() {
  var inches = parseFloat(document.getElementById('projModeBDiagInches')?.value) || 120;
  var mmEl = document.getElementById('projModeBDiagMm');
  if (mmEl) mmEl.value = Math.round(inches * 25.4);
  updateProjectorSim();
}

function updateProjModeBDiagFromMm() {
  var mm = parseFloat(document.getElementById('projModeBDiagMm')?.value) || 3048;
  var inEl = document.getElementById('projModeBDiagInches');
  if (inEl) inEl.value = (mm / 25.4).toFixed(1);
  updateProjectorSim();
}

function switchProjStudioMode(mode) {
  currentProjStudioMode = mode;
  var btnA = document.getElementById('btnProjModeA');
  var btnB = document.getElementById('btnProjModeB');
  var containerA = document.getElementById('containerProjModeAInputs');
  var containerB = document.getElementById('containerProjModeBInputs');
  var badge = document.getElementById('projSvgModeBadge');

  if (mode === 'A') {
    if (btnA) btnA.className = 'mode-toggle-btn active-blue';
    if (btnB) btnB.className = 'mode-toggle-btn';
    if (containerA) containerA.style.display = 'block';
    if (containerB) containerB.style.display = 'none';
    if (badge) badge.innerText = 'MODE: ANSI LUMENS & THROW CONE';
  } else {
    if (btnA) btnA.className = 'mode-toggle-btn';
    if (btnB) btnB.className = 'mode-toggle-btn active-blue';
    if (containerA) containerA.style.display = 'none';
    if (containerB) containerB.style.display = 'block';
    if (badge) badge.innerText = 'MODE: AVIXA DISCAS VISUAL DISTANCES';
  }
  updateProjectorSim();
}

function updateProjectorSim() {
  if (currentProjStudioMode === 'B') {
    var diagInches = parseFloat(document.getElementById('projModeBDiagInches')?.value) || 120;
    var aspect = document.getElementById('projModeBAspectSelect')?.value || '16:9';
    var gain = parseFloat(document.getElementById('projModeBGainSelect')?.value) || 1.0;

    var ratio = 1.7778;
    if (aspect === '21:9') ratio = 2.3333;
    if (aspect === '16:10') ratio = 1.6000;
    if (aspect === '4:3') ratio = 1.3333;

    var diagMm = diagInches * 25.4;
    var hM = (diagMm / 1000.0) / Math.sqrt(ratio * ratio + 1);
    var wM = hM * ratio;

    var firstPersonM = wM * 1.0;
    var d4 = hM * 4.0;
    var d5 = hM * 5.0;
    var d6 = hM * 6.0;
    var d8 = hM * 8.0;
    var dUC80 = hM * 7.5;

    var setTxt = function(id, txt) { var el = document.getElementById(id); if (el) el.innerText = txt; };
    setTxt('resProjB_ActiveDims', Math.round(wM * 1000) + ' × ' + Math.round(hM * 1000) + ' mm (' + diagInches + '")');
    setTxt('resProjFirstPerson', firstPersonM.toFixed(2) + ' m (1.0 × W)');
    setTxt('resProj4xH', d4.toFixed(2) + ' m');
    setTxt('resProj5xH', d5.toFixed(2) + ' m');
    setTxt('resProj6xH', d6.toFixed(2) + ' m (Basic Meeting)');
    setTxt('resProj8xH', d8.toFixed(2) + ' m');
    setTxt('resProjUC80', dUC80.toFixed(2) + ' m (UC 80% Content)');

    renderProjectorSvg(wM * 1000, hM * 1000, 1.4, gain, 'motorized_tension', '3lcd_laser', 'front_ceiling', 350, wM * 1.4, 4500);
  } else {
    var throwRatio = parseFloat(document.getElementById('projThrowRatio')?.value) || 1.4;
    var W = parseFloat(document.getElementById('screenW')?.value) || 2656;
    var H = parseFloat(document.getElementById('screenH')?.value) || 1494;
    var gain = parseFloat(document.getElementById('projScreenGainSelect')?.value) || 1.0;
    var screenType = document.getElementById('projScreenTypeSelect')?.value || 'motorized_tension';
    var projTech = document.getElementById('projTechSelect')?.value || '3lcd_laser';
    var mountPos = document.getElementById('projMountSelect')?.value || 'front_ceiling';
    var ambientLux = parseFloat(document.getElementById('projAmbientLuxInput')?.value) || 350;

    var throwDistM = (W / 1000.0) * throwRatio;
    var reqLumens = Math.round(((W / 1000.0) * (H / 1000.0) * ambientLux * 1.5) / gain);

    var lumEl = document.getElementById('resReqLumens');
    if (lumEl) lumEl.innerText = reqLumens.toLocaleString() + ' Lumens';
    var throwEl = document.getElementById('resThrowDistVal');
    if (throwEl) throwEl.innerText = throwDistM.toFixed(2) + ' m';

    renderProjectorSvg(W, H, throwRatio, gain, screenType, projTech, mountPos, ambientLux, throwDistM, reqLumens);
  }
}

var currentProjViewMode = '3D';
var projOrbitAngle = 45;

function setProjViewMode(mode) {
  currentProjViewMode = mode;
  var btns = document.querySelectorAll('.btn-proj-view');
  btns.forEach(function(b) {
    if (b.getAttribute('data-view') === mode) {
      b.className = 'btn btn-warning active btn-proj-view fw-bold';
    } else {
      b.className = 'btn btn-outline-light btn-proj-view fw-bold';
    }
  });
  updateProjectorSim();
}

function onProjOrbitSliderChange(val) {
  projOrbitAngle = parseFloat(val) || 45;
  var disp = document.getElementById('projOrbitAngleValue');
  if (disp) disp.innerText = projOrbitAngle + '°';
  updateProjectorSim();
}

function renderProjectorSvg(W, H, throwRatio, gain, screenType, projTech, mountPos, ambientLux, throwDistM, reqLumens) {
  var container = document.getElementById('projectorElevationSvgContainer');
  if (!container) return;

  var svgW = 880, svgH = 420;
  var wM = W / 1000.0;
  var hM = H / 1000.0;
  var isRear = (mountPos === 'rear_enclosure' || screenType === 'rear_glass');
  var isUst = (mountPos === 'ust');

  var gainFill = "rgba(255,255,255,0.05)";
  if (gain <= 0.8) gainFill = "rgba(15,23,42,0.6)";
  else if (gain === 0.9) gainFill = "rgba(30,41,59,0.5)";
  else if (gain >= 1.3) gainFill = "rgba(254,240,138,0.2)";

  var frameBorder = screenType.includes('alr') || screenType.includes('clr') ? '#0284c7' : '#475569';
  var dFirst = (wM * 1.0).toFixed(2);
  var dLast = (hM * 6.0).toFixed(2);

  if (currentProjViewMode === 'side') {
    // 2D Side Elevation View
    container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#020617; border-radius:8px;">
      <defs>
        <linearGradient id="beamGradSide" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
          <stop offset="60%" stop-color="#facc15" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1"/>
        </linearGradient>
      </defs>
      <!-- Floor & Ceiling -->
      <line x1="40" y1="360" x2="840" y2="360" stroke="#334155" stroke-width="2"/>
      <line x1="40" y1="50" x2="840" y2="50" stroke="#334155" stroke-width="2" stroke-dasharray="4,4"/>
      <text x="50" y="380" font-size="10" font-family="JetBrains Mono" fill="#64748b">FLOOR (0.00 m)</text>
      <text x="50" y="42" font-size="10" font-family="JetBrains Mono" fill="#64748b">CEILING (3.00 m)</text>

      <!-- Projection Screen on Left Wall -->
      <rect x="80" y="90" width="16" height="200" fill="#0f172a" stroke="${frameBorder}" stroke-width="3" rx="2"/>
      <rect x="83" y="95" width="10" height="190" fill="${gainFill}" stroke="#38bdf8" stroke-width="1"/>
      <text x="70" y="195" font-size="9" font-family="JetBrains Mono" font-weight="bold" fill="#38bdf8" text-anchor="middle" transform="rotate(-90 70 195)">SCREEN (${Math.round(W)}×${Math.round(H)}mm)</text>

      <!-- Projector Body & Lens -->
      <g transform="translate(${Math.min(760, 100 + throwDistM * 90)}, ${mountPos === 'front_table' ? 300 : (isUst ? 75 : 65)})">
        <rect x="0" y="0" width="60" height="28" fill="#334155" stroke="#38bdf8" stroke-width="2" rx="4"/>
        <circle cx="0" cy="14" r="7" fill="#facc15"/>
        <text x="30" y="-8" font-size="9" font-family="JetBrains Mono" font-weight="bold" fill="#38bdf8" text-anchor="middle">PROJECTOR</text>
      </g>

      <!-- 2D Optical Throw Frustum Cone -->
      <polygon points="${Math.min(760, 100 + throwDistM * 90)},${mountPos === 'front_table' ? 314 : (isUst ? 89 : 79)} 96,95 96,285" fill="url(#beamGradSide)"/>
      <line x1="${Math.min(760, 100 + throwDistM * 90)}" y1="${mountPos === 'front_table' ? 314 : (isUst ? 89 : 79)}" x2="96" y2="190" stroke="#facc15" stroke-width="1.5" stroke-dasharray="3,3"/>

      <!-- Seated Viewers: First Person & Last Person -->
      <g transform="translate(${Math.min(800, 100 + parseFloat(dFirst) * 90)}, 290)">
        <circle cx="0" cy="0" r="9" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
        <line x1="0" y1="9" x2="0" y2="70" stroke="#ef4444" stroke-width="2.5"/>
        <text x="0" y="-12" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="#fca5a5" text-anchor="middle">1st Row (${dFirst}m)</text>
      </g>
      <g transform="translate(${Math.min(820, 100 + parseFloat(dLast) * 90)}, 290)">
        <circle cx="0" cy="0" r="9" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
        <line x1="0" y1="9" x2="0" y2="70" stroke="#10b981" stroke-width="2.5"/>
        <text x="0" y="-12" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="#34d399" text-anchor="middle">Last Row (${dLast}m)</text>
      </g>

      <rect x="220" y="380" width="440" height="28" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" rx="5"/>
      <text x="440" y="398" font-size="10" font-weight="bold" fill="#38bdf8" text-anchor="middle">THROW: ${throwDistM.toFixed(2)}m (TR ${throwRatio}) | REQ LUMENS: ${reqLumens.toLocaleString()} ANSI (Lux: ${ambientLux} lx)</text>
    </svg>`;
  } else {
    // 3D Isometric View (Default)
    var angleRad = (projOrbitAngle * Math.PI) / 180.0;
    var cosA = Math.cos(angleRad);
    var sinA = Math.sin(angleRad);
    var scale = 44.0;
    var originX = 440;
    var originY = 310;

    function project(x, y, z) {
      var isoX = (x * cosA - y * sinA) * scale;
      var isoY = (x * sinA * 0.45 + y * cosA * 0.45 - z * 0.88) * scale;
      return { x: originX + isoX, y: originY + isoY };
    }

    var roomL = Math.max(throwDistM + 2.5, 7.0);
    var roomW = Math.max(wM * 2.2, 5.0);
    var roomH = 3.2;

    var f00 = project(-roomL*0.4, -roomW/2, 0);
    var fL0 = project(roomL*0.6, -roomW/2, 0);
    var fLW = project(roomL*0.6, roomW/2, 0);
    var f0W = project(-roomL*0.4, roomW/2, 0);

    var c00 = project(-roomL*0.4, -roomW/2, roomH);
    var cL0 = project(roomL*0.6, -roomW/2, roomH);
    var cLW = project(roomL*0.6, roomW/2, roomH);
    var c0W = project(-roomL*0.4, roomW/2, roomH);

    // Screen corners on front wall
    var sX = -roomL*0.38;
    var sY1 = -wM/2;
    var sY2 = wM/2;
    var sZ1 = 0.9;
    var sZ2 = 0.9 + hM;

    var sBL = project(sX, sY1, sZ1);
    var sBR = project(sX, sY2, sZ1);
    var sTR = project(sX, sY2, sZ2);
    var sTL = project(sX, sY1, sZ2);

    // Projector lens position
    var pX = isRear ? (sX - throwDistM * 0.85) : (sX + throwDistM);
    var pY = 0;
    var pZ = isUst ? (sZ2 + 0.35) : (mountPos === 'front_table' ? 0.85 : (roomH - 0.35));
    var pLens = project(pX, pY, pZ);

    container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
      <defs>
        <linearGradient id="beamVolumetricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.85"/>
          <stop offset="50%" stop-color="#0284c7" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#facc15" stop-opacity="0.12"/>
        </linearGradient>
      </defs>

      <!-- Floor -->
      <polygon points="${f00.x},${f00.y} ${fL0.x},${fL0.y} ${fLW.x},${fLW.y} ${f0W.x},${f0W.y}" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
      
      <!-- Walls -->
      <polygon points="${f00.x},${f00.y} ${c00.x},${c00.y} ${cL0.x},${cL0.y} ${fL0.x},${fL0.y}" fill="#141c2e" stroke="#1e293b" stroke-width="1.5"/>
      <polygon points="${f00.x},${f00.y} ${c00.x},${c00.y} ${c0W.x},${c0W.y} ${f0W.x},${f0W.y}" fill="#0b1120" stroke="#1e293b" stroke-width="1.5"/>

      <!-- Projection Screen Frame & Active Surface -->
      <polygon points="${sBL.x},${sBL.y} ${sBR.x},${sBR.y} ${sTR.x},${sTR.y} ${sTL.x},${sTL.y}" fill="${gainFill}" stroke="${frameBorder}" stroke-width="3"/>
      <text x="${(sBL.x+sTR.x)/2}" y="${(sBL.y+sTR.y)/2}" font-size="9" font-family="JetBrains Mono" font-weight="bold" fill="#38bdf8" text-anchor="middle">ACTIVE SCREEN (${Math.round(W)}×${Math.round(H)}mm)</text>
      <text x="${(sBL.x+sTR.x)/2}" y="${(sBL.y+sTR.y)/2+14}" font-size="8" font-family="JetBrains Mono" fill="#94a3b8" text-anchor="middle">Gain: ${gain} | Aspect: 16:9</text>

      <!-- Volumetric 3D Light Cone Pyramid from Projector Lens to 4 Screen Corners -->
      <polygon points="${pLens.x},${pLens.y} ${sTL.x},${sTL.y} ${sTR.x},${sTR.y}" fill="url(#beamVolumetricGrad)" opacity="0.6"/>
      <polygon points="${pLens.x},${pLens.y} ${sTR.x},${sTR.y} ${sBR.x},${sBR.y}" fill="url(#beamVolumetricGrad)" opacity="0.5"/>
      <polygon points="${pLens.x},${pLens.y} ${sBR.x},${sBR.y} ${sBL.x},${sBL.y}" fill="url(#beamVolumetricGrad)" opacity="0.7"/>
      <polygon points="${pLens.x},${pLens.y} ${sBL.x},${sBL.y} ${sTL.x},${sTL.y}" fill="url(#beamVolumetricGrad)" opacity="0.6"/>

      <!-- Projection Rays to Corners -->
      <line x1="${pLens.x}" y1="${pLens.y}" x2="${sTL.x}" y2="${sTL.y}" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="3,2"/>
      <line x1="${pLens.x}" y1="${pLens.y}" x2="${sTR.x}" y2="${sTR.y}" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="3,2"/>
      <line x1="${pLens.x}" y1="${pLens.y}" x2="${sBR.x}" y2="${sBR.y}" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="3,2"/>
      <line x1="${pLens.x}" y1="${pLens.y}" x2="${sBL.x}" y2="${sBL.y}" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="3,2"/>

      <!-- Projector Body & Mount Pole -->
      <line x1="${project(pX, pY, roomH).x}" y1="${project(pX, pY, roomH).y}" x2="${pLens.x}" y2="${pLens.y}" stroke="#64748b" stroke-width="3"/>
      <circle cx="${pLens.x}" cy="${pLens.y}" r="8" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
      <rect x="${pLens.x-14}" y="${pLens.y-16}" width="28" height="14" fill="#334155" stroke="#38bdf8" stroke-width="1.5" rx="3"/>
      <text x="${pLens.x}" y="${pLens.y-20}" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#facc15" text-anchor="middle">PROJECTOR (${reqLumens.toLocaleString()} ANSI)</text>

      <!-- Seated Viewer Avatars at 1.0xW and 6.0xH -->
      ${(function(){
        var p1 = project(sX + parseFloat(dFirst), 0, 1.2);
        var p2 = project(sX + Math.min(roomL*0.9, parseFloat(dLast)), 0, 1.2);
        return `
          <g class="viewer-node">
            <line x1="${project(sX + parseFloat(dFirst), 0, 0).x}" y1="${project(sX + parseFloat(dFirst), 0, 0).y}" x2="${p1.x}" y2="${p1.y}" stroke="#ef4444" stroke-width="2"/>
            <circle cx="${p1.x}" cy="${p1.y}" r="6" fill="#ef4444"/>
            <text x="${p1.x}" y="${p1.y-10}" font-size="8" font-family="JetBrains Mono" fill="#fca5a5" text-anchor="middle">1st Row: ${dFirst}m</text>
            <line x1="${p1.x}" y1="${p1.y}" x2="${(sBL.x+sTL.x)/2}" y2="${(sBL.y+sTL.y)/2}" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="3,2"/>

            <line x1="${project(sX + Math.min(roomL*0.9, parseFloat(dLast)), 0, 0).x}" y1="${project(sX + Math.min(roomL*0.9, parseFloat(dLast)), 0, 0).y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="2"/>
            <circle cx="${p2.x}" cy="${p2.y}" r="6" fill="#10b981"/>
            <text x="${p2.x}" y="${p2.y-10}" font-size="8" font-family="JetBrains Mono" fill="#34d399" text-anchor="middle">Last Row: ${dLast}m</text>
            <line x1="${p2.x}" y1="${p2.y}" x2="${(sBL.x+sTL.x)/2}" y2="${(sBL.y+sTL.y)/2}" stroke="#10b981" stroke-width="1.2" stroke-dasharray="3,2"/>
          </g>
        `;
      })()}

      <!-- HUD Diagnostic Tag -->
      <rect x="20" y="20" width="380" height="52" fill="#0f172a" stroke="#334155" stroke-width="1.5" rx="6"/>
      <text x="32" y="38" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#facc15">3D PROJECTION OPTICAL MATRIX</text>
      <text x="32" y="56" font-size="9" font-family="JetBrains Mono" fill="#94a3b8">Throw Dist: ${throwDistM.toFixed(2)}m (TR: ${throwRatio}) | Req Lumens: ${reqLumens.toLocaleString()} ANSI (Lux: ${ambientLux} lx)</text>
    </svg>`;
  }
}

// ==========================================
// TAB 4: CAMERA STUDIO (CALCULATIONS & 3D INTERACTIVE)
// ==========================================
var currentCameraViewMode = '3D';
var cameraOrbitAngle = 45;

function toggleCamFullWindow() {
  var colLeft = document.getElementById('camControlsCol');
  var colRight = document.getElementById('camVisualizerCol');
  var svgWrap = document.getElementById('cameraFrustumSvgContainer');
  var btn = document.getElementById('btnToggleCamFullWindow');
  if (!colRight) return;
  var isExpanded = colRight.classList.contains('col-12');
  if (isExpanded) {
    if (colLeft) colLeft.classList.remove('d-none');
    colRight.className = 'col-xl-7 col-lg-7 col-12';
    if (svgWrap) svgWrap.style.minHeight = '560px';
    if (btn) btn.innerHTML = '<i class="fa-solid fa-expand me-1"></i>Full Window';
  } else {
    if (colLeft) colLeft.classList.add('d-none');
    colRight.className = 'col-12';
    if (svgWrap) svgWrap.style.minHeight = '680px';
    if (btn) btn.innerHTML = '<i class="fa-solid fa-compress me-1"></i>Restore Split View';
  }
  calcCameraStudio();
}

function toggleCamFovMatrix() {
  var card = document.getElementById('camDetailedFovMatrixCard');
  var btn = document.getElementById('btnToggleCamFovMatrix');
  if (!card) return;
  var isHidden = card.style.display === 'none';
  if (isHidden) {
    card.style.display = 'block';
    if (btn) btn.innerHTML = '<i class="fa-solid fa-eye-slash me-1"></i>Hide FOV Matrix';
  } else {
    card.style.display = 'none';
    if (btn) btn.innerHTML = '<i class="fa-solid fa-table-cells me-1"></i>Show FOV Matrix';
  }
}
window.toggleCamFovMatrix = toggleCamFovMatrix;

function toggleCam3dStatsHud() {
  var hud = document.getElementById('cam3dStatsHudGroup');
  var pill = document.getElementById('cam3dStatsPill');
  if (!hud || !pill) return;
  if (hud.style.display === 'none') {
    hud.style.display = 'block';
    pill.classList.add('d-none');
    pill.style.display = 'none';
  } else {
    hud.style.display = 'none';
    pill.classList.remove('d-none');
    pill.style.display = 'block';
  }
}
window.toggleCam3dStatsHud = toggleCam3dStatsHud;

function setCameraViewMode(mode) {
  currentCameraViewMode = mode;
  var btns = document.querySelectorAll('.btn-cam-view');
  btns.forEach(function(b) {
    if (b.getAttribute('data-view') === mode) {
      b.className = 'btn btn-primary active btn-cam-view';
    } else {
      b.className = 'btn btn-outline-secondary btn-cam-view';
    }
  });

  var badge = document.getElementById('camCurrentViewBadge');
  if (badge) {
    if (mode === '3D') badge.innerText = '3D Perspective & Frustum';
    else if (mode === 'top') badge.innerText = 'Top Plan View (HFOV)';
    else if (mode === 'side') badge.innerText = 'Side Elevation (VFOV & Tilt)';
    else if (mode === 'pov') badge.innerText = 'Sensor POV (16:9 Viewfinder)';
  }

  calcCameraStudio();
}

function onCamOrbitSliderChange(val) {
  cameraOrbitAngle = parseFloat(val) || 45;
  var disp = document.getElementById('camOrbitAngleValue');
  if (disp) disp.innerText = Math.round(cameraOrbitAngle) + '°';
  if (currentCameraViewMode === '3D') {
    calcCameraStudio();
  }
}

function syncCamVfovFromHfov() {
  var hfov = parseFloat(document.getElementById('camHfovInput')?.value) || 90;
  // Standard 16:9 aspect ratio VFOV derivation
  var radH = (hfov * Math.PI) / 360.0;
  var radV = Math.atan(Math.tan(radH) * (9.0 / 16.0));
  var vfov = (radV * 360.0) / Math.PI;

  var elV = document.getElementById('camVfovInput');
  if (elV) elV.value = vfov.toFixed(1);
  calcCameraStudio();
}

function syncCameraRoomDimensionsFromTab1() {
  var dMm = parseFloat(document.getElementById('depthMmInput')?.value) || 6000;
  var wMm = parseFloat(document.getElementById('widthMmInput')?.value) || 4500;
  var hMm = parseFloat(document.getElementById('roomHeightMmInput')?.value) || 2700;

  var lenEl = document.getElementById('camRoomLength');
  var widEl = document.getElementById('camRoomWidth');
  var heiEl = document.getElementById('camRoomHeight');

  if (lenEl) lenEl.value = (dMm / 1000.0).toFixed(1);
  if (widEl) widEl.value = (wMm / 1000.0).toFixed(1);
  if (heiEl) heiEl.value = (hMm / 1000.0).toFixed(1);

  calcCameraStudio();
}

function calcCameraStudio() {
  var rawL = parseFloat(document.getElementById('camRoomLength')?.value) || 6000;
  var rawW = parseFloat(document.getElementById('camRoomWidth')?.value) || 4500;
  var rawH = parseFloat(document.getElementById('camRoomHeight')?.value) || 2700;
  var rawDist = parseFloat(document.getElementById('camDistToPresenter')?.value) || 5500;
  var rawHead = parseFloat(document.getElementById('camSeatedHeadHt')?.value) || 1200;

  var roomL = rawL > 50 ? rawL / 1000.0 : rawL;
  var roomW = rawW > 50 ? rawW / 1000.0 : rawW;
  var roomH = rawH > 50 ? rawH / 1000.0 : rawH;
  var distPres = rawDist > 50 ? rawDist / 1000.0 : rawDist;
  var headHt = rawHead > 50 ? rawHead / 1000.0 : rawHead;

  var resolution = document.getElementById('camResolutionSelect')?.value || '4k';
  var mountPos = document.getElementById('camMountPosSelect')?.value || 'front_wall';
  var hfov = parseFloat(document.getElementById('camHfovInput')?.value) || 90;
  var vfov = parseFloat(document.getElementById('camVfovInput')?.value) || 55;
  var zoom = parseFloat(document.getElementById('camZoomSelect')?.value) || 12;
  var frameType = document.getElementById('camTargetFrameSelect')?.value || 'table_group';

  // Frame width requirement
  var frameW = 2.5; // table group
  if (frameType === 'head_shoulders') frameW = 0.8;
  else if (frameType === 'full_body') frameW = 1.8;
  else if (frameType === 'wide_room') frameW = 4.0;

  // Min & Max capturing distance
  var radH = (hfov * Math.PI) / 360.0;
  var radV = (vfov * Math.PI) / 360.0;
  var minDist = frameW / (2.0 * Math.tan(radH));
  var maxDist = minDist * (zoom * 0.85);

  // Mount Height AFF
  var mountAff = 1.65;
  if (mountPos === 'front_wall') mountAff = 1.95; // above display
  else if (mountPos === 'front_below') mountAff = 0.85; // below display
  else if (mountPos === 'ceiling_drop') mountAff = Math.max(1.8, roomH - 0.45);
  else if (mountPos === 'rear_wall') mountAff = 1.80;

  // Downward tilt angle to presenter face/chest (center at 1.4m standing, 1.2m seated)
  var targetCenterY = (frameType === 'full_body') ? 1.0 : 1.35;
  var dy = mountAff - targetCenterY;
  var tiltDeg = Math.atan2(dy, distPres) * (180.0 / Math.PI);

  // Audience Head Clearance:
  var headClearanceMm = Math.round((mountAff - headHt) * 1000);

  // Status & Progress Bar
  var distStatus = 'In Optimal Zone';
  var statusClass = 'text-success';
  if (distPres < minDist) {
    distStatus = 'Too Close (< Min Dist)';
    statusClass = 'text-danger';
  } else if (distPres > maxDist) {
    distStatus = 'Exceeds Optical Limit';
    statusClass = 'text-danger';
  } else if (distPres > maxDist * 0.75) {
    distStatus = 'High Optical Zoom Zone';
    statusClass = 'text-warning';
  }

  var pctSpan = Math.min(100, Math.max(5, ((distPres - minDist) / (maxDist - minDist)) * 100));

  // Update Summary DOM elements
  var elMin = document.getElementById('resCamMinDist');
  if (elMin) elMin.innerText = minDist.toFixed(2) + ' m';
  var elMax = document.getElementById('resCamMaxDist');
  if (elMax) elMax.innerText = maxDist.toFixed(2) + ' m';
  var elTarget = document.getElementById('resCamTargetDistDisplay');
  if (elTarget) elTarget.innerText = distPres.toFixed(2) + ' m';
  var elStatus = document.getElementById('resCamDistStatus');
  if (elStatus) {
    elStatus.innerText = distStatus;
    elStatus.className = 'small fw-bold ' + statusClass;
  }
  var elBar = document.getElementById('camCoverageProgressBar');
  if (elBar) {
    elBar.style.width = pctSpan + '%';
    elBar.className = distPres > maxDist || distPres < minDist ? 'progress-bar bg-danger' : 'progress-bar bg-success';
  }

  // Coverage Dimensions Matrix Table:
  var wMin = 2.0 * minDist * Math.tan(radH);
  var hMin = 2.0 * minDist * Math.tan(radV);
  var aMin = wMin * hMin;

  var wTgt = 2.0 * distPres * Math.tan(radH);
  var hTgt = 2.0 * distPres * Math.tan(radV);
  var aTgt = wTgt * hTgt;

  var wMax = 2.0 * maxDist * Math.tan(radH);
  var hMax = 2.0 * maxDist * Math.tan(radV);
  var aMax = wMax * hMax;

  var setTxt = function(id, val) { var e = document.getElementById(id); if (e) e.innerText = val; };
  setTxt('tableMinDistLabel', minDist.toFixed(2) + 'm');
  setTxt('tableMinCoverageW', wMin.toFixed(2) + ' m');
  setTxt('tableMinCoverageH', hMin.toFixed(2) + ' m');
  setTxt('tableMinCoverageArea', aMin.toFixed(2) + ' m²');

  setTxt('tableTargetDistLabel', distPres.toFixed(2) + 'm');
  setTxt('tableTargetCoverageW', wTgt.toFixed(2) + ' m');
  setTxt('tableTargetCoverageH', hTgt.toFixed(2) + ' m');
  setTxt('tableTargetCoverageArea', aTgt.toFixed(1) + ' m²');

  setTxt('tableMaxDistLabel', maxDist.toFixed(2) + 'm');
  setTxt('tableMaxCoverageW', wMax.toFixed(2) + ' m');
  setTxt('tableMaxCoverageH', hMax.toFixed(2) + ' m');
  setTxt('tableMaxCoverageArea', aMax.toFixed(1) + ' m²');

  // Face Pixel Density (PPM / Pixels Per Meter)
  var sensorPixW = 3840;
  if (resolution === '1080p') sensorPixW = 1920;
  else if (resolution === '720p') sensorPixW = 1280;

  var ppm = Math.round(sensorPixW / wTgt);
  var ppmRating = 'Identification Pass (>250 px/m)';
  if (ppm < 62) ppmRating = 'Detection Level (<62 px/m)';
  else if (ppm < 125) ppmRating = 'Observation Pass (>62 px/m)';
  else if (ppm < 250) ppmRating = 'Recognition Pass (>125 px/m)';

  setTxt('camPixelDensity', ppm + ' px/m (' + ppmRating + ')');
  setTxt('camTiltAngleDisplay', tiltDeg >= 0 ? '-' + tiltDeg.toFixed(1) + '°' : '+' + Math.abs(tiltDeg).toFixed(1) + '°');
  setTxt('resCamMountAff', mountAff.toFixed(2) + ' m (' + (mountPos === 'ceiling_drop' ? 'Ceiling Pendant' : 'Wall Eye-Level') + ')');
  setTxt('resCamHeadClearance', (headClearanceMm >= 0 ? '+' : '') + headClearanceMm + ' mm (' + (headClearanceMm > 150 ? 'Clear Sightline' : 'Obstructed Warning') + ')');

  // Checkbox layer toggles
  var showFrustum = document.getElementById('chkCamFrustum')?.checked !== false;
  var showLimits = document.getElementById('chkCamLimits')?.checked !== false;
  var showAudience = document.getElementById('chkCamAudience')?.checked !== false;

  // Render Visualizer
  var container = document.getElementById('cameraFrustumSvgContainer');
  if (!container) return;

  if (currentCameraViewMode === '3D') {
    renderCam3DFrustum(container, roomL, roomW, roomH, mountAff, distPres, minDist, maxDist, hfov, vfov, tiltDeg, headHt, showFrustum, showLimits, showAudience);
  } else if (currentCameraViewMode === 'top') {
    renderCamTopPlan(container, roomL, roomW, distPres, minDist, maxDist, hfov, wMin, wTgt, wMax, showLimits, showAudience);
  } else if (currentCameraViewMode === 'side') {
    renderCamSideElevation(container, roomL, roomH, mountAff, distPres, minDist, maxDist, vfov, tiltDeg, headHt, showLimits, showAudience);
  } else if (currentCameraViewMode === 'pov') {
    renderCamSensorPOV(container, resolution, zoom, distPres, hfov, vfov, frameType, ppm, ppmRating);
  }
}

// 1. Camera 3D Isometric / Perspective View
function renderCam3DFrustum(container, roomL, roomW, roomH, mountAff, distPres, minDist, maxDist, hfov, vfov, tiltDeg, headHt, showFrustum, showLimits, showAudience) {
  var svgW = 1000, svgH = 580;
  var padX = 25, padY = 20;
  var angleRad = (cameraOrbitAngle * Math.PI) / 180.0;

  var cosA = Math.cos(angleRad);
  var sinA = Math.sin(angleRad);

  function rawProject(x, y, z) {
    var isoX = (x * cosA - y * sinA);
    var isoY = (x * sinA * 0.45 + y * cosA * 0.45 - z * 0.88);
    return { x: isoX, y: isoY };
  }

  // Calculate dynamic bounding box across room corners and camera frustum
  var testPts = [
    rawProject(0, -roomW/2, 0),
    rawProject(roomL, -roomW/2, 0),
    rawProject(roomL, roomW/2, 0),
    rawProject(0, roomW/2, 0),
    rawProject(0, -roomW/2, roomH),
    rawProject(roomL, -roomW/2, roomH),
    rawProject(roomL, roomW/2, roomH),
    rawProject(0, roomW/2, roomH)
  ];

  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  testPts.forEach(function(p) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  var rawW = Math.max(1, maxX - minX);
  var rawH = Math.max(1, maxY - minY);
  var scale = Math.min((svgW - padX * 2) / rawW, (svgH - padY * 2) / rawH);
  var offsetX = padX + ((svgW - padX * 2) - rawW * scale) / 2 - minX * scale;
  var offsetY = padY + ((svgH - padY * 2) - rawH * scale) / 2 - minY * scale;

  function project(x, y, z) {
    var raw = rawProject(x, y, z);
    return {
      x: offsetX + raw.x * scale,
      y: offsetY + raw.y * scale
    };
  }

  // Room vertices
  var f00 = project(0, -roomW/2, 0);
  var fL0 = project(roomL, -roomW/2, 0);
  var fLW = project(roomL, roomW/2, 0);
  var f0W = project(0, roomW/2, 0);

  var c00 = project(0, -roomW/2, roomH);
  var cL0 = project(roomL, -roomW/2, roomH);
  var cLW = project(roomL, roomW/2, roomH);
  var c0W = project(0, roomW/2, roomH);

  // Camera lens coordinates (on front wall x=0.1, y=0, z=mountAff)
  var camPos = project(0.1, 0, mountAff);

  // Presenter position
  var presPos = project(distPres, 0, 0);
  var presHead = project(distPres, 0, 1.75);

  // Frustum points at Target distance
  var radH = (hfov * Math.PI) / 360.0;
  var radV = (vfov * Math.PI) / 360.0;
  var halfWTgt = distPres * Math.tan(radH);
  var halfHTgt = distPres * Math.tan(radV);
  var tgtCenterZ = mountAff - (distPres * Math.tan(tiltDeg * Math.PI / 180.0));

  var fTL = project(distPres, -halfWTgt, tgtCenterZ + halfHTgt);
  var fTR = project(distPres, halfWTgt, tgtCenterZ + halfHTgt);
  var fBR = project(distPres, halfWTgt, tgtCenterZ - halfHTgt);
  var fBL = project(distPres, -halfWTgt, tgtCenterZ - halfHTgt);

  // Min dist points
  var halfWMin = minDist * Math.tan(radH);
  var halfHMin = minDist * Math.tan(radV);
  var minCenterZ = mountAff - (minDist * Math.tan(tiltDeg * Math.PI / 180.0));
  var mTL = project(minDist, -halfWMin, minCenterZ + halfHMin);
  var mTR = project(minDist, halfWMin, minCenterZ + halfHMin);
  var mBR = project(minDist, halfWMin, minCenterZ - halfHMin);
  var mBL = project(minDist, -halfWMin, minCenterZ - halfHMin);

  // Max dist points
  var dLimit = Math.min(roomL, maxDist);
  var halfWMax = dLimit * Math.tan(radH);
  var halfHMax = dLimit * Math.tan(radV);
  var maxCenterZ = mountAff - (dLimit * Math.tan(tiltDeg * Math.PI / 180.0));
  var xTL = project(dLimit, -halfWMax, maxCenterZ + halfHMax);
  var xTR = project(dLimit, halfWMax, maxCenterZ + halfHMax);
  var xBR = project(dLimit, halfWMax, maxCenterZ - halfHMax);
  var xBL = project(dLimit, -halfWMax, maxCenterZ - halfHMax);

  // Table coordinates (center of room)
  var tLen = Math.min(4.0, roomL * 0.6);
  var tWid = Math.min(1.4, roomW * 0.4);
  var tX1 = (roomL - tLen) / 2.0;
  var tX2 = tX1 + tLen;
  var tblTL = project(tX1, -tWid/2, 0.75);
  var tblTR = project(tX1, tWid/2, 0.75);
  var tblBR = project(tX2, tWid/2, 0.75);
  var tblBL = project(tX2, -tWid/2, 0.75);

  container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:10px; width:100%; height:100%;">
    <defs>
      <linearGradient id="camBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.65"/>
        <stop offset="50%" stop-color="#10b981" stop-opacity="0.38"/>
        <stop offset="100%" stop-color="#059669" stop-opacity="0.12"/>
      </linearGradient>
      <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.98"/>
      </linearGradient>
      <linearGradient id="tableTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <filter id="camDropGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- 3D Room Floor with Grid -->
    <polygon points="${f00.x},${f00.y} ${fL0.x},${fL0.y} ${fLW.x},${fLW.y} ${f0W.x},${f0W.y}" fill="#0f172a" stroke="#334155" stroke-width="2.5"/>
    ${(function(){
      var gridSvg = '';
      for (var gx = 1; gx < roomL; gx += 1.0) {
        var p1 = project(gx, -roomW/2, 0);
        var p2 = project(gx, roomW/2, 0);
        gridSvg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#1e293b" stroke-width="1.2"/>`;
      }
      return gridSvg;
    })()}

    <!-- Rear and Side Walls -->
    <polygon points="${f00.x},${f00.y} ${c00.x},${c00.y} ${cL0.x},${cL0.y} ${fL0.x},${fL0.y}" fill="url(#wallGradient)" stroke="#1e293b" stroke-width="2"/>
    <polygon points="${fL0.x},${fL0.y} ${cL0.x},${cL0.y} ${cLW.x},${cLW.y} ${fLW.x},${fLW.y}" fill="#0b1324" stroke="#1e293b" stroke-width="2"/>

    <!-- Ceiling Wireframe Boundary -->
    <polygon points="${c00.x},${c00.y} ${cL0.x},${cL0.y} ${cLW.x},${cLW.y} ${c0W.x},${c0W.y}" fill="none" stroke="#475569" stroke-width="1.8" stroke-dasharray="5,4"/>

    <!-- Conference Table & Chairs (Enlarged High-Fidelity Geometry) -->
    <polygon points="${tblTL.x},${tblTL.y} ${tblTR.x},${tblTR.y} ${tblBR.x},${tblBR.y} ${tblBL.x},${tblBL.y}" fill="url(#tableTopGrad)" stroke="#38bdf8" stroke-width="2.5"/>
    <!-- Table 3D Beveled Lip -->
    <polygon points="${tblBL.x},${tblBL.y} ${tblBR.x},${tblBR.y} ${tblBR.x},${tblBR.y+10} ${tblBL.x},${tblBL.y+10}" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="${(tblTL.x+tblBR.x)/2}" y="${(tblTL.y+tblBR.y)/2+4}" font-size="12" font-weight="bold" font-family="JetBrains Mono" fill="#e2e8f0" text-anchor="middle">EXECUTIVE CONFERENCE TABLE (${tLen.toFixed(1)}m × ${tWid.toFixed(1)}m)</text>

    <!-- Seated Audience Avatars & Clearance Sightlines -->
    ${showAudience ? `
      ${[-1.2, -0.4, 0.4, 1.2].map(function(chairOffset) {
        var chairX = (tX1 + tX2)/2 + chairOffset;
        var earPt = project(chairX, -tWid/2 - 0.35, headHt);
        var headCirclePt = project(chairX, -tWid/2 - 0.35, headHt + 0.18);
        var seatBase = project(chairX, -tWid/2 - 0.35, 0.45);
        var floorBase = project(chairX, -tWid/2 - 0.35, 0);

        var earPt2 = project(chairX, tWid/2 + 0.35, headHt);
        var headCirclePt2 = project(chairX, tWid/2 + 0.35, headHt + 0.18);
        var seatBase2 = project(chairX, tWid/2 + 0.35, 0.45);
        var floorBase2 = project(chairX, tWid/2 + 0.35, 0);

        return `
          <g>
            <!-- North Chair -->
            <line x1="${floorBase.x}" y1="${floorBase.y}" x2="${seatBase.x}" y2="${seatBase.y}" stroke="#475569" stroke-width="3"/>
            <rect x="${seatBase.x-10}" y="${seatBase.y-6}" width="20" height="10" fill="#334155" stroke="#64748b" rx="2"/>
            <circle cx="${headCirclePt.x}" cy="${headCirclePt.y}" r="9" fill="#0284c7" stroke="#ffffff" stroke-width="1.8"/>
            <line x1="${camPos.x}" y1="${camPos.y}" x2="${headCirclePt.x}" y2="${headCirclePt.y}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,2"/>

            <!-- South Chair -->
            <line x1="${floorBase2.x}" y1="${floorBase2.y}" x2="${seatBase2.x}" y2="${seatBase2.y}" stroke="#475569" stroke-width="3"/>
            <rect x="${seatBase2.x-10}" y="${seatBase2.y-6}" width="20" height="10" fill="#334155" stroke="#64748b" rx="2"/>
            <circle cx="${headCirclePt2.x}" cy="${headCirclePt2.y}" r="9" fill="#0284c7" stroke="#ffffff" stroke-width="1.8"/>
            <line x1="${camPos.x}" y1="${camPos.y}" x2="${headCirclePt2.x}" y2="${headCirclePt2.y}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,2"/>
          </g>
        `;
      }).join('')}
    ` : ''}

    <!-- 3D Camera Body & Motorized Lens Mount on Front Wall (Enlarged & Realistic) -->
    <g filter="url(#camDropGlow)">
      <!-- Wall Mounting Plate -->
      <rect x="${camPos.x-18}" y="${camPos.y-8}" width="16" height="26" fill="#0f172a" stroke="#64748b" stroke-width="2" rx="2"/>
      <line x1="${camPos.x-10}" y1="${camPos.y+18}" x2="${camPos.x-10}" y2="${project(0.1, 0, 0).y}" stroke="#64748b" stroke-width="2.5" stroke-dasharray="4,3"/>
      
      <!-- PTZ Turret Base -->
      <ellipse cx="${camPos.x}" cy="${camPos.y+8}" rx="16" ry="7" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
      <rect x="${camPos.x-12}" y="${camPos.y-4}" width="24" height="12" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      
      <!-- Camera Lens Barrel -->
      <circle cx="${camPos.x+6}" cy="${camPos.y-2}" r="15" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
      <circle cx="${camPos.x+10}" cy="${camPos.y-2}" r="9" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <circle cx="${camPos.x+12}" cy="${camPos.y-3}" r="4" fill="#38bdf8"/>
      <!-- Active Tally Lamp -->
      <circle cx="${camPos.x-4}" cy="${camPos.y-12}" r="3.5" fill="#22c55e" stroke="#ffffff" stroke-width="1"/>
      
      <!-- Elevation Tag Badge -->
      <rect x="${camPos.x-20}" y="${camPos.y-36}" width="180" height="22" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8" rx="4"/>
      <text x="${camPos.x+70}" y="${camPos.y-21}" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="middle">PTZ CAM (${mountAff.toFixed(2)}m AFF)</text>
    </g>

    <!-- 3D Volumetric FOV Frustum Cone -->
    ${showFrustum ? `
      <!-- Main Frustum Volume Faces -->
      <polygon points="${camPos.x},${camPos.y} ${fTL.x},${fTL.y} ${fTR.x},${fTR.y}" fill="url(#camBeamGrad)"/>
      <polygon points="${camPos.x},${camPos.y} ${fTR.x},${fTR.y} ${fBR.x},${fBR.y}" fill="url(#camBeamGrad)"/>
      <polygon points="${camPos.x},${camPos.y} ${fBR.x},${fBR.y} ${fBL.x},${fBL.y}" fill="url(#camBeamGrad)"/>
      <polygon points="${camPos.x},${camPos.y} ${fBL.x},${fBL.y} ${fTL.x},${fTL.y}" fill="url(#camBeamGrad)"/>

      <!-- Edge Wireframes -->
      <line x1="${camPos.x}" y1="${camPos.y}" x2="${fTL.x}" y2="${fTL.y}" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.9"/>
      <line x1="${camPos.x}" y1="${camPos.y}" x2="${fTR.x}" y2="${fTR.y}" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.9"/>
      <line x1="${camPos.x}" y1="${camPos.y}" x2="${fBR.x}" y2="${fBR.y}" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.9"/>
      <line x1="${camPos.x}" y1="${camPos.y}" x2="${fBL.x}" y2="${fBL.y}" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.9"/>

      <!-- Presenter Target Plane Rect -->
      <polygon points="${fTL.x},${fTL.y} ${fTR.x},${fTR.y} ${fBR.x},${fBR.y} ${fBL.x},${fBL.y}" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="3.5"/>
      <line x1="${camPos.x}" y1="${camPos.y}" x2="${presHead.x}" y2="${presHead.y}" stroke="#facc15" stroke-width="2.8" stroke-dasharray="4,2"/>
    ` : ''}

    <!-- Min Capture Distance Plane -->
    ${showLimits ? `
      <polygon points="${mTL.x},${mTL.y} ${mTR.x},${mTR.y} ${mBR.x},${mBR.y} ${mBL.x},${mBL.y}" fill="rgba(6, 182, 212, 0.10)" stroke="#06b6d4" stroke-width="2.5" stroke-dasharray="4,3"/>
      <rect x="${mTR.x+8}" y="${mTR.y-12}" width="140" height="20" fill="#0f172a" stroke="#06b6d4" stroke-width="1.2" rx="4"/>
      <text x="${mTR.x+78}" y="${mTR.y+2}" font-size="10.5" font-weight="bold" font-family="JetBrains Mono" fill="#06b6d4" text-anchor="middle">MIN DIST: ${minDist.toFixed(2)}m</text>

      <!-- Max Distance Limit Plane -->
      <polygon points="${xTL.x},${xTL.y} ${xTR.x},${xTR.y} ${xBR.x},${xBR.y} ${xBL.x},${xBL.y}" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6,4"/>
      <rect x="${xTR.x+8}" y="${xTR.y-12}" width="150" height="20" fill="#0f172a" stroke="#ef4444" stroke-width="1.2" rx="4"/>
      <text x="${xTR.x+83}" y="${xTR.y+2}" font-size="10.5" font-weight="bold" font-family="JetBrains Mono" fill="#ef4444" text-anchor="middle">OPTICAL LIMIT: ${maxDist.toFixed(2)}m</text>
    ` : ''}

    <!-- Presenter Avatar at Target Distance (Enlarged) -->
    <g>
      <!-- Body & Shoulders -->
      <line x1="${presPos.x}" y1="${presPos.y}" x2="${presHead.x}" y2="${presHead.y}" stroke="#10b981" stroke-width="6"/>
      <line x1="${presHead.x-14}" y1="${presHead.y+12}" x2="${presHead.x+14}" y2="${presHead.y+12}" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
      <!-- Head -->
      <circle cx="${presHead.x}" cy="${presHead.y-6}" r="11" fill="#10b981" stroke="#ffffff" stroke-width="2.5"/>
      <rect x="${presHead.x-65}" y="${presHead.y-42}" width="130" height="25" fill="#0f172a" stroke="#10b981" stroke-width="2" rx="5"/>
      <text x="${presHead.x}" y="${presHead.y-25}" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#34d399" text-anchor="middle">PRESENTER: ${distPres.toFixed(2)}m</text>
    </g>

    <!-- Overlay Stats Box (Clickable to Hide/Show, Enlarged Clear Visibility) -->
    <g id="cam3dStatsHudGroup" style="cursor: pointer;" onclick="toggleCam3dStatsHud()">
      <rect x="20" y="20" width="340" height="80" fill="#0f172a" fill-opacity="0.95" stroke="#38bdf8" stroke-width="2" rx="8"/>
      <text x="34" y="44" font-size="13" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8"><tspan fill="#38bdf8">3D CAMERA MATRIX &amp; FRUSTUM</tspan> <tspan fill="#64748b" font-size="9.5">(Click to minimize)</tspan></text>
      <text x="34" y="64" font-size="11" font-family="JetBrains Mono" fill="#cbd5e1">HFOV: ${hfov}° | VFOV: ${vfov}° | Tilt: -${tiltDeg.toFixed(1)}°</text>
      <text x="34" y="84" font-size="11" font-family="JetBrains Mono" fill="#34d399">Target Reach: ${distPres.toFixed(2)}m (Min: ${minDist.toFixed(2)}m / Max: ${maxDist.toFixed(2)}m)</text>
    </g>
    <!-- Collapsed Toggle Pill when hidden -->
    <g id="cam3dStatsPill" class="d-none" style="cursor: pointer;" onclick="toggleCam3dStatsHud()">
      <rect x="20" y="20" width="140" height="30" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8" rx="6"/>
      <text x="90" y="40" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="middle">👁 Show Specs HUD</text>
    </g>
  </svg>`;
}

// 2. Camera Top Plan View (HFOV)
function renderCamTopPlan(container, roomL, roomW, distPres, minDist, maxDist, hfov, wMin, wTgt, wMax, showLimits, showAudience) {
  var svgW = 900, svgH = 380;
  var padX = 70, padY = 50;
  var drawW = svgW - padX * 2;
  var drawH = svgH - padY * 2;

  var scaleX = drawW / roomL;
  var scaleY = drawH / roomW;
  var scale = Math.min(scaleX, scaleY);

  var rW = roomL * scale;
  var rH = roomW * scale;
  var ox = (svgW - rW) / 2;
  var oy = (svgH - rH) / 2;

  var camX = ox;
  var camY = oy + rH / 2;

  // HFOV Cone rays
  var radH = (hfov * Math.PI) / 360.0;
  var tanH = Math.tan(radH);

  var tgtX = ox + distPres * scale;
  var tgtHalfH = (distPres * tanH) * scale;

  var minX = ox + minDist * scale;
  var minHalfH = (minDist * tanH) * scale;

  var maxX = ox + Math.min(roomL, maxDist) * scale;
  var maxHalfH = (Math.min(roomL, maxDist) * tanH) * scale;

  container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
    <!-- Room Boundaries -->
    <rect x="${ox}" y="${oy}" width="${rW}" height="${rH}" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <text x="${ox+rW/2}" y="${oy-12}" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#94a3b8" text-anchor="middle">ROOM LENGTH: ${roomL.toFixed(1)} m</text>
    <text x="${ox-15}" y="${oy+rH/2}" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#94a3b8" text-anchor="middle" transform="rotate(-90 ${ox-15} ${oy+rH/2})">WIDTH: ${roomW.toFixed(1)} m</text>

    <!-- Conference Table in center -->
    <rect x="${ox + (roomL*0.25)*scale}" y="${oy + (roomW*0.35)*scale}" width="${roomL*0.5*scale}" height="${roomW*0.3*scale}" fill="#1e293b" stroke="#334155" stroke-width="1.5" rx="4"/>
    <text x="${ox + rW/2}" y="${oy + rH/2 + 4}" font-size="9" font-family="JetBrains Mono" fill="#64748b" text-anchor="middle">CONFERENCE TABLE</text>

    <!-- HFOV Conical Spread -->
    <polygon points="${camX},${camY} ${tgtX},${camY-tgtHalfH} ${tgtX},${camY+tgtHalfH}" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="1.5"/>
    <polygon points="${camX},${camY} ${maxX},${camY-maxHalfH} ${maxX},${camY+maxHalfH}" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="3,3"/>

    <!-- Min Distance Marker Arc -->
    ${showLimits ? `
      <line x1="${minX}" y1="${camY-minHalfH}" x2="${minX}" y2="${camY+minHalfH}" stroke="#06b6d4" stroke-width="2.5"/>
      <text x="${minX}" y="${camY-minHalfH-6}" font-size="9" font-weight="bold" font-family="JetBrains Mono" fill="#06b6d4" text-anchor="middle">MIN DIST: ${minDist.toFixed(2)}m (W: ${wMin.toFixed(2)}m)</text>

      <line x1="${maxX}" y1="${camY-maxHalfH}" x2="${maxX}" y2="${camY+maxHalfH}" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3"/>
      <text x="${maxX}" y="${camY+maxHalfH+14}" font-size="9" font-weight="bold" font-family="JetBrains Mono" fill="#ef4444" text-anchor="middle">OPTICAL ZOOM LIMIT: ${maxDist.toFixed(2)}m</text>
    ` : ''}

    <!-- Presenter Target Position -->
    <line x1="${tgtX}" y1="${camY-tgtHalfH}" x2="${tgtX}" y2="${camY+tgtHalfH}" stroke="#10b981" stroke-width="3"/>
    <circle cx="${tgtX}" cy="${camY}" r="8" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
    <text x="${tgtX}" y="${camY-tgtHalfH-8}" font-size="10" font-weight="bold" font-family="JetBrains Mono" fill="#34d399" text-anchor="middle">PRESENTER: ${distPres.toFixed(2)}m | HFOV COVERAGE WIDTH: ${wTgt.toFixed(2)}m</text>

    <!-- Camera Placement -->
    <rect x="${camX-8}" y="${camY-12}" width="16" height="24" fill="#0284c7" rx="3"/>
    <circle cx="${camX+10}" cy="${camY}" r="5" fill="#38bdf8"/>
    <text x="${camX-12}" y="${camY-16}" font-size="10" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8">CAMERA</text>

    <!-- HFOV Angle Arc -->
    <path d="M ${camX+30} ${camY-15} A 30 30 0 0 1 ${camX+30} ${camY+15}" fill="none" stroke="#facc15" stroke-width="2"/>
    <text x="${camX+45}" y="${camY+4}" font-size="10" font-weight="bold" font-family="JetBrains Mono" fill="#facc15">HFOV: ${hfov}°</text>
  </svg>`;
}

// 3. Camera Side Elevation View (VFOV & Tilt)
function renderCamSideElevation(container, roomL, roomH, mountAff, distPres, minDist, maxDist, vfov, tiltDeg, headHt, showLimits, showAudience) {
  var svgW = 900, svgH = 380;
  var padX = 70, padY = 50;
  var drawW = svgW - padX * 2;
  var drawH = svgH - padY * 2;

  var scaleX = drawW / roomL;
  var scaleY = drawH / roomH;
  var scale = Math.min(scaleX, scaleY);

  var rW = roomL * scale;
  var rH = roomH * scale;
  var ox = (svgW - rW) / 2;
  var oy = (svgH - rH) / 2;

  var floorY = oy + rH;
  var ceilingY = oy;

  var camX = ox;
  var camY = floorY - mountAff * scale;

  var presX = ox + distPres * scale;
  var presFloorY = floorY;
  var presHeadY = floorY - 1.75 * scale;

  var headClearanceY = floorY - headHt * scale;

  // VFOV Cone
  var radV = (vfov * Math.PI) / 360.0;
  var tiltRad = (tiltDeg * Math.PI) / 180.0;

  var upperAngle = -tiltRad + radV;
  var lowerAngle = -tiltRad - radV;

  var dTarget = distPres * scale;
  var tgtUpperY = camY - Math.tan(upperAngle) * dTarget;
  var tgtLowerY = camY - Math.tan(lowerAngle) * dTarget;

  container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
    <!-- Floor & Ceiling Lines -->
    <line x1="${ox}" y1="${floorY}" x2="${ox+rW}" y2="${floorY}" stroke="#64748b" stroke-width="3"/>
    <text x="${ox+rW+10}" y="${floorY+4}" font-size="10" font-family="JetBrains Mono" fill="#64748b">FLOOR (0.0m)</text>

    <line x1="${ox}" y1="${ceilingY}" x2="${ox+rW}" y2="${ceilingY}" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
    <text x="${ox+rW+10}" y="${ceilingY+4}" font-size="10" font-family="JetBrains Mono" fill="#64748b">CEILING (${roomH.toFixed(1)}m)</text>

    <!-- Seated Audience Head Plane (1.2m) -->
    <line x1="${ox}" y1="${headClearanceY}" x2="${ox+rW}" y2="${headClearanceY}" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,3"/>
    <text x="${ox+rW+10}" y="${headClearanceY+4}" font-size="9" font-family="JetBrains Mono" fill="#38bdf8">SEATED HEAD PLANE (${headHt.toFixed(2)}m)</text>

    <!-- Camera on Wall -->
    <line x1="${ox}" y1="${ceilingY}" x2="${ox}" y2="${floorY}" stroke="#334155" stroke-width="4"/>
    <rect x="${camX-6}" y="${camY-10}" width="14" height="20" fill="#0284c7" rx="3"/>
    <circle cx="${camX+12}" cy="${camY}" r="6" fill="#38bdf8"/>
    <text x="${camX+24}" y="${camY-6}" font-size="10" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8">CAM MOUNT (${mountAff.toFixed(2)}m AFF)</text>

    <!-- VFOV Dispersion Cone -->
    <polygon points="${camX+12},${camY} ${presX},${tgtUpperY} ${presX},${tgtLowerY}" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="1.5"/>

    <!-- Optical Axis / Downward Tilt -->
    <line x1="${camX+12}" y1="${camY}" x2="${presX}" y2="${(tgtUpperY+tgtLowerY)/2}" stroke="#facc15" stroke-width="2" stroke-dasharray="4,2"/>
    <text x="${(camX+presX)/2}" y="${camY - 12}" font-size="9.5" font-weight="bold" font-family="JetBrains Mono" fill="#facc15">TILT: -${tiltDeg.toFixed(1)}°</text>

    <!-- Presenter Figure at distPres -->
    <line x1="${presX}" y1="${presFloorY}" x2="${presX}" y2="${presHeadY}" stroke="#10b981" stroke-width="4"/>
    <circle cx="${presX}" cy="${presHeadY-5}" r="7" fill="#10b981"/>
    <text x="${presX}" y="${presHeadY-16}" font-size="10" font-weight="bold" font-family="JetBrains Mono" fill="#34d399" text-anchor="middle">PRESENTER (${distPres.toFixed(2)}m)</text>

    <!-- Head Clearance Callout -->
    <line x1="${ox+rW*0.3}" y1="${camY}" x2="${ox+rW*0.3}" y2="${headClearanceY}" stroke="#f43f5e" stroke-width="2"/>
    <text x="${ox+rW*0.3+8}" y="${(camY+headClearanceY)/2}" font-size="9" font-weight="bold" font-family="JetBrains Mono" fill="#f43f5e">CLEARANCE: +${Math.round((mountAff-headHt)*1000)} mm</text>
  </svg>`;
}

// 4. Camera Sensor POV (16:9 Live Viewfinder)
function renderCamSensorPOV(container, resolution, zoom, distPres, hfov, vfov, frameType, ppm, ppmRating) {
  var svgW = 900, svgH = 380;
  var resLabel = resolution === '4k' ? '4K UHD (3840 × 2160)' : (resolution === '1080p' ? 'Full HD (1920 × 1080)' : 'HD (1280 × 720)');

  container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="background:#020617; border-radius:8px;">
    <!-- Viewfinder Outer Box -->
    <rect x="25" y="20" width="850" height="340" fill="#090d16" stroke="#334155" stroke-width="3" rx="6"/>

    <!-- Rule of Thirds Grid Lines -->
    <line x1="308" y1="20" x2="308" y2="360" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <line x1="591" y1="20" x2="591" y2="360" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <line x1="25" y1="133" x2="875" y2="133" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <line x1="25" y1="246" x2="875" y2="246" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

    <!-- Center Crosshairs -->
    <line x1="435" y1="190" x2="465" y2="190" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="450" y1="175" x2="450" y2="205" stroke="#38bdf8" stroke-width="1.5"/>
    <circle cx="450" cy="190" r="16" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2,2"/>

    <!-- Face / Subject AI Tracking Box -->
    <g transform="translate(380, 110)">
      <rect x="0" y="0" width="140" height="170" fill="rgba(16,185,129,0.08)" stroke="#10b981" stroke-width="2" rx="4"/>
      <!-- Tracking Corners -->
      <path d="M 0 15 L 0 0 L 15 0" fill="none" stroke="#34d399" stroke-width="3"/>
      <path d="M 125 0 L 140 0 L 140 15" fill="none" stroke="#34d399" stroke-width="3"/>
      <path d="M 140 155 L 140 170 L 125 170" fill="none" stroke="#34d399" stroke-width="3"/>
      <path d="M 15 170 L 0 170 L 0 155" fill="none" stroke="#34d399" stroke-width="3"/>

      <!-- Subject Avatar -->
      <circle cx="70" cy="45" r="22" fill="#334155" stroke="#10b981" stroke-width="2"/>
      <path d="M 40 120 Q 70 80 100 120 Z" fill="#334155"/>
      <rect x="10" y="145" width="120" height="18" fill="#0f172a" stroke="#10b981" rx="2"/>
      <text x="70" y="157" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#34d399" text-anchor="middle">FACIAL PPM: ${ppm} px/m</text>
    </g>

    <!-- Broadcast HUD Overlay Information -->
    <rect x="40" y="35" width="220" height="26" fill="#0f172a" stroke="#ef4444" stroke-width="1.5" rx="4"/>
    <circle cx="54" cy="48" r="5" fill="#ef4444"/>
    <text x="68" y="52" font-size="10" font-weight="bold" font-family="JetBrains Mono" fill="#ffffff">REC ● SENSOR STREAM</text>

    <text x="850" y="52" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="end">${resLabel} @ 60 FPS</text>
    <text x="850" y="70" font-size="9.5" font-family="JetBrains Mono" fill="#94a3b8" text-anchor="end">ZOOM: ${zoom}× OPTICAL | DIST: ${distPres.toFixed(2)}m</text>
    <text x="850" y="86" font-size="9.5" font-family="JetBrains Mono" fill="#34d399" text-anchor="end">${ppmRating}</text>

    <!-- Bottom HUD Bar -->
    <rect x="40" y="325" width="820" height="25" fill="#0f172a" stroke="#1e293b" rx="4"/>
    <text x="50" y="341" font-size="9" font-family="JetBrains Mono" fill="#94a3b8">HFOV: ${hfov}° | VFOV: ${vfov}° | SUBJECT FRAMING: ${frameType.toUpperCase().replace('_', ' ')}</text>
    <text x="850" y="341" font-size="9" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="end">AVIXA EN50132 SIGHTLINE CERTIFIED</text>
  </svg>`;
}

// ==========================================
// TAB 5: SPEAKER & MICROPHONE STUDIO (GRID SIZING & 3D ACOUSTIC INTERACTIVE)
// ==========================================
var currentSpkMicViewMode = '3D';
var spkMicOrbitAngle = 45;

function setSpkMicViewMode(mode) {
  currentSpkMicViewMode = mode;
  var btns = document.querySelectorAll('.btn-spkmic-view');
  btns.forEach(function(b) {
    if (b.getAttribute('data-view') === mode) {
      b.className = 'btn btn-warning active btn-spkmic-view';
    } else {
      b.className = 'btn btn-outline-light btn-spkmic-view';
    }
  });

  var badge = document.getElementById('spkMicCurrentViewBadge');
  if (badge) {
    if (mode === '3D') badge.innerText = '3D Realistic WebGL';
    else if (mode === '3D-svg') badge.innerText = '3D Isometric (SVG)';
    else if (mode === 'plan') badge.innerText = 'Ceiling Grid Plan View';
    else if (mode === 'elevation') badge.innerText = 'Elevation Section View';
  }

  calcSpeakerAndMicAll();
}

function onSpkMicOrbitSliderChange(val) {
  spkMicOrbitAngle = parseFloat(val) || 45;
  var disp = document.getElementById('spkMicOrbitValue');
  if (disp) disp.innerText = Math.round(spkMicOrbitAngle) + '°';
  if (threeSpkMicState.camera && threeSpkMicState.controls && currentSpkMicViewMode === '3D') {
    var rawL = parseFloat(document.getElementById('spkRoomLength')?.value) || 6000;
    var roomL = rawL > 50 ? rawL / 1000.0 : rawL;
    var rawW = parseFloat(document.getElementById('spkRoomWidth')?.value) || 4500;
    var roomW = rawW > 50 ? rawW / 1000.0 : rawW;
    var rawH = parseFloat(document.getElementById('spkRoomHeight')?.value) || 2700;
    var roomH = rawH > 50 ? rawH / 1000.0 : rawH;
    var dist = Math.max(roomL, roomW) * 1.35;
    var rad = (spkMicOrbitAngle * Math.PI) / 180.0;
    threeSpkMicState.camera.position.set(dist * Math.cos(rad), roomH * 1.5, dist * Math.sin(rad));
    threeSpkMicState.controls.target.set(0, roomH * 0.35, 0);
    threeSpkMicState.controls.update();
  } else if (currentSpkMicViewMode === '3D') {
    calcSpeakerAndMicAll();
  }
}

function syncSpkMicRoomDimensionsFromTab1() {
  var dMm = parseFloat(document.getElementById('depthMmInput')?.value) || 6000;
  var wMm = parseFloat(document.getElementById('widthMmInput')?.value) || 4500;
  var hMm = parseFloat(document.getElementById('roomHeightMmInput')?.value) || 2700;

  var lenEl = document.getElementById('spkRoomLength');
  var widEl = document.getElementById('spkRoomWidth');
  var heiEl = document.getElementById('spkRoomHeight');

  if (lenEl) lenEl.value = (dMm / 1000.0).toFixed(1);
  if (widEl) widEl.value = (wMm / 1000.0).toFixed(1);
  if (heiEl) heiEl.value = (hMm / 1000.0).toFixed(1);

  calcSpeakerAndMicAll();
}

function onSpkTypePresetChange() {
  var spkType = document.getElementById('spkTypeSelect')?.value || 'coaxial_ceiling';
  var sensEl = document.getElementById('spkSensInput');
  var pwrEl = document.getElementById('spkPowerInput');
  var coneEl = document.getElementById('spkConeAngleSelect');

  if (spkType === 'coaxial_ceiling') {
    if (sensEl) sensEl.value = 90;
    if (pwrEl) pwrEl.value = 30;
    if (coneEl) coneEl.value = '120';
  } else if (spkType === 'pendant') {
    if (sensEl) sensEl.value = 88;
    if (pwrEl) pwrEl.value = 35;
    if (coneEl) coneEl.value = '105';
  } else if (spkType === 'column_line') {
    if (sensEl) sensEl.value = 94;
    if (pwrEl) pwrEl.value = 60;
    if (coneEl) coneEl.value = '90';
  } else if (spkType === 'surface_box') {
    if (sensEl) sensEl.value = 89;
    if (pwrEl) pwrEl.value = 40;
    if (coneEl) coneEl.value = '90';
  } else if (spkType === 'point_source') {
    if (sensEl) sensEl.value = 97;
    if (pwrEl) pwrEl.value = 100;
    if (coneEl) coneEl.value = '60';
  }

  calcSpeakerAndMicAll();
}

function onSpkTapChange(val) {
  var lbl = document.getElementById('lblSpkTapValue');
  if (lbl) lbl.innerText = parseFloat(val).toFixed(1) + ' W';
  calcSpeakerStudio();
}

function onSpkHardwareModelChange() {
  var model = document.getElementById('spkHardwareModelSelect')?.value || 'bose_fs2c';
  var typeEl = document.getElementById('spkTypeSelect');
  var sensEl = document.getElementById('spkSensInput');
  var pwrEl = document.getElementById('spkPowerInput');
  var coneEl = document.getElementById('spkConeAngleSelect');
  var tapEl = document.getElementById('spkTapSelect');
  var lblTap = document.getElementById('lblSpkTapValue');

  if (model === 'bose_fs2c') {
    if (typeEl) typeEl.value = 'coaxial_ceiling';
    if (sensEl) sensEl.value = 84;
    if (pwrEl) pwrEl.value = 16;
    if (coneEl) coneEl.value = '140';
    if (tapEl) tapEl.value = '16';
    if (lblTap) lblTap.innerText = '16.0 W';
  } else if (model === 'bose_fs4ce') {
    if (typeEl) typeEl.value = 'coaxial_ceiling';
    if (sensEl) sensEl.value = 88;
    if (pwrEl) pwrEl.value = 40;
    if (coneEl) coneEl.value = '120';
    if (tapEl) tapEl.value = '40';
    if (lblTap) lblTap.innerText = '40.0 W';
  } else if (model === 'jbl_control26ct') {
    if (typeEl) typeEl.value = 'coaxial_ceiling';
    if (sensEl) sensEl.value = 89;
    if (pwrEl) pwrEl.value = 60;
    if (coneEl) coneEl.value = '110';
    if (tapEl) tapEl.value = '30';
    if (lblTap) lblTap.innerText = '30.0 W';
  } else if (model === 'jbl_control16ct') {
    if (typeEl) typeEl.value = 'coaxial_ceiling';
    if (sensEl) sensEl.value = 91;
    if (pwrEl) pwrEl.value = 50;
    if (coneEl) coneEl.value = '120';
    if (tapEl) tapEl.value = '30';
    if (lblTap) lblTap.innerText = '30.0 W';
  } else if (model === 'qsc_adc6t') {
    if (typeEl) typeEl.value = 'coaxial_ceiling';
    if (sensEl) sensEl.value = 89;
    if (pwrEl) pwrEl.value = 60;
    if (coneEl) coneEl.value = '105';
    if (tapEl) tapEl.value = '30';
    if (lblTap) lblTap.innerText = '30.0 W';
  } else if (model === 'genelec_4430a') {
    if (typeEl) typeEl.value = 'surface_box';
    if (sensEl) sensEl.value = 96;
    if (pwrEl) pwrEl.value = 50;
    if (coneEl) coneEl.value = '100';
    if (tapEl) tapEl.value = '60';
    if (lblTap) lblTap.innerText = '60.0 W';
  } else if (model === 'tannoy_cvs6') {
    if (typeEl) typeEl.value = 'coaxial_ceiling';
    if (sensEl) sensEl.value = 91;
    if (pwrEl) pwrEl.value = 60;
    if (coneEl) coneEl.value = '90';
    if (tapEl) tapEl.value = '30';
    if (lblTap) lblTap.innerText = '30.0 W';
  } else if (model === 'yamaha_vxc6') {
    if (typeEl) typeEl.value = 'coaxial_ceiling';
    if (sensEl) sensEl.value = 88;
    if (pwrEl) pwrEl.value = 60;
    if (coneEl) coneEl.value = '110';
    if (tapEl) tapEl.value = '30';
    if (lblTap) lblTap.innerText = '30.0 W';
  }

  calcSpeakerStudio();
}

function resetSpkMicCameraIso() {
  if (threeSpkMicState.camera && threeSpkMicState.controls) {
    var rawL = parseFloat(document.getElementById('spkRoomLength')?.value) || 6000;
    var roomL = rawL > 50 ? rawL / 1000.0 : rawL;
    var rawW = parseFloat(document.getElementById('spkRoomWidth')?.value) || 4500;
    var roomW = rawW > 50 ? rawW / 1000.0 : rawW;
    var rawH = parseFloat(document.getElementById('spkRoomHeight')?.value) || 2700;
    var roomH = rawH > 50 ? rawH / 1000.0 : rawH;
    var dist = Math.max(roomL, roomW) * 1.35;
    threeSpkMicState.camera.position.set(dist * 0.85, roomH * 1.5, dist * 0.95);
    threeSpkMicState.controls.target.set(0, roomH * 0.35, 0);
    threeSpkMicState.controls.update();
  }
}

function setSpkMicCameraTop() {
  if (threeSpkMicState.camera && threeSpkMicState.controls) {
    var rawL = parseFloat(document.getElementById('spkRoomLength')?.value) || 6000;
    var roomL = rawL > 50 ? rawL / 1000.0 : rawL;
    var rawW = parseFloat(document.getElementById('spkRoomWidth')?.value) || 4500;
    var roomW = rawW > 50 ? rawW / 1000.0 : rawW;
    var dist = Math.max(roomL, roomW) * 1.4;
    threeSpkMicState.camera.position.set(0.001, dist * 1.8, 0);
    threeSpkMicState.controls.target.set(0, 0, 0);
    threeSpkMicState.controls.update();
  }
}

function setSpkMicCameraSide() {
  if (threeSpkMicState.camera && threeSpkMicState.controls) {
    var rawL = parseFloat(document.getElementById('spkRoomLength')?.value) || 6000;
    var roomL = rawL > 50 ? rawL / 1000.0 : rawL;
    var rawH = parseFloat(document.getElementById('spkRoomHeight')?.value) || 2700;
    var roomH = rawH > 50 ? rawH / 1000.0 : rawH;
    var dist = roomL * 1.6;
    threeSpkMicState.camera.position.set(dist, roomH * 0.5, 0);
    threeSpkMicState.controls.target.set(0, roomH * 0.45, 0);
    threeSpkMicState.controls.update();
  }
}

function onMicTypePresetChange() {
  var micType = document.getElementById('micTypeSelect')?.value || 'ceiling_array';
  var patternEl = document.getElementById('micPatternSelect');
  var sensEl = document.getElementById('micSensInput');
  var rt60El = document.getElementById('micRt60Input');

  if (micType === 'ceiling_array') {
    if (patternEl) patternEl.value = 'beamforming';
    if (sensEl) sensEl.value = 25;
    if (rt60El) rt60El.value = 0.55;
  } else if (micType === 'table_boundary') {
    if (patternEl) patternEl.value = 'cardioid';
    if (sensEl) sensEl.value = 20;
    if (rt60El) rt60El.value = 0.60;
  } else if (micType === 'table_gooseneck') {
    if (patternEl) patternEl.value = 'supercardioid';
    if (sensEl) sensEl.value = 30;
    if (rt60El) rt60El.value = 0.65;
  } else if (micType === 'wireless_handheld') {
    if (patternEl) patternEl.value = 'cardioid';
    if (sensEl) sensEl.value = 15;
    if (rt60El) rt60El.value = 0.70;
  } else if (micType === 'shotgun_stage') {
    if (patternEl) patternEl.value = 'supercardioid';
    if (sensEl) sensEl.value = 35;
    if (rt60El) rt60El.value = 0.50;
  }

  var badgeMicDir = document.getElementById('badgeMicThrowDirection');
  var txtMicExp = document.getElementById('txtMicThrowExplanation');
  if (micType === 'ceiling_array') {
    if (badgeMicDir) {
      badgeMicDir.className = 'badge bg-success text-white';
      badgeMicDir.innerHTML = '<i class="fa-solid fa-arrow-down me-1"></i>MIC CAPTURE: DOWNWARDS (CEILING ARRAY)';
    }
    if (txtMicExp) {
      txtMicExp.innerText = 'Ceiling tile steered lobes project downward into the room toward conference table talkers.';
    }
  } else {
    if (badgeMicDir) {
      badgeMicDir.className = 'badge bg-info text-dark';
      badgeMicDir.innerHTML = '<i class="fa-solid fa-arrow-up me-1"></i>MIC CAPTURE: UPWARDS (TABLETOP MIC)';
    }
    if (txtMicExp) {
      txtMicExp.innerText = 'Tabletop mic pods sit on table (0.75m AFF) and capture upwards toward seated talkers\' mouths/ears (1.2m AFF).';
    }
  }

  calcSpeakerAndMicAll();
}

function onMicHardwareModelChange() {
  var model = document.getElementById('micHardwareModelSelect')?.value || 'mxa920';
  var typeEl = document.getElementById('micTypeSelect');
  var patternEl = document.getElementById('micPatternSelect');
  var sensEl = document.getElementById('micSensInput');
  var mountEl = document.getElementById('micMountMethodSelect');
  var talkerRange = document.getElementById('micTalkerDistRange');
  var talkerInput = document.getElementById('micTalkerDistInput');
  var lblTalker = document.getElementById('lblMicTalkerDist');

  if (model === 'mxa920') {
    if (typeEl) typeEl.value = 'ceiling_array';
    if (patternEl) patternEl.value = 'beamforming';
    if (sensEl) sensEl.value = 25;
    if (mountEl) mountEl.value = 'ceiling_flush';
    if (talkerRange) talkerRange.value = 1.8;
    if (talkerInput) talkerInput.value = 1.8;
    if (lblTalker) lblTalker.innerText = '1.8 m';
  } else if (model === 'tcc2') {
    if (typeEl) typeEl.value = 'ceiling_array';
    if (patternEl) patternEl.value = 'beamforming';
    if (sensEl) sensEl.value = 28;
    if (mountEl) mountEl.value = 'ceiling_flush';
    if (talkerRange) talkerRange.value = 1.8;
    if (talkerInput) talkerInput.value = 1.8;
    if (lblTalker) lblTalker.innerText = '1.8 m';
  } else if (model === 'tcmx') {
    if (typeEl) typeEl.value = 'ceiling_array';
    if (patternEl) patternEl.value = 'beamforming';
    if (sensEl) sensEl.value = 24;
    if (mountEl) mountEl.value = 'ceiling_flush';
    if (talkerRange) talkerRange.value = 1.7;
    if (talkerInput) talkerInput.value = 1.7;
    if (lblTalker) lblTalker.innerText = '1.7 m';
  } else if (model === 'rmcg') {
    if (typeEl) typeEl.value = 'ceiling_array';
    if (patternEl) patternEl.value = 'beamforming';
    if (sensEl) sensEl.value = 22;
    if (mountEl) mountEl.value = 'ceiling_flush';
    if (talkerRange) talkerRange.value = 1.8;
    if (talkerInput) talkerInput.value = 1.8;
    if (lblTalker) lblTalker.innerText = '1.8 m';
  } else if (model === 'atnd1061') {
    if (typeEl) typeEl.value = 'ceiling_array';
    if (patternEl) patternEl.value = 'beamforming';
    if (sensEl) sensEl.value = 26;
    if (mountEl) mountEl.value = 'ceiling_flush';
    if (talkerRange) talkerRange.value = 1.8;
    if (talkerInput) talkerInput.value = 1.8;
    if (lblTalker) lblTalker.innerText = '1.8 m';
  } else if (model === 'stem_ceiling') {
    if (typeEl) typeEl.value = 'ceiling_array';
    if (patternEl) patternEl.value = 'beamforming';
    if (sensEl) sensEl.value = 20;
    if (mountEl) mountEl.value = 'ceiling_pendant';
    if (talkerRange) talkerRange.value = 1.5;
    if (talkerInput) talkerInput.value = 1.5;
    if (lblTalker) lblTalker.innerText = '1.5 m';
  } else if (model === 'rally_pod') {
    if (typeEl) typeEl.value = 'table_boundary';
    if (patternEl) patternEl.value = 'cardioid';
    if (sensEl) sensEl.value = 18;
    if (mountEl) mountEl.value = 'table_surface';
    if (talkerRange) talkerRange.value = 0.9;
    if (talkerInput) talkerInput.value = 0.9;
    if (lblTalker) lblTalker.innerText = '0.9 m';
  } else if (model === 'mx418') {
    if (typeEl) typeEl.value = 'table_gooseneck';
    if (patternEl) patternEl.value = 'supercardioid';
    if (sensEl) sensEl.value = 32;
    if (mountEl) mountEl.value = 'table_gooseneck';
    if (talkerRange) talkerRange.value = 0.45;
    if (talkerInput) talkerInput.value = 0.45;
    if (lblTalker) lblTalker.innerText = '0.45 m';
  }

  calcMicrophoneStudio();
}

function onMicTalkerDistChange(val) {
  var num = parseFloat(val) || 1.8;
  var rangeEl = document.getElementById('micTalkerDistRange');
  var inputEl = document.getElementById('micTalkerDistInput');
  var lblEl = document.getElementById('lblMicTalkerDist');
  if (rangeEl) rangeEl.value = num;
  if (inputEl) inputEl.value = num;
  if (lblEl) lblEl.innerText = num.toFixed(1) + ' m';
  calcSpeakerAndMicAll();
}

// Tab 5 Custom Speaker Grid Layout & Acoustic Constraints State
var spkGridState = {
  mode: 'auto', // 'auto' (AVIXA Recommended) or 'manual' (Custom Grid)
  manualCols: 2,
  manualRows: 2,
  enforceConstraints: true // Maintain acoustic coverage constraints
};

function toggleEnforceAcousticConstraints(checked) {
  spkGridState.enforceConstraints = checked;
  var badge = document.getElementById('badgeConstraintStatus');
  if (badge) {
    if (checked) {
      badge.className = 'badge bg-success-subtle text-success border border-success font-mono';
      badge.innerHTML = '<i class="fa-solid fa-lock me-1"></i>Lock to Avoid Dead Zones';
    } else {
      badge.className = 'badge bg-warning-subtle text-warning border border-warning font-mono';
      badge.innerHTML = '<i class="fa-solid fa-unlock me-1"></i>Unconstrained (Manual)';
    }
  }
  calcSpeakerStudio();
}

function setSpkGridMode(mode) {
  spkGridState.mode = mode;
  var btnAuto = document.getElementById('btnSpkGridAuto');
  var btnManual = document.getElementById('btnSpkGridManual');

  if (mode === 'manual') {
    if (btnAuto) { btnAuto.classList.remove('btn-primary', 'active'); btnAuto.classList.add('btn-outline-primary'); }
    if (btnManual) { btnManual.classList.remove('btn-outline-primary'); btnManual.classList.add('btn-primary', 'active'); }
  } else {
    if (btnAuto) { btnAuto.classList.remove('btn-outline-primary'); btnAuto.classList.add('btn-primary', 'active'); }
    if (btnManual) { btnManual.classList.remove('btn-primary', 'active'); btnManual.classList.add('btn-outline-primary'); }
  }
  calcSpeakerStudio();
}

function onSpkManualGridChange(fromSource) {
  var rangeC = document.getElementById('spkManualColsRange');
  var inputC = document.getElementById('spkManualColsInput');
  var rangeR = document.getElementById('spkManualRowsRange');
  var inputR = document.getElementById('spkManualRowsInput');

  var c = parseInt(fromSource === 'input' ? inputC?.value : rangeC?.value) || 2;
  var r = parseInt(fromSource === 'input' ? inputR?.value : rangeR?.value) || 2;

  // If acoustic constraints are enforced, clamp to minimum columns and rows required to avoid dead zones
  if (spkGridState.enforceConstraints) {
    var rawL = parseFloat(document.getElementById('spkRoomLength')?.value) || 6000;
    var rawW = parseFloat(document.getElementById('spkRoomWidth')?.value) || 4500;
    var rawH = parseFloat(document.getElementById('spkRoomHeight')?.value) || 2700;
    var rawEar = parseFloat(document.getElementById('spkListenerEarHt')?.value) || 1200;
    var roomL = rawL > 50 ? rawL / 1000.0 : rawL;
    var roomW = rawW > 50 ? rawW / 1000.0 : rawW;
    var roomH = rawH > 50 ? rawH / 1000.0 : rawH;
    var earH = rawEar > 50 ? rawEar / 1000.0 : rawEar;
    var coneDeg = parseFloat(document.getElementById('spkConeAngleSelect')?.value) || 120;
    var throwDist = Math.max(0.6, roomH - earH);
    var covDiameter = 2.0 * throwDist * Math.tan((coneDeg * Math.PI) / 360.0);
    var minCols = Math.max(1, Math.ceil(roomL / covDiameter));
    var minRows = Math.max(1, Math.ceil(roomW / covDiameter));
    c = Math.max(minCols, c);
    r = Math.max(minRows, r);
  }

  spkGridState.manualCols = Math.max(1, Math.min(16, c));
  spkGridState.manualRows = Math.max(1, Math.min(16, r));

  if (rangeC) rangeC.value = spkGridState.manualCols;
  if (inputC) inputC.value = spkGridState.manualCols;
  if (rangeR) rangeR.value = spkGridState.manualRows;
  if (inputR) inputR.value = spkGridState.manualRows;
  var lc = document.getElementById('lblSpkCols'); if (lc) lc.innerText = spkGridState.manualCols;
  var lr = document.getElementById('lblSpkRows'); if (lr) lr.innerText = spkGridState.manualRows;

  if (spkGridState.mode !== 'manual') {
    setSpkGridMode('manual');
  } else {
    calcSpeakerStudio();
  }
}

function stepSpkGrid(axis, delta) {
  var rawL = parseFloat(document.getElementById('spkRoomLength')?.value) || 6000;
  var rawW = parseFloat(document.getElementById('spkRoomWidth')?.value) || 4500;
  var rawH = parseFloat(document.getElementById('spkRoomHeight')?.value) || 2700;
  var rawEar = parseFloat(document.getElementById('spkListenerEarHt')?.value) || 1200;
  var roomL = rawL > 50 ? rawL / 1000.0 : rawL;
  var roomW = rawW > 50 ? rawW / 1000.0 : rawW;
  var roomH = rawH > 50 ? rawH / 1000.0 : rawH;
  var earH = rawEar > 50 ? rawEar / 1000.0 : rawEar;
  var coneDeg = parseFloat(document.getElementById('spkConeAngleSelect')?.value) || 120;
  var throwDist = Math.max(0.6, roomH - earH);
  var covDiameter = 2.0 * throwDist * Math.tan((coneDeg * Math.PI) / 360.0);
  var minCols = Math.max(1, Math.ceil(roomL / covDiameter));
  var minRows = Math.max(1, Math.ceil(roomW / covDiameter));

  if (axis === 'cols') {
    var c = (spkGridState.manualCols || 2) + delta;
    if (spkGridState.enforceConstraints) {
      c = Math.max(minCols, c);
    }
    c = Math.max(1, Math.min(16, c));
    spkGridState.manualCols = c;
    var inp = document.getElementById('spkManualColsRange'); if (inp) inp.value = c;
    var inpNum = document.getElementById('spkManualColsInput'); if (inpNum) inpNum.value = c;
    var lc = document.getElementById('lblSpkCols'); if (lc) lc.innerText = c;
  } else {
    var r = (spkGridState.manualRows || 2) + delta;
    if (spkGridState.enforceConstraints) {
      r = Math.max(minRows, r);
    }
    r = Math.max(1, Math.min(16, r));
    spkGridState.manualRows = r;
    var inpR = document.getElementById('spkManualRowsRange'); if (inpR) inpR.value = r;
    var inpRNum = document.getElementById('spkManualRowsInput'); if (inpRNum) inpRNum.value = r;
    var lr = document.getElementById('lblSpkRows'); if (lr) lr.innerText = r;
  }

  if (spkGridState.mode !== 'manual') {
    setSpkGridMode('manual');
  } else {
    calcSpeakerStudio();
  }
}

function applySpkGridPreset(cols, rows) {
  setSpkGridMode('manual');
  spkGridState.manualCols = cols;
  spkGridState.manualRows = rows;
  var ic = document.getElementById('spkManualColsRange'); if (ic) ic.value = cols;
  var icNum = document.getElementById('spkManualColsInput'); if (icNum) icNum.value = cols;
  var ir = document.getElementById('spkManualRowsRange'); if (ir) ir.value = rows;
  var irNum = document.getElementById('spkManualRowsInput'); if (irNum) irNum.value = rows;
  var lc = document.getElementById('lblSpkCols'); if (lc) lc.innerText = cols;
  var lr = document.getElementById('lblSpkRows'); if (lr) lr.innerText = rows;
  calcSpeakerStudio();
}

function autoFixSpkConstraints(recCols, recRows) {
  applySpkGridPreset(recCols, recRows);
}

// Synchronize SPL Heatmap Checkboxes
function syncSplCheckbox(checked) {
  var chk1 = document.getElementById('chkShowSplHeatmap');
  var chk2 = document.getElementById('chkShowSplHeatmapTop');
  if (chk1) chk1.checked = checked;
  if (chk2) chk2.checked = checked;
  calcSpeakerAndMicAll();
}

// Microphones In-Use State & Toggle
var micInUseState = true;

function toggleMicInUse(checked) {
  micInUseState = checked;
  var badge = document.getElementById('badgeMicActiveState');
  var micSelect = document.getElementById('micTypeSelect');
  var patternSelect = document.getElementById('micPatternSelect');
  var sensInput = document.getElementById('micSensInput');
  var rt60Input = document.getElementById('micRt60Input');

  if (badge) {
    if (checked) {
      badge.className = 'badge bg-success font-mono';
      badge.innerText = 'Microphones Active';
    } else {
      badge.className = 'badge bg-secondary font-mono';
      badge.innerText = 'Microphones Bypassed (Not in Use)';
    }
  }

  [micSelect, patternSelect, sensInput, rt60Input].forEach(function(el) {
    if (el) el.disabled = !checked;
  });

  calcMicrophoneStudio();
  calcSpeakerStudio();
}

// Master Speaker & Mic Runner
function calcSpeakerAndMicAll() {
  calcMicrophoneStudio();
  calcSpeakerStudio();
}

function calcSpeakerStudio() {
  var rawL = parseFloat(document.getElementById('spkRoomLength')?.value) || 6000;
  var rawW = parseFloat(document.getElementById('spkRoomWidth')?.value) || 4500;
  var rawH = parseFloat(document.getElementById('spkRoomHeight')?.value) || 2700;
  var rawEar = parseFloat(document.getElementById('spkListenerEarHt')?.value) || 1200;

  // Support inputs entered in either mm (e.g. 6000) or meters (e.g. 6.0)
  var roomL = rawL > 50 ? rawL / 1000.0 : rawL;
  var roomW = rawW > 50 ? rawW / 1000.0 : rawW;
  var roomH = rawH > 50 ? rawH / 1000.0 : rawH;
  var earH = rawEar > 50 ? rawEar / 1000.0 : rawEar;

  var sens = parseFloat(document.getElementById('spkSensInput')?.value) || 90;
  var pwr = parseFloat(document.getElementById('spkPowerInput')?.value) || 30;
  var coneDeg = parseFloat(document.getElementById('spkConeAngleSelect')?.value) || 120;
  var overlap = document.getElementById('spkOverlapSelect')?.value || 'min_overlap';

  // Vertical throw distance to listener ear plane
  var throwDist = Math.max(0.6, roomH - earH);

  // Single speaker coverage diameter at ear plane
  var radCone = (coneDeg * Math.PI) / 360.0;
  var covDiameter = 2.0 * throwDist * Math.tan(radCone);
  var covRadius = covDiameter / 2.0;
  var singleArea = Math.PI * covRadius * covRadius;

  // Overlap spacing factor
  var kSpacing = 0.85; // min overlap
  if (overlap === 'edge_to_edge') kSpacing = 0.707;
  else if (overlap === 'edge_to_center') kSpacing = 0.50;

  var maxSpacing = Math.max(1.0, covDiameter * kSpacing);

  // Auto-calculated AVIXA recommended columns along Length, rows along Width
  var autoCols = Math.max(1, Math.ceil(roomL / maxSpacing));
  var autoRows = Math.max(1, Math.ceil(roomW / maxSpacing));

  var numCols = autoCols;
  var numRows = autoRows;

  if (spkGridState.mode === 'manual') {
    numCols = Math.max(1, spkGridState.manualCols || 2);
    numRows = Math.max(1, spkGridState.manualRows || 2);
    if (spkGridState.enforceConstraints) {
      var minCols = Math.max(1, Math.ceil(roomL / covDiameter));
      var minRows = Math.max(1, Math.ceil(roomW / covDiameter));
      if (numCols < minCols) { numCols = minCols; spkGridState.manualCols = minCols; }
      if (numRows < minRows) { numRows = minRows; spkGridState.manualRows = minRows; }
    }
    var ic = document.getElementById('spkManualColsRange'); if (ic) ic.value = numCols;
    var icNum = document.getElementById('spkManualColsInput'); if (icNum) icNum.value = numCols;
    var ir = document.getElementById('spkManualRowsRange'); if (ir) ir.value = numRows;
    var irNum = document.getElementById('spkManualRowsInput'); if (irNum) irNum.value = numRows;
    var lc = document.getElementById('lblSpkCols'); if (lc) lc.innerText = numCols;
    var lr = document.getElementById('lblSpkRows'); if (lr) lr.innerText = numRows;
  } else {
    spkGridState.manualCols = autoCols;
    spkGridState.manualRows = autoRows;
    var ic = document.getElementById('spkManualColsRange'); if (ic) ic.value = autoCols;
    var icNum = document.getElementById('spkManualColsInput'); if (icNum) icNum.value = autoCols;
    var ir = document.getElementById('spkManualRowsRange'); if (ir) ir.value = autoRows;
    var irNum = document.getElementById('spkManualRowsInput'); if (irNum) irNum.value = autoRows;
    var lc = document.getElementById('lblSpkCols'); if (lc) lc.innerText = autoCols;
    var lr = document.getElementById('lblSpkRows'); if (lr) lr.innerText = autoRows;
  }

  var totalSpeakers = numCols * numRows;
  var actualSpacingX = roomL / numCols;
  var actualSpacingY = roomW / numRows;
  var maxActualSpacing = Math.max(actualSpacingX, actualSpacingY);

  // Update spacing info feedback badges
  var colSpacingEl = document.getElementById('spkColSpacingInfo');
  var rowSpacingEl = document.getElementById('spkRowSpacingInfo');
  if (colSpacingEl) {
    colSpacingEl.innerHTML = `Spacing: <strong>${actualSpacingX.toFixed(2)}m</strong> <span class="text-muted">(Max: ${covDiameter.toFixed(2)}m)</span>`;
  }
  if (rowSpacingEl) {
    rowSpacingEl.innerHTML = `Spacing: <strong>${actualSpacingY.toFixed(2)}m</strong> <span class="text-muted">(Max: ${covDiameter.toFixed(2)}m)</span>`;
  }

  // Coverage percentage
  var roomArea = roomL * roomW;
  var effectiveCoveredArea = Math.min(roomArea, totalSpeakers * singleArea * 0.78);
  var covPct = Math.min(100, Math.round((effectiveCoveredArea / roomArea) * 100));

  // Max SPL at 1m and at listener ear
  var spl1m = sens + 10.0 * Math.log10(Math.max(1, pwr));
  var earSpl = spl1m - 20.0 * Math.log10(throwDist);
  var maxThrowTo85 = Math.pow(10.0, (spl1m - 85.0) / 20.0);

  // Constraint Verification Engine
  var isDeadZone = (maxActualSpacing > covDiameter);
  var overlapRatio = Math.max(0, 1.0 - (maxActualSpacing / covDiameter));
  var overlapPct = Math.round(overlapRatio * 100);

  var alertEl = document.getElementById('spkConstraintAlert');
  if (alertEl) {
    if (isDeadZone) {
      var gapM = (maxActualSpacing - covDiameter).toFixed(2);
      alertEl.className = 'p-2 rounded font-mono small d-flex justify-content-between align-items-center flex-wrap gap-2 bg-danger-subtle border border-danger text-danger';
      alertEl.innerHTML = `<div>
        <i class="fa-solid fa-triangle-exclamation me-1"></i>
        <strong>CONSTRAINT VIOLATION: Dead Zones Detected!</strong><br>
        <span style="font-size:0.7rem;">Max spacing (${maxActualSpacing.toFixed(2)}m) exceeds coverage cone (${covDiameter.toFixed(2)}m) by +${gapM}m. Speech intelligibility drop-off &gt;6 dB.</span>
      </div>
      <button type="button" class="btn btn-sm btn-danger fw-bold" onclick="autoFixSpkConstraints(${autoCols}, ${autoRows})">
        <i class="fa-solid fa-wand-magic-sparkles me-1"></i>Auto-Fix (${autoCols}&times;${autoRows})
      </button>`;
    } else if (maxActualSpacing <= covDiameter * 0.707) {
      alertEl.className = 'p-2 rounded font-mono small d-flex justify-content-between align-items-center flex-wrap gap-2 bg-success-subtle border border-success text-success';
      alertEl.innerHTML = `<div>
        <i class="fa-solid fa-circle-check me-1"></i>
        <strong>CONSTRAINT SATISFIED: Edge-to-Edge Overlap (${overlapPct}%)</strong><br>
        <span style="font-size:0.7rem;">AVIXA Class 1 Uniformity (&plusmn;1.5 dB). Zero dead zones across entire seating plane.</span>
      </div>
      <span class="badge bg-success font-mono">AVIXA Class 1</span>`;
    } else if (maxActualSpacing <= covDiameter * 0.85) {
      alertEl.className = 'p-2 rounded font-mono small d-flex justify-content-between align-items-center flex-wrap gap-2 bg-primary-subtle border border-primary text-primary';
      alertEl.innerHTML = `<div>
        <i class="fa-solid fa-circle-check me-1"></i>
        <strong>CONSTRAINT SATISFIED: Standard Overlap (${overlapPct}%)</strong><br>
        <span style="font-size:0.7rem;">AVIXA Class 2 Uniformity (&plusmn;3.0 dB). Even voice intelligibility across listener plane.</span>
      </div>
      <span class="badge bg-primary font-mono">AVIXA Class 2</span>`;
    } else {
      alertEl.className = 'p-2 rounded font-mono small d-flex justify-content-between align-items-center flex-wrap gap-2 bg-warning-subtle border border-warning text-dark';
      alertEl.innerHTML = `<div>
        <i class="fa-solid fa-triangle-exclamation text-warning me-1"></i>
        <strong>MARGINAL CONSTRAINT: Low Overlap (${overlapPct}%)</strong><br>
        <span style="font-size:0.7rem;">Perimeter coverage is minimal. Recommend wider dispersion speaker (120&deg;) or adding 1 column.</span>
      </div>
      <button type="button" class="btn btn-sm btn-outline-dark fw-bold py-0" onclick="autoFixSpkConstraints(${autoCols}, ${autoRows})">
        Auto-Optimize
      </button>`;
    }
  }

  // Update UI Elements & Recommendation Badges
  var setTxt = function(id, val) { var e = document.getElementById(id); if (e) e.innerText = val; };
  setTxt('badgeSpkCountHeader', totalSpeakers + ' Speakers Required');
  setTxt('resSpkCountTotal', totalSpeakers + ' Units (' + numCols + ' × ' + numRows + ' Grid)');
  setTxt('resSpkDiameter', covDiameter.toFixed(2) + ' m (' + Math.round(covDiameter * 1000) + ' mm)');
  setTxt('resSpkSpacing', actualSpacingX.toFixed(2) + 'm × ' + actualSpacingY.toFixed(2) + 'm (' + Math.round(actualSpacingX*1000) + '×' + Math.round(actualSpacingY*1000) + ' mm)');
  setTxt('resSpkCoveragePct', covPct + '% Covered');
  setTxt('resSpkCoveredArea', effectiveCoveredArea.toFixed(1) + ' m² Area');
  setTxt('resSpkMaxThrow', maxThrowTo85.toFixed(2) + ' m');
  setTxt('resSpkEarSpl', earSpl.toFixed(1) + ' dBA');

  // Pro Loudspeaker Model & Electrical Load Calculation
  var tapW = parseFloat(document.getElementById('spkTapSelect')?.value) || 16.0;
  var tapEl = document.getElementById('lblSpkTapValue');
  if (tapEl) tapEl.innerText = tapW.toFixed(1) + ' W';

  var headroomDb = parseFloat(document.getElementById('spkHeadroomSelect')?.value) || 3.0;
  var totalLoadWatts = totalSpeakers * tapW;
  var recAmpWatts = Math.round(totalLoadWatts * (headroomDb === 3 ? 1.4 : (headroomDb === 6 ? 2.0 : 2.5)));

  // STIPA Speech Intelligibility Index Prediction
  var rt60Val = parseFloat(document.getElementById('micRt60Input')?.value) || 0.55;
  var stiScore = Math.min(0.96, Math.max(0.45, 1.05 - 0.35 * rt60Val - 0.08 * Math.max(0, 85 - earSpl) / 10.0));
  var cisScore = Math.min(1.0, Math.max(0.3, (stiScore - 0.4) / 0.55 * 0.5 + 0.5));

  setTxt('metricSpkTotalWatts', Math.round(totalLoadWatts) + ' W');
  setTxt('metricSpkRecAmp', recAmpWatts + ' W');
  setTxt('metricSpkUniformity', isDeadZone ? '±4.5 dB (Uneven)' : (overlapPct >= 29 ? '±1.2 dB (AVIXA A102)' : '±2.5 dB (Class 2)'));
  setTxt('metricSpkCisIndex', cisScore.toFixed(2));
  var stiBadge = document.getElementById('badgeSpkStiRating');
  if (stiBadge) stiBadge.innerText = 'STI: ' + stiScore.toFixed(2) + ' (' + (stiScore >= 0.75 ? 'Class A' : 'Class B') + ')';

  // Dynamic automatic recommendation summary for speakers based on room size & specs
  var spkAdviceEl = document.getElementById('spkRecAdviceBadge');
  if (spkAdviceEl) {
    spkAdviceEl.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles me-1 text-primary"></i><strong>AVIXA Recommended:</strong> ${autoCols * autoRows} Speakers (${autoCols} &times; ${autoRows} Grid) for ${Math.round(roomL*1000)} &times; ${Math.round(roomW*1000)} mm room with ${coneDeg}&deg; dispersion`;
  }

  renderSpkMicCombinedVisualizer(roomL, roomW, roomH, earH, totalSpeakers, numCols, numRows, actualSpacingX, actualSpacingY, covRadius, spl1m);
  renderSpkCoverageOverlapChart(roomL, roomW, roomH, earH, coneDeg, numCols, numRows, covDiameter, overlapPct);
}

function getEffectiveMicCount(tableL, roomL, participants, micType) {
  var isMicInUse = (document.getElementById('chkMicInUse')?.checked !== false) && micInUseState;
  if (!isMicInUse) return 0;

  var mode = document.getElementById('spkMicAutoCountMode')?.value || 'auto';
  if (mode === 'manual') {
    var man = parseInt(document.getElementById('spkMicManualCountInput')?.value);
    if (!isNaN(man) && man >= 1) return Math.min(12, man);
  }

  // Automatic calculation
  if (micType === 'ceiling_array') {
    if (tableL > 9.0 || roomL > 12.0) return 3;
    if (tableL > 5.2 || roomL > 8.0) return 2;
    return 1;
  } else if (micType === 'table_boundary') {
    return Math.max(1, Math.min(6, Math.ceil(tableL / 1.8)));
  } else if (micType === 'table_gooseneck') {
    return Math.max(2, Math.min(16, Math.ceil(participants / 2)));
  } else if (micType === 'wireless_handheld') {
    return Math.max(1, Math.min(4, Math.ceil(participants / 15)));
  } else {
    return Math.max(1, Math.min(4, Math.ceil(roomL / 4.0)));
  }
}
window.getEffectiveMicCount = getEffectiveMicCount;

function onSpkMicCountModeChange() {
  var mode = document.getElementById('spkMicAutoCountMode')?.value || 'auto';
  var inp = document.getElementById('spkMicManualCountInput');
  var badge = document.getElementById('spkMicQuantityBadge');
  if (inp) inp.disabled = (mode !== 'manual');
  if (badge) badge.innerText = (mode === 'manual') ? 'Manual Override' : 'Auto Sized';
  calcSpeakerAndMicAll();
}
window.onSpkMicCountModeChange = onSpkMicCountModeChange;

function calcMicrophoneStudio() {
  var isMicInUse = (document.getElementById('chkMicInUse')?.checked !== false) && micInUseState;

  var rawL = parseFloat(document.getElementById('spkRoomLength')?.value) || 6000;
  var rawW = parseFloat(document.getElementById('spkRoomWidth')?.value) || 4500;
  var rawH = parseFloat(document.getElementById('spkRoomHeight')?.value) || 2700;
  var rawTable = parseFloat(document.getElementById('spkTableLength')?.value) || 4000;
  var participants = parseInt(document.getElementById('spkParticipantsCount')?.value) || 10;

  var roomL = rawL > 50 ? rawL / 1000.0 : rawL;
  var roomW = rawW > 50 ? rawW / 1000.0 : rawW;
  var roomH = rawH > 50 ? rawH / 1000.0 : rawH;
  var tableL = rawTable > 50 ? rawTable / 1000.0 : rawTable;

  var micType = document.getElementById('micTypeSelect')?.value || 'ceiling_array';
  var pattern = document.getElementById('micPatternSelect')?.value || 'beamforming';
  var rt60 = parseFloat(document.getElementById('micRt60Input')?.value) || 0.55;

  var setTxt = function(id, val) { var e = document.getElementById(id); if (e) e.innerText = val; };

  if (!isMicInUse) {
    setTxt('badgeMicCountHeader', '0 Mics (Not in Use)');
    setTxt('resMicCountTotal', 'Bypassed - Sound Reinforcement Only');
    setTxt('resMicCaptureRadius', 'N/A');
    setTxt('resMicCaptureZone', 'No Mic Capture Required');
    setTxt('resMicCritDist', 'N/A');
    setTxt('resMicCoveragePct', '0% (Mics Disabled)');
    setTxt('resMicPickupArea', '0 m²');
    setTxt('resMicDirectivityQ', 'N/A (Playback Only)');
    setTxt('resMicPlacementAdvice', 'Playback / Sound Reinforcement Only');

    var micAdviceEl = document.getElementById('micRecAdviceBadge');
    if (micAdviceEl) {
      micAdviceEl.innerHTML = `<i class="fa-solid fa-ban me-1 text-secondary"></i><strong>Microphones Bypassed:</strong> Room configured for local audio playback/reinforcement only.`;
    }
    return;
  }

  // Dynamic automatic recommendation based on room size, table length & participant count
  var roomVol = roomL * roomW * roomH;
  var critDist = 0.057 * Math.sqrt(roomVol / Math.max(0.1, rt60));

  var directivityQ = 2.8;
  if (pattern === 'supercardioid') directivityQ = 3.5;
  else if (pattern === 'cardioid') directivityQ = 2.0;
  else if (pattern === 'omni') directivityQ = 1.0;

  var captureRadius = 3.8;
  var micLabel = 'Array Tile';
  var placement = 'Centered Over Conference Table';

  if (micType === 'ceiling_array') {
    captureRadius = 4.0;
    micLabel = 'Array Tile (MXA920/TCC2)';
  } else if (micType === 'table_boundary') {
    captureRadius = 1.8;
    micLabel = 'Boundary Pod';
  } else if (micType === 'table_gooseneck') {
    captureRadius = 0.8;
    micLabel = 'Gooseneck Mic';
  } else if (micType === 'wireless_handheld') {
    captureRadius = 0.4;
    micLabel = 'Wireless Channel';
  } else {
    captureRadius = 2.5;
    micLabel = 'Shotgun Mic';
  }

  var numMics = getEffectiveMicCount(tableL, roomL, participants, micType);
  var manInp = document.getElementById('spkMicManualCountInput');
  if (manInp && document.getElementById('spkMicAutoCountMode')?.value !== 'manual') {
    manInp.value = numMics;
  }

  placement = numMics === 1 ? 'Centered Over Conference Table' : numMics + ' Units Equidistant Along Table Centerline';

  var pickupArea = Math.PI * captureRadius * captureRadius * numMics;
  var tableCoveragePct = 100;

  setTxt('badgeMicCountHeader', numMics + ' ' + (numMics > 1 ? 'Units' : 'Unit') + ' Required');
  setTxt('resMicCountTotal', numMics + ' ' + micLabel);
  setTxt('resMicCaptureRadius', captureRadius.toFixed(2) + ' m');
  setTxt('resMicCaptureZone', (captureRadius * 2.0).toFixed(1) + 'm Pickup Zone');
  setTxt('resMicCritDist', critDist.toFixed(2) + ' m');
  setTxt('resMicCoveragePct', tableCoveragePct + '% of Table');
  setTxt('resMicPickupArea', pickupArea.toFixed(1) + ' m² Pickup');
  setTxt('resMicDirectivityQ', directivityQ.toFixed(1) + ' (High Speech Clarity)');
  setTxt('resMicPlacementAdvice', placement);

  var micAdviceEl = document.getElementById('micRecAdviceBadge');
  if (micAdviceEl) {
    micAdviceEl.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles me-1 text-success"></i><strong>Recommended:</strong> ${numMics} ${micLabel} for ${Math.round(tableL*1000)} mm table &amp; ${rt60}s RT60`;
  }
}

// Dynamic Coverage Overlap Chart implementation
function renderSpkCoverageOverlapChart(roomL, roomW, roomH, earH, coneDeg, numCols, numRows, covDiameter, currentOverlapPct) {
  var container = document.getElementById('spkCoverageOverlapChartContainer');
  if (!container) return;

  var chartW = 900, chartH = 220;
  var padLeft = 60, padRight = 35, padTop = 30, padBottom = 40;
  var plotW = chartW - padLeft - padRight;
  var plotH = chartH - padTop - padBottom;

  var minH = 2.4, maxH = 4.5;
  var minOv = 0, maxOv = 100;

  function toX(h) {
    return padLeft + ((h - minH) / (maxH - minH)) * plotW;
  }
  function toY(ov) {
    return padTop + plotH - ((ov - minOv) / (maxOv - minOv)) * plotH;
  }

  var actualSpacingX = roomL / numCols;
  var actualSpacingY = roomW / numRows;
  var curSpacing = Math.max(actualSpacingX, actualSpacingY);
  var radCone = (coneDeg * Math.PI) / 360.0;

  // Calculate curves points
  var stepCount = 30;
  var curPath = '', densePath = '', sparsePath = '', curArea = '';

  var denseCols = numCols + 1;
  var denseRows = numRows + 1;
  var denseSpacing = Math.max(roomL / denseCols, roomW / denseRows);

  var sparseCols = Math.max(1, numCols - 1);
  var sparseRows = Math.max(1, numRows - 1);
  var sparseSpacing = Math.max(roomL / sparseCols, roomW / sparseRows);

  for (var i = 0; i <= stepCount; i++) {
    var hVal = minH + (i / stepCount) * (maxH - minH);
    var throwD = Math.max(0.5, hVal - earH);
    var dVal = 2.0 * throwD * Math.tan(radCone);

    var ovCur = Math.max(0, Math.min(100, Math.round((1.0 - curSpacing / dVal) * 100)));
    var ovDense = Math.max(0, Math.min(100, Math.round((1.0 - denseSpacing / dVal) * 100)));
    var ovSparse = Math.max(0, Math.min(100, Math.round((1.0 - sparseSpacing / dVal) * 100)));

    var px = toX(hVal);
    var pyCur = toY(ovCur);
    var pyDense = toY(ovDense);
    var pySparse = toY(ovSparse);

    if (i === 0) {
      curPath += `M ${px},${pyCur}`;
      curArea += `M ${px},${toY(0)} L ${px},${pyCur}`;
      densePath += `M ${px},${pyDense}`;
      sparsePath += `M ${px},${pySparse}`;
    } else {
      curPath += ` L ${px},${pyCur}`;
      curArea += ` L ${px},${pyCur}`;
      densePath += ` L ${px},${pyDense}`;
      sparsePath += ` L ${px},${pySparse}`;
    }
    if (i === stepCount) {
      curArea += ` L ${px},${toY(0)} Z`;
    }
  }

  // Operating point
  var curH = Math.max(minH, Math.min(maxH, roomH));
  var curDotX = toX(curH);
  var curDotY = toY(currentOverlapPct);

  // Overlap standard thresholds
  var yClass1 = toY(29.3); // Edge-to-edge
  var yClass2 = toY(15.0); // Min overlap
  var yCenter = toY(50.0); // Edge-to-center

  container.innerHTML = `<svg viewBox="0 0 ${chartW} ${chartH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
    <defs>
      <linearGradient id="overlapAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.02"/>
      </linearGradient>
    </defs>

    <!-- Background Grid Lines -->
    ${[0, 25, 50, 75, 100].map(function(val) {
      var y = toY(val);
      return `
        <line x1="${padLeft}" y1="${y}" x2="${chartW - padRight}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>
        <text x="${padLeft - 8}" y="${y + 3}" font-size="9.5" font-family="JetBrains Mono" fill="#64748b" text-anchor="end">${val}%</text>
      `;
    }).join('')}

    ${[2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.2, 4.5].map(function(h) {
      var x = toX(h);
      return `
        <line x1="${x}" y1="${padTop}" x2="${x}" y2="${chartH - padBottom}" stroke="#e2e8f0" stroke-width="1"/>
        <text x="${x}" y="${chartH - padBottom + 16}" font-size="9.5" font-family="JetBrains Mono" fill="#64748b" text-anchor="middle">${h.toFixed(1)}m</text>
      `;
    }).join('')}

    <!-- Standard Threshold Reference Guidelines -->
    <line x1="${padLeft}" y1="${yCenter}" x2="${chartW - padRight}" y2="${yCenter}" stroke="#10b981" stroke-width="1" stroke-dasharray="4,3"/>
    <text x="${chartW - padRight - 4}" y="${yCenter - 4}" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#059669" text-anchor="end">AVIXA Edge-to-Center (50%)</text>

    <line x1="${padLeft}" y1="${yClass1}" x2="${chartW - padRight}" y2="${yClass1}" stroke="#0284c7" stroke-width="1" stroke-dasharray="4,3"/>
    <text x="${chartW - padRight - 4}" y="${yClass1 - 4}" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#0284c7" text-anchor="end">AVIXA Class 1 Edge-to-Edge (29.3%)</text>

    <line x1="${padLeft}" y1="${yClass2}" x2="${chartW - padRight}" y2="${yClass2}" stroke="#d97706" stroke-width="1" stroke-dasharray="4,3"/>
    <text x="${chartW - padRight - 4}" y="${yClass2 - 4}" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#d97706" text-anchor="end">Minimum Overlap (15%)</text>

    <!-- Curves -->
    <!-- Dense Grid Curve -->
    <path d="${densePath}" fill="none" stroke="#8b5cf6" stroke-width="1.8" stroke-dasharray="3,3" opacity="0.85"/>
    <!-- Sparse Grid Curve -->
    <path d="${sparsePath}" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.8"/>
    <!-- Current Grid Shaded Area -->
    <path d="${curArea}" fill="url(#overlapAreaGrad)"/>
    <!-- Current Grid Curve -->
    <path d="${curPath}" fill="none" stroke="#f59e0b" stroke-width="3"/>

    <!-- Operating Point Marker -->
    <line x1="${curDotX}" y1="${padTop}" x2="${curDotX}" y2="${chartH - padBottom}" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="2,2"/>
    <circle cx="${curDotX}" cy="${curDotY}" r="7" fill="#ea580c" stroke="#ffffff" stroke-width="2.5"/>
    <circle cx="${curDotX}" cy="${curDotY}" r="3" fill="#ffffff"/>

    <!-- Callout Box for Current Operating Point -->
    <rect x="${Math.min(chartW - padRight - 180, Math.max(padLeft, curDotX - 85))}" y="${Math.max(padTop + 2, curDotY - 32)}" width="170" height="24" rx="4" fill="#0f172a" stroke="#ea580c" stroke-width="1.2"/>
    <text x="${Math.min(chartW - padRight - 95, Math.max(padLeft + 85, curDotX))}" y="${Math.max(padTop + 17, curDotY - 17)}" font-size="9" font-family="JetBrains Mono" font-weight="bold" fill="#ffffff" text-anchor="middle">
      Height: ${curH.toFixed(2)}m | Overlap: ${currentOverlapPct}%
    </text>

    <!-- Legend -->
    <g transform="translate(${padLeft + 10}, ${padTop + 6})">
      <line x1="0" y1="4" x2="18" y2="4" stroke="#f59e0b" stroke-width="3"/>
      <text x="24" y="7" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#b45309">Current Grid (${numCols}&times;${numRows}, Spacing ${curSpacing.toFixed(2)}m)</text>

      <line x1="190" y1="4" x2="208" y2="4" stroke="#8b5cf6" stroke-width="1.8" stroke-dasharray="3,3"/>
      <text x="214" y="7" font-size="8.5" font-family="JetBrains Mono" fill="#6d28d9">Dense Grid (${denseCols}&times;${denseRows})</text>

      <line x1="330" y1="4" x2="348" y2="4" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3"/>
      <text x="354" y="7" font-size="8.5" font-family="JetBrains Mono" fill="#64748b">Sparse Grid (${sparseCols}&times;${sparseRows})</text>
    </g>

    <!-- Axis Labels -->
    <text x="${chartW / 2}" y="${chartH - 8}" font-size="10" font-family="JetBrains Mono" font-weight="bold" fill="#334155" text-anchor="middle">CEILING HEIGHT (METERS)</text>
    <text x="14" y="${chartH / 2}" font-size="10" font-family="JetBrains Mono" font-weight="bold" fill="#334155" text-anchor="middle" transform="rotate(-90 14 ${chartH / 2})">ACOUSTIC OVERLAP %</text>
  </svg>`;

  var badgeOv = document.getElementById('badgeSpkOverlapPct');
  if (badgeOv) {
    if (currentOverlapPct >= 29) {
      badgeOv.className = 'badge bg-success font-mono';
      badgeOv.innerText = `Overlap: ${currentOverlapPct}% (AVIXA Class 1 Uniformity)`;
    } else if (currentOverlapPct >= 15) {
      badgeOv.className = 'badge bg-primary font-mono';
      badgeOv.innerText = `Overlap: ${currentOverlapPct}% (AVIXA Class 2 Standard)`;
    } else {
      badgeOv.className = 'badge bg-danger font-mono';
      badgeOv.innerText = `Overlap: ${currentOverlapPct}% (Dead Zones / Low Coverage)`;
    }
  }
}

// Sound Pressure Level (SPL) Mathematical Model & Color Mapping
function getPointSpl(x, y, z, spkList, spl1m) {
  var totalIntensity = 0;
  for (var i = 0; i < spkList.length; i++) {
    var spk = spkList[i];
    var dx = x - spk.x;
    var dy = y - spk.y;
    var dz = z - spk.z;
    var dist = Math.max(0.6, Math.sqrt(dx * dx + dy * dy + dz * dz));
    var splI = spl1m - 20.0 * Math.log10(dist);
    totalIntensity += Math.pow(10, splI / 10.0);
  }
  return 10.0 * Math.log10(Math.max(1e-12, totalIntensity));
}

function getSplHeatmapColor(spl) {
  // Color gradient: Blue (low SPL <84 dB) -> Cyan (84-88) -> Green (88-92) -> Yellow (92-96) -> Orange (96-100) -> Red (>100 dB)
  if (spl < 84) return 'rgba(30, 58, 138, 0.68)';   // Deep Blue
  if (spl < 88) return 'rgba(2, 132, 199, 0.70)';   // Sky Blue / Cyan
  if (spl < 92) return 'rgba(16, 185, 129, 0.72)';  // Emerald Green
  if (spl < 96) return 'rgba(250, 204, 21, 0.75)';  // Bright Yellow
  if (spl < 100) return 'rgba(249, 115, 22, 0.78)'; // Vibrant Orange
  return 'rgba(239, 68, 68, 0.82)';                // High SPL Red
}

// Master Combined Visualizer for Speaker & Microphone
var activePinnedSpkId = null;

function inspectSpeaker(spkId, row, col, x, y, z, diam, area, spl, overlapX, overlapY) {
  var labelEl = document.getElementById('spkMicInspectorLabel');
  var detailsEl = document.getElementById('spkMicInspectorDetails');
  if (labelEl) {
    labelEl.innerHTML = `<span class="badge bg-danger text-white me-1">LOUDSPEAKER #${spkId}</span> Grid: Row ${row}, Col ${col} (X: ${x}m, Y: ${y}m, Z: ${z}m) | <strong class="text-warning">Coverage Diameter: ${diam} m (${(parseFloat(diam)/0.3048).toFixed(1)} ft)</strong>`;
  }
  if (detailsEl) {
    detailsEl.innerHTML = `Footprint: <span class="text-white">${area} m²</span> | Ear SPL: <span class="text-success">${spl} dBA</span> | Overlap: <span class="text-info">+${overlapX}m X / +${overlapY}m Y</span>`;
  }
}

// ==========================================
// BEAMFORMING LOBE CUSTOM COLOR PALETTE & CSV EXPORT STATE
// ==========================================
var customLobePalette = {
  high: '#10b981', // Optimal SNR (>= 23.5 dB)
  med: '#facc15',  // Marginal SNR (19.0 - 23.5 dB)
  low: '#ef4444'   // Poor SNR (< 19.0 dB)
};

var lobePalettePresets = {
  traffic: { high: '#10b981', med: '#facc15', low: '#ef4444' },
  cyber: { high: '#06b6d4', med: '#f59e0b', low: '#ec4899' },
  electric: { high: '#3b82f6', med: '#a855f7', low: '#f43f5e' },
  contrast: { high: '#ffffff', med: '#38bdf8', low: '#1e3a8a' }
};

function hexToRgb(hex) {
  var clean = (hex || '#000000').replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(function(c) { return c + c; }).join('');
  }
  var num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 16, g: 185, b: 129 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbValuesToHex(r, g, b) {
  var clamp = function(v) { return Math.max(0, Math.min(255, Math.round(v))); };
  return '#' + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1);
}

function onLobePalettePresetChange(presetKey) {
  if (presetKey === 'custom') return;
  var preset = lobePalettePresets[presetKey];
  if (preset) {
    customLobePalette.high = preset.high;
    customLobePalette.med = preset.med;
    customLobePalette.low = preset.low;

    var inputHigh = document.getElementById('snrColHigh');
    var inputMed = document.getElementById('snrColMed');
    var inputLow = document.getElementById('snrColLow');
    if (inputHigh) inputHigh.value = preset.high;
    if (inputMed) inputMed.value = preset.med;
    if (inputLow) inputLow.value = preset.low;

    calcSpeakerAndMicAll();
  }
}

function onCustomLobeColorChange(tier, hex) {
  if (tier === 'high') customLobePalette.high = hex;
  else if (tier === 'med') customLobePalette.med = hex;
  else if (tier === 'low') customLobePalette.low = hex;

  var sel = document.getElementById('selLobePalettePreset');
  if (sel) sel.value = 'custom';

  calcSpeakerAndMicAll();
}

function resetLobePaletteToDefault() {
  onLobePalettePresetChange('traffic');
  var sel = document.getElementById('selLobePalettePreset');
  if (sel) sel.value = 'traffic';
}
window.onLobePalettePresetChange = onLobePalettePresetChange;
window.onCustomLobeColorChange = onCustomLobeColorChange;
window.resetLobePaletteToDefault = resetLobePaletteToDefault;
window.exportBeamformingLobesCsv = exportBeamformingLobesCsv;

function exportBeamformingLobesCsv() {
  var rawL = parseFloat(document.getElementById('spkRoomLength')?.value) || 6000;
  var roomL = rawL > 50 ? rawL / 1000.0 : rawL;
  var rawW = parseFloat(document.getElementById('spkRoomWidth')?.value) || 4500;
  var roomW = rawW > 50 ? rawW / 1000.0 : rawW;
  var rawH = parseFloat(document.getElementById('spkRoomHeight')?.value) || 2700;
  var roomH = rawH > 50 ? rawH / 1000.0 : rawH;
  var rawEar = parseFloat(document.getElementById('spkListenerEarHt')?.value) || 1200;
  var earH = rawEar > 50 ? rawEar / 1000.0 : rawEar;

  var micType = document.getElementById('micTypeSelect')?.value || 'ceiling_array';
  var isCeilingMic = (micType === 'ceiling_array');
  var directivityQ = isCeilingMic ? 2.8 : 2.0;
  var currentTalkerDist = parseFloat(document.getElementById('micTalkerDistRange')?.value) || parseFloat(document.getElementById('micTalkerDistInput')?.value) || 1.8;
  var ncRating = document.getElementById('micNoiseNcSelect')?.value || '30';

  var rows = [
    ['Lobe ID', 'Lobe Name', 'Steer Angle (deg from Nadir)', 'Azimuth (deg)', 'Elevation (deg)', 'Talker Distance (m)', 'Talker Distance (ft)', 'SNR (dB)', 'SNR Rating', 'Lobe Color Hex', 'Mic Mounting', 'Target Zone X (m)', 'Target Zone Y (m)', 'Target Zone Z (m)', 'Room Dimensions (LxWxH m)', 'Ambient NC Rating']
  ];

  micLobeAngles.forEach(function(sec) {
    var azRad = sec.azimuth * Math.PI / 180.0;
    var elRad = sec.elevation * Math.PI / 180.0;
    var steerAngle = Math.abs(Math.round(90 - sec.elevation));
    var talkerDist = currentTalkerDist / Math.max(0.25, Math.sin(elRad));
    var snr = calculateLobeSnr(talkerDist, directivityQ);
    var snrInfo = getLobeSnrColor(snr);

    var horiz = Math.cos(elRad);
    var verticalDrop = isCeilingMic ? Math.max(0.2, roomH - (earH + 0.1)) : Math.max(0.2, earH - 0.76);
    var beamLen = verticalDrop / Math.max(0.15, Math.sin(elRad));
    var tgtX = (micArrayOffset.x + Math.cos(azRad) * horiz * beamLen).toFixed(2);
    var tgtY = (micArrayOffset.y + Math.sin(azRad) * horiz * beamLen).toFixed(2);
    var tgtZ = (isCeilingMic ? (earH + 0.1) : earH).toFixed(2);

    rows.push([
      sec.id,
      '"' + sec.name + '"',
      steerAngle,
      sec.azimuth,
      sec.elevation,
      talkerDist.toFixed(2),
      (talkerDist * 3.28084).toFixed(2),
      snrInfo.snrDb,
      snrInfo.rating,
      snrInfo.hex,
      isCeilingMic ? 'Ceiling Array' : 'Tabletop Mic',
      tgtX,
      tgtY,
      tgtZ,
      roomL.toFixed(1) + 'x' + roomW.toFixed(1) + 'x' + roomH.toFixed(1),
      'NC-' + ncRating
    ]);
  });

  var csvContent = rows.map(function(e) { return e.join(','); }).join('\r\n');
  var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'beamforming_lobes_steer_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  var detailsEl = document.getElementById('spkMicInspectorDetails');
  if (detailsEl) {
    detailsEl.innerHTML = '<span class="text-success fw-bold"><i class="fa-solid fa-file-circle-check me-1"></i>Exported ' + micLobeAngles.length + ' Active Lobes to beamforming_lobes_steer_data.csv</span>';
  }
}

function getOrCreateSpkMicSvgWrapper(container) {
  if (!container) container = document.getElementById('spkMicCombined3ViewSvgContainer');
  if (!container) return null;
  var wrapper = document.getElementById('spkMicSvgWrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'spkMicSvgWrapper';
    wrapper.style.cssText = 'width: 100%; height: 100%; position: relative; display: block;';
    var canvas = document.getElementById('spkMicThreeCanvas');
    if (canvas && canvas.parentNode === container) {
      container.insertBefore(wrapper, canvas.nextSibling);
    } else {
      container.appendChild(wrapper);
    }
  } else if (wrapper.parentNode !== container) {
    container.appendChild(wrapper);
  }
  return wrapper;
}

function ensureSpkMicContainerControls(container) {
  if (!container) return;

  var tooltip = document.getElementById('spkMicLobeFloatingTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'spkMicLobeFloatingTooltip';
    tooltip.className = 'position-absolute d-none';
    tooltip.style.cssText = 'pointer-events: none; z-index: 1050; background: #0f172a; border: 1px solid #38bdf8; border-radius: 6px; padding: 8px 12px; color: #f8fafc; font-family: "JetBrains Mono", monospace; font-size: 11px; box-shadow: 0 10px 25px rgba(0,0,0,0.7); max-width: 280px; transition: opacity 0.1s ease;';
    container.appendChild(tooltip);
  } else if (tooltip.parentNode !== container) {
    container.appendChild(tooltip);
  }

  var toolbar = document.getElementById('spkMicLobeToolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'spkMicLobeToolbar';
    toolbar.className = 'position-absolute d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 w-100';
    toolbar.style.cssText = 'top: 8px; left: 0; right: 0; z-index: 1020; pointer-events: none; box-sizing: border-box;';
    toolbar.innerHTML = `
      <div style="pointer-events: auto;">
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-slate-900 bg-opacity-80 border border-slate-700 text-slate-300 font-mono py-1 px-2 shadow-sm" style="backdrop-filter: blur(6px); font-size: 0.68rem;">
            <i class="fa-solid fa-satellite-dish text-info me-1"></i>BEAMFORMING STUDIO
          </span>
          <span class="badge bg-purple-900 bg-opacity-90 border border-purple-500 text-purple-200 font-mono py-1 px-2 shadow-sm d-none d-md-inline-flex align-items-center gap-1" style="backdrop-filter: blur(6px); font-size: 0.65rem;" title="Spatial lobe conflict warning zone indicating phase or acoustic interference">
            <span class="d-inline-block rounded-circle bg-purple-400" style="width:7px; height:7px;"></span>
            <span>Overlap Conflict: Purple</span>
          </span>
          <span class="badge bg-emerald-950 bg-opacity-80 border border-emerald-600 text-emerald-300 font-mono py-1 px-2 shadow-sm d-none d-lg-inline-flex align-items-center gap-1" style="backdrop-filter: blur(6px); font-size: 0.65rem;" title="Higher SNR increases color saturation &amp; opacity to differentiate optimal vs marginal capture zones">
            <i class="fa-solid fa-signal text-emerald-400"></i>
            <span>SNR: Saturation/Opacity Overlay</span>
          </span>
        </div>
      </div>
      <div class="d-flex align-items-center flex-wrap gap-2" style="pointer-events: auto;">
        <!-- Custom Lobe Palette Selector Widget -->
        <div class="d-flex align-items-center gap-2 p-1 px-2 rounded-pill bg-slate-900 bg-opacity-90 border border-slate-700 shadow-sm font-mono text-white" style="backdrop-filter: blur(8px); font-size: 0.72rem;">
          <span class="text-warning fw-bold d-flex align-items-center gap-1" title="Customize SNR Color Palette for Beamforming Lobes">
            <i class="fa-solid fa-palette"></i>
            <span class="d-none d-sm-inline">Lobe Palette:</span>
          </span>
          <select id="selLobePalettePreset" class="form-select form-select-sm py-0 px-1 font-mono fw-bold border-slate-600 bg-dark text-white" style="font-size:0.68rem; height:24px; min-width:115px;" onchange="onLobePalettePresetChange(this.value)">
            <option value="traffic">Traffic (Green/Yel/Red)</option>
            <option value="cyber">Cyber (Cyan/Amb/Mag)</option>
            <option value="electric">Electric (Blue/Pur/Coral)</option>
            <option value="contrast">Contrast (White/Cyan/Blue)</option>
            <option value="custom">Custom Pickers</option>
          </select>
          <div class="d-flex align-items-center gap-1 border-start border-slate-700 ps-2">
            <label for="snrColHigh" class="small mb-0 text-slate-300" style="font-size:0.68rem;" title="High SNR (&ge;23.5 dB) / Optimal Zone">High:</label>
            <input type="color" id="snrColHigh" value="${customLobePalette.high}" class="form-control form-control-color p-0 border-0 rounded cursor-pointer" style="width:20px; height:20px; background:none;" oninput="onCustomLobeColorChange('high', this.value)" onchange="onCustomLobeColorChange('high', this.value)" title="High SNR Color (Optimal &ge;23.5 dB)">
            
            <label for="snrColMed" class="small mb-0 text-slate-300 ms-1" style="font-size:0.68rem;" title="Medium SNR (19 - 23.5 dB) / Marginal Zone">Med:</label>
            <input type="color" id="snrColMed" value="${customLobePalette.med}" class="form-control form-control-color p-0 border-0 rounded cursor-pointer" style="width:20px; height:20px; background:none;" oninput="onCustomLobeColorChange('med', this.value)" onchange="onCustomLobeColorChange('med', this.value)" title="Medium SNR Color (Marginal 19-23.5 dB)">

            <label for="snrColLow" class="small mb-0 text-slate-300 ms-1" style="font-size:0.68rem;" title="Low SNR (&lt;19 dB) / Poor Zone">Low:</label>
            <input type="color" id="snrColLow" value="${customLobePalette.low}" class="form-control form-control-color p-0 border-0 rounded cursor-pointer" style="width:20px; height:20px; background:none;" oninput="onCustomLobeColorChange('low', this.value)" onchange="onCustomLobeColorChange('low', this.value)" title="Low SNR Color (Poor &lt;19 dB)">
          </div>
          <button type="button" class="btn btn-link text-slate-400 p-0 text-decoration-none ms-1" onclick="resetLobePaletteToDefault()" title="Reset to Default Green-to-Red Palette" style="font-size:0.75rem;">
            <i class="fa-solid fa-arrow-rotate-left"></i>
          </button>
        </div>

        <!-- Export CSV Button -->
        <button type="button" id="btnExportLobeCsv" class="btn btn-sm btn-outline-info text-white fw-bold d-flex align-items-center gap-1 shadow-sm px-2 py-1 rounded-pill bg-slate-900 bg-opacity-90 border-slate-600" onclick="exportBeamformingLobesCsv()" title="Export all active beamforming lobe steer angles, azimuth, elevation &amp; acoustic SNR data to CSV file" style="backdrop-filter: blur(8px); font-size:0.72rem; height: 30px;">
          <i class="fa-solid fa-file-csv text-warning"></i>
          <span>Export Lobes CSV</span>
        </button>
      </div>
    `;
    container.appendChild(toolbar);
  } else if (toolbar.parentNode !== container) {
    container.appendChild(toolbar);
  }

  // Sync inputs
  var inpHigh = document.getElementById('snrColHigh');
  var inpMed = document.getElementById('snrColMed');
  var inpLow = document.getElementById('snrColLow');
  if (inpHigh) inpHigh.value = customLobePalette.high;
  if (inpMed) inpMed.value = customLobePalette.med;
  if (inpLow) inpLow.value = customLobePalette.low;
}

function calculateLobeSnr(talkerDist, directivityQ) {
  directivityQ = directivityQ || 2.8;
  var d = Math.max(0.4, talkerDist);
  var speechLevel = 65.0 - 20.0 * Math.log10(d);
  var diGain = 10.0 * Math.log10(directivityQ);
  var ambientNoise = 40.0;
  return speechLevel + diGain - ambientNoise;
}

function getLobeSnrColor(snr) {
  // Continuous dynamic gradient across user-selected low, medium, and high SNR colors
  var t = Math.max(0, Math.min(1, (snr - 16.0) / (24.0 - 16.0)));
  var cLow = hexToRgb(customLobePalette.low);
  var cMed = hexToRgb(customLobePalette.med);
  var cHigh = hexToRgb(customLobePalette.high);

  var r, g, b;
  if (t >= 0.5) {
    var f = (t - 0.5) / 0.5;
    r = Math.round(cMed.r * (1 - f) + cHigh.r * f);
    g = Math.round(cMed.g * (1 - f) + cHigh.g * f);
    b = Math.round(cMed.b * (1 - f) + cHigh.b * f);
  } else {
    var f = t / 0.5;
    r = Math.round(cLow.r * (1 - f) + cMed.r * f);
    g = Math.round(cLow.g * (1 - f) + cMed.g * f);
    b = Math.round(cLow.b * (1 - f) + cMed.b * f);
  }

  // Visual overlay: higher SNR results in higher color saturation & opacity
  // Saturation factor: optimal SNR (>=23.5 dB) -> 1.0; marginal SNR (~19-22 dB) -> 0.65-0.80; poor SNR (<17 dB) -> desaturated (0.35-0.50)
  var gray = 0.299 * r + 0.587 * g + 0.114 * b;
  var satFactor = 0.35 + 0.65 * Math.pow(t, 1.2);
  r = Math.round(gray + (r - gray) * satFactor);
  g = Math.round(gray + (g - gray) * satFactor);
  b = Math.round(gray + (b - gray) * satFactor);

  var opacity = 0.28 + 0.42 * t; // 0.28 for marginal/poor, up to 0.70 for optimal
  var hex = rgbValuesToHex(r, g, b);
  var rating = (snr >= 23.5) ? 'Optimal' : (snr >= 19.0 ? 'Marginal' : 'Poor');
  return { hex: hex, rating: rating, snrDb: snr.toFixed(1), r: r, g: g, b: b, opacity: opacity, saturation: Math.round(satFactor * 100) };
}

function inspectBeamformingLobe(lobeId, micIdx, azimuth, elevation, steerAngle, talkerDist, snr, rating, color, targetZone, conflictingLobes) {
  var labelEl = document.getElementById('spkMicInspectorLabel');
  var detailsEl = document.getElementById('spkMicInspectorDetails');
  var conflictBadge = (conflictingLobes && conflictingLobes.length > 0)
    ? ` <span class="badge bg-purple-700 text-white"><i class="fa-solid fa-triangle-exclamation me-1"></i>CONFLICT w/ #${conflictingLobes.join(', #')}</span>`
    : '';

  if (labelEl) {
    labelEl.innerHTML = `<span class="badge" style="background:${color}; color:#000;">LOBE #${lobeId}</span> <strong>${targetZone}</strong>${conflictBadge} &bull; Steer: <strong class="text-warning">${steerAngle}&deg;</strong> (Az: ${azimuth}&deg;, El: ${elevation}&deg;)`;
  }
  if (detailsEl) {
    var conflictNote = (conflictingLobes && conflictingLobes.length > 0)
      ? ` | <strong style="color:#d8b4fe;"><i class="fa-solid fa-radiation me-1"></i>Potential Audio Interference/Phase Comb Risk!</strong>`
      : '';
    detailsEl.innerHTML = `Talker Dist: <span class="text-white">${talkerDist} m</span> | SNR: <strong style="color:${color};">${snr} dB (${rating})</strong>${conflictNote}`;
  }
}

function attachSpkMicCombinedEventListeners() {
  var container = document.getElementById('spkMicCombined3ViewSvgContainer');
  if (!container) return;
  var tooltip = document.getElementById('spkMicLobeFloatingTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'spkMicLobeFloatingTooltip';
    tooltip.className = 'position-absolute d-none';
    tooltip.style.cssText = 'pointer-events: none; z-index: 1050; background: #0f172a; border: 1px solid #38bdf8; border-radius: 6px; padding: 8px 12px; color: #f8fafc; font-family: "JetBrains Mono", monospace; font-size: 11px; box-shadow: 0 10px 25px rgba(0,0,0,0.7); max-width: 280px;';
    container.appendChild(tooltip);
  }

  function handleLobeHover(node, e) {
    var id = node.getAttribute('data-lobe-id') || '1';
    var name = node.getAttribute('data-lobe-name') || ('Lobe #' + id);
    var steerAngle = node.getAttribute('data-steer-angle') || '0';
    var az = node.getAttribute('data-azimuth') || '0';
    var el = node.getAttribute('data-elevation') || '60';
    var dist = node.getAttribute('data-talker-dist') || '1.8';
    var snr = node.getAttribute('data-snr') || '24.0';
    var rating = node.getAttribute('data-snr-rating') || 'Optimal';
    var color = node.getAttribute('data-snr-color') || '#10b981';
    var conflictsAttr = node.getAttribute('data-conflicts') || '';
    var conflicts = conflictsAttr ? conflictsAttr.split(',').filter(Boolean) : [];
    var satAttr = node.getAttribute('data-saturation') || '95';
    var opAttr = node.getAttribute('data-opacity') || '75';

    inspectBeamformingLobe(id, 1, az, el, steerAngle, dist, snr, rating, color, name, conflicts);

    if (tooltip) {
      tooltip.classList.remove('d-none');
      tooltip.style.borderColor = conflicts.length > 0 ? '#a855f7' : color;
      var conflictWarningHtml = conflicts.length > 0 ? `
        <div class="mt-1 p-1 px-2 rounded bg-purple-950 border border-purple-500 text-purple-200" style="font-size:10px;">
          <strong class="text-warning"><i class="fa-solid fa-triangle-exclamation me-1"></i>PHASE CONFLICT WARNING:</strong>
          <div>Spatial overlap with Lobe #${conflicts.join(', #')}. Potential comb filtering or acoustic phase interference!</div>
        </div>
      ` : '';
      tooltip.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-1" style="border-bottom: 1px solid rgba(255,255,255,0.18); padding-bottom: 3px;">
          <strong style="color:${color}; font-size:12px;">Lobe #${id}: ${name}</strong>
          <span class="badge px-1 py-0" style="background:${color}33; color:${color}; border:1px solid ${color}; font-size:9px;">${rating} SNR</span>
        </div>
        <div class="space-y-1" style="font-size:11px; line-height: 1.45;">
          <div>&bull; Calculated Steer Angle: <strong style="color:#ffffff;">${steerAngle}&deg;</strong> (from Nadir)</div>
          <div>&bull; Steering Azimuth: <strong style="color:#38bdf8;">${az}&deg;</strong> | Elevation: <strong style="color:#38bdf8;">${el}&deg;</strong></div>
          <div>&bull; Talker Distance: <strong style="color:#facc15;">${dist} m</strong> (${(parseFloat(dist)*3.28).toFixed(1)} ft)</div>
          <div>&bull; Signal-to-Noise Ratio: <strong style="color:${color};">${snr} dB</strong> (${rating})</div>
          <div>&bull; Visual Overlay: <strong>${satAttr}% Saturation</strong> | <strong>${opAttr}% Opacity</strong></div>
        </div>
        ${conflictWarningHtml}
      `;
      positionLobeTooltip(e, container, tooltip);
    }
  }

  // 1. Container-level event delegation (captures mouse events directly on #spkMicCombined3ViewSvgContainer)
  if (!container._hasLobeHoverDelegation) {
    container._hasLobeHoverDelegation = true;
    container.addEventListener('mouseover', function(e) {
      var targetLobe = e.target.closest('.lobe-interactive-node, .beamforming-lobe, .mic-beam-lobe-elem, [data-lobe-id]');
      if (targetLobe) {
        handleLobeHover(targetLobe, e);
      }
    });

    container.addEventListener('mousemove', function(e) {
      var targetLobe = e.target.closest('.lobe-interactive-node, .beamforming-lobe, .mic-beam-lobe-elem, [data-lobe-id]');
      if (targetLobe && tooltip && !tooltip.classList.contains('d-none')) {
        positionLobeTooltip(e, container, tooltip);
      }
    });

    container.addEventListener('mouseout', function(e) {
      var targetLobe = e.target.closest('.lobe-interactive-node, .beamforming-lobe, .mic-beam-lobe-elem, [data-lobe-id]');
      var related = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('.lobe-interactive-node, .beamforming-lobe, .mic-beam-lobe-elem, [data-lobe-id]') : null;
      if (targetLobe && targetLobe !== related) {
        if (tooltip) tooltip.classList.add('d-none');
        resetInspectorBar();
      }
    });
  }

  // 2. Individual node-level event listeners for direct event dispatch
  var lobeNodes = container.querySelectorAll('.lobe-interactive-node, .beamforming-lobe, .mic-beam-lobe-elem, [data-lobe-id]');
  lobeNodes.forEach(function(node) {
    node.style.cursor = 'pointer';
    node.onmouseenter = function(e) { handleLobeHover(node, e); };
    node.onmousemove = function(e) {
      if (tooltip && !tooltip.classList.contains('d-none')) {
        positionLobeTooltip(e, container, tooltip);
      }
    };
    node.onmouseleave = function() {
      if (tooltip) tooltip.classList.add('d-none');
      resetInspectorBar();
    };
  });
}

function positionLobeTooltip(e, container, tooltip) {
  var rect = container.getBoundingClientRect();
  var x = e.clientX - rect.left + 14;
  var y = e.clientY - rect.top + 14;
  if (x + 280 > rect.width) x = e.clientX - rect.left - 275;
  if (y + 130 > rect.height) y = e.clientY - rect.top - 125;
  tooltip.style.left = Math.max(8, x) + 'px';
  tooltip.style.top = Math.max(8, y) + 'px';
}

function resetInspectorBar() {
  if (activePinnedSpkId !== null) return;
  var labelEl = document.getElementById('spkMicInspectorLabel');
  var detailsEl = document.getElementById('spkMicInspectorDetails');
  if (labelEl) {
    labelEl.innerHTML = 'Hover over any Speaker or Beamforming Lobe to inspect individual coverage diameter and acoustic metrics';
  }
  if (detailsEl) {
    detailsEl.innerHTML = '';
  }
}

// ==========================================
// MICROPHONE ARRAY PLACEMENT & STEERING ANGLES STATE
// ==========================================
var micArrayOffset = { x: 0, y: 0 };
var micLobeAngles = [
  { id: 1, name: 'Seat 1 (North-West)', azimuth: -135, elevation: 52 },
  { id: 2, name: 'Seat 2 (N-MidLeft)', azimuth: -110, elevation: 58 },
  { id: 3, name: 'Seat 3 (N-MidRight)', azimuth: -70, elevation: 58 },
  { id: 4, name: 'Seat 4 (North-East)', azimuth: -45, elevation: 52 },
  { id: 5, name: 'Seat 5 (South-East)', azimuth: 45, elevation: 52 },
  { id: 6, name: 'Seat 6 (S-MidRight)', azimuth: 70, elevation: 58 },
  { id: 7, name: 'Seat 7 (S-MidLeft)', azimuth: 110, elevation: 58 },
  { id: 8, name: 'Seat 8 (South-West)', azimuth: 135, elevation: 52 }
];
var activeSelectedLobeId = 1;

function onMicOffsetChange(axis, val) {
  var numVal = parseFloat(val) || 0;
  if (axis === 'x') {
    micArrayOffset.x = numVal;
    var inp = document.getElementById('micOffsetXInput');
    if (inp) inp.value = numVal.toFixed(1);
    var rng = document.getElementById('micOffsetXRange');
    if (rng) rng.value = numVal;
    var lbl = document.getElementById('lblMicOffsetX');
    if (lbl) lbl.textContent = (numVal >= 0 ? '+' : '') + numVal.toFixed(1) + ' m';
  } else {
    micArrayOffset.y = numVal;
    var inp = document.getElementById('micOffsetYInput');
    if (inp) inp.value = numVal.toFixed(1);
    var rng = document.getElementById('micOffsetYRange');
    if (rng) rng.value = numVal;
    var lbl = document.getElementById('lblMicOffsetY');
    if (lbl) lbl.textContent = (numVal >= 0 ? '+' : '') + numVal.toFixed(1) + ' m';
  }
  var statusBadge = document.getElementById('badgeMicOffsetStatus');
  if (statusBadge) {
    if (Math.abs(micArrayOffset.x) < 0.05 && Math.abs(micArrayOffset.y) < 0.05) {
      statusBadge.className = 'badge bg-success font-mono';
      statusBadge.textContent = 'Centered Over Table';
    } else {
      statusBadge.className = 'badge bg-warning text-dark font-mono';
      statusBadge.textContent = `Off-Center: ${micArrayOffset.x >= 0 ? '+' : ''}${micArrayOffset.x.toFixed(1)}m X, ${micArrayOffset.y >= 0 ? '+' : ''}${micArrayOffset.y.toFixed(1)}m Y`;
    }
  }
  calcSpeakerAndMicAll();
}

function onActiveLobeSelectChange() {
  var sel = document.getElementById('selActiveLobe');
  if (!sel) return;
  activeSelectedLobeId = parseInt(sel.value) || 1;
  var lobe = micLobeAngles.find(function(l) { return l.id === activeSelectedLobeId; }) || micLobeAngles[0];
  
  var azInp = document.getElementById('lobeAzimuthInput');
  var azRng = document.getElementById('lobeAzimuthRange');
  var azLbl = document.getElementById('lblLobeAzimuth');
  if (azInp) azInp.value = lobe.azimuth;
  if (azRng) azRng.value = lobe.azimuth;
  if (azLbl) azLbl.textContent = lobe.azimuth + '°';

  var elInp = document.getElementById('lobeElevationInput');
  var elRng = document.getElementById('lobeElevationRange');
  var elLbl = document.getElementById('lblLobeElevation');
  if (elInp) elInp.value = lobe.elevation;
  if (elRng) elRng.value = lobe.elevation;
  if (elLbl) elLbl.textContent = lobe.elevation + '°';
}

function onLobeAngleSliderChange(type, val) {
  var numVal = parseInt(val) || 0;
  var lobe = micLobeAngles.find(function(l) { return l.id === activeSelectedLobeId; });
  if (!lobe) return;
  
  if (type === 'azimuth') {
    lobe.azimuth = numVal;
    var azInp = document.getElementById('lobeAzimuthInput');
    var azRng = document.getElementById('lobeAzimuthRange');
    var azLbl = document.getElementById('lblLobeAzimuth');
    if (azInp) azInp.value = numVal;
    if (azRng) azRng.value = numVal;
    if (azLbl) azLbl.textContent = numVal + '°';
  } else {
    lobe.elevation = numVal;
    var elInp = document.getElementById('lobeElevationInput');
    var elRng = document.getElementById('lobeElevationRange');
    var elLbl = document.getElementById('lblLobeElevation');
    if (elInp) elInp.value = numVal;
    if (elRng) elRng.value = numVal;
    if (elLbl) elLbl.textContent = numVal + '°';
  }
  updateLobeDropdownLabels();
  calcSpeakerAndMicAll();
}

function updateLobeDropdownLabels() {
  var sel = document.getElementById('selActiveLobe');
  if (!sel) return;
  Array.from(sel.options).forEach(function(opt) {
    var id = parseInt(opt.value);
    var lobe = micLobeAngles.find(function(l) { return l.id === id; });
    if (lobe) {
      opt.textContent = `Lobe ${lobe.id}: ${lobe.name} • Azimuth: ${lobe.azimuth}°, Elev: ${lobe.elevation}°`;
    }
  });
  var summary = document.getElementById('txtLobeQuickSummary');
  if (summary) {
    var cur = micLobeAngles[activeSelectedLobeId - 1];
    summary.textContent = `Lobe ${activeSelectedLobeId} steered to Azimuth ${cur.azimuth}°, Elev ${cur.elevation}°`;
  }
}

function autoSteerLobesToTable() {
  var rawTable = parseFloat(document.getElementById('spkTableLength')?.value) || 4000;
  var tableL = rawTable > 50 ? rawTable / 1000.0 : rawTable;
  var roomW = parseFloat(document.getElementById('spkRoomWidth')?.value) || 4.5;
  var tWid = Math.min(1.4, roomW * 0.4);
  var roomH = parseFloat(document.getElementById('spkCeilingHeight')?.value) || 2.8;
  var earH = parseFloat(document.getElementById('spkEarHeight')?.value) || 1.2;

  var arrayX = micArrayOffset.x;
  var arrayZ = micArrayOffset.y;
  var dz = roomH - earH;

  var seats = [
    { id: 1, name: 'Seat 1 (North-West)', x: -tableL * 0.35, z: -tWid/2 - 0.25 },
    { id: 2, name: 'Seat 2 (N-MidLeft)', x: -tableL * 0.12, z: -tWid/2 - 0.25 },
    { id: 3, name: 'Seat 3 (N-MidRight)', x: tableL * 0.12, z: -tWid/2 - 0.25 },
    { id: 4, name: 'Seat 4 (North-East)', x: tableL * 0.35, z: -tWid/2 - 0.25 },
    { id: 5, name: 'Seat 5 (South-East)', x: tableL * 0.35, z: tWid/2 + 0.25 },
    { id: 6, name: 'Seat 6 (S-MidRight)', x: tableL * 0.12, z: tWid/2 + 0.25 },
    { id: 7, name: 'Seat 7 (S-MidLeft)', x: -tableL * 0.12, z: tWid/2 + 0.25 },
    { id: 8, name: 'Seat 8 (South-West)', x: -tableL * 0.35, z: tWid/2 + 0.25 }
  ];

  seats.forEach(function(s, idx) {
    var dx = s.x - arrayX;
    var dy = s.z - arrayZ;
    var dHoriz = Math.max(0.2, Math.sqrt(dx * dx + dy * dy));
    var azDeg = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
    var elDeg = Math.round(Math.atan2(dz, dHoriz) * 180 / Math.PI);
    micLobeAngles[idx].azimuth = azDeg;
    micLobeAngles[idx].elevation = Math.max(15, Math.min(85, elDeg));
  });

  onActiveLobeSelectChange();
  updateLobeDropdownLabels();
  calcSpeakerAndMicAll();
}

function resetLobeAnglesToDefault() {
  var defaults = [
    { id: 1, name: 'Seat 1 (North-West)', azimuth: -135, elevation: 52 },
    { id: 2, name: 'Seat 2 (N-MidLeft)', azimuth: -110, elevation: 58 },
    { id: 3, name: 'Seat 3 (N-MidRight)', azimuth: -70, elevation: 58 },
    { id: 4, name: 'Seat 4 (North-East)', azimuth: -45, elevation: 52 },
    { id: 5, name: 'Seat 5 (South-East)', azimuth: 45, elevation: 52 },
    { id: 6, name: 'Seat 6 (S-MidRight)', azimuth: 70, elevation: 58 },
    { id: 7, name: 'Seat 7 (S-MidLeft)', azimuth: 110, elevation: 58 },
    { id: 8, name: 'Seat 8 (South-West)', azimuth: 135, elevation: 52 }
  ];
  defaults.forEach(function(d, i) {
    micLobeAngles[i].azimuth = d.azimuth;
    micLobeAngles[i].elevation = d.elevation;
  });
  onActiveLobeSelectChange();
  updateLobeDropdownLabels();
  calcSpeakerAndMicAll();
}

// ==========================================
// REALISTIC 3D INTERACTIVE ACOUSTIC ROOM STUDIO (THREE.JS WEBGL)
// ==========================================
var threeSpkMicState = {
  renderer: null,
  scene: null,
  camera: null,
  controls: null,
  animId: null,
  container: null,
  raycaster: null,
  mouse: null,
  interactiveObjects: [],
  hoveredObject: null,
  isInitialized: false,
  roomGroup: null
};

function renderSpkMicThreeStudio(container, roomL, roomW, roomH, earH, numCols, numRows, actualSpacingX, actualSpacingY, covRadius, tableL, participants, micType, showCones, showMic, showOverlap, showTable, showBeamLobes, showLobeOverlap, showSplHeatmap, showMicSensHeatmap, spl1m) {
  if (typeof THREE === 'undefined') return false;

  var width = container.clientWidth || 920;
  var height = container.clientHeight || 480;
  if (height < 300) height = 480;

  // Initialize Three.js renderer & canvas if not yet done or container changed
  if (!threeSpkMicState.isInitialized || threeSpkMicState.container !== container) {
    threeSpkMicState.container = container;

    try {
      threeSpkMicState.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'default' });
    } catch (e) {
      try {
        threeSpkMicState.renderer = new THREE.WebGLRenderer({ antialias: true });
      } catch (e2) {
        console.warn('WebGL initialization failed, falling back to SVG:', e2);
        return false;
      }
    }

    threeSpkMicState.renderer.setSize(width, height);
    threeSpkMicState.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    threeSpkMicState.renderer.shadowMap.enabled = true;
    threeSpkMicState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    threeSpkMicState.renderer.domElement.id = 'spkMicThreeCanvas';
    threeSpkMicState.renderer.domElement.style.display = 'block';
    threeSpkMicState.renderer.domElement.style.width = '100%';
    threeSpkMicState.renderer.domElement.style.height = '100%';
    threeSpkMicState.renderer.domElement.style.borderRadius = '8px';

    // Prepare container elements: keep canvas, toolbar, tooltip and svgWrapper
    var oldTooltip = document.getElementById('spkMicLobeFloatingTooltip');
    var oldToolbar = document.getElementById('spkMicLobeToolbar');
    var svgWrap = getOrCreateSpkMicSvgWrapper(container);
    if (svgWrap) svgWrap.style.display = 'none';
    if (!container.contains(threeSpkMicState.renderer.domElement)) {
      container.insertBefore(threeSpkMicState.renderer.domElement, container.firstChild);
    }
    if (oldToolbar && !container.contains(oldToolbar)) container.appendChild(oldToolbar);
    if (oldTooltip && !container.contains(oldTooltip)) container.appendChild(oldTooltip);
    ensureSpkMicContainerControls(container);

    threeSpkMicState.scene = new THREE.Scene();
    threeSpkMicState.scene.background = new THREE.Color(0x0a0f1d);

    threeSpkMicState.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 150);
    var dist = Math.max(roomL, roomW) * 1.35;
    threeSpkMicState.camera.position.set(dist * 0.85, roomH * 1.5, dist * 0.95);
    threeSpkMicState.camera.lookAt(0, roomH * 0.35, 0);

    if (typeof THREE.OrbitControls !== 'undefined') {
      threeSpkMicState.controls = new THREE.OrbitControls(threeSpkMicState.camera, threeSpkMicState.renderer.domElement);
      threeSpkMicState.controls.enableDamping = true;
      threeSpkMicState.controls.dampingFactor = 0.06;
      threeSpkMicState.controls.maxPolarAngle = Math.PI / 2 + 0.02;
      threeSpkMicState.controls.minDistance = 2.0;
      threeSpkMicState.controls.maxDistance = 45.0;
      threeSpkMicState.controls.target.set(0, roomH * 0.35, 0);
      threeSpkMicState.controls.update();
    }

    // Studio Ambient & Directional Lighting
    var ambLight = new THREE.AmbientLight(0xffffff, 1.4);
    threeSpkMicState.scene.add(ambLight);

    var hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.0);
    threeSpkMicState.scene.add(hemiLight);

    var keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    keyLight.position.set(12, 18, 14);
    keyLight.castShadow = true;
    threeSpkMicState.scene.add(keyLight);

    var fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(-14, 12, -10);
    threeSpkMicState.scene.add(fillLight);

    var tableLight = new THREE.PointLight(0xfde68a, 1.0, 20);
    tableLight.position.set(0, roomH - 0.2, 0);
    threeSpkMicState.scene.add(tableLight);

    // Raycasting for Interactive Inspection
    threeSpkMicState.raycaster = new THREE.Raycaster();
    threeSpkMicState.mouse = new THREE.Vector2();

    var onMouseMove = function(event) {
      if (!threeSpkMicState.renderer || !threeSpkMicState.camera) return;
      var rect = threeSpkMicState.renderer.domElement.getBoundingClientRect();
      threeSpkMicState.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      threeSpkMicState.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      threeSpkMicState.raycaster.setFromCamera(threeSpkMicState.mouse, threeSpkMicState.camera);
      var intersects = threeSpkMicState.raycaster.intersectObjects(threeSpkMicState.interactiveObjects, true);

      if (intersects.length > 0) {
        var topHit = intersects[0].object;
        while (topHit && !topHit.userData.type && topHit.parent) {
          topHit = topHit.parent;
        }
        if (topHit && topHit.userData && topHit.userData.type) {
          var u = topHit.userData;
          var tooltip = document.getElementById('spkMicLobeFloatingTooltip');
          if (u.type === 'speaker') {
            inspectSpeaker(u.id, u.row, u.col, u.x, u.y, u.z, u.diam, u.area, u.spl, u.overlapX, u.overlapY);
            if (tooltip) {
              tooltip.classList.remove('d-none');
              tooltip.style.borderColor = '#ef4444';
              tooltip.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-1" style="border-bottom: 1px solid rgba(255,255,255,0.18); padding-bottom: 3px;">
                  <strong style="color:#ef4444; font-size:12px;">Speaker #${u.id} (R${u.row}:C${u.col})</strong>
                  <span class="badge bg-danger px-1 py-0" style="font-size:9px;">${u.spl} dBA</span>
                </div>
                <div class="space-y-1" style="font-size:11px; line-height: 1.45;">
                  <div>&bull; Location: (${u.x}m, ${u.y}m, ${u.z}m)</div>
                  <div>&bull; Coverage ⌀: <strong style="color:#38bdf8;">${u.diam}m</strong> (${(parseFloat(u.diam)/0.3048).toFixed(1)}ft)</div>
                  <div>&bull; Single Area: <strong style="color:#facc15;">${u.area} m²</strong></div>
                  <div>&bull; Ear Plane SPL: <strong style="color:#4ade80;">${u.spl} dBA</strong></div>
                </div>
              `;
              positionLobeTooltip(event, threeSpkMicState.container, tooltip);
            }
          } else if (u.type === 'lobe') {
            inspectBeamformingLobe(u.id, u.micIdx, u.azimuth, u.elevation, u.steerAngle, u.talkerDist, u.snr, u.rating, u.colorHex, u.targetZone, u.conflictingLobes);
            if (tooltip) {
              tooltip.classList.remove('d-none');
              tooltip.style.borderColor = u.hasConflict ? '#a855f7' : u.colorHex;
              var conflictWarningHtml = u.hasConflict ? `
                <div class="mt-1 p-1 px-2 rounded bg-purple-950 border border-purple-500 text-purple-200" style="font-size:10px;">
                  <strong class="text-warning"><i class="fa-solid fa-triangle-exclamation me-1"></i>PHASE CONFLICT WARNING:</strong>
                  <div>Spatial overlap with Lobe #${u.conflictingLobes.join(', #')}. Potential comb filtering or acoustic phase interference!</div>
                </div>
              ` : '';
              tooltip.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-1" style="border-bottom: 1px solid rgba(255,255,255,0.18); padding-bottom: 3px;">
                  <strong style="color:${u.colorHex}; font-size:12px;">Lobe #${u.id}: ${u.targetZone}</strong>
                  <span class="badge px-1 py-0" style="background:${u.colorHex}33; color:${u.colorHex}; border:1px solid ${u.colorHex}; font-size:9px;">${u.rating} SNR</span>
                </div>
                <div class="space-y-1" style="font-size:11px; line-height: 1.45;">
                  <div>&bull; Calculated Steer Angle: <strong style="color:#ffffff;">${u.steerAngle}&deg;</strong> (from Nadir)</div>
                  <div>&bull; Steering Azimuth: <strong style="color:#38bdf8;">${u.azimuth}&deg;</strong> | Elevation: <strong style="color:#38bdf8;">${u.elevation}&deg;</strong></div>
                  <div>&bull; Talker Distance: <strong style="color:#facc15;">${u.talkerDist} m</strong> (${(parseFloat(u.talkerDist)*3.28).toFixed(1)} ft)</div>
                  <div>&bull; Signal-to-Noise Ratio: <strong style="color:${u.colorHex};">${u.snr} dB</strong> (${u.rating})</div>
                  <div>&bull; Visual Overlay: <strong>${u.saturation}% Saturation</strong> | <strong>${u.opacity}% Opacity</strong></div>
                </div>
                ${conflictWarningHtml}
              `;
              positionLobeTooltip(event, threeSpkMicState.container, tooltip);
            }
          } else if (u.type === 'conflictZone') {
            var labelEl = document.getElementById('spkMicInspectorLabel');
            var detailsEl = document.getElementById('spkMicInspectorDetails');
            if (labelEl) {
              labelEl.innerHTML = `<span class="badge bg-purple-700 text-white me-1"><i class="fa-solid fa-triangle-exclamation me-1"></i>CONFLICT ZONE</span> <strong>Interference Between Lobe #${u.lobeA} &amp; Lobe #${u.lobeB}</strong> &bull; Angular Separation: <span class="text-warning">${u.angleDeg}&deg;</span>`;
            }
            if (detailsEl) {
              detailsEl.innerHTML = `<span class="text-purple-300 font-monospace">Center Separation: ${u.distM}m | <strong style="color:#f472b6;">Phase cancellation / comb filtering warning! Adjust steer azimuths to resolve.</strong></span>`;
            }
            if (tooltip) {
              tooltip.classList.remove('d-none');
              tooltip.style.borderColor = '#c084fc';
              tooltip.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-1" style="border-bottom: 1px solid rgba(255,255,255,0.18); padding-bottom: 3px;">
                  <strong style="color:#c084fc; font-size:12px;"><i class="fa-solid fa-triangle-exclamation text-warning me-1"></i>Lobe Conflict Zone</strong>
                  <span class="badge bg-purple-900 border border-purple-400 text-purple-200 px-1 py-0" style="font-size:9px;">Warning</span>
                </div>
                <div class="space-y-1 text-purple-100" style="font-size:11px; line-height: 1.45;">
                  <div>&bull; Conflicting Lobes: <strong style="color:#ffffff;">Lobe #${u.lobeA} &amp; Lobe #${u.lobeB}</strong></div>
                  <div>&bull; Angular Spacing: <strong style="color:#fde047;">${u.angleDeg}&deg;</strong> (Sub-beam acceptance)</div>
                  <div>&bull; 3D Overlap Distance: <strong style="color:#38bdf8;">${u.distM} m</strong></div>
                  <div class="mt-1 text-warning small font-mono">&bull; Potential Audio Interference / Comb Filtering Risk</div>
                </div>
              `;
              positionLobeTooltip(event, threeSpkMicState.container, tooltip);
            }
          } else if (u.type === 'splProbe') {
            var labelEl = document.getElementById('spkMicInspectorLabel');
            var detailsEl = document.getElementById('spkMicInspectorDetails');
            if (labelEl) labelEl.innerHTML = `<span class="badge bg-danger me-1">SPL PROBE</span> Coordinate: (X: ${intersects[0].point.x.toFixed(2)}m, Z: ${intersects[0].point.z.toFixed(2)}m) &bull; <strong class="text-warning">Sound Pressure: ${u.spl.toFixed(1)} dBA</strong>`;
            if (detailsEl) detailsEl.innerHTML = `Ear Plane SPL margin: <span class="text-success">${(u.spl - 85).toFixed(1)} dB above 85dBA threshold</span>`;
          }
        }
      } else {
        var tooltip = document.getElementById('spkMicLobeFloatingTooltip');
        if (tooltip) tooltip.classList.add('d-none');
        resetInspectorBar();
      }
    };

    threeSpkMicState.renderer.domElement.addEventListener('mousemove', onMouseMove);
    threeSpkMicState.renderer.domElement.addEventListener('mouseleave', function() {
      var tooltip = document.getElementById('spkMicLobeFloatingTooltip');
      if (tooltip) tooltip.classList.add('d-none');
      resetInspectorBar();
    });

    // Animation Loop
    var animate = function() {
      threeSpkMicState.animId = requestAnimationFrame(animate);
      if (threeSpkMicState.controls) threeSpkMicState.controls.update();
      if (threeSpkMicState.renderer && threeSpkMicState.scene && threeSpkMicState.camera) {
        threeSpkMicState.renderer.render(threeSpkMicState.scene, threeSpkMicState.camera);
      }
    };
    animate();

    // Resize handler
    window.addEventListener('resize', function() {
      if (threeSpkMicState.renderer && threeSpkMicState.container && threeSpkMicState.camera) {
        var w = threeSpkMicState.container.clientWidth || 920;
        var h = 480;
        threeSpkMicState.camera.aspect = w / h;
        threeSpkMicState.camera.updateProjectionMatrix();
        threeSpkMicState.renderer.setSize(w, h);
      }
    });

    threeSpkMicState.isInitialized = true;
  }

  // Ensure Three.js canvas is visible and properly attached to container
  if (threeSpkMicState.renderer && threeSpkMicState.renderer.domElement) {
    var svgWrap = document.getElementById('spkMicSvgWrapper');
    if (svgWrap) svgWrap.style.display = 'none';

    if (!container.contains(threeSpkMicState.renderer.domElement)) {
      container.insertBefore(threeSpkMicState.renderer.domElement, container.firstChild);
    }
    threeSpkMicState.renderer.domElement.style.display = 'block';
    if (threeSpkMicState.camera) {
      threeSpkMicState.camera.aspect = width / height;
      threeSpkMicState.camera.updateProjectionMatrix();
    }
    threeSpkMicState.renderer.setSize(width, height);
    if (threeSpkMicState.controls) {
      threeSpkMicState.controls.update();
    }
    ensureSpkMicContainerControls(container);
  }

  // Clear previous scene geometries and interactive objects
  if (threeSpkMicState.roomGroup) {
    threeSpkMicState.scene.remove(threeSpkMicState.roomGroup);
  }
  threeSpkMicState.interactiveObjects = [];

  var roomGroup = new THREE.Group();
  threeSpkMicState.roomGroup = roomGroup;

  // Build Speaker Coordinates List
  var spkList = [];
  var covDiameter = covRadius * 2.0;
  var singleArea = Math.PI * covRadius * covRadius;
  var earSpl = parseFloat(document.getElementById('resSpkEarSpl')?.innerText) || 101.3;
  var throwDist = Math.max(0.6, roomH - earH);

  for (var col = 0; col < numCols; col++) {
    for (var row = 0; row < numRows; row++) {
      var spkX = -roomL / 2.0 + actualSpacingX * (col + 0.5);
      var spkZ = -roomW / 2.0 + actualSpacingY * (row + 0.5);
      spkList.push({
        col: col + 1,
        row: row + 1,
        x: spkX,
        z: spkZ,
        y: roomH
      });
    }
  }

  // 1. ARCHITECTURAL FLOOR
  var floorGeo = new THREE.PlaneGeometry(roomL, roomW, 1, 1);
  var floorMat = new THREE.MeshStandardMaterial({
    color: 0x0c1322,
    roughness: 0.45,
    metalness: 0.25
  });
  var floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  roomGroup.add(floorMesh);

  // Subtle floor grid helper lines
  var gridL = new THREE.GridHelper(Math.max(roomL, roomW), Math.max(numCols, numRows) * 2, 0x1e293b, 0x141c2e);
  gridL.position.y = 0.005;
  roomGroup.add(gridL);

  // 2. SOUND PRESSURE LEVEL (SPL) HEATMAP MESH
  if (showSplHeatmap) {
    var splResX = 40, splResZ = 30;
    var splGeo = new THREE.PlaneGeometry(roomL, roomW, splResX, splResZ);
    var posAttr = splGeo.attributes.position;
    var count = posAttr.count;
    var colors = [];

    for (var i = 0; i < count; i++) {
      var vx = posAttr.getX(i);
      var vz = -posAttr.getY(i);
      var ptSpl = getPointSpl(vx + roomL/2, vz + roomW/2, earH, spkList.map(function(s) { return { x: s.x + roomL/2, y: s.z + roomW/2, z: roomH }; }), spl1m);

      var c = new THREE.Color();
      if (ptSpl < 84) c.setRGB(0.12, 0.23, 0.54);       // Deep Blue
      else if (ptSpl < 88) c.setRGB(0.01, 0.52, 0.78);  // Cyan
      else if (ptSpl < 92) c.setRGB(0.06, 0.72, 0.50);  // Emerald Green
      else if (ptSpl < 96) c.setRGB(0.98, 0.80, 0.08);  // Yellow
      else if (ptSpl < 100) c.setRGB(0.98, 0.45, 0.09); // Orange
      else c.setRGB(0.94, 0.27, 0.27);                  // High Red

      colors.push(c.r, c.g, c.b);
    }

    splGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    var splMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    var splMesh = new THREE.Mesh(splGeo, splMat);
    splMesh.rotation.x = -Math.PI / 2;
    splMesh.position.y = 0.03;
    splMesh.userData = { type: 'splProbe', spl: earSpl };
    roomGroup.add(splMesh);
    threeSpkMicState.interactiveObjects.push(splMesh);
  }

  // 3. ARCHITECTURAL ACOUSTIC WALLS (Back Wall & Left Wall)
  var wallBackGeo = new THREE.BoxGeometry(roomL, roomH, 0.08);
  var wallBackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
  var wallBack = new THREE.Mesh(wallBackGeo, wallBackMat);
  wallBack.position.set(0, roomH / 2.0, -roomW / 2.0 - 0.04);
  roomGroup.add(wallBack);

  // Vertical acoustic diffusers on back wall
  var numSlats = Math.floor(roomL * 2.5);
  var slatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  for (var s = 0; s < numSlats; s++) {
    var slatGeo = new THREE.BoxGeometry(0.04, roomH * 0.85, 0.03);
    var slat = new THREE.Mesh(slatGeo, slatMat);
    var slatX = -roomL/2 + (roomL / (numSlats + 1)) * (s + 1);
    slat.position.set(slatX, roomH * 0.45, -roomW / 2.0);
    roomGroup.add(slat);
  }

  // Left Wall at X = -roomL / 2
  var wallLeftGeo = new THREE.BoxGeometry(0.08, roomH, roomW);
  var wallLeftMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 });
  var wallLeft = new THREE.Mesh(wallLeftGeo, wallLeftMat);
  wallLeft.position.set(-roomL / 2.0 - 0.04, roomH / 2.0, 0);
  roomGroup.add(wallLeft);

  // Perimeter LED Cove Lighting Strip along floor
  var coveGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(roomL/2, 0.02, -roomW/2),
    new THREE.Vector3(-roomL/2, 0.02, -roomW/2),
    new THREE.Vector3(-roomL/2, 0.02, roomW/2)
  ]);
  var coveMat = new THREE.LineBasicMaterial({ color: 0x0284c7 });
  var coveLine = new THREE.Line(coveGeo, coveMat);
  roomGroup.add(coveLine);

  // 4. CEILING BOUNDARY FRAME
  var ceilEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(roomL, 0.05, roomW));
  var ceilLine = new THREE.LineSegments(ceilEdges, new THREE.LineBasicMaterial({ color: 0x475569 }));
  ceilLine.position.y = roomH;
  roomGroup.add(ceilLine);

  // 5. LISTENER EAR PLANE (1.2m AFF)
  var earPlaneGeo = new THREE.PlaneGeometry(roomL, roomW);
  var earPlaneMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.06,
    side: THREE.DoubleSide
  });
  var earPlaneMesh = new THREE.Mesh(earPlaneGeo, earPlaneMat);
  earPlaneMesh.rotation.x = -Math.PI / 2;
  earPlaneMesh.position.y = earH;
  roomGroup.add(earPlaneMesh);

  var earEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(roomL, 0.01, roomW));
  var earEdgesLine = new THREE.LineSegments(earEdges, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 }));
  earEdgesLine.position.y = earH;
  roomGroup.add(earEdgesLine);

  // 6. CONFERENCE TABLE & SEATED PARTICIPANT AVATARS
  var tWid = Math.min(1.4, roomW * 0.4);
  if (showTable) {
    var tableGeo = new THREE.BoxGeometry(tableL, 0.06, tWid);
    var tableMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.25,
      metalness: 0.15
    });
    var tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0, 0.75, 0);
    tableMesh.castShadow = true;
    tableMesh.receiveShadow = true;
    roomGroup.add(tableMesh);

    // Metallic Pedestal Legs
    var legMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    var leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.72, 16), legMat);
    leg1.position.set(-tableL * 0.3, 0.36, 0);
    var leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.72, 16), legMat);
    leg2.position.set(tableL * 0.3, 0.36, 0);
    roomGroup.add(leg1);
    roomGroup.add(leg2);

    // Seated Chairs & Avatars
    var numChairsPerSide = Math.max(2, Math.floor(participants / 2));
    var chairSeatMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    var avatarMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });

    for (var chIdx = 0; chIdx < numChairsPerSide; chIdx++) {
      var seatX = -tableL / 2.0 + (tableL / (numChairsPerSide + 1)) * (chIdx + 1);

      [-tWid/2 - 0.35, tWid/2 + 0.35].forEach(function(seatZ) {
        var chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.42), chairSeatMat);
        chairSeat.position.set(seatX, 0.48, seatZ);
        roomGroup.add(chairSeat);

        var chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.05), chairSeatMat);
        chairBack.position.set(seatX, 0.72, seatZ + (seatZ > 0 ? 0.2 : -0.2));
        roomGroup.add(chairBack);

        var headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), avatarMat);
        headMesh.position.set(seatX, earH, seatZ);
        roomGroup.add(headMesh);
      });
    }
  }

  // 7. CEILING LOUDSPEAKERS & VOLUMETRIC 3D SOUND CONES
  var spkBezelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
  var spkGrilleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  var spkLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  spkList.forEach(function(spk, idx) {
    var spkId = idx + 1;
    var spkGroup = new THREE.Group();
    spkGroup.position.set(spk.x, roomH, spk.z);

    // Bezel & Grille
    var bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.03, 24), spkBezelMat);
    var grille = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.035, 24), spkGrilleMat);
    var led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), spkLedMat);
    led.position.set(0.12, -0.02, 0);

    spkGroup.add(bezel);
    spkGroup.add(grille);
    spkGroup.add(led);

    // 3D Volumetric Sound Cone
    var overlapX = Math.max(0, covDiameter - actualSpacingX);
    var overlapY = Math.max(0, covDiameter - actualSpacingY);

    if (showCones) {
      var coneGeo = new THREE.ConeGeometry(covRadius, throwDist, 32, 1, true);
      coneGeo.translate(0, -throwDist / 2.0, 0);
      // Apex at ceiling (0,0,0), base expands DOWNWARDS along -Y to (0,-throwDist,0)

      var coneMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.26,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      var coneMesh = new THREE.Mesh(coneGeo, coneMat);
      spkGroup.add(coneMesh);

      // Central downward throw axis vector and downward arrow tip
      var throwAxisPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -throwDist, 0)];
      var throwAxisLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(throwAxisPts), new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.85 }));
      spkGroup.add(throwAxisLine);

      // Downward conical arrow head at ear level
      var arrowCone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      arrowCone.rotation.x = Math.PI; // Point apex DOWNWARDS into room
      arrowCone.position.set(0, -throwDist + 0.08, 0);
      spkGroup.add(arrowCone);

      // Downward expanding acoustic wavefront rings
      [0.35, 0.70].forEach(function(frac) {
        var ringR = covRadius * frac;
        var wfRing = new THREE.Mesh(new THREE.RingGeometry(ringR * 0.95, ringR, 32), new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
        wfRing.rotation.x = -Math.PI / 2;
        wfRing.position.y = -throwDist * frac;
        spkGroup.add(wfRing);
      });

      // Acoustic dispersion ray lines pointing downwards
      for (var rAngle = 0; rAngle < Math.PI * 2; rAngle += Math.PI / 2) {
        var rayX = covRadius * Math.cos(rAngle);
        var rayZ = covRadius * Math.sin(rAngle);
        var rayPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(rayX, -throwDist, rayZ)];
        var rayLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(rayPts), new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.4 }));
        spkGroup.add(rayLine);
      }
    }

    // Ear Plane Overlap Footprint Ring
    if (showOverlap) {
      var ringGeo = new THREE.RingGeometry(covRadius * 0.97, covRadius, 48);
      var ringMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      var ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = -throwDist + 0.01;
      spkGroup.add(ringMesh);
    }

    spkGroup.userData = {
      type: 'speaker',
      id: spkId,
      col: spk.col,
      row: spk.row,
      x: (spk.x + roomL/2).toFixed(2),
      y: (spk.z + roomW/2).toFixed(2),
      z: roomH.toFixed(2),
      diam: covDiameter.toFixed(2),
      area: singleArea.toFixed(2),
      spl: earSpl.toFixed(1),
      overlapX: overlapX.toFixed(2),
      overlapY: overlapY.toFixed(2)
    };

    roomGroup.add(spkGroup);
    threeSpkMicState.interactiveObjects.push(spkGroup);
  });

  // 8. MICROPHONE ARRAY & 3D STEERED BEAMFORMING LOBES
  if (showMic) {
    var isCeilingMic = (micType === 'ceiling_array');
    var numTiles = getEffectiveMicCount(tableL, roomL, participants, micType);
    var captureRadius = isCeilingMic ? 4.0 : 1.8;
    var directivityQ = isCeilingMic ? 2.8 : 2.0;
    var dcVal = (0.057 * Math.sqrt(roomL * roomW * roomH / 0.55)).toFixed(2);
    var currentTalkerDistSetting = parseFloat(document.getElementById('micTalkerDistRange')?.value) || parseFloat(document.getElementById('micTalkerDistInput')?.value) || 1.8;

    for (var tileIdx = 0; tileIdx < numTiles; tileIdx++) {
      var micX = (numTiles === 1 ? 0 : (-tableL / 2.0 + (tableL / (numTiles + 1)) * (tileIdx + 1))) + micArrayOffset.x;
      var micZ = micArrayOffset.y;
      var micY = isCeilingMic ? (roomH - 0.015) : 0.76;
      var micGroup = new THREE.Group();
      micGroup.position.set(micX, micY, micZ);

      if (isCeilingMic) {
        var tileMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.6), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.4, roughness: 0.3 }));
        var ledHalo = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.28, 32), new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide }));
        ledHalo.rotation.x = -Math.PI / 2;
        ledHalo.position.y = -0.016;
        micGroup.add(tileMesh);
        micGroup.add(ledHalo);

        // 3D Full Capture Envelope / Dome
        var capGeo = new THREE.SphereGeometry(captureRadius, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
        var capMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false });
        var capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.rotation.x = Math.PI;
        micGroup.add(capMesh);

        var capWire = new THREE.LineSegments(new THREE.WireframeGeometry(capGeo), new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.14 }));
        capWire.rotation.x = Math.PI;
        micGroup.add(capWire);
      } else {
        // Table boundary / gooseneck mic pod
        var podMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 }));
        var podLed = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.10, 24), new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide }));
        podLed.rotation.x = -Math.PI / 2;
        podLed.position.y = 0.021;
        micGroup.add(podMesh);
        micGroup.add(podLed);

        var podCapGeo = new THREE.SphereGeometry(captureRadius, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        var podCapMesh = new THREE.Mesh(podCapGeo, new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }));
        micGroup.add(podCapMesh);
      }
      roomGroup.add(micGroup);

      if (showBeamLobes) {
        var lobeDataList = [];
        micLobeAngles.forEach(function(lobe) {
          var azRad = lobe.azimuth * Math.PI / 180.0;
          var elRad = lobe.elevation * Math.PI / 180.0;
          var horiz = Math.cos(elRad);
          var dirX = Math.cos(azRad) * horiz;
          var dirZ = Math.sin(azRad) * horiz;
          // Ceiling mic points DOWNWARDS into room (-sin), Table mic points UPWARDS (+sin)
          var dirY = isCeilingMic ? -Math.sin(elRad) : Math.sin(elRad);
          var dir = new THREE.Vector3(dirX, dirY, dirZ).normalize();

          var verticalDrop = isCeilingMic ? Math.max(0.2, roomH - (earH + 0.1)) : Math.max(0.2, earH - 0.76);
          var beamLen = verticalDrop / Math.max(0.15, Math.sin(elRad));
          beamLen = Math.min(Math.max(beamLen, 0.8), isCeilingMic ? 12.0 : 2.5);

          var originVec = new THREE.Vector3(micX, micY, micZ);
          var targetVec = originVec.clone().add(dir.clone().multiplyScalar(beamLen));

          var steerAngle = Math.round(90 - lobe.elevation);
          var talkerDist = currentTalkerDistSetting / Math.max(0.25, Math.sin(elRad));
          var snrVal = calculateLobeSnr(talkerDist, directivityQ);
          var snrInfo = getLobeSnrColor(snrVal);
          var lobeBaseRadius = isCeilingMic ? 0.45 : 0.35;

          lobeDataList.push({
            lobe: lobe,
            dir: dir,
            originVec: originVec,
            targetVec: targetVec,
            beamLen: beamLen,
            baseRadius: lobeBaseRadius,
            steerAngle: steerAngle,
            talkerDist: talkerDist,
            snrVal: snrVal,
            snrInfo: snrInfo,
            conflictingLobes: []
          });
        });

        // Compute spatial overlaps between beamforming lobes
        // Two lobes conflict if angular separation is smaller than beam acceptance angle (2 * halfAngle)
        // or their target capture zones overlap significantly in 3D space
        var halfAngle = Math.atan2(isCeilingMic ? 0.45 : 0.35, 1.0); // half-cone angle
        for (var i = 0; i < lobeDataList.length; i++) {
          for (var j = i + 1; j < lobeDataList.length; j++) {
            var lA = lobeDataList[i];
            var lB = lobeDataList[j];
            var dot = Math.max(-1, Math.min(1, lA.dir.dot(lB.dir)));
            var angleBetween = Math.acos(dot);
            var distTargets = lA.targetVec.distanceTo(lB.targetVec);
            var combinedRadius = lA.baseRadius + lB.baseRadius;

            // Conflict threshold: angle < 22 degrees or 3D target distance < 0.85m
            if (angleBetween < (halfAngle * 1.5) || distTargets < 0.85) {
              lA.conflictingLobes.push(lB.lobe.id);
              lB.conflictingLobes.push(lA.lobe.id);

              if (showLobeOverlap) {
                // Highlight the spatial conflict / acoustic interference zone in distinct purple (#a855f7)
                var midTgt = lA.targetVec.clone().add(lB.targetVec).multiplyScalar(0.5);
                var midAxis = lA.originVec.clone().add(midTgt).multiplyScalar(0.5);
                var conflictDist = Math.max(0.25, distTargets);

                // 1. Conflict Warning Sphere at Intersection of Target Captures
                var conflictGeo = new THREE.SphereGeometry(Math.max(0.18, conflictDist * 0.55), 18, 18);
                var conflictMat = new THREE.MeshStandardMaterial({
                  color: 0xa855f7, // Distinct purple warning color
                  emissive: 0x9333ea,
                  emissiveIntensity: 0.85,
                  transparent: true,
                  opacity: 0.72,
                  roughness: 0.2,
                  metalness: 0.1
                });
                var conflictMesh = new THREE.Mesh(conflictGeo, conflictMat);
                conflictMesh.position.copy(midTgt);

                // 2. Conflict Warning Ring
                var ringConflict = new THREE.Mesh(
                  new THREE.RingGeometry(0.22, 0.38, 28),
                  new THREE.MeshBasicMaterial({ color: 0xc084fc, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
                );
                ringConflict.rotation.x = -Math.PI / 2;
                ringConflict.position.set(midTgt.x, midTgt.y + 0.015, midTgt.z);

                // 3. Acoustic Interference dashed link between conflicting beam origins/targets
                var conflictLinePts = [lA.targetVec, lB.targetVec];
                var conflictLine = new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(conflictLinePts),
                  new THREE.LineBasicMaterial({ color: 0xd8b4fe, linewidth: 2 })
                );

                var conflictGroup = new THREE.Group();
                conflictGroup.add(conflictMesh);
                conflictGroup.add(ringConflict);
                conflictGroup.add(conflictLine);
                conflictGroup.userData = {
                  type: 'conflictZone',
                  lobeA: lA.lobe.id,
                  lobeB: lB.lobe.id,
                  angleDeg: (angleBetween * 180 / Math.PI).toFixed(1),
                  distM: distTargets.toFixed(2)
                };
                roomGroup.add(conflictGroup);
                threeSpkMicState.interactiveObjects.push(conflictGroup);
              }
            }
          }
        }

        // Render each beamforming lobe with SNR saturation, opacity & conflict status
        lobeDataList.forEach(function(item) {
          var lobe = item.lobe;
          var originVec = item.originVec;
          var targetVec = item.targetVec;
          var dir = item.dir;
          var beamLen = item.beamLen;
          var steerAngle = item.steerAngle;
          var talkerDist = item.talkerDist;
          var snrInfo = item.snrInfo;
          var hasConflict = item.conflictingLobes.length > 0;

          // Color & Opacity with SNR saturation: higher SNR -> higher saturation & higher opacity
          var snrColorInt = (snrInfo.r << 16) + (snrInfo.g << 8) + snrInfo.b;
          var lobeOpacity = snrInfo.opacity; // 0.28 to 0.70 based on SNR

          // If lobe is in conflict and overlap warnings are enabled, apply purple rim/accent
          var beamMatColor = hasConflict ? (showLobeOverlap ? 0x9333ea : snrColorInt) : snrColorInt;

          var beamGeo = new THREE.ConeGeometry(item.baseRadius, beamLen, 24, 1, true);
          beamGeo.translate(0, -beamLen / 2.0, 0);

          var beamMat = new THREE.MeshBasicMaterial({
            color: hasConflict && showLobeOverlap ? 0xa855f7 : snrColorInt,
            transparent: true,
            opacity: hasConflict && showLobeOverlap ? Math.min(0.75, lobeOpacity + 0.15) : lobeOpacity,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
          });
          var beamMesh = new THREE.Mesh(beamGeo, beamMat);
          beamMesh.position.copy(originVec);
          beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone());

          var rayPts = [originVec, targetVec];
          var rayCol = hasConflict && showLobeOverlap ? 0xc084fc : snrColorInt;
          var steerRay = new THREE.Line(new THREE.BufferGeometry().setFromPoints(rayPts), new THREE.LineBasicMaterial({ color: rayCol, transparent: true, opacity: Math.min(0.95, lobeOpacity + 0.2) }));

          var orbCol = hasConflict && showLobeOverlap ? 0xa855f7 : snrColorInt;
          var tgtOrb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), new THREE.MeshBasicMaterial({ color: orbCol }));
          tgtOrb.position.copy(targetVec);

          var lobeGroup = new THREE.Group();
          lobeGroup.add(beamMesh);
          lobeGroup.add(steerRay);
          lobeGroup.add(tgtOrb);

          lobeGroup.userData = {
            type: 'lobe',
            id: lobe.id,
            micIdx: tileIdx + 1,
            azimuth: lobe.azimuth,
            elevation: lobe.elevation,
            steerAngle: steerAngle,
            talkerDist: talkerDist.toFixed(2),
            snr: snrInfo.snrDb,
            rating: snrInfo.rating,
            colorHex: snrInfo.hex,
            saturation: snrInfo.saturation,
            opacity: (lobeOpacity * 100).toFixed(0),
            radius: captureRadius.toFixed(2),
            targetZone: lobe.name,
            dc: dcVal,
            directivityQ: directivityQ,
            conflictingLobes: item.conflictingLobes,
            hasConflict: hasConflict
          };

          roomGroup.add(lobeGroup);
          threeSpkMicState.interactiveObjects.push(lobeGroup);
        });

        if (showLobeOverlap) {
          var ovPts = [
            new THREE.Vector3(-tableL/2 - 0.25, earH + 0.02, -tWid/2 - 0.3),
            new THREE.Vector3(tableL/2 + 0.25, earH + 0.02, -tWid/2 - 0.3),
            new THREE.Vector3(tableL/2 + 0.25, earH + 0.02, tWid/2 + 0.3),
            new THREE.Vector3(-tableL/2 - 0.25, earH + 0.02, tWid/2 + 0.3),
            new THREE.Vector3(-tableL/2 - 0.25, earH + 0.02, -tWid/2 - 0.3)
          ];
          var ovLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ovPts), new THREE.LineBasicMaterial({ color: 0x22d3ee }));
          roomGroup.add(ovLine);
        }
      }
    }
  }

  threeSpkMicState.scene.add(roomGroup);
  if (threeSpkMicState.renderer && threeSpkMicState.camera) {
    threeSpkMicState.renderer.render(threeSpkMicState.scene, threeSpkMicState.camera);
  }
  return true;
}

function renderSpkMicCombinedVisualizer(roomL, roomW, roomH, earH, totalSpeakers, numCols, numRows, actualSpacingX, actualSpacingY, covRadius, spl1m) {
  var container = document.getElementById('spkMicCombined3ViewSvgContainer');
  if (!container) return;

  var rawTable = parseFloat(document.getElementById('spkTableLength')?.value) || 4000;
  var tableL = rawTable > 50 ? rawTable / 1000.0 : rawTable;
  var participants = parseInt(document.getElementById('spkParticipantsCount')?.value) || 10;
  var micType = document.getElementById('micTypeSelect')?.value || 'ceiling_array';

  var isMicInUse = (document.getElementById('chkMicInUse')?.checked !== false) && micInUseState;
  var showSplHeatmap = (document.getElementById('chkShowSplHeatmap')?.checked || document.getElementById('chkShowSplHeatmapTop')?.checked);
  var showMicSensHeatmap = document.getElementById('chkShowMicSensHeatmap')?.checked;

  var showCones = document.getElementById('chkShowSpkCones')?.checked !== false;
  var showMic = isMicInUse && (document.getElementById('chkShowMicLobes')?.checked !== false);
  var showOverlap = document.getElementById('chkShowOverlap')?.checked !== false;
  var showTable = document.getElementById('chkShowTableSeats')?.checked !== false;
  var showBeamLobes = isMicInUse && (document.getElementById('chkShowBeamLobes')?.checked !== false);
  var showLobeOverlap = isMicInUse && (document.getElementById('chkShowLobeOverlap')?.checked !== false);

  // Ensure floating tooltip & controls exist inside container
  ensureSpkMicContainerControls(container);

  if (currentSpkMicViewMode === '3D') {
    var webglOk = renderSpkMicThreeStudio(container, roomL, roomW, roomH, earH, numCols, numRows, actualSpacingX, actualSpacingY, covRadius, tableL, participants, micType, showCones, showMic, showOverlap, showTable, showBeamLobes, showLobeOverlap, showSplHeatmap, showMicSensHeatmap, spl1m);
    if (!webglOk) {
      if (threeSpkMicState.renderer && threeSpkMicState.renderer.domElement) {
        threeSpkMicState.renderer.domElement.style.display = 'none';
      }
      renderSpkMic3DAcousticStudio(container, roomL, roomW, roomH, earH, numCols, numRows, actualSpacingX, actualSpacingY, covRadius, tableL, participants, micType, showCones, showMic, showOverlap, showTable, showBeamLobes, showLobeOverlap, showSplHeatmap, showMicSensHeatmap, spl1m);
      attachSpkMicCombinedEventListeners();
      var badge = document.getElementById('spkMicCurrentViewBadge');
      if (badge) badge.innerText = '3D Isometric (SVG Fallback)';
    } else {
      var badge = document.getElementById('spkMicCurrentViewBadge');
      if (badge) badge.innerText = '3D Realistic WebGL';
    }
  } else if (currentSpkMicViewMode === '3D-svg') {
    if (threeSpkMicState.renderer && threeSpkMicState.renderer.domElement) {
      threeSpkMicState.renderer.domElement.style.display = 'none';
    }
    renderSpkMic3DAcousticStudio(container, roomL, roomW, roomH, earH, numCols, numRows, actualSpacingX, actualSpacingY, covRadius, tableL, participants, micType, showCones, showMic, showOverlap, showTable, showBeamLobes, showLobeOverlap, showSplHeatmap, showMicSensHeatmap, spl1m);
    attachSpkMicCombinedEventListeners();
    var badge = document.getElementById('spkMicCurrentViewBadge');
    if (badge) badge.innerText = '3D Isometric (SVG)';
  } else {
    if (threeSpkMicState.renderer && threeSpkMicState.renderer.domElement) {
      threeSpkMicState.renderer.domElement.style.display = 'none';
    }
    if (currentSpkMicViewMode === 'plan') {
      renderSpkMicGridPlanView(container, roomL, roomW, numCols, numRows, actualSpacingX, actualSpacingY, covRadius, tableL, participants, micType, showCones, showMic, showOverlap, showTable, showBeamLobes, showLobeOverlap, showSplHeatmap, showMicSensHeatmap, spl1m);
    } else if (currentSpkMicViewMode === 'elevation') {
      renderSpkMicElevationView(container, roomL, roomH, earH, numCols, actualSpacingX, covRadius, tableL, micType, showCones, showMic, showBeamLobes);
    }
  }
}

// 1. Interactive 3D Acoustic Studio
function renderSpkMic3DAcousticStudio(container, roomL, roomW, roomH, earH, numCols, numRows, actualSpacingX, actualSpacingY, covRadius, tableL, participants, micType, showCones, showMic, showOverlap, showTable, showBeamLobes, showLobeOverlap, showSplHeatmap, showMicSensHeatmap, spl1m) {
  var totalSpeakers = numCols * numRows;
  var covDiameter = covRadius * 2.0;
  var svgW = 920, svgH = 440;
  var angleRad = (spkMicOrbitAngle * Math.PI) / 180.0;

  var cosA = Math.cos(angleRad);
  var sinA = Math.sin(angleRad);
  var originX = 460;
  var originY = 330;
  var scale = 48.0 * (6.0 / Math.max(roomL, 4.0));

  function project(x, y, z) {
    var isoX = (x * cosA - y * sinA) * scale;
    var isoY = (x * sinA * 0.45 + y * cosA * 0.45 - z * 0.9) * scale;
    return {
      x: originX - (roomL * 0.45 * scale * cosA) + isoX,
      y: originY + isoY
    };
  }

  // Build Speaker 3D List for SPL Calculation
  var spkList = [];
  for (var col = 0; col < numCols; col++) {
    for (var row = 0; row < numRows; row++) {
      var spkX = actualSpacingX * (col + 0.5);
      var spkY = -roomW/2 + actualSpacingY * (row + 0.5);
      spkList.push({ x: spkX, y: spkY, z: roomH });
    }
  }

  // Room vertices
  var f00 = project(0, -roomW/2, 0);
  var fL0 = project(roomL, -roomW/2, 0);
  var fLW = project(roomL, roomW/2, 0);
  var f0W = project(0, roomW/2, 0);

  var c00 = project(0, -roomW/2, roomH);
  var cL0 = project(roomL, -roomW/2, roomH);
  var cLW = project(roomL, roomW/2, roomH);
  var c0W = project(0, roomW/2, roomH);

  // Ear Plane vertices (Z = earH)
  var e00 = project(0, -roomW/2, earH);
  var eL0 = project(roomL, -roomW/2, earH);
  var eLW = project(roomL, roomW/2, earH);
  var e0W = project(0, roomW/2, earH);

  // Table coordinates (center of room)
  var tWid = Math.min(1.4, roomW * 0.4);
  var tX1 = (roomL - tableL) / 2.0;
  var tX2 = tX1 + tableL;
  var tblTL = project(tX1, -tWid/2, 0.75);
  var tblTR = project(tX1, tWid/2, 0.75);
  var tblBR = project(tX2, tWid/2, 0.75);
  var tblBL = project(tX2, -tWid/2, 0.75);

  var covDiameter = covRadius * 2.0;
  var singleArea = Math.PI * covRadius * covRadius;
  var earSpl = parseFloat(document.getElementById('resSpkEarSpl')?.innerText) || 101.3;

  var svgContent = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
    <defs>
      <linearGradient id="spkConeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.85"/>
        <stop offset="50%" stop-color="#f97316" stop-opacity="0.38"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.12"/>
      </linearGradient>
      <radialGradient id="micLobeGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.75"/>
        <stop offset="60%" stop-color="#059669" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="#047857" stop-opacity="0.05"/>
      </radialGradient>
      <linearGradient id="beamSteeredGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.85"/>
        <stop offset="50%" stop-color="#10b981" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#34d399" stop-opacity="0.15"/>
      </linearGradient>
      <radialGradient id="beamHandoverGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.08"/>
      </radialGradient>
      <!-- Dynamic Beamforming Lobe SNR Color Gradients with Custom Palette Mapping -->
      ${(function(){
        var grads = '';
        var numTiles = getEffectiveMicCount(tableL, roomL, participants, micType);
        var directivityQ = (micType === 'ceiling_array') ? 2.8 : 2.0;
        for (var tIdx = 0; tIdx < numTiles; tIdx++) {
          var mX = (numTiles === 1 ? roomL / 2.0 : (tX1 + (tableL / (numTiles + 1)) * (tIdx + 1))) + micArrayOffset.x;
          var mY = micArrayOffset.y;
          micLobeAngles.forEach(function(sec) {
            var azRad = sec.azimuth * Math.PI / 180.0;
            var elRad = sec.elevation * Math.PI / 180.0;
            var horiz = Math.cos(elRad);
            var verticalDrop = Math.max(0.2, roomH - (earH + 0.1));
            var beamLen = verticalDrop / Math.max(0.15, Math.sin(elRad));
            beamLen = Math.min(Math.max(beamLen, 1.0), 10.0);
            var tgtX = mX + Math.cos(azRad) * horiz * beamLen;
            var tgtY = mY + Math.sin(azRad) * horiz * beamLen;
            var tgtZ = earH + 0.1;
            var tDist = Math.sqrt(Math.pow(tgtX - mX, 2) + Math.pow(tgtY - mY, 2) + Math.pow(roomH - tgtZ, 2));
            var snr = calculateLobeSnr(tDist, directivityQ);
            var snrCol = getLobeSnrColor(snr);
            var midColor = (snr >= 23.5) ? customLobePalette.high : ((snr >= 19.0) ? customLobePalette.med : customLobePalette.low);
            grads += `
              <linearGradient id="beamSteeredGrad_${sec.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${snrCol.hex}" stop-opacity="0.88"/>
                <stop offset="55%" stop-color="${midColor}" stop-opacity="0.45"/>
                <stop offset="100%" stop-color="${customLobePalette.low}" stop-opacity="0.12"/>
              </linearGradient>
            `;
          });
        }
        return grads;
      })()}
      <!-- SVG Filter for Color-Coded Gradient Overlay on 3D Floor Plan -->
      <filter id="splFloorHeatmapFilter" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.95 0"/>
      </filter>
    </defs>

    <!-- Room Floor Base -->
    <polygon points="${f00.x},${f00.y} ${fL0.x},${fL0.y} ${fLW.x},${fLW.y} ${f0W.x},${f0W.y}" fill="#0a0f1d" stroke="#1e293b" stroke-width="2"/>
    ${(function(){
      var gridSvg = '';
      for (var gx = 1; gx < roomL; gx += 1.0) {
        var p1 = project(gx, -roomW/2, 0);
        var p2 = project(gx, roomW/2, 0);
        gridSvg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#141c2e" stroke-width="1"/>`;
      }
      return gridSvg;
    })()}

    <!-- Sound Pressure Level (SPL) Heatmap Mesh on Floor/Listener Plane -->
    ${(function(){
      if (!showSplHeatmap) return '';
      var splMeshSvg = '<!-- 3D SPL HEATMAP MESH WITH SVG FILTER OVERLAY --><g filter="url(#splFloorHeatmapFilter)">';
      var nx = 16, ny = 12;
      var dx = roomL / nx;
      var dy = roomW / ny;
      for (var ix = 0; ix < nx; ix++) {
        for (var iy = 0; iy < ny; iy++) {
          var x1 = ix * dx, x2 = (ix + 1) * dx;
          var y1 = -roomW/2 + iy * dy, y2 = -roomW/2 + (iy + 1) * dy;
          var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
          var splVal = getPointSpl(cx, cy, earH, spkList, spl1m);
          var col = getSplHeatmapColor(splVal);

          var p1 = project(x1, y1, 0.04);
          var p2 = project(x2, y1, 0.04);
          var p3 = project(x2, y2, 0.04);
          var p4 = project(x1, y2, 0.04);
          splMeshSvg += `<polygon points="${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}" fill="${col}" stroke="${col}" stroke-width="2"/>`;
        }
      }
      splMeshSvg += '</g>';
      // Floating SPL Color Gradient Legend in Top-Right
      splMeshSvg += `
        <g transform="translate(${svgW - 135}, 20)">
          <rect x="0" y="0" width="120" height="128" fill="#0f172a" stroke="#334155" rx="5" opacity="0.94"/>
          <text x="60" y="16" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#f8fafc" text-anchor="middle">SPL HEATMAP (dBA)</text>
          
          <rect x="12" y="25" width="14" height="11" fill="rgba(239, 68, 68, 0.85)"/>
          <text x="32" y="34" font-size="8" font-family="JetBrains Mono" fill="#fca5a5">&gt;100 dBA (High)</text>

          <rect x="12" y="40" width="14" height="11" fill="rgba(249, 115, 22, 0.85)"/>
          <text x="32" y="49" font-size="8" font-family="JetBrains Mono" fill="#fdba74">96 - 100 dBA</text>

          <rect x="12" y="55" width="14" height="11" fill="rgba(250, 204, 21, 0.85)"/>
          <text x="32" y="64" font-size="8" font-family="JetBrains Mono" fill="#fde047">92 - 96 dBA</text>

          <rect x="12" y="70" width="14" height="11" fill="rgba(16, 185, 129, 0.85)"/>
          <text x="32" y="79" font-size="8" font-family="JetBrains Mono" fill="#6ee7b7">88 - 92 dBA (Opt)</text>

          <rect x="12" y="85" width="14" height="11" fill="rgba(2, 132, 199, 0.85)"/>
          <text x="32" y="94" font-size="8" font-family="JetBrains Mono" fill="#7dd3fc">84 - 88 dBA</text>

          <rect x="12" y="100" width="14" height="11" fill="rgba(30, 58, 138, 0.85)"/>
          <text x="32" y="109" font-size="8" font-family="JetBrains Mono" fill="#93c5fd">&lt;84 dBA (Low)</text>
        </g>
      `;
      return splMeshSvg;
    })()}

    <!-- Walls -->
    <polygon points="${f00.x},${f00.y} ${c00.x},${c00.y} ${cL0.x},${cL0.y} ${fL0.x},${fL0.y}" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
    <polygon points="${fL0.x},${fL0.y} ${cL0.x},${cL0.y} ${cLW.x},${cLW.y} ${fLW.x},${fLW.y}" fill="#0c1322" stroke="#1e293b" stroke-width="1.5"/>

    <!-- Listener Ear Reference Plane AFF (1.2m) -->
    <polygon points="${e00.x},${e00.y} ${eL0.x},${eL0.y} ${eLW.x},${eLW.y} ${e0W.x},${e0W.y}" fill="rgba(56, 189, 248, 0.05)" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="3,3"/>
    <text x="${e00.x-8}" y="${e00.y-4}" font-size="9" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="end">EAR PLANE (1.2m AFF)</text>

    <!-- Ceiling Wireframe Boundary -->
    <polygon points="${c00.x},${c00.y} ${cL0.x},${cL0.y} ${cLW.x},${cLW.y} ${c0W.x},${c0W.y}" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,4"/>

    <!-- Conference Table & Participant Seating -->
    ${showTable ? `
      <polygon points="${tblTL.x},${tblTL.y} ${tblTR.x},${tblTR.y} ${tblBR.x},${tblBR.y} ${tblBL.x},${tblBL.y}" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
      <text x="${(tblTL.x+tblBR.x)/2}" y="${(tblTL.y+tblBR.y)/2+3}" font-size="9.5" font-family="JetBrains Mono" font-weight="bold" fill="#fde68a" text-anchor="middle">CONFERENCE TABLE (${tableL}m)</text>
      <!-- Seated Participant Figures -->
      ${(function(){
        var chairs = '';
        var numChairsPerSide = Math.max(2, Math.floor(participants / 2));
        for (var i = 0; i < numChairsPerSide; i++) {
          var cx = tX1 + (tableL / (numChairsPerSide + 1)) * (i + 1);
          var pLeft = project(cx, -tWid/2 - 0.35, earH);
          var pRight = project(cx, tWid/2 + 0.35, earH);
          chairs += `<circle cx="${pLeft.x}" cy="${pLeft.y}" r="4.5" fill="#38bdf8"/><circle cx="${pRight.x}" cy="${pRight.y}" r="4.5" fill="#38bdf8"/>`;
        }
        return chairs;
      })()}
    ` : ''}

    <!-- Beamforming Microphone Sensitivity Heatmap (Decibel Drop-off Contours) -->
    ${(function(){
      if (!showMicSensHeatmap || !showMic) return '';
      var numTiles = getEffectiveMicCount(tableL, roomL, participants, micType);
      var sensSvg = '<!-- 3D MIC SENSITIVITY HEATMAP -->';
      for (var tileIdx = 0; tileIdx < numTiles; tileIdx++) {
        var micX = numTiles === 1 ? roomL / 2.0 : (tX1 + (tableL / (numTiles + 1)) * (tileIdx + 1));
        var micY = 0;

        // 4 concentric drop-off zones: 0dB (1.5m), -3dB (2.8m), -6dB (4.0m), -9dB (5.5m)
        var zones = [
          { r: 5.5, col: 'rgba(239, 68, 68, 0.08)', stroke: '#ef4444', label: '-9 dB Drop' },
          { r: 4.0, col: 'rgba(245, 158, 11, 0.12)', stroke: '#f59e0b', label: '-6 dB Drop (Crit Dist)' },
          { r: 2.8, col: 'rgba(6, 182, 212, 0.16)', stroke: '#06b6d4', label: '-3 dB Drop' },
          { r: 1.5, col: 'rgba(16, 185, 129, 0.22)', stroke: '#10b981', label: '0 dB (Optimal SNR)' }
        ];

        zones.forEach(function(zn) {
          var ptsStr = '';
          for (var k = 0; k < 16; k++) {
            var ang = (k * Math.PI) / 8.0;
            var pt = project(micX + zn.r * Math.cos(ang), micY + (zn.r * 0.7) * Math.sin(ang), earH);
            ptsStr += `${pt.x},${pt.y} `;
          }
          var tagPt = project(micX + zn.r * 0.95, micY, earH);
          sensSvg += `
            <polygon points="${ptsStr}" fill="${zn.col}" stroke="${zn.stroke}" stroke-width="1.2" stroke-dasharray="3,2"/>
            <text x="${tagPt.x + 3}" y="${tagPt.y + 3}" font-size="7.5" font-family="JetBrains Mono" font-weight="bold" fill="${zn.stroke}">${zn.label}</text>
          `;
        });
      }
      return sensSvg;
    })()}

    <!-- Ceiling Loudspeaker Grid with Dynamic 3D Cones & Interactive Tooltips -->
    ${(function(){
      var spkSvg = '';
      var idx = 1;
      for (var col = 0; col < numCols; col++) {
        for (var row = 0; row < numRows; row++) {
          var currentSpkId = idx++;
          var spkX = actualSpacingX * (col + 0.5);
          var spkY = -roomW/2 + actualSpacingY * (row + 0.5);
          var ceilPos = project(spkX, spkY, roomH);
          var earPos = project(spkX, spkY, earH);

          // Overlap with neighbor speakers
          var overlapX = Math.max(0, covDiameter - actualSpacingX);
          var overlapY = Math.max(0, covDiameter - actualSpacingY);

          // 16-point circular base on ear plane
          var basePoints = [];
          var polyPointsStr = '';
          for (var k = 0; k < 16; k++) {
            var ang = (k * Math.PI) / 8.0;
            var pt = project(spkX + covRadius * Math.cos(ang), spkY + covRadius * Math.sin(ang), earH);
            basePoints.push(pt);
            polyPointsStr += `${pt.x},${pt.y} `;
          }

          // Conical Throw Geometry: Connect apex to base points
          if (showCones) {
            // Find leftmost and rightmost points in projection
            var sortedByX = basePoints.slice().sort((a,b) => a.x - b.x);
            var leftPt = sortedByX[0];
            var rightPt = sortedByX[sortedByX.length - 1];

            spkSvg += `
              <g class="spk-cone-group" opacity="0.88">
                <!-- 3D Conical Volumetric Body (Throwing Downward from Ceiling) -->
                <polygon points="${ceilPos.x},${ceilPos.y} ${leftPt.x},${leftPt.y} ${polyPointsStr} ${rightPt.x},${rightPt.y}" fill="url(#spkConeGrad)"/>
                <line x1="${ceilPos.x}" y1="${ceilPos.y}" x2="${leftPt.x}" y2="${leftPt.y}" stroke="#f97316" stroke-width="1.2" stroke-dasharray="2,2"/>
                <line x1="${ceilPos.x}" y1="${ceilPos.y}" x2="${rightPt.x}" y2="${rightPt.y}" stroke="#f97316" stroke-width="1.2" stroke-dasharray="2,2"/>
                <!-- Downward Central Throw Vector Arrow -->
                <line x1="${ceilPos.x}" y1="${ceilPos.y}" x2="${earPos.x}" y2="${earPos.y}" stroke="#ef4444" stroke-width="1.6" stroke-dasharray="3,2"/>
                <polygon points="${earPos.x-3},${earPos.y-6} ${earPos.x+3},${earPos.y-6} ${earPos.x},${earPos.y}" fill="#ef4444"/>
              </g>
            `;
          }

          // Ear Plane Overlap Footprint Rings
          if (showOverlap) {
            spkSvg += `
              <polygon points="${polyPointsStr}" fill="rgba(239, 68, 68, 0.14)" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="3,2"/>
              <circle cx="${earPos.x}" cy="${earPos.y}" r="2" fill="#ef4444"/>
            `;
          }

          // Ceiling Loudspeaker Unit with Interactive Hover Node
          spkSvg += `
            <g class="spk-interactive-node"
               onmouseenter="inspectSpeaker(${currentSpkId}, ${row+1}, ${col+1}, '${spkX.toFixed(2)}', '${spkY.toFixed(2)}', '${roomH.toFixed(2)}', '${covDiameter.toFixed(2)}', '${singleArea.toFixed(2)}', '${earSpl.toFixed(1)}', '${overlapX.toFixed(2)}', '${overlapY.toFixed(2)}')"
               onmouseleave="resetInspectorBar()"
               onclick="inspectSpeaker(${currentSpkId}, ${row+1}, ${col+1}, '${spkX.toFixed(2)}', '${spkY.toFixed(2)}', '${roomH.toFixed(2)}', '${covDiameter.toFixed(2)}', '${singleArea.toFixed(2)}', '${earSpl.toFixed(1)}', '${overlapX.toFixed(2)}', '${overlapY.toFixed(2)}'); activePinnedSpkId = ${currentSpkId};">
              <circle cx="${ceilPos.x}" cy="${ceilPos.y}" r="9" fill="#1e293b" stroke="#ef4444" stroke-width="2.5"/>
              <circle cx="${ceilPos.x}" cy="${ceilPos.y}" r="4" fill="#f87171"/>
              <text x="${ceilPos.x}" y="${ceilPos.y+3.5}" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="#ffffff" text-anchor="middle">${currentSpkId}</text>
              <title>Loudspeaker #${currentSpkId} (Row ${row+1}, Col ${col+1})&#10;• Individual Coverage Diameter: ${covDiameter.toFixed(2)} m (${(covDiameter/0.3048).toFixed(1)} ft)&#10;• Footprint Area @ Ear: ${singleArea.toFixed(2)} m²&#10;• Throw Distance: ${(roomH-earH).toFixed(2)} m (Ceiling to 1.2m)&#10;• Ear Level SPL: ${earSpl.toFixed(1)} dBA&#10;• Overlap Margin: +${overlapX.toFixed(2)}m (X) / +${overlapY.toFixed(2)}m (Y)</title>
            </g>
          `;
        }
      }
      return spkSvg;
    })()}

    <!-- Microphone Array & 3D Steered Beamforming Lobes -->
    ${showMic ? `
      ${(function(){
        var micSvg = '';
        var numTiles = getEffectiveMicCount(tableL, roomL, participants, micType);
        var captureRadius = (micType === 'ceiling_array') ? 4.0 : ((micType === 'table_boundary') ? 1.8 : 0.8);
        var directivityQ = (micType === 'ceiling_array') ? 2.8 : 2.0;
        var dc = (0.057 * Math.sqrt(roomL * roomW * roomH / 0.55)).toFixed(2);

        for (var tileIdx = 0; tileIdx < numTiles; tileIdx++) {
          var micX = (numTiles === 1 ? roomL / 2.0 : (tX1 + (tableL / (numTiles + 1)) * (tileIdx + 1))) + micArrayOffset.x;
          var micY = micArrayOffset.y;
          var ceilMic = project(micX, micY, roomH);
          var tableMic = project(micX, micY, 0.75);

          if (micType === 'ceiling_array') {
            // 1. Ceiling Tile Body
            micSvg += `
              <rect x="${ceilMic.x-14}" y="${ceilMic.y-7}" width="28" height="14" fill="#10b981" stroke="#ffffff" stroke-width="1.8" rx="3"/>
              <circle cx="${ceilMic.x+9}" cy="${ceilMic.y}" r="2" fill="#22d3ee"/>
              <text x="${ceilMic.x}" y="${ceilMic.y-10}" font-size="9" font-family="JetBrains Mono" font-weight="bold" fill="#34d399" text-anchor="middle">MIC ARRAY TILE ${numTiles > 1 ? '#' + (tileIdx+1) : ''}</text>
            `;

            // 2. 8 Distinct Steerable Beamforming Lobes (if enabled)
            if (showBeamLobes) {
              var svgLobeDataList = [];
              micLobeAngles.forEach(function(sec) {
                var azRad = sec.azimuth * Math.PI / 180.0;
                var elRad = sec.elevation * Math.PI / 180.0;
                var horiz = Math.cos(elRad);
                var verticalDrop = Math.max(0.2, roomH - (earH + 0.1));
                var beamLen = verticalDrop / Math.max(0.15, Math.sin(elRad));
                beamLen = Math.min(Math.max(beamLen, 1.0), 10.0);

                var tgtX = micX + Math.cos(azRad) * horiz * beamLen;
                var tgtY = micY + Math.sin(azRad) * horiz * beamLen;
                var tgtZ = earH + 0.1;
                var pTgt = project(tgtX, tgtY, tgtZ);

                var azDeg = sec.azimuth;
                var elDeg = sec.elevation;
                var steerAngle = Math.abs(Math.round(90 - elDeg));
                var talkerDist = Math.sqrt(Math.pow(tgtX - micX, 2) + Math.pow(tgtY - micY, 2) + Math.pow(roomH - tgtZ, 2));
                var snr = calculateLobeSnr(talkerDist, directivityQ);
                var snrInfo = getLobeSnrColor(snr);

                // Lobe teardrop base points
                var lobeR = 0.65;
                var pLobeL = project(tgtX - lobeR*0.7, tgtY - lobeR*0.4, tgtZ);
                var pLobeR = project(tgtX + lobeR*0.7, tgtY + lobeR*0.4, tgtZ);

                svgLobeDataList.push({
                  sec: sec,
                  tgtX: tgtX,
                  tgtY: tgtY,
                  tgtZ: tgtZ,
                  pTgt: pTgt,
                  pLobeL: pLobeL,
                  pLobeR: pLobeR,
                  azDeg: azDeg,
                  elDeg: elDeg,
                  steerAngle: steerAngle,
                  talkerDist: talkerDist,
                  snrInfo: snrInfo,
                  conflicts: []
                });
              });

              // Check pairwise conflicts for SVG 3D
              for (var si = 0; si < svgLobeDataList.length; si++) {
                for (var sj = si + 1; sj < svgLobeDataList.length; sj++) {
                  var sa = svgLobeDataList[si];
                  var sb = svgLobeDataList[sj];
                  var dist3d = Math.sqrt(Math.pow(sa.tgtX - sb.tgtX, 2) + Math.pow(sa.tgtY - sb.tgtY, 2));
                  var dAz = Math.abs(sa.azDeg - sb.azDeg);
                  if (dAz > 180) dAz = 360 - dAz;
                  if (dist3d < 0.85 || dAz < 22) {
                    sa.conflicts.push(sb.sec.id);
                    sb.conflicts.push(sa.sec.id);

                    if (showLobeOverlap) {
                      // Distinct Purple conflict warning marker between the overlapping lobes
                      var pMid = { x: (sa.pTgt.x + sb.pTgt.x) / 2, y: (sa.pTgt.y + sb.pTgt.y) / 2 };
                      micSvg += `
                        <!-- Lobe Conflict Warning Marker (#a855f7 Distinct Purple) -->
                        <g class="lobe-conflict-marker">
                          <circle cx="${pMid.x}" cy="${pMid.y}" r="11" fill="rgba(168, 85, 247, 0.45)" stroke="#a855f7" stroke-width="2.5" stroke-dasharray="3,2"/>
                          <circle cx="${pMid.x}" cy="${pMid.y}" r="4" fill="#c084fc"/>
                          <line x1="${sa.pTgt.x}" y1="${sa.pTgt.y}" x2="${sb.pTgt.x}" y2="${sb.pTgt.y}" stroke="#d8b4fe" stroke-width="1.8" stroke-dasharray="2,2"/>
                          <title>Audio Interference / Phase Conflict Warning!&#10;Spatial overlap between Lobe #${sa.sec.id} and Lobe #${sb.sec.id}&#10;• Center Distance: ${dist3d.toFixed(2)}m&#10;• Phase comb filtering or audio cancellation risk!</title>
                        </g>
                      `;
                    }
                  }
                }
              }

              svgLobeDataList.forEach(function(item) {
                var sec = item.sec;
                var pTgt = item.pTgt;
                var pLobeL = item.pLobeL;
                var pLobeR = item.pLobeR;
                var steerAngle = item.steerAngle;
                var azDeg = item.azDeg;
                var elDeg = item.elDeg;
                var talkerDist = item.talkerDist;
                var snrInfo = item.snrInfo;
                var hasConflict = item.conflicts.length > 0;
                var lobeFill = (hasConflict && showLobeOverlap) ? '#a855f7' : `url(#beamSteeredGrad_${sec.id})`;
                var lobeStroke = (hasConflict && showLobeOverlap) ? '#c084fc' : snrInfo.hex;
                var lobeOpacity = (hasConflict && showLobeOverlap) ? '0.88' : snrInfo.opacity.toFixed(2);

                micSvg += `
                  <g class="lobe-interactive-node"
                     data-lobe-id="${sec.id}"
                     data-lobe-name="${sec.name}"
                     data-steer-angle="${steerAngle}"
                     data-azimuth="${azDeg}"
                     data-elevation="${elDeg}"
                     data-talker-dist="${talkerDist.toFixed(2)}"
                     data-snr="${snrInfo.snrDb}"
                     data-snr-rating="${snrInfo.rating}"
                     data-snr-color="${snrInfo.hex}"
                     data-conflicts="${item.conflicts.join(',')}"
                     data-saturation="${snrInfo.saturation}"
                     data-opacity="${(snrInfo.opacity*100).toFixed(0)}"
                     onmouseenter="inspectBeamformingLobe(${sec.id}, ${tileIdx+1}, ${azDeg}, ${elDeg}, '${steerAngle}', '${talkerDist.toFixed(2)}', '${snrInfo.snrDb}', '${snrInfo.rating}', '${snrInfo.hex}', '${sec.name}', [${item.conflicts.join(',')}])"
                     onmouseleave="resetInspectorBar()">
                    <!-- 3D Steered Lobe Color-Coded by SNR with saturation and opacity (Purple if Conflicted) -->
                    <polygon points="${ceilMic.x},${ceilMic.y} ${pLobeL.x},${pLobeL.y} ${pTgt.x},${pTgt.y} ${pLobeR.x},${pLobeR.y}" fill="${lobeFill}" stroke="${lobeStroke}" stroke-width="${hasConflict && showLobeOverlap ? '2.0' : '1.2'}" opacity="${lobeOpacity}"/>
                    <!-- Steering Axis Ray -->
                    <line x1="${ceilMic.x}" y1="${ceilMic.y}" x2="${pTgt.x}" y2="${pTgt.y}" stroke="${lobeStroke}" stroke-width="1.8" stroke-dasharray="3,2"/>
                    <!-- Participant Target Circle Color-Coded by SNR (Purple border if Conflicted) -->
                    <circle cx="${pTgt.x}" cy="${pTgt.y}" r="6.5" fill="${hasConflict && showLobeOverlap ? '#a855f7' : snrInfo.hex}" stroke="${hasConflict && showLobeOverlap ? '#fdf4ff' : '#ffffff'}" stroke-width="1.8"/>
                    <text x="${pTgt.x}" y="${pTgt.y+3.5}" font-size="7.5" font-family="JetBrains Mono" font-weight="bold" fill="${hasConflict && showLobeOverlap ? '#ffffff' : '#000000'}" text-anchor="middle">${sec.id}</text>
                    <title>Beamforming Steered Lobe #${sec.id} (${sec.name})&#10;• Steer Angle: ${steerAngle}° (from Nadir)&#10;• Steering Direction: Azimuth ${azDeg}°, Elevation ${elDeg}°&#10;• Talker Distance: ${talkerDist.toFixed(2)} m&#10;• SNR: ${snrInfo.snrDb} dB (${snrInfo.rating})&#10;• Saturation: ${snrInfo.saturation}%, Opacity: ${(snrInfo.opacity*100).toFixed(0)}%${hasConflict ? '&#10;• [CONFLICT WARNING] Spatial overlap with Lobe #' + item.conflicts.join(', #') : ''}</title>
                  </g>
                `;
              });

              // Lobe Overlap Zones along table perimeter
              if (showLobeOverlap) {
                var ovTL = project(tX1 - 0.2, -tWid/2 - 0.3, earH);
                var ovTR = project(tX2 + 0.2, -tWid/2 - 0.3, earH);
                var ovBR = project(tX2 + 0.2, tWid/2 + 0.3, earH);
                var ovBL = project(tX1 - 0.2, tWid/2 + 0.3, earH);

                micSvg += `
                  <polygon points="${ovTL.x},${ovTL.y} ${ovTR.x},${ovTR.y} ${ovBR.x},${ovBR.y} ${ovBL.x},${ovBL.y}" fill="none" stroke="#22d3ee" stroke-width="1.8" stroke-dasharray="4,3"/>
                  <rect x="${(ovTL.x+ovTR.x)/2 - 55}" y="${(ovTL.y+ovTR.y)/2 - 16}" width="110" height="15" fill="#0f172a" stroke="#22d3ee" rx="3"/>
                  <text x="${(ovTL.x+ovTR.x)/2}" y="${(ovTL.y+ovTR.y)/2 - 5}" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="#22d3ee" text-anchor="middle">100% BEAM OVERLAP ZONE</text>
                `;
              }
            } else {
              // Classic Wide Hemisphere Pickup
              micSvg += `
                <polygon points="${ceilMic.x},${ceilMic.y} ${tblTL.x-10},${tblTL.y} ${tblTR.x+10},${tblTR.y}" fill="url(#micLobeGrad)"/>
                <polygon points="${ceilMic.x},${ceilMic.y} ${tblBL.x-10},${tblBL.y} ${tblBR.x+10},${tblBR.y}" fill="url(#micLobeGrad)"/>
              `;
            }
          } else {
            // Tabletop Boundary Pod or Gooseneck (Captures UPWARD from table to talker ear plane)
            var numPods = Math.max(1, Math.ceil(tableL / 2.0));
            for (var p = 0; p < numPods; p++) {
              var podX = tX1 + (tableL / (numPods + 1)) * (p + 1);
              var pPos = project(podX, 0, 0.75);
              var pTalkerL = project(podX, -tWid/2 - 0.35, earH);
              var pTalkerR = project(podX, tWid/2 + 0.35, earH);

              micSvg += `
                <g class="lobe-interactive-node"
                   onmouseenter="inspectBeamformingLobe(${p+1}, 1, 0, 90, '${captureRadius.toFixed(2)}', 'Table Boundary Pod #${p+1}', '${dc}', '${directivityQ}')"
                   onmouseleave="resetInspectorBar()">
                  <circle cx="${pPos.x}" cy="${pPos.y}" r="7" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                  <ellipse cx="${pPos.x}" cy="${pPos.y}" rx="${captureRadius * scale * 0.75}" ry="${captureRadius * scale * 0.35}" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="1.8" stroke-dasharray="3,2"/>
                  <title>Boundary Pod Microphone #${p+1}&#10;• Capture Radius: ${captureRadius.toFixed(2)} m (${(captureRadius*2).toFixed(1)}m Zone)&#10;• Capture Direction: UPWARDS (Table surface &rarr; Talker mouth/ear)&#10;• 4 Toroid Steered Lobes&#10;• Overlap Zone: Continuous Table Perimeter Pickup</title>
                </g>
              `;

              // Upward steered capture lobes from table surface to talker mouth/ear level
              if (showBeamLobes) {
                micSvg += `
                  <!-- Upward Capture Lobe to Left Participant (Table &rarr; Mouth/Ear 1.2m) -->
                  <polygon points="${pPos.x},${pPos.y} ${pTalkerL.x - 5},${pTalkerL.y + 4} ${pTalkerL.x},${pTalkerL.y} ${pTalkerL.x + 5},${pTalkerL.y - 4}" fill="rgba(16,185,129,0.32)" stroke="#10b981" stroke-width="1.2"/>
                  <line x1="${pPos.x}" y1="${pPos.y}" x2="${pTalkerL.x}" y2="${pTalkerL.y}" stroke="#10b981" stroke-width="1.6" stroke-dasharray="3,2"/>
                  <polygon points="${pTalkerL.x-2},${pTalkerL.y+5} ${pTalkerL.x+2},${pTalkerL.y+5} ${pTalkerL.x},${pTalkerL.y}" fill="#10b981"/>

                  <!-- Upward Capture Lobe to Right Participant (Table &rarr; Mouth/Ear 1.2m) -->
                  <polygon points="${pPos.x},${pPos.y} ${pTalkerR.x - 5},${pTalkerR.y - 4} ${pTalkerR.x},${pTalkerR.y} ${pTalkerR.x + 5},${pTalkerR.y + 4}" fill="rgba(16,185,129,0.32)" stroke="#10b981" stroke-width="1.2"/>
                  <line x1="${pPos.x}" y1="${pPos.y}" x2="${pTalkerR.x}" y2="${pTalkerR.y}" stroke="#10b981" stroke-width="1.6" stroke-dasharray="3,2"/>
                  <polygon points="${pTalkerR.x-2},${pTalkerR.y+5} ${pTalkerR.x+2},${pTalkerR.y+5} ${pTalkerR.x},${pTalkerR.y}" fill="#10b981"/>
                `;
              }
            }
          }
        }
        return micSvg;
      })()}
    ` : ''}

    <!-- Stat Overlay Box -->
    <rect x="20" y="20" width="340" height="70" fill="#0f172a" stroke="#334155" stroke-width="1.5" rx="6"/>
    <text x="32" y="38" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#facc15">3D ACOUSTIC &amp; BEAMFORMING MATRIX</text>
    <text x="32" y="54" font-size="9" font-family="JetBrains Mono" fill="#94a3b8">Speakers: ${totalSpeakers} Units (${numCols}×${numRows}) | ⌀ ${covDiameter.toFixed(2)}m (${((covDiameter)/0.3048).toFixed(1)}ft) | Throw: ${(roomH-earH).toFixed(2)}m</text>
    <text x="32" y="70" font-size="9" font-family="JetBrains Mono" fill="#34d399">${showMic ? 'Microphone: 8 Steered Beamforming Lobes (100% Table Speech Handover)' : 'Microphones: Bypassed / Sound Reinforcement Mode'}</text>

    <!-- Beamforming Lobe SNR Color Gradient Legend -->
    ${(function(){
      if (!showMic || !showBeamLobes) return '';
      return `
        <g transform="translate(20, 98)">
          <rect x="0" y="0" width="165" height="74" fill="#0f172a" stroke="#334155" stroke-width="1.2" rx="5" opacity="0.94"/>
          <text x="82" y="16" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#f8fafc" text-anchor="middle">LOBE SNR (TALKER DIST)</text>
          
          <rect x="12" y="24" width="14" height="10" fill="${customLobePalette.high}" rx="2"/>
          <text x="32" y="32" font-size="8" font-family="JetBrains Mono" fill="#6ee7b7">&ge;23.5 dB (Optimal)</text>

          <rect x="12" y="39" width="14" height="10" fill="${customLobePalette.med}" rx="2"/>
          <text x="32" y="47" font-size="8" font-family="JetBrains Mono" fill="#fde047">19 - 23 dB (Marginal)</text>

          <rect x="12" y="54" width="14" height="10" fill="${customLobePalette.low}" rx="2"/>
          <text x="32" y="62" font-size="8" font-family="JetBrains Mono" fill="#fca5a5">&lt;19 dB (Poor)</text>
        </g>
      `;
    })()}
  </svg>`;

  var wrapper = getOrCreateSpkMicSvgWrapper(container);
  if (wrapper) {
    wrapper.style.display = 'block';
    wrapper.innerHTML = svgContent;
  }
  ensureSpkMicContainerControls(container);
  attachSpkMicCombinedEventListeners();
}

// 2. Ceiling Grid Plan View
function renderSpkMicGridPlanView(container, roomL, roomW, numCols, numRows, actualSpacingX, actualSpacingY, covRadius, tableL, participants, micType, showCones, showMic, showOverlap, showTable, showBeamLobes, showLobeOverlap, showSplHeatmap, showMicSensHeatmap, spl1m) {
  var svgW = 900, svgH = 410;
  var padX = 75, padY = 55;
  var drawW = svgW - padX * 2;
  var drawH = svgH - padY * 2;

  var scaleX = drawW / roomL;
  var scaleY = drawH / roomW;
  var scale = Math.min(scaleX, scaleY);

  var rW = roomL * scale;
  var rH = roomW * scale;
  var ox = (svgW - rW) / 2;
  var oy = (svgH - rH) / 2;

  var covDiameter = covRadius * 2.0;
  var singleArea = Math.PI * covRadius * covRadius;
  var earSpl = parseFloat(document.getElementById('resSpkEarSpl')?.innerText) || 101.3;

  // Build Speaker list for Plan view SPL calculation
  var spkList = [];
  for (var col = 0; col < numCols; col++) {
    for (var row = 0; row < numRows; row++) {
      var sx = actualSpacingX * (col + 0.5);
      var sy = actualSpacingY * (row + 0.5) - roomW/2;
      spkList.push({ x: sx, y: sy, z: parseFloat(document.getElementById('spkRoomHeight')?.value || 2.7) });
    }
  }

  var svgContent = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
    <!-- Room Outer Shell -->
    <rect x="${ox}" y="${oy}" width="${rW}" height="${rH}" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <text x="${ox+rW/2}" y="${oy-12}" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#94a3b8" text-anchor="middle">ROOM LENGTH: ${roomL.toFixed(1)} m</text>
    <text x="${ox-15}" y="${oy+rH/2}" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#94a3b8" text-anchor="middle" transform="rotate(-90 ${ox-15} ${oy+rH/2})">ROOM WIDTH: ${roomW.toFixed(1)} m</text>

    <!-- SPL Heatmap in Plan View -->
    ${(function(){
      if (!showSplHeatmap) return '';
      var splMeshSvg = '<!-- PLAN VIEW SPL HEATMAP -->';
      var nx = 16, ny = 12;
      var cellW = rW / nx;
      var cellH = rH / ny;
      var dx = roomL / nx;
      var dy = roomW / ny;

      for (var ix = 0; ix < nx; ix++) {
        for (var iy = 0; iy < ny; iy++) {
          var cx = (ix + 0.5) * dx;
          var cy = (iy + 0.5) * dy - roomW/2;
          var splVal = getPointSpl(cx, cy, 1.2, spkList, spl1m);
          var col = getSplHeatmapColor(splVal);
          var px = ox + ix * cellW;
          var py = oy + iy * cellH;
          splMeshSvg += `<rect x="${px}" y="${py}" width="${cellW+0.5}" height="${cellH+0.5}" fill="${col}" opacity="0.65"/>`;
        }
      }
      return splMeshSvg;
    })()}

    <!-- Table in Center -->
    ${showTable ? `
      <rect x="${ox + (roomL-tableL)/2 * scale}" y="${oy + (roomW - roomW*0.35)/2 * scale}" width="${tableL * scale}" height="${roomW*0.35 * scale}" fill="#1e293b" stroke="#f59e0b" stroke-width="2" rx="4"/>
      <text x="${ox+rW/2}" y="${oy+rH/2+4}" font-size="9" font-family="JetBrains Mono" fill="#fde68a" text-anchor="middle">CONFERENCE TABLE (${tableL}m)</text>
    ` : ''}

    <!-- Mic Sensitivity Heatmap in Plan View (Concentric Decibel Drop-off Contours) -->
    ${(function(){
      if (!showMicSensHeatmap || !showMic) return '';
      var micX = ox + rW / 2;
      var micY = oy + rH / 2;
      var zones = [
        { r: 5.5, col: 'rgba(239, 68, 68, 0.08)', stroke: '#ef4444', label: '-9 dB Drop' },
        { r: 4.0, col: 'rgba(245, 158, 11, 0.12)', stroke: '#f59e0b', label: '-6 dB Drop (Crit Dist)' },
        { r: 2.8, col: 'rgba(6, 182, 212, 0.16)', stroke: '#06b6d4', label: '-3 dB Drop' },
        { r: 1.5, col: 'rgba(16, 185, 129, 0.22)', stroke: '#10b981', label: '0 dB (Optimal SNR)' }
      ];
      var sensPlanSvg = '<!-- MIC SENSITIVITY PLAN CONTOURS -->';
      zones.forEach(function(zn) {
        var rPix = zn.r * scale;
        sensPlanSvg += `
          <circle cx="${micX}" cy="${micY}" r="${rPix}" fill="${zn.col}" stroke="${zn.stroke}" stroke-width="1.2" stroke-dasharray="3,2"/>
          <text x="${micX}" y="${micY - rPix + 11}" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="${zn.stroke}" text-anchor="middle">${zn.label}</text>
        `;
      });
      return sensPlanSvg;
    })()}

    <!-- Ceiling Grid Lines -->
    ${(function(){
      var gridSvg = '';
      for (var c = 1; c < numCols; c++) {
        var gx = ox + actualSpacingX * c * scale;
        gridSvg += `<line x1="${gx}" y1="${oy}" x2="${gx}" y2="${oy+rH}" stroke="#334155" stroke-width="1" stroke-dasharray="3,3"/>`;
      }
      for (var r = 1; r < numRows; r++) {
        var gy = oy + actualSpacingY * r * scale;
        gridSvg += `<line x1="${ox}" y1="${gy}" x2="${ox+rW}" y2="${gy}" stroke="#334155" stroke-width="1" stroke-dasharray="3,3"/>`;
      }
      return gridSvg;
    })()}

    <!-- Speakers Coverage Circles with Exact Individual Diameter Tooltips & Labels -->
    ${(function(){
      var spkSvg = '';
      var idx = 1;
      var overlapX = Math.max(0, covDiameter - actualSpacingX);
      var overlapY = Math.max(0, covDiameter - actualSpacingY);

      for (var col = 0; col < numCols; col++) {
        for (var row = 0; row < numRows; row++) {
          var currentSpkId = idx++;
          var spkX = ox + actualSpacingX * (col + 0.5) * scale;
          var spkY = oy + actualSpacingY * (row + 0.5) * scale;
          var rPix = covRadius * scale;

          if (showOverlap) {
            spkSvg += `<circle cx="${spkX}" cy="${spkY}" r="${rPix}" fill="rgba(239,68,68,0.12)" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,2"/>`;
          }

          spkSvg += `
            <g class="spk-interactive-node"
               onmouseenter="inspectSpeaker(${currentSpkId}, ${row+1}, ${col+1}, '${(actualSpacingX*(col+0.5)).toFixed(2)}', '${(actualSpacingY*(row+0.5)).toFixed(2)}', '${parseFloat(document.getElementById('spkRoomHeight')?.value || 2.7).toFixed(2)}', '${covDiameter.toFixed(2)}', '${singleArea.toFixed(2)}', '${earSpl.toFixed(1)}', '${overlapX.toFixed(2)}', '${overlapY.toFixed(2)}')"
               onmouseleave="resetInspectorBar()"
               onclick="inspectSpeaker(${currentSpkId}, ${row+1}, ${col+1}, '${(actualSpacingX*(col+0.5)).toFixed(2)}', '${(actualSpacingY*(row+0.5)).toFixed(2)}', '${parseFloat(document.getElementById('spkRoomHeight')?.value || 2.7).toFixed(2)}', '${covDiameter.toFixed(2)}', '${singleArea.toFixed(2)}', '${earSpl.toFixed(1)}', '${overlapX.toFixed(2)}', '${overlapY.toFixed(2)}')">
              <circle cx="${spkX}" cy="${spkY}" r="9" fill="#ef4444" stroke="#ffffff" stroke-width="1.8"/>
              <text x="${spkX}" y="${spkY+3.5}" font-size="8" font-weight="bold" font-family="JetBrains Mono" fill="#ffffff" text-anchor="middle">${currentSpkId}</text>
              <!-- Leader Dimension Tag -->
              <text x="${spkX}" y="${spkY-12}" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="#fca5a5" text-anchor="middle">⌀ ${covDiameter.toFixed(2)}m</text>
              <title>Loudspeaker #${currentSpkId} (Row ${row+1}, Col ${col+1})&#10;• Individual Coverage Diameter: ${covDiameter.toFixed(2)} m (${(covDiameter/0.3048).toFixed(1)} ft)&#10;• Individual Footprint Area: ${singleArea.toFixed(2)} m²&#10;• Overlap Margin: +${overlapX.toFixed(2)}m X / +${overlapY.toFixed(2)}m Y</title>
            </g>
          `;
        }
      }
      return spkSvg;
    })()}

    <!-- Microphone Array & Beamforming Lobes in Plan View -->
    ${showMic ? `
      ${(function(){
        var numMics = getEffectiveMicCount(tableL, roomL, participants, micType);
        var captureRadius = (micType === 'ceiling_array') ? 4.0 : ((micType === 'table_boundary') ? 1.8 : 0.8);
        var micRadiusPix = captureRadius * scale;
        var micSvg = '';

        for (var mIdx = 0; mIdx < numMics; mIdx++) {
          var micX = numMics === 1 ? (ox + rW / 2) : (ox + ((roomL - tableL)/2 * scale) + ((tableL * scale / (numMics + 1)) * (mIdx + 1)));
          var micY = oy + rH / 2;
          var micId = mIdx + 1;

          if (micType === 'ceiling_array') {
            micSvg += `
              <!-- Outer Beamforming Capture Radius for Mic #${micId} -->
              <circle cx="${micX}" cy="${micY}" r="${micRadiusPix}" fill="rgba(16,185,129,0.06)" stroke="#10b981" stroke-width="2" stroke-dasharray="5,3"/>
              <text x="${micX}" y="${micY - micRadiusPix - 4}" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="#34d399" text-anchor="middle">MIC #${micId} CAPTURE ZONE (⌀ ${(captureRadius*2).toFixed(1)}m)</text>

              <!-- 8 Steered Beamforming Lobes mapped to table quadrants -->
              ${[0, 45, 90, 135, 180, 225, 270, 315].map(function(ang, i) {
                var rad = (ang * Math.PI) / 180.0;
                var lx = micX + (Math.min(2.5, tableL / (numMics * 1.5)) * scale) * Math.cos(rad);
                var ly = micY + (roomW * 0.22 * scale) * Math.sin(rad);
                var distTalker = Math.sqrt(Math.pow(lx - micX, 2) + Math.pow(ly - micY, 2)) / scale;
                var snr = calculateLobeSnr(distTalker + 1.2, 2.8);
                var snrColor = getLobeSnrColor(snr).hex;
                return `
                  <g class="lobe-interactive-node"
                     onmouseenter="inspectBeamformingLobe(${i+1}, ${micId}, ${ang}, 58, '4.00', 'Mic #${micId} Lobe #${i+1}', '${(distTalker+1.2).toFixed(2)}', '2.8')"
                     onmouseleave="resetInspectorBar()">
                    <line x1="${micX}" y1="${micY}" x2="${lx}" y2="${ly}" stroke="${snrColor}" stroke-width="1.3" stroke-dasharray="3,2"/>
                    <circle cx="${lx}" cy="${ly}" r="8" fill="${snrColor}33" stroke="${snrColor}" stroke-width="1.5"/>
                    <text x="${lx}" y="${ly+3}" font-size="7" font-family="JetBrains Mono" font-weight="bold" fill="#ffffff" text-anchor="middle">L${i+1}</text>
                    <title>Mic #${micId} Lobe #${i+1}&#10;• Steered Azimuth: ${ang}°&#10;• SNR: ${snr.toFixed(1)} dB&#10;• Capture Radius: 4.00 m</title>
                  </g>
                `;
              }).join('')}

              <!-- Ceiling Array Tile Unit with ID -->
              <rect x="${micX-14}" y="${micY-14}" width="28" height="28" fill="#10b981" stroke="#ffffff" stroke-width="2" rx="4"/>
              <circle cx="${micX+9}" cy="${micY-9}" r="3" fill="#22d3ee"/>
              <text x="${micX}" y="${micY+4}" font-size="8" font-weight="bold" font-family="JetBrains Mono" fill="#ffffff" text-anchor="middle">M${micId}</text>
            `;
          } else {
            micSvg += `
              <circle cx="${micX}" cy="${micY}" r="${micRadiusPix}" fill="rgba(16,185,129,0.10)" stroke="#10b981" stroke-width="2" stroke-dasharray="5,3"/>
              <rect x="${micX-11}" y="${micY-11}" width="22" height="22" fill="#10b981" stroke="#ffffff" stroke-width="1.5" rx="3"/>
              <text x="${micX}" y="${micY+4}" font-size="8.5" font-weight="bold" font-family="JetBrains Mono" fill="#ffffff" text-anchor="middle">M${micId}</text>
            `;
          }
        }

        // Highlight adjacent mic overlap zones in purple if multiple mics
        if (numMics > 1 && showLobeOverlap) {
          for (var ov = 0; ov < numMics - 1; ov++) {
            var x1 = numMics === 1 ? (ox + rW / 2) : (ox + ((roomL - tableL)/2 * scale) + ((tableL * scale / (numMics + 1)) * (ov + 1)));
            var x2 = numMics === 1 ? (ox + rW / 2) : (ox + ((roomL - tableL)/2 * scale) + ((tableL * scale / (numMics + 1)) * (ov + 2)));
            var midX = (x1 + x2) / 2;
            var sepM = (x2 - x1) / scale;
            if (sepM < captureRadius * 2.0) {
              micSvg += `
                <!-- Inter-Mic Overlap Zone -->
                <ellipse cx="${midX}" cy="${oy + rH / 2}" rx="${Math.max(10, (captureRadius * 2.0 - sepM) * scale * 0.45)}" ry="${roomW * 0.28 * scale}" fill="rgba(168, 85, 247, 0.16)" stroke="#a855f7" stroke-width="1.8" stroke-dasharray="4,2"/>
                <text x="${midX}" y="${oy + rH / 2 + 4}" font-size="7.5" font-family="JetBrains Mono" font-weight="bold" fill="#c084fc" text-anchor="middle">MIC ${ov+1} &amp; ${ov+2} HANDOVER</text>
              `;
            }
          }
        }
        return micSvg;
      })()}
    ` : ''}

    <!-- Dimension Annotation Footer -->
    <text x="${ox+rW/2}" y="${oy+rH+20}" font-size="9.5" font-family="JetBrains Mono" fill="#94a3b8" text-anchor="middle">SPEAKER GRID SPACING: ${actualSpacingX.toFixed(2)}m (X) × ${actualSpacingY.toFixed(2)}m (Y) | COVERAGE DIAMETER: ⌀ ${covDiameter.toFixed(2)}m (${((covDiameter)/0.3048).toFixed(1)}ft)</text>
  </svg>`;
  var wrapper = getOrCreateSpkMicSvgWrapper(container);
  if (wrapper) {
    wrapper.style.display = 'block';
    wrapper.innerHTML = svgContent;
  }
  ensureSpkMicContainerControls(container);
}

// 3. Elevation Section View
function renderSpkMicElevationView(container, roomL, roomH, earH, numCols, actualSpacingX, covRadius, tableL, micType, showCones, showMic, showBeamLobes) {
  var svgW = 900, svgH = 390;
  var padX = 75, padY = 55;
  var drawW = svgW - padX * 2;
  var drawH = svgH - padY * 2;

  var scaleX = drawW / roomL;
  var scaleY = drawH / roomH;
  var scale = Math.min(scaleX, scaleY);

  var rW = roomL * scale;
  var rH = roomH * scale;
  var ox = (svgW - rW) / 2;
  var oy = (svgH - rH) / 2;

  var floorY = oy + rH;
  var ceilingY = oy;
  var earY = floorY - earH * scale;

  var covDiameter = covRadius * 2.0;

  var svgContent = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
    <!-- Floor & Ceiling -->
    <line x1="${ox}" y1="${floorY}" x2="${ox+rW}" y2="${floorY}" stroke="#64748b" stroke-width="3"/>
    <text x="${ox+rW+10}" y="${floorY+4}" font-size="10" font-family="JetBrains Mono" fill="#64748b">FLOOR (0.0m)</text>

    <line x1="${ox}" y1="${ceilingY}" x2="${ox+rW}" y2="${ceilingY}" stroke="#64748b" stroke-width="3"/>
    <text x="${ox+rW+10}" y="${ceilingY+4}" font-size="10" font-family="JetBrains Mono" fill="#64748b">CEILING (${roomH.toFixed(1)}m)</text>

    <!-- Ear Plane -->
    <line x1="${ox}" y1="${earY}" x2="${ox+rW}" y2="${earY}" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3,3"/>
    <text x="${ox+rW+10}" y="${earY+4}" font-size="9" font-family="JetBrains Mono" fill="#38bdf8">EAR PLANE (${earH.toFixed(2)}m AFF)</text>

    <!-- Table in Elevation -->
    <rect x="${ox + (roomL-tableL)/2 * scale}" y="${floorY - 0.75 * scale}" width="${tableL * scale}" height="${0.75 * scale}" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>

    <!-- Ceiling Speakers & Cones along Length with Diameters -->
    ${(function(){
      var spkSvg = '';
      for (var col = 0; col < numCols; col++) {
        var spkX = ox + actualSpacingX * (col + 0.5) * scale;
        var leftX = spkX - covRadius * scale;
        var rightX = spkX + covRadius * scale;

        if (showCones) {
          spkSvg += `
            <polygon points="${spkX},${ceilingY} ${leftX},${earY} ${rightX},${earY}" fill="rgba(239,68,68,0.18)" stroke="#ef4444" stroke-width="1.5"/>
            <!-- Central Downward Throw Vector & Arrow -->
            <line x1="${spkX}" y1="${ceilingY}" x2="${spkX}" y2="${earY}" stroke="#ef4444" stroke-width="1.6" stroke-dasharray="3,2"/>
            <polygon points="${spkX-3},${earY-6} ${spkX+3},${earY-6} ${spkX},${earY}" fill="#ef4444"/>
            <!-- Individual Diameter Dimension Bracket -->
            <line x1="${leftX}" y1="${earY+8}" x2="${rightX}" y2="${earY+8}" stroke="#fca5a5" stroke-width="1.5"/>
            <text x="${spkX}" y="${earY+20}" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="#fca5a5" text-anchor="middle">⌀ ${covDiameter.toFixed(2)}m (Throw &darr;)</text>
          `;
        }

        spkSvg += `
          <g class="spk-interactive-node"
             onmouseenter="inspectSpeaker(${col+1}, 1, ${col+1}, '${(actualSpacingX*(col+0.5)).toFixed(2)}', '0.00', '${roomH.toFixed(2)}', '${covDiameter.toFixed(2)}', '${(Math.PI*covRadius*covRadius).toFixed(2)}', '101.3', '0.00', '0.00')"
             onmouseleave="resetInspectorBar()">
            <rect x="${spkX-8}" y="${ceilingY-4}" width="16" height="8" fill="#ef4444" rx="2"/>
            <circle cx="${spkX}" cy="${ceilingY+4}" r="5" fill="#f87171"/>
            <title>Loudspeaker Unit #${col+1}&#10;Coverage Diameter: ${covDiameter.toFixed(2)} m&#10;Throw: ${(roomH-earH).toFixed(2)} m (Ceiling &rarr; Ear)</title>
          </g>
        `;
      }
      return spkSvg;
    })()}

    <!-- Microphone with Vertical Beamforming Lobes in Center -->
    ${showMic ? `
      ${(function(){
        var numMics = getEffectiveMicCount(tableL, roomL, participants, micType);
        var micSvg = '';
        for (var mIdx = 0; mIdx < numMics; mIdx++) {
          var micX = numMics === 1 ? (ox + rW / 2) : (ox + ((roomL - tableL)/2 * scale) + ((tableL * scale / (numMics + 1)) * (mIdx + 1)));
          var micId = mIdx + 1;
          if (micType === 'ceiling_array') {
            micSvg += `
              <!-- Vertical 3D Beamforming Lobes for Mic #${micId} -->
              <polygon points="${micX},${ceilingY} ${micX - 2.2*scale},${earY} ${micX + 2.2*scale},${earY}" fill="rgba(16,185,129,0.20)" stroke="#10b981" stroke-width="1.8"/>
              <line x1="${micX}" y1="${ceilingY}" x2="${micX - 1.5*scale}" y2="${earY}" stroke="#22d3ee" stroke-width="1.2" stroke-dasharray="3,2"/>
              <line x1="${micX}" y1="${ceilingY}" x2="${micX + 1.5*scale}" y2="${earY}" stroke="#22d3ee" stroke-width="1.2" stroke-dasharray="3,2"/>
              <!-- Downward Arrow at Ear Level -->
              <polygon points="${micX-4},${earY-8} ${micX+4},${earY-8} ${micX},${earY}" fill="#10b981"/>
              <rect x="${micX-16}" y="${ceilingY}" width="32" height="7" fill="#10b981" rx="2"/>
              <text x="${micX}" y="${ceilingY+18}" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#34d399" text-anchor="middle">MIC #${micId}</text>
            `;
          } else {
            // Tabletop Boundary Pod or Gooseneck Mic
            var tableTopY = floorY - 0.75 * scale;
            micSvg += `
              <!-- Vertical Tabletop Microphone #${micId} -->
              <polygon points="${micX},${tableTopY} ${micX - 1.5*scale},${earY} ${micX + 1.5*scale},${earY}" fill="rgba(16,185,129,0.20)" stroke="#10b981" stroke-width="1.8"/>
              <line x1="${micX}" y1="${tableTopY}" x2="${micX - 1.0*scale}" y2="${earY}" stroke="#22d3ee" stroke-width="1.2" stroke-dasharray="3,2"/>
              <line x1="${micX}" y1="${tableTopY}" x2="${micX + 1.0*scale}" y2="${earY}" stroke="#22d3ee" stroke-width="1.2" stroke-dasharray="3,2"/>
              <polygon points="${micX-4},${earY+8} ${micX+4},${earY+8} ${micX},${earY}" fill="#10b981"/>
              <rect x="${micX-12}" y="${tableTopY-6}" width="24" height="6" fill="#10b981" rx="2"/>
              <circle cx="${micX}" cy="${tableTopY-3}" r="3" fill="#22d3ee"/>
              <text x="${micX}" y="${tableTopY-12}" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#34d399" text-anchor="middle">MIC #${micId}</text>
            `;
          }
        }
        return micSvg;
      })()}
    ` : ''}

    <text x="${ox+rW/2}" y="${floorY+24}" font-size="9.5" font-family="JetBrains Mono" fill="#94a3b8" text-anchor="middle">VERTICAL THROW: ${(roomH-earH).toFixed(2)}m (Ceiling to Ear) | CONICAL COVERAGE DIAMETER: ⌀ ${covDiameter.toFixed(2)}m (${((covDiameter)/0.3048).toFixed(1)}ft)</text>
  </svg>`;
  var wrapper = getOrCreateSpkMicSvgWrapper(container);
  if (wrapper) {
    wrapper.style.display = 'block';
    wrapper.innerHTML = svgContent;
  }
  ensureSpkMicContainerControls(container);
}

// ==========================================
// RECOMMENDED PROJECTOR BRIGHTNESS POP-UP MODAL & CHART
// ==========================================
var projBrightnessChart = null;

const projStandardDiagonals = [
  { diagIn: 84,  laserTier: 'Entry Pro (3,500 – 4,500 lm)' },
  { diagIn: 100, laserTier: 'Standard Classroom (4,000 – 5,500 lm)' },
  { diagIn: 120, laserTier: 'Corporate Boardroom (5,000 – 6,500 lm)' },
  { diagIn: 135, laserTier: 'Large Meeting Room (6,000 – 7,500 lm)' },
  { diagIn: 150, laserTier: 'Auditorium / Training Lab (7,000 – 9,000 lm)' },
  { diagIn: 180, laserTier: 'Lecture Hall / Venue (9,000 – 12,000 lm)' },
  { diagIn: 200, laserTier: 'Large Venue Staging (12,000 – 16,000 lm)' },
  { diagIn: 250, laserTier: 'Auditorium Main Stage (16,000 – 22,000 lm)' },
  { diagIn: 300, laserTier: 'High-Output Arena / Staging (25,000 – 35,000+ lm)' }
];

function calculateLumensForScreen(diagIn, aspect, gain, ambientLux, contrastProfile) {
  var ratio = 1.7778; // 16:9
  if (aspect === '21:9') ratio = 2.3333;
  if (aspect === '16:10') ratio = 1.6000;
  if (aspect === '4:3') ratio = 1.3333;

  var diagMm = diagIn * 25.4;
  var hM = (diagMm / 1000.0) / Math.sqrt(ratio * ratio + 1);
  var wM = hM * ratio;
  var areaSqm = wM * hM;
  var areaSqft = areaSqm * 10.7639;

  // AVIXA PISCR / ISCR Contrast factor
  var contrastFactor = 1.4;
  if (contrastProfile === 15) contrastFactor = 1.25;
  if (contrastProfile === 20) contrastFactor = 1.45;
  if (contrastProfile === 50) contrastFactor = 2.10;

  var rawLumens = (areaSqm * ambientLux * contrastFactor) / gain;
  // 15% aging degradation buffer
  var reqLumens = Math.round((rawLumens * 1.15) / 50) * 50;
  var footLamberts = Math.round((reqLumens * gain) / areaSqft);

  return {
    diagIn: diagIn,
    wMm: Math.round(wM * 1000),
    hMm: Math.round(hM * 1000),
    areaSqm: areaSqm,
    areaSqft: areaSqft,
    reqLumens: Math.max(1200, reqLumens),
    footLamberts: footLamberts
  };
}

function openRecommendedLumensModal() {
  var modalEl = document.getElementById('recommendedLumensModal');
  if (!modalEl) return;
  var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.show();

  setTimeout(function() {
    updateProjBrightnessModalChart();
  }, 150);
}

function updateProjBrightnessModalChart() {
  var aspect = document.getElementById('modalProjAspectSelect')?.value || '16:9';
  var gain = parseFloat(document.getElementById('modalProjGainSelect')?.value) || 1.0;
  var contrast = parseInt(document.getElementById('modalProjContrastSelect')?.value) || 20;

  var labels = projStandardDiagonals.map(d => d.diagIn + '"');
  
  var conditions = [
    { label: 'Dark Cinema (50 Lux)', lux: 50, color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
    { label: 'Dimmable Room (150 Lux)', lux: 150, color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
    { label: 'Office / Classroom (350 Lux)', lux: 350, color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
    { label: 'Bright Daylight (500 Lux)', lux: 500, color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
  ];

  var datasets = conditions.map(cond => {
    var data = projStandardDiagonals.map(d => {
      var res = calculateLumensForScreen(d.diagIn, aspect, gain, cond.lux, contrast);
      return res.reqLumens;
    });
    return {
      label: cond.label,
      data: data,
      borderColor: cond.color,
      backgroundColor: cond.bg,
      borderWidth: 2.5,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false
    };
  });

  var canvas = document.getElementById('projBrightnessChartCanvas');
  if (canvas) {
    if (projBrightnessChart) {
      projBrightnessChart.data.labels = labels;
      projBrightnessChart.data.datasets = datasets;
      projBrightnessChart.update();
    } else {
      var ctx = canvas.getContext('2d');
      projBrightnessChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#0f172a',
              titleColor: '#38bdf8',
              bodyColor: '#f8fafc',
              borderColor: '#334155',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' ANSI Lumens';
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Screen Diagonal Size (Inches)',
                color: '#94a3b8',
                font: { family: 'JetBrains Mono', size: 11, weight: 'bold' }
              },
              grid: { color: 'rgba(255, 255, 255, 0.06)' },
              ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono' } }
            },
            y: {
              title: {
                display: true,
                text: 'Required Brightness (ANSI Lumens)',
                color: '#94a3b8',
                font: { family: 'JetBrains Mono', size: 11, weight: 'bold' }
              },
              grid: { color: 'rgba(255, 255, 255, 0.06)' },
              ticks: {
                color: '#94a3b8',
                font: { family: 'JetBrains Mono' },
                callback: function(value) {
                  return value.toLocaleString() + ' lm';
                }
              }
            }
          }
        }
      });
    }
  }

  // Populate Table
  var tbody = document.getElementById('modalProjBrightnessTableBody');
  if (tbody) {
    var rowsHtml = '';
    projStandardDiagonals.forEach(d => {
      var c50 = calculateLumensForScreen(d.diagIn, aspect, gain, 50, contrast);
      var c150 = calculateLumensForScreen(d.diagIn, aspect, gain, 150, contrast);
      var c350 = calculateLumensForScreen(d.diagIn, aspect, gain, 350, contrast);
      var c500 = calculateLumensForScreen(d.diagIn, aspect, gain, 500, contrast);

      rowsHtml += `
        <tr>
          <td class="text-start fw-bold text-white"><span class="badge bg-secondary me-1 font-mono">${d.diagIn}"</span> (${(d.diagIn*25.4/1000).toFixed(2)} m)</td>
          <td class="text-slate-300 font-mono">${(c50.wMm/1000).toFixed(2)} &times; ${(c50.hMm/1000).toFixed(2)} m</td>
          <td class="text-slate-300 font-mono">${c50.areaSqm.toFixed(2)} m² <span class="text-muted" style="font-size:0.7rem;">(${c50.areaSqft.toFixed(1)} ft²)</span></td>
          <td class="fw-bold font-mono" style="color: #38bdf8;">${c50.reqLumens.toLocaleString()} lm</td>
          <td class="fw-bold font-mono" style="color: #4ade80;">${c150.reqLumens.toLocaleString()} lm</td>
          <td class="fw-bold font-mono" style="color: #facc15;">${c350.reqLumens.toLocaleString()} lm</td>
          <td class="fw-bold font-mono" style="color: #f87171;">${c500.reqLumens.toLocaleString()} lm</td>
          <td class="text-start text-info font-mono small">${d.laserTier}</td>
          <td>
            <button type="button" class="btn btn-outline-info btn-sm py-0 px-2 font-mono fw-bold" onclick="applyProjPresetToStudio(${d.diagIn}, 350)" title="Apply ${d.diagIn}&quot; and 350 lx to Tab 3 Studio">
              Apply &rarr;
            </button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = rowsHtml;
  }
}

function applyProjPresetToStudio(diagIn, targetLux) {
  var aspect = document.getElementById('modalProjAspectSelect')?.value || '16:9';
  var gain = parseFloat(document.getElementById('modalProjGainSelect')?.value) || 1.0;
  
  var calc = calculateLumensForScreen(diagIn, aspect, gain, targetLux, 20);

  // Update Mode A inputs
  var screenWEl = document.getElementById('screenW');
  var screenHEl = document.getElementById('screenH');
  var ambientEl = document.getElementById('projAmbientLuxInput');
  var gainEl = document.getElementById('projScreenGainSelect');

  if (screenWEl) screenWEl.value = calc.wMm;
  if (screenHEl) screenHEl.value = calc.hMm;
  if (ambientEl) ambientEl.value = targetLux;
  if (gainEl) gainEl.value = gain;

  // Update Mode B inputs
  var diagInEl = document.getElementById('projModeBDiagInches');
  var diagMmEl = document.getElementById('projModeBDiagMm');
  var aspectBEl = document.getElementById('projModeBAspectSelect');
  var gainBEl = document.getElementById('projModeBGainSelect');

  if (diagInEl) diagInEl.value = diagIn;
  if (diagMmEl) diagMmEl.value = Math.round(diagIn * 25.4);
  if (aspectBEl) aspectBEl.value = aspect;
  if (gainBEl) gainBEl.value = gain;

  // Close modal
  var modalEl = document.getElementById('recommendedLumensModal');
  if (modalEl) {
    var modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  // Recalculate simulation in Tab 3
  updateProjectorSim();
}
