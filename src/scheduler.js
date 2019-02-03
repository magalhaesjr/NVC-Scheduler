//This file is the main scheduling function. It will handle all of the scheduling
//specific functions

//need the remote library for electron function references in the main thread
const {remote,ipcRenderer} = require('electron');
//Database
const Datastore = require('nedb');
//Template info
const Template = require('./template').Template;

//variables to put in the table
const tableHeaders = ['title','season','numTeams','numCourts','numWeeks','numByes',
'minMatches','balanced','equalMatches','hasPools','description'];

//Autoload the database
let db = new Datastore({ filename: 'database/Templates.db', autoload: true });
//All the templates extracted from the Database
let dbTemplates = [];

/*****************************************************************************
 *****                                                                   *****
 *****                        Main Thread Comms                          *****
 *****                                                                   *****
 ****************************************************************************/
//Load templatees
ipcRenderer.on('start-template-schedule',(e,season)=>{
  //load all the templates from the database
  loadTemplateChoices(season);
});

/*****************************************************************************
 *****                                                                   *****
 *****                             Functions                             *****
 *****                                                                   *****
 ****************************************************************************/
//Load templates from the Database
function loadTemplateChoices(season){
  //Find all of the templates currently in the database and sort by id
  db.find({season: season}).sort({season:1,numTeams:1}).exec(function(err,docs){
    //Loop on each doc, creating a template, building the team preview, and then
    //keeping the copy around
    for(let i=0;i<docs.length;i++){
      dbTemplates.push(new Template());
      dbTemplates[i].importFromDatabase(docs[i]);
    }
    //After the for loop we draw the template table
    showTemplateChoices();
  });
}

//re draws the template tool page with all loaded templates from the Database
function showTemplateChoices(){
  //Create a document fragment which makes this faster
  const c = document.createDocumentFragment();
  //Create a table to add to the document
  let table = document.createElement('table');
  c.appendChild(table);
  //New body to Create
  let newBody = document.createElement("tbody");
  //Add to the document fragment
  table.appendChild(newBody);
  //now add rows to the newBody from the dbTemplates structure
  for(let i=0;i<dbTemplates.length;i++){
    //add a row
    let row = document.createElement("tr");
    for(let h=0;h<tableHeaders.length;h++){
      let cell = document.createElement("td");
      let text = dbTemplates[i].get(tableHeaders[h]);
      let celltext = document.createTextNode(text!=null?text.toString():'none');
      //append to the cell
      cell.appendChild(celltext);
      //append to rows
      row.appendChild(cell);
    }
    //add row to table body
    newBody.appendChild(row);
  }
  //Now add the new body to the table
  document.getElementById('form_step_1').appendChild(c);
}
