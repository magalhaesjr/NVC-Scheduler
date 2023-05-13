import { call, put } from 'redux-saga/effects';
import fetchTeams from '../requests/teams';
import { replaceTeams } from '../../teams';
import { Team } from '../../../../domain/teams';

export default function* handleImportTeams() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const teams: Team[] | null = yield call(fetchTeams);
  yield put(replaceTeams(teams));
}
