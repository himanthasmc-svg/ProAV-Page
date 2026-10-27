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
  if (targetTab) {
    targetTab.style.display = "block";
    targetTab.classList.remove('tab-fade-active');
    void targetTab.offsetWidth;
    targetTab.classList.add('tab-fade-active');
  }
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
  if (tabName === 'Tab_VideoBar' && typeof calculateVideoBarStudio === 'function') calculateVideoBarStudio();
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
  if (tabName === 'Tab_WallStructure') {
    if (typeof calculateWallStructure === 'function') calculateWallStructure();
  }
  if (tabName === 'Tab7' && typeof calcStdSize === 'function') calcStdSize();
  if (tabName === 'Tab8' && typeof runAllTab8Calculations === 'function') runAllTab8Calculations();
  if (tabName === 'Tab9') {
    if (typeof calcCableAttenuation === 'function') calcCableAttenuation();
    if (typeof calcRfAntennaSolver === 'function') calcRfAntennaSolver();
  }
  if (tabName === 'Tab_Budgeting') {
    if (typeof initBudgetPasswordGate === 'function') {
      initBudgetPasswordGate();
    } else if (typeof aggregateProjectBudget === 'function') {
      aggregateProjectBudget();
    }
  }
  if (tabName === 'Tab10') {
    if (typeof updateMatrixTotalsAndSummary === 'function') updateMatrixTotalsAndSummary();
    setTimeout(function() {
      var activeRow = document.querySelector('#matrixTableBody tr.table-active-room') || document.querySelector('#matrixTableBody tr');
      if (activeRow && typeof selectMatrixRoomFor3D === 'function') {
        selectMatrixRoomFor3D(activeRow);
      } else if (typeof activeMatrixRoomData !== 'undefined' && activeMatrixRoomData && typeof renderMatrix3DRoomVisualizer === 'function') {
        renderMatrix3DRoomVisualizer(activeMatrixRoomData);
      }
    }, 20);
  }
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
    if (tabId === 'Tab_WallStructure' && typeof calculateWallStructure === 'function') calculateWallStructure();
  }, 150);
});

// Studio Cluster Filtering
function filterStudioCluster(cluster) {
  var pills = document.querySelectorAll('.studio-cluster-pill');
  pills.forEach(function(p) {
    p.classList.toggle('active', p.getAttribute('data-cluster') === cluster);
  });

  var buttons = document.querySelectorAll('#mainTabContainer .tab-button');
  buttons.forEach(function(btn) {
    var domain = btn.getAttribute('data-domain');
    if (cluster === 'all') {
      btn.style.display = 'inline-flex';
    } else if (cluster === 'vision' && (domain === 'vision' || domain === 'led')) {
      btn.style.display = 'inline-flex';
    } else if (cluster === 'rigging' && domain === 'structure') {
      btn.style.display = 'inline-flex';
    } else if (cluster === 'audio' && domain === 'audio') {
      btn.style.display = 'inline-flex';
    } else if (cluster === 'systems' && domain === 'systems') {
      btn.style.display = 'inline-flex';
    } else {
      btn.style.display = 'none';
    }
  });
}

function quickSearchStudios(query) {
  var term = (query || '').toLowerCase().trim();
  var buttons = document.querySelectorAll('#mainTabContainer .tab-button');
  if (!term) {
    var activeCluster = document.querySelector('.studio-cluster-pill.active')?.getAttribute('data-cluster') || 'all';
    filterStudioCluster(activeCluster);
    return;
  }
  buttons.forEach(function(btn) {
    var text = btn.innerText.toLowerCase();
    var match = text.includes(term);
    btn.style.display = match ? 'inline-flex' : 'none';
  });
}

window.filterStudioCluster = filterStudioCluster;
window.quickSearchStudios = quickSearchStudios;


