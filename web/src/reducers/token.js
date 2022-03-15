import {
  ADD_APPLICATION_TOKENS,
  DELETE_APPLICATION_TOKEN,
  ADD_ORGANISATION_TOKENS,
  DELETE_ORGANISATION_TOKEN,
  ADD_SPACE_TOKENS,
  DELETE_SPACE_TOKEN,
  SET_TOKENS_LOADING,
} from '../constants/token';

const initialState = {
  organisations: [],
  applications: [],
  spaces: [],
  loading: true,
};

export default function tokensReducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_APPLICATION_TOKENS:
      return {
        ...state,
        applications: action.payload,
      };
    case DELETE_APPLICATION_TOKEN:
      return {
        ...state,
        applications: state.applications.filter((token) => token.id !== action.payload),
      };
    case ADD_ORGANISATION_TOKENS:
      return {
        ...state,
        organisations: action.payload,
      };
    case DELETE_ORGANISATION_TOKEN:
      return {
        ...state,
        organisations: state.organisations.filter((token) => token.id !== action.payload),
      };
    case ADD_SPACE_TOKENS:
      return {
        ...state,
        spaces: action.payload,
      };
    case DELETE_SPACE_TOKEN:
      return {
        ...state,
        spaces: state.spaces.filter((token) => token.id !== action.payload),
      };
    case SET_TOKENS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}
