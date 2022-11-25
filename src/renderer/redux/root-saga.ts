import { all } from 'redux-saga/effects';
import watchLoad from './sagas/template';

export default function* rootSaga() {
  yield all([watchLoad()]);
}
