//This file loads up the template tool. Which is used to add, modify, and remove
//templates from the database

//need the remote library for electron function references in the main thread
const {remote,ipcRenderer} = require('electron');
const xlsx = require('xlsx');
//Database
const Datastore = require('nedb');
//Template info
const Template = require('../template').Template;

//Autoload the database
let db = new Datastore({ filename: 'database/Templates.db', autoload: true });

//All the templates extracted from the Database
let dbTemplates = [];

//simple script for getting a filename
ipcRenderer.on('xlsx-file-input',(e,filename)=>{
  //Read in the excel sheet and convert to a JSON object
  console.log(filename[0]);
  readExcelFile(filename[0]);
});


/*****************************************************************************
 *****                                                                   *****
 *****                             Functions                             *****
 *****                                                                   *****
 ****************************************************************************/
function readExcelFile(file)
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
      addTemplate(tempTemplate);
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
  drawTemplateTable();
  console.log(dbTemplates);
}

//Add the chosen template to the database
function addTemplate(template)
{
  let success= false;
  //Check to make sure that this template isn't already in the Database
  db.find({id:template.get('id')},function(err,docs)
  {
    if(docs.length===0)
    {
      //Couldnt' find the id in database, get the database format and write it
      //to the database
      db.insert(template.exportToDatabase());
      //successfully wrote to db, add to the cached templates
      dbTemplates.push(template);
    }
  });
}

//re draws the template tool page with all loaded templates from the Database
function drawTemplateTable(){}

//TODO load all of the templates from the database and create an HTML table on the page to display them
