import { ADD_USERS, SET_USERS_LOADING, RESET_USERS } from '../constants/users';

const initialState = {
  ids: [],
  details: {},
  loading: true,
};

export default function usersReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_USERS:
      return {
        ...state,
        ids: [],
        details: {},
        loading: true,
      };
    case SET_USERS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_USERS:
      return {
        ...state,
        ids: action.payload.map((item) => item.id),
        details: action.payload.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
      };
    default:
      return state;
  }
}
