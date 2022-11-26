// Creates the redux store for use in app
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import templateReducer from './template';
import scheduleReducer from './schedule';
import teamReducer from './teams';
import rootSaga from './root-saga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    teams: teamReducer,
    templates: templateReducer,
    schedule: scheduleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

// Root state for all dispatch/selectors
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
