
// ==========================================
// SECURE WEBMASTER SOURCE CODE ACCESS & COPY SYSTEM
// Master Key: HCMM
// ==========================================

var cachedSourceCode = '';
var cachedStandaloneBundle = '';

// Security protection against unauthorized source code inspection/copying
document.addEventListener('keydown', function(e) {
  var isAuth = sessionStorage.getItem('hcmm_auth') === 'true';

  // Prevent Ctrl+S (Save page/source), Ctrl+U (View source)
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) {
    e.preventDefault();
    if (!isAuth) {
      showSecurityNotice();
    }
    return false;
  }

  // Prevent F12, Ctrl+Shift+I / J / C (DevTools)
  if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))) {
    e.preventDefault();
    if (!isAuth) {
      showSecurityNotice();
    }
    return false;
  }
});

// Protect right-click menu from downloading source files on public website
document.addEventListener('contextmenu', function(e) {
  // Allow normal interactions inside form inputs and textareas (especially the modal textarea)
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable || (e.target.closest && e.target.closest('#sourceCodeUnlockedView')))) {
    return true;
  }
  e.preventDefault();
  if (sessionStorage.getItem('hcmm_auth') !== 'true') {
    showSecurityNotice();
  }
  return false;
});

function showSecurityNotice() {
  var toast = document.getElementById('hcmmSecurityNotice');
  if (toast) {
    toast.style.display = 'block';
    setTimeout(function() {
      if (toast) toast.style.display = 'none';
    }, 4500);
  }
}

// Open Webmaster Auth Modal (Always strictly locked; password required every time)
function openSourceCodeAuthModal() {
  var gate = document.getElementById('sourceCodeLockGate');
  var view = document.getElementById('sourceCodeUnlockedView');
  var feedback = document.getElementById('sourceAuthFeedback');
  var pwdInput = document.getElementById('sourceMasterPasswordInput');
  var textarea = document.getElementById('sourceCodeTextarea');

  // Strictly enforce locked state every time
  sessionStorage.removeItem('hcmm_auth');
  if (gate) gate.style.display = 'block';
  if (view) view.style.display = 'none';
  if (feedback) {
    feedback.className = 'small font-mono text-danger mb-3';
    feedback.textContent = '';
  }
  if (pwdInput) pwdInput.value = '';
  if (textarea) textarea.value = '';

  var modalEl = document.getElementById('sourceCodeAuthModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
    setTimeout(function() { if (pwdInput) pwdInput.focus(); }, 350);
  }
}

// Toggle password visibility
function togglePasswordVisibility() {
  var pwdInput = document.getElementById('sourceMasterPasswordInput');
  var eyeIcon = document.getElementById('pwdEyeIcon');
  if (!pwdInput) return;
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye-slash';
  } else {
    pwdInput.type = 'password';
    if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye';
  }
}

// Verify Password (HCMM)
function verifySourceCodePassword() {
  var pwdInput = document.getElementById('sourceMasterPasswordInput');
  var feedback = document.getElementById('sourceAuthFeedback');
  var entered = (pwdInput?.value || '').trim();

  if (entered.toUpperCase() === 'HCMM') {
    sessionStorage.setItem('hcmm_auth', 'true');
    if (feedback) {
      feedback.className = 'small font-mono text-success mb-3';
      feedback.textContent = '✓ Access granted! Unlocking source code engine...';
    }
    setTimeout(function() {
      var gate = document.getElementById('sourceCodeLockGate');
      var view = document.getElementById('sourceCodeUnlockedView');
      if (gate) gate.style.display = 'none';
      if (view) view.style.display = 'block';
      loadSourceCodeContent();
    }, 350);
  } else {
    if (feedback) {
      feedback.className = 'small font-mono text-danger mb-3';
      feedback.textContent = '✕ Incorrect password. Access denied. Only authorized webmaster may access source code.';
    }
    if (pwdInput) {
      pwdInput.classList.add('is-invalid');
      setTimeout(function() { pwdInput.classList.remove('is-invalid'); }, 1500);
    }
  }
}

// Load source code content into textareas
function loadSourceCodeContent() {
  var textarea = document.getElementById('sourceCodeTextarea');
  var charCount = document.getElementById('srcCharCount');
  var iframeSnippet = document.getElementById('iframeEmbedSnippet');

  // Generate responsive iframe embed snippet
  if (iframeSnippet) {
    var fullUrl = window.location.href;
    iframeSnippet.value = '<!-- Pro AV System Architect Embed Code -->\n' +
      '<div style="position:relative; width:100%; height:850px; min-height:600px; border-radius:12px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.12); border:1px solid #cbd5e1;">\n' +
      '  <iframe src="' + fullUrl + '" style="width:100%; height:100%; border:none; display:block;" allow="clipboard-write; fullscreen" title="Pro AV System Architect &amp; Spatial Matrix"></iframe>\n' +
      '</div>';
  }

  var currentDomCode = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

  if (cachedStandaloneBundle && cachedStandaloneBundle.length > 5000) {
    if (textarea) textarea.value = cachedStandaloneBundle;
    if (charCount) charCount.textContent = cachedStandaloneBundle.length.toLocaleString() + ' chars (100% Standalone Self-Contained HTML)';
    return;
  }

  // Attempt to fetch the pre-bundled single standalone HTML file
  if (textarea) textarea.value = 'Loading complete source code bundle...';
  if (charCount) charCount.textContent = 'Loading...';

  fetch('/pro_av_system_architect.html')
    .then(function(res) {
      if (res.ok) return res.text();
      throw new Error('Fallback to DOM outerHTML');
    })
    .then(function(html) {
      cachedStandaloneBundle = html;
      cachedSourceCode = html;
      if (textarea) textarea.value = html;
      if (charCount) charCount.textContent = html.length.toLocaleString() + ' chars (100% Standalone Self-Contained HTML)';
    })
    .catch(function() {
      cachedSourceCode = currentDomCode;
      if (textarea) textarea.value = currentDomCode;
      if (charCount) charCount.textContent = currentDomCode.length.toLocaleString() + ' chars (Live DOM Source)';
    });
}

// Copy full source code
function copyFullSourceCode() {
  if (sessionStorage.getItem('hcmm_auth') !== 'true') {
    alert('Unauthorized: Password HCMM required to copy source code.');
    openSourceCodeAuthModal();
    return;
  }
  var textarea = document.getElementById('sourceCodeTextarea');
  if (!textarea) return;

  var textToCopy = textarea.value;
  var status = document.getElementById('copyStatusIndicator');

  var finishCopy = function() {
    if (status) {
      status.textContent = '✓ Full source code copied to clipboard! Ready to paste into your website.';
      setTimeout(function() { status.textContent = ''; }, 5000);
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(finishCopy).catch(function() {
      fallbackCopy(textarea, finishCopy);
    });
  } else {
    fallbackCopy(textarea, finishCopy);
  }
}

function fallbackCopy(textarea, callback) {
  textarea.select();
  textarea.setSelectionRange(0, 9999999);
  try {
    document.execCommand('copy');
    if (callback) callback();
  } catch (err) {
    alert('Press Ctrl+C to copy selected source code.');
  }
}

// Download HTML file
function downloadSourceHtmlFile() {
  if (sessionStorage.getItem('hcmm_auth') !== 'true') {
    alert('Unauthorized: Password HCMM required to download source code.');
    openSourceCodeAuthModal();
    return;
  }
  var textarea = document.getElementById('sourceCodeTextarea');
  var code = textarea ? textarea.value : ('<!DOCTYPE html>\n' + document.documentElement.outerHTML);
  var blob = new Blob([code], { type: 'text/html;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'pro_av_system_architect.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Copy iframe embed code
function copyIframeEmbedCode() {
  if (sessionStorage.getItem('hcmm_auth') !== 'true') {
    alert('Unauthorized: Password HCMM required to copy embed code.');
    openSourceCodeAuthModal();
    return;
  }
  var iframeSnippet = document.getElementById('iframeEmbedSnippet');
  if (!iframeSnippet) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(iframeSnippet.value).then(function() {
      alert('✓ Embed snippet copied to clipboard! Paste directly into your website (WordPress, Wix, HTML, etc.).');
    });
  } else {
    iframeSnippet.select();
    document.execCommand('copy');
    alert('✓ Embed snippet copied to clipboard!');
  }
}

// Generate & Copy Standalone Bundle
function generateAndCopyStandaloneBundle() {
  if (sessionStorage.getItem('hcmm_auth') !== 'true') {
    alert('Unauthorized: Password HCMM required to copy standalone bundle.');
    openSourceCodeAuthModal();
    return;
  }
  var indicator = document.getElementById('bundleStatusIndicator');
  if (indicator) indicator.textContent = 'Generating standalone bundle...';

  fetch('/pro_av_system_architect.html')
    .then(function(res) {
      if (res.ok) return res.text();
      throw new Error('Not found');
    })
    .then(function(html) {
      cachedStandaloneBundle = html;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(html).then(function() {
          if (indicator) indicator.textContent = '✓ 100% Standalone HTML (' + html.length.toLocaleString() + ' chars) copied to clipboard! Zero external dependencies.';
        });
      } else {
        var textarea = document.getElementById('sourceCodeTextarea');
        if (textarea) textarea.value = html;
        fallbackCopy(textarea, function() {
          if (indicator) indicator.textContent = '✓ Standalone HTML copied to clipboard!';
        });
      }
    })
    .catch(function() {
      var domHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(domHtml).then(function() {
          if (indicator) indicator.textContent = '✓ Live DOM HTML copied to clipboard!';
        });
      }
    });
}

// Download Standalone Bundle
function downloadStandaloneBundle() {
  downloadSourceHtmlFile();
}

// Re-lock
function lockSourceCodeAgain() {
  sessionStorage.removeItem('hcmm_auth');
  var gate = document.getElementById('sourceCodeLockGate');
  var view = document.getElementById('sourceCodeUnlockedView');
  var pwdInput = document.getElementById('sourceMasterPasswordInput');
  var feedback = document.getElementById('sourceAuthFeedback');
  var textarea = document.getElementById('sourceCodeTextarea');

  if (gate) gate.style.display = 'block';
  if (view) view.style.display = 'none';
  if (pwdInput) pwdInput.value = '';
  if (feedback) feedback.textContent = '';
  if (textarea) textarea.value = '';
}

// Switch tabs inside Source Code Modal
function switchSourcePane(paneId) {
  var panes = document.querySelectorAll('#sourceCodeTabPanes > .tab-pane');
  panes.forEach(function(p) {
    p.classList.remove('show', 'active');
    p.style.display = 'none';
  });
  var target = document.getElementById(paneId);
  if (target) {
    target.classList.add('show', 'active');
    target.style.display = 'block';
  }
  var buttons = document.querySelectorAll('#sourceCodeTabs .nav-link');
  buttons.forEach(function(b) {
    b.classList.remove('active');
  });
  var activeBtn = document.querySelector('[data-bs-target="#' + paneId + '"]');
  if (activeBtn) activeBtn.classList.add('active');
}

// Global Tab Info Toggle
function toggleTabInfo(infoId) {
  var el = document.getElementById(infoId);
  if (!el) return;
  if (el.style.display === 'none' || !el.style.display) {
    el.style.display = 'block';
    try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch(e) {}
  } else {
    el.style.display = 'none';
  }
}

function closeTabInfo(infoId) {
  var el = document.getElementById(infoId);
  if (el) el.style.display = 'none';
}

// Global ESC key listener to close any open "How to Use" drawers
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
      var drawers = document.querySelectorAll('.tab-info-drawer');
      drawers.forEach(function(drawer) {
        if (drawer.style.display !== 'none' && drawer.style.display !== '') {
          drawer.style.display = 'none';
        }
      });
    }
  });
}

// Top Level Application Tab Navigation
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  // Only target top-level tab contents in the container, do not touch modal tab panes
  tabcontent = document.querySelectorAll('.av-container > .tab-content');
  for (i = 0; i < tabcontent.length; i++) { tabcontent[i].style.display = "none"; }
  tablinks = document.querySelectorAll('.tab-container .tab-button');
  for (i = 0; i < tablinks.length; i++) { tablinks[i].className = tablinks[i].className.replace(" active", ""); }
  var targetTab = document.getElementById(tabName);
  if (targetTab) targetTab.style.display = "block";
  if (evt && evt.currentTarget) {
    evt.currentTarget.className += " active";
  } else {
    var matchingBtn = document.querySelector('.tab-container .tab-button[onclick*="\'' + tabName + '\'"]');
    if (matchingBtn) matchingBtn.className += " active";
  }

  // Sync URL hash for mobile navigation and deep-linking
  try {
    if (history.replaceState) {
      var currentParams = new URLSearchParams(window.location.search);
      var currentProj = currentParams.get('project') || (window.currentCloudProjectId || '');
      var hashStr = '#tab=' + tabName + (currentProj ? '&project=' + currentProj : '');
      history.replaceState(null, '', hashStr);
    }
  } catch(e) {}

  // If Tab QR Generator popup is open, update QR code immediately for current tab
  try {
    var qrPopup = document.getElementById('tabQrCodePopup');
    if (qrPopup && qrPopup.style.display === 'block' && typeof updateCurrentTabQrView === 'function') {
      updateCurrentTabQrView(tabName);
    }
  } catch(e) {}

  if (tabName === 'Tab1' && typeof calculateDisplay === 'function') calculateDisplay();
  if (tabName === 'Tab1_5') {
    if (typeof recalculateIfpd === 'function') recalculateIfpd();
    if (typeof initIfpdStudio === 'function') initIfpdStudio();
  }
  if (tabName === 'Tab2') {
    if (typeof calcLedScreenBidirectional === 'function') calcLedScreenBidirectional();
    if (typeof calculateLEDStudio === 'function') calculateLEDStudio();
  }
  if (tabName === 'Tab2_5') {
    if (typeof dvlState !== 'undefined' && dvlState.mode === 3 && typeof calculateMode3 === 'function') calculateMode3();
    else if (typeof dvlState !== 'undefined' && dvlState.mode === 2 && typeof calculateMode2 === 'function') calculateMode2();
    else if (typeof calculateMode1 === 'function') calculateMode1();
  }
  if (tabName === 'Tab3' && typeof updateProjectorSim === 'function') updateProjectorSim();
  if (tabName === 'Tab4' && typeof calcCameraStudio === 'function') calcCameraStudio();
  if (tabName === 'Tab5') {
    if (typeof calcSpeakerAndMicAll === 'function') {
      calcSpeakerAndMicAll();
      setTimeout(function() {
        if (typeof threeSpkMicState !== 'undefined' && threeSpkMicState.renderer && threeSpkMicState.container && threeSpkMicState.camera) {
          var w = threeSpkMicState.container.clientWidth || 920;
          var h = 480;
          threeSpkMicState.camera.aspect = w / h;
          threeSpkMicState.camera.updateProjectionMatrix();
          threeSpkMicState.renderer.setSize(w, h);
        }
      }, 60);
    } else {
      if (typeof calcSpeakerStudio === 'function') calcSpeakerStudio();
      if (typeof calcMicrophoneStudio === 'function') calcMicrophoneStudio();
    }
  }
  if (tabName === 'Tab6') {
    if (typeof calcAcousticsFull === 'function') calcAcousticsFull();
  }
  if (tabName === 'Tab7' && typeof calcStdSize === 'function') calcStdSize();
  if (tabName === 'Tab8' && typeof runAllTab8Calculations === 'function') runAllTab8Calculations();
  if (tabName === 'Tab9') {
    if (typeof calcCableAttenuation === 'function') calcCableAttenuation();
    if (typeof calcRfAntennaSolver === 'function') calcRfAntennaSolver();
  }
  if (tabName === 'Tab10' && typeof updateMatrixTotalsAndSummary === 'function') updateMatrixTotalsAndSummary();
}

function getStandardSize(inches) {
  var sizes = [27, 32, 43, 50, 55, 65, 75, 85, 98, 100, 105, 110, 120, 130, 136, 146, 150, 163, 180, 200, 220, 250, 300, 320];
  for (var i = 0; i < sizes.length; i++) { if (sizes[i] >= inches) return sizes[i] + '"'; }
  return Math.round(inches) + '" (Modular dvLED)';
}

function rgbToHex(col) {
  if (!col || col === 'transparent' || col === 'inherit') return '#ffffff';
  col = col.trim().toLowerCase();
  if (col.startsWith('#')) {
    if (col.length === 4) return '#' + col[1] + col[1] + col[2] + col[2] + col[3] + col[3];
    return col.length === 7 ? col : '#ffffff';
  }
  var m = col.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    var r = parseInt(m[1]).toString(16).padStart(2, '0');
    var g = parseInt(m[2]).toString(16).padStart(2, '0');
    var b = parseInt(m[3]).toString(16).padStart(2, '0');
    return '#' + r + g + b;
  }
  return '#ffffff';
}

function initAllAppTooltips() {
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    try {
      var tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach(function(el) {
        if (!bootstrap.Tooltip.getInstance(el)) {
          new bootstrap.Tooltip(el, { container: 'body' });
        }
      });
    } catch (e) {
      console.warn('Bootstrap tooltip error:', e);
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initAllAppTooltips();

  var modalEl = document.getElementById('sourceCodeAuthModal');
  if (modalEl) {
    modalEl.addEventListener('hidden.bs.modal', function() {
      lockSourceCodeAgain();
    });
  }
});

// Dynamic window resize listener for responsive 3D interactives and layouts
var appResizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(appResizeTimeout);
  appResizeTimeout = setTimeout(function() {
    var activeTab = document.querySelector('.tab-content[style*="display: block"]');
    if (!activeTab) return;
    var tabId = activeTab.id;
    if (tabId === 'Tab1' && typeof calculateDisplay === 'function') calculateDisplay();
    if (tabId === 'Tab2' && typeof calculateLEDStudio === 'function') calculateLEDStudio();
    if (tabId === 'Tab2_5') {
      if (typeof dvlState !== 'undefined' && dvlState.mode === 3 && typeof calculateMode3 === 'function') calculateMode3();
      else if (typeof dvlState !== 'undefined' && dvlState.mode === 2 && typeof calculateMode2 === 'function') calculateMode2();
      else if (typeof calculateMode1 === 'function') calculateMode1();
    }
    if (tabId === 'Tab3' && typeof updateProjectorSim === 'function') updateProjectorSim();
    if (tabId === 'Tab4' && typeof calcCameraStudio === 'function') calcCameraStudio();
    if (tabId === 'Tab5' && typeof calcSpeakerAndMicAll === 'function') calcSpeakerAndMicAll();
  }, 150);
});



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


// ==========================================
// TAB: INTERACTIVE DISPLAY STUDIO (DISCAS)
// ==========================================
const ifpdState = {
  mode: 'recommend', // 'recommend' (Room-First) or 'verify' (Display-First)
  roomAudienceType: 'training', // 'training' (Adults) or 'classroom_kids' (Kids K-8)
  roomLengthMm: 8000,
  roomWidthMm: 5500,
  diagonalInches: 86,
  imageWidthMm: 1904,
  imageHeightMm: 1071,
  verticalRes: 2160,
  afflMm: 900,
  eyeHeightMm: 1200,
  presenterBufferMm: 1500,
  taskType: 'BDM', // 'BDM' or 'ADM'
  ehPercent: 3.0,
  activeTab: '2d',
  inspectorDistM: 4.5,
  isoAngle: 30, // For interactive 3D orbit
  isoPitch: 20
};

function setIfpdRoomApplication(appType) {
  ifpdState.roomAudienceType = appType;
  var inAffl = document.getElementById('in-affl-mm');
  var inEye = document.getElementById('in-eye-height-mm');
  var inBuffer = document.getElementById('in-presenter-buffer-mm');
  var badge = document.getElementById('badge-audience-type');
  var btnTrain = document.getElementById('btn-ifpd-app-training');
  var btnKids = document.getElementById('btn-ifpd-app-kids');

  if (appType === 'classroom_kids') {
    ifpdState.eyeHeightMm = 900;
    ifpdState.afflMm = 650; // Lower mounting height for child touch reach
    ifpdState.presenterBufferMm = 1200;
    if (badge) badge.innerText = "Kids Classroom (Lower Eye Level: 900mm | Touch AFFL: 650mm)";
    if (btnTrain) { btnTrain.classList.remove('btn-primary', 'active'); btnTrain.classList.add('btn-outline-primary'); }
    if (btnKids) { btnKids.classList.remove('btn-outline-primary'); btnKids.classList.add('btn-primary', 'active'); }
  } else {
    ifpdState.eyeHeightMm = 1200;
    ifpdState.afflMm = 900; // Standard adult AFFL
    ifpdState.presenterBufferMm = 1500;
    if (badge) badge.innerText = "Adult Training Room (Seated Eye Level: 1200mm | Touch AFFL: 900mm)";
    if (btnTrain) { btnTrain.classList.remove('btn-outline-primary'); btnTrain.classList.add('btn-primary', 'active'); }
    if (btnKids) { btnKids.classList.remove('btn-primary', 'active'); btnKids.classList.add('btn-outline-primary'); }
  }

  if (inAffl) inAffl.value = ifpdState.afflMm;
  if (inEye) inEye.value = ifpdState.eyeHeightMm;
  if (inBuffer) inBuffer.value = ifpdState.presenterBufferMm;

  recalculateIfpd();
}

const IFPD_MM_TO_FT = 0.00328084;
const IFPD_FT_TO_MM = 304.8;
const IFPD_ASPECT_RATIO_FACTOR = 16 / 9;
const IFPD_ASPECT_DIAG_FACTOR = Math.sqrt(16*16 + 9*9) / 9; // ~2.04015

const IFPD_COMMERCIAL_PRESETS = [
  { diag: 55, w: 1217, h: 685, aspect: '16:9', res: '4K UHD', tech: 'IR / Zero Bonding', brands: 'Samsung, LG, ViewSonic, Promethean, SMART' },
  { diag: 65, w: 1439, h: 809, aspect: '16:9', res: '4K UHD', tech: 'Zero Bonding IR', brands: 'Samsung, ViewSonic, BenQ, SMART, Promethean' },
  { diag: 75, w: 1660, h: 934, aspect: '16:9', res: '4K UHD', tech: 'Capacitive P-Cap / IR', brands: 'Maxhub, ViewSonic, LG, Optoma, Promethean' },
  { diag: 85, w: 1882, h: 1058, aspect: '16:9', res: '4K UHD', tech: 'InGlass / P-Cap', brands: 'Samsung Flip Pro, Sony, ViewSonic, Sharp/NEC' },
  { diag: 86, w: 1904, h: 1071, aspect: '16:9', res: '4K UHD', tech: 'Optical Bonding IR', brands: 'Maxhub, Promethean, BenQ, SMART, ViewSonic' },
  { diag: 92, w: 2154, h: 923, aspect: '21:9', res: '5K UW', tech: 'P-Cap Touch', brands: 'Jupiter Pana 92, Avocor L-Series, iiyama ProLite' },
  { diag: 98, w: 2169, h: 1220, aspect: '16:9', res: '4K UHD', tech: 'Zero Gap IR / D-LED', brands: 'Maxhub, Samsung, LG CreateBoard, ViewSonic, TCL' },
  { diag: 105, w: 2457, h: 1053, aspect: '21:9', res: '5K UW', tech: 'UltraWide P-Cap', brands: 'ViewSonic 21:9, Jupiter Pana 105, Promethean, iiyama' },
  { diag: 110, w: 2435, h: 1370, aspect: '16:9', res: '4K UHD', tech: 'Direct-LED Multi-Touch', brands: 'Hisense Interactive, BOE Commercial, TCL CSOT' },
  { diag: 115, w: 2546, h: 1432, aspect: '16:9', res: '4K QD-Mini', tech: 'QD-MiniLED Touch', brands: 'TCL QM89/CSOT Enterprise IFPD, Skyworth' },
  { diag: 120, w: 2656, h: 1494, aspect: '16:9', res: '4K UHD', tech: 'MegaTouch Surface', brands: 'Hisense 120 Laser IFPD, BOE Commercial' },
  { diag: 135, w: 2988, h: 1681, aspect: '16:9', res: 'FHD / 4K', tech: 'All-in-One Foldable Touch', brands: 'Maxhub Raptor IFPD, ViewSonic LDS135, Leyard Planar' },
  { diag: 136, w: 3010, h: 1693, aspect: '16:9', res: '4K COB', tech: 'COB Active Touch', brands: 'LG MAGNIT All-in-One, Samsung The Wall Touch, Hisense' },
  { diag: 146, w: 3226, h: 1815, aspect: '16:9', res: '4K MicroLED', tech: 'Monolithic MicroLED Touch', brands: 'Samsung The Wall IWA Touch, Leyard Carbon IFPD' },
  { diag: 163, w: 3600, h: 2025, aspect: '16:9', res: '4K UHD', tech: 'All-in-One dvLED IFPD', brands: 'Maxhub Ultra IFPD 163, ViewSonic LDS163, Leyard Planar' },
  { diag: 171, w: 4000, h: 1714, aspect: '21:9', res: '5K UW', tech: 'UltraWide Seamless Touch', brands: 'Jupiter Pana 171 Signature Room, Leyard 21:9 All-in-One' }
];

function initIfpdStudio() {
  setupIfpdEventListeners();
  recalculateIfpd();
}

function setupIfpdEventListeners() {
  const inLenMm = document.getElementById('in-room-len-mm');
  const inLenFt = document.getElementById('in-room-len-ft');
  if (inLenMm && inLenFt) {
    inLenMm.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      ifpdState.roomLengthMm = val;
      inLenFt.value = (val * IFPD_MM_TO_FT).toFixed(2);
      recalculateIfpd();
    });
    inLenFt.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      ifpdState.roomLengthMm = Math.round(val * IFPD_FT_TO_MM);
      inLenMm.value = ifpdState.roomLengthMm;
      recalculateIfpd();
    });
  }

  const inWidMm = document.getElementById('in-room-wid-mm');
  const inWidFt = document.getElementById('in-room-wid-ft');
  if (inWidMm && inWidFt) {
    inWidMm.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      ifpdState.roomWidthMm = val;
      inWidFt.value = (val * IFPD_MM_TO_FT).toFixed(2);
      recalculateIfpd();
    });
    inWidFt.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      ifpdState.roomWidthMm = Math.round(val * IFPD_FT_TO_MM);
      inWidMm.value = ifpdState.roomWidthMm;
      recalculateIfpd();
    });
  }

  const inDiag = document.getElementById('in-custom-diag');
  if (inDiag) {
    inDiag.addEventListener('input', (e) => {
      const diag = parseFloat(e.target.value) || 86;
      ifpdState.diagonalInches = diag;
      const diagMm = diag * 25.4;
      ifpdState.imageHeightMm = Math.round(diagMm / IFPD_ASPECT_DIAG_FACTOR);
      ifpdState.imageWidthMm = Math.round(ifpdState.imageHeightMm * IFPD_ASPECT_RATIO_FACTOR);
      const wInp = document.getElementById('in-custom-width-mm');
      if (wInp) wInp.value = ifpdState.imageWidthMm;
      recalculateIfpd();
    });
  }

  const inWmm = document.getElementById('in-custom-width-mm');
  if (inWmm) {
    inWmm.addEventListener('input', (e) => {
      const w = parseFloat(e.target.value) || 1904;
      ifpdState.imageWidthMm = w;
      ifpdState.imageHeightMm = Math.round(w / IFPD_ASPECT_RATIO_FACTOR);
      const diagMm = Math.sqrt(ifpdState.imageWidthMm ** 2 + ifpdState.imageHeightMm ** 2);
      ifpdState.diagonalInches = Math.round(diagMm / 25.4);
      const dInp = document.getElementById('in-custom-diag');
      if (dInp) dInp.value = ifpdState.diagonalInches;
      recalculateIfpd();
    });
  }

  const resSel = document.getElementById('in-res-vr');
  if (resSel) {
    resSel.addEventListener('change', (e) => {
      ifpdState.verticalRes = parseInt(e.target.value);
      recalculateIfpd();
    });
  }

  const inAffl = document.getElementById('in-affl-mm');
  if (inAffl) {
    inAffl.addEventListener('input', (e) => {
      ifpdState.afflMm = parseFloat(e.target.value) || 900;
      recalculateIfpd();
    });
  }

  const inEye = document.getElementById('in-eye-height-mm');
  if (inEye) {
    inEye.addEventListener('input', (e) => {
      ifpdState.eyeHeightMm = parseFloat(e.target.value) || 1200;
      recalculateIfpd();
    });
  }

  const inBuffer = document.getElementById('in-presenter-buffer-mm');
  if (inBuffer) {
    inBuffer.addEventListener('input', (e) => {
      ifpdState.presenterBufferMm = parseFloat(e.target.value) || 1500;
      recalculateIfpd();
    });
  }

  document.querySelectorAll('input[name="ifpd-viewing-task"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      ifpdState.taskType = e.target.value;
      const sliderBox = document.getElementById('ifpd-bdm-slider-container');
      if (sliderBox) {
        if (ifpdState.taskType === 'BDM') {
          sliderBox.classList.remove('opacity-40', 'pointer-events-none');
        } else {
          sliderBox.classList.add('opacity-40', 'pointer-events-none');
        }
      }
      recalculateIfpd();
    });
  });

  const ehSlider = document.getElementById('in-eh-percent');
  if (ehSlider) {
    ehSlider.addEventListener('input', (e) => {
      ifpdState.ehPercent = parseFloat(e.target.value);
      let label = `${ifpdState.ehPercent.toFixed(1)}%`;
      if (ifpdState.ehPercent === 3.0) label += " (Standard Teaching)";
      else if (ifpdState.ehPercent < 2.5) label += " (Fine Code/Text)";
      else if (ifpdState.ehPercent > 3.8) label += " (Large Headings)";
      const ehText = document.getElementById('val-eh-text');
      if (ehText) ehText.textContent = label;
      recalculateIfpd();
    });
  }

  const inspectSlider = document.getElementById('in-inspector-slider');
  if (inspectSlider) {
    inspectSlider.addEventListener('input', (e) => {
      ifpdState.inspectorDistM = parseFloat(e.target.value);
      updateIfpdInspectorOutput();
      renderIfpd2DPlan();
      renderIfpd3DIsometric();
    });
  }
}

function setIfpdCalculationMode(mode) {
  ifpdState.mode = mode;
  const btnRec = document.getElementById('btn-ifpd-mode-recommend');
  const btnVer = document.getElementById('btn-ifpd-mode-verify');
  const badgeHeader = document.getElementById('badge-ifpd-mode-header');

  if (mode === 'recommend') {
    if (btnRec) btnRec.className = "px-3 py-1.5 rounded-lg font-semibold bg-white text-sky-700 shadow-sm border border-slate-200 transition";
    if (btnVer) btnVer.className = "px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition";
    if (badgeHeader) badgeHeader.textContent = "ROOM-FIRST DISPLAY RECOMMENDATION";
  } else {
    if (btnVer) btnVer.className = "px-3 py-1.5 rounded-lg font-semibold bg-white text-sky-700 shadow-sm border border-slate-200 transition";
    if (btnRec) btnRec.className = "px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition";
    if (badgeHeader) badgeHeader.textContent = "DISPLAY-FIRST SIGHTLINE VERIFICATION";
  }
  recalculateIfpd();
}

function setIfpdPresetDiagonal(diag) {
  const preset = IFPD_COMMERCIAL_PRESETS.find(p => p.diag === diag);
  if (preset) {
    ifpdState.diagonalInches = preset.diag;
    ifpdState.imageWidthMm = preset.w;
    ifpdState.imageHeightMm = preset.h;
    const dInp = document.getElementById('in-custom-diag');
    if (dInp) dInp.value = preset.diag;
    const wInp = document.getElementById('in-custom-width-mm');
    if (wInp) wInp.value = preset.w;
    recalculateIfpd();
  }
}

function recalculateIfpd() {
  const lenFt = (ifpdState.roomLengthMm * IFPD_MM_TO_FT).toFixed(2);
  const lblLen = document.getElementById('label-len-summary');
  if (lblLen) lblLen.textContent = `${ifpdState.roomLengthMm} mm / ${lenFt} ft`;

  const widFt = (ifpdState.roomWidthMm * IFPD_MM_TO_FT).toFixed(2);
  const lblWid = document.getElementById('label-wid-summary');
  if (lblWid) lblWid.textContent = `${ifpdState.roomWidthMm} mm / ${widFt} ft`;

  const areaM2 = ((ifpdState.roomLengthMm / 1000) * (ifpdState.roomWidthMm / 1000)).toFixed(1);
  const areaSqFt = (areaM2 * 10.7639).toFixed(1);
  const elArea = document.getElementById('val-floor-area');
  if (elArea) elArea.textContent = `${areaM2} m² (${areaSqFt} sq.ft)`;

  let reqHeightMm = 0;
  if (ifpdState.taskType === 'BDM') {
    const multiplier = (ifpdState.ehPercent * 200) / 100;
    reqHeightMm = Math.round(ifpdState.roomLengthMm / multiplier);
  } else {
    reqHeightMm = Math.round((ifpdState.roomLengthMm * ifpdState.verticalRes) / 3438);
  }

  const reqWidthMm = Math.round(reqHeightMm * IFPD_ASPECT_RATIO_FACTOR);
  const reqDiagMm = Math.sqrt(reqWidthMm**2 + reqHeightMm**2);
  const reqDiagInches = Math.round(reqDiagMm / 25.4);

  if (ifpdState.mode === 'recommend') {
    let recommendedPreset = IFPD_COMMERCIAL_PRESETS.reduce((prev, curr) => {
      return (Math.abs(curr.diag - reqDiagInches) < Math.abs(prev.diag - reqDiagInches)) ? curr : prev;
    });

    ifpdState.diagonalInches = recommendedPreset.diag;
    ifpdState.imageWidthMm = recommendedPreset.w;
    ifpdState.imageHeightMm = recommendedPreset.h;

    const dInp = document.getElementById('in-custom-diag');
    if (dInp) dInp.value = recommendedPreset.diag;
    const wInp = document.getElementById('in-custom-width-mm');
    if (wInp) wInp.value = recommendedPreset.w;
  }

  const activeH = ifpdState.imageHeightMm;
  const activeW = ifpdState.imageWidthMm;

  const screenTopMm = ifpdState.afflMm + activeH;
  const deltaEyeTopMm = screenTopMm - ifpdState.eyeHeightMm;
  let dCvGeoMm = (deltaEyeTopMm > 0) ? (deltaEyeTopMm / Math.tan(30 * Math.PI / 180)) : 500;
  const dCvEffectiveMm = Math.max(dCvGeoMm, ifpdState.presenterBufferMm);

  let dFvMm = 0;
  if (ifpdState.taskType === 'BDM') {
    const mult = (ifpdState.ehPercent * 200) / 100;
    dFvMm = Math.round(activeH * mult);
  } else {
    dFvMm = Math.round((activeH * 3438) / ifpdState.verticalRes);
  }

  const heroTitle = document.getElementById('hero-display-title');
  if (heroTitle) heroTitle.textContent = `${ifpdState.diagonalInches}" Interactive Flat Panel`;
  const statDiag = document.getElementById('stat-hero-diag');
  if (statDiag) statDiag.textContent = `${ifpdState.diagonalInches}" (${Math.round(ifpdState.diagonalInches * 2.54)} cm)`;
  const statDiagExact = document.getElementById('stat-hero-diag-exact');
  if (statDiagExact) statDiagExact.textContent = `Exact calculated req: ${reqDiagInches}" (${reqWidthMm}×${reqHeightMm} mm)`;
  
  const statW = document.getElementById('stat-hero-width-mm');
  if (statW) statW.textContent = `${activeW} mm`;
  const statWFt = document.getElementById('stat-hero-width-ft');
  if (statWFt) statWFt.textContent = `${(activeW * IFPD_MM_TO_FT).toFixed(2)} ft (${Math.round(activeW/25.4)} in)`;
  
  const statH = document.getElementById('stat-hero-height-mm');
  if (statH) statH.textContent = `${activeH} mm`;
  const statHFt = document.getElementById('stat-hero-height-ft');
  if (statHFt) statHFt.textContent = `${(activeH * IFPD_MM_TO_FT).toFixed(2)} ft (${Math.round(activeH/25.4)} in)`;

  const statAffl = document.getElementById('stat-hero-affl');
  if (statAffl) statAffl.textContent = `${ifpdState.afflMm} mm`;
  const statTop = document.getElementById('stat-hero-top');
  if (statTop) statTop.textContent = `Screen Top: ${screenTopMm} mm (${(screenTopMm*IFPD_MM_TO_FT).toFixed(2)} ft)`;

  const dCvM = (dCvEffectiveMm / 1000).toFixed(2);
  const dCvFt = (dCvEffectiveMm * IFPD_MM_TO_FT).toFixed(2);
  const statDcv = document.getElementById('stat-dcv-val');
  if (statDcv) statDcv.textContent = `${dCvM} m (${dCvEffectiveMm} mm / ${dCvFt} ft)`;

  const dFvM = (dFvMm / 1000).toFixed(2);
  const dFvFt = (dFvMm * IFPD_MM_TO_FT).toFixed(2);
  const statDfv = document.getElementById('stat-dfv-val');
  if (statDfv) statDfv.textContent = `${dFvM} m (${dFvMm} mm / ${dFvFt} ft)`;

  const heroBadge = document.getElementById('hero-status-badge');
  if (heroBadge) {
    if (dFvMm >= ifpdState.roomLengthMm) {
      heroBadge.textContent = "✓ Covers Full Room Depth";
      heroBadge.className = "px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
    } else {
      const diffM = ((ifpdState.roomLengthMm - dFvMm) / 1000).toFixed(2);
      heroBadge.textContent = `⚠ Undersized for Rear ${diffM}m`;
      heroBadge.className = "px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40";
    }
  }

  renderIfpdPresetMatrix(reqDiagInches);

  const gaze1stRad = Math.atan2(deltaEyeTopMm, dCvEffectiveMm);
  const gaze1stDeg = (gaze1stRad * 180 / Math.PI).toFixed(1);
  const metricGaze1 = document.getElementById('metric-vert-gaze-cv');
  if (metricGaze1) metricGaze1.textContent = `${gaze1stDeg}° (Max 30°)`;

  const gazeLastRad = Math.atan2(deltaEyeTopMm, dFvMm);
  const gazeLastDeg = (gazeLastRad * 180 / Math.PI).toFixed(1);
  const metricGazeLast = document.getElementById('metric-vert-gaze-fv');
  if (metricGazeLast) metricGazeLast.textContent = `${gazeLastDeg}° Comfortable`;

  const maxUsableMm = Math.min(dFvMm, ifpdState.roomLengthMm);
  const seatingSpanM = Math.max(0, (maxUsableMm - dCvEffectiveMm) / 1000).toFixed(2);
  const seatingSpanFt = (seatingSpanM * 3.28084).toFixed(1);
  const metricDepth = document.getElementById('metric-seating-depth');
  if (metricDepth) metricDepth.textContent = `${seatingSpanM} m (${seatingSpanFt} ft)`;

  updateIfpdInspectorOutput();
  renderIfpd2DPlan(dCvEffectiveMm, dFvMm);
  renderIfpd3DIsometric(dCvEffectiveMm, dFvMm);
}

function renderIfpdPresetMatrix(reqDiagInches) {
  const container = document.getElementById('container-ifpd-preset-matrix');
  if (!container) return;

  container.innerHTML = IFPD_COMMERCIAL_PRESETS.map(p => {
    const isSelected = p.diag === ifpdState.diagonalInches;
    const maxReachM = (p.h * (ifpdState.ehPercent * 2) / 1000).toFixed(1);
    const fitsRoom = (p.h * (ifpdState.ehPercent * 2)) >= ifpdState.roomLengthMm;
    const wFt = (p.w * IFPD_MM_TO_FT).toFixed(1);
    const hFt = (p.h * IFPD_MM_TO_FT).toFixed(1);
    const isUltrawide = p.aspect === '21:9';
    
    let statusTag = "";
    let borderStyle = isSelected 
      ? "border-sky-500 bg-sky-50 ring-2 ring-sky-500 shadow-md" 
      : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm";

    if (p.diag === reqDiagInches) {
      statusTag = `<span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-600 text-white">★ Ideal Fit</span>`;
    } else if (fitsRoom) {
      statusTag = `<span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-sky-600 text-white">✓ Full Reach</span>`;
    } else {
      statusTag = `<span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300">Reach ${maxReachM}m</span>`;
    }

    const aspectBadge = isUltrawide 
      ? `<span class="badge bg-purple-700 text-white font-mono text-[9px] px-1.5 py-0.5">21:9 UW</span>`
      : `<span class="badge bg-slate-700 text-white font-mono text-[9px] px-1.5 py-0.5">16:9</span>`;

    return `
      <button type="button" onclick="setIfpdPresetDiagonal(${p.diag})" 
        class="p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${borderStyle} w-100">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-sm text-slate-900 font-mono">${p.diag}"</span>
            ${aspectBadge}
          </div>
          ${statusTag}
        </div>
        <div class="text-[11.5px] font-mono text-slate-800 font-bold">
          ${p.w} × ${p.h} mm
        </div>
        <div class="text-[10px] font-mono text-slate-500">
          (${wFt} × ${hFt} ft) • <strong class="text-sky-700">${p.res || '4K UHD'}</strong>
        </div>
        <div class="text-[9.5px] font-semibold text-emerald-700 mt-1">
          <i class="fa-solid fa-hand-pointer me-1"></i>${p.tech || 'Touch Surface'}
        </div>
        <div class="text-[9.5px] text-slate-500 mt-1 pt-1 border-t border-slate-100 truncate" title="${p.brands || ''}">
          <i class="fa-solid fa-tag me-1 text-sky-600"></i>${p.brands || 'Global Standard'}
        </div>
      </button>
    `;
  }).join('');
}

function updateIfpdInspectorOutput() {
  const distMm = ifpdState.inspectorDistM * 1000;
  const screenTopMm = ifpdState.afflMm + ifpdState.imageHeightMm;
  const deltaEyeTopMm = screenTopMm - ifpdState.eyeHeightMm;
  
  const gazeRad = Math.atan2(deltaEyeTopMm, distMm);
  const gazeDeg = (gazeRad * 180 / Math.PI).toFixed(1);

  const elDist = document.getElementById('val-inspector-dist');
  if (elDist) {
    elDist.textContent = `Distance: ${ifpdState.inspectorDistM.toFixed(2)} m (${(ifpdState.inspectorDistM * 3.28084).toFixed(1)} ft)`;
  }

  const statusEl = document.getElementById('inspect-status-text');
  const angleEl = document.getElementById('inspect-angle-text');
  if (angleEl) angleEl.textContent = `Vertical Gaze Angle: ${gazeDeg}°`;

  const mult = (ifpdState.ehPercent * 200) / 100;
  const maxFvMm = ifpdState.imageHeightMm * mult;

  if (statusEl) {
    if (distMm < ifpdState.presenterBufferMm) {
      statusEl.textContent = "⚠ Inside Instructor Walking Buffer Zone";
      statusEl.className = "text-amber-600 font-semibold";
    } else if (distMm <= maxFvMm) {
      statusEl.textContent = "✓ Excellent text legibility & seating comfort";
      statusEl.className = "text-emerald-700 font-semibold";
    } else {
      statusEl.textContent = "⚠ Exceeds font legibility threshold";
      statusEl.className = "text-red-600 font-semibold";
    }
  }
}

// 2D SVG Blueprint
function renderIfpd2DPlan(dCvMm, dFvMm) {
  const svg = document.getElementById('svg-ifpd-floorplan');
  if (!svg) return;

  dCvMm = dCvMm || 1500;
  dFvMm = dFvMm || 6400;

  const svgW = 1000;
  const svgH = 650;
  const margin = 75;

  const roomL = ifpdState.roomLengthMm;
  const roomW = ifpdState.roomWidthMm;

  const maxDrawW = svgW - (margin * 2);
  const maxDrawH = svgH - (margin * 2);

  const scale = Math.min(maxDrawW / roomW, maxDrawH / roomL);
  const drawRoomW = roomW * scale;
  const drawRoomL = roomL * scale;

  const originX = (svgW - drawRoomW) / 2;
  const originY = margin;

  const screenWidthScaled = Math.min(drawRoomW * 0.9, ifpdState.imageWidthMm * scale);
  const screenX1 = originX + (drawRoomW / 2) - (screenWidthScaled / 2);
  const screenX2 = screenX1 + screenWidthScaled;
  const screenY = originY;

  const centerX = originX + (drawRoomW / 2);
  const dCvY = originY + (dCvMm * scale);
  const dFvY = originY + (dFvMm * scale);
  const inspectorY = originY + (ifpdState.inspectorDistM * 1000 * scale);

  const coneDepthMm = Math.min(dFvMm, roomL);
  const coneDepthScaled = coneDepthMm * scale;
  const coneLeftX = Math.max(originX, centerX - coneDepthScaled);
  const coneRightX = Math.min(originX + drawRoomW, centerX + coneDepthScaled);

  const deskRows = [];
  const rowStartY = dCvY + 15;
  const rowEndY = Math.min(originY + drawRoomL - 30, dFvY);
  const rowSpacing = 35;

  for (let y = rowStartY; y <= rowEndY; y += rowSpacing) {
    deskRows.push(y);
  }

  svg.innerHTML = `
    <defs>
      <pattern id="hatch-buffer-light" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="12" stroke="#f59e0b" stroke-width="1.5" stroke-opacity="0.3" />
      </pattern>
      <linearGradient id="cone-grad-light" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.02" />
      </linearGradient>
    </defs>

    <rect x="${originX}" y="${originY}" width="${drawRoomW}" height="${drawRoomL}" rx="8" 
      fill="#f8fafc" stroke="#334155" stroke-width="3" />

    <polygon points="${centerX},${screenY} ${coneLeftX},${screenY + coneDepthScaled} ${coneRightX},${screenY + coneDepthScaled}" 
      fill="url(#cone-grad-light)" stroke="#6366f1" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.5"/>

    <rect x="${originX + 1}" y="${originY + 1}" width="${drawRoomW - 2}" height="${ifpdState.presenterBufferMm * scale}" 
      fill="url(#hatch-buffer-light)" />

    ${deskRows.map(ry => `
      <g opacity="0.75">
        <rect x="${centerX - (drawRoomW * 0.35)}" y="${ry}" width="${drawRoomW * 0.7}" height="12" rx="3" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" />
        <circle cx="${centerX - (drawRoomW * 0.2)}" cy="${ry + 18}" r="4" fill="#64748b" />
        <circle cx="${centerX}" cy="${ry + 18}" r="4" fill="#64748b" />
        <circle cx="${centerX + (drawRoomW * 0.2)}" cy="${ry + 18}" r="4" fill="#64748b" />
      </g>
    `).join('')}

    <circle cx="${centerX}" cy="${originY + ((ifpdState.presenterBufferMm * scale) / 2)}" r="9" fill="#d97706" />
    <text x="${centerX + 14}" y="${originY + ((ifpdState.presenterBufferMm * scale) / 2) + 4}" fill="#b45309" font-size="10" font-family="JetBrains Mono" font-weight="600">Instructor Zone (${(ifpdState.presenterBufferMm/1000).toFixed(1)}m)</text>

    <rect x="${screenX1}" y="${screenY - 10}" width="${screenWidthScaled}" height="16" rx="4" 
      fill="#0284c7" stroke="#0369a1" stroke-width="2" />
    <line x1="${screenX1}" y1="${screenY + 6}" x2="${screenX2}" y2="${screenY + 6}" stroke="#38bdf8" stroke-width="3" />
    <text x="${centerX}" y="${screenY - 16}" text-anchor="middle" fill="#0369a1" font-size="11" font-family="JetBrains Mono" font-weight="700">
      ${ifpdState.diagonalInches}" IFPD (${ifpdState.imageWidthMm} × ${ifpdState.imageHeightMm} mm)
    </text>

    <line x1="${originX}" y1="${dCvY}" x2="${originX + drawRoomW}" y2="${dCvY}" 
      stroke="#0284c7" stroke-width="2" stroke-dasharray="6 3" />
    <text x="${originX + 26}" y="${dCvY - 6}" fill="#0284c7" font-size="11" font-family="JetBrains Mono" font-weight="700">
      1st Student Row (D_cv): ${(dCvMm / 1000).toFixed(2)} m / ${(dCvMm * IFPD_MM_TO_FT).toFixed(1)} ft
    </text>

    ${dFvY <= originY + drawRoomL ? `
      <line x1="${originX}" y1="${dFvY}" x2="${originX + drawRoomW}" y2="${dFvY}" 
        stroke="#d97706" stroke-width="2" stroke-dasharray="6 3" />
      <text x="${originX + 26}" y="${dFvY - 6}" fill="#d97706" font-size="11" font-family="JetBrains Mono" font-weight="700">
        Last Student Row (D_fv): ${(dFvMm / 1000).toFixed(2)} m / ${(dFvMm * IFPD_MM_TO_FT).toFixed(1)} ft
      </text>
    ` : `
      <line x1="${originX}" y1="${originY + drawRoomL}" x2="${originX + drawRoomW}" y2="${originY + drawRoomL}" 
        stroke="#dc2626" stroke-width="3" />
      <text x="${centerX}" y="${originY + drawRoomL + 20}" text-anchor="middle" fill="#dc2626" font-size="11" font-family="JetBrains Mono" font-weight="700">
        D_fv (${(dFvMm / 1000).toFixed(2)}m) reaches beyond back wall (${(roomL / 1000).toFixed(2)}m)
      </text>
    `}

    ${inspectorY <= originY + drawRoomL ? `
      <circle cx="${centerX}" cy="${inspectorY}" r="7" fill="#4f46e5" stroke="#ffffff" stroke-width="2" />
      <line x1="${centerX}" y1="${screenY + 6}" x2="${centerX}" y2="${inspectorY}" stroke="#4f46e5" stroke-width="1.5" stroke-dasharray="2 2" />
    ` : ''}

    <g stroke="#94a3b8" stroke-width="1">
      <line x1="${originX}" y1="${originY - 32}" x2="${originX + drawRoomW}" y2="${originY - 32}" />
      <line x1="${originX}" y1="${originY - 38}" x2="${originX}" y2="${originY - 26}" />
      <line x1="${originX + drawRoomW}" y1="${originY - 38}" x2="${originX + drawRoomW}" y2="${originY - 26}" />
    </g>
    <text x="${centerX}" y="${originY - 40}" text-anchor="middle" fill="#475569" font-size="11" font-family="JetBrains Mono" font-weight="600">
      Room Width: ${(roomW / 1000).toFixed(2)} m (${(roomW * IFPD_MM_TO_FT).toFixed(1)} ft)
    </text>

    <g stroke="#94a3b8" stroke-width="1">
      <line x1="${originX + drawRoomW + 32}" y1="${originY}" x2="${originX + drawRoomW + 32}" y2="${originY + drawRoomL}" />
      <line x1="${originX + drawRoomW + 26}" y1="${originY}" x2="${originX + drawRoomW + 38}" y2="${originY}" />
      <line x1="${originX + drawRoomW + 26}" y1="${originY + drawRoomL}" x2="${originX + drawRoomW + 38}" y2="${originY + drawRoomL}" />
    </g>
    <text x="${originX + drawRoomW + 42}" y="${originY + (drawRoomL / 2)}" text-anchor="start" dominant-baseline="middle" 
      fill="#475569" font-size="11" font-family="JetBrains Mono" font-weight="600" transform="rotate(90 ${originX + drawRoomW + 42} ${originY + (drawRoomL / 2)})">
      Room Length: ${(roomL / 1000).toFixed(2)} m (${(roomL * IFPD_MM_TO_FT).toFixed(1)} ft)
    </text>
  `;
}

// 3D Isometric View with Realistic Textures, Sightline Cone and Full-Window Scaling
function renderIfpd3DIsometric(dCvMm, dFvMm) {
  const svg = document.getElementById('svg-ifpd-isometric');
  if (!svg) return;

  dCvMm = dCvMm || 1500;
  dFvMm = dFvMm || 6400;

  const roomL = ifpdState.roomLengthMm;
  const roomW = ifpdState.roomWidthMm;
  const ceilingH = 3000;
  const w2 = roomW / 2;
  const actualLastMm = Math.min(dFvMm, roomL);

  // Raw isometric projection (without scale/offset)
  const cos30 = 0.866025;
  const sin30 = 0.5;
  function rawProject(x, y, z) {
    return {
      x: (y * cos30) - (x * cos30),
      y: (y * sin30) + (x * sin30) - z
    };
  }

  // Key architectural bounding points
  const testPoints = [
    rawProject(-w2, 0, 0),
    rawProject(w2, 0, 0),
    rawProject(w2, roomL, 0),
    rawProject(-w2, roomL, 0),
    rawProject(-w2, 0, ceilingH),
    rawProject(w2, 0, ceilingH),
    rawProject(w2, roomL, ceilingH),
    rawProject(-w2, roomL, ceilingH)
  ];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  testPoints.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const rawW = maxX - minX;
  const rawH = maxY - minY;

  // ViewBox bounds: 1000 x 640 with balanced padding
  const svgW = 1000;
  const svgH = 640;
  const padX = 60;
  const padY = 50;

  const availW = svgW - padX * 2;
  const availH = svgH - padY * 2;
  const scale = Math.min(availW / rawW, availH / rawH);

  const offsetX = padX + (availW - rawW * scale) / 2 - minX * scale;
  const offsetY = padY + (availH - rawH * scale) / 2 - minY * scale;

  function project(x, y, z) {
    const raw = rawProject(x, y, z);
    return {
      x: offsetX + raw.x * scale,
      y: offsetY + raw.y * scale
    };
  }

  const pFrontLeft = project(-w2, 0, 0);
  const pFrontRight = project(w2, 0, 0);
  const pBackRight = project(w2, roomL, 0);
  const pBackLeft = project(-w2, roomL, 0);

  const pFrontLeftTop = project(-w2, 0, ceilingH);
  const pFrontRightTop = project(w2, 0, ceilingH);
  const pBackRightTop = project(w2, roomL, ceilingH);
  const pBackLeftTop = project(-w2, roomL, ceilingH);

  const sw2 = ifpdState.imageWidthMm / 2;
  const dBottom = ifpdState.afflMm;
  const dTop = ifpdState.afflMm + ifpdState.imageHeightMm;

  const pDispBL = project(-sw2, 0, dBottom);
  const pDispBR = project(sw2, 0, dBottom);
  const pDispTR = project(sw2, 0, dTop);
  const pDispTL = project(-sw2, 0, dTop);

  const presY = Math.min(ifpdState.presenterBufferMm * 0.6, 900);
  const pPresFoot = project(0, presY, 0);
  const pPresHead = project(0, presY, 1750);

  const pView1Foot = project(0, dCvMm, 0);
  const pView1Eye = project(0, dCvMm, ifpdState.eyeHeightMm);

  const pViewLastFoot = project(0, actualLastMm, 0);
  const pViewLastEye = project(0, actualLastMm, ifpdState.eyeHeightMm);

  const pScreenCenterTop = project(0, 0, dTop);
  const pScreenCenterBottom = project(0, 0, dBottom);

    // Generate Student Desks & Seated Students in Multiple Rows
    const isKids = ifpdState.roomAudienceType === 'classroom_kids';
    const deskW = isKids ? 1000 : 1200;
    const deskD = isKids ? 500 : 600;
    const deskH = isKids ? 600 : 720;
    const chairEyeH = ifpdState.eyeHeightMm;

    function renderStudentAtDesk(centerX, centerY, isFirstRow, isLastRow, label) {
      // 3D coordinates for desk
      const dTL = project(centerX - deskW / 2, centerY - deskD / 2, deskH);
      const dTR = project(centerX + deskW / 2, centerY - deskD / 2, deskH);
      const dBR = project(centerX + deskW / 2, centerY + deskD / 2, deskH);
      const dBL = project(centerX - deskW / 2, centerY + deskD / 2, deskH);

      // Desk legs
      const leg1Base = project(centerX - deskW / 2 + 30, centerY - deskD / 2 + 30, 0);
      const leg2Base = project(centerX + deskW / 2 - 30, centerY - deskD / 2 + 30, 0);
      const leg3Base = project(centerX + deskW / 2 - 30, centerY + deskD / 2 - 30, 0);
      const leg4Base = project(centerX - deskW / 2 + 30, centerY + deskD / 2 - 30, 0);

      // Chair position (slightly behind desk)
      const chairY = centerY + deskD / 2 + (isKids ? 200 : 250);
      const chairSeatH = isKids ? 350 : 450;
      const cBase = project(centerX, chairY, 0);
      const cSeat = project(centerX, chairY, chairSeatH);
      const cBack = project(centerX, chairY + 80, chairSeatH + (isKids ? 300 : 400));

      // Student Head & Body
      const sHead = project(centerX, chairY, chairEyeH);
      const sTorsoBase = project(centerX, chairY, chairSeatH);
      const sHands = project(centerX, centerY, deskH + 20);

      const colorMain = isFirstRow ? '#0284c7' : (isLastRow ? '#ea580c' : '#475569');
      const headColor = isFirstRow ? '#38bdf8' : (isLastRow ? '#fb923c' : '#64748b');

      return `
        <!-- Desk Legs -->
        <line x1="${dTL.x}" y1="${dTL.y}" x2="${leg1Base.x}" y2="${leg1Base.y}" stroke="#64748b" stroke-width="2"/>
        <line x1="${dTR.x}" y1="${dTR.y}" x2="${leg2Base.x}" y2="${leg2Base.y}" stroke="#64748b" stroke-width="2"/>
        <line x1="${dBR.x}" y1="${dBR.y}" x2="${leg3Base.x}" y2="${leg3Base.y}" stroke="#64748b" stroke-width="2"/>
        <line x1="${dBL.x}" y1="${dBL.y}" x2="${leg4Base.x}" y2="${leg4Base.y}" stroke="#64748b" stroke-width="2"/>

        <!-- Desk Surface -->
        <polygon points="${dTL.x},${dTL.y} ${dTR.x},${dTR.y} ${dBR.x},${dBR.y} ${dBL.x},${dBL.y}"
          fill="${isKids ? '#fef08a' : '#f1f5f9'}" stroke="#94a3b8" stroke-width="1.5" />
        
        <!-- Notebook / Laptop on Desk -->
        ${isKids ? `
          <rect x="${dBL.x + 20}" y="${dBL.y - 14}" width="22" height="15" fill="#f43f5e" rx="2" stroke="#e11d48"/>
          <rect x="${dBL.x + 48}" y="${dBL.y - 12}" width="18" height="12" fill="#38bdf8" rx="2"/>
        ` : `
          <polygon points="${dBL.x + 25},${dBL.y - 8} ${dBL.x + 55},${dBL.y - 8} ${dBL.x + 50},${dBL.y - 20} ${dBL.x + 30},${dBL.y - 20}" fill="#334155" stroke="#0284c7" stroke-width="1.2"/>
        `}

        <!-- Chair -->
        <line x1="${cBase.x}" y1="${cBase.y}" x2="${cSeat.x}" y2="${cSeat.y}" stroke="#475569" stroke-width="3"/>
        <ellipse cx="${cSeat.x}" cy="${cSeat.y}" rx="${isKids ? 10 : 13}" ry="${isKids ? 5 : 7}" fill="#334155"/>
        <line x1="${cSeat.x}" y1="${cSeat.y}" x2="${cBack.x}" y2="${cBack.y}" stroke="#1e293b" stroke-width="3.5"/>

        <!-- Seated Student Body -->
        <line x1="${sTorsoBase.x}" y1="${sTorsoBase.y}" x2="${sHead.x}" y2="${sHead.y + 12}" stroke="${colorMain}" stroke-width="${isKids ? 4 : 5}"/>
        <line x1="${sHead.x}" y1="${sHead.y + 16}" x2="${sHands.x}" y2="${sHands.y}" stroke="${colorMain}" stroke-width="2.5"/>
        
        <!-- Student Head -->
        <circle cx="${sHead.x}" cy="${sHead.y}" r="${isKids ? 6.5 : 8}" fill="${headColor}" stroke="#ffffff" stroke-width="1.5"/>

        <!-- Label Callout -->
        ${label ? `
          <rect x="${sHead.x - 55}" y="${sHead.y - 32}" width="110" height="18" fill="#ffffff" rx="4" stroke="${colorMain}" stroke-width="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"/>
          <text x="${sHead.x}" y="${sHead.y - 20}" font-size="8" font-weight="bold" fill="${colorMain}" text-anchor="middle" font-family="JetBrains Mono">${label}</text>
        ` : ''}
      `;
    }

    // Render 1st Row Students (Left, Center, Right)
    const row1Svg = `
      ${renderStudentAtDesk(-w2 * 0.45, dCvMm, true, false, '')}
      ${renderStudentAtDesk(0, dCvMm, true, false, `1st Row: ${(dCvMm).toFixed(0)} mm`)}
      ${renderStudentAtDesk(w2 * 0.45, dCvMm, true, false, '')}
    `;

    // Render Middle Row Students
    const midY = (dCvMm + actualLastMm) / 2;
    const midRowSvg = `
      ${renderStudentAtDesk(-w2 * 0.45, midY, false, false, '')}
      ${renderStudentAtDesk(0, midY, false, false, `Mid: ${(midY).toFixed(0)} mm`)}
      ${renderStudentAtDesk(w2 * 0.45, midY, false, false, '')}
    `;

    // Render Last Row Students (Legibility Limit)
    const lastRowSvg = `
      ${renderStudentAtDesk(-w2 * 0.45, actualLastMm, false, true, '')}
      ${renderStudentAtDesk(0, actualLastMm, false, true, `Last Row: ${(actualLastMm).toFixed(0)} mm`)}
      ${renderStudentAtDesk(w2 * 0.45, actualLastMm, false, true, '')}
    `;

    svg.innerHTML = `
    <defs>
      <linearGradient id="iso-wall-light" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#e2e8f0" />
      </linearGradient>
      <linearGradient id="iso-side-wall" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f1f5f9" />
        <stop offset="100%" stop-color="#cbd5e1" />
      </linearGradient>
      <linearGradient id="sightline-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.10" />
      </linearGradient>
      <linearGradient id="iso-floor-architect" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f1f5f9" />
        <stop offset="100%" stop-color="#e2e8f0" />
      </linearGradient>
    </defs>

    <!-- Floor Surface -->
    <polygon points="${pFrontLeft.x},${pFrontLeft.y} ${pFrontRight.x},${pFrontRight.y} ${pBackRight.x},${pBackRight.y} ${pBackLeft.x},${pBackLeft.y}" 
      fill="url(#iso-floor-architect)" stroke="#cbd5e1" stroke-width="1.5" />

    <!-- Front Wall -->
    <polygon points="${pFrontLeft.x},${pFrontLeft.y} ${pFrontRight.x},${pFrontRight.y} ${pFrontRightTop.x},${pFrontRightTop.y} ${pFrontLeftTop.x},${pFrontLeftTop.y}" 
      fill="url(#iso-wall-light)" stroke="#cbd5e1" stroke-width="1.5" />

    <!-- Left Side Wall -->
    <polygon points="${pFrontLeft.x},${pFrontLeft.y} ${pBackLeft.x},${pBackLeft.y} ${pBackLeftTop.x},${pBackLeftTop.y} ${pFrontLeftTop.x},${pFrontLeftTop.y}" 
      fill="url(#iso-side-wall)" stroke="#cbd5e1" stroke-width="1" />

    <!-- Presenter Buffer Zone (1.5m / 1.2m) -->
    ${(() => {
      const pbFL = project(-w2, 0, 0);
      const pbFR = project(w2, 0, 0);
      const pbBR = project(w2, ifpdState.presenterBufferMm, 0);
      const pbBL = project(-w2, ifpdState.presenterBufferMm, 0);
      return `<polygon points="${pbFL.x},${pbFL.y} ${pbFR.x},${pbFR.y} ${pbBR.x},${pbBR.y} ${pbBL.x},${pbBL.y}" 
        fill="#fef3c7" fill-opacity="0.4" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="4 3" />`;
    })()}

    <!-- 1st Row Guide Line -->
    ${(() => {
      const rL = project(-w2 * 0.85, dCvMm, 0);
      const rR = project(w2 * 0.85, dCvMm, 0);
      return `<line x1="${rL.x}" y1="${rL.y}" x2="${rR.x}" y2="${rR.y}" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="5 3" />`;
    })()}

    <!-- Last Row Guide Line -->
    ${(() => {
      const rL = project(-w2 * 0.85, actualLastMm, 0);
      const rR = project(w2 * 0.85, actualLastMm, 0);
      return `<line x1="${rL.x}" y1="${rL.y}" x2="${rR.x}" y2="${rR.y}" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="5 3" />`;
    })()}

    <!-- Seated Students at Desks (All 3 Rows) -->
    ${lastRowSvg}
    ${midRowSvg}
    ${row1Svg}

    <!-- INTERACTIVE TOUCH FLAT PANEL (IFPD) ON WALL -->
    <polygon points="${pDispBL.x},${pDispBL.y} ${pDispBR.x},${pDispBR.y} ${pDispTR.x},${pDispTR.y} ${pDispTL.x},${pDispTL.y}" 
      fill="#0f172a" stroke="#2563eb" stroke-width="3" />
    <!-- Whiteboard Writing Canvas -->
    <polygon points="${pDispBL.x + 3},${pDispBL.y - 3} ${pDispBR.x - 3},${pDispBR.y - 3} ${pDispTR.x - 3},${pDispTR.y + 3} ${pDispTL.x + 3},${pDispTL.y + 3}" 
      fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
    <text x="${(pDispBL.x + pDispTR.x) / 2}" y="${(pDispBL.y + pDispTR.y) / 2}" fill="#38bdf8" font-size="11" font-family="JetBrains Mono" font-weight="bold" text-anchor="middle">
      ${ifpdState.diagonalInches}" IFPD (${ifpdState.imageWidthMm} × ${ifpdState.imageHeightMm} mm)
    </text>

    <!-- Height & AFFL Annotation -->
    <line x1="${pDispBR.x + 10}" y1="${pDispBR.y}" x2="${pDispTR.x + 10}" y2="${pDispTR.y}" stroke="#2563eb" stroke-width="1.8" />
    <text x="${pDispTR.x + 16}" y="${pDispTR.y + 14}" fill="#1d4ed8" font-size="9.5" font-family="JetBrains Mono" font-weight="bold">
      Screen H: ${ifpdState.imageHeightMm} mm | AFFL: ${ifpdState.afflMm} mm
    </text>

    <!-- STANDING INSTRUCTOR / TEACHER WITH STYLUS -->
    <g stroke="#d97706" stroke-width="2.5">
      <line x1="${pPresFoot.x}" y1="${pPresFoot.y}" x2="${pPresHead.x}" y2="${pPresHead.y + 14}" stroke="#b45309" stroke-width="4"/>
      <circle cx="${pPresHead.x}" cy="${pPresHead.y}" r="7" fill="#d97706" stroke="#ffffff" stroke-width="1.5"/>
      <!-- Arm pointing to display with interactive pen -->
      <line x1="${pPresHead.x}" y1="${pPresHead.y + 16}" x2="${pDispBL.x + 35}" y2="${pDispBL.y - 35}" stroke="#d97706" stroke-width="2" />
      <circle cx="${pDispBL.x + 35}" cy="${pDispBL.y - 35}" r="3" fill="#22c55e" />
    </g>
    <text x="${pPresHead.x - 30}" y="${pPresHead.y - 12}" fill="#b45309" font-size="9" font-family="JetBrains Mono" font-weight="bold">Teacher (Stylus Touch)</text>

    <!-- SIGHTLINES: 1ST ROW SIGHTLINE CONE (Max 30° Vertical Gaze) -->
    <polygon points="${pView1Eye.x},${pView1Eye.y} ${pScreenCenterTop.x},${pScreenCenterTop.y} ${pScreenCenterBottom.x},${pScreenCenterBottom.y}" 
      fill="url(#sightline-cyan)" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="4 2" />

    <line x1="${pView1Eye.x}" y1="${pView1Eye.y}" x2="${pScreenCenterTop.x}" y2="${pScreenCenterTop.y}" stroke="#0284c7" stroke-width="2" />
    <text x="${pView1Eye.x - 70}" y="${pView1Eye.y - 14}" fill="#0284c7" font-size="10" font-family="JetBrains Mono" font-weight="bold">
      Max 30° Vertical Gaze (PASS)
    </text>

    <!-- SIGHTLINES: LAST ROW LEGIBILITY SIGHTLINE -->
    <line x1="${pViewLastEye.x}" y1="${pViewLastEye.y}" x2="${pScreenCenterTop.x}" y2="${pScreenCenterTop.y}" stroke="#ea580c" stroke-width="1.8" stroke-dasharray="4 3" />

    <!-- FLOATING RECOMMENDATION HUD BANNER -->
    <g transform="translate(40, 40)">
      <rect x="0" y="0" width="360" height="62" fill="#ffffff" rx="8" stroke="#2563eb" stroke-width="1.5" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.06))"/>
      <circle cx="16" cy="18" r="5" fill="#2563eb"/>
      <text x="28" y="22" font-size="10.5" font-weight="800" fill="#1e293b" font-family="Inter">RECOMMENDED DISPLAY SIZING:</text>
      <text x="200" y="22" font-size="10.5" font-weight="800" fill="#2563eb" font-family="JetBrains Mono">${ifpdState.diagonalInches}" IFPD</text>
      <text x="14" y="40" font-size="8.5" font-weight="bold" fill="#0284c7" font-family="JetBrains Mono">
        1st Person: ${(dCvMm).toFixed(0)} mm | Last Person: ${(actualLastMm).toFixed(0)} mm
      </text>
      <text x="14" y="53" font-size="8" font-weight="bold" fill="#64748b" font-family="Inter">
        Profile: ${isKids ? 'Kids Classroom (AFFL 650mm | Eye 900mm)' : 'Adult Training (AFFL 900mm | Eye 1200mm)'}
      </text>
    </g>
  `;
}

function switchIfpdVisualTab(tab) {
  ifpdState.activeTab = tab;
  const container2D = document.getElementById('container-ifpd-visual-2d');
  const container3D = document.getElementById('container-ifpd-visual-3d');
  const btn2D = document.getElementById('btn-ifpd-tab-2d');
  const btn3D = document.getElementById('btn-ifpd-tab-3d');

  if (tab === '2d') {
    if (container2D) container2D.classList.remove('hidden');
    if (container3D) container3D.classList.add('hidden');
    if (btn2D) btn2D.className = "px-3 py-1.5 rounded-lg font-semibold bg-white text-sky-700 shadow-sm border border-slate-200 transition";
    if (btn3D) btn3D.className = "px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition";
  } else {
    if (container2D) container2D.classList.add('hidden');
    if (container3D) container3D.classList.remove('hidden');
    if (btn3D) btn3D.className = "px-3 py-1.5 rounded-lg font-semibold bg-white text-sky-700 shadow-sm border border-slate-200 transition";
    if (btn2D) btn2D.className = "px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition";
  }
}

function toggleIfpdAccordion(btn) {
  const parent = btn.closest('.accordion');
  if (parent) parent.classList.toggle('accordion-open');
}

function resetIfpdDefaults() {
  ifpdState.mode = 'recommend';
  ifpdState.roomLengthMm = 8000;
  ifpdState.roomWidthMm = 5500;
  ifpdState.diagonalInches = 86;
  ifpdState.imageWidthMm = 1904;
  ifpdState.imageHeightMm = 1071;
  ifpdState.verticalRes = 2160;
  ifpdState.afflMm = 900;
  ifpdState.eyeHeightMm = 1200;
  ifpdState.presenterBufferMm = 1500;
  ifpdState.taskType = 'BDM';
  ifpdState.ehPercent = 3.0;

  const lenMm = document.getElementById('in-room-len-mm');
  if (lenMm) lenMm.value = 8000;
  const lenFt = document.getElementById('in-room-len-ft');
  if (lenFt) lenFt.value = (8000 * IFPD_MM_TO_FT).toFixed(2);
  const widMm = document.getElementById('in-room-wid-mm');
  if (widMm) widMm.value = 5500;
  const widFt = document.getElementById('in-room-wid-ft');
  if (widFt) widFt.value = (5500 * IFPD_MM_TO_FT).toFixed(2);
  const dInp = document.getElementById('in-custom-diag');
  if (dInp) dInp.value = 86;
  const wInp = document.getElementById('in-custom-width-mm');
  if (wInp) wInp.value = 1904;
  const rInp = document.getElementById('in-res-vr');
  if (rInp) rInp.value = "2160";
  const afflInp = document.getElementById('in-affl-mm');
  if (afflInp) afflInp.value = 900;
  const eyeInp = document.getElementById('in-eye-height-mm');
  if (eyeInp) eyeInp.value = 1200;
  const buffInp = document.getElementById('in-presenter-buffer-mm');
  if (buffInp) buffInp.value = 1500;
  const ehInp = document.getElementById('in-eh-percent');
  if (ehInp) ehInp.value = 3.0;
  const ehTxt = document.getElementById('val-eh-text');
  if (ehTxt) ehTxt.textContent = "3.0% (Standard Teaching)";

  const bdmRadio = document.querySelector('input[name="ifpd-viewing-task"][value="BDM"]');
  if (bdmRadio) bdmRadio.checked = true;

  setIfpdCalculationMode('recommend');
}


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

  renderLedScreenSvg(widthMm, heightMm, diagInches, activeLedRatio);
}

function renderLedScreenSvg(widthMm, heightMm, diagInches, ratioStr) {
  var container = document.getElementById('ledScreenSvgContainer');
  if (!container) return;
  var maxSvgW = 540, maxSvgH = 240;
  var aspect = widthMm / heightMm;
  var rectW = maxSvgW - 100;
  var rectH = rectW / aspect;

  if (rectH > maxSvgH - 60) { rectH = maxSvgH - 60; rectW = rectH * aspect; }
  var startX = (maxSvgW - rectW) / 2;
  var startY = (maxSvgH - rectH) / 2 + 10;

  container.innerHTML = `<svg viewBox="0 0 ${maxSvgW} ${maxSvgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect x="${startX}" y="${startY}" width="${rectW}" height="${rectH}" fill="#1e293b" stroke="#38bdf8" stroke-width="3" rx="6"/>
    <line x1="${startX+4}" y1="${startY+4}" x2="${startX+rectW-4}" y2="${startY+rectH-4}" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3"/>
    <text x="${startX + rectW/2}" y="${startY-16}" font-size="12" font-weight="bold" fill="#38bdf8" text-anchor="middle">WIDTH: ${Math.round(widthMm)} mm (${(widthMm/304.8).toFixed(1)} ft)</text>
    <text x="${startX-16}" y="${startY + rectH/2}" font-size="11" font-weight="bold" fill="#4ade80" text-anchor="end" transform="rotate(-90 ${startX-16} ${startY+rectH/2})">LENGTH: ${Math.round(heightMm)} mm</text>
    <rect x="${startX + rectW/2 - 80}" y="${startY + rectH/2 - 14}" width="160" height="28" fill="#0f172a" rx="14" stroke="#ef4444"/>
    <text x="${startX + rectW/2}" y="${startY + rectH/2 + 4}" font-size="12" font-weight="bold" fill="#f8fafc" text-anchor="middle">DIAGONAL: ${diagInches.toFixed(1)}" (${ratioStr})</text>
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
    directCallout.innerHTML = `
      <div class="small text-secondary fw-semibold mb-0" style="font-size:0.75rem;">DIRECT CONVERSION RESULT:</div>
      <div class="fs-6 fw-bold text-dark font-monospace my-1">
        <span class="text-secondary">${formatConvertedValue(val)} ${unitNames[type] || type}</span>
        <i class="fa-solid fa-arrow-right mx-1 text-primary"></i>
        <span class="text-primary fs-5">${formatConvertedValue(targetVal)} ${targetName}</span>
      </div>
    `;
  }

  // Update full breakdown list
  var el = document.getElementById('resUniversalAreaList');
  if (el) {
    el.innerHTML = `
      <div class="p-1 mb-2 rounded bg-white border border-primary text-primary font-monospace fw-bold shadow-2xs">
        <i class="fa-solid fa-arrows-to-dot me-1"></i><strong>${formatConvertedValue(sqin)} sq in (in²)</strong>
      </div>
      <div class="text-dark py-0.5">• <strong>${formatConvertedValue(sqft)} ft²</strong></div>
      <div class="text-dark py-0.5">• <strong>${formatConvertedValue(sqm)} m²</strong></div>
      <div class="text-secondary py-0.5">• ${formatConvertedValue(sqcm)} cm² (${formatConvertedValue(sqmm)} mm²)</div>
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
      fallbackCopy(valStr, btn);
    });
  } else {
    fallbackCopy(valStr, btn);
  }
}

function fallbackCopy(text, btn) {
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
    name: 'Neutrik speakON 4-Pole 12AWG Heavy-Duty Loudspeaker Cable',
    maxPassiveM: 100.0,
    maxBandwidth: 'High-Current Low-Impedance Loudspeaker Audio (Up to 40A RMS continuous)',
    connector: 'Neutrik speakON NL4FX 4-Pole Quick Twist-Lock Connector',
    pinout: 'Pole 1+: Ch 1 Positive, Pole 1-: Ch 1 Negative; Pole 2+: Ch 2 / Bi-Amp Sub Positive, Pole 2-: Ch 2 / Bi-Amp Sub Negative.',
    alternative: 'Convert to 70V / 100V Constant Voltage Distributed High-Impedance Line System.'
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


// ==========================================
// TAB 10: SPATIAL ROOM MATRIX LOGIC
// ==========================================
let roomRowsCount = 0;
let roomScaledChart = null;

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
  { floor: "01", name: "Executive Boardroom", qty: 1, seats: 16, w: 6000, l: 9000, h: 2700, purpose: "meeting", pitch: 1.25, note: "VIP Boardroom", color: "#f0fdf4" },
  { floor: "01", name: "Teams UC Room 101", qty: 2, seats: 8, w: 4500, l: 6000, h: 2700, purpose: "uc", pitch: 1.25, note: "Teams Bar", color: "#f0fdf4" },
  { floor: "02", name: "Training Lab 201", qty: 1, seats: 24, w: 5500, l: 8000, h: 2700, purpose: "interactive", pitch: 1.25, note: "Touch IFPD", color: "#eff6ff" },
  { floor: "02", name: "Main Auditorium", qty: 1, seats: 120, w: 15000, l: 20000, h: 5000, purpose: "videowall", pitch: 1.5, note: "dvLED Wall", color: "#eff6ff" },
  { floor: "03", name: "Design Huddle 301", qty: 3, seats: 6, w: 4000, l: 5000, h: 2700, purpose: "meeting", pitch: 1.25, note: "Acoustic Clouds", color: "#f5f3ff" },
  { floor: "04", name: "Operations NOC 401", qty: 1, seats: 18, w: 7000, l: 11000, h: 3000, purpose: "adm", pitch: 0.9, note: "24/7 Command Center", color: "#fffbeb" }
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
    if (!e.target.closest('input, select, textarea, button')) {
      selectMatrixRoomFor3D(this);
    }
  };

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

  tr.innerHTML = `
    <td class="matrix-td text-center sl-no-cell" style="background:${floorPal.bgLight};">
      <span class="badge" style="background:${floorPal.badgeBg}; color:#fff; font-size:0.75rem; font-weight:700;">${String(rowIdx).padStart(2, '0')}</span>
    </td>
    <td class="matrix-td">
      <input type="text" class="form-control matrix-input inp-floor fw-bold text-center shadow-xs" value="${data.floor}" style="width:48px; background:${floorPal.bgLight}; color:${floorPal.text}; border:2px solid ${floorPal.badgeBg}; border-radius:6px;" oninput="onFloorChanged(this)" title="Floor ${data.floor} (${floorPal.name})">
    </td>
    <td class="matrix-td">
      <div class="d-flex align-items-center gap-1">
        <input type="color" class="form-control form-control-color p-0 inp-color" value="${rowColorHex}" title="Custom Row Color Tint" style="width:22px; height:24px; min-width:22px; cursor:pointer;" onchange="applyRowColor(this)">
        <textarea class="form-control matrix-input inp-name fw-bold" rows="2" style="width:105px; font-size:0.8rem; padding: 2px 4px; border-left:3px solid ${purpPal.badgeBg}; resize:vertical; word-break:break-word; white-space:pre-wrap;" oninput="updateMatrixTotalsAndSummary()">${data.name}</textarea>
      </div>
    </td>
    <td class="matrix-td"><input type="number" class="form-control matrix-input inp-qty fw-bold text-primary" value="${data.qty}" min="1" style="width:48px;" oninput="updateMatrixTotalsAndSummary()"></td>
    <td class="matrix-td"><input type="number" class="form-control matrix-input inp-seats fw-bold text-success" value="${data.seats}" style="width:48px;" oninput="updateMatrixTotalsAndSummary()"></td>
    <td class="matrix-td" style="width:130px; min-width:130px;">
      <div class="d-flex flex-column gap-1">
        <div class="input-group input-group-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Net Usable Interior Length (clear finished wall-to-wall, not raw structural shell). Deduct 100-150mm per wall if reading from raw shell CAD."><input type="number" class="form-control matrix-input inp-lm" value="${data.l}" placeholder="mm" oninput="updateDimFromMmRow(this, 'l')"><span class="input-group-text px-1 py-0 font-monospace" style="font-size:0.65rem;" title="Net Clear Finished">mm</span></div>
        <div class="input-group input-group-sm" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Net Usable Interior Length in feet (clear finished wall-to-wall)."><input type="number" class="form-control matrix-input inp-lft text-primary fw-bold" value="${lFt}" step="0.1" placeholder="ft" oninput="updateDimFromFtRow(this, 'l')"><span class="input-group-text px-1 py-0 text-primary font-monospace" style="font-size:0.65rem;">ft</span></div>
      </div>
    </td>
    <td class="matrix-td" style="width:130px; min-width:130px;">
      <div class="d-flex flex-column gap-1">
        <div class="input-group input-group-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Net Usable Interior Width (clear finished side-to-side, not raw structural shell). Governs closest viewer (1.0xW) and horizontal viewing cone."><input type="number" class="form-control matrix-input inp-wm" value="${data.w}" placeholder="mm" oninput="updateDimFromMmRow(this, 'w')"><span class="input-group-text px-1 py-0 font-monospace" style="font-size:0.65rem;" title="Net Clear Finished">mm</span></div>
        <div class="input-group input-group-sm" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Net Usable Interior Width in feet (clear finished side-to-side)."><input type="number" class="form-control matrix-input inp-wft text-primary fw-bold" value="${wFt}" step="0.1" placeholder="ft" oninput="updateDimFromFtRow(this, 'w')"><span class="input-group-text px-1 py-0 text-primary font-monospace" style="font-size:0.65rem;">ft</span></div>
      </div>
    </td>
    <td class="matrix-td" style="width:130px; min-width:130px;">
      <div class="d-flex flex-column gap-1">
        <div class="input-group input-group-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Clear Finished Ceiling Height (AFFL to underside of finished ceiling / acoustic clouds, not raw slab-to-slab)."><input type="number" class="form-control matrix-input inp-hm" value="${data.h}" placeholder="mm" oninput="updateDimFromMmRow(this, 'h')"><span class="input-group-text px-1 py-0 font-monospace" style="font-size:0.65rem;" title="Clear AFFL to Ceiling">mm</span></div>
        <div class="input-group input-group-sm" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Clear Finished Ceiling Height in feet (AFFL to underside of ceiling / clouds)."><input type="number" class="form-control matrix-input inp-hft text-primary fw-bold" value="${hFt}" step="0.1" placeholder="ft" oninput="updateDimFromFtRow(this, 'h')"><span class="input-group-text px-1 py-0 text-primary font-monospace" style="font-size:0.65rem;">ft</span></div>
      </div>
    </td>
    <td class="matrix-td bg-calc text-center">
      <div class="d-flex flex-column gap-1 p-1 rounded bg-white border">
        <span class="out-sqm text-primary fw-bold">${sqm.toFixed(2)} m²</span>
        <span class="out-sqft text-secondary fw-bold" style="font-size:0.75rem;">${(sqm*10.7639).toFixed(1)} ft²</span>
      </div>
    </td>
    <td class="matrix-td bg-calc text-center discas-cell" style="width:150px; min-width:150px;">
      <select class="form-select form-select-sm matrix-input inp-purpose fw-bold mb-1 shadow-xs" style="font-size:0.72rem; padding: 2px 4px; border-color:${purpPal.badgeBg}; color:${purpPal.hex};" onchange="onPurposeChanged(this)">
        <option value="meeting" ${purpose === 'meeting' ? 'selected' : ''}>Meeting Room (6H)</option>
        <option value="uc" ${purpose === 'uc' ? 'selected' : ''}>UC Room (5H)</option>
        <option value="videowall" ${purpose === 'videowall' ? 'selected' : ''}>Videowall (dvLED AVIXA)</option>
        <option value="interactive" ${purpose === 'interactive' ? 'selected' : ''}>Interactive Touch (6H)</option>
        <option value="bdm" ${purpose === 'bdm' ? 'selected' : ''}>Basic Viewing (BDM 8H)</option>
        <option value="adm" ${purpose === 'adm' ? 'selected' : ''}>Analytical (ADM 4H)</option>
      </select>
      <div class="box-pitch-input mb-1 ${purpose === 'videowall' ? '' : 'd-none'}">
        <div class="input-group input-group-sm">
          <span class="input-group-text p-1" style="font-size:0.65rem;">Pitch:</span>
          <input type="number" class="form-control matrix-input inp-pitch p-1" value="${pitch}" step="0.05" min="0.5" max="10" style="font-size:0.72rem;" placeholder="mm" oninput="recalcRoomRow(this.closest('tr'))">
          <span class="input-group-text p-1" style="font-size:0.65rem;">mm</span>
        </div>
      </div>
      <div class="py-1 px-1 rounded text-center discas-result-box" style="background:#eff6ff; border:1px solid #bfdbfe;">
        <strong class="text-primary out-calc-diag" style="font-size:0.82rem;">${dispCalc.diagStr}</strong>
        <div class="small text-muted out-calc-dims" style="font-size:0.62rem; margin-top:1px;">${dispCalc.w_mm} × ${dispCalc.h_mm} mm</div>
        <div class="small text-secondary out-calc-dist" style="font-size:0.62rem; margin-top:1px;">1st: ${dispCalc.firstP.toFixed(1)}m | Last: ${dispCalc.lastP.toFixed(1)}m</div>
      </div>
    </td>
    <td class="matrix-td bg-calc text-center acoustics-cell" style="width:135px; min-width:135px;">
      <div class="py-1 px-1 rounded mb-1 text-center" style="background:#f0fdf4; border:1px solid #bbf7d0;">
        <div class="d-flex justify-content-between align-items-center px-1">
          <span class="badge bg-success" style="font-size:0.62rem;">Speech RT60</span>
          <strong class="text-success out-rt60" style="font-size:0.85rem;">${rt60_val.toFixed(2)}s</strong>
        </div>
        <div class="small text-muted" style="font-size:0.60rem; margin-top:1px;">Target: 0.45 – 0.60 s</div>
        <div class="badge ${speechBadgeClass}" style="font-size:0.60rem; margin-top:2px;">
          ${speechRating}
        </div>
        <div class="small text-secondary out-panels" style="font-size:0.60rem; margin-top:2px;">Panels: ${panels_req.toFixed(1)}m²</div>
      </div>
      <button type="button" class="btn btn-outline-primary p-0 px-1 w-100" style="font-size:0.65rem; font-weight:700;" onclick="sendRoomToAcousticsTab(this)" title="Open in Tab 6 Acoustics Designer"><i class="fa-solid fa-wave-square me-1"></i>Analyze in Tab 6</button>
    </td>
    <td class="matrix-td" style="width:90px; max-width:90px;"><input type="text" class="form-control matrix-input inp-note" value="${data.note || ''}" placeholder="Notes..." style="width:85px;" oninput="updateMatrixTotalsAndSummary()"></td>
    <td class="matrix-td text-center" style="width:75px;">
      <div class="d-flex justify-content-center gap-1">
        <button type="button" class="btn btn-sm btn-outline-primary py-0 px-1" onclick="copyRoomRow(this)" title="Duplicate Room Row"><i class="fa-solid fa-copy"></i></button>
        <button type="button" class="btn btn-sm btn-outline-danger py-0 px-1" onclick="removeRoomRow(this)" title="Delete Room Row"><i class="fa-solid fa-trash"></i></button>
      </div>
    </td>
  `;
  tbody.appendChild(tr);
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
  var note = tr.querySelector('.inp-note')?.value || '';
  var color = rgbToHex(tr.querySelector('.inp-color')?.value || '#ffffff');

  addRoomRowWithData({ floor: fl, name: name, qty: qty, seats: seats, w: wm, l: lm, h: hm, purpose: purpose, pitch: pitch, note: note, color: color });
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

  var outDiag = tr.querySelector('.out-calc-diag');
  if (outDiag) outDiag.innerText = dispCalc.diagStr;
  var outDims = tr.querySelector('.out-calc-dims');
  if (outDims) outDims.innerText = `${dispCalc.w_mm} × ${dispCalc.h_mm} mm`;
  var outDist = tr.querySelector('.out-calc-dist');
  if (outDist) outDist.innerText = `1st: ${dispCalc.firstP.toFixed(1)}m | Last: ${dispCalc.lastP.toFixed(1)}m`;

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

  updateMatrixTotalsAndSummary();
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
  let grandTotalRoomsCount = 0, grandTotalAreaSqm = 0, grandTotalVolCum = 0;

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

    if (!totalsByName[name]) {
      totalsByName[name] = { qty: 0, floors: new Set(), notes: new Set() };
    }
    totalsByName[name].qty += qty;
    if (fl) totalsByName[name].floors.add(fl);
    if (note) totalsByName[name].notes.add(note);

    grandTotalRoomsCount += qty;
    grandTotalAreaSqm += (sqm * qty);
    grandTotalVolCum += (cum * qty);
  });

  var elTotR = document.getElementById('matrixTotalRoomsBadge');
  if (elTotR) elTotR.innerText = grandTotalRoomsCount;
  var elTotA = document.getElementById('matrixTotalAreaBadge');
  if (elTotA) elTotA.innerText = grandTotalAreaSqm.toFixed(1) + ' m²';
  var elTotV = document.getElementById('matrixTotalVolBadge');
  if (elTotV) elTotV.innerText = grandTotalVolCum.toFixed(1) + ' m³';

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
      html += `<tr>
        <td class="fw-bold text-start ps-3">${name}</td>
        <td class="text-center" style="width: 90px; max-width: 90px;">${floorStr}</td>
        <td class="fw-bold text-primary text-center">${totalsByName[name].qty} Rooms Logged</td>
        <td class="text-start ps-2 small text-muted">${notesStr || '-'}</td>
      </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="4" class="text-muted text-center">No rooms entered.</td></tr>';
  }

  var sumTotalCell = document.getElementById('summaryTotalRoomsCell');
  if (sumTotalCell) {
    sumTotalCell.innerText = `${grandTotalRoomsCount} Rooms Total`;
  }

  renderRoomDistributionScaledChart(totalsByName);
  saveProjectLocal();
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
        note: tr.querySelector('.inp-note')?.value || '',
        color: rgbToHex(tr.querySelector('.inp-color')?.value || '#ffffff')
      });
    });

    var state = { projectName: projName, rooms: rowsData, timestamp: Date.now() };
    localStorage.setItem('spatial_matrix_project_7day', JSON.stringify(state));
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
function exportToExcel(unitMode) {
  unitMode = unitMode || 'mm';
  var isMetric = unitMode === 'mm';
  var unitTitle = isMetric ? 'Metric Units (mm / m)' : 'Imperial Units (ft / in)';

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
      <p style="font-size:9pt; color:#64748b; margin-top:0;">Color-Coded Multi-Floor &amp; Room-Type Engineering Matrix</p>
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
            <th style="background-color: #9333ea; color: #ffffff; border: 1px solid #581c87;">DISCAS DISPLAY</th>
            <th style="background-color: #c026d3; color: #ffffff; border: 1px solid #701a75;">SPEECH RT60</th>
            <th style="background-color: #475569; color: #ffffff; border: 1px solid #1e293b;">NOTES</th>
          </tr>
        </thead>
        <tbody>`;

    var lastFloorSeenExcel = null;
    rows.forEach((tr, idx) => {
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
      var diagStr = tr.querySelector('.out-calc-diag')?.innerText || '';
      var dimsStr = tr.querySelector('.out-calc-dims')?.innerText || '';
      var dispCell = isMetric ? `${diagStr} (${dimsStr})` : `${diagStr} (${(wm/304.8).toFixed(1)} × ${(hm/304.8).toFixed(1)} ft)`;

      var rt60Str = tr.querySelector('.out-rt60')?.innerText || '';
      var note = tr.querySelector('.inp-note')?.value || '';

      var floorPal = getFloorPalette(fl);
      var purpPal = getRoomPurposePalette(purpose);

      if (fl !== lastFloorSeenExcel) {
        html += `<tr style="background-color: ${floorPal.badgeBg}; color: #ffffff;">
          <td colspan="14" style="background-color: ${floorPal.badgeBg}; color: #ffffff; font-weight: 800; font-size: 11pt; text-align: left; padding: 8px 12px; letter-spacing: 0.5px;">
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
        <td style="background-color: #eff6ff; color: #1e40af; font-weight: bold;">${dispCell}</td>
        <td style="background-color: #f0fdf4; color: #15803d; font-weight: bold;">${rt60Str}</td>
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

function exportToCSV() {
  try {
    var projTitle = document.getElementById('matrixProjectNameInput')?.value || 'Pro AV Architectural Schedule';
    var rows = document.querySelectorAll('#matrixTableBody tr');
    if (!rows || rows.length === 0) {
      alert('No room schedule data available to export.');
      return;
    }

    var csvRows = [];

    // Header comment block with HCMM watermark
    csvRows.push(['# PROJECT', projTitle]);
    csvRows.push(['# SECURITY WATERMARK', 'HCMM CERTIFIED ARCHITECTURAL SPECIFICATION']);
    csvRows.push(['# GENERATED BY', 'Pro AV System Architect & Spatial Matrix']);
    csvRows.push(['# EXPORT DATE', new Date().toISOString()]);
    csvRows.push(['# COLOR THEME', 'MULTI-COLOR PALETTES APPLIED FOR FLOORS AND ROOM TYPES']);
    csvRows.push([]); // blank separator

    // Categorized multi-color row headings
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
      '[VOLUME] Volume (m3)',
      '[AV DISPLAY] DISCAS Display Size',
      '[AV DIMS] Dimensions (mm)',
      '[ACOUSTICS] Speech RT60 (s)',
      '[NOTES] Notes'
    ];
    csvRows.push(headers);

    var totalQty = 0;
    var totalSeats = 0;
    var totalAreaSqm = 0;
    var totalVolumeM3 = 0;
    var lastFloorSeen = null;

    rows.forEach((tr, idx) => {
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
      var diagStr = tr.querySelector('.out-calc-diag')?.innerText || '';
      var dimsStr = tr.querySelector('.out-calc-dims')?.innerText || '';
      var rt60Str = tr.querySelector('.out-rt60')?.innerText || '';
      var note = tr.querySelector('.inp-note')?.value || '';

      var floorPal = getFloorPalette(fl);
      var purpPal = getRoomPurposePalette(purpose);

      // Add a floor separator whenever floor level shifts
      if (fl !== lastFloorSeen) {
        csvRows.push([
          `# >>> FLOOR ${fl} (${floorPal.name.toUpperCase()} - COLOR ACCENT: ${floorPal.badgeBg}) <<<`,
          `ZONE: ${floorPal.name}`,
          `COLOR: ${floorPal.badgeBg}`,
          '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
        ]);
        lastFloorSeen = fl;
      }

      totalQty += qty;
      totalSeats += (seats * qty);
      totalAreaSqm += (sqm * qty);
      totalVolumeM3 += (parseFloat(m3) * qty);

      csvRows.push([
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
        m3,
        diagStr,
        dimsStr,
        rt60Str,
        note
      ]);
    });

    // Summary Section
    csvRows.push([]);
    csvRows.push(['# SUMMARY CONSOLIDATION &bull; HCMM VERIFIED']);
    csvRows.push(['Total Unique Room Types', rows.length]);
    csvRows.push(['Total Room Quantity', totalQty]);
    csvRows.push(['Total Seating Capacity', totalSeats]);
    csvRows.push(['Total Net Area (sqm)', totalAreaSqm.toFixed(2)]);
    csvRows.push(['Total Net Area (sqft)', (totalAreaSqm * 10.7639).toFixed(1)]);
    csvRows.push(['Total Volume (m3)', totalVolumeM3.toFixed(2)]);

    // Escape and format as CSV string (RFC-4180)
    var csvContent = csvRows.map(row => {
      return row.map(cell => {
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
let activeMatrixVisView = '3D';
let activeMatrixRoomData = null;

function switchMatrixVisView(mode) {
  activeMatrixVisView = mode;
  document.querySelectorAll('.matrix-vis-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === mode);
  });
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

  activeMatrixRoomData = {
    floor: fl, name: name, seats: seats, l: lm, w: wm, h: hm,
    purpose: purpose, pitch: pitch, rt60: rt60, diag: diag, dims: dims
  };

  renderMatrix3DRoomVisualizer(activeMatrixRoomData);
}

function renderMatrix3DRoomVisualizer(d) {
  var container = document.getElementById('matrixRoom3DSvgContainer');
  if (!container) return;

  var hudEl = document.getElementById('matrixRoom3DHud');
  if (hudEl) {
    hudEl.innerHTML = `
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span class="badge bg-primary px-2 py-1"><i class="fa-solid fa-cube me-1"></i>3D Room: [Fl ${d.floor}] ${d.name}</span>
        <span class="badge bg-dark border border-secondary text-info">${(d.l/1000).toFixed(1)}m L × ${(d.w/1000).toFixed(1)}m W × ${(d.h/1000).toFixed(1)}m H (${(d.l*d.w/1e6).toFixed(1)} m²)</span>
        <span class="badge bg-dark border border-secondary text-success"><i class="fa-solid fa-tv me-1"></i>Display: ${d.diag}</span>
        <span class="badge bg-dark border border-secondary text-warning"><i class="fa-solid fa-wave-square me-1"></i>Speech RT60: ${d.rt60}</span>
        <span class="badge bg-dark border border-secondary text-white"><i class="fa-solid fa-users me-1"></i>${d.seats} Seats</span>
      </div>
    `;
  }

  var svgW = 960, svgH = 460;
  var L = d.l / 1000.0;
  var W = d.w / 1000.0;
  var H = d.h / 1000.0;

  if (activeMatrixVisView === '3D') {
    container.innerHTML = `
      <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#080d1a; border-radius:10px;">
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
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.1"/>
          </linearGradient>
          <radialGradient id="mDisplayGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Floor Polygon (Realistic Isometric Perspective) -->
        <polygon points="140,360 480,410 880,310 540,260" fill="url(#mFloorGrad)" stroke="#334155" stroke-width="2"/>
        <line x1="225" y1="372" x2="625" y2="272" stroke="rgba(56,189,248,0.12)" stroke-width="1"/>
        <line x1="310" y1="385" x2="710" y2="285" stroke="rgba(56,189,248,0.12)" stroke-width="1"/>
        <line x1="395" y1="397" x2="795" y2="297" stroke="rgba(56,189,248,0.12)" stroke-width="1"/>

        <!-- Walls -->
        <polygon points="540,260 540,70 880,120 880,310" fill="url(#mWallBack)" stroke="#1e293b" stroke-width="2"/>
        <polygon points="140,360 140,140 540,70 540,260" fill="url(#mWallLeft)" stroke="#38bdf8" stroke-width="2"/>

        <!-- Acoustic Wall Absorber Panels (Side Wall) -->
        <polygon points="200,240 280,225 280,165 200,180" fill="#3b82f6" fill-opacity="0.3" stroke="#60a5fa" stroke-width="1.5"/>
        <polygon points="310,220 390,205 390,145 310,160" fill="#3b82f6" fill-opacity="0.3" stroke="#60a5fa" stroke-width="1.5"/>
        <text x="240" y="170" fill="#93c5fd" font-size="8" font-family="Inter" font-weight="bold">Acoustic Panel</text>

        <!-- Acoustic Panels on Back Wall -->
        <polygon points="620,135 700,147 700,207 620,195" fill="#10b981" fill-opacity="0.25" stroke="#34d399" stroke-width="1.5"/>
        <polygon points="730,152 810,164 810,224 730,212" fill="#10b981" fill-opacity="0.25" stroke="#34d399" stroke-width="1.5"/>

        <!-- Ceiling Fixture / Track Lighting Glow -->
        <circle cx="380" cy="115" r="30" fill="url(#mDisplayGlow)"/>
        <circle cx="680" cy="155" r="30" fill="url(#mDisplayGlow)"/>

        <!-- Wall-Mounted Display (Calculated for purpose) -->
        <g transform="translate(220, 185)">
          <polygon points="0,0 200,26 200,140 0,114" fill="#0f172a" stroke="#0284c7" stroke-width="3"/>
          <polygon points="4,4 196,29 196,136 4,111" fill="#020617"/>
          
          <!-- Screen Content according to purpose -->
          ${d.purpose === 'uc' ? `
            <polygon points="6,6 156,26 156,131 6,108" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
            <text x="80" y="65" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle" transform="rotate(7.6 80 65)">Teams 21:9 Active UC</text>
            <polygon points="156,26 194,31 194,134 156,131" fill="rgba(16,185,129,0.25)" stroke="#10b981" stroke-width="1"/>
          ` : d.purpose === 'videowall' ? `
            <polygon points="6,6 194,31 194,134 6,108" fill="#111827" stroke="#10b981" stroke-width="1.5"/>
            <!-- Grid lines for LED panels -->
            <line x1="68" y1="14" x2="68" y2="116" stroke="rgba(16,185,129,0.4)" stroke-width="1"/>
            <line x1="132" y1="22" x2="132" y2="124" stroke="rgba(16,185,129,0.4)" stroke-width="1"/>
            <line x1="6" y1="58" x2="194" y2="83" stroke="rgba(16,185,129,0.4)" stroke-width="1"/>
            <text x="100" y="72" font-size="9" font-weight="bold" fill="#34d399" text-anchor="middle" transform="rotate(7.6 100 72)">dvLED P${d.pitch}mm Video Wall</text>
          ` : d.purpose === 'interactive' ? `
            <polygon points="6,6 194,31 194,134 6,108" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.5"/>
            <text x="100" y="70" font-size="9" font-weight="bold" fill="#fbbf24" text-anchor="middle" transform="rotate(7.6 100 70)">IFPD Interactive Whiteboard</text>
          ` : `
            <polygon points="6,6 194,31 194,134 6,108" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
            <text x="100" y="70" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle" transform="rotate(7.6 100 70)">DISCAS Meeting Display</text>
          `}
          <rect x="20" y="125" width="160" height="22" rx="4" fill="#020617" stroke="#38bdf8"/>
          <text x="100" y="140" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle">${d.diag} (${d.dims})</text>
        </g>

        <!-- Conference Table & Chairs (Scaled to Room & Seats) -->
        <g transform="translate(450, 310)">
          <!-- Conference Table Surface -->
          <polygon points="0,15 150,-20 180,-15 30,20" fill="#334155" stroke="#64748b" stroke-width="2"/>
          <polygon points="0,15 30,20 30,30 0,25" fill="#1e293b"/>
          
          <!-- Chairs matching seats -->
          ${(() => {
            var chairsHtml = '';
            var count = Math.min(d.seats, 16);
            for (var c = 0; c < count; c++) {
              var frac = c / count;
              var cx = frac * 160;
              var cy = (c % 2 === 0) ? (-25 + frac * 10) : (25 - frac * 10);
              var col = (c === 0) ? '#eab308' : '#38bdf8';
              chairsHtml += `<circle cx="${cx}" cy="${cy}" r="5" fill="${col}" stroke="#ffffff" stroke-width="1"/>`;
            }
            return chairsHtml;
          })()}
        </g>

        <!-- Furthest Viewer & Sightline Cone -->
        <g transform="translate(680, 320)">
          <circle cx="0" cy="-28" r="8" fill="#eab308" stroke="#fef08a" stroke-width="1.5"/>
          <line x1="0" y1="-20" x2="0" y2="12" stroke="#eab308" stroke-width="3"/>
          <text x="0" y="24" font-size="9" font-weight="bold" fill="#fef08a" text-anchor="middle">Furthest Viewer</text>
        </g>
        <polygon points="320,245 680,292 720,320" fill="url(#mSightGrad)"/>
        <line x1="320" y1="245" x2="680" y2="292" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,2"/>

        <!-- Dimension & Architectural Spec Badges -->
        <rect x="25" y="415" width="260" height="28" fill="#020617" rx="6" stroke="#38bdf8"/>
        <text x="155" y="433" font-size="10" font-weight="bold" fill="#38bdf8" text-anchor="middle">ROOM: ${L.toFixed(1)}m L × ${W.toFixed(1)}m W × ${H.toFixed(1)}m H</text>

        <rect x="680" y="415" width="250" height="28" fill="#020617" rx="6" stroke="#10b981"/>
        <text x="805" y="433" font-size="10" font-weight="bold" fill="#4ade80" text-anchor="middle">SPEECH ACOUSTICS: RT60 ${d.rt60}</text>
      </svg>
    `;
  } else if (activeMatrixVisView === 'PLAN') {
    container.innerHTML = `
      <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#080d1a; border-radius:10px;">
        <rect x="80" y="40" width="800" height="360" fill="#0b1120" stroke="#334155" stroke-width="3" rx="8"/>
        <text x="100" y="70" font-size="14" font-weight="bold" fill="#38bdf8">2D ARCHITECTURAL TOP PLAN VIEW: [FL ${d.floor}] ${d.name}</text>
        
        <!-- Wall Display -->
        <rect x="380" y="42" width="200" height="12" fill="#0284c7" stroke="#38bdf8" stroke-width="2" rx="3"/>
        <text x="480" y="72" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="middle">${d.diag} (${d.purpose.toUpperCase()})</text>

        <!-- Sightline Viewing Cone -->
        <polygon points="380,54 580,54 750,380 210,380" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-dasharray="4,3"/>

        <!-- Conference Table -->
        <rect x="360" y="160" width="240" height="110" rx="20" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
        <text x="480" y="220" font-size="11" font-weight="bold" fill="#cbd5e1" text-anchor="middle">${d.seats} Conference Seats</text>

        <!-- Chairs -->
        ${(() => {
          var chairs = '';
          for (var i = 0; i < 6; i++) {
            chairs += `<circle cx="${390 + i*40}" cy="145" r="7" fill="#60a5fa"/>`;
            chairs += `<circle cx="${390 + i*40}" cy="285" r="7" fill="#60a5fa"/>`;
          }
          return chairs;
        })()}

        <!-- Furthest Viewer Position -->
        <circle cx="480" cy="360" r="10" fill="#eab308"/>
        <text x="480" y="388" font-size="10" font-weight="bold" fill="#fef08a" text-anchor="middle">Furthest Seated Viewer</text>
      </svg>
    `;
  } else {
    // Front Elevation View
    container.innerHTML = `
      <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#080d1a; border-radius:10px;">
        <rect x="80" y="40" width="800" height="360" fill="#0b1120" stroke="#334155" stroke-width="3" rx="8"/>
        <text x="100" y="70" font-size="14" font-weight="bold" fill="#4ade80">FRONT ELEVATION & ACOUSTIC WALL VIEW: [FL ${d.floor}] ${d.name}</text>
        
        <!-- Floor line -->
        <line x1="80" y1="360" x2="880" y2="360" stroke="#64748b" stroke-width="4"/>
        <text x="100" y="380" font-size="10" fill="#94a3b8">Finished Floor Level (AFFL 0.0m)</text>

        <!-- Acoustic Wall Panels Left & Right -->
        <rect x="120" y="120" width="120" height="180" rx="4" fill="#3b82f6" fill-opacity="0.3" stroke="#60a5fa" stroke-width="2"/>
        <text x="180" y="215" font-size="10" font-weight="bold" fill="#93c5fd" text-anchor="middle">Acoustic Panels</text>

        <rect x="720" y="120" width="120" height="180" rx="4" fill="#3b82f6" fill-opacity="0.3" stroke="#60a5fa" stroke-width="2"/>
        <text x="780" y="215" font-size="10" font-weight="bold" fill="#93c5fd" text-anchor="middle">Acoustic Panels</text>

        <!-- Center Display Screen -->
        <rect x="340" y="110" width="280" height="160" rx="6" fill="#020617" stroke="#0284c7" stroke-width="4"/>
        <text x="480" y="180" font-size="16" font-weight="bold" fill="#38bdf8" text-anchor="middle">${d.diag}</text>
        <text x="480" y="205" font-size="11" font-weight="bold" fill="#cbd5e1" text-anchor="middle">${d.dims}</text>
        <text x="480" y="225" font-size="10" fill="#94a3b8" text-anchor="middle">${d.purpose.toUpperCase()} STANDARD</text>

        <!-- AFFL Dimension line -->
        <line x1="320" y1="270" x2="320" y2="360" stroke="#f59e0b" stroke-width="2"/>
        <text x="310" y="320" font-size="10" font-weight="bold" fill="#fbbf24" text-anchor="end">AFFL: 950 mm</text>
      </svg>
    `;
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

    rooms.push({
      fl: fl,
      name: name,
      qty: qty,
      seats: seats,
      l: lm,
      w: wm,
      h: hm,
      sqm: sqm,
      purpose: purpose,
      diag: diag,
      dims: dims,
      rt60: rt60,
      note: note
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


// ==========================================================================
// PRO AV SYSTEM ARCHITECT - WORKSPACE, PRINT TO PDF & QR CODE MODULE
// ==========================================================================

var currentCloudProjectId = '';
var isRealtimeSyncActive = false;
var lastCloudSavedTimestamp = null;

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

async function saveCurrentProjectToCloud() {
  var ws = window.FirebaseWorkspace;
  if (!ws) {
    alert('Firebase Workspace is initializing. Please retry in a few seconds.');
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
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving to Cloud...';
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

    // Refresh modal list
    refreshCloudProjectsList();

    alert(`✓ Project "${saved.name}" successfully saved to Firebase Firestore Cloud!\nProject ID: ${saved.id}\nTeam members can now collaborate on this design simultaneously.`);
  } catch (error) {
    console.error('Failed to save to Firebase:', error);
    alert('Error saving project to Firebase: ' + (error.message || String(error)));
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
  var id = projectId || currentCloudProjectId;
  if (!id) {
    alert('Please save or open a project to generate a shareable link.');
    return;
  }
  var tabId = getCurrentActiveTabId();
  var url = `${window.location.origin}${window.location.pathname}?project=${id}&tab=${tabId}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(function() {
      alert(`✓ Collaborative Share Link copied to clipboard!\n${url}\nSend this link to team members for real-time simultaneous editing.`);
    });
  } else {
    alert(`Collaborative Share Link:\n${url}`);
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
  setTimeout(function() {
    loadProjectFromCloud(projectId);
  }, 350);
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
window.createNewCloudProject = createNewCloudProject;
window.autoLoadUrlSharedProject = autoLoadUrlSharedProject;

