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
  ADD_ORGANISATION_POLICY_IDS,
  ADD_ORGANISATION_TOKEN_IDS,
} from '../constants/organisations';

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
      };
    case SET_ORGANISATIONS_LOADING:
      return {
        ...state,
        loading: payload,
      };
    case ADD_ORGANISATIONS:
      const organisationData = { ...state.details, ...payload.data };
      const { selected } = { ...state };
      return {
        ...state,
        ids: payload.ids,
        details: organisationData,
        selected: selected === 0 ? payload.ids[0] : selected,
      };
    case ADD_ORGANISATION:
      return {
        ...state,
        ids: state.ids.includes(payload.id) ? state.ids : state.ids.concat([payload.id]),
        details: {
          ...state.details,
          [payload.id]: payload.data,
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
            roles: payload,
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
            roleIDs: payload,
          },
        },
      };
    case ADD_ORGANISATION_POLICY_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [state.selected]: {
            ...state.details[state.selected],
            policyIDs: payload,
          },
        },
      };
    case ADD_ORGANISATION_TOKEN_IDS:
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
    default:
      return state;
  }
}
