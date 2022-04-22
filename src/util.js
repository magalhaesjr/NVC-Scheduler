
export function setCellText (textIn,style,attributes){
  let cell = document.createElement('td');
  let block;
  if(typeof style ==='undefined'){
    block = document.createTextNode(textIn);
  }
  else {
    block = document.createElement(style);
    block.innerHTML = textIn;
  }
  //Add attributes if necessary
  for(let key in attributes){
    cell.setAttribute(key,attributes[key]);
  }

  cell.appendChild(block);

  return(cell);
};
//set multiple html attributes all at onchange
export function setAttributes(el,attributes)
{
  for(let key in attributes){
    el.setAttribute(key,attributes[key]);
  }
};
