import { ADD_USERS, SET_USERS_LOADING, RESET_USERS } from '../constants/users';

const initialState = {
  details: {},
  loading: true,
};

export default function usersReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_USERS:
      return {
        ...state,
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
        details: { ...state.details, ...action.payload },
      };
    default:
      return state;
  }
}
