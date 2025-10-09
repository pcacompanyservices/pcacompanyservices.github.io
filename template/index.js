/*
 * login.js: Firebase Authentication Handler (Production Only)
 * - Removed all localhost/emulator hooks
 * - Directly initializes and uses Firebase with window.FIREBASE_CONFIG
 */
import { TEXT as T } from '../lang/eng.js';

(function () {
  'use strict';

  /* ========================================================================== */
  /* DOM & Utility Helpers                                                      */
  /* ========================================================================== */
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

  // --- Config ----------------------------------------------------------------
  const AUTH_USERNAME_DOMAIN = 'pcacs.com';
  const NEXT_ROUTE = '/home.html';
  const PASSWORD_RESET_ROUTE = '/password-reset.html';

  const LABELS = {
    title: (T?.index?.title),
    usernameLabel: (T?.login?.usernameLabel),
    usernamePlaceholder: (T?.login?.usernamePlaceholder),
    passwordLabel: (T?.login?.passwordLabel),
    passwordPlaceholder: (T?.login?.passwordPlaceholder),
    submitText: (T?.login?.submitText),
    errors: {
      required: (T?.login?.errors?.required),
      email: (T?.login?.errors?.email),
      generic: (T?.login?.errors?.generic),
      userNotFound: (T?.login?.errors?.userNotFound),
      wrongPassword: (T?.login?.errors?.wrongPassword),
      tooMany: (T?.login?.errors?.tooMany),
      invalidCredential: (T?.login?.errors?.invalidCredential),
      sdkMissing: 'Authentication service is unavailable. Please contact support.',
    }
  };

  /* ========================================================================== */
  /* Validation                                                                 */
  /* ========================================================================== */
  const USERNAME_RE = /^[A-Za-z0-9._-]{3,64}$/;
  const validateUsername = (v) => {
    const s = (v || '').trim();
    if (!s) return { ok: false, reason: 'required' };
    return USERNAME_RE.test(s) ? { ok: true } : { ok: false, reason: 'generic' };
  };
  const validateRequired = (v) => ((v || '').trim() ? { ok: true } : { ok: false, reason: 'required' });

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

  /* ========================================================================== */
  /* UI                                                                         */
  /* ========================================================================== */
  function inputRow({ id, label, placeholder, type }) {
    const row = createEl('div', { class: 'form-group' });
    const lab = append(row, createEl('label', { htmlFor: id }, label));
    lab.style.fontWeight = '700';

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

    // Header normalization
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

    /* ---------------------------------------------------------------------- */
    /* Firebase Authentication (Production)                                   */
    /* ---------------------------------------------------------------------- */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitAttempted = true;
      if (!runValidation()) return;

      if (!window.firebase || !firebase.app || !window.FIREBASE_CONFIG) {
        setErr(p.err, 'sdkMissing');
        return;
      }

      try {
        // Initialize once (idempotent)
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(window.FIREBASE_CONFIG);
        } else {
          firebase.app();
        }

        const auth = firebase.auth();
        try {
          // Ensure persistent session across tabs/windows
          auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } catch {}

        const rawUser = u.inp.value.trim();
        const username = rawUser.toLowerCase();
        const email = `${username}@${AUTH_USERNAME_DOMAIN}`;
        const password = p.inp.value;

        const cred = await auth.signInWithEmailAndPassword(email, password);
        const user = cred.user;

        // Refresh token/claims
        await user.getIdToken(true);

        // Decide next route using Firestore flag (best-effort)
        let goTo = NEXT_ROUTE;
        try {
          if (firebase.firestore) {
            const db = firebase.firestore();
            const snap = await db.collection('profiles').doc(user.uid).get();
            const data = snap.exists ? (snap.data() || {}) : {};
            goTo = (data.mustChangePassword === true) ? PASSWORD_RESET_ROUTE : NEXT_ROUTE;
          }
        } catch (e) {
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

    // Initial validation state
    runValidation();
  }

  // Boot
  document.addEventListener('DOMContentLoaded', () => {
    const root = $id('login-root') || $id('simulation-root') || document.body;
    renderLoginForm(root);
  });
})();
