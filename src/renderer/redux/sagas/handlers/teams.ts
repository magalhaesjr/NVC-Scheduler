import { call, put } from 'redux-saga/effects';
import fetchTeams from '../requests/teams';
import { replaceTeams, TeamInfo } from '../../teams';

export default function* handleImportTeams() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const teams: TeamInfo[] | null = yield call(fetchTeams);
  yield put(replaceTeams(teams));
}
