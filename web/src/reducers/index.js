import { combineReducers } from 'redux';
import settings from './settings';
import organisations from './organisations';
import users from './users';
import media from './media';
import applications from './application';
import notifications from './notifications';
import profile from './profile';
import sidebar from './sidebar';
import spaces from './space';
import tokens from './token';
import roles from './roles';
export default combineReducers({
  settings,
  organisations,
  users,
  media,
  applications,
  notifications,
  profile,
  sidebar,
  spaces,
  tokens,
  roles,
});
