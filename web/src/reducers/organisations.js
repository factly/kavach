import {
  ADD_ORGANISATION,
  ADD_ORGANISATIONS,
  SET_ORGANISATIONS_LOADING,
  RESET_ORGANISATIONS,
  SET_SELECTED_ORGANISATION,
  ADD_ORGANISATION_USERS,
  ADD_APPLICATION_IDS,
} from '../constants/organisations';
import { buildObjectOfItems } from '../utils/objects';

const initialState = {
  ids: [],
  details: {},
  loading: true,
  selected: 0,
  role: 'member',
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
      return {
        ...state,
        ids: payload.map((item) => item.id),
        details: buildObjectOfItems(payload),
        selected: payload[0].id,
        role: payload[0].permission.role,
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
            user_ids: payload,
          },
        },
      };
    case SET_SELECTED_ORGANISATION:
      return {
        ...state,
        selected: payload,
        role: state.details[payload].permission.role,
      };
    case ADD_APPLICATION_IDS:
      return {
        ...state,
        details: {
          ...state.details,
          [state.selected]: {
            ...state.details[state.selected],
            application_ids: payload,
          },
        },
      };
    default:
      return state;
  }
}
