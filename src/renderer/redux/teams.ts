import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

export interface TeamInfo {
  mappingCode: number | null;
  name: string;
  teamNum: number;
}

// Define state for templates
export interface TeamState {
  teams: TeamInfo[] | null;
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
        (_, i): TeamInfo => ({
          mappingCode: null,
          name: `Team ${i + 1}`,
          teamNum: i + 1,
        })
      );
    },
    replaceTeams: (state, action: PayloadAction<TeamInfo[] | null>) => {
      if (action.payload) {
        state.teams = action.payload;
      }
    },
    swapTeamNum: (state, action: PayloadAction<SwapPayload>) => {
      const { teams } = state;
      if (teams) {
        const oldInd = teams.findIndex((t) => t.teamNum === action.payload.old);
        const newInd = teams.findIndex((t) => t.teamNum === action.payload.new);
        if (oldInd >= 0 && newInd >= 0) {
          [teams[oldInd].teamNum, teams[newInd].teamNum] = [
            teams[newInd].teamNum,
            teams[oldInd].teamNum,
          ];
          state.teams = teams.sort((a, b) => a.teamNum - b.teamNum);
        }
      }
    },
    updateTeam: (state, action: PayloadAction<TeamInfo>) => {
      if (!state.teams) {
        state.teams = [action.payload];
        return;
      }
      const index = state.teams.findIndex(
        (t) => t.teamNum === action.payload.teamNum
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

export const selectTeams = (state: RootState): TeamInfo[] | null => {
  return state.teams.teams;
};
