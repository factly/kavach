import {
  ROLES_LOADING,
  ADD_APPLICATION_ROLES,
  ADD_ORGANISATION_ROLES,
  ADD_SPACE_ROLES,
  ADD_ORGANISATION_ROLE_BY_ID,
  ADD_APPLICATION_ROLE_BY_ID,
  ADD_SPACE_ROLE_BY_ID,
} from '../constants/roles';

const initialState = {
  organisation: {},
  application: {},
  space: {},
  loading: true,
};

export default function rolesReducer(state = initialState, action = {}) {
  switch (action.type) {
    case ROLES_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_ORGANISATION_ROLES:
      return {
        ...state,
        organisation: {
          ...state.organisation,
          [action.payload.id]: action.payload.data,
        },
      };
    case ADD_APPLICATION_ROLES:
      return {
        ...state,
        application: {
          ...state.application,
          [action.payload.id]: action.payload.data,
        },
      };
    case ADD_SPACE_ROLES:
      return {
        ...state,
        space: {
          ...state.space,
          [action.payload.id]: action.payload.data,
        },
      };
    case ADD_ORGANISATION_ROLE_BY_ID:
      return {
        ...state,
        organisation: {
          ...state.organisation,
          [action.payload.orgID]: {
            ...state.organisation[action.payload.orgID],
            [action.payload.roleID]: action.payload.data,
          },
        },
      };
    case ADD_APPLICATION_ROLE_BY_ID:
      return {
        ...state,
        application: {
          ...state.application,
          [action.payload.appID]: {
            ...state.application[action.payload.appID],
            [action.payload.roleID]: action.payload.data,
          },
        },
      };
    case ADD_SPACE_ROLE_BY_ID:
      return {
        ...state,
        space: {
          ...state.space,
          [action.payload.spaceID]: {
            ...state.organisation[action.payload.spaceID],
            [action.payload.roleID]: action.payload.data,
          },
        },
      };
    default:
      return state;
  }
}
