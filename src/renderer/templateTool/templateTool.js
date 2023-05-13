// This file loads up the template tool. Which is used to add, modify, and remove
// templates from the database
//

/*
import { Template } from '../template.js';

// variables to put in the table
const tableHeaders = [
  'title',
  'season',
  'numTeams',
  'numCourts',
  'numWeeks',
  'numByes',
  'minMatches',
  'balanced',
  'equalMatches',
  'hasPools',
  'description',
];
// columns that are numbers
const numericHeaders = [
  'numTeams',
  'numCourts',
  'numWeeks',
  'numByes',
  'minMatches',
];
// Columns that are booleans
const boolHeaders = ['balanced', 'equalMatches', 'hasPools'];
// columns that can be edited
const inputHeaders = ['title', 'hasPools', 'description'];
// All the templates extracted from the Database
const dbTemplates = [];

/** ***************************************************************************
 *****                                                                   *****
 *****                        Main Thread Comms                          *****
 *****                                                                   *****
 *************************************************************************** */
/*
window.toolApi.loadTemplates((e, storedTemplates) => {
  // load all the templates from the database
  loadTemplatesFromDatabase(storedTemplates);
});

window.toolApi.importFile((e, msg) => {
  // load all the templates from the database
  importFile(msg);
});
/** ***************************************************************************
 *****                                                                   *****
 *****                             Functions                             *****
 *****                                                                   *****
 *************************************************************************** */
/*
function importFile(msg) {
  // Retrieve data from msg
  const wb = msg.workbook;
  const replaceFlag = msg.replace;

  // initialize Template (in loop we will initialize a new object instance)
  let tempTemplate = [];

  // First sheet in the workbook should be template info
  if (wb.SheetNames[0] === 'TemplateInfo') {
    // We can just pull information from template info to guide our building.
    // Convert to a json object so its easier to work with
    window.toolApi.readSheet(wb.Sheets.TemplateInfo).then((templateInfo) => {
      // Loop on the number of rows (or templates) in the entry
      for (let i = 0; i < templateInfo.length; i++) {
        tempTemplate = new Template();
        // Import the template information from the template info sheet
        tempTemplate.importInfoFromSheet(templateInfo[i]);

        window.toolApi
          .readSheet(wb.Sheets[`Schedule_${templateInfo[i]['Schedule ID']}`])
          .then((schedule) => {
            // Now build the schedule from the table
            tempTemplate.buildTemplateSchedule(
              schedule,
              templateInfo[i]['Schedule ID']
            );
            // Add the template to the Database
            if (replaceFlag) {
              replaceTemplate(tempTemplate);
            } else {
              addTemplate(tempTemplate);
            }
          });
      }
    });
  } else {
    console.error('This is not supported, template info sheet required');
  }
}

// Write templates file
function writeTemplates() {
  // Convert all template objects to the JSON format
  const storedTemplates = [];
  for (let iTemp = 0; iTemp < dbTemplates.length; iTemp++) {
    storedTemplates.push(dbTemplates[iTemp].exportToDatabase());
  }
  // Just write the JSON objects to disk
  window.toolApi.writeTemplate(JSON.stringify(storedTemplates));
}

// Add the chosen template to the database
function replaceTemplate(template) {
  // Look in existing templates for the existing ID
  const target = dbTemplates.findIndex(
    (t) => t.get('id') === template.get('id'),
    template
  );
  // If empty, add this new template
  if (target === undefined) {
    console.log('Could not find template to replace');
  } else {
    dbTemplates[target] = template;
    writeTemplates();
    drawTemplateTable();
  }
}

// Add the chosen template to the database
function addTemplate(template) {
  // Look in existing templates for the existing ID
  const target = dbTemplates.find(
    (t) => t.get('id') === template.get('id'),
    template
  );
  // If empty, add this new template
  if (target === undefined) {
    dbTemplates.push(template);
    writeTemplates();
    drawTemplateTable();
  } else {
    console.log('Template is already in database');
  }
}

// Load templates from the Database
function loadTemplatesFromDatabase(storedTemplates) {
  // Sort through the stored templates and create objects for the selected season
  for (let t = 0; t < storedTemplates.length; t++) {
    dbTemplates.push(new Template());
    dbTemplates[t].importFromDatabase(storedTemplates[t]);
  }
  drawTemplateTable();
}

// re draws the template tool page with all loaded templates from the Database
function drawTemplateTable() {
  // Dynamically fill in the html table from the templates in the database
  const table = document.getElementById('templateTable');
  // Remove what is currently there in the body
  const body = document.getElementById('ttBody');
  body.remove();
  // table.removeChild(oldBody[0]);
  // Create a document fragment which makes this faster
  const c = document.createDocumentFragment();
  // New body to Create
  const newBody = document.createElement('tbody');
  newBody.setAttribute('id', 'ttBody');
  // Add to the document fragment
  c.appendChild(newBody);
  let inCell;
  // now add rows to the newBody from the dbTemplates structure
  for (let i = 0; i < dbTemplates.length; i++) {
    // add a row
    const row = document.createElement('tr');
    for (let h = 0; h < tableHeaders.length; h++) {
      const cell = document.createElement('td');
      const text = dbTemplates[i].get(tableHeaders[h]);
      // if this is editable you need to add an input field
      if (
        inputHeaders.some((e) => {
          return e === tableHeaders[h];
        })
      ) {
        inCell = document.createElement('INPUT');
        inCell.addEventListener('change', (event) => updateRecord(event));
        inCell.setAttribute('Template', i);
        inCell.setAttribute('Field', tableHeaders[h]);
        if (
          numericHeaders.some((e) => {
            return e === tableHeaders[h];
          })
        ) {
          inCell.type = 'number';
          inCell.value = Number(substring(text, 0, 4));
        } else if (
          boolHeaders.some((e) => {
            return e === tableHeaders[h];
          })
        ) {
          inCell.type = 'checkbox';
          inCell.checked = text;
        } else {
          inCell.value = text;
        }
      } else {
        inCell = document.createTextNode(
          text != null ? text.toString() : 'none'
        );
      }
      // append to the cell
      cell.appendChild(inCell);
      // append to rows
      row.appendChild(cell);
    }
    // add row to table body
    newBody.appendChild(row);
  }
  // Now add the new body to the table
  table.appendChild(c);
}
function updateRecord(event) {
  const t = event.target;
  let newval;
  if (t.type === 'checkbox') {
    newval = t.checked;
  } else {
    newval = t.value;
  }
  const i = Number(t.getAttribute('Template'));
  const field = t.getAttribute('Field');

  // Set the property and write it out
  dbTemplates[i].set(field, newval);
  writeTemplates();
}
*/
