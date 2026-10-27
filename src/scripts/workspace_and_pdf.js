// ==========================================================================
// PRO AV SYSTEM ARCHITECT - WORKSPACE, PRINT TO PDF & QR CODE MODULE
// ==========================================================================

var currentCloudProjectId = '';
var isRealtimeSyncActive = false;
var lastCloudSavedTimestamp = null;

function getCurrentActiveTabId() {
  var activeBtn = document.querySelector('.tab-container .tab-button.active');
  if (activeBtn) {
    var onclickAttr = activeBtn.getAttribute('onclick') || '';
    var match = onclickAttr.match(/openTab\([^,]+,\s*['"]([^'"]+)['"]\)/);
    if (match && match[1]) return match[1];
  }
  var activeContent = document.querySelector('.av-container > .tab-content[style*="display: block"], .av-container > .tab-content.tab-fade-active');
  if (activeContent && activeContent.id) return activeContent.id;
  if (window.location.hash) {
    var hashMatch = window.location.hash.match(/tab=([^&]+)/);
    if (hashMatch && hashMatch[1]) return hashMatch[1];
  }
  return 'Tab10';
}
window.getCurrentActiveTabId = getCurrentActiveTabId;

// Tab friendly metadata dictionary
var TAB_METADATA = {
  'Tab1': {
    title: 'Display & UC Space Studio',
    category: 'Video & Collaboration',
    description: 'AVIXA DISCAS image sizing, viewer distances (BDM/ADM), and FOV analytics.'
  },
  'Tab1_5': {
    title: 'Interactive Display Studio',
    category: 'Touch & Collaboration',
    description: 'Touch display reachability, ADA mounting standards, and sightline ergonomics.'
  },
  'Tab2': {
    title: 'LED Video Wall & Pitch',
    category: 'Direct-View LED',
    description: 'dvLED display array dimensions, pixel pitch, viewing distances, and power budget.'
  },
  'Tab2_5': {
    title: 'DV-LED Pitch & Global Array',
    category: 'dvLED Engineering',
    description: 'Multi-aspect ratio video wall matrix, thermal BTU dissipation, and structural loading.'
  },
  'Tab3': {
    title: 'Projector & Screen Studio',
    category: 'Projection',
    description: 'Optical throw ratio, laser brightness lumens, contrast ratios, and screen gain.'
  },
  'Tab4': {
    title: 'PTZ & Optical Camera Studio',
    category: 'Video Capture',
    description: 'Horizontal/Vertical FOV, optical zoom, focal length, and EN 62676-4 PPU acuity.'
  },
  'Tab5': {
    title: 'Speaker & Microphone Studio',
    category: 'Audio Engineering',
    description: 'SPL acoustic coverage, ceiling beamforming microphone lobes, SNR zones, and directivity Q.'
  },
  'Tab6': {
    title: 'Acoustic Room Design Studio',
    category: 'Architectural Acoustics',
    description: 'Sabine RT60 reverberation decay, surface absorption coefficients, and critical distance.'
  },
  'Tab7': {
    title: 'AV Designs & Standard Angles',
    category: 'Standards & Architecture',
    description: 'Recommended standard commercial display sizes, ceiling clearances, and off-axis sightlines.'
  },
  'Tab8': {
    title: 'Gen Calculator & Math Suite',
    category: 'Engineering Utilities',
    description: 'Audio dBu/dBV levels, Ohm\'s law power conversions, and aspect ratio geometric math.'
  },
  'Tab9': {
    title: 'Cable & Connectors Guide',
    category: 'Infrastructure & RF',
    description: 'Coaxial & digital signal attenuation, RF antenna diversity spacing, and link budget calculations.'
  },
  'Tab10': {
    title: 'Spatial Room Matrix & Equipment',
    category: 'Facility Architecture',
    description: 'Enterprise room schedule, seating capacity, area rollups, and equipment BOM matrices.'
  }
};

// ==========================================================================
// 1. PRINT TO PDF FEATURE WITH ORIENTATION MODAL & HCMM WATERMARK
// ==========================================================================

function openPrintPdfModal(targetType) {
  targetType = targetType || 'tab';
  var targetInput = document.getElementById('pdfModalTargetType');
  if (targetInput) targetInput.value = targetType;

  var targetTitleEl = document.getElementById('pdfModalTargetTitle');
  if (targetTitleEl) {
    if (targetType === 'matrix') {
      var projName = document.getElementById('matrixProjectNameInput')?.value || 'Spatial Room Matrix';
      targetTitleEl.innerText = `${projName} (Schedule)`;
    } else if (targetType === 'acoustic') {
      targetTitleEl.innerText = 'Acoustic RT60 Design Analysis';
    } else {
      var tabId = getCurrentActiveTabId();
      var meta = (typeof TAB_METADATA !== 'undefined' && TAB_METADATA[tabId]) ? TAB_METADATA[tabId] : { title: tabId };
      targetTitleEl.innerText = `${meta.title}`;
    }
  }

  // Pre-select appropriate orientation
  if (targetType === 'matrix') {
    selectPdfOrientation('landscape');
  } else {
    var lastSel = document.getElementById('pdfSelectedOrientation')?.value;
    selectPdfOrientation(lastSel === 'landscape' ? 'landscape' : 'portrait');
  }

  var modalEl = document.getElementById('pdfOrientationModal');
  if (!modalEl) {
    generateCurrentTabPdfReport('portrait');
    return;
  }

  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    var bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    bsModal.show();
  } else {
    modalEl.classList.add('show');
    modalEl.style.display = 'block';
  }
}

function closePrintPdfModal() {
  var modalEl = document.getElementById('pdfOrientationModal');
  if (!modalEl) return;
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
  }
  modalEl.classList.remove('show');
  modalEl.style.display = 'none';
  var backdrop = document.querySelector('.modal-backdrop');
  if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
}

function selectPdfOrientation(orientation) {
  orientation = (orientation === 'landscape') ? 'landscape' : 'portrait';
  var hiddenInput = document.getElementById('pdfSelectedOrientation');
  if (hiddenInput) hiddenInput.value = orientation;

  var cardPortrait = document.getElementById('pdfCardPortrait');
  var cardLandscape = document.getElementById('pdfCardLandscape');
  var checkPortrait = document.getElementById('pdfCheckPortrait');
  var checkLandscape = document.getElementById('pdfCheckLandscape');

  if (cardPortrait && cardLandscape) {
    if (orientation === 'portrait') {
      cardPortrait.style.borderColor = '#3b82f6';
      cardPortrait.style.backgroundColor = '#141c2e';
      cardPortrait.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.4)';
      if (checkPortrait) checkPortrait.classList.remove('d-none');

      cardLandscape.style.borderColor = '#334155';
      cardLandscape.style.backgroundColor = '#0f172a';
      cardLandscape.style.boxShadow = 'none';
      if (checkLandscape) checkLandscape.classList.add('d-none');
    } else {
      cardLandscape.style.borderColor = '#3b82f6';
      cardLandscape.style.backgroundColor = '#141c2e';
      cardLandscape.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.4)';
      if (checkLandscape) checkLandscape.classList.remove('d-none');

      cardPortrait.style.borderColor = '#334155';
      cardPortrait.style.backgroundColor = '#0f172a';
      cardPortrait.style.boxShadow = 'none';
      if (checkPortrait) checkPortrait.classList.add('d-none');
    }
  }
}

function executePdfGenerationWithOrientation() {
  var orientation = document.getElementById('pdfSelectedOrientation')?.value || 'portrait';
  var targetType = document.getElementById('pdfModalTargetType')?.value || 'tab';
  closePrintPdfModal();

  if (targetType === 'matrix') {
    if (typeof window.exportToPDF === 'function') {
      window.exportToPDF(orientation);
    }
  } else if (targetType === 'acoustic') {
    if (typeof window.exportAcousticReportToPDF === 'function') {
      window.exportAcousticReportToPDF(orientation);
    }
  } else {
    generateCurrentTabPdfReport(orientation);
  }
}

function generateCurrentTabPdfReport(orientation) {
  if (typeof html2pdf === 'undefined') {
    alert('PDF generator library is initializing. Please wait a second and retry.');
    return;
  }

  // If no valid orientation is provided, open orientation selection modal
  if (!orientation || (orientation !== 'portrait' && orientation !== 'landscape')) {
    openPrintPdfModal('tab');
    return;
  }

  var isLandscape = (orientation === 'landscape');
  var tabId = getCurrentActiveTabId();
  var data = extractActiveTabReportData(tabId);

  // Show status feedback
  var toastNotice = document.getElementById('pdfGeneratingToast');
  if (!toastNotice) {
    toastNotice = document.createElement('div');
    toastNotice.id = 'pdfGeneratingToast';
    toastNotice.className = 'position-fixed bottom-0 start-50 translate-middle-x p-3';
    toastNotice.style.zIndex = '10500';
    toastNotice.innerHTML = `
      <div class="toast show align-items-center text-white bg-dark border-0 shadow-lg px-3 py-2" role="alert">
        <div class="d-flex align-items-center gap-2">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          <div>Generating professional ${isLandscape ? 'Landscape' : 'Portrait'} PDF report with <strong>HCMM Watermark</strong> for <strong>${data.meta.title}</strong>...</div>
        </div>
      </div>
    `;
    document.body.appendChild(toastNotice);
  } else {
    toastNotice.style.display = 'block';
  }

  // Construct clean, print-optimized document DOM with HCMM watermark
  var reportContainer = document.createElement('div');
  reportContainer.id = 'tempPdfRenderRoot';
  reportContainer.style.position = 'relative';
  reportContainer.style.overflow = 'hidden';
  reportContainer.style.width = isLandscape ? '1060px' : '780px';
  reportContainer.style.maxWidth = isLandscape ? '1060px' : '780px';
  reportContainer.style.padding = isLandscape ? '22px 30px' : '24px 32px';
  reportContainer.style.backgroundColor = '#ffffff';
  reportContainer.style.color = '#0f172a';
  reportContainer.style.fontFamily = 'Inter, Arial, Helvetica, sans-serif';
  reportContainer.style.fontSize = isLandscape ? '11.5px' : '12px';
  reportContainer.style.lineHeight = '1.45';

  var inputsHtml = data.inputs.map(function(item, idx) {
    var bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    return `
      <tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 7px 12px; font-weight: 600; color: #334155; width: 55%;">${item.label}</td>
        <td style="padding: 7px 12px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #0284c7; width: 45%;">${item.value}</td>
      </tr>
    `;
  }).join('');

  var resultsHtml = data.results.map(function(item, idx) {
    var bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    var badgeColor = '#059669'; // Green
    if (item.status === 'INFO') badgeColor = '#2563eb';
    if (item.status === 'OPTIMAL') badgeColor = '#0284c7';
    if (item.status === 'WARNING') badgeColor = '#d97706';

    return `
      <tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-weight: 600; color: #1e293b; width: 50%;">${item.label}</td>
        <td style="padding: 8px 12px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #0f172a; width: 35%; font-size: 13px;">${item.value}</td>
        <td style="padding: 8px 12px; text-align: right; width: 15%;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; background-color: ${badgeColor}; color: #ffffff; text-transform: uppercase;">${item.status || 'VERIFIED'}</span>
        </td>
      </tr>
    `;
  }).join('');

  reportContainer.innerHTML = `
    <!-- Prominent HCMM Diagonal Background Watermark -->
    <div style="position: absolute; top: 46%; left: 50%; transform: translate(-50%, -50%) rotate(-28deg); font-size: ${isLandscape ? '160px' : '125px'}; font-weight: 900; color: rgba(15, 23, 42, 0.08); letter-spacing: 24px; font-family: 'Inter', Arial, sans-serif; pointer-events: none; z-index: 0; user-select: none; white-space: nowrap;">
      HCMM
    </div>

    <!-- Top Corporate Engineering Header with HCMM Badge -->
    <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; position: relative; z-index: 2;">
      <div>
        <div style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px;">
          <span>PRO AV SYSTEM ARCHITECT</span>
          <span style="font-size: 10px; font-weight: 800; color: #dc2626; border: 1.5px solid #dc2626; border-radius: 4px; padding: 2px 8px; background: #fef2f2; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px;">
            WATERMARK: HCMM
          </span>
        </div>
        <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #2563eb; letter-spacing: 1px; margin-top: 2px;">
          Engineering Calculation &amp; Spatial Specification Report &bull; ${orientation.toUpperCase()}
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 11px; color: #64748b; font-weight: 500;">DOCUMENT REF</div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #0f172a;">${tabId.toUpperCase()}-HCMM-${Date.now().toString(36).toUpperCase()}</div>
      </div>
    </div>

    <!-- Metadata Matrix Banner -->
    <div style="background-color: #f1f5f9; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: ${isLandscape ? '1.2fr 1fr 1fr 0.9fr' : '1.2fr 1fr 1fr'}; gap: 12px; border: 1px solid #cbd5e1; position: relative; z-index: 2;">
      <div>
        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">PROJECT TITLE</div>
        <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${data.projName}</div>
      </div>
      <div>
        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">ACTIVE MODULE / TAB</div>
        <div style="font-size: 13px; font-weight: 700; color: #2563eb; margin-top: 2px;">${data.meta.title}</div>
      </div>
      <div>
        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">LEAD DESIGNER &amp; DATE</div>
        <div style="font-size: 12px; font-weight: 600; color: #334155; margin-top: 2px;">${data.author} • ${data.timestamp}</div>
      </div>
      ${isLandscape ? `
      <div>
        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">SECURITY WATERMARK</div>
        <div style="font-size: 12px; font-weight: 800; color: #dc2626; margin-top: 2px; font-family: 'JetBrains Mono', monospace;">HCMM CERTIFIED</div>
      </div>
      ` : ''}
    </div>

    <!-- Sections Layout: Stamped with HCMM -->
    <div style="position: relative; z-index: 2;">
      <!-- Section 1: Inputs & Design Constraints -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-left: 4px solid #0284c7; padding-left: 8px;">
          1. Design Parameters &amp; Spatial Inputs
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden;">
          <thead>
            <tr style="background-color: #e2e8f0; text-align: left;">
              <th style="padding: 7px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569;">Parameter</th>
              <th style="padding: 7px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569;">Configured Specification</th>
            </tr>
          </thead>
          <tbody>
            ${inputsHtml}
          </tbody>
        </table>
      </div>

      <!-- Section 2: Calculated Engineering Results -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-left: 4px solid #059669; padding-left: 8px;">
          2. Computed Engineering Results &amp; Performance Matrix
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden;">
          <thead>
            <tr style="background-color: #e2e8f0; text-align: left;">
              <th style="padding: 7px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569;">Metric</th>
              <th style="padding: 7px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569;">Calculated Output</th>
              <th style="padding: 7px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; text-align: right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${resultsHtml}
          </tbody>
        </table>
      </div>

      <!-- Section 3: Compliance & Engineering Signoff -->
      <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px;">
        <div style="font-size: 11px; font-weight: 700; color: #6b21a8; text-transform: uppercase;">
          Applied Industry Standards &amp; Compliance References
        </div>
        <div style="font-size: 11px; color: #4c1d95; margin-top: 4px; line-height: 1.4;">
          ${data.standards}
        </div>
      </div>
    </div>

    <!-- Footer with HCMM Watermark Note -->
    <div style="border-top: 1px solid #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; position: relative; z-index: 2;">
      <div>Pro AV System Architect Suite • Verified by Architectural Math Engine</div>
      <div style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #dc2626;">HCMM CONFIDENTIAL SPECIFICATION • [WATERMARK: HCMM]</div>
      <div>Orientation: ${orientation.toUpperCase()} • Page 1 of 1</div>
    </div>
  `;

  document.body.appendChild(reportContainer);

  var opt = {
    margin: isLandscape ? [6, 6, 6, 6] : [8, 8, 8, 8],
    filename: `${data.projName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${tabId}_HCMM_${orientation.toUpperCase()}_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: orientation }
  };

  html2pdf().set(opt).from(reportContainer).save().then(function() {
    if (toastNotice) toastNotice.style.display = 'none';
    if (reportContainer.parentNode) reportContainer.parentNode.removeChild(reportContainer);
  }).catch(function(err) {
    console.error('PDF generation error:', err);
    if (toastNotice) toastNotice.style.display = 'none';
    if (reportContainer.parentNode) reportContainer.parentNode.removeChild(reportContainer);
    alert('PDF creation completed or print dialogue opened.');
  });
}

// ==========================================================================
// 2. TAB QR GENERATOR (Attached Directly Below Button in Header Toolbar)
// ==========================================================================

function toggleCurrentTabQrPopup(evt, specifiedTabId) {
  if (evt && evt.stopPropagation) evt.stopPropagation();
  var popup = document.getElementById('tabQrCodePopup');
  var otherPopup = document.getElementById('sharedWorkspacePopup');
  if (otherPopup) otherPopup.style.display = 'none';

  if (!popup) return;
  var isCurrentlyOpen = popup.style.display === 'block';
  if (isCurrentlyOpen && !specifiedTabId) {
    popup.style.display = 'none';
    return;
  }

  popup.style.display = 'block';
  updateCurrentTabQrView(specifiedTabId);
}

function updateCurrentTabQrView(specifiedTabId) {
  var tabId = specifiedTabId || getCurrentActiveTabId();
  var meta = TAB_METADATA[tabId] || { title: tabId, category: 'AV Module', description: 'AV calculation studio module' };

  var modalTitle = document.getElementById('currentTabQrModalTitle');
  if (modalTitle) modalTitle.innerText = `${meta.title} (${tabId})`;

  var tabDesc = document.getElementById('currentTabQrModalDesc');
  if (tabDesc) tabDesc.innerText = meta.description;

  var tabSelect = document.getElementById('qrModalTabSelector');
  if (tabSelect && tabSelect.value !== tabId) tabSelect.value = tabId;

  // Build target URL
  var baseUrl = window.location.origin + window.location.pathname;
  var mobileUrl = `${baseUrl}#tab=${tabId}` + (currentCloudProjectId ? `&project=${currentCloudProjectId}` : '');

  var urlInput = document.getElementById('currentTabQrUrlInput');
  if (urlInput) urlInput.value = mobileUrl;

  var canvas = document.getElementById('currentTabQrCanvas');
  if (canvas) {
    if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
      QRCode.toCanvas(canvas, mobileUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      }, function(err) {
        if (err) renderTabQrFallback(canvas, mobileUrl);
      });
    } else {
      renderTabQrFallback(canvas, mobileUrl);
    }
  }
}

function openCurrentTabQrModal(specifiedTabId) {
  toggleCurrentTabQrPopup(null, specifiedTabId);
}

function renderTabQrFallback(canvas, mobileUrl) {
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#334155';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Loading QR Code...', 100, 95);

  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    ctx.clearRect(0, 0, 200, 200);
    ctx.drawImage(img, 0, 0, 200, 200);
  };
  img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(mobileUrl);
}

function copyCurrentTabQrUrl() {
  var urlInput = document.getElementById('currentTabQrUrlInput');
  if (!urlInput) return;
  urlInput.select();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(urlInput.value).then(function() {
      alert('✓ Direct Tab URL copied to clipboard! Ready to share with team members or open on mobile.');
    });
  } else {
    document.execCommand('copy');
    alert('✓ Direct Tab URL copied to clipboard!');
  }
}

function downloadCurrentTabQrImage() {
  var canvas = document.getElementById('currentTabQrCanvas');
  if (!canvas) return;
  var tabId = getCurrentActiveTabId();
  var link = document.createElement('a');
  link.download = `ProAV_${tabId}_Mobile_QR.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================================================
// 3. SHARED PROJECT WORKSPACE (Attached Directly Below Button in Header)
// ==========================================================================

function toggleSharedWorkspacePopup(evt) {
  if (evt && evt.stopPropagation) evt.stopPropagation();
  var popup = document.getElementById('sharedWorkspacePopup');
  var otherPopup = document.getElementById('tabQrCodePopup');
  if (otherPopup) otherPopup.style.display = 'none';

  if (!popup) return;
  var isCurrentlyOpen = popup.style.display === 'block';
  if (isCurrentlyOpen) {
    popup.style.display = 'none';
    return;
  }

  popup.style.display = 'block';

  var idInput = document.getElementById('cloudProjectIdInput');
  if (idInput && !idInput.value && !currentCloudProjectId) {
    // Generate an ergonomic project ID
    idInput.value = 'PROJ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  } else if (idInput && currentCloudProjectId) {
    idInput.value = currentCloudProjectId;
  }

  var nameInput = document.getElementById('cloudProjectNameInput');
  var curName = document.getElementById('matrixProjectNameInput')?.value;
  if (nameInput && curName) {
    nameInput.value = curName;
  }

  // Refresh recent projects from Firestore
  refreshCloudProjectsList();
}

function openSharedWorkspaceModal() {
  toggleSharedWorkspacePopup(null);
}

function closeHeaderPopups() {
  var p1 = document.getElementById('tabQrCodePopup');
  var p2 = document.getElementById('sharedWorkspacePopup');
  if (p1) p1.style.display = 'none';
  if (p2) p2.style.display = 'none';
}

// Global click outside to close popups
document.addEventListener('click', function(e) {
  var p1 = document.getElementById('tabQrCodePopup');
  var p2 = document.getElementById('sharedWorkspacePopup');
  var w1 = document.getElementById('tabQrCodeDropdownWrapper');
  var w2 = document.getElementById('sharedWorkspaceDropdownWrapper');

  if (p1 && p1.style.display === 'block' && w1 && !w1.contains(e.target)) {
    p1.style.display = 'none';
  }
  if (p2 && p2.style.display === 'block' && w2 && !w2.contains(e.target)) {
    p2.style.display = 'none';
  }
});

// ESC key listener to close header popups
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeHeaderPopups();
  }
});

// Debounce helper for smooth auto-saving without thread blocking
function debounce(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      func.apply(context, args);
    }, wait);
  };
}

var debouncedSaveCurrentProjectToCloud = debounce(function() {
  saveCurrentProjectToCloud(true);
}, 1200);

function triggerAutoSave() {
  var autoSaveIndicator = document.getElementById('cloudAutoSaveIndicator');
  var autoSaveText = document.getElementById('cloudAutoSaveText');
  if (autoSaveText) autoSaveText.innerText = 'Pending Auto-save...';
  if (autoSaveIndicator) {
    autoSaveIndicator.className = 'badge bg-warning text-dark border border-warning font-mono py-1 px-2';
  }
  debouncedSaveCurrentProjectToCloud();
}

async function saveCurrentProjectToCloud(isAutoSave = false) {
  var ws = window.FirebaseWorkspace;
  if (!ws) {
    if (!isAutoSave) alert('Firebase Workspace is initializing. Please retry in a few seconds.');
    return;
  }

  var idInput = document.getElementById('cloudProjectIdInput');
  var projectId = (idInput?.value || currentCloudProjectId || '').trim();
  if (!projectId) {
    projectId = 'PROJ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    if (idInput) idInput.value = projectId;
  }

  var name = document.getElementById('cloudProjectNameInput')?.value.trim() ||
             document.getElementById('matrixProjectNameInput')?.value.trim() ||
             'Pro AV Engineering Facility';
  var author = document.getElementById('cloudAuthorInput')?.value.trim() || 'AV Designer';
  var notes = document.getElementById('cloudNotesInput')?.value.trim() || '';

  // Collect room matrix schedule data
  var matrixData = typeof getMatrixCurrentProjectData === 'function' ? getMatrixCurrentProjectData() : { rooms: [] };
  var activeTabId = getCurrentActiveTabId();

  var saveBtn = document.getElementById('btnSaveCloudProject');
  var autoSaveIndicator = document.getElementById('cloudAutoSaveIndicator');
  var autoSaveText = document.getElementById('cloudAutoSaveText');

  if (isAutoSave) {
    if (autoSaveText) autoSaveText.innerText = 'Syncing to Cloud...';
    if (autoSaveIndicator) {
      autoSaveIndicator.className = 'badge bg-info text-dark border border-info font-mono py-1 px-2';
    }
  } else {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving to Cloud...';
    }
  }

  try {
    var saved = await ws.saveProject({
      id: projectId,
      name: name,
      author: author,
      rooms: JSON.stringify(matrixData.rooms || []),
      activeTab: activeTabId,
      notes: notes,
      updatedAt: new Date().toISOString()
    });

    currentCloudProjectId = saved.id;
    lastCloudSavedTimestamp = new Date();

    // Update UI Indicators
    updateCloudWorkspaceStatusBadge(true, saved.id);

    var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (autoSaveText) autoSaveText.innerText = `Auto-saved (${timeStr})`;
    if (autoSaveIndicator) {
      autoSaveIndicator.className = 'badge bg-success text-white border border-success font-mono py-1 px-2';
      autoSaveIndicator.title = `Last auto-saved to Firebase Firestore at ${timeStr} (ID: ${saved.id})`;
    }

    // Refresh modal list
    refreshCloudProjectsList();

    if (!isAutoSave) {
      alert(`✓ Project "${saved.name}" successfully saved to Firebase Firestore Cloud!\nProject ID: ${saved.id}\nTeam members can now collaborate on this design simultaneously.`);
    }
  } catch (error) {
    console.error('Failed to save to Firebase:', error);
    if (autoSaveText) autoSaveText.innerText = 'Auto-save failed';
    if (autoSaveIndicator) {
      autoSaveIndicator.className = 'badge bg-danger text-white border border-danger font-mono py-1 px-2';
    }
    if (!isAutoSave) {
      alert('Error saving project to Firebase: ' + (error.message || String(error)));
    }
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up me-1"></i>Save & Sync to Cloud';
    }
  }
}

async function loadProjectFromCloud(targetProjectId) {
  var ws = window.FirebaseWorkspace;
  if (!ws) {
    alert('Firebase Workspace is initializing. Please wait a moment.');
    return;
  }

  var projectId = (targetProjectId || document.getElementById('cloudProjectIdInput')?.value || '').trim();
  if (!projectId) {
    alert('Please enter or select a Project ID to load.');
    return;
  }

  var loadBtn = document.getElementById('btnLoadCloudProject');
  if (loadBtn) {
    loadBtn.disabled = true;
    loadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Loading...';
  }

  try {
    var project = await ws.getProject(projectId);
    if (!project) {
      alert(`No project found in Firebase with ID "${projectId}".`);
      return;
    }

    applyProjectDataToApp(project);
    currentCloudProjectId = project.id;
    updateCloudWorkspaceStatusBadge(true, project.id);

    // Update form fields
    var idInput = document.getElementById('cloudProjectIdInput');
    if (idInput) idInput.value = project.id;
    var nameInput = document.getElementById('cloudProjectNameInput');
    if (nameInput) nameInput.value = project.name;
    var authorInput = document.getElementById('cloudAuthorInput');
    if (authorInput) authorInput.value = project.author || '';
    var notesInput = document.getElementById('cloudNotesInput');
    if (notesInput) notesInput.value = project.notes || '';

    // If real-time sync is enabled, attach listener
    var syncToggle = document.getElementById('cloudRealtimeSyncToggle');
    if (syncToggle && syncToggle.checked) {
      enableRealtimeProjectListener(project.id);
    }

    alert(`✓ Project "${project.name}" (ID: ${project.id}) loaded from Firebase Firestore!`);

    var modalEl = document.getElementById('sharedWorkspaceModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      var modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
  } catch (error) {
    console.error('Failed to load project from Firebase:', error);
    alert('Error loading project: ' + (error.message || String(error)));
  } finally {
    if (loadBtn) {
      loadBtn.disabled = false;
      loadBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down me-1"></i>Load Project';
    }
  }
}

function applyProjectDataToApp(project) {
  // Update Project Title
  var pInp = document.getElementById('matrixProjectNameInput');
  if (pInp && project.name) pInp.value = project.name;

  // Parse rooms array
  var rooms = [];
  try {
    rooms = typeof project.rooms === 'string' ? JSON.parse(project.rooms) : (project.rooms || []);
  } catch (e) {
    rooms = [];
  }

  if (Array.isArray(rooms) && rooms.length > 0 && typeof addRoomRowWithData === 'function') {
    var tbody = document.getElementById('matrixTableBody');
    if (tbody) tbody.innerHTML = '';
    window.roomRowsCount = 0;

    rooms.forEach(function(r) {
      addRoomRowWithData({
        floor: r.floor || r.fl || '01',
        name: r.name || 'Room',
        qty: parseInt(r.qty) || 1,
        seats: parseInt(r.seats) || 10,
        l: parseFloat(r.l || r.lm) || 7000,
        w: parseFloat(r.w || r.wm) || 5000,
        h: parseFloat(r.h || r.hm) || 2700,
        purpose: r.purpose || 'meeting',
        pitch: parseFloat(r.pitch) || 1.25,
        dispQty: r.dispQty !== undefined ? parseInt(r.dispQty) : 1,
        spkSize: r.spkSize || '6.5"',
        spkQty: r.spkQty !== undefined ? parseInt(r.spkQty) : undefined,
        spkExtraQty: r.spkExtraQty !== undefined ? parseInt(r.spkExtraQty) : 0,
        spkPos: r.spkPos || 'ceiling',
        camD1: r.camD1,
        camWspan: r.camWspan,
        camModel: r.camModel || 'auto',
        camPos: r.camPos || 'above',
        camQty: r.camQty !== undefined ? parseInt(r.camQty) : undefined,
        camExtraQty: r.camExtraQty !== undefined ? parseInt(r.camExtraQty) : 0,
        camZoomFactor: r.camZoomFactor,
        camFraming: r.camFraming || 'auto',
        videoBar: r.videoBar || 'auto',
        barPos: r.barPos || 'below',
        barQty: r.barQty !== undefined ? parseInt(r.barQty) : undefined,
        micType: r.micType || 'auto',
        micQty: r.micQty !== undefined ? parseInt(r.micQty) : undefined,
        micExtraQty: r.micExtraQty !== undefined ? parseInt(r.micExtraQty) : 0,
        micPos: r.micPos || 'ceiling',
        note: r.note || '',
        color: r.color || '#ffffff'
      });
    });

    if (typeof updateMatrixTotalsAndSummary === 'function') {
      updateMatrixTotalsAndSummary();
    }
  }

  // Switch to saved tab
  if (project.activeTab && typeof openTab === 'function') {
    openTab(null, project.activeTab);
  }
}

function enableRealtimeProjectListener(projectId) {
  var ws = window.FirebaseWorkspace;
  if (!ws || !projectId) return;

  isRealtimeSyncActive = true;
  ws.subscribeToProject(projectId, function(updatedProject) {
    // Only apply if updatedAt is newer than local
    if (!lastCloudSavedTimestamp || new Date(updatedProject.updatedAt) > lastCloudSavedTimestamp) {
      applyProjectDataToApp(updatedProject);
      showLiveSyncToast(updatedProject.author || 'Team Member', updatedProject.name);
    }
  });

  updateCloudWorkspaceStatusBadge(true, projectId);
}

function showLiveSyncToast(author, projName) {
  var toastEl = document.getElementById('liveSyncNoticeToast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'liveSyncNoticeToast';
    toastEl.className = 'position-fixed bottom-0 end-0 p-3';
    toastEl.style.zIndex = '10600';
    toastEl.innerHTML = `
      <div class="toast show text-white bg-success border-0 shadow-lg" role="alert">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="fa-solid fa-arrows-rotate fa-spin"></i>
          <div>Live Cloud Update received from <strong>${author}</strong> for <em>${projName}</em>.</div>
        </div>
      </div>
    `;
    document.body.appendChild(toastEl);
  } else {
    toastEl.style.display = 'block';
  }
  setTimeout(function() {
    if (toastEl) toastEl.style.display = 'none';
  }, 4000);
}

function updateCloudWorkspaceStatusBadge(isConnected, projId) {
  var badge = document.getElementById('workspaceSyncBadge');
  if (badge) {
    if (isConnected && projId) {
      badge.className = 'badge bg-success ms-1';
      badge.innerHTML = `<i class="fa-solid fa-cloud"></i> ${projId}`;
      badge.title = `Connected to Firebase Cloud: ${projId}`;
    } else {
      badge.className = 'badge bg-secondary ms-1';
      badge.innerHTML = '<i class="fa-solid fa-cloud"></i> Cloud';
    }
  }
}

// ==========================================
// FIRESTORE CLOUD PROJECTS LIST & REAL-TIME FILTER
// ==========================================
var cachedCloudProjects = [];

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightMatch(text, query) {
  if (!text) return '';
  var escaped = escapeHtml(text);
  if (!query || !query.trim()) return escaped;
  var safeQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var regex = new RegExp('(' + safeQuery + ')', 'gi');
  return escaped.replace(regex, '<mark class="bg-warning text-dark px-1 py-0 rounded fw-bold">$1</mark>');
}

// Hash a string to a consistent 32-bit integer
function hashString(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Generate a visual thumbnail SVG derived from a hash of the project's room data
function generateProjectThumbnailSvg(project) {
  var rooms = [];
  try {
    rooms = typeof project.rooms === 'string' ? JSON.parse(project.rooms) : (project.rooms || []);
  } catch (e) {
    rooms = [];
  }

  var roomCount = rooms.length;
  var hashSeed = Math.abs(hashString((project.id || '') + (project.name || '') + JSON.stringify(rooms)));

  // Generate pleasant visual colors based on hash
  var hues = [210, 160, 260, 35, 340, 190, 280]; // Primary, emerald, purple, amber, rose, cyan, violet
  var baseHue = hues[hashSeed % hues.length];
  var altHue = hues[(hashSeed + 3) % hues.length];

  var bgGradStart = `hsl(${baseHue}, 70%, 15%)`;
  var bgGradEnd = `hsl(${altHue}, 65%, 8%)`;
  var roomColor1 = `hsl(${baseHue}, 80%, 60%)`;
  var roomColor2 = `hsl(${altHue}, 85%, 65%)`;

  // Draw a miniature architectural floorplan / matrix footprint
  var rectsSvg = '';
  if (roomCount === 0) {
    rectsSvg = `
      <rect x="6" y="6" width="36" height="24" rx="2" fill="${roomColor1}" fill-opacity="0.25" stroke="${roomColor1}" stroke-width="1"/>
      <line x1="6" y1="18" x2="42" y2="18" stroke="${roomColor1}" stroke-width="0.8" stroke-dasharray="2,2"/>
    `;
  } else {
    var maxDisplay = Math.min(6, roomCount);
    for (var i = 0; i < maxDisplay; i++) {
      var r = rooms[i] || {};
      var rSeed = Math.abs(hashString(r.name || ('R' + i) + (r.w || '') + (r.l || '')));
      var rx = 5 + (i % 3) * 13;
      var ry = 5 + Math.floor(i / 3) * 13;
      var rw = 10 + (rSeed % 3);
      var rh = 9 + ((rSeed >> 2) % 3);
      var rCol = (i % 2 === 0) ? roomColor1 : roomColor2;
      rectsSvg += `
        <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="1.5" fill="${rCol}" fill-opacity="0.35" stroke="${rCol}" stroke-width="0.9"/>
      `;
    }
  }

  return `
    <svg width="48" height="34" viewBox="0 0 48 34" xmlns="http://www.w3.org/2000/svg" style="border-radius:4px; border:1px solid rgba(255,255,255,0.12); flex-shrink:0;">
      <defs>
        <linearGradient id="thmbGrad_${hashSeed}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgGradStart}"/>
          <stop offset="100%" stop-color="${bgGradEnd}"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="48" height="34" fill="url(#thmbGrad_${hashSeed})"/>
      ${rectsSvg}
      <text x="44" y="30" font-size="7" font-family="'JetBrains Mono', monospace" font-weight="bold" fill="#ffffff" text-anchor="end" opacity="0.8">${roomCount}R</text>
    </svg>
  `;
}

// Duplicate an existing saved project to a new Project ID
async function duplicateCloudProject(sourceProjectId) {
  var ws = window.FirebaseWorkspace;
  if (!ws) {
    alert('Firebase Workspace is initializing. Please wait a moment.');
    return;
  }

  try {
    var sourceProj = await ws.getProject(sourceProjectId);
    if (!sourceProj) {
      alert(`Source project "${sourceProjectId}" could not be found.`);
      return;
    }

    var newId = 'PROJ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    var newName = (sourceProj.name || 'Project') + ' (Clone)';
    var newAuthor = sourceProj.author || 'Lead AV Engineer';

    var cloned = await ws.saveProject({
      id: newId,
      name: newName,
      author: newAuthor,
      rooms: sourceProj.rooms || '[]',
      activeTab: sourceProj.activeTab || 'Tab10',
      notes: (sourceProj.notes || '') ? (sourceProj.notes + ' [Cloned from ' + sourceProjectId + ']') : ('Cloned from ' + sourceProjectId),
      updatedAt: new Date().toISOString()
    });

    // Refresh list and select new project
    await refreshCloudProjectsList();

    alert(`✓ Project duplicated successfully!\nNew Project ID: ${cloned.id}\nTitle: "${cloned.name}"\nYou can now iterate independently on this clone.`);
  } catch (err) {
    console.error('Error duplicating project:', err);
    alert('Failed to duplicate project: ' + (err.message || String(err)));
  }
}

function renderCloudProjectsTable(projects, filterQuery) {
  var container = document.getElementById('cloudProjectsListContainer');
  if (!container) return;

  var q = (filterQuery || '').trim().toLowerCase();
  var allList = projects || [];
  var filtered = allList;

  if (q) {
    filtered = allList.filter(function(p) {
      var nameMatch = (p.name || '').toLowerCase().indexOf(q) !== -1;
      var authorMatch = (p.author || '').toLowerCase().indexOf(q) !== -1;
      var idMatch = (p.id || '').toLowerCase().indexOf(q) !== -1;
      return nameMatch || authorMatch || idMatch;
    });
  }

  if (allList.length === 0) {
    container.innerHTML = '<div class="text-center py-3 text-muted small font-mono">No shared projects found in Firestore. Save your current design to create the first one!</div>';
    return;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-3 text-slate-400 small font-mono">
        <i class="fa-solid fa-filter-circle-xmark text-warning me-1"></i>No projects found matching "<span class="text-white">${escapeHtml(filterQuery)}</span>".
        <div class="mt-2">
          <button type="button" class="btn btn-outline-info btn-xs py-0 px-2 font-mono" onclick="clearCloudProjectsFilter()">
            <i class="fa-solid fa-rotate-left me-1"></i>Reset Filter
          </button>
        </div>
      </div>`;
    return;
  }

  var countInfo = q ? `
    <div class="d-flex justify-content-between align-items-center mb-1 px-1 font-mono text-slate-400" style="font-size:0.68rem;">
      <span>Showing <strong class="text-warning">${filtered.length}</strong> of ${allList.length} projects</span>
      <span class="badge bg-secondary font-mono" style="font-size:0.65rem;">Filtered by Title/Designer</span>
    </div>
  ` : '';

  var html = countInfo + `
    <div class="table-responsive" style="max-height: 280px; overflow-y: auto;">
      <table class="table table-sm table-dark table-hover align-middle mb-0 font-mono" style="font-size:0.75rem;">
        <thead class="table-dark" style="position: sticky; top: 0; background: #1e293b; z-index: 2;">
          <tr>
            <th style="width: 54px;">Preview</th>
            <th>Project ID</th>
            <th>Design Title</th>
            <th>Lead Designer</th>
            <th>Last Synced</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  filtered.forEach(function(p) {
    var dateStr = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() + ' ' + new Date(p.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
    var isCurrent = p.id === currentCloudProjectId;
    var rowClass = isCurrent ? 'table-primary fw-bold text-white' : '';

    var titleDisplay = highlightMatch(p.name || 'Untitled', q);
    var authorDisplay = highlightMatch(p.author || 'Lead AV Engineer', q);
    var thumbnailSvg = generateProjectThumbnailSvg(p);

    html += `
      <tr class="${rowClass}">
        <td class="p-1 text-center" title="Visual Room Hash Thumbnail">${thumbnailSvg}</td>
        <td><span class="badge bg-secondary font-mono">${escapeHtml(p.id)}</span></td>
        <td><span class="text-white fw-bold">${titleDisplay}</span></td>
        <td><span class="text-slate-300"><i class="fa-solid fa-user-pen me-1 text-info"></i>${authorDisplay}</span></td>
        <td><span class="text-slate-400" style="font-size:0.68rem;">${dateStr}</span></td>
        <td class="text-end text-nowrap">
          <button type="button" class="btn btn-outline-primary btn-xs py-0 px-2 fw-bold me-1 font-mono" onclick="loadProjectFromCloud('${escapeHtml(p.id)}')" title="Load into workspace">
            <i class="fa-solid fa-folder-open me-1"></i>Open
          </button>
          <button type="button" class="btn btn-outline-warning btn-xs py-0 px-2 fw-bold me-1 font-mono" onclick="duplicateCloudProject('${escapeHtml(p.id)}')" title="Duplicate to new Project ID for fast iteration">
            <i class="fa-solid fa-clone me-1"></i>Duplicate
          </button>
          <button type="button" class="btn btn-outline-info btn-xs py-0 px-2 fw-bold me-1 font-mono" onclick="copyProjectShareUrl('${escapeHtml(p.id)}')" title="Copy Share Link">
            <i class="fa-solid fa-link"></i>
          </button>
          <button type="button" class="btn btn-outline-danger btn-xs py-0 px-2 font-mono" onclick="deleteCloudProject('${escapeHtml(p.id)}')" title="Delete from Cloud">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function filterCloudProjectsList(query) {
  renderCloudProjectsTable(cachedCloudProjects, query);
}

function clearCloudProjectsFilter() {
  var input = document.getElementById('cloudProjectsSearchInput');
  if (input) input.value = '';
  renderCloudProjectsTable(cachedCloudProjects, '');
}

async function refreshCloudProjectsList() {
  var ws = window.FirebaseWorkspace;
  var container = document.getElementById('cloudProjectsListContainer');
  if (!container || !ws) return;

  var currentQuery = document.getElementById('cloudProjectsSearchInput')?.value || '';

  container.innerHTML = '<div class="text-center py-3 text-muted small font-mono"><span class="spinner-border spinner-border-sm me-1"></span>Querying shared projects from Firestore...</div>';

  try {
    var projects = await ws.listRecentProjects(50);
    cachedCloudProjects = projects || [];
    renderCloudProjectsTable(cachedCloudProjects, currentQuery);
  } catch (e) {
    container.innerHTML = `<div class="text-danger small py-2 font-mono">Failed to fetch Firestore projects: ${escapeHtml(e.message)}</div>`;
  }
}

async function deleteCloudProject(projectId) {
  var ws = window.FirebaseWorkspace;
  if (!ws || !confirm(`Permanently delete shared project "${projectId}" from Firebase Cloud?`)) return;

  try {
    await ws.deleteProject(projectId);
    refreshCloudProjectsList();
    if (currentCloudProjectId === projectId) {
      currentCloudProjectId = '';
      updateCloudWorkspaceStatusBadge(false);
    }
  } catch (e) {
    alert('Error deleting project: ' + e.message);
  }
}

function copyProjectShareUrl(projectId) {
  var id = (projectId || currentCloudProjectId || document.getElementById('cloudProjectIdInput')?.value || '').trim();
  if (!id) {
    // If project hasn't been saved to Firebase yet, save it first
    saveCurrentProjectToCloud(false).then(function() {
      if (currentCloudProjectId) copyProjectShareUrl(currentCloudProjectId);
    });
    return;
  }
  var tabId = getCurrentActiveTabId();
  var url = `${window.location.origin}${window.location.pathname}?project=${encodeURIComponent(id)}&tab=${tabId}`;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).catch(function() {});
  }
  
  openShareProjectLinkModal(id, url);
}

function openShareProjectLinkModal(projectId, url) {
  var modalEl = document.getElementById('projectShareLinkModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'projectShareLinkModal';
    modalEl.className = 'modal fade';
    modalEl.setAttribute('tabindex', '-1');
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-white border shadow-2xl" style="background:#0f172a; border-color:#38bdf8;">
          <div class="modal-header py-2" style="background:#1e293b; border-bottom:1px solid #334155;">
            <h6 class="modal-title font-mono text-info d-flex align-items-center gap-2 mb-0" style="font-size:0.88rem;">
              <i class="fa-solid fa-share-nodes text-info"></i>Shareable Cloud Project Link
            </h6>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" style="font-size:0.75rem;"></button>
          </div>
          <div class="modal-body p-3 font-mono">
            <p class="small text-slate-300 mb-2" style="font-size:0.78rem;">
              Anyone opening this link on <strong>any laptop or computer</strong> will automatically load this project directly from Firebase Cloud with full room equipment and placement schedules:
            </p>
            <div class="input-group mb-2">
              <input type="text" id="shareProjectLinkInput" class="form-control form-control-sm text-info font-mono fw-bold" style="background:#020617; border-color:#475569; font-size:0.76rem;" readonly value="${url}">
              <button class="btn btn-primary btn-sm px-3 fw-bold" type="button" onclick="copyShareInputUrl()">
                <i class="fa-solid fa-copy me-1"></i>Copy Link
              </button>
            </div>
            <div class="p-2 rounded border border-success/40 bg-success/10 text-success small mb-2 d-flex align-items-center gap-2" style="font-size:0.74rem;">
              <i class="fa-solid fa-circle-check fs-6 text-success"></i>
              <div>
                <strong>Active Project ID:</strong> <span class="badge bg-secondary font-mono">${projectId}</span><br>
                Link copied to clipboard! Any laptop can open and save updates to this project.
              </div>
            </div>
          </div>
          <div class="modal-footer py-2" style="background:#1e293b; border-top:1px solid #334155;">
            <button type="button" class="btn btn-secondary btn-xs font-mono px-3" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  } else {
    var inp = document.getElementById('shareProjectLinkInput');
    if (inp) inp.value = url;
  }

  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    var bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    bsModal.show();
  }
}

function copyShareInputUrl() {
  var inp = document.getElementById('shareProjectLinkInput');
  if (inp) {
    inp.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inp.value).then(function() {
        alert('✓ Share link copied to clipboard!\nSend this link to anyone on any laptop to open the saved project.');
      });
    } else {
      document.execCommand('copy');
      alert('✓ Share link copied to clipboard!');
    }
  }
}

async function exportCurrentWorkspaceProjectAsJSON() {
  var ws = window.FirebaseWorkspace;
  var idInput = document.getElementById('cloudProjectIdInput');
  var projectId = (idInput?.value || currentCloudProjectId || '').trim();

  var btn = document.getElementById('btnExportCloudProjectJson');
  var origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Pulling Firebase Data...';
  }

  try {
    var firebaseData = null;
    if (ws && projectId) {
      try {
        firebaseData = await ws.getProject(projectId);
      } catch (err) {
        console.warn('Could not fetch remote Firebase state, using local cache:', err);
      }
    }

    var projName = firebaseData?.name || document.getElementById('matrixProjectNameInput')?.value || document.getElementById('cloudProjectNameInput')?.value || 'Pro AV Facility Schedule';
    var author = firebaseData?.author || document.getElementById('cloudAuthorInput')?.value || 'Lead AV Designer';
    var notes = firebaseData?.notes || document.getElementById('cloudNotesInput')?.value || '';
    var activeTab = firebaseData?.activeTab || getCurrentActiveTabId();

    var rooms = [];
    if (firebaseData && firebaseData.rooms) {
      try {
        rooms = typeof firebaseData.rooms === 'string' ? JSON.parse(firebaseData.rooms) : firebaseData.rooms;
      } catch(e) {
        rooms = [];
      }
    }
    // If Firebase rooms was empty or unavailable, pull current matrix table rows
    if (!rooms || rooms.length === 0) {
      var localData = typeof getMatrixCurrentProjectData === 'function' ? getMatrixCurrentProjectData() : { rooms: [] };
      rooms = localData.rooms || [];
    }

    var exportPayload = {
      workspaceExportVersion: "2.0",
      exportSource: "Firebase Firestore Cloud State",
      exportedAt: new Date().toISOString(),
      projectId: projectId || ('PROJ-' + Math.random().toString(36).substring(2, 8).toUpperCase()),
      projectName: projName,
      leadDesigner: author,
      notes: notes,
      activeTab: activeTab,
      firebaseState: firebaseData || { status: "local_synced", id: projectId, name: projName, author: author, updatedAt: new Date().toISOString() },
      roomsCount: rooms.length,
      rooms: rooms,
      systemPlacementsGuide: {
        cameraPlacements: ["above", "below", "left", "right", "opposite (covers presenter)", "both_lr", "above_and_opposite"],
        speakerPlacements: ["ceiling", "left_right", "top", "bottom", "left", "right", "opposite (presenter foldback)", "surround"],
        microphonePlacements: ["ceiling", "table", "top", "bottom", "left_right", "opposite (podium/presenter)", "table_and_opposite"]
      }
    };

    var jsonStr = JSON.stringify(exportPayload, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var safeName = (projName || 'project').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    a.href = url;
    a.download = `workspace_${projectId || 'project'}_${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);

    alert(`✓ Workspace Project exported to JSON successfully!\nPulled active Firebase Firestore state for: ${projectId || projName}\nFile: workspace_${projectId || 'project'}_${safeName}.json`);
  } catch (err) {
    console.error('Failed to export workspace JSON:', err);
    alert('Error exporting workspace JSON: ' + (err.message || String(err)));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

function createNewCloudProject() {
  if (confirm('Start a new cloud project design? Any unsaved local matrix rows will be reset.')) {
    currentCloudProjectId = 'PROJ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    var idInput = document.getElementById('cloudProjectIdInput');
    if (idInput) idInput.value = currentCloudProjectId;
    var nameInput = document.getElementById('cloudProjectNameInput');
    if (nameInput) nameInput.value = 'New AV Facility Design';

    if (typeof createNewProject === 'function') {
      createNewProject();
    }
    updateCloudWorkspaceStatusBadge(true, currentCloudProjectId);
  }
}

// Auto-load on startup if URL contains ?project=... or #project=...
function autoLoadUrlSharedProject(projectId) {
  if (!projectId) return;

  var attempts = 0;
  var maxAttempts = 35; // 35 * 200ms = 7s max wait for Firebase SDK
  
  function pollAndLoad() {
    attempts++;
    var ws = window.FirebaseWorkspace;
    if (ws) {
      loadProjectFromCloud(projectId);
    } else if (attempts < maxAttempts) {
      setTimeout(pollAndLoad, 200);
    } else {
      console.warn('FirebaseWorkspace timed out initializing for auto-load of:', projectId);
    }
  }
  
  pollAndLoad();
}

// Export functions to window
window.openPrintPdfModal = openPrintPdfModal;
window.closePrintPdfModal = closePrintPdfModal;
window.selectPdfOrientation = selectPdfOrientation;
window.executePdfGenerationWithOrientation = executePdfGenerationWithOrientation;
window.generateCurrentTabPdfReport = generateCurrentTabPdfReport;
window.openCurrentTabQrModal = openCurrentTabQrModal;
window.toggleCurrentTabQrPopup = toggleCurrentTabQrPopup;
window.updateCurrentTabQrView = updateCurrentTabQrView;
window.copyCurrentTabQrUrl = copyCurrentTabQrUrl;
window.downloadCurrentTabQrImage = downloadCurrentTabQrImage;
window.openSharedWorkspaceModal = openSharedWorkspaceModal;
window.toggleSharedWorkspacePopup = toggleSharedWorkspacePopup;
window.closeHeaderPopups = closeHeaderPopups;
window.saveCurrentProjectToCloud = saveCurrentProjectToCloud;
window.loadProjectFromCloud = loadProjectFromCloud;
window.refreshCloudProjectsList = refreshCloudProjectsList;
window.filterCloudProjectsList = filterCloudProjectsList;
window.clearCloudProjectsFilter = clearCloudProjectsFilter;
window.deleteCloudProject = deleteCloudProject;
window.duplicateCloudProject = duplicateCloudProject;
window.generateProjectThumbnailSvg = generateProjectThumbnailSvg;
window.copyProjectShareUrl = copyProjectShareUrl;
window.openShareProjectLinkModal = openShareProjectLinkModal;
window.copyShareInputUrl = copyShareInputUrl;
window.exportCurrentWorkspaceProjectAsJSON = exportCurrentWorkspaceProjectAsJSON;
window.triggerAutoSave = triggerAutoSave;
window.createNewCloudProject = createNewCloudProject;
window.autoLoadUrlSharedProject = autoLoadUrlSharedProject;
