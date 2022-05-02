import { combineReducers } from 'redux';
import settings from './settings';
import sidebar from './sidebar';

export default combineReducers({
  settings,
  sidebar,
});
