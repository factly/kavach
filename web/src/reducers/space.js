import {
  ADD_SPACE,
  SET_SPACES_LOADING,
  RESET_SPACES,
  STOP_SPACES_LOADING,
  SET_SELECTED_APP,
  ADD_SPACES,
  ADD_SPACE_ROLE_IDS,
  ADD_SPACE_POLICY_IDS,
  ADD_SPACE_USERS,
  ADD_SPACE_TOKEN_IDS,
} from '../constants/space';
const initialState = {
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
        details: action.payload.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
      };
    case ADD_SPACES:
      return {
        ...state,
        details: { ...state.details, ...action.payload },
      };
    case ADD_SPACE_USERS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.spaceID]: {
            ...state.details[action.payload.spaceID],
            users: action.payload.data,
          },
        },
      };
    case RESET_SPACES:
      return {
        ...state,
        details: {},
        loading: true,
      };
    case SET_SELECTED_APP:
      return {
        ...state,
        selected: action.payload,
      };
    case ADD_SPACE_ROLE_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: {
            ...state.details[action.payload.id],
            roleIDs: action.payload.data,
          },
        },
      };
    case ADD_SPACE_POLICY_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: {
            ...state.details[action.payload.id],
            policyIDs: action.payload.data,
          },
        },
      };
    case ADD_SPACE_TOKEN_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.spaceID]: {
            ...state.details[action.payload.spaceID],
            tokens: action.payload.data,
          },
        },
      };
    default:
      return state;
  }
}
