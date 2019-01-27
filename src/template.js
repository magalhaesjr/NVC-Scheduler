//Includes
const remote = require('electron');
//this file includes classes related to the schedule templates

/*****************************************************************************
 *****                                                                   *****
 *****                             Classes                               *****
 *****                                                                   *****
 ****************************************************************************/
 //Class that defines match
class Match
{
  constructor(time,court,team1,team2)
  {
    this.time = time;
    this.court = court;
    this.team1 = team1;
    this.team2 = team2;
  }
}
//Timeslot for each week
class TimeSlot
{
  constructor(byeTeams)
  {
    this.byeTeams = byeTeams;
    this.match = [];
  }
}
//Format for a week
class Week
{
  constructor(weeknum,date,message)
  {
    this.weekNum = weeknum;
    this.date = date;
    this.message = message;
    this.timeSlot = [];
  }
}
//schedule classes
class Schedule {
  constructor()
  {
    this.teams = [];
    this.numTimeSlots = 0;
    this.week = [];
  }
}

//This class will hold on be used for team previews
class TeamPreview {
  constructor(teamNumber,teamName)
  {
    this.name = teamName;
    this.teamNumber = teamNumber;
    this.court = [];
    this.byeWeeks = [];
    this.byeTimes = [];
    this.playWeek = [];
    this.time = [];
    this.byeRequests = [];
    this.opponents = [];
  }
}

//Template class which has all definitions for working with a template
class Template {
  constructor(id,Teams,Weeks,Courts,Byes,MinMatches)
  {
    //Initialize everything if provided, otherwise leave undefined
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
    this._schedule = new Schedule();
    this._teamPreview = [];
  }
  //Get methods for private variables
  get(variable){
    if (this.hasOwnProperty('_' + variable)){return this['_' + variable];}
  }
  //Set methods for private variables
  set(variable,value){
    if (this.hasOwnProperty('_' + variable) && variable!=='schedule'){this['_' + variable]=value;}
  }

  /*****************************************************************************
   *****                                                                   *****
   *****                               Methods                             *****
   *****                                                                   *****
   ****************************************************************************/
  //Read from database
  importFromDatabase(){}

  //Export to Database
  exportToDatabase()
  {
    //Create an object with the necessary information and return it to for writing
    //to the database
    let outObject = new Object({
      id: this._id,
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
      schedule: this._schedule
    });
    console.log(outObject);
    return(outObject);
  }
  //Import information from the templateinfo sheet
  importInfoFromSheet(infoObject)
  {
    //The template info is well formated already, so it should just be a matter
    //of importing the right variables
    this.set('numWeeks',infoObject.Weeks);
    this.set('numCourts',infoObject.Courts);
    this.set('numByes',infoObject.MaxByes);
    this.set('minMatches',infoObject.MinMatches);
    this.set('title',infoObject.Name);
    if (infoObject.hasOwnProperty('Comments')){
      this.set('description',infoObject.Comments);}
    //If it's an indoor scheduler, the first letter of the name will be an i
    if(infoObject.Name.charAt(0)==='i'){this.set('season','indoor');}
  }
  //Build the schedule from the template sheet and then derive all information
  //from that
  importAllFromSheet(){}

  //Build the schedule portion of the template
  buildTemplateSchedule(scheduleObject,id)
  {
    //Temp variables to fill in during loop
    let maxTeams = 0;
    let times = [];
    let teams = [];
    let numTimeSlots;
    let currentWeek = 0;
    let weekInd = -1;
    let timeInd;
    let timeString;
    //Loop through the schedule and fill in as you go
    for (let i=0;i<scheduleObject.length;i++)
    {
      //Check if this is a new week
      if (scheduleObject[i].Week!==currentWeek)
      {
        //Start a new week
        weekInd++;
        //clone if necessary
        if(weekInd>=this._schedule.week.length)
        {
          //For now just put week number in the date slot
          this._schedule.week.push(new Week(weekInd+1,weekInd+1,
            scheduleObject[i].Message));
        }
        timeInd=0;
        currentWeek = scheduleObject[i].Week;
      }

      //Time string
      timeString = excelTimeToString(scheduleObject[i].Time);

      //Check if time has been added to the timeslot yet
      if (!times.includes(timeString))
      {
        //add to the array
        times.push(timeString);
      }

      //Get the time slot
      timeInd = times.indexOf(timeString);

      //Add a new timeslot if one doesn't exist
      if (timeInd>=this._schedule.week[weekInd].timeSlot.length)
      {
        //convert the bye team string into an array of integers
        if(scheduleObject[i].hasOwnProperty('Bye') && typeof scheduleObject[i].Bye ==='string')
        {
          this._schedule.week[weekInd].timeSlot.push(
            new TimeSlot(scheduleObject[i].Bye.split(",").map(Number))
          );
        }
        else if(typeof scheduleObject[i].Bye ==='number')
        {
          this._schedule.week[weekInd].timeSlot.push(new TimeSlot([scheduleObject[i].Bye]));
        }
        else
        {
          this._schedule.week[weekInd].timeSlot.push(new TimeSlot([]));
        }
      }

      //Initialize a new match with the info (as long as the team isn't 0)
      if(scheduleObject[i].Team1!==0)
      {
        this._schedule.week[weekInd].timeSlot[timeInd].match.push(new Match(
           timeString,scheduleObject[i].Court,scheduleObject[i].Team1,
           scheduleObject[i].Team2));
        //Add the teams to an array
        teams.push(scheduleObject[i].Team1);
        teams.push(scheduleObject[i].Team2);
      }

      //Check maximum number of Teams
      if (scheduleObject[i].Team1>maxTeams || scheduleObject[i].Team2>maxTeams)
      {
        maxTeams = Math.max(scheduleObject[i].Team1,scheduleObject[i].Team2);
      }
    }
    //Set the number of teams to the maxTeams variable
    this._numTeams = maxTeams;
    this._schedule.numTimeSlots = times.length;
    this._schedule.teams = [...new Set(teams)].sort();
    //Generate the unique ID
    this._id = this.generateID(id);

    //Build the team preview which is used for schedule balance and equal matches
    this.generateTeamPreviews();
    //Check balance of schedule
    this._balanced = this.checkTemplateBalance();
    //Check how many matches for each team
    this._equalMatches = this.checkEqualMatches();
  }
  generateID(tempid)
  {
    //Generate a unique ID based on the schedule attributes
    return(this._season.charAt(0) + this._numTeams.toString()+tempid.toString());
  }
  //Check if schedule is balanced
  checkTemplateBalance()
  {
    //Temp variables
    let t,result,testTeam;
    //This one should be easy. Just loop through each team preview and check make
    //sure each team is played the same number of times
    for(let i=0;i<this._teamPreview.length;i++)
    {
      testTeam = this._teamPreview[i].opponents[0];
      //Init
      t = this._teamPreview[i].opponents.filter(opp=>opp===testTeam).length;
      //Check the how many of the first opponent is there, and then verify that
      //they are all the same
      for(let j=0;j<this._teamPreview.length;j++)
      {
        testTeam = j+1;
        if(testTeam===this._teamPreview[i].teamNumber){continue;}

        //Find how many times you play the first opponents
        result = this._teamPreview[i].opponents.filter(opp=>opp===testTeam).length;
        //If any result is not equal to than the schedule is not _balanced
        if (result!==t)
        {
          return(false);
        }
      }
    }
    //Must be balanced
    return(true);
  }

  //Check if equal matches are played
  checkEqualMatches()
  {
    //Even easier. Just check to make sure all of the opponent arrays are the same length
    let t=0;
    for(let i=0;i<this._teamPreview.length;i++)
    {
      if(t===0)
      {
        t=this._teamPreview[i].opponents.length;
      }

      //Check
      if(this._teamPreview[i].opponents.length!==t)
      {
        return(false);
      }
    }
    //If we get this far, return true
    return(true);
  }

  //Build the team previews on a load or after an import
  generateTeamPreviews()
  {
    //temp variables to help with indexing
    let ts,team1,team2;
    //Loop through the number of teams, and build the the template for each
    for(let i=0;i<this._numTeams;i++)
    {
      //Initialize the team preview (we'll do team number for both) +1 for 0 indexing
      this._teamPreview[i] = new TeamPreview(i+1,i+1);
    }
    //Loop through all the Weeks and fill in all teams
    for(let w=0;w<this._numWeeks;w++)
    {
      //now look at each timeslot of the week
      for(let t=0;t<this._schedule.week[w].timeSlot.length;t++)
      {
        ts = this._schedule.week[w].timeSlot[t];
        //Check which teams are on bye, and add them to
        if(typeof ts.byeTeams!=undefined)
        {
          for(let b=0;b<ts.byeTeams.length;b++)
          {
            this._teamPreview[ts.byeTeams[b]-1].byeWeeks.push(w+1);
            if(ts.match.length>0)
            {
              this._teamPreview[ts.byeTeams[b]-1].byeTimes.push(ts.match[0].time);
            }
          }
        }
        //Now check each matchup and fill in the team preview
        for(let m=0;m<ts.match.length;m++)
        {
          team1 = ts.match[m].team1;
          team2 = ts.match[m].team2;
          //fill in info for both
          this._teamPreview[team1-1].opponents.push(team2);
          this._teamPreview[team1-1].playWeek.push(w+1);
          this._teamPreview[team1-1].time.push(ts.match[m].time);
          this._teamPreview[team1-1].court.push(ts.match[m].court);
          //team 2
          this._teamPreview[team2-1].opponents.push(team1);
          this._teamPreview[team2-1].playWeek.push(w+1);
          this._teamPreview[team2-1].time.push(ts.match[m].time);
          this._teamPreview[team2-1].court.push(ts.match[m].court);
        }//end match loop
      }//end time slot loop
    }//end week loop
  }
}

/*****************************************************************************
 *****                                                                   *****
 *****                             Functions                             *****
 *****                                                                   *****
 ****************************************************************************/
//convert fractional day to a time string
function excelTimeToString(timeIn)
{
  let hours,min;
  //Calculate the hours
  hours = Math.floor(timeIn*24);
  //Always play in the evening
  hours = hours<12 ? hours+12:hours;
  //Minutes
  min = new Intl.NumberFormat('en-IN',{minimumIntegerDigits:2}).format(Math.floor(((timeIn*24)%1)*60));
  //Return the string
  return(hours+':'+min);
}

//Export
module.exports.Template = Template;
