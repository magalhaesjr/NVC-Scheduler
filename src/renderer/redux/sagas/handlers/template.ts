import { call, put } from 'redux-saga/effects';
import fetchTemplates from '../requests/template';
import { replaceTemplates } from '../../template';
import { Template } from '../../../template';

export default function* handleLoadTemplates() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const templates: Template[] = yield call(fetchTemplates);
  yield put(replaceTemplates(templates));
}
