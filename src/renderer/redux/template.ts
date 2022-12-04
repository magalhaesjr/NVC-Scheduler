/* eslint-disable no-underscore-dangle */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Template } from '../template';
import type { RootState } from './store';

/** Types */
// Define state for templates
export interface TemplateState {
  [key: string]: unknown;
  active: Template | null;
  beach: Template[] | null;
  indoor: Template[] | null;
  season: string;
}

// Define initial state
const initialState: TemplateState = {
  active: null,
  beach: null,
  indoor: null,
  season: 'beach',
};

/** Sagas */
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
    replaceTemplates: (state, action: PayloadAction<Template[]>) => {
      const beachTemplates = action.payload.filter((t) => t._id[0] === 'b');
      const indoorTemplates = action.payload.filter((t) => t._id[0] === 'i');
      state.beach = beachTemplates;
      state.indoor = indoorTemplates;
    },
    setSeason: (state, action: PayloadAction<string>) => {
      state.season = action.payload;
    },
    setActiveTemplate: (state, action: PayloadAction<string>) => {
      const active = (state[state.season] as Template[]).find(
        (t: Template) => t._id === action.payload
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
  return state.templates[state.templates.season] as Template[];
};

export const selectActiveTemplate = (state: RootState) => {
  if (!state.templates.active) {
    return null;
  }
  const newTemplate = new Template();
  newTemplate.importFromDatabase(state.templates.active);
  return newTemplate;
};
