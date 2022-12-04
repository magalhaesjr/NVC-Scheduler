/* eslint-disable no-underscore-dangle */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs, { Dayjs } from 'dayjs';
import { Template, Week } from '../template';
import type { RootState } from './store';
import { selectActiveTemplate } from './template';

export interface LeagueNight {
  week: number;
  blackout: boolean;
  date?: Dayjs;
}

// Define state for templates
export interface ScheduleState {
  startDate: string;
  schedule: LeagueNight[];
}

// Define initial state
const initialState: ScheduleState = {
  startDate: dayjs().toJSON(),
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
        schedule.splice(index, 0, { week: 0, blackout: true });

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

export const selectFinalSchedule = (state: RootState): Template | null => {
  // Pull template
  const finalSchedule = selectActiveTemplate(state);

  if (!finalSchedule) {
    return null;
  }

  // Pull schedule
  const schedule = selectSchedule(state);
  
  const oldSched = [...finalSchedule._schedule.week];

  // Rebuild schedule in the template itself
  schedule.forEach((w, ind) => {
    if (!w.blackout && w.date) {
      oldSched[ind] = {
        ...oldSched[ind],
        date: w.date.toJSON(),
      };
    }
  });
  finalSchedule._schedule.week = oldSched;
  return finalSchedule;
};
