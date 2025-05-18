// settings.js – handle saving/loading extension preferences, including dynamic backend URL
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settings-form');
  if (!form) return;

  const resetBtn   = document.getElementById('reset-btn');
  const backendInp = document.getElementById('backendUrl');
  // keys mapping id -> storage key (sync area)
  const fieldMap = {
    theme: 'theme',
    fontSize: 'fontSize',
    frequency: 'frequency',
    highContrast: 'highContrast',
    reduceMotion: 'reduceMotion',
    backendUrl: 'backendUrl'
  };

  // --------- load existing settings ------------------
  chrome.storage.sync.get(Object.values(fieldMap), items => {
    for (const [id, key] of Object.entries(fieldMap)) {
      const el = document.getElementById(id);
      if (!el) continue;
      const val = items[key];
      if (el.type === 'checkbox') {
        el.checked = Boolean(val);
      } else if (typeof val !== 'undefined') {
        el.value = val;
      }
    }
  });

  // ---------- LIVE PREVIEW OF THEME & FONT SIZE ------------------------
  (function attachLivePreview() {
    const themeSel = document.querySelector('#theme');
    const fontSel  = document.querySelector('#fontSize');
    const callParent = (fn, arg) => {
      if (window.top && typeof window.top[fn] === 'function') window.top[fn](arg);
    };
    if (themeSel) themeSel.addEventListener('change', e => callParent('applyTheme', e.target.value));
    if (fontSel)  fontSel.addEventListener('change', e => callParent('applyFontSize', e.target.value));
  })();

  // --------- save handler ----------------------------
  form.addEventListener('submit', e => {
    e.preventDefault();
    const out = {};
    const elems = form.querySelectorAll('input, select, textarea');
    elems.forEach(el => {
      const key = el.name || el.id;
      if (!key) return;
      if (el.type === 'checkbox') out[key] = el.checked;
      else if (el.type === 'radio') {
        if (el.checked) out[key] = el.value;
      } else out[key] = el.value;
    });
    chrome.storage.sync.set(out, () => {
      if (window.top && typeof window.top.showToast === 'function') window.top.showToast('Settings saved');
      if (window.top && typeof window.top.closeModal === 'function') window.top.closeModal();
    });
  });

  // Esc key inside settings page closes the modal
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && window.top && typeof window.top.closeModal === 'function') window.top.closeModal();
  });

  // -------- reset defaults ---------------------------
  resetBtn?.addEventListener('click', () => {
    chrome.storage.sync.clear(() => window.location.reload());
  });
});
