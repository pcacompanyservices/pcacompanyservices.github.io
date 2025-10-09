// template/index.js
// Login functionality using Firebase compat. Configuration is loaded from /config/firebase.json.
import "https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore-compat.js";
import { TEXT as T } from "../lang/eng.js";

(function () {
  "use strict";

  // ------------------------ Firebase Initialization ------------------------
  const firebase = globalThis.firebase;

  async function loadFirebaseConfig() {
    const res = await fetch("/config/firebase.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Cannot load /config/firebase.json: ${res.status}`);
    return res.json();
  }

  async function ensureFirebaseReady() {
    if (!firebase?.app) throw new Error("Firebase compat SDK not loaded");
    if (!firebase.apps?.length) {
      const cfg = await loadFirebaseConfig();
      firebase.initializeApp(cfg);
      try {
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      } catch {}
    }
    return {
      auth: firebase.auth(),
      db: firebase.firestore ? firebase.firestore() : null,
    };
  }

  // ------------------------ DOM Utility Functions ------------------------
  const $id = (id) => document.getElementById(id);
  const createEl = (tag, attrs = {}, text = "") => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null) continue;
      if (k === "class" || k === "className") el.className = v;
      else if (k === "dataset" && typeof v === "object") {
        Object.entries(v).forEach(([dk, dv]) => (el.dataset[dk] = dv));
      } else if (k in el) el[k] = v;
      else el.setAttribute(k, v);
    }
    if (text) el.textContent = text;
    return el;
  };
  const append = (parent, child) => (parent.appendChild(child), child);

  // ------------------------ Configuration and Labels ------------------------
  const AUTH_USERNAME_DOMAIN = "pcacs.com";
  const NEXT_ROUTE = "/home.html";
  const PASSWORD_RESET_ROUTE = "/password-reset.html";

  const LABELS = {
    title: T?.index?.title,
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
      sdkMissing: "Authentication service is unavailable. Please contact support.",
    },
  };

  // ------------------------ Input Validation ------------------------
  const USERNAME_RE = /^[A-Za-z0-9._-]{3,64}$/;
  const validateUsername = (v) => {
    const s = (v || "").trim();
    if (!s) return { ok: false, reason: "required" };
    return USERNAME_RE.test(s) ? { ok: true } : { ok: false, reason: "generic" };
  };
  const validateRequired = (v) =>
    (v || "").trim() ? { ok: true } : { ok: false, reason: "required" };

  const setErr = (el, reason) => {
    if (!el) return;
    if (!reason) {
      el.textContent = "";
      el.style.display = "none";
      return;
    }
    const map = {
      required: LABELS.errors.required,
      email: LABELS.errors.email,
      userNotFound: LABELS.errors.userNotFound,
      wrongPassword: LABELS.errors.wrongPassword,
      tooMany: LABELS.errors.tooMany,
      invalidCredential: LABELS.errors.invalidCredential,
      generic: LABELS.errors.generic,
      sdkMissing: LABELS.errors.sdkMissing,
    };
    el.textContent = map[reason] || map.generic;
    el.style.display = "block";
  };

  // ------------------------ UI Rendering ------------------------
  function inputRow({ id, label, placeholder, type }) {
    const row = createEl("div", { class: "form-group" });
    const lab = append(row, createEl("label", { htmlFor: id }, label));
    lab.style.fontWeight = "700";

    const inp = append(
      row,
      createEl("input", {
        id,
        name: id,
        type,
        placeholder,
        autocomplete: id === "password" ? "current-password" : "username",
        required: true,
      })
    );
    const err = append(
      row,
      createEl("div", { id: `${id}-error`, class: "form-error", ariaLive: "polite" })
    );
    err.style.display = "none";
    err.style.marginTop = "0.25rem";
    err.style.fontSize = "0.95rem";

    return { row, inp, err, lab, touched: false };
  }

  function renderLoginForm(root) {
    root.innerHTML = "";

    const wrapper = append(root, createEl("div", { class: "simulation-list" }));
    const form = append(wrapper, createEl("form", { id: "login-form", noValidate: true }));

    const u = inputRow({
      id: "username",
      label: LABELS.usernameLabel,
      placeholder: LABELS.usernamePlaceholder,
      type: "text",
    });
    form.appendChild(u.row);

    const p = inputRow({
      id: "password",
      label: LABELS.passwordLabel,
      placeholder: LABELS.passwordPlaceholder,
      type: "password",
    });
    form.appendChild(p.row);

    const submitBtn = append(
      form,
      createEl(
        "button",
        { id: "login-submit-btn", type: "submit", class: "simulation-button" },
        LABELS.submitText
      )
    );
    submitBtn.disabled = true;

    // Header normalization
    let h1 = document.querySelector("h1");
    if (!h1) {
      const logo = document.querySelector(".logo") || document.querySelector('a[href$="index.html"] img');
      h1 = createEl("h1", {}, "Sign In");
      if (logo && logo.parentElement) {
        logo.parentElement.insertAdjacentElement("afterend", h1);
        h1.insertAdjacentElement("afterend", createEl("hr"));
      } else {
        document.body.prepend(createEl("hr"));
        document.body.prepend(h1);
      }
    } else {
      h1.textContent = "Sign In";
      const nextHr = h1.nextElementSibling;
      if (!(nextHr && nextHr.tagName === "HR")) h1.insertAdjacentElement("afterend", createEl("hr"));
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

    form.addEventListener("input", runValidation);
    u.inp.addEventListener("blur", () => { u.touched = true; runValidation(); });
    p.inp.addEventListener("blur", () => { p.touched = true; runValidation(); });

    return { form, u, p, submitBtn, runValidation, setErr };
  }

  // ------------------------ Application Bootstrapping ------------------------
  document.addEventListener("DOMContentLoaded", async () => {
    const root = $id("login-root") || $id("simulation-root") || document.body;
    const ui = renderLoginForm(root);

  // Wait for Firebase to be ready before enabling the form
    let auth, db;
    try {
      ({ auth, db } = await ensureFirebaseReady());
    } catch (e) {
      console.error(e);
      ui.setErr?.(ui.p?.err, "sdkMissing");
      return;
    }

  // Handle form submission
    let submitAttempted = false;
    ui.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      submitAttempted = true;
      if (!ui.runValidation()) return;

      try {
        const username = ui.u.inp.value.trim().toLowerCase();
        const email = `${username}@${AUTH_USERNAME_DOMAIN}`;
        const password = ui.p.inp.value;

        const cred = await auth.signInWithEmailAndPassword(email, password);
        const user = cred.user;
        await user.getIdToken(true);

  // Determine the next route based on Firestore flag (best-effort)
        let goTo = NEXT_ROUTE;
        try {
          if (db) {
            const snap = await db.collection("profiles").doc(user.uid).get();
            const data = snap.exists ? (snap.data() || {}) : {};
            goTo = data.mustChangePassword === true ? PASSWORD_RESET_ROUTE : NEXT_ROUTE;
          }
        } catch (e) {
          console.warn("[login] cannot read profiles.mustChangePassword:", e);
        }

        location.href = goTo;
      } catch (err) {
        console.error("[login] sign-in error:", err);
        const code = err?.code || "";
        if (code === "auth/user-not-found") ui.setErr(ui.u.err, "userNotFound");
        else if (code === "auth/wrong-password") ui.setErr(ui.p.err, "wrongPassword");
        else if (code === "auth/too-many-requests") ui.setErr(ui.p.err, "tooMany");
        else if (code === "auth/invalid-credential") ui.setErr(ui.p.err, "invalidCredential");
        else ui.setErr(ui.p.err, "generic");
      }
    });

  // Perform initial validation
    ui.runValidation();
  });
})();
