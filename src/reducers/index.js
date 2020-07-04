import { combineReducers } from 'redux';
import settings from './settings';
import organizations from './organizations';
import users from './users';

export default combineReducers({
  settings,
  organizations,
  users,
});
