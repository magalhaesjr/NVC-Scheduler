//This file is the main scheduling function. It will handle all of the scheduling
//specific functions

//need the remote library for electron function references in the main thread
const {remote,ipcRenderer} = require('electron');
//Database
const Datastore = require('nedb');
//Template info
const Template = require('./template').Template;
const TeamInfo = require('./template').TeamInfo;
//csv reading
const xlsx = require('xlsx');
const utils = require('./util.js');

//Autoload the database
let db = new Datastore({ filename: 'database/Templates.db', autoload: true });

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
const tableHeaders = ['select','title','season','numTeams','numCourts','numWeeks','numByes',
'minMatches','balanced','equalMatches','hasPools','description'];
//Headers in the schedule table
const Headers = ['Week','Date','Message','Bye','Time','Court','Team 1','Team 2'];
//Months as strings
const Months = ['January','February','March','April','May','June','July','August',
'September','October','November','December'];

/*****************************************************************************
 *****                                                                   *****
 *****                        Main Thread Comms                          *****
 *****                                                                   *****
 ****************************************************************************/
//Load templates
ipcRenderer.on('start-template-schedule',(e,season)=>{
  //set the html pages displays correctly
  document.getElementsByClassName('stages')[0].setAttribute('hide',false);
  document.getElementById("one").setAttribute('checked',"checked");

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
  //Title
  let title = document.createElement("H1");
  title.innerHTML = 'Choose Template';
  c.appendChild(title);
  //Create a table to add to the document
  let table = document.createElement('table');
  c.appendChild(table);
  //Create the header
  let head = document.createElement("thead");
  table.appendChild(head);
  let row = document.createElement("tr");
  for(let h=0;h<tableHeaders.length;h++){
    //append to rows
    row.appendChild(utils.setCellText(tableHeaders[h]));
  }
  head.appendChild(row);

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
      if(h===0){
        let btn = document.createElement("input");
        utils.setAttributes(btn,{'type':"radio",'name':'selectedTeamplate',
          'onclick':`selectTemplate(${i})`});
        //btn.setAttribute('type','radio');
        //btn.setAttribute('name','selectedTemplate');
        //Set data for use and callback function
        //btn.setAttribute('onclick',`selectTemplate(${i})`);
        cell.appendChild(btn);
      }else{
      let text = dbTemplates[i].get(tableHeaders[h]);
      let celltext = document.createTextNode(text!=null?text.toString():'none');
      //append to the cell
      cell.appendChild(celltext);
      }
      //append to rows
      row.appendChild(cell);
    }
    //add row to table body
    newBody.appendChild(row);
  }
  //Replace the old table if one already exists
  if(form_step_1.children.length>0){
    form_step_1.replaceChild(c,form_step_1.children[0]);
  }else{
    //Now add the new body to the table
    form_step_1.appendChild(c);
  }
  //display the form
  document.getElementById("formDiv").setAttribute('hide',false);
}

//Displays the whole schedule in table form for a preview
function buildScheduleTable(){
  //Get the schedule from the current template
  let schedule = loadedTemplate.get('schedule');
  //Starting date
  let currentDate = document.getElementById('start_date').valueAsDate;
  //set the start date as a day
  let currentDay = currentDate.getUTCDate();
  currentDate.setUTCDate(currentDay); //silly timezone bullshit
  //Starting court number
  let startCourt = document.getElementById('start_court').valueAsNumber-1;

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
  Headers.forEach((text)=>{row.appendChild(utils.setCellText(text));},row);

  //Old dates
  let oldDates = [];
  let cell;

  let body = document.createElement('tbody');
  table.appendChild(body);
  //Now we loop through the template and build the table
  for(let i=0;i<schedule.week.length;i++){
    //While we're doing this, lets update each date in the schedule preview
    oldDates.push(schedule.week[i].date);
    schedule.week[i].date = currentDate.toLocaleDateString();
    for(let j=0;j<schedule.week[i].timeSlot.length;j++){
      for(let k=0;k<schedule.week[i].timeSlot[j].match.length;k++){
        //Write each column of the table
        let brow = document.createElement('tr');
        body.appendChild(brow);
        brow.appendChild(utils.setCellText(schedule.week[i].weekNum.toString()));
        brow.appendChild(utils.setCellText(currentDate.toLocaleDateString()));
        if(typeof schedule.week[i].message==='string'){
          brow.appendChild(utils.setCellText(schedule.week[i].message));
        }else {brow.appendChild(utils.setCellText(''));}
        brow.appendChild(utils.setCellText(schedule.week[i].timeSlot[j].byeTeams.toString()));
        brow.appendChild(utils.setCellText(schedule.week[i].timeSlot[j].match[k].time.toString()));
        brow.appendChild(utils.setCellText((startCourt+schedule.week[i].timeSlot[j].match[k].court).toString()));
        cell = utils.setCellText(schedule.week[i].timeSlot[j].match[k].team1.toString(),'A');
        cell.setAttribute('onclick',`launchTeamPreview(${schedule.week[i].timeSlot[j].match[k].team1})`);
        brow.appendChild(cell);
        cell = utils.setCellText(schedule.week[i].timeSlot[j].match[k].team2.toString(),'A');
        cell.setAttribute('onclick',`launchTeamPreview(${schedule.week[i].timeSlot[j].match[k].team2})`);
        brow.appendChild(cell);
      }
    }
    //increment the date for a new week
    currentDate.setUTCDate(currentDay+7);
    currentDay = currentDate.getUTCDate();
  }

  //Before assigning the document fragment, clone it so that it can be placed in two places
  let c2 = c.cloneNode(true);

  //Update the schedule table in step 2
  //remove any previous tables first
  let preview = document.getElementById('schedule_preview');
  if (preview.children.length>0){
    //replace instead of appending
    preview.replaceChild(c,preview.children[0]);
  }else{
    //add to the right form
    preview.appendChild(c);
  }
  //update the schedule table in step 5
  //remove any previous tables first
  preview = document.getElementById('scheduleReviewTable');
  if (preview.children.length>0){
    //replace instead of appending
    preview.replaceChild(c2,preview.children[0]);
  }else{
    //add to the right form
    preview.appendChild(c2);
  }
  //reset the template with correct dates
  loadedTemplate.set('schedule',schedule);

  //update the team previews with the actual dates now
  loadedTemplate.updateTeamPreview('date',oldDates);
  //Update all the court numbers using the new start court
  loadedTemplate.updateTeamPreview('court',startCourt+1);
}

//initializes the team information form based on chosen template
function initTeamInfo(){
  let c = document.createDocumentFragment();
  let body = document.createElement('tbody');
  body.setAttribute('id','teamInfoBody');
  c.appendChild(body);
  let table = document.getElementById('teamInfoTable');

  //For each team, create a row in the table with appropriate input tags
  loadedTemplate.get('teamPreview').forEach((e,i)=>{
    let row = document.createElement('tr');
    let teamInput = document.createElement("INPUT");
    utils.setAttributes(teamInput,{'onchange':"updateTeamInfo()",'type':'number',
      'min':1,'max':loadedTemplate.get('numTeams'),'value':i+1});
    row.appendChild(document.createElement('td').appendChild(teamInput));
    teamInput = document.createElement("INPUT");
    teamInput.setAttribute('onchange',"updateTeamInfo()");
    row.appendChild(document.createElement('td').appendChild(teamInput));
    teamInput = document.createElement("INPUT");
    teamInput.setAttribute('onchange',"updateTeamInfo()");
    row.appendChild(document.createElement('td').appendChild(teamInput));
    body.appendChild(row);
  });
  //Replace the body with new info
  table.replaceChild(c,document.getElementById('teamInfoBody'));
}

//Creates the bye request table on panel 4
function initByeRequestTable(){
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
  for(let i of teamInfo.children){
    let row = document.createElement('tr');
    teamTable.appendChild(row);
    let cell = utils.setCellText(i.children[1].value.toString());
    cell.setAttribute('draggable',true);
    row.appendChild(cell);
  }
  //fill in the table
  document.getElementById('teamTable').replaceChild(c,document.getElementById('teamTableBody'));

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
  schedule.week.forEach((e)=> row.appendChild(utils.setCellText(e.date)));
  //replace the header
  byeTable.replaceChild(c,document.getElementById('byeRequestHeader'));

  //replace the previous table with new one
  let body = document.createElement('tbody');
  body.id = 'byeRequestBody';
  byeTable.replaceChild(body,document.getElementById('byeRequestBody'));

  //Now add a blank row for the first draggable team
  addDragRow(body);
}

//Load the mapping codes and teams from a csv file from sportsengine
function importTeamInfo(){
  let filename = remote.dialog.showOpenDialog({ properties: [ 'openFile'], filters: [{ name: 'CSV', extensions: ['csv'] }]});

  //Import the work workbook
  let wb = xlsx.readFile(filename[0],{raw: true});

  //Read the csv file, hopefully...
  let teamData = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{range:"A3:C100"});

  //Get the Teams
  teamData = teamData.filter(function(e){return(e["Page Type"]==="Team");});

  //get the table data to load this in
  let table = document.getElementById('teamInfoBody');

  //Now for each team, enter the data in the table
  teamData.forEach(function(e,i){
    let row = table.children[i];
    //Team number
    row.children[0].setAttribute('value',i+1);
    //Team Name
    row.children[1].setAttribute('value',e["Page Title"]);
    //Mapping Code
    row.children[2].setAttribute('value',e["Mapping Code"]);
  });
  //Update the loaded team information
  updateTeamInfo();
}
//assign team numbers
function assignTeamNumbers(){
  //Get the team info table
  let table = document.getElementById('teamInfoBody');

  //For now, do nothing
}
//update the loaded team information
function updateTeamInfo(){
  //find the team info table in the app, and update the internal memory
  let table = document.getElementById('teamInfoBody');

  //Loop through each child (which is the rows) and assign the team information
  for(let t of table.children){
    let teamNum = t.children[0].valueAsNumber;
    //Assign team number
    leagueTeamInfo[teamNum-1].teamNumber = teamNum;
    leagueTeamInfo[teamNum-1].name = t.children[1].getAttribute('value');
    leagueTeamInfo[teamNum-1].mappingCode = t.children[2].getAttribute('value');

    //Update the team Previews too
    loadedTemplate.get('teamPreview')[teamNum-1].teamNumber = teamNum;
    loadedTemplate.get('teamPreview')[teamNum-1].name = leagueTeamInfo[teamNum-1].name;
  }

  //Update the bye table
  initByeRequestTable();
}
//Initialize the calendar object
function initCalendarObject(){
  //Import the template from the html file
  let templates = document.getElementById("calendarTemplate").import;
  //Grab the actual calendar object
  let cal = templates.getElementById("calendarObject");

  //get the start date, and setup the calendar
  let startDate = document.getElementById('start_date').valueAsDate;

  //Get a pointer to the document fragment, so that we can manipulate the data
  let doc = cal.content;

  //Draw the initial month in the calendar objects
  drawCalendar(doc,startDate);

  //Now update the calendar with the actual play dates
  updateCalendarPreview();
}
//This function draws the dates in the calendar objects passed in as inputs
function drawCalendar(template,startDate){
  //Get the first month and year of the schedule
  let month = Months[startDate.getUTCMonth()];
  let year = startDate.getUTCFullYear();
  //Get a date object for this month, we need it to find the start and end days
  //of the week
  let thisMonth = new Date(startDate.getUTCFullYear(),startDate.getUTCMonth(),1);
  //Set the header in the calendar as the month and year
  template.querySelector("#currentMonth").innerHTML = month + ' ' + year.toString();
  utils.setAttributes(template.querySelector("#currentMonth"),{'date':
    new Date(startDate.getUTCFullYear(),startDate.getUTCMonth(),1)});

  //Get the pointer to the schedule preview section on step 2
  //Previous month counter to reset
  let schedCalendar = document.getElementById("schedule_date_preview");
  //Also update the calendar object in the final preview
  let finalCalendar = document.getElementById("scheduleReviewCalendar");

  //Find all of the days in the calendar an dloop through them
  let allDays = template.querySelectorAll(".day");
  for (let day=0;day<allDays.length;day++){
    //Check if we are in the current month
    if(day<thisMonth.getDay()){
      //ALso reset the schedule counter properly
      let sd = new Date(startDate.getUTCFullYear(),startDate.getUTCMonth(),0);
      schedCalendar.style.counterReset = "previous-month " + (sd.getUTCDate()-thisMonth.getUTCDay()).toString() +
        " current-month next-month";
      finalCalendar.style.counterReset = "previous-month " + (sd.getUTCDate()-thisMonth.getUTCDay()).toString() +
          " current-month next-month";

      //Set the date of this grid cell
      utils.setAttributes(allDays[day],{'monthClass':"last",'date':
        new Date(sd.getUTCFullYear(),sd.getUTCMonth(),sd.getUTCDate()-thisMonth.getUTCDay()+day).toLocaleDateString()});
    }
    else if (thisMonth.getUTCMonth()!==startDate.getUTCMonth()){
      utils.setAttributes(allDays[day],{'monthClass':"next",'date':thisMonth.toLocaleDateString()});
    }
    else{
      utils.setAttributes(allDays[day],{'monthClass':"current",'date':thisMonth.toLocaleDateString()});
      //Increment the day
      thisMonth.setUTCDate(thisMonth.getUTCDate()+1);
    }
  }
  //append the calendar object into the appropriate object
  if (schedCalendar.children.length>0){
    for(let c=0;c<schedCalendar.children.length;c++){
      schedCalendar.replaceChild(document.importNode(template.children[c],true),
        schedCalendar.children[c]);
      finalCalendar.replaceChild(document.importNode(template.children[c],true),
        finalCalendar.children[c]);
    }
  } else {
    schedCalendar.appendChild(document.importNode(template,true));
    finalCalendar.appendChild(document.importNode(template,true));
  }
}

//This function will update the calendar object with play dates and blackouts
//for the month
function updateCalendarPreview(){
  //Cycle through each day and set the appropriate properties for play days and off
  //days
  let allDays = document.querySelectorAll(".day");
  let schedule = loadedTemplate.get('schedule');
  let weeks;
  for(let d = 0;d<allDays.length;d++){
    //Check each week in the schedule to see if it's in the calendar view
    weeks = schedule.week.findIndex(e=>{return(e.date===allDays[d].getAttribute('date'));});
    if(weeks>=0){
      //This is a play week
      utils.setAttributes(allDays[d],{'leagueDay':false,'onclick':"toggleBlackout(event)"});
      allDays[d].setAttribute('leagueDay',true);
    }else{
      utils.setAttributes(allDays[d],{'leagueDay':false,"blackout":false,
        'onclick':""});
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
function selectTemplate(dbIndex){
  //The template index is passed in this callback. Load the template and Initialize
  //all the other form entries
  loadedTemplate = dbTemplates[dbIndex].copy();
  let teamPreview = loadedTemplate.get('teamPreview');
  //Copy the team preview over as the team info
  for(let i=0;i<teamPreview.length;i++){
    leagueTeamInfo.push(new TeamInfo());
    teamPreview[i].copy(leagueTeamInfo[i]);
  }
  document.getElementById('scheduleName').innerHTML=loadedTemplate.get('title');
  buildScheduleTable();
  //setup the team info stage
  initTeamInfo();
  //Create the bye requests table
  initByeRequestTable();
  //Initialize the calendar object in the schedule preview of step 2
  initCalendarObject();
}
function setChecked(id){
  document.getElementById(id).setAttribute('checked',true);
  //Also do next step
  let button = document.querySelectorAll('.formPanel input[name="stage"]');
  let step = Array.from(button).findIndex(e=>{return(e.checked);});
  if (step===4){
    let nextBtn = document.getElementById("nextButton");
    nextBtn.innerHTML = "Submit";
    nextBtn.setAttribute('type',"button");
  } else{
    let nextBtn = document.getElementById("nextButton");
    nextBtn.innerHTML = "Next";
    nextBtn.setAttribute('type',"button");
  }
}
function addDragRow(handle){
  let row = document.createElement('tr');
  //Grab the schedule information
  let schedule = loadedTemplate.get('schedule');

  //Add a blank for the team name
  row.appendChild(document.createElement('td'));

  //Add a toggle input for each week (but disabled for now)
  schedule.week.forEach(()=>{
    let cell = document.createElement('td');
    let input = document.createElement("button");
    input.disabled = true;
    //set the class
    input.class = 'byeRequestCell';
    input.byeType = 0;
    input.onClick = "toggleByeType()";
    cell.appendChild(input);
    row.appendChild(cell);});
  handle.appendChild(row);
}
function toggleByeType(){
  if (!this.disabled){
    this.byeType++;
    if(this.byeType>2){this.byeType=0;}
  }
}
function launchTeamPreview(teamNum){
  //Tell the main thread to launch a preview window
  ipcRenderer.send('launch-team-preview',loadedTemplate.get('teamPreview'),teamNum);
}
function nextStep(){
  //find which step is currently checked
  let button = document.querySelectorAll('.formPanel input[name="stage"]');
  let step = Array.from(button).findIndex(e=>{return(e.checked);});
  step+=1;
  if (step===4){
    step = 4;
    let nextBtn = document.getElementById("nextButton");
    nextBtn.innerHTML = "Submit";
  }else if(step>4){
    step = 4;
    document.getElementById("nextButton").setAttribute('type',"submit");
  }else{
    let nextBtn = document.getElementById("nextButton");
    nextBtn.innerHTML = "Next";
    nextBtn.setAttribute('type',"button");
  }
  button.item(step).checked = "checked";
}
function outputSchedule(event){
  //Creates the sportsengine formatted schedule
  alert("done!");
  location.reload();
}
function toggleBlackout(event){
  //Toggle the blackout value
  event.srcElement.setAttribute('blackout',event.srcElement.getAttribute('blackout')!=="true");

  //check if its a blackout


}
