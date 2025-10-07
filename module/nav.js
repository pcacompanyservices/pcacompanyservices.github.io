// nav.js
// Lightweight modular navigation (Home + Logout). Comment in EN only.

const DEFAULTS = {
  homeUrl: '/home.html',              // default landing page
  position: 'bottom-left',  // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  onLogout: null,            // optional async () => void
  mountId: 'pcacs-nav',       // avoid duplicate mounts
};

function createButton({ label, title, onClick, id, iconSrc }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pcacs-nav__btn';
  btn.setAttribute('aria-label', label);
  btn.title = title || label;
  if (id) btn.id = id;

  // Use image if provided, else fallback to unicode icon
  if (iconSrc) {
    const img = document.createElement('img');
    img.src = iconSrc;
    img.alt = label;
    img.className = 'pcacs-nav__icon-img';
    btn.appendChild(img);
  } else {
    const span = document.createElement('span');
    span.className = 'pcacs-nav__icon';
    span.textContent = label === 'Home' ? '⌂' : '⎋';
    btn.appendChild(span);
  }

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await onClick?.();
    } catch (err) {
      console.error('[pcacs-nav] action error:', err);
    }
  });

  return btn;
}


function buildLogoElement() {
  const anchor = document.createElement('a');
  anchor.href = 'index.html';
  const img = document.createElement('img');
  img.src = 'asset/home.png';
  img.alt = 'home';
  img.className = 'logo';
  anchor.appendChild(img);
  return anchor;
}

function mountNav(options = {}) {
  const cfg = { ...DEFAULTS, ...options };

  // Idempotent mount across routes
  if (document.getElementById(cfg.mountId)) return;

  const container = document.createElement('div');
  container.id = cfg.mountId;
  container.className = 'pcacs-nav';
  container.dataset.pos = cfg.position;

  // HOME
  const homeBtn = createButton({
    label: 'Home',
    title: 'Go to Home',
    id: 'pcacs-nav-home',
    iconSrc: 'asset/home.png',
    onClick: () => {
      // Use location.assign to keep history; replace() if you prefer no back.
      window.location.assign(cfg.homeUrl);
    },
  });

  // LOGOUT
  const logoutBtn = createButton({
    label: 'Logout',
    title: 'Sign out',
    id: 'pcacs-nav-logout',
    iconSrc: 'asset/logout.png',
    onClick: async () => {
      // Priority 1: custom onLogout from integrator
      if (typeof cfg.onLogout === 'function') {
        await cfg.onLogout();
        return;
      }

      // Priority 2: try Firebase v9+ if present (no external import here)
      const hasFirebaseV9 = !!(window.firebase?.auth || window.getAuth);
      if (hasFirebaseV9) {
        try {
          // v8 compat: firebase.auth().signOut()
          if (window.firebase?.auth) {
            await window.firebase.auth().signOut();
          } else if (window.getAuth && window.signOut) {
            // v9 modular (assumes global exposed)
            const auth = window.getAuth();
            await window.signOut(auth);
          }
          // Emit event after successful signout so app can redirect
          window.dispatchEvent(new CustomEvent('pcac:logout:success'));
          return;
        } catch (e) {
          console.error('[pcacs-nav] Firebase signOut failed:', e);
          window.dispatchEvent(new CustomEvent('pcac:logout:error', { detail: e }));
          return;
        }
      }

      // Fallback: emit a generic logout request event for the app to handle.
      window.dispatchEvent(new CustomEvent('pcac:logout:request'));
    },
  });

  container.appendChild(homeBtn);
  container.appendChild(logoutBtn);

  // Mount late to avoid layout flashes; append to body
  document.body.appendChild(container);
}

export function initPcacNav(userOptions = {}) {
  // Allow string shorthands: initPcacNav('/home')
  const options = typeof userOptions === 'string' ? { homeUrl: userOptions } : userOptions || {};

  // Support data attributes from the script tag:
  // <script type="module" src="nav.js" data-home="/dashboard" data-pos="top-right"></script>
  const currentScript = document.currentScript;
  if (currentScript) {
    if (!options.homeUrl && currentScript.dataset.home) options.homeUrl = currentScript.dataset.home;
    if (!options.position && currentScript.dataset.pos) options.position = currentScript.dataset.pos;
  }

  // Clamp position
  const validPos = new Set(['bottom-right', 'bottom-left', 'top-right', 'top-left']);
  if (!validPos.has(options.position)) options.position = DEFAULTS.position;

  // Defer init until DOM ready if needed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountNav(options), { once: true });
  } else {
    mountNav(options);
  }
}

// Auto-init with defaults if script is included directly without calling init.
initPcacNav();
