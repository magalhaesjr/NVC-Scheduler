import { takeLatest } from 'redux-saga/effects';
import { IMPORT_TEAMS } from '../teams';
import handleImportTeams from './handlers/teams';

export default function* watchImportTeams() {
  yield takeLatest(IMPORT_TEAMS, handleImportTeams);
}
