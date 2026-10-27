/**
 * Pro AV Project Budgeting & Procurement Engine
 * Aggregates hardware quantities from Spatial Room Matrix schedule
 * Calculates comprehensive Bill of Materials (BOM)
 * Computes indirect costs: Engineering labor, site installation, freight, local taxes, contingency
 */

var budgetCurrencies = {
  INR: { symbol: '₹', rate: 1.0, label: 'INR (₹) - Indian Rupee' },
  USD: { symbol: '$', rate: 0.012, label: 'USD ($) - US Dollar' },
  EUR: { symbol: '€', rate: 0.011, label: 'EUR (€) - Euro' },
  GBP: { symbol: '£', rate: 0.0095, label: 'GBP (£) - British Pound' },
  AED: { symbol: 'AED ', rate: 0.044, label: 'AED - UAE Dirham' },
  SGD: { symbol: 'S$', rate: 0.016, label: 'SGD (S$) - Singapore Dollar' }
};

var activeBudgetCurrency = 'INR';

var budgetRatesINR = {
  // Displays & Mounts
  disp55: 65000,
  disp65: 95000,
  disp75: 145000,
  disp85: 225000,
  disp98: 480000,
  disp100plus: 850000,
  ledCabinetSqm: 180000, // per sqm dvLED
  dispMountRail: 12000,
  pattressPlateMaterial: 8500,

  // Video Bars
  barCompact: 99000,
  barMid: 198000,
  barLarge: 315000,
  barExec: 430000,

  // Discrete PTZ Cameras
  cam120: 45000,
  cam85: 85000,
  cam72: 125000,
  cam60: 175000,
  camDual: 285000,
  cam360: 110000,

  // Ceiling Loudspeakers & Amps
  spk25: 6500,
  spk30: 8000,
  spk40: 10500,
  spk525: 13500,
  spk65: 16500,
  spk80: 22000,
  spk100: 32000,
  spk120: 44000,
  spkPendant: 26000,
  dspAmpChannel: 18000, // per amp channel allocation

  // Microphones & DSP
  micCeilingArray: 320000, // Shure MXA920 / Sennheiser TCC2 tier
  micTableBoundary: 35000,
  micTableGooseneck: 42000,
  micPendant: 48000,
  audioDspCore: 185000, // Central DSP allocation per floor/system

  // Acoustics
  acousticPanelSqm: 4200, // NRC >= 0.85 fabric wrapped panel per sqm

  // Infrastructure & Cabling
  cableInfraPerRoom: 24000, // Cat6A STP, 4K AOC HDMI, patch cords, wall plates
  avRackAllocation: 45000   // 24U/42U rack hardware & PDU allocation per group of rooms
};

var indirectCostConfig = {
  engineeringPct: 6.0,      // Design & CAD engineering (%)
  installationPct: 12.0,    // On-site installation labor & rigging (%)
  commissioningPct: 4.5,    // Programming, DSP tuning & testing (%)
  shippingPct: 3.5,         // Freight logistics & secure delivery (%)
  taxPct: 18.0,             // Local GST / VAT (%)
  contingencyPct: 5.0,      // Unforeseen field contingency buffer (%)
  warrantyYears: 1,         // Standard warranty
  tradeDiscountPct: 0.0     // Trade / Partner hardware discount (%)
};

var budgetChartInstance = null;
var budgetSubsystemsChart = null;

// Convert base INR to active currency string
function formatBudgetVal(inrVal) {
  var curr = budgetCurrencies[activeBudgetCurrency] || budgetCurrencies.INR;
  var converted = (inrVal || 0) * curr.rate;
  if (activeBudgetCurrency === 'INR') {
    return curr.symbol + Math.round(converted).toLocaleString('en-IN');
  }
  return curr.symbol + Math.round(converted).toLocaleString('en-US');
}

function getActiveCurrencySymbol() {
  var curr = budgetCurrencies[activeBudgetCurrency] || budgetCurrencies.INR;
  return curr.symbol;
}

// 1. REFRESH & AGGREGATE PROCUREMENT DATA FROM SPATIAL ROOM MATRIX
function aggregateProjectBudget() {
  var rows = document.querySelectorAll('#matrixTableBody tr');
  
  var bom = {
    displays: { name: 'Displays & Video Walls', icon: 'fa-display', color: '#0284c7', items: [], subtotal: 0 },
    videoBars: { name: 'Unified Video Bars', icon: 'fa-cube', color: '#0d9488', items: [], subtotal: 0 },
    cameras: { name: 'PTZ Cameras & Optics', icon: 'fa-video', color: '#6366f1', items: [], subtotal: 0 },
    speakers: { name: 'Loudspeakers & Amplification', icon: 'fa-volume-high', color: '#0284c7', items: [], subtotal: 0 },
    microphones: { name: 'Microphones & Audio DSP', icon: 'fa-microphone', color: '#d97706', items: [], subtotal: 0 },
    structure: { name: 'Wall Structure, Mounts & Pattresses', icon: 'fa-layer-group', color: '#ea580c', items: [], subtotal: 0 },
    acoustics: { name: 'Acoustic Absorption Panels', icon: 'fa-wave-square', color: '#16a34a', items: [], subtotal: 0 },
    infrastructure: { name: 'Cables, Connectors & Racks', icon: 'fa-network-wired', color: '#9333ea', items: [], subtotal: 0 }
  };

  var totalRoomsCount = 0;
  var totalSeatsCount = 0;
  var roomScheduleSummary = [];

  rows.forEach(function(tr, idx) {
    var qty = parseInt(tr.querySelector('.inp-qty')?.value) || 1;
    var seats = parseInt(tr.querySelector('.inp-seats')?.value) || 8;
    var name = tr.querySelector('.inp-name')?.value || `Room ${idx + 1}`;
    var floor = tr.querySelector('.inp-floor')?.value || '01';
    var L = (parseFloat(tr.querySelector('.inp-dim-l')?.value) || 7000) / 1000.0;
    var W = (parseFloat(tr.querySelector('.inp-dim-w')?.value) || 5000) / 1000.0;
    var H = (parseFloat(tr.querySelector('.inp-dim-h')?.value) || 2700) / 1000.0;
    var roomArea = L * W;

    totalRoomsCount += qty;
    totalSeatsCount += (seats * qty);

    // 1. Display
    var dispType = tr.querySelector('.inp-disp-type')?.value || 'single';
    var dispQtyVal = parseInt(tr.querySelector('.inp-disp-qty')?.value);
    var dispQty = isNaN(dispQtyVal) ? 1 : dispQtyVal;
    if (dispType !== 'none' && dispQty > 0) {
      var diagInches = 85;
      var dispPrice = budgetRatesINR.disp85;
      if (L <= 4.5) { diagInches = 55; dispPrice = budgetRatesINR.disp55; }
      else if (L <= 6.0) { diagInches = 65; dispPrice = budgetRatesINR.disp65; }
      else if (L <= 7.5) { diagInches = 75; dispPrice = budgetRatesINR.disp75; }
      else if (L <= 9.5) { diagInches = 85; dispPrice = budgetRatesINR.disp85; }
      else if (L <= 12.0) { diagInches = 98; dispPrice = budgetRatesINR.disp98; }
      else { diagInches = 110; dispPrice = budgetRatesINR.disp100plus; }

      var totalDispUnits = dispQty * qty;
      var extDispCost = totalDispUnits * dispPrice;
      bom.displays.items.push({
        item: `${diagInches}" Commercial 4K Display (${dispType.toUpperCase()})`,
        room: name,
        unitQty: totalDispUnits,
        unitRate: dispPrice,
        total: extDispCost
      });
      bom.displays.subtotal += extDispCost;

      // Mount & Pattress per display
      var mountCost = totalDispUnits * (budgetRatesINR.dispMountRail + budgetRatesINR.pattressPlateMaterial);
      bom.structure.items.push({
        item: `Heavy-Duty Mount & Structural Pattress (${diagInches}")`,
        room: name,
        unitQty: totalDispUnits,
        unitRate: budgetRatesINR.dispMountRail + budgetRatesINR.pattressPlateMaterial,
        total: mountCost
      });
      bom.structure.subtotal += mountCost;
    }

    // 2. Video Bar
    var barType = tr.querySelector('.inp-video-bar')?.value || 'none';
    var barQty = parseInt(tr.querySelector('.inp-bar-qty')?.value) || 0;
    if (barType !== 'none' && barQty > 0) {
      var barUnitRate = budgetRatesINR.barMid;
      var barModelName = 'Mid-Size AI Video Bar';
      if (barType === 'compact') { barUnitRate = budgetRatesINR.barCompact; barModelName = 'Compact 4K ePTZ Bar'; }
      else if (barType === 'mid') { barUnitRate = budgetRatesINR.barMid; barModelName = 'Mid-Size AI Video Bar'; }
      else if (barType === 'large') { barUnitRate = budgetRatesINR.barLarge; barModelName = 'Large Dual-Cam Video Bar'; }
      else if (barType === 'exec') { barUnitRate = budgetRatesINR.barExec; barModelName = 'Executive Dual-Screen Bar'; }

      var totalBarUnits = barQty * qty;
      var extBarCost = totalBarUnits * barUnitRate;
      bom.videoBars.items.push({
        item: `${barModelName} + Mounting Bracket`,
        room: name,
        unitQty: totalBarUnits,
        unitRate: barUnitRate,
        total: extBarCost
      });
      bom.videoBars.subtotal += extBarCost;
    }

    // 3. Discrete Camera (if not using video bar)
    var camModel = tr.querySelector('.inp-cam-model')?.value || 'none';
    var camQty = parseInt(tr.querySelector('.inp-cam-qty')?.value) || 0;
    if (camModel !== 'none' && camQty > 0 && (barType === 'none' || barQty === 0)) {
      var camRate = budgetRatesINR.cam72;
      if (camModel.includes('120°')) camRate = budgetRatesINR.cam120;
      else if (camModel.includes('85°')) camRate = budgetRatesINR.cam85;
      else if (camModel.includes('72°')) camRate = budgetRatesINR.cam72;
      else if (camModel.includes('60°')) camRate = budgetRatesINR.cam60;
      else if (camModel.includes('Dual-Eye')) camRate = budgetRatesINR.camDual;
      else if (camModel.includes('360°')) camRate = budgetRatesINR.cam360;

      var totalCamUnits = camQty * qty;
      var extCamCost = totalCamUnits * camRate;
      bom.cameras.items.push({
        item: `${camModel} PTZ Camera`,
        room: name,
        unitQty: totalCamUnits,
        unitRate: camRate,
        total: extCamCost
      });
      bom.cameras.subtotal += extCamCost;
    }

    // 4. Loudspeakers
    var spkSize = tr.querySelector('.inp-spk-size')?.value || '6.5"';
    var spkQty = parseInt(tr.querySelector('.inp-spk-qty')?.value) || 0;
    if (spkSize !== 'none' && spkQty > 0) {
      var spkRate = budgetRatesINR.spk65;
      if (spkSize.includes('2.5"')) spkRate = budgetRatesINR.spk25;
      else if (spkSize.includes('3"')) spkRate = budgetRatesINR.spk30;
      else if (spkSize.includes('4"')) spkRate = budgetRatesINR.spk40;
      else if (spkSize.includes('5.25"')) spkRate = budgetRatesINR.spk525;
      else if (spkSize.includes('6.5"')) spkRate = budgetRatesINR.spk65;
      else if (spkSize.includes('8"')) spkRate = budgetRatesINR.spk80;
      else if (spkSize.includes('10"')) spkRate = budgetRatesINR.spk100;
      else if (spkSize.includes('12"')) spkRate = budgetRatesINR.spk120;
      else if (spkSize.includes('pendant')) spkRate = budgetRatesINR.spkPendant;

      var totalSpkUnits = spkQty * qty;
      var extSpkCost = (totalSpkUnits * spkRate) + (qty * budgetRatesINR.dspAmpChannel * Math.ceil(spkQty / 4));
      bom.speakers.items.push({
        item: `${spkSize} Loudspeakers & DSP Amplification Channel`,
        room: name,
        unitQty: totalSpkUnits,
        unitRate: spkRate,
        total: extSpkCost
      });
      bom.speakers.subtotal += extSpkCost;
    }

    // 5. Microphones
    var micType = tr.querySelector('.inp-mic-type')?.value || 'none';
    var micQty = parseInt(tr.querySelector('.inp-mic-qty')?.value) || 0;
    if (micType !== 'none' && micQty > 0 && micType !== 'bar_builtin') {
      var micRate = budgetRatesINR.micTableBoundary;
      var micLabel = 'Tabletop Boundary Mic';
      if (micType === 'ceiling_array') { micRate = budgetRatesINR.micCeilingArray; micLabel = 'Ceiling Beamforming Array (MXA920/TCC2)'; }
      else if (micType === 'table_boundary') { micRate = budgetRatesINR.micTableBoundary; micLabel = 'Tabletop Boundary Mics'; }
      else if (micType === 'table_gooseneck') { micRate = budgetRatesINR.micTableGooseneck; micLabel = 'Table Gooseneck Delegate Mics'; }
      else if (micType === 'pendant_mic') { micRate = budgetRatesINR.micPendant; micLabel = 'Ceiling Pendant Mic'; }

      var totalMicUnits = micQty * qty;
      var extMicCost = totalMicUnits * micRate;
      bom.microphones.items.push({
        item: `${micLabel}`,
        room: name,
        unitQty: totalMicUnits,
        unitRate: micRate,
        total: extMicCost
      });
      bom.microphones.subtotal += extMicCost;
    }

    // 6. Acoustics Panels (Sabine calculation)
    var surfaceArea = 2 * (L * W + L * H + W * H);
    var volume = L * W * H;
    var curRT60 = 0.161 * volume / (surfaceArea * 0.12);
    if (curRT60 > 0.60) {
      var targetRT60 = 0.55;
      var neededAbsorption = (0.161 * volume / targetRT60) - (surfaceArea * 0.12);
      var panelSqm = Math.max(0, Math.ceil(neededAbsorption / 0.85));
      if (panelSqm > 0) {
        var totalPanelsSqm = panelSqm * qty;
        var extAcCost = totalPanelsSqm * budgetRatesINR.acousticPanelSqm;
        bom.acoustics.items.push({
          item: `NRC 0.85 Fabric Wrapped Wall Acoustic Panels (${panelSqm} m²/room)`,
          room: name,
          unitQty: totalPanelsSqm,
          unitRate: budgetRatesINR.acousticPanelSqm,
          total: extAcCost
        });
        bom.acoustics.subtotal += extAcCost;
      }
    }

    // 7. Cabling & Infrastructure per room
    var totalInfraCost = qty * budgetRatesINR.cableInfraPerRoom;
    bom.infrastructure.items.push({
      item: `Structured Cat6A STP, 4K AOC HDMI, Wall Plates & Patch Cables`,
      room: name,
      unitQty: qty,
      unitRate: budgetRatesINR.cableInfraPerRoom,
      total: totalInfraCost
    });
    bom.infrastructure.subtotal += totalInfraCost;

    roomScheduleSummary.push({
      name: name,
      floor: floor,
      qty: qty,
      seats: seats,
      area: roomArea
    });
  });

  // Calculate Hardware Total
  var totalRawHardware = 0;
  Object.keys(bom).forEach(function(k) {
    totalRawHardware += bom[k].subtotal;
  });

  // Apply Trade Discount
  var discountVal = totalRawHardware * (indirectCostConfig.tradeDiscountPct / 100.0);
  var netHardware = totalRawHardware - discountVal;

  // Calculate Indirect Costs
  var engineeringCost = netHardware * (indirectCostConfig.engineeringPct / 100.0);
  var installationCost = netHardware * (indirectCostConfig.installationPct / 100.0);
  var commissioningCost = netHardware * (indirectCostConfig.commissioningPct / 100.0);
  var shippingCost = netHardware * (indirectCostConfig.shippingPct / 100.0);
  
  var totalServicesAndLabor = engineeringCost + installationCost + commissioningCost;
  var subtotalBeforeTaxAndContingency = netHardware + totalServicesAndLabor + shippingCost;
  
  var contingencyCost = subtotalBeforeTaxAndContingency * (indirectCostConfig.contingencyPct / 100.0);
  var taxableTotal = subtotalBeforeTaxAndContingency + contingencyCost;
  var taxCost = taxableTotal * (indirectCostConfig.taxPct / 100.0);

  var grandTotalProject = taxableTotal + taxCost;
  var costPerRoom = totalRoomsCount > 0 ? (grandTotalProject / totalRoomsCount) : 0;
  var costPerSeat = totalSeatsCount > 0 ? (grandTotalProject / totalSeatsCount) : 0;

  var budgetData = {
    bom: bom,
    totalRoomsCount: totalRoomsCount,
    totalSeatsCount: totalSeatsCount,
    totalRawHardware: totalRawHardware,
    discountVal: discountVal,
    netHardware: netHardware,
    engineeringCost: engineeringCost,
    installationCost: installationCost,
    commissioningCost: commissioningCost,
    totalServicesAndLabor: totalServicesAndLabor,
    shippingCost: shippingCost,
    contingencyCost: contingencyCost,
    taxCost: taxCost,
    grandTotalProject: grandTotalProject,
    costPerRoom: costPerRoom,
    costPerSeat: costPerSeat,
    roomScheduleSummary: roomScheduleSummary
  };

  window.activeProjectBudgetData = budgetData;
  renderBudgetingTabUI(budgetData);
  return budgetData;
}

// 2. RENDER USER INTERFACE IN BUDGETING TAB
function renderBudgetingTabUI(d) {
  if (!d) return;

  // KPI Summary Cards
  var elGrandTotal = document.getElementById('bgtGrandTotalDisplay');
  if (elGrandTotal) elGrandTotal.innerText = formatBudgetVal(d.grandTotalProject);

  var elNetHardware = document.getElementById('bgtNetHardwareDisplay');
  if (elNetHardware) elNetHardware.innerText = formatBudgetVal(d.netHardware);

  var elServicesLabor = document.getElementById('bgtServicesLaborDisplay');
  if (elServicesLabor) elServicesLabor.innerText = formatBudgetVal(d.totalServicesAndLabor);

  var elLogisticsTaxes = document.getElementById('bgtLogisticsTaxesDisplay');
  if (elLogisticsTaxes) elLogisticsTaxes.innerText = formatBudgetVal(d.shippingCost + d.contingencyCost + d.taxCost);

  var elCostPerRoom = document.getElementById('bgtCostPerRoomDisplay');
  if (elCostPerRoom) elCostPerRoom.innerText = formatBudgetVal(d.costPerRoom);

  var elCostPerSeat = document.getElementById('bgtCostPerSeatDisplay');
  if (elCostPerSeat) elCostPerSeat.innerText = formatBudgetVal(d.costPerSeat);

  var elRoomCount = document.getElementById('bgtTotalRoomsBadge');
  if (elRoomCount) elRoomCount.innerText = `${d.totalRoomsCount} Rooms (${d.totalSeatsCount} Seats)`;

  // Indirect Costs Breakdown Badges
  var elEng = document.getElementById('bgtValEngineering');
  if (elEng) elEng.innerText = formatBudgetVal(d.engineeringCost);

  var elInstall = document.getElementById('bgtValInstallation');
  if (elInstall) elInstall.innerText = formatBudgetVal(d.installationCost);

  var elComm = document.getElementById('bgtValCommissioning');
  if (elComm) elComm.innerText = formatBudgetVal(d.commissioningCost);

  var elShip = document.getElementById('bgtValShipping');
  if (elShip) elShip.innerText = formatBudgetVal(d.shippingCost);

  var elCont = document.getElementById('bgtValContingency');
  if (elCont) elCont.innerText = formatBudgetVal(d.contingencyCost);

  var elTax = document.getElementById('bgtValTaxes');
  if (elTax) elTax.innerText = formatBudgetVal(d.taxCost);

  // Render Category Cards & Detailed BOM Table
  renderBomDetailedTable(d);
  renderBudgetCharts(d);
}

// 3. RENDER DETAILED BOM TABLE
function renderBomDetailedTable(d) {
  var tbody = document.getElementById('bgtBomTableBody');
  if (!tbody) return;

  var html = '';
  var itemIndex = 1;

  Object.keys(d.bom).forEach(function(catKey) {
    var cat = d.bom[catKey];
    if (cat.items.length === 0) return;

    // Category Header Row
    html += `
      <tr class="table-dark" style="background:#0f172a; color:#ffffff; font-weight:bold;">
        <td colspan="6" class="text-start py-2 px-3">
          <i class="fa-solid ${cat.icon} me-2" style="color:${cat.color};"></i>
          <span>${cat.name}</span>
          <span class="badge float-end" style="background:${cat.color};">${formatBudgetVal(cat.subtotal)}</span>
        </td>
      </tr>
    `;

    cat.items.forEach(function(item) {
      html += `
        <tr style="font-size:0.80rem;">
          <td class="text-center font-monospace text-muted" style="width:40px;">${itemIndex++}</td>
          <td class="text-start fw-bold text-dark">
            ${item.item}
            <div class="small text-muted font-monospace" style="font-size:0.70rem;">Scope: ${item.room}</div>
          </td>
          <td class="text-center font-monospace fw-bold text-primary" style="width:70px;">${item.unitQty}</td>
          <td class="text-end font-monospace text-secondary" style="width:120px;">${formatBudgetVal(item.unitRate)}</td>
          <td class="text-end font-monospace fw-bold text-dark" style="width:130px;">${formatBudgetVal(item.total)}</td>
          <td class="text-center text-muted" style="width:75px;">
            <span class="badge bg-light text-dark border">Procure</span>
          </td>
        </tr>
      `;
    });
  });

  if (html === '') {
    html = `
      <tr>
        <td colspan="6" class="text-center py-4 text-muted">
          <i class="fa-solid fa-folder-open fs-3 mb-2 d-block text-secondary"></i>
          No hardware items found in the Spatial Room Matrix. Add rooms to the matrix to generate the Bill of Materials.
        </td>
      </tr>
    `;
  }

  tbody.innerHTML = html;
}

// 4. RENDER VISUAL CHARTS (Cost Distribution & Subsystems)
function renderBudgetCharts(d) {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Direct vs Indirect Cost Doughnut
  var ctx1 = document.getElementById('bgtCostDistributionChart');
  if (ctx1) {
    if (budgetChartInstance) budgetChartInstance.destroy();

    budgetChartInstance = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Net Hardware', 'Installation & Labor', 'Engineering & CAD', 'Taxes (GST/VAT)', 'Freight & Logistics', 'Contingency'],
        datasets: [{
          data: [
            Math.round(d.netHardware),
            Math.round(d.installationCost + d.commissioningCost),
            Math.round(d.engineeringCost),
            Math.round(d.taxCost),
            Math.round(d.shippingCost),
            Math.round(d.contingencyCost)
          ],
          backgroundColor: ['#2563eb', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#64748b'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                var val = ctx.raw || 0;
                return ' ' + ctx.label + ': ' + formatBudgetVal(val);
              }
            }
          }
        }
      }
    });
  }

  // Chart 2: Subsystems Hardware Breakdown
  var ctx2 = document.getElementById('bgtSubsystemsChart');
  if (ctx2) {
    if (budgetSubsystemsChart) budgetSubsystemsChart.destroy();

    var subLabels = [];
    var subData = [];
    var subColors = [];

    Object.keys(d.bom).forEach(function(k) {
      if (d.bom[k].subtotal > 0) {
        subLabels.push(d.bom[k].name);
        subData.push(Math.round(d.bom[k].subtotal));
        subColors.push(d.bom[k].color);
      }
    });

    budgetSubsystemsChart = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: subLabels.length > 0 ? subLabels : ['No Hardware'],
        datasets: [{
          label: 'Subsystem Cost',
          data: subData.length > 0 ? subData : [0],
          backgroundColor: subColors.length > 0 ? subColors : ['#cbd5e1'],
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: { ticks: { callback: function(val) { return getActiveCurrencySymbol() + (val >= 1000 ? (val/1000).toFixed(0) + 'k' : val); }, font: { size: 9 } } },
          y: { ticks: { font: { size: 9, weight: 'bold' } } }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) { return ' ' + formatBudgetVal(ctx.raw); }
            }
          }
        }
      }
    });
  }
}

// 5. UPDATE INDIRECT COST SLIDERS / INPUTS
function updateIndirectCostParam(paramKey, val) {
  var num = parseFloat(val);
  if (!isNaN(num)) {
    indirectCostConfig[paramKey] = num;
    var badge = document.getElementById(`bgtBadge_${paramKey}`);
    if (badge) badge.innerText = `${num.toFixed(1)}%`;
    aggregateProjectBudget();
  }
}

function setBudgetCurrency(currCode) {
  if (budgetCurrencies[currCode]) {
    activeBudgetCurrency = currCode;
    var btnText = document.getElementById('bgtActiveCurrencyLabel');
    if (btnText) btnText.innerText = budgetCurrencies[currCode].label;
    aggregateProjectBudget();
  }
}

// 6. EXPORT PROCUREMENT TENDER BOM TO EXCEL
function exportProcurementBomExcel() {
  var d = window.activeProjectBudgetData;
  if (!d || d.totalRoomsCount === 0) {
    alert('Please add rooms to the Spatial Room Matrix before exporting the procurement BOM.');
    return;
  }

  var projName = document.getElementById('matrixProjectNameInput')?.value || 'Pro AV Enterprise Project';
  var dateStr = new Date().toLocaleDateString('en-GB');

  var html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th { background-color: #1e3a8a; color: #ffffff; padding: 6px; font-size: 9pt; border: 1px solid #000; text-align: center; }
        td { padding: 5px; border: 1px solid #cbd5e1; font-size: 9pt; }
        .cat-hdr { background-color: #0f172a; color: #ffffff; font-weight: bold; }
        .num { text-align: right; font-family: Consolas, monospace; }
        .center { text-align: center; }
        .kpi-row { background-color: #f1f5f9; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>PRO AV PROJECT BUDGETING &amp; PROCUREMENT BILL OF MATERIALS</h2>
      <p><strong>Project:</strong> ${projName} &nbsp;|&nbsp; <strong>Date:</strong> ${dateStr} &nbsp;|&nbsp; <strong>Currency:</strong> ${activeBudgetCurrency} &nbsp;|&nbsp; <strong>Total Rooms:</strong> ${d.totalRoomsCount} &nbsp;|&nbsp; <strong>Capacity:</strong> ${d.totalSeatsCount} Seats</p>

      <table>
        <thead>
          <tr>
            <th>SL</th>
            <th>SUBSYSTEM &amp; HARDWARE DESCRIPTION</th>
            <th>SCOPE / ROOM</th>
            <th>QTY</th>
            <th>UNIT RATE (${activeBudgetCurrency})</th>
            <th>EXTENDED TOTAL (${activeBudgetCurrency})</th>
          </tr>
        </thead>
        <tbody>
  `;

  var sl = 1;
  Object.keys(d.bom).forEach(function(k) {
    var cat = d.bom[k];
    if (cat.items.length === 0) return;

    html += `
      <tr class="cat-hdr">
        <td colspan="5"><strong>${cat.name.toUpperCase()}</strong></td>
        <td class="num"><strong>${formatBudgetVal(cat.subtotal)}</strong></td>
      </tr>
    `;

    cat.items.forEach(function(it) {
      html += `
        <tr>
          <td class="center">${sl++}</td>
          <td>${it.item}</td>
          <td>${it.room}</td>
          <td class="center">${it.unitQty}</td>
          <td class="num">${formatBudgetVal(it.unitRate)}</td>
          <td class="num">${formatBudgetVal(it.total)}</td>
        </tr>
      `;
    });
  });

  html += `
        <tr class="kpi-row"><td colspan="5" class="num">NET HARDWARE DIRECT COST:</td><td class="num">${formatBudgetVal(d.netHardware)}</td></tr>
        <tr class="kpi-row"><td colspan="5" class="num">ENGINEERING &amp; CAD DESIGN (${indirectCostConfig.engineeringPct}%):</td><td class="num">${formatBudgetVal(d.engineeringCost)}</td></tr>
        <tr class="kpi-row"><td colspan="5" class="num">INSTALLATION &amp; FIELD RIGGING (${indirectCostConfig.installationPct}%):</td><td class="num">${formatBudgetVal(d.installationCost)}</td></tr>
        <tr class="kpi-row"><td colspan="5" class="num">PROGRAMMING, DSP TUNING &amp; COMMISSIONING (${indirectCostConfig.commissioningPct}%):</td><td class="num">${formatBudgetVal(d.commissioningCost)}</td></tr>
        <tr class="kpi-row"><td colspan="5" class="num">FREIGHT, PACKING &amp; LOGISTICS (${indirectCostConfig.shippingPct}%):</td><td class="num">${formatBudgetVal(d.shippingCost)}</td></tr>
        <tr class="kpi-row"><td colspan="5" class="num">FIELD CONTINGENCY BUFFER (${indirectCostConfig.contingencyPct}%):</td><td class="num">${formatBudgetVal(d.contingencyCost)}</td></tr>
        <tr class="kpi-row"><td colspan="5" class="num">LOCAL TAXES (GST / VAT @ ${indirectCostConfig.taxPct}%):</td><td class="num">${formatBudgetVal(d.taxCost)}</td></tr>
        <tr style="background:#0f172a; color:#22c55e; font-size:11pt; font-weight:bold;">
          <td colspan="5" class="num">GRAND PROJECT TOTAL:</td>
          <td class="num">${formatBudgetVal(d.grandTotalProject)}</td>
        </tr>
      </tbody>
    </table>
    </body></html>
  `;

  var blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = `ProAV_Procurement_BOM_${activeBudgetCurrency}_${Date.now()}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 7. PRINT / PDF PROCUREMENT SHEET
function printProcurementQuotation() {
  window.print();
}

// ==========================================
// 8. SECURITY LOCK WITH CURRENT WEEKDAY NAME
// ==========================================
var isBudgetUnlocked = false;
var budgetClockInterval = null;

function getTodayWeekdayName() {
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

function updateBudgetLiveClock() {
  var elClock = document.getElementById('budgetLiveClock');
  var elDayPill = document.getElementById('budgetDayPill');
  if (!elClock) return;

  var now = new Date();
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var dayName = days[now.getDay()];
  var monthName = months[now.getMonth()];
  var dateNum = now.getDate();
  var yearNum = now.getFullYear();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  var pad = function(n) { return (n < 10 ? '0' : '') + n; };
  var timeStr = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds) + ' ' + ampm;
  var fullDateStr = `${dayName}, ${monthName} ${dateNum}, ${yearNum} • ${timeStr}`;

  elClock.innerHTML = `<span class="badge bg-emerald-300 text-emerald-950 px-2.5 py-1 me-2 font-mono fs-6 fw-bold shadow-xs border border-emerald-100"><i class="fa-solid fa-calendar-day me-1 text-emerald-700"></i>${dayName}</span><span class="font-mono text-emerald-50">${monthName} ${dateNum}, ${yearNum} • ${timeStr}</span>`;
  if (elDayPill) elDayPill.textContent = dayName;
}

// Strictly enforce locked state every time tab is clicked
function initBudgetPasswordGate() {
  isBudgetUnlocked = false;
  var gate = document.getElementById('budgetLockGate');
  var content = document.getElementById('budgetUnlockedContent');
  var pwdInput = document.getElementById('budgetPasswordInput');
  var feedback = document.getElementById('budgetAuthFeedback');

  if (gate) gate.style.display = 'block';
  if (content) content.style.display = 'none';
  if (pwdInput) {
    pwdInput.value = '';
    pwdInput.classList.remove('is-invalid', 'is-valid');
  }
  if (feedback) {
    feedback.className = 'small font-mono text-muted mb-3';
    feedback.textContent = '';
  }

  updateBudgetLiveClock();
  if (budgetClockInterval) clearInterval(budgetClockInterval);
  budgetClockInterval = setInterval(updateBudgetLiveClock, 1000);

  setTimeout(function() {
    if (pwdInput) pwdInput.focus();
  }, 200);
}

function verifyBudgetPassword() {
  var pwdInput = document.getElementById('budgetPasswordInput');
  var feedback = document.getElementById('budgetAuthFeedback');
  var entered = (pwdInput?.value || '').trim();
  var today = getTodayWeekdayName();

  if (entered.toLowerCase() === today.toLowerCase()) {
    isBudgetUnlocked = true;
    if (feedback) {
      feedback.className = 'small font-mono text-success mb-3 fw-bold';
      feedback.textContent = `✓ Access granted! Verified current weekday: ${today}. Unlocking confidential BOM & Procurement rates...`;
    }
    if (pwdInput) {
      pwdInput.classList.remove('is-invalid');
      pwdInput.classList.add('is-valid');
    }
    setTimeout(function() {
      var gate = document.getElementById('budgetLockGate');
      var content = document.getElementById('budgetUnlockedContent');
      if (gate) gate.style.display = 'none';
      if (content) content.style.display = 'block';
      aggregateProjectBudget();
    }, 350);
  } else {
    if (feedback) {
      feedback.className = 'small font-mono text-danger mb-3 fw-bold';
      feedback.textContent = `✕ Incorrect password. Enter today's weekday name (${today}) to access the procurement schedule.`;
    }
    if (pwdInput) {
      pwdInput.classList.add('is-invalid');
      setTimeout(function() { if (pwdInput) pwdInput.classList.remove('is-invalid'); }, 2000);
      pwdInput.focus();
      pwdInput.select();
    }
  }
}

function toggleBudgetPasswordVisibility() {
  var pwdInput = document.getElementById('budgetPasswordInput');
  var eyeIcon = document.getElementById('budgetPwdEyeIcon');
  if (!pwdInput) return;
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye-slash';
  } else {
    pwdInput.type = 'password';
    if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye';
  }
}

function lockBudgetingTab() {
  initBudgetPasswordGate();
}

// Global exports
window.initProjectBudgetingTab = function() {
  initBudgetPasswordGate();
};
window.initBudgetPasswordGate = initBudgetPasswordGate;
window.verifyBudgetPassword = verifyBudgetPassword;
window.toggleBudgetPasswordVisibility = toggleBudgetPasswordVisibility;
window.lockBudgetingTab = lockBudgetingTab;
window.getTodayWeekdayName = getTodayWeekdayName;
window.updateBudgetLiveClock = updateBudgetLiveClock;

// Auto-start live clock ticker immediately so #budgetLiveClock ticks live from initial load
(function() {
  function startBudgetLiveClockTicker() {
    updateBudgetLiveClock();
    if (!window.budgetClockInterval) {
      window.budgetClockInterval = setInterval(updateBudgetLiveClock, 1000);
    }
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startBudgetLiveClockTicker);
    } else {
      startBudgetLiveClockTicker();
    }
  }
})();

