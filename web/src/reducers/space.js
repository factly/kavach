import {
  ADD_SPACE,
  SET_SPACES_LOADING,
  RESET_SPACES,
  STOP_SPACES_LOADING,
  SET_SELECTED_APP,
} from '../constants/space';

const initialState = {
  ids: [],
  details: {},
  selected: null,
  loading: true,
};

export default function spaces(state = initialState, action = {}) {
  switch (action.type) {
    case SET_SPACES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case STOP_SPACES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_SPACE:
      return {
        ...state,
        ids: action.payload.map((item) => item.id),
        details: action.payload.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
      };
    case RESET_SPACES:
      return {
        ...state,
        ids: [],
        details: {},
        loading: true,
      };
    case SET_SELECTED_APP:
      return {
        ...state,
        selected: action.payload,
      };
    default:
      return state;
  }
}
