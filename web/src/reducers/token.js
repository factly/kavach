import {
  ADD_APPLICATION_TOKENS,
  ADD_TOKENS,
  SET_TOKENS_LOADING,
  ADD_ORGANISATION_TOKENS,
  ADD_SPACE_TOKENS,
} from '../constants/token';

const initialState = {
  organisation: {},
  application: {},
  space: {},
  loading: true,
};

export default function tokensReducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_TOKENS:
      return {
        ...state,
        details: { ...state.details, ...action.payload },
      };
    case SET_TOKENS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_ORGANISATION_TOKENS:
      return {
        ...state,
        organisation: {
          ...state.organisation,
          [action.payload.id]: action.payload.data,
        },
      };
    case ADD_APPLICATION_TOKENS:
      return {
        ...state,
        application: {
          ...state.application,
          [action.payload.id]: action.payload.data,
        },
      };
    case ADD_SPACE_TOKENS:
      return {
        ...state,
        space: {
          ...state.space,
          [action.payload.spaceID]: action.payload.data,
        },
      };
    default:
      return state;
  }
}
