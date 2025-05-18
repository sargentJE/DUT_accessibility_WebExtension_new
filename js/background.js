// Background script for the Accessibility Helper extension

// Listen for installation or update events
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings when extension is first installed
    chrome.storage.sync.set({
      theme: 'light',
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false,
      darkMode: false,
      frequency: 30
    });
    
    // Open onboarding page
    chrome.action.openPopup();
  } else if (details.reason === 'update') {
    // Handle extension updates
    const version = chrome.runtime.getManifest().version;
    console.log(`Extension updated to version ${version}`);
  }
});

// Background simplified: All previously included accessibility‑scan and helper logic
// (message listeners, contrast checker, screen‑reader simulator, etc.) has been removed
// to keep the extension lightweight and focused solely on collecting user feedback via
// the popup UI. No additional background tasks are currently required.

// --- API proxy for content & popup scripts ---
importScripts('token.js');

// Keep service worker alive on module import in some browsers
self.addEventListener('message', () => {});

// Utility to fetch backend URL from storage (sync)
async function getBackendUrl () {
  return new Promise(r => chrome.storage.sync.get(['backendUrl'], v => r(v.backendUrl || 'https://web-production-d801.up.railway.app')));
}

// Simple in-memory retry queue (also mirrored to storage.local for offline)
let requestQueue = [];
// Load queue from previous session
chrome.storage.local.get(['syncQueue'], res => {
  requestQueue = Array.isArray(res.syncQueue) ? res.syncQueue : [];
  flushQueue();
});

// Flush queued jobs when back online or at startup
async function flushQueue () {
  if (!navigator.onLine || !requestQueue.length) return;
  const copy = [...requestQueue];
  requestQueue.length = 0;
  let success = 0;
  for (const job of copy) {
    try {
      await doFetch(job, 0);
      success++;
    } catch { /* push back on failure */ requestQueue.push(job); }
  }
  chrome.storage.local.set({ syncQueue: requestQueue });
  if (success) {
    chrome.runtime.sendMessage({ type: 'SYNC_FLUSH', count: success });
  }
}

self.addEventListener('online', flushQueue);

// ------------------------------------------------------
async function doFetch (msg, attempt = 0) {
  const backend = await getBackendUrl();
  const url = msg.url.replace('http://localhost:3000', backend);
  const token = await self.getToken();
  const opts = {
    method: msg.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: msg.body ? JSON.stringify(msg.body) : undefined,
    mode: 'cors',
    credentials: 'omit'
  };
  const res = await fetch(url, opts);
  // ---- auth errors ----
  if (res.status === 401 || res.status === 403) {
    await self.clearToken();
    chrome.runtime.sendMessage({ type: 'AUTH_EXPIRED' });
    throw new Error('Auth expired');
  }
  // ---- rate limit ----
  if (res.status === 429 && attempt < 3) {
    const retry = parseInt(res.headers.get('Retry-After') || '5', 10);
    await new Promise(s => setTimeout(s, retry * 1000));
    return doFetch(msg, attempt + 1);
  }
  return res;
}

async function fetchAndRespond (msg, sendResponse) {
  try {
    const res = await doFetch(msg);
    const data = await res.json().catch(() => ({}));
    sendResponse({ status: res.status, data });
  } catch (err) {
    // offline → queue
    if (!navigator.onLine) {
      requestQueue.push(msg);
      chrome.storage.local.set({ syncQueue: requestQueue });
    }
    sendResponse({ status: 0, data: { error: err.message } });
  }
}

// Wrap async logic inside non-async listener to correctly keep message port alive
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg) return;

  if (msg.type === 'api') {
    fetchAndRespond(msg, sendResponse);
    return true; // keep port open for async sendResponse
  }

  if (msg.type === 'exportData') {
    try {
      const fileName = 'accessibility_review_' + new Date().toISOString().slice(0, 10) + '.json';
      const blob = new Blob([JSON.stringify(msg.payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({ url, filename: fileName, saveAs: true }, () => {
        URL.revokeObjectURL(url);
        sendResponse({ status: 'ok' });
      });
    } catch (err) {
      sendResponse({ status: 0, error: err.message });
    }
    return true;
  }
});