// DOM utility functions extracted from employer JS files

export function getElement(id) {
  return document.getElementById(id);
}

export function createAndAppend(parent, tag, props = {}, innerHTML = '') {
  const el = document.createElement(tag);
  Object.assign(el, props);
  if (innerHTML) el.innerHTML = innerHTML;
  parent.appendChild(el);
  return el;
}
