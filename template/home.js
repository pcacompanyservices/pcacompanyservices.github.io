// js/home.js
// Render tools where each image is clickable and shows a tooltip (.info-box) with the tool's info.
// - Tooltip uses the global .info-box CSS (yellow card) from style.css
// - Description comes from ENG: HOME.TOOLS[*].info
// - Disabled tools: aria-disabled + tooltip includes "coming soon" note; click is prevented
// - Titles pulled from ENG: HOME.TITLE (fallback to "Tools Dashboard")

import { TEXT as T } from '../lang/eng.js';
/** Create tooltip node that matches .info-box styling contract */
function createInfoBox(message) {
  const tip = document.createElement('div');
  tip.className = 'info-box';
  tip.textContent = message || '';
  // Start hidden: the CSS sets opacity/visibility transitions,
  // but we explicitly ensure initial hidden state in case script runs after layout.
  tip.style.opacity = '0';
  tip.style.visibility = 'hidden';
  return tip;
}

/** Show/hide helpers (cooperate with CSS transitions) */
function showInfoBox(tipEl) {
  if (!tipEl) return;
  tipEl.style.opacity = '1';
  tipEl.style.visibility = 'visible';
}
function hideInfoBox(tipEl) {
  if (!tipEl) return;
  tipEl.style.opacity = '0';
  tipEl.style.visibility = 'hidden';
}

// --- UI builders -------------------------------------------------------------

/**
 * Create a single tool card.
 * Structure (compatible with your CSS):
 * <article.tool-card [aria-disabled]>
 *   <img/>            <-- hover shows tooltip; click to navigate if enabled
 *   <h2>title</h2>
 *   <!-- no <p> body; info appears in tooltip instead -->
 *   <div.tool-actions></div>
 *   <div.info-box>…</div>   <-- absolutely positioned tooltip
 * </article>
 */
function createToolCard(tool, comingSoonText) {
  const card = document.createElement('article');
  card.className = 'tool-card';

  const isDisabled = !!tool.disabled;
  if (isDisabled) {
    card.setAttribute('aria-disabled', 'true');
  }

  // Click target: image
  const img = document.createElement('img');
  img.alt = tool.title || 'tool';
  img.loading = 'lazy';
  img.src = tool.img || '';
  card.appendChild(img);

  // Title
  const h2 = document.createElement('h2');
  h2.textContent = tool.title || 'Tool';
  card.appendChild(h2);

  // We intentionally skip the <p> body; tooltip will carry the description.
  // Keep actions container for layout consistency (even if empty).
  const actions = document.createElement('div');
  actions.className = 'tool-actions';
  card.appendChild(actions);

  // Tooltip content: use tool.info; if disabled, append "coming soon"
  const baseInfo = tool.info || '';
  const tipMessage = isDisabled && comingSoonText
    ? `${baseInfo ? baseInfo + ' — ' : ''}${comingSoonText}`
    : baseInfo;

  const tip = createInfoBox(tipMessage);
  card.appendChild(tip);

  // Hover handlers for tooltip (on image + fallback on card)
  const show = () => showInfoBox(tip);
  const hide = () => hideInfoBox(tip);
  img.addEventListener('mouseenter', show);
  img.addEventListener('mouseleave', hide);
  card.addEventListener('mouseleave', hide);

  // Navigation on image click (blocked when disabled)
  img.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (isDisabled) return;
    if (tool.route && typeof tool.route === 'string') {
      window.location.href = tool.route;
    }
  });

  return card;
}

/** Ensure .tool-panel exists under #home-root */
function getPanel(root) {
  let panel = root.querySelector('.tool-panel');
  if (!panel) {
    panel = document.createElement('section');
    panel.className = 'tool-panel';
    root.appendChild(panel);
  }
  return panel;
}

// --- Bootstrap ---------------------------------------------------------------

function init() {
  const HOME = T?.HOME || {};
  // Support either {TITLE, SUBTITLE, TOOLS} or {pageTitle, subtitle, tools}
  const titleText = HOME.TITLE || HOME.pageTitle || 'Tools Dashboard';
  const toolsList = HOME.TOOLS || HOME.tools || [];

  // coming soon copy (optional)
  const comingSoonText =
    T?.TOOLTIPS?.HOME?.comingSoon ||
    'coming soon';

  const root = document.getElementById('home-root');
  if (!root) {
    console.error('[home] #home-root not found');
    return;
  }

  const titleEl = document.getElementById('home-title');
  if (titleEl) titleEl.textContent = titleText;

  const panel = getPanel(root);
  panel.innerHTML = '';

  toolsList.forEach((tool) => {
    const normalized = {
      title: tool.title ?? 'Tool',
      info: tool.info ?? tool.desc ?? '',
      img: tool.img ?? '',
      route: tool.route ?? '#',
      disabled: !!tool.disabled
    };
    panel.appendChild(createToolCard(normalized, comingSoonText));
  });
}

document.addEventListener('DOMContentLoaded', init);
