import {
  ADD_ORGANISATION,
  ADD_ORGANISATIONS,
  SET_ORGANISATIONS_LOADING,
  RESET_ORGANISATIONS,
  SET_SELECTED_ORGANISATION,
  ADD_ORGANISATION_USERS,
  ADD_APPLICATION_IDS,
  ADD_ORGANISATION_ROLE,
  ADD_ORGANISATION_ROLE_IDS,
} from '../constants/organisations';
import { ADD_ORGANISATION_TOKENS } from '../constants/token';

const initialState = {
  ids: [],
  details: {},
  loading: true,
  selected: 0,
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
      const organisationData = { ...state.details, ...payload.data };
      return {
        ...state,
        ids: Object.keys(organisationData).map((id) => parseInt(id, 10)),
        details: organisationData,
        selected: payload.ids[0],
        role: organisationData[payload.ids[0]].role,
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
    case ADD_ORGANISATION_USERS:
      return {
        ...state,
        details: {
          ...state.details,
          [state.selected]: {
            ...state.details[state.selected],
            users: payload,
          },
        },
      };
    case SET_SELECTED_ORGANISATION:
      return {
        ...state,
        selected: payload,
        role: state.details[payload].role,
      };
    case ADD_APPLICATION_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [state.selected]: {
            ...state.details[state.selected],
            applications: payload,
          },
        },
      };
    case ADD_ORGANISATION_ROLE:
      return {
        ...state,
        details: {
          ...state.details,
          [state.selected]: {
            ...state.details[state.selected],
            role: payload,
          },
        },
      };
    case ADD_ORGANISATION_TOKENS:
      return {
        ...state,
        details: {
          ...state.details,
          [state.selected]: {
            ...state.details[state.selected],
            tokens: payload,
          },
        },
      };
    case ADD_ORGANISATION_ROLE_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [state.selected]: {
            ...state.details[state.selected],
            roles: payload,
          },
        },
      };
    default:
      return state;
  }
}
