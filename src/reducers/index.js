import { combineReducers } from 'redux';
import settings from './settings';
import organisations from './organisations';
import users from './users';

export default combineReducers({
  settings,
  organisations,
  users,
});
