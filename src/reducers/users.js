import { ADD_ORGANISATION_USERS } from '../constants/organisations';
import { ADD_USERS, SET_USERS_LOADING, RESET_USERS } from '../constants/users';

const initialState = {
  ids: [],
  details: {},
  organisations: {},
  loading: true,
};

export default function usersReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_USERS:
      return {
        ...state,
        ids: [],
        details: {},
        organisations: {},
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
    case ADD_ORGANISATION_USERS:
      const obj = {};
      obj[action.payload.org_id] = action.payload.users.map((item) => item.id);
      return {
        ...state,
        organisations: { ...state.organisations, ...obj },
        details: action.payload.users.reduce(
          (obj, item) => Object.assign(obj, { [item.id]: item }),
          {},
        ),
      };

    default:
      return state;
  }
}
