import { TEXT } from '../../../lang/eng.js';
import { selectStep } from '../steps/selectStep.js';
import { currencyInputStep } from '../steps/currencyInputStep.js';
import { simpleInputsStep } from '../steps/simpleInputsStep.js';
import { renderFooterFrom } from '../../common/footer.js';

export function buildEmployerNetToGrossConfig() {
  const t = TEXT.employerNetToGross;
  return {
    title: t.pageTitle,
    steps: [
      { label: t.progressSteps.taxResidentStatus, render: () => selectStep({ id: 'tax-resident-status', title: t.steps.taxResidentStatus.title, tooltip: t.infoTooltips.taxResidentStatus, placeholder: t.steps.taxResidentStatus.selectPlaceholder, options: [ { value:'local', label: t.steps.taxResidentStatus.options.local }, { value:'expat', label: t.steps.taxResidentStatus.options.expat } ], continueId: 'continue-step1', continueText: t.buttons.continue }) },
      { label: t.progressSteps.netSalary, render: () => currencyInputStep({ id: 'net-salary', title: t.steps.netSalary.title, tooltip: t.infoTooltips.netSalary, placeholder: t.steps.netSalary.placeholder, warningId: 'net-salary-warning', warningText: t.warnings.maxDigits, continueId: 'continue-step2', continueText: t.buttons.continue }) },
      { label: t.progressSteps.allowance, render: () => simpleInputsStep({ title: t.steps.allowance.title, tooltip: t.infoTooltips.allowance, warningId: 'allowance-warning', warningText: t.warnings.maxDigits, continueId: 'continue-step3', continueText: t.buttons.continue, fields: [
        { id: 'allowance-lunch', label: t.steps.allowance.types.lunch, placeholder: t.steps.allowance.placeholders.lunch, tooltip: t.infoTooltips.lunch },
        { id: 'allowance-fuel', label: t.steps.allowance.types.fuel, placeholder: t.steps.allowance.placeholders.fuel, tooltip: t.infoTooltips.fuel },
        { id: 'allowance-phone', label: t.steps.allowance.types.phone, placeholder: t.steps.allowance.placeholders.phone, tooltip: t.infoTooltips.phone },
        { id: 'allowance-travel', label: t.steps.allowance.types.travel, placeholder: t.steps.allowance.placeholders.travel, tooltip: t.infoTooltips.travel },
        { id: 'allowance-uniform', label: t.steps.allowance.types.uniform, placeholder: t.steps.allowance.placeholders.uniform, tooltip: t.infoTooltips.uniform },
        { id: 'allowance-other', label: t.steps.allowance.types.other, placeholder: t.steps.allowance.placeholders.other, tooltip: t.infoTooltips.otherAllowance }
      ] }) },
      { label: t.progressSteps.bonus, render: () => simpleInputsStep({ title: t.steps.bonus.title, tooltip: t.infoTooltips.bonus, warningId: 'bonus-warning', warningText: t.warnings.maxDigits, continueId: 'continue-step4', continueText: t.buttons.continue, fields: [ { id: 'bonus-total', label: t.steps.bonus.title, placeholder: t.steps.bonus.placeholder } ] }) },
      { label: t.progressSteps.benefit, render: () => simpleInputsStep({ title: t.steps.benefit.title, tooltip: t.infoTooltips.benefit, warningId: 'benefit-warning', warningText: t.warnings.maxDigits, fields: [
        { id: 'benefit-childTuition', label: t.steps.benefit.types.childTuition, placeholder: t.steps.benefit.placeholders.childTuition, tooltip: t.infoTooltips.childTuition },
        { id: 'benefit-rental', label: t.steps.benefit.types.rental, placeholder: t.steps.benefit.placeholders.rental, tooltip: t.infoTooltips.rental },
        { id: 'benefit-healthInsurance', label: t.steps.benefit.types.healthInsurance, placeholder: t.steps.benefit.placeholders.healthInsurance, tooltip: t.infoTooltips.healthInsurance }
      ] }) }
    ],
    renderFooter: () => renderFooterFrom(t.footer, document.body)
  };
}
