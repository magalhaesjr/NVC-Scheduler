import { call, put, select } from 'redux-saga/effects';
import fetchTemplates from '../requests/template';
import {
  replaceTemplates,
  setActiveTemplate,
  selectActiveTemplate,
} from '../../template';
import { setSchedule } from '../../schedule';
import { initTeams } from '../../teams';
import { Template } from '../../../template';

export function* handleLoadTemplates() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const templates: Template[] = yield call(fetchTemplates);
  yield put(replaceTemplates(templates));
}

export function* handleUpdateActive(action: { id: string }) {
  // Update active template in store
  if (action.id !== null) {
    yield put(setActiveTemplate(action.id));
    // Grab new active template
    const active: Template = yield select(selectActiveTemplate);
    const templateSched = active.get('schedule').week;
    // Initialize a schedule
    yield put(
      setSchedule(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        templateSched.map((w: any) => ({
          week: w.weekNum,
          blackout: w.blackout,
        }))
      )
    );
    // Initialize empty teams
    yield put(initTeams(active.get('numTeams')));
  }
}
