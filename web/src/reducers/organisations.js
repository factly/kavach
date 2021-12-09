import {
  ADD_ORGANISATION,
  ADD_ORGANISATIONS,
  SET_ORGANISATIONS_LOADING,
  RESET_ORGANISATIONS,
  SET_SELECTED_ORGANISATION,
} from '../constants/organisations';

const initialState = {
  ids: [],
  details: {},
  loading: true,
  selected: 0,
  role: 'member',
};

export default function tagsReducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case RESET_ORGANISATIONS:
      return {
        ...state,
        ids: [],
        details: {},
        loading: true,
        selected: 0,
        role: 'member',
      };
    case SET_ORGANISATIONS_LOADING:
      return {
        ...state,
        loading: payload,
      };
    case ADD_ORGANISATIONS:
      return {
        ...state,
        ids: payload.map((item) => item.id),
        details: payload.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
        selected: payload[0].id,
        role: payload[0].permission.role,
      };
    case ADD_ORGANISATION:
      return {
        ...state,
        ids: state.ids.includes(payload.id) ? state.ids : state.ids.concat([payload.id]),
        details: {
          ...state.details,
          [payload.id]: payload,
        },
      };
    case SET_SELECTED_ORGANISATION:
      return {
        ...state,
        selected: payload,
        role: state.details[payload].permission.role,
      };
    default:
      return state;
  }
}
