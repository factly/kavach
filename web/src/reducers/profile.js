import {
  SET_PROFILE_LOADING,
  ADD_PROFILE,
  ADD_INVITE,
  DELETE_INVITE,
  ADD_PROFILE_DETAILS,
} from '../constants/profile';

const initialState = {
  details: {},
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
    default:
      return state;
  }
}
