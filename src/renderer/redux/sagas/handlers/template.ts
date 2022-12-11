import { call, put, select } from 'redux-saga/effects';
import omit from 'lodash/omit';
import fetchTemplates from '../requests/template';
import {
  replaceTemplates,
  setActiveTemplate,
  selectActiveTemplate,
} from '../../template';
import { setSchedule } from '../../schedule';
import { initTeams } from '../../teams';
import { DbTemplate } from '../../../../domain/template';
import { Week } from '../../../../domain/schedule';

export function* handleLoadTemplates() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const templates: DbTemplate[] = yield call(fetchTemplates);
  yield put(replaceTemplates(templates));
}

export function* handleUpdateActive(action: { id: string }) {
  // Update active template in store
  if (action.id !== null) {
    yield put(setActiveTemplate(action.id));
    // Grab new active template
    const active: DbTemplate = yield select(selectActiveTemplate);
    const templateSched = active.schedule.week;
    // Initialize a schedule
    yield put(
      setSchedule(templateSched.map((w: Week<string>) => omit(w, 'date')))
    );
    // Initialize empty teams
    yield put(initTeams(active.numTeams));
  }
}
