// settings.js – handle saving/loading extension preferences, including dynamic backend URL
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settings-form');
  if (!form) return;

  const resetBtn   = document.getElementById('reset-btn');
  const backendInp = document.getElementById('backendUrl');
  // keys mapping id -> storage key (sync area)
  const fieldMap = {
    darkMode: 'darkMode',
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

  // --------- save handler ----------------------------
  form.addEventListener('submit', e => {
    e.preventDefault();
    const out = {};
    for (const [id, key] of Object.entries(fieldMap)) {
      const el = document.getElementById(id);
      if (!el) continue;
      out[key] = (el.type === 'checkbox') ? el.checked : el.value;
    }
    chrome.storage.sync.set(out, () => {
      // simple toast – reuse showToast from popup if available
      if (typeof showToast === 'function') {
        showToast('Settings saved');
      } else {
        alert('Settings saved');
      }
    });
  });

  // -------- reset defaults ---------------------------
  resetBtn?.addEventListener('click', () => {
    chrome.storage.sync.clear(() => window.location.reload());
  });
});
