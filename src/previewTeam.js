//includes
const {remote,ipcRenderer} = require('electron');
const utils = require('./util.js');

/*****************************************************************************
 *****                                                                   *****
 *****                       Global Variables                            *****
 *****                                                                   *****
 ****************************************************************************/
//All the templates extracted from the Database
let teamPreviews;
let loadedPreview;

/*****************************************************************************
 *****                                                                   *****
 *****                        Main Thread Comms                          *****
 *****                                                                   *****
 ****************************************************************************/
//get new team preview and index to display
ipcRenderer.on('init-team-preview',(e,teamPreview,teamNum)=>{
  //Set the new team preview
  teamPreviews = teamPreview;
  console.log('relaunching...');
  //Now set the team to displays
  displayPreview(teamNum);
});
//Just update the team number
ipcRenderer.on('update-team-preview',(e,teamNum)=>{
  //Now set the team to displays
  displayPreview(teamNum);
});

/*****************************************************************************
 *****                                                                   *****
 *****                             Functions                             *****
 *****                                                                   *****
 ****************************************************************************/
 function displayPreview(teamNum)
 {
   //Change the loaded preview
   loadedPreview = teamPreviews[teamNum-1];

   //create a document fragment which makes this faster
   const c = document.createDocumentFragment();

   //Now find the body, which we will replace later
   const table = document.getElementById("previewTable");

   //create a new body
   let body = document.createElement('tbody');
   body.setAttribute('id',"previewTableBody");
   //append to document fragment
   c.appendChild(body);

   //Change the title
   document.getElementById('teamNameTag').innerHTML=loadedPreview.name.toString();

   //Now we create all of the rows and information
   let row = document.createElement('tr');
   body.appendChild(row);
   //team number
   row.appendChild(utils.setCellText('Team Number'));
   row.appendChild(utils.setCellText(loadedPreview.teamNumber.toString()));
   //Bye Weeks
   row = document.createElement('tr');
   body.appendChild(row);
   row.appendChild(utils.setCellText('Bye Weeks'));
   loadedPreview.byeWeeks.forEach((e)=>row.appendChild(utils.setCellText(e)));
   //bye times
   row = document.createElement('tr');
   body.appendChild(row);
   row.appendChild(utils.setCellText('Bye Times'));
   loadedPreview.byeTimes.forEach((e)=>row.appendChild(utils.setCellText(e)));
   //bye Requests
   row = document.createElement('tr');
   body.appendChild(row);
   row.appendChild(utils.setCellText('Bye Requests'));
   loadedPreview.byeRequests.forEach((e)=>row.appendChild(utils.setCellText(e)));
   //play weeks
   row = document.createElement('tr');
   body.appendChild(row);
   row.appendChild(utils.setCellText('Play Weeks'));
   loadedPreview.playWeek.forEach((e)=>row.appendChild(utils.setCellText(e)));
   //Court
   row = document.createElement('tr');
   body.appendChild(row);
   row.appendChild(utils.setCellText('Court'));
   loadedPreview.court.forEach((e)=>row.appendChild(utils.setCellText(e.toString())));
   //Play Times
   row = document.createElement('tr');
   body.appendChild(row);
   row.appendChild(utils.setCellText('Time'));
   loadedPreview.time.forEach((e)=>row.appendChild(utils.setCellText(e)));
   //Opponents
   row = document.createElement('tr');
   body.appendChild(row);
   row.appendChild(utils.setCellText('Opponent'));
   loadedPreview.opponents.forEach((e,i)=>{
     let cell = utils.setCellText(e.toString(),'A');
     cell.setAttribute('onclick',`displayPreview(${e})`);
     row.appendChild(cell);});

   console.log('replaced');
   //replace the body with the new Content
   table.replaceChild(c,document.getElementById('previewTableBody'));
   console.log('done');
 }
