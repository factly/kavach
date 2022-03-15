import {
  ADD_APPLICATION,
  ADD_APPLICATIONS,
  SET_APPLICATIONS_LOADING,
  RESET_APPLICATIONS,
  ADD_SPACE_IDS,
} from '../constants/application';

import { ADD_USER_IDS } from '../constants/applicationUser';

const initialState = {
  details: {},
  loading: true,
};

export default function application(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_APPLICATIONS:
      return {
        ...state,
        details: {},
        loading: true,
      };
    case SET_APPLICATIONS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_APPLICATIONS:
      return {
        ...state,
        details: { ...state.details, ...action.payload },
      };
    case ADD_APPLICATION:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case ADD_SPACE_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: {
            ...state.details[action.payload.id],
            spaces: action.payload.space_ids,
          },
        },
      };
    case ADD_USER_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: {
            ...state.details[action.payload.id],
            users: action.payload.data,
          },
        },
      };
    default:
      return state;
  }
}
