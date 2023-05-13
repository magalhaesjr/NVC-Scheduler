// includes
/*
import * as utils from './util.js';

/** ***************************************************************************
 *****                                                                   *****
 *****                       Global Variables                            *****
 *****                                                                   *****
 *************************************************************************** */
/*
// All the templates extracted from the Database
let teamPreviews = [];
const datesPerRow = 5;

/** ***************************************************************************
 *****                                                                   *****
 *****                        Main Thread Comms                          *****
 *****                                                                   *****
 *************************************************************************** */
/*
// Initialize team preview
window.previewApi.initTeamPreview((e, teamPreview, teamNum) => {
  // Set the new team preview
  teamPreviews = teamPreview;

  // Create and fill in the options for the pull down
  initPullDown();

  // Now set the team to displays
  displayPreview(teamNum);
});

// Update the team number
window.previewApi.updateTeamPreview((e, teamNum) => {
  displayPreview(teamNum);
});

/** ***************************************************************************
 *****                                                                   *****
 *****                             Functions                             *****
 *****                                                                   *****
 *************************************************************************** */
/*
function initPullDown() {
  const c = document.createDocumentFragment();

  // Find the select id
  const list = document.getElementById('teamNameTag');

  // add each team to the list
  let option;
  for (let i = 0; i < teamPreviews.length; i++) {
    option = document.createElement('option');
    option.value = teamPreviews[i].teamNumber;
    option.innerHTML = teamPreviews[i].name;
    c.appendChild(option);
  }
  // append the options to the list
  if (list.children.length > 0) {
    list.replaceChild(c, list.children[0]);
  } else {
    list.appendChild(c);
  }
  // set the list as active
  list.disable = false;
}
function displayPreview(teamNum) {
  // Change the title
  const option = document.getElementById('teamNameTag');
  if (option.selectedIndex !== teamNum - 1) {
    option.selectedIndex = teamNum - 1;
    displayPreview(teamNum);
    return;
  }
  // Change the loaded preview
  const loadedPreview = teamPreviews[teamNum - 1];

  // Find all of the dates & times that this team plays on
  const data = findMatchData(loadedPreview);
  const { allDates } = data;
  const { allTimes } = data;

  // create a document fragment which makes this faster
  const c = document.createDocumentFragment();

  // Now find the body, which we will replace later
  const table = document.getElementById('previewTable');

  // create a new body
  const body = document.createElement('tbody');
  body.setAttribute('id', 'previewTableBody');
  // append to document fragment
  c.appendChild(body);
  document.getElementById(
    'teamNumber'
  ).innerHTML = `Team ${loadedPreview.teamNumber.toString()}`;

  // Add in all the bye requests for the team
  const br = document.getElementById('teamByeRequest');
  br.innerText = 'Bye Requests : ';
  if (loadedPreview.byeRequests.length === 0) {
    br.innerText += ' none';
  } else {
    for (let i = 0; i < loadedPreview.byeRequests.length; i++) {
      br.innerText = `${br.innerText} ${loadedPreview.byeRequests[i]}`;
    }
  }

  // Create a row for the dates,info & one for the actual time slots
  let row;
  let infoRow;
  // Create the player rows
  const playerRow = new Array(allTimes.length);
  // counter for number of dates in the row
  let d = datesPerRow;
  let nightMatch;

  // Now we create all of the rows and information
  for (let r = 0; r < allDates.length; r++) {
    // If required add a new row
    if (d === datesPerRow) {
      row = document.createElement('tr');
      body.appendChild(row);
      infoRow = document.createElement('tr');
      body.appendChild(infoRow);

      // Create all the play rows
      for (let pr = 0; pr < playerRow.length; pr++) {
        playerRow[pr] = document.createElement('tr');
        body.appendChild(playerRow[pr]);
      }
      // reset the counter
      d = 0;
    }
    // Add the date into the header row
    row.appendChild(
      utils.setCellText(allDates[r], undefined, {
        class: 'tp_date',
        colspan: '3',
      })
    );
    // now we add in the information about the remaining rows
    infoRow.appendChild(
      utils.setCellText('Time', undefined, { class: 'tp_info' })
    );
    infoRow.appendChild(
      utils.setCellText('Ct', undefined, { class: 'tp_info' })
    );
    infoRow.appendChild(
      utils.setCellText('Opp', undefined, { class: 'tp_info' })
    );

    // Now we fill in the play information
    for (let p = 0; p < allTimes.length; p++) {
      // Check what type of night it is
      if (
        loadedPreview.blackouts.some((e) => {
          return e === allDates[r];
        })
      ) {
        playerRow[p].appendChild(
          utils.setCellText('', undefined, {
            class: 'tp_blackout',
            colspan: '3',
          })
        );
      } else if (
        loadedPreview.byeWeeks.some((e, ind) => {
          return (
            e === allDates[r] && loadedPreview.byeTimes[ind] === allTimes[p]
          );
        })
      ) {
        playerRow[p].appendChild(
          utils.setCellText('', undefined, { class: 'tp_bye', colspan: '3' })
        );
      } else {
        nightMatch = loadedPreview.playWeek.findIndex((e, ind) => {
          return e === allDates[r] && loadedPreview.time[ind] === allTimes[p];
        });
        if (nightMatch === -1) {
          playerRow[p].appendChild(
            utils.setCellText('', undefined, { class: 'tp_bye', colspan: '3' })
          );
          continue;
        }
        playerRow[p].appendChild(
          utils.setCellText(allTimes[p], undefined, { class: 'tp_play' })
        );
        playerRow[p].appendChild(
          utils.setCellText(
            loadedPreview.court[nightMatch].toString(),
            undefined,
            { class: 'tp_play' }
          )
        );
        // Team num
        const teamCell = utils.setCellText(
          loadedPreview.opponents[nightMatch].toString(),
          undefined,
          { class: 'tp_play', link: true }
        );
        teamCell.addEventListener('click', (event) => {
          console.log(event);
          displayPreview(event.target.innerText);
        });
        playerRow[p].appendChild(teamCell);
      }
    }

    // Increment the counter
    d++;
  }
  table.replaceChild(c, document.getElementById('previewTableBody'));
}
// Goes through the team preview and extracts a sorted array of all play dates
// for the league
function findMatchData(preview) {
  let allDates = [];
  let allTimes = [];

  // Find all the unique play dates
  // Cycle through all of the play dates first
  allDates = copyUnique(preview.playWeek, allDates);
  // Now the blackouts
  allDates = copyUnique(preview.blackouts, allDates);
  // Now the bye weeks
  allDates = copyUnique(preview.byeWeeks, allDates);
  // We now sort it in order
  allDates = allDates.sort(function (a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(a) - new Date(b);
  });
  console.log(allDates);
  // Find all the unique play times
  // Cycle through all of the play times first
  allTimes = copyUnique(preview.time, allTimes);
  // Now the byes
  allTimes = copyUnique(preview.byeTimes, allTimes);
  // We now sort it in order
  allTimes = allTimes.sort();

  // Return both data sets
  return { allDates, allTimes };
}
// Utility  function
function copyUnique(array, data) {
  array.forEach((e) => {
    if (
      data.findIndex((ei) => {
        return ei === e;
      }) < 0
    ) {
      data.push(e);
    }
  });
  return data;
}
/** ***************************************************************************
 *****                                                                   *****
 *****                             Callbacks                             *****
 *****                                                                   *****
 *************************************************************************** */
/*
export function changePreviewTeam() {
  // get the selected preview team and then update the preview
  const handle = document.getElementById('teamNameTag');
  displayPreview(handle.options[handle.selectedIndex].value);
}
*/
