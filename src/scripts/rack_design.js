/**
 * Pro AV System Architect - Rack Design Studio (EIA-310-D Standard)
 * Full Interactive 1U-99U Rack Elevation, Photorealistic 3D Axonometric View,
 * Exact 2D Side View with Load-Bearing Support Rails & Cable Loom (no floating devices),
 * Device Management, Power/Watts to BTU/hr Calculator, Dedicated Auto-Sort BTU Function,
 * Global Rack Standards Catalog & Auto-Sizing, and Custom Front View Image Upload.
 */

(function(window) {
  'use strict';

  // Constants: EIA-310-D Standard Dimensions
  var EIA_1U_INCHES = 1.75;
  var EIA_1U_MM = 44.45;
  var EIA_WIDTH_INCHES = 19.00;
  var EIA_WIDTH_MM = 482.6;
  var EIA_APERTURE_MM = 450.85;
  var EIA_HOLE_SPACING_MM = 465.1;
  var WATTS_TO_BTU_HR = 3.412142;

  // Global Commercial Rack Catalog
  var GLOBAL_RACK_STANDARDS = [
    // Wall-Mount Enclosures
    { id: 'wm-6u', name: '6U Wall-Mount Enclosure', category: 'Wall-Mount', totalU: 6, depthMm: 500, heightMm: 266.7, desc: 'Small Huddle / Network Zone Box' },
    { id: 'wm-9u', name: '9U Wall-Mount Enclosure', category: 'Wall-Mount', totalU: 9, depthMm: 500, heightMm: 400.0, desc: 'Medium Conference Room Wall Cabinet' },
    { id: 'wm-12u', name: '12U Wall-Mount Enclosure', category: 'Wall-Mount', totalU: 12, depthMm: 600, heightMm: 533.4, desc: 'Enterprise AV Wall Rack with Swing Frame' },
    { id: 'wm-15u', name: '15U Wall-Mount Enclosure', category: 'Wall-Mount', totalU: 15, depthMm: 600, heightMm: 666.8, desc: 'Large Wall Rack with Cable Ingress' },
    { id: 'wm-18u', name: '18U Wall-Mount Enclosure', category: 'Wall-Mount', totalU: 18, depthMm: 600, heightMm: 800.1, desc: 'High-Capacity Wall Enclosure' },
    { id: 'wm-21u', name: '21U Wall-Mount Enclosure', category: 'Wall-Mount', totalU: 21, depthMm: 600, heightMm: 933.5, desc: 'Maximum Height Wall Cabinet' },

    // Credenza & Under-Desk
    { id: 'cr-8u', name: '8U Under-Desk / Credenza Rack', category: 'Credenza', totalU: 8, depthMm: 500, heightMm: 355.6, desc: 'Executive Boardroom Low-Profile Credenza' },
    { id: 'cr-10u', name: '10U Credenza AV Frame', category: 'Credenza', totalU: 10, depthMm: 600, heightMm: 444.5, desc: 'Furniture-Integrated AV Rack' },
    { id: 'cr-12u', name: '12U Credenza AV Cabinet', category: 'Credenza', totalU: 12, depthMm: 600, heightMm: 533.4, desc: 'Dual-Bay Credenza Section' },
    { id: 'cr-14u', name: '14U Low-Profile Enclosure', category: 'Credenza', totalU: 14, depthMm: 600, heightMm: 622.3, desc: 'Under-Counter AV Enclosure' },
    { id: 'cr-16u', name: '16U Mid-Height Credenza Rack', category: 'Credenza', totalU: 16, depthMm: 600, heightMm: 711.2, desc: 'High-Density Furniture Enclosure' },

    // Floor Standing Mid-Cabinets
    { id: 'fl-21u', name: '21U Floor-Standing AV Cabinet', category: 'Floor-Standing', totalU: 21, depthMm: 800, heightMm: 933.5, desc: 'Compact Floor Cabinet with Casters' },
    { id: 'fl-24u', name: '24U Floor-Standing AV Enclosure', category: 'Floor-Standing', totalU: 24, depthMm: 800, heightMm: 1066.8, desc: 'Standard AV Control Room Cabinet' },
    { id: 'fl-27u', name: '27U Commercial Equipment Rack', category: 'Floor-Standing', totalU: 27, depthMm: 800, heightMm: 1200.2, desc: 'Mid-Tier Auditoria / Lecture AV Rack' },
    { id: 'fl-32u', name: '32U Multi-Bay Equipment Enclosure', category: 'Floor-Standing', totalU: 32, depthMm: 800, heightMm: 1422.4, desc: 'Large Corporate AV System Rack' },
    { id: 'fl-37u', name: '37U Professional AV Enclosure', category: 'Floor-Standing', totalU: 37, depthMm: 900, heightMm: 1644.7, desc: 'Broadcast Production Sub-Rack' },

    // Full-Height Enterprise & Broadcast
    { id: 'ent-42u', name: '42U Standard Enterprise Rack', category: 'Enterprise Full-Height', totalU: 42, depthMm: 1000, heightMm: 1866.9, desc: 'Global Commercial Master Control / Datacenter Standard' },
    { id: 'ent-45u', name: '45U High-Density AV Rack', category: 'Enterprise Full-Height', totalU: 45, depthMm: 1000, heightMm: 2000.3, desc: 'Campus Headend & IPTV Distribution' },
    { id: 'ent-48u', name: '48U Master Control Room Rack', category: 'Enterprise Full-Height', totalU: 48, depthMm: 1000, heightMm: 2133.6, desc: 'Broadcast Facility Central Rack Bay' },
    { id: 'ent-52u', name: '52U Mega-Rack Enclosure', category: 'Enterprise Full-Height', totalU: 52, depthMm: 1200, heightMm: 2311.4, desc: 'Ultra-High Density Telecom & AVoIP Hub' },

    // 2-Post & 4-Post Open Frame
    { id: 'of-24u', name: '24U 2-Post Open Telecom Frame', category: 'Open-Frame', totalU: 24, depthMm: 450, heightMm: 1066.8, desc: 'Open Frame Patching & Telecom' },
    { id: 'of-42u', name: '42U 4-Post Open Equipment Rack', category: 'Open-Frame', totalU: 42, depthMm: 800, heightMm: 1866.9, desc: 'Unrestricted Convection Open 4-Post Frame' }
  ];

  // Comprehensive Equipment Library Presets
  var EQUIPMENT_PRESETS = [
    {
      name: 'AC Infinity Cloudplate T1 1U Thermal Fan',
      category: 'fan',
      uHeight: 1,
      depthMm: 345,
      widthMm: 482.6,
      powerWatts: 18,
      weightKg: 3.1,
      color: '#090d16',
      accentColor: '#38bdf8',
      desc: 'Smart 1U Rack Fan with Digital Thermostat Display (°F/°C)'
    },
    {
      name: 'AC Infinity Cloudplate T2 2U High-Airflow Fan',
      category: 'fan',
      uHeight: 2,
      depthMm: 345,
      widthMm: 482.6,
      powerWatts: 32,
      weightKg: 4.8,
      color: '#090d16',
      accentColor: '#0ea5e9',
      desc: '220 CFM Triple-Blower Thermal Exhaust System'
    },
    {
      name: 'APC Smart-UPS SRT 1500VA Online 2U',
      category: 'ups',
      uHeight: 2,
      depthMm: 508,
      widthMm: 482.6,
      powerWatts: 45,
      weightKg: 20.5,
      color: '#18181b',
      accentColor: '#eab308',
      desc: 'Pure Sine Wave Double-Conversion Battery Backup with LCD'
    },
    {
      name: 'Cisco Catalyst 9300-24P PoE+ Switch',
      category: 'switch',
      uHeight: 1,
      depthMm: 445,
      widthMm: 482.6,
      powerWatts: 240,
      weightKg: 7.2,
      color: '#1e293b',
      accentColor: '#0284c7',
      desc: 'Enterprise 24-Port Gigabit PoE+ Managed Switch (370W Budget)'
    },
    {
      name: 'Netgear AV Line M4250-26G4F (GSM4230P)',
      category: 'switch',
      uHeight: 1,
      depthMm: 257,
      widthMm: 482.6,
      powerWatts: 180,
      weightKg: 3.9,
      color: '#1e1b4b',
      accentColor: '#818cf8',
      desc: '24-Port Gigabit PoE+ Managed AVoIP Switch (NDAA Compliant)'
    },
    {
      name: 'Extron DTP CrossPoint 4K 108 Matrix',
      category: 'matrix',
      uHeight: 3,
      depthMm: 450,
      widthMm: 482.6,
      powerWatts: 120,
      weightKg: 8.5,
      color: '#1e293b',
      accentColor: '#0284c7',
      desc: '4K Scaling Presentation Matrix Switcher'
    },
    {
      name: 'Crestron DM-NVX-360 4K60 Encoder/Decoder',
      category: 'matrix',
      uHeight: 1,
      depthMm: 280,
      widthMm: 482.6,
      powerWatts: 45,
      weightKg: 2.8,
      color: '#0f172a',
      accentColor: '#38bdf8',
      desc: '4K60 4:4:4 HDR AV-over-IP Transceiver Unit'
    },
    {
      name: 'Q-SYS Core 110f v2 Unified DSP',
      category: 'dsp',
      uHeight: 1,
      depthMm: 356,
      widthMm: 482.6,
      powerWatts: 65,
      weightKg: 4.8,
      color: '#18181b',
      accentColor: '#10b981',
      desc: 'Unified Audio, Video & Control Processing Core'
    },
    {
      name: 'Biamp TesiraFORTÉ DAN CI Audio DSP',
      category: 'dsp',
      uHeight: 1,
      depthMm: 270,
      widthMm: 482.6,
      powerWatts: 35,
      weightKg: 3.6,
      color: '#27272a',
      accentColor: '#10b981',
      desc: 'Digital Audio Server with Dante, 12 Analog In / 8 Analog Out'
    },
    {
      name: 'Shure IntelliMix P300 Audio DSP',
      category: 'dsp',
      uHeight: 1,
      depthMm: 240,
      widthMm: 482.6,
      powerWatts: 25,
      weightKg: 1.7,
      color: '#111827',
      accentColor: '#22c55e',
      desc: 'Conferencing Audio DSP with Multi-Channel AEC & Dante'
    },
    {
      name: 'Powersoft Quattrocanali 4804 DSP+D 1U Amp',
      category: 'amp',
      uHeight: 1,
      depthMm: 358,
      widthMm: 482.6,
      powerWatts: 420,
      weightKg: 7.0,
      color: '#18181b',
      accentColor: '#f97316',
      desc: '4-Channel 4800W High-Efficiency Power Amplifier with DSP'
    },
    {
      name: 'Crown DriveCore DCi 4|600N 2U Amp',
      category: 'amp',
      uHeight: 2,
      depthMm: 411,
      widthMm: 482.6,
      powerWatts: 480,
      weightKg: 9.1,
      color: '#27272a',
      accentColor: '#f97316',
      desc: '4-Channel 600W Network Power Amplifier with DriveCore'
    },
    {
      name: 'Crown DriveCore DCi 8|600N 2U Amp',
      category: 'amp',
      uHeight: 2,
      depthMm: 420,
      widthMm: 482.6,
      powerWatts: 850,
      weightKg: 13.6,
      color: '#27272a',
      accentColor: '#ef4444',
      desc: '8-Channel 600W High-Heat Power Amplifier'
    },
    {
      name: 'Furman PL-PRO DMC 20A PDU Conditioner',
      category: 'pdu',
      uHeight: 1,
      depthMm: 267,
      widthMm: 482.6,
      powerWatts: 15,
      weightKg: 5.4,
      color: '#09090b',
      accentColor: '#3b82f6',
      desc: 'Power Conditioner with Digital Voltmeter & Ammeter'
    },
    {
      name: 'Apple Mac Studio Rackmount Shelf',
      category: 'server',
      uHeight: 2,
      depthMm: 350,
      widthMm: 482.6,
      powerWatts: 140,
      weightKg: 4.5,
      color: '#334155',
      accentColor: '#94a3b8',
      desc: 'Dual Apple Silicon Mac Studio AV Streaming Server'
    },
    {
      name: 'Middle Atlantic 1U Slotted Vent Panel',
      category: 'blank',
      uHeight: 1,
      depthMm: 25,
      widthMm: 482.6,
      powerWatts: 0,
      weightKg: 0.6,
      color: '#0f172a',
      accentColor: '#64748b',
      desc: '1U Passive Convection Flanged Slotted Vent Panel'
    },
    {
      name: 'Middle Atlantic 2U Slotted Vent Panel',
      category: 'blank',
      uHeight: 2,
      depthMm: 25,
      widthMm: 482.6,
      powerWatts: 0,
      weightKg: 0.9,
      color: '#0f172a',
      accentColor: '#64748b',
      desc: '2U Passive Convection Flanged Slotted Vent Panel'
    },
    {
      name: '2U Lockable Rack Utility Drawer',
      category: 'drawer',
      uHeight: 2,
      depthMm: 380,
      widthMm: 482.6,
      powerWatts: 0,
      weightKg: 6.2,
      color: '#18181b',
      accentColor: '#a1a1aa',
      desc: 'Heavy-Duty Ballast Drawer with Key Lock for Tools & Mics'
    }
  ];

  // State
  var rackState = {
    totalU: 24,
    rackDepthMm: 800,
    rackModelName: 'Standard 19" 24U Equipment Rack',
    screwType: 'm6', // 'm6', '10-32', '12-24'
    screwColor: 'black', // 'black', 'silver'
    showScrews: true,
    viewMode: 'all', // 'all', '3d', 'front', 'side'
    activeDeviceId: null,
    devices: [],
    thermalThresholdCritical: 1200, // Dynamic thermal critical threshold in BTU/hr (range 400 - 3000)
    thermalFilterTier: null // Highlight filter: 'nominal' | 'moderate' | 'elevated' | 'critical'
  };

  // Default seed devices demonstrating a realistic AV rack
  var initialDeviceSeeds = [
    {
      id: 'dev_fan_1',
      name: 'AC Infinity Cloudplate T1 1U Thermal Fan',
      category: 'fan',
      uHeight: 1,
      uStart: 24, // Top slot for chimney exhaust
      depthMm: 345,
      widthMm: 482.6,
      powerWatts: 18,
      btuHr: 61,
      weightKg: 3.1,
      color: '#090d16',
      accentColor: '#38bdf8'
    },
    {
      id: 'dev_1',
      name: 'Furman PL-PRO DMC 20A PDU',
      category: 'pdu',
      uHeight: 1,
      uStart: 23,
      depthMm: 267,
      widthMm: 482.6,
      powerWatts: 15,
      btuHr: 51,
      weightKg: 5.4,
      color: '#09090b',
      accentColor: '#3b82f6'
    },
    {
      id: 'dev_2',
      name: 'Cisco Catalyst 9300-24P PoE+ Switch',
      category: 'switch',
      uHeight: 1,
      uStart: 21,
      depthMm: 445,
      widthMm: 482.6,
      powerWatts: 240,
      btuHr: 819,
      weightKg: 7.2,
      color: '#1e293b',
      accentColor: '#0284c7'
    },
    {
      id: 'dev_3',
      name: 'Middle Atlantic 1U Slotted Vent Panel',
      category: 'blank',
      uHeight: 1,
      uStart: 20,
      depthMm: 25,
      widthMm: 482.6,
      powerWatts: 0,
      btuHr: 0,
      weightKg: 0.6,
      color: '#0f172a',
      accentColor: '#64748b'
    },
    {
      id: 'dev_4',
      name: 'Q-SYS Core 110f v2 DSP',
      category: 'dsp',
      uHeight: 1,
      uStart: 18,
      depthMm: 356,
      widthMm: 482.6,
      powerWatts: 65,
      btuHr: 222,
      weightKg: 4.8,
      color: '#18181b',
      accentColor: '#10b981'
    },
    {
      id: 'dev_5',
      name: 'Extron DTP CrossPoint 4K 108',
      category: 'matrix',
      uHeight: 3,
      uStart: 14,
      depthMm: 450,
      widthMm: 482.6,
      powerWatts: 120,
      btuHr: 409,
      weightKg: 8.5,
      color: '#1e293b',
      accentColor: '#0284c7'
    },
    {
      id: 'dev_6',
      name: 'Middle Atlantic 1U Slotted Vent Panel',
      category: 'blank',
      uHeight: 1,
      uStart: 12,
      depthMm: 25,
      widthMm: 482.6,
      powerWatts: 0,
      btuHr: 0,
      weightKg: 0.6,
      color: '#0f172a',
      accentColor: '#64748b'
    },
    {
      id: 'dev_7',
      name: 'Crown DriveCore DCi 4|600N',
      category: 'amp',
      uHeight: 2,
      uStart: 9,
      depthMm: 411,
      widthMm: 482.6,
      powerWatts: 480,
      btuHr: 1638,
      weightKg: 9.1,
      color: '#27272a',
      accentColor: '#f97316'
    },
    {
      id: 'dev_8',
      name: 'Middle Atlantic 1U Slotted Vent Panel',
      category: 'blank',
      uHeight: 1,
      uStart: 7,
      depthMm: 25,
      widthMm: 482.6,
      powerWatts: 0,
      btuHr: 0,
      weightKg: 0.6,
      color: '#0f172a',
      accentColor: '#64748b'
    },
    {
      id: 'dev_ups',
      name: 'APC Smart-UPS SRT 1500VA Online 2U',
      category: 'ups',
      uHeight: 2,
      uStart: 4,
      depthMm: 508,
      widthMm: 482.6,
      powerWatts: 45,
      btuHr: 154,
      weightKg: 20.5,
      color: '#18181b',
      accentColor: '#eab308'
    },
    {
      id: 'dev_9',
      name: '2U Lockable Rack Utility Drawer',
      category: 'drawer',
      uHeight: 2,
      uStart: 1, // Bottom U1-U2 for ballast and tools
      depthMm: 380,
      widthMm: 482.6,
      powerWatts: 0,
      btuHr: 0,
      weightKg: 6.2,
      color: '#18181b',
      accentColor: '#a1a1aa'
    }
  ];

  // Get Dynamic Thermal Tier and Color Mapping based on current Thermal Range Slider
  function getDeviceThermalTier(btu) {
    var crit = rackState.thermalThresholdCritical || 1200;
    var elevated = Math.round(crit * 0.55);
    var moderate = Math.round(crit * 0.25);
    if (btu >= crit) {
      return {
        tier: 'critical',
        color: '#ef4444',
        badgeClass: 'bg-danger text-white',
        label: 'Critical Hot Spot',
        rangeText: '≥ ' + crit + ' BTU/hr'
      };
    }
    if (btu >= elevated) {
      return {
        tier: 'elevated',
        color: '#f97316',
        badgeClass: 'bg-warning text-dark',
        label: 'Elevated Heat',
        rangeText: elevated + '–' + (crit - 1) + ' BTU/hr'
      };
    }
    if (btu >= moderate) {
      return {
        tier: 'moderate',
        color: '#38bdf8',
        badgeClass: 'bg-info text-dark',
        label: 'Moderate Heat',
        rangeText: moderate + '–' + (elevated - 1) + ' BTU/hr'
      };
    }
    return {
      tier: 'nominal',
      color: '#10b981',
      badgeClass: 'bg-success text-white',
      label: 'Nominal / Cool',
      rangeText: '< ' + moderate + ' BTU/hr'
    };
  }

  // Set Thermal Critical Threshold via Slider or Presets
  function setRackThermalThreshold(val) {
    var num = parseInt(val, 10);
    if (isNaN(num) || num < 400) num = 400;
    if (num > 3000) num = 3000;
    rackState.thermalThresholdCritical = num;
    updateThermalLegendDisplay();
    renderAllViews();
    renderDeviceListTable();
    updateThermalAnalytics();
  }

  // Set or toggle filter highlight for a specific thermal tier
  function setThermalFilterTier(tier) {
    if (rackState.thermalFilterTier === tier) {
      rackState.thermalFilterTier = null;
    } else {
      rackState.thermalFilterTier = tier;
    }
    updateThermalLegendDisplay();
    renderAllViews();
    renderDeviceListTable();
  }

  // Update Dynamic Legend Labels & Slider UI
  function updateThermalLegendDisplay() {
    var crit = rackState.thermalThresholdCritical || 1200;
    var elevated = Math.round(crit * 0.55);
    var moderate = Math.round(crit * 0.25);

    var elVal = document.getElementById('rackThermalSliderVal');
    var elInput = document.getElementById('rackThermalRangeSlider');
    if (elVal) elVal.textContent = crit.toLocaleString() + ' BTU/hr';
    if (elInput && parseInt(elInput.value, 10) !== crit) elInput.value = crit;

    var elNom = document.getElementById('legendThreshNominal');
    var elMod = document.getElementById('legendThreshModerate');
    var elEle = document.getElementById('legendThreshElevated');
    var elCrit = document.getElementById('legendThreshCritical');

    if (elNom) elNom.textContent = '< ' + moderate + ' BTU/hr';
    if (elMod) elMod.textContent = moderate + '–' + (elevated - 1) + ' BTU/hr';
    if (elEle) elEle.textContent = elevated + '–' + (crit - 1) + ' BTU/hr';
    if (elCrit) elCrit.textContent = '≥ ' + crit.toLocaleString() + ' BTU/hr';

    ['nominal', 'moderate', 'elevated', 'critical'].forEach(function(t) {
      var btn = document.getElementById('legendBtn_' + t);
      if (btn) {
        if (rackState.thermalFilterTier === t) {
          btn.style.boxShadow = '0 0 0 2.5px #38bdf8';
          btn.style.transform = 'scale(1.04)';
        } else {
          btn.style.boxShadow = 'none';
          btn.style.transform = 'scale(1)';
        }
      }
    });
  }

  // Initialize Rack Studio
  function initRackDesignStudio() {
    rackState.devices = JSON.parse(JSON.stringify(initialDeviceSeeds));
    populatePresetDropdown();
    populateGlobalRackSelect();
    updateThermalLegendDisplay();
    renderAllViews();
    updateThermalAnalytics();
    renderDeviceListTable();
    updateRackSizeRecommendationBadge();
    bindImageUploadEvents();
    setRackViewMode('all');
  }

  // Populate Global Rack Standard Dropdown
  function populateGlobalRackSelect() {
    var select = document.getElementById('rackGlobalStandardSelect');
    if (!select) return;
    select.innerHTML = '<option value="">-- Choose Standard Global Rack Model --</option>';

    var groups = {};
    GLOBAL_RACK_STANDARDS.forEach(function(item) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });

    Object.keys(groups).forEach(function(cat) {
      var optGroup = document.createElement('optgroup');
      optGroup.label = cat;
      groups[cat].forEach(function(item) {
        var opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = item.name + ' (' + item.totalU + 'U • ' + item.depthMm + 'mm) - ' + item.desc;
        optGroup.appendChild(opt);
      });
      select.appendChild(optGroup);
    });
  }

  // Handle Global Rack Standard Selection
  function onSelectGlobalRackStandard(rackId) {
    if (!rackId) return;
    var std = GLOBAL_RACK_STANDARDS.find(function(r) { return r.id === rackId; });
    if (!std) return;

    setRackTotalU(std.totalU);
    setRackDepth(std.depthMm);
    rackState.rackModelName = std.name;

    var toast = document.getElementById('rackNotificationToast');
    if (toast) {
      toast.className = 'alert alert-info font-mono py-2 px-3 small mb-3 shadow-xs';
      toast.innerHTML = '<i class="fa-solid fa-check-circle me-1.5 text-primary"></i>Applied standard rack format: <strong>' + escapeXml(std.name) + '</strong> (' + std.totalU + 'U, ' + std.depthMm + 'mm depth, ' + std.heightMm + 'mm height) for ' + escapeXml(std.category) + '.';
      toast.style.display = 'block';
      setTimeout(function() { toast.style.display = 'none'; }, 6000);
    }
  }

  // Auto-Set Rack Size to Fit Equipment + 20% Expansion & Thermal Buffer
  function autoSetRackSizeToFit() {
    var totalOccupiedU = rackState.devices.reduce(function(acc, d) { return acc + d.uHeight; }, 0);
    if (totalOccupiedU === 0) {
      alert('Please add equipment to the rack first to calculate the required standard rack size.');
      return;
    }

    var targetUWithHeadroom = Math.ceil(totalOccupiedU * 1.25);

    var matching = GLOBAL_RACK_STANDARDS.filter(function(r) {
      return r.totalU >= targetUWithHeadroom;
    }).sort(function(a, b) {
      return a.totalU - b.totalU;
    });

    var chosenRack = matching.length > 0 ? matching[0] : null;

    if (!chosenRack) {
      setRackTotalU(targetUWithHeadroom);
    } else {
      setRackTotalU(chosenRack.totalU);
      setRackDepth(chosenRack.depthMm);
      rackState.rackModelName = chosenRack.name;

      var sel = document.getElementById('rackGlobalStandardSelect');
      if (sel) sel.value = chosenRack.id;
    }

    updateRackSizeRecommendationBadge();

    var toast = document.getElementById('rackNotificationToast');
    if (toast) {
      var expansionU = rackState.totalU - totalOccupiedU;
      var expansionPct = Math.round((expansionU / rackState.totalU) * 100);
      toast.className = 'alert alert-success font-mono py-2 px-3 small mb-3 shadow-xs';
      toast.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles me-1.5 text-success"></i>Auto-Sized Rack to <strong>' + rackState.totalU + 'U</strong> (' + (rackState.totalU * EIA_1U_MM).toFixed(1) + ' mm)! Equipment uses ' + totalOccupiedU + 'U (' + (100 - expansionPct) + '%), leaving ' + expansionU + 'U (' + expansionPct + '%) for thermal convection and future growth.';
      toast.style.display = 'block';
      setTimeout(function() { toast.style.display = 'none'; }, 6500);
    }
  }

  // Update Rack Recommendation Badge
  function updateRackSizeRecommendationBadge() {
    var badge = document.getElementById('rackAutoRecommendationBadge');
    if (!badge) return;

    var totalOccupiedU = rackState.devices.reduce(function(acc, d) { return acc + d.uHeight; }, 0);
    var targetU = Math.ceil(totalOccupiedU * 1.25);

    var matching = GLOBAL_RACK_STANDARDS.filter(function(r) { return r.totalU >= targetU; }).sort(function(a, b) { return a.totalU - b.totalU; });
    var rec = matching.length > 0 ? matching[0] : null;

    if (rec) {
      badge.innerHTML = '<span class="badge bg-primary text-white me-1.5"><i class="fa-solid fa-lightbulb me-1"></i>RECOMMENDED RACK:</span>' +
        '<strong>' + rec.name + ' (' + rec.totalU + 'U)</strong> &bull; ' + totalOccupiedU + 'U Occupied + ' + (rec.totalU - totalOccupiedU) + 'U Buffer (' + Math.round(((rec.totalU - totalOccupiedU) / rec.totalU) * 100) + '%) &bull; ' + rec.desc;
    } else {
      badge.innerHTML = '<span class="badge bg-secondary text-white me-1.5"><i class="fa-solid fa-server me-1"></i>CUSTOM ENCLOSURE:</span>' + rackState.totalU + 'U Standard 19" Rack';
    }
  }

  // Helper for notification toast
  function showRackToast(message, type) {
    var toast = document.getElementById('rackNotificationToast');
    if (!toast) return;
    var alertClass = 'alert-info';
    var iconClass = 'fa-info-circle';
    if (type === 'success') { alertClass = 'alert-success'; iconClass = 'fa-check-circle text-success'; }
    else if (type === 'warning') { alertClass = 'alert-warning'; iconClass = 'fa-snowflake text-info'; }
    else if (type === 'danger') { alertClass = 'alert-danger'; iconClass = 'fa-triangle-exclamation text-danger'; }

    toast.className = 'alert ' + alertClass + ' font-mono py-2 px-3 small mb-3 shadow-xs';
    toast.innerHTML = '<i class="fa-solid ' + iconClass + ' me-1.5"></i>' + message;
    toast.style.display = 'block';
    setTimeout(function() { toast.style.display = 'none'; }, 6500);
  }

  // Auto-Insert 1U Thermal Spacers above High-Heat Devices (>400 BTU/hr)
  function autoInsertThermalSpacers() {
    var highHeatThresholdBtu = 400;
    var insertedCount = 0;

    // Filter active equipment exceeding 400 BTU/hr (excluding blank vent panels and roof exhaust fans)
    var hotDevices = rackState.devices.filter(function(d) {
      if (d.category === 'blank' || d.category === 'fan') return false;
      var btu = d.btuHr || Math.round(d.powerWatts * WATTS_TO_BTU_HR);
      return btu > highHeatThresholdBtu;
    });

    if (hotDevices.length === 0) {
      showRackToast('All installed devices currently operate below the high-heat threshold (400 BTU/hr). No urgent thermal spacers required!', 'info');
      return;
    }

    // Process from highest U downward so shifting upward does not affect lower unprocessed devices
    hotDevices.sort(function(a, b) { return b.uStart - a.uStart; });

    hotDevices.forEach(function(dev) {
      var targetSpacerU = dev.uStart + dev.uHeight;

      // Check if there is already a slotted vent panel directly at targetSpacerU
      var existingAbove = rackState.devices.find(function(d) {
        return d.uStart === targetSpacerU;
      });

      if (existingAbove && existingAbove.category === 'blank') {
        // A 1U or 2U vent panel is already protecting this device
        return;
      }

      // Shift all devices located at or above targetSpacerU up by 1U to open a 1U thermal slot
      rackState.devices.forEach(function(d) {
        if (d.uStart >= targetSpacerU && d.id !== dev.id) {
          d.uStart += 1;
        }
      });

      // Insert dedicated 1U slotted vent panel directly above this hot unit
      var spacerId = 'spacer_vent_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      rackState.devices.push({
        id: spacerId,
        name: 'Middle Atlantic 1U Slotted Vent Panel (Thermal Spacer)',
        category: 'blank',
        uHeight: 1,
        uStart: targetSpacerU,
        depthMm: 25,
        widthMm: EIA_WIDTH_MM,
        powerWatts: 0,
        btuHr: 0,
        weightKg: 0.6,
        color: '#0f172a',
        accentColor: '#38bdf8'
      });
      insertedCount++;
    });

    // Check if any device now exceeds the rack's total U height
    var maxOccupiedU = 0;
    rackState.devices.forEach(function(d) {
      var topU = d.uStart + d.uHeight - 1;
      if (topU > maxOccupiedU) maxOccupiedU = topU;
    });

    if (maxOccupiedU > rackState.totalU) {
      setRackTotalU(maxOccupiedU);
    }

    // Re-render all views and update tables
    renderAllViews();
    updateThermalAnalytics();
    renderDeviceListTable();
    updateRackSizeRecommendationBadge();

    if (insertedCount > 0) {
      showRackToast('<strong>Auto-Insert Thermal Spacers Complete!</strong> Automatically inserted <strong>' + insertedCount + ' &times; 1U Slotted Vent Panels</strong> directly above devices exceeding 400 BTU/hr to prevent thermal choking and facilitate laminar chimney convection.', 'warning');
    } else {
      showRackToast('All high-heat devices (>400 BTU/hr) already have 1U slotted vent panels directly above them.', 'info');
    }
  }

  // Set Total U Height
  function setRackTotalU(u) {
    u = parseInt(u, 10);
    if (isNaN(u) || u < 1) u = 1;
    if (u > 99) u = 99;
    rackState.totalU = u;

    var numInput = document.getElementById('rackTotalUInput');
    var sliderInput = document.getElementById('rackTotalUSlider');
    var displayVal = document.getElementById('rackUDisplayVal');

    if (numInput) numInput.value = u;
    if (sliderInput) sliderInput.value = Math.min(48, u);
    if (displayVal) {
      var heightMm = (u * EIA_1U_MM).toFixed(1);
      var heightIn = (u * EIA_1U_INCHES).toFixed(1);
      displayVal.textContent = u + 'U (' + heightMm + ' mm / ' + heightIn + '")';
    }

    renderAllViews();
    updateThermalAnalytics();
    renderDeviceListTable();
    updateRackSizeRecommendationBadge();
  }

  // Set Rack Usable Depth (mm)
  function setRackDepth(depthMm) {
    depthMm = parseInt(depthMm, 10);
    if (isNaN(depthMm) || depthMm < 300) depthMm = 300;
    if (depthMm > 1500) depthMm = 1500;
    rackState.rackDepthMm = depthMm;

    var depthInput = document.getElementById('rackDepthInput');
    if (depthInput) depthInput.value = depthMm;

    renderAllViews();
    updateThermalAnalytics();
  }

  // Set Visualization Mode ('all', '3d', 'front', 'side')
  function setRackViewMode(mode) {
    rackState.viewMode = mode;

    var buttons = document.querySelectorAll('.rack-view-mode-btn');
    buttons.forEach(function(btn) {
      if (btn.getAttribute('data-view') === mode) {
        btn.classList.add('active', 'btn-primary');
        btn.classList.remove('btn-outline-secondary');
      } else {
        btn.classList.remove('active', 'btn-primary');
        btn.classList.add('btn-outline-secondary');
      }
    });

    var frontWrap = document.getElementById('rackFrontViewWrapper');
    var sideWrap = document.getElementById('rackSideViewWrapper');
    var threeDWrap = document.getElementById('rack3DViewWrapper');

    if (frontWrap && sideWrap && threeDWrap) {
      if (mode === 'all') {
        threeDWrap.className = 'col-lg-4 col-md-12 col-12 mb-3';
        frontWrap.className = 'col-lg-4 col-md-12 col-12 mb-3';
        sideWrap.className = 'col-lg-4 col-md-12 col-12 mb-3';
        threeDWrap.style.display = 'block';
        frontWrap.style.display = 'block';
        sideWrap.style.display = 'block';
      } else if (mode === '3d') {
        threeDWrap.className = 'col-12 mb-3';
        threeDWrap.style.display = 'block';
        frontWrap.style.display = 'none';
        sideWrap.style.display = 'none';
      } else if (mode === 'front') {
        frontWrap.className = 'col-12 mb-3';
        threeDWrap.style.display = 'none';
        frontWrap.style.display = 'block';
        sideWrap.style.display = 'none';
      } else if (mode === 'side') {
        sideWrap.className = 'col-12 mb-3';
        threeDWrap.style.display = 'none';
        frontWrap.style.display = 'none';
        sideWrap.style.display = 'block';
      }
    }

    renderAllViews();
  }

  // Set Screw Options
  function setScrewOptions(type, color, show) {
    if (type) rackState.screwType = type;
    if (color) rackState.screwColor = color;
    if (typeof show === 'boolean') rackState.showScrews = show;
    renderAllViews();
  }

  // Custom Image Upload & URL handlers
  var pendingCustomImageDataUrl = '';

  function handleCustomImageUpload(inputEl) {
    var file = inputEl && inputEl.files && inputEl.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(evt) {
      pendingCustomImageDataUrl = evt.target.result;
      updateCustomImagePreview(pendingCustomImageDataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleCustomImageUrl(url) {
    url = (url || '').trim();
    if (url.length > 5) {
      pendingCustomImageDataUrl = url;
      updateCustomImagePreview(url);
    }
  }

  function clearCustomImageSelection() {
    pendingCustomImageDataUrl = '';
    var fileInput = document.getElementById('devCustomImageFile');
    var urlInput = document.getElementById('devCustomImageUrl');
    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
    updateCustomImagePreview('');
  }

  function updateCustomImagePreview(url) {
    var previewContainer = document.getElementById('devCustomImagePreviewBox');
    var previewImg = document.getElementById('devImagePreviewThumb');
    if (!previewContainer || !previewImg) return;
    if (url) {
      previewImg.src = url;
      previewContainer.style.display = 'flex';
    } else {
      previewImg.src = '';
      previewContainer.style.display = 'none';
    }
  }

  function bindImageUploadEvents() {
    var fileInput = document.getElementById('devCustomImageFile');
    if (fileInput) {
      fileInput.addEventListener('change', function() { handleCustomImageUpload(fileInput); });
    }
    var urlInput = document.getElementById('devCustomImageUrl');
    if (urlInput) {
      urlInput.addEventListener('input', function(e) { handleCustomImageUrl(e.target.value); });
    }
  }

  // Add Device
  function addDeviceToRack(deviceData) {
    var uHeight = parseInt(deviceData.uHeight, 10) || 1;
    var depthMm = parseInt(deviceData.depthMm, 10) || 350;
    var powerWatts = parseFloat(deviceData.powerWatts) || 0;
    var btuHr = parseFloat(deviceData.btuHr) || Math.round(powerWatts * WATTS_TO_BTU_HR);
    var weightKg = parseFloat(deviceData.weightKg) || 3.0;
    var widthMm = parseFloat(deviceData.widthMm) || EIA_WIDTH_MM;

    var uStart = parseInt(deviceData.uStart, 10);
    if (!uStart || uStart < 1 || uStart + uHeight - 1 > rackState.totalU) {
      uStart = findFirstFreeSlot(uHeight);
      if (!uStart) {
        var neededU = rackState.totalU + uHeight;
        if (confirm('Rack is full! Would you like to automatically expand the rack to ' + neededU + 'U to fit this equipment?')) {
          setRackTotalU(neededU);
          uStart = findFirstFreeSlot(uHeight) || (rackState.totalU - uHeight + 1);
        } else {
          return null;
        }
      }
    }

    var customImg = deviceData.customImageUrl || pendingCustomImageDataUrl || (document.getElementById('devCustomImageUrl')?.value || '').trim();

    var newDevice = {
      id: 'dev_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: deviceData.name || 'New AV Equipment',
      category: deviceData.category || 'custom',
      uHeight: uHeight,
      uStart: uStart,
      depthMm: depthMm,
      widthMm: widthMm,
      powerWatts: powerWatts,
      btuHr: btuHr,
      weightKg: weightKg,
      color: deviceData.color || '#1e293b',
      accentColor: deviceData.accentColor || '#38bdf8',
      customImageUrl: customImg
    };

    rackState.devices.push(newDevice);
    renderAllViews();
    updateThermalAnalytics();
    renderDeviceListTable();
    updateRackSizeRecommendationBadge();

    // Reset pending image input
    clearCustomImageSelection();

    return newDevice;
  }

  // Find first free U slot from top down
  function findFirstFreeSlot(uHeight) {
    var occupied = {};
    rackState.devices.forEach(function(d) {
      for (var u = d.uStart; u < d.uStart + d.uHeight; u++) {
        occupied[u] = true;
      }
    });

    for (var startU = rackState.totalU - uHeight + 1; startU >= 1; startU--) {
      var fits = true;
      for (var checkU = startU; checkU < startU + uHeight; checkU++) {
        if (occupied[checkU]) {
          fits = false;
          break;
        }
      }
      if (fits) return startU;
    }
    return null;
  }

  // Remove Device
  function removeDevice(id) {
    rackState.devices = rackState.devices.filter(function(d) { return d.id !== id; });
    if (rackState.activeDeviceId === id) rackState.activeDeviceId = null;
    renderAllViews();
    updateThermalAnalytics();
    renderDeviceListTable();
    updateRackSizeRecommendationBadge();
  }

  // Move Device Up (higher U number)
  function moveDeviceUp(id) {
    var dev = rackState.devices.find(function(d) { return d.id === id; });
    if (!dev) return;
    if (dev.uStart + dev.uHeight <= rackState.totalU) {
      dev.uStart = dev.uStart + 1;
      renderAllViews();
      updateThermalAnalytics();
      renderDeviceListTable();
    }
  }

  // Move Device Down (lower U number)
  function moveDeviceDown(id) {
    var dev = rackState.devices.find(function(d) { return d.id === id; });
    if (!dev) return;
    if (dev.uStart > 1) {
      dev.uStart = dev.uStart - 1;
      renderAllViews();
      updateThermalAnalytics();
      renderDeviceListTable();
    }
  }

  // Set Device Exact U Position
  function setDeviceUPosition(id, newStartU) {
    newStartU = parseInt(newStartU, 10);
    var dev = rackState.devices.find(function(d) { return d.id === id; });
    if (!dev || isNaN(newStartU)) return;
    if (newStartU < 1) newStartU = 1;
    if (newStartU + dev.uHeight - 1 > rackState.totalU) {
      newStartU = Math.max(1, rackState.totalU - dev.uHeight + 1);
    }
    dev.uStart = newStartU;
    renderAllViews();
    updateThermalAnalytics();
    renderDeviceListTable();
  }

  /**
   * DEDICATED AUTO-SORT BTU FUNCTION (Key User Requirement):
   * Sorts all added rack devices by BTU/hr rating from lowest to highest.
   * Places lower-BTU units at the base (1U) and higher-BTU units at the top
   * for optimal thermal chimney convection, and re-renders all SVGs immediately.
   */
  function autoSortBTU() {
    if (!rackState.devices || rackState.devices.length === 0) return;

    // Separate special anchor devices (2U Drawer for ballast at U1, roof exhaust fans at the very top)
    var drawers = rackState.devices.filter(function(d) { return d.category === 'drawer'; });
    var fans = rackState.devices.filter(function(d) { return d.category === 'fan'; });
    var standardDevices = rackState.devices.filter(function(d) { return d.category !== 'drawer' && d.category !== 'fan'; });

    // Sort standard devices strictly ascending by BTU/hr: lowest BTU first, highest BTU last
    standardDevices.sort(function(a, b) {
      var btuA = (a.btuHr !== undefined) ? a.btuHr : (a.powerWatts * WATTS_TO_BTU_HR);
      var btuB = (b.btuHr !== undefined) ? b.btuHr : (b.powerWatts * WATTS_TO_BTU_HR);
      return btuA - btuB;
    });

    var currentU = 1;

    // 1. Drawers at U1 (base floor) for anti-tip ballast and accessory storage
    drawers.forEach(function(d) {
      d.uStart = currentU;
      currentU += d.uHeight;
    });

    // 2. Ascending BTU/hr devices from lowest to highest
    standardDevices.forEach(function(d) {
      d.uStart = currentU;
      currentU += d.uHeight;
    });

    // 3. Top exhaust cooling fans at top of the chimney stack
    fans.forEach(function(d) {
      d.uStart = currentU;
      currentU += d.uHeight;
    });

    // Automatically expand rack if total required U exceeds current rack height
    if (currentU - 1 > rackState.totalU) {
      rackState.totalU = currentU - 1;
      var numInput = document.getElementById('rackTotalUInput');
      if (numInput) numInput.value = rackState.totalU;
    }

    renderAllViews();
    updateThermalAnalytics();
    renderDeviceListTable();
    updateRackSizeRecommendationBadge();

    var toast = document.getElementById('rackNotificationToast');
    if (toast) {
      toast.className = 'alert alert-success font-mono py-2 px-3 small mb-3 shadow-xs';
      toast.innerHTML = '<i class="fa-solid fa-arrow-down-short-wide me-1.5 text-warning"></i><strong>Auto-Sort BTU Complete!</strong> All equipment sorted from lowest BTU/hr at base (1U) ascending to highest BTU/hr and chimney exhaust fans at the top.';
      toast.style.display = 'block';
      setTimeout(function() { toast.style.display = 'none'; }, 6000);
    }
  }

  // Alias
  var autoSortDevicesByThermalBTU = autoSortBTU;

  // Populate Presets in Dropdown
  function populatePresetDropdown() {
    var select = document.getElementById('rackPresetSelect');
    if (!select) return;
    select.innerHTML = '<option value="">-- Choose AV Equipment Preset --</option>';
    EQUIPMENT_PRESETS.forEach(function(preset, idx) {
      var btu = Math.round(preset.powerWatts * WATTS_TO_BTU_HR);
      select.innerHTML += '<option value="' + idx + '">' + preset.name + ' (' + preset.uHeight + 'U • ' + preset.powerWatts + 'W • ' + btu + ' BTU/hr)</option>';
    });
  }

  // Load Preset into Add Form
  function loadPresetIntoForm(idx) {
    if (idx === '' || idx === null) return;
    var preset = EQUIPMENT_PRESETS[parseInt(idx, 10)];
    if (!preset) return;

    var nameInput = document.getElementById('devNameInput');
    var catInput = document.getElementById('devCategoryInput');
    var uInput = document.getElementById('devUHeightInput');
    var depthInput = document.getElementById('devDepthInput');
    var widthInput = document.getElementById('devWidthInput');
    var wattsInput = document.getElementById('devPowerWattsInput');
    var btuInput = document.getElementById('devBtuHrInput');
    var weightInput = document.getElementById('devWeightInput');

    if (nameInput) nameInput.value = preset.name;
    if (catInput) catInput.value = preset.category;
    if (uInput) {
      uInput.value = preset.uHeight;
      updateUHeightLabel(preset.uHeight);
    }
    if (depthInput) {
      depthInput.value = preset.depthMm;
      updateDepthLabel(preset.depthMm);
    }
    if (widthInput) widthInput.value = preset.widthMm;
    if (wattsInput) wattsInput.value = preset.powerWatts;
    if (btuInput) btuInput.value = Math.round(preset.powerWatts * WATTS_TO_BTU_HR);
    if (weightInput) weightInput.value = preset.weightKg;
  }

  function updateUHeightLabel(val) {
    var u = parseInt(val, 10) || 1;
    var label = document.getElementById('devUHeightMmLabel');
    if (label) {
      label.textContent = (u * EIA_1U_MM).toFixed(1) + ' mm (' + (u * EIA_1U_INCHES).toFixed(2) + '")';
    }
  }

  function updateDepthLabel(val) {
    var mm = parseInt(val, 10) || 350;
    var label = document.getElementById('devDepthInchesLabel');
    if (label) {
      label.textContent = (mm / 25.4).toFixed(1) + ' in';
    }
  }

  // On Watts input change, auto calculate BTU/hr
  function onPowerWattsChanged(wattsVal) {
    var watts = parseFloat(wattsVal) || 0;
    var btu = Math.round(watts * WATTS_TO_BTU_HR);
    var btuInput = document.getElementById('devBtuHrInput');
    if (btuInput) btuInput.value = btu;
  }

  // On BTU/hr input change, auto calculate Watts
  function onBtuHrChanged(btuVal) {
    var btu = parseFloat(btuVal) || 0;
    var watts = Math.round(btu / WATTS_TO_BTU_HR);
    var wattsInput = document.getElementById('devPowerWattsInput');
    if (wattsInput) wattsInput.value = watts;
  }

  // Handle Form Submit to Add Device
  function handleAddDeviceForm(e) {
    if (e) e.preventDefault();
    var name = (document.getElementById('devNameInput')?.value || '').trim() || 'Custom AV Unit';
    var cat = document.getElementById('devCategoryInput')?.value || 'custom';
    var uHeight = parseInt(document.getElementById('devUHeightInput')?.value, 10) || 1;
    var depthMm = parseInt(document.getElementById('devDepthInput')?.value, 10) || 350;
    var widthMm = parseFloat(document.getElementById('devWidthInput')?.value) || EIA_WIDTH_MM;
    var powerWatts = parseFloat(document.getElementById('devPowerWattsInput')?.value) || 0;
    var btuHr = parseFloat(document.getElementById('devBtuHrInput')?.value) || Math.round(powerWatts * WATTS_TO_BTU_HR);
    var weightKg = parseFloat(document.getElementById('devWeightInput')?.value) || 3.0;
    var uStart = parseInt(document.getElementById('devUStartInput')?.value, 10) || 0;
    var customImg = pendingCustomImageDataUrl || (document.getElementById('devCustomImageUrl')?.value || '').trim();

    var color = '#1e293b';
    var accent = '#38bdf8';
    if (cat === 'amp') { color = '#27272a'; accent = '#f97316'; }
    else if (cat === 'dsp') { color = '#18181b'; accent = '#10b981'; }
    else if (cat === 'switch') { color = '#1e1b4b'; accent = '#818cf8'; }
    else if (cat === 'matrix') { color = '#1e293b'; accent = '#0284c7'; }
    else if (cat === 'pdu') { color = '#09090b'; accent = '#3b82f6'; }
    else if (cat === 'fan') { color = '#090d16'; accent = '#0ea5e9'; }
    else if (cat === 'ups') { color = '#18181b'; accent = '#eab308'; }
    else if (cat === 'blank') { color = '#0f172a'; accent = '#64748b'; }
    else if (cat === 'drawer') { color = '#18181b'; accent = '#a1a1aa'; }

    addDeviceToRack({
      name: name,
      category: cat,
      uHeight: uHeight,
      depthMm: depthMm,
      widthMm: widthMm,
      powerWatts: powerWatts,
      btuHr: btuHr,
      weightKg: weightKg,
      uStart: uStart,
      color: color,
      accentColor: accent,
      customImageUrl: customImg
    });

    var presetSelect = document.getElementById('rackPresetSelect');
    if (presetSelect) presetSelect.value = '';
  }

  // ==========================================
  // SVG RENDERING ENGINES
  // ==========================================

  // 1. EXACT FRONT ELEVATION SVG (EIA-310-D)
  function renderFrontRackSVG() {
    var totalU = rackState.totalU;
    var uHeightPx = 32;
    var rackWidthPx = 420;
    var railWidthPx = 28;
    var usableWidthPx = rackWidthPx - (railWidthPx * 2);
    var totalRackHeightPx = totalU * uHeightPx;
    var topMargin = 50;
    var bottomMargin = 55;
    var svgHeight = totalRackHeightPx + topMargin + bottomMargin;
    var svgWidth = rackWidthPx + 120;

    var svg = [];
    svg.push('<svg viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '" width="100%" height="490" preserveAspectRatio="xMidYMid meet" style="background:#090d16; border-radius:12px; font-family:\'Courier New\', Courier, monospace;" id="svgFrontElevation">');

    // Defs & Gradients
    svg.push('<defs>');
    svg.push('  <linearGradient id="frontCabinetPostGrad" x1="0%" y1="0%" x2="100%" y2="0%">');
    svg.push('    <stop offset="0%" stop-color="#334155"/><stop offset="50%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/>');
    svg.push('  </linearGradient>');
    svg.push('  <linearGradient id="frontRailGrad" x1="0%" y1="0%" x2="100%" y2="0%">');
    svg.push('    <stop offset="0%" stop-color="#475569"/><stop offset="35%" stop-color="#64748b"/><stop offset="100%" stop-color="#334155"/>');
    svg.push('  </linearGradient>');
    svg.push('  <linearGradient id="screwMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">');
    if (rackState.screwColor === 'silver') {
      svg.push('    <stop offset="0%" stop-color="#f8fafc"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#475569"/>');
    } else {
      svg.push('    <stop offset="0%" stop-color="#334155"/><stop offset="50%" stop-color="#0f172a"/><stop offset="100%" stop-color="#000000"/>');
    }
    svg.push('  </linearGradient>');
    svg.push('</defs>');

    var startX = 65;
    var startY = topMargin;

    // Outer Frame Canopy
    svg.push('<!-- Outer Frame Canopy -->');
    svg.push('<rect x="' + (startX - 15) + '" y="' + (startY - 30) + '" width="' + (rackWidthPx + 30) + '" height="30" rx="4" fill="url(#frontCabinetPostGrad)" stroke="#475569" stroke-width="1.5"/>');
    svg.push('<text x="' + (startX + rackWidthPx / 2) + '" y="' + (startY - 12) + '" fill="#94a3b8" font-size="10" font-weight="bold" text-anchor="middle" letter-spacing="1">EIA-310-D 19-INCH RACK (' + totalU + 'U)</text>');

    // Top Ventilation Grilles
    for (var g = 0; g < 6; g++) {
      svg.push('<rect x="' + (startX + 40 + g * 55) + '" y="' + (startY - 24) + '" width="35" height="4" rx="2" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>');
    }

    // Main Interior Bay
    svg.push('<rect x="' + startX + '" y="' + startY + '" width="' + rackWidthPx + '" height="' + totalRackHeightPx + '" fill="#050811" stroke="#334155" stroke-width="1.5"/>');

    // Left and Right EIA Rails
    svg.push('<rect x="' + startX + '" y="' + startY + '" width="' + railWidthPx + '" height="' + totalRackHeightPx + '" fill="url(#frontRailGrad)" stroke="#1e293b" stroke-width="1"/>');
    svg.push('<rect x="' + (startX + rackWidthPx - railWidthPx) + '" y="' + startY + '" width="' + railWidthPx + '" height="' + totalRackHeightPx + '" fill="url(#frontRailGrad)" stroke="#1e293b" stroke-width="1"/>');

    // U Markers, Lines, and 3-Hole Pattern
    for (var u = 1; u <= totalU; u++) {
      var uIndexFromTop = totalU - u;
      var curY = startY + (uIndexFromTop * uHeightPx);

      svg.push('<line x1="' + startX + '" y1="' + curY + '" x2="' + (startX + rackWidthPx) + '" y2="' + curY + '" stroke="#1e293b" stroke-width="0.8" stroke-dasharray="2,2" opacity="0.6"/>');
      svg.push('<text x="' + (startX - 14) + '" y="' + (curY + uHeightPx * 0.68) + '" fill="#64748b" font-size="10" font-weight="bold" text-anchor="end">' + u + 'U</text>');
      svg.push('<text x="' + (startX + rackWidthPx + 14) + '" y="' + (curY + uHeightPx * 0.68) + '" fill="#64748b" font-size="10" font-weight="bold" text-anchor="start">' + u + 'U</text>');

      var holeY1 = curY + (uHeightPx * 0.22);
      var holeY2 = curY + (uHeightPx * 0.50);
      var holeY3 = curY + (uHeightPx * 0.78);

      var leftHoleX = startX + (railWidthPx / 2);
      var rightHoleX = startX + rackWidthPx - (railWidthPx / 2);

      [holeY1, holeY2, holeY3].forEach(function(hy) {
        if (rackState.screwType === 'm6') {
          svg.push('<rect x="' + (leftHoleX - 3.2) + '" y="' + (hy - 3.2) + '" width="6.4" height="6.4" rx="1" fill="#090d16" stroke="#1e293b" stroke-width="0.8"/>');
          svg.push('<rect x="' + (rightHoleX - 3.2) + '" y="' + (hy - 3.2) + '" width="6.4" height="6.4" rx="1" fill="#090d16" stroke="#1e293b" stroke-width="0.8"/>');
        } else {
          svg.push('<circle cx="' + leftHoleX + '" cy="' + hy + '" r="2.8" fill="#090d16" stroke="#1e293b" stroke-width="0.8"/>');
          svg.push('<circle cx="' + rightHoleX + '" cy="' + hy + '" r="2.8" fill="#090d16" stroke="#1e293b" stroke-width="0.8"/>');
        }
      });
    }

    // Render Placed Devices
    rackState.devices.forEach(function(dev) {
      if (dev.uStart < 1 || dev.uStart > totalU) return;
      var topUOfDevice = dev.uStart + dev.uHeight - 1;
      var uIndexFromTop = totalU - topUOfDevice;
      var devY = startY + (uIndexFromTop * uHeightPx);
      var devHeightPx = dev.uHeight * uHeightPx;
      var isSelected = (rackState.activeDeviceId === dev.id);

      var btu = dev.btuHr || Math.round(dev.powerWatts * WATTS_TO_BTU_HR);
      var thermalTier = getDeviceThermalTier(btu);
      var isTierFiltered = (rackState.thermalFilterTier && rackState.thermalFilterTier === thermalTier.tier);
      var isTierDimmed = (rackState.thermalFilterTier && rackState.thermalFilterTier !== thermalTier.tier);

      svg.push('<!-- Device: ' + escapeXml(dev.name) + ' (' + dev.uHeight + 'U) -->');
      svg.push('<g class="rack-device-group" data-id="' + dev.id + '" style="cursor:pointer;' + (isTierDimmed ? ' opacity:0.28;' : '') + '" onclick="selectRackDevice(\'' + dev.id + '\')">');

      // Chassis Body Background
      var strokeColor = isSelected ? '#38bdf8' : (isTierFiltered ? '#ffffff' : (dev.accentColor || '#475569'));
      var strokeWidth = isSelected ? '2.8' : (isTierFiltered ? '2.5' : '1.2');
      svg.push('<rect x="' + startX + '" y="' + devY + '" width="' + rackWidthPx + '" height="' + devHeightPx + '" rx="2" fill="' + (dev.color || '#141a24') + '" stroke="' + strokeColor + '" stroke-width="' + strokeWidth + '"/>');

      var innerX = startX + railWidthPx + 2;
      var innerW = usableWidthPx - 4;
      var innerY = devY + 2;
      var innerH = devHeightPx - 4;

      // Custom Image or Category-Specific Graphic
      if (dev.customImageUrl) {
        svg.push('<image href="' + dev.customImageUrl + '" x="' + innerX + '" y="' + innerY + '" width="' + innerW + '" height="' + innerH + '" preserveAspectRatio="none"/>');
        svg.push('<rect x="' + innerX + '" y="' + innerY + '" width="' + innerW + '" height="' + innerH + '" fill="none" stroke="' + (isTierFiltered ? thermalTier.color : '#38bdf8') + '" stroke-width="' + (isTierFiltered ? '2' : '1') + '" opacity="0.8"/>');
      } else {
        renderFaceplateGraphic(svg, dev, innerX, innerY, innerW, innerH);
      }

      // Small thermal dot indicator on right flange
      svg.push('<circle cx="' + (startX + rackWidthPx - railWidthPx / 2) + '" cy="' + (devY + devHeightPx / 2) + '" r="2.8" fill="' + thermalTier.color + '" stroke="#000" stroke-width="0.6"/>');

      // Rack Ears (Flanges on Left and Right)
      svg.push('<rect x="' + startX + '" y="' + devY + '" width="' + railWidthPx + '" height="' + devHeightPx + '" fill="#1e293b" stroke="#334155" stroke-width="0.8" opacity="0.85"/>');
      svg.push('<rect x="' + (startX + rackWidthPx - railWidthPx) + '" y="' + devY + '" width="' + railWidthPx + '" height="' + devHeightPx + '" fill="#1e293b" stroke="#334155" stroke-width="0.8" opacity="0.85"/>');

      // Screws on Rack Ears
      if (rackState.showScrews) {
        for (var subU = 0; subU < dev.uHeight; subU++) {
          var subUY = devY + (subU * uHeightPx);
          var sY1 = subUY + (uHeightPx * 0.22);
          var sY2 = subUY + (uHeightPx * 0.78);
          var leftX = startX + (railWidthPx / 2);
          var rightX = startX + rackWidthPx - (railWidthPx / 2);

          [sY1, sY2].forEach(function(sy) {
            svg.push('<circle cx="' + leftX + '" cy="' + sy + '" r="3.8" fill="url(#screwMetalGrad)" stroke="#1e293b" stroke-width="0.8"/>');
            svg.push('<line x1="' + (leftX - 2) + '" y1="' + sy + '" x2="' + (leftX + 2) + '" y2="' + sy + '" stroke="#64748b" stroke-width="0.8"/>');
            svg.push('<line x1="' + leftX + '" y1="' + (sy - 2) + '" x2="' + leftX + '" y2="' + (sy + 2) + '" stroke="#64748b" stroke-width="0.8"/>');

            svg.push('<circle cx="' + rightX + '" cy="' + sy + '" r="3.8" fill="url(#screwMetalGrad)" stroke="#1e293b" stroke-width="0.8"/>');
            svg.push('<line x1="' + (rightX - 2) + '" y1="' + sy + '" x2="' + (rightX + 2) + '" y2="' + sy + '" stroke="#64748b" stroke-width="0.8"/>');
            svg.push('<line x1="' + rightX + '" y1="' + (sy - 2) + '" x2="' + rightX + '" y2="' + (sy + 2) + '" stroke="#64748b" stroke-width="0.8"/>');
          });
        }
      }

      svg.push('<title>' + escapeXml(dev.name) + ' (' + dev.uHeight + 'U)&#10;Slot: U' + dev.uStart + ' - U' + topUOfDevice + '&#10;Power: ' + dev.powerWatts + 'W | Heat: ' + (dev.btuHr || Math.round(dev.powerWatts * WATTS_TO_BTU_HR)) + ' BTU/hr&#10;Depth: ' + dev.depthMm + 'mm | Weight: ' + dev.weightKg + 'kg</title>');
      svg.push('</g>');
    });

    // Bottom Base Plinth & Casters
    var plinthY = startY + totalRackHeightPx;
    svg.push('<!-- Bottom Plinth -->');
    svg.push('<rect x="' + (startX - 15) + '" y="' + plinthY + '" width="' + (rackWidthPx + 30) + '" height="20" rx="2" fill="url(#frontCabinetPostGrad)" stroke="#475569" stroke-width="1.5"/>');
    svg.push('<circle cx="' + (startX + 21) + '" cy="' + (plinthY + 30) + '" r="8" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>');
    svg.push('<circle cx="' + (startX + rackWidthPx - 21) + '" cy="' + (plinthY + 30) + '" r="8" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>');

    // Dimension Callouts
    var dimY = startY + totalRackHeightPx + 44;
    svg.push('<line x1="' + startX + '" y1="' + dimY + '" x2="' + (startX + rackWidthPx) + '" y2="' + dimY + '" stroke="#38bdf8" stroke-width="1.2"/>');
    svg.push('<text x="' + (startX + rackWidthPx / 2) + '" y="' + (dimY - 4) + '" fill="#38bdf8" font-size="9.5" font-weight="bold" text-anchor="middle">19.00" (482.6 mm) EIA FRONT</text>');

    svg.push('</svg>');
    return svg.join('\n');
  }

  // Faceplate Graphics for each Category
  function renderFaceplateGraphic(svg, dev, x, y, w, h) {
    var cat = dev.category;
    var name = dev.name;
    var btu = dev.btuHr || Math.round(dev.powerWatts * WATTS_TO_BTU_HR);

    svg.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="#0b0f19" stroke="#1f293d" stroke-width="0.8"/>');

    if (cat === 'fan') {
      svg.push('<rect x="' + (x + 8) + '" y="' + (y + h * 0.18) + '" width="80" height="' + (h * 0.64) + '" rx="2" fill="#020617" stroke="#0ea5e9" stroke-width="0.8"/>');
      svg.push('<text x="' + (x + 48) + '" y="' + (y + h * 0.52) + '" fill="#38bdf8" font-size="8.5" font-weight="bold" text-anchor="middle">76°F AUTO</text>');
      svg.push('<text x="' + (x + 48) + '" y="' + (y + h * 0.74) + '" fill="#0ea5e9" font-size="6.5" text-anchor="middle">24.4°C • 180CFM</text>');
      var fan1X = x + 110;
      var fan2X = x + 190;
      var fan3X = x + 270;
      [fan1X, fan2X, fan3X].forEach(function(fx) {
        if (fx + 40 < x + w - 10) {
          svg.push('<circle cx="' + (fx + 20) + '" cy="' + (y + h / 2) + '" r="' + Math.min(14, h * 0.38) + '" fill="#090d16" stroke="#334155" stroke-width="1"/>');
          svg.push('<circle cx="' + (fx + 20) + '" cy="' + (y + h / 2) + '" r="4" fill="#0284c7"/>');
          svg.push('<line x1="' + (fx + 10) + '" y1="' + (y + h / 2) + '" x2="' + (fx + 30) + '" y2="' + (y + h / 2) + '" stroke="#64748b" stroke-width="1.2"/>');
          svg.push('<line x1="' + (fx + 20) + '" y1="' + (y + h / 2 - 10) + '" x2="' + (fx + 20) + '" y2="' + (y + h / 2 + 10) + '" stroke="#64748b" stroke-width="1.2"/>');
        }
      });
      svg.push('<text x="' + (x + w - 10) + '" y="' + (y + h * 0.6) + '" fill="#38bdf8" font-size="8" font-weight="bold" text-anchor="end">SMART COOLING</text>');
    }
    else if (cat === 'ups') {
      svg.push('<rect x="' + (x + 10) + '" y="' + (y + 6) + '" width="75" height="' + (h - 12) + '" rx="2" fill="#050811" stroke="#eab308" stroke-width="1"/>');
      svg.push('<text x="' + (x + 16) + '" y="' + (y + 16) + '" fill="#eab308" font-size="7.5" font-weight="bold">ONLINE UPS</text>');
      svg.push('<text x="' + (x + 16) + '" y="' + (y + 26) + '" fill="#22c55e" font-size="7">LINE: 120.2V</text>');
      svg.push('<text x="' + (x + 16) + '" y="' + (y + 36) + '" fill="#38bdf8" font-size="7">BATT: 100%</text>');
      svg.push('<rect x="' + (x + 95) + '" y="' + (y + 10) + '" width="40" height="12" rx="2" fill="#000" stroke="#475569" stroke-width="0.8"/>');
      svg.push('<rect x="' + (x + 97) + '" y="' + (y + 12) + '" width="36" height="8" rx="1" fill="#22c55e"/>');
      svg.push('<text x="' + (x + 150) + '" y="' + (y + 20) + '" fill="#f8fafc" font-size="9" font-weight="bold">' + escapeXml(name.slice(0, 22)) + '</text>');
      svg.push('<circle cx="' + (x + w - 30) + '" cy="' + (y + h / 2) + '" r="8" fill="#1e293b" stroke="#eab308" stroke-width="1.2"/>');
      svg.push('<line x1="' + (x + w - 30) + '" y1="' + (y + h / 2 - 5) + '" x2="' + (x + w - 30) + '" y2="' + (y + h / 2 + 1) + '" stroke="#fff" stroke-width="1.5"/>');
    }
    else if (cat === 'pdu') {
      svg.push('<rect x="' + (x + 8) + '" y="' + (y + h * 0.2) + '" width="50" height="' + (h * 0.6) + '" rx="2" fill="#000" stroke="#0284c7" stroke-width="0.8"/>');
      svg.push('<text x="' + (x + 33) + '" y="' + (y + h * 0.62) + '" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">120.4V</text>');
      svg.push('<rect x="' + (x + 62) + '" y="' + (y + h * 0.2) + '" width="44" height="' + (h * 0.6) + '" rx="2" fill="#000" stroke="#0284c7" stroke-width="0.8"/>');
      svg.push('<text x="' + (x + 84) + '" y="' + (y + h * 0.62) + '" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">8.6A</text>');
      svg.push('<text x="' + (x + 115) + '" y="' + (y + h * 0.58) + '" fill="#e2e8f0" font-size="9.5" font-weight="bold">' + escapeXml(name.slice(0, 24)) + '</text>');
      svg.push('<rect x="' + (x + w - 30) + '" y="' + (y + h * 0.18) + '" width="16" height="' + (h * 0.64) + '" rx="2" fill="#dc2626" stroke="#ef4444" stroke-width="1"/>');
      svg.push('<circle cx="' + (x + w - 22) + '" cy="' + (y + h * 0.38) + '" r="2" fill="#fff"/>');
    }
    else if (cat === 'switch') {
      svg.push('<text x="' + (x + 10) + '" y="' + (y + h * 0.42) + '" fill="#818cf8" font-size="8.5" font-weight="bold">' + escapeXml(name.slice(0, 22)) + '</text>');
      svg.push('<text x="' + (x + 10) + '" y="' + (y + h * 0.78) + '" fill="#94a3b8" font-size="7">PoE+ (' + dev.powerWatts + 'W)</text>');
      var portStartX = x + 120;
      for (var p = 0; p < 12; p++) {
        var px = portStartX + (p * 13);
        svg.push('<rect x="' + px + '" y="' + (y + h * 0.28) + '" width="10" height="' + (h * 0.48) + '" rx="1" fill="#000" stroke="#4338ca" stroke-width="0.6"/>');
        svg.push('<circle cx="' + (px + 3) + '" cy="' + (y + h * 0.20) + '" r="1.2" fill="#22c55e"/>');
        svg.push('<circle cx="' + (px + 7) + '" cy="' + (y + h * 0.20) + '" r="1.2" fill="#f59e0b"/>');
      }
      svg.push('<rect x="' + (x + w - 38) + '" y="' + (y + h * 0.25) + '" width="30" height="' + (h * 0.52) + '" rx="1" fill="#1e293b" stroke="#38bdf8" stroke-width="0.8"/>');
      svg.push('<text x="' + (x + w - 23) + '" y="' + (y + h * 0.6) + '" fill="#38bdf8" font-size="6.5" text-anchor="middle">SFP+</text>');
    }
    else if (cat === 'matrix') {
      svg.push('<rect x="' + (x + 8) + '" y="' + (y + 5) + '" width="100" height="' + (h - 10) + '" rx="2" fill="#000" stroke="#0284c7" stroke-width="0.8"/>');
      svg.push('<text x="' + (x + 14) + '" y="' + (y + 15) + '" fill="#38bdf8" font-size="7.5" font-weight="bold">EXTRON 4K MATRIX</text>');
      svg.push('<text x="' + (x + 14) + '" y="' + (y + 25) + '" fill="#94a3b8" font-size="6.5">IN 1-8 ➔ OUT 1-8</text>');
      var btnStartX = x + 118;
      for (var r = 0; r < Math.min(2, Math.floor(h / 24)); r++) {
        for (var c = 0; c < 8; c++) {
          var bx = btnStartX + (c * 19);
          var by = y + 7 + (r * 17);
          var isLit = (c === 2 || c === 5);
          svg.push('<rect x="' + bx + '" y="' + by + '" width="14" height="11" rx="1.5" fill="' + (isLit ? '#0284c7' : '#1e293b') + '" stroke="#475569" stroke-width="0.7"/>');
          svg.push('<text x="' + (bx + 7) + '" y="' + (by + 8.5) + '" fill="#fff" font-size="6.5" font-weight="bold" text-anchor="middle">' + (c + 1) + '</text>');
        }
      }
      svg.push('<text x="' + (x + w - 10) + '" y="' + (y + 15) + '" fill="#f59e0b" font-size="7.5" text-anchor="end" font-weight="bold">' + btu + ' BTU/hr</text>');
    }
    else if (cat === 'dsp') {
      svg.push('<text x="' + (x + 10) + '" y="' + (y + h * 0.45) + '" fill="#10b981" font-size="9" font-weight="bold">' + escapeXml(name.slice(0, 24)) + '</text>');
      svg.push('<text x="' + (x + 10) + '" y="' + (y + h * 0.78) + '" fill="#94a3b8" font-size="7.5">DANTE AEC • ' + dev.powerWatts + 'W</text>');
      var meterStartX = x + 150;
      for (var ch = 0; ch < 8; ch++) {
        var mx = meterStartX + (ch * 11);
        svg.push('<rect x="' + mx + '" y="' + (y + h * 0.55) + '" width="6" height="3" fill="#22c55e"/>');
        svg.push('<rect x="' + mx + '" y="' + (y + h * 0.40) + '" width="6" height="3" fill="#22c55e"/>');
        svg.push('<rect x="' + mx + '" y="' + (y + h * 0.25) + '" width="6" height="3" fill="#eab308"/>');
      }
      svg.push('<circle cx="' + (x + w - 40) + '" cy="' + (y + h / 2) + '" r="2.8" fill="#22c55e"/>');
      svg.push('<text x="' + (x + w - 34) + '" y="' + (y + h / 2 + 3) + '" fill="#cbd5e1" font-size="6.5">PRI</text>');
      svg.push('<circle cx="' + (x + w - 18) + '" cy="' + (y + h / 2) + '" r="2.8" fill="#22c55e"/>');
      svg.push('<text x="' + (x + w - 12) + '" y="' + (y + h / 2 + 3) + '" fill="#cbd5e1" font-size="6.5">SEC</text>');
    }
    else if (cat === 'amp') {
      svg.push('<text x="' + (x + 10) + '" y="' + (y + 16) + '" fill="#f97316" font-size="9" font-weight="bold">' + escapeXml(name.slice(0, 24)) + '</text>');
      svg.push('<text x="' + (x + 10) + '" y="' + (y + 27) + '" fill="#ef4444" font-size="7.5" font-weight="bold">HIGH HEAT: ' + btu + ' BTU/hr</text>');
      var ventX = x + 145;
      var ventW = 95;
      svg.push('<rect x="' + ventX + '" y="' + (y + 7) + '" width="' + ventW + '" height="' + (h - 14) + '" rx="2" fill="#050811" stroke="#334155" stroke-width="0.8"/>');
      for (var vl = 0; vl < Math.min(8, Math.floor(h / 7)); vl++) {
        svg.push('<line x1="' + (ventX + 5) + '" y1="' + (y + 10 + vl * 6) + '" x2="' + (ventX + ventW - 5) + '" y2="' + (y + 10 + vl * 6) + '" stroke="#475569" stroke-width="1.5"/>');
      }
      var knobX = x + w - 55;
      svg.push('<circle cx="' + knobX + '" cy="' + (y + h / 2) + '" r="8" fill="#1e293b" stroke="#f97316" stroke-width="1"/>');
      svg.push('<circle cx="' + (knobX + 24) + '" cy="' + (y + h / 2) + '" r="8" fill="#1e293b" stroke="#f97316" stroke-width="1"/>');
    }
    else if (cat === 'blank') {
      svg.push('<text x="' + (x + 12) + '" y="' + (y + h / 2 + 3) + '" fill="#64748b" font-size="7.5" font-weight="bold">SLOTTED VENT PANEL (' + dev.uHeight + 'U)</text>');
      var louverStartX = x + 120;
      var louverW = w - 145;
      var numSlots = Math.max(2, dev.uHeight * 3);
      for (var s = 0; s < numSlots; s++) {
        var sy = y + 5 + (s * (h - 10) / numSlots);
        svg.push('<rect x="' + louverStartX + '" y="' + sy + '" width="' + louverW + '" height="2.5" rx="1" fill="#000" stroke="#334155" stroke-width="0.5"/>');
      }
    }
    else if (cat === 'drawer') {
      svg.push('<rect x="' + (x + w / 2 - 35) + '" y="' + (y + h / 2 - 5) + '" width="70" height="10" rx="2" fill="#090d16" stroke="#475569" stroke-width="0.8"/>');
      svg.push('<circle cx="' + (x + 30) + '" cy="' + (y + h / 2) + '" r="5" fill="#475569" stroke="#94a3b8" stroke-width="0.8"/>');
      svg.push('<text x="' + (x + 48) + '" y="' + (y + h / 2 + 3.5) + '" fill="#94a3b8" font-size="8" font-weight="bold">' + escapeXml(name) + '</text>');
    }
    else {
      svg.push('<text x="' + (x + 10) + '" y="' + (y + h / 2 + 3.5) + '" fill="#f8fafc" font-size="9" font-weight="bold">' + escapeXml(name) + '</text>');
      svg.push('<text x="' + (x + w - 12) + '" y="' + (y + h / 2 + 3.5) + '" fill="#94a3b8" font-size="7.5" text-anchor="end">' + dev.powerWatts + 'W • ' + btu + ' BTU/hr</text>');
    }
  }

  // 2. EXACT 2D SIDE DEPTH & AIRFLOW ELEVATION (PHYSICALLY GROUNDED WITH LOAD-BEARING SUPPORT RAILS)
  function renderSideRackSVG() {
    var totalU = rackState.totalU;
    var rackDepthMm = rackState.rackDepthMm;
    var uHeightPx = 28;
    var totalRackHeightPx = totalU * uHeightPx;
    var topMargin = 60;
    var bottomMargin = 60;
    var sideWidthPx = 480;
    var svgWidth = sideWidthPx + 150;
    var svgHeight = totalRackHeightPx + topMargin + bottomMargin;

    var startX = 60;
    var startY = topMargin;
    var pxPerMm = (sideWidthPx - 70) / rackDepthMm;

    var svg = [];
    svg.push('<svg viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '" width="100%" height="490" preserveAspectRatio="xMidYMid meet" style="background:#090d16; border-radius:12px; font-family:\'Courier New\', Courier, monospace;" id="svgSideElevation">');

    // Defs & Gradients
    svg.push('<defs>');
    svg.push('  <linearGradient id="sidePanelGrad" x1="0%" y1="0%" x2="100%" y2="0%">');
    svg.push('    <stop offset="0%" stop-color="#1e293b"/><stop offset="50%" stop-color="#0f172a"/><stop offset="100%" stop-color="#090d16"/>');
    svg.push('  </linearGradient>');
    svg.push('  <linearGradient id="supportRailGrad" x1="0%" y1="0%" x2="0%" y2="100%">');
    svg.push('    <stop offset="0%" stop-color="#94a3b8"/><stop offset="50%" stop-color="#64748b"/><stop offset="100%" stop-color="#334155"/>');
    svg.push('  </linearGradient>');
    svg.push('  <linearGradient id="chassisSteelGrad" x1="0%" y1="0%" x2="0%" y2="100%">');
    svg.push('    <stop offset="0%" stop-color="#2a3447"/><stop offset="50%" stop-color="#18202f"/><stop offset="100%" stop-color="#0f172a"/>');
    svg.push('  </linearGradient>');
    svg.push('</defs>');

    // Outer Side Cabinet Enclosure
    svg.push('<!-- Outer Side Frame -->');
    svg.push('<rect x="' + startX + '" y="' + startY + '" width="' + sideWidthPx + '" height="' + totalRackHeightPx + '" fill="url(#sidePanelGrad)" stroke="#334155" stroke-width="1.5"/>');

    var frontPostX = startX + 30;
    var rearPostX = startX + sideWidthPx - 40;

    // Structural Cross Braces connecting Front Post to Rear Post (eliminating any floating appearance)
    var midCrossY = startY + (totalRackHeightPx / 2);
    svg.push('<!-- Structural Cross Beams -->');
    svg.push('<rect x="' + frontPostX + '" y="' + (startY + 4) + '" width="' + (rearPostX - frontPostX) + '" height="12" fill="#1e293b" stroke="#334155" stroke-width="0.8"/>');
    svg.push('<rect x="' + frontPostX + '" y="' + (midCrossY - 6) + '" width="' + (rearPostX - frontPostX) + '" height="12" fill="#1e293b" stroke="#334155" stroke-width="0.8"/>');
    svg.push('<rect x="' + frontPostX + '" y="' + (startY + totalRackHeightPx - 16) + '" width="' + (rearPostX - frontPostX) + '" height="12" fill="#1e293b" stroke="#334155" stroke-width="0.8"/>');

    // Vertical Front Post (EIA Rail)
    svg.push('<!-- Front Vertical EIA Rail -->');
    svg.push('<rect x="' + frontPostX + '" y="' + startY + '" width="18" height="' + totalRackHeightPx + '" fill="#475569" stroke="#64748b" stroke-width="1.2"/>');
    svg.push('<text x="' + (frontPostX + 9) + '" y="' + (startY - 12) + '" fill="#38bdf8" font-size="8.5" font-weight="bold" text-anchor="middle">FRONT RAIL</text>');

    // Vertical Rear Post
    svg.push('<!-- Rear Vertical Equipment Post -->');
    svg.push('<rect x="' + rearPostX + '" y="' + startY + '" width="18" height="' + totalRackHeightPx + '" fill="#334155" stroke="#475569" stroke-width="1.2"/>');
    svg.push('<text x="' + (rearPostX + 9) + '" y="' + (startY - 12) + '" fill="#94a3b8" font-size="8.5" font-weight="bold" text-anchor="middle">REAR POST</text>');

    // Top Canopy with Exhaust Chimney
    svg.push('<rect x="' + (startX - 10) + '" y="' + (startY - 25) + '" width="' + (sideWidthPx + 20) + '" height="25" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1.2"/>');
    svg.push('<text x="' + (startX + sideWidthPx / 2) + '" y="' + (startY - 9) + '" fill="#cbd5e1" font-size="9" font-weight="bold" text-anchor="middle">ROOF EXHAUST HOOD &amp; VENT</text>');

    var chimneyX = startX + sideWidthPx - 100;
    svg.push('<rect x="' + chimneyX + '" y="' + (startY - 22) + '" width="70" height="18" rx="2" fill="#090d16" stroke="#ef4444" stroke-width="1.2"/>');
    svg.push('<text x="' + (chimneyX + 35) + '" y="' + (startY - 10) + '" fill="#f97316" font-size="8" font-weight="bold" text-anchor="middle">EXHAUST ▲</text>');

    // Bottom Base & Casters
    var plinthY = startY + totalRackHeightPx;
    svg.push('<rect x="' + (startX - 10) + '" y="' + plinthY + '" width="' + (sideWidthPx + 20) + '" height="20" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1.2"/>');
    svg.push('<circle cx="' + (startX + 40) + '" cy="' + (plinthY + 28) + '" r="8" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>');
    svg.push('<circle cx="' + (startX + sideWidthPx - 40) + '" cy="' + (plinthY + 28) + '" r="8" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>');

    // Horizontal Depth Gridlines for each U
    for (var u = 1; u <= totalU; u++) {
      var uIndexFromTop = totalU - u;
      var curY = startY + (uIndexFromTop * uHeightPx);
      svg.push('<line x1="' + frontPostX + '" y1="' + curY + '" x2="' + (rearPostX + 18) + '" y2="' + curY + '" stroke="#1e293b" stroke-width="0.8" opacity="0.4"/>');
      svg.push('<text x="' + (startX + 12) + '" y="' + (curY + uHeightPx * 0.68) + '" fill="#64748b" font-size="8.5">' + u + 'U</text>');
    }

    // Render Devices with Realistic Load-Bearing Slide Support Rails (L-Brackets)
    rackState.devices.forEach(function(dev) {
      if (dev.uStart < 1 || dev.uStart > totalU) return;
      var topUOfDevice = dev.uStart + dev.uHeight - 1;
      var uIndexFromTop = totalU - topUOfDevice;
      var devY = startY + (uIndexFromTop * uHeightPx);
      var devHeightPx = dev.uHeight * uHeightPx;
      var isSelected = (rackState.activeDeviceId === dev.id);

      var chassisDepthPx = Math.max(30, dev.depthMm * pxPerMm);
      var chassisStartX = frontPostX + 18;

      var btu = dev.btuHr || Math.round(dev.powerWatts * WATTS_TO_BTU_HR);
      var thermalTier = getDeviceThermalTier(btu);
      var heatColor = thermalTier.color;

      var isTierFiltered = (rackState.thermalFilterTier && rackState.thermalFilterTier === thermalTier.tier);
      var isTierDimmed = (rackState.thermalFilterTier && rackState.thermalFilterTier !== thermalTier.tier);

      var stroke = isSelected ? '#38bdf8' : (isTierFiltered ? '#ffffff' : heatColor);
      var strokeWidth = isSelected ? '2.5' : (isTierFiltered ? '2.2' : '1');

      // 1. HARDWARE SUPPORT RAIL / L-BRACKET (Physically holds the equipment between Front and Rear posts)
      var railBottomY = devY + devHeightPx;
      if (dev.depthMm > 50) {
        var railSpanWidth = (rearPostX + 18) - frontPostX;
        // Heavy duty continuous horizontal steel L-bracket runner under chassis
        svg.push('<!-- Load-Bearing Slide Rail for ' + escapeXml(dev.name) + ' -->');
        svg.push('<g class="load-bearing-rail" title="Horizontal Steel L-Bracket Support Runner (Bolted between Front & Rear Posts)">');
        svg.push('<rect x="' + frontPostX + '" y="' + (railBottomY - 3) + '" width="' + railSpanWidth + '" height="5" fill="url(#supportRailGrad)" stroke="#1e293b" stroke-width="0.8"/>');
        // Structural adjustment slots along the slide rail
        for (var slotX = frontPostX + 26; slotX < rearPostX - 10; slotX += 28) {
          svg.push('<rect x="' + slotX + '" y="' + (railBottomY - 2) + '" width="14" height="2.5" rx="1" fill="#090d16" opacity="0.75"/>');
        }
        // Front and Rear Mounting Screws into Vertical Posts
        svg.push('<circle cx="' + (frontPostX + 8) + '" cy="' + (railBottomY - 0.5) + '" r="2" fill="#cbd5e1" stroke="#000" stroke-width="0.5"/>');
        svg.push('<circle cx="' + (rearPostX + 9) + '" cy="' + (railBottomY - 0.5) + '" r="2" fill="#cbd5e1" stroke="#000" stroke-width="0.5"/>');
        svg.push('</g>');
      }

      svg.push('<g class="rack-side-dev" onclick="selectRackDevice(\'' + dev.id + '\')" style="cursor:pointer;' + (isTierDimmed ? ' opacity:0.28;' : '') + '">');

      // Chassis body rectangle resting directly on support rail
      svg.push('<rect x="' + chassisStartX + '" y="' + devY + '" width="' + chassisDepthPx + '" height="' + (devHeightPx - 3) + '" rx="2" fill="url(#chassisSteelGrad)" stroke="' + stroke + '" stroke-width="' + strokeWidth + '"/>');

      // Front Faceplate flange line
      svg.push('<rect x="' + (chassisStartX - 4) + '" y="' + devY + '" width="4" height="' + devHeightPx + '" fill="#94a3b8"/>');

      // Rear AC Power Cord (IEC C13/C14) descending to bottom power tray
      var rearChassisX = chassisStartX + chassisDepthPx;
      if (dev.powerWatts > 0) {
        // IEC inlet box on rear
        svg.push('<rect x="' + (rearChassisX - 6) + '" y="' + (devY + devHeightPx - 10) + '" width="6" height="6" fill="#000" stroke="#475569" stroke-width="0.6"/>');
        // Black AC Power Cord dropped to vertical power duct
        svg.push('<path d="M ' + rearChassisX + ' ' + (devY + devHeightPx - 7) + ' Q ' + (rearChassisX + 16) + ' ' + (devY + devHeightPx + 4) + ' ' + (rearPostX - 4) + ' ' + (devY + devHeightPx + 15) + '" fill="none" stroke="#000000" stroke-width="2.5"/>');
      }

      // Hot Air Exhaust Vector with dynamic color mapping
      if (dev.powerWatts > 20) {
        svg.push('<line x1="' + (rearChassisX + 4) + '" y1="' + (devY + devHeightPx / 2) + '" x2="' + (rearChassisX + 22) + '" y2="' + (devY + devHeightPx / 2 - 8) + '" stroke="' + heatColor + '" stroke-width="' + (isTierFiltered ? '2.2' : '1.2') + '" stroke-dasharray="2,2"/>');
        svg.push('<polygon points="' + (rearChassisX + 26) + ',' + (devY + devHeightPx / 2 - 10) + ' ' + (rearChassisX + 19) + ',' + (devY + devHeightPx / 2 - 6) + ' ' + (rearChassisX + 22) + ',' + (devY + devHeightPx / 2 - 13) + '" fill="' + heatColor + '"/>');
      }

      // Device text
      if (chassisDepthPx > 70 && devHeightPx > 16) {
        svg.push('<text x="' + (chassisStartX + 6) + '" y="' + (devY + devHeightPx * 0.58) + '" fill="#f8fafc" font-size="8.5" font-weight="bold">' + escapeXml(dev.name.slice(0, 16)) + '</text>');
        svg.push('<text x="' + (chassisStartX + chassisDepthPx - 6) + '" y="' + (devY + devHeightPx * 0.58) + '" fill="#94a3b8" font-size="7.5" text-anchor="end">' + dev.depthMm + 'mm</text>');
      }

      svg.push('<title>' + escapeXml(dev.name) + '&#10;Depth: ' + dev.depthMm + ' mm (' + (dev.depthMm / 25.4).toFixed(1) + '")&#10;Power: ' + dev.powerWatts + 'W | ' + btu + ' BTU/hr&#10;Thermal Status: ' + thermalTier.label + ' (' + thermalTier.rangeText + ')&#10;Supported by: Heavy-duty dual-post steel slide rails</title>');
      svg.push('</g>');
    });

    // Rear Cable Management Zone
    var cableZoneX = rearPostX - 10;
    svg.push('<path d="M ' + cableZoneX + ' ' + (startY + 20) + ' Q ' + (cableZoneX + 15) + ' ' + (startY + totalRackHeightPx / 2) + ' ' + cableZoneX + ' ' + (startY + totalRackHeightPx - 20) + '" fill="none" stroke="#0284c7" stroke-width="3" opacity="0.6"/>');
    svg.push('<text x="' + (rearPostX + 26) + '" y="' + (startY + totalRackHeightPx / 2) + '" fill="#0284c7" font-size="7.5" transform="rotate(90 ' + (rearPostX + 26) + ' ' + (startY + totalRackHeightPx / 2) + ')" text-anchor="middle">CABLE HARNESS</text>');

    // Depth Dimension Callout
    var dimY = startY + totalRackHeightPx + 42;
    svg.push('<line x1="' + frontPostX + '" y1="' + dimY + '" x2="' + rearPostX + '" y2="' + dimY + '" stroke="#38bdf8" stroke-width="1.2"/>');
    svg.push('<text x="' + ((frontPostX + rearPostX) / 2) + '" y="' + (dimY - 4) + '" fill="#38bdf8" font-size="8.5" font-weight="bold" text-anchor="middle">DEPTH: ' + rackDepthMm + ' mm (' + (rackDepthMm / 25.4).toFixed(1) + '")</text>');

    svg.push('</svg>');
    return svg.join('\n');
  }

  // 3. PHOTOREALISTIC 3D AXONOMETRIC PERSPECTIVE SVG
  function render3DRackSVG() {
    var totalU = rackState.totalU;
    var uHeightPx = 18;
    var totalHeightPx = totalU * uHeightPx;

    var isoWidth = 270;
    var isoDepth = 170;
    var depthCos = 0.707;
    var depthSin = 0.400;

    var originX = 145;
    var originY = 65;
    var svgWidth = 600;
    var svgHeight = totalHeightPx + (isoDepth * depthSin) + 140;

    var svg = [];
    svg.push('<svg viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '" width="100%" height="490" preserveAspectRatio="xMidYMid meet" style="background:#050811; border-radius:12px; font-family:\'Courier New\', Courier, monospace;" id="svg3DIsometric">');

    // Defs & Gradients for Realistic 3D Shading & Metallic Textures
    svg.push('<defs>');
    // Metallic Frame & Corner Post Gradient
    svg.push('  <linearGradient id="isoFrameMetallicGrad" x1="0%" y1="0%" x2="100%" y2="0%">');
    svg.push('    <stop offset="0%" stop-color="#475569"/><stop offset="30%" stop-color="#64748b"/><stop offset="70%" stop-color="#334155"/><stop offset="100%" stop-color="#1e293b"/>');
    svg.push('  </linearGradient>');
    // Roof Canopy Gradient with Depth Bevel
    svg.push('  <linearGradient id="isoTopCanopyGrad" x1="0%" y1="0%" x2="100%" y2="100%">');
    svg.push('    <stop offset="0%" stop-color="#64748b"/><stop offset="35%" stop-color="#475569"/><stop offset="80%" stop-color="#334155"/><stop offset="100%" stop-color="#1e293b"/>');
    svg.push('  </linearGradient>');
    // Right Side Depth Face Gradient (Powder-Coated Steel)
    svg.push('  <linearGradient id="isoSidePanelGrad" x1="0%" y1="0%" x2="100%" y2="0%">');
    svg.push('    <stop offset="0%" stop-color="#1e293b"/><stop offset="35%" stop-color="#16202e"/><stop offset="70%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/>');
    svg.push('  </linearGradient>');
    // Chassis Top Receding Plate (Brushed Dark Metal)
    svg.push('  <linearGradient id="isoChassisTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">');
    svg.push('    <stop offset="0%" stop-color="#475569"/><stop offset="30%" stop-color="#334155"/><stop offset="75%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/>');
    svg.push('  </linearGradient>');
    // Chassis Side Receding Face (Dark Shadow Steel)
    svg.push('  <linearGradient id="isoChassisSideGrad" x1="0%" y1="0%" x2="100%" y2="0%">');
    svg.push('    <stop offset="0%" stop-color="#1e2430"/><stop offset="50%" stop-color="#131822"/><stop offset="100%" stop-color="#080b10"/>');
    svg.push('  </linearGradient>');
    // Brushed Metallic Chassis Faceplate Gradient
    svg.push('  <linearGradient id="isoFaceplateMetallicGrad" x1="0%" y1="0%" x2="0%" y2="100%">');
    svg.push('    <stop offset="0%" stop-color="#334155"/><stop offset="10%" stop-color="#242c38"/><stop offset="85%" stop-color="#181e28"/><stop offset="100%" stop-color="#0d1117"/>');
    svg.push('  </linearGradient>');
    // Underside Ambient Occlusion Shadow between Chassis Layers
    svg.push('  <linearGradient id="isoUndersideShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">');
    svg.push('    <stop offset="0%" stop-color="#000000" stop-opacity="0.8"/><stop offset="100%" stop-color="#000000" stop-opacity="0"/>');
    svg.push('  </linearGradient>');
    // Floor Contact Shadow (Multi-Stop Radial)
    svg.push('  <radialGradient id="floorShadowGrad" cx="50%" cy="50%" r="50%">');
    svg.push('    <stop offset="0%" stop-color="#000000" stop-opacity="0.95"/><stop offset="45%" stop-color="#000000" stop-opacity="0.6"/><stop offset="75%" stop-color="#000000" stop-opacity="0.25"/><stop offset="100%" stop-color="#000000" stop-opacity="0"/>');
    svg.push('  </radialGradient>');
    // 3D Spherical Screw Head Gradient
    svg.push('  <radialGradient id="isoScrewHead3DGrad" cx="35%" cy="35%" r="65%">');
    if (rackState.screwColor === 'silver') {
      svg.push('    <stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#cbd5e1"/><stop offset="70%" stop-color="#64748b"/><stop offset="100%" stop-color="#1e293b"/>');
    } else {
      svg.push('    <stop offset="0%" stop-color="#475569"/><stop offset="40%" stop-color="#1e293b"/><stop offset="85%" stop-color="#090d16"/><stop offset="100%" stop-color="#000000"/>');
    }
    svg.push('  </radialGradient>');
    // Upward Convective Exhaust Heat Plume
    svg.push('  <linearGradient id="exhaustGlowGrad" x1="0%" y1="100%" x2="0%" y2="0%">');
    svg.push('    <stop offset="0%" stop-color="#f97316" stop-opacity="0.65"/><stop offset="50%" stop-color="#eab308" stop-opacity="0.35"/><stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>');
    svg.push('  </linearGradient>');
    // Soft Glow Filter for LEDs
    svg.push('  <filter id="isoLedGlow" x="-30%" y="-30%" width="160%" height="160%">');
    svg.push('    <feGaussianBlur stdDeviation="1.8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>');
    svg.push('  </filter>');
    svg.push('</defs>');

    // 4-Post Cabinet Coordinates in 3D Axonometric Projection
    var pFTL = { x: originX, y: originY };
    var pFTR = { x: originX + isoWidth, y: originY };
    var pRTR = { x: originX + isoWidth + (isoDepth * depthCos), y: originY - (isoDepth * depthSin) };
    var pRTL = { x: originX + (isoDepth * depthCos), y: originY - (isoDepth * depthSin) };

    var pFBL = { x: pFTL.x, y: pFTL.y + totalHeightPx };
    var pFBR = { x: pFTR.x, y: pFTR.y + totalHeightPx };
    var pRBR = { x: pRTR.x, y: pRTR.y + totalHeightPx };
    var pRBL = { x: pRTL.x, y: pRTL.y + totalHeightPx };

    // 1. Isometric Floor Plane & Soft Ambient Ground Shadow
    svg.push('<!-- Floor Ground Plane & Ambient Drop Shadows -->');
    var floorCenterX = originX + isoWidth / 2 + (isoDepth * depthCos * 0.45);
    var floorCenterY = pFBL.y + 36;
    // Outer ambient decay shadow
    svg.push('<ellipse cx="' + floorCenterX + '" cy="' + floorCenterY + '" rx="' + (isoWidth * 0.85) + '" ry="30" fill="url(#floorShadowGrad)"/>');
    // Inner high-density contact shadow directly under posts
    svg.push('<ellipse cx="' + floorCenterX + '" cy="' + (floorCenterY - 6) + '" rx="' + (isoWidth * 0.65) + '" ry="16" fill="#000000" opacity="0.65"/>');

    // 2. Interior Rear Bay & Rear Vertical Structural Posts
    svg.push('<!-- Interior Rack Cavity -->');
    svg.push('<polygon points="' + pRTL.x + ',' + pRTL.y + ' ' + pRTR.x + ',' + pRTR.y + ' ' + pRBR.x + ',' + pRBR.y + ' ' + pRBL.x + ',' + pRBL.y + '" fill="#020409" stroke="#1e293b" stroke-width="1.2"/>');
    // Rear left vertical upright post
    svg.push('<line x1="' + pRTL.x + '" y1="' + pRTL.y + '" x2="' + pRBL.x + '" y2="' + pRBL.y + '" stroke="#334155" stroke-width="3.5"/>');
    // Rear right vertical upright post
    svg.push('<line x1="' + pRTR.x + '" y1="' + pRTR.y + '" x2="' + pRBR.x + '" y2="' + pRBR.y + '" stroke="#475569" stroke-width="3.5"/>');

    // 3. Top Roof Canopy Surface with Dual High-Velocity Exhaust Fans & Impellers
    svg.push('<!-- Extruded Top Canopy Roof & Exhaust Chimney -->');
    svg.push('<polygon points="' + pFTL.x + ',' + pFTL.y + ' ' + pFTR.x + ',' + pFTR.y + ' ' + pRTR.x + ',' + pRTR.y + ' ' + pRTL.x + ',' + pRTL.y + '" fill="url(#isoTopCanopyGrad)" stroke="#64748b" stroke-width="1.8"/>');
    // Specular highlight along front top edge of canopy
    svg.push('<line x1="' + pFTL.x + '" y1="' + pFTL.y + '" x2="' + pFTR.x + '" y2="' + pFTR.y + '" stroke="#cbd5e1" stroke-width="1.5" opacity="0.8"/>');

    // Dual Top Exhaust Fans in 3D Axonometric Projection
    var fan1CenterX = pFTL.x + (isoWidth * 0.35) + 30;
    var fan1CenterY = pFTL.y - 18;
    var fan2CenterX = pFTL.x + (isoWidth * 0.70) + 30;
    var fan2CenterY = pFTL.y - 28;

    [ { x: fan1CenterX, y: fan1CenterY }, { x: fan2CenterX, y: fan2CenterY } ].forEach(function(fan) {
      // Outer fan cowl bezel ring
      svg.push('<ellipse cx="' + fan.x + '" cy="' + fan.y + '" rx="23" ry="9.5" fill="#090d16" stroke="#64748b" stroke-width="1.5"/>');
      // Inner ventilation cavity
      svg.push('<ellipse cx="' + fan.x + '" cy="' + fan.y + '" rx="18" ry="7.5" fill="#020409" stroke="#38bdf8" stroke-width="1"/>');
      // Rotating fan impeller blades visible inside cowl
      for (var b = 0; b < 6; b++) {
        var angle = b * (Math.PI / 3);
        var bx = fan.x + Math.cos(angle) * 14;
        var by = fan.y + Math.sin(angle) * 5.5;
        svg.push('<line x1="' + fan.x + '" y1="' + fan.y + '" x2="' + bx.toFixed(1) + '" y2="' + by.toFixed(1) + '" stroke="#475569" stroke-width="1.2"/>');
      }
      // Center turbine hub
      svg.push('<circle cx="' + fan.x + '" cy="' + fan.y + '" r="3.5" fill="#0284c7" stroke="#38bdf8" stroke-width="0.8"/>');
      // Rising convective heat chimney plume
      svg.push('<polygon points="' + (fan.x - 14) + ',' + fan.y + ' ' + (fan.x + 14) + ',' + fan.y + ' ' + (fan.x + 6) + ',' + (fan.y - 32) + ' ' + (fan.x - 6) + ',' + (fan.y - 32) + '" fill="url(#exhaustGlowGrad)"/>');
    });

    // 4. Cabinet Right Side Depth Panel (Heavy-Gauge Steel with Structural Ribs)
    svg.push('<!-- Right Side Depth Panel -->');
    svg.push('<polygon points="' + pFTR.x + ',' + pFTR.y + ' ' + pRTR.x + ',' + pRTR.y + ' ' + pRBR.x + ',' + pRBR.y + ' ' + pFBR.x + ',' + pFBR.y + '" fill="url(#isoSidePanelGrad)" stroke="#475569" stroke-width="1.5"/>');

    // Structural Cross Braces and Depth Stiffeners on Side Panel
    var midSideY_Front = pFTR.y + totalHeightPx * 0.5;
    var midSideY_Rear = pRTR.y + totalHeightPx * 0.5;
    svg.push('<line x1="' + pFTR.x + '" y1="' + midSideY_Front + '" x2="' + pRTR.x + '" y2="' + midSideY_Rear + '" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,3"/>');

    // Laser-Cut Side Ventilation Louvers (with depth slit shadows)
    for (var sl = 0; sl < 5; sl++) {
      var ly1 = pFTR.y + 24 + (sl * 14);
      var ly2 = pRTR.y + 24 + (sl * 14);
      svg.push('<line x1="' + (pFTR.x + 30) + '" y1="' + (ly1 - 10) + '" x2="' + (pRTR.x - 18) + '" y2="' + (ly2 - 10) + '" stroke="#090d16" stroke-width="2.5"/>');
      svg.push('<line x1="' + (pFTR.x + 30) + '" y1="' + (ly1 - 9) + '" x2="' + (pRTR.x - 18) + '" y2="' + (ly2 - 9) + '" stroke="#334155" stroke-width="0.8"/>');
    }

    // 5. Front Vertical Corner Posts & EIA Rails with Universal 3-Hole Pattern
    var railW = 20;
    svg.push('<!-- Front Left EIA Rail Post -->');
    svg.push('<rect x="' + pFTL.x + '" y="' + pFTL.y + '" width="' + railW + '" height="' + totalHeightPx + '" fill="url(#isoFrameMetallicGrad)" stroke="#1e293b" stroke-width="1.2"/>');
    // Specular highlight edge on left post
    svg.push('<line x1="' + (pFTL.x + 1) + '" y1="' + pFTL.y + '" x2="' + (pFTL.x + 1) + '" y2="' + (pFTL.y + totalHeightPx) + '" stroke="#94a3b8" stroke-width="0.8" opacity="0.6"/>');

    svg.push('<!-- Front Right EIA Rail Post -->');
    svg.push('<rect x="' + (pFTR.x - railW) + '" y="' + pFTL.y + '" width="' + railW + '" height="' + totalHeightPx + '" fill="url(#isoFrameMetallicGrad)" stroke="#1e293b" stroke-width="1.2"/>');
    // Specular highlight edge on right post
    svg.push('<line x1="' + (pFTR.x - 1) + '" y1="' + pFTL.y + '" x2="' + (pFTR.x - 1) + '" y2="' + (pFTL.y + totalHeightPx) + '" stroke="#94a3b8" stroke-width="0.8" opacity="0.6"/>');

    // Draw U Markers and EIA Universal 3-Hole Pattern
    for (var u = 1; u <= totalU; u++) {
      var uIndexFromTop = totalU - u;
      var curY = pFTL.y + (uIndexFromTop * uHeightPx);

      // Horizontal division line across rack
      svg.push('<line x1="' + pFTL.x + '" y1="' + curY + '" x2="' + pFTR.x + '" y2="' + curY + '" stroke="#1e293b" stroke-width="0.8" opacity="0.45"/>');

      // EIA 3-Hole Cage Nut Pattern on Left and Right Rails
      var holeY1 = curY + (uHeightPx * 0.22);
      var holeY2 = curY + (uHeightPx * 0.50);
      var holeY3 = curY + (uHeightPx * 0.78);

      var lHoleX = pFTL.x + (railW / 2);
      var rHoleX = pFTR.x - (railW / 2);

      [ holeY1, holeY2, holeY3 ].forEach(function(hy) {
        // Left rail square cage nut
        svg.push('<rect x="' + (lHoleX - 1.8) + '" y="' + (hy - 1.8) + '" width="3.6" height="3.6" rx="0.5" fill="#090d16" stroke="#475569" stroke-width="0.5"/>');
        // Right rail square cage nut
        svg.push('<rect x="' + (rHoleX - 1.8) + '" y="' + (hy - 1.8) + '" width="3.6" height="3.6" rx="0.5" fill="#090d16" stroke="#475569" stroke-width="0.5"/>');
      });

      // U numbers on left side
      if (u % 2 === 0 || u === 1 || u === totalU) {
        svg.push('<text x="' + (pFTL.x - 7) + '" y="' + (curY + uHeightPx * 0.72) + '" fill="#94a3b8" font-size="8" font-weight="bold" text-anchor="end">' + u + 'U</text>');
      }
    }

    // 6. Render 3D Devices with Refined Metallic Textures, Depth Shadows, and Faceplates
    rackState.devices.forEach(function(dev) {
      if (dev.uStart < 1 || dev.uStart > totalU) return;
      var topUOfDevice = dev.uStart + dev.uHeight - 1;
      var uIndexFromTop = totalU - topUOfDevice;
      var devY = pFTL.y + (uIndexFromTop * uHeightPx);
      var devHeight = dev.uHeight * uHeightPx;
      var isSelected = (rackState.activeDeviceId === dev.id);

      // Chassis depth scale in 3D axonometric projection
      var depthRatio = Math.min(1.0, dev.depthMm / rackState.rackDepthMm);
      var devDepthPx = (isoDepth * 0.72) * depthRatio;
      var devDepthX = devDepthPx * depthCos;
      var devDepthY = devDepthPx * depthSin;

      var frontX = pFTL.x;
      var frontW = isoWidth;

      var btu = dev.btuHr || Math.round(dev.powerWatts * WATTS_TO_BTU_HR);
      var thermalTier = getDeviceThermalTier(btu);
      var isTierFiltered = (rackState.thermalFilterTier && rackState.thermalFilterTier === thermalTier.tier);
      var isTierDimmed = (rackState.thermalFilterTier && rackState.thermalFilterTier !== thermalTier.tier);

      svg.push('<!-- 3D Device: ' + escapeXml(dev.name) + ' -->');
      svg.push('<g class="rack-3d-dev" onclick="selectRackDevice(\'' + dev.id + '\')" style="cursor:pointer;' + (isTierDimmed ? ' opacity:0.28;' : '') + '">');

      // Top Receding Chassis Plate (Brushed steel with depth shadow)
      svg.push('<polygon points="' + frontX + ',' + devY + ' ' + (frontX + frontW) + ',' + devY + ' ' + (frontX + frontW + devDepthX) + ',' + (devY - devDepthY) + ' ' + (frontX + devDepthX) + ',' + (devY - devDepthY) + '" fill="url(#isoChassisTopGrad)" stroke="#475569" stroke-width="0.8"/>');
      // Subtle stamped chassis cover heat dissipation vent ribs
      if (dev.powerWatts > 20 && devDepthPx > 40) {
        for (var rib = 1; rib <= 3; rib++) {
          var ribX1 = frontX + 35 + (rib * 45);
          var ribX2 = ribX1 + (devDepthX * 0.75);
          var ribY1 = devY;
          var ribY2 = devY - (devDepthY * 0.75);
          svg.push('<line x1="' + ribX1 + '" y1="' + ribY1 + '" x2="' + ribX2.toFixed(1) + '" y2="' + ribY2.toFixed(1) + '" stroke="#1e293b" stroke-width="1.2"/>');
        }
      }

      // Right Receding Chassis Side Face (Dark Shadow Steel with stamped slide rail guide)
      svg.push('<polygon points="' + (frontX + frontW) + ',' + devY + ' ' + (frontX + frontW + devDepthX) + ',' + (devY - devDepthY) + ' ' + (frontX + frontW + devDepthX) + ',' + (devY - devDepthY + devHeight) + ' ' + (frontX + frontW) + ',' + (devY + devHeight) + '" fill="url(#isoChassisSideGrad)" stroke="#334155" stroke-width="0.8"/>');
      // Horizontal slide rail runner embossed line
      var sideRunnerY1 = devY + (devHeight * 0.6);
      var sideRunnerY2 = devY - devDepthY + (devHeight * 0.6);
      svg.push('<line x1="' + (frontX + frontW) + '" y1="' + sideRunnerY1 + '" x2="' + (frontX + frontW + devDepthX) + '" y2="' + sideRunnerY2.toFixed(1) + '" stroke="#475569" stroke-width="1"/>');

      // Ambient Occlusion / Underside Drop Shadow beneath this device
      svg.push('<rect x="' + frontX + '" y="' + (devY + devHeight - 3) + '" width="' + frontW + '" height="3" fill="url(#isoUndersideShadowGrad)"/>');

      // Front Faceplate (Refined Metallic Texture with Precision Chamfer)
      var strokeColor = isSelected ? '#38bdf8' : (isTierFiltered ? '#ffffff' : (dev.accentColor || '#64748b'));
      var strokeW = isSelected ? '2.4' : (isTierFiltered ? '2.2' : '1');
      var faceplateFill = dev.color || '#1e293b';

      svg.push('<rect x="' + frontX + '" y="' + devY + '" width="' + frontW + '" height="' + devHeight + '" rx="1" fill="' + faceplateFill + '" stroke="' + strokeColor + '" stroke-width="' + strokeW + '"/>');
      if (isTierFiltered) {
        svg.push('<rect x="' + (frontX + 1) + '" y="' + (devY + 1) + '" width="' + (frontW - 2) + '" height="' + (devHeight - 2) + '" fill="none" stroke="' + thermalTier.color + '" stroke-width="1.8"/>');
      }
      // Chamfer Specular Highlight along top edge of faceplate
      svg.push('<line x1="' + frontX + '" y1="' + (devY + 0.6) + '" x2="' + (frontX + frontW) + '" y2="' + (devY + 0.6) + '" stroke="#cbd5e1" stroke-width="0.8" opacity="0.6"/>');

      // Custom Front View Image on 3D Faceplate (if uploaded / provided)
      var apertureX = frontX + railW;
      var apertureW = frontW - (railW * 2);
      if (dev.customImageUrl) {
        svg.push('<image href="' + dev.customImageUrl + '" x="' + apertureX + '" y="' + devY + '" width="' + apertureW + '" height="' + devHeight + '" preserveAspectRatio="none"/>');
        // Inner metallic border bezel around custom faceplate image
        svg.push('<rect x="' + apertureX + '" y="' + devY + '" width="' + apertureW + '" height="' + devHeight + '" fill="none" stroke="#38bdf8" stroke-width="0.8" opacity="0.7"/>');
      } else {
        // Realistic Category-Specific Front Panel Artwork
        if (dev.category === 'switch') {
          // Network Switch: Dual-Tier RJ45 Ports and SFP cages
          var portRows = Math.min(2, Math.max(1, Math.floor(devHeight / 10)));
          var portsPerRow = 8;
          var pStartX = apertureX + 18;
          for (var pr = 0; pr < portRows; pr++) {
            var py = devY + 4 + (pr * 7);
            for (var pc = 0; pc < portsPerRow; pc++) {
              var px = pStartX + (pc * 10);
              svg.push('<rect x="' + px + '" y="' + py + '" width="7" height="5" rx="0.5" fill="#090d16" stroke="#475569" stroke-width="0.5"/>');
              svg.push('<line x1="' + (px + 1) + '" y1="' + (py + 4) + '" x2="' + (px + 6) + '" y2="' + (py + 4) + '" stroke="#eab308" stroke-width="0.5"/>');
              svg.push('<circle cx="' + (px + 3.5) + '" cy="' + (py - 1.2) + '" r="0.8" fill="#10b981"/>');
            }
          }
          // SFP+ Cage block on right
          svg.push('<rect x="' + (frontX + frontW - railW - 32) + '" y="' + (devY + 3) + '" width="24" height="' + (devHeight - 6) + '" fill="#090d16" stroke="#64748b" stroke-width="0.6"/>');
        } else if (dev.category === 'amp') {
          // Power Amplifier: Heavy Ribbed Aluminum Heatsink Fins + Knurled Gain Dials
          var finStartX = apertureX + 16;
          var finWidth = apertureW - 60;
          for (var f = finStartX; f < finStartX + finWidth; f += 5) {
            svg.push('<line x1="' + f + '" y1="' + (devY + 2) + '" x2="' + f + '" y2="' + (devY + devHeight - 2) + '" stroke="#090d16" stroke-width="2"/>');
            svg.push('<line x1="' + (f + 1) + '" y1="' + (devY + 2) + '" x2="' + (f + 1) + '" y2="' + (devY + devHeight - 2) + '" stroke="#64748b" stroke-width="0.6"/>');
          }
          // Dual Gain Volume Dials
          var dial1X = frontX + frontW - railW - 34;
          var dial2X = frontX + frontW - railW - 16;
          var dialY = devY + (devHeight / 2);
          svg.push('<circle cx="' + dial1X + '" cy="' + dialY + '" r="4.5" fill="url(#isoScrewHead3DGrad)" stroke="#090d16" stroke-width="0.8"/>');
          svg.push('<line x1="' + dial1X + '" y1="' + dialY + '" x2="' + (dial1X - 2) + '" y2="' + (dialY - 3) + '" stroke="#38bdf8" stroke-width="0.8"/>');
          svg.push('<circle cx="' + dial2X + '" cy="' + dialY + '" r="4.5" fill="url(#isoScrewHead3DGrad)" stroke="#090d16" stroke-width="0.8"/>');
          svg.push('<line x1="' + dial2X + '" y1="' + dialY + '" x2="' + (dial2X + 2) + '" y2="' + (dialY - 3) + '" stroke="#38bdf8" stroke-width="0.8"/>');
        } else if (dev.category === 'dsp' || dev.category === 'matrix') {
          // Audio DSP / Matrix: OLED Display Screen and VU Meter Bar
          svg.push('<rect x="' + (apertureX + 16) + '" y="' + (devY + 3) + '" width="55" height="' + (devHeight - 6) + '" rx="1" fill="#020617" stroke="#38bdf8" stroke-width="0.8"/>');
          svg.push('<text x="' + (apertureX + 20) + '" y="' + (devY + devHeight * 0.65) + '" fill="#38bdf8" font-size="6.5" font-weight="bold">DANTE 48k</text>');
          // VU Meter LEDs
          for (var vu = 0; vu < 5; vu++) {
            var vuColor = vu < 3 ? '#10b981' : (vu === 3 ? '#eab308' : '#ef4444');
            svg.push('<rect x="' + (apertureX + 78 + vu * 4.5) + '" y="' + (devY + devHeight * 0.35) + '" width="3" height="' + (devHeight * 0.35) + '" fill="' + vuColor + '"/>');
          }
        } else if (dev.category === 'blank') {
          // 1U/2U Slotted Vent Panel: Precision CNC airflow slots
          var slotW = 14;
          for (var sx = apertureX + 16; sx < apertureX + apertureW - 20; sx += 20) {
            svg.push('<rect x="' + sx + '" y="' + (devY + devHeight * 0.32) + '" width="' + slotW + '" height="' + (devHeight * 0.36) + '" rx="1" fill="#020617" stroke="#334155" stroke-width="0.6"/>');
          }
        } else if (dev.category === 'drawer') {
          // 2U Lockable Utility Drawer: Recessed pull handle and stainless key lock
          svg.push('<rect x="' + (apertureX + apertureW / 2 - 25) + '" y="' + (devY + devHeight * 0.35) + '" width="50" height="' + (devHeight * 0.30) + '" rx="2" fill="#090d16" stroke="#475569" stroke-width="0.8"/>');
          // Key lock barrel on right
          svg.push('<circle cx="' + (apertureX + apertureW - 24) + '" cy="' + (devY + devHeight / 2) + '" r="4" fill="url(#isoScrewHead3DGrad)" stroke="#090d16" stroke-width="0.8"/>');
          svg.push('<line x1="' + (apertureX + apertureW - 25) + '" y1="' + (devY + devHeight / 2) + '" x2="' + (apertureX + apertureW - 23) + '" y2="' + (devY + devHeight / 2) + '" stroke="#000" stroke-width="1.2"/>');
        }
      }

      // Left & Right Heavy-Duty 19" Rack Mounting Ears
      svg.push('<!-- Mounting Ears -->');
      svg.push('<rect x="' + frontX + '" y="' + devY + '" width="' + railW + '" height="' + devHeight + '" fill="#0f172a" opacity="0.75" stroke="#334155" stroke-width="0.5"/>');
      svg.push('<rect x="' + (frontX + frontW - railW) + '" y="' + devY + '" width="' + railW + '" height="' + devHeight + '" fill="#0f172a" opacity="0.75" stroke="#334155" stroke-width="0.5"/>');

      // Realistic 3D Screws with Spherical Radial Gradients and Socket Recess
      if (rackState.showScrews) {
        var screwR = 2.8;
        var sLeftX = frontX + railW / 2;
        var sRightX = frontX + frontW - railW / 2;

        [ devY + devHeight * 0.28, devY + devHeight * 0.72 ].forEach(function(sy) {
          // Left screw
          svg.push('<circle cx="' + sLeftX + '" cy="' + sy + '" r="' + screwR + '" fill="url(#isoScrewHead3DGrad)" stroke="#090d16" stroke-width="0.6"/>');
          svg.push('<circle cx="' + sLeftX + '" cy="' + sy + '" r="0.9" fill="#000000"/>'); // Drive socket recess
          // Right screw
          svg.push('<circle cx="' + sRightX + '" cy="' + sy + '" r="' + screwR + '" fill="url(#isoScrewHead3DGrad)" stroke="#090d16" stroke-width="0.6"/>');
          svg.push('<circle cx="' + sRightX + '" cy="' + sy + '" r="0.9" fill="#000000"/>');
        });
      }

      // High-Visibility Status / Power LED with Glow Filter
      svg.push('<circle cx="' + (frontX + railW + 8) + '" cy="' + (devY + devHeight / 2) + '" r="2" fill="' + (dev.accentColor || '#38bdf8') + '" filter="url(#isoLedGlow)"/>');

      // Device Name Label on 3D Faceplate
      if (devHeight > 13 && !dev.customImageUrl) {
        var labelX = (dev.category === 'dsp' || dev.category === 'matrix') ? (apertureX + 115) : (apertureX + 18);
        svg.push('<text x="' + labelX + '" y="' + (devY + devHeight * 0.65) + '" fill="#f8fafc" font-size="7.5" font-weight="bold" letter-spacing="0.3">' + escapeXml(dev.name.slice(0, 18)) + '</text>');
      }

      svg.push('<title>' + escapeXml(dev.name) + ' (' + dev.uHeight + 'U)&#10;Power: ' + dev.powerWatts + 'W | ' + (dev.btuHr || Math.round(dev.powerWatts * WATTS_TO_BTU_HR)) + ' BTU/hr</title>');
      svg.push('</g>');
    });

    // 7. Base Heavy-Duty Dual-Wheel Casters & Anti-Vibration Leveling Feet
    var baseTL = pFBL;
    var baseTR = pFBR;
    svg.push('<!-- Base Plinth & Grounded Casters -->');
    svg.push('<polygon points="' + baseTL.x + ',' + baseTL.y + ' ' + baseTR.x + ',' + baseTR.y + ' ' + (baseTR.x + 22) + ',' + (baseTR.y + 12) + ' ' + (baseTL.x - 10) + ',' + (baseTL.y + 12) + '" fill="url(#isoFrameMetallicGrad)" stroke="#64748b" stroke-width="1.2"/>');

    // Dual-Wheel Industrial Swivel Casters & Leveling Pads
    // Left Caster assembly
    var caster1X = baseTL.x + 22;
    var caster1Y = baseTL.y + 22;
    svg.push('<rect x="' + (caster1X - 8) + '" y="' + (baseTL.y + 12) + '" width="16" height="5" fill="#334155" stroke="#1e293b"/>'); // Mounting yoke
    svg.push('<ellipse cx="' + (caster1X - 2) + '" cy="' + caster1Y + '" rx="5.5" ry="7.5" fill="#090d16" stroke="#475569" stroke-width="1"/>'); // Outer wheel
    svg.push('<ellipse cx="' + (caster1X + 4) + '" cy="' + caster1Y + '" rx="5.5" ry="7.5" fill="#020409" stroke="#334155" stroke-width="1"/>'); // Inner wheel
    svg.push('<circle cx="' + caster1X + '" cy="' + caster1Y + '" r="2" fill="#cbd5e1"/>'); // Axle nut
    // Left Leveling Foot
    svg.push('<line x1="' + (baseTL.x + 6) + '" y1="' + (baseTL.y + 12) + '" x2="' + (baseTL.x + 6) + '" y2="' + (baseTL.y + 24) + '" stroke="#cbd5e1" stroke-width="2.5"/>');
    svg.push('<rect x="' + (baseTL.x + 1) + '" y="' + (baseTL.y + 23) + '" width="10" height="4" rx="1" fill="#1e293b" stroke="#cbd5e1" stroke-width="0.8"/>');

    // Right Caster assembly
    var caster2X = baseTR.x - 22;
    var caster2Y = baseTR.y + 22;
    svg.push('<rect x="' + (caster2X - 8) + '" y="' + (baseTR.y + 12) + '" width="16" height="5" fill="#334155" stroke="#1e293b"/>');
    svg.push('<ellipse cx="' + (caster2X - 2) + '" cy="' + caster2Y + '" rx="5.5" ry="7.5" fill="#090d16" stroke="#475569" stroke-width="1"/>');
    svg.push('<ellipse cx="' + (caster2X + 4) + '" cy="' + caster2Y + '" rx="5.5" ry="7.5" fill="#020409" stroke="#334155" stroke-width="1"/>');
    svg.push('<circle cx="' + caster2X + '" cy="' + caster2Y + '" r="2" fill="#cbd5e1"/>');
    // Right Leveling Foot
    svg.push('<line x1="' + (baseTR.x - 6) + '" y1="' + (baseTR.y + 12) + '" x2="' + (baseTR.x - 6) + '" y2="' + (baseTR.y + 24) + '" stroke="#cbd5e1" stroke-width="2.5"/>');
    svg.push('<rect x="' + (baseTR.x - 11) + '" y="' + (baseTR.y + 23) + '" width="10" height="4" rx="1" fill="#1e293b" stroke="#cbd5e1" stroke-width="0.8"/>');

    // Label at bottom
    svg.push('<text x="' + (originX + isoWidth / 2) + '" y="' + (svgHeight - 16) + '" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle" letter-spacing="1">3D AXONOMETRIC PERSPECTIVE (' + totalU + 'U ENCLOSURE)</text>');

    svg.push('</svg>');
    return svg.join('\n');
  }

  // Render all active views
  function renderAllViews() {
    var frontWrap = document.getElementById('rackFrontSvgContainer');
    var sideWrap = document.getElementById('rackSideSvgContainer');
    var threeDWrap = document.getElementById('rack3DSvgContainer');

    if (frontWrap) frontWrap.innerHTML = renderFrontRackSVG();
    if (sideWrap) sideWrap.innerHTML = renderSideRackSVG();
    if (threeDWrap) threeDWrap.innerHTML = render3DRackSVG();
  }

  // Select Device
  function selectRackDevice(id) {
    rackState.activeDeviceId = id;
    renderAllViews();
    renderDeviceListTable();

    var row = document.getElementById('devRow_' + id);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      row.classList.add('table-primary');
      setTimeout(function() { row.classList.remove('table-primary'); }, 2000);
    }
  }

  // Render Device List Table
  function renderDeviceListTable() {
    var tbody = document.getElementById('rackDeviceTableBody');
    if (!tbody) return;

    if (rackState.devices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted font-mono">No equipment placed in rack yet. Select a preset or use the "Add Equipment" form above!</td></tr>';
      return;
    }

    var sorted = rackState.devices.slice().sort(function(a, b) {
      return (b.uStart + b.uHeight) - (a.uStart + a.uHeight);
    });

    var html = '';
    sorted.forEach(function(dev) {
      var isSelected = (rackState.activeDeviceId === dev.id);
      var topU = dev.uStart + dev.uHeight - 1;
      var btu = dev.btuHr || Math.round(dev.powerWatts * WATTS_TO_BTU_HR);
      var thermalTier = getDeviceThermalTier(btu);

      var isTierFiltered = (rackState.thermalFilterTier && rackState.thermalFilterTier === thermalTier.tier);
      var rowClass = isSelected ? 'table-info fw-bold' : (isTierFiltered ? 'table-warning fw-semibold' : '');

      html += '<tr id="devRow_' + dev.id + '" class="' + rowClass + '" style="' + (isTierFiltered ? 'border-left: 4px solid ' + thermalTier.color + ';' : '') + '">';
      html += '<td class="font-mono text-center"><span class="badge bg-slate-800 text-info border border-info-subtle px-2 py-1">U' + dev.uStart + (dev.uHeight > 1 ? ('–' + topU) : '') + '</span></td>';
      html += '<td>';
      html += '<div class="d-flex align-items-center gap-2">';
      if (dev.customImageUrl) {
        html += '<img src="' + dev.customImageUrl + '" style="width:24px; height:14px; object-fit:cover; border-radius:2px; border:1px solid #38bdf8;" alt="faceplate">';
      } else {
        html += '<span class="badge" style="background:' + (dev.accentColor || '#38bdf8') + '; width:8px; height:8px; border-radius:50%; padding:0; display:inline-block;"></span>';
      }
      html += '<span class="fw-bold text-dark">' + escapeXml(dev.name) + '</span>';
      if (dev.customImageUrl) {
        html += '<span class="badge bg-info-subtle text-info border border-info-subtle font-mono px-1 py-0" style="font-size:0.62rem;">CUSTOM IMAGE</span>';
      }
      html += '</div>';
      html += '<div class="small text-muted font-mono" style="font-size:0.72rem;">' + dev.category.toUpperCase() + ' • ' + dev.uHeight + 'U (' + (dev.uHeight * EIA_1U_MM).toFixed(1) + 'mm) • ' + dev.depthMm + 'mm Depth</div>';
      html += '</td>';
      html += '<td class="font-mono text-center">' + dev.uHeight + 'U</td>';
      html += '<td class="font-mono text-center">' + dev.depthMm + ' mm</td>';
      html += '<td class="font-mono text-center text-primary fw-bold">' + dev.powerWatts + ' W</td>';
      html += '<td class="font-mono text-center">';
      html += '<span class="badge ' + thermalTier.badgeClass + ' font-mono px-2 py-0.5">' + btu.toLocaleString() + ' BTU/hr</span>';
      html += '<div class="font-mono text-muted" style="font-size:0.62rem;">' + thermalTier.label + '</div>';
      html += '</td>';
      html += '<td class="font-mono text-center text-secondary">' + dev.weightKg + ' kg</td>';
      html += '<td class="text-end text-nowrap">';
      html += '<div class="btn-group btn-group-xs">';
      html += '<button type="button" class="btn btn-outline-secondary btn-sm py-0 px-1.5" onclick="moveDeviceUp(\'' + dev.id + '\')" title="Move Up (Higher U)"><i class="fa-solid fa-arrow-up"></i></button>';
      html += '<button type="button" class="btn btn-outline-secondary btn-sm py-0 px-1.5" onclick="moveDeviceDown(\'' + dev.id + '\')" title="Move Down (Lower U)"><i class="fa-solid fa-arrow-down"></i></button>';
      html += '<button type="button" class="btn btn-outline-danger btn-sm py-0 px-1.5 ms-1" onclick="removeDevice(\'' + dev.id + '\')" title="Remove Device"><i class="fa-solid fa-trash-can"></i></button>';
      html += '</div>';
      html += '</td>';
      html += '</tr>';
    });

    tbody.innerHTML = html;
  }

  // Update Thermal Analytics & Real-Time Airflow Efficiency Indicator
  function updateThermalAnalytics() {
    var totalWatts = 0;
    var totalBtuHr = 0;
    var totalWeightKg = 0;
    var occupiedU = 0;

    var ventPanelsU = 0;
    var activeFansU = 0;
    var blockedU = 0;
    var chokedHotDevices = 0;

    rackState.devices.forEach(function(d) {
      totalWatts += (d.powerWatts || 0);
      var btu = d.btuHr || Math.round(d.powerWatts * WATTS_TO_BTU_HR);
      totalBtuHr += btu;
      totalWeightKg += (d.weightKg || 0);
      occupiedU += (d.uHeight || 1);

      if (d.category === 'blank') {
        ventPanelsU += d.uHeight;
      } else if (d.category === 'fan') {
        activeFansU += d.uHeight;
      } else {
        blockedU += d.uHeight;
        if (btu > 400) {
          var targetAboveU = d.uStart + d.uHeight;
          var devAbove = rackState.devices.find(function(o) { return o.uStart === targetAboveU; });
          if (devAbove && devAbove.category !== 'blank' && devAbove.category !== 'fan') {
            chokedHotDevices++;
          }
        }
      }
    });

    var totalU = rackState.totalU;
    var freeU = Math.max(0, totalU - occupiedU);
    var uPercent = Math.min(100, Math.round((occupiedU / totalU) * 100));

    // Ventilated U-space: free open U + vent panels + active motorized fans (convective boost factor 1.5)
    var ventilatedU = freeU + ventPanelsU + (activeFansU * 1.5);
    var totalVentilatedPhysicalU = freeU + ventPanelsU + activeFansU;

    // Direct ratio of Blocked U-space to Ventilated U-space
    var blockedToVentRatio = (totalVentilatedPhysicalU > 0)
      ? (blockedU / totalVentilatedPhysicalU).toFixed(2)
      : (blockedU > 0 ? 'Choked' : '0.00');

    // Airflow Efficiency Score (0-100%):
    var airflowScore = 100;
    if (totalU > 0) {
      var rawEfficiency = Math.round((ventilatedU / (totalU + (activeFansU * 0.5))) * 100);
      var penalty = chokedHotDevices * 10;
      airflowScore = Math.max(15, Math.min(100, rawEfficiency - penalty));
    }

    var targetDeltaTF = 20;
    var requiredCfm = Math.round(totalBtuHr / (1.08 * targetDeltaTF));

    var elTotalWatts = document.getElementById('rackStatTotalWatts');
    var elTotalBtu = document.getElementById('rackStatTotalBtu');
    var elRequiredCfm = document.getElementById('rackStatRequiredCfm');
    var elTotalWeight = document.getElementById('rackStatTotalWeight');
    var elOccupiedU = document.getElementById('rackStatOccupiedU');
    var elUProgress = document.getElementById('rackStatUProgressBar');

    // Airflow elements
    var elAirflowScore = document.getElementById('rackStatAirflowScore');
    var elAirflowBadge = document.getElementById('rackStatAirflowBadge');
    var elAirflowRatio = document.getElementById('rackStatAirflowRatio');
    var elAirflowProgressBar = document.getElementById('rackStatAirflowProgressBar');
    var elAirflowAdvice = document.getElementById('rackStatAirflowAdvice');
    var elLegendSummary = document.getElementById('rackLegendAirflowSummary');

    if (elTotalWatts) elTotalWatts.textContent = totalWatts.toLocaleString() + ' W (' + (totalWatts / 1000).toFixed(2) + ' kW)';
    if (elTotalBtu) elTotalBtu.textContent = totalBtuHr.toLocaleString() + ' BTU/hr';
    if (elRequiredCfm) elRequiredCfm.textContent = requiredCfm + ' CFM';
    if (elTotalWeight) elTotalWeight.textContent = totalWeightKg.toFixed(1) + ' kg (' + (totalWeightKg * 2.20462).toFixed(1) + ' lbs)';
    if (elOccupiedU) elOccupiedU.textContent = occupiedU + ' / ' + totalU + ' U (' + freeU + ' U free)';
    if (elUProgress) {
      elUProgress.style.width = uPercent + '%';
      elUProgress.textContent = uPercent + '% Occupied';
      if (uPercent > 90) {
        elUProgress.className = 'progress-bar bg-danger font-mono';
      } else if (uPercent > 70) {
        elUProgress.className = 'progress-bar bg-warning font-mono';
      } else {
        elUProgress.className = 'progress-bar bg-success font-mono';
      }
    }

    if (elAirflowScore) {
      elAirflowScore.textContent = airflowScore + '%';
      if (airflowScore >= 75) elAirflowScore.style.color = '#0d9488';
      else if (airflowScore >= 50) elAirflowScore.style.color = '#d97706';
      else elAirflowScore.style.color = '#dc2626';
    }

    if (elAirflowRatio) {
      elAirflowRatio.textContent = blockedU + 'U Block : ' + totalVentilatedPhysicalU + 'U Vent (' + blockedToVentRatio + ':1)';
      elAirflowRatio.title = 'Blocked U: ' + blockedU + 'U | Ventilated U (Free + Vents + Fans): ' + totalVentilatedPhysicalU + 'U | Ratio: ' + blockedToVentRatio + ':1';
    }

    if (elAirflowProgressBar) {
      elAirflowProgressBar.style.width = airflowScore + '%';
      if (airflowScore >= 75) {
        elAirflowProgressBar.className = 'progress-bar bg-success';
      } else if (airflowScore >= 50) {
        elAirflowProgressBar.className = 'progress-bar bg-warning';
      } else {
        elAirflowProgressBar.className = 'progress-bar bg-danger';
      }
    }

    if (elAirflowBadge) {
      if (airflowScore >= 75) {
        elAirflowBadge.className = 'badge bg-success-subtle text-success border border-success-subtle font-mono';
        elAirflowBadge.innerHTML = '<i class="fa-solid fa-circle-check me-1"></i>Optimal';
      } else if (airflowScore >= 50) {
        elAirflowBadge.className = 'badge bg-warning-subtle text-warning-emphasis border border-warning-subtle font-mono';
        elAirflowBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i>Moderate Flow';
      } else {
        elAirflowBadge.className = 'badge bg-danger-subtle text-danger border border-danger-subtle font-mono';
        elAirflowBadge.innerHTML = '<i class="fa-solid fa-fire-flame-curved me-1"></i>Choked Draft';
      }
    }

    if (elAirflowAdvice) {
      if (chokedHotDevices > 0) {
        elAirflowAdvice.innerHTML = '<span class="text-danger fw-bold"><i class="fa-solid fa-fire me-1"></i>' + chokedHotDevices + ' hot unit(s) choked!</span>';
      } else if (airflowScore >= 75) {
        elAirflowAdvice.innerHTML = '<span class="text-success"><i class="fa-solid fa-shield-halved me-1"></i>EIA/AVIXA Convection Compliant</span>';
      } else {
        elAirflowAdvice.innerHTML = 'Add 1U slotted vents for draft';
      }
    }

    if (elLegendSummary) {
      elLegendSummary.innerHTML = 'Airflow Efficiency: <strong class="' + (airflowScore >= 75 ? 'text-info' : (airflowScore >= 50 ? 'text-warning' : 'text-danger')) + '">' + airflowScore + '%</strong> &bull; ' + blockedU + 'U Blocked : ' + totalVentilatedPhysicalU + 'U Vent';
    }
  }

  // Clear All Devices
  function clearRackDevices() {
    if (confirm('Are you sure you want to clear all devices from the rack?')) {
      rackState.devices = [];
      rackState.activeDeviceId = null;
      renderAllViews();
      updateThermalAnalytics();
      renderDeviceListTable();
      updateRackSizeRecommendationBadge();
    }
  }

  // Export Rack Elevation SVG
  function downloadRackElevationSvg() {
    var svgEl = document.getElementById('svgFrontElevation') || document.getElementById('svgSideElevation') || document.getElementById('svg3DIsometric');
    if (!svgEl) return;
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svgEl);
    var blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'pro_av_rack_' + rackState.totalU + 'U_elevation.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function escapeXml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe.replace(/[<>&'"]/g, function(c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  // Public API
  window.RackDesign = {
    init: initRackDesignStudio,
    setRackTotalU: setRackTotalU,
    setRackDepth: setRackDepth,
    setRackViewMode: setRackViewMode,
    setScrewOptions: setScrewOptions,
    addDeviceToRack: addDeviceToRack,
    removeDevice: removeDevice,
    moveDeviceUp: moveDeviceUp,
    moveDeviceDown: moveDeviceDown,
    setDeviceUPosition: setDeviceUPosition,
    autoSortBTU: autoSortBTU,
    autoSortDevicesByThermalBTU: autoSortBTU,
    autoSetRackSizeToFit: autoSetRackSizeToFit,
    autoInsertThermalSpacers: autoInsertThermalSpacers,
    onSelectGlobalRackStandard: onSelectGlobalRackStandard,
    loadPresetIntoForm: loadPresetIntoForm,
    updateUHeightLabel: updateUHeightLabel,
    updateDepthLabel: updateDepthLabel,
    onPowerWattsChanged: onPowerWattsChanged,
    onBtuHrChanged: onBtuHrChanged,
    handleAddDeviceForm: handleAddDeviceForm,
    handleCustomImageUpload: handleCustomImageUpload,
    handleCustomImageUrl: handleCustomImageUrl,
    clearCustomImageSelection: clearCustomImageSelection,
    selectRackDevice: selectRackDevice,
    clearRackDevices: clearRackDevices,
    downloadRackElevationSvg: downloadRackElevationSvg,
    setRackThermalThreshold: setRackThermalThreshold,
    setThermalFilterTier: setThermalFilterTier,
    updateThermalLegendDisplay: updateThermalLegendDisplay,
    getDeviceThermalTier: getDeviceThermalTier,
    getState: function() { return rackState; },
    GLOBAL_RACK_STANDARDS: GLOBAL_RACK_STANDARDS
  };

  // Expose global wrapper functions for inline HTML event handlers
  window.setRackTotalU = setRackTotalU;
  window.setRackDepth = setRackDepth;
  window.setRackViewMode = setRackViewMode;
  window.setScrewOptions = setScrewOptions;
  window.moveDeviceUp = moveDeviceUp;
  window.moveDeviceDown = moveDeviceDown;
  window.removeDevice = removeDevice;
  window.selectRackDevice = selectRackDevice;
  window.autoSortBTU = autoSortBTU;
  window.autoSortDevicesByThermalBTU = autoSortBTU;
  window.autoSetRackSizeToFit = autoSetRackSizeToFit;
  window.autoInsertThermalSpacers = autoInsertThermalSpacers;
  window.onSelectGlobalRackStandard = onSelectGlobalRackStandard;
  window.loadPresetIntoForm = loadPresetIntoForm;
  window.updateUHeightLabel = updateUHeightLabel;
  window.updateDepthLabel = updateDepthLabel;
  window.onPowerWattsChanged = onPowerWattsChanged;
  window.onBtuHrChanged = onBtuHrChanged;
  window.handleAddDeviceForm = handleAddDeviceForm;
  window.handleCustomImageUpload = handleCustomImageUpload;
  window.handleCustomImageUrl = handleCustomImageUrl;
  window.clearCustomImageSelection = clearCustomImageSelection;
  window.clearRackDevices = clearRackDevices;
  window.downloadRackElevationSvg = downloadRackElevationSvg;
  window.setRackThermalThreshold = setRackThermalThreshold;
  window.setThermalFilterTier = setThermalFilterTier;
  window.updateThermalLegendDisplay = updateThermalLegendDisplay;
  window.getDeviceThermalTier = getDeviceThermalTier;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRackDesignStudio);
  } else {
    setTimeout(initRackDesignStudio, 50);
  }

})(window);
