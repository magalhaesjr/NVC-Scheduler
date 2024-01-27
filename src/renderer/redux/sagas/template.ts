/* eslint-disable @typescript-eslint/ban-ts-comment */
import { takeLatest } from 'redux-saga/effects';
import { CHANGE_SEASON, LOAD_TEMPLATES, UPDATE_ACTIVE } from '../template';
import {
  handleChangeSeason,
  handleLoadTemplates,
  handleUpdateActive,
} from './handlers/template';

export function* watchLoad() {
  yield takeLatest(LOAD_TEMPLATES, handleLoadTemplates);
}

export function* watchSeasonChange() {
  // @ts-ignore
  yield takeLatest(CHANGE_SEASON, handleChangeSeason);
}

export function* watchUpdateActive() {
  // @ts-ignore
  yield takeLatest(UPDATE_ACTIVE, handleUpdateActive);
}
