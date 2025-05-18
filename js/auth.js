// Authentication UI logic specific to settings.html
// Phase 2 – login form + logout button in Settings screen only.
// JS is built as an ES-module but we avoid import syntax to keep CSP simple.

'use strict';

// Use global helpers exposed by token.js
document.addEventListener('DOMContentLoaded', () => {
  const loginForm   = document.getElementById('login-form');
  const loggedInBox = document.getElementById('logged-in');
  const emailEl     = document.getElementById('user-email');
  const logoutBtn   = document.getElementById('logout-btn');

  if (!loginForm || !logoutBtn) return; // safety guard on other pages

  async function getBackendUrl () {
    return new Promise(r => chrome.storage.sync.get(['backendUrl'], v => r(v.backendUrl || 'https://web-production-d801.up.railway.app')));
  }

  async function render() {
    const token = await getToken();
    const hasToken = !!token;
    loginForm.hidden   = hasToken;
    loggedInBox.hidden = !hasToken;
    if (hasToken) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        emailEl.textContent = payload.email || 'Logged in';
      } catch (_) {
        emailEl.textContent = 'Logged in';
      }
    }
  }

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const body = {
      email: formData.get('email'),
      password: formData.get('password')
    };
    try {
      const base = await getBackendUrl();
      const res = await fetch(base + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        saveToken(data.token);
        // Redirect user to the main extension UI after login to avoid manual reopen
        const dest = (typeof chrome !== 'undefined' && chrome.runtime)
          ? chrome.runtime.getURL('popup.html')
          : 'popup.html';
        window.location.replace(dest);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      alert('Network error');
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await clearToken();
    render();
  });

  render();
});
