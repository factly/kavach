import { combineReducers } from 'redux';
import settings from './settings';
import organizations from './organizations';
export default combineReducers({
  settings,
  organizations,
});
