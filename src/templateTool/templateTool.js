//This file loads up the template tool. Which is used to add, modify, and remove
//templates from the database

//need the remote library for electron function references in the main thread
/*const {remote,ipcRenderer} = require('electron');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
//Template info
const Template = require('../template').Template;
*/
import Template from '../template.js';

//variables to put in the table
const tableHeaders = ['title','season','numTeams','numCourts','numWeeks','numByes',
'minMatches','balanced','equalMatches','hasPools','description'];
//columns that are numbers
const numericHeaders = ['numTeams','numCourts','numWeeks','numByes','minMatches'];
//Columns that are booleans
const boolHeaders = ['balanced','equalMatches','hasPools'];
//columns that can be edited
const inputHeaders = ['title','hasPools','description'];
/*
//Check for bad initialization of env variables
if (typeof process.env.NODE_ENV==='undefined'){
  process.env.NODE_ENV = "production";
}

//Autoload the database
let templateFile;
if (process.env.NODE_ENV==="production"){
    templateFile = path.join(process.resourcesPath, 'extraResources','Templates.json');
} else{
    templateFile = path.join(path.dirname(__dirname), '../extraResources','Templates.json');
}
*/
//All the templates extracted from the Database
let dbTemplates = [];

/*****************************************************************************
 *****                                                                   *****
 *****                        Main Thread Comms                          *****
 *****                                                                   *****
 ****************************************************************************/
// Once a season is chosen, you start the process
window.api.onStart((e, season) => {
  //set the html pages displays correctly
  document.getElementsByClassName('stages')[0].setAttribute('hide', false);
  document.getElementById("one").setAttribute('checked', "checked");
  
  //load all the templates from the database
  loadTemplateChoices(season);
});

//simple script for getting a filename
window.toolApi.on('xlsx-file-input',(e,filename)=>{
  //Read in the excel sheet and convert to a JSON object
  readExcelFile(filename[0],false);
});
//simple script for replacing the templates
ipcRenderer.on('xlsx-file-replace',(e,filename)=>{
  //Read in the excel sheet and convert to a JSON object
  readExcelFile(filename[0],true);
});
//Load templatees
ipcRenderer.on('load-Templates',e=>{
  //load all the templates from the database
  loadTemplatesFromDatabase();
});
/*****************************************************************************
 *****                                                                   *****
 *****                             Functions                             *****
 *****                                                                   *****
 ****************************************************************************/
function readExcelFile(file,replaceFlag)
{
  //Read the workbook from the filename
  let wb = xlsx.readFile(file);

  //initialize Template (in loop we will initialize a new object instance)
  let tempTemplate = [];

  //First sheet in the workbook should be template info
  if (wb.SheetNames[0]==='TemplateInfo')
  {
    //We can just pull information from template info to guide our building.
    //Convert to a json object so its easier to work with
    let templateInfo = xlsx.utils.sheet_to_json(wb.Sheets.TemplateInfo);

    //Loop on the number of rows (or templates) in the entry
    for(let i=0;i<templateInfo.length;i++)
    {
      tempTemplate = new Template();
      //Import the template information from the template info sheet
      tempTemplate.importInfoFromSheet(templateInfo[i]);

      //Now build the schedule from the table
      tempTemplate.buildTemplateSchedule(xlsx.utils.sheet_to_json(wb.Sheets['Schedule_' + templateInfo[i]['Schedule ID']]),
    templateInfo[i]['Schedule ID']);
      //Add the template to the Database
      if(replaceFlag){
        replaceTemplate(tempTemplate);
      }else{
        addTemplate(tempTemplate);
      }
    }
  }
  else
  {
    //No template info, we should build the schedule from the template sheet and
    //derive all information from that
    for(let i=0;i<wb.SheetNames.length();i++)
    {
      tempTemplate = new Template();
      //Import the template information from the template info sheet
      if (wb.SheetNames[0].contains('Sched'))
      {
        tempTemplate.importAllFromSheet(templateInfo);
      }
    }
  }
  //Update the html page with the new entries in the Database
  //console.log(dbTemplates);
}

// Write templates file
function writeTemplates()
{
  // Convert all template objects to the JSON format
  let storedTemplates = Array();
  for (iTemp = 0; iTemp < dbTemplates.length; iTemp++){
    storedTemplates.push(dbTemplates[iTemp].exportToDatabase()); 
  }
  // Just write the JSON objects to disk
  fs.writeFileSync(templateFile, JSON.stringify(storedTemplates));
}

//Add the chosen template to the database
function replaceTemplate(template)
{
  // Look in existing templates for the existing ID
  let target = dbTemplates.findIndex(t=>(t.get('id')=== template.get('id')), template);
  // If empty, add this new template
  if (target === undefined){
    console.log('Could not find template to replace');
  }else{
    dbTemplates[target] = template;
    writeTemplates();
    drawTemplateTable();
  }
}

//Add the chosen template to the database
function addTemplate(template)
{
  // Look in existing templates for the existing ID
  let target = dbTemplates.find(t=>(t.get('id')=== template.get('id')), template);
  // If empty, add this new template
  if (target === undefined){
    dbTemplates.push(template);
    writeTemplates();
    drawTemplateTable();
  }else{
    console.log('Template is already in database');
  }
}

//Load templates from the Database
function loadTemplatesFromDatabase()
{
  // Read the templates from the json file into a raw buffer
  let rawBuffer = fs.readFileSync(templateFile);

  // Parse into JSON objects
  let storedTemplates = JSON.parse(rawBuffer);
  // Sort templates by season and then numTeams
  storedTemplates.sort((a, b) =>{
    let diff = a.season.localeCompare(b.season);
    if(diff === 0){
      diff = a.numTeams - b.numTeams;
    }
    return diff
  });
  
  // Sort through the stored templates and create objects for the selected season
  for(let t = 0; t < storedTemplates.length; t++){
    dbTemplates.push(new Template());
    dbTemplates[t].importFromDatabase(storedTemplates[t]);
  }
  drawTemplateTable();
}

//re draws the template tool page with all loaded templates from the Database
function drawTemplateTable()
{
  //Dynamically fill in the html table from the templates in the database
  let table = document.getElementById('templateTable');
  //Remove what is currently there in the body
  let body = document.getElementById('ttBody');
  body.remove();
  //table.removeChild(oldBody[0]);
  //Create a document fragment which makes this faster
  const c = document.createDocumentFragment();
  //New body to Create
  let newBody = document.createElement("tbody");
  newBody.setAttribute("id",'ttBody');
  //Add to the document fragment
  c.appendChild(newBody);
  let inCell;
  //now add rows to the newBody from the dbTemplates structure
  for(let i=0;i<dbTemplates.length;i++){
    //add a row
    let row = document.createElement("tr");
    for(let h=0;h<tableHeaders.length;h++){
      let cell = document.createElement("td");
      let text = dbTemplates[i].get(tableHeaders[h]);
      //if this is editable you need to add an input field
      if (inputHeaders.some(e=>{return(e===tableHeaders[h]);})){
        inCell = document.createElement("INPUT");
        inCell.setAttribute('onchange',`updateRecord(event)`);
        inCell.setAttribute('Template',i);
        inCell.setAttribute('Field',tableHeaders[h]);
        if (numericHeaders.some(e=>{return(e===tableHeaders[h]);})){
          inCell.type = 'number';
          inCell.value = Number(substring(text,0,4));
        }
        else if (boolHeaders.some(e=>{return(e===tableHeaders[h]);})){
          inCell.type = 'checkbox';
          inCell.checked = text;
        }
        else{
          inCell.value = text;
        }
      }
      else{
        inCell = document.createTextNode(text!=null?text.toString():'none');
      }
      //append to the cell
      cell.appendChild(inCell);
      //append to rows
      row.appendChild(cell);
    }
    //add row to table body
    newBody.appendChild(row);
  }
  //Now add the new body to the table
  table.appendChild(c);
}
function updateRecord(event)
{

  let t = event.target;
  let newval;
  if (t.type==='checkbox'){
    newval = t.checked;
  }
  else {
    newval = t.value;
  }
  let i = Number(t.getAttribute('Template'));
  let field = t.getAttribute('Field');
  
  // Set the property and write it out
  dbTemplates[i].set(field, newval);
  writeTemplates();
}
