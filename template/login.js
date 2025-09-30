/* login.js — Minimal login form: username + password + single submit button
   - Vanilla JS, no build tool required
   - Reuses existing header and classes: 'simulation-button' / 'simulation-list'
   - Basic validation: 4–26 characters, block emoji/icons (Unicode So/Sk/Cs)
*/

/* =========================
   Tiny shims (safe fallbacks when utilities are missing)
   ========================= */
(function () {
  'use strict';

  // Get element by id
  function $id(id) {
    return document.getElementById(id);
  }

  // Create element with attributes & text
  function createEl(tag, attrs = {}, text = '') {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null) continue;
      if (k === 'class' || k === 'className') el.className = v;
      else if (k === 'dataset' && typeof v === 'object') {
        Object.entries(v).forEach(([dk, dv]) => (el.dataset[dk] = dv));
      } else if (k in el) el[k] = v;
      else el.setAttribute(k, v);
    }
    if (text) el.textContent = text;
    return el;
  }

  // Append child and return it (chaining-friendly)
  function append(parent, child) {
    parent.appendChild(child);
    return child;
  }

  // Read TEXT labels if available; fallback to defaults
  const T = (typeof window !== 'undefined' && window.TEXT) ? window.TEXT : {};
  const LABELS = {
    title: (T?.index?.title) || 'Company Services',
    usernameLabel: (T?.login?.usernameLabel) || 'Username',
    usernamePlaceholder: (T?.login?.usernamePlaceholder) || 'Enter your username',
    passwordLabel: (T?.login?.passwordLabel) || 'Password',
    passwordPlaceholder: (T?.login?.passwordPlaceholder) || 'Enter your password',
    submitText: (T?.login?.submitText) || 'Sign In',
    welcomeMessage: (T?.login?.welcomeMessage) || 'Welcome',
    errors: {
      length: (T?.login?.errors?.length) || 'Length must be 4–26 characters.',
      emoji: (T?.login?.errors?.emoji) || 'Emoji/icons are not allowed.',
      required: (T?.login?.errors?.required) || 'This field is required.'
    }
  };

/* =========================
   Validation
   ========================= */
  // Block symbols/emoji/surrogate: So/Sk/Cs
  const EMOJI_ICON_REGEX = /[\p{So}\p{Sk}\p{Cs}]/u;

  function validateField(value) {
    const v = (value || '').trim();
    if (!v) return { ok: false, reason: 'required' };
    if (v.length < 4 || v.length > 26) return { ok: false, reason: 'length' };
    if (EMOJI_ICON_REGEX.test(v)) return { ok: false, reason: 'emoji' };
    return { ok: true };
  }

  // Build a single input row with label, input, and error box
  function inputRow({ id, label, placeholder }) {
    const row = createEl('div', { class: 'form-group' });
    const lab = append(row, createEl('label', { htmlFor: id }, label));
    // Make labels bold per spec
    lab.style.fontWeight = '700';

    const inp = append(row, createEl('input', {
      id,
      name: id,
      type: id === 'password' ? 'password' : 'text',
      placeholder,
      autocomplete: id === 'password' ? 'current-password' : 'username',
      required: true
    }));
    const err = append(row, createEl('div', { id: `${id}-error`, class: 'form-error', ariaLive: 'polite' }));
    // Hidden by default; shown only when user skips (blur) or on submit
    err.style.display = 'none';
    err.style.color = 'var(--color-primary)'; // red tone from theme
    err.style.marginTop = '0.25rem';
    err.style.fontSize = '0.95rem';

    return { row, inp, err, lab, touched: false };
  }

  // Show/hide an error message element
  function setErr(el, reason) {
    if (!el) return;
    if (!reason) {
      el.textContent = '';
      el.style.display = 'none';
      return;
    }
    const msg = reason === 'required' ? LABELS.errors.required
      : reason === 'length' ? LABELS.errors.length
      : LABELS.errors.emoji;
    el.textContent = msg;
    el.style.display = 'block';
  }

  /* =========================
     Render & behavior
     ========================= */
  function renderLoginForm(root) {
    root.innerHTML = '';

    // Wrapper keeps current layout look (list + one button)
    const wrapper = append(root, createEl('div', { class: 'simulation-list' }));

    const form = append(wrapper, createEl('form', { id: 'login-form', noValidate: true }));

    const u = inputRow({
      id: 'username',
      label: LABELS.usernameLabel,
      placeholder: LABELS.usernamePlaceholder
    });
    form.appendChild(u.row);

    const p = inputRow({
      id: 'password',
      label: LABELS.passwordLabel,
      placeholder: LABELS.passwordPlaceholder
    });
    form.appendChild(p.row);

    // Submit button
    const submitBtn = append(form, createEl('button', {
      id: 'login-submit-btn',
      type: 'submit',
      class: 'simulation-button',
    }, LABELS.submitText));
    submitBtn.disabled = true;

    // Sync page header with a login-specific title (avoid "sticking" shared route title)
    let h1 = document.querySelector('h1');
    if (!h1) {
      // Create a lightweight header if missing
      const logo = document.querySelector('.logo') || document.querySelector('a[href$="index.html"] img');
      h1 = createEl('h1', {}, 'Sign In');
      // Insert after logo when possible
      if (logo && logo.parentElement) {
        logo.parentElement.insertAdjacentElement('afterend', h1);
        h1.insertAdjacentElement('afterend', createEl('hr'));
      } else {
        document.body.prepend(createEl('hr'));
        document.body.prepend(h1);
      }
    } else {
      h1.textContent = 'Sign In';
      // Ensure we have a divider under header similar to other pages
      const nextHr = h1.nextElementSibling;
      if (!(nextHr && nextHr.tagName === 'HR')) {
        h1.insertAdjacentElement('afterend', createEl('hr'));
      }
    }

    // Track "touched" state: show "required" only after blur or on submit
    let submitAttempted = false;
    function runValidation() {
      const vu = validateField(u.inp.value);
      const vp = validateField(p.inp.value);
      // Only show errors if field is touched OR this is a submit attempt
      setErr(u.err, (u.touched || submitAttempted) && !vu.ok ? vu.reason : null);
      setErr(p.err, (p.touched || submitAttempted) && !vp.ok ? vp.reason : null);
      submitBtn.disabled = !(vu.ok && vp.ok);
      return vu.ok && vp.ok;
    }

    // Input changes continuously validate but do not force-show "required" yet
    form.addEventListener('input', runValidation);
    // On blur, mark field as touched so "required" appears only after user leaves it empty
    u.inp.addEventListener('blur', () => { u.touched = true; runValidation(); });
    p.inp.addEventListener('blur', () => { p.touched = true; runValidation(); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitAttempted = true;
      if (!runValidation()) return;
      const username = (u.inp.value || '').trim();
      // Temporary UX only — backend integration not required yet
      console.log('[login] submitted', { username });
      alert(`${LABELS.welcomeMessage}, ${username}!`);

      // When real login succeeds, navigate as needed, e.g.:
      // window.location.href = '/';
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitAttempted = true;
      if (!runValidation()) return;
      const username = (u.inp.value || '').trim();

  // Temporary: auto redirect to index.html after sign in
    console.log('[login] submitted', { username });
    window.location.href = 'index.html';
  });

    // Initial validation sets correct disabled state
    runValidation();
  }

  // Bootstrapping
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('login-root') || document.getElementById('simulation-root') || document.body;
    renderLoginForm(root);
  });

})();
