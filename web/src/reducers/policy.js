import {
  POLICY_LOADING,
  ADD_APPLICATION_POLICY,
  ADD_ORGANISATION_POLICY,
  ADD_SPACE_POLICY,
  ADD_ORGANISATION_POLICY_BY_ID,
  ADD_APPLICATION_POLICY_BY_ID,
  ADD_SPACE_POLICY_BY_ID,
} from '../constants/policy';

const initialState = {
  organisation: {},
  application: {},
  space: {},
  loading: true,
};

export default function policyReducer(state = initialState, action = {}) {
  switch (action.type) {
    case POLICY_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_ORGANISATION_POLICY:
      return {
        ...state,
        organisation: {
          ...state.organisation,
          [action.payload.id]: action.payload.data,
        },
      };
    case ADD_APPLICATION_POLICY:
      return {
        ...state,
        application: {
          ...state.application,
          [action.payload.id]: action.payload.data,
        },
      };
    case ADD_SPACE_POLICY:
      return {
        ...state,
        space: {
          ...state.space,
          [action.payload.id]: action.payload.data,
        },
      };
    case ADD_ORGANISATION_POLICY_BY_ID:
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
    case ADD_APPLICATION_POLICY_BY_ID:
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
    case ADD_SPACE_POLICY_BY_ID:
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
