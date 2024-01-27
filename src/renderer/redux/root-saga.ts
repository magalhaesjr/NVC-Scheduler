import { all } from 'redux-saga/effects';
import {
  watchSeasonChange,
  watchLoad,
  watchUpdateActive,
} from './sagas/template';
import watchImportTeams from './sagas/teams';
import watchGeneratePreviews from './sagas/preview';

export default function* rootSaga() {
  yield all([
    watchLoad(),
    watchSeasonChange(),
    watchUpdateActive(),
    watchImportTeams(),
    watchGeneratePreviews(),
  ]);
}
