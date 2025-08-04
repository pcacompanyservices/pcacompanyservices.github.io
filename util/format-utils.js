// Formatting utility functions extracted from employer JS files

export function formatLine(label, value) {
  return value ? `- ${label}: ${value.toLocaleString('en-US')} VND<br>` : '';
}

export function safeText(text) {
  return text ? String(text) : '';
}

export function formatCurrency(val) {
  return val ? val.toLocaleString('en-US') + ' VND' : '-';
}
