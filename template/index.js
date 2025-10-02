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

  // Temporary: auto redirect to salary-simulation-tool.html after sign in
    console.log('[login] submitted', { username });
    window.location.href = 'salary-simulation-tool.html';
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

/* --------------------------------------------------------------------------
   Firebase Web SDK integration (non-breaking, opt-in)
   - This block assumes you load Firebase Web SDK via <script> tags in HTML.
   - It supports two modes:
       1) "compat" SDK (global `firebase`), e.g.:
          <script src="https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js"></script>
          <script src="https://www.gstatic.com/firebasejs/10.13.1/firebase-auth-compat.js"></script>
       2) (Optional) Firestore compat if you enable username->email lookup:
          <script src="https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js"></script>
   - If SDK is NOT present, this code becomes a no-op and your existing UI flow remains intact.
   -------------------------------------------------------------------------- */
(function () {
  'use strict';

  // ---- Configuration ------------------------------------------------------
  // Provide your Firebase config here or via window.FIREBASE_CONFIG.
  // Keeping it inline makes the module self-contained but you can externalize if preferred.
  const CFG = (window.FIREBASE_CONFIG) || {
    apiKey: "AIzaSyDkHvGy0gmFSq0b7s_eXS-Csrje7nK625E",
    authDomain: "pcagate.firebaseapp.com",
    projectId: "pcagate",
    appId: "1:495812654469:web:67ed791a5223ade84040ec",
    storageBucket: "pcagate.firebasestorage.app",
    // ...add other fields (optional but recommended): appId, storageBucket, etc.
  };

  // Feature flag: if true and Firestore compat is loaded, we allow username->email lookup.
  // If false, we treat the "username" input as an email directly.
  const USE_USERNAME_LOOKUP = true; 
  const USERNAME_MAP_COLLECTION = "profiles";     // where username/email is stored
  const USERNAME_FIELD = "username";              // field name for username
  const EMAIL_FIELD = "email";                    // field name for email in profile docs

  // Role-based redirects (optional). Adjust to your pages/routes.
  // When no role is present, we fall back to a safe default path.
  const REDIRECTS = {
    admin: "/admin.html",
    staff: "/staff.html",
    user:  "/index.html",
    default: "/index.html"
  };

  // ---- Guard: only run when DOM + UI form are present --------------------
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    if (!form) return; // No login form in DOM; nothing to do.

    // Check if Firebase compat SDK is available. If not, keep existing behavior.
    // We purposely use compat to avoid converting your file to ES modules.
    if (!window.firebase || !firebase.app) {
      // Soft log for developers; end users won't see this.
      console.warn("[firebase] SDK not found; falling back to existing non-auth flow.");
      return;
    }

    // ---- Initialize app safely (idempotent) ------------------------------
    let app;
    try {
      // If an app with the same name already exists, reuse it.
      app = firebase.apps?.length ? firebase.app() : firebase.initializeApp(CFG);
    } catch (e) {
      console.error("[firebase] Failed to initialize:", e);
      return;
    }
    const auth = firebase.auth();

    // Optionally prepare Firestore for username->email lookup
    let db = null;
    if (USE_USERNAME_LOOKUP && firebase.firestore) {
      try {
        db = firebase.firestore();
      } catch {
        // Firestore not loaded; we will gracefully skip username lookup.
        db = null;
      }
    }

    // ---- Small helpers ----------------------------------------------------
    const $ = (sel, root = document) => root.querySelector(sel);
    const usernameInput = $('#username', form);
    const passwordInput = $('#password', form);
    const usernameErrEl = $('#username-error', form);
    const passwordErrEl = $('#password-error', form);

    // Render error message under the input (reusing your existing error boxes)
    function showError(el, msg) {
      if (!el) return;
      el.textContent = msg || "";
      el.style.display = msg ? "block" : "none";
    }

    // Decide target path based on custom claims; fallback to default
    function pickRedirectPath(claims) {
      const role = (claims && claims.role) || "user";
      return REDIRECTS[role] || REDIRECTS.default;
    }

    // Username->email lookup in Firestore (optional)
    async function resolveEmailFromUsername(username) {
      if (!db) return null; // Firestore not available; skip
      try {
        // Strategy A: /profiles/{uid} scan by where("username","==",username)
        const snap = await db.collection(USERNAME_MAP_COLLECTION)
          .where(USERNAME_FIELD, "==", username)
          .limit(1)
          .get();
        if (snap.empty) return null;
        const doc = snap.docs[0];
        const data = doc.data() || {};
        return data[EMAIL_FIELD] || null;
      } catch (e) {
        console.error("[firebase] Username lookup failed:", e);
        return null;
      }
    }

    // ---- Capture-phase submit handler: preempt the fallback redirect ------
    // We attach on capture phase so we can stop the event if Firebase handles it.
    form.addEventListener('submit', async (evt) => {
      // If Auth SDK is not ready, do nothing; let the existing listeners run.
      if (!auth) return;

      // Always prevent default here; we will decide whether to stop propagation.
      evt.preventDefault();

      // Clear previous error messages (if any)
      showError(usernameErrEl, "");
      showError(passwordErrEl, "");

      const rawUsername = (usernameInput?.value || "").trim();
      const password = (passwordInput?.value || "");
      if (!rawUsername || !password) {
        // Defer to your existing validation flow (which will show "required")
        return; // allow bubbling to your current submit listeners
      }

      try {
        // If input contains "@", treat it as an email; otherwise try mapping.
        let email = rawUsername.includes("@") ? rawUsername : null;
        if (!email && USE_USERNAME_LOOKUP) {
          email = await resolveEmailFromUsername(rawUsername);
        }

        if (!email) {
          // Show a friendly error, but do not break your original handler.
          showError(usernameErrEl, "Unknown username or email.");
          // Stop further handlers to avoid false redirects.
          evt.stopImmediatePropagation();
          return;
        }

        // Sign in with Firebase Auth (Email/Password)
        const cred = await auth.signInWithEmailAndPassword(email, password);
        const user = cred.user;
        // Force refresh token to fetch latest custom claims (if admin assigned roles recently)
        await user.getIdToken(true);
        const idTokenResult = await user.getIdTokenResult();
        const nextPath = pickRedirectPath(idTokenResult.claims);

        // Prevent the legacy redirect handlers from running.
        evt.stopImmediatePropagation();
        // Navigate based on role (admin/staff/user), fallback to default.
        window.location.href = nextPath;
      } catch (err) {
        // Known errors: auth/user-not-found, auth/wrong-password, auth/too-many-requests, etc.
        console.error("[firebase] signIn error:", err);
        const code = err?.code || "";
        if (code === "auth/user-not-found") {
          showError(usernameErrEl, "Account does not exist.");
        } else if (code === "auth/wrong-password") {
          showError(passwordErrEl, "Incorrect password.");
        } else if (code === "auth/too-many-requests") {
          showError(passwordErrEl, "Too many attempts. Please try again later.");
        } else {
          showError(passwordErrEl, err?.message || "Sign-in failed. Please try again.");
        }
        // Block legacy redirects on error to keep UX consistent.
        evt.stopImmediatePropagation();
      }
    }, true); // <-- capture phase

  }); // DOMContentLoaded
})();
