// ==========================================
// TAB 8: UNIVERSAL AV ENGINEERING & MATHEMATICAL SUITE
// ==========================================

// 1 & 2. Architectural Drawing Scale Dimension Converter (All Units)
// User requirement: Do not show the scale ratio, only show the calculated value.
function calcScaleFactor() {
  applyScaleToInputVal();
}

function applyScaleToInputVal() {
  var draw = parseFloat(document.getElementById('sfDraw')?.value) || 50;
  var realRaw = parseFloat(document.getElementById('sfReal')?.value) || 2500;
  var realMm = realRaw < 50 ? realRaw * 1000.0 : realRaw;
  var ratio = realMm / (draw > 0 ? draw : 1);

  var inputVal = parseFloat(document.getElementById('scaleInputDimVal')?.value) || 2500;
  var unit = document.getElementById('scaleInputUnitSelect')?.value || 'mm';

  var valInMm = inputVal;
  if (unit === 'cm') valInMm = inputVal * 10.0;
  if (unit === 'm') valInMm = inputVal * 1000.0;
  if (unit === 'in') valInMm = inputVal * 25.4;
  if (unit === 'ft') valInMm = inputVal * 304.8;
  if (unit === 'yd') valInMm = inputVal * 914.4;

  var scaledDownMm = valInMm / ratio;
  var scaledUpMm = valInMm * ratio;

  var elDown = document.getElementById('resScaledDownVal');
  if (elDown) {
    elDown.innerText = `${scaledDownMm.toFixed(2)} mm (${(scaledDownMm / 25.4).toFixed(3)} in)`;
  }
  var elUp = document.getElementById('resScaledUpVal');
  if (elUp) {
    elUp.innerText = `${scaledUpMm.toLocaleString(undefined, {maximumFractionDigits: 1})} mm (${(scaledUpMm / 1000.0).toFixed(2)} m / ${(scaledUpMm / 304.8).toFixed(1)} ft)`;
  }
}

// 3. Universal Multi-Unit Converters (Length, Width, Height/Thickness + Independent Area & Volume)
function convertDimensionToMeters(val, unit) {
  if (unit === 'm') return val;
  if (unit === 'ft') return val * 0.3048;
  if (unit === 'in') return val * 0.0254;
  if (unit === 'cm') return val * 0.01;
  if (unit === 'mm') return val * 0.001;
  if (unit === 'yd') return val * 0.9144;
  if (unit === 'km') return val * 1000.0;
  if (unit === 'mi') return val * 1609.344;
  return val;
}

function convertUniversalDimensions() {
  var lVal = parseFloat(document.getElementById('dimLengthVal')?.value) || 0;
  var lUnit = document.getElementById('dimLengthUnit')?.value || 'mm';
  var wVal = parseFloat(document.getElementById('dimWidthVal')?.value) || 0;
  var wUnit = document.getElementById('dimWidthUnit')?.value || 'mm';
  var hVal = parseFloat(document.getElementById('dimHeightVal')?.value) || 0;
  var hUnit = document.getElementById('dimHeightUnit')?.value || 'mm';

  var l_m = convertDimensionToMeters(lVal, lUnit);
  var w_m = convertDimensionToMeters(wVal, wUnit);
  var h_m = convertDimensionToMeters(hVal, hUnit);

  var areaSqm = l_m * w_m;
  var volCum = l_m * w_m * h_m;

  // Selected Unit Output Values:
  var areaInSelectedUnit = 0;
  var areaSelectedUnitLabel = '';
  var volInSelectedUnit = 0;
  var volSelectedUnitLabel = '';

  // Determine primary unit from Length
  var primUnit = lUnit;
  if (primUnit === 'mm') {
    areaInSelectedUnit = areaSqm * 1000000.0; // mm²
    areaSelectedUnitLabel = 'mm² (Square Millimeters)';
    volInSelectedUnit = volCum * 1000000000.0; // mm³
    volSelectedUnitLabel = 'mm³ (Cubic Millimeters)';
  } else if (primUnit === 'cm') {
    areaInSelectedUnit = areaSqm * 10000.0; // cm²
    areaSelectedUnitLabel = 'cm² (Square Centimeters)';
    volInSelectedUnit = volCum * 1000000.0; // cm³
    volSelectedUnitLabel = 'cm³ (Cubic Centimeters)';
  } else if (primUnit === 'in') {
    areaInSelectedUnit = areaSqm * 1550.0031; // in²
    areaSelectedUnitLabel = 'sq in / in² (Square Inches)';
    volInSelectedUnit = volCum * 61023.744; // in³
    volSelectedUnitLabel = 'cu in / in³ (Cubic Inches)';
  } else if (primUnit === 'ft') {
    areaInSelectedUnit = areaSqm * 10.76391; // ft²
    areaSelectedUnitLabel = 'ft² (Square Feet)';
    volInSelectedUnit = volCum * 35.31467; // ft³
    volSelectedUnitLabel = 'ft³ (Cubic Feet)';
  } else if (primUnit === 'yd') {
    areaInSelectedUnit = areaSqm * 1.19599; // yd²
    areaSelectedUnitLabel = 'yd² (Square Yards)';
    volInSelectedUnit = volCum * 1.30795; // yd³
    volSelectedUnitLabel = 'yd³ (Cubic Yards)';
  } else {
    areaInSelectedUnit = areaSqm; // m²
    areaSelectedUnitLabel = 'm² (Square Meters)';
    volInSelectedUnit = volCum; // m³
    volSelectedUnitLabel = 'm³ (Cubic Meters)';
  }

  var elDimRes = document.getElementById('resUniversalDimList');
  if (elDimRes) {
    elDimRes.innerHTML = `
      <div class="mb-1"><strong>Length (L):</strong> ${lVal} ${lUnit} = ${formatConvertedValue(l_m * 1000)} mm = ${l_m.toFixed(3)} m = ${(l_m * 3.28084).toFixed(2)} ft = ${(l_m * 39.3701).toFixed(1)} in</div>
      <div class="mb-1"><strong>Width (W):</strong> ${wVal} ${wUnit} = ${formatConvertedValue(w_m * 1000)} mm = ${w_m.toFixed(3)} m = ${(w_m * 3.28084).toFixed(2)} ft = ${(w_m * 39.3701).toFixed(1)} in</div>
      <div class="mb-2"><strong>Height/Thickness (H/T):</strong> ${hVal} ${hUnit} = ${formatConvertedValue(h_m * 1000)} mm = ${h_m.toFixed(3)} m = ${(h_m * 3.28084).toFixed(2)} ft = ${(h_m * 39.3701).toFixed(1)} in</div>
      
      <!-- PRIMARY SELECTED UNIT RESULT CARD (Highlights Selected Unit First) -->
      <div class="p-2 mb-2 rounded bg-white border-2 border-primary shadow-xs">
        <div class="small fw-bold text-secondary mb-1"><i class="fa-solid fa-star text-warning me-1"></i>CALCULATED IN SELECTED UNIT (${primUnit.toUpperCase()}):</div>
        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <div class="text-primary font-monospace fw-bold fs-6">
            <span class="badge bg-primary text-white me-1">AREA</span>
            <strong>${formatConvertedValue(areaInSelectedUnit)}</strong> ${areaSelectedUnitLabel}
          </div>
          <div class="text-success font-monospace fw-bold fs-6">
            <span class="badge bg-success text-white me-1">VOLUME</span>
            <strong>${formatConvertedValue(volInSelectedUnit)}</strong> ${volSelectedUnitLabel}
          </div>
        </div>
      </div>

      <!-- COMPLETE EQUIVALENT BREAKDOWN -->
      <div class="p-2 rounded bg-light border border-secondary-subtle">
        <div class="text-primary font-monospace fw-bold mb-1">
          <i class="fa-solid fa-vector-square me-1"></i>Surface Area (L × W): 
          <span><strong>${formatConvertedValue(areaSqm * 1000000)} mm²</strong> | ${areaSqm.toFixed(3)} m² | ${(areaSqm * 10.7639).toFixed(2)} ft² | ${formatConvertedValue(areaSqm * 1550.003)} in² | ${formatConvertedValue(areaSqm * 10000)} cm²</span>
        </div>
        <div class="text-success font-monospace fw-bold">
          <i class="fa-solid fa-cube me-1"></i>Volume (L × W × H): 
          <span><strong>${formatConvertedValue(volCum * 1000000000)} mm³</strong> | ${volCum.toFixed(3)} m³ | ${(volCum * 35.3147).toFixed(2)} ft³ | ${formatConvertedValue(volCum * 61023.7)} in³ | ${(volCum * 1000).toFixed(1)} L | ${formatConvertedValue(volCum * 1000000)} cm³</span>
        </div>
      </div>
    `;
  }

  // Check if auto-sync to independent converters is enabled
  var autoSync = document.getElementById('chkSyncDimToAreaVol')?.checked;
  if (autoSync) {
    syncDimensionsToAreaAndVolume();
  }
}

function syncDimensionsToAreaAndVolume() {
  var lVal = parseFloat(document.getElementById('dimLengthVal')?.value) || 0;
  var lUnit = document.getElementById('dimLengthUnit')?.value || 'mm';
  var wVal = parseFloat(document.getElementById('dimWidthVal')?.value) || 0;
  var wUnit = document.getElementById('dimWidthUnit')?.value || 'mm';
  var hVal = parseFloat(document.getElementById('dimHeightVal')?.value) || 0;
  var hUnit = document.getElementById('dimHeightUnit')?.value || 'mm';

  var l_m = convertDimensionToMeters(lVal, lUnit);
  var w_m = convertDimensionToMeters(wVal, wUnit);
  var h_m = convertDimensionToMeters(hVal, hUnit);

  var areaSqm = l_m * w_m;
  var volCum = l_m * w_m * h_m;

  var aInp = document.getElementById('unitAreaVal');
  var aType = document.getElementById('unitAreaType');
  if (aInp && aType) {
    if (lUnit === 'mm') {
      aType.value = 'sqmm';
      aInp.value = (areaSqm * 1000000.0) % 1 === 0 ? (areaSqm * 1000000.0) : (areaSqm * 1000000.0).toFixed(1);
    } else if (lUnit === 'cm') {
      aType.value = 'sqcm';
      aInp.value = (areaSqm * 10000.0).toFixed(2);
    } else if (lUnit === 'in') {
      aType.value = 'sqin';
      aInp.value = (areaSqm * 1550.0031).toFixed(2);
    } else if (lUnit === 'ft') {
      aType.value = 'sqft';
      aInp.value = (areaSqm * 10.76391).toFixed(2);
    } else {
      aType.value = 'sqm';
      aInp.value = areaSqm.toFixed(3);
    }
    convertUniversalArea();
  }

  var vInp = document.getElementById('unitVolVal');
  var vType = document.getElementById('unitVolType');
  if (vInp && vType) {
    if (lUnit === 'mm') {
      vType.value = 'cumm';
      vInp.value = (volCum * 1000000000.0) % 1 === 0 ? (volCum * 1000000000.0) : (volCum * 1000000000.0).toFixed(0);
    } else if (lUnit === 'cm') {
      vType.value = 'cucm';
      vInp.value = (volCum * 1000000.0).toFixed(1);
    } else if (lUnit === 'in') {
      vType.value = 'cuin';
      vInp.value = (volCum * 61023.744).toFixed(1);
    } else if (lUnit === 'ft') {
      vType.value = 'cuft';
      vInp.value = (volCum * 35.31467).toFixed(2);
    } else {
      vType.value = 'cum';
      vInp.value = volCum.toFixed(3);
    }
    convertUniversalVol();
  }
}

function convertUniversalLength() {
  var val = parseFloat(document.getElementById('unitLengthVal')?.value) || 0;
  var type = document.getElementById('unitLengthType')?.value || 'm';
  var m = (type==='m')?val:(type==='ft'?val*0.3048:(type==='in'?val*0.0254:(type==='cm'?val*0.01:(type==='km'?val*1000:(type==='mi'?val*1609.344:(type==='yd'?val*0.9144:val/1000))))));
  var el = document.getElementById('resUniversalLengthList');
  if (el) {
    el.innerHTML = `
      <div><strong>${val} ${type}</strong>:</div>
      <div>• <strong>${m.toFixed(3)} m</strong> (${(m * 3.28084).toFixed(2)} ft)</div>
      <div>• <strong>${(m * 39.3701).toFixed(2)} in (Inches)</strong></div>
      <div>• ${(m * 1000).toFixed(0)} mm | ${(m * 100).toFixed(1)} cm</div>
      <div>• ${(m * 1.09361).toFixed(2)} yd | ${(m / 1000).toFixed(4)} km</div>
    `;
  }
}

// Helper function to format conversion values nicely
function formatConvertedValue(val) {
  if (isNaN(val)) return '0';
  if (Math.abs(val) >= 1000000) {
    return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
  } else if (Math.abs(val) >= 1000) {
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  } else if (Math.abs(val) >= 1) {
    return val.toLocaleString(undefined, { maximumFractionDigits: 3 });
  } else if (Math.abs(val) >= 0.0001) {
    return val.toFixed(5);
  } else if (val === 0) {
    return '0';
  } else {
    return val.toExponential(4);
  }
}

function onAreaSourceUnitChange() {
  var src = document.getElementById('unitAreaType')?.value || 'sqm';
  var tgtEl = document.getElementById('unitAreaTargetType');
  if (tgtEl && tgtEl.value === src) {
    tgtEl.value = (src === 'sqin') ? 'sqft' : 'sqin';
  }
  convertUniversalArea();
}

function swapAreaUnits() {
  var srcEl = document.getElementById('unitAreaType');
  var tgtEl = document.getElementById('unitAreaTargetType');
  var valEl = document.getElementById('unitAreaVal');
  if (!srcEl || !tgtEl || !valEl) return;

  var oldSrc = srcEl.value;
  var oldTgt = tgtEl.value;

  srcEl.value = oldTgt;
  tgtEl.value = oldSrc;
  convertUniversalArea();
}

function calcAreaFromInches() {
  var w = parseFloat(document.getElementById('quickAreaInchW')?.value) || 0;
  var h = parseFloat(document.getElementById('quickAreaInchH')?.value) || 0;
  var sqin = w * h;
  var resEl = document.getElementById('quickAreaInchResult');
  if (resEl) {
    resEl.innerText = `${formatConvertedValue(sqin)} sq in`;
  }
}

function applyAreaFromInches() {
  var w = parseFloat(document.getElementById('quickAreaInchW')?.value) || 0;
  var h = parseFloat(document.getElementById('quickAreaInchH')?.value) || 0;
  var sqin = w * h;
  var valEl = document.getElementById('unitAreaVal');
  var srcEl = document.getElementById('unitAreaType');
  var tgtEl = document.getElementById('unitAreaTargetType');

  if (valEl) valEl.value = sqin % 1 === 0 ? sqin : sqin.toFixed(2);
  if (srcEl) srcEl.value = 'sqin';
  if (tgtEl && tgtEl.value === 'sqin') tgtEl.value = 'sqft';
  convertUniversalArea();
}

function setAreaPreset(src, tgt, val) {
  var srcEl = document.getElementById('unitAreaType');
  var tgtEl = document.getElementById('unitAreaTargetType');
  var valEl = document.getElementById('unitAreaVal');
  if (srcEl) srcEl.value = src;
  if (tgtEl) tgtEl.value = tgt;
  if (valEl) {
    if (val !== undefined) {
      valEl.value = val;
    } else if (src === 'sqmm' && parseFloat(valEl.value) <= 100) {
      valEl.value = '48000000'; // 48,000,000 mm² = 516.67 ft² (standard corporate conference space)
    }
  }
  convertUniversalArea();
}
window.setAreaPreset = setAreaPreset;

// Independent Area Converter with comprehensive Square Inches (sq in / in²) support
function convertUniversalArea() {
  var val = parseFloat(document.getElementById('unitAreaVal')?.value) || 0;
  var type = document.getElementById('unitAreaType')?.value || 'sqm';
  var targetType = document.getElementById('unitAreaTargetType')?.value || 'sqin';

  // Base calculation to square meters (m²)
  var sqm = 0;
  if (type === 'sqm') sqm = val;
  else if (type === 'sqft') sqm = val * 0.09290304;
  else if (type === 'sqin') sqm = val * 0.00064516;
  else if (type === 'sqcm') sqm = val * 0.0001;
  else if (type === 'sqmm') sqm = val * 0.000001;
  else if (type === 'sqyd') sqm = val * 0.83612736;
  else if (type === 'acre') sqm = val * 4046.8564224;
  else if (type === 'hectare') sqm = val * 10000.0;

  var sqft = sqm * 10.76391041670972;
  var sqin = sqm * 1550.0031000062;
  var sqcm = sqm * 10000.0;
  var sqmm = sqm * 1000000.0;
  var sqyd = sqm * 1.1959900463;
  var acres = sqm / 4046.8564224;
  var hectares = sqm / 10000.0;

  // Compute Target Unit Value
  var targetVal = 0;
  var targetName = 'sq in (in²)';
  var unitNames = {
    sqin: 'Square Inches (sq in / in²)',
    sqft: 'Square Feet (ft²)',
    sqm: 'Square Meters (m²)',
    sqcm: 'Square Centimeters (cm²)',
    sqmm: 'Square Millimeters (mm²)',
    sqyd: 'Square Yards (yd²)',
    acre: 'Acres',
    hectare: 'Hectares'
  };

  if (targetType === 'sqin') { targetVal = sqin; targetName = 'sq in (in²)'; }
  else if (targetType === 'sqft') { targetVal = sqft; targetName = 'ft²'; }
  else if (targetType === 'sqm') { targetVal = sqm; targetName = 'm²'; }
  else if (targetType === 'sqcm') { targetVal = sqcm; targetName = 'cm²'; }
  else if (targetType === 'sqmm') { targetVal = sqmm; targetName = 'mm²'; }
  else if (targetType === 'sqyd') { targetVal = sqyd; targetName = 'yd²'; }
  else if (targetType === 'acre') { targetVal = acres; targetName = 'Acres'; }
  else if (targetType === 'hectare') { targetVal = hectares; targetName = 'Hectares'; }

  // Update direct callout badge
  var directCallout = document.getElementById('directAreaConversionCallout');
  if (directCallout) {
    var sqmmToSqftCallout = '';
    if (type === 'sqmm' && targetType === 'sqft') {
      var preciseSqft = (val / 92903.04);
      var displayPrecise = preciseSqft < 0.01 ? preciseSqft.toExponential(4) : preciseSqft.toFixed(5);
      sqmmToSqftCallout = `
        <div class="mt-2 p-1 px-2 rounded bg-primary-subtle text-primary border border-primary font-monospace" style="font-size:0.72rem;">
          <div><i class="fa-solid fa-calculator me-1"></i><strong>${val.toLocaleString()} mm² &divide; 92,903.04 = ${displayPrecise} ft²</strong></div>
          <div class="small text-muted" style="font-size:0.65rem;">1 ft² = 92,903.04 mm² &bull; 1 mm² = 1.076391 &times; 10⁻⁵ ft²</div>
        </div>`;
    } else if (type === 'sqft' && targetType === 'sqmm') {
      var mm2Val = val * 92903.04;
      sqmmToSqftCallout = `
        <div class="mt-2 p-1 px-2 rounded bg-success-subtle text-success border border-success font-monospace" style="font-size:0.72rem;">
          <div><i class="fa-solid fa-calculator me-1"></i><strong>${val} ft² &times; 92,903.04 = ${mm2Val.toLocaleString(undefined, {maximumFractionDigits: 1})} mm²</strong></div>
        </div>`;
    }

    var formattedTarget = (type === 'sqmm' && targetType === 'sqft' && targetVal < 1) 
      ? targetVal.toFixed(6) 
      : formatConvertedValue(targetVal);

    directCallout.innerHTML = `
      <div class="small text-secondary fw-semibold mb-0" style="font-size:0.75rem;">DIRECT CONVERSION RESULT:</div>
      <div class="fs-6 fw-bold text-dark font-monospace my-1">
        <span class="text-secondary">${formatConvertedValue(val)} ${unitNames[type] || type}</span>
        <i class="fa-solid fa-arrow-right mx-1 text-primary"></i>
        <span class="text-primary fs-5">${formattedTarget} ${targetName}</span>
      </div>
      ${sqmmToSqftCallout}
    `;
  }

  // Update full breakdown list
  var el = document.getElementById('resUniversalAreaList');
  if (el) {
    el.innerHTML = `
      <div class="p-1 mb-2 rounded bg-white border border-primary text-primary font-monospace fw-bold shadow-2xs">
        <i class="fa-solid fa-arrows-to-dot me-1"></i><strong>${formatConvertedValue(sqin)} sq in (in²)</strong>
      </div>
      <div class="p-1 mb-2 rounded bg-light border border-teal text-teal font-monospace small" style="background:#f0fdfa;">
        <i class="fa-solid fa-calculator me-1"></i><strong>${formatConvertedValue(sqmm)} mm²</strong> = <strong>${formatConvertedValue(sqft)} ft²</strong>
      </div>
      <div class="text-dark py-0.5">• <strong>${formatConvertedValue(sqft)} ft² (Square Feet)</strong></div>
      <div class="text-dark py-0.5">• <strong>${formatConvertedValue(sqm)} m² (Square Meters)</strong></div>
      <div class="text-secondary py-0.5">• <strong>${formatConvertedValue(sqmm)} mm² (Square Millimeters)</strong></div>
      <div class="text-secondary py-0.5">• ${formatConvertedValue(sqcm)} cm²</div>
      <div class="text-secondary py-0.5">• ${formatConvertedValue(sqyd)} yd²</div>
      <div class="text-secondary py-0.5">• ${acres < 0.01 ? acres.toExponential(3) : acres.toFixed(4)} Acres (${hectares < 0.01 ? hectares.toExponential(3) : hectares.toFixed(4)} ha)</div>
    `;
  }
}

function onVolSourceUnitChange() {
  var src = document.getElementById('unitVolType')?.value || 'cum';
  var tgtEl = document.getElementById('unitVolTargetType');
  if (tgtEl && tgtEl.value === src) {
    tgtEl.value = (src === 'cuin') ? 'cuft' : 'cuin';
  }
  convertUniversalVol();
}

function swapVolUnits() {
  var srcEl = document.getElementById('unitVolType');
  var tgtEl = document.getElementById('unitVolTargetType');
  var valEl = document.getElementById('unitVolVal');
  if (!srcEl || !tgtEl || !valEl) return;

  var oldSrc = srcEl.value;
  var oldTgt = tgtEl.value;

  srcEl.value = oldTgt;
  tgtEl.value = oldSrc;
  convertUniversalVol();
}

function calcVolFromInches() {
  var l = parseFloat(document.getElementById('quickVolInchL')?.value) || 0;
  var w = parseFloat(document.getElementById('quickVolInchW')?.value) || 0;
  var h = parseFloat(document.getElementById('quickVolInchH')?.value) || 0;
  var cuin = l * w * h;
  var resEl = document.getElementById('quickVolInchResult');
  if (resEl) {
    resEl.innerText = `${formatConvertedValue(cuin)} cu in`;
  }
}

function applyVolFromInches() {
  var l = parseFloat(document.getElementById('quickVolInchL')?.value) || 0;
  var w = parseFloat(document.getElementById('quickVolInchW')?.value) || 0;
  var h = parseFloat(document.getElementById('quickVolInchH')?.value) || 0;
  var cuin = l * w * h;
  var valEl = document.getElementById('unitVolVal');
  var srcEl = document.getElementById('unitVolType');
  var tgtEl = document.getElementById('unitVolTargetType');

  if (valEl) valEl.value = cuin % 1 === 0 ? cuin : cuin.toFixed(2);
  if (srcEl) srcEl.value = 'cuin';
  if (tgtEl && tgtEl.value === 'cuin') tgtEl.value = 'cuft';
  convertUniversalVol();
}

// Independent Volume Converter with comprehensive Cubic Inches (cu in / in³) support
function convertUniversalVol() {
  var val = parseFloat(document.getElementById('unitVolVal')?.value) || 0;
  var type = document.getElementById('unitVolType')?.value || 'cum';
  var targetType = document.getElementById('unitVolTargetType')?.value || 'cuin';

  // Base calculation to cubic meters (m³)
  var cum = 0;
  if (type === 'cum') cum = val;
  else if (type === 'cumm') cum = val * 0.000000001; // 1 mm³ = 1e-9 m³
  else if (type === 'cuft') cum = val * 0.028316846592;
  else if (type === 'cuin') cum = val * 0.000016387064;
  else if (type === 'liter') cum = val * 0.001;
  else if (type === 'cucm') cum = val * 0.000001;
  else if (type === 'gallon') cum = val * 0.003785411784; // US Gal
  else if (type === 'imp_gal') cum = val * 0.00454609; // Imperial Gal

  var cuft = cum * 35.314666721489;
  var cuin = cum * 61023.74409473;
  var liters = cum * 1000.0;
  var cucm = cum * 1000000.0;
  var cumm = cum * 1000000000.0;
  var gallons = cum * 264.172052358;
  var impGal = cum * 219.969248299;

  // Compute Target Unit Value
  var targetVal = 0;
  var targetName = 'cu in (in³)';
  var unitNames = {
    cumm: 'Cubic Millimeters (mm³)',
    cuin: 'Cubic Inches (cu in / in³)',
    cuft: 'Cubic Feet (ft³)',
    cum: 'Cubic Meters (m³)',
    liter: 'Liters (L)',
    cucm: 'Cubic Centimeters (cm³)',
    gallon: 'US Gallons',
    imp_gal: 'Imperial Gallons'
  };

  if (targetType === 'cumm') { targetVal = cumm; targetName = 'mm³ (Cubic Millimeters)'; }
  else if (targetType === 'cuin') { targetVal = cuin; targetName = 'cu in (in³)'; }
  else if (targetType === 'cuft') { targetVal = cuft; targetName = 'ft³'; }
  else if (targetType === 'cum') { targetVal = cum; targetName = 'm³'; }
  else if (targetType === 'liter') { targetVal = liters; targetName = 'Liters (L)'; }
  else if (targetType === 'cucm') { targetVal = cucm; targetName = 'cm³ (mL)'; }
  else if (targetType === 'gallon') { targetVal = gallons; targetName = 'US Gal'; }
  else if (targetType === 'imp_gal') { targetVal = impGal; targetName = 'Imp Gal'; }

  // Update direct callout badge
  var directCallout = document.getElementById('directVolConversionCallout');
  if (directCallout) {
    directCallout.innerHTML = `
      <div class="small text-secondary fw-semibold mb-0" style="font-size:0.75rem;">DIRECT CONVERSION RESULT:</div>
      <div class="fs-6 fw-bold text-dark font-monospace my-1">
        <span class="text-secondary">${formatConvertedValue(val)} ${unitNames[type] || type}</span>
        <i class="fa-solid fa-arrow-right mx-1 text-success"></i>
        <span class="text-success fs-5">${formatConvertedValue(targetVal)} ${targetName}</span>
      </div>
    `;
  }

  // Update full breakdown list
  var el = document.getElementById('resUniversalVolList');
  if (el) {
    el.innerHTML = `
      <div class="p-1 mb-2 rounded bg-white border border-success text-success font-monospace fw-bold shadow-2xs">
        <i class="fa-solid fa-cube me-1"></i><strong>${formatConvertedValue(cumm)} mm³ (Cubic Millimeters)</strong>
      </div>
      <div class="text-dark py-0.5">• <strong>${formatConvertedValue(cuin)} cu in (in³)</strong></div>
      <div class="text-dark py-0.5">• <strong>${formatConvertedValue(cuft)} ft³</strong></div>
      <div class="text-dark py-0.5">• <strong>${formatConvertedValue(cum)} m³</strong> (${formatConvertedValue(liters)} L)</div>
      <div class="text-secondary py-0.5">• ${formatConvertedValue(cucm)} cm³</div>
      <div class="text-secondary py-0.5">• ${formatConvertedValue(gallons)} US Gallons (${formatConvertedValue(impGal)} Imp Gal)</div>
    `;
  }
}

function convertUniversalWeight() {
  var val = parseFloat(document.getElementById('unitWeightVal')?.value) || 0;
  var type = document.getElementById('unitWeightType')?.value || 'kg';

  var kg = val;
  if (type === 'lbs') kg = val * 0.45359237;
  else if (type === 'ton') kg = val * 1000.0;
  else if (type === 'oz') kg = val * 0.02834952;
  else if (type === 'g') kg = val / 1000.0;
  else if (type === 'st') kg = val * 6.35029318;

  var lbs = kg * 2.20462262;
  var oz = kg * 35.2739619;
  var grams = kg * 1000.0;
  var metricTons = kg / 1000.0;
  var usTons = lbs / 2000.0;
  var stones = kg / 6.35029318;

  // Gravitational & Rigging Structural Forces
  var newtons = kg * 9.80665;
  var kiloNewtons = newtons / 1000.0;
  var lbf = lbs; // 1 lb mass = 1 lbf under standard gravity

  // Rigging Minimum Rated Hardware (5:1 standard rigging, 10:1 overhead public)
  var wll5to1_kg = kg * 5.0;
  var wll5to1_lbs = lbs * 5.0;
  var wll10to1_kg = kg * 10.0;
  var wll10to1_lbs = lbs * 10.0;

  var el = document.getElementById('resUniversalWeightList');
  if (el) {
    el.innerHTML = `
      <div class="p-1 mb-1 rounded bg-white border border-warning text-dark font-monospace fw-bold shadow-2xs">
        <i class="fa-solid fa-weight-scale me-1 text-warning"></i>${kg.toFixed(2)} kg (${lbs.toFixed(2)} lbs)
      </div>
      <div class="text-dark py-0.5">• <strong>${oz.toFixed(1)} oz</strong> (${grams >= 1000 ? (grams/1000).toFixed(2) + ' kg' : grams.toFixed(1) + ' g'})</div>
      <div class="text-dark py-0.5">• <strong>${stones.toFixed(2)} st</strong> (Imperial Stones)</div>
      <div class="text-secondary py-0.5">• <strong>${metricTons.toFixed(4)} t</strong> (Metric Tonnes)</div>
      <div class="text-secondary py-0.5">• <strong>${usTons.toFixed(4)} ton</strong> (US Short Tons)</div>
    `;
  }

  var rigEl = document.getElementById('resRiggingLoadDetails');
  if (rigEl) {
    rigEl.innerHTML = `
      <div class="d-flex justify-content-between py-0.5">
        <span class="text-muted">Downforce Gravity (F):</span>
        <strong class="text-danger">${newtons >= 1000 ? kiloNewtons.toFixed(3) + ' kN' : newtons.toFixed(1) + ' N'}</strong>
      </div>
      <div class="d-flex justify-content-between py-0.5">
        <span class="text-muted">Tensile Force:</span>
        <strong class="text-primary">${lbf.toFixed(1)} lbf</strong>
      </div>
      <div class="d-flex justify-content-between py-0.5">
        <span class="text-muted">Rigging WLL (5:1 Standard):</span>
        <span class="text-dark fw-bold">${wll5to1_kg.toFixed(0)} kg (${wll5to1_lbs.toFixed(0)} lbs)</span>
      </div>
      <div class="d-flex justify-content-between py-0.5">
        <span class="text-muted">Overhead Safety (10:1):</span>
        <span class="text-success fw-bold">${wll10to1_kg.toFixed(0)} kg (${wll10to1_lbs.toFixed(0)} lbs)</span>
      </div>
    `;
  }
}

// 4. Essential AV Engineering Units
function calcAvAudioUnits() {
  var v = parseFloat(document.getElementById('avAudioVoltVal')?.value) || 0.775;
  var el = document.getElementById('resAvAudioUnits');
  if (el) el.innerText = `${(20 * Math.log10(v / 0.775)).toFixed(2)} dBu | ${(20 * Math.log10(v / 1.0)).toFixed(2)} dBV`;
}

function calcAvDataUnits() {
  var mbps = parseFloat(document.getElementById('avDataMbpsVal')?.value) || 1000;
  var el = document.getElementById('resAvDataUnits');
  if (el) el.innerText = `${(mbps/1000).toFixed(3)} Gbps | ${(mbps * 0.125).toFixed(1)} MB/s`;
}

function calcAvLightUnits() {
  var lux = parseFloat(document.getElementById('avLuxVal')?.value) || 500;
  var fc = lux / 10.764;
  var el = document.getElementById('resAvLightUnits');
  if (el) el.innerText = `${lux} Lux = ${fc.toFixed(1)} Foot-Candles (fc)`;
}

function calcAvRiggingUnits() {
  var kgSqm = parseFloat(document.getElementById('avRiggingKgSqm')?.value) || 45;
  var el = document.getElementById('resAvRiggingUnits');
  if (el) el.innerText = `${(kgSqm * 0.204816).toFixed(2)} lbs/ft² | ${(kgSqm * 0.00980665).toFixed(2)} kN/m²`;
}

// 5. Display Nits (Luminance) & Perception Calculator
function onAmbientLuxPresetChange() {
  var sel = document.getElementById('nitsAmbientPreset')?.value;
  if (sel && sel !== 'custom') {
    var val = parseFloat(sel);
    document.getElementById('nitsAmbientLuxInput').value = val;
    var slider = document.getElementById('nitsAmbientLuxSlider');
    if (slider) slider.value = val;
  }
  calcDisplayNitsImpact();
}

function syncAmbientLuxFromSlider() {
  var val = parseFloat(document.getElementById('nitsAmbientLuxSlider')?.value) || 500;
  document.getElementById('nitsAmbientLuxInput').value = val;
  var preset = document.getElementById('nitsAmbientPreset');
  if (preset) preset.value = 'custom';
  calcDisplayNitsImpact();
}

function syncAmbientLuxFromInput() {
  var val = parseFloat(document.getElementById('nitsAmbientLuxInput')?.value) || 500;
  var slider = document.getElementById('nitsAmbientLuxSlider');
  if (slider) slider.value = Math.min(slider.max, val);
  var preset = document.getElementById('nitsAmbientPreset');
  if (preset) preset.value = 'custom';
  calcDisplayNitsImpact();
}

function calcDisplayNitsImpact() {
  var lux = parseFloat(document.getElementById('nitsAmbientLuxInput')?.value) || 500;
  var refl = parseFloat(document.getElementById('nitsReflectanceSelect')?.value) || 0.02; // 2% anti-glare
  var contrastTarget = parseFloat(document.getElementById('nitsContrastTargetSelect')?.value) || 15.0; // 15:1

  // Reflected ambient light: L_refl = (E_amb * R) / pi (in nits)
  var lRefl = (lux * refl) / Math.PI;
  // Required display luminance: L_disp = (C - 1) * L_refl * 1.25 safety headroom
  var reqNitsPure = Math.max(150, (contrastTarget - 1.0) * lRefl);
  var reqNits = Math.round(reqNitsPure * 1.25);

  var tierName = '';
  var tierBadgeColor = '';
  var tierDesc = '';

  if (reqNits <= 350) {
    tierName = 'Consumer TV / Desktop Monitor (250–350 Nits)';
    tierBadgeColor = '#38bdf8';
    tierDesc = 'Ideal for dim residential rooms or controlled home theaters (≤ 100 Lux).';
  } else if (reqNits <= 550) {
    tierName = 'Standard Commercial LCD / Interactive Touch IFPD (450–550 Nits)';
    tierBadgeColor = '#4ade80';
    tierDesc = 'Perfect for standard corporate meeting rooms & school classrooms (250–450 Lux).';
  } else if (reqNits <= 850) {
    tierName = 'High-Brightness Commercial Display / Indoor dvLED (700–850 Nits)';
    tierBadgeColor = '#facc15';
    tierDesc = 'Boardrooms, glass-walled meeting rooms, and conference rooms (450–750 Lux).';
  } else if (reqNits <= 1500) {
    tierName = 'Daylight Atrium / Direct Sun Commercial LCD (1000–1500 Nits)';
    tierBadgeColor = '#fb923c';
    tierDesc = 'Glass curtain walls, sunlit lobbies, and airport concourses (800–1500 Lux).';
  } else if (reqNits <= 3000) {
    tierName = 'Semi-Outdoor / Street Window-Facing Signage (2000–3000 Nits)';
    tierBadgeColor = '#f87171';
    tierDesc = 'High-TNI store window displays exposed to intense external daylight (1500–3000 Lux).';
  } else if (reqNits <= 6000) {
    tierName = 'Outdoor dvLED Staging & Concert Tour Video Wall (4500–6000 Nits)';
    tierBadgeColor = '#ef4444';
    tierDesc = 'Outdoor concert touring, sports stadium ribbon boards, and festival stages.';
  } else {
    tierName = 'Daylight Stadium Jumbotron / Highway Billboard (7000–10,000+ Nits)';
    tierBadgeColor = '#ec4899';
    tierDesc = 'Direct midday solar irradiation on massive outdoor architectural facades.';
  }

  var elRec = document.getElementById('resRecommendedNits');
  if (elRec) {
    elRec.innerText = `${reqNits.toLocaleString()} Nits (cd/m²)`;
    elRec.style.color = tierBadgeColor;
  }
  var elCont = document.getElementById('resEstContrastRatio');
  if (elCont) {
    var actualContrast = ((reqNits + lRefl) / (lRefl > 0 ? lRefl : 1)).toFixed(1);
    elCont.innerHTML = `Target: <strong>${contrastTarget}:1 Contrast</strong> &bull; Reflected Glare: <strong>${lRefl.toFixed(1)} Nits</strong><br><span style="color:${tierBadgeColor}; font-weight:bold;">${tierName}</span>`;
  }

  renderNitsVisualizationSvg(lux, reqNits, contrastTarget, lRefl, tierBadgeColor);
}

function renderNitsVisualizationSvg(lux, reqNits, contrastTarget, lRefl, tierColor) {
  var container = document.getElementById('nitsVisualizationSvgContainer');
  if (!container) return;

  var svgW = 540, svgH = 220;
  // Position along logarithmic/exponential scale for nits marker (100 to 10,000 nits)
  var nitsLog = Math.log10(Math.max(100, Math.min(10000, reqNits)));
  // log10(100) = 2, log10(10000) = 4
  var normFactor = (nitsLog - 2.0) / 2.0; // 0.0 to 1.0
  var markerX = 50 + normFactor * (svgW - 100);

  container.innerHTML = `
    <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
      <defs>
        <linearGradient id="nitsBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${tierColor}" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.1"/>
        </linearGradient>
        <linearGradient id="spectrumBar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="20%" stop-color="#4ade80"/>
          <stop offset="40%" stop-color="#facc15"/>
          <stop offset="65%" stop-color="#fb923c"/>
          <stop offset="85%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#ec4899"/>
        </linearGradient>
      </defs>

      <!-- Ambient ceiling light ray -->
      <g transform="translate(110, 20)">
        <circle cx="0" cy="0" r="10" fill="#fef08a" stroke="#eab308" stroke-width="2"/>
        <line x1="0" y1="12" x2="60" y2="70" stroke="#fde047" stroke-width="2" stroke-dasharray="3,2"/>
        <text x="18" y="2" font-size="9" font-weight="bold" fill="#fde047">Ambient: ${lux} Lux</text>
      </g>

      <!-- Display Panel -->
      <g transform="translate(170, 45)">
        <rect x="0" y="0" width="14" height="90" fill="#1e293b" stroke="#64748b" stroke-width="2" rx="2"/>
        <line x1="14" y1="2" x2="14" y2="88" stroke="${tierColor}" stroke-width="3"/>
        <text x="-8" y="48" font-size="8" font-weight="bold" fill="#94a3b8" text-anchor="end">Screen</text>

        <!-- Emitted light cone -->
        <polygon points="17,10 240,0 240,90 17,80" fill="url(#nitsBeamGrad)"/>

        <!-- Reflected glare ray bouncing -->
        <line x1="14" y1="45" x2="80" y2="15" stroke="#f87171" stroke-width="1.5" stroke-dasharray="2,2"/>
        <text x="85" y="14" font-size="8" fill="#fca5a5">Glare: ${lRefl.toFixed(1)} Nits</text>
      </g>

      <!-- Viewer Eye -->
      <g transform="translate(420, 90)">
        <circle cx="0" cy="0" r="12" fill="#020617" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="0" cy="0" r="5" fill="#38bdf8"/>
        <text x="0" y="24" font-size="9" font-weight="bold" fill="#e2e8f0" text-anchor="middle">Viewer Eye</text>
      </g>

      <text x="270" y="75" font-size="12" font-weight="bold" fill="${tierColor}" text-anchor="middle">
        ${reqNits.toLocaleString()} NITS REQUIRED (${contrastTarget}:1 Contrast)
      </text>

      <!-- Global Nits Spectrum Scale -->
      <g transform="translate(0, 160)">
        <rect x="50" y="10" width="${svgW - 100}" height="10" fill="url(#spectrumBar)" rx="5"/>
        <!-- Marker arrow -->
        <polygon points="${markerX},5 ${markerX - 6},-5 ${markerX + 6},-5" fill="#ffffff" stroke="#000" stroke-width="1"/>
        <circle cx="${markerX}" cy="15" r="4" fill="#ffffff"/>

        <!-- Markers on spectrum -->
        <text x="50" y="32" font-size="8" fill="#94a3b8" text-anchor="start">100 Nits</text>
        <text x="120" y="32" font-size="8" fill="#38bdf8" text-anchor="middle">350 (TV)</text>
        <text x="190" y="32" font-size="8" fill="#4ade80" text-anchor="middle">500 (LCD/IFPD)</text>
        <text x="270" y="32" font-size="8" fill="#facc15" text-anchor="middle">850 (dvLED)</text>
        <text x="360" y="32" font-size="8" fill="#fb923c" text-anchor="middle">2.5k (Window)</text>
        <text x="440" y="32" font-size="8" fill="#ef4444" text-anchor="middle">5k (Staging)</text>
        <text x="${svgW - 50}" y="32" font-size="8" fill="#ec4899" text-anchor="end">10k+ Nits</text>
        <text x="${svgW / 2}" y="48" font-size="8" font-weight="bold" fill="#cbd5e1" text-anchor="middle">GLOBAL DISPLAY LUMINANCE SPECTRUM (MIN TO MAX)</text>
      </g>
    </svg>
  `;
}

// 6. HVAC Thermal Heat Load & Proper Detailed Architectural SVG
function calcElectricalFromVI() {
  var v = parseFloat(document.getElementById('elecVolt')?.value) || 230;
  var a = parseFloat(document.getElementById('elecAmps')?.value) || 6.52;
  var wInp = document.getElementById('pwrWatts');
  if (wInp) wInp.value = Math.round(v * a);
  calcBtu();
}

function calcBtu() {
  var w = parseFloat(document.getElementById('pwrWatts')?.value) || 1500;
  var btu = w * 3.412142;
  var tons = btu / 12000.0;
  var cfm = btu / (1.08 * 20.0); // 20°F delta T typical
  var acKw = tons * 3.517;

  var elBtu = document.getElementById('resBtuVal');
  if (elBtu) elBtu.innerText = Math.round(btu).toLocaleString() + ' BTU/h';
  var elCfm = document.getElementById('resCfmAir');
  if (elCfm) elCfm.innerText = Math.round(cfm).toLocaleString() + ' CFM';
  var acEl = document.getElementById('resAcReqDetail');
  if (acEl) {
    acEl.innerText = `RECOMMENDED AC UNIT: ${tons.toFixed(2)} TR (${acKw.toFixed(2)} kW Cooling) • ${Math.ceil(tons / 1.5)} × 1.5 Ton Localized Split / Cassette Unit(s)`;
  }

  renderBtuThermalSvg(w, btu, cfm, tons);
}

function renderBtuThermalSvg(watts, btu, cfm, tons) {
  var container = document.getElementById('btuThermalSvgContainer');
  if (!container) return;

  var svgW = 540, svgH = 220;
  container.innerHTML = `
    <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
      <defs>
        <linearGradient id="heatPlume" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#ef4444" stop-opacity="0.8"/>
          <stop offset="60%" stop-color="#f97316" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#eab308" stop-opacity="0.1"/>
        </linearGradient>
        <linearGradient id="coolSupply" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.2"/>
        </linearGradient>
      </defs>

      <!-- Floor Line -->
      <line x1="20" y1="190" x2="520" y2="190" stroke="#334155" stroke-width="2"/>
      <text x="30" y="205" font-size="8" fill="#64748b">Finished Floor Level (AFFL)</text>

      <!-- Equipment Rack / AV Wall (Heat Source) -->
      <g transform="translate(60, 70)">
        <rect x="0" y="0" width="70" height="120" fill="#1e293b" stroke="#f87171" stroke-width="2" rx="4"/>
        <!-- Server / AV chassis blades -->
        <rect x="6" y="10" width="58" height="15" fill="#0f172a" stroke="#475569"/>
        <circle cx="14" cy="17" r="2" fill="#22c55e"/><circle cx="22" cy="17" r="2" fill="#38bdf8"/>
        <rect x="6" y="32" width="58" height="15" fill="#0f172a" stroke="#475569"/>
        <circle cx="14" cy="39" r="2" fill="#22c55e"/>
        <rect x="6" y="54" width="58" height="25" fill="#0f172a" stroke="#ef4444"/>
        <text x="35" y="70" font-size="8" font-weight="bold" fill="#fca5a5" text-anchor="middle">Power Supply</text>
        <rect x="6" y="86" width="58" height="25" fill="#0f172a" stroke="#f59e0b"/>
        <text x="35" y="102" font-size="8" font-weight="bold" fill="#fde68a" text-anchor="middle">Amplifiers</text>
        <text x="35" y="-6" font-size="9" font-weight="bold" fill="#f87171" text-anchor="middle">AV Rack (${watts} W)</text>
      </g>

      <!-- Convection Thermal Heat Plume -->
      <path d="M 80,68 C 75,40 105,25 110,10 M 110,68 C 105,35 135,20 140,5" stroke="url(#heatPlume)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <polygon points="110,5 106,12 114,12" fill="#ef4444"/>
      <polygon points="140,2 136,9 144,9" fill="#f97316"/>

      <!-- Ceiling Return Air Extract Grille -->
      <g transform="translate(170, 10)">
        <rect x="0" y="0" width="90" height="16" fill="#1e293b" stroke="#eab308" stroke-width="1.5" rx="2"/>
        <line x1="15" y1="4" x2="15" y2="12" stroke="#eab308"/><line x1="30" y1="4" x2="30" y2="12" stroke="#eab308"/>
        <line x1="45" y1="4" x2="45" y2="12" stroke="#eab308"/><line x1="60" y1="4" x2="60" y2="12" stroke="#eab308"/><line x1="75" y1="4" x2="75" y2="12" stroke="#eab308"/>
        <text x="45" y="28" font-size="8" font-weight="bold" fill="#fde047" text-anchor="middle">Return Air (35°C)</text>
      </g>

      <!-- Localized Ceiling AC Unit / Fan Coil (Cool Supply) -->
      <g transform="translate(340, 10)">
        <rect x="0" y="0" width="130" height="35" fill="#0f172a" stroke="#38bdf8" stroke-width="2" rx="4"/>
        <circle cx="25" cy="18" r="8" fill="#1e293b" stroke="#38bdf8"/>
        <circle cx="105" cy="18" r="8" fill="#1e293b" stroke="#38bdf8"/>
        <text x="65" y="22" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle">AC Unit (${tons.toFixed(1)} TR)</text>

        <!-- Downward chilled airflow vector arrows -->
        <polygon points="40,38 90,38 105,150 25,150" fill="url(#coolSupply)"/>
        <line x1="45" y1="40" x2="35" y2="140" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,3"/>
        <line x1="85" y1="40" x2="95" y2="140" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,3"/>
        <text x="65" y="165" font-size="8" font-weight="bold" fill="#38bdf8" text-anchor="middle">Cool Supply (16°C • ${Math.round(cfm)} CFM)</text>
      </g>

      <!-- Key Callout HUD Badges -->
      <g transform="translate(200, 60)">
        <rect x="0" y="0" width="125" height="50" fill="#020617" stroke="#334155" rx="6"/>
        <text x="10" y="18" font-size="9" fill="#f87171">Heat Load:</text>
        <text x="115" y="18" font-size="9" font-weight="bold" fill="#f87171" text-anchor="end">${Math.round(btu).toLocaleString()} BTU/h</text>
        <text x="10" y="32" font-size="9" fill="#38bdf8">AC Tonnage:</text>
        <text x="115" y="32" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="end">${tons.toFixed(2)} TR</text>
        <text x="10" y="45" font-size="8" fill="#94a3b8">Airflow:</text>
        <text x="115" y="45" font-size="8" font-weight="bold" fill="#e2e8f0" text-anchor="end">${Math.round(cfm)} CFM</text>
      </g>
    </svg>
  `;
}

// 7. 2D Geometric Shapes
function updateAreaShapeInputs() {
  var shape = document.getElementById('shapeTypeArea')?.value || 'rectangle';
  var unit = document.getElementById('shapeAreaUnitSelect')?.value || 'mm';
  var container = document.getElementById('shapeAreaInputs');
  if (!container) return;

  var uUpper = unit.toUpperCase();
  var defVal1 = unit === 'mm' ? 6000 : (unit === 'm' ? 6 : (unit === 'cm' ? 600 : (unit === 'ft' ? 20 : 240)));
  var defVal2 = unit === 'mm' ? 8000 : (unit === 'm' ? 8 : (unit === 'cm' ? 800 : (unit === 'ft' ? 26 : 315)));
  var defVal3 = unit === 'mm' ? 4000 : (unit === 'm' ? 4 : (unit === 'cm' ? 400 : (unit === 'ft' ? 13 : 157)));

  if (shape === 'rectangle') {
    container.innerHTML = `<div class="row g-2">
      <div class="col-6"><label class="small text-secondary fw-bold">WIDTH (${uUpper})</label><input type="number" id="areaW" class="form-control form-control-sm fw-bold" value="${defVal1}" oninput="calcShapeArea()"></div>
      <div class="col-6"><label class="small text-secondary fw-bold">LENGTH (${uUpper})</label><input type="number" id="areaL" class="form-control form-control-sm fw-bold" value="${defVal2}" oninput="calcShapeArea()"></div>
    </div>`;
  } else if (shape === 'triangle') {
    container.innerHTML = `<div class="row g-2">
      <div class="col-6"><label class="small text-secondary fw-bold">BASE b (${uUpper})</label><input type="number" id="areaBase" class="form-control form-control-sm fw-bold" value="${defVal1}" oninput="calcShapeArea()"></div>
      <div class="col-6"><label class="small text-secondary fw-bold">HEIGHT h (${uUpper})</label><input type="number" id="areaH" class="form-control form-control-sm fw-bold" value="${defVal2}" oninput="calcShapeArea()"></div>
    </div>`;
  } else if (shape === 'circle') {
    container.innerHTML = `<div class="mb-2"><label class="small text-secondary fw-bold">RADIUS r (${uUpper})</label><input type="number" id="areaRadius" class="form-control form-control-sm fw-bold text-primary" value="${defVal3}" oninput="calcShapeArea()"></div>`;
  } else if (shape === 'trapezium') {
    container.innerHTML = `<div class="row g-2">
      <div class="col-4"><label class="small text-secondary fw-bold">TOP BASE a (${uUpper})</label><input type="number" id="areaTrapA" class="form-control form-control-sm fw-bold" value="${defVal3}" oninput="calcShapeArea()"></div>
      <div class="col-4"><label class="small text-secondary fw-bold">BOTTOM BASE b (${uUpper})</label><input type="number" id="areaTrapB" class="form-control form-control-sm fw-bold" value="${defVal2}" oninput="calcShapeArea()"></div>
      <div class="col-4"><label class="small text-secondary fw-bold">HEIGHT h (${uUpper})</label><input type="number" id="areaTrapH" class="form-control form-control-sm fw-bold" value="${defVal1}" oninput="calcShapeArea()"></div>
    </div>`;
  } else if (shape === 'polygon') {
    container.innerHTML = `<div class="row g-2">
      <div class="col-6"><label class="small text-secondary fw-bold">NUMBER OF SIDES (n ≥ 3)</label><input type="number" id="areaPolyN" class="form-control form-control-sm fw-bold text-primary" value="6" min="3" max="36" oninput="calcShapeArea()"></div>
      <div class="col-6"><label class="small text-secondary fw-bold">SIDE LENGTH s (${uUpper})</label><input type="number" id="areaPolyS" class="form-control form-control-sm fw-bold" value="${defVal3}" oninput="calcShapeArea()"></div>
    </div>`;
  }
  calcShapeArea();
}

function calcShapeArea() {
  var shape = document.getElementById('shapeTypeArea')?.value || 'rectangle';
  var unit = document.getElementById('shapeAreaUnitSelect')?.value || 'mm';
  var container = document.getElementById('shapeAreaSvgContainer');

  // Convert unit to meters multiplier
  var toMeters = 1;
  if (unit === 'mm') toMeters = 0.001;
  else if (unit === 'cm') toMeters = 0.01;
  else if (unit === 'ft') toMeters = 0.3048;
  else if (unit === 'in') toMeters = 0.0254;

  var area = 0, perim = 0;
  var svgMarkup = '';

  if (shape === 'rectangle') {
    var wRaw = parseFloat(document.getElementById('areaW')?.value) || 0;
    var lRaw = parseFloat(document.getElementById('areaL')?.value) || 0;
    var w = wRaw * toMeters;
    var l = lRaw * toMeters;
    area = w * l;
    perim = 2 * (w + l);

    // Dynamic SVG bounding rectangle scaled to aspect ratio
    var maxDim = Math.max(wRaw, lRaw, 0.001);
    var scale = 140 / maxDim;
    var boxW = Math.max(30, Math.min(270, lRaw * scale));
    var boxH = Math.max(30, Math.min(130, wRaw * scale));
    var bx = (340 - boxW) / 2;
    var by = (180 - boxH) / 2;

    svgMarkup = `<svg viewBox="0 0 340 180" width="100%" height="100%" style="background:#f8fafc; border-radius:8px;">
      <defs>
        <pattern id="recGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.8"/></pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#recGrid)"/>
      <rect x="${bx}" y="${by}" width="${boxW}" height="${boxH}" fill="rgba(37,99,235,0.12)" stroke="#2563eb" stroke-width="2.5" rx="4"/>
      <!-- Dimension labels -->
      <line x1="${bx}" y1="${by + boxH + 12}" x2="${bx + boxW}" y2="${by + boxH + 12}" stroke="#2563eb" stroke-width="1.5"/>
      <text x="${bx + boxW/2}" y="${by + boxH + 24}" font-size="10" font-weight="bold" fill="#1e40af" text-anchor="middle">L: ${lRaw.toLocaleString()} ${unit} (${l.toFixed(2)}m)</text>
      <line x1="${bx - 12}" y1="${by}" x2="${bx - 12}" y2="${by + boxH}" stroke="#2563eb" stroke-width="1.5"/>
      <text x="${bx - 16}" y="${by + boxH/2 + 3}" font-size="10" font-weight="bold" fill="#1e40af" text-anchor="end">W: ${wRaw.toLocaleString()} ${unit}</text>
      <text x="170" y="${by + boxH/2 + 4}" font-size="11" font-weight="bold" fill="#1d4ed8" text-anchor="middle">AREA: ${(unit === 'mm' ? (wRaw*lRaw).toLocaleString() + ' mm²' : area.toFixed(2) + ' m²')}</text>
    </svg>`;
  } else if (shape === 'triangle') {
    var bRaw = parseFloat(document.getElementById('areaBase')?.value) || 0;
    var hRaw = parseFloat(document.getElementById('areaH')?.value) || 0;
    var b = bRaw * toMeters;
    var h = hRaw * toMeters;
    area = 0.5 * b * h;
    perim = b + h + Math.sqrt(b*b + h*h);

    var maxDimT = Math.max(bRaw, hRaw, 0.001);
    var scaleT = 130 / maxDimT;
    var triW = Math.max(30, Math.min(270, bRaw * scaleT));
    var triH = Math.max(30, Math.min(130, hRaw * scaleT));
    var tx1 = 170 - triW/2;
    var tx2 = 170 + triW/2;
    var tyBottom = 90 + triH/2;
    var tyTop = 90 - triH/2;

    svgMarkup = `<svg viewBox="0 0 340 180" width="100%" height="100%" style="background:#f8fafc; border-radius:8px;">
      <defs><pattern id="triGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.8"/></pattern></defs>
      <rect width="100%" height="100%" fill="url(#triGrid)"/>
      <polygon points="${tx1},${tyBottom} ${tx2},${tyBottom} 170,${tyTop}" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="2.5"/>
      <line x1="170" y1="${tyTop}" x2="170" y2="${tyBottom}" stroke="#059669" stroke-width="1.5" stroke-dasharray="3,3"/>
      <text x="175" y="${(tyTop + tyBottom)/2}" font-size="9" font-weight="bold" fill="#047857">h: ${hRaw.toLocaleString()} ${unit}</text>
      <text x="170" y="${tyBottom + 16}" font-size="10" font-weight="bold" fill="#047857" text-anchor="middle">base: ${bRaw.toLocaleString()} ${unit}</text>
      <text x="170" y="${tyBottom - 14}" font-size="11" font-weight="bold" fill="#065f46" text-anchor="middle">TRIANGLE: ${(unit === 'mm' ? (0.5*bRaw*hRaw).toLocaleString() + ' mm²' : area.toFixed(2) + ' m²')}</text>
    </svg>`;
  } else if (shape === 'circle') {
    var rRaw = parseFloat(document.getElementById('areaRadius')?.value) || 0;
    var r = rRaw * toMeters;
    area = Math.PI * r * r;
    perim = 2 * Math.PI * r;

    var rSvg = Math.max(20, Math.min(75, 60));

    svgMarkup = `<svg viewBox="0 0 340 180" width="100%" height="100%" style="background:#f8fafc; border-radius:8px;">
      <defs><pattern id="circGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.8"/></pattern></defs>
      <rect width="100%" height="100%" fill="url(#circGrid)"/>
      <circle cx="170" cy="90" r="${rSvg}" fill="rgba(234,88,12,0.15)" stroke="#ea580c" stroke-width="2.5"/>
      <circle cx="170" cy="90" r="3" fill="#ea580c"/>
      <line x1="170" y1="90" x2="${170 + rSvg}" y2="90" stroke="#c2410c" stroke-width="2"/>
      <text x="${170 + rSvg/2}" y="84" font-size="10" font-weight="bold" fill="#c2410c" text-anchor="middle">r: ${rRaw.toLocaleString()} ${unit}</text>
      <text x="170" y="110" font-size="11" font-weight="bold" fill="#9a3412" text-anchor="middle">CIRCLE AREA: ${(unit === 'mm' ? (Math.PI*rRaw*rRaw).toLocaleString(undefined, {maximumFractionDigits:0}) + ' mm²' : area.toFixed(2) + ' m²')}</text>
      <text x="170" y="170" font-size="9" fill="#64748b" text-anchor="middle">Diameter: ${(rRaw * 2).toLocaleString()} ${unit} &bull; Circumference: ${(perim).toFixed(2)} m</text>
    </svg>`;
  } else if (shape === 'trapezium') {
    var aRaw = parseFloat(document.getElementById('areaTrapA')?.value) || 0;
    var bTrapRaw = parseFloat(document.getElementById('areaTrapB')?.value) || 0;
    var hTrapRaw = parseFloat(document.getElementById('areaTrapH')?.value) || 0;
    var a = aRaw * toMeters;
    var bTrap = bTrapRaw * toMeters;
    var hTrap = hTrapRaw * toMeters;
    area = 0.5 * (a + bTrap) * hTrap;
    perim = a + bTrap + 2 * Math.sqrt(Math.pow((bTrap - a)/2, 2) + hTrap*hTrap);

    var maxDimTr = Math.max(aRaw, bTrapRaw, hTrapRaw, 0.001);
    var scaleTr = 130 / maxDimTr;
    var topW = Math.max(20, Math.min(240, aRaw * scaleTr));
    var botW = Math.max(30, Math.min(280, bTrapRaw * scaleTr));
    var tH = Math.max(20, Math.min(120, hTrapRaw * scaleTr));

    var y1 = 90 - tH/2;
    var y2 = 90 + tH/2;
    var xTop1 = 170 - topW/2, xTop2 = 170 + topW/2;
    var xBot1 = 170 - botW/2, xBot2 = 170 + botW/2;

    svgMarkup = `<svg viewBox="0 0 340 180" width="100%" height="100%" style="background:#f8fafc; border-radius:8px;">
      <defs><pattern id="trapGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.8"/></pattern></defs>
      <rect width="100%" height="100%" fill="url(#trapGrid)"/>
      <polygon points="${xTop1},${y1} ${xTop2},${y1} ${xBot2},${y2} ${xBot1},${y2}" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" stroke-width="2.5"/>
      <line x1="${xTop1}" y1="${y1 - 6}" x2="${xTop2}" y2="${y1 - 6}" stroke="#7c3aed" stroke-width="1.5"/>
      <text x="170" y="${y1 - 10}" font-size="9" font-weight="bold" fill="#6d28d9" text-anchor="middle">a: ${aRaw.toLocaleString()} ${unit}</text>
      <line x1="${xBot1}" y1="${y2 + 8}" x2="${xBot2}" y2="${y2 + 8}" stroke="#7c3aed" stroke-width="1.5"/>
      <text x="170" y="${y2 + 20}" font-size="9" font-weight="bold" fill="#6d28d9" text-anchor="middle">b: ${bTrapRaw.toLocaleString()} ${unit}</text>
      <text x="170" y="94" font-size="11" font-weight="bold" fill="#5b21b6" text-anchor="middle">TRAPEZIUM: ${(unit === 'mm' ? (0.5*(aRaw+bTrapRaw)*hTrapRaw).toLocaleString(undefined, {maximumFractionDigits:0}) + ' mm²' : area.toFixed(2) + ' m²')}</text>
    </svg>`;
  } else if (shape === 'polygon') {
    var n = parseInt(document.getElementById('areaPolyN')?.value) || 6;
    if (n < 3) n = 3;
    if (n > 36) n = 36;
    var sRaw = parseFloat(document.getElementById('areaPolyS')?.value) || 0;
    var s = sRaw * toMeters;
    area = (n * s * s) / (4 * Math.tan(Math.PI / n));
    perim = n * s;

    // Dynamically calculate the EXACT n vertices of regular polygon in SVG!
    var cx = 170, cy = 90;
    var rPoly = 65;
    var pts = [];
    var vertexCircles = '';
    for (var i = 0; i < n; i++) {
      var angle = -Math.PI / 2 + (i * 2 * Math.PI / n);
      var px = cx + rPoly * Math.cos(angle);
      var py = cy + rPoly * Math.sin(angle);
      pts.push(px.toFixed(1) + ',' + py.toFixed(1));
      vertexCircles += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>`;
    }

    var polyName = n === 3 ? 'Equilateral Triangle' : (n === 4 ? 'Square' : (n === 5 ? 'Pentagon' : (n === 6 ? 'Hexagon' : (n === 7 ? 'Heptagon' : (n === 8 ? 'Octagon' : (n === 9 ? 'Nonagon' : (n === 10 ? 'Decagon' : (n === 12 ? 'Dodecagon' : `${n}-gon`))))))));

    svgMarkup = `<svg viewBox="0 0 340 180" width="100%" height="100%" style="background:#f8fafc; border-radius:8px;">
      <defs><pattern id="polyGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.8"/></pattern></defs>
      <rect width="100%" height="100%" fill="url(#polyGrid)"/>
      <polygon points="${pts.join(' ')}" fill="rgba(14,165,233,0.18)" stroke="#0284c7" stroke-width="2.5"/>
      ${vertexCircles}
      <text x="170" y="86" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">${polyName.toUpperCase()} (n=${n})</text>
      <text x="170" y="102" font-size="10" font-weight="bold" fill="#0c4a6e" text-anchor="middle">AREA: ${(unit === 'mm' ? ((n * sRaw * sRaw) / (4 * Math.tan(Math.PI / n))).toLocaleString(undefined, {maximumFractionDigits:0}) + ' mm²' : area.toFixed(2) + ' m²')}</text>
      <text x="170" y="170" font-size="9" fill="#64748b" text-anchor="middle">Side s: ${sRaw.toLocaleString()} ${unit} &bull; Perimeter: ${(unit === 'mm' ? (n * sRaw).toLocaleString() + ' mm' : perim.toFixed(2) + ' m')}</text>
    </svg>`;
  }

  var elArea = document.getElementById('resShapeArea');
  if (elArea) {
    if (unit === 'mm') {
      var mm2 = area * 1e6;
      elArea.innerHTML = `<strong>${mm2.toLocaleString(undefined, {maximumFractionDigits: 1})} mm²</strong> <span class="text-muted fs-6">(${area.toFixed(3)} m² | ${(area * 10.7639).toFixed(2)} ft²)</span>`;
    } else {
      elArea.innerHTML = `<strong>${area.toFixed(2)} m²</strong> <span class="text-muted fs-6">(${(area * 10.7639).toFixed(2)} ft² | ${(area * 1550.003).toLocaleString(undefined, {maximumFractionDigits: 1})} sq in)</span>`;
    }
  }

  var elPerim = document.getElementById('resShapePerim');
  if (elPerim) {
    if (unit === 'mm') {
      elPerim.innerText = `Perimeter: ${(perim * 1000).toLocaleString(undefined, {maximumFractionDigits: 1})} mm (${perim.toFixed(2)} m | ${(perim * 3.28084).toFixed(2)} ft)`;
    } else {
      elPerim.innerText = `Perimeter: ${perim.toFixed(2)} m (${(perim * 3.28084).toFixed(2)} ft | ${(perim * 39.3701).toFixed(1)} in)`;
    }
  }
  if (container) container.innerHTML = svgMarkup;
}

// 8. 3D Shape Volume Calculator with Beautiful True 3D Isometric Visuals & Dynamic Scaling
function update3DShapeInputs() {
  var shape = document.getElementById('shape3DTypeSelect')?.value || 'cuboid';
  var unit = document.getElementById('shape3DUnitSelect')?.value || 'mm';
  var container = document.getElementById('shape3DInputsContainer');
  if (!container) return;

  var uUpper = unit.toUpperCase();
  var defL = unit === 'mm' ? 8000 : (unit === 'm' ? 8 : (unit === 'cm' ? 800 : (unit === 'ft' ? 26 : 315)));
  var defW = unit === 'mm' ? 6000 : (unit === 'm' ? 6 : (unit === 'cm' ? 600 : (unit === 'ft' ? 20 : 236)));
  var defH = unit === 'mm' ? 2700 : (unit === 'm' ? 2.7 : (unit === 'cm' ? 270 : (unit === 'ft' ? 9 : 106)));
  var defR = unit === 'mm' ? 2500 : (unit === 'm' ? 2.5 : (unit === 'cm' ? 250 : (unit === 'ft' ? 8 : 98)));

  if (shape === 'cuboid') {
    container.innerHTML = `<div class="row g-2">
      <div class="col-4"><label class="small text-secondary fw-bold">LENGTH L (${uUpper})</label><input type="number" id="volMmL" class="form-control form-control-sm fw-bold" value="${defL}" oninput="calc3DRoomVolume()"></div>
      <div class="col-4"><label class="small text-secondary fw-bold">WIDTH W (${uUpper})</label><input type="number" id="volMmW" class="form-control form-control-sm fw-bold" value="${defW}" oninput="calc3DRoomVolume()"></div>
      <div class="col-4"><label class="small text-secondary fw-bold">HEIGHT H (${uUpper})</label><input type="number" id="volMmH" class="form-control form-control-sm fw-bold" value="${defH}" oninput="calc3DRoomVolume()"></div>
    </div>`;
  } else if (shape === 'cube') {
    container.innerHTML = `<div class="mb-2"><label class="small text-secondary fw-bold">SIDE s (${uUpper})</label><input type="number" id="volCubeS" class="form-control form-control-sm fw-bold text-danger" value="${defW}" oninput="calc3DRoomVolume()"></div>`;
  } else if (shape === 'cylinder') {
    container.innerHTML = `<div class="row g-2">
      <div class="col-6"><label class="small text-secondary fw-bold">RADIUS r (${uUpper})</label><input type="number" id="volCylR" class="form-control form-control-sm fw-bold text-danger" value="${defR}" oninput="calc3DRoomVolume()"></div>
      <div class="col-6"><label class="small text-secondary fw-bold">HEIGHT H (${uUpper})</label><input type="number" id="volCylH" class="form-control form-control-sm fw-bold text-danger" value="${defL/2}" oninput="calc3DRoomVolume()"></div>
    </div>`;
  } else if (shape === 'pyramid') {
    container.innerHTML = `<div class="row g-2">
      <div class="col-4"><label class="small text-secondary fw-bold">BASE L (${uUpper})</label><input type="number" id="volPyrL" class="form-control form-control-sm fw-bold" value="${defW}" oninput="calc3DRoomVolume()"></div>
      <div class="col-4"><label class="small text-secondary fw-bold">BASE W (${uUpper})</label><input type="number" id="volPyrW" class="form-control form-control-sm fw-bold" value="${defW}" oninput="calc3DRoomVolume()"></div>
      <div class="col-4"><label class="small text-secondary fw-bold">HEIGHT H (${uUpper})</label><input type="number" id="volPyrH" class="form-control form-control-sm fw-bold" value="${defL/2}" oninput="calc3DRoomVolume()"></div>
    </div>`;
  } else if (shape === 'cone') {
    container.innerHTML = `<div class="row g-2">
      <div class="col-6"><label class="small text-secondary fw-bold">RADIUS r (${uUpper})</label><input type="number" id="volConeR" class="form-control form-control-sm fw-bold text-warning" value="${defR}" oninput="calc3DRoomVolume()"></div>
      <div class="col-6"><label class="small text-secondary fw-bold">HEIGHT H (${uUpper})</label><input type="number" id="volConeH" class="form-control form-control-sm fw-bold text-warning" value="${defL/2 + 500}" oninput="calc3DRoomVolume()"></div>
    </div>`;
  } else if (shape === 'sphere') {
    container.innerHTML = `<div class="mb-2"><label class="small text-secondary fw-bold">RADIUS r (${uUpper})</label><input type="number" id="volSphereR" class="form-control form-control-sm fw-bold text-danger" value="${defR}" oninput="calc3DRoomVolume()"></div>`;
  } else if (shape === 'prism') {
    container.innerHTML = `<div class="row g-2">
      <div class="col-4"><label class="small text-secondary fw-bold">TRI BASE b (${uUpper})</label><input type="number" id="volPrismB" class="form-control form-control-sm fw-bold text-info" value="${defW}" oninput="calc3DRoomVolume()"></div>
      <div class="col-4"><label class="small text-secondary fw-bold">TRI HEIGHT h (${uUpper})</label><input type="number" id="volPrismH" class="form-control form-control-sm fw-bold text-info" value="${defH}" oninput="calc3DRoomVolume()"></div>
      <div class="col-4"><label class="small text-secondary fw-bold">LENGTH L (${uUpper})</label><input type="number" id="volPrismL" class="form-control form-control-sm fw-bold text-info" value="${defL}" oninput="calc3DRoomVolume()"></div>
    </div>`;
  } else if (shape === 'capsule') {
    container.innerHTML = `<div class="row g-2">
      <div class="col-6"><label class="small text-secondary fw-bold">CYLINDER LENGTH L (${uUpper})</label><input type="number" id="volCapL" class="form-control form-control-sm fw-bold text-success" value="${defW}" oninput="calc3DRoomVolume()"></div>
      <div class="col-6"><label class="small text-secondary fw-bold">END RADIUS r (${uUpper})</label><input type="number" id="volCapR" class="form-control form-control-sm fw-bold text-success" value="${defR}" oninput="calc3DRoomVolume()"></div>
    </div>`;
  }
  calc3DRoomVolume();
}

function calc3DRoomVolume() {
  var shape = document.getElementById('shape3DTypeSelect')?.value || 'cuboid';
  var unit = document.getElementById('shape3DUnitSelect')?.value || 'mm';
  var container = document.getElementById('room3DVolumeSvgContainer');

  var toM = 0.001;
  if (unit === 'm') toM = 1;
  else if (unit === 'cm') toM = 0.01;
  else if (unit === 'ft') toM = 0.3048;
  else if (unit === 'in') toM = 0.0254;

  var volM3 = 0, surfM2 = 0;
  var svgMarkup = '';

  if (shape === 'cuboid') {
    var lRaw = parseFloat(document.getElementById('volMmL')?.value) || 0;
    var wRaw = parseFloat(document.getElementById('volMmW')?.value) || 0;
    var hRaw = parseFloat(document.getElementById('volMmH')?.value) || 0;
    var l = lRaw * toM, w = wRaw * toM, h = hRaw * toM;
    volM3 = l * w * h;
    surfM2 = 2 * (l * w + l * h + w * h);

    // Dynamic isometric 3D scaling based on entered L, W, H
    var maxDim = Math.max(lRaw, wRaw, hRaw, 1);
    var dL = Math.max(20, Math.min(100, (lRaw / maxDim) * 90));
    var dW = Math.max(20, Math.min(90, (wRaw / maxDim) * 80));
    var dH = Math.max(20, Math.min(80, (hRaw / maxDim) * 75));

    var cx = 190, cy = 115;
    var pFront = { x: cx, y: cy + dW*0.35 + dL*0.2 };
    var pLeft = { x: cx - dW, y: cy + dW*0.35 - dL*0.1 };
    var pRight = { x: cx + dL, y: cy - dW*0.1 + dL*0.2 };
    var pBack = { x: cx + dL - dW, y: cy - dW*0.1 - dL*0.1 };

    svgMarkup = `
      <svg viewBox="0 0 380 210" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
        <defs>
          <linearGradient id="cuboidTop" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
          <linearGradient id="cuboidFront" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0369a1"/></linearGradient>
          <linearGradient id="cuboidSide" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#075985"/><stop offset="100%" stop-color="#0c4a6e"/></linearGradient>
        </defs>
        <ellipse cx="190" cy="${pFront.y + 15}" rx="${(dL + dW)*0.7}" ry="15" fill="rgba(0,0,0,0.5)"/>
        
        <!-- Top Face -->
        <polygon points="${pLeft.x},${pLeft.y - dH} ${pBack.x},${pBack.y - dH} ${pRight.x},${pRight.y - dH} ${pFront.x},${pFront.y - dH}" fill="url(#cuboidTop)" stroke="#7dd3fc" stroke-width="1.5"/>
        <!-- Left Front Face -->
        <polygon points="${pLeft.x},${pLeft.y - dH} ${pFront.x},${pFront.y - dH} ${pFront.x},${pFront.y} ${pLeft.x},${pLeft.y}" fill="url(#cuboidFront)" stroke="#7dd3fc" stroke-width="1.5"/>
        <!-- Right Face -->
        <polygon points="${pFront.x},${pFront.y - dH} ${pRight.x},${pRight.y - dH} ${pRight.x},${pRight.y} ${pFront.x},${pFront.y}" fill="url(#cuboidSide)" stroke="#7dd3fc" stroke-width="1.5"/>

        <!-- Dynamic dimension labels -->
        <text x="${pLeft.x - 5}" y="${pLeft.y - dH/2}" font-size="9" font-weight="bold" fill="#facc15" text-anchor="end">H: ${hRaw.toLocaleString()} ${unit}</text>
        <text x="${(pLeft.x + pFront.x)/2 - 10}" y="${(pLeft.y + pFront.y)/2 + 15}" font-size="9" font-weight="bold" fill="#4ade80" text-anchor="middle">W: ${wRaw.toLocaleString()} ${unit}</text>
        <text x="${(pFront.x + pRight.x)/2 + 10}" y="${(pFront.y + pRight.y)/2 + 15}" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle">L: ${lRaw.toLocaleString()} ${unit}</text>
        <text x="190" y="22" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="middle">3D CUBOID: ${volM3.toFixed(2)} m³ (${(volM3 * 35.3147).toFixed(1)} ft³)</text>
      </svg>`;
  } else if (shape === 'cube') {
    var sRaw = parseFloat(document.getElementById('volCubeS')?.value) || 0;
    var s = sRaw * toM;
    volM3 = Math.pow(s, 3);
    surfM2 = 6 * Math.pow(s, 2);

    svgMarkup = `
      <svg viewBox="0 0 380 210" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
        <defs>
          <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fb7185"/><stop offset="100%" stop-color="#e11d48"/></linearGradient>
          <linearGradient id="cubeFront" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#e11d48"/><stop offset="100%" stop-color="#9f1239"/></linearGradient>
          <linearGradient id="cubeSide" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#be123c"/><stop offset="100%" stop-color="#881337"/></linearGradient>
        </defs>
        <ellipse cx="190" cy="180" rx="110" ry="18" fill="rgba(0,0,0,0.5)"/>
        <polygon points="130,70 210,40 270,70 190,100" fill="url(#cubeTop)" stroke="#fda4af" stroke-width="1.5"/>
        <polygon points="130,70 190,100 190,170 130,140" fill="url(#cubeFront)" stroke="#fda4af" stroke-width="1.5"/>
        <polygon points="190,100 270,70 270,140 190,170" fill="url(#cubeSide)" stroke="#fda4af" stroke-width="1.5"/>
        <text x="110" y="110" font-size="9" font-weight="bold" fill="#facc15">s: ${sRaw.toLocaleString()} ${unit}</text>
        <text x="190" y="22" font-size="11" font-weight="bold" fill="#fda4af" text-anchor="middle">3D CUBE: ${volM3.toFixed(2)} m³ (${(volM3 * 35.3147).toFixed(1)} ft³)</text>
      </svg>`;
  } else if (shape === 'cylinder') {
    var rRaw = parseFloat(document.getElementById('volCylR')?.value) || 0;
    var hRaw = parseFloat(document.getElementById('volCylH')?.value) || 0;
    var r = rRaw * toM, h = hRaw * toM;
    volM3 = Math.PI * r * r * h;
    surfM2 = 2 * Math.PI * r * h + 2 * Math.PI * r * r;

    var maxDimC = Math.max(rRaw * 2, hRaw, 1);
    var cylR = Math.max(25, Math.min(85, (rRaw / maxDimC) * 110));
    var cylH = Math.max(25, Math.min(100, (hRaw / maxDimC) * 110));
    var cyCenter = 120;
    var cyTop = cyCenter - cylH/2;
    var cyBot = cyCenter + cylH/2;

    svgMarkup = `
      <svg viewBox="0 0 380 210" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
        <defs>
          <linearGradient id="cylBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0284c7"/><stop offset="30%" stop-color="#38bdf8"/><stop offset="70%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0369a1"/>
          </linearGradient>
          <linearGradient id="cylTopCap" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
        </defs>
        <ellipse cx="190" cy="${cyBot + 15}" rx="${cylR + 15}" ry="14" fill="rgba(0,0,0,0.5)"/>
        <path d="M ${190 - cylR},${cyTop} L ${190 - cylR},${cyBot} A ${cylR} 18 0 0 0 ${190 + cylR},${cyBot} L ${190 + cylR},${cyTop} Z" fill="url(#cylBody)" stroke="#38bdf8" stroke-width="1.5"/>
        <ellipse cx="190" cy="${cyBot}" rx="${cylR}" ry="18" fill="none" stroke="#7dd3fc" stroke-width="1" stroke-dasharray="3,3"/>
        <ellipse cx="190" cy="${cyTop}" rx="${cylR}" ry="18" fill="url(#cylTopCap)" stroke="#38bdf8" stroke-width="2"/>
        <line x1="190" y1="${cyTop}" x2="${190 + cylR}" y2="${cyTop}" stroke="#facc15" stroke-width="1.5"/>
        <text x="${190 + cylR/2}" y="${cyTop - 5}" font-size="9" font-weight="bold" fill="#facc15" text-anchor="middle">r: ${rRaw.toLocaleString()} ${unit}</text>
        <line x1="${190 - cylR - 15}" y1="${cyTop}" x2="${190 - cylR - 15}" y2="${cyBot}" stroke="#4ade80" stroke-width="1.5"/>
        <text x="${190 - cylR - 20}" y="${cyCenter + 3}" font-size="9" font-weight="bold" fill="#4ade80" text-anchor="end">H: ${hRaw.toLocaleString()} ${unit}</text>
        <text x="190" y="22" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="middle">3D CYLINDER: ${volM3.toFixed(2)} m³ (${(volM3 * 35.3147).toFixed(1)} ft³)</text>
      </svg>`;
  } else if (shape === 'pyramid') {
    var lRaw = parseFloat(document.getElementById('volPyrL')?.value) || 0;
    var wRaw = parseFloat(document.getElementById('volPyrW')?.value) || 0;
    var hRaw = parseFloat(document.getElementById('volPyrH')?.value) || 0;
    var l = lRaw * toM, w = wRaw * toM, h = hRaw * toM;
    volM3 = (l * w * h) / 3;
    surfM2 = l * w + l * Math.sqrt(Math.pow(w/2, 2) + h*h) + w * Math.sqrt(Math.pow(l/2, 2) + h*h);

    svgMarkup = `
      <svg viewBox="0 0 380 210" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
        <defs>
          <linearGradient id="pyrFront" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
          <linearGradient id="pyrSide" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
        </defs>
        <ellipse cx="190" cy="180" rx="110" ry="16" fill="rgba(0,0,0,0.5)"/>
        <line x1="90" y1="140" x2="200" y2="110" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
        <line x1="200" y1="110" x2="300" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
        <line x1="190" y1="40" x2="190" y2="135" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3"/>
        <polygon points="190,40 90,140 190,175" fill="url(#pyrFront)" stroke="#fde047" stroke-width="1.5"/>
        <polygon points="190,40 190,175 300,140" fill="url(#pyrSide)" stroke="#fde047" stroke-width="1.5"/>
        <text x="140" y="170" font-size="9" font-weight="bold" fill="#fde047">W: ${wRaw.toLocaleString()} ${unit}</text>
        <text x="250" y="170" font-size="9" font-weight="bold" fill="#fde047">L: ${lRaw.toLocaleString()} ${unit}</text>
        <text x="195" y="90" font-size="9" font-weight="bold" fill="#ef4444">H: ${hRaw.toLocaleString()} ${unit}</text>
        <text x="190" y="22" font-size="11" font-weight="bold" fill="#facc15" text-anchor="middle">3D PYRAMID: ${volM3.toFixed(2)} m³ (${(volM3 * 35.3147).toFixed(1)} ft³)</text>
      </svg>`;
  } else if (shape === 'cone') {
    var rRaw = parseFloat(document.getElementById('volConeR')?.value) || 0;
    var hRaw = parseFloat(document.getElementById('volConeH')?.value) || 0;
    var r = rRaw * toM, h = hRaw * toM;
    volM3 = (Math.PI * r * r * h) / 3;
    var slant = Math.sqrt(r*r + h*h);
    surfM2 = Math.PI * r * (r + slant);

    svgMarkup = `
      <svg viewBox="0 0 380 210" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
        <defs>
          <linearGradient id="coneBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ea580c"/><stop offset="35%" stop-color="#fb923c"/><stop offset="70%" stop-color="#ea580c"/><stop offset="100%" stop-color="#c2410c"/>
          </linearGradient>
        </defs>
        <ellipse cx="190" cy="180" rx="90" ry="18" fill="rgba(0,0,0,0.5)"/>
        <path d="M 190,40 L 115,160 A 75 18 0 0 0 265,160 Z" fill="url(#coneBody)" stroke="#fdba74" stroke-width="1.5"/>
        <ellipse cx="190" cy="160" rx="75" ry="18" fill="none" stroke="#fdba74" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="190" y1="40" x2="190" y2="160" stroke="#facc15" stroke-width="1.5" stroke-dasharray="3,3"/>
        <line x1="190" y1="160" x2="265" y2="160" stroke="#facc15" stroke-width="1.5"/>
        <text x="225" y="155" font-size="9" font-weight="bold" fill="#facc15" text-anchor="middle">r: ${rRaw.toLocaleString()} ${unit}</text>
        <text x="180" y="105" font-size="9" font-weight="bold" fill="#facc15" text-anchor="end">H: ${hRaw.toLocaleString()} ${unit}</text>
        <text x="190" y="22" font-size="11" font-weight="bold" fill="#fb923c" text-anchor="middle">3D CONE: ${volM3.toFixed(2)} m³ (${(volM3 * 35.3147).toFixed(1)} ft³)</text>
      </svg>`;
  } else if (shape === 'sphere') {
    var rRaw = parseFloat(document.getElementById('volSphereR')?.value) || 0;
    var r = rRaw * toM;
    volM3 = (4/3) * Math.PI * Math.pow(r, 3);
    surfM2 = 4 * Math.PI * r * r;

    svgMarkup = `
      <svg viewBox="0 0 380 210" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
        <defs>
          <radialGradient id="sphereGrad" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#f0abfc"/><stop offset="25%" stop-color="#c084fc"/><stop offset="60%" stop-color="#7e22ce"/><stop offset="100%" stop-color="#3b0764"/>
          </radialGradient>
        </defs>
        <ellipse cx="190" cy="185" rx="85" ry="16" fill="rgba(0,0,0,0.5)"/>
        <circle cx="190" cy="105" r="70" fill="url(#sphereGrad)" stroke="#e879f9" stroke-width="2"/>
        <ellipse cx="190" cy="105" rx="70" ry="22" fill="none" stroke="rgba(240,171,252,0.4)" stroke-width="1.5" stroke-dasharray="4,3"/>
        <circle cx="190" cy="105" r="3" fill="#ffffff"/>
        <line x1="190" y1="105" x2="260" y2="105" stroke="#ffffff" stroke-width="2"/>
        <text x="225" y="98" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">r: ${rRaw.toLocaleString()} ${unit}</text>
        <text x="190" y="22" font-size="11" font-weight="bold" fill="#e879f9" text-anchor="middle">3D SPHERE: ${volM3.toFixed(2)} m³ (${(volM3 * 35.3147).toFixed(1)} ft³)</text>
      </svg>`;
  } else if (shape === 'prism') {
    var bRaw = parseFloat(document.getElementById('volPrismB')?.value) || 0;
    var hRaw = parseFloat(document.getElementById('volPrismH')?.value) || 0;
    var lRaw = parseFloat(document.getElementById('volPrismL')?.value) || 0;
    var b = bRaw * toM, h = hRaw * toM, l = lRaw * toM;
    volM3 = 0.5 * b * h * l;
    var side = Math.sqrt(Math.pow(b/2, 2) + h*h);
    surfM2 = b * h + b * l + 2 * side * l;

    svgMarkup = `
      <svg viewBox="0 0 380 210" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
        <defs>
          <linearGradient id="prismFront" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
          <linearGradient id="prismSide" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#075985"/><stop offset="100%" stop-color="#0c4a6e"/></linearGradient>
        </defs>
        <ellipse cx="190" cy="180" rx="120" ry="18" fill="rgba(0,0,0,0.5)"/>
        <polygon points="140,60 80,160 200,160" fill="url(#prismFront)" stroke="#7dd3fc" stroke-width="1.5"/>
        <polygon points="140,60 270,30 310,120 200,160" fill="url(#prismSide)" stroke="#7dd3fc" stroke-width="1.5"/>
        <line x1="80" y1="160" x2="200" y2="160" stroke="#facc15" stroke-width="1.5"/>
        <text x="140" y="175" font-size="9" font-weight="bold" fill="#facc15" text-anchor="middle">b: ${bRaw.toLocaleString()} ${unit}</text>
        <line x1="140" y1="60" x2="140" y2="160" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="3,3"/>
        <text x="130" y="110" font-size="9" font-weight="bold" fill="#4ade80" text-anchor="end">h: ${hRaw.toLocaleString()} ${unit}</text>
        <line x1="210" y1="162" x2="315" y2="122" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="270" y="152" font-size="9" font-weight="bold" fill="#38bdf8">L: ${lRaw.toLocaleString()} ${unit}</text>
        <text x="190" y="22" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="middle">3D TRIANGULAR PRISM: ${volM3.toFixed(2)} m³ (${(volM3 * 35.3147).toFixed(1)} ft³)</text>
      </svg>`;
  } else if (shape === 'capsule') {
    var lRaw = parseFloat(document.getElementById('volCapL')?.value) || 0;
    var rRaw = parseFloat(document.getElementById('volCapR')?.value) || 0;
    var l = lRaw * toM, r = rRaw * toM;
    var cylVol = Math.PI * r * r * l;
    var sphereVol = (4/3) * Math.PI * Math.pow(r, 3);
    volM3 = cylVol + sphereVol;
    surfM2 = 2 * Math.PI * r * l + 4 * Math.PI * r * r;

    svgMarkup = `
      <svg viewBox="0 0 380 210" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
        <defs>
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#4ade80"/><stop offset="50%" stop-color="#16a34a"/><stop offset="100%" stop-color="#14532d"/>
          </linearGradient>
        </defs>
        <ellipse cx="190" cy="180" rx="130" ry="18" fill="rgba(0,0,0,0.5)"/>
        <rect x="120" y="70" width="140" height="70" fill="url(#capGrad)" stroke="#86efac" stroke-width="1.5"/>
        <path d="M 120,70 A 35 35 0 0 0 120,140 Z" fill="url(#capGrad)" stroke="#86efac" stroke-width="1.5"/>
        <path d="M 260,70 A 35 35 0 0 1 260,140 Z" fill="url(#capGrad)" stroke="#86efac" stroke-width="1.5"/>
        <line x1="120" y1="105" x2="260" y2="105" stroke="#facc15" stroke-width="1.5" stroke-dasharray="3,3"/>
        <text x="190" y="100" font-size="9" font-weight="bold" fill="#facc15" text-anchor="middle">L: ${lRaw.toLocaleString()} ${unit}</text>
        <line x1="260" y1="105" x2="295" y2="105" stroke="#ffffff" stroke-width="1.5"/>
        <text x="280" y="98" font-size="8" font-weight="bold" fill="#ffffff">r: ${rRaw.toLocaleString()} ${unit}</text>
        <text x="190" y="22" font-size="11" font-weight="bold" fill="#4ade80" text-anchor="middle">3D CAPSULE / TANK: ${volM3.toFixed(2)} m³ (${(volM3 * 35.3147).toFixed(1)} ft³)</text>
      </svg>`;
  }

  var elV = document.getElementById('res3DVolM3');
  if (elV) {
    if (unit === 'mm') {
      var mm3 = volM3 * 1e9;
      elV.innerHTML = `<strong>${mm3.toLocaleString(undefined, {maximumFractionDigits: 0})} mm³</strong> <span class="text-muted fs-6">(${volM3.toFixed(2)} m³ | ${(volM3 * 35.3147).toFixed(1)} ft³)</span>`;
    } else {
      elV.innerText = `${volM3.toFixed(2)} m³ (${(volM3 * 35.3147).toFixed(2)} ft³ | ${(volM3 * 61023.7).toLocaleString(undefined, {maximumFractionDigits: 1})} cu in)`;
    }
  }
  var elS = document.getElementById('res3DSurfaceAreaM2');
  if (elS) {
    if (unit === 'mm') {
      var sMm2 = surfM2 * 1e6;
      elS.innerText = `Surface Area: ${sMm2.toLocaleString(undefined, {maximumFractionDigits: 0})} mm² (${surfM2.toFixed(2)} m² | ${(surfM2 * 10.7639).toFixed(2)} ft²)`;
    } else {
      elS.innerText = `Surface Area: ${surfM2.toFixed(2)} m² (${(surfM2 * 10.7639).toFixed(2)} ft² | ${(surfM2 * 1550.003).toLocaleString(undefined, {maximumFractionDigits: 1})} sq in)`;
    }
  }
  if (container) container.innerHTML = svgMarkup;
}

// 9. AV Continuous Tape & Scientific Calculator with Physical Keyboard Support
let tapeHistory = [];
let tapeExpr = '';
let tapeValue = '0';
let tapeAngleMode = 'DEG'; // 'DEG' or 'RAD'

function setTapeAngleMode(mode) {
  tapeAngleMode = mode;
  var bDeg = document.getElementById('btnTapeDeg');
  var bRad = document.getElementById('btnTapeRad');
  if (bDeg) bDeg.classList.toggle('active', mode === 'DEG');
  if (bRad) bRad.classList.toggle('active', mode === 'RAD');
}

function tapeInput(val) {
  if (tapeValue === '0' && val !== '.') {
    tapeValue = val;
  } else {
    tapeValue += val;
  }
  var d = document.getElementById('tapeMainDisplay');
  if (d) d.innerText = tapeValue;
}

function tapeOp(op) {
  tapeExpr += (tapeExpr ? ' ' : '') + tapeValue + ' ' + op;
  tapeValue = '0';
  var expD = document.getElementById('tapeExprDisplay');
  if (expD) expD.innerText = tapeExpr;
  var mainD = document.getElementById('tapeMainDisplay');
  if (mainD) mainD.innerText = '0';
}

function tapeAction(act) {
  if (act === 'clear') {
    tapeExpr = '';
    tapeValue = '0';
  }
  if (act === 'back') {
    tapeValue = tapeValue.length > 1 ? tapeValue.slice(0, -1) : '0';
  }
  if (act === 'eval') {
    try {
      var fullExpr = (tapeExpr ? tapeExpr + ' ' : '') + tapeValue;
      var sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');

      var res = eval(sanitized);
      var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      tapeHistory.unshift({ expr: fullExpr, res: res, time: timeStr });
      tapeValue = String(res);
      tapeExpr = '';
      renderTapeHistory();
    } catch(e) {
      tapeValue = 'Error';
    }
  }
  var expD = document.getElementById('tapeExprDisplay');
  if (expD) expD.innerText = tapeExpr || '&nbsp;';
  var mainD = document.getElementById('tapeMainDisplay');
  if (mainD) mainD.innerText = tapeValue;
}

function tapeSci(fn) {
  var v = parseFloat(tapeValue) || 0;
  var res = v;
  var radFactor = (tapeAngleMode === 'DEG') ? (Math.PI / 180.0) : 1.0;
  var degFactor = (tapeAngleMode === 'DEG') ? (180.0 / Math.PI) : 1.0;

  if (fn === 'sin') res = Math.sin(v * radFactor);
  else if (fn === 'cos') res = Math.cos(v * radFactor);
  else if (fn === 'tan') res = Math.tan(v * radFactor);
  else if (fn === 'asin') res = Math.asin(v) * degFactor;
  else if (fn === 'acos') res = Math.acos(v) * degFactor;
  else if (fn === 'atan') res = Math.atan(v) * degFactor;
  else if (fn === 'sqrt') res = Math.sqrt(v);
  else if (fn === 'cbrt') res = Math.cbrt(v);
  else if (fn === 'sq') res = v * v;
  else if (fn === 'cube') res = v * v * v;
  else if (fn === 'ln') res = Math.log(v);
  else if (fn === 'log10') res = Math.log10(v);
  else if (fn === 'exp') res = Math.exp(v);
  else if (fn === '10x') res = Math.pow(10, v);
  else if (fn === 'inv') res = v !== 0 ? (1.0 / v) : 0;
  else if (fn === 'neg') res = -v;
  else if (fn === 'pct') res = v / 100.0;
  else if (fn === 'pi') res = Math.PI;
  else if (fn === 'e') res = Math.E;
  else if (fn === 'fact') {
    res = 1;
    for (var i = 2; i <= Math.min(20, Math.floor(v)); i++) res *= i;
  }

  tapeValue = String(res);
  var mainD = document.getElementById('tapeMainDisplay');
  if (mainD) mainD.innerText = tapeValue;
}

function recallTapeResult(res) {
  tapeValue = String(res);
  var mainD = document.getElementById('tapeMainDisplay');
  if (mainD) mainD.innerText = tapeValue;
}

function renderTapeHistory() {
  var box = document.getElementById('tapeHistoryBox');
  if (!box) return;
  var html = '';
  tapeHistory.forEach((item, idx) => {
    html += `
      <div class="tape-history-item p-2 mb-2 rounded bg-white border border-secondary-subtle shadow-sm" style="font-size:0.82rem;">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="text-secondary font-mono fw-bold" style="font-size:0.7rem;">#${tapeHistory.length - idx} &bull; ${item.time}</span>
          <button type="button" class="btn btn-outline-primary btn-sm py-0 px-2 font-mono fw-bold" style="font-size:0.7rem;" onclick="recallTapeResult(${item.res})" title="Recall into calculator">Recall</button>
        </div>
        <div class="text-dark font-mono fw-semibold">${item.expr} =</div>
        <div class="fs-6 fw-bold text-primary font-mono">${item.res}</div>
      </div>
    `;
  });
  box.innerHTML = html || '<div class="text-dark fw-bold text-center py-4 font-mono small">No calculations recorded yet. Keypad and physical keyboard entries supported.</div>';
}

function clearTapeHistory() {
  tapeHistory = [];
  renderTapeHistory();
}

function exportTapeToExcel() {
  if (!tapeHistory || tapeHistory.length === 0) {
    alert('No tape calculations recorded yet to export.');
    return;
  }
  var html = '<html><body><table><tr><th>Time</th><th>Expression</th><th>Result</th></tr>';
  tapeHistory.forEach(item => {
    html += `<tr><td>${item.time}</td><td>${item.expr}</td><td>${item.res}</td></tr>`;
  });
  html += '</table></body></html>';
  var blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `AV_Tape_History_${Date.now()}.xls`;
  a.click();
}

// ==========================================
// ENGINEERING CONSTANTS & FORMULA EXTENSIONS
// ==========================================
let activeConstantCategory = 'all';

function filterConstantsList(category) {
  if (category) {
    activeConstantCategory = category;
    document.querySelectorAll('.btn-constant-filter').forEach(btn => {
      var isTarget = btn.getAttribute('data-cat') === category;
      btn.classList.toggle('active', isTarget);
      btn.classList.toggle('btn-primary', isTarget);
      btn.classList.toggle('btn-outline-secondary', !isTarget);
    });
  }
  var query = (document.getElementById('constantsSearchInput')?.value || '').toLowerCase().trim();
  var items = document.querySelectorAll('.constant-item');
  var visibleCount = 0;
  items.forEach(item => {
    var itemCat = item.getAttribute('data-category');
    var keywords = (item.getAttribute('data-keywords') || '').toLowerCase();
    var text = item.innerText.toLowerCase();
    var matchesCat = (activeConstantCategory === 'all' || itemCat === activeConstantCategory);
    var matchesQuery = !query || keywords.includes(query) || text.includes(query);
    if (matchesCat && matchesQuery) {
      item.style.display = '';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });
  var countBadge = document.getElementById('constantsCountBadge');
  if (countBadge) countBadge.innerText = `${visibleCount} Constants`;
}

function insertConstantToFormula(symbol, numVal) {
  var input = document.getElementById('customFormulaExprInput');
  if (!input) return;
  var start = input.selectionStart != null ? input.selectionStart : input.value.length;
  var end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
  var text = input.value;
  input.value = text.slice(0, start) + symbol + text.slice(end);
  input.focus();
  input.setSelectionRange(start + symbol.length, start + symbol.length);
}

function insertConstantToCalc(val, name) {
  tapeValue = String(val);
  var mainD = document.getElementById('tapeMainDisplay');
  if (mainD) mainD.innerText = tapeValue;
  var expD = document.getElementById('tapeExprDisplay');
  if (expD && name) expD.innerText = `Loaded: ${name}`;
}

function setConstantToVar(varName, val) {
  var input = document.getElementById('varVal' + varName);
  if (input) {
    input.value = val;
    input.classList.add('border-primary', 'bg-primary-subtle');
    setTimeout(() => {
      input.classList.remove('border-primary', 'bg-primary-subtle');
    }, 600);
  }
}

function copyConstantValue(val, btn) {
  var valStr = String(val);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(valStr).then(() => {
      showCopyFeedback(btn);
    }).catch(() => {
      fallbackTextCopy(valStr, btn);
    });
  } else {
    fallbackTextCopy(valStr, btn);
  }
}

function fallbackTextCopy(text, btn) {
  var temp = document.createElement('textarea');
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
  showCopyFeedback(btn);
}

function showCopyFeedback(btn) {
  if (!btn) return;
  var origHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-check text-success"></i>';
  setTimeout(() => {
    btn.innerHTML = origHtml;
  }, 1200);
}

function evalCustomFormula() {
  try {
    var rawExpr = document.getElementById('customFormulaExprInput')?.value || 'sqrt(A*A + B*B)';
    var valA = parseFloat(document.getElementById('varValA')?.value) || 0;
    var valB = parseFloat(document.getElementById('varValB')?.value) || 0;
    var valC = parseFloat(document.getElementById('varValC')?.value) || 0;
    var valD = parseFloat(document.getElementById('varValD')?.value) || 0;

    // Expand common engineering constants and mathematical functions
    var processed = rawExpr
      // Constants substitutions
      .replace(/\bPI\b/gi, `(${Math.PI})`)
      .replace(/π/g, `(${Math.PI})`)
      .replace(/\be\b/g, `(${Math.E})`)
      .replace(/\bc\b/g, `(299792458)`)
      .replace(/\bv_sound\b/gi, `(343.2)`)
      .replace(/\bvsound\b/gi, `(343.2)`)
      .replace(/\bg\b/g, `(9.80665)`)
      .replace(/\bh\b/g, `(6.62607015e-34)`)
      .replace(/\bhbar\b/gi, `(1.054571817e-34)`)
      .replace(/\b(kB|k_B)\b/g, `(1.380649e-23)`)
      .replace(/\bphi\b/gi, `(1.618033988749895)`)
      .replace(/\bsqrt2\b/gi, `(1.414213562373095)`)
      .replace(/\bZ0\b/gi, `(376.730313668)`)
      .replace(/\beps0\b/gi, `(8.8541878128e-12)`)
      .replace(/\bmu0\b/gi, `(1.25663706212e-6)`)
      .replace(/\bV_ref\b/gi, `(0.7745966692)`)
      .replace(/\bp0_spl\b/gi, `(0.00002)`)
      // Substitute user variables A, B, C, D
      .replace(/\bA\b/g, `(${valA})`)
      .replace(/\bB\b/g, `(${valB})`)
      .replace(/\bC\b/g, `(${valC})`)
      .replace(/\bD\b/g, `(${valD})`)
      // Mathematical functions
      .replace(/\bsqrt\b/gi, 'Math.sqrt')
      .replace(/\bcbrt\b/gi, 'Math.cbrt')
      .replace(/\bsin\b/gi, 'Math.sin')
      .replace(/\bcos\b/gi, 'Math.cos')
      .replace(/\btan\b/gi, 'Math.tan')
      .replace(/\basin\b/gi, 'Math.asin')
      .replace(/\bacos\b/gi, 'Math.acos')
      .replace(/\batan\b/gi, 'Math.atan')
      .replace(/\bsinh\b/gi, 'Math.sinh')
      .replace(/\bcosh\b/gi, 'Math.cosh')
      .replace(/\btanh\b/gi, 'Math.tanh')
      .replace(/\bln\b/gi, 'Math.log')
      .replace(/\blog10\b/gi, 'Math.log10')
      .replace(/\blog\b/gi, 'Math.log10')
      .replace(/\bexp\b/gi, 'Math.exp')
      .replace(/\babs\b/gi, 'Math.abs')
      .replace(/\^/g, '**');

    var res = eval(processed);
    if (isNaN(res)) throw new Error('Calculation resulted in NaN');
    var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    tapeHistory.unshift({ expr: `${rawExpr} (A=${valA}, B=${valB}, C=${valC}, D=${valD})`, res: res, time: timeStr });
    tapeValue = String(res);
    var mainD = document.getElementById('tapeMainDisplay');
    if (mainD) mainD.innerText = tapeValue;
    var expD = document.getElementById('tapeExprDisplay');
    if (expD) expD.innerText = `${rawExpr} =`;
    renderTapeHistory();
  } catch(err) {
    alert('Formula Error: ' + err.message);
  }
}

// Physical Keyboard Listener for Scientific Calculator
window.addEventListener('keydown', function(e) {
  // Only trigger if Tab 8 is open and user is not typing in a regular text input
  var tab8 = document.getElementById('Tab8');
  if (!tab8 || tab8.style.display === 'none') return;
  var tag = e.target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

  var k = e.key;
  if ((k >= '0' && k <= '9') || k === '.') {
    tapeInput(k);
    e.preventDefault();
  } else if (k === '+' || k === '-' || k === '*' || k === '/') {
    tapeOp(k);
    e.preventDefault();
  } else if (k === 'Enter' || k === '=') {
    tapeAction('eval');
    e.preventDefault();
  } else if (k === 'Backspace') {
    tapeAction('back');
    e.preventDefault();
  } else if (k === 'Escape') {
    tapeAction('clear');
    e.preventDefault();
  } else if (k === '(' || k === ')') {
    tapeInput(k);
    e.preventDefault();
  }
});

function runAllTab8Calculations() {
  applyScaleToInputVal();
  convertUniversalDimensions();
  convertUniversalLength();
  convertUniversalArea();
  convertUniversalVol();
  calcAreaFromInches();
  calcVolFromInches();
  convertUniversalWeight();
  calcDisplayNitsImpact();
  calcAvAudioUnits();
  calcAvDataUnits();
  calcAvLightUnits();
  calcAvRiggingUnits();
  updateAreaShapeInputs();
  update3DShapeInputs();
  calcElectricalFromVI();
}

// ==========================================
// TAB 8: EXPORT TO JSON & EXPORT TO PDF
// ==========================================
function getTab8CalculatedData() {
  // 1 & 2. Architectural Scale
  var sfDraw = parseFloat(document.getElementById('sfDraw')?.value) || 50;
  var sfReal = parseFloat(document.getElementById('sfReal')?.value) || 2.5;
  var ratioVal = (sfReal * 1000.0) / (sfDraw > 0 ? sfDraw : 1);
  var scaleInVal = parseFloat(document.getElementById('scaleInputDimVal')?.value) || 2500;
  var scaleInUnit = document.getElementById('scaleInputUnitSelect')?.value || 'mm';
  var scaledDownText = document.getElementById('resScaledDownVal')?.innerText || '';
  var scaledUpText = document.getElementById('resScaledUpVal')?.innerText || '';

  // 3. Multi-Unit 3D Dimensions
  var lVal = parseFloat(document.getElementById('dimLengthVal')?.value) || 0;
  var lUnit = document.getElementById('dimLengthUnit')?.value || 'm';
  var wVal = parseFloat(document.getElementById('dimWidthVal')?.value) || 0;
  var wUnit = document.getElementById('dimWidthUnit')?.value || 'm';
  var hVal = parseFloat(document.getElementById('dimHeightVal')?.value) || 0;
  var hUnit = document.getElementById('dimHeightUnit')?.value || 'm';
  var l_m = convertDimensionToMeters(lVal, lUnit);
  var w_m = convertDimensionToMeters(wVal, wUnit);
  var h_m = convertDimensionToMeters(hVal, hUnit);
  var areaSqm = l_m * w_m;
  var volCum = l_m * w_m * h_m;

  // Independent Converters
  var uLenVal = parseFloat(document.getElementById('unitLengthVal')?.value) || 0;
  var uLenType = document.getElementById('unitLengthType')?.value || 'm';
  var uAreaVal = parseFloat(document.getElementById('unitAreaVal')?.value) || 0;
  var uAreaType = document.getElementById('unitAreaType')?.value || 'sqm';
  var uAreaTargetType = document.getElementById('unitAreaTargetType')?.value || 'sqin';
  var directAreaCalloutText = document.getElementById('directAreaConversionCallout')?.innerText?.replace(/\s+/g, ' ').trim() || '';

  var uVolVal = parseFloat(document.getElementById('unitVolVal')?.value) || 0;
  var uVolType = document.getElementById('unitVolType')?.value || 'cum';
  var uVolTargetType = document.getElementById('unitVolTargetType')?.value || 'cuin';
  var directVolCalloutText = document.getElementById('directVolConversionCallout')?.innerText?.replace(/\s+/g, ' ').trim() || '';

  var uWeightVal = parseFloat(document.getElementById('unitWeightVal')?.value) || 0;
  var uWeightType = document.getElementById('unitWeightType')?.value || 'kg';

  // 4. Essential AV Engineering Units
  var avAudioV = parseFloat(document.getElementById('avAudioVoltVal')?.value) || 0.775;
  var avDataMbps = parseFloat(document.getElementById('avDataMbpsVal')?.value) || 1000;
  var avLux = parseFloat(document.getElementById('avLuxVal')?.value) || 500;
  var avRiggingKg = parseFloat(document.getElementById('avRiggingKgSqm')?.value) || 45;

  // 5. Display Nits
  var nitsLux = parseFloat(document.getElementById('nitsAmbientLuxInput')?.value) || 500;
  var nitsRefl = parseFloat(document.getElementById('nitsReflectanceSelect')?.value) || 0.02;
  var nitsContrast = parseFloat(document.getElementById('nitsContrastTargetSelect')?.value) || 15.0;
  var recNitsText = document.getElementById('resRecommendedNits')?.innerText || '';
  var estContrastText = document.getElementById('resEstContrastRatio')?.innerText || '';

  // 6. HVAC Thermal Heat Load
  var pwrW = parseFloat(document.getElementById('pwrWatts')?.value) || 1500;
  var voltV = parseFloat(document.getElementById('elecVolt')?.value) || 230;
  var ampsA = parseFloat(document.getElementById('elecAmps')?.value) || 6.52;
  var btuText = document.getElementById('resBtuVal')?.innerText || '';
  var cfmText = document.getElementById('resCfmAir')?.innerText || '';
  var acRecText = document.getElementById('resAcReqDetail')?.innerText || '';

  // 7. Area Geometry
  var areaShape = document.getElementById('areaShapeTypeSelect')?.value || 'rectangle';
  var areaResText = document.getElementById('resAreaGeomM2')?.innerText || '';

  // 8. 3D Shape Volume & Surface Area
  var shape3D = document.getElementById('shape3DTypeSelect')?.value || 'cuboid';
  var vol3DText = document.getElementById('res3DVolM3')?.innerText || '';
  var surf3DText = document.getElementById('res3DSurfaceAreaM2')?.innerText || '';

  // 9. Scientific Tape & Formulas
  var customForm = document.getElementById('customFormulaExprInput')?.value || '';
  var varA = document.getElementById('varValA')?.value || '';
  var varB = document.getElementById('varValB')?.value || '';
  var varC = document.getElementById('varValC')?.value || '';
  var varD = document.getElementById('varValD')?.value || '';

  return {
    application: "Pro AV System Architect",
    suite: "Universal AV Engineering & Multi-Unit Mathematical Suite (Tab 8)",
    exportTimestamp: new Date().toISOString(),
    exportDateFormatted: new Date().toLocaleString(),
    architecturalScaleConverter: {
      referenceDrawingLengthMm: sfDraw,
      referenceRealSiteLengthM: sfReal,
      calculatedScaleRatio: `1:${ratioVal.toFixed(2)}`,
      inputDimension: { value: scaleInVal, unit: scaleInUnit },
      drawingScaledDownResult: scaledDownText,
      realSiteScaledUpResult: scaledUpText
    },
    universal3DDimensions: {
      inputs: {
        length: { value: lVal, unit: lUnit },
        width: { value: wVal, unit: wUnit },
        heightThickness: { value: hVal, unit: hUnit }
      },
      convertedDimensions: {
        meters: { length: l_m, width: w_m, height: h_m },
        feet: { length: +(l_m * 3.28084).toFixed(3), width: +(w_m * 3.28084).toFixed(3), height: +(h_m * 3.28084).toFixed(3) },
        inches: { length: +(l_m * 39.3701).toFixed(2), width: +(w_m * 39.3701).toFixed(2), height: +(h_m * 39.3701).toFixed(2) },
        millimeters: { length: Math.round(l_m * 1000), width: Math.round(w_m * 1000), height: Math.round(h_m * 1000) }
      },
      computedSurfaceArea: {
        squareMeters: +(areaSqm).toFixed(3),
        squareFeet: +(areaSqm * 10.7639).toFixed(2),
        squareInches: +(areaSqm * 1550.003).toFixed(1)
      },
      computedVolume: {
        cubicMeters: +(volCum).toFixed(3),
        cubicFeet: +(volCum * 35.3147).toFixed(2),
        cubicInches: +(volCum * 61023.7).toFixed(1),
        liters: +(volCum * 1000).toFixed(1)
      }
    },
    independentConverters: {
      lengthConverter: { inputValue: uLenVal, inputUnit: uLenType },
      areaConverter: {
        inputValue: uAreaVal,
        inputUnit: uAreaType,
        targetUnit: uAreaTargetType,
        directConversionSummary: directAreaCalloutText,
        includesSquareInches: true
      },
      volumeConverter: {
        inputValue: uVolVal,
        inputUnit: uVolType,
        targetUnit: uVolTargetType,
        directConversionSummary: directVolCalloutText,
        includesCubicInches: true
      },
      weightConverter: { inputValue: uWeightVal, inputUnit: uWeightType }
    },
    essentialAvEngineeringUnits: {
      audioVoltage: {
        inputVolts: avAudioV,
        dBu: +(20 * Math.log10(avAudioV / 0.775)).toFixed(2),
        dBV: +(20 * Math.log10(avAudioV / 1.0)).toFixed(2)
      },
      networkBandwidth: {
        inputMbps: avDataMbps,
        gigabitsPerSec: +(avDataMbps / 1000.0).toFixed(3),
        megabytesPerSec: +(avDataMbps * 0.125).toFixed(1)
      },
      roomIllumination: {
        inputLux: avLux,
        footCandles: +(avLux / 10.764).toFixed(2)
      },
      riggingLoad: {
        inputKgPerSqm: avRiggingKg,
        poundsPerSqFt: +(avRiggingKg * 0.204816).toFixed(2),
        kiloNewtonsPerSqm: +(avRiggingKg * 0.00980665).toFixed(3)
      }
    },
    displayLuminanceAndPerception: {
      ambientIlluminanceLux: nitsLux,
      screenAntiGlareReflectanceRate: nitsRefl,
      targetContrastRatio: `${nitsContrast}:1`,
      recommendedDisplayLuminance: recNitsText,
      estimatedReflectedGlareAndTier: estContrastText
    },
    hvacThermalHeatLoad: {
      totalPowerWatts: pwrW,
      supplyVoltageVolts: voltV,
      ratedCurrentAmps: ampsA,
      thermalHeatDissipation: btuText,
      requiredAirflowAirExchange: cfmText,
      airConditioningTonnageRequirement: acRecText
    },
    areaGeometry2D: {
      selectedShape: areaShape,
      calculatedArea: areaResText
    },
    solidGeometry3D: {
      selectedShape: shape3D,
      calculatedVolume: vol3DText,
      calculatedSurfaceArea: surf3DText
    },
    scientificTapeCalculator: {
      activeExpression: tapeExpr || '0',
      activeDisplayValue: tapeValue,
      angleMode: tapeAngleMode,
      customFormula: {
        expression: customForm,
        variables: { A: varA, B: varB, C: varC, D: varD }
      },
      continuousTapeHistory: tapeHistory
    }
  };
}

function exportTab8ToJSON() {
  alert('Exporting or downloading program code and raw data archives is disabled on this platform for security and IP protection.');
}

function exportTab8ToPDF() {
  try {
    var data = getTab8CalculatedData();
    var timestamp = new Date().toLocaleString();

    // Create high-contrast printable report container with HCMM watermark
    var report = document.createElement('div');
    report.id = 'tab8-pdf-export-temp';
    report.style.position = 'relative';
    report.style.overflow = 'hidden';
    report.style.width = '780px';
    report.style.padding = '25px';
    report.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    report.style.color = '#0f172a';
    report.style.backgroundColor = '#ffffff';
    report.style.lineHeight = '1.4';

    var tapeHistoryHtml = '';
    if (data.scientificTapeCalculator.continuousTapeHistory && data.scientificTapeCalculator.continuousTapeHistory.length > 0) {
      tapeHistoryHtml = data.scientificTapeCalculator.continuousTapeHistory.slice(0, 12).map((item, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px;">
          <td style="padding: 4px 8px; color:#64748b;">#${data.scientificTapeCalculator.continuousTapeHistory.length - idx}</td>
          <td style="padding: 4px 8px; color:#64748b;">${item.time}</td>
          <td style="padding: 4px 8px; color:#1e293b;">${item.expr}</td>
          <td style="padding: 4px 8px; font-weight: bold; color:#0284c7; text-align:right;">${item.res}</td>
        </tr>
      `).join('');
    } else {
      tapeHistoryHtml = `<tr><td colspan="4" style="padding: 10px; text-align:center; color:#94a3b8; font-style:italic;">No recorded tape calculation steps yet.</td></tr>`;
    }

    report.innerHTML = `
      <!-- Large diagonal HCMM watermark overlay -->
      <div style="position: absolute; top: 46%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 140px; font-weight: 900; color: rgba(15, 23, 42, 0.08); letter-spacing: 20px; font-family: sans-serif; pointer-events: none; z-index: 0; user-select: none; white-space: nowrap;">
        HCMM
      </div>

      <!-- Report Header -->
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 18px; position: relative; z-index: 2;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="margin:0 0 4px 0; color:#1e3a8a; font-size:20px; font-weight:800; letter-spacing:-0.5px;">
                PRO AV SYSTEM ARCHITECT
              </h2>
              <span style="font-size: 10px; font-weight: 800; color: #dc2626; border: 1.5px solid #dc2626; border-radius: 4px; padding: 2px 7px; background: #fef2f2; font-family: monospace;">
                WATERMARK: HCMM
              </span>
            </div>
            <div style="font-size:13px; font-weight:bold; color:#2563eb;">
              Universal AV Engineering &amp; Multi-Unit Mathematical Suite Report
            </div>
          </div>
          <div style="text-align:right; font-size:11px; color:#64748b; font-family:monospace;">
            <div><strong>Generated:</strong> ${timestamp}</div>
            <div><strong>Standard:</strong> AVIXA &amp; Commercial AV</div>
          </div>
        </div>
      </div>

      <!-- Section 1: Architectural Drawing Scale Converter -->
      <div style="margin-bottom: 16px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #f8fafc;">
        <div style="font-size:13px; font-weight:bold; color:#1e40af; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
          1 &amp; 2. ARCHITECTURAL DRAWING SCALE &amp; CONVERTED DIMENSIONS
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          <tr>
            <td style="padding:4px 8px; width:25%;"><strong>Reference Inputs:</strong></td>
            <td style="padding:4px 8px; width:25%; color:#334155;">Drawing: ${data.architecturalScaleConverter.referenceDrawingLengthMm} mm = Site: ${data.architecturalScaleConverter.referenceRealSiteLengthM} m</td>
            <td style="padding:4px 8px; width:25%;"><strong>Input to Scale:</strong></td>
            <td style="padding:4px 8px; width:25%; font-weight:bold; color:#2563eb;">${data.architecturalScaleConverter.inputDimension.value} ${data.architecturalScaleConverter.inputDimension.unit}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;"><strong>Drawing Scaled Down:</strong></td>
            <td style="padding:4px 8px; font-weight:bold; color:#16a34a;">${data.architecturalScaleConverter.drawingScaledDownResult}</td>
            <td style="padding:4px 8px;"><strong>Real Site Scaled Up:</strong></td>
            <td style="padding:4px 8px; font-weight:bold; color:#dc2626;">${data.architecturalScaleConverter.realSiteScaledUpResult}</td>
          </tr>
        </table>
      </div>

      <!-- Section 2: Universal Multi-Unit Dimensions, Area & Volume -->
      <div style="margin-bottom: 16px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #ffffff;">
        <div style="font-size:13px; font-weight:bold; color:#0f766e; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
          3. UNIVERSAL MULTI-UNIT DIMENSIONS, AREA &amp; VOLUME
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px;">
          <tr style="background:#f1f5f9;">
            <th style="padding:5px 8px; text-align:left;">Dimension</th>
            <th style="padding:5px 8px; text-align:left;">User Input</th>
            <th style="padding:5px 8px; text-align:left;">Metric (Meters)</th>
            <th style="padding:5px 8px; text-align:left;">Imperial (Feet)</th>
            <th style="padding:5px 8px; text-align:left;">Inches</th>
            <th style="padding:5px 8px; text-align:left;">Millimeters</th>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:4px 8px; font-weight:bold;">Length (L)</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.inputs.length.value} ${data.universal3DDimensions.inputs.length.unit}</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.meters.length} m</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.feet.length} ft</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.inches.length} in</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.millimeters.length} mm</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:4px 8px; font-weight:bold;">Width (W)</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.inputs.width.value} ${data.universal3DDimensions.inputs.width.unit}</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.meters.width} m</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.feet.width} ft</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.inches.width} in</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.millimeters.width} mm</td>
          </tr>
          <tr>
            <td style="padding:4px 8px; font-weight:bold;">Height/Thick (H/T)</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.inputs.heightThickness.value} ${data.universal3DDimensions.inputs.heightThickness.unit}</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.meters.height} m</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.feet.height} ft</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.inches.height} in</td>
            <td style="padding:4px 8px;">${data.universal3DDimensions.convertedDimensions.millimeters.height} mm</td>
          </tr>
        </table>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; padding:6px 10px; font-size:11px; margin-bottom:8px;">
          <div><strong style="color:#2563eb;">Computed Surface Area:</strong> ${data.universal3DDimensions.computedSurfaceArea.squareMeters} m² &bull; ${data.universal3DDimensions.computedSurfaceArea.squareFeet} ft² &bull; <strong>${data.universal3DDimensions.computedSurfaceArea.squareInches.toLocaleString()} in² (Square Inches)</strong></div>
          <div><strong style="color:#059669;">Computed Volume:</strong> ${data.universal3DDimensions.computedVolume.cubicMeters} m³ &bull; ${data.universal3DDimensions.computedVolume.cubicFeet} ft³ &bull; <strong>${data.universal3DDimensions.computedVolume.cubicInches.toLocaleString()} in³ (Cubic Inches)</strong> &bull; ${data.universal3DDimensions.computedVolume.liters} Liters</div>
        </div>
        <!-- Independent Area & Volume Converters Summary -->
        <div style="display:flex; gap:8px; font-size:10.5px;">
          <div style="flex:1; background:#eff6ff; border:1px solid #bfdbfe; border-radius:4px; padding:6px 8px;">
            <strong style="color:#1d4ed8;">Independent Area Converter:</strong><br>
            ${data.independentConverters.areaConverter.directConversionSummary || `${data.independentConverters.areaConverter.inputValue} ${data.independentConverters.areaConverter.inputUnit} &rarr; ${data.independentConverters.areaConverter.targetUnit}`}
          </div>
          <div style="flex:1; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:4px; padding:6px 8px;">
            <strong style="color:#15803d;">Independent Volume Converter:</strong><br>
            ${data.independentConverters.volumeConverter.directConversionSummary || `${data.independentConverters.volumeConverter.inputValue} ${data.independentConverters.volumeConverter.inputUnit} &rarr; ${data.independentConverters.volumeConverter.targetUnit}`}
          </div>
        </div>
      </div>

      <!-- Section 3: Display Luminance (Nits) & HVAC Thermal Load -->
      <div style="display:flex; gap:12px; margin-bottom:16px;">
        <!-- Left: Display Nits -->
        <div style="flex:1; border:1px solid #cbd5e1; border-radius:6px; padding:12px; background:#fff;">
          <div style="font-size:13px; font-weight:bold; color:#b45309; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
            5. DISPLAY NITS (LUMINANCE) &amp; PERCEPTION
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <tr><td style="padding:3px 0;"><strong>Ambient Room Lighting:</strong></td><td style="padding:3px 0; text-align:right;">${data.displayLuminanceAndPerception.ambientIlluminanceLux} Lux</td></tr>
            <tr><td style="padding:3px 0;"><strong>Target Contrast Ratio:</strong></td><td style="padding:3px 0; text-align:right;">${data.displayLuminanceAndPerception.targetContrastRatio}</td></tr>
            <tr><td style="padding:3px 0;"><strong>Recommended Luminance:</strong></td><td style="padding:3px 0; text-align:right; font-weight:bold; color:#d97706;">${data.displayLuminanceAndPerception.recommendedDisplayLuminance}</td></tr>
          </table>
          <div style="margin-top:6px; font-size:10px; color:#475569; background:#fffbeb; padding:4px 6px; border-radius:4px; border:1px solid #fde68a;">
            ${data.displayLuminanceAndPerception.estimatedReflectedGlareAndTier.replace(/<[^>]*>/g, ' ')}
          </div>
        </div>

        <!-- Right: HVAC Heat Load -->
        <div style="flex:1; border:1px solid #cbd5e1; border-radius:6px; padding:12px; background:#fff;">
          <div style="font-size:13px; font-weight:bold; color:#dc2626; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
            6. HVAC THERMAL HEAT LOAD &amp; AIR CONDITIONING
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <tr><td style="padding:3px 0;"><strong>Equipment Electrical Power:</strong></td><td style="padding:3px 0; text-align:right;">${data.hvacThermalHeatLoad.totalPowerWatts} Watts (${data.hvacThermalHeatLoad.supplyVoltageVolts}V / ${data.hvacThermalHeatLoad.ratedCurrentAmps}A)</td></tr>
            <tr><td style="padding:3px 0;"><strong>Thermal Heat Dissipation:</strong></td><td style="padding:3px 0; text-align:right; font-weight:bold; color:#dc2626;">${data.hvacThermalHeatLoad.thermalHeatDissipation}</td></tr>
            <tr><td style="padding:3px 0;"><strong>Air Exchange Flow Rate:</strong></td><td style="padding:3px 0; text-align:right; font-weight:bold; color:#0284c7;">${data.hvacThermalHeatLoad.requiredAirflowAirExchange}</td></tr>
          </table>
          <div style="margin-top:6px; font-size:10px; font-weight:bold; color:#991b1b; background:#fef2f2; padding:4px 6px; border-radius:4px; border:1px solid #fecaca;">
            ${data.hvacThermalHeatLoad.coolingRequirementDetails}
          </div>
        </div>
      </div>

      <!-- Section 4: 3D Solid Geometry & AV Engineering Quick Units -->
      <div style="display:flex; gap:12px; margin-bottom:16px;">
        <div style="flex:1; border:1px solid #cbd5e1; border-radius:6px; padding:12px; background:#fff;">
          <div style="font-size:13px; font-weight:bold; color:#7c3aed; margin-bottom:6px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
            8. 3D SHAPE VOLUME &amp; SURFACE AREA
          </div>
          <div style="font-size:11px;">
            <div><strong>Active Geometric Shape:</strong> <span style="text-transform:capitalize; font-weight:bold; color:#7c3aed;">${data.solidGeometry3D.selectedShape}</span></div>
            <div><strong>Calculated Volume:</strong> <span style="font-weight:bold; color:#16a34a;">${data.solidGeometry3D.calculatedVolume}</span></div>
            <div><strong>Calculated Surface Area:</strong> <span style="font-weight:bold; color:#0284c7;">${data.solidGeometry3D.calculatedSurfaceArea}</span></div>
          </div>
        </div>

        <div style="flex:1; border:1px solid #cbd5e1; border-radius:6px; padding:12px; background:#fff;">
          <div style="font-size:13px; font-weight:bold; color:#475569; margin-bottom:6px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
            4. ESSENTIAL AV ENGINEERING UNITS
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:10.5px;">
            <tr><td><strong>Audio Gain:</strong></td><td>${data.essentialAvEngineeringUnits.audioVoltage.inputVolts}V &rarr; ${data.essentialAvEngineeringUnits.audioVoltage.dBu} dBu / ${data.essentialAvEngineeringUnits.audioVoltage.dBV} dBV</td></tr>
            <tr><td><strong>Network Throughput:</strong></td><td>${data.essentialAvEngineeringUnits.networkBandwidth.inputMbps} Mbps &rarr; ${data.essentialAvEngineeringUnits.networkBandwidth.gigabitsPerSec} Gbps (${data.essentialAvEngineeringUnits.networkBandwidth.megabytesPerSec} MB/s)</td></tr>
            <tr><td><strong>Light Lux:</strong></td><td>${data.essentialAvEngineeringUnits.roomIllumination.inputLux} Lux = ${data.essentialAvEngineeringUnits.roomIllumination.footCandles} Foot-Candles</td></tr>
          </table>
        </div>
      </div>

      <!-- Section 5: Continuous Tape & Formula Calculator Audit Log -->
      <div style="border:1px solid #cbd5e1; border-radius:6px; padding:12px; background:#fff;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
          <div style="font-size:13px; font-weight:bold; color:#0f172a;">
            9. SCIENTIFIC CONTINUOUS AUDIT TAPE &amp; FORMULA HISTORY
          </div>
          <div style="font-size:11px; font-family:monospace; color:#64748b;">
            Active Angle Mode: <strong>${data.scientificTapeCalculator.angleMode}</strong>
          </div>
        </div>
        ${data.scientificTapeCalculator.customFormula.expression ? `
          <div style="font-size:11px; background:#f8fafc; border:1px solid #e2e8f0; padding:4px 8px; border-radius:4px; margin-bottom:8px; font-family:monospace;">
            <strong>Custom Formula:</strong> ${data.scientificTapeCalculator.customFormula.expression} (A=${data.scientificTapeCalculator.customFormula.variables.A}, B=${data.scientificTapeCalculator.customFormula.variables.B}, C=${data.scientificTapeCalculator.customFormula.variables.C})
          </div>
        ` : ''}
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#f1f5f9; font-size:10px; color:#475569; text-transform:uppercase;">
              <th style="padding:4px 8px; text-align:left;">#</th>
              <th style="padding:4px 8px; text-align:left;">Time</th>
              <th style="padding:4px 8px; text-align:left;">Formula Expression</th>
              <th style="padding:4px 8px; text-align:right;">Calculated Result</th>
            </tr>
          </thead>
          <tbody>
            ${tapeHistoryHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#64748b; font-family:monospace; position:relative; z-index:2; border-top:1px solid #cbd5e1; padding-top:6px;">
        <span>Pro AV System Architect &bull; Multi-Unit Suite</span>
        <span style="font-weight:bold; color:#dc2626;">HCMM CERTIFIED &bull; [WATERMARK: HCMM]</span>
        <span>Exported on ${timestamp}</span>
      </div>
    `;

    document.body.appendChild(report);

    if (typeof html2pdf !== 'undefined') {
      var opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `AV_Calculator_Suite_HCMM_Report_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(report).save().then(function() {
        if (report && report.parentNode) report.parentNode.removeChild(report);
      }).catch(function(err) {
        console.warn('html2pdf generation error, falling back to window print:', err);
        if (report && report.parentNode) report.parentNode.removeChild(report);
        window.print();
      });
    } else {
      if (report && report.parentNode) report.parentNode.removeChild(report);
      window.print();
    }
  } catch(err) {
    alert("Export to PDF failed: " + err.message);
  }
}


// ==========================================
// TAB 9: CABLES, CONNECTORS & UNIVERSAL CONVERTER DIRECTORY
// ==========================================
const PRO_AV_CABLES = {
  'hdmi_copper': {
    name: 'HDMI 2.0 / 2.1 Passive Copper Cable',
    maxPassiveM: 7.5,
    maxBandwidth: '18 Gbps (HDMI 2.0) / 48 Gbps (HDMI 2.1 FRL)',
    connector: 'HDMI Type-A 19-Pin Male Connector (Gold Plated)',
    pinout: '19 Pins: 4 Shielded TMDS Data/Clock Twisted Pairs (Pins 1-12), CEC (Pin 13), Utility/HEAC (Pin 14), DDC I²C Clock/Data (Pins 15-16), Ground (Pin 17), +5V Power (Pin 18), Hot Plug Detect HPD (Pin 19).',
    alternative: 'HDMI 2.1 Active Optical Cable (AOC) up to 100m, or HDBaseT 3.0 CAT6A Extender Set up to 100m, or SDVoE 10G IP Fiber Transceiver up to 10km.'
  },
  'hdmi_aoc': {
    name: 'HDMI 2.1 Active Optical Cable (AOC)',
    maxPassiveM: 100.0,
    maxBandwidth: '48 Gbps Uncompressed 8K60 / 4K120 HDR',
    connector: 'HDMI Type-A with integrated internal Electro-Optical Micro-Transceiver Chipset',
    pinout: 'Hybrid OM3 Multimode Fiber Cores (High-Speed TMDS Video/Audio) + Copper Conductors (DDC HDCP handshake, +5V, HPD).',
    alternative: 'SDVoE 10Gbps AV-over-IP Fiber Transceiver with LC Single-Mode Fiber up to 10km.'
  },
  'dp_copper': {
    name: 'DisplayPort 1.4 / 2.1 Passive Copper Cable',
    maxPassiveM: 3.0,
    maxBandwidth: '32.4 Gbps (HBR3) / 80 Gbps (UHBR20)',
    connector: 'DisplayPort 20-Pin Connector with Mechanical Locking Latches and Release Push-Button',
    pinout: '20 Pins: 4 Main Link High-Speed Lanes (Lanes 0-3), AUX Channel differential pair (EDID/DPCD), Hot Plug Detect (HPD), +3.3V Power (Pin 20).',
    alternative: 'DisplayPort Active Optical Cable (AOC) up to 30m, or DisplayPort over Single-Mode Fiber Extender up to 10km.'
  },
  'usb3_active': {
    name: 'USB-C 3.2 Gen2x2 / USB4 Active Hybrid Cable',
    maxPassiveM: 2.0, // passive limit
    maxBandwidth: '10–40 Gbps + 100W/240W USB-PD Power Delivery + DisplayPort Alt-Mode',
    connector: 'USB-C 24-Pin Reversible Plug with E-Marker Chip and Stainless Steel Shield',
    pinout: '24 Pins Reversible: 4 High-Speed Differential RX/TX Pairs (SSTX/SSRX), VBUS Power (Pins A4, A9, B4, B9), CC1/CC2 Configuration Channels, D+/D- USB 2.0, GND.',
    alternative: 'Icron USB 3.2 Extender Set over Cat6A (100m) or USB-C Active Optical Cable (AOC) up to 15m.'
  },
  'usb2_copper': {
    name: 'USB 2.0 High-Speed Passive Copper Cable',
    maxPassiveM: 5.0,
    maxBandwidth: '480 Mbps High Speed',
    connector: 'USB Type-A Male to Type-B / Type-C (4-Pin shielded)',
    pinout: '4 Pins: Pin 1 VBUS (+5V DC), Pin 2 Data- (White), Pin 3 Data+ (Green), Pin 4 Ground (Black) + Drain wire shield.',
    alternative: 'USB 2.0 over Cat5e/Cat6 Balun Extender (up to 50–100m) or USB Active Repeater Extension Cable.'
  },
  'hdbaset_cat6a': {
    name: 'HDBaseT 3.0 over Cat6A Shielded Twisted Pair (S/FTP)',
    maxPassiveM: 100.0,
    maxBandwidth: '18 Gbps Uncompressed 4K60 4:4:4 + 1Gbps Ethernet + USB 2.0 + 100W PoH',
    connector: 'RJ45 8P8C Shielded Metal-Bodied Modular Plug with Grounding Tab',
    pinout: '8 Conductors (T568B Standard): Pin 1 White/Orange, Pin 2 Orange, Pin 3 White/Green, Pin 4 Blue, Pin 5 White/Blue, Pin 6 Green, Pin 7 White/Brown, Pin 8 Brown.',
    alternative: 'SDVoE 10Gbps AV-over-IP Transceiver with OS2 Single-Mode Fiber up to 10km.'
  },
  'cat7_network': {
    name: 'Cat7 / Cat8 S/FTP Shielded Gigabit & 10G/40G Network Cable',
    maxPassiveM: 100.0, // Cat7 10G
    maxBandwidth: '10 Gbps (Cat7 @ 600MHz) / 40 Gbps (Cat8 @ 2000MHz up to 30m)',
    connector: 'RJ45 8P8C Toolless Industrial Diecast Field Plug (GG45 / TERA compatible)',
    pinout: 'Individual Foil Screen per pair (PiMF) + Overall Tinned Copper Braid Shielding, terminated to T568B specification.',
    alternative: 'OM4 Multimode Fiber (up to 400m) or OS2 Single-Mode Fiber (up to 10km).'
  },
  'os2_fiber': {
    name: 'OS2 Single-Mode Fiber Optic Cable (9/125 μm Yellow)',
    maxPassiveM: 10000.0, // 10 km
    maxBandwidth: '100+ Gbps (Zero Chromatic Dispersion @ 1310nm / 1550nm Laser)',
    connector: 'LC Duplex Polished UPC (Blue) or APC (Green) Ceramic Ferrule Connector',
    pinout: '2 Fiber Strands (TX / RX) with 1.25mm ceramic ferrules, insertion loss < 0.2 dB, return loss > 55 dB.',
    alternative: 'Long-haul SFP28/QSFP28 Optical Transceivers with Inline Erbium-Doped Fiber Amplifiers (EDFA) for runs > 10km.'
  },
  'sdi_12g': {
    name: '12G-SDI 75Ω Coaxial Broadcast Cable (Belden 4794R / RG6)',
    maxPassiveM: 80.0,
    maxBandwidth: '11.88 Gbps SMPTE ST 2082-1 (Uncompressed 4K60 10-bit 4:2:2)',
    connector: '75-Ohm BNC Male Bayonet Connector with Gold-Plated Center Pin and Locking Sleeve',
    pinout: 'Precision Solid Center Conductor (16 AWG) + Duofoil shield + 95% tinned copper braid shield (75-Ohm constant impedance).',
    alternative: '12G-SDI to Optical Fiber Transceiver Set with LC SFP+ Transceivers up to 10km.'
  },
  'xlr_balanced': {
    name: 'XLR 3-Pin Balanced Microphone & Line Audio Cable',
    maxPassiveM: 300.0,
    maxBandwidth: 'Analog Balanced Audio (20 Hz – 20 kHz with Common-Mode Rejection CMRR > 80dB)',
    connector: 'Neutrik 3-Pin XLR Male (NC3MXX) / Female (NC3FXX) with Zinc Diecast Shell',
    pinout: 'Pin 1: Ground/Shield (Chassis Earth), Pin 2: Audio Positive/Hot (+), Pin 3: Audio Negative/Cold (-). Common Mode Noise Rejection.',
    alternative: 'Dante / AES67 Audio-over-IP Transceiver (over Cat6A) up to 100m, or Balanced Audio Line Driver.'
  },
  'mic_analog_starquad': {
    name: 'Mogami 2534 / Canare L-4E6S Star-Quad 4-Conductor XLR Balanced Mic Cable',
    maxPassiveM: 300.0,
    maxBandwidth: 'Ultra-Low Noise Balanced Audio (CMRR > 105 dB, rejects SCR lighting dimmers & EMI hum)',
    connector: 'Neutrik 3-Pin XLR Male (NC3MXX-B) / Female (NC3FXX-B) with Gold Contacts',
    pinout: '4 Conductors Twisted in Star-Quad: 2 Blues tied to Pin 2 (+ Hot), 2 Whites tied to Pin 3 (- Cold), 100% Spiral Braided Shield to Pin 1 (Ground). Cancels induced RFI/EMI by > 20 dB vs standard 2-wire.',
    alternative: 'Dante / AES67 Digital Audio-over-IP EtherCON Cat6A with PTP Clocking.'
  },
  'mic_multicore_snake': {
    name: 'Multi-Pair Analog Audio Snake Cable with Individual Foil Shields',
    maxPassiveM: 150.0,
    maxBandwidth: 'Multi-Channel Analog Balanced Microphone/Line Audio (8, 16, 24 or 32 Channels)',
    connector: 'XLR Fanout Snake or Multipin EDAC/Harting Multi-Contact Industrial Quick Disconnect',
    pinout: 'Individually Foil-Shielded Pairs with Drain Wires and Color-Coded Jackets; Overall Outer PVC/Neoprene Tough Jacket.',
    alternative: 'Digital Stagebox with Dante / AES67 / MADI over single Cat6A etherCON cable.'
  },
  'trs_balanced': {
    name: '1/4" (6.35mm) TRS Balanced Line Interconnect Audio Cable',
    maxPassiveM: 100.0,
    maxBandwidth: 'Professional Balanced Line Level (+4 dBu, 20 Hz – 20 kHz, CMRR > 80dB)',
    connector: '1/4" (6.35mm) TRS Stereo Phone Plug with Nickel/Gold Contacts (Neutrik NP3X)',
    pinout: 'Tip: Audio Hot (+), Ring: Audio Cold (-), Sleeve: Chassis Ground / Shield. Common-mode noise canceling for professional audio mixers, active studio monitors, and DSPs.',
    alternative: 'Dante / AES67 Audio-over-IP Transceiver (over Cat6A) for long multi-room runs.'
  },
  'ts_instrument': {
    name: '1/4" (6.35mm) TS Unbalanced High-Z Instrument / Line Cable',
    maxPassiveM: 6.0,
    maxBandwidth: 'High-Impedance (Hi-Z) Unbalanced Audio (Guitars, Keyboards, Unbalanced Out)',
    connector: '1/4" (6.35mm) TS Mono Phone Plug with Heavy-Duty Chuck Type Strain Relief',
    pinout: 'Tip: Audio Signal Hot (+), Sleeve: Return & Ground Shield. High-capacitance susceptibility causes treble rolloff and RF pickup on runs > 6m.',
    alternative: 'Active or Passive DI Box (Direct Injection) converting unbalanced High-Z to balanced Low-Z XLR up to 100m+.'
  },
  'rca_audio': {
    name: 'Dual RCA (Phono) Unbalanced Consumer Line Audio Cable (-10dBV)',
    maxPassiveM: 5.0,
    maxBandwidth: 'Consumer Line Audio (-10 dBV, 20 Hz – 20 kHz Unbalanced)',
    connector: 'RCA Phono Plugs with Color-Coded Insulators (Red: Right, White/Black: Left)',
    pinout: 'Center Pin: Audio Signal (+), Outer Collar/Shield: Audio Ground/Return. Unbalanced coax susceptible to 50/60Hz ground loop hum.',
    alternative: 'Balanced Line Level Converter (e.g. RDL / Extron) or Passive Isolation Transformer to eliminate ground hum.'
  },
  'aux_35mm': {
    name: '3.5mm (1/8") TRS Stereo Mini-Jack Aux Patch Cable',
    maxPassiveM: 3.0,
    maxBandwidth: 'Unbalanced Stereo Headphone / Mobile Audio (20 Hz – 20 kHz)',
    connector: '3.5mm TRS Stereo Mini Plug with Slim Molded Boot',
    pinout: 'Tip: Left Audio Channel, Ring: Right Audio Channel, Sleeve: Common Audio Ground. Standard for laptop/smartphone BYOD podium connections.',
    alternative: 'Pro AV Media Interface Box with Isolation Transformer (e.g. Whirlwind pcDI) or Bluetooth Pro Receiver.'
  },
  'aes_ebu_digital': {
    name: 'AES/EBU 110Ω Digital Balanced Audio XLR Cable (AES3 Standard)',
    maxPassiveM: 100.0,
    maxBandwidth: '110-Ohm Controlled Characteristic Impedance Digital Audio (24-bit 192kHz Stereo PCM)',
    connector: 'Neutrik 3-Pin XLR with Silver/Gold Contacts (AES/EBU 110Ω Rated)',
    pinout: 'Pin 1: Shield Ground, Pin 2: Digital Signal (+), Pin 3: Digital Signal (-). Requires strict 110Ω impedance cable (e.g. Belden 1800F) to prevent digital jitter.',
    alternative: 'AES/EBU over Cat6A Shielded Twisted Pair with Balun Transformer up to 300m, or Dante digital network.'
  },
  'spdif_toslink': {
    name: 'S/PDIF Optical (Toslink / JIS F05) Digital Audio Fiber Cable',
    maxPassiveM: 10.0,
    maxBandwidth: 'Optical Digital Audio (Uncompressed Stereo LPCM & Compressed 5.1 Dolby Digital / DTS)',
    connector: 'Toslink Optical Square Plug with Gold-Plated Ferrule and Protective Dust Cap',
    pinout: '1.0mm Plastic Optical Fiber (POF) core driven by 650nm red visible LED. Completely immune to electromagnetic interference (EMI) and ground loops.',
    alternative: 'Active Optical Repeater, or Toslink-to-Coaxial Converter, or HDMI eARC Extender.'
  },
  'spdif_coax_75': {
    name: 'S/PDIF 75Ω Coaxial Digital Audio Cable (RCA)',
    maxPassiveM: 20.0,
    maxBandwidth: '75-Ohm Digital Audio (AES-3id / IEC 60958 Consumer S/PDIF up to 24-bit 192kHz)',
    connector: '75-Ohm Precision RCA Male Connector with Gold-Plated Pin',
    pinout: 'Solid OFC Center Conductor + Gas-Injected Foam PE + Double Foil/Braid Shield maintaining true 75Ω impedance. Do NOT use audio analog RCA cable for digital.',
    alternative: 'AES3 Balanced 110Ω XLR Cable or Digital Audio over IP (Dante/AES67).'
  },
  'madi_coax_optical': {
    name: 'MADI Multi-Channel 64-Ch Digital Audio Cable (75Ω BNC / SC Optical)',
    maxPassiveM: 100.0,
    maxBandwidth: '125 Mbps Serial Digital Audio (64 Channels 24-bit 48kHz, AES10 Standard)',
    connector: '75-Ohm BNC Male Bayonet (Coax) or SC-Duplex Multimode Fiber (Optical)',
    pinout: 'Coax: 75-Ohm RG6/RG59 precision broadcast coaxial line. Optical: 62.5/125μm Multimode Fiber up to 2000m (2 km). Broadcast standard in recording and live DSP.',
    alternative: 'MADI to Dante / Ravenna IP Bridge over Gigabit Cat6A / Fiber.'
  },
  'usb_audio_dac': {
    name: 'USB Audio Class 2.0 Low-Jitter Balanced DAC Interface Cable',
    maxPassiveM: 3.0,
    maxBandwidth: '480 Mbps High Speed USB with Isochronous Audio Streaming (32-bit 768kHz / DSD512)',
    connector: 'USB Type-A / Type-C to USB Type-B 4-Pin / Type-C with Gold Contacts',
    pinout: 'Double Shielded Twisted Pair for Data (D+/D-) + Heavy Gauge Power Conductors + Ferrite Core Choke for RFI suppression. Preserves bit-perfect digital clock timing.',
    alternative: 'Dante Virtual Soundcard (DVS) or USB-over-IP Network Audio Hub.'
  },
  'mic_rf_coax_lmr400': {
    name: '50Ω LMR-400 Ultra Low-Loss RF Coaxial Antenna Cable (Times Microwave)',
    maxPassiveM: 60.0,
    maxBandwidth: 'DC to 6 GHz RF Telemetry (Insertion Loss ~9.5 dB/100m @ 500MHz UHF)',
    connector: '50-Ohm BNC Male Bayonet Connector (Amphenol 50Ω with Teflon Dielectric)',
    pinout: 'Solid Bare Copper-Clad Aluminum (BCCA) 10 AWG Center Conductor + Bonded Aluminum Foil + 95% Tinned Copper Braid Shield. Constant 50-Ohm Characteristic Impedance.',
    alternative: 'Active Inline RF Amplifier (+6 dB / +12 dB Shure UA834) or In-Line Fiber Optical RF Link (RF-over-Fiber) for runs > 60m.'
  },
  'mic_rf_coax_rg8x': {
    name: '50Ω RG-8X Flexible Low-Loss RF Coaxial Antenna Cable',
    maxPassiveM: 20.0,
    maxBandwidth: 'DC to 1 GHz RF (Insertion Loss ~23.5 dB/100m @ 500MHz UHF)',
    connector: '50-Ohm BNC Male Bayonet Connector (50Ω Spec with Gold Center Pin)',
    pinout: 'Stranded Bare Copper 16 AWG Center Conductor + Gas-Injected Foam PE + 95% Bare Copper Braid. 50-Ohm Characteristic Impedance.',
    alternative: 'Upgrade to 50Ω LMR-400 Ultra Low-Loss Coax for runs over 20m, or add active inline booster.'
  },
  'mic_rf_coax_rg58': {
    name: '50Ω RG-58 High-Loss RF Coaxial Cable (Short Patch Only)',
    maxPassiveM: 5.0,
    maxBandwidth: 'DC to 500 MHz (High Attenuation: ~33.2 dB/100m @ 500MHz UHF)',
    connector: '50-Ohm BNC Male Connector',
    pinout: 'Solid or Stranded 20 AWG Center Conductor + Tinned Copper Braid Shield. 50-Ohm Impedance.',
    alternative: 'Upgrade immediately to 50Ω RG-8X (< 20m) or 50Ω LMR-400 (< 60m) to prevent severe wireless mic dropouts.'
  },
  'dante_ethercon_cat6a': {
    name: 'Dante / AES67 Digital Audio-over-IP EtherCON Cat6A Cable',
    maxPassiveM: 100.0,
    maxBandwidth: '1 Gbps Gigabit Ethernet (512x512 Uncompressed 24-bit 48kHz Audio Channels, < 1ms Latency)',
    connector: 'Neutrik NE8MX6 etherCON Heavy-Duty Latching RJ45 Metal Shell',
    pinout: '8 Conductors T568B Shielded Twisted Pair (Cat6A S/FTP) with Ruggedized Diecast etherCON Carrier. IEEE 1588 PTP v2 Grandmaster Precision Timing.',
    alternative: 'Single-Mode LC Fiber Optic Transceiver with Gigabit SFP switch for runs > 100m.'
  },
  'speakon_spk': {
    name: 'Neutrik speakON 4-Pole 12AWG Heavy-Duty Loudspeaker Cable (NL4)',
    maxPassiveM: 100.0,
    maxBandwidth: 'High-Current Low-Impedance Loudspeaker Audio (Up to 40A RMS continuous, 4Ω / 8Ω)',
    connector: 'Neutrik speakON NL4FX 4-Pole Quick Twist-Lock Connector',
    pinout: 'Pole 1+: Ch 1 Positive, Pole 1-: Ch 1 Negative; Pole 2+: Ch 2 / Bi-Amp Sub Positive, Pole 2-: Ch 2 / Bi-Amp Sub Negative.',
    alternative: 'Convert to 70V / 100V Constant Voltage Distributed High-Impedance Line System or step up to 10AWG.'
  },
  'spk_70v_100v_commercial': {
    name: 'Commercial 70V / 100V Distributed Ceiling Speaker Cable (18AWG / 16AWG Twisted Pair Plenum CMP)',
    maxPassiveM: 350.0,
    maxBandwidth: 'High-Impedance Constant Voltage Audio (70.7V / 100V tapped transformers, 100W line)',
    connector: 'Euroblock / Phoenix 2-Pin Screw Terminal or WAGO 221 Lever-Nut in Junction Box',
    pinout: '2 Conductors Color Coded: Red/Black or White/Black (+ 70V/100V Hot Line, - Common/Ground Return). Zero insertion loss over multi-hundred meter daisy-chain conduit runs.',
    alternative: 'Dante PoE+ Network Ceiling Speakers over Cat6A for software DSP routing per speaker.'
  },
  'spk_18awg_plenum': {
    name: '18AWG 2-Conductor Plenum (CMP) Distributed Commercial Ceiling Speaker Cable',
    maxPassiveM: 200.0,
    maxBandwidth: '70V / 100V Constant Voltage Commercial Distributed Audio (Plenum Air Spaces)',
    connector: 'Euroblock / Phoenix 2-Pin Terminal Plug or WAGO 221 Lever Connector',
    pinout: '2 Solid or Stranded Bare Copper Conductors with FEP/Low-Smoke PVC Plenum Jacket (NFPA 262 CMP rated). Loop resistance ~43 mΩ/m. Ideal for 70V ceiling speaker grids in office drop ceilings.',
    alternative: '16AWG or 14AWG Plenum Cable for higher power taps (> 30W) or longer runs.'
  },
  'spk_16awg_inwall': {
    name: '16AWG 2-Conductor Direct-Burial / Plenum Speaker Cable',
    maxPassiveM: 25.0,
    maxBandwidth: 'Low-Impedance 8Ω Commercial Audio (Compact meeting room surface mounts / ceiling speakers)',
    connector: 'Phoenix 3.81mm / 5.08mm Terminal Block or Spring Terminals',
    pinout: '2 Stranded Conductors: White/Black or Red/Black (+/-). Resistance ~13.2 mΩ/m.',
    alternative: 'Upgrade to 14AWG/12AWG for 4Ω loads or runs exceeding 25m.'
  },
  'spk_16awg_4c': {
    name: '16AWG 4-Conductor Multi-Tap / Dual-Zone Ceiling Speaker Cable',
    maxPassiveM: 60.0,
    maxBandwidth: 'Commercial 70V Dual-Zone or Low-Impedance Stereo Program Audio (CL3 Rated)',
    connector: 'Phoenix 4-Pin 3.81mm / 5.08mm Terminal Block or Dual Euroblock Connectors',
    pinout: '4 Color-Coded Conductors (Red/Black, White/Green): Carries two separate 70V zones or left/right stereo pair in a single conduit pull. Resistance ~26.4 mΩ/m loop.',
    alternative: '14AWG 4-Conductor Cable for long runs or higher wattage ratings.'
  },
  'spk_14awg_lowz': {
    name: '14AWG 2-Conductor Low-Impedance High-Current Speaker Cable (CL2/CL3 In-Wall)',
    maxPassiveM: 45.0,
    maxBandwidth: 'Low-Impedance Audio (4Ω / 8Ω Program Audio, < 0.5 dB cable loss up to 45m)',
    connector: 'Banana Plugs, Gold Spades, or Phoenix 5.08mm High-Current Screw Terminals',
    pinout: '2 High-Purity OFC Stranded Conductors: Positive (+) Red / Negative (-) Black. Resistance ~8.3 mΩ/m (total loop ~16.6 mΩ/m). Damping factor preserved > 20.',
    alternative: 'Step up to 12AWG or 10AWG low-impedance cable for runs > 45m, or switch to 70V/100V distributed architecture.'
  },
  'spk_14awg_4c': {
    name: '14AWG 4-Conductor In-Wall Bi-Amp / Stereo Speaker Cable (CL3)',
    maxPassiveM: 75.0,
    maxBandwidth: 'High-Fidelity Bi-Amping / Multi-Room Stereo Low-Impedance Audio (4Ω / 8Ω)',
    connector: 'speakON NL4FX 4-Pole Connector or 4-Pin Phoenix High-Current Terminal Block',
    pinout: '4 High-Purity OFC Stranded Conductors (Red/Black/White/Green): Twisted in quad geometry to reduce mutual inductance. Ideal for executive boardrooms, conference video bars, and passive bi-amplified ceiling monitors.',
    alternative: '12AWG or 10AWG heavy cable for auditorium high-SPL concert speakers.'
  },
  'spk_12awg_lowloss': {
    name: '12AWG 2-Conductor Ultra Low-Loss OFC Speaker Cable (High-SPL / Long Run)',
    maxPassiveM: 75.0,
    maxBandwidth: 'High-Current Low-Impedance Program Audio (4Ω / 8Ω, Damping Factor preserved > 50)',
    connector: 'Neutrik speakON NL2FX / NL4FX or High-Current Binding Posts / Spades',
    pinout: '2 Ultra-Pure Oxygen-Free Copper Conductors (12 AWG, 65+ strands per conductor): Loop resistance ~10.4 mΩ/m. Minimizes insertion loss (< 0.4 dB) in large training halls and conference ballrooms.',
    alternative: '10AWG Speaker Cable for extreme sub-bass or runs > 75m, or 70V/100V high-impedance system.'
  },
  'spk_10awg_4c_sub': {
    name: '10AWG 4-Conductor Heavy-Duty Subwoofer & Bi-Amp Touring Cable',
    maxPassiveM: 100.0,
    maxBandwidth: 'Extreme Dynamic Low-Frequency & Bi-Amp PA System Audio (Up to 50A continuous)',
    connector: 'Neutrik speakON NL4FX / NL8FC Heavy-Duty Twist-Lock Connector',
    pinout: '4 Jumbo 10AWG Copper Conductors: Extreme current capacity, damping factor preserved > 80. Drives large subwoofers and concert line arrays with zero dynamic compression.',
    alternative: 'Active Self-Powered Line Array Modules with Dante/Milan AVB over Ruggedized Fiber.'
  },
  'spk_direct_burial_pe': {
    name: '12AWG/14AWG Direct-Burial UV/PE Outdoor Landscape Speaker Cable',
    maxPassiveM: 120.0,
    maxBandwidth: 'Outdoor Landscape & Campus Audio (70V/100V Distributed or 8Ω Low-Impedance)',
    connector: 'Gel-Filled Waterproof Wire Nuts / Heat-Shrink Waterproof Splice in In-Ground Box',
    pinout: '2 or 4 Conductors with Heavy-Duty Water-Resistant Polyethylene (PE) Jacket and Water-Block Gel/Tape. UV and fungal resistant for direct earth burial without conduit.',
    alternative: 'Dante PoE+ Outdoor Network Weatherproof Horns over Shielded Cat6A.'
  },
  'spk_70v_shielded': {
    name: '70V/100V Foil-Shielded High-Impedance Speaker Cable (High EMI / Conduit)',
    maxPassiveM: 300.0,
    maxBandwidth: 'Constant Voltage Distributed Commercial Audio with Electrostatic EMI Shielding',
    connector: 'Phoenix 2-Pin Screw Terminal with Drain Wire Earth Lug',
    pinout: '2 Twisted Conductors (18AWG / 16AWG) + 100% Aluminum Foil Shield + Tinned Copper Drain Wire. Eliminates capacitive coupling and crosstalk to adjacent microphone/data cables in shared risers.',
    alternative: 'Run unshielded 70V cable in dedicated EMT metallic conduit.'
  },
  'spk_speakon_nl2': {
    name: 'Neutrik speakON NL2 2-Pole 14AWG Compact Loudspeaker Cable',
    maxPassiveM: 50.0,
    maxBandwidth: 'Compact PA Tops & Stage Wedge Monitors (30A RMS continuous, 4Ω / 8Ω)',
    connector: 'Neutrik speakON NL2FX 2-Pole Latching Metal/Plastic Connector',
    pinout: 'Pole 1+: Audio Positive (+), Pole 1-: Audio Negative (-). Keyed lock prevents accidental unplugging in live events and boardroom presentation podiums.',
    alternative: 'Neutrik speakON NL4 4-Pole Cable for bi-amplified loudspeaker systems.'
  },
  'spk_speakon_nl8': {
    name: 'Neutrik speakON 8-Pole Multi-Channel Touring / Line-Array Speaker Cable (NL8 12AWG/10AWG)',
    maxPassiveM: 90.0,
    maxBandwidth: 'Multi-Way Tri-Amp / Quad-Amp Concert PA & Line-Array System (30A per contact)',
    connector: 'Neutrik speakON NL8FC 8-Pole Latching Metal Connector',
    pinout: '8 Heavy-Duty Pins: 1+/- Sub low, 2+/- Low-Mid, 3+/- High-Mid, 4+/- HF Compression Driver.',
    alternative: 'Active Powered Line Array with Dante / Milan AVB over Ruggedized Fiber.'
  },
  'spk_phoenix_euroblock': {
    name: 'Commercial Euroblock / Phoenix 4-Pin Pluggable Terminal Audio Cable',
    maxPassiveM: 60.0,
    maxBandwidth: 'Multi-Zone Commercial Amplifier Output & Line-Level DSP Interconnect',
    connector: 'Phoenix Contact 3.81mm / 5.08mm Pitch Pluggable Screw / Push-In Terminal Header',
    pinout: '4-Pin: Ch1 +, Ch1 -, Ch2 +, Ch2 - (or Balanced Audio: +, -, Ground Shield, Mute/Control). Standard in QSC, Biamp, Extron, Crestron, Shure DSPs.',
    alternative: 'Dante Network Audio over Cat6A.'
  },
  'spk_subwoofer_heavy': {
    name: 'Dedicated Subwoofer High-Current Speaker Cable (10AWG OFC Dual-Twisted)',
    maxPassiveM: 80.0,
    maxBandwidth: 'Sub-Bass High Dynamic Transient Transducers (20 Hz – 150 Hz, Damping Factor > 100)',
    connector: 'Neutrik speakON NL2FX / NL4FX or Binding Posts',
    pinout: '2 Heavy Ultra-Pure Copper Conductors (10 AWG, 259 strands): Resistance ~3.3 mΩ/m. Preserves amplifier cone control and punch.',
    alternative: 'Active DSP-powered subwoofer positioned directly adjacent to listening zone.'
  },
  'rs232_serial': {
    name: 'RS-232 / RS-485 Serial Control Cable',
    maxPassiveM: 30.0,
    maxBandwidth: 'Asynchronous Serial Telemetry (9600 to 115200 Baud)',
    connector: 'DB9 (DE-9) 9-Pin D-Sub or 3-Pin / 5-Pin Phoenix 3.81mm Euroblock Terminal Plug',
    pinout: 'RS-232 3-Wire: Pin 2 RXD (Receive), Pin 3 TXD (Transmit), Pin 5 GND (Ground). RS-485: Data+ (A), Data- (B), Shield (GND).',
    alternative: 'RS-232/RS-485 to Ethernet IP Serial Server (Moxa / Global Caché) over local LAN.'
  }
};

function calcCableAttenuation() {
  var type = document.getElementById('cableSolverType')?.value || 'hdmi_copper';
  var lengthM = parseFloat(document.getElementById('cableLengthInput')?.value) || 15;
  var cableInfo = PRO_AV_CABLES[type] || PRO_AV_CABLES['hdmi_copper'];

  var maxLimitM = cableInfo.maxPassiveM;
  var isPass = lengthM <= maxLimitM;
  var isMarginal = !isPass && lengthM <= (maxLimitM * 1.35);

  var statusStr = '';
  var colorClass = '';
  var recText = '';

  if (isPass) {
    statusStr = 'PASS (Lossless Signal)';
    colorClass = 'text-success';
    recText = `<i class="fa-solid fa-circle-check text-success me-1"></i><strong>Verified Safe Run:</strong> Signal operates at full uncompressed bandwidth with zero packet loss across ${lengthM}m.`;
  } else if (isMarginal) {
    statusStr = 'MARGINAL (Jitter & Dropouts)';
    colorClass = 'text-warning';
    recText = `<i class="fa-solid fa-triangle-exclamation text-warning me-1"></i><strong>At Marginal Limit:</strong> Signal attenuation may cause sparkles, EDID handshaking drops, or bit errors. Recommend using: <em>${cableInfo.alternative}</em>`;
  } else {
    statusStr = 'FAIL (Signal Loss Exceeded)';
    colorClass = 'text-danger';
    recText = `<i class="fa-solid fa-circle-xmark text-danger me-1"></i><strong>Exceeds Cable Medium Maximum (${maxLimitM}m)!</strong> Requires alternative solution: <strong>${cableInfo.alternative}</strong>`;
  }

  var statusEl = document.getElementById('resCableStatusVal');
  if (statusEl) {
    statusEl.innerText = statusStr;
    statusEl.className = 'fs-4 fw-bold ' + colorClass;
  }
  var maxEl = document.getElementById('resCableMaxLimitVal');
  if (maxEl) maxEl.innerText = `${maxLimitM} m (${(maxLimitM * 3.28084).toFixed(1)} ft)`;

  var recEl = document.getElementById('resCableRecommendationText');
  if (recEl) recEl.innerHTML = recText;

  // Display Required Connector & Pinout Details
  var connInfoBox = document.getElementById('resCableConnectorDetails');
  if (connInfoBox) {
    connInfoBox.innerHTML = `
      <div class="p-3 bg-dark text-white rounded border border-secondary mt-3 font-mono small">
        <div class="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-secondary">
          <div class="fw-bold text-info"><i class="fa-solid fa-plug me-1"></i>Required Mating Connector: <span>${cableInfo.connector}</span></div>
          <span class="badge bg-primary">Bandwidth: ${cableInfo.maxBandwidth}</span>
        </div>
        <div class="mb-2 text-slate-300"><strong>Standard Pinout &amp; Wiring:</strong> ${cableInfo.pinout}</div>
        ${!isPass ? `<div class="p-2 rounded bg-danger bg-opacity-25 border border-danger text-warning"><strong><i class="fa-solid fa-lightbulb me-1"></i>Recommended Alternative:</strong> ${cableInfo.alternative}</div>` : ''}
      </div>
    `;
  }

  // Update Dynamic Cable Illustration
  renderDetailedCableSvg(type, isPass, lengthM, maxLimitM);
}

// Universal AV Signal Converter & Adapter Matrix
function evaluateSignalConversion() {
  var src = document.getElementById('convSourcePortSelect')?.value || 'usbc';
  var dst = document.getElementById('convDestPortSelect')?.value || 'hdmi';
  var resultBox = document.getElementById('resConverterMatrixBox');
  if (!resultBox) return;

  var statusBadge = '';
  var statusTitle = '';
  var hardwareReq = '';
  var specs = '';
  var directionality = '';

  if (src === dst) {
    statusBadge = 'bg-success';
    statusTitle = 'Native Direct Connection (No Converter Needed)';
    hardwareReq = 'Standard straight-through cable (Passive male-to-male cable).';
    specs = 'Full native protocol bandwidth, zero latency, full HDCP and bi-directional communication.';
    directionality = 'Bidirectional';
  } else if (src === 'usbc' && dst === 'hdmi') {
    statusBadge = 'bg-info text-dark';
    statusTitle = 'Active USB-C to HDMI Converter (DisplayPort Alt-Mode)';
    hardwareReq = 'USB-C to HDMI 2.0/2.1 Active Cable or Multiport Hub with DP-to-HDMI level-shifter chip (e.g. Parade PS186 / Realtek RTD2172).';
    specs = 'Supports up to 4K60 / 4K120 HDR with HDCP 2.2/2.3 and 8-channel LPCM audio. Requires host device to support DP Alt-Mode over USB-C.';
    directionality = 'Unidirectional (USB-C Host → HDMI Display)';
  } else if (src === 'usba' && dst === 'hdmi') {
    statusBadge = 'bg-warning text-dark';
    statusTitle = 'Active USB-A Graphics Adapter (DisplayLink Driver Required)';
    hardwareReq = 'DisplayLink DL-3500 / DL-6950 External USB Graphics Adapter or USB Video Capture Card.';
    specs = 'USB-A cannot natively output video. Requires host driver software installed on PC/Mac. Video is compressed via USB data protocol (~50–100ms latency).';
    directionality = 'Unidirectional (USB-A Host → HDMI Display)';
  } else if (src === 'usba' && dst === 'usbc') {
    statusBadge = 'bg-secondary';
    statusTitle = 'USB-A to USB-C Data & Power Cable / Adapter';
    hardwareReq = 'Passive USB-A to USB-C Cable (with 56kΩ pull-up resistor for USB safety).';
    specs = 'Supports USB 3.0 (5 Gbps) or USB 2.0 (480 Mbps) data + 5V/2.4A (12W max) charging. CANNOT carry native DisplayPort video or high-wattage USB-PD.';
    directionality = 'Bidirectional Data (Power from USB-A to USB-C)';
  } else if (src === 'dp' && dst === 'hdmi') {
    statusBadge = 'bg-info text-dark';
    statusTitle = 'DisplayPort to HDMI Adapter (DP++ Passive or Active)';
    hardwareReq = 'If source has DP++ (Dual-Mode): Simple passive level-shifter cable. If source is standard DP (or for 4K60/4K120): Active DisplayPort to HDMI 2.1 protocol converter.';
    specs = 'Converts DisplayPort LVDS packetized signal into TMDS HDMI signal. Supports up to 4K60 / 8K with audio and HDCP.';
    directionality = 'Unidirectional (DisplayPort PC → HDMI Screen)';
  } else if (src === 'hdmi' && dst === 'dp') {
    statusBadge = 'bg-warning text-dark';
    statusTitle = 'Active HDMI to DisplayPort Powered Converter';
    hardwareReq = 'Specialized Active HDMI to DisplayPort Converter Box with USB 5V auxiliary power.';
    specs = 'Standard passive DP-to-HDMI cables CANNOT work in reverse. An active processing IC is required to packetize HDMI TMDS into DisplayPort micro-packets.';
    directionality = 'Unidirectional (HDMI Source → DisplayPort Monitor)';
  } else if (src === 'hdmi' && dst === 'vga') {
    statusBadge = 'bg-primary';
    statusTitle = 'Active HDMI to VGA Video Converter (DAC)';
    hardwareReq = 'Active HDMI to VGA Adapter with integrated Digital-to-Analog Converter (DAC) and 3.5mm stereo audio extraction jack.';
    specs = 'Converts digital TMDS pixels to analog RGBHV signals. Max resolution 1920×1200 @ 60Hz. Does not support HDCP protected Blu-ray content.';
    directionality = 'Unidirectional (Digital HDMI Source → Analog VGA Screen)';
  } else if (src === 'vga' && dst === 'hdmi') {
    statusBadge = 'bg-primary';
    statusTitle = 'Active VGA to HDMI Scaler & Digitizer (ADC)';
    hardwareReq = 'Active VGA to HDMI Converter with USB power + 3.5mm audio embedding ADC chip.';
    specs = 'Digitizes analog RGBHV video and embeds analog audio into HDMI digital signal stream. Max resolution 1080p @ 60Hz.';
    directionality = 'Unidirectional (Analog VGA Laptop → Digital HDMI Display)';
  } else if (src === 'sdi' && dst === 'hdmi') {
    statusBadge = 'bg-success';
    statusTitle = 'Broadcast 12G/3G-SDI to HDMI Micro Converter';
    hardwareReq = 'Broadcast SDI-to-HDMI Mini Converter (e.g. Blackmagic Micro Converter / Decimator MD-HX).';
    specs = 'Converts serial 75Ω BNC broadcast video into HDMI with embedded multi-channel audio and timecode pass-through.';
    directionality = 'Unidirectional (SDI Camera/Switcher → HDMI Screen)';
  } else if (src === 'hdmi' && dst === 'sdi') {
    statusBadge = 'bg-success';
    statusTitle = 'HDMI to 12G/3G-SDI Broadcast Converter';
    hardwareReq = 'HDMI to SDI Mini Converter with BNC loop-through.';
    specs = 'Embeds consumer/pro HDMI video into broadcast SDI transmission. Note: Will block HDCP-encrypted video sources.';
    directionality = 'Unidirectional (HDMI Camera/PC → SDI Broadcast System)';
  } else if (src === 'xlr' && dst === 'aux') {
    statusBadge = 'bg-info text-dark';
    statusTitle = 'XLR Balanced to 3.5mm Unbalanced Audio Adapter';
    hardwareReq = 'XLR to 3.5mm TRS cable with Pin 2 tied to Tip/Ring and Pin 1/3 tied to Sleeve Ground (or passive isolation transformer).';
    specs = 'Converts professional balanced audio (+4 dBu) to consumer line level (-10 dBV). Recommend 10dB inline pad to prevent input clipping.';
    directionality = 'Bidirectional Audio';
  } else {
    statusBadge = 'bg-secondary';
    statusTitle = `Signal Adaptation: ${src.toUpperCase()} to ${dst.toUpperCase()}`;
    hardwareReq = `Requires dedicated active hardware protocol converter or AV matrix scaler.`;
    specs = `Check voltage levels, digital vs analog encoding, and HDCP encryption requirements before interconnection.`;
    directionality = 'Protocol Dependent';
  }

  resultBox.innerHTML = `
    <div class="p-3 bg-dark text-white rounded border border-secondary">
      <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <h6 class="fw-bold text-cyan mb-0"><i class="fa-solid fa-arrows-split-up-and-left me-1"></i>${statusTitle}</h6>
        <span class="badge ${statusBadge}">${directionality}</span>
      </div>
      <div class="small font-mono text-slate-300 mb-2">
        <strong>Hardware Implementation:</strong> ${hardwareReq}
      </div>
      <div class="small font-mono text-slate-400">
        <strong>Technical Capabilities &amp; Limits:</strong> ${specs}
      </div>
    </div>
  `;
}

function renderDetailedCableSvg(type, isPass, lengthM, maxLimitM) {
  var container = document.getElementById('cableDiagramSvgContainer');
  if (!container) return;

  var color = isPass ? '#22c55e' : '#ef4444';
  container.innerHTML = `
    <svg viewBox="0 0 540 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:8px;">
      <defs>
        <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="50%" stop-color="${color}"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
      </defs>

      <!-- Source Device on Left -->
      <rect x="25" y="55" width="70" height="70" fill="#1e293b" stroke="#64748b" stroke-width="2" rx="4"/>
      <text x="60" y="95" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle">SOURCE TX</text>

      <!-- Cable Curve -->
      <path d="M 95,90 C 180,90 190,40 270,40 C 350,40 360,90 445,90" fill="none" stroke="url(#cableGrad)" stroke-width="6" stroke-linecap="round"/>

      <!-- Destination Device on Right -->
      <rect x="445" y="55" width="70" height="70" fill="#1e293b" stroke="#64748b" stroke-width="2" rx="4"/>
      <text x="480" y="95" font-size="9" font-weight="bold" fill="#4ade80" text-anchor="middle">DISPLAY RX</text>

      <!-- Cable Run Distance Label -->
      <rect x="180" y="115" width="180" height="35" fill="#020617" stroke="${color}" stroke-width="1.5" rx="6"/>
      <text x="270" y="130" font-size="10" font-weight="bold" fill="${color}" text-anchor="middle">PLANNED RUN: ${lengthM} METERS</text>
      <text x="270" y="143" font-size="8" fill="#94a3b8" text-anchor="middle">Max Recommended Limit: ${maxLimitM} m</text>
    </svg>
  `;
}

// ==========================================
// WIRELESS MICROPHONE RF DIVERSITY ANTENNAS, COAXIAL LOSS & DISTRIBUTION SOLVER
// ==========================================

var RF_BANDS_DATA = {
  vhf: { name: 'VHF High (174 – 216 MHz)', centerFreqMhz: 195, lambdaCm: 153.8, minSepCm: 76.9, optSepCm: 150 },
  uhf_low: { name: 'UHF Low (470 – 530 MHz)', centerFreqMhz: 500, lambdaCm: 60.0, minSepCm: 30.0, optSepCm: 90 },
  uhf_mid: { name: 'UHF Mid (530 – 608 MHz)', centerFreqMhz: 570, lambdaCm: 52.6, minSepCm: 26.3, optSepCm: 80 },
  uhf_high: { name: 'UHF High (614 – 698 MHz)', centerFreqMhz: 650, lambdaCm: 46.1, minSepCm: 23.1, optSepCm: 70 },
  ism_900: { name: '902 – 928 MHz (ISM Band)', centerFreqMhz: 915, lambdaCm: 32.8, minSepCm: 16.4, optSepCm: 50 },
  dect_19: { name: '1.9 GHz DECT (Digital Wireless)', centerFreqMhz: 1925, lambdaCm: 15.6, minSepCm: 7.8, optSepCm: 25 },
  ghz_24: { name: '2.4 GHz Digital Wireless (Wi-Fi Band)', centerFreqMhz: 2440, lambdaCm: 12.3, minSepCm: 6.2, optSepCm: 20 }
};

var RF_COAX_CABLES = {
  rg58: { name: 'RG-58 (Standard Thin Coax, 50Ω)', lossPer10mAt500Mhz: 3.3, lossPer10mAt1Ghz: 4.9, maxRecLenM: 10, diamMm: 5.0, grade: 'Budget / Short Rack Jumpers Only' },
  rg8x: { name: 'RG-8X (Mini-8 Low-Loss, 50Ω)', lossPer10mAt500Mhz: 2.2, lossPer10mAt1Ghz: 3.4, maxRecLenM: 20, diamMm: 6.1, grade: 'Medium Runs (<20m)' },
  rg213: { name: 'RG-213 / RG-8U (Heavy Duty, 50Ω)', lossPer10mAt500Mhz: 1.5, lossPer10mAt1Ghz: 2.3, maxRecLenM: 35, diamMm: 10.3, grade: 'Touring / Long Rigging' },
  lmr195: { name: 'Times Microwave LMR-195 (Ultra-Flexible, 50Ω)', lossPer10mAt500Mhz: 2.8, lossPer10mAt1Ghz: 4.1, maxRecLenM: 15, diamMm: 4.9, grade: 'Patch & Wallplates' },
  lmr400: { name: 'Times Microwave LMR-400 (Low-Loss Benchmark, 50Ω)', lossPer10mAt500Mhz: 0.9, lossPer10mAt1Ghz: 1.4, maxRecLenM: 65, diamMm: 10.3, grade: 'Professional Broadcast Standard' },
  belden9913: { name: 'Belden 9913 (Semi-Solid PE Low-Loss, 50Ω)', lossPer10mAt500Mhz: 0.95, lossPer10mAt1Ghz: 1.5, maxRecLenM: 60, diamMm: 10.3, grade: 'Stationary Conduit Installs' }
};

function calcRfAntennaSolver() {
  var bandKey = document.getElementById('rfBandSelect')?.value || 'uhf_mid';
  var arch = document.getElementById('rfDiversityArchSelect')?.value || 'true_diversity';
  var coaxKey = document.getElementById('rfCoaxSelect')?.value || 'lmr400';
  var runLenM = parseFloat(document.getElementById('rfRunLengthInput')?.value) || 25;
  var antType = document.getElementById('rfAntTypeSelect')?.value || 'paddle_lpda';
  var txDistM = parseFloat(document.getElementById('rfTxDistanceInput')?.value) || 20;

  var band = RF_BANDS_DATA[bandKey] || RF_BANDS_DATA['uhf_mid'];
  var coax = RF_COAX_CABLES[coaxKey] || RF_COAX_CABLES['lmr400'];

  var lambdaCm = band.lambdaCm;
  var minSepCm = band.minSepCm;
  var optSepCm = band.optSepCm;

  var freqFactor = Math.sqrt(band.centerFreqMhz / 500.0);
  var lossPerMeter = (coax.lossPer10mAt500Mhz / 10.0) * freqFactor;
  var totalLossDb = (lossPerMeter * runLenM).toFixed(1);

  var antGainDbi = 0;
  if (antType === 'paddle_lpda') antGainDbi = 6;
  else if (antType === 'helical') antGainDbi = 11;
  else if (antType === 'active_paddle') antGainDbi = 12;
  else if (antType === 'ceiling_boundary') antGainDbi = 3;
  else antGainDbi = 2.15;

  var boosterRec = 'Loss within 3 dB tolerance (No inline booster required). Passive antenna reception safe.';
  var boosterReq = false;
  if (parseFloat(totalLossDb) > 8.0) {
    boosterRec = `Required: In-Line RF Booster (+12 dB Gain) or Active Directional Antenna (Shure UA874 / Sennheiser AB 3700) with +12V DC bias from DA`;
    boosterReq = true;
  } else if (parseFloat(totalLossDb) > 4.5) {
    boosterRec = `Recommended: In-Line RF Booster (+6 dB Gain) to overcome cable loss and maintain pristine RF SNR`;
    boosterReq = true;
  }

  var netSystemMargin = (antGainDbi - parseFloat(totalLossDb)).toFixed(1);

  var elWavelength = document.getElementById('rfResWavelength');
  if (elWavelength) elWavelength.innerText = `${lambdaCm.toFixed(1)} cm (${(lambdaCm / 2.54).toFixed(1)} in)`;

  var elMinSep = document.getElementById('rfResMinSep');
  if (elMinSep) elMinSep.innerText = `${minSepCm.toFixed(1)} cm (λ/2 Min)`;

  var elOptSep = document.getElementById('rfResOptSep');
  if (elOptSep) {
    var minOptM = (optSepCm / 100.0).toFixed(1);
    var maxOptM = (optSepCm * 1.8 / 100.0).toFixed(1);
    elOptSep.innerText = `${minOptM} – ${maxOptM} m (1λ – 3λ Spatial Diversity)`;
  }

  var elLoss = document.getElementById('rfResTotalLoss');
  if (elLoss) elLoss.innerText = `-${totalLossDb} dB Cable Loss`;

  var elBooster = document.getElementById('rfResBooster');
  if (elBooster) elBooster.innerText = boosterRec;

  var elMargin = document.getElementById('rfResMargin');
  if (elMargin) {
    var marginNum = parseFloat(netSystemMargin);
    elMargin.innerText = `${marginNum >= 0 ? '+' : ''}${netSystemMargin} dB Link Margin`;
    elMargin.className = `badge font-mono px-2 py-1 ${marginNum >= 0 ? 'bg-success' : (marginNum >= -3 ? 'bg-warning text-dark' : 'bg-danger')}`;
  }

  renderRfAntennaSchematic(bandKey, minSepCm, optSepCm, antType, totalLossDb, runLenM, arch, txDistM, boosterReq);
}
window.calcRfAntennaSolver = calcRfAntennaSolver;

function renderRfAntennaSchematic(bandKey, minSepCm, optSepCm, antType, totalLossDb, runLenM, arch, txDistM, boosterReq) {
  var container = document.getElementById('rfAntennaSvgContainer');
  if (!container) return;

  var lossVal = parseFloat(totalLossDb) || 2.5;
  var lineColor = lossVal > 5 ? '#f59e0b' : (lossVal > 8 ? '#ef4444' : '#22c55e');
  var isQuad = (arch === 'quadversity');

  var sepM = ((optSepCm || 90) / 100.0).toFixed(2);
  var minSepM = ((minSepCm || 30) / 100.0).toFixed(2);

  container.innerHTML = `
    <svg viewBox="0 0 760 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#080d1a; border-radius:10px;">
      <defs>
        <linearGradient id="rfWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#818cf8" stop-opacity="0.2"/>
        </linearGradient>
        <radialGradient id="txWaveGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.0"/>
        </radialGradient>
      </defs>

      <!-- Floor / Stage Reference Line -->
      <line x1="30" y1="240" x2="730" y2="240" stroke="#1e293b" stroke-width="2"/>
      <text x="380" y="285" font-size="9.5" font-family="JetBrains Mono" fill="#64748b" text-anchor="middle">EQUIPMENT RACK &amp; RECEIVER ANTENNA DISTRIBUTION (50Ω COAX RUN: ${runLenM}m)</text>

      <!-- Transmitter / Talent Position -->
      <g transform="translate(380, 20)">
        <circle cx="0" cy="0" r="18" fill="url(#txWaveGrad)"/>
        <circle cx="0" cy="0" r="6" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/>
        <text x="0" y="-12" font-size="9.5" font-weight="bold" font-family="JetBrains Mono" fill="#f59e0b" text-anchor="middle">TRANSMITTER (MIC)</text>
        <text x="0" y="16" font-size="8" font-family="JetBrains Mono" fill="#cbd5e1" text-anchor="middle">Dist: ${txDistM}m | 1.5m AFFL</text>
      </g>

      ${isQuad ? `
        <!-- Quadversity 4-Antenna Matrix (A, B, C, D) -->
        <!-- Antenna A (Left Far) -->
        <g transform="translate(110, 85)">
          <line x1="0" y1="40" x2="0" y2="80" stroke="#94a3b8" stroke-width="3"/>
          <polygon points="-8,40 -20,-20 5,-20 0,40" fill="#1e293b" stroke="#38bdf8" stroke-width="2" transform="rotate(-30 0 40)"/>
          <text x="-15" y="-5" font-size="9" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="end">ANT A1</text>
          <path d="M 0,80 C 0,140 100,160 250,210" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-dasharray="4,2"/>
        </g>

        <!-- Antenna B (Left Near) -->
        <g transform="translate(260, 85)">
          <line x1="0" y1="40" x2="0" y2="80" stroke="#94a3b8" stroke-width="3"/>
          <polygon points="-8,40 -15,-20 10,-20 0,40" fill="#1e293b" stroke="#38bdf8" stroke-width="2" transform="rotate(-10 0 40)"/>
          <text x="-15" y="-5" font-size="9" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="end">ANT B1</text>
          <path d="M 0,80 C 0,130 50,150 260,210" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-dasharray="4,2"/>
        </g>

        <!-- Antenna C (Right Near) -->
        <g transform="translate(500, 85)">
          <line x1="0" y1="40" x2="0" y2="80" stroke="#94a3b8" stroke-width="3"/>
          <polygon points="-5,40 -10,-20 15,-20 0,40" fill="#1e293b" stroke="#38bdf8" stroke-width="2" transform="rotate(10 0 40)"/>
          <text x="15" y="-5" font-size="9" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="start">ANT C2</text>
          <path d="M 0,80 C 0,130 -50,150 -10,210" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-dasharray="4,2"/>
        </g>

        <!-- Antenna D (Right Far) -->
        <g transform="translate(650, 85)">
          <line x1="0" y1="40" x2="0" y2="80" stroke="#94a3b8" stroke-width="3"/>
          <polygon points="-5,40 -5,-20 20,-20 0,40" fill="#1e293b" stroke="#38bdf8" stroke-width="2" transform="rotate(30 0 40)"/>
          <text x="15" y="-5" font-size="9" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="start">ANT D2</text>
          <path d="M 0,80 C 0,140 -100,160 -160,210" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-dasharray="4,2"/>
        </g>

        <rect x="230" y="45" width="300" height="24" fill="#0f172a" stroke="#facc15" stroke-width="1.5" rx="4"/>
        <text x="380" y="61" font-size="9.5" font-weight="bold" font-family="JetBrains Mono" fill="#facc15" text-anchor="middle">QUADVERSITY 4-ZONE MULTI-TUNER ARCHITECTURE</text>
      ` : `
        <!-- True Diversity 2-Antenna Matrix (A & B) -->
        <!-- Antenna A (Left, Angled 45 deg outward for 90 deg V splay) -->
        <g transform="translate(200, 75)">
          <line x1="0" y1="45" x2="0" y2="85" stroke="#94a3b8" stroke-width="4"/>
          <circle cx="0" cy="45" r="5" fill="#0284c7"/>
          <polygon points="-10,45 -25,-25 5,-25 0,45" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" transform="rotate(-22.5 0 45)"/>
          <text x="-32" y="5" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="end">ANTENNA A</text>
          <text x="-32" y="19" font-size="8.5" font-family="JetBrains Mono" fill="#94a3b8" text-anchor="end">45° Splay Angle</text>
          <rect x="-4" y="75" width="8" height="12" fill="#cbd5e1"/>
          <!-- Cable Line to Distro -->
          <path d="M 0,87 C 0,150 100,170 230,205" fill="none" stroke="${lineColor}" stroke-width="3" stroke-dasharray="6,3"/>
        </g>

        <!-- Antenna B (Right, Angled 45 deg outward for 90 deg V splay) -->
        <g transform="translate(560, 75)">
          <line x1="0" y1="45" x2="0" y2="85" stroke="#94a3b8" stroke-width="4"/>
          <circle cx="0" cy="45" r="5" fill="#0284c7"/>
          <polygon points="-5,45 -10,-25 20,-25 0,45" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" transform="rotate(22.5 0 45)"/>
          <text x="32" y="5" font-size="11" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="start">ANTENNA B</text>
          <text x="32" y="19" font-size="8.5" font-family="JetBrains Mono" fill="#94a3b8" text-anchor="start">45° Splay Angle</text>
          <rect x="-4" y="75" width="8" height="12" fill="#cbd5e1"/>
          <!-- Cable Line to Distro -->
          <path d="M 0,87 C 0,150 -100,170 -130,205" fill="none" stroke="${lineColor}" stroke-width="3" stroke-dasharray="6,3"/>
        </g>

        <!-- Diversity Spacing Dimension Callout between A and B -->
        <line x1="200" y1="45" x2="560" y2="45" stroke="#facc15" stroke-width="2"/>
        <polygon points="200,45 210,41 210,49" fill="#facc15"/>
        <polygon points="560,45 550,41 550,49" fill="#facc15"/>
        <rect x="260" y="31" width="240" height="28" fill="#0f172a" stroke="#facc15" stroke-width="1.5" rx="4"/>
        <text x="380" y="49" font-size="10.5" font-weight="bold" font-family="JetBrains Mono" fill="#facc15" text-anchor="middle">SPACING: ${optSepCm} cm (${sepM}m, 1λ – 3λ)</text>

        <!-- 90-degree Orthogonal V Polar Pattern Indicator -->
        <path d="M 350,115 L 380,140 L 410,115" fill="none" stroke="#22d3ee" stroke-width="2"/>
        <text x="380" y="156" font-size="8.5" font-family="JetBrains Mono" fill="#22d3ee" text-anchor="middle">90° "V" ORTHOGONAL POLARIZATION SPLAY</text>
      `}

      <!-- Inline Booster Callout Badge on Cable Run (if needed) -->
      ${boosterReq ? `
        <g transform="translate(380, 168)">
          <rect x="-95" y="0" width="190" height="22" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" rx="4"/>
          <text x="0" y="15" font-size="8.5" font-weight="bold" font-family="JetBrains Mono" fill="#ffffff" text-anchor="middle">
            <tspan fill="#fef08a">⚡ ACTIVE IN-LINE BOOSTER (+12V DC)</tspan>
          </text>
        </g>
      ` : ''}

      <!-- Central RF Receiver / Antenna Distribution Unit -->
      <g transform="translate(270, 200)">
        <rect x="0" y="0" width="220" height="42" fill="#0f172a" stroke="#38bdf8" stroke-width="2" rx="4"/>
        <text x="110" y="18" font-size="10.5" font-weight="bold" font-family="JetBrains Mono" fill="#38bdf8" text-anchor="middle">ANTENNA DISTRIBUTION UNIT (DA)</text>
        <text x="110" y="32" font-size="8.5" font-family="JetBrains Mono" fill="#94a3b8" text-anchor="middle">50Ω BNC Input | Net Coax Loss: -${totalLossDb} dB</text>
      </g>
    </svg>
  `;
}
window.renderRfAntennaSchematic = renderRfAntennaSchematic;
