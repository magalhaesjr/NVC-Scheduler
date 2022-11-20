import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs, { Dayjs } from 'dayjs';
import type { RootState } from './store';

// Define state for templates
export interface ScheduleState {
  startDate: string;
}

// Define initial state
const initialState: ScheduleState = {
  startDate: dayjs().toJSON(),
};

export const templateSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
  },
});

export const { setStartDate } = templateSlice.actions;
export default templateSlice.reducer;

export const selectStartDate = (state: RootState): Dayjs =>
  dayjs(state.schedule.startDate);
