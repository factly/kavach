import {
  GET_DEFAULT_APPLICATIONS,
  SET_DEFAULT_APPLICATION_LOADING,
} from '../constants/application';

const initialState = {
  applications: [],
  loading: true,
};

export default function defaultApplications(state = initialState, action = {}) {
  switch (action.type) {
    case SET_DEFAULT_APPLICATION_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case GET_DEFAULT_APPLICATIONS:
      return {
        ...state,
        applications: action.payload,
      };
    default:
      return state;
  }
}
