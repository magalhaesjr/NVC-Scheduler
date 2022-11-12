/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-use-before-define */
// This file is the main scheduling function. It will handle all of the scheduling
// specific functions

// Import classes and functions from other files
import { Template, TeamInfo } from './template';
import Calendar from './calendar';
import * as utils from './util';

/*
 *****************************************************************************
 *****                                                                   *****
 *****                       Global Variables                            *****
 *****                                                                   *****
 *****************************************************************************
 */
// All the templates extracted from the Database
let dbTemplates = [];
// Loaded template
let loadedTemplate;
// Completed team information
const leagueTeamInfo = [];

// variables to put in the table
const tableHeaders = [
  'select',
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
const tableLabels = [
  'Select',
  'Title',
  'Season',
  'Teams',
  'Cts',
  'Weeks',
  'Byes',
  'MinGames',
  'Balanced',
  'Equal',
  'Pools',
  'Description',
];

// Columns that are booleans
const boolHeaders = ['balanced', 'equalMatches', 'hasPools'];
// Headers in the schedule table
const Headers = ['Week', 'Date', 'Message', 'Bye', 'Time', 'Court', 'T1', 'T2'];
// Months as strings
const Months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
/** ***************************************************************************
 *****                                                                   *****
 *****                             Functions                             *****
 *****                                                                   *****
 *************************************************************************** */

/** **********
 **    A    **
 *********** */

// assign team numbers
export function assignTeamNumbers() {
  // find all of the bye request rows
  const requests = document.getElementsByClassName('requestTeam');

  // Team Previews
  const teamPreviews = loadedTemplate.get('teamPreview');
  const schedule = loadedTemplate.get('schedule');

  // Initial cost for missed byes
  const costWeights = Array.from(Array(teamPreviews.length), () =>
    Array(schedule.week.length).fill(0)
  );
  let costPrimary;
  const costSecondary = 5;
  const costStep = 0.1;

  // Vars for the loops
  let teamNumber;
  let cell;
  let byes;
  let preview;
  let req;
  let weekInd;

  // Loop on all of the requests and add them to the team preview
  for (let r = 0; r < requests.length; r += 1) {
    req = requests[r];
    // Find which team this is
    cell = req.getElementsByTagName('select');
    teamNumber = Number(cell[0].options[cell[0].selectedIndex].value);

    // Pull the team preview
    preview = loadedTemplate.get('teamPreview')[teamNumber - 1];
    // Reset bye requests
    preview.byeRequests = [];

    // Initial cost for a primary bye request
    costPrimary = 10 - r * costStep;

    // Now find all of the bye requests
    byes = req.getElementsByClassName('byeRequestCell');
    for (let c = 0; c < byes.length; c += 1) {
      const b = byes[c];
      // if bye type is >0 then add it to the team's bye request
      if (Number(b.getAttribute('byeType')) === 1) {
        preview.byeRequests.push(b.getAttribute('date'));
        // find week index
        weekInd = schedule.week.findIndex((e) => {
          return e.date === b.getAttribute('date');
        });
        // fill in the cost weights
        costWeights[teamNumber - 1][weekInd] = costPrimary;
        costPrimary -= requests.length * costStep;
      } else if (Number(b.getAttribute('byeType')) === 2) {
        preview.byeRequests.push(b.getAttribute('date'));
        // fill in the cost weights
        costWeights[teamNumber - 1][weekInd] = costSecondary;
      }
    }
  }

  // Now that we have all the requests and costs, fill in the Assignment Cost
  // matrix for the assignment algorithm
  const costMatrix = Array.from(Array(teamPreviews.length), () =>
    Array(teamPreviews.length).fill(0)
  );
  let localCost;

  // For copying the bye requests properly
  const oldRequest = [];

  for (let t = 0; t < teamPreviews.length; t += 1) {
    oldRequest.push(teamPreviews[t].byeRequests);
  }

  for (let w = 0; w < schedule.week.length; w += 1) {
    // Don't do this for a blackout obviously
    if (!schedule.week[w].blackout) {
      // loop through each team number
      for (let t = 0; t < teamPreviews.length; t += 1) {
        // if the team has a bye on this night, then the cost is 0, otherwise Pull
        // the cost from the cost weights calculated in the requests
        byes = schedule.week[w].timeSlot.filter((e) => {
          return e.byeTeams.some((ei) => {
            return ei === teamPreviews[t].teamNumber;
          });
        });
        localCost =
          (schedule.week[w].timeSlot.length - byes.length) /
          schedule.week[w].timeSlot.length;
        // Add to total cost
        for (let r = 0; r < teamPreviews.length; r += 1) {
          costMatrix[r][t] += localCost * costWeights[r][w];
        }
      }
    }
  }

  // Evaluate the algorithm
  window.api
    .assignTeams(costMatrix)
    .then((teamInd) => {
      // Update the Team info table, and then do the updates from there
      const table = document.getElementById('teamInfoBody');
      for (let r = 0; r < table.children.length; r += 1) {
        // change the team name to the new one
        table.children[teamInd[r][1]].children[1].children[0].value =
          leagueTeamInfo[r].name;
        table.children[teamInd[r][1]].children[2].children[0].value =
          leagueTeamInfo[r].mappingCode;

        teamPreviews[teamInd[r][1]].byeRequests = oldRequest[r];
      }

      return updateTeamInfo();
    })
    .catch((reason) => {
      console.error(reason);
    });
}

/** **********
 **    B    **
 *********** */

// Displays the whole schedule in table form for a preview
export function buildScheduleTable() {
  if (loadedTemplate === null) {
    console.error('no loaded templates');
    return;
  }
  // Get the schedule from the current template
  const schedule = loadedTemplate.get('schedule');

  // Starting date
  let currentDate = new Date(document.getElementById('start_date').value);
  currentDate = new Date(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate(),
    currentDate.getUTCHours(),
    currentDate.getUTCMinutes()
  );
  // set the start date as a day
  let currentDay = currentDate.getUTCDate();
  // Starting court number
  const startCourt = document.getElementById('start_court').valueAsNumber - 1;

  // Initialize the html fragment to write to
  const c = document.createDocumentFragment();
  // Write a header
  const table = document.createElement('table');
  c.appendChild(table);
  const header = document.createElement('thead');
  table.appendChild(header);
  // Write the headers
  const row = document.createElement('tr');
  header.appendChild(row);
  Headers.forEach((text) => {
    row.appendChild(utils.setCellText(text));
  }, row);

  // Old dates
  const oldDates = [];
  let cell;

  const body = document.createElement('tbody');
  table.appendChild(body);
  // Now we loop through the template and build the table
  for (let i = 0; i < schedule.week.length; i += 1) {
    // While we're doing this, lets update each date in the schedule preview
    oldDates.push(schedule.week[i].date);
    schedule.week[i].date = currentDate.toLocaleDateString();

    // Check for blackouts & playoffs
    if (schedule.week[i].timeSlot.length === 0) {
      const brow = document.createElement('tr');
      body.appendChild(brow);
      brow.appendChild(utils.setCellText(schedule.week[i].weekNum.toString()));
      brow.appendChild(utils.setCellText(currentDate.toLocaleDateString()));
      if (typeof schedule.week[i].message === 'string') {
        brow.appendChild(utils.setCellText(schedule.week[i].message));
      } else {
        brow.appendChild(utils.setCellText(''));
      }
    } else if (schedule.week[i].timeSlot[0].match.length === 0) {
      const brow = document.createElement('tr');
      body.appendChild(brow);
      brow.appendChild(utils.setCellText(schedule.week[i].weekNum.toString()));
      brow.appendChild(utils.setCellText(currentDate.toLocaleDateString()));
      if (typeof schedule.week[i].message === 'string') {
        brow.appendChild(utils.setCellText(schedule.week[i].message));
      } else {
        brow.appendChild(utils.setCellText(''));
      }
    }

    for (let j = 0; j < schedule.week[i].timeSlot.length; j += 1) {
      for (let k = 0; k < schedule.week[i].timeSlot[j].match.length; k += 1) {
        // Write each column of the table
        const brow = document.createElement('tr');
        body.appendChild(brow);
        brow.appendChild(
          utils.setCellText(schedule.week[i].weekNum.toString())
        );
        brow.appendChild(utils.setCellText(currentDate.toLocaleDateString()));
        if (typeof schedule.week[i].message === 'string') {
          brow.appendChild(utils.setCellText(schedule.week[i].message));
        } else {
          brow.appendChild(utils.setCellText(''));
        }
        brow.appendChild(
          utils.setCellText(schedule.week[i].timeSlot[j].byeTeams.toString())
        );
        brow.appendChild(
          utils.setCellText(
            schedule.week[i].timeSlot[j].match[k].time.toString()
          )
        );
        brow.appendChild(
          utils.setCellText(
            (
              startCourt + schedule.week[i].timeSlot[j].match[k].court
            ).toString()
          )
        );
        cell = utils.setCellText(
          schedule.week[i].timeSlot[j].match[k].team1.toString(),
          'A'
        );
        utils.setAttributes(cell, { class: 'teamCell' });
        cell.addEventListener('click', (event) => launchTeamPreview(event));
        brow.appendChild(cell);
        cell = utils.setCellText(
          schedule.week[i].timeSlot[j].match[k].team2.toString(),
          'A'
        );
        utils.setAttributes(cell, { class: 'teamCell' });
        cell.addEventListener('click', (event) => launchTeamPreview(event));
        brow.appendChild(cell);
      }
    }
    // increment the date for a new week
    currentDate.setUTCDate(currentDay + 7);
    currentDay = currentDate.getUTCDate();
  }

  // Before assigning the document fragment, clone it so that it can be placed in two places
  const c2 = c.cloneNode(true);

  // Update the schedule table in step 2
  // remove any previous tables first
  let preview = document.getElementById('schedule_preview');
  if (preview.children.length > 0) {
    // replace instead of appending
    preview.replaceChild(c, preview.children[0]);
  } else {
    // add to the right form
    preview.appendChild(c);
  }
  // update the schedule table in step 5
  // remove any previous tables first
  preview = document.getElementById('scheduleReviewTable');
  if (preview.children.length > 0) {
    // replace instead of appending
    preview.replaceChild(c2, preview.children[0]);
  } else {
    // add to the right form
    preview.appendChild(c2);
  }
  // Add event listeners for the final table
  const allDays = preview.querySelectorAll('.teamCell');
  for (let d = 0; d < allDays.length; d += 1) {
    allDays[d].addEventListener('click', (event) => launchTeamPreview(event));
  }

  // reset the template with correct dates
  loadedTemplate.set('schedule', schedule);

  // update the team previews with the actual dates now
  loadedTemplate.updateTeamPreview('date', oldDates);
  // Update all the court numbers using the new start court
  loadedTemplate.updateTeamPreview('court', startCourt + 1);
}

/** **********
 **    D    **
 *********** */

// This function draws the dates in the calendar objects passed in as inputs
export function drawCalendar(template, startDate) {
  // Get the first month and year of the schedule
  const month = Months[startDate.getUTCMonth()];
  const year = startDate.getUTCFullYear();
  // Get a date object for this month, we need it to find the start and end days
  // of the week
  const thisMonth = new Date(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    1
  );
  // Set the header in the calendar as the month and year
  template.querySelector(
    '#currentMonth'
  ).innerHTML = `${month} ${year.toString()}`;
  utils.setAttributes(template.querySelector('#currentMonth'), {
    date: new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1),
  });

  // Get the pointer to the schedule preview section on step 2
  // Previous month counter to reset
  const schedCalendar = document.getElementById('schedule_date_preview');
  // Also update the calendar object in the final preview
  const finalCalendar = document.getElementById('scheduleReviewCalendar');

  // Find all of the days in the calendar an dloop through them
  let allDays = template.querySelectorAll('.day');
  for (let day = 0; day < allDays.length; day += 1) {
    // Check if we are in the current month
    if (day < thisMonth.getDay()) {
      // ALso reset the schedule counter properly
      const sd = new Date(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        0
      );
      schedCalendar.style.counterReset = `previous-month ${(
        sd.getUTCDate() - thisMonth.getUTCDay()
      ).toString()} current-month next-month`;
      finalCalendar.style.counterReset = `previous-month ${(
        sd.getUTCDate() - thisMonth.getUTCDay()
      ).toString()} current-month next-month`;

      // Set the date of this grid cell
      utils.setAttributes(allDays[day], {
        monthClass: 'last',
        date: new Date(
          sd.getUTCFullYear(),
          sd.getUTCMonth(),
          sd.getUTCDate() - thisMonth.getUTCDay() + day + 1
        ).toLocaleDateString(),
      });
    } else if (thisMonth.getUTCMonth() !== startDate.getUTCMonth()) {
      utils.setAttributes(allDays[day], {
        monthClass: 'next',
        date: thisMonth.toLocaleDateString(),
      });
    } else {
      utils.setAttributes(allDays[day], {
        monthClass: 'current',
        date: thisMonth.toLocaleDateString(),
      });
      // Increment the day
      thisMonth.setUTCDate(thisMonth.getUTCDate() + 1);
    }
  }
  // append the calendar object into the appropriate object
  if (schedCalendar.children.length > 0) {
    for (let c = 0; c < schedCalendar.children.length; c += 1) {
      schedCalendar.replaceChild(
        document.importNode(template.children[c], true),
        schedCalendar.children[c]
      );
      finalCalendar.replaceChild(
        document.importNode(template.children[c], true),
        finalCalendar.children[c]
      );
    }
  } else {
    schedCalendar.appendChild(document.importNode(template, true));
    finalCalendar.appendChild(document.importNode(template, true));
  }
  // Reset callbacks
  schedCalendar.querySelector('.previous').addEventListener('click', () => {
    updateMonth(-1);
  });
  schedCalendar.querySelector('.next').addEventListener('click', () => {
    updateMonth(1);
  });
  finalCalendar.querySelector('.previous').addEventListener('click', () => {
    updateMonth(-1);
  });
  finalCalendar.querySelector('.next').addEventListener('click', () => {
    updateMonth(1);
  });

  // Now update the calendar with the actual play dates
  updateCalendarPreview();

  // Set the callback for all play days
  // Remove previous callbacks
  allDays = document.querySelectorAll('.day');
  for (let d = 0; d < allDays.length; d += 1) {
    allDays[d].removeEventListener('click', (event) => toggleBlackout(event));
    if (allDays[d].getAttribute('leagueday')) {
      allDays[d].addEventListener('click', (event) => toggleBlackout(event));
    }
  }
}

/** **********
 **    I    **
 *********** */

// Load the mapping codes and teams from a csv file from sportsengine
export function importTeamInfo() {
  // Read the csv file
  // let teamData = window.api.importTeamInfo();
  window.api
    .importTeamInfo()
    .then((teamData) => {
      // Get the Teams
      const teams = teamData.filter((e) => {
        return e['Page Type'] === 'Team';
      });

      // get the table data to load this in
      const table = document.getElementById('teamInfoBody');

      // Now for each team, enter the data in the table
      teams.forEach((e, i) => {
        const row = table.children[i];
        // Team number
        row.children[0].children[0].setAttribute('value', i + 1);
        // Team Name
        row.children[1].children[0].setAttribute('value', e['Page Title']);
        if (Object.prototype.hasOwnProperty.call(e, 'Mapping Code')) {
          // Mapping Code
          row.children[2].children[0].setAttribute('value', e['Mapping Code']);
        } else {
          // Mapping Code
          row.children[2].children[0].setAttribute(
            'value',
            e['Team/Division IDs']
          );
        }
      });
      // Update the loaded team information
      return updateTeamInfo(true);
    })
    .catch((reason) => {
      console.error(reason);
    });
}

// Creates the bye request table on panel 4
export function initByeRequestTable() {
  // Define variables with scope for below
  let row;
  let cell;
  // Grab the Team info from step 3
  const teamInfo = document.getElementById('teamInfoBody');

  // Grab the schedule information
  const schedule = loadedTemplate.get('schedule');
  // create document fragment to append to
  let c = document.createDocumentFragment();
  // Create a new table body
  const teamTable = document.createElement('tbody');
  teamTable.id = 'teamTableBody';
  c.appendChild(teamTable);
  // List all the teams as a row
  Array.from(teamInfo.children).forEach((i) => {
    row = document.createElement('tr');
    teamTable.appendChild(row);
    cell = utils.setCellText(i.children[0].children[0].value.toString());
    row.appendChild(cell);
    cell = utils.setCellText(i.children[1].children[0].value.toString());
    row.appendChild(cell);
  });
  // fill in the table
  document
    .getElementById('teamTable')
    .replaceChild(c, document.getElementById('teamTableBody'));

  // bye table
  const byeTable = document.getElementById('byeRequestTable');
  // Create the bye request table
  c = document.createDocumentFragment();
  // Create a header
  const header = document.createElement('thead');
  header.id = 'byeRequestHeader';
  c.appendChild(header);
  row = document.createElement('tr');
  header.appendChild(row);
  row.appendChild(utils.setCellText('Team'));
  // Now put in all of the weeks
  schedule.week.forEach((e) => {
    if (e.timeSlot.length > 0) {
      row.appendChild(utils.setCellText(e.date));
    }
  });
  // replace the header
  byeTable.replaceChild(c, document.getElementById('byeRequestHeader'));

  // replace the previous table with new one
  const body = document.createElement('tbody');
  const addBtn = document.createElement('button');
  body.id = 'byeRequestBody';
  row = document.createElement('tr');
  body.appendChild(row);
  addBtn.id = 'newByeBtn';
  utils.setAttributes(addBtn, {
    type: 'button',
  });
  addBtn.addEventListener('click', () => addByeRow());
  row.appendChild(addBtn);
  byeTable.replaceChild(body, document.getElementById('byeRequestBody'));
}
// Initialize the calendar object
export function initCalendarObject() {
  // Import the template from the html file
  /* TODO Re-enable
  const parser = new DOMParser();
  const doc = parser.parseFromString(Calendar(), 'text/html');

  // Set the callbacks for month navigation
  const calObject = doc.getElementById('calendarObject').content;
  // Draw the initial month in the calendar objects
  return drawCalendar(
    calObject,
    new Date(document.getElementById('start_date').value)
  );
  */
}

// initializes the team information form based on chosen template
export function initTeamInfo() {
  const c = document.createDocumentFragment();
  const body = document.createElement('tbody');
  body.setAttribute('id', 'teamInfoBody');
  c.appendChild(body);
  const table = document.getElementById('teamInfoTable');

  // For each team, create a row in the table with appropriate input tags
  loadedTemplate.get('teamPreview').forEach((e, i) => {
    const row = document.createElement('tr');
    let teamInput = document.createElement('INPUT');
    let cell = document.createElement('td');
    utils.setAttributes(teamInput, {
      type: 'number',
      min: 1,
      max: loadedTemplate.get('numTeams'),
      value: i + 1,
    });
    teamInput.addEventListener('change', () => updateTeamInfo());
    cell.appendChild(teamInput);
    row.appendChild(cell);

    cell = document.createElement('td');
    teamInput = document.createElement('INPUT');
    utils.setAttributes(teamInput, {
      type: 'text',
      value: `team ${i + 1}`,
    });
    cell.appendChild(teamInput);
    teamInput.addEventListener('change', () => updateTeamInfo());
    row.appendChild(cell);

    cell = document.createElement('td');
    teamInput = document.createElement('INPUT');
    teamInput.setAttribute('type', 'text');
    cell.appendChild(teamInput);
    teamInput.addEventListener('change', () => updateTeamInfo());
    row.appendChild(cell);
    body.appendChild(row);
  });
  // Replace the body with new info
  table.replaceChild(c, document.getElementById('teamInfoBody'));
}

/** **********
 **    L    **
 *********** */

// Load templates from the Database
function loadTemplateChoices(season) {
  // Grab stored templates from file
  Promise.resolve(window.api.importTemplates(season))
    .then((storedTemplates) => {
      // Reset available templates to choose
      dbTemplates = [];
      if (storedTemplates === undefined || storedTemplates === null) {
        throw new Error('No stored templates found');
      }
      // Sort through the stored templates and create objects for the selected season
      for (let t = 0; t < storedTemplates.length; t += 1) {
        if (storedTemplates[t].season === season) {
          const seasonTemplate = new Template();
          seasonTemplate.importFromDatabase(storedTemplates[t]);
          dbTemplates.push(seasonTemplate);
        }
      }
      return showTemplateChoices();
    })
    .catch((reason) => {
      console.error(reason);
    });
}

/** **********
 **    S    **
 *********** */

// re draws the template tool page with all loaded templates from the Database
export function showTemplateChoices() {
  // Create a document fragment which makes this faster
  const c = document.createDocumentFragment();
  // Title
  const title = document.createElement('H2');
  title.innerHTML = 'Choose Template';
  c.appendChild(title);
  // Create a table to add to the document
  const table = document.createElement('table');
  c.appendChild(table);
  // Create the header
  const head = document.createElement('thead');
  table.appendChild(head);
  const row = document.createElement('tr');
  for (let h = 0; h < tableLabels.length; h += 1) {
    // append to rows
    row.appendChild(utils.setCellText(tableLabels[h]));
  }
  head.appendChild(row);

  // New body to Create
  const newBody = document.createElement('tbody');
  // Add to the document fragment
  table.appendChild(newBody);
  // now add rows to the newBody from the dbTemplates structure
  for (let i = 0; i < dbTemplates.length; i += 1) {
    // add a row
    const iRow = document.createElement('tr');
    for (let h = 0; h < tableHeaders.length; h += 1) {
      const cell = document.createElement('td');
      if (h === 0) {
        const btn = document.createElement('input');
        utils.setAttributes(btn, {
          type: 'radio',
          name: 'selectedTeamplate',
          // 'onclick': ``
        });
        btn.addEventListener('click', () => {
          selectTemplate(i);
        });
        cell.appendChild(btn);
      } else {
        let text = dbTemplates[i].get(tableHeaders[h]);
        text = text != null ? text.toString() : 'none';
        if (tableHeaders[h] === 'numByes') {
          text = text.substring(0, 4);
        }
        if (
          boolHeaders.some((e) => {
            return e === tableHeaders[h];
          })
        ) {
          cell.innerHTML = text !== 'true' ? '&times' : '&#10004';
          utils.setAttributes(cell, { class: 'boolCell', text });
        } else {
          const celltext = document.createTextNode(text);

          console.log(text);

          // append to the cell
          cell.appendChild(celltext);
        }
      }
      // append to rows
      iRow.appendChild(cell);
    }
    // add row to table body
    newBody.appendChild(iRow);
  }
  const formStep = document.querySelector('#form_step_1');
  if (formStep === null) {
    throw new Error('Can not find form parent');
  }
  // Replace the old table if one already exists
  if (formStep.children.length > 0) {
    formStep.replaceChild(c, formStep.children[0]);
  } else {
    // Now add the new body to the table
    formStep.appendChild(c);
  }
  // display the form
  document.getElementById('formDiv').setAttribute('hide', false);
}

/** **********
 **    U    **
 *********** */

// This function will update the calendar object with play dates and blackouts
// for the month
export function updateCalendarPreview() {
  // Cycle through each day and set the appropriate properties for play days and off
  // days
  const allDays = document.querySelectorAll('.day');
  const schedule = loadedTemplate.get('schedule');
  let weeks;
  for (let d = 0; d < allDays.length; d += 1) {
    // Check each week in the schedule to see if it's in the calendar view
    weeks = schedule.week.findIndex((e) => {
      return e.date === allDays[d].getAttribute('date');
    });
    if (weeks >= 0 && allDays[d].getAttribute('monthClass') === 'current') {
      // This is a play week
      utils.setAttributes(allDays[d], {
        leagueDay: false,
      });
      allDays[d].setAttribute('leagueDay', true);
      // check for a blackout
      allDays[d].setAttribute('blackout', schedule.week[weeks].blackout);
    } else {
      utils.setAttributes(allDays[d], {
        leagueDay: false,
        blackout: false,
      });
    }
  }
}
// update the loaded team information
export function updateTeamInfo(initBye) {
  // find the team info table in the app, and update the internal memory
  const table = document.getElementById('teamInfoBody');

  // Declare variables with function scope
  let teamNum;

  // Loop through each child (which is the rows) and assign the team information
  table.children.forEach((t) => {
    teamNum = t.children[0].children[0].valueAsNumber;
    // Assign team number
    leagueTeamInfo[teamNum - 1].teamNumber = teamNum;
    leagueTeamInfo[teamNum - 1].name = t.children[1].children[0].value;
    leagueTeamInfo[teamNum - 1].mappingCode = t.children[2].children[0].value;

    // Update the team Previews too
    loadedTemplate.get('teamPreview')[teamNum - 1].teamNumber = teamNum;
    loadedTemplate.get('teamPreview')[teamNum - 1].name =
      leagueTeamInfo[teamNum - 1].name;
  });

  if (initBye) {
    // Initialize the bye table
    initByeRequestTable();
  } else {
    // update the bye table
    const teamTable = document.getElementById('teamTableBody');
    teamTable.children.forEach((r) => {
      teamNum = Number(r.children[0].innerHTML);
      r.children[1].innerHTML = leagueTeamInfo[teamNum - 1].name;
    });

    // go through each row and reorder the options
    const requests = document.getElementsByClassName('requestTeam');
    let oldcell;
    let cell;
    let lastteam;
    requests.forEach((req) => {
      // eslint-disable-next-line prefer-destructuring
      oldcell = req.getElementsByTagName('select')[0];
      lastteam = oldcell.options[oldcell.selectedIndex].innerHTML;
      cell = document.createElement('select');
      let option;
      loadedTemplate.get('teamPreview').forEach((e) => {
        option = document.createElement('option');
        option.value = e.teamNumber;
        option.innerHTML = e.name;
        cell.appendChild(option);
      });
      req.replaceChild(cell, oldcell);
      cell.selectedIndex = leagueTeamInfo.findIndex((e) => {
        return e.name === lastteam;
      });
    });
  }
}
/** ***************************************************************************
 *****                                                                   *****
 *****                             Callbacks                             *****
 *****                                                                   *****
 *************************************************************************** */
document.addEventListener('DOMContentLoaded', () => {
  // HTML page is loaded, setup defaults
  if (document.getElementById('start_date')) {
    document.getElementById('start_date').valueAsDate = new Date();
  }
});

export function addByeRow() {
  // Grab the schedule information
  const schedule = loadedTemplate.get('schedule');
  // Get the body of the table
  const body = document.getElementById('byeRequestBody');

  const row = document.createElement('tr');

  // Add a class for formatting
  row.className = 'requestTeam';

  // Add a select input for the team name
  let cell = document.createElement('select');
  let option;
  loadedTemplate.get('teamPreview').forEach((e) => {
    option = document.createElement('option');
    option.value = e.teamNumber;
    option.innerHTML = e.name;
    cell.appendChild(option);
  });

  row.appendChild(cell);

  // Add a toggle input for each week
  schedule.week.forEach((e) => {
    // Check for blackouts
    if (e.timeSlot.length > 0) {
      cell = document.createElement('td');
      const input = document.createElement('button');
      // set the class
      input.className = 'byeRequestCell';
      utils.setAttributes(input, {
        type: 'button',
        byeType: 0,
        date: e.date,
      });
      input.addEventListener('click', (event) => toggleByeType(event));
      input.id = `team${body.children.length.toString()}week${e.weekNum.toString()}`;
      cell.appendChild(input);

      row.appendChild(cell);
    }
  });
  // inssert the row
  body.insertBefore(row, document.getElementById('newByeBtn').parentNode);
  if (body.children.length > loadedTemplate.get('teamPreview').length) {
    document.getElementById('newByeBtn').disabled = true;
  }
}

export function launchTeamPreview(event) {
  // Derive team number from event
  // Create an object to send over comms
  const msg = {
    teamPreview: loadedTemplate.get('teamPreview'),
    teamNum: event.target.text,
  };
  // Tell the main thread to launch a preview window
  window.api.launchTeamPreview('scheduler:launchTeamPreview', msg);
}

export function nextStep() {
  // find which step is currently checked
  const button = document.querySelectorAll('.formPanel input[name="stage"]');
  let step = Array.from(button).findIndex((e) => {
    return e.checked;
  });
  step += 1;
  if (step === 4) {
    step = 4;
    const nextBtn = document.getElementById('nextButton');
    nextBtn.innerHTML = '<span> Submit</span>';
  } else if (step > 4) {
    step = 4;
    document.getElementById('nextButton').setAttribute('type', 'submit');
  } else {
    const nextBtn = document.getElementById('nextButton');
    nextBtn.innerHTML = '<span>Next</span>';
    nextBtn.setAttribute('type', 'button');
  }
  button.item(step).checked = 'checked';
}

export function outputSchedule() {
  // Creates the sportsengine formatted schedule
  let outputData =
    'Start_Date,Start_Time,End_Date,End_Time,' +
    'Event_Type,Team1_ID,Team1_Is_Home,Team2_ID,Location';
  // bye table info
  let byeData = 'Week,Date,Message,Bye,Time';
  // Starting court number
  const startCourt = document.getElementById('start_court').valueAsNumber - 1;

  // Get the schedule
  const schedule = loadedTemplate.get('schedule');
  // Temp variables needed in the loop
  let week;
  let match;
  let msg;
  let bye;
  // Build the rest of the schedule from the finalized schedule
  for (let w = 0; w < schedule.week.length; w += 1) {
    week = schedule.week[w].date;
    msg = schedule.week[w].message;
    if (typeof msg === 'undefined') {
      msg = ' ';
    }
    for (let t = 0; t < schedule.week[w].timeSlot.length; t += 1) {
      bye = schedule.week[w].timeSlot[t].byeTeams;
      // Replace with the team names
      for (let m = 0; m < schedule.week[w].timeSlot[t].match.length; m += 1) {
        match = schedule.week[w].timeSlot[t].match[m];
        // add the match in sports engine format
        outputData = outputData.concat(
          '\n',
          getScheduleString(
            week,
            match.time,
            leagueTeamInfo[match.team1 - 1].mappingCode,
            leagueTeamInfo[match.team2 - 1].mappingCode,
            startCourt + match.court
          )
        );
        // bye table information
        byeData = byeData.concat(
          '\n',
          getByeTableString(w + 1, week, msg, bye, match.time)
        );
      }
    }
  }

  // Create message
  const outMsg = {
    outputData,
    byeData,
  };
  // Pass data to save
  window.api
    .saveSchedule('scheduler:saveSchedule', outMsg)
    .then(() => {
      return location.reload();
    })
    .catch((reason) => {
      console.error(reason);
    });
}

export function selectTemplate(dbIndex) {
  // The template index is passed in this callback. Load the template and Initialize
  // all the other form entries
  loadedTemplate = dbTemplates[dbIndex].copy();
  const teamPreview = loadedTemplate.get('teamPreview');
  // Copy the team preview over as the team info
  for (let i = 0; i < teamPreview.length; i += 1) {
    leagueTeamInfo.push(new TeamInfo());
    teamPreview[i].copy(leagueTeamInfo[i]);
  }
  document.getElementById('scheduleName').innerHTML =
    loadedTemplate.get('title');
  buildScheduleTable();
  // setup the team info stage
  initTeamInfo();
  // Create the bye requests table
  initByeRequestTable();
  // Initialize the calendar object in the schedule preview of step 2
  initCalendarObject();
}

export function setChecked(id) {
  const button = document.getElementById(id);
  button.setAttribute('checked', true);
  // Also do next step
  const step = Number(button.labels[0].innerText);
  if (step === 5) {
    const nextBtn = document.getElementById('nextButton');
    nextBtn.innerHTML = '<span>Submit</span>';
    nextBtn.setAttribute('type', 'submit');
  } else {
    const nextBtn = document.getElementById('nextButton');
    nextBtn.innerHTML = '<span>Next</span>';
    nextBtn.setAttribute('type', 'button');
  }
}

export function toggleByeType(event) {
  let byeType;
  const btn = event.srcElement;
  if (!btn.disabled) {
    byeType = Number(btn.getAttribute('byeType'));
    byeType += 1;
    if (byeType > 2) {
      byeType = 0;
    }
    btn.setAttribute('byeType', byeType);
  }
}

export function toggleBlackout(event) {
  // Toggle the blackout value
  event.srcElement.setAttribute(
    'blackout',
    event.srcElement.getAttribute('blackout') !== 'true'
  );

  // check if its a blackout
  if (event.srcElement.getAttribute('blackout') !== 'true') {
    loadedTemplate.removeBlackout(event.srcElement.getAttribute('date'));
  } else {
    loadedTemplate.addBlackout(event.srcElement.getAttribute('date'));
  }

  // Update the schedule
  buildScheduleTable();

  // update bye request
  initByeRequestTable();

  // update the calendar
  updateCalendarPreview();
}

export function updateMonth(offset) {
  // Get the current month
  const thisDate = new Date(
    document
      .getElementById('schedule_date_preview')
      .querySelector('#currentMonth')
      .getAttribute('date')
  );

  // Add in the offset value and then redraw the calendar
  thisDate.setUTCMonth(thisDate.getUTCMonth() + offset);

  // Now we just update both calendars
  drawCalendar(document.getElementById('schedule_date_preview'), thisDate);
  drawCalendar(document.getElementById('scheduleReviewCalendar'), thisDate);
}
/** ***************************************************************************
 *****                                                                   *****
 *****                             Utilities                             *****
 *****                                                                   *****
 *************************************************************************** */
// Create sports engine .csv string
export function getScheduleString(week, time, team1, team2, court) {
  return `${week},${time},${week},${time},Game,${team1},1,${team2},Court ${court}`;
}
// Create bye table
export function getByeTableString(week, date, msg, bye, time) {
  let byeString = ' ';
  if (bye.length > 0) {
    byeString = leagueTeamInfo[bye[0] - 1].name;
    for (let b = 1; b < bye.length; b += 1) {
      byeString = byeString.concat(' ', leagueTeamInfo[bye[b] - 1].name);
    }
  }

  return `${week},${date},${msg},${byeString},${time}`;
}

/** ***************************************************************************
 *****                                                                   *****
 *****                        Main Thread Comms                          *****
 *****                                                                   *****
 *************************************************************************** */
// Once a season is chosen, you start the process
window.api.onStart((e, season) => {
  // set the html pages displays correctly
  document.getElementsByClassName('stages')[0].setAttribute('hide', false);
  document.getElementById('one').setAttribute('checked', 'checked');

  // Set the final form submission action
  document
    .getElementById('scheduleForm')
    .addEventListener('submit', () => outputSchedule());

  // load all the templates from the database
  loadTemplateChoices(season);
});
