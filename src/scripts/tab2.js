// ==========================================
// TAB 2: LED VIDEO WALL & PITCH
// ==========================================
let activeLedRatio = '16:9';
let activeLedEnv = 'indoor';

function setLedEnvironment(envStr) {
  activeLedEnv = envStr;
  document.getElementById('btnEnvIndoor')?.classList.toggle('active', envStr === 'indoor');
  document.getElementById('btnEnvOutdoor')?.classList.toggle('active', envStr === 'outdoor');
  
  var pDensityInput = document.getElementById('ledPowerDensityWm2');
  if (pDensityInput) {
    if (envStr === 'outdoor') {
      pDensityInput.value = 650; // typical outdoor 650 W/m²
    } else {
      pDensityInput.value = 250; // typical indoor 250 W/m²
    }
  }
  updateLedPowerFromDensity();
}

function setLedConverterRatio(ratioStr) {
  activeLedRatio = ratioStr;
  document.getElementById('btnAr169')?.classList.toggle('active', ratioStr === '16:9');
  document.getElementById('btnAr219')?.classList.toggle('active', ratioStr === '21:9');
  document.getElementById('btnAr329')?.classList.toggle('active', ratioStr === '32:9');
  calcLedScreenBidirectional();
}

function toggleLedConvDir() {
  var dir = document.getElementById('ledConvDirSelect')?.value;
  var boxD = document.getElementById('boxLedDiagInput');
  var boxDim = document.getElementById('boxLedDimsInput');
  if (boxD) boxD.style.display = (dir === 'diagToDim') ? 'block' : 'none';
  if (boxDim) boxDim.style.display = (dir === 'dimToDiag') ? 'block' : 'none';
  calcLedScreenBidirectional();
}

function calcLedScreenBidirectional() {
  var dir = document.getElementById('ledConvDirSelect')?.value || 'diagToDim';
  var ratioNum = (activeLedRatio === '21:9') ? (21.0/9.0) : ((activeLedRatio === '32:9') ? (32.0/9.0) : (16.0/9.0));

  var widthMm = 0, heightMm = 0, diagInches = 0;

  if (dir === 'diagToDim') {
    diagInches = parseFloat(document.getElementById('ledDiagInInches')?.value) || 136;
    var diagMm = diagInches * 25.4;
    heightMm = diagMm / Math.sqrt(ratioNum * ratioNum + 1);
    widthMm = heightMm * ratioNum;
  } else {
    widthMm = parseFloat(document.getElementById('ledWidthInMm')?.value) || 3010;
    heightMm = parseFloat(document.getElementById('ledHeightInMm')?.value) || 1693;
    var diagMm = Math.sqrt(widthMm * widthMm + heightMm * heightMm);
    diagInches = diagMm / 25.4;
  }

  var lbl = document.getElementById('resLedRatioLabel');
  if (lbl) lbl.innerText = `ACTIVE ASPECT RATIO: ${activeLedRatio}`;
  var elW = document.getElementById('resLedCalcWidthMm');
  if (elW) elW.innerText = `${Math.round(widthMm)} mm`;
  var elWFt = document.getElementById('resLedCalcWidthFt');
  if (elWFt) elWFt.innerText = `${(widthMm/304.8).toFixed(2)} ft`;
  var elH = document.getElementById('resLedCalcHeightMm');
  if (elH) elH.innerText = `${Math.round(heightMm)} mm`;
  var elHFt = document.getElementById('resLedCalcHeightFt');
  if (elHFt) elHFt.innerText = `${(heightMm/304.8).toFixed(2)} ft`;
  var elDiag = document.getElementById('resLedCalcDiagInches');
  if (elDiag) elDiag.innerText = `${diagInches.toFixed(1)}" (${Math.round(diagInches * 25.4)} mm)`;

  // First Person Distance = 1 * pixel pitch in meters (converted to mm)
  var pitchVal = parseFloat(document.getElementById('ledConvPitchInput')?.value) ||
                 parseFloat(document.getElementById('ledPitch')?.value) || 1.25;
  var firstPersonDistM = 1.0 * pitchVal;
  var firstPersonDistMm = Math.round(firstPersonDistM * 1000);

  // Last Person Distance as per the AVIXA:
  // Boardroom (ADM 4H): 4 * Height
  // Training Room (5H): 5 * Height
  // Classroom & Training (6H): 6 * Height
  var heightM = heightMm / 1000.0;
  var lastPerson4HM = 4.0 * heightM;
  var lastPerson4HMm = Math.round(lastPerson4HM * 1000);
  var lastPerson5HM = 5.0 * heightM;
  var lastPerson5HMm = Math.round(lastPerson5HM * 1000);
  var lastPerson6HM = 6.0 * heightM;
  var lastPerson6HMm = Math.round(lastPerson6HM * 1000);

  var elFirst = document.getElementById('resLedFirstPersonDist');
  if (elFirst) elFirst.innerText = `${firstPersonDistM.toFixed(2)} m (${firstPersonDistMm.toLocaleString()} mm)`;

  var elLast = document.getElementById('resLedLastPersonDist');
  if (elLast) elLast.innerText = `${lastPerson4HM.toFixed(2)} m – ${lastPerson6HM.toFixed(2)} m`;

  var elAdm = document.getElementById('resLedAdmDist');
  if (elAdm) elAdm.innerText = `${lastPerson4HM.toFixed(2)} m (${lastPerson4HMm.toLocaleString()} mm)`;

  var el5H = document.getElementById('resLed5HDist');
  if (el5H) el5H.innerText = `${lastPerson5HM.toFixed(2)} m (${lastPerson5HMm.toLocaleString()} mm)`;

  var elBdm = document.getElementById('resLedBdmDist');
  if (elBdm) elBdm.innerText = `${lastPerson6HM.toFixed(2)} m (${lastPerson6HMm.toLocaleString()} mm)`;

  renderLedScreenSvg(widthMm, heightMm, diagInches, activeLedRatio, firstPersonDistM, firstPersonDistMm, lastPerson4HM, lastPerson6HM);
}

function renderLedScreenSvg(widthMm, heightMm, diagInches, ratioStr, fpM, fpMm, lpMinM, lpMaxM) {
  var container = document.getElementById('ledScreenSvgContainer');
  if (!container) return;
  var maxSvgW = 540, maxSvgH = 260;
  var aspect = widthMm / heightMm;
  var rectW = maxSvgW - 140;
  var rectH = rectW / aspect;

  if (rectH > maxSvgH - 90) { rectH = maxSvgH - 90; rectW = rectH * aspect; }
  var startX = 25;
  var startY = 30;

  var fpText = (fpM !== undefined) ? `${fpM.toFixed(2)}m (${fpMm}mm)` : '1.25m';
  var lpText = (lpMinM !== undefined) ? `${lpMinM.toFixed(1)}m – ${lpMaxM.toFixed(1)}m` : '6.8m – 10.2m';

  container.innerHTML = `<svg viewBox="0 0 ${maxSvgW} ${maxSvgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <!-- LED Screen Outline -->
    <rect x="${startX}" y="${startY}" width="${rectW}" height="${rectH}" fill="#1e293b" stroke="#38bdf8" stroke-width="3" rx="6"/>
    <line x1="${startX+4}" y1="${startY+4}" x2="${startX+rectW-4}" y2="${startY+rectH-4}" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3"/>
    <text x="${startX + rectW/2}" y="${startY-10}" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="middle">WIDTH: ${Math.round(widthMm)} mm (${(widthMm/304.8).toFixed(1)} ft)</text>
    <text x="${startX-8}" y="${startY + rectH/2}" font-size="10" font-weight="bold" fill="#4ade80" text-anchor="end" transform="rotate(-90 ${startX-8} ${startY+rectH/2})">HEIGHT: ${Math.round(heightMm)} mm</text>
    
    <rect x="${startX + rectW/2 - 75}" y="${startY + rectH/2 - 12}" width="150" height="24" fill="#0f172a" rx="12" stroke="#ef4444"/>
    <text x="${startX + rectW/2}" y="${startY + rectH/2 + 4}" font-size="11" font-weight="bold" fill="#f8fafc" text-anchor="middle">DIAGONAL: ${diagInches.toFixed(1)}" (${ratioStr})</text>

    <!-- Viewer Distances Ray & Annotations -->
    <g transform="translate(${startX + rectW + 15}, 20)">
      <rect x="0" y="0" width="165" height="225" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
      <text x="82" y="20" font-size="10" font-weight="bold" fill="#38bdf8" text-anchor="middle">VIEWER SIGHTLINES</text>
      
      <!-- First Person Marker -->
      <circle cx="20" cy="55" r="8" fill="#06b6d4" stroke="#ffffff" stroke-width="1.5"/>
      <text x="35" y="52" font-size="9" font-weight="bold" fill="#22d3ee">1st Row Viewer</text>
      <text x="35" y="66" font-size="10" font-weight="bold" fill="#ffffff">${fpText}</text>
      <text x="35" y="78" font-size="7.5" fill="#94a3b8">1&times; Pitch Threshold</text>
      <line x1="10" y1="92" x2="155" y2="92" stroke="#334155" stroke-width="1"/>

      <!-- Last Person Marker -->
      <circle cx="20" cy="125" r="8" fill="#a855f7" stroke="#ffffff" stroke-width="1.5"/>
      <text x="35" y="122" font-size="9" font-weight="bold" fill="#c084fc">Last Row Viewer</text>
      <text x="35" y="136" font-size="10" font-weight="bold" fill="#ffffff">${lpText}</text>
      <text x="35" y="150" font-size="7.5" fill="#cbd5e1">Boardroom: 4H &bull; Class: 6H</text>

      <rect x="10" y="165" width="145" height="48" rx="4" fill="#1e293b" stroke="#475569" stroke-width="0.8"/>
      <text x="82" y="180" font-size="8" font-weight="bold" fill="#fde047" text-anchor="middle">AVIXA DISCAS CRITERIA</text>
      <text x="82" y="195" font-size="7.5" fill="#94a3b8" text-anchor="middle">ADM 4H &bull; BDM 6H</text>
      <text x="82" y="206" font-size="6.8" fill="#64748b" text-anchor="middle">as per the AVIXA</text>
    </g>
  </svg>`;
}

function getActiveCabinetDims() {
  var preset = document.getElementById('ledCabinetPreset')?.value || '600x337.5';
  var cabW_mm = 600, cabH_mm = 337.5;
  if (preset === '480x270') { cabW_mm = 480; cabH_mm = 270; }
  else if (preset === '500x500') { cabW_mm = 500; cabH_mm = 500; }
  else if (preset === '1000x500') { cabW_mm = 1000; cabH_mm = 500; }
  else if (preset === '500x1000') { cabW_mm = 500; cabH_mm = 1000; }
  else if (preset === '250x250') { cabW_mm = 250; cabH_mm = 250; }
  else if (preset === 'custom') {
    cabW_mm = parseFloat(document.getElementById('customCabW')?.value) || 600;
    cabH_mm = parseFloat(document.getElementById('customCabH')?.value) || 337.5;
  }
  return { w: cabW_mm, h: cabH_mm, areaM2: (cabW_mm * cabH_mm) / 1e6 };
}

function applyCabinetPreset() {
  var preset = document.getElementById('ledCabinetPreset')?.value;
  var customBox = document.getElementById('boxCustomCabinetDims');
  if (customBox) customBox.style.display = (preset === 'custom') ? 'flex' : 'none';
  updateLedPowerFromDensity();
}

function updateLedPowerFromDensity() {
  var dims = getActiveCabinetDims();
  var density = parseFloat(document.getElementById('ledPowerDensityWm2')?.value) || 640;
  var wattsPerCab = density * dims.areaM2;
  var wInp = document.getElementById('ledCabinetWattsInput');
  if (wInp) wInp.value = wattsPerCab.toFixed(1);
  calculateLEDStudio();
}

function updateLedPowerFromWatts() {
  var dims = getActiveCabinetDims();
  var wattsPerCab = parseFloat(document.getElementById('ledCabinetWattsInput')?.value) || 129.6;
  var density = dims.areaM2 > 0 ? (wattsPerCab / dims.areaM2) : 640;
  var dInp = document.getElementById('ledPowerDensityWm2');
  if (dInp) dInp.value = density.toFixed(1);
  calculateLEDStudio();
}

function calculateLEDStudio() {
  var pitch = parseFloat(document.getElementById('ledPitch')?.value) || 1.2;
  var dims = getActiveCabinetDims();
  var cabWatts = parseFloat(document.getElementById('ledCabinetWattsInput')?.value) || 129.6;

  var wallW_mm = parseFloat(document.getElementById('ledWallWMm')?.value) || 4800;
  var wallH_mm = parseFloat(document.getElementById('ledWallHMm')?.value) || 2700;

  var cols = Math.ceil(wallW_mm / dims.w);
  var rows = Math.ceil(wallH_mm / dims.h);
  var totalCabs = cols * rows;

  var actualW_m = (cols * dims.w) / 1000.0;
  var actualH_m = (rows * dims.h) / 1000.0;
  var wallArea_m2 = actualW_m * actualH_m;
  var wallArea_sqft = wallArea_m2 * 10.7639;

  // Pixel metrics
  var pixelDensity_sqm = Math.round(1000000 / (pitch * pitch));
  var totalPixels = Math.round(wallArea_m2 * pixelDensity_sqm);
  var widthPixels = Math.round((actualW_m * 1000) / pitch);
  var heightPixels = Math.round((actualH_m * 1000) / pitch);

  // Electrical & Thermal Heat Load Calculation
  var peakWatts = totalCabs * cabWatts;
  var loadMode = document.getElementById('ledHeatLoadMode')?.value || 'peak';
  var loadFactor = (loadMode === 'typical') ? 0.45 : ((loadMode === 'mixed') ? 0.60 : 1.0);

  var operatingWatts = peakWatts * loadFactor;
  var peakBtu = peakWatts * 3.412142;
  var operatingBtu = operatingWatts * 3.412142;
  var operatingKcal = operatingBtu * 0.251996;
  var totalAcTons = operatingBtu / 12000.0;

  // Localized AC Unit Sizing & Redundancy Recommendation
  var unitBtu = parseFloat(document.getElementById('ledAcUnitSize')?.value) || 18000;
  var unitTons = unitBtu / 12000.0;
  var redundancy = document.getElementById('ledAcRedundancy')?.value || 'N';

  var baseUnits = Math.ceil(operatingBtu / unitBtu);
  if (baseUnits < 1) baseUnits = 1;
  var totalUnits = (redundancy === 'N1') ? (baseUnits + 1) : baseUnits;

  var totalInstalledBtu = baseUnits * unitBtu;
  var unitLoadPct = Math.min(100, Math.round((operatingBtu / totalInstalledBtu) * 100));
  var totalInstalledTons = (totalUnits * unitTons).toFixed(1);

  var cfm = Math.round(totalAcTons * 400);
  var m3h = Math.round(cfm * 1.699);
  var btuPerSqm = Math.round(operatingBtu / wallArea_m2);

  // Circuits
  var circuits16A = Math.ceil(peakWatts / (230 * 16 * 0.8));
  var circuits20A = Math.ceil(peakWatts / (120 * 20 * 0.8));

  // Helper setter
  var setTxt = function(id, txt) { var el = document.getElementById(id); if (el) el.innerText = txt; };

  setTxt('resLedColsCount', cols + ' Cols');
  setTxt('resLedRowsCount', rows + ' Rows');
  setTxt('resLedCabCount', totalCabs + ' Cabs');
  setTxt('resLedSocketCount', cols + ' Sockets');

  // Pitch density badge
  var pitchBadge = document.getElementById('ledPitchDensityBadge');
  if (pitchBadge) {
    pitchBadge.innerText = `${pixelDensity_sqm.toLocaleString()} px/m² • ${(totalPixels/1e6).toFixed(2)} Mpx (${widthPixels}×${heightPixels})`;
  }

  // Localized AC Headline Recommendation
  var acRecHeadline = document.getElementById('resLedAcRecHeadline');
  if (acRecHeadline) {
    acRecHeadline.innerText = `${baseUnits} × ${unitTons.toFixed(1)} TR Localized AC Unit${baseUnits > 1 ? 's' : ''}`;
  }
  var acRecSub = document.getElementById('resLedAcRecSub');
  if (acRecSub) {
    if (redundancy === 'N1') {
      acRecSub.innerHTML = `<span class="badge bg-warning text-dark font-mono"><i class="fa-solid fa-shield-halved me-1"></i>${totalUnits} Units Total (${baseUnits} Active @ ${unitLoadPct}% Load + 1 Standby N+1 Failover Unit)</span>`;
    } else {
      acRecSub.innerHTML = `<span class="badge bg-success font-mono"><i class="fa-solid fa-check-circle me-1"></i>Standard N Config (${unitLoadPct}% Duty Load per Active Unit • Total Installed: ${totalInstalledTons} TR)</span>`;
    }
  }

  // Localized AC Units visual badges list
  var acUnitsVisual = document.getElementById('resLedAcUnitsVisual');
  if (acUnitsVisual) {
    var unitsHtml = '';
    for (var u = 1; u <= baseUnits; u++) {
      unitsHtml += `<div class="d-inline-flex align-items-center gap-1 p-2 rounded bg-dark border border-success-subtle text-success me-2 mb-2 font-mono small">
        <i class="fa-solid fa-fan fa-spin text-info" style="--fa-animation-duration: 4s;"></i>
        <span><strong>AC-${u}</strong>: ${unitTons.toFixed(1)} TR (${unitLoadPct}% Load)</span>
      </div>`;
    }
    if (redundancy === 'N1') {
      unitsHtml += `<div class="d-inline-flex align-items-center gap-1 p-2 rounded bg-dark border border-warning-subtle text-warning me-2 mb-2 font-mono small">
        <i class="fa-solid fa-power-off text-warning"></i>
        <span><strong>AC-${totalUnits}</strong>: ${unitTons.toFixed(1)} TR (N+1 Standby)</span>
      </div>`;
    }
    acUnitsVisual.innerHTML = unitsHtml;
  }

  // Real-time Thermal and Electrical outputs
  setTxt('resLedWatts', (operatingWatts / 1000.0).toFixed(2) + ' kW' + (loadMode !== 'peak' ? ' (Avg)' : ' (Peak)'));
  setTxt('resLedPeakWatts', 'Peak: ' + (peakWatts / 1000.0).toFixed(2) + ' kW');
  setTxt('resLedBtu', Math.round(operatingBtu).toLocaleString() + ' BTU/h');
  setTxt('resLedPeakBtu', 'Peak: ' + Math.round(peakBtu).toLocaleString() + ' BTU/h');
  setTxt('resLedKcal', Math.round(operatingKcal).toLocaleString() + ' kcal/h');
  setTxt('resLedAcTons', totalAcTons.toFixed(2) + ' TR (' + (operatingWatts / 1000.0).toFixed(2) + ' kWth)');
  setTxt('resLedAirflowCfm', cfm.toLocaleString() + ' CFM');
  setTxt('resLedAirflowM3h', cfm.toLocaleString() + ' CFM (' + m3h.toLocaleString() + ' m³/h)');
  setTxt('resLedHeatFlux', btuPerSqm.toLocaleString() + ' BTU/h/m²');
  setTxt('resLed16A', circuits16A + ' Circuits');
  setTxt('resLedActiveDims', `${actualW_m.toFixed(2)} × ${actualH_m.toFixed(2)} m (${wallArea_m2.toFixed(2)} m² / ${wallArea_sqft.toFixed(1)} ft²)`);

  // Cache thermal parameters
  ledThermalState.cachedCols = cols;
  ledThermalState.cachedRows = rows;
  ledThermalState.cachedCabW = dims.w;
  ledThermalState.cachedCabH = dims.h;
  ledThermalState.cachedCabWatts = cabWatts;
  ledThermalState.cachedBaseUnits = baseUnits;
  ledThermalState.cachedUnitTonsStr = unitTons.toFixed(1);
  ledThermalState.cachedTotalUnits = totalUnits;
  ledThermalState.cachedRedundancy = redundancy;

  renderLedWallWithSocketsSvg(cols, rows, dims.w, dims.h, baseUnits, unitTons.toFixed(1), totalUnits, redundancy);
}

// Thermal Heatmap State & Interactivity Engine for Tab 2
var ledThermalState = {
  showHeatmap: true,
  mode: 'temp', // 'temp' (°C / °F), 'power' (Watts / BTU), 'hotspots' (Hot Spot Focus)
  ambientC: 22.0,
  hoveredTile: null,
  cachedCols: 8,
  cachedRows: 8,
  cachedCabW: 600,
  cachedCabH: 337.5,
  cachedCabWatts: 129.6,
  cachedBaseUnits: 2,
  cachedUnitTonsStr: '1.5',
  cachedTotalUnits: 2,
  cachedRedundancy: 'N'
};

function toggleLedHeatmap(enable) {
  ledThermalState.showHeatmap = (enable !== undefined) ? enable : !ledThermalState.showHeatmap;
  var chk = document.getElementById('chkLedThermalHeatmap');
  if (chk) chk.checked = ledThermalState.showHeatmap;
  var leg = document.getElementById('ledThermalLegendBar');
  if (leg) leg.style.display = ledThermalState.showHeatmap ? 'flex' : 'none';
  renderLedWallWithSocketsSvg(
    ledThermalState.cachedCols,
    ledThermalState.cachedRows,
    ledThermalState.cachedCabW,
    ledThermalState.cachedCabH,
    ledThermalState.cachedBaseUnits,
    ledThermalState.cachedUnitTonsStr,
    ledThermalState.cachedTotalUnits,
    ledThermalState.cachedRedundancy
  );
}

function setLedThermalMode(mode) {
  ledThermalState.mode = mode;
  document.querySelectorAll('.btn-led-thermal-mode').forEach(b => {
    if (b.getAttribute('data-mode') === mode) {
      b.classList.remove('btn-outline-warning', 'btn-outline-light');
      b.classList.add('btn-warning', 'active');
    } else {
      b.classList.remove('btn-warning', 'active');
      b.classList.add('btn-outline-light');
    }
  });
  renderLedWallWithSocketsSvg(
    ledThermalState.cachedCols,
    ledThermalState.cachedRows,
    ledThermalState.cachedCabW,
    ledThermalState.cachedCabH,
    ledThermalState.cachedBaseUnits,
    ledThermalState.cachedUnitTonsStr,
    ledThermalState.cachedTotalUnits,
    ledThermalState.cachedRedundancy
  );
}

function getLedCabinetThermalMetrics(r, c, rows, cols, cabWatts) {
  var ambientC = ledThermalState.ambientC || 22.0;
  // Natural convection plume: top rows ingest rising hot air from rows below
  var stackFactor = (rows > 1) ? ((rows - 1 - r) / (rows - 1)) : 0.5; // 0 at bottom row, 1 at top row
  var stackDelta = stackFactor * (cabWatts / 100.0) * 16.5;

  // Lateral center concentration: center cabinets have less perimeter dissipation
  var colCenterNorm = (cols > 1) ? ((c + 0.5) / cols) : 0.5;
  var centerFactor = Math.sin(colCenterNorm * Math.PI); // 0 at outer edges, 1 at center
  var centerDelta = centerFactor * (cabWatts / 100.0) * 4.8;

  // Base power temperature rise
  var baseDelta = (cabWatts / 100.0) * 11.2;

  var tempC = ambientC + baseDelta + stackDelta + centerDelta;
  var tempF = (tempC * 9/5) + 32;
  var btu = cabWatts * 3.41214;

  var status = 'Nominal';
  var color = '#10b981';
  var statusBadgeClass = 'bg-success';

  if (tempC < 30) {
    status = 'Cool / Edge Ambient';
    color = '#0284c7'; // Blue
    statusBadgeClass = 'bg-info text-dark';
  } else if (tempC < 37) {
    status = 'Nominal Operating';
    color = '#10b981'; // Green
    statusBadgeClass = 'bg-success';
  } else if (tempC < 43) {
    status = 'Warm Intermediate';
    color = '#eab308'; // Yellow
    statusBadgeClass = 'bg-warning text-dark';
  } else if (tempC < 48) {
    status = 'Elevated Plume';
    color = '#f97316'; // Orange
    statusBadgeClass = 'bg-danger';
  } else {
    status = '⚠️ Hot Spot Peak';
    color = '#ef4444'; // Red
    statusBadgeClass = 'bg-danger text-white fw-bold';
  }

  var isPeakHotSpot = (tempC >= 47.0);

  return { tempC, tempF, btu, cabWatts, status, color, statusBadgeClass, isPeakHotSpot, r, c };
}

function onHoverLedCabinet(r, c) {
  var rows = ledThermalState.cachedRows;
  var cols = ledThermalState.cachedCols;
  var cabWatts = ledThermalState.cachedCabWatts;
  var m = getLedCabinetThermalMetrics(r, c, rows, cols, cabWatts);
  ledThermalState.hoveredTile = m;

  var hudLabel = document.getElementById('ledThermalHudLabel');
  var hudDetails = document.getElementById('ledThermalHudDetails');
  if (hudLabel) {
    hudLabel.innerHTML = `<span class="badge ${m.statusBadgeClass} me-2 font-mono">${m.status}</span>
      <strong>Cabinet [Row ${r+1}, Col ${c+1}]</strong> &bull;
      Surface Temp: <span class="text-warning fw-bold">${m.tempC.toFixed(1)}&deg;C (${m.tempF.toFixed(1)}&deg;F)</span> &bull;
      Power Load: <span class="text-cyan fw-bold">${m.cabWatts.toFixed(1)} W</span> (${m.btu.toFixed(0)} BTU/h)`;
  }
  if (hudDetails) {
    hudDetails.innerHTML = m.isPeakHotSpot ?
      `<span class="badge bg-danger text-white"><i class="fa-solid fa-fire me-1"></i>Convection Hot Spot: Ensure 300mm Top Plenum Extract</span>` :
      `<span class="badge bg-secondary font-mono">Heat Dissipation: Nominal</span>`;
  }
}

function selectLedCabinet(r, c) {
  onHoverLedCabinet(r, c);
}

function renderLedWallWithSocketsSvg(cols, rows, cabW, cabH, baseUnits, unitTonsStr, totalUnits, redundancy) {
  var container = document.getElementById('ledWallSvgContainer');
  if (!container) return;

  cols = Math.max(1, cols || 1);
  rows = Math.max(1, rows || 1);
  cabW = cabW || 600;
  cabH = cabH || 337.5;
  baseUnits = baseUnits || 2;
  totalUnits = totalUnits || baseUnits;
  unitTonsStr = unitTonsStr || '1.5';
  var cabWatts = ledThermalState.cachedCabWatts || 129.6;

  var svgW = 760, svgH = 370;
  var paddingX = 40, topReserve = 65, bottomReserve = 50;
  var availW = svgW - (paddingX * 2);
  var availH = svgH - topReserve - bottomReserve;

  var wallAspect = (cols * cabW) / (rows * cabH);
  var rectW = availW;
  var rectH = rectW / wallAspect;

  if (rectH > availH) { rectH = availH; rectW = rectH * wallAspect; }

  var startX = (svgW - rectW) / 2;
  var startY = topReserve + (availH - rectH) / 2;
  var cellW = rectW / cols;
  var cellH = rectH / rows;

  var showHeat = ledThermalState.showHeatmap;
  var mode = ledThermalState.mode;

  // Render LED Tiles with Thermal Heatmap Colors
  var tilesSvg = '';
  var hotSpotCount = 0;
  var maxTempFound = 0;

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var x = startX + c * cellW;
      var y = startY + r * cellH;
      var m = getLedCabinetThermalMetrics(r, c, rows, cols, cabWatts);
      if (m.tempC > maxTempFound) maxTempFound = m.tempC;
      if (m.isPeakHotSpot) hotSpotCount++;

      var fillColor = showHeat ? m.color : '#1e293b';
      var strokeColor = showHeat ? (m.isPeakHotSpot ? '#ff4d4d' : 'rgba(255,255,255,0.25)') : '#38bdf8';
      var strokeWidth = m.isPeakHotSpot ? '2.0' : '1.0';

      // Inner label
      var tileLabel = '';
      if (showHeat && cellW >= 24 && cellH >= 18) {
        if (mode === 'temp') tileLabel = `${m.tempC.toFixed(0)}°`;
        else if (mode === 'power') tileLabel = `${m.cabWatts.toFixed(0)}W`;
        else if (mode === 'hotspots') tileLabel = m.isPeakHotSpot ? '🔥' : '';
      }

      tilesSvg += `<g class="led-tile-group" cursor="pointer" onmouseover="onHoverLedCabinet(${r}, ${c})" onclick="selectLedCabinet(${r}, ${c})">
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cellW - 1.5).toFixed(1)}" height="${(cellH - 1.5).toFixed(1)}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" rx="1.5" opacity="${showHeat ? 0.92 : 1.0}">
          <title>Cabinet [R${r+1}, C${c+1}]: ${m.tempC.toFixed(1)}°C (${m.tempF.toFixed(1)}°F) | ${m.cabWatts.toFixed(1)}W | ${m.status}</title>
        </rect>
        ${tileLabel ? `<text x="${(x + cellW/2).toFixed(1)}" y="${(y + cellH/2 + 3).toFixed(1)}" font-size="${Math.min(10, cellH*0.4).toFixed(1)}" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="monospace" pointer-events="none" style="text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${tileLabel}</text>` : ''}
      </g>`;
    }
  }

  // Render Power Sockets at Base
  var socketY = startY + rectH + 8;
  var socketsSvg = '';
  for (var c = 0; c < cols; c++) {
    var socketX = startX + c * cellW + cellW / 2;
    socketsSvg += `<g transform="translate(${(socketX - 8).toFixed(1)}, ${socketY.toFixed(1)})">
      <rect x="0" y="0" width="16" height="14" fill="#facc15" rx="3" stroke="#000" stroke-width="1"/>
      <circle cx="5" cy="7" r="2" fill="#000"/><circle cx="11" cy="7" r="2" fill="#000"/>
    </g>`;
  }

  // Render Localized AC Units at Top Ceiling Plenum
  var acSvg = '';
  var acSpacing = rectW / totalUnits;
  var acW = Math.min(100, acSpacing * 0.75);
  for (var u = 0; u < totalUnits; u++) {
    var isStandby = (redundancy === 'N1' && u === totalUnits - 1);
    var acX = startX + (u + 0.5) * acSpacing - (acW / 2);
    var acY = startY - 45;
    var acColor = isStandby ? '#f59e0b' : '#10b981';
    var acBg = isStandby ? '#78350f' : '#064e3b';
    var label = isStandby ? `AC-${u+1} (N+1)` : `AC-${u+1} (${unitTonsStr} TR)`;

    acSvg += `<g transform="translate(${acX.toFixed(1)}, ${acY.toFixed(1)})">
      <rect x="0" y="0" width="${acW.toFixed(1)}" height="26" fill="${acBg}" stroke="${acColor}" stroke-width="1.5" rx="4"/>
      <circle cx="14" cy="13" r="6" fill="#020617" stroke="${acColor}" stroke-width="1"/>
      <line x1="14" y1="8" x2="14" y2="18" stroke="${acColor}" stroke-width="1.2"/>
      <line x1="9" y1="13" x2="19" y2="13" stroke="${acColor}" stroke-width="1.2"/>
      <text x="${(acW/2 + 7).toFixed(1)}" y="16" font-size="9" font-weight="bold" fill="#f8fafc" text-anchor="middle" font-family="monospace">${label}</text>
      <!-- Downward chilled airflow vector -->
      <path d="M ${(acW/2).toFixed(1)} 26 L ${(acW/2).toFixed(1)} 35 M ${(acW/2 - 3).toFixed(1)} 32 L ${(acW/2).toFixed(1)} 35 L ${(acW/2 + 3).toFixed(1)} 32" stroke="#38bdf8" stroke-width="1.5" fill="none"/>
    </g>`;
  }

  // Thermal Heatmap Legend Gradient SVG Bar (rendered when heatmap is active)
  var heatmapLegendSvg = '';
  if (showHeat) {
    heatmapLegendSvg = `
    <!-- Heatmap Gradient Bar -->
    <defs>
      <linearGradient id="thermalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="25%" stop-color="#10b981" />
        <stop offset="50%" stop-color="#eab308" />
        <stop offset="75%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#ef4444" />
      </linearGradient>
    </defs>
    <g transform="translate(${(startX).toFixed(1)}, ${(startY + rectH + 28).toFixed(1)})">
      <text x="0" y="-3" font-size="9" font-weight="bold" fill="#94a3b8" font-family="monospace">THERMAL HEATMAP SCALE:</text>
      <rect x="150" y="-10" width="${Math.max(140, rectW - 270).toFixed(1)}" height="8" fill="url(#thermalGrad)" rx="3" stroke="#475569" stroke-width="1"/>
      <text x="150" y="8" font-size="8" fill="#38bdf8" font-family="monospace">22°C (Cool)</text>
      <text x="${(150 + (rectW - 270)*0.5).toFixed(1)}" y="8" font-size="8" fill="#eab308" text-anchor="middle" font-family="monospace">38°C (Nominal)</text>
      <text x="${(150 + Math.max(140, rectW - 270)).toFixed(1)}" y="8" font-size="8" fill="#ef4444" text-anchor="end" font-family="monospace">${maxTempFound.toFixed(0)}°C (Hot Spot)</text>
    </g>`;
  }

  container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a; border-radius:8px;">
    <!-- Localized AC Units -->
    ${acSvg}
    <text x="${(svgW/2).toFixed(1)}" y="14" font-size="11" font-weight="bold" fill="#10b981" text-anchor="middle" font-family="monospace">
      LOCALIZED CEILING HVAC PLENUM: ${totalUnits} UNITS (${baseUnits} ACTIVE • ${(baseUnits * parseFloat(unitTonsStr)).toFixed(1)} TR TOTAL)
    </text>

    <!-- Thermal Convection Heat Plume Indicator Arrow at top -->
    ${showHeat ? `
    <g transform="translate(${(startX + rectW + 8).toFixed(1)}, ${(startY + rectH/2).toFixed(1)})">
      <path d="M 0 20 L 0 -20 M -4 -14 L 0 -20 L 4 -14" stroke="#f97316" stroke-width="2" fill="none"/>
      <text x="8" y="4" font-size="8" font-weight="bold" fill="#f97316" font-family="monospace" transform="rotate(90 8 4)">CONVECTION PLUME</text>
    </g>
    ` : ''}

    <!-- LED Video Wall Perimeter Frame -->
    <rect x="${(startX-4).toFixed(1)}" y="${(startY-4).toFixed(1)}" width="${(rectW+8).toFixed(1)}" height="${(rectH+8).toFixed(1)}" fill="none" stroke="${showHeat ? '#f59e0b' : '#64748b'}" stroke-width="${showHeat ? '2.5' : '2'}" rx="4"/>
    ${tilesSvg}

    <!-- Floor line & Power sockets -->
    <line x1="20" y1="${(startY + rectH + 4).toFixed(1)}" x2="${(svgW - 20).toFixed(1)}" y2="${(startY + rectH + 4).toFixed(1)}" stroke="#475569" stroke-width="2"/>
    ${socketsSvg}

    <text x="${(svgW/2).toFixed(1)}" y="${(startY + rectH/2).toFixed(1)}" font-size="12" font-weight="bold" fill="rgba(255,255,255,0.12)" text-anchor="middle" pointer-events="none">
      ACTIVE WALL: ${cols} COLS × ${rows} ROWS (${cols*rows} TILES)
    </text>

    ${heatmapLegendSvg}

    <text x="${(svgW - 20).toFixed(1)}" y="${(socketY + 36).toFixed(1)}" font-size="9" font-weight="bold" fill="#facc15" text-anchor="end" font-family="monospace">
      MAINS SOCKETS: ${cols} CIRCUIT DROP POINTS
    </text>
  </svg>`;
}

// TAB 2.5: DV-LED GLOBAL ARRAY STUDIO
var MM_TO_FT = 0.00328084;
var FT_TO_MM = 304.8;

var dvlState = {
  mode: 1,
  m1: { pitch: 1.25, panelKey: '600x337.5', cabW: 600, cabH: 337.5, targetResKey: '1080p', resW: 1920, resH: 1080 },
  m2: { wallWidthMm: 3000, wallHeightMm: 1688, focusPanelKey: '600x337.5', viewerDistM: 2.5 },
  m3: { panelKey: '600x337.5', cabW: 600, cabH: 337.5, cols: 5, rows: 4, customW: 600, customH: 337.5, viewerDistM: 2.5, selectedPitch: 1.5625 }
};

var GLOBAL_PANELS = {
  '600x337.5': { name: '600 × 337.5 mm', w: 600, h: 337.5, aspect: '16:9', desc: 'Standard Pro AV 16:9' },
  '480x270':   { name: '480 × 270 mm',   w: 480, h: 270,   aspect: '16:9', desc: 'Fine-Pitch MicroLED' },
  '960x540':   { name: '960 × 540 mm',   w: 960, h: 540,   aspect: '16:9', desc: 'Large Commercial Format' },
  '500x500':   { name: '500 × 500 mm',   w: 500, h: 500,   aspect: '1:1',  desc: 'Rental & Staging Standard' },
  '480x480':   { name: '480 × 480 mm',   w: 480, h: 480,   aspect: '1:1',  desc: 'Architectural Series' },
  '250x250':   { name: '250 × 250 mm',   w: 250, h: 250,   aspect: '1:1',  desc: 'Compact Puck Series' },
  '500x1000':  { name: '500 × 1000 mm',  w: 500, h: 1000,  aspect: '1:2',  desc: 'Touring / Stage Backdrop' },
  '640x480':   { name: '640 × 480 mm',   w: 640, h: 480,   aspect: '4:3',  desc: 'Broadcast Studio Series' },
  '400x300':   { name: '400 × 300 mm',   w: 400, h: 300,   aspect: '4:3',  desc: 'Modular Fine Pitch 4:3' }
};

var RESOLUTION_PRESETS = {
  '1080p':   { w: 1920, h: 1080, name: 'Full HD 1080p (16:9 Standard)' },
  '4k':      { w: 3840, h: 2160, name: '4K UHD (16:9 Ultra HD)' },
  '8k':      { w: 7680, h: 4320, name: '8K UHD (16:9 Next-Gen)' },
  '720p':    { w: 1280, h: 720,  name: 'HD Ready (1280 × 720)' },
  'wuxga':   { w: 1920, h: 1200, name: 'WUXGA (16:10 Presentation)' },
  '21_9_5k': { w: 5120, h: 2160, name: '21:9 UltraWide 5K (Teams Front Row)' },
  '21_9_3k': { w: 3440, h: 1440, name: '21:9 UltraWide 3.4K Standard' },
  '21_9_2k': { w: 2560, h: 1080, name: '21:9 UltraWide 1080p' },
  '32_9_5k': { w: 5120, h: 1440, name: '32:9 Super UltraWide Dual-QHD' },
  '32_9_3k': { w: 3840, h: 1080, name: '32:9 Super UltraWide Dual-FHD' }
};

function switchDvlMode(newMode) {
  dvlState.mode = newMode;
  var btn1 = document.getElementById('tabMode1');
  var btn2 = document.getElementById('tabMode2');
  var btn3 = document.getElementById('tabMode3');
  var sec1 = document.getElementById('sectionMode1');
  var sec2 = document.getElementById('sectionMode2');
  var sec3 = document.getElementById('sectionMode3');

  if (btn1) btn1.className = (newMode === 1) ? "btn btn-sm btn-outline-info active fw-bold px-3 py-2 me-2" : "btn btn-sm btn-outline-info fw-bold px-3 py-2 me-2";
  if (btn2) btn2.className = (newMode === 2) ? "btn btn-sm btn-outline-success active fw-bold px-3 py-2 me-2" : "btn btn-sm btn-outline-success fw-bold px-3 py-2 me-2";
  if (btn3) btn3.className = (newMode === 3) ? "btn btn-sm btn-outline-warning active fw-bold px-3 py-2" : "btn btn-sm btn-outline-warning fw-bold px-3 py-2";

  if (sec1) sec1.classList.toggle('d-none', newMode !== 1);
  if (sec2) sec2.classList.toggle('d-none', newMode !== 2);
  if (sec3) sec3.classList.toggle('d-none', newMode !== 3);

  if (newMode === 1) {
    calculateMode1();
  } else if (newMode === 2) {
    calculateMode2();
  } else if (newMode === 3) {
    calculateMode3();
  }
}

function onM1PanelChange() {
  var sel = document.getElementById('m1-panel-select')?.value || '600x337.5';
  dvlState.m1.panelKey = sel;
  var customBox = document.getElementById('m1-custom-panel-box');

  if (sel === 'custom') {
    if (customBox) customBox.classList.remove('d-none');
    dvlState.m1.cabW = parseFloat(document.getElementById('m1-custom-cab-w')?.value) || 600;
    dvlState.m1.cabH = parseFloat(document.getElementById('m1-custom-cab-h')?.value) || 337.5;
  } else {
    if (customBox) customBox.classList.add('d-none');
    if (GLOBAL_PANELS[sel]) {
      dvlState.m1.cabW = GLOBAL_PANELS[sel].w;
      dvlState.m1.cabH = GLOBAL_PANELS[sel].h;
    }
  }
  calculateMode1();
}

function setM1Pitch(p) {
  dvlState.m1.pitch = p;
  var inp = document.getElementById('m1-input-pitch');
  if (inp) inp.value = p;
  var disp = document.getElementById('m1-pitch-display');
  if (disp) disp.textContent = 'P ' + p.toFixed(2) + ' mm';

  document.querySelectorAll('.m1-pitch-btn').forEach(btn => {
    var bp = parseFloat(btn.getAttribute('data-pitch'));
    if (Math.abs(bp - p) < 0.01) {
      btn.className = "m1-pitch-btn btn btn-sm btn-info active py-1 text-xs font-mono fw-bold";
    } else {
      btn.className = "m1-pitch-btn btn btn-sm btn-outline-secondary py-1 text-xs font-mono";
    }
  });
  calculateMode1();
}

function onM1ManualPitchInput() {
  var val = parseFloat(document.getElementById('m1-input-pitch')?.value) || 1.25;
  dvlState.m1.pitch = val;
  var disp = document.getElementById('m1-pitch-display');
  if (disp) disp.textContent = 'P ' + val.toFixed(2) + ' mm';
  calculateMode1();
}

function calculateMode1() {
  var p = dvlState.m1.pitch;
  var resKey = document.getElementById('m1-target-res')?.value || '1080p';
  dvlState.m1.targetResKey = resKey;
  var res = RESOLUTION_PRESETS[resKey] || RESOLUTION_PRESETS['1080p'];
  dvlState.m1.resW = res.w;
  dvlState.m1.resH = res.h;

  if (dvlState.m1.panelKey === 'custom') {
    dvlState.m1.cabW = parseFloat(document.getElementById('m1-custom-cab-w')?.value) || 600;
    dvlState.m1.cabH = parseFloat(document.getElementById('m1-custom-cab-h')?.value) || 337.5;
  }

  var cabW = dvlState.m1.cabW;
  var cabH = dvlState.m1.cabH;

  var theoreticalWidthMm = res.w * p;
  var theoreticalHeightMm = res.h * p;

  var cols = Math.max(1, Math.round(theoreticalWidthMm / cabW));
  var rows = Math.max(1, Math.round(theoreticalHeightMm / cabH));
  var totalCabinets = cols * rows;

  var actualWidthMm = cols * cabW;
  var actualHeightMm = rows * cabH;
  var actualDiagMm = Math.sqrt(actualWidthMm * actualWidthMm + actualHeightMm * actualHeightMm);
  var actualDiagInches = actualDiagMm / 25.4;

  var cabPixelsX = Math.round(cabW / p);
  var cabPixelsY = Math.round(cabH / p);
  var actualPixelsW = cols * cabPixelsX;
  var actualPixelsH = rows * cabPixelsY;
  var totalPixels = actualPixelsW * actualPixelsH;

  var areaSqM = (actualWidthMm / 1000) * (actualHeightMm / 1000);
  var areaSqFt = areaSqM * 10.7639;

  var typicalPowerW = Math.round(areaSqM * 250);
  var maxPowerW = Math.round(areaSqM * 750);
  var heatBtuHr = Math.round(typicalPowerW * 3.412);
  var structuralWeightKg = Math.round(areaSqM * 32);

  var gigaPortsNeeded = Math.ceil(totalPixels / 650000);
  var minAcuityDist = (p * 1.0).toFixed(1);
  var optAcuityDist = (p * 1.5).toFixed(1);

  renderMode1Badges({
    diagIn: actualDiagInches, wMm: actualWidthMm, hMm: actualHeightMm,
    cols: cols, rows: rows, totalCabinets: totalCabinets,
    cabW: cabW, cabH: cabH, p: p, minAcuityDist: minAcuityDist, optAcuityDist: optAcuityDist,
    actualPixelsW: actualPixelsW, actualPixelsH: actualPixelsH, resName: res.name
  });

  drawArraySVG(cols, rows, actualWidthMm, actualHeightMm, cabW, cabH, '#38bdf8');

  renderMode1ElaborativeDetails({
    cols: cols, rows: rows, totalCabinets: totalCabinets, cabW: cabW, cabH: cabH,
    wMm: actualWidthMm, hMm: actualHeightMm, diagIn: actualDiagInches,
    p: p, actualPixelsW: actualPixelsW, actualPixelsH: actualPixelsH, totalPixels: totalPixels,
    cabPixelsX: cabPixelsX, cabPixelsY: cabPixelsY, resName: res.name, targetW: res.w, targetH: res.h,
    areaSqM: areaSqM, areaSqFt: areaSqFt, typicalPowerW: typicalPowerW, maxPowerW: maxPowerW,
    heatBtuHr: heatBtuHr, structuralWeightKg: structuralWeightKg, gigaPortsNeeded: gigaPortsNeeded,
    minAcuityDist: minAcuityDist, optAcuityDist: optAcuityDist
  });
}

function renderMode1Badges(d) {
  var c = document.getElementById('badges-container');
  if (!c) return;
  c.innerHTML = `
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">WALL DIAGONAL</span>
        <div class="fs-4 font-mono fw-extrabold my-1" style="color: #38bdf8 !important;">${d.diagIn.toFixed(1)}"</div>
        <div class="small font-mono" style="color: #cbd5e1 !important;">${(d.diagIn * 0.0254).toFixed(2)} m</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">ARRAY FOOTPRINT</span>
        <div class="fs-6 font-mono fw-bold my-1" style="color: #f8fafc !important;">${Math.round(d.wMm)} &times; ${Math.round(d.hMm)} mm</div>
        <div class="small font-mono" style="color: #cbd5e1 !important;">${(d.wMm * MM_TO_FT).toFixed(1)} &times; ${(d.hMm * MM_TO_FT).toFixed(1)} ft</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">CABINET GRID</span>
        <div class="fs-4 font-mono fw-bold my-1" style="color: #4ade80 !important;">${d.cols} &times; ${d.rows}</div>
        <div class="small font-mono" style="color: #86efac !important;">${d.totalCabinets} panels</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">VIEWER ACUITY</span>
        <div class="fs-5 font-mono fw-bold my-1" style="color: #facc15 !important;">${d.minAcuityDist} - ${d.optAcuityDist} m</div>
        <div class="small font-mono" style="color: #fde047 !important;">${(d.minAcuityDist*3.28).toFixed(1)} - ${(d.optAcuityDist*3.28).toFixed(1)} ft</div>
      </div>
    </div>`;
}

function renderMode1ElaborativeDetails(d) {
  var box = document.getElementById('details-container');
  if (!box) return;
  var isExact = d.actualPixelsW === d.targetW && d.actualPixelsH === d.targetH;
  var aspectVal = (d.wMm / d.hMm).toFixed(3);
  var aspectDelta = Math.abs(aspectVal - 1.778);

  box.innerHTML = `
    <div class="d-flex justify-content-between align-items-center pb-2 border-bottom border-secondary mb-3 flex-wrap gap-2">
      <div>
        <span class="badge ${isExact ? 'bg-success' : 'bg-primary'} me-2 font-mono">${isExact ? '1:1 Native Pixel Mapping' : 'Modular Scaled Canvas'}</span>
        <strong style="color: #f8fafc !important;" class="fs-6">${d.cols} &times; ${d.rows} Array (${d.totalCabinets} Total Cabinets)</strong>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-info font-mono">${(d.wMm/1000).toFixed(2)}m W &times; ${(d.hMm/1000).toFixed(2)}m H</span>
        <span class="badge bg-secondary font-mono">${d.actualPixelsW} &times; ${d.actualPixelsH} px</span>
      </div>
    </div>
    <div class="row g-3">
      <!-- Card 1: Resolution & Geometric Derivation -->
      <div class="col-lg-6 col-12">
        <div class="p-3 rounded border h-100" style="background-color: #0f172a !important; border-color: #334155 !important; color: #f8fafc !important;">
          <div class="fw-bold font-mono mb-2" style="color: #38bdf8 !important;">
            <i class="fa-solid fa-ruler-combined me-1"></i>1. Resolution &amp; Geometric Derivation (P = ${d.p} mm)
          </div>
          <div class="font-mono small space-y-1" style="color: #e2e8f0 !important;">
            <div>&bull; Cabinet Pixel Res: (${d.cabW} / ${d.p}) &times; (${d.cabH} / ${d.p}) = <strong>${d.cabPixelsX} &times; ${d.cabPixelsY} px</strong></div>
            <div>&bull; Built Array Res: (${d.cols} &times; ${d.cabPixelsX}) &times; (${d.rows} &times; ${d.cabPixelsY}) = <strong style="color: #4ade80 !important;">${d.actualPixelsW} &times; ${d.actualPixelsH} px</strong></div>
            <div>&bull; Total Active Pixels: <strong class="text-white">${(d.totalPixels / 1000000).toFixed(2)} MP</strong> (${d.totalPixels.toLocaleString()} LEDs)</div>
            <div>&bull; Physical Diagonal: <strong class="text-warning">${d.diagIn.toFixed(1)}"</strong> (${(d.diagIn*0.0254).toFixed(2)} m / ${(d.diagIn/12).toFixed(2)} ft)</div>
            <div>&bull; Wall Area: <strong class="text-info">${(d.wMm * d.hMm / 1e6).toFixed(2)} m² (${(d.wMm * d.hMm / 1e6 * 10.7639).toFixed(1)} sq ft)</strong></div>
            <div>&bull; Active Aspect Ratio: ${d.wMm} / ${d.hMm} = <strong class="${aspectDelta < 0.05 ? 'text-success' : 'text-warning'}">${aspectVal}:1</strong></div>
          </div>
        </div>
      </div>

      <!-- Card 2: Standards of Calculation & Visual Acuity -->
      <div class="col-lg-6 col-12">
        <div class="p-3 rounded border h-100" style="background-color: #0f172a !important; border-color: #334155 !important; color: #f8fafc !important;">
          <div class="fw-bold font-mono mb-2" style="color: #4ade80 !important;">
            <i class="fa-solid fa-users-viewfinder me-1"></i>2. Visual Acuity &amp; Standards of Calculation
          </div>
          <div class="row g-2 font-mono small">
            <div class="col-sm-6 col-12">
              <div class="p-2 rounded border h-100" style="background-color: #1e293b !important; border-color: #334155 !important;">
                <div class="text-success fw-bold mb-1"><i class="fa-solid fa-user me-1"></i>FIRST PERSON DISTANCE</div>
                <div>&bull; <strong>AVIXA 20/20 Acuity:</strong> <span class="text-warning fw-bold">${(d.p * 3.44).toFixed(2)} m</span> (${(d.p * 3.44 * 3.28084).toFixed(1)} ft)</div>
                <div class="text-slate-400 text-xs">Human eye threshold (P &times; 3.44)</div>
                <div class="mt-1">&bull; <strong>Comfort Limit (1.0xW):</strong> <span class="text-white">${(d.wMm/1000).toFixed(2)} m</span></div>
              </div>
            </div>
            <div class="col-sm-6 col-12">
              <div class="p-2 rounded border h-100" style="background-color: #1e293b !important; border-color: #334155 !important;">
                <div class="text-info fw-bold mb-1"><i class="fa-solid fa-users me-1"></i>LAST PERSON DISTANCE</div>
                <div>&bull; <strong>AVIXA DISCAS (6H):</strong> <span class="text-success fw-bold">${(d.hMm/1000 * 6).toFixed(2)} m</span> (${(d.hMm/1000 * 6 * 3.28084).toFixed(1)} ft)</div>
                <div class="text-slate-400 text-xs">Industry standard 6 &times; Height</div>
                <div class="mt-1">&bull; <strong>Basic Decision (8H):</strong> <span class="text-info">${(d.hMm/1000 * 8).toFixed(2)} m</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Video Processing & Controller Loading -->
      <div class="col-lg-6 col-12">
        <div class="p-3 rounded border h-100" style="background-color: #0f172a !important; border-color: #334155 !important; color: #f8fafc !important;">
          <div class="fw-bold font-mono mb-2" style="color: #38bdf8 !important;">
            <i class="fa-solid fa-network-wired me-1"></i>3. Video Processing &amp; Controller Loading
          </div>
          <div class="font-mono small space-y-1" style="color: #e2e8f0 !important;">
            <div>&bull; Target Canvas Standard: <strong>${d.resName} (${d.targetW} &times; ${d.targetH})</strong></div>
            <div>&bull; Controller Loading: <strong>${d.gigaPortsNeeded} &times; Gigabit Ethernet (RJ45) Ports</strong> (@ 650k px/port)</div>
            <div>&bull; Native Resolution Fit: <strong class="${isExact ? 'text-success' : 'text-warning'}">${isExact ? 'Pixel-to-Pixel Exact Fit (Zero Scaling)' : 'Video Processor Scaling Required'}</strong></div>
            <div>&bull; Pixel Canvas Surplus / Deficit: <strong>${d.actualPixelsW - d.targetW} px (W) / ${d.actualPixelsH - d.targetH} px (H)</strong></div>
          </div>
        </div>
      </div>

      <!-- Card 4: Electrical Power, Thermal Load & Weight -->
      <div class="col-lg-6 col-12">
        <div class="p-3 rounded border h-100" style="background-color: #0f172a !important; border-color: #334155 !important; color: #f8fafc !important;">
          <div class="fw-bold font-mono mb-2" style="color: #facc15 !important;">
            <i class="fa-solid fa-bolt me-1"></i>4. Electrical Power, Thermal HVAC Load &amp; Structural Weight
          </div>
          <div class="row g-2 font-mono small">
            <div class="col-sm-6 col-12">
              <div class="p-2 rounded border" style="background-color: #1e293b !important; border-color: #334155 !important;">
                <div class="text-slate-400 text-xs">TYPICAL RUNNING LOAD</div>
                <div class="text-info fw-bold fs-6">${d.typicalPowerW.toLocaleString()} W</div>
                <div class="text-slate-400 text-xs">Heat: <span class="text-warning fw-bold">${d.heatBtuHr.toLocaleString()} BTU/hr</span></div>
              </div>
            </div>
            <div class="col-sm-6 col-12">
              <div class="p-2 rounded border" style="background-color: #1e293b !important; border-color: #334155 !important;">
                <div class="text-slate-400 text-xs">PEAK 100% WHITE LOAD</div>
                <div class="text-danger fw-bold fs-6">${d.maxPowerW.toLocaleString()} W</div>
                <div class="text-slate-400 text-xs">Mains: <span class="text-white fw-bold">${Math.ceil(d.maxPowerW / (230*16*0.8))} &times; 16A Circuits</span></div>
              </div>
            </div>
            <div class="col-sm-6 col-12">
              <div class="p-2 rounded border" style="background-color: #1e293b !important; border-color: #334155 !important;">
                <div class="text-slate-400 text-xs">HVAC COOLING TONNAGE</div>
                <div class="text-success fw-bold fs-6">${(d.heatBtuHr / 12000).toFixed(2)} TR Tons</div>
                <div class="text-slate-400 text-xs">Airflow: ${Math.round((d.heatBtuHr / 12000) * 400)} CFM</div>
              </div>
            </div>
            <div class="col-sm-6 col-12">
              <div class="p-2 rounded border" style="background-color: #1e293b !important; border-color: #334155 !important;">
                <div class="text-slate-400 text-xs">TOTAL STRUCTURAL WEIGHT</div>
                <div class="text-white fw-bold fs-6">&asymp; ${d.structuralWeightKg} kg</div>
                <div class="text-slate-400 text-xs">(${Math.round(d.structuralWeightKg * 2.20462)} lbs dead load)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function syncM2WidthFromMm() {
  var val = parseFloat(document.getElementById('m2-width-mm')?.value) || 0;
  dvlState.m2.wallWidthMm = val;
  var ftInp = document.getElementById('m2-width-ft');
  if (ftInp) ftInp.value = (val * MM_TO_FT).toFixed(2);
  updateM2Summaries();
  calculateMode2();
}

function syncM2WidthFromFt() {
  var val = parseFloat(document.getElementById('m2-width-ft')?.value) || 0;
  dvlState.m2.wallWidthMm = Math.round(val * FT_TO_MM);
  var mmInp = document.getElementById('m2-width-mm');
  if (mmInp) mmInp.value = dvlState.m2.wallWidthMm;
  updateM2Summaries();
  calculateMode2();
}

function syncM2HeightFromMm() {
  var val = parseFloat(document.getElementById('m2-height-mm')?.value) || 0;
  dvlState.m2.wallHeightMm = val;
  var ftInp = document.getElementById('m2-height-ft');
  if (ftInp) ftInp.value = (val * MM_TO_FT).toFixed(2);
  updateM2Summaries();
  calculateMode2();
}

function syncM2HeightFromFt() {
  var val = parseFloat(document.getElementById('m2-height-ft')?.value) || 0;
  dvlState.m2.wallHeightMm = Math.round(val * FT_TO_MM);
  var mmInp = document.getElementById('m2-height-mm');
  if (mmInp) mmInp.value = dvlState.m2.wallHeightMm;
  updateM2Summaries();
  calculateMode2();
}

function syncM2DiagonalFromInches() {
  var diagInches = parseFloat(document.getElementById('m2-diag-input-in')?.value) || 135.5;
  var diagMm = diagInches * 25.4;
  var mmInp = document.getElementById('m2-diag-input-mm');
  if (mmInp) mmInp.value = Math.round(diagMm);
  snapM2Diagonal(diagInches);
}

function syncM2DiagonalFromMm() {
  var diagMm = parseFloat(document.getElementById('m2-diag-input-mm')?.value) || 3442;
  var diagInches = diagMm / 25.4;
  var inInp = document.getElementById('m2-diag-input-in');
  if (inInp) inInp.value = diagInches.toFixed(1);
  snapM2Diagonal(diagInches);
}

function updateM2Summaries() {
  var wM = (dvlState.m2.wallWidthMm / 1000).toFixed(2);
  var wFt = (dvlState.m2.wallWidthMm * MM_TO_FT).toFixed(2);
  var wSum = document.getElementById('m2-width-summary');
  if (wSum) wSum.textContent = wM + ' m / ' + wFt + ' ft';

  var hM = (dvlState.m2.wallHeightMm / 1000).toFixed(2);
  var hFt = (dvlState.m2.wallHeightMm * MM_TO_FT).toFixed(2);
  var hSum = document.getElementById('m2-height-summary');
  if (hSum) hSum.textContent = hM + ' m / ' + hFt + ' ft';

  var diagInches = (Math.sqrt(Math.pow(dvlState.m2.wallWidthMm, 2) + Math.pow(dvlState.m2.wallHeightMm, 2)) / 25.4).toFixed(1);
  var diagDisp = document.getElementById('m2-diag-calc-display');
  if (diagDisp) diagDisp.textContent = diagInches + '"';
}

var currentM2Aspect = '16:9';

function setM2AspectRatio(ratio) {
  currentM2Aspect = ratio;
  var b16 = document.getElementById('btnM2Ar169');
  var b21 = document.getElementById('btnM2Ar219');
  var b32 = document.getElementById('btnM2Ar329');
  if (b16) b16.className = (ratio === '16:9') ? 'btn btn-xs btn-primary font-mono' : 'btn btn-xs btn-outline-secondary font-mono';
  if (b21) b21.className = (ratio === '21:9') ? 'btn btn-xs btn-primary font-mono' : 'btn btn-xs btn-outline-secondary font-mono';
  if (b32) b32.className = (ratio === '32:9') ? 'btn btn-xs btn-primary font-mono' : 'btn btn-xs btn-outline-secondary font-mono';

  var lbl = document.getElementById('m2-aspect-ratio-label');
  if (lbl) lbl.innerText = ratio + (ratio === '21:9' ? ' UltraWide' : (ratio === '32:9' ? ' SuperWide' : ' Widescreen'));

  var diagInp = parseFloat(document.getElementById('m2-diag-input-in')?.value) || 135.5;
  snapM2Diagonal(diagInp);
}
window.setM2AspectRatio = setM2AspectRatio;

function snapM2Diagonal(diagInches) {
  var diagMm = diagInches * 25.4;
  var wMm, hMm;
  if (currentM2Aspect === '21:9') {
    var diagFactor = Math.sqrt(21*21 + 9*9); // ~22.8473
    wMm = Math.round(diagMm * (21 / diagFactor));
    hMm = Math.round(diagMm * (9 / diagFactor));
  } else if (currentM2Aspect === '32:9') {
    var diagFactor = Math.sqrt(32*32 + 9*9); // ~33.2415
    wMm = Math.round(diagMm * (32 / diagFactor));
    hMm = Math.round(diagMm * (9 / diagFactor));
  } else {
    // 16:9
    var diagFactor = Math.sqrt(16*16 + 9*9); // ~18.35756
    wMm = Math.round(diagMm * (16 / diagFactor));
    hMm = Math.round(diagMm * (9 / diagFactor));
  }

  dvlState.m2.wallWidthMm = wMm;
  dvlState.m2.wallHeightMm = hMm;

  var wMmInp = document.getElementById('m2-width-mm');
  var wFtInp = document.getElementById('m2-width-ft');
  var hMmInp = document.getElementById('m2-height-mm');
  var hFtInp = document.getElementById('m2-height-ft');

  if (wMmInp) wMmInp.value = wMm;
  if (wFtInp) wFtInp.value = (wMm * MM_TO_FT).toFixed(2);
  if (hMmInp) hMmInp.value = hMm;
  if (hFtInp) hFtInp.value = (hMm * MM_TO_FT).toFixed(2);

  updateM2Summaries();
  calculateMode2();
}

function onM2ViewerSliderChange() {
  var v = parseFloat(document.getElementById('m2-viewer-slider')?.value) || 2.5;
  dvlState.m2.viewerDistM = v;
  var disp = document.getElementById('m2-viewer-dist-text');
  if (disp) disp.textContent = v.toFixed(1) + ' m (' + (v * 3.28084).toFixed(1) + ' ft)';
  calculateMode2();
}

function calculateMode2() {
  var wMm = dvlState.m2.wallWidthMm;
  var hMm = dvlState.m2.wallHeightMm;
  var focusKey = document.getElementById('m2-panel-select')?.value || '600x337.5';
  dvlState.m2.focusPanelKey = focusKey;
  var pInfo = GLOBAL_PANELS[focusKey] || GLOBAL_PANELS['600x337.5'];

  var pitchForFHD = (wMm / 1920).toFixed(2);
  var pitchFor4K = (wMm / 3840).toFixed(2);
  var maxAcuityPitch = (dvlState.m2.viewerDistM / 1.5).toFixed(2);

  var cols = Math.max(1, Math.round(wMm / pInfo.w));
  var rows = Math.max(1, Math.round(hMm / pInfo.h));
  var totalCabinets = cols * rows;

  var actualWidthMm = cols * pInfo.w;
  var actualHeightMm = rows * pInfo.h;
  var actualHeightM = actualHeightMm / 1000.0;
  var actualDiagMm = Math.sqrt(actualWidthMm * actualWidthMm + actualHeightMm * actualHeightMm);
  var actualDiagInches = actualDiagMm / 25.4;

  var pFhd = parseFloat(pitchForFHD) || 1.5;
  var firstPersonAcuity = (pFhd * 3.44).toFixed(1);
  var lastPerson6H = (actualHeightM * 6.0).toFixed(1);
  var lastPerson8H = (actualHeightM * 8.0).toFixed(1);
  var lastPerson4H = (actualHeightM * 4.0).toFixed(1);

  renderMode2Badges({
    pitchForFHD: pitchForFHD, pitchFor4K: pitchFor4K, maxAcuityPitch: maxAcuityPitch,
    viewerDistM: dvlState.m2.viewerDistM, actualDiagInches: actualDiagInches,
    cols: cols, rows: rows, totalCabinets: totalCabinets,
    firstPersonAcuity: firstPersonAcuity, lastPerson6H: lastPerson6H, lastPerson8H: lastPerson8H
  });

  drawArraySVG(cols, rows, actualWidthMm, actualHeightMm, pInfo.w, pInfo.h, '#10b981');
  renderMode2MultiPanelTable(wMm, hMm, focusKey, pitchForFHD, pitchFor4K, maxAcuityPitch);
}

function renderMode2Badges(d) {
  var c = document.getElementById('badges-container');
  if (!c) return;
  c.innerHTML = `
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">1080p / 4K PITCH</span>
        <div class="fs-5 font-mono fw-extrabold my-1" style="color: #4ade80 !important;">P ${d.pitchForFHD} / P ${d.pitchFor4K}</div>
        <div class="small font-mono text-success">FHD / 4K Achievable</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">SELECTED GRID FIT</span>
        <div class="fs-4 font-mono fw-bold my-1" style="color: #f8fafc !important;">${d.cols} &times; ${d.rows}</div>
        <div class="small font-mono text-info">${d.totalCabinets} Panels &bull; ${d.actualDiagInches.toFixed(1)}"</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">ACUITY PITCH LIMIT</span>
        <div class="fs-4 font-mono fw-extrabold my-1" style="color: #facc15 !important;">&le; ${d.maxAcuityPitch} mm</div>
        <div class="small font-mono text-warning">@ ${d.viewerDistM.toFixed(1)}m Viewing</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">1ST / LAST PERSON DIST</span>
        <div class="fs-6 font-mono fw-bold my-1" style="color: #38bdf8 !important;">${d.firstPersonAcuity}m &bull; ${d.lastPerson6H}m</div>
        <div class="small font-mono text-slate-300">1st: Acuity | Last: 6H DISCAS</div>
      </div>
    </div>`;
}

function renderMode2MultiPanelTable(targetW, targetH, selectedKey, pitchFHD, pitch4K, maxAcuity) {
  var box = document.getElementById('details-container');
  if (!box) return;

  var panelKeys = ['600x337.5', '500x500', '500x1000', '480x270', '480x480', '640x480'];
  var rowsHtml = '';

  panelKeys.forEach(key => {
    var p = GLOBAL_PANELS[key];
    var cols = Math.max(1, Math.round(targetW / p.w));
    var rows = Math.max(1, Math.round(targetH / p.h));
    var total = cols * rows;
    var actW = cols * p.w;
    var actH = rows * p.h;
    var diagIn = (Math.sqrt(actW * actW + actH * actH) / 25.4).toFixed(1);
    var isSelected = key === selectedKey;
    var deltaW = actW - targetW;
    var deltaH = actH - targetH;
    var fillRatio = Math.min(100, Math.round(((actW * actH) / (targetW * targetH)) * 100));

    rowsHtml += `
      <tr style="${isSelected ? 'background-color: #064e3b !important; color: #ffffff !important; border: 1.5px solid #10b981;' : ''}">
        <td class="py-2 px-3 ${isSelected ? 'text-success fw-bold' : 'text-white'} font-mono">
          ${isSelected ? '<span class="badge bg-success me-1">ACTIVE</span>' : ''}${p.name}
        </td>
        <td class="py-2 px-2 font-mono ${isSelected ? 'text-white' : 'text-slate-300'}">${p.aspect}</td>
        <td class="py-2 px-2 font-mono ${isSelected ? 'text-warning fw-bold' : 'text-info'}">${cols} &times; ${rows} (<strong class="text-white">${total}</strong>)</td>
        <td class="py-2 px-2 font-mono ${isSelected ? 'text-white' : 'text-slate-200'}">${actW} &times; ${actH} mm <span class="text-slate-400">(${(actW/1000).toFixed(2)} &times; ${(actH/1000).toFixed(2)} m)</span></td>
        <td class="py-2 px-2 font-mono ${isSelected ? 'text-warning fw-bold' : 'text-success'}">${diagIn}"</td>
        <td class="py-2 px-2 font-mono">
          <span class="badge ${Math.abs(100 - fillRatio) <= 5 ? 'bg-success' : (fillRatio > 100 ? 'bg-warning text-dark' : 'bg-secondary')}">${fillRatio}%</span>
        </td>
        <td class="py-2 px-2 font-mono ${isSelected ? 'text-white' : 'text-slate-300'} small">
          ${deltaW >= 0 ? '+' + deltaW : deltaW} mm (W) / ${deltaH >= 0 ? '+' + deltaH : deltaH} mm (H)
        </td>
        <td class="py-2 px-2 text-center">
          <button type="button" class="btn btn-xs ${isSelected ? 'btn-success' : 'btn-outline-info'} py-0 px-2 font-mono" style="font-size:0.7rem;" onclick="applyM2PanelDirect('${key}')">
            ${isSelected ? 'Selected' : 'Use Panel'}
          </button>
        </td>
      </tr>`;
  });

  box.innerHTML = `
    <div class="d-flex justify-content-between align-items-center pb-2 border-bottom border-secondary mb-3 flex-wrap gap-2">
      <div>
        <h5 class="text-white mb-0 fw-bold"><i class="fa-solid fa-table me-2 text-success"></i>Global LED Panel Architecture Standards Fit Analysis</h5>
        <div class="small text-muted font-mono">Architectural Target Opening: <strong class="text-white">${targetW} &times; ${targetH} mm</strong> (${(targetW/1000).toFixed(2)} &times; ${(targetH/1000).toFixed(2)} m / ${(targetW*MM_TO_FT).toFixed(2)} &times; ${(targetH*MM_TO_FT).toFixed(2)} ft)</div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-success font-mono">Auto-Evaluated 6 Global Standards</span>
      </div>
    </div>

    <!-- Quick Engineering Benchmark KPI Ribbon -->
    <div class="row g-2 mb-3 font-mono small">
      <div class="col-md-3 col-6">
        <div class="p-2 rounded bg-dark border border-secondary text-center">
          <div class="text-slate-400 text-xs">REQUIRED PITCH (FHD 1080p)</div>
          <div class="fs-6 fw-bold text-success">${pitchFHD} mm</div>
          <div class="text-muted text-xs">Native 1920 &times; 1080</div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="p-2 rounded bg-dark border border-secondary text-center">
          <div class="text-slate-400 text-xs">REQUIRED PITCH (4K UHD)</div>
          <div class="fs-6 fw-bold text-info">${pitch4K} mm</div>
          <div class="text-muted text-xs">Native 3840 &times; 2160</div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="p-2 rounded bg-dark border border-secondary text-center">
          <div class="text-slate-400 text-xs">VISUAL ACUITY THRESHOLD</div>
          <div class="fs-6 fw-bold text-warning">&le; ${maxAcuity} mm</div>
          <div class="text-muted text-xs">Closest Viewer Rule</div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="p-2 rounded bg-dark border border-secondary text-center">
          <div class="text-slate-400 text-xs">TARGET WALL AREA</div>
          <div class="fs-6 fw-bold text-white">${((targetW * targetH) / 1e6).toFixed(2)} m²</div>
          <div class="text-muted text-xs">${((targetW * targetH / 1e6) * 10.7639).toFixed(1)} sq ft</div>
        </div>
      </div>
    </div>

    <!-- Full Width Multi-Panel Engineering Matrix Table -->
    <div class="table-responsive">
      <table class="table table-dark table-sm table-hover mb-0 align-middle small font-mono">
        <thead>
          <tr class="text-slate-300 border-secondary bg-slate-800">
            <th class="py-2 px-3">Global Panel Architecture Standard</th>
            <th class="py-2 px-2">Ratio</th>
            <th class="py-2 px-2">Cabinet Multiplier</th>
            <th class="py-2 px-2">Built Physical Size (W &times; H)</th>
            <th class="py-2 px-2">Diagonal</th>
            <th class="py-2 px-2">Opening Fill %</th>
            <th class="py-2 px-2">Delta vs Opening</th>
            <th class="py-2 px-2 text-center">Quick Select</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

function applyM2PanelDirect(key) {
  var sel = document.getElementById('m2-panel-select');
  if (sel) {
    sel.value = key;
    calculateMode2();
  }
}

function drawArraySVG(cols, rows, wMm, hMm, cabW, cabH, accentColor) {
  var svg = document.getElementById('svg-wall-array');
  if (!svg) return;
  svg.innerHTML = '';

  var svgW = 1000, svgH = 560, margin = 60;
  var maxDrawW = svgW - margin * 2;
  var maxDrawH = svgH - margin * 2;
  var scale = Math.min(maxDrawW / wMm, maxDrawH / hMm);
  var drawW = wMm * scale;
  var drawH = hMm * scale;
  var startX = (svgW - drawW) / 2;
  var startY = (svgH - drawH) / 2;
  var tileW = drawW / cols;
  var tileH = drawH / rows;

  var dimLeg = document.getElementById('svg-dimension-legend');
  var cabBreak = document.getElementById('svg-cabinet-breakdown');
  if (dimLeg) dimLeg.textContent = Math.round(wMm) + ' mm (W) × ' + Math.round(hMm) + ' mm (H)';
  if (cabBreak) cabBreak.textContent = 'Array: ' + cols + ' cols × ' + rows + ' rows (' + (cols * rows) + ' Total Cabinets @ ' + cabW + '×' + cabH + ' mm)';

  var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `<linearGradient id="cab-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#161f30" /><stop offset="100%" stop-color="#0e1422" /></linearGradient>`;
  svg.appendChild(defs);

  var backing = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  backing.setAttribute('x', startX - 4); backing.setAttribute('y', startY - 4);
  backing.setAttribute('width', drawW + 8); backing.setAttribute('height', drawH + 8);
  backing.setAttribute('rx', '6'); backing.setAttribute('fill', '#050811');
  backing.setAttribute('stroke', '#1e293b'); backing.setAttribute('stroke-width', '1.5');
  svg.appendChild(backing);

  for (var c = 0; c < cols; c++) {
    for (var r = 0; r < rows; r++) {
      var x = startX + c * tileW;
      var y = startY + r * tileH;
      var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x + 1); rect.setAttribute('y', y + 1);
      rect.setAttribute('width', tileW - 2); rect.setAttribute('height', tileH - 2);
      rect.setAttribute('rx', '2'); rect.setAttribute('fill', 'url(#cab-grad)');
      rect.setAttribute('stroke', accentColor); rect.setAttribute('stroke-width', '1'); rect.setAttribute('stroke-opacity', '0.65');
      svg.appendChild(rect);

      var cross = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      cross.setAttribute('cx', x + tileW / 2); cross.setAttribute('cy', y + tileH / 2);
      cross.setAttribute('r', '1.5'); cross.setAttribute('fill', accentColor); cross.setAttribute('fill-opacity', '0.4');
      svg.appendChild(cross);
    }
  }

  var border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  border.setAttribute('x', startX); border.setAttribute('y', startY);
  border.setAttribute('width', drawW); border.setAttribute('height', drawH);
  border.setAttribute('rx', '4'); border.setAttribute('fill', 'none');
  border.setAttribute('stroke', accentColor); border.setAttribute('stroke-width', '2.5');
  svg.appendChild(border);

  var lineTop = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  lineTop.innerHTML = `
    <line x1="${startX}" y1="${startY - 18}" x2="${startX + drawW}" y2="${startY - 18}" stroke="#64748b" stroke-width="1.5" />
    <line x1="${startX}" y1="${startY - 24}" x2="${startX}" y2="${startY - 12}" stroke="#64748b" stroke-width="1.5" />
    <line x1="${startX + drawW}" y1="${startY - 24}" x2="${startX + drawW}" y2="${startY - 12}" stroke="#64748b" stroke-width="1.5" />
    <text x="${startX + drawW / 2}" y="${startY - 26}" text-anchor="middle" fill="#cbd5e1" font-size="12" font-family="JetBrains Mono" font-weight="600">
      Width: ${Math.round(wMm)} mm (${(wMm * MM_TO_FT).toFixed(1)} ft) - ${cols} Cols
    </text>`;
  svg.appendChild(lineTop);

  var lineLeft = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  lineLeft.innerHTML = `
    <line x1="${startX - 18}" y1="${startY}" x2="${startX - 18}" y2="${startY + drawH}" stroke="#64748b" stroke-width="1.5" />
    <line x1="${startX - 24}" y1="${startY}" x2="${startX - 12}" y2="${startY}" stroke="#64748b" stroke-width="1.5" />
    <line x1="${startX - 24}" y1="${startY + drawH}" x2="${startX - 12}" y2="${startY + drawH}" stroke="#64748b" stroke-width="1.5" />
    <text x="${startX - 28}" y="${startY + drawH / 2}" text-anchor="middle" fill="#cbd5e1" font-size="12" font-family="JetBrains Mono" font-weight="600" transform="rotate(-90 ${startX - 28} ${startY + drawH / 2})">
      Height: ${Math.round(hMm)} mm (${(hMm * MM_TO_FT).toFixed(1)} ft) - ${rows} Rows
    </text>`;
  svg.appendChild(lineLeft);

  var diagText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  diagText.setAttribute('x', startX + drawW / 2); diagText.setAttribute('y', startY + drawH / 2);
  diagText.setAttribute('text-anchor', 'middle'); diagText.setAttribute('dominant-baseline', 'middle');
  diagText.setAttribute('fill', '#ffffff'); diagText.setAttribute('fill-opacity', '0.85');
  diagText.setAttribute('font-size', '16'); diagText.setAttribute('font-family', 'JetBrains Mono');
  diagText.setAttribute('font-weight', '700');
  diagText.textContent = (Math.sqrt(wMm*wMm + hMm*hMm) / 25.4).toFixed(1) + '" Diagonal';
  svg.appendChild(diagText);
}

// ==========================================
// MODE 3: PANEL MULTIPLIERS & ACHIEVABLE PITCH
// ==========================================
function onM3TargetDimChange(axis, val) {
  var cabW = dvlState.m3.cabW || 600;
  var cabH = dvlState.m3.cabH || 337.5;
  var numVal = parseFloat(val) || 0;
  if (numVal <= 0) return;

  if (axis === 'w') {
    var cols = Math.max(1, Math.round(numVal / cabW));
    var inpC = document.getElementById('m3-input-cols');
    if (inpC) inpC.value = cols;
    var noteW = document.getElementById('m3-target-w-ft-note');
    if (noteW) noteW.textContent = '≈ ' + (numVal * MM_TO_FT).toFixed(2) + ' ft / ' + (numVal / 1000).toFixed(2) + ' m';
  } else if (axis === 'h') {
    var rows = Math.max(1, Math.round(numVal / cabH));
    var inpR = document.getElementById('m3-input-rows');
    if (inpR) inpR.value = rows;
    var noteH = document.getElementById('m3-target-h-ft-note');
    if (noteH) noteH.textContent = '≈ ' + (numVal * MM_TO_FT).toFixed(2) + ' ft / ' + (numVal / 1000).toFixed(2) + ' m';
  }
  calculateMode3();
}

function onM3PanelChange() {
  var sel = document.getElementById('m3-panel-select')?.value || '600x337.5';
  dvlState.m3.panelKey = sel;
  var customBox = document.getElementById('m3-custom-panel-box');
  if (sel === 'custom') {
    if (customBox) customBox.classList.remove('d-none');
    dvlState.m3.cabW = parseFloat(document.getElementById('m3-custom-w')?.value) || 600;
    dvlState.m3.cabH = parseFloat(document.getElementById('m3-custom-h')?.value) || 337.5;
  } else {
    if (customBox) customBox.classList.add('d-none');
    if (GLOBAL_PANELS[sel]) {
      dvlState.m3.cabW = GLOBAL_PANELS[sel].w;
      dvlState.m3.cabH = GLOBAL_PANELS[sel].h;
    }
  }
  var lblW = document.getElementById('m3-lbl-each-w');
  var lblH = document.getElementById('m3-lbl-each-h');
  if (lblW) lblW.textContent = '× ' + dvlState.m3.cabW + ' mm';
  if (lblH) lblH.textContent = '× ' + dvlState.m3.cabH + ' mm';
  calculateMode3();
}

function adjustM3Multiplier(type, delta) {
  if (type === 'cols') {
    var c = parseInt(document.getElementById('m3-input-cols')?.value) || 5;
    c = Math.max(1, Math.min(50, c + delta));
    var inp = document.getElementById('m3-input-cols');
    if (inp) inp.value = c;
  } else {
    var r = parseInt(document.getElementById('m3-input-rows')?.value) || 4;
    r = Math.max(1, Math.min(40, r + delta));
    var inpR = document.getElementById('m3-input-rows');
    if (inpR) inpR.value = r;
  }
  calculateMode3();
}

function setM3Cols(c) {
  var inp = document.getElementById('m3-input-cols');
  if (inp) inp.value = c;
  calculateMode3();
}

function setM3Rows(r) {
  var inp = document.getElementById('m3-input-rows');
  if (inp) inp.value = r;
  calculateMode3();
}

function snapM3Aspect(aspect) {
  var cabW = dvlState.m3.cabW;
  var cabH = dvlState.m3.cabH;
  var cabRatio = cabW / cabH;
  var targetRatio = 16 / 9;
  if (aspect === '21:9') targetRatio = 21 / 9;
  if (aspect === '32:9') targetRatio = 32 / 9;

  var baseRows = 4;
  var neededCols = Math.max(1, Math.round(baseRows * targetRatio / cabRatio));
  setM3Cols(neededCols);
  setM3Rows(baseRows);
}

function setM3Pitch(p) {
  dvlState.m3.selectedPitch = p;
  var inp = document.getElementById('m3-input-pitch');
  if (inp) inp.value = p;
  var disp = document.getElementById('m3-selected-pitch-disp');
  if (disp) disp.textContent = 'P ' + p.toFixed(2) + ' mm';
  document.querySelectorAll('.m3-pitch-btn').forEach(btn => {
    var bp = parseFloat(btn.getAttribute('data-pitch'));
    if (Math.abs(bp - p) < 0.01) {
      btn.className = "m3-pitch-btn btn btn-sm btn-warning active py-0 px-2 text-xs font-mono fw-bold text-dark";
    } else {
      btn.className = "m3-pitch-btn btn btn-sm btn-outline-secondary py-0 px-2 text-xs font-mono";
    }
  });
  calculateMode3();
}

function onM3ManualPitchInput() {
  var val = parseFloat(document.getElementById('m3-input-pitch')?.value) || 1.56;
  dvlState.m3.selectedPitch = val;
  var disp = document.getElementById('m3-selected-pitch-disp');
  if (disp) disp.textContent = 'P ' + val.toFixed(2) + ' mm';
  calculateMode3();
}

function onM3ViewerSliderChange() {
  var v = parseFloat(document.getElementById('m3-viewer-slider')?.value) || 2.5;
  dvlState.m3.viewerDistM = v;
  var disp = document.getElementById('m3-viewer-dist-text');
  if (disp) disp.textContent = v.toFixed(1) + ' m (' + (v * 3.28084).toFixed(1) + ' ft)';
  calculateMode3();
}

function calculateMode3() {
  if (dvlState.m3.panelKey === 'custom') {
    dvlState.m3.cabW = parseFloat(document.getElementById('m3-custom-w')?.value) || 600;
    dvlState.m3.cabH = parseFloat(document.getElementById('m3-custom-h')?.value) || 337.5;
  }
  var cabW = dvlState.m3.cabW;
  var cabH = dvlState.m3.cabH;
  var cols = parseInt(document.getElementById('m3-input-cols')?.value) || 5;
  var rows = parseInt(document.getElementById('m3-input-rows')?.value) || 4;
  dvlState.m3.cols = cols;
  dvlState.m3.rows = rows;

  var totalPanels = cols * rows;
  var totalWidthMm = cols * cabW;
  var totalHeightMm = rows * cabH;
  var totalWidthM = totalWidthMm / 1000.0;
  var totalHeightM = totalHeightMm / 1000.0;
  var totalWidthFt = totalWidthMm * MM_TO_FT;
  var totalHeightFt = totalHeightMm * MM_TO_FT;

  var diagMm = Math.sqrt(totalWidthMm * totalWidthMm + totalHeightMm * totalHeightMm);
  var diagInches = diagMm / 25.4;
  var diagM = diagMm / 1000.0;

  var aspectVal = (totalWidthMm / totalHeightMm).toFixed(2);
  var areaSqM = totalWidthM * totalHeightM;
  var areaSqFt = areaSqM * 10.7639;

  // Sync Target Input Fields if not currently focused
  var inpTargetW = document.getElementById('m3-target-w-mm');
  var inpTargetH = document.getElementById('m3-target-h-mm');
  if (inpTargetW && document.activeElement !== inpTargetW) {
    inpTargetW.value = Math.round(totalWidthMm);
    var noteW = document.getElementById('m3-target-w-ft-note');
    if (noteW) noteW.textContent = '≈ ' + totalWidthFt.toFixed(2) + ' ft / ' + totalWidthM.toFixed(2) + ' m';
  }
  if (inpTargetH && document.activeElement !== inpTargetH) {
    inpTargetH.value = Math.round(totalHeightMm);
    var noteH = document.getElementById('m3-target-h-ft-note');
    if (noteH) noteH.textContent = '≈ ' + totalHeightFt.toFixed(2) + ' ft / ' + totalHeightM.toFixed(2) + ' m';
  }

  // Update dynamic display labels inside inputs card
  var dispW = document.getElementById('m3-wall-w-display');
  if (dispW) dispW.textContent = `${Math.round(totalWidthMm)} mm (${totalWidthM.toFixed(2)} m / ${totalWidthFt.toFixed(2)} ft)`;
  var dispH = document.getElementById('m3-wall-h-display');
  if (dispH) dispH.textContent = `${Math.round(totalHeightMm)} mm (${totalHeightM.toFixed(2)} m / ${totalHeightFt.toFixed(2)} ft)`;
  var badgeCnt = document.getElementById('m3-panel-counter-badge');
  if (badgeCnt) badgeCnt.textContent = `${totalPanels} Panels (${cols} × ${rows})`;

  // ACHIEVABLE PIXEL PITCH CALCULATIONS:
  var pitchForFHD = (totalWidthMm / 1920).toFixed(2);
  var pitchFor4K = (totalWidthMm / 3840).toFixed(2);
  var pitchFor720p = (totalWidthMm / 1280).toFixed(2);
  var maxAcuityPitch = (dvlState.m3.viewerDistM / 1.5).toFixed(2);

  // Selected Pitch Calculations:
  var p = dvlState.m3.selectedPitch || 1.5625;
  var cabPixX = Math.round(cabW / p);
  var cabPixY = Math.round(cabH / p);
  var actualPixelsW = cols * cabPixX;
  var actualPixelsH = rows * cabPixY;
  var totalPixels = actualPixelsW * actualPixelsH;

  var typicalPowerW = Math.round(areaSqM * 250);
  var maxPowerW = Math.round(areaSqM * 750);
  var heatBtuHr = Math.round(typicalPowerW * 3.412);
  var structuralWeightKg = Math.round(areaSqM * 32);
  var gigaPortsNeeded = Math.ceil(totalPixels / 650000);
  var minAcuityDist = (p * 1.0).toFixed(1);
  var optAcuityDist = (p * 1.5).toFixed(1);

  // FIRST PERSON & LAST PERSON VIEWING DISTANCE STANDARDS:
  var firstPersonAcuity = (p * 3.44).toFixed(1); // AVIXA 20/20 Acuity Threshold
  var firstPersonMin = Math.max(1.0, p * 1.0).toFixed(1); // Physical viewer boundary
  var lastPerson6H = (totalHeightM * 6.0).toFixed(1); // AVIXA DISCAS Meeting 6H Standard
  var lastPerson8H = (totalHeightM * 8.0).toFixed(1); // AVIXA DISCAS BDM 8H Standard
  var lastPerson4H = (totalHeightM * 4.0).toFixed(1); // AVIXA DISCAS ADM 4H Standard

  // Render badges in Mode 3
  renderMode3Badges({
    diagIn: diagInches, diagM: diagM,
    wMm: totalWidthMm, hMm: totalHeightMm,
    cols: cols, rows: rows, totalPanels: totalPanels,
    pitchForFHD: pitchForFHD, pitchFor4K: pitchFor4K,
    selectedPitch: p, actualPixelsW: actualPixelsW, actualPixelsH: actualPixelsH,
    minAcuityDist: minAcuityDist, optAcuityDist: optAcuityDist,
    firstPersonAcuity: firstPersonAcuity, firstPersonMin: firstPersonMin,
    lastPerson6H: lastPerson6H, lastPerson8H: lastPerson8H, lastPerson4H: lastPerson4H
  });

  // Draw 2D SVG Elevation Grid
  drawArraySVG(cols, rows, totalWidthMm, totalHeightMm, cabW, cabH, '#f59e0b');

  // Render Elaborative Engineering Details
  renderMode3ElaborativeDetails({
    cols: cols, rows: rows, totalPanels: totalPanels, cabW: cabW, cabH: cabH,
    wMm: totalWidthMm, hMm: totalHeightMm, wM: totalWidthM, hM: totalHeightM,
    wFt: totalWidthFt, hFt: totalHeightFt, diagIn: diagInches, diagM: diagM,
    aspectVal: aspectVal, areaSqM: areaSqM, areaSqFt: areaSqFt,
    pitchForFHD: pitchForFHD, pitchFor4K: pitchFor4K, pitchFor720p: pitchFor720p,
    maxAcuityPitch: maxAcuityPitch, viewerDistM: dvlState.m3.viewerDistM,
    selectedPitch: p, actualPixelsW: actualPixelsW, actualPixelsH: actualPixelsH,
    cabPixX: cabPixX, cabPixY: cabPixY, totalPixels: totalPixels,
    typicalPowerW: typicalPowerW, maxPowerW: maxPowerW, heatBtuHr: heatBtuHr,
    structuralWeightKg: structuralWeightKg, gigaPortsNeeded: gigaPortsNeeded,
    minAcuityDist: minAcuityDist, optAcuityDist: optAcuityDist,
    firstPersonAcuity: firstPersonAcuity, firstPersonMin: firstPersonMin,
    lastPerson6H: lastPerson6H, lastPerson8H: lastPerson8H, lastPerson4H: lastPerson4H
  });
}

function renderMode3Badges(d) {
  var c = document.getElementById('badges-container');
  if (!c) return;
  c.innerHTML = `
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">ARRAY MULTIPLIER</span>
        <div class="fs-4 font-mono fw-extrabold my-1" style="color: #facc15 !important;">${d.cols} &times; ${d.rows}</div>
        <div class="small font-mono text-warning">${d.totalPanels} Total Panels</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">TOTAL WALL SIZE</span>
        <div class="fs-6 font-mono fw-bold my-1" style="color: #f8fafc !important;">${Math.round(d.wMm)} &times; ${Math.round(d.hMm)} mm</div>
        <div class="small font-mono text-info">${d.diagIn.toFixed(1)}" (${d.diagM.toFixed(2)}m)</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">1080p / 4K PITCH</span>
        <div class="fs-5 font-mono fw-bold my-1" style="color: #4ade80 !important;">P ${d.pitchForFHD} / P ${d.pitchFor4K}</div>
        <div class="small font-mono text-success">FHD / 4K Achievable</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="p-3 rounded text-center h-100" style="background-color: #0f172a !important; color: #f8fafc !important; border: 1px solid #334155 !important;">
        <span class="small fw-bold" style="color: #94a3b8 !important;">1ST / LAST PERSON DIST</span>
        <div class="fs-6 font-mono fw-bold my-1" style="color: #38bdf8 !important;">${d.firstPersonAcuity}m &bull; ${d.lastPerson6H}m</div>
        <div class="small font-mono text-slate-300">1st: Acuity | Last: 6H DISCAS</div>
      </div>
    </div>`;
}

function renderMode3ElaborativeDetails(d) {
  var box = document.getElementById('details-container');
  if (!box) return;

  box.innerHTML = `
    <div class="d-flex justify-content-between align-items-center pb-2 border-bottom border-secondary mb-3 flex-wrap gap-2">
      <div>
        <span class="badge bg-warning text-dark me-2 font-mono fw-bold">Mode 3: Panel Multipliers</span>
        <strong style="color: #f8fafc !important;" class="fs-6">${d.cols} Across &times; ${d.rows} High = ${d.totalPanels} Global Panels</strong>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-info font-mono">${d.wM.toFixed(2)}m W &times; ${d.hM.toFixed(2)}m H</span>
        <span class="badge bg-secondary font-mono">${d.actualPixelsW} &times; ${d.actualPixelsH} px</span>
      </div>
    </div>

    <div class="row g-3">
      <!-- 1. Geometric Dimensions & Panel Matrix -->
      <div class="col-lg-6 col-12">
        <div class="p-3 rounded border h-100" style="background-color: #0f172a !important; border-color: #334155 !important; color: #f8fafc !important;">
          <div class="fw-bold font-mono mb-2" style="color: #facc15 !important;">
            <i class="fa-solid fa-ruler-combined me-1"></i>1. Total Physical Dimensions via Panel Multiplication
          </div>
          <div class="font-mono small space-y-1" style="color: #e2e8f0 !important;">
            <div>&bull; Wall Total Width: ${d.cols} panels &times; ${d.cabW} mm = <strong class="text-white">${Math.round(d.wMm)} mm (${d.wM.toFixed(2)} m / ${d.wFt.toFixed(2)} ft)</strong></div>
            <div>&bull; Wall Total Height: ${d.rows} panels &times; ${d.cabH} mm = <strong class="text-white">${Math.round(d.hMm)} mm (${d.hM.toFixed(2)} m / ${d.hFt.toFixed(2)} ft)</strong></div>
            <div>&bull; Wall Total Diagonal: <strong class="text-warning">${d.diagIn.toFixed(1)}" Diagonal (${d.diagM.toFixed(2)} m)</strong></div>
            <div>&bull; Total Screen Area: <strong class="text-info">${d.areaSqM.toFixed(2)} m² (${d.areaSqFt.toFixed(1)} sq ft)</strong> | Aspect Ratio: <strong class="text-success">${d.aspectVal}:1</strong></div>
            <div>&bull; Total LED Panels: <strong class="text-warning">${d.totalPanels} Units</strong> (${d.cols} Columns &times; ${d.rows} Rows)</div>
          </div>
        </div>
      </div>

      <!-- 2. Standards of Calculation: First Person & Last Person Distance -->
      <div class="col-lg-6 col-12">
        <div class="p-3 rounded border h-100" style="background-color: #0f172a !important; border-color: #334155 !important; color: #f8fafc !important;">
          <div class="fw-bold font-mono mb-2" style="color: #38bdf8 !important;">
            <i class="fa-solid fa-users-viewfinder me-1"></i>2. First Person &amp; Last Person Viewing Distances (Standards of Calculation)
          </div>
          <div class="row g-2 font-mono small">
            <div class="col-sm-6 col-12">
              <div class="p-2 rounded border h-100" style="background-color: #1e293b !important; border-color: #334155 !important;">
                <div class="text-success fw-bold mb-1"><i class="fa-solid fa-user me-1"></i>FIRST PERSON DISTANCE</div>
                <div>&bull; <strong>AVIXA 20/20 Acuity:</strong> <span class="text-warning fw-bold">${d.firstPersonAcuity} m</span> (${(d.firstPersonAcuity*3.28084).toFixed(1)} ft)</div>
                <div class="text-slate-400 text-xs">Human eye threshold (P ${d.selectedPitch}mm &times; 3.44)</div>
                <div class="mt-1">&bull; <strong>Comfort Limit (1.0xW):</strong> <span class="text-white">${d.firstPersonMin} m</span></div>
              </div>
            </div>
            <div class="col-sm-6 col-12">
              <div class="p-2 rounded border h-100" style="background-color: #1e293b !important; border-color: #334155 !important;">
                <div class="text-info fw-bold mb-1"><i class="fa-solid fa-users me-1"></i>LAST PERSON DISTANCE</div>
                <div>&bull; <strong>AVIXA DISCAS (6H):</strong> <span class="text-success fw-bold">${d.lastPerson6H} m</span> (${(d.lastPerson6H*3.28084).toFixed(1)} ft)</div>
                <div class="text-slate-400 text-xs">Industry standard 6 &times; Image Height</div>
                <div class="mt-1">&bull; <strong>Basic Decision (8H):</strong> <span class="text-info">${d.lastPerson8H} m</span></div>
                <div>&bull; <strong>Analytical (4H):</strong> <span class="text-white">${d.lastPerson4H} m</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Achievable Pixel Pitch Analysis -->
      <div class="col-lg-6 col-12">
        <div class="p-3 rounded border h-100" style="background-color: #0f172a !important; border-color: #334155 !important; color: #f8fafc !important;">
          <div class="fw-bold font-mono mb-2" style="color: #4ade80 !important;">
            <i class="fa-solid fa-microchip me-1"></i>3. Achievable &amp; Available Pixel Pitch Results
          </div>
          <div class="font-mono small space-y-1" style="color: #e2e8f0 !important;">
            <div>&bull; <strong>Full HD 1080p (1920&times;1080) Target:</strong> Achievable with <strong class="text-success">P ${d.pitchForFHD} mm</strong> pitch (Nearest standard: P 1.25 / P 1.56 mm)</div>
            <div>&bull; <strong>4K UHD (3840&times;2160) Target:</strong> Achievable with <strong class="text-info">P ${d.pitchFor4K} mm</strong> pitch (Nearest standard: P 0.93 / P 1.25 mm)</div>
            <div>&bull; <strong>720p HD (1280&times;720) Target:</strong> Achievable with <strong class="text-white">P ${d.pitchFor720p} mm</strong> pitch (Nearest standard: P 1.87 / P 2.50 mm)</div>
            <div>&bull; <strong>Visual Acuity Limit (@ ${d.viewerDistM.toFixed(1)}m):</strong> Recommended <strong class="text-warning">&le; P ${d.maxAcuityPitch} mm</strong> to prevent pixelation</div>
          </div>
        </div>
      </div>

      <!-- 4. Evaluated Pixel Configuration & Controller Engineering -->
      <div class="col-lg-6 col-12">
        <div class="p-3 rounded border h-100" style="background-color: #0f172a !important; border-color: #334155 !important; color: #f8fafc !important;">
          <div class="fw-bold font-mono mb-2" style="color: #38bdf8 !important;">
            <i class="fa-solid fa-network-wired me-1"></i>4. Active Pixel Canvas &amp; Engineering Load (@ P ${d.selectedPitch} mm)
          </div>
          <div class="font-mono small space-y-1" style="color: #e2e8f0 !important;">
            <div>&bull; Cabinet Pixel Res: (${d.cabW} / ${d.selectedPitch}) &times; (${d.cabH} / ${d.selectedPitch}) = <strong>${d.cabPixX} &times; ${d.cabPixY} px</strong></div>
            <div>&bull; Array Canvas Res: <strong class="text-success">${d.actualPixelsW} &times; ${d.actualPixelsH} px</strong> (${(d.totalPixels/1000000).toFixed(2)} MP / ${d.totalPixels.toLocaleString()} LEDs)</div>
            <div>&bull; Acuity Viewing Distance: <strong class="text-warning">${d.minAcuityDist} m - ${d.optAcuityDist} m</strong> (${(d.minAcuityDist*3.28).toFixed(1)} - ${(d.optAcuityDist*3.28).toFixed(1)} ft)</div>
            <div>&bull; Controller Ethernet Ports: <strong class="text-white">${d.gigaPortsNeeded} Gigabit RJ45 Ports</strong></div>
            <div>&bull; Typical Power Consumption: <strong class="text-warning">${d.typicalPowerW.toLocaleString()} W</strong> | Max Peak: <strong class="text-danger">${d.maxPowerW.toLocaleString()} W</strong></div>
            <div>&bull; Thermal Heat Load: <strong class="text-warning">${d.heatBtuHr.toLocaleString()} BTU/hr</strong> (${(d.heatBtuHr / 12000).toFixed(2)} Tons HVAC)</div>
            <div>&bull; Structural Wall Weight: <strong class="text-white">${d.structuralWeightKg} kg (${Math.round(d.structuralWeightKg * 2.20462)} lbs)</strong></div>
          </div>
        </div>
      </div>
    </div>`;
}

// ==========================================
// COMPREHENSIVE LED PACKAGING TECHNOLOGY GUIDE (DIP, SMD, IMD, GOB, COB, MIP, MicroLED)
// & OUTDOOR VS INDOOR LED ENGINEERING SOLVER
// ==========================================
var currentSelectedLedTechId = 'cob';

var LED_PACKAGING_TECH_DATA = {
  dip: {
    id: 'dip',
    name: 'DIP (Dual In-Line Package)',
    synonyms: 'Through-Hole LED, Lamp-type LED, 1R1G1B Discrete Lamp, Round-Head Through-Hole',
    pitchRange: 'P10.0 mm to P25.0 mm+',
    architecture: 'Three discrete Red, Green, and Blue epoxy-domed lamps with dual solder pins inserted through through-holes in the PCB and wave-soldered. Front face potted with silicone compound.',
    applications: 'Large-scale Outdoor Highway Billboards, Stadium Scoreboards & Giant Perimeter Walls, Building Architecture Façades, Long-distance Outdoor Displays (>15m to 200m viewing).',
    brightness: '6,000 – 12,000+ nits (High Sunlight Immunity)',
    ipRating: 'IP65 – IP68 Front, IP54 Rear',
    contrast: '1,000:1 – 3,000:1',
    impactResistance: 'High (Thick epoxy domes & silicone potting)',
    advantages: [
      'Extreme luminance (up to 12,000 nits) readable under blazing direct tropical sunlight.',
      'Robust thermal endurance with through-hole metal lead heat conduction.',
      'Exceptional weatherproofing (thick front potting resists rain, snow, UV yellowing, and salt spray).',
      'Low manufacturing cost per square meter for giant scale arrays.'
    ],
    disadvantages: [
      'Coarse pixel pitch (>P10mm) unsuitable for close viewing distances.',
      'Narrow vertical viewing angle (typically 60° vertical vs 120° horizontal).',
      'Heavy mechanical footprint requiring reinforced steel structural masts.'
    ]
  },
  smd: {
    id: 'smd',
    name: 'SMD (Surface Mount Device)',
    synonyms: '3-in-1 SMD, Chip LED, Surface Mount Package (SMD 1010, 1515, 2121, 3535)',
    pitchRange: 'P1.5 mm to P10.0 mm (Commercial Mainstream Standard)',
    architecture: 'R, G, and B bare dies housed inside a single plastic leaded cup (PLCC) with epoxy encapsulant, soldered directly onto PCB solder pads using high-speed surface-mount technology (SMT).',
    applications: 'Indoor Corporate Boardrooms, Retail Stores, Staging & Concert Touring Video Walls, Sports Arenas, Airport Information Flight Displays.',
    brightness: 'Indoor: 600 – 1,200 nits | Outdoor SMD: 4,000 – 6,500 nits',
    ipRating: 'Indoor: IP30/IP40 | Outdoor: IP65 (with conformal coating & louver hoods)',
    contrast: '3,000:1 – 8,000:1 (with black face mask)',
    impactResistance: 'Moderate to Low (Exposed soldering pins vulnerable to mechanical shearing)',
    advantages: [
      'Wide viewing angle: 140° to 160° horizontal and vertical with zero color shift.',
      'Mature mass-production ecosystem with high automation and lowest cost per pixel.',
      'Module-level repairability: Single dead SMD beads can be reworked with hot air soldering.',
      'Consistent color mixing at near distances due to 3-in-1 single-cup integration.'
    ],
    disadvantages: [
      'Vulnerable to physical collision (LED beads easily knocked off during handling and transport).',
      'Exposed pins susceptible to moisture ingress (caterpillar effect / short circuits) in high humidity.',
      'Contrast limited by reflective white cup walls unless expensive full-black body SMDs are specified.'
    ]
  },
  imd: {
    id: 'imd',
    name: 'IMD (Integrated Matrix Device / "N-in-1")',
    synonyms: '4-in-1 SMD, "Mini-in-1", Matrix Package (2×2 Pixel Cluster)',
    pitchRange: 'P0.7 mm to P1.5 mm (Sub-1mm Transition Bridge)',
    architecture: 'Integrates 4 independent RGB pixel nodes (12 micro-dies) into a single 2×2 physical surface-mount package. The package has enlarged soldering pads compared to individual micro-SMD.',
    applications: 'High-end Corporate Presentation Suites, Broadcast Newsrooms, Command & Control Rooms, Premium Boardrooms.',
    brightness: '600 – 1,200 nits',
    ipRating: 'IP40 / IP43',
    contrast: '5,000:1 – 10,000:1',
    impactResistance: 'High (4× pad bond strength > 15N shear force)',
    advantages: [
      'Solves the mechanical fragility of sub-1mm SMD by providing 4× larger soldering pad contact area.',
      'Anti-collision shear strength is over 5× higher than standard 0606 or 0808 SMD.',
      'Compatible with existing high-speed SMT pick-and-place lines without new capital expenditure.',
      'Lower SMT placement defect rate and superior surface flatness.'
    ],
    disadvantages: [
      'If 1 sub-pixel fails, replacing the entire 4-in-1 package is required.',
      'Batch-to-batch optical binning must be tightly controlled to prevent chromatic checkerboard patterns.'
    ]
  },
  gob: {
    id: 'gob',
    name: 'GOB (Glue On Board)',
    synonyms: 'Optically Encapsulated Surface, Shielded SMD, Polymer Coated LED Wall',
    pitchRange: 'P1.2 mm to P3.9 mm',
    architecture: 'Standard SMD or IMD modules populated on PCB, then coated across the entire front display surface with an optically transparent epoxy resin / nano-glue shield cured under vacuum.',
    applications: 'Rental & Staging Touring Walls (High Transit), Interactive Touch Video Walls, Sports Arena Perimeter Dashers, Museums, Shopping Malls, TV Studios with Camera Cranes.',
    brightness: '800 – 2,500 nits',
    ipRating: 'IP54 to IP65 Front (Moisture, Dust, & Splash Proof)',
    contrast: '5,000:1 – 12,000:1 (Matte anti-reflective finish)',
    impactResistance: 'Ultra-High (>30N shear force, Anti-collision, Anti-drop)',
    advantages: [
      '100% Anti-collision, anti-knock, and anti-drop protection during aggressive rental touring.',
      'Waterproof, moisture-proof, dustproof, anti-corrosive, and anti-static (ESD > 8kV).',
      'Direct interactive touch capability without risk of knocking off LED beads.',
      'Smooth wipeable/washable surface for easy maintenance and sterilization.'
    ],
    disadvantages: [
      'Increased thermal resistance due to resin barrier, requiring efficient rear heatsinking.',
      'Glossy reflections if surface matte anti-glare etching is not applied.',
      'Field repair requires specialized chemical solvents to de-pot localized resin.'
    ]
  },
  cob: {
    id: 'cob',
    name: 'COB (Chip On Board)',
    synonyms: 'Direct Die Attach, Flip-Chip COB, Integrated Silicon Packaging',
    pitchRange: 'P0.4 mm to P1.5 mm (Fine-Pitch Champion)',
    architecture: 'Bare un-packaged LED micro-chips (flip-chip architecture with no wire bonds) are bonded directly to the PCB conductive circuit board, then sealed monolithically with high-density optical silicone resin.',
    applications: 'Critical Mission Control Rooms (NOC / SOC / EOC), Military War Rooms, Broadcast Virtual Production (XR / In-Camera VFX), Executive C-Suite Boardrooms, Medical Imaging Theatres.',
    brightness: '800 – 2,000 nits',
    ipRating: 'IP65 Front (Fully Hermetic Seal)',
    contrast: '20,000:1 – 50,000:1 (Ultra-deep black level)',
    impactResistance: 'Extreme (>50N shear force, Monolithic Glass-like Surface)',
    advantages: [
      'Ultra-deep black background and exceptional contrast (up to 50,000:1) with zero reflective lead cups.',
      'Flip-chip eliminates wire-bonding failures, yielding MTBF > 100,000 hours with near-zero pixel defect rates.',
      'Superior thermal dissipation: Heat flows directly into the PCB substrate without packaging thermal resistance.',
      'Eliminates camera moiré interference in broadcast virtual production.',
      'Surface is fully anti-static, anti-scratch, waterproof, and easy to clean.'
    ],
    disadvantages: [
      'Higher initial unit capital cost per m² compared to standard SMD.',
      'Module repair requires factory micro-welding workstations; cannot be easily soldered in the field.'
    ]
  },
  mip: {
    id: 'mip',
    name: 'MIP (MicroLED in Package)',
    synonyms: 'Micro-in-Package, Discrete MicroLED Package, 0404 / 0202 Discrete MicroLED',
    pitchRange: 'P0.6 mm to P1.5 mm',
    architecture: 'Microscopic MicroLED dies (<30μm) are pre-packaged into miniature discrete surface packages (e.g. 0.4×0.4mm or 0.2×0.2mm), tested, 100% binned, and then surface-mounted to PCBs via conventional SMT lines.',
    applications: 'Fine-Pitch Commercial Corporate Walls, Broadcast Monitor Walls, High-End Retail Flagships, Commercial Digital Cinema Screens.',
    brightness: '1,000 – 3,000 nits',
    ipRating: 'IP54 Front',
    contrast: '15,000:1 – 30,000:1',
    impactResistance: 'High',
    advantages: [
      '100% Optical Pre-Sorting: Chips are binned before PCB placement, completely eliminating brightness/chromatic mottling.',
      'Utilizes standard high-speed SMT assembly equipment, lowering barrier to sub-1mm production.',
      'Individual pixel repairability: Single MIP components can be reworked like standard SMDs.',
      'Lower production cost and higher yield than monolithic mega-transfer COB at fine pitches.'
    ],
    disadvantages: [
      'Discrete packaging adds slight overhead compared to pure raw monolithic MicroLED.',
      'Pitch limit currently constrained by minimum discrete package size (~P0.5mm minimum).'
    ]
  },
  microled: {
    id: 'microled',
    name: 'MicroLED (Monolithic Micro-Emitter)',
    synonyms: 'Sub-50μm Inorganic MicroLED, Active-Matrix MicroLED, The Wall / MAGNIT Monolithic Architecture',
    pitchRange: 'P0.2 mm to P0.8 mm (True Microscopic Resolution)',
    architecture: 'Microscopic inorganic gallium nitride (GaN) self-emissive dies (<30μm, 1/100th size of standard LEDs) transferred via multi-million mass-transfer techniques onto active TFT backplanes or micro-pixel substrates with black matrix ratio >98%.',
    applications: 'Luxury Residential Private Cinema, Flagship C-Suite Executive Boardrooms, Mission-Critical Defense Centers, High-End XR Virtual Production, Simulator Domes.',
    brightness: '2,000 – 4,000+ nits Peak (True HDR10+ / Dolby Vision)',
    ipRating: 'IP65 Front (Hermetic Seal & Anti-Glare Coating)',
    contrast: '1,000,000:1+ (True Infinite Black)',
    impactResistance: 'Ultra-High (Monolithic Anti-Reflective Optical Glass Surface)',
    advantages: [
      'Infinite contrast ratio (>1,000,000:1) with true zero-light black floor (black matrix area > 98%).',
      'Peak luminance exceeding 4,000 nits for unmatched high dynamic range (HDR) reproduction.',
      'Inorganic GaN dies do not degrade or burn-in (unlike OLED), delivering 100,000+ hour operational lifespan.',
      'Ultra-fast nanosecond response time (<1 microsecond) with zero motion blur or ghosting.',
      '100% DCI-P3 and BT.2020 wide color gamut coverage.'
    ],
    disadvantages: [
      'Highest capital cost per square meter across all display technologies.',
      'Mass-transfer manufacturing yield requires cutting-edge semiconductor cleanroom fabrication.'
    ]
  }
};

function selectLedPackagingTech(techId) {
  currentSelectedLedTechId = techId;
  document.querySelectorAll('.btn-led-tech').forEach(function(btn) {
    if (btn.getAttribute('data-tech') === techId) {
      btn.className = 'btn btn-sm btn-primary active fw-bold btn-led-tech';
    } else {
      btn.className = 'btn btn-sm btn-outline-secondary fw-bold btn-led-tech';
    }
  });

  var data = LED_PACKAGING_TECH_DATA[techId];
  if (!data) return;

  var card = document.getElementById('ledTechDetailContainer');
  if (card) {
    card.innerHTML = `
      <div class="p-3 bg-white rounded border shadow-sm">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 pb-2 border-bottom">
          <div>
            <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-microchip text-primary me-2"></i>${data.name}</h5>
            <div class="small text-muted font-mono"><strong>Industry Synonyms:</strong> ${data.synonyms}</div>
          </div>
          <span class="badge bg-primary font-mono px-3 py-1">Sweet Spot: ${data.pitchRange}</span>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <div class="p-2.5 rounded bg-light border h-100">
              <strong class="text-secondary small d-block mb-1"><i class="fa-solid fa-layer-group me-1 text-info"></i>PACKAGING ARCHITECTURE</strong>
              <div class="small text-dark">${data.architecture}</div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-2.5 rounded bg-light border h-100">
              <strong class="text-secondary small d-block mb-1"><i class="fa-solid fa-map-location-dot me-1 text-success"></i>WHERE IT IS USED (PRIMARY APPLICATIONS)</strong>
              <div class="small text-dark">${data.applications}</div>
            </div>
          </div>
        </div>

        <div class="row g-2 text-center mb-3">
          <div class="col-3">
            <div class="p-2 rounded bg-light border">
              <div class="text-muted" style="font-size:0.7rem;">TYPICAL BRIGHTNESS</div>
              <strong class="text-warning small font-mono">${data.brightness}</strong>
            </div>
          </div>
          <div class="col-3">
            <div class="p-2 rounded bg-light border">
              <div class="text-muted" style="font-size:0.7rem;">INGRESS PROTECTION</div>
              <strong class="text-success small font-mono">${data.ipRating}</strong>
            </div>
          </div>
          <div class="col-3">
            <div class="p-2 rounded bg-light border">
              <div class="text-muted" style="font-size:0.7rem;">CONTRAST RATIO</div>
              <strong class="text-primary small font-mono">${data.contrast}</strong>
            </div>
          </div>
          <div class="col-3">
            <div class="p-2 rounded bg-light border">
              <div class="text-muted" style="font-size:0.7rem;">IMPACT RESISTANCE</div>
              <strong class="text-danger small font-mono">${data.impactResistance}</strong>
            </div>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-md-6">
            <div class="p-2.5 rounded border border-success-subtle bg-success-subtle h-100">
              <strong class="text-success small d-block mb-1"><i class="fa-solid fa-circle-check me-1"></i>KEY ADVANTAGES &amp; BENEFITS</strong>
              <ul class="small mb-0 ps-3 text-dark space-y-1">
                ${data.advantages.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-2.5 rounded border border-danger-subtle bg-danger-subtle h-100">
              <strong class="text-danger small d-block mb-1"><i class="fa-solid fa-triangle-exclamation me-1"></i>ENGINEERING CONSIDERATIONS &amp; LIMITS</strong>
              <ul class="small mb-0 ps-3 text-dark space-y-1">
                ${data.disadvantages.map(d => `<li>${d}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
window.selectLedPackagingTech = selectLedPackagingTech;

function calculateOutdoorLedSpecs() {
  var pitch = parseFloat(document.getElementById('outLedPitchInput')?.value) || 6.0;
  var areaSqm = parseFloat(document.getElementById('outLedAreaInput')?.value) || 18.0;
  var targetNits = parseFloat(document.getElementById('outLedNitsInput')?.value) || 6500;
  var sunExposure = document.getElementById('outLedSunExposure')?.value || 'direct';

  var minViewM = pitch * 1.0;
  var optViewM = pitch * 2.5;

  var maxPowerPerSqm = Math.round(targetNits * 0.14 + 150);
  var typPowerPerSqm = Math.round(maxPowerPerSqm * 0.40);

  var totalMaxPowerKw = ((maxPowerPerSqm * areaSqm) / 1000).toFixed(1);
  var totalTypPowerKw = ((typPowerPerSqm * areaSqm) / 1000).toFixed(1);

  var solarGainWm2 = (sunExposure === 'direct') ? 950 : 250;
  var totalThermalWatts = (typPowerPerSqm + solarGainWm2) * areaSqm;
  var btuHr = Math.round(totalThermalWatts * 3.41214);
  var acTons = (btuHr / 12000).toFixed(1);

  var windPressureNPerSqm = 680;
  var totalWindLoadKn = ((windPressureNPerSqm * areaSqm) / 1000).toFixed(1);

  var elMin = document.getElementById('outResMinView');
  if (elMin) elMin.innerText = `${minViewM.toFixed(1)} m (${(minViewM*3.28).toFixed(1)} ft)`;

  var elOpt = document.getElementById('outResOptView');
  if (elOpt) elOpt.innerText = `${optViewM.toFixed(1)} m (${(optViewM*3.28).toFixed(1)} ft)`;

  var elPwr = document.getElementById('outResPower');
  if (elPwr) elPwr.innerText = `${totalTypPowerKw} kW Typ (${totalMaxPowerKw} kW Peak)`;

  var elTherm = document.getElementById('outResThermal');
  if (elTherm) elTherm.innerText = `${btuHr.toLocaleString()} BTU/h (${acTons} Tons AC)`;

  var elWind = document.getElementById('outResWind');
  if (elWind) elWind.innerText = `${totalWindLoadKn} kN (${Math.round(parseFloat(totalWindLoadKn) * 102)} kg-f)`;
}
window.calculateOutdoorLedSpecs = calculateOutdoorLedSpecs;
