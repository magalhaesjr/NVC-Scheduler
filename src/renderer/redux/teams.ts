import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { Team } from '../../domain/teams';

// Define state for templates
export interface TeamState {
  teams: Team[] | null;
}

export interface SwapPayload {
  old: number;
  new: number;
}

// Define initial state
const initialState: TeamState = {
  teams: null,
};

/** Sagas */
export const IMPORT_TEAMS = 'IMPORT_TEAMS';
export const importTeams = () => ({ type: IMPORT_TEAMS });

/** Slice */
export const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    initTeams: (state, action: PayloadAction<number>) => {
      state.teams = [...Array(action.payload)].map(
        (_, i): Team => ({
          mappingCode: null,
          teamName: `Team ${i + 1}`,
          teamNumber: i + 1,
        })
      );
    },
    replaceTeams: (state, action: PayloadAction<Team[] | null>) => {
      if (action.payload) {
        state.teams = action.payload;
      }
    },
    swapTeamNum: (state, action: PayloadAction<SwapPayload>) => {
      const { teams } = state;
      if (teams) {
        const oldInd = teams.findIndex(
          (t) => t.teamNumber === action.payload.old
        );
        const newInd = teams.findIndex(
          (t) => t.teamNumber === action.payload.new
        );
        if (oldInd >= 0 && newInd >= 0) {
          [teams[oldInd].teamNumber, teams[newInd].teamNumber] = [
            teams[newInd].teamNumber,
            teams[oldInd].teamNumber,
          ];
          state.teams = teams.sort((a, b) => a.teamNumber - b.teamNumber);
        }
      }
    },
    updateTeam: (state, action: PayloadAction<Team>) => {
      if (!state.teams) {
        state.teams = [action.payload];
        return;
      }
      const index = state.teams.findIndex(
        (t) => t.teamNumber === action.payload.teamNumber
      );

      if (index >= 0) {
        state.teams[index] = action.payload;
      }
    },
  },
});

export const { initTeams, replaceTeams, swapTeamNum, updateTeam } =
  teamSlice.actions;
export default teamSlice.reducer;

export const selectTeams = (state: RootState): Team[] | null => {
  return state.teams.teams;
};
