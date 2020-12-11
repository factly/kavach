import { combineReducers } from 'redux';
import settings from './settings';
import organisations from './organisations';
import users from './users';
import media from './media';
import application from './application';

export default combineReducers({
  settings,
  organisations,
  users,
  media,
  application
});
