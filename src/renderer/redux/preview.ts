import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
// import type { Match } from '../../domain/schedule';
import type { TeamPreview } from '../../domain/preview';

// Define state for templates
export interface PreviewState {
  teamPreview: TeamPreview[] | null;
}

// Define initial state
const initialState: PreviewState = {
  teamPreview: null,
};

/** Sagas */
export const GENERATE_PREVIEWS = 'GENERATE_PREVIEWS';
export const generatePreviews = () => ({ type: GENERATE_PREVIEWS });

/** Slice */
export const previewSlice = createSlice({
  name: 'previews',
  initialState,
  reducers: {
    setTeamPreviews: (state, action: PayloadAction<TeamPreview[]>) => {
      state.teamPreview = action.payload;
    },
  },
});

export const { setTeamPreviews } = previewSlice.actions;
export default previewSlice.reducer;

export const selectTeamPreview = (
  state: RootState,
  team: number
): TeamPreview | null => {
  return state.previews.teamPreview
    ? state.previews.teamPreview[team - 1]
    : null;
};
