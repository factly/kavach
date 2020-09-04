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
};

export default function tagsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_ORGANISATIONS:
      return {
        ...state,
        ids: [],
        details: {},
        loading: true,
        selected: 0,
      };
    case SET_ORGANISATIONS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_ORGANISATIONS:
      return {
        ...state,
        ids: action.payload.map((item) => item.id),
        details: action.payload.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
        selected: action.payload[0].id,
      };
    case ADD_ORGANISATION:
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
    case SET_SELECTED_ORGANISATION:
      return {
        ...state,
        selected: action.payload,
      };
    default:
      return state;
  }
}
