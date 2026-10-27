// ==========================================
// TAB 6: ACOUSTIC DESIGN & RT60 STUDIO
// ==========================================
function sendRoomToAcousticsTab(btn) {
  var tr = btn.closest('tr');
  if (!tr) return;

  var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 7000;
  var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 5000;
  var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;
  var name = tr.querySelector('.inp-name')?.value || 'Matrix Room';

  var acL = document.getElementById('acLength');
  var acW = document.getElementById('acWidth');
  var acH = document.getElementById('acHeight');

  if (acL) acL.value = (lm / 1000.0).toFixed(1);
  if (acW) acW.value = (wm / 1000.0).toFixed(1);
  if (acH) acH.value = (hm / 1000.0).toFixed(1);

  calcAcousticsFull();
  syncMatrixRoomsToAcousticsDropdown();

  var select = document.getElementById('acMatrixRoomSelect');
  if (select) {
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].text.includes(name)) {
        select.selectedIndex = i;
        break;
      }
    }
  }

  var tab6Btn = document.querySelector(".tab-button[onclick*='Tab6']");
  if (tab6Btn) { tab6Btn.click(); }
}

function syncMatrixRoomsToAcousticsDropdown() {
  var select = document.getElementById('acMatrixRoomSelect');
  if (!select) return;

  select.innerHTML = '<option value="">-- Select Room from Spatial Matrix --</option>';
  const rows = document.querySelectorAll('#matrixTableBody tr');
  rows.forEach((tr, idx) => {
    var name = tr.querySelector('.inp-name')?.value || `Room ${idx+1}`;
    var fl = tr.querySelector('.inp-floor')?.value || '01';
    var lm = parseFloat(tr.querySelector('.inp-lm')?.value) || 7000;
    var wm = parseFloat(tr.querySelector('.inp-wm')?.value) || 5000;
    var hm = parseFloat(tr.querySelector('.inp-hm')?.value) || 2700;

    var option = document.createElement('option');
    option.value = JSON.stringify({ name: name, l: (lm / 1000.0), w: (wm / 1000.0), h: (hm / 1000.0) });
    option.text = `[Fl ${fl}] ${name} (${(lm / 1000.0).toFixed(1)}m × ${(wm / 1000.0).toFixed(1)}m × ${(hm / 1000.0).toFixed(1)}m)`;
    select.appendChild(option);
  });
}

function loadRoomIntoAcousticsStudio(select) {
  if (!select || !select.value) return;
  try {
    var data = JSON.parse(select.value);
    document.getElementById('acLength').value = Math.round(data.l * 1000);
    document.getElementById('acWidth').value = Math.round(data.w * 1000);
    document.getElementById('acHeight').value = Math.round(data.h * 1000);
    calcAcousticsFull();
  } catch (e) {}
}

var currentAcOrbitAngle = 35;

function onAcOrbitSliderChange(val) {
  currentAcOrbitAngle = parseFloat(val) || 35;
  var badge = document.getElementById('acOrbitAngleBadge');
  if (badge) badge.innerText = Math.round(currentAcOrbitAngle) + '°';
  calcAcousticsFull();
}

function calcAcousticsFull() {
  var LMm = parseFloat(document.getElementById('acLength')?.value) || 8000;
  if (LMm < 100) LMm = LMm * 1000;
  var WMm = parseFloat(document.getElementById('acWidth')?.value) || 6000;
  if (WMm < 100) WMm = WMm * 1000;
  var HMm = parseFloat(document.getElementById('acHeight')?.value) || 3000;
  if (HMm < 100) HMm = HMm * 1000;

  var L = LMm / 1000.0;
  var W = WMm / 1000.0;
  var H = HMm / 1000.0;

  var preset = document.getElementById('acSpacePresetSelect')?.value || 'boardroom';
  var wallMat = document.getElementById('acWallTreatmentSelect')?.value || 'fabric_25mm';
  var wallPct = parseFloat(document.getElementById('acWallTreatmentPercent')?.value) || 35;
  var ceilMat = document.getElementById('acCeilingTreatmentSelect')?.value || 'suspended_clouds';
  var ceilPct = parseFloat(document.getElementById('acCeilingTreatmentPercent')?.value) || 40;
  var floorMat = document.getElementById('acFloorTreatmentSelect')?.value || 'carpet_underlay';

  var lblWall = document.getElementById('lblWallPct');
  if (lblWall) lblWall.innerText = wallPct + '% Area';
  var lblCeil = document.getElementById('lblCeilPct');
  if (lblCeil) lblCeil.innerText = ceilPct + '% Area';

  var V = L * W * H;
  var sWalls = 2 * (L * H) + 2 * (W * H);
  var sCeil = L * W;
  var sFloor = L * W;
  var sTotal = sWalls + sCeil + sFloor;

  var elVol = document.getElementById('acVolVal');
  if (elVol) elVol.innerText = V.toFixed(1) + ' m³ (' + (V * 35.3147).toFixed(0) + ' ft³)';
  var elSurf = document.getElementById('acSurfVal');
  if (elSurf) elSurf.innerText = sTotal.toFixed(1) + ' m² (' + (sTotal * 10.7639).toFixed(0) + ' ft²)';

  var wallCoeffs = {
    'bare_drywall': [0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
    'fabric_25mm': [0.15, 0.35, 0.70, 0.85, 0.85, 0.80],
    'fabric_50mm': [0.25, 0.60, 0.90, 0.95, 0.95, 0.90],
    'wood_qrd': [0.20, 0.35, 0.50, 0.65, 0.75, 0.70],
    'perf_timber': [0.35, 0.65, 0.80, 0.75, 0.65, 0.55]
  };

  var ceilCoeffs = {
    'bare_slab': [0.03, 0.04, 0.05, 0.05, 0.05, 0.05],
    'act_grid': [0.25, 0.45, 0.65, 0.75, 0.80, 0.80],
    'suspended_clouds': [0.35, 0.65, 0.85, 0.95, 0.95, 0.90],
    'baffles_traps': [0.55, 0.80, 0.95, 0.95, 0.95, 0.90]
  };

  var floorCoeffs = {
    'bare_concrete': [0.02, 0.02, 0.03, 0.03, 0.04, 0.05],
    'hardwood': [0.05, 0.06, 0.08, 0.10, 0.12, 0.10],
    'carpet_underlay': [0.08, 0.15, 0.30, 0.45, 0.55, 0.60],
    'floating_isolators': [0.15, 0.25, 0.35, 0.45, 0.50, 0.55]
  };

  var alphaW = wallCoeffs[wallMat] || wallCoeffs['fabric_25mm'];
  var alphaC = ceilCoeffs[ceilMat] || ceilCoeffs['suspended_clouds'];
  var alphaF = floorCoeffs[floorMat] || floorCoeffs['carpet_underlay'];

  var sTreatedWall = sWalls * (wallPct / 100.0);
  var sUntreatedWall = sWalls - sTreatedWall;
  var sTreatedCeil = sCeil * (ceilPct / 100.0);
  var sUntreatedCeil = sCeil - sTreatedCeil;

  var rtOctaves = [];
  for (var k = 0; k < 6; k++) {
    var A = (sTreatedWall * alphaW[k]) + (sUntreatedWall * 0.05) +
            (sTreatedCeil * alphaC[k]) + (sUntreatedCeil * 0.05) +
            (sFloor * alphaF[k]);
    var rt = (0.161 * V) / A;
    rtOctaves.push(rt);
  }

  var rt500 = rtOctaves[2];
  var rt1k = rtOctaves[3];
  var sabineRT60 = (rt500 + rt1k) / 2.0;

  var targetMin = 0.40, targetMax = 0.55, targetStr = '0.40 - 0.55 s';
  if (preset === 'classroom') { targetMin = 0.50; targetMax = 0.65; targetStr = '0.50 - 0.65 s (ANSI S12.60)'; }
  if (preset === 'studio') { targetMin = 0.25; targetMax = 0.40; targetStr = '0.25 - 0.40 s (EBU Tech 3276)'; }
  if (preset === 'auditorium') { targetMin = 0.80; targetMax = 1.20; targetStr = '0.80 - 1.20 s (Speech & Music)'; }
  if (preset === 'huddle') { targetMin = 0.35; targetMax = 0.50; targetStr = '0.35 - 0.50 s (Intimate UC)'; }

  var setTxt = function(id, txt) { var el = document.getElementById(id); if (el) el.innerText = txt; };
  setTxt('resSabineRT60', sabineRT60.toFixed(2) + ' s');
  setTxt('resTargetRT60', targetStr);
  setTxt('resAcReqPanels', 'Treated Wall: ' + sTreatedWall.toFixed(1) + ' m² | Ceiling: ' + sTreatedCeil.toFixed(1) + ' m²');

  var statusEl = document.getElementById('resAcousticStatus');
  if (statusEl) {
    if (sabineRT60 >= targetMin && sabineRT60 <= targetMax) {
      statusEl.className = 'badge bg-success font-monospace px-3 py-2';
      statusEl.innerText = 'OPTIMAL ACOUSTICS (PASS)';
    } else if (sabineRT60 > targetMax) {
      statusEl.className = 'badge bg-warning text-dark font-monospace px-3 py-2';
      statusEl.innerText = 'TOO LIVE / REVERBERANT (ADD ABSORPTION)';
    } else {
      statusEl.className = 'badge bg-info text-dark font-monospace px-3 py-2';
      statusEl.innerText = 'DEAD / OVER-ABSORBED (REDUCE TREATMENT)';
    }
  }

  var tblOct = document.getElementById('tblAcousticOctaves');
  if (tblOct) {
    tblOct.innerHTML = `
      <tr>
        <td class="fw-bold text-start font-mono">Calculated RT60</td>
        ${rtOctaves.map((rt, idx) => `<td class="font-mono fw-bold ${idx === 2 || idx === 3 ? 'text-primary' : 'text-dark'}">${rt.toFixed(2)}s</td>`).join('')}
      </tr>
      <tr>
        <td class="fw-bold text-start text-secondary font-mono">Wall Absorption (α)</td>
        ${alphaW.map(a => `<td class="font-mono text-secondary">${a.toFixed(2)}</td>`).join('')}
      </tr>
      <tr>
        <td class="fw-bold text-start text-secondary font-mono">Ceiling Absorption (α)</td>
        ${alphaC.map(a => `<td class="font-mono text-secondary">${a.toFixed(2)}</td>`).join('')}
      </tr>
    `;
  }

  renderAcousticChart(rtOctaves, targetMin, targetMax);
  renderAcousticsISO3ViewSvg(wallPct, ceilPct, L, W, H, sabineRT60);
  if (typeof renderD3SpeakerOverlapChart === 'function') {
    renderD3SpeakerOverlapChart();
  }
}

function exportAcousticReportToPDF() {
  if (typeof html2pdf === 'undefined') {
    alert('html2pdf library is loading or blocked. Please retry in a moment.');
    return;
  }

  var L = parseFloat(document.getElementById('acLength')?.value) || 8.0;
  var W = parseFloat(document.getElementById('acWidth')?.value) || 6.0;
  var H = parseFloat(document.getElementById('acHeight')?.value) || 3.0;
  var V = (L * W * H).toFixed(1);
  var S = (2 * (L * H) + 2 * (W * H) + 2 * (L * W)).toFixed(1);

  var presetSelect = document.getElementById('acSpacePresetSelect');
  var presetText = presetSelect ? presetSelect.options[presetSelect.selectedIndex].text : 'Executive Boardroom / Conference';

  var wallSelect = document.getElementById('acWallTreatmentSelect');
  var wallText = wallSelect ? wallSelect.options[wallSelect.selectedIndex].text : 'Fabric Wrapped Fiberglass 25mm';
  var wallPct = document.getElementById('acWallTreatmentPercent')?.value || '35';

  var ceilSelect = document.getElementById('acCeilingTreatmentSelect');
  var ceilText = ceilSelect ? ceilSelect.options[ceilSelect.selectedIndex].text : 'Suspended Acoustic Clouds (50mm)';
  var ceilPct = document.getElementById('acCeilingTreatmentPercent')?.value || '40';

  var floorSelect = document.getElementById('acFloorTreatmentSelect');
  var floorText = floorSelect ? floorSelect.options[floorSelect.selectedIndex].text : 'Commercial Carpet with Underlay';

  var rt60 = document.getElementById('resSabineRT60')?.innerText || '0.50 s';
  var targetBand = document.getElementById('resTargetRT60')?.innerText || '0.40 - 0.55 s';
  var statusBadge = document.getElementById('resAcousticStatus')?.innerText || 'OPTIMAL ACOUSTICS';
  var panelsReq = document.getElementById('resAcReqPanels')?.innerText || '';

  var chartCanvas = document.getElementById('acousticRt60Chart');
  var chartImgData = chartCanvas ? chartCanvas.toDataURL('image/png') : '';
  var octavesRow = document.getElementById('tblAcousticOctaves')?.innerHTML || '';

  var container = document.createElement('div');
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.padding = '24px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.color = '#0f172a';
  container.style.backgroundColor = '#ffffff';

  container.innerHTML = `
    <!-- Large diagonal HCMM watermark overlay -->
    <div style="position: absolute; top: 46%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 140px; font-weight: 900; color: rgba(15, 23, 42, 0.08); letter-spacing: 20px; font-family: Arial, sans-serif; pointer-events: none; z-index: 0; user-select: none; white-space: nowrap;">
      HCMM
    </div>

    <div style="border-bottom: 3px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 2;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <h1 style="font-size: 20px; color: #0f172a; margin: 0; font-weight: bold;">Pro AV Architectural Acoustic Engineering Report</h1>
          <span style="font-size: 10px; font-weight: 800; color: #dc2626; border: 1.5px solid #dc2626; border-radius: 4px; padding: 2px 7px; background: #fef2f2; font-family: monospace;">
            WATERMARK: HCMM
          </span>
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Sabine RT60 Reverberation Analysis &amp; Octave Frequency Curve</div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #64748b;">
        <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        <div><strong>Calculation:</strong> Sabine Reverberation Standard (ISO 3382)</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc;">
        <h3 style="font-size: 12px; font-weight: bold; color: #0284c7; margin: 0 0 8px 0; text-transform: uppercase;">1. Space &amp; Room Dimensions</h3>
        <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
          <tr><td style="padding: 3px 0; color: #64748b;">Space Classification:</td><td style="font-weight: bold; text-align: right;">${presetText}</td></tr>
          <tr><td style="padding: 3px 0; color: #64748b;">Length × Width × Height:</td><td style="font-weight: bold; text-align: right;">${L} m × ${W} m × ${H} m</td></tr>
          <tr><td style="padding: 3px 0; color: #64748b;">Total Air Volume:</td><td style="font-weight: bold; text-align: right; color: #dc2626;">${V} m³</td></tr>
          <tr><td style="padding: 3px 0; color: #64748b;">Total Boundary Surface:</td><td style="font-weight: bold; text-align: right;">${S} m²</td></tr>
        </table>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc;">
        <h3 style="font-size: 12px; font-weight: bold; color: #0284c7; margin: 0 0 8px 0; text-transform: uppercase;">2. Material Settings &amp; Coverage</h3>
        <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
          <tr><td style="padding: 3px 0; color: #64748b;">Wall Treatment:</td><td style="font-weight: bold; text-align: right;">${wallText} (${wallPct}% area)</td></tr>
          <tr><td style="padding: 3px 0; color: #64748b;">Ceiling Treatment:</td><td style="font-weight: bold; text-align: right;">${ceilText} (${ceilPct}% area)</td></tr>
          <tr><td style="padding: 3px 0; color: #64748b;">Flooring Material:</td><td style="font-weight: bold; text-align: right;">${floorText}</td></tr>
          <tr><td style="padding: 3px 0; color: #64748b;">Acoustic Panel Requirement:</td><td style="font-weight: bold; text-align: right; color: #16a34a;">${panelsReq}</td></tr>
        </table>
      </div>
    </div>

    <div style="border: 2px solid #0284c7; border-radius: 8px; padding: 14px; background: #eff6ff; margin-bottom: 20px; display: flex; justify-content: space-around; text-align: center;">
      <div>
        <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Calculated RT60 (Mid-Band)</div>
        <div style="font-size: 24px; font-weight: bold; color: #0284c7; margin: 3px 0;">${rt60}</div>
        <div style="font-size: 9px; color: #64748b;">500 Hz &amp; 1000 Hz Average</div>
      </div>
      <div style="border-left: 1px solid #bfdbfe; padding-left: 20px;">
        <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Target Standard Band</div>
        <div style="font-size: 20px; font-weight: bold; color: #16a34a; margin: 5px 0;">${targetBand}</div>
        <div style="font-size: 9px; color: #64748b;">Speech Intelligibility Standard</div>
      </div>
      <div style="border-left: 1px solid #bfdbfe; padding-left: 20px;">
        <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Acoustic Health Status</div>
        <div style="display: inline-block; padding: 5px 12px; font-size: 12px; font-weight: bold; background: #16a34a; color: #ffffff; border-radius: 6px; margin-top: 5px;">
          ${statusBadge}
        </div>
      </div>
    </div>

    <div style="margin-bottom: 18px;">
      <h3 style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">3. Frequency Octave Breakdown (125 Hz – 4 kHz)</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: center; border: 1px solid #cbd5e1;">
        <thead style="background: #1e293b; color: #ffffff;">
          <tr>
            <th style="padding: 6px; border: 1px solid #334155;">Octave Band</th>
            <th style="padding: 6px; border: 1px solid #334155;">125 Hz</th>
            <th style="padding: 6px; border: 1px solid #334155;">250 Hz</th>
            <th style="padding: 6px; border: 1px solid #334155;">500 Hz</th>
            <th style="padding: 6px; border: 1px solid #334155;">1000 Hz</th>
            <th style="padding: 6px; border: 1px solid #334155;">2000 Hz</th>
            <th style="padding: 6px; border: 1px solid #334155;">4000 Hz</th>
          </tr>
        </thead>
        <tbody style="background: #f8fafc; color: #0f172a;">
          ${octavesRow}
        </tbody>
      </table>
    </div>

    ${chartImgData ? `
      <div style="margin-bottom: 15px;">
        <h3 style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">4. RT60 Frequency Curve vs Architectural Target Limits</h3>
        <img src="${chartImgData}" style="width: 100%; max-height: 240px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; background: #0f172a;" />
      </div>
    ` : ''}

    <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; position: relative; z-index: 2;">
      <span>Generated by Pro AV System Architect &amp; Spatial Matrix Suite</span>
      <span style="font-weight: bold; color: #dc2626;">HCMM CERTIFIED &bull; [WATERMARK: HCMM]</span>
      <span>Sabine RT60 Formula: RT60 = (0.161 × V) / A_total</span>
    </div>
  `;

  var opt = {
    margin: 0.35,
    filename: `Acoustic_Design_HCMM_Report_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(container).save();
}

var exportAcousticPDF = exportAcousticReportToPDF;

let acousticChartInstance = null;

function renderAcousticChart(rtOctaves, targetMin, targetMax) {
  var canvas = document.getElementById('acousticRt60Chart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var targetLine = [];
  var targetMinLine = [];
  var targetMaxLine = [];
  for (var i = 0; i < 6; i++) {
    targetMinLine.push(targetMin);
    targetMaxLine.push(targetMax);
  }

  if (acousticChartInstance) {
    acousticChartInstance.destroy();
  }

  var lblBand = document.getElementById('lblChartTargetBand');
  if (lblBand) lblBand.innerText = `Target: ${targetMin.toFixed(2)} - ${targetMax.toFixed(2)} s`;

  acousticChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['125 Hz', '250 Hz', '500 Hz', '1 kHz', '2 kHz', '4 kHz'],
      datasets: [
        {
          label: 'Calculated RT60 (s)',
          data: rtOctaves.map(v => parseFloat(v.toFixed(2))),
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          pointBackgroundColor: '#38bdf8',
          pointBorderColor: '#ffffff',
          pointRadius: 5
        },
        {
          label: 'Target Upper Limit',
          data: targetMaxLine,
          borderColor: '#f59e0b',
          borderDash: [5, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Target Lower Limit',
          data: targetMinLine,
          borderColor: '#10b981',
          borderDash: [5, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#1e293b' },
          ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono' } }
        },
        x: {
          grid: { color: '#1e293b' },
          ticks: { color: '#cbd5e1', font: { family: 'Inter', weight: 'bold' } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#cbd5e1', font: { family: 'Inter', size: 11, weight: 'bold' } }
        }
      }
    }
  });
}

// Tab 6 Interactive 3D Architectural Acoustic Room Cutaway State
var acousticCutawayOrbitAngle = 40;
var acousticCutawayLayers = {
  wallPanels: true,
  ceilingClouds: true,
  carpet: true,
  directRay: true,
  earlyReflections: true,
  reverbWave: true
};

function toggleAcousticLayer(layer) {
  if (acousticCutawayLayers[layer] !== undefined) {
    acousticCutawayLayers[layer] = !acousticCutawayLayers[layer];
  }
  calcAcousticsFull();
}

function onAcousticOrbitChange(val) {
  acousticCutawayOrbitAngle = parseFloat(val) || 40;
  var disp = document.getElementById('acOrbitVal');
  if (disp) disp.innerText = acousticCutawayOrbitAngle + '°';
  calcAcousticsFull();
}

function renderAcousticsISO3ViewSvg(wallPct, ceilPct, L, W, H, RT60) {
  var container = document.getElementById('acousticReflectionSvgContainer');
  if (!container) return;

  var svgW = 860, svgH = 430;
  var angleRad = (acousticCutawayOrbitAngle * Math.PI) / 180.0;
  var cosA = Math.cos(angleRad);
  var sinA = Math.sin(angleRad);
  var originX = 430;
  var originY = 320;
  var scale = 44.0 * (8.0 / Math.max(L, 5.0));

  function project(x, y, z) {
    var isoX = (x * cosA - y * sinA) * scale;
    var isoY = (x * sinA * 0.46 + y * cosA * 0.46 - z * 0.88) * scale;
    return {
      x: originX - (L * 0.45 * scale * cosA) + isoX,
      y: originY + isoY
    };
  }

  // Room vertices (Architectural cutaway: front and right walls removed to reveal interior)
  var f00 = project(0, -W/2, 0);       // Front-left floor
  var fL0 = project(L, -W/2, 0);       // Back-left floor
  var fLW = project(L, W/2, 0);        // Back-right floor
  var f0W = project(0, W/2, 0);        // Front-right floor (cut plane)

  var c00 = project(0, -W/2, H);       // Front-left ceiling
  var cL0 = project(L, -W/2, H);       // Back-left ceiling
  var cLW = project(L, W/2, H);        // Back-right ceiling
  var c0W = project(0, W/2, H);        // Front-right ceiling

  // Sound source (Loudspeaker at front left stage: x = 0.8, y = -W*0.3, z = 1.6)
  var pSpk = project(0.8, -W*0.3, 1.6);
  // Seated listener at optimal acoustic mixing position: x = L*0.65, y = 0, ear = 1.2m
  var pListenerFloor = project(L*0.65, 0, 0);
  var pListenerEar = project(L*0.65, 0, 1.2);
  var pListenerHead = project(L*0.65, 0, 1.35);

  // Reflection bounce points on rear wall (x = L) and left wall (y = -W/2)
  var pBounceRear = project(L, -W*0.1, 1.9);
  var pBounceWall = project(L*0.35, -W/2, 1.7);
  var pBounceCeil = project(L*0.4, 0, H);

  container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:10px;">
    <defs>
      <linearGradient id="acFloorCarpetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#0f172a" stop-opacity="1"/>
      </linearGradient>
      <linearGradient id="acBackWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#090d16" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="acLeftWallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#141c2e" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#1e293b" stop-opacity="0.75"/>
      </linearGradient>
      <linearGradient id="acSoundRayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
      <linearGradient id="acEarlyReflGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#ef4444"/>
      </linearGradient>
      <radialGradient id="acReverbWaveGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.4"/>
        <stop offset="70%" stop-color="#6366f1" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
      </radialGradient>
      <pattern id="acDiffuserPattern" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="6" height="12" fill="#d97706"/>
        <rect x="6" width="6" height="12" fill="#b45309"/>
      </pattern>
    </defs>

    <!-- 1. Architectural Cutaway Floor & Carpet Treatment -->
    <polygon points="${f00.x},${f00.y} ${fL0.x},${fL0.y} ${fLW.x},${fLW.y} ${f0W.x},${f0W.y}" 
      fill="${acousticCutawayLayers.carpet ? 'url(#acFloorCarpetGrad)' : '#0a0f1d'}" 
      stroke="#38bdf8" stroke-width="1.8"/>
    
    <!-- Floor Acoustic Grid (1m Stations) -->
    ${(function(){
      var g = '';
      for (var x = 1; x < L; x += 1.0) {
        var p1 = project(x, -W/2, 0);
        var p2 = project(x, W/2, 0);
        g += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#1e293b" stroke-width="1"/>`;
      }
      return g;
    })()}

    <!-- 2. Solid Architectural Boundary Walls (Left Wall & Back Wall) -->
    <!-- Left Boundary Wall -->
    <polygon points="${f00.x},${f00.y} ${c00.x},${c00.y} ${cL0.x},${cL0.y} ${fL0.x},${fL0.y}" 
      fill="url(#acLeftWallGrad)" stroke="#334155" stroke-width="1.5"/>
    <!-- Back Boundary Wall -->
    <polygon points="${fL0.x},${fL0.y} ${cL0.x},${cL0.y} ${cLW.x},${cLW.y} ${fLW.x},${fLW.y}" 
      fill="url(#acBackWallGrad)" stroke="#334155" stroke-width="1.5"/>

    <!-- Cutaway Architectural Section Edge Indicator (Yellow Dashed Line showing Section Cut) -->
    <line x1="${f00.x}" y1="${f00.y}" x2="${f0W.x}" y2="${f0W.y}" stroke="#facc15" stroke-width="2.5" stroke-dasharray="6,4"/>
    <line x1="${f0W.x}" y1="${f0W.y}" x2="${fLW.x}" y2="${fLW.y}" stroke="#facc15" stroke-width="2.5" stroke-dasharray="6,4"/>
    <text x="${f0W.x + 10}" y="${f0W.y + 4}" font-size="9" font-family="JetBrains Mono" font-weight="bold" fill="#facc15">ARCHITECTURAL CUTAWAY PLANE</text>

    <!-- 3. Wall Acoustic Absorber Panels & QRD Diffusers -->
    ${acousticCutawayLayers.wallPanels ? `
      <!-- Left Wall Fabric Absorbers (Multiple Panels along Length) -->
      ${(function(){
        var pSvg = '';
        var numPanels = Math.max(2, Math.floor(L / 2.0));
        for (var i = 0; i < numPanels; i++) {
          var px1 = 1.0 + i * (L / (numPanels + 0.3));
          var px2 = px1 + 1.2;
          if (px2 < L - 0.5) {
            var panBL = project(px1, -W/2 + 0.05, 0.8);
            var panBR = project(px2, -W/2 + 0.05, 0.8);
            var panTR = project(px2, -W/2 + 0.05, 2.2);
            var panTL = project(px1, -W/2 + 0.05, 2.2);
            pSvg += `
              <polygon points="${panBL.x},${panBL.y} ${panBR.x},${panBR.y} ${panTR.x},${panTR.y} ${panTL.x},${panTL.y}"
                fill="rgba(56,189,248,0.35)" stroke="#38bdf8" stroke-width="1.8"/>
              <text x="${(panBL.x+panTR.x)/2}" y="${(panBL.y+panTR.y)/2+3}" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="#bae6fd" text-anchor="middle">ABSORBER α=${(0.75).toFixed(2)}</text>
            `;
          }
        }
        return pSvg;
      })()}

      <!-- Rear Wall QRD Acoustic Diffusers -->
      ${(function(){
        var qrdBL = project(L - 0.05, -W*0.3, 0.9);
        var qrdBR = project(L - 0.05, W*0.3, 0.9);
        var qrdTR = project(L - 0.05, W*0.3, 2.1);
        var qrdTL = project(L - 0.05, -W*0.3, 2.1);
        return `
          <polygon points="${qrdBL.x},${qrdBL.y} ${qrdBR.x},${qrdBR.y} ${qrdTR.x},${qrdTR.y} ${qrdTL.x},${qrdTL.y}"
            fill="url(#acDiffuserPattern)" stroke="#f59e0b" stroke-width="2"/>
          <text x="${(qrdBL.x+qrdTR.x)/2}" y="${(qrdBL.y+qrdTR.y)/2-4}" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#fef08a" text-anchor="middle">QRD DIFFUSER ARRAY</text>
          <text x="${(qrdBL.x+qrdTR.x)/2}" y="${(qrdBL.y+qrdTR.y)/2+8}" font-size="7.5" font-family="JetBrains Mono" fill="#ffffff" text-anchor="middle">Scatter / Diffusion (${wallPct}% Wall Trt)</text>
        `;
      })()}
    ` : ''}

    <!-- 4. Suspended Acoustic Ceiling Clouds -->
    ${acousticCutawayLayers.ceilingClouds ? `
      ${(function(){
        var cSvg = '';
        var numClouds = Math.max(2, Math.floor(L / 2.5));
        for (var c = 0; c < numClouds; c++) {
          var cx1 = 1.2 + c * 2.2;
          var cx2 = cx1 + 1.6;
          var cy1 = -W*0.35;
          var cy2 = W*0.25;
          var cz = H - 0.35; // Dropped 350mm from soffit

          var cBL = project(cx1, cy1, cz);
          var cBR = project(cx2, cy1, cz);
          var cTR = project(cx2, cy2, cz);
          var cTL = project(cx1, cy2, cz);

          // Suspension wires
          var hang1 = project(cx1, cy1, H);
          var hang2 = project(cx2, cy2, H);

          cSvg += `
            <line x1="${cBL.x}" y1="${cBL.y}" x2="${hang1.x}" y2="${hang1.y}" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,2"/>
            <line x1="${cTR.x}" y1="${cTR.y}" x2="${hang2.x}" y2="${hang2.y}" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,2"/>
            <polygon points="${cBL.x},${cBL.y} ${cBR.x},${cBR.y} ${cTR.x},${cTR.y} ${cTL.x},${cTL.y}"
              fill="rgba(56,189,248,0.22)" stroke="#38bdf8" stroke-width="1.6" rx="4"/>
            <text x="${(cBL.x+cTR.x)/2}" y="${(cBL.y+cTR.y)/2+3}" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="#38bdf8" text-anchor="middle">SUSPENDED CLOUD α=0.85</text>
          `;
        }
        return cSvg;
      })()}
    ` : ''}

    <!-- 5. Sound Source (Loudspeaker Monitor / Presenter) -->
    <g class="sound-source-node">
      <!-- Loudspeaker stand & cabinet -->
      <line x1="${project(0.8, -W*0.3, 0).x}" y1="${project(0.8, -W*0.3, 0).y}" x2="${pSpk.x}" y2="${pSpk.y}" stroke="#475569" stroke-width="3"/>
      <rect x="${pSpk.x-10}" y="${pSpk.y-16}" width="20" height="28" fill="#1e293b" stroke="#38bdf8" stroke-width="2" rx="3"/>
      <circle cx="${pSpk.x}" cy="${pSpk.y-6}" r="5" fill="#0284c7" stroke="#ffffff"/>
      <circle cx="${pSpk.x}" cy="${pSpk.y+5}" r="3" fill="#38bdf8"/>
      <text x="${pSpk.x}" y="${pSpk.y-20}" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="#38bdf8" text-anchor="middle">SOURCE (85 dBA)</text>
    </g>

    <!-- 6. Seated Listener Position & Ear-Level Reference (1200mm AFF) -->
    <g class="listener-node">
      <line x1="${pListenerFloor.x}" y1="${pListenerFloor.y}" x2="${pListenerEar.x}" y2="${pListenerEar.y}" stroke="#0284c7" stroke-width="2.5"/>
      <circle cx="${pListenerEar.x}" cy="${pListenerEar.y}" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="${pListenerHead.x}" cy="${pListenerHead.y}" r="8" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
      <!-- Seated chair -->
      <rect x="${pListenerFloor.x-10}" y="${pListenerFloor.y-18}" width="20" height="12" fill="#334155" rx="2"/>
      <text x="${pListenerEar.x}" y="${pListenerHead.y-12}" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#ffffff" text-anchor="middle">LISTENER EAR (1.2m)</text>
    </g>

    <!-- 7. Direct Sound Path Ray (Blue Solid Vector) -->
    ${acousticCutawayLayers.directRay ? `
      <line x1="${pSpk.x}" y1="${pSpk.y}" x2="${pListenerEar.x}" y2="${pListenerEar.y}" stroke="url(#acSoundRayGrad)" stroke-width="3"/>
      <polygon points="${(pSpk.x+pListenerEar.x)/2},${(pSpk.y+pListenerEar.y)/2 - 5} ${(pSpk.x+pListenerEar.x)/2 + 8},${(pSpk.y+pListenerEar.y)/2} ${(pSpk.x+pListenerEar.x)/2},${(pSpk.y+pListenerEar.y)/2 + 5}" fill="#38bdf8"/>
      <rect x="${(pSpk.x+pListenerEar.x)/2 - 60}" y="${(pSpk.y+pListenerEar.y)/2 - 20}" width="120" height="15" fill="#090d16" stroke="#0284c7" rx="3"/>
      <text x="${(pSpk.x+pListenerEar.x)/2}" y="${(pSpk.y+pListenerEar.y)/2 - 9}" font-size="8" font-family="JetBrains Mono" font-weight="bold" fill="#38bdf8" text-anchor="middle">DIRECT SOUND (0 ms)</text>
    ` : ''}

    <!-- 8. Early Reflection Rays (Wall & Ceiling Bounces, Amber/Orange Vectors) -->
    ${acousticCutawayLayers.earlyReflections ? `
      <!-- Wall Reflection Ray -->
      <line x1="${pSpk.x}" y1="${pSpk.y}" x2="${pBounceWall.x}" y2="${pBounceWall.y}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,2"/>
      <circle cx="${pBounceWall.x}" cy="${pBounceWall.y}" r="4.5" fill="#f59e0b" stroke="#ffffff"/>
      <line x1="${pBounceWall.x}" y1="${pBounceWall.y}" x2="${pListenerEar.x}" y2="${pListenerEar.y}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,2"/>
      
      <!-- Ceiling Cloud Reflection Ray (Absorbed/Attenuated) -->
      <line x1="${pSpk.x}" y1="${pSpk.y}" x2="${pBounceCeil.x}" y2="${pBounceCeil.y}" stroke="#10b981" stroke-width="2" stroke-dasharray="3,3"/>
      <circle cx="${pBounceCeil.x}" cy="${pBounceCeil.y}" r="4" fill="#10b981"/>
      <line x1="${pBounceCeil.x}" y1="${pBounceCeil.y}" x2="${pListenerEar.x}" y2="${pListenerEar.y}" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6"/>
      
      <!-- Rear Diffuser Reflection Ray -->
      <line x1="${pSpk.x}" y1="${pSpk.y}" x2="${pBounceRear.x}" y2="${pBounceRear.y}" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4,2"/>
      <circle cx="${pBounceRear.x}" cy="${pBounceRear.y}" r="4" fill="#ef4444"/>
      <line x1="${pBounceRear.x}" y1="${pBounceRear.y}" x2="${pListenerEar.x}" y2="${pListenerEar.y}" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4,2"/>
    ` : ''}

    <!-- 9. Late Reverberation Decay Wavefronts (Purple Radial Field) -->
    ${acousticCutawayLayers.reverbWave ? `
      <ellipse cx="${(f00.x+fLW.x)/2}" cy="${(f00.y+fLW.y)/2}" rx="${scale*3.5}" ry="${scale*1.8}" fill="url(#acReverbWaveGrad)" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="5,3"/>
      <text x="${(f00.x+fLW.x)/2}" y="${(f00.y+fLW.y)/2 - 15}" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#d8b4fe" text-anchor="middle">DIFFUSE REVERBERANT FIELD (RT60: ${RT60.toFixed(2)}s)</text>
    ` : ''}

    <!-- Dimension & Diagnostic Header Tag -->
    <rect x="20" y="20" width="370" height="52" fill="#0f172a" stroke="#334155" stroke-width="1.5" rx="6"/>
    <text x="32" y="38" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8">3D ARCHITECTURAL ACOUSTIC CUTAWAY</text>
    <text x="32" y="56" font-size="9" font-family="JetBrains Mono" fill="#94a3b8">Volume: ${(L*W*H).toFixed(1)} m³ | Boundary: ${(2*(L*H)+2*(W*H)+2*(L*W)).toFixed(1)} m² | Sabine RT60: ${RT60.toFixed(2)}s</text>
  </svg>`;
}

// ==========================================
// INTERACTIVE D3.JS SPEAKER COVERAGE OVERLAP (%) CHART
// ==========================================
var activeD3EarDatum = 1.2; // 1.2m seated ear plane standard

var d3SpeakerDrivers = [
  { id: '2.5', label: '2.5" Micro-Driver', angleDeg: 150, color: '#06b6d4' },
  { id: '4.0', label: '4.0" Compact Driver', angleDeg: 130, color: '#3b82f6' },
  { id: '6.5', label: '6.5" Standard Driver', angleDeg: 100, color: '#a855f7' },
  { id: '8.0', label: '8.0" High-SPL Driver', angleDeg: 90, color: '#f59e0b' }
];

function setD3EarDatum(datum) {
  activeD3EarDatum = parseFloat(datum) || 1.2;
  var btnS = document.getElementById('btnEarDatumSeated');
  var btnSt = document.getElementById('btnEarDatumStanding');
  if (btnS && btnSt) {
    btnS.classList.toggle('active', activeD3EarDatum === 1.2);
    btnS.classList.toggle('btn-primary', activeD3EarDatum === 1.2);
    btnS.classList.toggle('btn-outline-secondary', activeD3EarDatum !== 1.2);

    btnSt.classList.toggle('active', activeD3EarDatum === 1.5);
    btnSt.classList.toggle('btn-primary', activeD3EarDatum === 1.5);
    btnSt.classList.toggle('btn-outline-secondary', activeD3EarDatum !== 1.5);
  }
  renderD3SpeakerOverlapChart();
}

function updateD3SpeakerOverlapChart(val) {
  var badge = document.getElementById('spkOverlapSpacingBadge');
  if (badge) badge.textContent = parseFloat(val).toFixed(1) + ' m';
  renderD3SpeakerOverlapChart();
}

function renderD3SpeakerOverlapChart() {
  if (typeof d3 === 'undefined') return;
  var container = document.getElementById('d3SpeakerOverlapSvg');
  if (!container) return;

  var currentH_mm = parseFloat(document.getElementById('acHeight')?.value) || 2800;
  if (currentH_mm < 100) currentH_mm = currentH_mm * 1000;
  var activeH = currentH_mm / 1000.0; // Current room ceiling height in meters

  var slider = document.getElementById('spkOverlapSpacingSlider');
  var S = slider ? parseFloat(slider.value) : 2.8; // Grid spacing in meters

  var badge = document.getElementById('spkOverlapSpacingBadge');
  if (badge) badge.textContent = S.toFixed(1) + ' m';

  var earH = activeD3EarDatum || 1.2;

  // Clear previous SVG
  d3.select('#d3SpeakerOverlapSvg').selectAll('*').remove();

  var width = container.clientWidth || 740;
  var height = 270;
  var margin = { top: 22, right: 30, bottom: 35, left: 55 };

  var svg = d3.select('#d3SpeakerOverlapSvg')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('font-family', "'JetBrains Mono', monospace")
    .style('font-size', '11px');

  var minH = 2.4;
  var maxH = 4.5;
  var minOverlap = -30;
  var maxOverlap = 80;

  var xScale = d3.scaleLinear()
    .domain([minH, maxH])
    .range([margin.left, width - margin.right]);

  var yScale = d3.scaleLinear()
    .domain([minOverlap, maxOverlap])
    .range([height - margin.bottom, margin.top]);

  // Shaded AVIXA Acoustic Coverage Bands
  // 1. Heavy Overlap (>= 50%)
  svg.append('rect')
    .attr('x', margin.left)
    .attr('y', yScale(80))
    .attr('width', width - margin.left - margin.right)
    .attr('height', yScale(50) - yScale(80))
    .attr('fill', '#1e3a8a')
    .attr('opacity', 0.22);

  // 2. Minimum Overlap (Optimal AVIXA Class 2: 25% - 50%)
  svg.append('rect')
    .attr('x', margin.left)
    .attr('y', yScale(50))
    .attr('width', width - margin.left - margin.right)
    .attr('height', yScale(25) - yScale(50))
    .attr('fill', '#065f46')
    .attr('opacity', 0.32);

  // 3. Edge-to-Edge (Class 1: 0% - 25%)
  svg.append('rect')
    .attr('x', margin.left)
    .attr('y', yScale(25))
    .attr('width', width - margin.left - margin.right)
    .attr('height', yScale(0) - yScale(25))
    .attr('fill', '#78350f')
    .attr('opacity', 0.25);

  // 4. Dead Zones (< 0%)
  svg.append('rect')
    .attr('x', margin.left)
    .attr('y', yScale(0))
    .attr('width', width - margin.left - margin.right)
    .attr('height', yScale(-30) - yScale(0))
    .attr('fill', '#7f1d1d')
    .attr('opacity', 0.30);

  // Reference Band Labels
  svg.append('text')
    .attr('x', width - margin.right - 8)
    .attr('y', yScale(62))
    .attr('text-anchor', 'end')
    .attr('fill', '#60a5fa')
    .attr('font-size', '8.5px')
    .attr('opacity', 0.75)
    .text('AVIXA Heavy Overlap (≥50%)');

  svg.append('text')
    .attr('x', width - margin.right - 8)
    .attr('y', yScale(37))
    .attr('text-anchor', 'end')
    .attr('fill', '#34d399')
    .attr('font-size', '8.5px')
    .attr('font-weight', 'bold')
    .attr('opacity', 0.9)
    .text('AVIXA Class 2 Minimum Overlap (25%–50%) ★ OPTIMAL');

  svg.append('text')
    .attr('x', width - margin.right - 8)
    .attr('y', yScale(12))
    .attr('text-anchor', 'end')
    .attr('fill', '#fbbf24')
    .attr('font-size', '8.5px')
    .attr('opacity', 0.75)
    .text('AVIXA Class 1 Edge-to-Edge (0%–25%)');

  svg.append('text')
    .attr('x', width - margin.right - 8)
    .attr('y', yScale(-15))
    .attr('text-anchor', 'end')
    .attr('fill', '#f87171')
    .attr('font-size', '8.5px')
    .attr('opacity', 0.8)
    .text('Acoustic Dead Zones / Dropouts (<0%)');

  // Grid Lines
  var yTicks = [-20, 0, 25, 50, 75];
  yTicks.forEach(function(tickVal) {
    svg.append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', yScale(tickVal))
      .attr('y2', yScale(tickVal))
      .attr('stroke', tickVal === 0 ? '#ef4444' : '#334155')
      .attr('stroke-width', tickVal === 0 ? 1.5 : 0.8)
      .attr('stroke-dasharray', tickVal === 0 ? '' : '3,3')
      .attr('opacity', 0.6);
  });

  var xTicks = [2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.2, 4.5];
  xTicks.forEach(function(tickVal) {
    svg.append('line')
      .attr('x1', xScale(tickVal))
      .attr('x2', xScale(tickVal))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#334155')
      .attr('stroke-width', 0.8)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.4);
  });

  // Calculate Curve Data Points for Each Driver
  var stepCount = 45;
  var stepH = (maxH - minH) / stepCount;

  var lineGen = d3.line()
    .x(function(d) { return xScale(d.h); })
    .y(function(d) { return yScale(d.overlap); })
    .curve(d3.curveMonotoneX);

  var driverCurvesData = d3SpeakerDrivers.map(function(drv) {
    var thetaRad = (drv.angleDeg * Math.PI) / 180.0;
    var tanHalf = Math.tan(thetaRad / 2.0);
    var points = [];

    for (var i = 0; i <= stepCount; i++) {
      var h = minH + i * stepH;
      var hc = Math.max(0.5, h - earH);
      var D = 2.0 * hc * tanHalf;
      var overlap = ((D - S) / D) * 100.0;
      points.push({ h: h, D: D, overlap: Math.max(minOverlap - 5, Math.min(maxOverlap + 5, overlap)) });
    }

    // Active room height calculations
    var curHc = Math.max(0.5, activeH - earH);
    var curD = 2.0 * curHc * tanHalf;
    var curOverlap = ((curD - S) / curD) * 100.0;

    return {
      drv: drv,
      points: points,
      curD: curD,
      curOverlap: curOverlap
    };
  });

  // Render Curves
  driverCurvesData.forEach(function(item) {
    svg.append('path')
      .datum(item.points)
      .attr('fill', 'none')
      .attr('stroke', item.drv.color)
      .attr('stroke-width', 2.5)
      .attr('d', lineGen);
  });

  // Vertical Indicator for Current Room Height
  var clampedH = Math.max(minH, Math.min(maxH, activeH));
  var curX = xScale(clampedH);

  svg.append('line')
    .attr('x1', curX)
    .attr('x2', curX)
    .attr('y1', margin.top - 5)
    .attr('y2', height - margin.bottom)
    .attr('stroke', '#38bdf8')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4,2');

  // Header Marker for Active Height
  svg.append('g')
    .attr('transform', `translate(${curX}, ${margin.top})`)
    .call(function(g) {
      g.append('rect')
        .attr('x', -48)
        .attr('y', -16)
        .attr('width', 96)
        .attr('height', 16)
        .attr('fill', '#0284c7')
        .attr('rx', 3);
      g.append('text')
        .attr('x', 0)
        .attr('y', -4)
        .attr('fill', '#ffffff')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(`Room H: ${activeH.toFixed(2)}m`);
    });

  // Dots at Active Intersection Points
  driverCurvesData.forEach(function(item) {
    svg.append('circle')
      .attr('cx', curX)
      .attr('cy', yScale(Math.max(minOverlap, Math.min(maxOverlap, item.curOverlap))))
      .attr('r', 5)
      .attr('fill', item.drv.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.8);
  });

  // X & Y Axes
  var xAxis = d3.axisBottom(xScale)
    .ticks(8)
    .tickFormat(function(d) { return d.toFixed(1) + 'm'; });

  var yAxis = d3.axisLeft(yScale)
    .ticks(6)
    .tickFormat(function(d) { return d + '%'; });

  svg.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(xAxis)
    .call(function(g) {
      g.select('.domain').attr('stroke', '#64748b');
      g.selectAll('.tick line').attr('stroke', '#64748b');
      g.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '10px');
    });

  svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis)
    .call(function(g) {
      g.select('.domain').attr('stroke', '#64748b');
      g.selectAll('.tick line').attr('stroke', '#64748b');
      g.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '10px');
    });

  // Axis Titles
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 4)
    .attr('text-anchor', 'middle')
    .attr('fill', '#cbd5e1')
    .attr('font-size', '9.5px')
    .attr('font-weight', 'bold')
    .text('Finished Ceiling Height H (m) • Ear Plane Datum: ' + earH.toFixed(1) + 'm AFFL');

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(height / 2))
    .attr('y', 14)
    .attr('text-anchor', 'middle')
    .attr('fill', '#cbd5e1')
    .attr('font-size', '9.5px')
    .attr('font-weight', 'bold')
    .text('Coverage Overlap %');

  // Interactive Hover Overlay & Crosshair
  var hoverLine = svg.append('line')
    .attr('y1', margin.top)
    .attr('y2', height - margin.bottom)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '2,2')
    .style('display', 'none');

  var tooltip = d3.select('#d3OverlapTooltip');

  svg.append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top)
    .attr('width', width - margin.left - margin.right)
    .attr('height', height - margin.bottom - margin.top)
    .attr('fill', 'transparent')
    .style('cursor', 'crosshair')
    .on('mousemove', function(event) {
      var pointer = d3.pointer(event, this);
      var hoveredH = xScale.invert(pointer[0]);
      hoverLine.style('display', null).attr('x1', pointer[0]).attr('x2', pointer[0]);

      var hc = Math.max(0.5, hoveredH - earH);
      var tooltipHtml = `<div style="font-weight:bold; color:#38bdf8; margin-bottom:4px; border-bottom:1px solid #334155; padding-bottom:2px;">Ceiling H: ${hoveredH.toFixed(2)}m (Headroom: ${hc.toFixed(2)}m)</div>`;
      
      d3SpeakerDrivers.forEach(function(drv) {
        var thetaRad = (drv.angleDeg * Math.PI) / 180.0;
        var D = 2.0 * hc * Math.tan(thetaRad / 2.0);
        var ov = ((D - S) / D) * 100.0;
        var ovColor = ov >= 50 ? '#60a5fa' : (ov >= 25 ? '#34d399' : (ov >= 0 ? '#fbbf24' : '#f87171'));
        var ovClass = ov >= 50 ? 'Heavy Overlap' : (ov >= 25 ? 'Class 2 Optimal' : (ov >= 0 ? 'Edge-to-Edge' : 'Dead Zone'));
        tooltipHtml += `<div style="display:flex; justify-content:space-between; gap:12px; font-size:10px; margin:2px 0;">
          <span style="color:${drv.color}; font-weight:bold;">${drv.label} (${drv.angleDeg}°):</span>
          <span>D = ${D.toFixed(1)}m | <strong style="color:${ovColor}">${ov.toFixed(1)}%</strong> <span style="font-size:9px; color:#94a3b8;">(${ovClass})</span></span>
        </div>`;
      });
      tooltipHtml += `<div style="font-size:8.5px; color:#94a3b8; margin-top:4px; border-top:1px solid #334155; padding-top:2px;">Click to set Ceiling Height = ${hoveredH.toFixed(2)}m</div>`;

      tooltip.html(tooltipHtml)
        .style('display', 'block')
        .style('left', (pointer[0] + 70 > width - 160 ? pointer[0] - 220 : pointer[0] + 15) + 'px')
        .style('top', (pointer[1] - 40) + 'px');
    })
    .on('mouseleave', function() {
      hoverLine.style('display', 'none');
      tooltip.style('display', 'none');
    })
    .on('click', function(event) {
      var pointer = d3.pointer(event, this);
      var clickedH = xScale.invert(pointer[0]);
      var acHInp = document.getElementById('acHeight');
      if (acHInp) {
        acHInp.value = Math.round(clickedH * 1000);
        calcAcousticsFull();
      }
    });

  // Multi-Driver Live Readout Cards Underneath
  var cardContainer = document.getElementById('d3OverlapDriverCards');
  if (cardContainer) {
    var cardsHtml = driverCurvesData.map(function(item) {
      var ov = item.curOverlap;
      var statusBadge = '';
      if (ov >= 50) {
        statusBadge = `<span class="badge bg-primary text-white font-mono" style="font-size:0.68rem;">Heavy Overlap (${ov.toFixed(1)}%)</span>`;
      } else if (ov >= 25) {
        statusBadge = `<span class="badge bg-success text-white font-mono" style="font-size:0.68rem;">★ Class 2 Optimal (${ov.toFixed(1)}%)</span>`;
      } else if (ov >= 0) {
        statusBadge = `<span class="badge bg-warning text-dark font-mono" style="font-size:0.68rem;">Class 1 Edge (${ov.toFixed(1)}%)</span>`;
      } else {
        statusBadge = `<span class="badge bg-danger text-white font-mono" style="font-size:0.68rem;">⚠️ Dead Zone (${ov.toFixed(1)}%)</span>`;
      }

      return `
        <div class="col-xl-3 col-md-6 col-12">
          <div class="p-2.5 rounded border border-slate-800 bg-slate-950 font-mono" style="border-left: 3px solid ${item.drv.color} !important;">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="fw-bold" style="color:${item.drv.color}; font-size:0.75rem;">${item.drv.label} (${item.drv.angleDeg}°)</span>
              ${statusBadge}
            </div>
            <div class="small text-slate-300" style="font-size:0.72rem;">
              Coverage Diam D: <strong class="text-white">${item.curD.toFixed(2)} m</strong> (at H=${activeH.toFixed(2)}m)
            </div>
            <div class="small text-slate-400 mt-1" style="font-size:0.68rem; line-height:1.2;">
              ${item.drv.angleDeg >= 130 
                ? 'Wide dispersion creates immense floor coverage; ideal for low ceilings (≤3.0m) to minimize speaker count.' 
                : 'Narrow dispersion preserves vertical speech clarity; requires denser grid or higher ceiling to prevent dead zones.'}
            </div>
          </div>
        </div>
      `;
    }).join('');

    cardContainer.innerHTML = cardsHtml;
  }
}

window.renderD3SpeakerOverlapChart = renderD3SpeakerOverlapChart;
window.updateD3SpeakerOverlapChart = updateD3SpeakerOverlapChart;
window.setD3EarDatum = setD3EarDatum;

// ==========================================
// TAB 7: AV DESIGNS & ANGLES
// ==========================================
function toggleCustomDisplaySize() {
  var val = document.getElementById('stdDiagSelect')?.value;
  var customBox = document.getElementById('boxCustomStdDiag');
  if (customBox) customBox.style.display = (val === 'custom') ? 'block' : 'none';
  calcStdSize();
}

function calcStdSize() {
  var selectVal = document.getElementById('stdDiagSelect')?.value || '85';
  var diag = 85;
  if (selectVal === 'custom') { diag = parseFloat(document.getElementById('customStdDiagVal')?.value) || 85; }
  else { diag = parseFloat(selectVal) || 85; }

  var distRaw = parseFloat(document.getElementById('stdDistInput')?.value) || 4000;
  var dist = distRaw > 50 ? distRaw / 1000.0 : distRaw;
  var affMM = parseFloat(document.getElementById('stdAffInput')?.value) || 950;
  
  var diagM = diag * 0.0254;
  var H = diagM / Math.sqrt(1.777 * 1.777 + 1);
  var W = H * 1.777;

  var topAffM = (affMM / 1000.0) + H;
  var centerAffM = (affMM / 1000.0) + (H / 2.0);
  var vertTiltAngle = Math.atan((topAffM - 1.2) / dist) * (180 / Math.PI);

  var elDims = document.getElementById('resStdDims');
  if (elDims) elDims.innerText = `${Math.round(W*1000)} × ${Math.round(H*1000)} mm`;
  var elDimsFt = document.getElementById('resStdDimsFt');
  if (elDimsFt) elDimsFt.innerText = `${(W * 3.28084).toFixed(2)} × ${(H * 3.28084).toFixed(2)} ft`;

  var elClose = document.getElementById('resStdClosest');
  if (elClose) elClose.innerText = `${W.toFixed(2)} m (${Math.round(W*1000)} mm)`;
  var elFur = document.getElementById('resStdFurthest');
  if (elFur) elFur.innerText = `${(H*6).toFixed(2)} m (${Math.round(H*6000)} mm)`;
  var elVert = document.getElementById('resVertAngle');
  if (elVert) elVert.innerText = vertTiltAngle.toFixed(1) + '°';

  // Enhanced DISCAS Viewing Bounds & Elevations
  var el4x = document.getElementById('resStd4xH');
  if (el4x) el4x.innerText = `${(H*4).toFixed(2)} m (${(H*4*3.28084).toFixed(1)} ft)`;
  var el5x = document.getElementById('resStd5xH');
  if (el5x) el5x.innerText = `${(H*5).toFixed(2)} m (${(H*5*3.28084).toFixed(1)} ft)`;
  var el6x = document.getElementById('resStd6xH');
  if (el6x) el6x.innerText = `${(H*6).toFixed(2)} m (${(H*6*3.28084).toFixed(1)} ft)`;
  var el8x = document.getElementById('resStd8xH');
  if (el8x) el8x.innerText = `${(H*8).toFixed(2)} m (${(H*8*3.28084).toFixed(1)} ft)`;

  var elTopAff = document.getElementById('resStdTopAff');
  if (elTopAff) elTopAff.innerText = `${Math.round(topAffM * 1000)} mm (${topAffM.toFixed(2)} m / ${(topAffM*3.28084).toFixed(1)} ft)`;
  var elCenterAff = document.getElementById('resStdCenterAff');
  if (elCenterAff) elCenterAff.innerText = `${Math.round(centerAffM * 1000)} mm (${centerAffM.toFixed(2)} m / ${(centerAffM*3.28084).toFixed(1)} ft)`;

  // Ergonomic Status Badges
  var badgeErgo = document.getElementById('badgeStdErgoStatus');
  var angleStatus = document.getElementById('resVertAngleStatus');
  if (vertTiltAngle <= 15) {
    if (badgeErgo) {
      badgeErgo.className = 'badge bg-success font-mono';
      badgeErgo.innerText = `Ergonomic Optimal (${vertTiltAngle.toFixed(1)}° ≤ 15°)`;
    }
    if (angleStatus) {
      angleStatus.className = 'small text-success fw-bold';
      angleStatus.innerText = 'Optimal (≤ 15°)';
    }
  } else if (vertTiltAngle <= 30) {
    if (badgeErgo) {
      badgeErgo.className = 'badge bg-warning text-dark font-mono';
      badgeErgo.innerText = `DISCAS Acceptable (${vertTiltAngle.toFixed(1)}° ≤ 30°)`;
    }
    if (angleStatus) {
      angleStatus.className = 'small text-warning fw-bold';
      angleStatus.innerText = 'Acceptable (15–30°)';
    }
  } else {
    if (badgeErgo) {
      badgeErgo.className = 'badge bg-danger font-mono';
      badgeErgo.innerText = `Neck Fatigue Alert (${vertTiltAngle.toFixed(1)}° > 30°)`;
    }
    if (angleStatus) {
      angleStatus.className = 'small text-danger fw-bold';
      angleStatus.innerText = 'Strain Risk (> 30°)';
    }
  }

  renderAnglesSvg(vertTiltAngle, W, H, affMM / 1000.0, dist);
}

function renderAnglesSvg(vertDeg, screenW, screenH, affM, currentRoomDist) {
  var container = document.getElementById('anglesSvgContainer');
  if (!container) return;

  screenW = screenW || 1.88;
  screenH = screenH || 1.06;
  affM = affM || 0.95;
  currentRoomDist = currentRoomDist || 4.0;

  var svgW = 760, svgH = 340;
  var floorY = 280;
  var ceilY = 40;
  var screenX = 100;
  var screenTopY = floorY - (affM + screenH) * 60;
  var screenBotY = floorY - affM * 60;
  var earY = floorY - 1.2 * 60; // 1200mm eyelevel AFF

  // 1st Person Distance (AVIXA Closest: 1.0 x W)
  var dFirstM = screenW * 1.0;
  var dFirstX = screenX + dFirstM * 60;

  // Last Person Distance (AVIXA Furthest: 6.0 x H for BDM)
  var dLastM = Math.max(dFirstM + 2.0, screenH * 6.0);
  var dLastX = Math.min(svgW - 60, screenX + dLastM * 60);

  // Vertical Gaze Angles
  var angle1stTop = Math.atan(((affM + screenH) - 1.2) / dFirstM) * 180 / Math.PI;
  var angle1stBot = Math.atan((1.2 - affM) / dFirstM) * 180 / Math.PI;
  var angleLastTop = Math.atan(((affM + screenH) - 1.2) / dLastM) * 180 / Math.PI;

  var status1st = angle1stTop <= 15 ? 'Pass (Comfortable)' : (angle1stTop <= 30 ? 'DISCAS Acceptable' : 'Exceeds 30° Neck Limit');
  var color1st = angle1stTop <= 15 ? '#10b981' : (angle1stTop <= 30 ? '#f59e0b' : '#ef4444');

  container.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; border-radius:10px; border:1px solid #e2e8f0;">
    <defs>
      <linearGradient id="screenFaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    </defs>

    <!-- Floor (0.0m AFF) -->
    <line x1="40" y1="${floorY}" x2="${svgW-30}" y2="${floorY}" stroke="#0f172a" stroke-width="3"/>
    <text x="45" y="${floorY+22}" font-size="10" font-family="JetBrains Mono" font-weight="bold" fill="#475569">FINISHED FLOOR (0.00 m AFF)</text>

    <!-- Ceiling Boundary -->
    <line x1="40" y1="${ceilY}" x2="${svgW-30}" y2="${ceilY}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="45" y="${ceilY-10}" font-size="10" font-family="JetBrains Mono" fill="#64748b">CEILING LINE (2.80 m)</text>

    <!-- Seated Ear Level Line (1.2m / 1200mm AFF) -->
    <line x1="40" y1="${earY}" x2="${svgW-30}" y2="${earY}" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,4"/>
    <text x="${svgW-35}" y="${earY-6}" font-size="9.5" font-family="JetBrains Mono" font-weight="bold" fill="#0284c7" text-anchor="end">LISTENER EYE LEVEL: 1200 mm AFF</text>

    <!-- Wall Mount Display -->
    <rect x="${screenX-12}" y="${screenTopY}" width="12" height="${screenBotY - screenTopY}" fill="url(#screenFaceGrad)" stroke="#0f172a" stroke-width="2" rx="2"/>
    <line x1="${screenX-20}" y1="${screenTopY-20}" x2="${screenX-20}" y2="${floorY}" stroke="#0f172a" stroke-width="3"/>

    <!-- Display Dimensions Callouts -->
    <text x="${screenX-28}" y="${(screenTopY+screenBotY)/2}" font-size="9" font-family="JetBrains Mono" font-weight="bold" fill="#0369a1" text-anchor="middle" transform="rotate(-90 ${screenX-28} ${(screenTopY+screenBotY)/2})">H: ${Math.round(screenH*1000)} mm</text>
    <text x="${screenX-28}" y="${(screenBotY+floorY)/2}" font-size="8.5" font-family="JetBrains Mono" fill="#64748b" text-anchor="middle" transform="rotate(-90 ${screenX-28} ${(screenBotY+floorY)/2})">AFF: ${Math.round(affM*1000)} mm</text>

    <!-- 1. FIRST PERSON (CLOSEST VIEWER: 1.0 x W) -->
    <g class="viewer-first-person">
      <!-- Seated Chair -->
      <line x1="${dFirstX}" y1="${floorY}" x2="${dFirstX}" y2="${earY+30}" stroke="#475569" stroke-width="3"/>
      <ellipse cx="${dFirstX}" cy="${earY+30}" rx="12" ry="6" fill="#334155"/>
      <line x1="${dFirstX+8}" y1="${earY+30}" x2="${dFirstX+8}" y2="${earY+10}" stroke="#334155" stroke-width="4"/>
      <!-- Seated Viewer Body & Head at 1200mm Ear Height -->
      <line x1="${dFirstX}" y1="${earY+30}" x2="${dFirstX}" y2="${earY}" stroke="#0284c7" stroke-width="4"/>
      <circle cx="${dFirstX}" cy="${earY}" r="9" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
      
      <!-- Sightline to Screen Top -->
      <line x1="${dFirstX}" y1="${earY}" x2="${screenX}" y2="${screenTopY}" stroke="${color1st}" stroke-width="2.5"/>
      <!-- Sightline to Screen Bottom -->
      <line x1="${dFirstX}" y1="${earY}" x2="${screenX}" y2="${screenBotY}" stroke="#10b981" stroke-width="1.8" stroke-dasharray="3,2"/>
      
      <!-- Dimension Tag Below Floor -->
      <line x1="${screenX}" y1="${floorY+12}" x2="${dFirstX}" y2="${floorY+12}" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="${dFirstX}" cy="${floorY+12}" r="3" fill="#0284c7"/>
      <text x="${(screenX+dFirstX)/2}" y="${floorY+26}" font-size="9" font-family="JetBrains Mono" font-weight="bold" fill="#0284c7" text-anchor="middle">FIRST PERSON: ${dFirstM.toFixed(2)} m (1.0 × W)</text>

      <!-- Angle Callout Card -->
      <rect x="${dFirstX-60}" y="${earY-48}" width="120" height="34" fill="#ffffff" stroke="${color1st}" stroke-width="1.5" rx="5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"/>
      <text x="${dFirstX}" y="${earY-34}" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="${color1st}" text-anchor="middle">1st ROW GAZE: ${angle1stTop.toFixed(1)}°</text>
      <text x="${dFirstX}" y="${earY-22}" font-size="7.5" font-family="JetBrains Mono" fill="#475569" text-anchor="middle">${status1st}</text>
    </g>

    <!-- 2. LAST PERSON (FURTHEST VIEWER: 6.0 x H FOR BDM) -->
    <g class="viewer-last-person">
      <!-- Seated Chair -->
      <line x1="${dLastX}" y1="${floorY}" x2="${dLastX}" y2="${earY+30}" stroke="#475569" stroke-width="3"/>
      <ellipse cx="${dLastX}" cy="${earY+30}" rx="12" ry="6" fill="#334155"/>
      <line x1="${dLastX+8}" y1="${earY+30}" x2="${dLastX+8}" y2="${earY+10}" stroke="#334155" stroke-width="4"/>
      <!-- Seated Viewer Body & Head at 1200mm Ear Height -->
      <line x1="${dLastX}" y1="${earY+30}" x2="${dLastX}" y2="${earY}" stroke="#10b981" stroke-width="4"/>
      <circle cx="${dLastX}" cy="${earY}" r="9" fill="#34d399" stroke="#059669" stroke-width="2"/>
      
      <!-- Sightline to Screen Top -->
      <line x1="${dLastX}" y1="${earY}" x2="${screenX}" y2="${screenTopY}" stroke="#10b981" stroke-width="2"/>
      <!-- Sightline to Screen Bottom -->
      <line x1="${dLastX}" y1="${earY}" x2="${screenX}" y2="${screenBotY}" stroke="#059669" stroke-width="1.5" stroke-dasharray="3,2"/>
      
      <!-- Dimension Tag Below Floor -->
      <line x1="${screenX}" y1="${floorY+36}" x2="${dLastX}" y2="${floorY+36}" stroke="#059669" stroke-width="1.5"/>
      <circle cx="${dLastX}" cy="${floorY+36}" r="3" fill="#059669"/>
      <text x="${(screenX+dLastX)/2}" y="${floorY+48}" font-size="9" font-family="JetBrains Mono" font-weight="bold" fill="#059669" text-anchor="middle">LAST PERSON: ${dLastM.toFixed(2)} m (6.0 × H BDM Limit)</text>

      <!-- Angle Callout Card -->
      <rect x="${dLastX-60}" y="${earY-48}" width="120" height="34" fill="#ffffff" stroke="#10b981" stroke-width="1.5" rx="5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"/>
      <text x="${dLastX}" y="${earY-34}" font-size="8.5" font-family="JetBrains Mono" font-weight="bold" fill="#059669" text-anchor="middle">LAST ROW GAZE: ${angleLastTop.toFixed(1)}°</text>
      <text x="${dLastX}" y="${earY-22}" font-size="7.5" font-family="JetBrains Mono" fill="#475569" text-anchor="middle">Pass (Relaxed &le; 15°)</text>
    </g>

    <!-- Legend & Standard Note -->
    <rect x="250" y="10" width="480" height="26" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="4"/>
    <text x="490" y="27" font-size="8.5" font-family="JetBrains Mono" fill="#1e293b" text-anchor="middle">AVIXA DISCAS STANDARD: 1st Row &ge; 1.0×W (Gaze &le; 30°) &bull; Last Row &le; 6.0×H (Text Legibility)</text>
  </svg>`;
}

function toggleAcousticLegend() {
  var card = document.getElementById('acousticLegendCollapseCard');
  var txt = document.getElementById('txtAcousticLegendToggle');
  var btn = document.getElementById('btnToggleAcousticLegend');
  if (!card) return;
  if (card.style.display === 'none' || card.style.display === '') {
    card.style.display = 'block';
    if (txt) txt.innerText = 'Hide Acoustic Color Legend';
    if (btn) btn.classList.add('active');
  } else {
    card.style.display = 'none';
    if (txt) txt.innerText = 'Show Acoustic Color Legend';
    if (btn) btn.classList.remove('active');
  }
}
window.toggleAcousticLegend = toggleAcousticLegend;
