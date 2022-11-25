import { takeLatest } from 'redux-saga/effects';
import { LOAD_TEMPLATES } from '../template';
import handleLoadTemplates from './handlers/template';

export default function* watchLoad() {
  yield takeLatest(LOAD_TEMPLATES, handleLoadTemplates);
}
