/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
export function setCellText(textIn, style, attributes) {
  const cell = document.createElement('td');
  let block;
  if (typeof style === 'undefined') {
    block = document.createTextNode(textIn);
  } else {
    block = document.createElement(style);
    block.innerHTML = textIn;
  }
  // Add attributes if necessary
  for (const key in attributes) {
    cell.setAttribute(key, attributes[key]);
  }

  cell.appendChild(block);

  return cell;
}
// set multiple html attributes all at onchange
export function setAttributes(el, attributes) {
  for (const key in attributes) {
    el.setAttribute(key, attributes[key]);
  }
}
