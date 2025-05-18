// Token storage helper
// Simple, promise-friendly wrappers for storing JWT tokens.
// Kept global so can be imported via importScripts in the service worker.
// NOTE: For Phase 1 we store plain text. Phase 3 will add encryption.

(function (root) {
  const STORAGE_KEY = 'token';

  function getToken() {
    return new Promise(resolve => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get([STORAGE_KEY], res => resolve(res[STORAGE_KEY] || null));
      } else {
        resolve(localStorage.getItem(STORAGE_KEY));
      }
    });
  }

  function saveToken(token) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [STORAGE_KEY]: token });
    } else {
      localStorage.setItem(STORAGE_KEY, token);
    }
  }

  function clearToken() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(STORAGE_KEY);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Expose globally
  root.getToken = getToken;
  root.saveToken = saveToken;
  root.clearToken = clearToken;
})(typeof self !== 'undefined' ? self : this);
