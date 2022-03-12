import {
  ADD_APPLICATION,
  ADD_APPLICATIONS,
  ADD_APPLICATIONS_REQUEST,
  SET_APPLICATIONS_LOADING,
  RESET_APPLICATIONS,
  ADD_SPACE_IDS,
} from '../constants/application';
import deepEqual from 'deep-equal';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function application(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_APPLICATIONS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_APPLICATIONS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_APPLICATIONS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_APPLICATIONS:
      return {
        ...state,
        details: { ...state.details, ...action.payload },
      };
    case ADD_APPLICATION:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case ADD_SPACE_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: {
            ...state.details[action.payload.id],
            space_ids: action.payload.space_ids,
          },
        },
      };
    default:
      return state;
  }
}
