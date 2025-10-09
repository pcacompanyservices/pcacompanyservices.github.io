// File: template/nav.js
// Lightweight navigation (Home + Logout) using Firebase compat only.
// Comments in ENGLISH.

const DEFAULTS = {
  homeUrl: "home.html",          // default landing page
  position: "top-right",       // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  onLogout: null,                // optional async () => void
  mountId: "pcacs-nav",          // avoid duplicate mounts
};

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */
function createButton({ label, title, onClick, id, iconSrc }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "pcacs-nav__btn";
  btn.setAttribute("aria-label", label);
  btn.title = title || label;
  if (id) btn.id = id;

  if (iconSrc) {
    const img = document.createElement("img");
    img.src = iconSrc;
    img.alt = label;
    img.className = "pcacs-nav__icon-img";
    btn.appendChild(img);
  } else {
    const span = document.createElement("span");
    span.className = "pcacs-nav__icon";
    span.textContent = label === "Home" ? "⌂" : "⎋";
    btn.appendChild(span);
  }

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await onClick?.();
    } catch (err) {
      console.error("[pcacs-nav] action error:", err);
    }
  });

  return btn;
}

/* ---------------------------------------------------------------------------
 * Firebase compat logout (no imports)
 * ------------------------------------------------------------------------- */
async function firebaseSignOutAndRedirect() {
  try {
    if (window.firebase?.auth) {
      await window.firebase.auth().signOut();
    } else {
      console.warn("[pcacs-nav] Firebase auth() not available; skipping signOut.");
    }
  } catch (err) {
    console.error("[pcacs-nav] signOut failed:", err);
  } finally {
    // Always redirect to index after logout
    window.location.replace("/index.html");
  }
}

/* ---------------------------------------------------------------------------
 * Main builder
 * ------------------------------------------------------------------------- */
function mountNav(options = {}) {
  const cfg = { ...DEFAULTS, ...options };
  if (document.getElementById(cfg.mountId)) return; // idempotent

  const container = document.createElement("div");
  container.id = cfg.mountId;
  container.className = "pcacs-nav";
  container.dataset.pos = cfg.position;

  // HOME
  const homeBtn = createButton({
    label: "Home",
    title: "Go to Home",
    id: "pcacs-nav-home",
    iconSrc: "asset/home.png",
    onClick: () => window.location.assign(cfg.homeUrl),
  });

  // LOGOUT
  const logoutBtn = createButton({
    label: "Logout",
    title: "Sign out",
    id: "pcacs-nav-logout",
    iconSrc: "asset/logout.png",
    onClick: async () => {
      // Custom hook if provided
      if (typeof cfg.onLogout === "function") {
        try {
          await cfg.onLogout();
        } catch (e) {
          console.error("[pcacs-nav] onLogout error:", e);
        }
        return;
      }
      // Default Firebase logout
      await firebaseSignOutAndRedirect();
    },
  });

  container.appendChild(homeBtn);
  container.appendChild(logoutBtn);
  document.body.appendChild(container);
}

/* ---------------------------------------------------------------------------
 * Init
 * ------------------------------------------------------------------------- */
export function initPcacNav(userOptions = {}) {
  const options =
    typeof userOptions === "string" ? { homeUrl: userOptions } : userOptions || {};

  const currentScript = document.currentScript;
  if (currentScript) {
    if (!options.homeUrl && currentScript.dataset.home)
      options.homeUrl = currentScript.dataset.home;
    if (!options.position && currentScript.dataset.pos)
      options.position = currentScript.dataset.pos;
  }

  const validPos = new Set(["bottom-right", "bottom-left", "top-right", "top-left"]);
  if (!validPos.has(options.position)) options.position = DEFAULTS.position;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mountNav(options), { once: true });
  } else {
    mountNav(options);
  }
}

// Auto-init if script is included directly
initPcacNav();
