/**
 * Pro AV All-in-One Video Bar Studio & Coverage Engine
 * Comprehensive Triad Calculations:
 * 1. Camera Coverage (HFOV, framing reach, D1 fit)
 * 2. Speaker Acoustic Throw (SPL @ 1m, inverse-square-law decay at furthest seat, dBA speech standard)
 * 3. Microphone Beamforming Capture (pickup radius, polar volume, expansion pods calculation)
 * 4. Placement Engine (Explicit Above vs Below Display decision, AFFL site conditions & tilt ergonomics)
 * 5. Animated Interactive SVG (Top Plan & Side Elevation with tight vertical bounds and zero empty padding)
 * 6. Target Room Selection for Spatial Matrix integration
 */

var videoBarTiers = {
  compact: {
    id: 'compact',
    name: 'Compact 4K ePTZ Bar',
    category: 'Huddle & Small Spaces (up to 4.5m / 5 seats)',
    camera: {
      sensor: '4K Ultra-HD 1/2.3" CMOS',
      hfovDeg: 120,
      vfovDeg: 80,
      zoom: '5x ePTZ (Digital)',
      maxFramingDepth: 4.5,
      autoFraming: 'Group Framing / ePTZ'
    },
    speaker: {
      powerWatts: 10,
      transducers: 'Dual 2" Full-Range Neodymium',
      maxSpl1m: 86,
      maxThrowM: 4.5,
      frequencyResp: '100 Hz – 20 kHz'
    },
    microphone: {
      elements: 6,
      type: 'MEMS Beamforming Array',
      pickupRadiusM: 4.5,
      polarAngleDeg: 180,
      features: 'AEC, De-reverberation & AI Noise Suppression',
      maxExpansionPods: 0
    },
    typicalPriceInr: 99000,
    typicalPriceUsd: 1200
  },
  mid: {
    id: 'mid',
    name: 'Mid-Size AI Video Bar',
    category: 'Medium Conference Rooms (up to 6.5m / 10 seats)',
    camera: {
      sensor: '4K UHD Sony Exmor Sensor',
      hfovDeg: 90,
      vfovDeg: 60,
      zoom: '3x Optical / 5x Digital PTZ',
      maxFramingDepth: 6.5,
      autoFraming: 'Active Speaker Tracking & Group Framing'
    },
    speaker: {
      powerWatts: 30,
      transducers: 'Dual 2.5" Woofers + Dual 1" Tweeters + Dual Passive Radiators',
      maxSpl1m: 90,
      maxThrowM: 6.5,
      frequencyResp: '75 Hz – 20 kHz'
    },
    microphone: {
      elements: 8,
      type: 'Multi-Beam Steerable Array',
      pickupRadiusM: 6.0,
      polarAngleDeg: 180,
      features: 'Adaptive Voice Tracking, Acoustic Fence & Full-Duplex AEC',
      maxExpansionPods: 2
    },
    typicalPriceInr: 198000,
    typicalPriceUsd: 2400
  },
  large: {
    id: 'large',
    name: 'Large Dual-Cam Video Bar',
    category: 'Large Conference & Boardrooms (up to 9.0m / 16 seats)',
    camera: {
      sensor: 'Dual 4K Camera System (120° Panoramic + 70° Telephoto)',
      hfovDeg: 120, // wide overview
      teleHfovDeg: 70,
      zoom: '10x–12x Hybrid Optical Zoom',
      maxFramingDepth: 9.0,
      autoFraming: 'DirectorAI Multi-Stream People Framing & Speaker Follow'
    },
    speaker: {
      powerWatts: 40,
      transducers: 'Dual Mid-Range + Dual Tweeters + Integrated 3.5" Subwoofer',
      maxSpl1m: 94,
      maxThrowM: 9.0,
      frequencyResp: '65 Hz – 20 kHz'
    },
    microphone: {
      elements: 8,
      type: 'High-Density Spatial Beamforming + Edge AI',
      pickupRadiusM: 8.0,
      polarAngleDeg: 180,
      features: 'Multi-Talker Spatial Audio, NoiseBlockAI, Daisy-chain Mic Pod Ports',
      maxExpansionPods: 3
    },
    typicalPriceInr: 315000,
    typicalPriceUsd: 3800
  },
  exec: {
    id: 'exec',
    name: 'Executive Dual-Screen Bar',
    category: 'Boardrooms & Executive Telepresence (up to 11.5m / 24 seats)',
    camera: {
      sensor: 'Triple 4K Optical Director Arrays',
      hfovDeg: 120,
      teleHfovDeg: 55,
      zoom: '15x–30x True Optical Zoom',
      maxFramingDepth: 11.5,
      autoFraming: 'Multi-Camera Cinematic Director with Presenter Following'
    },
    speaker: {
      powerWatts: 60,
      transducers: 'Soundbar Array with Dual 4" Subwoofers + Stereo Line Arrays',
      maxSpl1m: 98,
      maxThrowM: 11.5,
      frequencyResp: '50 Hz – 20 kHz'
    },
    microphone: {
      elements: 12,
      type: 'Linear Acoustic Tracking Line Array',
      pickupRadiusM: 10.0,
      polarAngleDeg: 180,
      features: 'Dante Audio DSP Integration, 360° Room Acoustic Cancellation',
      maxExpansionPods: 4
    },
    typicalPriceInr: 430000,
    typicalPriceUsd: 5200
  }
};

var currentBarSvgMode = 'elevation'; // default to side elevation per user focus
var explicitPlacementMode = 'auto'; // 'auto', 'below', 'above', 'center'

// Core Calculation Function
function calculateVideoBarStudio() {
  // Read inputs supporting both vb- and vbar- prefixes
  var getVal = function(id1, id2, def) {
    var el = document.getElementById(id1) || document.getElementById(id2);
    return el ? parseFloat(el.value) : def;
  };
  var getInt = function(id1, id2, def) {
    var el = document.getElementById(id1) || document.getElementById(id2);
    return el ? parseInt(el.value) : def;
  };
  var getStr = function(id1, id2, def) {
    var el = document.getElementById(id1) || document.getElementById(id2);
    return el ? el.value : def;
  };

  var L = getVal('vbRoomLength', 'vbarRoomLength', 7.0);
  var W = getVal('vbRoomWidth', 'vbarRoomWidth', 5.0);
  var H = getVal('vbRoomHeight', 'vbarRoomHeight', 2.8);
  var seats = getInt('vbRoomSeats', 'vbarRoomSeats', 10);
  var d1_m = getVal('vbDistD1', 'vbarD1Dist', 2.0);
  var span_m = getVal('vbSpanW', 'vbarSpanW', 3.2);
  var dispInches = getInt('vbDisplaySize', 'vbarDispSize', 85);
  var dispAffl_mm = getVal('vbDisplayAffl', 'vbarDispAffl', 950);
  var placementSel = getStr('vbPlacementSelect', 'vbarPlacementSel', explicitPlacementMode || 'auto');
  var tierSel = getStr('vbBarTierSelect', 'vbarTierSel', 'auto');

  var dLast = Math.max(1.0, L - 0.5); // furthest seated participant position

  // 1. AUTO RECOMMENDATION ENGINE
  var recommendedTierId = 'mid';
  var autoReason = '';

  if (seats <= 5 && L <= 4.5 && W <= 4.2) {
    recommendedTierId = 'compact';
    autoReason = 'Optimal for intimate huddle spaces (L ≤ 4.5m). Ultra-wide 120° HFOV captures all participants seated close to display.';
  } else if (seats <= 10 && L <= 6.5) {
    recommendedTierId = 'mid';
    autoReason = 'Recommended standard for medium conference rooms. 30W stereo audio and 6m beamforming mic cover 10 participants effortlessly.';
  } else if (seats <= 16 && L <= 9.0) {
    recommendedTierId = 'large';
    autoReason = 'Recommended for 12–16 person rooms. Dual-lens system (120° overview + 70° telephoto) and 40W audio ensure back-row clarity.';
  } else if (seats <= 24 && L <= 11.5) {
    recommendedTierId = 'exec';
    autoReason = 'High-end executive boardroom bar. Powerful 60W line-array sound and 15x optical zoom capture deep sightlines.';
  } else {
    recommendedTierId = 'large'; // fallback with warnings
    autoReason = 'Room length exceeds standard video bar limits (>11.5m). Discrete ceiling microphone tiles (e.g. Shure MXA920) and distributed speakers are advised.';
  }

  var activeTierId = (tierSel === 'auto') ? recommendedTierId : tierSel;
  var spec = videoBarTiers[activeTierId] || videoBarTiers.mid;

  // 2. CAMERA OPTICAL CALCULATIONS
  var reqHfovRad = 2 * Math.atan((span_m / 2.0) / d1_m);
  var reqHfovDeg = (reqHfovRad * 180.0) / Math.PI;
  var camHfovPass = (spec.camera.hfovDeg >= reqHfovDeg);
  var camReachPass = (spec.camera.maxFramingDepth >= dLast);

  // 3. SPEAKER ACOUSTIC THROW & SPL CALCULATIONS (AVIXA Standard)
  var splDirectAtFurthest = spec.speaker.maxSpl1m - (20 * Math.log10(Math.max(1.0, dLast)));
  var splRoomAtFurthest = spec.speaker.maxSpl1m - (10 * Math.log10(Math.max(1.0, dLast)));
  var spkThrowPass = (L <= spec.speaker.maxThrowM);
  var meetsAvixaSpeech = (splRoomAtFurthest >= 70.0); // 70 dBA speech standard

  // 4. MICROPHONE BEAMFORMING COVERAGE & EXPANSION PODS
  var tableLength = Math.max(1.5, L - d1_m - 0.8);
  var micPass = (tableLength <= spec.microphone.pickupRadiusM);
  var expansionPodsNeeded = 0;
  if (!micPass) {
    var uncoveredDist = tableLength - spec.microphone.pickupRadiusM;
    expansionPodsNeeded = Math.min(spec.microphone.maxExpansionPods, Math.ceil(uncoveredDist / 2.2));
  }

  // 5. EXPLICIT PLACEMENT ENGINE (Above vs Below Display Decision & Ergonomics)
  var seatedEyeHt_mm = 1200; // 1.2m AFFL seated eye level standard
  var dispHeight_mm = Math.round(dispInches * 12.45); // 16:9 screen height in mm
  var dispTopAffl_mm = dispAffl_mm + dispHeight_mm;

  // Algorithmic auto recommendation
  var autoRecommendedPlacement = 'below';
  var autoPlacementRationale = '';
  if (dispInches >= 85 || dispAffl_mm < 850) {
    autoRecommendedPlacement = 'below';
    autoPlacementRationale = `Mounting Below Display (${dispAffl_mm - 80}mm AFFL) keeps the camera closer to seated eye level (1200mm). Mounting above an 85" screen would put camera at ${dispTopAffl_mm + 60}mm, creating steep downward tilt.`;
  } else {
    autoRecommendedPlacement = 'below';
    autoPlacementRationale = `Mounting Below Display aligns camera closest to seated eye level (1200mm), preserving natural eye-to-eye contact during video calls.`;
  }

  // Active Placement decision: user explicit choice takes precedence
  var activePlacement = (placementSel === 'auto') ? autoRecommendedPlacement : placementSel;
  var barMountedHeight_mm = 0;
  var verticalTiltDeg = 0;
  var placementRationale = '';

  if (activePlacement === 'below') {
    barMountedHeight_mm = Math.max(500, dispAffl_mm - 90);
    var deltaY_up = seatedEyeHt_mm - barMountedHeight_mm;
    verticalTiltDeg = (Math.atan(deltaY_up / (d1_m * 1000.0)) * 180.0) / Math.PI; // Upward tilt angle (+)
    placementRationale = `Mounted BELOW Display at ${Math.round(barMountedHeight_mm)}mm AFFL. Upward tilt is ${Math.abs(verticalTiltDeg).toFixed(1)}° (${Math.abs(verticalTiltDeg) <= 15 ? 'AVIXA Pass ≤15° ✓' : 'Noticeable upward tilt ⚠️'}). Provides direct eye contact with seated participants. Verify at least 150mm clearance above table surface.`;
  } else if (activePlacement === 'above') {
    barMountedHeight_mm = dispTopAffl_mm + 70;
    var deltaY_down = barMountedHeight_mm - seatedEyeHt_mm;
    verticalTiltDeg = -(Math.atan(deltaY_down / (d1_m * 1000.0)) * 180.0) / Math.PI; // Downward tilt angle (-)
    placementRationale = `Mounted ABOVE Display at ${Math.round(barMountedHeight_mm)}mm AFFL. Downward tilt is ${Math.abs(verticalTiltDeg).toFixed(1)}° (${Math.abs(verticalTiltDeg) <= 15 ? 'AVIXA Pass ≤15° ✓' : 'Steep look-down angle ⚠️'}). Clears all table clutter, participant laptops, and standing presenters without obstruction.`;
  } else {
    barMountedHeight_mm = dispAffl_mm + (dispHeight_mm / 2.0);
    verticalTiltDeg = 0;
    placementRationale = `Mounted CENTRAL between dual screens at ${Math.round(barMountedHeight_mm)}mm AFFL. Optimal horizontal eye-level alignment for dual-screen telepresence setups.`;
  }

  // Ergonomic comfort check
  var tiltPass = Math.abs(verticalTiltDeg) <= 15.0;

  var state = {
    L: L, W: W, H: H, seats: seats, d1_m: d1_m, dLast: dLast,
    span_m: span_m, reqHfovDeg: reqHfovDeg,
    dispInches: dispInches, dispAffl_mm: dispAffl_mm, dispHeight_mm: dispHeight_mm, dispTopAffl_mm: dispTopAffl_mm,
    tierId: activeTierId, spec: spec,
    camHfovPass: camHfovPass, camReachPass: camReachPass,
    splDirectAtFurthest: splDirectAtFurthest, splRoomAtFurthest: splRoomAtFurthest,
    spkThrowPass: spkThrowPass, meetsAvixaSpeech: meetsAvixaSpeech,
    tableLength: tableLength, micPass: micPass, expansionPodsNeeded: expansionPodsNeeded,
    autoRecommendedPlacement: autoRecommendedPlacement, activePlacement: activePlacement,
    placementRationale: placementRationale, barMountedHeight_mm: barMountedHeight_mm,
    verticalTiltDeg: verticalTiltDeg, tiltPass: tiltPass, autoReason: autoReason
  };

  window.activeVideoBarState = state;
  renderVideoBarUI(state);
  renderVideoBarSvg(state);
  refreshVbTargetRoomsDropdown();
}

// User Action: Set Placement Mode (Buttons)
function setVideoBarPlacementMode(mode) {
  explicitPlacementMode = mode;
  var sel = document.getElementById('vbPlacementSelect');
  if (sel) sel.value = mode;

  ['auto', 'below', 'above', 'center'].forEach(function(m) {
    var btn = document.getElementById('btnPlacement_' + m);
    if (btn) {
      if (m === mode) {
        btn.classList.add('active', 'btn-teal', 'text-white');
        btn.classList.remove('btn-outline-secondary');
      } else {
        btn.classList.remove('active', 'btn-teal', 'text-white');
        btn.classList.add('btn-outline-secondary');
      }
    }
  });

  calculateVideoBarStudio();
}

// User Action: Set Display Bottom AFFL Site Condition Presets
function setVideoBarDisplayAfflPreset(afflMm) {
  var inp = document.getElementById('vbDisplayAffl');
  if (inp) inp.value = afflMm;
  var slider = document.getElementById('vbDisplayAfflSlider');
  if (slider) slider.value = afflMm;
  calculateVideoBarStudio();
}

// Render Results UI
function renderVideoBarUI(s) {
  // Recommendation Header Banner
  var elRecTitle = document.getElementById('vbarRecBarTitle');
  if (elRecTitle) elRecTitle.innerText = s.spec.name;
  var elRecCat = document.getElementById('vbarRecBarCat');
  if (elRecCat) elRecCat.innerText = s.spec.category;
  var elRecReason = document.getElementById('vbarRecReason');
  if (elRecReason) elRecReason.innerText = s.autoReason;

  // Sync Placement UI buttons state
  ['auto', 'below', 'above', 'center'].forEach(function(m) {
    var btn = document.getElementById('btnPlacement_' + m);
    if (btn) {
      var isAct = (m === s.activePlacement) || (s.activePlacement === s.autoRecommendedPlacement && m === 'auto');
      btn.classList.toggle('active', isAct);
    }
  });

  // Triad Cards
  // 1. Camera Coverage
  var elCamHfov = document.getElementById('vbarOutCamHfov');
  if (elCamHfov) elCamHfov.innerText = `${s.spec.camera.hfovDeg}° HFOV`;
  var elCamReqHfov = document.getElementById('vbarOutCamReqHfov');
  if (elCamReqHfov) elCamReqHfov.innerText = `Req: ${s.reqHfovDeg.toFixed(1)}° (${s.camHfovPass ? 'In-Bounds ✓' : 'Angle Narrow ⚠️'})`;
  var elCamReach = document.getElementById('vbarOutCamReach');
  if (elCamReach) elCamReach.innerText = `${s.spec.camera.maxFramingDepth}m Reach (${s.camReachPass ? 'Pass ✓' : 'Room Exceeds ⚠️'})`;
  var elCamZoom = document.getElementById('vbarOutCamZoom');
  if (elCamZoom) elCamZoom.innerText = s.spec.camera.zoom;

  // 2. Speaker Acoustic Throw
  var elSpkPower = document.getElementById('vbarOutSpkPower');
  if (elSpkPower) elSpkPower.innerText = `${s.spec.speaker.powerWatts}W (${s.spec.speaker.maxSpl1m} dB SPL @ 1m)`;
  var elSpkSplLast = document.getElementById('vbarOutSpkSplLast');
  if (elSpkSplLast) elSpkSplLast.innerText = `${s.splRoomAtFurthest.toFixed(1)} dBA at ${s.dLast.toFixed(1)}m`;
  var elSpkRating = document.getElementById('vbarOutSpkRating');
  if (elSpkRating) {
    elSpkRating.innerHTML = s.meetsAvixaSpeech
      ? `<span class="badge bg-success font-monospace">AVIXA Pass (≥ 70 dBA)</span>`
      : `<span class="badge bg-warning text-dark font-monospace">Soft Speech (< 70 dBA) • Add Ceiling Spk</span>`;
  }
  var elSpkThrow = document.getElementById('vbarOutSpkThrow');
  if (elSpkThrow) elSpkThrow.innerText = `Max Throw: ${s.spec.speaker.maxThrowM}m (Room: ${s.L.toFixed(1)}m)`;

  // 3. Microphone Beamforming Coverage
  var elMicRadius = document.getElementById('vbarOutMicRadius');
  if (elMicRadius) elMicRadius.innerText = `${s.spec.microphone.pickupRadiusM}m Radius (${s.spec.microphone.elements} MEMS Beams)`;
  var elMicTable = document.getElementById('vbarOutMicTable');
  if (elMicTable) elMicTable.innerText = `Table Length: ${s.tableLength.toFixed(1)}m`;
  var elMicPods = document.getElementById('vbarOutMicPods');
  if (elMicPods) {
    if (s.micPass) {
      elMicPods.innerHTML = `<span class="badge bg-success font-monospace">Native Bar Sufficient (0 Pods)</span>`;
    } else {
      elMicPods.innerHTML = `<span class="badge bg-danger font-monospace">+${s.expansionPodsNeeded} Table Extension Mic Pod${s.expansionPodsNeeded > 1 ? 's' : ''} Required</span>`;
    }
  }

  // 4. Placement Card
  var elPlaceBadge = document.getElementById('vbarOutPlacementBadge');
  if (elPlaceBadge) {
    if (s.activePlacement === 'below') {
      elPlaceBadge.innerText = '⬇️ MOUNTED BELOW DISPLAY';
      elPlaceBadge.className = 'badge bg-primary fs-7 px-2.5 py-1';
    } else if (s.activePlacement === 'above') {
      elPlaceBadge.innerText = '⬆️ MOUNTED ABOVE DISPLAY';
      elPlaceBadge.className = 'badge bg-indigo-600 fs-7 px-2.5 py-1';
    } else {
      elPlaceBadge.innerText = '↔️ CENTRAL DUAL-SCREEN';
      elPlaceBadge.className = 'badge bg-teal fs-7 px-2.5 py-1';
    }
  }
  var elPlaceHeight = document.getElementById('vbarOutMountHeight');
  if (elPlaceHeight) {
    elPlaceHeight.innerText = `${Math.round(s.barMountedHeight_mm)} mm AFFL (Tilt: ${s.verticalTiltDeg >= 0 ? '+' : ''}${s.verticalTiltDeg.toFixed(1)}°)`;
  }
  var elPlaceRationale = document.getElementById('vbarOutPlacementRationale');
  if (elPlaceRationale) elPlaceRationale.innerText = s.placementRationale;
}

// Toggle between Plan View & Side Elevation
function setVideoBarSvgMode(mode) {
  currentBarSvgMode = mode;
  var btnPlan = document.getElementById('btnVbarSvgPlan');
  var btnElev = document.getElementById('btnVbarSvgElev');
  if (btnPlan && btnElev) {
    btnPlan.classList.toggle('active', mode === 'plan');
    btnElev.classList.toggle('active', mode === 'elevation');
  }
  if (window.activeVideoBarState) {
    renderVideoBarSvg(window.activeVideoBarState);
  }
}

// Interactive SVG Visualizer Renderer
function renderVideoBarSvg(s) {
  var container = document.getElementById('vbarSvgCanvasContainer');
  if (!container) return;

  if (currentBarSvgMode === 'plan') {
    renderVideoBarTopPlanSvg(container, s);
  } else {
    renderVideoBarSideElevationSvg(container, s);
  }
}

// 1. TOP PLAN VIEW (HFOV Frustum, Speaker Waves, Mic Pickup Lobes)
function renderVideoBarTopPlanSvg(container, s) {
  var w = 880;
  var h = 330; // Tightly bound height to eliminate vertical empty bands

  var roomScale = Math.min(540 / s.L, 250 / s.W);
  var svgRoomL = s.L * roomScale;
  var svgRoomW = s.W * roomScale;

  var roomLeft = 140;
  var roomTop = (h / 2.0) - (svgRoomW / 2.0);
  var roomRight = roomLeft + svgRoomL;
  var roomBottom = roomTop + svgRoomW;
  var centerY = h / 2.0;

  // Front Wall Display & Video Bar
  var barX = roomLeft + 4;
  var barSvgW = 12;
  var barSvgH = Math.min(70, Math.max(30, svgRoomW * 0.22));
  var barTopY = centerY - (barSvgH / 2.0);

  // Table
  var tableDistFromWall = s.d1_m * roomScale;
  var tableLeft = roomLeft + tableDistFromWall;
  var tableL = Math.max(70, s.tableLength * roomScale * 0.72);
  var tableW = Math.max(30, s.span_m * roomScale * 0.42);
  var tableTopY = centerY - (tableW / 2.0);

  // Camera HFOV cone boundary coordinates
  var hfovRad = (s.spec.camera.hfovDeg * Math.PI) / 180.0;
  var halfAngle = hfovRad / 2.0;
  var camFarX = Math.min(roomRight, roomLeft + (s.spec.camera.maxFramingDepth * roomScale));
  var coneHalfW = (camFarX - barX) * Math.tan(halfAngle);
  var coneTopY = centerY - coneHalfW;
  var coneBottomY = centerY + coneHalfW;

  // Mic Pickup Radius boundary
  var micRadiusSvg = s.spec.microphone.pickupRadiusM * roomScale;

  // Speaker Throw radius
  var spkThrowSvg = s.spec.speaker.maxThrowM * roomScale;

  var svg = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="background:#080d1a; font-family:'JetBrains Mono', monospace; font-size:11px;">
      <defs>
        <radialGradient id="vbarMicGrad" cx="0%" cy="50%" r="100%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.32"/>
          <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.0"/>
        </radialGradient>
        <linearGradient id="vbarCamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="#6366f1" stop-opacity="0.08"/>
        </linearGradient>
      </defs>

      <!-- 1. ROOM SHELL OUTLINE -->
      <rect x="${roomLeft}" y="${roomTop}" width="${svgRoomL}" height="${svgRoomW}" fill="#0f172a" stroke="#334155" stroke-width="2" rx="4"/>
      
      <!-- Room Dimension Callouts -->
      <text x="${roomLeft + svgRoomL/2}" y="${Math.max(16, roomTop - 10)}" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">
        ROOM LENGTH (L): ${s.L.toFixed(1)} m • FINISHED WALL INTERIOR
      </text>
      <text x="${roomLeft - 14}" y="${centerY}" fill="#38bdf8" font-size="9" font-weight="bold" text-anchor="middle" transform="rotate(-90, ${roomLeft - 14}, ${centerY})">
        W: ${s.W.toFixed(1)} m
      </text>

      <!-- 2. CAMERA HFOV CONE FRUSTUM -->
      <polygon points="${barX},${centerY} ${camFarX},${coneTopY} ${camFarX},${coneBottomY}" fill="url(#vbarCamGrad)" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,2"/>
      <line x1="${barX}" y1="${centerY}" x2="${camFarX}" y2="${centerY}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>
      <g transform="translate(${roomLeft + 60}, ${centerY - 28})">
        <rect x="-4" y="-12" width="135" height="18" fill="#0f172a" stroke="#38bdf8" stroke-width="1" rx="3" opacity="0.9"/>
        <text x="3" y="0" fill="#38bdf8" font-size="9" font-weight="bold">📷 ${s.spec.camera.hfovDeg}° HFOV (${s.spec.camera.maxFramingDepth}m)</text>
      </g>

      <!-- 3. SPEAKER ACOUSTIC SOUND WAVE ARCS -->
      <g stroke="#10b981" stroke-width="1.2" fill="none" opacity="0.5" stroke-dasharray="5,3">
        <path d="M ${barX + spkThrowSvg*0.35} ${centerY - spkThrowSvg*0.25} A ${spkThrowSvg*0.35} ${spkThrowSvg*0.35} 0 0 1 ${barX + spkThrowSvg*0.35} ${centerY + spkThrowSvg*0.25}"/>
        <path d="M ${barX + spkThrowSvg*0.65} ${centerY - spkThrowSvg*0.45} A ${spkThrowSvg*0.65} ${spkThrowSvg*0.65} 0 0 1 ${barX + spkThrowSvg*0.65} ${centerY + spkThrowSvg*0.45}"/>
        <path d="M ${barX + spkThrowSvg} ${centerY - spkThrowSvg*0.65} A ${spkThrowSvg} ${spkThrowSvg} 0 0 1 ${barX + spkThrowSvg} ${centerY + spkThrowSvg*0.65}" stroke-width="2" stroke="${s.meetsAvixaSpeech ? '#10b981' : '#f59e0b'}"/>
      </g>
      <text x="${Math.min(roomRight - 10, barX + spkThrowSvg)}" y="${roomBottom - 10}" fill="${s.meetsAvixaSpeech ? '#34d399' : '#fbbf24'}" font-size="8.5" font-weight="bold" text-anchor="end">
        🔊 Spk Throw: ${s.spec.speaker.maxThrowM}m (${s.splRoomAtFurthest.toFixed(1)} dBA at back row)
      </text>

      <!-- 4. MICROPHONE BEAMFORMING COVERAGE LOBE -->
      <path d="M ${barX} ${centerY} M ${barX} ${centerY - micRadiusSvg*0.65} A ${micRadiusSvg} ${micRadiusSvg*0.65} 0 0 1 ${barX} ${centerY + micRadiusSvg*0.65} Z" fill="url(#vbarMicGrad)" stroke="#f59e0b" stroke-width="1.5"/>
      <g transform="translate(${barX + micRadiusSvg*0.65}, ${centerY - 8})">
        <rect x="-4" y="-12" width="125" height="17" fill="#0f172a" stroke="#f59e0b" stroke-width="1" rx="3" opacity="0.9"/>
        <text x="3" y="0" fill="#fbbf24" font-size="8.5" font-weight="bold">🎙️ ${s.spec.microphone.pickupRadiusM}m Mic Radius</text>
      </g>

      <!-- 5. CONFERENCE TABLE & CHAIRS -->
      <rect x="${tableLeft}" y="${tableTopY}" width="${tableL}" height="${tableW}" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
      <text x="${tableLeft + tableL/2}" y="${centerY + 4}" fill="#e2e8f0" font-size="8.5" font-weight="bold" text-anchor="middle">
        TABLE (${s.seats} SEATS)
      </text>

      <!-- Participant Chairs -->
      ${[0.18, 0.45, 0.72].map(ratio => `
        <circle cx="${tableLeft + tableL * ratio}" cy="${tableTopY - 8}" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1"/>
        <circle cx="${tableLeft + tableL * ratio}" cy="${tableTopY + tableW + 8}" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1"/>
      `).join('')}

      <!-- Expansion Mic Pods on Table (if needed) -->
      ${s.expansionPodsNeeded > 0 ? `
        <circle cx="${tableLeft + tableL * 0.75}" cy="${centerY}" r="8" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="${tableLeft + tableL * 0.75}" cy="${centerY}" r="2.5" fill="#ffffff"/>
        <text x="${tableLeft + tableL * 0.75}" y="${centerY - 12}" fill="#fca5a5" font-size="8" font-weight="bold" text-anchor="middle">+1 Extension Pod</text>
      ` : ''}

      <!-- 6. FRONT WALL: DISPLAY & VIDEO BAR -->
      <rect x="${roomLeft - 6}" y="${centerY - 45}" width="6" height="90" fill="#38bdf8" rx="2"/>
      <rect x="${barX}" y="${barTopY}" width="${barSvgW}" height="${barSvgH}" fill="#0d9488" stroke="#14b8a6" stroke-width="1.5" rx="3"/>
      <circle cx="${barX + barSvgW/2}" cy="${centerY}" r="2" fill="#ffffff"/>

      <!-- D1 Dimension Line -->
      <g stroke="#f59e0b" stroke-width="1.2">
        <line x1="${barX}" y1="${centerY + 50}" x2="${tableLeft}" y2="${centerY + 50}"/>
        <line x1="${barX}" y1="${centerY + 45}" x2="${barX}" y2="${centerY + 55}"/>
        <line x1="${tableLeft}" y1="${centerY + 45}" x2="${tableLeft}" y2="${centerY + 55}"/>
      </g>
      <text x="${(barX + tableLeft)/2}" y="${centerY + 64}" fill="#f59e0b" font-size="8.5" font-weight="bold" text-anchor="middle">
        D1 = ${s.d1_m.toFixed(1)} m
      </text>
    </svg>
  `;

  container.innerHTML = svg;
}

// 2. SIDE ELEVATION CROSS-SECTION VIEW (Tightly bound: ZERO top/bottom dead space)
function renderVideoBarSideElevationSvg(container, s) {
  var w = 880;
  var h = 300; // Compact viewBox completely eliminating empty vertical space

  var floorY = 265;
  var ceilingY = 25;
  var wallX = 140;

  var scaleX = 520 / s.L;
  var scaleY = 238 / s.H; // 240px span mapped to finished ceiling height H

  var dispSvgH = s.dispHeight_mm * (scaleY / 1000.0);
  var dispBottomY = floorY - (s.dispAffl_mm * (scaleY / 1000.0));
  var dispTopY = dispBottomY - dispSvgH;

  // Video bar position
  var barSvgH = 14;
  var barSvgDepth = 18;
  var barY = floorY - (s.barMountedHeight_mm * (scaleY / 1000.0));

  // Table & Seated Participant positions
  var d1_svg = s.d1_m * scaleX;
  var headX = wallX + d1_svg + 25;
  var headY = floorY - (1.2 * 1000.0 * (scaleY / 1000.0)); // 1.2m seated eye level datum

  var dLast_svg = s.dLast * scaleX;
  var backHeadX = wallX + dLast_svg;

  // Compute text label coordinates to ensure ZERO overlapping
  var dispLabelY = Math.max(ceilingY + 14, dispTopY - 6);
  var barLabelY = (s.activePlacement === 'below')
    ? Math.min(floorY - 14, barY + barSvgH + 15)
    : Math.max(ceilingY + 12, barY - 10);

  var svg = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="background:#080d1a; font-family:'JetBrains Mono', monospace; font-size:11px;">
      <!-- Floor Line & Finished Level -->
      <line x1="80" y1="${floorY}" x2="${w - 60}" y2="${floorY}" stroke="#22c55e" stroke-width="2.5"/>
      <text x="${w - 65}" y="${floorY - 6}" fill="#22c55e" font-size="8.5" font-weight="bold" text-anchor="end">FINISHED FLOOR (AFFL 0.0)</text>

      <!-- Floor Hatching -->
      <line x1="80" y1="${floorY + 5}" x2="${w - 60}" y2="${floorY + 5}" stroke="#1e293b" stroke-width="1" stroke-dasharray="2,2"/>

      <!-- Ceiling Line & Height -->
      <line x1="80" y1="${ceilingY}" x2="${w - 60}" y2="${ceilingY}" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
      <text x="${w - 65}" y="${ceilingY + 14}" fill="#94a3b8" font-size="8.5" font-weight="bold" text-anchor="end">CEILING: ${s.H.toFixed(2)}m AFFL</text>

      <!-- Front Wall Plane -->
      <line x1="${wallX}" y1="${ceilingY}" x2="${wallX}" y2="${floorY}" stroke="#475569" stroke-width="5"/>
      <text x="${wallX - 10}" y="${(ceilingY + floorY)/2}" fill="#64748b" font-size="9" font-weight="bold" text-anchor="middle" transform="rotate(-90, ${wallX - 10}, ${(ceilingY + floorY)/2})">
        MOUNTING WALL
      </text>

      <!-- 1. Commercial Display -->
      <rect x="${wallX + 4}" y="${dispTopY}" width="16" height="${dispSvgH}" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" rx="2"/>
      
      <!-- Non-overlapping Display Callout Pill Badge -->
      <g transform="translate(${wallX + 26}, ${dispLabelY})">
        <rect x="0" y="-12" width="190" height="18" fill="#0f172a" stroke="#38bdf8" stroke-width="1" rx="4" opacity="0.95"/>
        <text x="6" y="0" fill="#38bdf8" font-size="9" font-weight="bold">
          ${s.dispInches}" DISPLAY (${s.dispAffl_mm}mm AFFL)
        </text>
      </g>

      <!-- 2. Video Bar Unit -->
      <rect x="${wallX + 4}" y="${barY}" width="${barSvgDepth}" height="${barSvgH}" fill="#0d9488" stroke="#14b8a6" stroke-width="2" rx="2.5"/>
      <circle cx="${wallX + 4 + barSvgDepth - 3}" cy="${barY + barSvgH/2}" r="3" fill="#ffffff"/>
      
      <!-- Non-overlapping Video Bar Callout Pill Badge -->
      <g transform="translate(${wallX + 26}, ${barLabelY})">
        <rect x="0" y="-12" width="230" height="18" fill="#042f2e" stroke="#14b8a6" stroke-width="1.2" rx="4" opacity="0.95"/>
        <text x="6" y="0" fill="#2dd4bf" font-size="8.5" font-weight="bold">
          ${s.spec.name} (${s.activePlacement.toUpperCase()}: ${Math.round(s.barMountedHeight_mm)}mm)
        </text>
      </g>

      <!-- 3. Optical Sightline from Camera to Seated Attendee -->
      <line x1="${wallX + 4 + barSvgDepth}" y1="${barY + barSvgH/2}" x2="${headX}" y2="${headY}" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="4,2"/>
      <g transform="translate(${(wallX + headX)/2 - 40}, ${(barY + headY)/2 - 12})">
        <rect x="-4" y="-10" width="130" height="16" fill="#0f172a" stroke="#f59e0b" stroke-width="1" rx="3" opacity="0.95"/>
        <text x="2" y="1" fill="#fbbf24" font-size="8" font-weight="bold">
          Sightline (Tilt: ${s.verticalTiltDeg >= 0 ? '+' : ''}${s.verticalTiltDeg.toFixed(1)}°)
        </text>
      </g>

      <!-- 4. Speaker Acoustic Wave Spread Downward -->
      <path d="M ${wallX + barSvgDepth} ${barY} L ${backHeadX} ${headY - 15} L ${backHeadX} ${floorY} Z" fill="rgba(16,185,129,0.12)" stroke="#10b981" stroke-width="1" stroke-dasharray="4,2"/>

      <!-- 5. 1.2m Seated Eye Level Reference Datum -->
      <line x1="100" y1="${headY}" x2="${w - 80}" y2="${headY}" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.7"/>
      <text x="105" y="${headY - 4}" fill="#f59e0b" font-size="7.5" opacity="0.85">1.2m SEATED EYE PLANE</text>

      <!-- 6. Seated Participants -->
      <!-- Front Row (D1) -->
      <circle cx="${headX}" cy="${headY}" r="9" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
      <line x1="${headX}" y1="${headY + 9}" x2="${headX}" y2="${floorY}" stroke="#38bdf8" stroke-width="2"/>
      <rect x="${headX - 35}" y="${headY - 26}" width="70" height="14" fill="#0f172a" stroke="#38bdf8" stroke-width="1" rx="3" opacity="0.9"/>
      <text x="${headX}" y="${headY - 16}" fill="#38bdf8" font-size="8" font-weight="bold" text-anchor="middle">Row 1 (D1: ${s.d1_m}m)</text>

      <!-- Back Row (DLast) -->
      <circle cx="${backHeadX}" cy="${headY}" r="9" fill="#94a3b8" stroke="#ffffff" stroke-width="1.5"/>
      <line x1="${backHeadX}" y1="${headY + 9}" x2="${backHeadX}" y2="${floorY}" stroke="#94a3b8" stroke-width="2"/>
      <rect x="${backHeadX - 45}" y="${headY - 26}" width="90" height="14" fill="#0f172a" stroke="#94a3b8" stroke-width="1" rx="3" opacity="0.9"/>
      <text x="${backHeadX}" y="${headY - 16}" fill="#94a3b8" font-size="8" font-weight="bold" text-anchor="middle">Last Row (${s.dLast.toFixed(1)}m)</text>
      
      <!-- SPL Badge at Back Row -->
      <g transform="translate(${backHeadX - 35}, ${headY + 16})">
        <rect x="0" y="0" width="70" height="15" fill="#064e3b" stroke="#10b981" stroke-width="1" rx="3"/>
        <text x="35" y="11" fill="#34d399" font-size="8" font-weight="bold" text-anchor="middle">${s.splRoomAtFurthest.toFixed(1)} dBA</text>
      </g>
    </svg>
  `;

  container.innerHTML = svg;
}

// ==========================================
// TARGET ROOM DROPDOWN & MATRIX SYNC
// ==========================================
function refreshVbTargetRoomsDropdown() {
  var sel = document.getElementById('vbTargetRoomSelect');
  if (!sel) return;
  var rows = document.querySelectorAll('#matrixTableBody tr');
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
    var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2800;
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
}

// Load selected room's dimensions into Video Bar Studio
function loadSelectedMatrixRoomToVideoBar(selEl) {
  if (!selEl || selEl.value === 'new') return;
  var idx = parseInt(selEl.value);
  var rows = document.querySelectorAll('#matrixTableBody tr');
  var row = rows[idx];
  if (!row) return;

  var lm = parseFloat(row.querySelector('.inp-lm')?.value) || 7000;
  var wm = parseFloat(row.querySelector('.inp-wm')?.value) || 5000;
  var hm = parseFloat(row.querySelector('.inp-hm')?.value) || 2800;
  var seats = parseInt(row.querySelector('.inp-seats')?.value) || 10;
  var d1_mm = parseFloat(row.querySelector('.inp-d1')?.value) || 2000;
  var span_mm = parseFloat(row.querySelector('.inp-span')?.value) || 3200;

  var elL = document.getElementById('vbRoomLength');
  var elW = document.getElementById('vbRoomWidth');
  var elH = document.getElementById('vbRoomHeight');
  var elSeats = document.getElementById('vbRoomSeats');
  var elD1 = document.getElementById('vbDistD1');
  var elSpan = document.getElementById('vbSpanW');

  if (elL) elL.value = (lm / 1000.0).toFixed(1);
  if (elW) elW.value = (wm / 1000.0).toFixed(1);
  if (elH) elH.value = (hm / 1000.0).toFixed(1);
  if (elSeats) elSeats.value = seats;
  if (elD1) elD1.value = (d1_mm / 1000.0).toFixed(1);
  if (elSpan) elSpan.value = (span_mm / 1000.0).toFixed(1);

  calculateVideoBarStudio();
}

// Send Recommended Video Bar to Chosen Target Room in Spatial Room Matrix
function applyVideoBarToSpatialMatrix() {
  var s = window.activeVideoBarState;
  if (!s) return;

  var sel = document.getElementById('vbTargetRoomSelect');
  var targetVal = sel ? sel.value : '0';
  var rows = document.querySelectorAll('#matrixTableBody tr');
  var targetRow = null;
  var targetRoomName = '';
  var targetRoomIdx = 1;

  if (targetVal === 'new' || rows.length === 0) {
    if (typeof addMatrixRoomRow === 'function') {
      addMatrixRoomRow();
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

  if (!targetRow) {
    alert('Please ensure at least one room exists in the Spatial Room Matrix.');
    return;
  }

  // Update target row with video bar tier, qty, and placement
  var barSel = targetRow.querySelector('.inp-video-bar');
  if (barSel) barSel.value = s.tierId;
  var barQtyInp = targetRow.querySelector('.inp-bar-qty');
  if (barQtyInp) barQtyInp.value = 1;
  var barPosSel = targetRow.querySelector('.inp-bar-pos');
  if (barPosSel) barPosSel.value = (s.activePlacement === 'above' ? 'above' : 'below');

  // Recalculate room
  if (typeof recalcRoomRow === 'function') {
    recalcRoomRow(targetRow);
  }
  if (typeof updateMatrixTotalsAndSummary === 'function') {
    updateMatrixTotalsAndSummary();
  }

  // Highlight active row in matrix
  document.querySelectorAll('#matrixTableBody tr').forEach(function(r) { r.classList.remove('table-active-room'); });
  targetRow.classList.add('table-active-room');

  // Show clear user-facing feedback banner
  var toastMsg = `✓ Successfully applied ${s.spec.name} (${s.activePlacement === 'above' ? 'Mounted Above Display' : 'Mounted Below Display'}) to Room ${targetRoomIdx} ("${targetRoomName}") in the Spatial Room Matrix!`;
  
  var elToast = document.getElementById('vbarApplyConfirmationBanner');
  if (elToast) {
    elToast.innerHTML = `<div class="alert alert-success d-flex align-items-center justify-content-between p-2 mb-2 font-mono shadow-sm" style="font-size:0.8rem;">
      <div><i class="fa-solid fa-circle-check me-2 text-success"></i>${toastMsg}</div>
      <button type="button" class="btn btn-sm btn-outline-success fw-bold py-0.5 px-2 ms-2" onclick="openTab(null, 'Tab10')">View Room in Matrix →</button>
    </div>`;
    elToast.style.display = 'block';
  } else {
    alert(toastMsg);
  }

  refreshVbTargetRoomsDropdown();
}

// Global initialization
window.calculateVideoBarStudio = calculateVideoBarStudio;
window.setVideoBarSvgMode = setVideoBarSvgMode;
window.renderVideoBarSvg = renderVideoBarSvg;
window.initVideoBarStudio = function() {
  calculateVideoBarStudio();
  refreshVbTargetRoomsDropdown();
};
window.setVideoBarPlacementMode = setVideoBarPlacementMode;
window.setVideoBarDisplayAfflPreset = setVideoBarDisplayAfflPreset;
window.refreshVbTargetRoomsDropdown = refreshVbTargetRoomsDropdown;
window.loadSelectedMatrixRoomToVideoBar = loadSelectedMatrixRoomToVideoBar;
window.applyVideoBarToSpatialMatrix = applyVideoBarToSpatialMatrix;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof calculateVideoBarStudio === 'function') {
      calculateVideoBarStudio();
    }
  });
}
