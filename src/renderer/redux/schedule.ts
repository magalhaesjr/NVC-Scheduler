/* eslint-disable no-underscore-dangle */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs, { Dayjs } from 'dayjs';
import { Week } from '../../domain/schedule';
import type { RootState } from './store';

export type LeagueNight = Week<Dayjs>;

// Define state for templates
export interface ScheduleState {
  startDate: string;
  startCourt: number;
  schedule: LeagueNight[];
}

// Define initial state
const initialState: ScheduleState = {
  startDate: dayjs().toJSON(),
  startCourt: 1,
  schedule: [{ week: 0, blackout: false }],
};

const reNumberWeeks = (schedule: LeagueNight[]) => {
  return schedule.map((w, ind) => ({
    ...w,
    week: ind + 1,
  }));
};

export const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    addBlackout: (state, action: PayloadAction<number>) => {
      const schedule = [...Array.from(state.schedule)];
      const index = schedule.findIndex((w) => w.week === action.payload);

      if (index >= 0) {
        // Add the new blackout
        schedule.splice(index, 0, {
          week: 0,
          blackout: true,
          message: 'Blackout',
        });
        state.schedule = reNumberWeeks(schedule);
      }
    },
    removeBlackout: (state, action: PayloadAction<number>) => {
      state.schedule = reNumberWeeks(
        state.schedule.filter((w) => w.week !== action.payload)
      );
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setSchedule: (state, action: PayloadAction<LeagueNight[]>) => {
      state.schedule = action.payload;
    },
  },
});

export const { addBlackout, removeBlackout, setStartDate, setSchedule } =
  scheduleSlice.actions;
export default scheduleSlice.reducer;

export const selectStartDate = (state: RootState): Dayjs =>
  dayjs(state.schedule.startDate);

export const selectStartCourt = (state: RootState): number =>
  state.schedule.startCourt;

export const selectSchedule = (state: RootState): LeagueNight[] => {
  const schedule = [...state.schedule.schedule];
  const startDate = dayjs(state.schedule.startDate);
  return schedule.map((w) => {
    return {
      ...w,
      date: startDate.clone().add(w.week - 1, 'weeks'),
    };
  });
};
