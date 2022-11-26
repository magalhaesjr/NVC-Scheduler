import { takeLatest } from 'redux-saga/effects';
import { LOAD_TEMPLATES, UPDATE_ACTIVE } from '../template';
import { handleLoadTemplates, handleUpdateActive } from './handlers/template';

export function* watchLoad() {
  yield takeLatest(LOAD_TEMPLATES, handleLoadTemplates);
}

export function* watchUpdateActive() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  yield takeLatest(UPDATE_ACTIVE, handleUpdateActive);
}
