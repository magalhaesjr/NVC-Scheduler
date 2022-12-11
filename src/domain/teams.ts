// Defines team objects
export interface Team {
  teamName: string;
  teamNumber: number;
  mappingCode: number | null;
}

interface TeamPreview {
  team: Team;
  byeWeeks: string[];
  byeTimes: string[];
  court: number[];
  playWeek: number[];
  blackouts: string[];
  time: string[];
  byeRequest: string[] | null;
  opponents: number[];
}

interface TeamValidation {
  valid: boolean;
  message?: string;
}

const validateTeams = (teams: Team[]): TeamValidation => {
  const state: TeamValidation = { valid: true };
  teams.forEach((team) => {
    if (team.teamName.length === 0) {
      state.valid = false;
      state.message = `Team ${team.teamNumber} has an empty name`;
    } else if (team.mappingCode === null) {
      state.valid = false;
      state.message = `Team ${team.teamNumber} has no mapping code`;
    }
  });
  return state;
};

export default validateTeams;
