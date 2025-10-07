/*
 * login.js: Firebase Authentication Handler
 *
 * This script manages the user login process using Firebase Authentication. It is designed
 * to be a self-contained, plain JavaScript module with no external dependencies besides
 * the Firebase SDK.
 *
 * Features:
 *   - Renders a login form for username and password.
 *   - Validates user input before submission.
 *   - Authenticates users via Firebase's email/password method.
 *   - Constructs email from username and a predefined domain (pcacs.com).
 *   - Redirects users based on the `mustChangePassword` flag in their Firestore profile.
 *
 * Dependencies:
 *   - Firebase App Compat SDK (`firebase-app-compat.js`)
 *   - Firebase Auth Compat SDK (`firebase-auth-compat.js`)
 *   - A global `window.FIREBASE_CONFIG` object must be defined in the HTML.
 */
import { TEXT as T } from '../lang/eng.js';
(function () {
  'use strict';

  // --- URL helpers for returnTo ---
  function getReturnTo() {
    try {
      const url = new URL(location.href);
      return url.searchParams.get('returnTo');
    } catch { return null; }
  }
  function goAfterLogin(fallback) {
    const ret = getReturnTo();
    if (ret) {
      location.assign(ret);
    } else {
      location.assign(fallback);
    }
  }

  /* ==========================================================================
     DOM & Utility Helpers
     ========================================================================== */
  const $id = (id) => document.getElementById(id);
  const createEl = (tag, attrs = {}, text = '') => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null) continue;
      if (k === 'class' || k === 'className') el.className = v;
      else if (k === 'dataset' && typeof v === 'object') {
        Object.entries(v).forEach(([dk, dv]) => (el.dataset[dk] = dv));
      } else if (k in el) el[k] = v;
      else el.setAttribute(k, v);
    }
    if (text) el.textContent = text;
    return el;
  };
  const append = (parent, child) => (parent.appendChild(child), child);

  // --- Text Labels & Configuration ------------------------------------------
  // All text labels are overridable via `window.TEXT.login.*`.
  //const T = (typeof window !== 'undefined' && window.TEXT) ? window.TEXT : {};

  // The domain used to construct a full email from a username.
  // This must align with the domain used in the admin user-creation script.
  const AUTH_USERNAME_DOMAIN = 'pcacs.com';

  // --- Route Definitions ----------------------------------------------------
  // Defines navigation paths for post-login redirection.
  const NEXT_ROUTE = '/simulator.html'; // Default page after successful login
  const PASSWORD_RESET_ROUTE = '/password-reset.html'; // Page for mandatory password changes


  const LABELS = {
  title: T?.index?.title,
  pageTitle: T?.login?.pageTitle,
  usernameLabel: T?.login?.usernameLabel,
  usernamePlaceholder: T?.login?.usernamePlaceholder,
  passwordLabel: T?.login?.passwordLabel,
  passwordPlaceholder: T?.login?.passwordPlaceholder,
  submitText: T?.login?.submitText,
  errors: {
    required: T?.login?.errors?.required,
    email: T?.login?.errors?.email,
    generic: T?.login?.errors?.generic,
    userNotFound: T?.login?.errors?.userNotFound,
    wrongPassword: T?.login?.errors?.wrongPassword,
    tooMany: T?.login?.errors?.tooMany,
    invalidCredential: T?.login?.errors?.invalidCredential,
    sdkMissing: 'Authentication service is unavailable. Please contact support.'
  }
  };

  /* ==========================================================================
     Input Validation
     ========================================================================== */
  // Username validation: letters/digits/._- (1-64)
  const USERNAME_RE = /^[A-Za-z0-9._-]{1,64}$/;
  const validateUsername = (v) => {
    const s = (v || '').trim();
    if (!s) return { ok: false, reason: 'required' };
    return USERNAME_RE.test(s) ? { ok: true } : { ok: false, reason: 'generic' };
  };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validateEmail = (v) => {
    const s = (v || '').trim();
    if (!s) return { ok: false, reason: 'required' };
    if (!EMAIL_RE.test(s)) return { ok: false, reason: 'email' };
    return { ok: true };
  };
  const validateRequired = (v) => {
    const s = (v || '').trim();
    return s ? { ok: true } : { ok: false, reason: 'required' };
  };

  const setErr = (el, reason) => {
    if (!el) return;
    if (!reason) { el.textContent = ''; el.style.display = 'none'; return; }
    const map = {
      required: LABELS.errors.required,
      email: LABELS.errors.email,
      userNotFound: LABELS.errors.userNotFound,
      wrongPassword: LABELS.errors.wrongPassword,
      tooMany: LABELS.errors.tooMany,
      invalidCredential: LABELS.errors.invalidCredential,
      generic: LABELS.errors.generic,
      sdkMissing: LABELS.errors.sdkMissing
    };
    el.textContent = map[reason] || map.generic;
    el.style.display = 'block';
  };

  /* ==========================================================================
     UI Rendering
     ========================================================================== */
  function inputRow({ id, label, placeholder, type }) {
    const row = createEl('div', { class: 'form-group' });
    const lab = append(row, createEl('label', { htmlFor: id }, label));
    lab.style.fontWeight = '700'; // keep bold label

    const inp = append(row, createEl('input', {
      id, name: id, type,
      placeholder,
      autocomplete: id === 'password' ? 'current-password' : 'username',
      required: true
    }));
    const err = append(row, createEl('div', { id: `${id}-error`, class: 'form-error', ariaLive: 'polite' }));
    err.style.display = 'none';
    err.style.color = 'var(--color-primary)';
    err.style.marginTop = '0.25rem';
    err.style.fontSize = '0.95rem';

    return { row, inp, err, lab, touched: false };
  }

  function renderLoginForm(root) {
    root.innerHTML = '';

    const wrapper = append(root, createEl('div', { class: 'simulation-list' }));
    const form = append(wrapper, createEl('form', { id: 'login-form', noValidate: true }));

    const u = inputRow({
      id: 'username',
      label: LABELS.usernameLabel,
      placeholder: LABELS.usernamePlaceholder,
      type: 'text'
    });
    form.appendChild(u.row);

    const p = inputRow({
      id: 'password',
      label: LABELS.passwordLabel,
      placeholder: LABELS.passwordPlaceholder,
      type: 'password'
    });
    form.appendChild(p.row);

    const submitBtn = append(form, createEl('button', {
      id: 'login-submit-btn',
      type: 'submit',
      class: 'simulation-button',
    }, LABELS.submitText));
    submitBtn.disabled = true;

    // Normalize page header (avoid sticky header mismatch)
    let h1 = document.querySelector('h1');
    if (!h1) {
      const logo = document.querySelector('.logo') || document.querySelector('a[href$="index.html"] img');
      h1 = createEl('h1', {}, 'Sign In');
      if (logo && logo.parentElement) {
        logo.parentElement.insertAdjacentElement('afterend', h1);
        h1.insertAdjacentElement('afterend', createEl('hr'));
      } else {
        document.body.prepend(createEl('hr'));
        document.body.prepend(h1);
      }
    } else {
      h1.textContent = 'Sign In';
      const nextHr = h1.nextElementSibling;
      if (!(nextHr && nextHr.tagName === 'HR')) h1.insertAdjacentElement('afterend', createEl('hr'));
    }

    let submitAttempted = false;
    function runValidation() {
      const vu = validateUsername(u.inp.value);
      const vp = validateRequired(p.inp.value);
      setErr(u.err, (u.touched || submitAttempted) && !vu.ok ? vu.reason : null);
      setErr(p.err, (p.touched || submitAttempted) && !vp.ok ? vp.reason : null);
      submitBtn.disabled = !(vu.ok && vp.ok);
      return vu.ok && vp.ok;
    }

    form.addEventListener('input', runValidation);
    u.inp.addEventListener('blur', () => { u.touched = true; runValidation(); });
    p.inp.addEventListener('blur', () => { p.touched = true; runValidation(); });

    /* --------------------------------------------------------------------------
       Firebase Authentication Logic
       --------------------------------------------------------------------------
       - This handler strictly requires the Firebase SDK and a valid configuration.
       - On successful sign-in, it fetches the user's ID token to ensure
         custom claims are refreshed.
       - It then checks a Firestore document to decide the user's next route.
    -------------------------------------------------------------------------- */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitAttempted = true;
      if (!runValidation()) return;

      // Require SDK + config strictly (Firebase-only).
      if (!window.firebase || !firebase.app || !window.FIREBASE_CONFIG) {
        setErr(p.err, 'sdkMissing');
        return;
      }

      try {
        // Initialize once (idempotent)
        firebase.apps?.length ? firebase.app() : firebase.initializeApp(window.FIREBASE_CONFIG);

        // Connect to emulators automatically in local dev (optional, safe)
        if (location.hostname === 'localhost') {
          try { firebase.auth().useEmulator('http://127.0.0.1:9099'); } catch (_) {}
        }

        const auth = firebase.auth();
        const rawUser = u.inp.value.trim();
        const username = rawUser.toLowerCase();
        const email = `${username}@${AUTH_USERNAME_DOMAIN}`;
        const password = p.inp.value;

        // Perform Email/Password sign-in
        const cred = await auth.signInWithEmailAndPassword(email, password);
        const user = cred.user;

        // Force refresh to receive latest custom claims (if any)
        await user.getIdToken(true);

        // --- Decide where to go next based on profiles/{uid}.mustChangePassword
        let goTo = NEXT_ROUTE;
        try {
          const hasFirestore = !!(firebase.firestore);
          if (hasFirestore) {
            const db = firebase.firestore();
            // Optional: connect to emulator in local dev
            if (location.hostname === 'localhost') {
              try { db.useEmulator('127.0.0.1', 8080); } catch {}
            }
            const docRef = db.collection('profiles').doc(user.uid);
            const snap = await docRef.get();
            const data = snap.exists ? (snap.data() || {}) : {};

            // If mustChangePassword === true -> go to reset page. Else -> NEXT_ROUTE
            goTo = (data.mustChangePassword === true) ? PASSWORD_RESET_ROUTE : NEXT_ROUTE;
          }
        } catch (e) {
          // Do not block login if Firestore is unavailable.
          console.warn('[login] could not read profiles.mustChangePassword:', e);
        }
        window.location.href = goTo;
      } catch (err) {
        console.error('[login] Firebase sign-in error:', err);
        const code = err?.code || '';
        if (code === 'auth/user-not-found') setErr(u.err, 'userNotFound');
        else if (code === 'auth/wrong-password') setErr(p.err, 'wrongPassword');
        else if (code === 'auth/too-many-requests') setErr(p.err, 'tooMany');
        else if (code === 'auth/invalid-credential') setErr(p.err, 'invalidCredential');
        else setErr(p.err, 'generic');
      }
    });

    // Initial validation to set disabled state
    runValidation();
  }

  // Boot: render on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const root = $id('login-root') || $id('simulation-root') || document.body;
    renderLoginForm(root);
  });
})();
