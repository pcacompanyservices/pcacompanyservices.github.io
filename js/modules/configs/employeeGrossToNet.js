import { TEXT } from '../../../lang/eng.js';
import { selectStep } from '../steps/selectStep.js';
import { currencyInputStep } from '../steps/currencyInputStep.js';
import { allowanceStep } from '../steps/allowanceStep.js';
import { bonusStep } from '../steps/bonusStep.js';
import { renderFooterFrom } from '../../common/footer.js';

export function buildEmployeeGrossToNetConfig() {
  const t = TEXT.employeeGrossToNet;
  return {
    title: t.pageTitle,
    steps: [
      {
        label: t.progressSteps.citizenship,
        render: () => selectStep({
          id: 'citizenship',
          title: t.steps.citizenship.title,
          tooltip: t.steps.citizenship.tooltip,
          placeholder: t.steps.citizenship.selectPlaceholder,
          options: [
            { value: 'local', label: t.steps.citizenship.options.local },
            { value: 'expat', label: t.steps.citizenship.options.expat }
          ],
          continueId: 'continue-step1',
          continueText: t.steps.citizenship.continue
        })
      },
      {
        label: t.progressSteps.grossSalary,
        render: () => currencyInputStep({
          id: 'gross-salary',
          title: t.steps.grossSalary.title,
          tooltip: t.steps.grossSalary.tooltip,
          placeholder: t.steps.grossSalary.placeholder,
          warningId: 'gross-salary-warning',
          warningText: t.steps.grossSalary.warningMaxDigits,
          continueId: 'continue-step2',
          continueText: t.steps.grossSalary.continue
        })
      },
      {
        label: t.progressSteps.allowance,
        render: () => allowanceStep({
          title: t.steps.allowance.title,
          tooltip: t.steps.allowance.tooltip,
          warningId: 'allowance-warning',
          warningText: t.steps.allowance.warningMaxDigits,
          withParentCheckbox: true,
          parentCheckboxId: 'allowance-checkbox',
          parentCheckboxLabel: t.steps.allowance.hasAllowanceLabel,
          continueId: 'continue-step3',
          continueText: t.steps.allowance.continue,
          fields: [
            { id: 'allowance-lunch',   label: t.steps.allowance.types.lunch,   tooltip: t.steps.allowance.tooltips.lunch,   placeholder: t.steps.allowance.placeholders.lunch },
            { id: 'allowance-fuel',    label: t.steps.allowance.types.fuel,    tooltip: t.steps.allowance.tooltips.fuel,    placeholder: t.steps.allowance.placeholders.fuel },
            { id: 'allowance-phone',   label: t.steps.allowance.types.phone,   tooltip: t.steps.allowance.tooltips.phone,   placeholder: t.steps.allowance.placeholders.phone },
            { id: 'allowance-travel',  label: t.steps.allowance.types.travel,  tooltip: t.steps.allowance.tooltips.travel,  placeholder: t.steps.allowance.placeholders.travel },
            { id: 'allowance-uniform', label: t.steps.allowance.types.uniform, tooltip: t.steps.allowance.tooltips.uniform, placeholder: t.steps.allowance.placeholders.uniform },
            { id: 'allowance-other',   label: t.steps.allowance.types.other,   tooltip: t.steps.allowance.tooltips.other,   placeholder: t.steps.allowance.placeholders.other }
          ]
        })
      },
      {
        label: t.progressSteps.bonus,
        render: () => bonusStep({
          title: t.steps.bonus.title,
          tooltip: t.steps.bonus.tooltip,
          warningId: 'bonus-warning',
          warningText: t.steps.bonus.warningMaxDigits,
          withParentCheckbox: true,
          parentCheckboxId: 'bonus-checkbox',
          parentCheckboxLabel: t.steps.bonus.hasBonusLabel,
          fields: [
            { id: 'bonus-productivity', label: t.steps.bonus.types.productivity, tooltip: t.steps.bonus.tooltips.productivity, placeholder: t.steps.bonus.placeholders.productivity },
            { id: 'bonus-incentive',    label: t.steps.bonus.types.incentive,    tooltip: t.steps.bonus.tooltips.incentive,    placeholder: t.steps.bonus.placeholders.incentive },
            { id: 'bonus-kpi',          label: t.steps.bonus.types.kpi,          tooltip: t.steps.bonus.tooltips.kpi,          placeholder: t.steps.bonus.placeholders.kpi },
            { id: 'bonus-other',        label: t.steps.bonus.types.other,        tooltip: t.steps.bonus.tooltips.other,        placeholder: t.steps.bonus.placeholders.other }
          ]
        })
      }
    ],
    renderFooter: () => renderFooterFrom(t.footer, document.body)
  };
}
