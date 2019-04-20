//This file is the main scheduling function. It will handle all of the scheduling
//specific functions

//need the remote library for electron function references in the main thread
const {
  remote,
  ipcRenderer
} = require('electron');
const path = require('path');
//dialog window is from the remote class
const dialog = remote.dialog;
//File writing from remote class
const fs = remote.require('fs');
//Database
const Datastore = require('nedb');
//Template info
const Template = require('./template').Template;
const TeamInfo = require('./template').TeamInfo;
//csv reading
const xlsx = require('xlsx');
const utils = require('./util.js');
//Hungarian method for team assignment
const munkres = require('munkres-js');

//Check for bad initialization of env variables
if (typeof process.env.NODE_ENV==='undefined'){
  process.env.NODE_ENV = "production";
}

//Autoload the database
let db;
if (process.env.NODE_ENV==="production"){
  db = new Datastore({
    filename: path.join(process.resourcesPath, 'extraResources','Templates.db'),
    autoload: true
  });
} else{
  db = new Datastore({
    filename: path.join(path.dirname(__dirname), 'extraResources','Templates.db'),
    autoload: true
  });
}

/*****************************************************************************
 *****                                                                   *****
 *****                       Global Variables                            *****
 *****                                                                   *****
 ****************************************************************************/
//All the templates extracted from the Database
let dbTemplates = [];
//Loaded template
let loadedTemplate;
//Completed team information
let leagueTeamInfo = [];

//variables to put in the table
const tableHeaders = ['select', 'title', 'season', 'numTeams', 'numCourts', 'numWeeks', 'numByes',
  'minMatches', 'balanced', 'equalMatches', 'hasPools', 'description'];
const tableLabels = ['Select', 'Title', 'Season', 'Teams', 'Cts', 'Weeks', 'Byes',
    'MinGames', 'Balanced', 'Equal', 'Pools', 'Description'];

//Columns that are booleans
const boolHeaders = ['balanced','equalMatches','hasPools'];
//Headers in the schedule table
const Headers = ['Week', 'Date', 'Message', 'Bye', 'Time', 'Court', 'T1', 'T2'];
//Months as strings
const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

/*****************************************************************************
 *****                                                                   *****
 *****                        Main Thread Comms                          *****
 *****                                                                   *****
 ****************************************************************************/
//Load templates
ipcRenderer.on('start-template-schedule', (e, season) => {
  //set the html pages displays correctly
  document.getElementsByClassName('stages')[0].setAttribute('hide', false);
  document.getElementById("one").setAttribute('checked', "checked");

  //load all the templates from the database
  loadTemplateChoices(season);
});

/*****************************************************************************
 *****                                                                   *****
 *****                             Functions                             *****
 *****                                                                   *****
 ****************************************************************************/

/************
**    A    **
************/

//assign team numbers
function assignTeamNumbers() {
  //find all of the bye request rows
  let requests = document.getElementsByClassName('requestTeam');

  //Team Previews
  let teamPreviews = loadedTemplate.get('teamPreview');
  let schedule = loadedTemplate.get('schedule');

  //Initial cost for missed byes
  let costWeights = Array.from(Array(teamPreviews.length),
      _=>Array(schedule.week.length).fill(0));
  let costPrimary;
  let costSecondary = 5;
  let costStep = 0.1;

  //Vars for the loops
  let teamNumber,cell,byes,preview,req,weekInd;

  //Loop on all of the requests and add them to the team preview
  for (let r=0;r<requests.length;r++) {
    req = requests[r];
    //Find which team this is
    cell = req.getElementsByTagName('select');
    teamNumber = Number(cell[0].options[cell[0].selectedIndex].value);

    //Pull the team preview
    preview = loadedTemplate.get('teamPreview')[teamNumber-1];
    //Reset bye requests
    preview.byeRequests = [];

    //Initial cost for a primary bye request
    costPrimary = 10 - r*costStep;

    //Now find all of the bye requests
    byes = req.getElementsByClassName('byeRequestCell');
    for (let c=0;c<byes.length;c++){
      b = byes[c];
      //if bye type is >0 then add it to the team's bye request
      if(Number(b.getAttribute('byeType'))===1){
        preview.byeRequests.push(b.getAttribute('date'));
        //find week index
        weekInd = schedule.week.findIndex(e=>{return(e.date===b.getAttribute('date'));});
        //fill in the cost weights
        costWeights[teamNumber-1][weekInd] = costPrimary;
        costPrimary -= requests.length*costStep;
      }else if (Number(b.getAttribute('byeType'))===2){
        preview.byeRequests.push(b.getAttribute('date'));
        //fill in the cost weights
        costWeights[teamNumber-1][weekInd] = costSecondary;
      }
    }
  }

  //Now that we have all the requests and costs, fill in the Assignment Cost
  //matrix for the assignment algorithm
  let costMatrix= Array.from(Array(teamPreviews.length),
      _=>Array(teamPreviews.length).fill(0));
  let localCost;

  //For copying the bye requests properly
  let oldRequest=[];

  for(let t=0;t<teamPreviews.length;t++) {
  oldRequest.push(teamPreviews[t].byeRequests);
}

  for (let w=0;w<schedule.week.length;w++) {
    //Don't do this for a blackout obviously
    if (schedule.week[w].blackout){
      continue;
    }
    //loop through each team number
    for(let t=0;t<teamPreviews.length;t++) {
      //if the team has a bye on this night, then the cost is 0, otherwise Pull
      //the cost from the cost weights calculated in the requests
      byes = schedule.week[w].timeSlot.filter(e=>{
        return(e.byeTeams.some(ei=>{return ei===teamPreviews[t].teamNumber;}));
      });
      localCost = (schedule.week[w].timeSlot.length -
        byes.length)/schedule.week[w].timeSlot.length;
      //Add to total cost
      for(let r=0;r<teamPreviews.length;r++){
        costMatrix[r][t]+=localCost*costWeights[r][w];
      }
    }
  }
  //Evaluate the algorithm
  let teamInd = munkres(costMatrix);

  //Update the Team info table, and then do the updates from there
  let table = document.getElementById('teamInfoBody');
  for(let r=0;r<table.children.length;r++){
    //change the team name to the new one
    table.children[teamInd[r][1]].children[1].children[0].value = leagueTeamInfo[r].name;
    table.children[teamInd[r][1]].children[2].children[0].value = leagueTeamInfo[r].mappingCode;

    teamPreviews[teamInd[r][1]].byeRequests = oldRequest[r];
  }

  updateTeamInfo();
}

/************
**    B    **
************/

//Displays the whole schedule in table form for a preview
function buildScheduleTable() {
  //Get the schedule from the current template
  let schedule = loadedTemplate.get('schedule');

  //Starting date
  //let currentDate = document.getElementById('start_date').valueAsDate;
  let currentDate = document.getElementById('start_date').valueAsDate;
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(),
    currentDate.getUTCDate());
  //set the start date as a day
  let currentDay = currentDate.getUTCDate();
  //currentDate.setUTCDate(currentDay); //silly timezone bullshit
  //Starting court number
  let startCourt = document.getElementById('start_court').valueAsNumber - 1;

  //Initialize the html fragment to write to
  let c = document.createDocumentFragment();
  //Write a header
  let table = document.createElement('table');
  c.appendChild(table);
  let header = document.createElement('thead');
  table.appendChild(header);
  //Write the headers
  let row = document.createElement('tr');
  header.appendChild(row);
  Headers.forEach((text) => {
    row.appendChild(utils.setCellText(text));
  }, row);

  //Old dates
  let oldDates = [];
  let cell;

  let body = document.createElement('tbody');
  table.appendChild(body);
  //Now we loop through the template and build the table
  for (let i = 0; i < schedule.week.length; i++) {
    //While we're doing this, lets update each date in the schedule preview
    oldDates.push(schedule.week[i].date);
    schedule.week[i].date = currentDate.toLocaleDateString();

    //Check for blackouts & playoffs
    if (schedule.week[i].timeSlot.length === 0) {
      let brow = document.createElement('tr');
      body.appendChild(brow);
      brow.appendChild(utils.setCellText(schedule.week[i].weekNum.toString()));
      brow.appendChild(utils.setCellText(currentDate.toLocaleDateString()));
      if (typeof schedule.week[i].message === 'string') {
        brow.appendChild(utils.setCellText(schedule.week[i].message));
      } else {
        brow.appendChild(utils.setCellText(''));
      }
    } else if (schedule.week[i].timeSlot[0].match.length == 0) {
      let brow = document.createElement('tr');
      body.appendChild(brow);
      brow.appendChild(utils.setCellText(schedule.week[i].weekNum.toString()));
      brow.appendChild(utils.setCellText(currentDate.toLocaleDateString()));
      if (typeof schedule.week[i].message === 'string') {
        brow.appendChild(utils.setCellText(schedule.week[i].message));
      } else {
        brow.appendChild(utils.setCellText(''));
      }
    }

    for (let j = 0; j < schedule.week[i].timeSlot.length; j++) {
      for (let k = 0; k < schedule.week[i].timeSlot[j].match.length; k++) {
        //Write each column of the table
        let brow = document.createElement('tr');
        body.appendChild(brow);
        brow.appendChild(utils.setCellText(schedule.week[i].weekNum.toString()));
        brow.appendChild(utils.setCellText(currentDate.toLocaleDateString()));
        if (typeof schedule.week[i].message === 'string') {
          brow.appendChild(utils.setCellText(schedule.week[i].message));
        } else {
          brow.appendChild(utils.setCellText(''));
        }
        brow.appendChild(utils.setCellText(schedule.week[i].timeSlot[j].byeTeams.toString()));
        brow.appendChild(utils.setCellText(schedule.week[i].timeSlot[j].match[k].time.toString()));
        brow.appendChild(utils.setCellText((startCourt + schedule.week[i].timeSlot[j].match[k].court).toString()));
        cell = utils.setCellText(schedule.week[i].timeSlot[j].match[k].team1.toString(), 'A');
        utils.setAttributes(cell,{'onclick':`launchTeamPreview(${schedule.week[i].timeSlot[j].match[k].team1})`,
            'class':"teamCell"});
        brow.appendChild(cell);
        cell = utils.setCellText(schedule.week[i].timeSlot[j].match[k].team2.toString(), 'A');
        utils.setAttributes(cell,{'onclick':`launchTeamPreview(${schedule.week[i].timeSlot[j].match[k].team2})`,
            'class':"teamCell"});
        brow.appendChild(cell);
      }
    }
    //increment the date for a new week
    currentDate.setUTCDate(currentDay + 7);
    currentDay = currentDate.getUTCDate();
  }

  //Before assigning the document fragment, clone it so that it can be placed in two places
  let c2 = c.cloneNode(true);

  //Update the schedule table in step 2
  //remove any previous tables first
  let preview = document.getElementById('schedule_preview');
  if (preview.children.length > 0) {
    //replace instead of appending
    preview.replaceChild(c, preview.children[0]);
  } else {
    //add to the right form
    preview.appendChild(c);
  }
  //update the schedule table in step 5
  //remove any previous tables first
  preview = document.getElementById('scheduleReviewTable');
  if (preview.children.length > 0) {
    //replace instead of appending
    preview.replaceChild(c2, preview.children[0]);
  } else {
    //add to the right form
    preview.appendChild(c2);
  }
  //reset the template with correct dates
  loadedTemplate.set('schedule', schedule);

  //update the team previews with the actual dates now
  loadedTemplate.updateTeamPreview('date', oldDates);
  //Update all the court numbers using the new start court
  loadedTemplate.updateTeamPreview('court', startCourt + 1);
}

/************
**    D    **
************/

//This function draws the dates in the calendar objects passed in as inputs
function drawCalendar(template, startDate) {
  //Get the first month and year of the schedule
  let month = Months[startDate.getUTCMonth()];
  let year = startDate.getUTCFullYear();
  //Get a date object for this month, we need it to find the start and end days
  //of the week
  let thisMonth = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1);
  //Set the header in the calendar as the month and year
  template.querySelector("#currentMonth").innerHTML = month + ' ' + year.toString();
  utils.setAttributes(template.querySelector("#currentMonth"), {
    'date': new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1)
  });

  //Get the pointer to the schedule preview section on step 2
  //Previous month counter to reset
  let schedCalendar = document.getElementById("schedule_date_preview");
  //Also update the calendar object in the final preview
  let finalCalendar = document.getElementById("scheduleReviewCalendar");

  //Find all of the days in the calendar an dloop through them
  let allDays = template.querySelectorAll(".day");
  for (let day = 0; day < allDays.length; day++) {
    //Check if we are in the current month
    if (day < thisMonth.getDay()) {
      //ALso reset the schedule counter properly
      let sd = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), 0);
      schedCalendar.style.counterReset = "previous-month " + (sd.getUTCDate() - thisMonth.getUTCDay()).toString() +
        " current-month next-month";
      finalCalendar.style.counterReset = "previous-month " + (sd.getUTCDate() - thisMonth.getUTCDay()).toString() +
        " current-month next-month";

      //Set the date of this grid cell
      utils.setAttributes(allDays[day], {
        'monthClass': "last",
        'date': new Date(sd.getUTCFullYear(), sd.getUTCMonth(), sd.getUTCDate() - thisMonth.getUTCDay() + day + 1).toLocaleDateString()
      });
    } else if (thisMonth.getUTCMonth() !== startDate.getUTCMonth()) {
      utils.setAttributes(allDays[day], {
        'monthClass': "next",
        'date': thisMonth.toLocaleDateString()
      });
    } else {
      utils.setAttributes(allDays[day], {
        'monthClass': "current",
        'date': thisMonth.toLocaleDateString()
      });
      //Increment the day
      thisMonth.setUTCDate(thisMonth.getUTCDate() + 1);
    }
  }
  //append the calendar object into the appropriate object
  if (schedCalendar.children.length > 0) {
    for (let c = 0; c < schedCalendar.children.length; c++) {
      schedCalendar.replaceChild(document.importNode(template.children[c], true),
        schedCalendar.children[c]);
      finalCalendar.replaceChild(document.importNode(template.children[c], true),
        finalCalendar.children[c]);
    }
  } else {
    schedCalendar.appendChild(document.importNode(template, true));
    finalCalendar.appendChild(document.importNode(template, true));
  }

  //Now update the calendar with the actual play dates
  updateCalendarPreview();
}

/************
**    I    **
************/

//Load the mapping codes and teams from a csv file from sportsengine
function importTeamInfo() {
  let filename = remote.dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{
      name: 'CSV',
      extensions: ['csv']
    }]
  });

  //Import the work workbook
  let wb = xlsx.readFile(filename[0], {
    raw: true
  });

  //Read the csv file, hopefully...
  let teamData = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
    range: "A3:C100"
  });

  //Get the Teams
  teamData = teamData.filter(function(e) {
    return (e["Page Type"] === "Team");
  });

  //get the table data to load this in
  let table = document.getElementById('teamInfoBody');

  //Now for each team, enter the data in the table
  teamData.forEach(function(e, i) {
    let row = table.children[i];
    //Team number
    row.children[0].children[0].setAttribute('value', i + 1);
    //Team Name
    row.children[1].children[0].setAttribute('value', e["Page Title"]);
    //Mapping Code
    row.children[2].children[0].setAttribute('value', e["Mapping Code"]);
  });
  //Update the loaded team information
  updateTeamInfo(true);

}
//Creates the bye request table on panel 4
function initByeRequestTable() {
  //Grab the Team info from step 3
  let teamInfo = document.getElementById('teamInfoBody');
  //Grab the schedule information
  let schedule = loadedTemplate.get('schedule');
  //create document fragment to append to
  let c = document.createDocumentFragment();
  //Create a new table body
  let teamTable = document.createElement('tbody');
  teamTable.id = "teamTableBody";
  c.appendChild(teamTable);
  //List all the teams as a row
  for (let i of teamInfo.children) {
    let row = document.createElement('tr');
    teamTable.appendChild(row);
    let cell = utils.setCellText(i.children[0].children[0].value.toString());
    row.appendChild(cell);
    cell = utils.setCellText(i.children[1].children[0].value.toString());
    row.appendChild(cell);
  }
  //fill in the table
  document.getElementById('teamTable').replaceChild(c, document.getElementById('teamTableBody'));

  //bye table
  let byeTable = document.getElementById('byeRequestTable');
  //Create the bye request table
  c = document.createDocumentFragment();
  //Create a header
  let header = document.createElement('thead');
  header.id = "byeRequestHeader";
  c.appendChild(header);
  row = document.createElement('tr');
  header.appendChild(row);
  row.appendChild(utils.setCellText("Team"));
  //Now put in all of the weeks
  schedule.week.forEach((e) => {
    if (e.timeSlot.length > 0) {
      row.appendChild(utils.setCellText(e.date));
    }
  });
  //replace the header
  byeTable.replaceChild(c, document.getElementById('byeRequestHeader'));

  //replace the previous table with new one
  let body = document.createElement('tbody');
  let addBtn = document.createElement('button');
  body.id = 'byeRequestBody';
  row = document.createElement('tr');
  body.appendChild(row);
  addBtn.id = 'newByeBtn';
  utils.setAttributes(addBtn, {
    'type': "button",
    'onclick': "addByeRow()"
  });
  row.appendChild(addBtn);
  byeTable.replaceChild(body, document.getElementById('byeRequestBody'));
}
//Initialize the calendar object
function initCalendarObject() {
  //Import the template from the html file
  let templates = document.getElementById("calendarTemplate").import;
  //Grab the actual calendar object
  let cal = templates.getElementById("calendarObject");

  //get the start date, and setup the calendar
  let startDate = document.getElementById('start_date').valueAsDate;

  //Get a pointer to the document fragment, so that we can manipulate the data
  let doc = cal.content;

  //Draw the initial month in the calendar objects
  drawCalendar(doc, startDate);
}
//initializes the team information form based on chosen template
function initTeamInfo() {
  let c = document.createDocumentFragment();
  let body = document.createElement('tbody');
  body.setAttribute('id', 'teamInfoBody');
  c.appendChild(body);
  let table = document.getElementById('teamInfoTable');

  //For each team, create a row in the table with appropriate input tags
  loadedTemplate.get('teamPreview').forEach((e, i) => {
    let row = document.createElement('tr');
    let teamInput = document.createElement("INPUT");
    let cell = document.createElement('td');
    utils.setAttributes(teamInput, {
      'onchange': "updateTeamInfo()",
      'type': 'number',
      'min': 1,
      'max': loadedTemplate.get('numTeams'),
      'value': i + 1
    });
    cell.appendChild(teamInput);
    row.appendChild(cell);

    cell = document.createElement('td');
    teamInput = document.createElement("INPUT");
    teamInput.setAttribute('type',"text");
    cell.appendChild(teamInput);
    teamInput.setAttribute('onchange', "updateTeamInfo()");
    row.appendChild(cell);

    cell = document.createElement('td');
    teamInput = document.createElement("INPUT");
    teamInput.setAttribute('type',"text");
    cell.appendChild(teamInput);
    teamInput.setAttribute('onchange', "updateTeamInfo()");
    row.appendChild(cell);
    body.appendChild(row);
  });
  //Replace the body with new info
  table.replaceChild(c, document.getElementById('teamInfoBody'));
}

/************
**    L    **
************/

//Load templates from the Database
function loadTemplateChoices(season) {
  //Find all of the templates currently in the database and sort by id
  db.find({
    season: season
  }).sort({
    season: 1,
    numTeams: 1
  }).exec(function(err, docs) {
    //Loop on each doc, creating a template, building the team preview, and then
    //keeping the copy around
    for (let i = 0; i < docs.length; i++) {
      dbTemplates.push(new Template());
      dbTemplates[i].importFromDatabase(docs[i]);
    }
    //After the for loop we draw the template table
    showTemplateChoices();
  });
}

/************
**    S    **
************/

//re draws the template tool page with all loaded templates from the Database
function showTemplateChoices() {
  //Create a document fragment which makes this faster
  const c = document.createDocumentFragment();
  //Title
  let title = document.createElement("H2");
  title.innerHTML = 'Choose Template';
  c.appendChild(title);
  //Create a table to add to the document
  let table = document.createElement('table');
  c.appendChild(table);
  //Create the header
  let head = document.createElement("thead");
  table.appendChild(head);
  let row = document.createElement("tr");
  for (let h = 0; h < tableLabels.length; h++) {
    //append to rows
    row.appendChild(utils.setCellText(tableLabels[h]));
  }
  head.appendChild(row);

  //New body to Create
  let newBody = document.createElement("tbody");
  //Add to the document fragment
  table.appendChild(newBody);
  //now add rows to the newBody from the dbTemplates structure
  for (let i = 0; i < dbTemplates.length; i++) {
    //add a row
    let row = document.createElement("tr");
    for (let h = 0; h < tableHeaders.length; h++) {
      let cell = document.createElement("td");
      if (h === 0) {
        let btn = document.createElement("input");
        utils.setAttributes(btn, {
          'type': "radio",
          'name': 'selectedTeamplate',
          'onclick': `selectTemplate(${i})`
        });
        //btn.setAttribute('type','radio');
        //btn.setAttribute('name','selectedTemplate');
        //Set data for use and callback function
        //btn.setAttribute('onclick',`selectTemplate(${i})`);
        cell.appendChild(btn);
      } else {
        let text = dbTemplates[i].get(tableHeaders[h]);
        text = text != null ? text.toString() : 'none';
        if (tableHeaders[h]==='numByes')
        {
          text = text.substring(0,4);
        }
        if(boolHeaders.some(e=>{return(e===tableHeaders[h]);}))
        {
          cell.innerHTML = text!='true' ? '&times' : '&#10004';
          utils.setAttributes(cell,{'class':"boolCell","text":text});
        } else
        {
        let celltext = document.createTextNode(text);
        //append to the cell
        cell.appendChild(celltext);
        }
      }
      //append to rows
      row.appendChild(cell);
    }
    //add row to table body
    newBody.appendChild(row);
  }
  //Replace the old table if one already exists
  if (form_step_1.children.length > 0) {
    form_step_1.replaceChild(c, form_step_1.children[0]);
  } else {
    //Now add the new body to the table
    form_step_1.appendChild(c);
  }
  //display the form
  document.getElementById("formDiv").setAttribute('hide', false);
}

/************
**    U    **
************/

//This function will update the calendar object with play dates and blackouts
//for the month
function updateCalendarPreview() {
  //Cycle through each day and set the appropriate properties for play days and off
  //days
  let allDays = document.querySelectorAll(".day");
  let schedule = loadedTemplate.get('schedule');
  let weeks;
  for (let d = 0; d < allDays.length; d++) {
    //Check each week in the schedule to see if it's in the calendar view
    weeks = schedule.week.findIndex(e => {
      return (e.date === allDays[d].getAttribute('date'));
    });
    if (weeks >= 0 && allDays[d].getAttribute('monthClass') === 'current') {
      //This is a play week
      utils.setAttributes(allDays[d], {
        'leagueDay': false,
        'onclick': "toggleBlackout(event)"
      });
      allDays[d].setAttribute('leagueDay', true);
      //check for a blackout
      allDays[d].setAttribute('blackout', schedule.week[weeks].blackout);
    } else {
      utils.setAttributes(allDays[d], {
        'leagueDay': false,
        "blackout": false,
        'onclick': ""
      });
    }
  }
}
//update the loaded team information
function updateTeamInfo(initBye) {
  //find the team info table in the app, and update the internal memory
  let table = document.getElementById('teamInfoBody');

  //Loop through each child (which is the rows) and assign the team information
  for (let t of table.children) {
    let teamNum = t.children[0].children[0].valueAsNumber;
    //Assign team number
    leagueTeamInfo[teamNum - 1].teamNumber = teamNum;
    leagueTeamInfo[teamNum - 1].name = t.children[1].children[0].value;
    leagueTeamInfo[teamNum - 1].mappingCode = t.children[2].children[0].value;

    //Update the team Previews too
    loadedTemplate.get('teamPreview')[teamNum - 1].teamNumber = teamNum;
    loadedTemplate.get('teamPreview')[teamNum - 1].name = leagueTeamInfo[teamNum - 1].name;
  }
  if(initBye){
    //Initialize the bye table
    initByeRequestTable();
  }else {
    //update the bye table
    let teamTable = document.getElementById("teamTableBody");
    for(let r of teamTable.children){
      teamNum = Number(r.children[0].innerHTML);
      r.children[1].innerHTML= leagueTeamInfo[teamNum-1].name;
    }
    //go through each row and reorder the options
    let requests = document.getElementsByClassName('requestTeam');
    let oldcell,cell,lastteam;
    for (let req of requests){
      oldcell = req.getElementsByTagName('select')[0];
      lastteam = oldcell.options[oldcell.selectedIndex].innerHTML;
      cell = document.createElement('select');
      let option;
      loadedTemplate.get('teamPreview').forEach(e => {
          option = document.createElement('option');
          option.value = e.teamNumber;
          option.innerHTML = e.name;
          cell.appendChild(option);
        });
        req.replaceChild(cell,oldcell);
        cell.selectedIndex = leagueTeamInfo.findIndex(e=>{return(e.name===lastteam);});
      }
  }

}
/*****************************************************************************
 *****                                                                   *****
 *****                             Callbacks                             *****
 *****                                                                   *****
 ****************************************************************************/
document.addEventListener('DOMContentLoaded', function(event) {
  //HTML page is loaded, setup defaults
  let d = new Date();
  document.getElementById('start_date').valueAsDate = new Date();
});

function addByeRow() {
  //Grab the schedule information
  let schedule = loadedTemplate.get('schedule');
  //Get the body of the table
  let body = document.getElementById("byeRequestBody");

  let row = document.createElement('tr');

  //Add a class for formatting
  row.className = 'requestTeam';

  //Add a select input for the team name
  let cell = document.createElement('select');
  let option;
  loadedTemplate.get('teamPreview').forEach(e => {
    option = document.createElement('option');
    option.value = e.teamNumber;
    option.innerHTML = e.name;
    cell.appendChild(option);
  });

  row.appendChild(cell);

  //Add a toggle input for each week
  schedule.week.forEach((e) => {
    //Check for blackouts
    if (e.timeSlot.length > 0) {
      cell = document.createElement('td');
      let input = document.createElement("button");
      //set the class
      input.className = 'byeRequestCell';
      utils.setAttributes(input, {
        'type': "button",
        'onclick': "toggleByeType(event)",
        'byeType': 0,
        'date': e.date
      });
      input.id = "team" + (body.children.length).toString() + "week" +
        e.weekNum.toString();
      cell.appendChild(input);

      //add a label that will format this nicely
      //let cellLabel = document.createElement("label");
      //cellLabel.for = input.id;
      //cell.appendChild(cellLabel);
      row.appendChild(cell);
    }
  });
  //inssert the row
  body.insertBefore(row, document.getElementById('newByeBtn').parentNode);
  if (body.children.length>loadedTemplate.get('teamPreview').length){
    document.getElementById('newByeBtn').disabled = true;
  }
}

function launchTeamPreview(teamNum) {
  //Tell the main thread to launch a preview window
  ipcRenderer.send('launch-team-preview', loadedTemplate.get('teamPreview'), teamNum);
}

function nextStep() {
  //find which step is currently checked
  let button = document.querySelectorAll('.formPanel input[name="stage"]');
  let step = Array.from(button).findIndex(e => {
    return (e.checked);
  });
  step += 1;
  if (step === 4) {
    step = 4;
    let nextBtn = document.getElementById("nextButton");
    nextBtn.innerHTML = "<span> Submit</span>";
  } else if (step > 4) {
    step = 4;
    document.getElementById("nextButton").setAttribute('type', "submit");
  } else {
    let nextBtn = document.getElementById("nextButton");
    nextBtn.innerHTML = "<span>Next</span>";
    nextBtn.setAttribute('type', "button");
  }
  button.item(step).checked = "checked";
}

function outputSchedule() {
  //Creates the sportsengine formatted schedule
  let outputData = "Start_Date,Start_Time,End_Date,End_Time," +
    "Event_Type,Team1_ID,Team1_Is_Home,Team2_ID,Location";
  //bye table info
  let byeData = "Week,Date,Message,Bye,Time";

  //Get the schedule
  const schedule = loadedTemplate.get('schedule');
  //Temp variables needed in the loop
  let week, match, msg, bye;
  //Build the rest of the schedule from the finalized schedule
  for (let w = 0; w < schedule.week.length; w++) {
    week = schedule.week[w].date;
    msg = schedule.week[w].message;
    if (typeof msg === 'undefined') {
      msg = " ";
    }
    for (let t = 0; t < schedule.week[w].timeSlot.length; t++) {
      bye = schedule.week[w].timeSlot[t].byeTeams;
      //Replace with the team names
      for (let m = 0; m < schedule.week[w].timeSlot[t].match.length; m++) {
        match = schedule.week[w].timeSlot[t].match[m];
        //add the match in sports engine format
        outputData = outputData.concat('\n', getScheduleString(week, match.time, leagueTeamInfo[match.team1 - 1].mappingCode,
          leagueTeamInfo[match.team2 - 1].mappingCode, match.court));
        //bye table information
        byeData = byeData.concat('\n', getByeTableString(w + 1, week, msg, bye, match.time));
      }
    }
  }
  console.log(outputData);
  //Open a file dialog to determine the output file
  let filename = dialog.showSaveDialog({
    filters: [{
      name: 'CSV',
      extensions: ['csv']
    }]
  });

  if (typeof filename === 'undefined') {
    return;
  }
  //Write all of the data at once
  fs.writeFile(filename, outputData, function(err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
      console.log(filename);
      return;
    } else {
      console.log('It\'s saved!');
    }
  });

  filename = filename.replace('.csv', '_ByeTable.csv');
  //Write all of the data at once
  fs.writeFile(filename, byeData, function(err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
      console.log(filename);
      return;
    } else {
      console.log('It\'s saved!');
    }
  });

  location.reload();
}

function selectTemplate(dbIndex) {
  //The template index is passed in this callback. Load the template and Initialize
  //all the other form entries
  loadedTemplate = dbTemplates[dbIndex].copy();
  let teamPreview = loadedTemplate.get('teamPreview');
  //Copy the team preview over as the team info
  for (let i = 0; i < teamPreview.length; i++) {
    leagueTeamInfo.push(new TeamInfo());
    teamPreview[i].copy(leagueTeamInfo[i]);
  }
  document.getElementById('scheduleName').innerHTML = loadedTemplate.get('title');
  buildScheduleTable();
  //setup the team info stage
  initTeamInfo();
  //Create the bye requests table
  initByeRequestTable();
  //Initialize the calendar object in the schedule preview of step 2
  initCalendarObject();
}

function setChecked(id) {
  let button = document.getElementById(id);
  button.setAttribute('checked', true);
  //Also do next step
  let step = Number(button.labels[0].innerText);
  if (step === 5) {
    let nextBtn = document.getElementById("nextButton");
    nextBtn.innerHTML = "<span>Submit</span>";
    nextBtn.setAttribute('type', "button");
  } else {
    let nextBtn = document.getElementById("nextButton");
    nextBtn.innerHTML = "<span>Next</span>";
    nextBtn.setAttribute('type', "button");
  }
}

function toggleByeType(event) {
  let byeType;
  let btn = event.srcElement;
  if (!btn.disabled) {
    byeType = Number(btn.getAttribute('byeType'));
    byeType = byeType + 1;
    if (byeType > 2) {
      byeType = 0;
    }
    btn.setAttribute('byeType', byeType);
  }
}

function toggleBlackout(event) {
  //Toggle the blackout value
  event.srcElement.setAttribute('blackout', event.srcElement.getAttribute('blackout') !== "true");

  //check if its a blackout
  if (event.srcElement.getAttribute('blackout') !== "true") {
    loadedTemplate.removeBlackout(event.srcElement.getAttribute('date'));
  } else {
    loadedTemplate.addBlackout(event.srcElement.getAttribute('date'));
  }

  //Update the schedule
  buildScheduleTable();

  //update bye request
  initByeRequestTable();

  //update the calendar
  updateCalendarPreview();
}

function updateMonth(offset) {
  //Get the current month
  let thisDate = new Date(document.getElementById("schedule_date_preview").querySelector("#currentMonth").getAttribute('date'));

  //Add in the offset value and then redraw the calendar
  console.log(thisDate);
  thisDate.setUTCMonth(thisDate.getUTCMonth() + offset);

  //Now we just update both calendars
  drawCalendar(document.getElementById("schedule_date_preview"), thisDate);
  drawCalendar(document.getElementById("scheduleReviewCalendar"), thisDate);
}
/*****************************************************************************
 *****                                                                   *****
 *****                             Utilities                             *****
 *****                                                                   *****
 ****************************************************************************/
//Create sports engine .csv string
function getScheduleString(week, time, team1, team2, court) {
  return (`${week},${time},${week},${time},Game,${team1},1,${team2},Court ${court}`);
}
//Create bye table
function getByeTableString(week, date, msg, bye, time) {
  let byeString = ' ';
  if (bye.length > 0) {
    byeString = leagueTeamInfo[bye[0] - 1].name;
    for (let b = 1; b < bye.length; b++) {
      byeString.concat(',', leagueTeamInfo[bye[b] - 1].name);
    }
  }

  return (`${week},${date},${msg},${byeString},${time}`);
}
