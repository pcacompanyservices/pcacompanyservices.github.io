import { html } from '../../common/dom.js';

export function allowanceStep({ title, tooltip, fields, warningId, warningText, withParentCheckbox = false, parentCheckboxId = 'allowance-checkbox', parentCheckboxLabel, continueId, continueText }) {
  const el = document.createElement('div');
  const inputsHtml = fields.map(f => {
    // derive checkbox and container ids from input id (e.g., allowance-lunch -> lunch-checkbox, lunch-input)
    const key = f.id.replace(/^allowance-/, '');
    const checkboxId = `${key}-checkbox`;
    const containerId = `${key}-input`;
    return `
        <label class="checkbox-item"><input type="checkbox" id="${checkboxId}" /> ${f.label}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${f.tooltip}</span>
          </span>
        </label>
        <div id="${containerId}" style="display: none;"><input type="text" class="number-input" id="${f.id}" placeholder="${f.placeholder}" min="0" /></div>
      `;
  }).join('');

  const content = html`
    <div class="step-title-row">
      <h2>${title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${tooltip}</span>
      </span>
    </div>
    <div id="allowance-container">
      ${withParentCheckbox ? `<label class="checkbox-item"><input type="checkbox" id="${parentCheckboxId}" /> ${parentCheckboxLabel || ''}</label>` : ''}
      <div id="allowance-inputs" style="${withParentCheckbox ? 'display:none;' : ''}">
        <div id="${warningId}" class="input-warning" style="display:none;">${warningText}</div>
        ${inputsHtml}
      </div>
    </div>
    ${continueId ? `<button type="button" id="${continueId}" class="simulation-button unavailable" disabled>${continueText || 'Continue'}</button>` : ''}
  `;
  el.innerHTML = content;
  return el;
}
