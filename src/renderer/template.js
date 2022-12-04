/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-new-object */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */
// this file includes classes related to the schedule templates

/**
 *****************************************************************************
 *****                                                                   *****
 *****                             Classes                               *****
 *****                                                                   *****
 *****************************************************************************
 */
// Class that defines match
class Match {
  constructor(time, court, team1, team2) {
    this.time = time;
    this.court = court;
    this.team1 = team1;
    this.team2 = team2;
  }
}
// Timeslot for each week
class TimeSlot {
  constructor(byeTeams) {
    this.byeTeams = byeTeams;
    this.match = [];
  }
}
// Format for a week
export class Week {
  constructor(weeknum, date, message) {
    this.weekNum = weeknum;
    this.date = date;
    this.message = message;
    this.blackout = false;
    this.timeSlot = [];
  }
}
// schedule classes
class TemplateTable {
  constructor() {
    this.teams = [];
    this.numTimeSlots = 0;
    this.week = [];
  }
}

// This class will hold on be used for team previews
class TeamPreview {
  constructor(teamNumber, teamName) {
    this.name = teamName;
    this.teamNumber = teamNumber;
    this.court = [];
    this.byeWeeks = [];
    this.byeTimes = [];
    this.playWeek = [];
    this.blackouts = [];
    this.time = [];
    this.byeRequests = [];
    this.opponents = [];
  }

  copy(objOut) {
    // We just need a shallow assign since it's just arrays and static Numbers
    Object.keys(this).forEach((key) => {
      if (Array.isArray(this[key])) {
        // do a slice for all elements
        objOut[key] = this[key].slice(0, this[key].length);
      } else {
        objOut[key] = this[key];
      }
    });
  }
}

// We'll create a sub class for team information
class TeamInfo extends TeamPreview {
  constructor(teamNumber, teamName, mappingCode) {
    super(teamNumber, teamName);
    this.mappingCode = mappingCode;
  }
}

// Template class which has all definitions for working with a template
class Template {
  constructor(id, Teams, Weeks, Courts, Byes, MinMatches) {
    // Initialize everything if provided, otherwise leave undefined
    this._id = id;
    this._numTeams = Teams;
    this._numWeeks = Weeks;
    this._numCourts = Courts;
    this._numByes = Byes;
    this._hasPools = false;
    this._minMatches = MinMatches;
    this._balanced = true;
    this._equalMatches = true;
    this._description = null;
    this._title = null;
    this._season = 'beach';
    this._schedule = new TemplateTable();
    this._teamPreview = [];
  }

  // Get methods for private variables
  get(variable) {
    if (this.hasOwnProperty(`_${variable}`)) {
      return this[`_${variable}`];
    }
    return null;
  }

  // Set methods for private variables
  set(variable, value) {
    if (this.hasOwnProperty(`_${variable}`) && variable !== 'schedule') {
      this[`_${variable}`] = value;
    }
  }

  /** ***************************************************************************
   *****                                                                   *****
   *****                               Methods                             *****
   *****                                                                   *****
   *************************************************************************** */
  // Read from database
  importFromDatabase(dbObject) {
    this._id = dbObject._id;
    this._numTeams = dbObject.numTeams;
    this._numWeeks = dbObject.numWeeks;
    this._numCourts = dbObject.numCourts;
    this._numByes = dbObject.numByes;
    this._hasPools = dbObject.hasPools;
    this._minMatches = dbObject.minMatches;
    this._balanced = dbObject.balanced;
    this._equalMatches = dbObject.equalMatches;
    this._description = dbObject.description;
    this._title = dbObject.title;
    this._season = dbObject.season;
    this._schedule = dbObject.schedule;

    // Build the team previews
    this.generateTeamPreviews();
  }

  // Export to Database
  exportToDatabase() {
    // Create an object with the necessary information and return it to for writing
    // to the database
    const outObject = new Object({
      _id: this._id,
      numTeams: this._numTeams,
      numWeeks: this._numWeeks,
      numCourts: this._numCourts,
      numByes: this._numByes,
      hasPools: this._hasPools,
      minMatches: this._minMatches,
      balanced: this._balanced,
      equalMatches: this._equalMatches,
      description: this._description,
      title: this._title,
      season: this._season,
      schedule: this._schedule,
    });
    return outObject;
  }

  // Import information from the templateinfo sheet
  importInfoFromSheet(infoObject) {
    // The template info is well formated already, so it should just be a matter
    // of importing the right variables
    this.set('numWeeks', infoObject.Weeks);
    this.set('numCourts', infoObject.Courts);
    this.set('numByes', infoObject.MaxByes);
    this.set('minMatches', infoObject.MinMatches);
    this.set('title', infoObject.Name);
    if (infoObject.hasOwnProperty('Comments')) {
      this.set('description', infoObject.Comments);
    }
    // If it's an indoor scheduler, the first letter of the name will be an i
    if (infoObject.Name.charAt(0) === 'i') {
      this.set('season', 'indoor');
    }
  }

  // Build the schedule portion of the template
  buildTemplateSchedule(scheduleObject, id) {
    // Temp variables to fill in during loop
    let maxTeams = 0;
    const times = [];
    const teams = [];
    let currentWeek = 0;
    let weekInd = -1;
    let timeInd;
    let timeString;
    // Loop through the schedule and fill in as you go
    for (let i = 0; i < scheduleObject.length; i += 1) {
      // Check if this is a new week
      if (scheduleObject[i].Week !== currentWeek) {
        // Start a new week
        weekInd += 1;
        // clone if necessary
        if (weekInd >= this._schedule.week.length) {
          // For now just put week number in the date slot
          this._schedule.week.push(
            new Week(weekInd + 1, weekInd + 1, scheduleObject[i].Message)
          );
        }
        timeInd = 0;
        currentWeek = scheduleObject[i].Week;
      }

      // Time string
      timeString = excelTimeToString(scheduleObject[i].Time);

      // Check if time has been added to the timeslot yet
      if (!times.includes(timeString)) {
        // add to the array
        times.push(timeString);
      }

      // Get the time slot
      timeInd = times.indexOf(timeString);

      // Add a new timeslot if one doesn't exist
      while (timeInd >= this._schedule.week[weekInd].timeSlot.length) {
        // convert the bye team string into an array of integers
        if (
          scheduleObject[i].hasOwnProperty('Bye') &&
          typeof scheduleObject[i].Bye === 'string'
        ) {
          this._schedule.week[weekInd].timeSlot.push(
            new TimeSlot(scheduleObject[i].Bye.split(',').map(Number))
          );
        } else if (typeof scheduleObject[i].Bye === 'number') {
          this._schedule.week[weekInd].timeSlot.push(
            new TimeSlot([scheduleObject[i].Bye])
          );
        } else {
          this._schedule.week[weekInd].timeSlot.push(new TimeSlot([]));
        }
      }

      // Initialize a new match with the info (as long as the team isn't 0)
      if (
        typeof scheduleObject[i].Team1 === 'number' &&
        scheduleObject[i].Team1 !== 0
      ) {
        this._schedule.week[weekInd].timeSlot[timeInd].match.push(
          new Match(
            timeString,
            scheduleObject[i].Court,
            scheduleObject[i].Team1,
            scheduleObject[i].Team2
          )
        );
        // Add the teams to an array
        teams.push(scheduleObject[i].Team1);
        teams.push(scheduleObject[i].Team2);
      }

      // Check maximum number of Teams
      if (
        scheduleObject[i].Team1 > maxTeams ||
        scheduleObject[i].Team2 > maxTeams
      ) {
        maxTeams = Math.max(scheduleObject[i].Team1, scheduleObject[i].Team2);
      }
    }
    // Set the number of teams to the maxTeams variable
    this._numTeams = maxTeams;
    this._schedule.numTimeSlots = times.length;
    this._schedule.teams = [...new Set(teams)].sort();
    // Generate the unique ID
    this._id = this.generateID(id);

    // Build the team preview which is used for schedule balance and equal matches
    this.generateTeamPreviews();
    // Check balance of schedule
    this._balanced = this.checkTemplateBalance();
    // Check how many matches for each team
    this._equalMatches = this.checkEqualMatches();
  }

  generateID(tempid) {
    // Generate a unique ID based on the schedule attributes
    return (
      this._season.charAt(0) + this._numTeams.toString() + tempid.toString()
    );
  }

  // Check if schedule is balanced
  checkTemplateBalance() {
    // Temp variables
    let t;
    let result;
    // This one should be easy. Just loop through each team preview and check make
    // sure each team is played the same number of times
    for (let i = 0; i < this._teamPreview.length; i += 1) {
      let { testTeam } = this._teamPreview[i].opponents[0];
      // Init
      /* jshint ignore:start */
      t = this._teamPreview[i].opponents.filter(
        (opp) => opp === testTeam
      ).length;
      /* jshint ignore:end */
      // Check the how many of the first opponent is there, and then verify that
      // they are all the same
      for (let j = 0; j < this._teamPreview.length; j += 1) {
        testTeam = j + 1;
        if (testTeam !== this._teamPreview[i].teamNumber) {
          // Find how many times you play the first opponents
          /* jshint ignore:start */
          result = this._teamPreview[i].opponents.filter(
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            (opp) => opp === testTeam
          ).length;
          /* jshint ignore:end */
          // If any result is not equal to than the schedule is not _balanced
          if (result !== t) {
            return false;
          }
        }
      }
    }
    // Must be balanced
    return true;
  }

  // Check if equal matches are played
  checkEqualMatches() {
    // Even easier. Just check to make sure all of the opponent arrays are the same length
    let t = 0;
    for (let i = 0; i < this._teamPreview.length; i += 1) {
      if (t === 0) {
        t = this._teamPreview[i].opponents.length;
      }

      // Check
      if (this._teamPreview[i].opponents.length !== t) {
        return false;
      }
    }
    // If we get this far, return true
    return true;
  }

  // Build the team previews on a load or after an import
  generateTeamPreviews() {
    // temp variables to help with indexing
    let ts;
    let team1;
    let team2;
    // Loop through the number of teams, and build the the template for each
    for (let i = 0; i < this._numTeams; i += 1) {
      // Initialize the team preview (we'll do team number for both) +1 for 0 indexing
      this._teamPreview[i] = new TeamPreview(i + 1, i + 1);
    }
    // Loop through all the Weeks and fill in all teams
    for (let w = 0; w < this._numWeeks; w += 1) {
      // Check if it's a blackout, if so then add it in
      if (this._schedule.week[w].blackout) {
        this._teamPreview.forEach((e) => {
          e.blackouts.push(this._schedule.week[w].date);
        });
      }
      // now look at each timeslot of the week
      for (let t = 0; t < this._schedule.week[w].timeSlot.length; t += 1) {
        ts = this._schedule.week[w].timeSlot[t];
        // Check which teams are on bye, and add them to
        for (let b = 0; b < ts.byeTeams.length; b += 1) {
          if (typeof ts.byeTeams[b] === 'number' && ts.byeTeams[b] > 0) {
            this._teamPreview[ts.byeTeams[b] - 1].byeWeeks.push(w + 1);
            if (ts.match.length > 0) {
              this._teamPreview[ts.byeTeams[b] - 1].byeTimes.push(
                ts.match[0].time
              );
            }
          } else {
            console.log(ts.byeTeams);
          }
        }
        // Now check each matchup and fill in the team preview
        for (let m = 0; m < ts.match.length; m += 1) {
          team1 = ts.match[m].team1;
          team2 = ts.match[m].team2;
          // fill in info for both
          this._teamPreview[team1 - 1].opponents.push(team2);
          this._teamPreview[team1 - 1].playWeek.push(w + 1);
          this._teamPreview[team1 - 1].time.push(ts.match[m].time);
          this._teamPreview[team1 - 1].court.push(ts.match[m].court);
          // team 2
          this._teamPreview[team2 - 1].opponents.push(team1);
          this._teamPreview[team2 - 1].playWeek.push(w + 1);
          this._teamPreview[team2 - 1].time.push(ts.match[m].time);
          this._teamPreview[team2 - 1].court.push(ts.match[m].court);
        } // end match loop
      } // end time slot loop
    } // end week loop
  }

  updateTeamPreview(field, data) {
    let outData = data;
    switch (field) {
      case 'date':
        // loop through all team previews and replace the week number with the
        // actual date in the template
        for (let i = 0; i < this._teamPreview.length; i += 1) {
          this._teamPreview[i].playWeek.forEach((element, ind) => {
            const index = data.findIndex((e) => {
              return e === element;
            });
            // if(index>=0){
            this._teamPreview[i].playWeek[ind] =
              this._schedule.week[index].date;
          }, this);
          this._teamPreview[i].byeWeeks.forEach((element, ind) => {
            const index = data.findIndex((e) => {
              return e === element;
            });
            // if(index>=0){
            this._teamPreview[i].byeWeeks[ind] =
              this._schedule.week[index].date;
          }, this);
        }
        break;
      case 'court':
        // eslint-disable-next-line no-case-declarations
        let minCourt = 100;
        for (let i = 0; i < this._teamPreview.length; i += 1) {
          for (let j = 0; j < this._teamPreview[i].court.length; j += 1) {
            if (this._teamPreview[i].court[j] < minCourt) {
              minCourt = this._teamPreview[i].court[j];
            }
          }
        }
        outData -= minCourt;
        this._teamPreview.forEach((e, i) => {
          e.court.forEach((ec, ic) => {
            this._teamPreview[i].court[ic] = ec + outData;
          });
        });
        break;
      default:
        throw new Error('Unexpected field');
    }
  }

  // Deep copy, returns a duplicate class
  copy() {
    // Copy the static variables in the object
    const obj = copyObjectValues(new Template(), this);

    // Copy the schedule
    obj._schedule = new TemplateTable();
    // Copy static values
    obj._schedule = copyObjectValues(obj._schedule, this._schedule);

    // Now copy all of the weeks
    this._schedule.week.forEach((e, i) => {
      obj._schedule.week[i] = copyObjectValues(new Week(), e);
      // Now copy the timeslots
      e.timeSlot.forEach((et, it) => {
        obj._schedule.week[i].timeSlot[it] = copyObjectValues(
          new TimeSlot(),
          et
        );
        // now copy the matches
        et.match.forEach((em, im) => {
          obj._schedule.week[i].timeSlot[it].match[im] = copyObjectValues(
            new Match(),
            em
          );
        });
      });
    });
    // We'll now do a copy of the team preview
    obj._teamPreview = [];
    for (let i = 0; i < this._teamPreview.length; i += 1) {
      obj._teamPreview.push(new TeamPreview());
      // Use the built in copy to copy to the new object.
      this._teamPreview[i].copy(obj._teamPreview[i]);
    }
    return obj;
  }

  // methods for handling blackouts
  addBlackout(inputDate) {
    // Adds a blackout in the week that equals the input date
    // Find the schedule week that is now a blackout
    const index = this._schedule.week.findIndex((e) => {
      return e.date === inputDate;
    });

    // Check the condition
    if (index === -1) {
      alert('This date is not a league date');
      return;
    }

    // Find the next free week
    let nextWeek = index + 1;
    while (this._schedule.week[nextWeek].blackout) {
      nextWeek += 1;
    }

    // Create a new week for the blackout
    const blackOut = new Week(nextWeek, inputDate, 'Blackout');
    blackOut.blackout = true;

    // Now insert the blackout week into the schedule
    this._schedule.week.splice(index, 0, blackOut);

    const oldDates = [];
    this._schedule.week.slice(0, index).forEach((e) => {
      if (e.timeSlot.length > 0) {
        oldDates.push(e.date);
      } else {
        oldDates.push('20/20/2000');
      }
    });

    // Push blackout
    oldDates.push('20/20/2000');

    this.updateSchedule(nextWeek, oldDates);

    // Add this blackout to the team previews
    this._teamPreview.forEach((e) => {
      e.blackouts.push(inputDate);
    });
  }

  removeBlackout(inputDate) {
    // removes a blackout in the week that equals the input date
    // Find the schedule week that is now a blackout
    const index = this._schedule.week.findIndex((e) => {
      return e.date === inputDate;
    });

    // Check the condition
    if (index === -1) {
      alert('This date is not a league date');
      return;
    }

    const oldDates = [];
    this._schedule.week.slice(0, index).forEach((e) => {
      if (e.timeSlot.length > 0) {
        oldDates.push(e.date);
      } else {
        oldDates.push('20/20/2000');
      }
    });

    // Now remove the blackout week from the schedule
    this._schedule.week.splice(index, 1);

    // Update schedule
    this.updateSchedule(index, oldDates);

    // Remove blackouts from team previews
    console.log(this._teamPreview[0].blackouts);
    this._teamPreview.forEach((e) => {
      e.blackouts = e.blackouts.filter((b) => {
        return b !== inputDate;
      });
    });
    console.log(this._teamPreview[0].blackouts);
  }

  updateSchedule(index, oldDates) {
    // Where to start the rescheduling
    const startDate = new Date(Date.parse(this._schedule.week[index - 1].date));
    startDate.setUTCDate(startDate.getUTCDate() + 7);
    // We now reschedule the play weeks in order
    let w = index;
    let bindex;
    for (let i = index; i < this._schedule.week.length; i += 1) {
      oldDates.push(this._schedule.week[i].date);
      // Check if it's a blackout, if it is, we need to leave it as is
      if (!this._schedule.week[i].blackout) {
        oldDates[oldDates.length - 1] = '20/20/2000';

        // incremenet week number
        w += 1;

        // Check to see if any this matches a previous blackout
        bindex = this._schedule.week.findIndex((e) => {
          return e.date === startDate.toLocaleDateString();
        });
        while (bindex > 0 && bindex < i) {
          this._schedule.week[bindex].weekNum = w;
          startDate.setUTCDate(startDate.getUTCDate() + 7);
          w += 1;
          bindex = this._schedule.week.findIndex((e) => {
            return e.date === startDate.toLocaleDateString();
          });
        }
        this._schedule.week[i].weekNum = w;
        this._schedule.week[i].date = startDate.toLocaleDateString();
        startDate.setUTCDate(startDate.getUTCDate() + 7);
      }
    }

    // Update team previews
    this.updateTeamPreview('date', oldDates);

    // Now properly order the schedule
    this._schedule.week = this._schedule.week.sort((a, b) => {
      return a.weekNum - b.weekNum;
    });
  }
}

/** ***************************************************************************
 *****                                                                   *****
 *****                             Functions                             *****
 *****                                                                   *****
 *************************************************************************** */
// convert fractional day to a time string
function excelTimeToString(timeIn) {
  let hours;
  // Calculate the hours
  hours = Math.floor(timeIn * 24);
  // Always play in the evening
  hours = hours < 12 ? hours + 12 : hours;
  // Minutes
  const min = new Intl.NumberFormat('en-IN', {
    minimumIntegerDigits: 2,
  }).format(Math.round(((timeIn * 24) % 1) * 60));
  // Return the string
  return `${hours}:${min}`;
}
function copyObjectValues(objOut, objIn) {
  Object.keys(objIn).forEach((key) => {
    if (typeof key !== 'object' && !Array.isArray(key)) {
      objOut[key] = objIn[key];
    }
  });

  return objOut;
}

// Export
export { Template, TeamInfo };
