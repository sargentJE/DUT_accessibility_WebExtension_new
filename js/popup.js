/* --------------------------------------------------------------------
 * popup.js – MyVision Accessibility Tester (fully restored)
 * --------------------------------------------------------------------
 * Responsibilities
 *   • Shared toolbar injection & enhancement (logo, SVG icon buttons)
 *   • Theming / font-size preference toggles persisted to chrome.storage
 *   • Dynamic UI add-ons (progress bar, loading overlay, save indicator,
 *     export button)
 *   • Per-page form save/load/validation with background sync
 *   • Navigation helpers for Prev / Next & bottom-nav highlighting
 *   • Export-to-JSON, Settings / Help / Logout actions
 *   • Minimal dependencies: Chrome MV3 APIs, ES2019
 * ------------------------------------------------------------------ */

// ----------------------------- PLATFORM DETECTION & SHORTCUTS ----------------------------

/**
 * Platform detection utility for cross-platform keyboard shortcuts
 */
const Platform = {
  detect() {
    // Use modern API if available, fall back to legacy detection
    if (navigator.userAgentData?.platform) {
      return navigator.userAgentData.platform.toLowerCase();
    }
    
    // Legacy detection for older browsers
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('mac')) return 'macos';
    if (platform.includes('win')) return 'windows';
    if (platform.includes('linux')) return 'linux';
    return 'unknown';
  },
  
  isMac() {
    return this.detect() === 'macos';
  },
  
  isWindows() {
    return this.detect() === 'windows';
  },
  
  isLinux() {
    return this.detect() === 'linux';
  }
};

/**
 * Cross-platform keyboard shortcuts configuration
 * Automatically adapts to user's operating system
 */
const KeyboardShortcuts = {
  // Cache platform detection for performance
  _platform: Platform.detect(),
  _isMac: Platform.isMac(),
  
  // Platform-specific modifier keys
  get modifiers() {
    if (this._isMac) {
      return {
        primary: { key: 'meta', symbol: '⌘', label: 'Cmd' },      // Command key on Mac
        secondary: { key: 'alt', symbol: '⌥', label: 'Option' },   // Option key on Mac
        shift: { key: 'shift', symbol: '⇧', label: 'Shift' },
        control: { key: 'ctrl', symbol: '⌃', label: 'Control' }    // Control on Mac (rarely used)
      };
    } else {
      return {
        primary: { key: 'ctrl', symbol: 'Ctrl', label: 'Ctrl' },     // Ctrl on Windows/Linux
        secondary: { key: 'alt', symbol: 'Alt', label: 'Alt' },      // Alt on Windows/Linux
        shift: { key: 'shift', symbol: 'Shift', label: 'Shift' },
        control: { key: 'ctrl', symbol: 'Ctrl', label: 'Ctrl' }
      };
    }
  },
  
  // Define all keyboard shortcuts with platform-specific variants
  shortcuts: {
    // Opening & Closing
    openExtension: {
      keys: ['secondary', 'shift', 'KeyA'],
      description: 'Open extension popup (global shortcut)',
      global: true,
      category: 'Opening & Closing'
    },
    closePopup: {
      keys: ['Escape'],
      description: 'Close popup or modal',
      category: 'Opening & Closing'
    },
    
    // Page Navigation  
    previousPage: {
      keys: ['primary', 'ArrowLeft'],
      description: 'Previous page',
      category: 'Page Navigation'
    },
    nextPage: {
      keys: ['primary', 'ArrowRight'], 
      description: 'Next page',
      category: 'Page Navigation'
    },
    jumpToPage: {
      keys: ['primary', 'Digit1-8'],
      description: 'Jump to specific page',
      category: 'Page Navigation'
    },
    scrollToTop: {
      keys: ['secondary', 'Home'],
      description: 'Scroll to top of current page',
      category: 'Page Navigation'
    },
    
    // Quick Actions
    saveProgress: {
      keys: ['primary', 'KeyS'],
      description: this._isMac ? 'Save current progress' : 'Save current progress',
      category: 'Quick Actions'
    },
    exportData: {
      keys: ['primary', 'KeyE'],
      description: 'Export review data',
      category: 'Quick Actions'
    },
    openHelp: {
      keys: ['F1'],
      description: 'Open help documentation',
      category: 'Quick Actions'
    },
    openSettings: {
      keys: ['primary', 'Comma'],
      description: 'Open settings panel',
      category: 'Quick Actions'
    },
    toggleTheme: {
      keys: ['primary', 'shift', 'KeyT'],
      description: 'Toggle theme',
      category: 'Quick Actions'
    },
    
    // Form Navigation (standard across platforms)
    tabNavigation: {
      keys: ['Tab'],
      description: 'Navigate between form fields',
      category: 'Form Navigation',
      platformIndependent: true
    },
    reverseTabNavigation: {
      keys: ['shift', 'Tab'],
      description: 'Navigate backwards between form fields',
      category: 'Form Navigation',
      platformIndependent: true
    },
    activateButton: {
      keys: ['Space'],
      description: 'Toggle checkboxes and activate buttons',
      category: 'Form Navigation',
      platformIndependent: true
    },
    submitForm: {
      keys: ['Enter'],
      description: 'Activate buttons and submit forms',
      category: 'Form Navigation',
      platformIndependent: true
    },
    navigateOptions: {
      keys: ['ArrowUp', 'ArrowDown'],
      description: 'Navigate radio buttons and select dropdowns',
      category: 'Form Navigation',
      platformIndependent: true
    }
  },
  
  /**
   * Get human-readable key combination for a shortcut
   */
  getKeyDisplay(shortcutId) {
    const shortcut = this.shortcuts[shortcutId];
    if (!shortcut) return '';
    
    const modifiers = this.modifiers;
    const keys = shortcut.keys.map(keyName => {
      // Handle modifier keys
      if (modifiers[keyName]) {
        return modifiers[keyName].symbol;
      }
      
      // Handle special keys
      const specialKeys = {
        'Escape': 'Esc',
        'ArrowLeft': '←',
        'ArrowRight': '→', 
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'Home': 'Home',
        'Tab': 'Tab',
        'Enter': 'Enter',
        'Space': 'Space',
        'F1': 'F1',
        'Comma': ',',
        'Digit1-8': '1-8'
      };
      
      if (specialKeys[keyName]) {
        return specialKeys[keyName];
      }
      
      // Handle letter keys (KeyA -> A)
      if (keyName.startsWith('Key')) {
        return keyName.replace('Key', '');
      }
      
      // Handle digit keys (Digit1 -> 1)
      if (keyName.startsWith('Digit')) {
        return keyName.replace('Digit', '');
      }
      
      return keyName;
    });
    
    return keys;
  },
  
  /**
   * Get shortcuts grouped by category
   */
  getShortcutsByCategory() {
    const categories = {};
    Object.entries(this.shortcuts).forEach(([id, shortcut]) => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = [];
      }
      categories[shortcut.category].push({
        id,
        ...shortcut,
        keyDisplay: this.getKeyDisplay(id)
      });
    });
    return categories;
  },
  
  /**
   * Check if a keyboard event matches a shortcut
   */
  matchesShortcut(event, shortcutId) {
    const shortcut = this.shortcuts[shortcutId];
    if (!shortcut) return false;
    
    const modifiers = this.modifiers;
    const keys = shortcut.keys;
    
    // Check each required key/modifier
    for (const keyName of keys) {
      if (modifiers[keyName]) {
        // Check modifier key
        const modKey = modifiers[keyName].key;
        if (modKey === 'meta' && !event.metaKey) return false;
        if (modKey === 'ctrl' && !event.ctrlKey) return false;
        if (modKey === 'alt' && !event.altKey) return false;
        if (modKey === 'shift' && !event.shiftKey) return false;
      } else {
        // Check regular key
        if (event.code !== keyName && event.key !== keyName.replace('Key', '').replace('Digit', '')) {
          // Special handling for digit ranges
          if (keyName === 'Digit1-8') {
            const digit = parseInt(event.key);
            if (isNaN(digit) || digit < 1 || digit > 8) return false;
          } else {
            return false;
          }
        }
      }
    }
    
    return true;
  }
};

// ----------------------------- CONSTANTS ----------------------------
const TOTAL_PAGES = 8;         
const STORAGE_KEY_PREFIX = 'page_';
const THEME_CLASSES = ['dark-theme', 'high-contrast-theme'];
const FONT_SIZE_CLASSES = ['small-text-theme', 'medium-text-theme', 'large-text-theme'];
const LAST_PAGE_KEY = 'lastPage';

// ---------------------- BACKEND SESSION CONSTANTS --------------------
const BACKEND_BASE  = 'https://web-production-d801.up.railway.app/api';
const SESSION_KEY   = 'currentSessionId';
const SITE_URL_KEY  = 'lastSiteUrl';
const NO_SESSION_KEY = 'noSessionYet'; // Track if session creation is pending
let   currentSessionId = null;
let   currentSiteUrl   = '';
let   currentOrigin    = ''; // Added for origin-based keying

// Session creation lock to prevent race conditions
let sessionCreationInProgress = false;
let sessionCreationPromise = null; // For waiting on in-progress creation

// Extension version injected from manifest
const EXT_VERSION = chrome.runtime.getManifest().version;

// SVG icon strings (minified, no whitespace) – role=presentation
const ICONS = {
  settings: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"/></svg>',
  help: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.25 17h.008v.008H11.25V17z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9a3 3 0 115.356 1.857c-.855 1.2-1.356 1.8-1.356 3.143v.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>',
  logout: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 9V5.25a2.25 2.25 0 00-2.25-2.25h-6.75a2.25 2.25 0 00-2.25 2.25v13.5a2.25 2.25 0 002.25 2.25h6.75a2.25 2.25 0 002.25-2.25V15"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H3m0 0l3-3m-3 3l3 3"/></svg>',
  theme: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1.5M16.95 7.05l1.06-1.06M21 12h-1.5M16.95 16.95l1.06 1.06M12 21v-1.5M7.05 16.95l-1.06 1.06M3 12h1.5M7.05 7.05l-1.06-1.06M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>',
  font: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M14 18l3-12 3 12M15 14h4"/><circle cx="6" cy="13" r="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M6 15v3"/></svg>',
  export: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg>'
};

// --------------------------- INITIALISATION -------------------------
// Only run popup initialization in top-level popup (not in modals)
if (window.self === window.top) {
  document.addEventListener('DOMContentLoaded', initExtension);
  
  // Activate popup scroll containment immediately
  document.body.classList.add('popup-active');
  
  // Ensure proper scroll containment
  initScrollContainment();
  
  // Add scroll-to-top button
  addScrollToTopButton();
}

async function initExtension() {
  // --- Check Authentication First ---
  // Check for authentication token directly via Chrome Storage
  // This replaces reliance on token.js which isn't available in popup.html
  const TOKEN_KEY = 'token';
  const token = await new Promise(resolve => {
    chrome.storage.local.get([TOKEN_KEY], res => resolve(res[TOKEN_KEY] || null));
  });
  if (!token) {
    // If no token, redirect to login page and stop initialization
    window.location.replace(chrome.runtime.getURL('login.html'));
    return;
  }
  // --- Proceed only if authenticated ---

  // Bail out in iframe modals
  if (window.self !== window.top) return;
  const path = window.location.pathname;
  const current = getCurrentPageIndex();
  const isPopupRoot = path.endsWith('popup.html');
  const isFormPage = isPopupRoot || /\/pages\/page\d+\.html$/.test(path);

  // ---------------- SITE / SESSION HANDLING -------------------------
  // Fetch current tab URL first so we know if we're on a new website before
  // deciding whether to restore any previous progress.
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      currentSiteUrl = tab.url; // Assign the full URL
      try {
        currentOrigin = new URL(tab.url).origin;
      } catch (e) {
        console.warn("Could not parse current URL origin:", e);
        currentOrigin = 'invalid_url'; // Fallback for invalid URLs
        currentSiteUrl = ''; // Ensure URL is cleared if origin parsing fails
      }
    } else {
      currentSiteUrl = ''; // Ensure URL is empty if tab.url is missing
      currentOrigin = 'no_active_tab'; // Fallback if no active tab URL
    }
  } catch (_) {
    currentSiteUrl = '';
    currentOrigin = 'error_getting_tab'; // Fallback on error
  }

  // Check if we have a valid origin before proceeding
  const invalidOrigin = ['invalid_url', 'no_active_tab', 'error_getting_tab'].includes(currentOrigin);
  if (invalidOrigin || !currentOrigin.startsWith('http')) { // Also check it starts with http/https
    showToast('Cannot start review: Not on a valid web page.', 'error');
    // Optionally disable UI elements or show a persistent message
    document.body.innerHTML = '<div class="centered-message error">Accessibility Helper cannot run on this page. Please navigate to a website (http or https).</div>';
    return; // Stop initialization
  }

  // Get session data scoped to the current website origin
  const originKeys = [siteUrlKey(), sessionIdKey(), lastPageKey()];
  const stored = await new Promise(r => sGet(originKeys, r));
  const lastSiteUrlForOrigin = stored[siteUrlKey()]; // Full URL stored previously for this origin
  currentSessionId = stored[sessionIdKey()] || null; // Session ID for this origin
  const lastVisitedPage = stored[lastPageKey()] || 1; // Last page visited for this origin

  // Check if we already have a session or have marked that no session exists yet
  const noSessionYet = stored[noSessionKey()] || false;
  
  if (!currentSessionId) {
    if (!noSessionYet) {
      // First time seeing this origin - clear any stale data
      const keysToClear = [lastPageKey(), sessionIdKey(), siteUrlKey()]; 
      for (let i = 1; i <= TOTAL_PAGES; i++) keysToClear.push(pageKey(i));
      await new Promise(r => sRemove(keysToClear, r)); // Ensure clearing finishes
      
      // Mark that we don't have a session yet, but we've initialized
      sSet({ 
        [siteUrlKey()]: currentSiteUrl, 
        [noSessionKey()]: true, 
        [lastPageKey()]: 1 
      });
    } else {
      // We've already marked this as having no session, but update URL if needed
      sSet({ [siteUrlKey()]: currentSiteUrl });
    }
  } else {
    // Session exists, update the stored URL in case it changed slightly
    sSet({ [siteUrlKey()]: currentSiteUrl });
  }

  // -------- PAGE RESTORE / PERSIST ----------------------------------
  // Restore the last visited page for this origin if opening the popup root
  if (isPopupRoot && currentSessionId && lastVisitedPage > 1 && lastVisitedPage <= TOTAL_PAGES) {
    window.location.replace(buildPageUrl(lastVisitedPage));
    return;
  }

  // Persist current page when navigating within the form pages.
  if (isFormPage) {
    sSet({ [lastPageKey()]: current });
  }

  await injectSharedToolbar();
  enhanceTopNavigation();
  createDynamicUI();
  await loadThemeSettings();
  createDarkModeToggle();
  createFontSizeToggle();
  focusPageHeading();
  initPageSpecificFunctionality();
  initKeyboardShortcuts();
  updateMainPageKeyboardShortcuts();
  flushPending();
}

// Global auth expiry listener
chrome.runtime.onMessage.addListener(msg => {
  if (msg && msg.type === 'AUTH_EXPIRED') {
    window.location.href = chrome.runtime.getURL('login.html');
  }
});

// Listen for successful background sync flush
chrome.runtime.onMessage.addListener(msg => {
  if (msg && msg.type === 'SYNC_FLUSH') {
    showToast(`Synced ${msg.count} queued action${msg.count>1?'s':''}`);
  }
});

// ------------------ SHARED TOOLBAR INSERTION ------------------------
function injectSharedToolbar() {
  return new Promise(res => {
    if (document.querySelector('.top-nav')) return res();
    fetch(chrome.runtime.getURL('toolbar.html'))
      .then(r => r.text())
      .then(html => {
        const t = document.createElement('template');
        t.innerHTML = html.trim();
        const header = t.content.firstElementChild;
        // Fix logo src if placeholder
        const logoEl = header.querySelector('img.logo');
        if (logoEl) {
          logoEl.src = chrome.runtime.getURL('icons/myvision-logo.png');
          logoEl.alt = 'MyVision logo';
        }
        const h1 = header.querySelector('#page-title-placeholder');
        if (h1) h1.textContent = document.title.split('-')[0].trim();
        const container = document.querySelector('.popup-container') || document.body;
        container.prepend(header);
        res();
      })
      .catch(err => { console.error(err); res(); });
  });
}

// ------------------ TOOLBAR ENHANCEMENT -----------------------------
function enhanceTopNavigation() {
  const header = document.querySelector('.top-nav');
  if (!header) return;

  // Detect legacy markup lacking nav-top/nav-bottom wrappers and fix it
  let navTop = header.querySelector('.nav-top');
  let navBottom = header.querySelector('.nav-bottom');

  if (!navTop) {
    navTop = document.createElement('div');
    navTop.className = 'nav-top d-flex align-items-center justify-content-between';
    // Move existing brand/logo if present
    let brand = header.querySelector('.brand');
    if (!brand) {
      brand = document.createElement('div');
      brand.className = 'brand d-flex align-items-center';
      // Move any stray img/logo + h1 into this brand container
      header.querySelectorAll('img.logo, h1.page-title, h1').forEach(el => brand.appendChild(el));
    }
    navTop.appendChild(brand);

    // Move existing nav-buttons if already present
    let legacyBtns = header.querySelector('.nav-buttons');
    if (legacyBtns) navTop.appendChild(legacyBtns);
    header.prepend(navTop);
  }

  if (!navBottom) {
    navBottom = document.createElement('div');
    navBottom.className = 'nav-bottom text-center mt-1';
    // Ensure page title element
    let titleEl = navTop.querySelector('h1') || header.querySelector('h1');
    if (!titleEl) {
      titleEl = document.createElement('h1');
      titleEl.textContent = document.title.split('-')[0].trim();
    }
    titleEl.classList.add('page-title', 'mb-0');
    navBottom.appendChild(titleEl);
    header.appendChild(navBottom);
  }

  // Ensure logo inside brand
  let brand = navTop.querySelector('.brand');
  if (!brand) {
    brand = document.createElement('div');
    brand.className = 'brand d-flex align-items-center';
    navTop.prepend(brand);
  }
  if (!brand.querySelector('img.logo')) {
    const logo = document.createElement('img');
    logo.src = chrome.runtime.getURL('icons/myvision-logo.png');
    logo.alt = 'MyVision logo';
    logo.className = 'logo';
    brand.prepend(logo);
  }

  // Ensure nav-buttons container
  let navBtns = navTop.querySelector('.nav-buttons');
  if (!navBtns) {
    navBtns = document.createElement('div');
    navBtns.className = 'nav-buttons';
    navTop.appendChild(navBtns);
  }

  // Insert Back button to the far left, before the logo
  if (getCurrentPageIndex() > 1 && !document.getElementById('back-button')) {
    const backBtn = document.createElement('button');
    backBtn.id = 'back-button';
    backBtn.className = 'nav-button';
    backBtn.title = 'Back';
    backBtn.setAttribute('aria-label', 'Back');
    backBtn.innerHTML = ICONS.back;
    backBtn.addEventListener('click', goBack);
    navTop.insertBefore(backBtn, brand); // place on far left
  }

  // Helper to create / idempotently add buttons
  const addBtn = (id, label, svg, handler) => {
    if (document.getElementById(id)) return; // if already exists anywhere
    const b = document.createElement('button');
    b.id = id;
    b.className = 'nav-button';
    b.title = label;
    b.setAttribute('aria-label', label);
    b.innerHTML = svg;
    b.addEventListener('click', handler);
    navBtns.appendChild(b);
  };

  // Add/ensure action buttons
  addBtn('theme-toggle', 'Theme', ICONS.theme, toggleTheme);
  addBtn('font-toggle', 'Font size', ICONS.font, cycleFontSize);
  addBtn('settings-button', 'Settings', ICONS.settings, showSettings);
  addBtn('help-button', 'Help', ICONS.help, showHelp);
  addBtn('export-json', 'Export', ICONS.export, exportFormData);
  addBtn('logout-button', 'Logout', ICONS.logout, logout);
}

// ------------------ DYNAMIC UI ELEMENTS -----------------------------
function createDynamicUI() {
  // Progress bar
  if (!document.querySelector('.progress-container')) {
    const barContainer = document.createElement('div');
    barContainer.className = 'progress-container';
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    const label = document.createElement('span');
    label.id = 'progress-label';
    label.className = 'progress-label';
    barContainer.append(bar, label);
    const topNav = document.querySelector('.top-nav');
    topNav.after(barContainer);
  }

  // Loading overlay
  if (!document.getElementById('loading-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay hidden';
    overlay.innerHTML = '<div class="loading-spinner" role="status" aria-label="Loading"></div><span id="loading-msg" class="loading-msg">Loading…</span><div class="loading-submit-bar"><div id="loading-submit-progress"></div></div>';
    document.body.appendChild(overlay);
  }

  // Save indicator (snackbar-style)
  if (!document.getElementById('message-container')) {
    const msg = document.createElement('div');
    msg.id = 'message-container';
    msg.textContent = 'Saved';
    document.body.appendChild(msg);
  }

  // Prev / Next button row (above bottom nav)
  if (!document.querySelector('.prev-next-nav')) {
    const nav = document.createElement('div');
    nav.className = 'prev-next-nav d-flex justify-content-center gap-3 align-items-center mt-2';

    const prevBtn = document.createElement('button');
    prevBtn.id = 'prev-button';
    prevBtn.className = 'btn btn-secondary';
    prevBtn.textContent = 'Previous';

    const nextBtn = document.createElement('button');
    nextBtn.id = 'next-button';
    nextBtn.className = 'btn btn-primary';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = true; // will be enabled when page valid

    nav.append(prevBtn, nextBtn);

    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) bottomNav.parentNode.insertBefore(nav, bottomNav);
  }
}

function showSaveIndicator() {
  const m = document.getElementById('message-container');
  if (!m) return;
  m.classList.add('show');
  setTimeout(() => m.classList.remove('show'), 2000);
}

function showLoading(show, msg = 'Loading…', percent = null) {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  overlay.classList.toggle('hidden', !show);
  const msgEl = overlay.querySelector('#loading-msg');
  if (msgEl) msgEl.textContent = msg;
  const bar = overlay.querySelector('#loading-submit-progress');
  if (bar) {
    if (percent != null) bar.style.width = percent + '%';
    if (!show) bar.style.width = '0%';
  }
}

// ------------------ THEME & FONT SIZE --------------------------------
async function loadThemeSettings() {
  return new Promise(res => {
    chrome.storage.sync.get(['theme', 'fontSize'], ({ theme = 'light', fontSize = 'medium' }) => {
      applyTheme(theme);
      applyFontSize(fontSize);
      res();
    });
  });
}

function applyTheme(theme) {
  document.body.classList.remove(...THEME_CLASSES);
  if (theme === 'dark') document.body.classList.add('dark-theme');
  else if (theme === 'high-contrast') document.body.classList.add('high-contrast-theme');
}

function applyFontSize(size) {
  document.body.classList.remove(...FONT_SIZE_CLASSES);
  document.body.classList.add(`${size}-text-theme`);
}

function toggleTheme() {
  const current = document.body.classList.contains('dark-theme') ? 'dark'
                : document.body.classList.contains('high-contrast-theme') ? 'high-contrast'
                : 'light';
  const next = current === 'light' ? 'dark' : current === 'dark' ? 'high-contrast' : 'light';
  applyTheme(next);
  chrome.storage.sync.set({ theme: next });
}

function cycleFontSize() {
  const body = document.body;
  const size = body.classList.contains('small-text-theme') ? 'small'
            : body.classList.contains('large-text-theme') ? 'large'
            : 'medium';
  const next = size === 'small' ? 'medium' : size === 'medium' ? 'large' : 'small';
  applyFontSize(next);
  chrome.storage.sync.set({ fontSize: next });
}

function createDarkModeToggle() {/* handled in enhanceTopNavigation */}
function createFontSizeToggle() {/* handled in enhanceTopNavigation */}

// ------------------ SCROLL CONTAINMENT & NAVIGATION ------------------------------
// Prevent scroll events from leaking through to the underlying webpage
function initScrollContainment() {
  // Get the main scrollable container
  const main = document.querySelector('.popup-container main');
  if (!main) return;
  
  // Create a passive wheel event handler for performance
  main.addEventListener('wheel', (event) => {
    // Only handle wheel events when they occur inside the popup
    const rect = main.getBoundingClientRect();
    const isInBounds = 
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
      
    if (isInBounds) {
      // Check if we're at the boundary of the scrollable area
      const scrollTop = main.scrollTop;
      const scrollHeight = main.scrollHeight;
      const clientHeight = main.clientHeight;
      
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      // Prevent scrolling beyond boundaries
      if ((isAtTop && event.deltaY < 0) || (isAtBottom && event.deltaY > 0)) {
        event.preventDefault();
      }
    }
  }, { passive: false });
  
  // Handle touch events for mobile devices
  let touchStartY = 0;
  
  main.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0].clientY;
  }, { passive: true });
  
  main.addEventListener('touchmove', (event) => {
    const touchY = event.touches[0].clientY;
    const scrollTop = main.scrollTop;
    const scrollHeight = main.scrollHeight;
    const clientHeight = main.clientHeight;
    
    // Detect scroll direction
    const isScrollingUp = touchY > touchStartY;
    const isScrollingDown = touchY < touchStartY;
    
    // Check boundaries
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    
    // Prevent scroll at boundaries
    if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
      event.preventDefault();
    }
    
    touchStartY = touchY;
  }, { passive: false });
  
  // Ensure info panels also prevent event propagation
  document.querySelectorAll('.info-panel').forEach(panel => {
    panel.addEventListener('wheel', (event) => {
      event.stopPropagation();
    }, { passive: true });
  });
}

// Adds a scroll-to-top button that appears when scrolling down
function addScrollToTopButton() {
  // Get the main scrollable container
  const main = document.querySelector('.popup-container main') || document.body;
  if (!main) return;
  
  // Create the button if it doesn't exist
  let scrollTopBtn = document.getElementById('scrollTopBtn');
  if (!scrollTopBtn) {
    scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scrollTopBtn';
    scrollTopBtn.className = 'scroll-top-button';
    scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollTopBtn.setAttribute('title', 'Scroll to top');
    
    // Add arrow icon using accessible SVG
    scrollTopBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 14l5-5 5 5"/>
      </svg>
    `;
    
    // Add click handler to scroll to top
    scrollTopBtn.addEventListener('click', () => {
      // Scroll to top with smooth behavior
      main.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Focus the page heading for better accessibility
      setTimeout(() => {
        focusPageHeading();
      }, 500);
    });
    
    // Add the button to the document
    document.body.appendChild(scrollTopBtn);
  }
  
  // Track scroll position and toggle button visibility
  const toggleButtonVisibility = () => {
    // Show button when scrolled down more than 300px
    const scrollThreshold = 300;
    const shouldShow = main.scrollTop > scrollThreshold;
    
    // Toggle the visible class
    scrollTopBtn.classList.toggle('visible', shouldShow);
  };
  
  // Initial check
  toggleButtonVisibility();
  
  // Listen for scroll events
  main.addEventListener('scroll', toggleButtonVisibility, { passive: true });
  
  // Add keyboard shortcut (Alt+Home) for accessibility
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'Home') {
      e.preventDefault();
      scrollTopBtn.click();
    }
  });
}

// ------------------ ACCESSIBILITY HELPERS ---------------------------
function focusPageHeading() {
  const h1 = document.querySelector('.top-nav h1');
  if (h1) {
    h1.setAttribute('tabindex', '-1');
    h1.focus();
  }
}

// ------------------ NAVIGATION HELPERS ------------------------------
function getCurrentPageIndex() {
  const match = window.location.pathname.match(/page(\d+)\.html$/);
  return match ? Number(match[1]) : 1;
}

function goBack() {
  window.history.length > 1 ? window.history.back() : window.location.href = 'popup.html';
}

// Helper to build correct URL regardless of current directory
function buildPageUrl(idx) {
  return idx === 1 ? '/popup.html' : `/pages/page${idx}.html`;
}

// ------------------ FORM SAVE / LOAD -------------------------------
function serializePageForm() {
  const data = {};
  const formElems = document.querySelectorAll('input, select, textarea');
  formElems.forEach(el => {
    if (el.type === 'checkbox') data[el.name || el.id] = el.checked;
    else if (el.type === 'radio') {
      if (el.checked) data[el.name] = el.value;
    } else data[el.name || el.id] = el.value;
  });
  return data;
}

function hydratePageForm(values = {}) {
  Object.entries(values).forEach(([k, v]) => {
    const el = document.querySelector(`[name="${k}"]`) || document.getElementById(k);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!v;
    else if (el.type === 'radio') {
      const radio = document.querySelector(`[name="${k}"][value="${v}"]`);
      if (radio) radio.checked = true;
    } else el.value = v;
  });
}

// Debounced saveFormData versions - both sync and async compatible
const debouncedSave = debounce(() => {
  // This version is for backward compatibility with existing code
  // that doesn't expect saveFormData to be async
  saveFormData().catch(err => console.error('Error in debounced saveFormData:', err));
}, 600);

// Async version that returns a promise for code that can handle async
const debouncedSaveAsync = debounce(async () => {
  return await saveFormData();
}, 600);

// Create a session if needed before saving form data with locking mechanism
async function createSessionIfNeeded() {
  // If we already have a session ID, no need to create one
  if (currentSessionId) return true;
  
  // If session creation is already in progress, wait for it to complete
  if (sessionCreationInProgress) {
    console.log('Session creation already in progress, waiting...');
    if (sessionCreationPromise) {
      const result = await sessionCreationPromise;
      return result;
    }
    return false; // Fallback if promise is somehow missing
  }
  
  // Check if we're marked as needing a session
  const stored = await new Promise(r => sGet([noSessionKey()], r));
  const needsSession = stored[noSessionKey()] || false;
  
  if (needsSession) {
    // Acquire lock and store promise
    sessionCreationInProgress = true;
    sessionCreationPromise = (async () => {
      console.log('Creating session on form interaction');
      try {
        // Try creating session with retry logic
        let attempts = 0;
        const maxAttempts = 3;
        let backoffDelay = 1000; // Start with 1 second
        
        while (attempts < maxAttempts) {
          // Create a new session
          currentSessionId = await createSession(currentSiteUrl);
          
          // Check if session creation succeeded
          if (currentSessionId) {
            // Store the new session ID and remove the no-session flag
            sSet({ 
              [sessionIdKey()]: currentSessionId,
              [noSessionKey()]: false
            });
            console.log(`Session created successfully: ${currentSessionId}`);
            return true;
          }
          
          // If we reach here, session creation failed
          attempts++;
          if (attempts < maxAttempts) {
            console.warn(`Session creation attempt ${attempts} failed, retrying in ${backoffDelay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            backoffDelay *= 2; // Exponential backoff
          }
        }
        
        // All attempts failed
        console.error(`Failed to create session after ${maxAttempts} attempts`);
        showToast('Failed to connect to server. Your progress will be saved locally until connection is restored.', 'warning');
        return false;
      } finally {
        // Release lock regardless of outcome
        sessionCreationInProgress = false;
        sessionCreationPromise = null;
      }
    })();
    
    return await sessionCreationPromise;
  }
  
  return false;
}

async function saveFormData() {
  try {
    // Ensure we have a session before saving if needed
    // Note: we don't need to block saving if session creation fails
    // as the data can still be saved locally
    await createSessionIfNeeded();
    
    const page = getCurrentPageIndex();
    const data = serializePageForm();
    const key = pageKey(page);

    // Store list of required fields for this page (auto-derived schema)
    const required = Array.from(document.querySelectorAll('[required]')).map(el => {
      const name = el.name || el.id;
      let labelTxt = '';
      const labelEl = document.querySelector(`label[for="${el.id}"]`);
      if (labelEl) labelTxt = labelEl.textContent.trim();
      return { name, label: labelTxt };
    });

    const reqKeyName = reqKey(page);
    return new Promise(resolve => {
      sSet({ [key]: data, [reqKeyName]: required }, () => {
        showSaveIndicator();
        resolve(true);
      });
    });
  } catch (error) {
    console.error('Error saving form data:', error);
    showToast('Error saving your progress. Please try again.', 'error');
    return false;
  }
}

function loadFormData() {
  const page = getCurrentPageIndex();
  const key = pageKey(page);
  sGet(key, res => {
    if (res[key]) hydratePageForm(res[key]);
  });
}

// ------------------ BACKEND SYNC & EXPORT ---------------------------
// Create a new review session on the backend and return its submissionId
function createSession(websiteUrl = '') {
  return new Promise(resolve => {
    sendWithRetry({
      type: 'api',
      url: `${BACKEND_BASE}/submit-review`,
      method: 'POST',
      body: { formData: {}, metadata: { websiteUrl } }
    }, resp => {
      const id = resp?.data?.submissionId;
      if (!id) console.warn('createSession: failed', resp);
      resolve(id || null);
    });
  });
}

function exportFormData() {
  if (!currentSessionId) {
    alert('No review to export yet.');
    return;
  }
  showLoading(true);
  sendWithRetry({
    type: 'api',
    url: `${BACKEND_BASE}/reviews/${currentSessionId}`,
    method: 'GET'
  }, resp => {
    showLoading(false);
    if (!resp || resp.status !== 200) return alert('Export failed');
    const fileName = `review_${currentSessionId}.json`;
    const blob = new Blob([JSON.stringify(resp.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({ url, filename: fileName, saveAs: true }, () => URL.revokeObjectURL(url));
  });
}

// Collect all stored pages answers for submission / export
function gatherAllPages() {
  return new Promise(resolve => {
    const keys = Array.from({ length: TOTAL_PAGES }, (_, i) => pageKey(i + 1));
    sGet(keys, items => {
      const out = {};
      for (let i = 1; i <= TOTAL_PAGES; i++) out['page' + i] = items[pageKey(i)] || {};
      resolve(out);
    });
  });
}

function gatherRequiredSchemas() {
  return new Promise(resolve => {
    const keys = Array.from({ length: TOTAL_PAGES }, (_, i) => reqKey(i + 1));
    sGet(keys, items => {
      const out = {};
      for (let i = 1; i <= TOTAL_PAGES; i++) out['page' + i] = items[reqKey(i)] || [];
      resolve(out);
    });
  });
}

// Final submission when user completes last page
async function finalizeSubmission() {
  console.log('finalizeSubmission() called.');

  // Duplicate-submit guard
  if (await hasReceipt()) {
    showToast('Review has already been submitted.', 'error');
    return;
  }

  // Ensure we have a session before trying to submit
  if (!currentSessionId) {
    console.log('No session yet, creating one before submission');
    const created = await createSessionIfNeeded();
    if (!created || !currentSessionId) {
      console.error('finalizeSubmission: Failed to create session!');
      alert('Error: Could not create a session. Please check your connection and try again.');
      return;
    }
  }
  showLoading(true, 'Preparing submission…', 10);
  
  // Debug logging - show what we're about to submit
  console.log(`Preparing to submit review for session ID: ${currentSessionId}`);
  
  // Save current page data before gathering all
  saveFormData();
  
  console.log('Calling gatherAllPages()...');
  const allPages = await gatherAllPages();
  
  // Backend expects a flat object of answers, not grouped by page
  // Extract and merge all field values from each page into a single flat object
  const formData = {};
  for (const pageKey in allPages) {
    const pageData = allPages[pageKey];
    // Copy each field from this page to our flat structure
    for (const fieldName in pageData) {
      formData[fieldName] = pageData[fieldName];
    }
  }
  
  console.log('Gathered answers by page:', allPages);
  console.log('Flattened form data for submission:', formData);

  const reqSchemas = await gatherRequiredSchemas();

  // ---------------- Completeness validation ------------------------
  const missing = validateReviewCompleteness(allPages, reqSchemas);
  const missingPages = Object.keys(missing);
  if (missingPages.length) {
    showLoading(false);
    // Build human friendly message
    let msg = 'Some required questions are missing:\n\n';
    missingPages.forEach(p => {
      msg += `Page ${p}: ${missing[p].join(', ')}\n`;
    });
    alert(msg);
    // Navigate to first missing page
    window.location.href = buildPageUrl(Number(missingPages[0]));
    return;
  }

  const metadata = {
    websiteUrl: currentSiteUrl,
    submittedAt: new Date().toISOString(),
    reviewVersion: EXT_VERSION,
    userAgent: navigator.userAgent
  };
  console.log('Submission metadata:', metadata);

  console.log('Checking final auth token...');
  // Ensure we have the auth token for the request
  const TOKEN_KEY = 'token';
  const token = await new Promise(resolve => {
    chrome.storage.local.get([TOKEN_KEY], res => resolve(res[TOKEN_KEY] || null));
  });
  
  if (!token) {
    console.error('finalizeSubmission: Token missing before sending API request!');
    showLoading(false);
    alert('Authentication token missing. Please log in again before submitting.');
    window.location.replace(chrome.runtime.getURL('login.html'));
    return;
  }
  
  // Send all form data in a single PUT request
  // Note: the server expects formData to be a flat object, not nested by page
  const body = { formData, metadata, complete: true };
  console.log('Sending body to server:', body);
  
  const reqMsg = { type: 'api', url: `${BACKEND_BASE}/reviews/${currentSessionId}`, method: 'PUT', body };
  const resp = await sendApi(reqMsg);

  if (!resp || resp.status < 200 || resp.status >= 300) {
    showLoading(false);
    let errorMsg = 'Submission failed during upload.';
    console.error(errorMsg, resp);
    alert(errorMsg);
    if (!resp || resp.status >= 500) queueSubmission(reqMsg);
    return; // abort further processing
  }

  // Submission successful
  showLoading(false);
  showToast('Review submitted successfully!');
  saveReceipt(new Date().toISOString());
  sRemove([pendingKey()]); // clear any queued data

  // Clear local storage for this origin and reset to page 1
  const keysToClear = [lastPageKey(), sessionIdKey(), siteUrlKey()];
  for (let i = 1; i <= TOTAL_PAGES; i++) keysToClear.push(pageKey(i));
  try {
    await new Promise((resolve, reject) => {
      sRemove(keysToClear, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
    window.location.href = buildPageUrl(1);
  } catch (err) {
    console.error('Error during post-submission cleanup:', err);
    alert('Submitted, but error resetting form. Please close and reopen the extension.');
  }
}

// Promise wrapper around sendWithRetry to allow async/await
function sendApi(msg) {
  return new Promise(res => {
    sendWithRetry(msg, resp => res(resp));
  });
}

// ------------------ PAGE-SPECIFIC INITIALISATION --------------------
function initPageSpecificFunctionality() {
  loadFormData();
  updateProgressBar();

  const form = document.querySelector('form');
  const validatePage = () => (form ? form.checkValidity() : true);
  const pageIndex = getCurrentPageIndex(); // Get page index once
  
  // Add listener for first interaction with form to create session
  if (form) {
    const createSessionOnFirstInteraction = async function(e) {
      try {
        // Remove this event listener to ensure it only runs once
        form.removeEventListener('input', createSessionOnFirstInteraction);
        
        // Show subtle indicator that we're creating a session
        const saveIndicator = document.querySelector('.save-indicator');
        if (saveIndicator) {
          saveIndicator.textContent = 'Starting session...';
          saveIndicator.classList.add('active');
        }
        
        // Try to create a session if we don't have one yet
        const result = await createSessionIfNeeded();
        
        // Update indicator
        if (saveIndicator) {
          saveIndicator.textContent = result ? 'Connected' : 'Offline mode';
          setTimeout(() => {
            saveIndicator.classList.remove('active');
          }, 2000);
        }
      } catch (error) {
        console.error('Error in form interaction handler:', error);
      }
    };
    
    // Check if we need to add the listener - using cached key if possible
    const checkAndAddListener = () => {
      sGet([noSessionKey()], res => {
        if (res[noSessionKey()]) {
          // Add listener for all common form interaction events
          form.addEventListener('input', createSessionOnFirstInteraction);
          form.addEventListener('change', createSessionOnFirstInteraction);
          // For accessibility, also capture keyboard events on focusable elements
          const interactiveElements = form.querySelectorAll('input, select, textarea, button');
          interactiveElements.forEach(el => {
            el.addEventListener('keydown', e => {
              if (e.key === 'Enter' || e.key === ' ') {
                createSessionOnFirstInteraction(e);
              }
            });
          });
        }
      });
    };
    
    checkAndAddListener();
  }

  const updateNextState = () => {
    const nextBtnRef = document.getElementById('next-button');
    if (nextBtnRef && pageIndex !== TOTAL_PAGES) { // Only disable if it's a real 'next' button
        nextBtnRef.disabled = !validatePage();
    }
  };

  document.body.addEventListener('change', evt => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(evt.target.tagName)) debouncedSave();
  });

  const nextButton = document.getElementById('next-button');
  const prevButton = document.getElementById('prev-button');

  if (prevButton) {
    prevButton.style.visibility = pageIndex === 1 ? 'hidden' : 'visible';
    prevButton.addEventListener('click', e => {
      e.preventDefault();
      saveFormData();
      const prevPage = pageIndex - 1;
      if (prevPage >= 1) window.location.href = buildPageUrl(prevPage);
    });
  }

  if (pageIndex === TOTAL_PAGES) {
    // On the LAST page (page 8)
    if (nextButton) nextButton.style.display = 'none'; // Hide the generic "Next" button

    const finalSubmitButton = document.getElementById('submit-feedback');
    if (finalSubmitButton) {
      // Disable if already submitted
      hasReceipt().then(already => {
        if (already) {
          finalSubmitButton.disabled = true;
          finalSubmitButton.textContent = 'Already submitted';
        } else {
          finalSubmitButton.addEventListener('click', async e => {
            e.preventDefault();
            saveFormData(); // ensure latest page data is stored before review summary
            console.log('#submit-feedback button clicked. Opening review summary.');
            await openReviewSummary();
          });
        }
      });
    } else {
      console.error('Could not find #submit-feedback button on page 8!');
    }
  } else if (nextButton) {
    // For pages 1 through 7
    nextButton.style.visibility = 'visible';
    nextButton.addEventListener('click', async e => {
      const currentPageIndex = getCurrentPageIndex(); // Re-get in handler in case of dynamic changes
      console.log(`Next button clicked on page: ${currentPageIndex}`);

      if (!validatePage()) {
        console.log('Form validation failed. Reporting validity.');
        if (form) form.reportValidity();
        return;
      }
      e.preventDefault();
      saveFormData(); // Save current page data first

      const nextPage = currentPageIndex + 1;
      console.log(`Navigating to page: ${nextPage}`);
      window.location.href = buildPageUrl(nextPage);
    });
  }

  updateNextState();
  if (form) form.addEventListener('input', updateNextState);

  if (form) {
    addDefaultPlaceholders(form);
  }
}

function updateProgressBar() {
  const page = getCurrentPageIndex();
  const percent = Math.round((page / TOTAL_PAGES) * 100);
  const bar = document.querySelector('.progress-bar');
  if (bar) {
    bar.style.width = percent + '%';
    bar.setAttribute('aria-valuenow', String(percent));
  }
  const lbl = document.getElementById('progress-label');
  if (lbl) lbl.textContent = `${percent}%`;
}

// -------- Default Placeholder Helper --------------------------------------
function addDefaultPlaceholders(form) {
  const selector = 'input:not([type=checkbox]):not([type=radio]):not([placeholder]), textarea:not([placeholder])';
  form.querySelectorAll(selector).forEach(el => {
    // Use label text if available
    let label = form.querySelector(`label[for="${el.id}"]`);
    const text = label ? `Enter ${label.textContent.trim()}…` : 'Type your answer here…';
    el.setAttribute('placeholder', text);
  });
}

// ------------------ SETTINGS / HELP / AUTH --------------------------
// Open a modal window within the popup
function openModal(page) {
  const prev = document.getElementById('popup-modal');
  if (prev) prev.remove();

  // Create overlay/backdrop
  const overlay = document.createElement('div');
  overlay.id = 'popup-modal';
  overlay.className = 'popup-overlay'; // NEW: use CSS class instead of inline styles

  // Clicking backdrop closes the modal
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'popup-modal';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.className = 'popup-close-btn';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.addEventListener('click', closeModal);

  // iFrame that hosts the page (settings.html etc.)
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL(page);
  Object.assign(iframe.style, { 
    flex: '1 1 auto', 
    width: '100%', 
    border: 'none', 
    overflow: 'hidden',
    height: '100%'
  });

  // Cleanup unwanted UI + propagate theme classes
  iframe.addEventListener('load', () => {
    const doc = iframe.contentDocument;
    if (!doc) return;

    // Remove nav / skip elements in modal context
    ['.nav-buttons', '.skip-link', '.bottom-nav'].forEach(sel => {
      doc.querySelectorAll(sel).forEach(el => el.remove());
    });

    // NEW: Unwrap content from popup-container to prevent double-containers
    const popupContainer = doc.querySelector('.popup-container');
    if (popupContainer) {
      // Move all children out of the popup-container and remove it
      const mainContent = doc.querySelector('#main-content');
      if (mainContent) {
        // Take main content out of popup-container and make it the root
        popupContainer.parentNode.insertBefore(mainContent, popupContainer);
        popupContainer.remove();
        // Configure proper scrolling for modal content
        mainContent.style.overflow = 'auto';
        mainContent.style.height = '100vh';
        mainContent.style.flex = '1';
        mainContent.style.padding = '16px 24px';
        mainContent.style.boxSizing = 'border-box';
        
        // Ensure content area has appropriate styling
        const contentArea = mainContent.querySelector('.content-area');
        if (contentArea) {
          contentArea.style.marginTop = '8px';
          contentArea.style.maxWidth = 'none';
        }

        // Add scroll containment within the iframe
        mainContent.addEventListener('wheel', (e) => {
          e.stopPropagation();
          // Prevent scroll from bubbling to parent window
          const atTop = mainContent.scrollTop === 0;
          const atBottom = mainContent.scrollTop >= mainContent.scrollHeight - mainContent.clientHeight;
          
          if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
            e.preventDefault();
          }
        }, { passive: false });

        // Prevent touch scrolling from bubbling
        mainContent.addEventListener('touchmove', (e) => {
          e.stopPropagation();
        }, { passive: false });
      }
    }

    // Style the top navigation header in modal context
    const header = doc.querySelector('.top-nav');
    if (header) {
      // Apply a more elegant styling to the header
      header.style.height = '50px';
      header.style.padding = '8px 16px';
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.justifyContent = 'center';
      header.style.position = 'sticky';
      header.style.top = '0';
      header.style.zIndex = '10';
      header.style.borderTopLeftRadius = '12px';
      header.style.borderTopRightRadius = '12px';
      
      // Make the title stand out more
      const title = header.querySelector('h1');
      if (title) {
        title.style.fontSize = '18px';
        title.style.fontWeight = '600';
        title.style.margin = '0';
        title.style.textAlign = 'center';
      }
    }

    // Update keyboard shortcuts with platform-specific content
    updateModalKeyboardShortcuts(iframe);

    // Propagate theme & font-size classes so modal matches parent
    const cls = [...THEME_CLASSES, ...FONT_SIZE_CLASSES];
    cls.forEach(c => {
      if (document.body.classList.contains(c)) doc.body.classList.add(c);
    });

    // Allow Esc inside iframe to close the modal
    doc.addEventListener('keydown', evt => {
      if (evt.key === 'Escape') closeModal();
    });
  });

  modal.append(closeBtn, iframe);
  overlay.append(modal);
  document.body.append(overlay);

  // Prevent background page scrolling when modal is open
  document.body.style.overflow = 'hidden';
  
  // Store original close function to restore scroll
  const originalClose = closeModal;
  window.closeModal = () => {
    document.body.style.overflow = '';
    originalClose();
  };

  // Trap focus inside modal + return focus on close
  trapFocus(overlay, document.activeElement);
}

// Global helper so iframe or other code can close the modal
function closeModal() {
  document.getElementById('popup-modal')?.remove();
}

function showSettings() {
  openModal('settings.html');
}

function showHelp() {
  openModal('about.html');
}

function logout() {
  // Hit backend logout endpoint then clear client token
  sendWithRetry({
    type: 'api',
    url: `${BACKEND_BASE}/auth/logout`,
    method: 'POST'
  }, () => {
    chrome.storage.sync.remove('token', () => window.location.href = 'login.html');
  });
}

// --------- Submission receipt helpers ------------------------------
function receiptKey() { return `${currentSessionId || 'default'}_submitted`; }

function saveReceipt(value) {
  sSet({ [receiptKey()]: value });
}

function hasReceipt() {
  return new Promise(res => {
    sGet([receiptKey()], items => res(Boolean(items[receiptKey()])));
  });
}

// ---------- Offline Submission Queue --------------------------------
function pendingKey() { return `${currentSessionId || 'default'}_pending`; }

function queueSubmission(requestMsg) {
  sSet({ [pendingKey()]: requestMsg }, () => {
    showToast('Submission saved offline and will retry later.', 'info');
  });
}

async function flushPending() {
  try {
    // First check if there are any pending items before trying to create a session
    const items = await new Promise(resolve => sGet([pendingKey()], resolve));
    const pending = items[pendingKey()];
    if (!pending) return;
    
    // Only create a session if we actually have pending items to flush
    const sessionNeeded = await createSessionIfNeeded();
    
    showToast('Attempting to send queued submission…');
    return new Promise(resolve => {
      sendWithRetry(pending, resp => {
        if (resp && resp.status >= 200 && resp.status < 300) {
          sRemove([pendingKey()]);
          showToast('Offline submission sent!', 'success');
          resolve(true);
        } else {
          console.warn('Failed to flush pending data:', resp);
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error('Error in flushPending:', error);
    return false;
  }
}

window.addEventListener('online', flushPending);

// ---------- Tab-scoped storage abstraction ---------------------------
// Use chrome.storage.session when available (MV3). Fallback to local.
const storageArea = (chrome.storage && chrome.storage.session) ? chrome.storage.session : chrome.storage.local;
let TAB_PREFIX = '';
function pageKey(n)        { return `${currentOrigin}_page_${n}`; }
function lastPageKey()     { return `${currentOrigin}_${LAST_PAGE_KEY}`; }
function sessionIdKey()    { return `${currentOrigin}_${SESSION_KEY}`; }
function noSessionKey()    { return `${currentOrigin}_${NO_SESSION_KEY}`; }
function siteUrlKey()      { return `${currentOrigin}_${SITE_URL_KEY}`; }
function reqKey(n)         { return `${currentOrigin}_req_${n}`; }
function sGet(keys, cb)    { storageArea.get(keys, cb); }
function sSet(items, cb)   { storageArea.set(items, cb); }
function sRemove(keys, cb) { storageArea.remove(keys, cb); }

// ---------------- Toast helper ---------------------------------------
function showToast(text, type = 'success') {
  let m = document.getElementById('message-container');
  if (!m) {
    m = document.createElement('div');
    m.id = 'message-container';
    m.setAttribute('role', 'status');
    m.setAttribute('aria-live', 'polite');
    Object.assign(m.style, {
      position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)',
      color: '#fff', padding: '8px 14px', borderRadius: '4px',
      fontSize: '14px', zIndex: 4000, boxShadow: '0 2px 6px rgba(0,0,0,.2)'
    });
    document.body.append(m);
  }
  // Apply different background based on type
  m.style.background = type === 'error' ? '#dc3545' : '#006837';
  m.textContent = text;
  clearTimeout(m._timer);
  m._timer = setTimeout(() => m.remove(), 4000);
}

// Simple debounce helper
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), ms);
  };
}

// ------------- sendMessage with retry (0.5s,1s) ----------------------
function sendWithRetry(msg, cb, attempt = 1) {
  chrome.runtime.sendMessage(msg, resp => {
    const error = chrome.runtime.lastError;
    const transient = resp && resp.status >= 500 && resp.status < 600;
    if ((error || transient) && attempt < 3) {
      return setTimeout(() => sendWithRetry(msg, cb, attempt + 1), 500 * Math.pow(2, attempt - 1));
    }
    if (error) console.debug('sendWithRetry:', error.message);
    cb(resp);
  });
}

// ---------------- REVIEW COMPLETENESS CHECK -------------------------
function validateReviewCompleteness(allPages, reqSchemas) {
  const missingDetail = {};
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const pageId = 'page' + i;
    const pageData = allPages[pageId] || {};
    const requiredFields = reqSchemas[pageId] || [];

    if (requiredFields.length) {
      requiredFields.forEach(({ name, label }) => {
        const val = pageData[name];
        const isFilled = (typeof val === 'boolean') ? val : (val != null && String(val).trim() !== '');
        if (!isFilled) {
          if (!missingDetail[i]) missingDetail[i] = [];
          missingDetail[i].push(label || name);
        }
      });
    }

    // if page has required fields but user never visited (no data captured), mark all as missing
    if (requiredFields.length && Object.keys(pageData).length === 0) {
      missingDetail[i] = requiredFields.map(f => f.label || f.name);
    }
  }
  return missingDetail; // {3: ['Site name', 'Category'], 5:['…']}
}

// ---------------- REVIEW SUMMARY MODAL -------------------------------
const PAGE_TITLES = [
  '', // index 0 unused
  'Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5', 'Page 6', 'Page 7', 'Page 8'
];

async function openReviewSummary() {
  const prev = document.getElementById('review-summary-modal');
  if (prev) prev.remove();

  const overlay = document.createElement('div');
  overlay.id = 'review-summary-modal';
  overlay.className = 'review-summary-overlay';

  const box = document.createElement('div');
  box.className = 'review-modal';

  const header = document.createElement('div');
  header.textContent = 'Review your answers';
  header.className = 'review-modal-header';
  header.id = 'review-modal-title';
  box.setAttribute('aria-labelledby', header.id);

  const body = document.createElement('div');
  body.className = 'review-modal-body';

  const footer = document.createElement('div');
  footer.className = 'review-modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Back to form';
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.addEventListener('click', () => overlay.remove());

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm & Submit';
  confirmBtn.className = 'btn btn-primary';
  confirmBtn.addEventListener('click', async () => {
    overlay.remove();
    await finalizeSubmission();
  });

  footer.append(cancelBtn, confirmBtn);

  body.appendChild(await buildSummaryContent());

  box.append(header, body, footer);
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  overlay.append(box);
  document.body.append(overlay);

  const returnFocusEl = document.activeElement;
  trapFocus(overlay, returnFocusEl);
}

async function buildSummaryContent() {
  const all = await gatherAllPages();
  const container = document.createElement('div');
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const sec = document.createElement('details');
    sec.open = false;
    const sum = document.createElement('summary');
    sum.textContent = PAGE_TITLES[i] || `Page ${i}`;
    sec.appendChild(sum);

    const list = document.createElement('dl');
    Object.entries(all['page' + i] || {}).forEach(([k, v]) => {
      const dt = document.createElement('dt'); dt.textContent = k;
      dt.style.fontWeight = '600';
      const dd = document.createElement('dd'); dd.textContent = typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v;
      dd.style.marginLeft = '0';
      list.append(dt, dd);
    });
    if (!list.childElementCount) {
      const p = document.createElement('p'); p.textContent = 'No answers provided.'; list.appendChild(p);
    }
    sec.appendChild(list);
    container.appendChild(sec);
  }
  return container;
}

// Trap focus within a given overlay; restore on close via ESC
function trapFocus(overlay, returnEl) {
  const focusableStr = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusables = Array.from(overlay.querySelectorAll(focusableStr));
  if (!focusables.length) return;
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];

  const keyHandler = e => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      overlay.remove();
      if (returnEl && typeof returnEl.focus === 'function') returnEl.focus();
      overlay.removeEventListener('keydown', keyHandler);
    }
  };

  overlay.addEventListener('keydown', keyHandler);
  first.focus();
}

function initKeyboardShortcuts() {
  // Only initialize keyboard shortcuts in top-level popup, not in iframes/modals
  if (window.self !== window.top) return;

  // Enhanced keyboard shortcut handler with platform detection
  const handleKeyboardShortcuts = (event) => {
    // Don't interfere with form inputs when user is typing
    const activeElement = document.activeElement;
    const isTyping = activeElement && 
                     (activeElement.tagName === 'INPUT' || 
                      activeElement.tagName === 'TEXTAREA' || 
                      activeElement.isContentEditable);

    // Handle ESC key universally (close modals/popup)
    if (KeyboardShortcuts.matchesShortcut(event, 'closePopup')) {
      event.preventDefault();
      
      // Check for open modals first (priority: close modal before popup)
      const openModal = document.getElementById('popup-modal') || 
                       document.getElementById('review-summary-modal');
      
      if (openModal) {
        // Let existing modal handlers deal with ESC
        return;
      } else {
        // Close the main popup
        try {
          window.close();
        } catch (e) {
          // Fallback: blur the popup to signal browser to close it
          window.blur();
        }
      }
      return;
    }

    // Don't process other shortcuts while typing in form fields
    if (isTyping) return;

    // Platform-aware shortcut handling
    const currentPage = getCurrentPageIndex();
    
    // Page Navigation
    if (KeyboardShortcuts.matchesShortcut(event, 'previousPage') && currentPage > 1) {
      event.preventDefault();
      const prevBtn = document.getElementById('prev-button');
      if (prevBtn && !prevBtn.disabled) {
        prevBtn.click();
      }
      return;
    }

    if (KeyboardShortcuts.matchesShortcut(event, 'nextPage') && currentPage < TOTAL_PAGES) {
      event.preventDefault();
      const nextBtn = document.getElementById('next-button');
      if (nextBtn && !nextBtn.disabled) {
        nextBtn.click();
      }
      return;
    }

    // Scroll to top
    if (KeyboardShortcuts.matchesShortcut(event, 'scrollToTop')) {
      event.preventDefault();
      const scrollTopBtn = document.getElementById('scrollTopBtn');
      if (scrollTopBtn) {
        scrollTopBtn.click();
      }
      return;
    }

    // Quick Actions
    if (KeyboardShortcuts.matchesShortcut(event, 'saveProgress')) {
      event.preventDefault();
      saveFormData();
      showToast('Progress saved', 'success');
      return;
    }

    if (KeyboardShortcuts.matchesShortcut(event, 'exportData')) {
      event.preventDefault();
      const exportBtn = document.getElementById('export-json');
      if (exportBtn) {
        exportBtn.click();
      }
      return;
    }

    if (KeyboardShortcuts.matchesShortcut(event, 'openHelp')) {
      event.preventDefault();
      const helpBtn = document.getElementById('help-button');
      if (helpBtn) {
        helpBtn.click();
      }
      return;
    }

    if (KeyboardShortcuts.matchesShortcut(event, 'openSettings')) {
      event.preventDefault();
      const settingsBtn = document.getElementById('settings-button');
      if (settingsBtn) {
        settingsBtn.click();
      }
      return;
    }

    if (KeyboardShortcuts.matchesShortcut(event, 'toggleTheme')) {
      event.preventDefault();
      toggleTheme();
      return;
    }

    // Page jumping shortcuts (Ctrl/Cmd+1 through Ctrl/Cmd+8)
    if (KeyboardShortcuts.matchesShortcut(event, 'jumpToPage')) {
      event.preventDefault();
      const targetPage = parseInt(event.key);
      if (targetPage >= 1 && targetPage <= TOTAL_PAGES) {
        // Save current page before navigating
        saveFormData();
        window.location.href = buildPageUrl(targetPage);
      }
      return;
    }
  };

  // Add the event listener with proper cleanup
  document.addEventListener('keydown', handleKeyboardShortcuts, {
    capture: true, // Use capture phase for better control
    passive: false // Need to preventDefault
  });

  // Store reference for cleanup if needed
  initKeyboardShortcuts.cleanup = () => {
    document.removeEventListener('keydown', handleKeyboardShortcuts, {
      capture: true
    });
  };

  // Update button tooltips with platform-specific shortcuts
  updateButtonTooltips();
}

/**
 * Update button tooltips to show platform-appropriate shortcuts
 */
function updateButtonTooltips() {
  const buttonMappings = {
    'help-button': 'openHelp',
    'settings-button': 'openSettings', 
    'export-json': 'exportData',
    'theme-toggle': 'toggleTheme'
  };

  Object.entries(buttonMappings).forEach(([buttonId, shortcutId]) => {
    const button = document.getElementById(buttonId);
    if (button) {
      const keyDisplay = KeyboardShortcuts.getKeyDisplay(shortcutId);
      const shortcut = KeyboardShortcuts.shortcuts[shortcutId];
      if (keyDisplay.length && shortcut) {
        const keyString = keyDisplay.join(' ');
        button.title = `${shortcut.description} (${keyString})`;
        button.setAttribute('aria-label', `${shortcut.description} (${keyString})`);
      }
    }
  });
}

/**
 * Generate platform-specific keyboard shortcuts documentation HTML
 * This creates the shortcuts table dynamically based on user's OS
 */
function generateKeyboardShortcutsHTML() {
  const categories = KeyboardShortcuts.getShortcutsByCategory();
  const platform = Platform.detect();
  const platformName = Platform.isMac() ? 'macOS' : Platform.isWindows() ? 'Windows' : 'Linux';
  
  let html = `
    <div class="shortcuts-table">
      <div class="platform-indicator">
        <p><strong>🖥️ Platform:</strong> Shortcuts optimized for ${platformName}</p>
      </div>
  `;
  
  // Generate each category
  Object.entries(categories).forEach(([categoryName, shortcuts]) => {
    html += `
      <div class="shortcuts-category">
        <h4>${categoryName}</h4>
        <ul>
    `;
    
    shortcuts.forEach(shortcut => {
      const keyElements = shortcut.keyDisplay.map(key => `<kbd>${key}</kbd>`).join(' ');
      html += `
        <li>
          <div class="shortcut-keys">
            ${keyElements}
          </div>
          <div class="shortcut-description">${shortcut.description}</div>
        </li>
      `;
    });
    
    html += `
        </ul>
      </div>
    `;
  });
  
  // Add platform-specific notes
  const platformNotes = Platform.isMac() ? 
    `
      <div class="keyboard-notes">
        <p><strong>💡 macOS Shortcuts:</strong> Uses Command (⌘) and Option (⌥) keys for most shortcuts, following macOS conventions.</p>
        <p><strong>⚙️ Global Shortcut:</strong> You can customize the global shortcut by visiting <code>chrome://extensions/shortcuts</code> in your browser.</p>
        <p><strong>♿ Smart Context:</strong> Most shortcuts are disabled while typing in form fields to prevent interference with your input.</p>
      </div>
    ` :
    `
      <div class="keyboard-notes">
        <p><strong>💡 Smart Context:</strong> Most shortcuts are disabled while typing in form fields to prevent interference with your input.</p>
        <p><strong>⚙️ Customization:</strong> You can customize the global shortcut by visiting <code>chrome://extensions/shortcuts</code> in your browser.</p>
        <p><strong>♿ Accessibility:</strong> All shortcuts work with screen readers and follow WCAG guidelines.</p>
      </div>
    `;
  
  html += platformNotes + '</div>';
  
  return html;
}

/**
 * Update keyboard shortcuts documentation in modal iframes
 * Called when settings or help modals are opened
 */
function updateModalKeyboardShortcuts(iframe) {
  if (!iframe || !iframe.contentDocument) return;
  
  const doc = iframe.contentDocument;
  const shortcutsContainer = doc.querySelector('.shortcuts-table');
  
  if (shortcutsContainer) {
    // Replace static content with dynamic platform-specific content
    shortcutsContainer.outerHTML = generateKeyboardShortcutsHTML();
  }
}

/**
 * Update keyboard shortcuts display for the current platform on main popup page
 */
function updateMainPageKeyboardShortcuts() {
  // Only update if we're on the main popup page and elements exist
  if (window.location.pathname.endsWith('popup.html') || window.location.pathname === '/') {
    const modifiers = KeyboardShortcuts.modifiers;
    const platformName = Platform.isMac() ? 'macOS' : Platform.isWindows() ? 'Windows' : 'Linux';
    
    // Update platform name
    const platformNameElement = document.getElementById('platform-name');
    if (platformNameElement) {
      platformNameElement.textContent = platformName;
    }
    
    // Update global shortcut (Alt/Option)
    const globalKey = document.getElementById('global-shortcut-key');
    if (globalKey) {
      globalKey.textContent = modifiers.secondary.symbol;
    }
    
    // Update navigation key (Ctrl/Cmd)
    const navKey = document.getElementById('nav-key');
    if (navKey) {
      navKey.textContent = modifiers.primary.symbol;
    }
    
    // Update settings key (Ctrl/Cmd)
    const settingsKey = document.getElementById('settings-key');
    if (settingsKey) {
      settingsKey.textContent = modifiers.primary.symbol;
    }
  }
}