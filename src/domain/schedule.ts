/* eslint-disable no-console */
import { Dayjs } from 'dayjs';
import validateTeams, { Team } from './teams';

export interface Match {
  time: string;
  court: number;
  team1: number;
  team2: number;
}

// Timeslot for each week
export interface TimeSlot {
  byeTeams: number[];
  match: Match[];
}

// Format for a week
export interface Week<T> {
  week: number;
  blackout: boolean;
  date?: T;
  message?: string;
  timeSlot?: TimeSlot[];
}

// schedule classes
export interface Schedule {
  leagueName: string;
  teams: number[];
  numTimeSlots: number;
  week: Week<string>[];
}

export type ByeDates = {
  full: string[];
  partial: string[];
};

/** Utility functions */

// Get bye dates for a given team team number
export const getByeDates = (
  leagueNights: Week<Dayjs>[],
  teamNumber: number
) => {
  const byeDates: ByeDates = {
    full: [],
    partial: [],
  };

  leagueNights.forEach((w) => {
    if (w.timeSlot && w.date) {
      let numByes = 0;
      w.timeSlot.forEach((t) => {
        if (t.byeTeams.includes(teamNumber)) {
          numByes += 1;
        }
      });

      if (numByes === w.timeSlot.length) {
        byeDates.full.push(w.date.format('MM/DD/YYYY'));
      } else if (numByes > 0) {
        byeDates.partial.push(`[${numByes}] ${w.date.format('MM/DD/YYYY')}`);
      }
    }
  });

  return byeDates;
};

// Create sports engine .csv string
export function getSportsEngineScheduleString(
  date: string,
  time: string,
  team1: number,
  team2: number,
  court: number
) {
  return `${date},${time},${date},${time},Game,${team1},1,${team2},Court ${court}`;
}

export function getSidelineScheduleString(
  date: string,
  time: string,
  team1: string,
  team2: string,
  name: string
) {
  return `${date},${time},${name},${team1},${team2},,`;
}

// Create bye table
export function getByeTableString(
  week: number,
  date: string,
  msg: string,
  byeString: string,
  time: string
) {
  return `${week},${date},${msg},${byeString},${time}`;
}

/** Schedule functions */
export const outputSportsEngineSchedule = async (
  schedule: Required<Week<Dayjs>>[],
  teams: Required<Team>[],
  startCourt: number
): Promise<boolean> => {
  // Validate teams
  const teamState = validateTeams(teams);
  if (!teamState.valid) {
    console.error(teamState.message);
    return false;
  }

  // Creates the sportsengine formatted schedule
  let outputData =
    'Start_Date,Start_Time,End_Date,End_Time,' +
    'Event_Type,Team1_ID,Team1_Is_Home,Team2_ID,Location';
  // bye table info
  let byeData = 'Week,Date,Message,Bye,Time';

  // Build the outputs from the finalized schedule
  schedule.forEach((week) => {
    const date = week.date.format('MM/DD/YYYY');
    const msg = week.message || '';

    // Blackouts not included
    if (week.blackout) {
      return;
    }

    // Loop through each schedule time
    week.timeSlot.forEach((slot, w) => {
      // Create an entry for each match in the time slot
      slot.match.forEach((match) => {
        outputData = outputData.concat(
          '\n',
          getSportsEngineScheduleString(
            date,
            match.time,
            teams[match.team1 - 1].mappingCode as number,
            teams[match.team2 - 1].mappingCode as number,
            startCourt + match.court - 1
          )
        );
        // Create the bye entry
        const byeTeams = slot.byeTeams
          .map((t) => teams[t - 1].teamName)
          .join(' ');
        byeData = byeData.concat(
          '\n',
          getByeTableString(w + 1, date, msg, byeTeams, match.time)
        );
      });
    });
  });

  // Create message
  const outMsg = {
    outputData,
    byeData,
  };
  // Pass data to save
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore preload defines api field
    return window.api.saveSchedule('scheduler:saveSchedule', outMsg);
  } catch (e) {
    return false;
  }
};

const outputSidelineSchedule = async (
  schedule: Required<Week<Dayjs>>[],
  teams: Required<Team>[],
  startCourt: number,
  leagueName: string
): Promise<boolean> => {
  // Validate teams
  const teamState = validateTeams(teams);
  if (!teamState.valid) {
    console.error(teamState.message);
    return false;
  }

  // Creates the sportsengine formatted schedule
  let outputData =
    'Date,Time,Schedule Name,Home Team Name,Away Team Name,' +
    'Home Associated Org,Away Associated Org';
  // bye table info
  let byeData = 'Week,Date,Message,Bye,Time';

  // Build the outputs from the finalized schedule
  schedule.forEach((week) => {
    const date = week.date.format('MM/DD/YYYY');
    const msg = week.message || '';

    // Blackouts not included
    if (week.blackout) {
      return;
    }

    // Loop through each schedule time
    week.timeSlot.forEach((slot, w) => {
      // Create an entry for each match in the time slot
      slot.match.forEach((match) => {
        outputData = outputData.concat(
          '\n',
          getSidelineScheduleString(
            date,
            match.time,
            teams[match.team1 - 1].teamName,
            teams[match.team2 - 1].teamName,
            `${leagueName} Court ${startCourt + match.court - 1}`
          )
        );
        // Create the bye entry
        const byeTeams = slot.byeTeams
          .map((t) => teams[t - 1].teamName)
          .join(' ');
        byeData = byeData.concat(
          '\n',
          getByeTableString(w + 1, date, msg, byeTeams, match.time)
        );
      });
    });
  });

  // Create message
  const outMsg = {
    outputData,
    byeData,
  };
  // Pass data to save
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore preload defines api field
    return window.api.saveSchedule('scheduler:saveSchedule', outMsg);
  } catch (e) {
    return false;
  }
};

export default outputSidelineSchedule;
