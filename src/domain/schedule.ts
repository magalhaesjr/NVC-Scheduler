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
  teams: number[];
  numTimeSlots: number;
  week: Week<string>[];
}

/** Utility functions */

// Create sports engine .csv string
export function getScheduleString(
  date: string,
  time: string,
  team1: number,
  team2: number,
  court: number
) {
  return `${date},${time},${date},${time},Game,${team1},1,${team2},Court ${court}`;
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

const outputSchedule = async (
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
          getScheduleString(
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

export default outputSchedule;
