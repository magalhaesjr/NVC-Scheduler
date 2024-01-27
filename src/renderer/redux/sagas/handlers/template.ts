import { call, put, select } from 'redux-saga/effects';
import omit from 'lodash/omit';
import fetchTemplates from '../requests/template';
import {
  replaceTemplates,
  setActiveTemplate,
  selectActiveTemplate,
  selectSeason,
  setSeason,
} from '../../template';
import { setSchedule } from '../../schedule';
import { initTeams } from '../../teams';
import { DbTemplate, Season } from '../../../../domain/template';
import { Week } from '../../../../domain/schedule';
import { generatePreviews } from '../../preview';

export function* handleLoadTemplates() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const templates: DbTemplate[] = yield call(fetchTemplates);
  yield put(replaceTemplates(templates));
}

export function* handleChangeSeason(action: { season: Season }) {
  const { season } = action;
  // Get current season
  const currentSeason: Season = yield select(selectSeason);

  if (season !== currentSeason) {
    // Reset active template
    yield put(setActiveTemplate(null));
    yield put(setSchedule([]));
    yield put(initTeams(null));
    yield put(setSeason(season));
  }
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

    // Create all of the team previews
    yield put(generatePreviews());
  }
}
