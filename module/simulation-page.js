// Simulation page initializer: builds form, handles calculation, renders results, PDF export & footer
// Unified entry replacing legacy standard-page.js

import { initStandardForm } from './input-form.js';
import { renderResultTables } from './result-table.js';
import { simulateSalary } from '../be/cal.js';
import { createStandardFooter } from './footer.js';
import { exportResultToPdf, buildStandardPdfFilename } from './download-pdf.js';
import { TEXT } from '../lang/eng.js';
import { createPageHeader, buildExportHeader } from './header.js';

function parseNumber(v){ if(typeof v==='number') return v; if(!v) return 0; return parseFloat(String(v).replace(/[,.]/g,''))||0; }

function collectParams({ direction }) {
	const taxResidentStatus = document.getElementById('tax-resident-status')?.value || 'local';
	if(direction === 'gross-to-net') {
		return {
			method: 'gross-to-net',
			taxResidentStatus,
			grossSalary: parseNumber(document.getElementById('gross-salary')?.value),
			lunchAllowance: parseNumber(document.getElementById('allowance-lunch')?.value),
			fuelAllowance: parseNumber(document.getElementById('allowance-fuel')?.value),
			phoneAllowance: parseNumber(document.getElementById('allowance-phone')?.value),
			travelAllowance: parseNumber(document.getElementById('allowance-travel')?.value),
			uniformAllowance: parseNumber(document.getElementById('allowance-uniform')?.value),
			otherAllowance: parseNumber(document.getElementById('allowance-other')?.value),
			totalBonus: parseNumber(document.getElementById('total-bonus')?.value),
			childTuitionBenefit: parseNumber(document.getElementById('benefit-child-tuition')?.value),
			rentalBenefit: parseNumber(document.getElementById('benefit-rental')?.value),
			healthInsuranceBenefit: parseNumber(document.getElementById('benefit-health-insurance')?.value)
		};
	}
	return {
		method: 'net-to-gross',
		taxResidentStatus,
		netSalary: parseNumber(document.getElementById('net-salary')?.value),
		netLunchAllowance: parseNumber(document.getElementById('allowance-lunch')?.value),
		netFuelAllowance: parseNumber(document.getElementById('allowance-fuel')?.value),
		netPhoneAllowance: parseNumber(document.getElementById('allowance-phone')?.value),
		netTravelAllowance: parseNumber(document.getElementById('allowance-travel')?.value),
		netUniformAllowance: parseNumber(document.getElementById('allowance-uniform')?.value),
		netOtherAllowance: parseNumber(document.getElementById('allowance-other')?.value),
		netTotalBonus: parseNumber(document.getElementById('total-bonus')?.value),
		childTuitionBenefit: parseNumber(document.getElementById('benefit-child-tuition')?.value),
		rentalBenefit: parseNumber(document.getElementById('benefit-rental')?.value),
		healthInsuranceBenefit: parseNumber(document.getElementById('benefit-health-insurance')?.value)
	};
}

function createResultSection(root){
	const div = document.createElement('div');
	div.className = 'result';
	div.id = 'result';
	div.setAttribute('aria-live','polite');
	root.appendChild(div);
	return div;
}

function createButtons(root, textConfig){
	const container = document.createElement('div');
	container.className = 'result-buttons-container';
	container.id = 'result-buttons-container';
	const hardReset = document.createElement('button');
	hardReset.className='simulation-button return-button';
	hardReset.id='hard-reset-btn';
	hardReset.type='button';
	hardReset.textContent = textConfig.buttons.reset;
	const modify = document.createElement('button');
	modify.className='simulation-button return-button';
	modify.id='reset-btn';
	modify.type='button';
	modify.textContent = textConfig.buttons.modify;
	const download = document.createElement('button');
	download.className='simulation-button';
	download.id='download-pdf-btn';
	download.type='button';
	download.textContent=textConfig.buttons.downloadPdf;
	container.appendChild(hardReset); container.appendChild(modify); container.appendChild(download);
	root.appendChild(container);
	return { container, hardReset, modify, download };
}

function buildPdfExport({ textConfig, mode }) {
	return async function () {
		const containers = Array.from(document.querySelectorAll('.result-table-container'));
		if (!containers.length) return;
		const exportContainer = document.createElement('div');
		exportContainer.className = 'pdf-export-container export-a4';
		exportContainer.appendChild(buildExportHeader({ title: (TEXT.index && TEXT.index.title), payslipTitle: textConfig.payslipTitle }));
		exportContainer.appendChild(containers[0].cloneNode(true));
		if (mode === 'employer' && containers[1]) {
			const ecTitle = document.createElement('h1');
			ecTitle.textContent = textConfig.results.employerCostTable.title;
			ecTitle.className = 'pdf-export-title';
			exportContainer.appendChild(ecTitle);
			exportContainer.appendChild(containers[1].cloneNode(true));
		}
		const footer = document.createElement('footer');
		footer.className = 'app-footer export-footer';
		footer.appendChild(document.createElement('hr'));
		const impTitle = document.createElement('span'); impTitle.className = 'footer-title'; impTitle.textContent = textConfig.footer.importantNoteTitle; footer.appendChild(impTitle);
		const impText = document.createElement('div'); impText.className = 'footer-text'; const contactSpan = document.createElement('span'); contactSpan.textContent = textConfig.footer.contactLinkText; impText.textContent = textConfig.footer.importantNoteText + ' '; impText.appendChild(contactSpan); impText.appendChild(document.createTextNode('.')); footer.appendChild(impText);
		const disTitle = document.createElement('span'); disTitle.className = 'footer-title'; disTitle.textContent = textConfig.footer.disclaimerTitle; footer.appendChild(disTitle);
		const disText = document.createElement('div'); disText.className = 'footer-text'; disText.textContent = textConfig.footer.disclaimerText; footer.appendChild(disText);
		const idDiv = document.createElement('div'); idDiv.className = 'export-id'; idDiv.textContent = 'ID: ' + Date.now(); footer.appendChild(idDiv);
		const versionDiv = document.createElement('div'); versionDiv.className = 'version-display'; versionDiv.textContent = (TEXT && TEXT.version) || ''; footer.appendChild(versionDiv);
		exportContainer.appendChild(footer);
		document.body.appendChild(exportContainer);
		const filename = buildStandardPdfFilename();
		await exportResultToPdf({ exportContainer, filename, onComplete: () => exportContainer.remove() });
	};
}

export function createSalarySimulationPage({ rootId='simulator-root', textConfig, direction='gross-to-net', mode='employee', minSalary= (direction==='gross-to-net'?5000000:0), maxDigits=9 }) {
	const host = document.getElementById(rootId);
	if(host){ host.innerHTML=''; createPageHeader({ root: host, title: textConfig.pageTitle }); }
	let lastInputValues = null;
	const init = initStandardForm({
		rootId,
		textConfig,
		salaryType: direction==='gross-to-net' ? 'gross' : 'net',
		maxDigits,
		minSalary,
		focusSalaryStepIndex: 1,
		onCalculate: (e)=>{ e.preventDefault(); handleCalculation(); }
	});
	if(!init) return null;
	const { form: salaryForm, nav } = init;
	const root = document.getElementById(rootId);
	const resultDiv = createResultSection(root);
	const buttons = createButtons(root, textConfig);
	createStandardFooter({ root: document.body, footerConfig: textConfig.footer, version: TEXT.version });

	function handleCalculation(){
		const fieldIds = direction==='gross-to-net'
			? ['tax-resident-status','gross-salary','allowance-lunch','allowance-fuel','allowance-phone','allowance-travel','allowance-uniform','allowance-other','total-bonus','benefit-child-tuition','benefit-rental','benefit-health-insurance']
			: ['tax-resident-status','net-salary','allowance-lunch','allowance-fuel','allowance-phone','allowance-travel','allowance-uniform','allowance-other','total-bonus','benefit-child-tuition','benefit-rental','benefit-health-insurance'];
		lastInputValues = fieldIds.reduce((acc,id)=>{ const el=document.getElementById(id); if(el) acc[id]=el.value; return acc; },{});
		const params = collectParams({ direction });
		const data = simulateSalary(params);
		if(data && data.error){
			resultDiv.innerHTML = `<span class="result-error-text">${data.error}</span>`;
			buttons.container.classList.remove('show');
			return;
		}
		const currentForm = document.getElementById('salary-form');
		if(currentForm && currentForm.parentNode) currentForm.parentNode.removeChild(currentForm);
		const pb = document.getElementById('progress-bar'); if(pb) pb.style.display='none';
		renderResultTables({ root: resultDiv, data, textConfig, mode });
		buttons.container.classList.add('show');
	}

	salaryForm.addEventListener('submit', e=>{ e.preventDefault(); handleCalculation(); });

	buttons.modify.onclick = () => {
		resultDiv.innerHTML='';
		buttons.container.classList.remove('show');
		const pbExisting = document.getElementById('progress-bar');
		if(!document.getElementById('salary-form')) {
			const rebuilt = initStandardForm({
				rootId,
				textConfig,
				salaryType: direction==='gross-to-net' ? 'gross':'net',
				maxDigits,
				minSalary,
				focusSalaryStepIndex: 1,
				onCalculate: (e)=>{ e.preventDefault(); handleCalculation(); }
			});
			if(rebuilt){
				rebuilt.form.addEventListener('submit', e=>{ e.preventDefault(); handleCalculation(); });
				const pbNew = document.getElementById('progress-bar'); if(pbNew) pbNew.style.display='flex';
				if(lastInputValues){
					Object.entries(lastInputValues).forEach(([id,val])=>{ const el=document.getElementById(id); if(el){ el.value=val; el.dispatchEvent(new Event('input',{bubbles:true})); }});
				}
			}
		} else if(pbExisting){
			pbExisting.style.display='flex';
		}
		if(nav && nav.goTo) nav.goTo(0);
	};
	buttons.hardReset.onclick = () => window.location.reload();

	const doExport = buildPdfExport({ textConfig, mode });
	buttons.download.onclick = (e)=>{ e.preventDefault(); doExport(); };

	return { handleCalculation, resultDiv, buttons };
}