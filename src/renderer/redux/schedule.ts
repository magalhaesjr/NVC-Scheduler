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

export const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
  },
});

export const { setStartDate } = scheduleSlice.actions;
export default scheduleSlice.reducer;

export const selectStartDate = (state: RootState): Dayjs =>
  dayjs(state.schedule.startDate);
