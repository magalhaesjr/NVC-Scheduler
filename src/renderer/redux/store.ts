// Creates the redux store for use in app
import { configureStore } from '@reduxjs/toolkit';
import templateReducer from './template';
import scheduleReducer from './schedule';

export const store = configureStore({
  reducer: {
    templates: templateReducer,
    schedule: scheduleReducer,
  },
});

// Root state for all dispatch/selectors
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
