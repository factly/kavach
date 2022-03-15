import { combineReducers } from 'redux';
import settings from './settings';
import organisations from './organisations';
import users from './users';
import media from './media';
import applications from './application';
import applicationUsers from './applicationUser';
import notifications from './notifications';
import profile from './profile';
import sidebar from './sidebar';
import spaces from './space';
import tokens from './token';
export default combineReducers({
  settings,
  organisations,
  users,
  media,
  applications,
  // applicationUsers,
  notifications,
  profile,
  sidebar,
  spaces,
  tokens,
});
