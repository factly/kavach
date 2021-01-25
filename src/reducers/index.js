import { combineReducers } from 'redux';
import settings from './settings';
import organisations from './organisations';
import users from './users';
import media from './media';
import application from './application';
import notifications from './notifications';
import profile from './profile';

export default combineReducers({
  settings,
  organisations,
  users,
  media,
  application,
  notifications,
  profile
});
