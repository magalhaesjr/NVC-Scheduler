/* eslint-disable no-underscore-dangle */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DbTemplate, importFromDatabase, Season } from '../../domain/template';
import type { RootState } from './store';

/** Types */
// Define state for templates
export interface TemplateState {
  [key: string]: unknown;
  active: DbTemplate | null;
  beach: DbTemplate[] | null;
  indoor: DbTemplate[] | null;
  season: Season;
}

// Define initial state
const initialState: TemplateState = {
  active: null,
  beach: null,
  indoor: null,
  season: 'beach',
};

/** Sagas */
export const CHANGE_SEASON = 'CHANGE_SEASON';
export const changeSeason = (season: Season) => ({
  type: CHANGE_SEASON,
  season,
});
export const LOAD_TEMPLATES = 'LOAD_TEMPLATES';
export const loadTemplates = () => ({ type: LOAD_TEMPLATES });
export const UPDATE_ACTIVE = 'UPDATE_ACTIVE';
export const updateActiveTemplate = (active: string) => ({
  type: UPDATE_ACTIVE,
  id: active,
});

/** Slice */
export const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    replaceTemplates: (state, action: PayloadAction<DbTemplate[]>) => {
      const beachTemplates = action.payload.filter((t) => t.id[0] === 'b');
      const indoorTemplates = action.payload.filter((t) => t.id[0] === 'i');
      state.beach = beachTemplates;
      state.indoor = indoorTemplates;
    },
    setSeason: (state, action: PayloadAction<Season>) => {
      state.season = action.payload;
    },
    setActiveTemplate: (state, action: PayloadAction<string | null>) => {
      const { payload } = action;
      if (!payload) {
        state.active = null;
      }

      const active = (state[state.season] as DbTemplate[]).find(
        (t: DbTemplate) => t.id === payload
      );
      if (active) {
        state.active = active;
      }
    },
  },
});

export const { setActiveTemplate, setSeason, replaceTemplates } =
  templateSlice.actions;

export default templateSlice.reducer;

/** Selectors */
export const selectSeasonTemplates = (state: RootState) => {
  return state.templates[state.templates.season] as DbTemplate[];
};

export const selectSeason = (state: RootState): Season =>
  state.templates.season;

export const selectActiveTemplate = (state: RootState) => {
  if (!state.templates.active) {
    return null;
  }

  return importFromDatabase(state.templates.active);
};
