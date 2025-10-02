/*
 * password-reset.js: Secure Password Change Flow for Firebase
 *
 * This script provides a robust user interface and logic for changing a user's password.
 * It is designed to work seamlessly with Firebase Authentication and Firestore, ensuring
 * a secure and user-friendly experience.
 *
 * Features:
 *   1. Renders a form with fields for current, new, and confirmation passwords.
 *   2. Waits for Firebase's authentication state to be confirmed before enabling the form,
 *      preventing premature submissions.
 *   3. Securely re-authenticates the user with their current password before proceeding.
 *   4. Updates the password using Firebase Authentication.
 *   5. On success, updates the `mustChangePassword` flag in the user's Firestore profile
 *      to `false` as a best-effort operation.
 *   6. Redirects the user to a specified route upon successful password change.
 *
 * Requirements:
 *   - Firebase SDKs must be loaded in the HTML before this script:
 *     - `firebase-app-compat.js`
 *     - `firebase-auth-compat.js`
 *     - `firebase-firestore-compat.js` (optional, for updating the profile flag)
 *   - A global `window.FIREBASE_CONFIG` object must be defined in the HTML.
 */
import { TEXT as T  } from '../lang/eng.js';
(function () {
  'use strict';

  /* ==========================================================================
     DOM & Utility Helpers
     ========================================================================== */
  const $id = (id) => document.getElementById(id);
  const createEl = (tag, attrs = {}, text = '') => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null) continue;
      if (k === 'class' || k === 'className') el.className = v;
      else if (k in el) el[k] = v;
      else el.setAttribute(k, v);
    }
    if (text) el.textContent = text;
    return el;
  };
  const append = (parent, child) => (parent.appendChild(child), child);

  // --- Text Labels & Configuration ------------------------------------------
  // All text labels are overridable via `window.TEXT.passwordReset.*`.
  
  //const T = (typeof window !== 'undefined' && window.TEXT) ? window.TEXT : {};

  const LABELS = {
    pageTitle: T?.passwordReset?.pageTitle,
    currentLabel: T?.passwordReset?.currentLabel,
    newLabel: T?.passwordReset?.newLabel,
    confirmLabel: T?.passwordReset?.confirmLabel,
    placeholderCurrent: T?.passwordReset?.placeholderCurrent,
    placeholderNew: T?.passwordReset?.placeholderNew,
    placeholderConfirm: T?.passwordReset?.placeholderConfirm,
    submitText: T?.passwordReset?.submitText,
    doneText: T?.passwordReset?.doneText,
    nextRoute: T?.passwordReset?.nextRoute || '/index.html',
    errors: {
      required: T?.passwordReset?.errors?.required,
      weak: T?.passwordReset?.errors?.weak,
      mismatch: T?.passwordReset?.errors?.mismatch,
      notSignedIn: T?.passwordReset?.errors?.notSignedIn,
      wrongPassword: T?.passwordReset?.errors?.wrongPassword,
      requiresRecentLogin: T?.passwordReset?.errors?.requiresRecentLogin,
      generic: T?.passwordReset?.errors?.generic
    }
  };

  /* ==========================================================================
     Input Validation
     ========================================================================== */
  const validateRequired = (v) => (v && v.trim()) ? { ok: true } : { ok: false, reason: 'required' };
  const validateStrong  = (v) => (v && v.length >= 6) ? { ok: true } : { ok: false, reason: 'weak' };

  const setError = (el, reason) => {
    if (!el) return;
    if (!reason) { el.textContent = ''; el.style.display = 'none'; return; }
    const map = {
      required: LABELS.errors.required,
      weak: LABELS.errors.weak,
      mismatch: LABELS.errors.mismatch,
      notSignedIn: LABELS.errors.notSignedIn,
      wrongPassword: LABELS.errors.wrongPassword,
      requiresRecentLogin: LABELS.errors.requiresRecentLogin,
      generic: LABELS.errors.generic,
    };
    el.textContent = map[reason] || map.generic;
    el.style.display = 'block';
  };

  /* ==========================================================================
     UI Rendering
     ========================================================================== */
  function inputRow({ id, label, placeholder }) {
    const row = createEl('div', { class: 'form-group' });
    const lab = append(row, createEl('label', { htmlFor: id }, label));
    lab.style.fontWeight = '700';
    const inp = append(row, createEl('input', {
      id, name: id, type: 'password', placeholder, required: true, autocomplete: 'new-password'
    }));
    const err = append(row, createEl('div', { id: `${id}-error`, class: 'form-error', ariaLive: 'polite' }));
    err.style.display = 'none';
    err.style.color = 'var(--color-primary)'; 
    err.style.marginTop = '0.25rem';
    err.style.fontSize = '0.95rem';
    return { row, inp, err, touched: false };
  }

  function renderForm(root) {
    root.innerHTML = '';

    const wrapper = append(root, createEl('div', { class: 'simulation-list' }));
    const form = append(wrapper, createEl('form', { id: 'password-reset-form', noValidate: true }));

    const current = inputRow({
      id: 'current-password',
      label: LABELS.currentLabel  || 'Current Password',
      placeholder: LABELS.placeholderCurrent
    });
    form.appendChild(current.row);

    const next = inputRow({
      id: 'new-password',
      label: LABELS.newLabel,
      placeholder: LABELS.placeholderNew
    });
    form.appendChild(next.row);

    const confirm = inputRow({
      id: 'confirm-password',
      label: LABELS.confirmLabel,
      placeholder: LABELS.placeholderConfirm
    });
    form.appendChild(confirm.row);

    const submitBtn = append(form, createEl('button', {
      id: 'password-reset-submit-btn',
      type: 'submit',
      class: 'simulation-button'
    }, LABELS.submitText));

    // Header normalization
    let h1 = document.querySelector('h1');
    if (!h1) {
      h1 = createEl('h1', {}, LABELS.pageTitle);
      document.body.prepend(h1);
      document.body.insertBefore(document.createElement('hr'), h1.nextSibling);
    } else {
      h1.textContent = LABELS.pageTitle;
      const hr = h1.nextElementSibling;
      if (!(hr && hr.tagName === 'HR')) h1.insertAdjacentElement('afterend', document.createElement('hr'));
    }

    // Enable/disable form controls in one place
    const setFormDisabled = (disabled) => {
      [current.inp, next.inp, confirm.inp, submitBtn].forEach(el => el && (el.disabled = !!disabled));
    };

    let submitAttempted = false;
    const runValidation = () => {
      const vCur = validateRequired(current.inp.value);
      const vNew = validateStrong(next.inp.value);
      const vReqConfirm = validateRequired(confirm.inp.value);
      const vMatch = (vReqConfirm.ok && next.inp.value === confirm.inp.value)
        ? { ok: true } : { ok: false, reason: 'mismatch' };

      setError(current.err, (current.touched || submitAttempted) && !vCur.ok ? vCur.reason : null);
      setError(next.err, (next.touched || submitAttempted) && !vNew.ok ? vNew.reason : null);
      setError(confirm.err,
        (confirm.touched || submitAttempted) && (!vReqConfirm.ok ? vReqConfirm.reason : (!vMatch.ok ? vMatch.reason : null))
      );

      submitBtn.disabled = !(vCur.ok && vNew.ok && vReqConfirm.ok && vMatch.ok);
      return !submitBtn.disabled;
    };

    // Initial: keep disabled until we confirm auth state
    setFormDisabled(true);

    form.addEventListener('input', runValidation);
    current.inp.addEventListener('blur', () => { current.touched = true; runValidation(); });
    next.inp.addEventListener('blur', () => { next.touched = true; runValidation(); });
    confirm.inp.addEventListener('blur', () => { confirm.touched = true; runValidation(); });

    return { form, current, next, confirm, submitBtn, setFormDisabled, runValidation };
  }

  /* ==========================================================================
     Initialization and Firebase Integration
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    const root = $id('password-reset-root') || $id('login-root') || $id('simulation-root') || document.body;
    const ui = renderForm(root);

    // Guard: require SDK + config
    if (!window.firebase || !window.FIREBASE_CONFIG || !firebase.app) {
      // We render UI but keep it disabled since Auth is unavailable
      ui.setFormDisabled(true);
      setError(ui.confirm?.err, 'generic');
      console.error('[password-reset] Firebase SDK/config missing.');
      return;
    }

    // Initialize (idempotent)
    try {
      firebase.apps?.length ? firebase.app() : firebase.initializeApp(window.FIREBASE_CONFIG);
    } catch (e) {
      ui.setFormDisabled(true);
      setError(ui.confirm?.err, 'generic');
      console.error('[password-reset] initializeApp failed:', e);
      return;
    }

    // Emulator hooks for local dev (optional but handy)
    if (location.hostname === 'localhost') {
      try {
        firebase.auth().useEmulator('http://127.0.0.1:9099');
        if (firebase.firestore) firebase.firestore().useEmulator('127.0.0.1', 8080);
      } catch (e) {
        console.warn('[password-reset] emulator hook failed:', e);
      }
    }

    const auth = firebase.auth();
    const db = firebase.firestore ? firebase.firestore() : null;

    // Ensure persistent session across tabs/windows
    try { auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch {}

    // Wait for auth state to be restored, then enable form
    auth.onAuthStateChanged((user) => {
      if (!user) {
        // Not signed in → redirect to login to avoid confusion
        window.location.replace('/login.html');
        return;
      }
      // Auth is ready; unlock the form
      ui.setFormDisabled(false);
      ui.runValidation();
    });

    // Submit: re-auth + update password + clear flag + redirect
    ui.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // If disabled (e.g., waiting for auth state), do nothing
      if (ui.submitBtn.disabled) return;

      let user = auth.currentUser;
      if (!user) {
        setError(ui.current.err, 'notSignedIn');
        return;
      }

      // Validate fields
      const valid = ui.runValidation();
      if (!valid) return;

      try {
        // Reauthenticate using current password
        // Note: need email; if null, fetch from profiles/{uid} (not expected for email/password provider)
        const email = user.email;
        if (!email) {
          setError(ui.current.err, 'generic');
          return;
        }
        const curPass = ui.current.inp.value;
        const newPass = ui.next.inp.value;

        const cred = firebase.auth.EmailAuthProvider.credential(email, curPass);
        await user.reauthenticateWithCredential(cred);

        // Update password
        await user.updatePassword(newPass);

        // Best-effort: turn off mustChangePassword flag
        try {
          if (db) await db.collection('profiles').doc(user.uid).update({ mustChangePassword: false });
        } catch (flagErr) {
          console.warn('[password-reset] could not update mustChangePassword flag:', flagErr);
        }

        alert(LABELS.doneText);
        window.location.href = LABELS.nextRoute;
      } catch (err) {
        console.error('[password-reset] error:', err);
        const code = err?.code || '';
        if (code === 'auth/wrong-password') {
          setError(ui.current.err, 'wrongPassword');
        } else if (code === 'auth/requires-recent-login') {
          setError(ui.current.err, 'requiresRecentLogin');
        } else {
          setError(ui.confirm.err, 'generic');
        }
      }
    });
  });
})();
