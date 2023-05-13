import { takeLatest } from 'redux-saga/effects';
import { GENERATE_PREVIEWS } from '../preview';
import handleGeneratePreviews from './handlers/preview';

export default function* watchGeneratePreviews() {
  yield takeLatest(GENERATE_PREVIEWS, handleGeneratePreviews);
}
