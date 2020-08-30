import {
  ADD_ORGANIZATION,
  ADD_ORGANIZATIONS,
  SET_ORGANIZATIONS_LOADING,
  RESET_ORGANIZATIONS,
  SET_SELECTED_ORGANIZATION,
} from '../constants/organizations';

const initialState = {
  ids: [],
  details: {},
  loading: true,
  selected: 0,
};

export default function tagsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_ORGANIZATIONS:
      return {
        ...state,
        ids: [],
        details: {},
        loading: true,
        selected: 0,
      };
    case SET_ORGANIZATIONS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_ORGANIZATIONS:
      return {
        ...state,
        ids: action.payload.map((item) => item.id),
        details: action.payload.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
        selected: action.payload[0].id,
      };
    case ADD_ORGANIZATION:
      return {
        ...state,
        ids: state.ids.includes(action.payload.id)
          ? state.ids
          : state.ids.concat([action.payload.id]),
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case SET_SELECTED_ORGANIZATION:
      return {
        ...state,
        selected: action.payload,
      };
    default:
      return state;
  }
}
