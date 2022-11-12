import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define state for templates
export interface TemplateState {
  id: number | null;
}

// Define initial state
const initialState: TemplateState = {
  id: null,
};

export const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    setTemplate: (state, action: PayloadAction<number>) => {
      state.id = action.payload;
    },
  },
});

export const { setTemplate } = templateSlice.actions;
export default templateSlice.reducer;
