import {
  ADD_APPLICATION_USER,
  ADD_APPLICATION_USERS,
  SET_APPLICATION_USERS_LOADING,
  RESET_APPLICATION_USERS,
} from '../constants/applicationUser';

const initialState = {
  details: {},
  loading: true,
};

export default function application(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_APPLICATION_USERS:
      return {
        ...state,
        details: {},
        loading: true,
      };
    case SET_APPLICATION_USERS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_APPLICATION_USERS:
      if (action.payload.users.length === 0) {
        return state;
      }
      const obj = {};
      obj[action.payload.id] = action.payload.users;

      return {
        ...state,
        details: {
          ...state.details,
          ...obj,
        },
      };
    case ADD_APPLICATION_USER:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    default:
      return state;
  }
}
