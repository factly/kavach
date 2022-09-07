import {
  ADD_APPLICATION,
  ADD_APPLICATIONS,
  SET_APPLICATIONS_LOADING,
  RESET_APPLICATIONS,
  ADD_SPACE_IDS,
  ADD_APPLICATION_ROLE_IDS,
  ADD_APPLICATION_POLICY_IDS,
  ADD_APPLICATION_TOKEN_IDS,
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
          [action.payload.appID]: {
            ...state.details[action.payload.appID],
            spaces: action.payload.data,
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
    case ADD_APPLICATION_TOKEN_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: {
            ...state.details[action.payload.id],
            tokens: action.payload.data,
          },
        },
      };
    case ADD_APPLICATION_ROLE_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: {
            ...state.details[action.payload.id],
            roleIDs: action.payload.data,
          },
        },
      };
    case ADD_APPLICATION_POLICY_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: {
            ...state.details[action.payload.id],
            policyIDs: action.payload.data,
          },
        },
      };
    default:
      return state;
  }
}
