import { html } from '../../common/dom.js';

export function selectStep({ id, title, tooltip, placeholder, options, continueId, continueText }) {
  const el = document.createElement('div');
  el.innerHTML = html`
    <div class="step-title-row">
      <h2>${title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${tooltip}</span>
      </span>
    </div>
    <select id="${id}">
      <option value="" disabled selected>${placeholder}</option>
      ${options.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
    </select>
    ${continueId ? `<button type="button" id="${continueId}" class="simulation-button unavailable" disabled>${continueText || 'Continue'}</button>` : ''}
  `;
  return el;
}
