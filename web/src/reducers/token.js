import { ADD_TOKENS, SET_TOKENS_LOADING } from '../constants/token';

const initialState = {
  details: {},
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
    default:
      return state;
  }
}
