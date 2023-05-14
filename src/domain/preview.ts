/**
 * Generates previews for teams and a week
 */
import { Week } from './schedule';

export interface MatchPreview {
  blackout: boolean;
  bye: boolean;
  court: number;
  date: string;
  opponent: number;
  time: string;
}

export interface TeamPreview {
  match: MatchPreview[];
}

const initMatchPreview = (blackout: boolean, date?: string) => {
  return {
    blackout,
    bye: false,
    court: 0,
    date: date || '',
    opponent: 0,
    time: '',
  };
};

export const generateTeamPreview = (
  team: number,
  schedule: Week<string>[]
): TeamPreview => {
  // Initialize the team preview
  const preview: TeamPreview = { match: [] };

  schedule.forEach((w) => {
    if (w.blackout) {
      preview.match.push(initMatchPreview(w.blackout, w.date));
    } else if (w.timeSlot) {
      // Pull out timeslots involved with team
      const teamTimes = w.timeSlot.filter(
        (t) =>
          t.byeTeams.findIndex((b) => b === team) !== -1 ||
          t.match.findIndex((m) => m.team1 === team || m.team2 === team) !== -1
      );

      teamTimes.forEach((t) => {
        const match = initMatchPreview(false, w.date);
        if (t.byeTeams.findIndex((b) => b === team) === -1) {
          match.bye = true;
          match.time = t.match[0].time;
          preview.match.push(match);
        } else {
          const thisMatch = t.match.find(
            (m) => m.team1 === team || m.team2 === team
          );

          if (thisMatch) {
            // Update details of match
            match.time = thisMatch.time;
            match.court = thisMatch.court;
            match.opponent =
              thisMatch.team1 === team ? thisMatch.team2 : thisMatch.team1;
            preview.match.push(match);
          }
        }
      });
    }
  });

  return preview;
};
