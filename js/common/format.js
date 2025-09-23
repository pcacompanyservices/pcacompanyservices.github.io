// Shared formatting utilities to keep behavior identical across scenarios

export function parseNumber(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat((val + '').replace(/[^\d.-]/g, '')) || 0;
}

export function formatCurrency(num, unit = 'VND') {
  if (num == null || isNaN(num)) return '-';
  return `${Number(num).toLocaleString('vi-VN')} ${unit}`;
}

// Mirrors existing behavior: trims to 9 digits and shows a sibling warning
export function formatNumberInput(input) {
  let raw = input.value.replace(/[^\d]/g, '');
  let warning = null;
  const warnMap = {
    'gross-salary': 'gross-salary-warning',
    'net-salary': 'net-salary-warning'
  };
  if (warnMap[input.id]) {
    warning = document.getElementById(warnMap[input.id]);
  } else if (input.closest('#allowance-inputs')) {
    warning = document.getElementById('allowance-warning');
  } else if (input.closest('#bonus-inputs')) {
    warning = document.getElementById('bonus-warning');
  }
  if (raw.length > 9) {
    if (warning) warning.style.display = '';
    raw = raw.slice(0, 9);
  } else if (warning) {
    warning.style.display = 'none';
  }
  input.value = raw ? Number(raw).toLocaleString('vi-VN') : '';
}

