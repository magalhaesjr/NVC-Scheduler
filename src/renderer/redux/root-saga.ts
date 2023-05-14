import { all } from 'redux-saga/effects';
import { watchLoad, watchUpdateActive } from './sagas/template';
import watchImportTeams from './sagas/teams';
import watchGeneratePreviews from './sagas/preview';

export default function* rootSaga() {
  yield all([
    watchLoad(),
    watchUpdateActive(),
    watchImportTeams(),
    watchGeneratePreviews(),
  ]);
}
