/*
 * password-reset.js: Secure Password Change Flow (Production Only)
 * - Removed all localhost/emulator hooks
 * - Direct Firebase usage with window.FIREBASE_CONFIG
 */
import { TEXT as T } from '../lang/eng.js';

(function () {
  'use strict';

  /* ========================================================================== */
  /* DOM & Utilities                                                            */
  /* ========================================================================== */
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

  // --- Labels ----------------------------------------------------------------
  const LABELS = {
    pageTitle: (T?.passwordReset?.pageTitle),
    currentLabel: (T?.passwordReset?.currentLabel),
    newLabel: (T?.passwordReset?.newLabel),
    confirmLabel: (T?.passwordReset?.confirmLabel),
    placeholderCurrent: (T?.passwordReset?.placeholderCurrent),
    placeholderNew: (T?.passwordReset?.placeholderNew),
    placeholderConfirm: (T?.passwordReset?.placeholderConfirm),
    submitText: (T?.passwordReset?.submitText),
    doneText: (T?.passwordReset?.doneText),
    nextRoute: (T?.passwordReset?.nextRoute),
    errors: {
      required: (T?.passwordReset?.errors?.required),
      weak: (T?.passwordReset?.errors?.weak),
      mismatch: (T?.passwordReset?.errors?.mismatch),
      notSignedIn: (T?.passwordReset?.errors?.notSignedIn),
      wrongPassword: (T?.passwordReset?.errors?.wrongPassword),
      requiresRecentLogin: (T?.passwordReset?.errors?.requiresRecentLogin),
      generic: (T?.passwordReset?.errors?.generic)
    }
  };

  /* ========================================================================== */
  /* Validation                                                                 */
  /* ========================================================================== */
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

  /* ========================================================================== */
  /* UI                                                                         */
  /* ========================================================================== */
  function inputRow({ id, label, placeholder }) {
    const row = createEl('div', { class: 'form-group' });
    const lab = append(row, createEl('label', { htmlFor: id }, label));
    lab.style.fontWeight = '700';
    const inp = append(row, createEl('input', {
      id, name: id, type: 'password', placeholder, required: true, autocomplete: 'new-password'
    }));
    const err = append(row, createEl('div', { id: `${id}-error`, class: 'form-error', ariaLive: 'polite' }));
    err.style.display = 'none';
    return { row, inp, err, touched: false };
  }

  function renderForm(root) {
    root.innerHTML = '';

    const wrapper = append(root, createEl('div', { class: 'simulation-list' }));
    const form = append(wrapper, createEl('form', { id: 'password-reset-form', noValidate: true }));

    const current = inputRow({
      id: 'current-password',
      label: LABELS.currentLabel,
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

    // Keep disabled until auth is confirmed
    setFormDisabled(true);

    form.addEventListener('input', runValidation);
    current.inp.addEventListener('blur', () => { current.touched = true; runValidation(); });
    next.inp.addEventListener('blur', () => { next.touched = true; runValidation(); });
    confirm.inp.addEventListener('blur', () => { confirm.touched = true; runValidation(); });

    return { form, current, next, confirm, submitBtn, setFormDisabled, runValidation };
  }

  /* ========================================================================== */
  /* Initialization & Firebase (Production)                                     */
  /* ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    const root = $id('password-reset-root') || $id('login-root') || $id('simulation-root') || document.body;
    const ui = renderForm(root);

    if (!window.firebase || !window.FIREBASE_CONFIG || !firebase.app) {
      ui.setFormDisabled(true);
      setError(ui.confirm?.err, 'generic');
      console.error('[password-reset] Firebase SDK/config missing.');
      return;
    }

    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(window.FIREBASE_CONFIG);
      } else {
        firebase.app();
      }
    } catch (e) {
      ui.setFormDisabled(true);
      setError(ui.confirm?.err, 'generic');
      console.error('[password-reset] initializeApp failed:', e);
      return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore ? firebase.firestore() : null;

    try { auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch {}

    auth.onAuthStateChanged((user) => {
      if (!user) {
        window.location.replace('/login.html');
        return;
      }
      ui.setFormDisabled(false);
      ui.runValidation();
    });

    ui.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (ui.submitBtn.disabled) return;

      const user = auth.currentUser;
      if (!user) {
        setError(ui.current.err, 'notSignedIn');
        return;
      }

      if (!ui.runValidation()) return;

      try {
        const email = user.email;
        if (!email) {
          setError(ui.current.err, 'generic');
          return;
        }
        const curPass = ui.current.inp.value;
        const newPass = ui.next.inp.value;

        const cred = firebase.auth.EmailAuthProvider.credential(email, curPass);
        await user.reauthenticateWithCredential(cred);
        await user.updatePassword(newPass);

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
