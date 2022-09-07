import { ADD_MY_ORGANISATION_ROLE } from '../constants/organisations';
import {
  SET_PROFILE_LOADING,
  ADD_PROFILE,
  ADD_INVITE,
  DELETE_INVITE,
  ADD_PROFILE_DETAILS,
  ADD_ORGANISATION_IDS,
} from '../constants/profile';

const initialState = {
  details: {},
  roles: {},
  invitations: [],
  loading: true,
};

export default function profileReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PROFILE_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_PROFILE:
      return {
        ...state,
        details: action.payload,
      };
    case ADD_INVITE:
      return {
        ...state,
        invitations: action.payload,
      };
    case DELETE_INVITE:
      return {
        ...state,
        invitations: state.invitations.filter((invitation) => invitation.id !== action.payload),
      };
    case ADD_PROFILE_DETAILS:
      return {
        ...state,
      };
    case ADD_ORGANISATION_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          organisations: action.payload,
        },
      };
    case ADD_MY_ORGANISATION_ROLE:
      return {
        ...state,
        roles: action.payload,
      };
    default:
      return state;
  }
}
