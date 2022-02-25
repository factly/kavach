import axios from 'axios';
import {
  ADD_SPACE,
  SET_SPACES_LOADING,
  RESET_SPACES,
  SPACES_API,
  STOP_SPACES_LOADING,
  SET_SELECTED_APP,
} from '../constants/space';

import { ORGANISATIONS_API } from '../constants/organisations';

import { addErrorNotification, addSuccessNotification } from './notifications';

export const addSpace = (data, id) => {
  return (dispatch, getState) => {
    dispatch(loadingSpaces());
    return axios
      .post(
        `${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${id}${SPACES_API}`,
        data,
      ) // eslint-disable-next-line
      .then(() => {
        dispatch(addSuccessNotification('Space added successfully'));
        dispatch(stopLoadingSpaces());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
        dispatch(stopLoadingSpaces());
      });
  };
};

export const getSpaces = (id) => {
  return (dispatch, getState) => {
    dispatch(resetSpaces());
    return axios
      .get(
        `${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${id}${SPACES_API}`,
      ) // eslint-disable-next-line
      .then((response) => {
        dispatch(addSpaceReducer(response.data));
        dispatch(stopLoadingSpaces());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
        dispatch(stopLoadingSpaces());
      });
  };
};

export const editSpace = (id, appID, data) => {
  return (dispatch, getState) => {
    dispatch(loadingSpaces());
    return axios
      .put(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}${SPACES_API}/${id}`,
        data,
      )
      .then(() => {
        dispatch(addSuccessNotification('Space updated successfully'));
        dispatch(stopLoadingSpaces());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
        dispatch(stopLoadingSpaces());
      });
  };
};

export const deleteSpace = (appID, id) => {
  return (dispatch, getState) => {
    dispatch(loadingSpaces());
    return axios
      .delete(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}${SPACES_API}/${id}`,
      )
      .then(() => {
        dispatch(addSuccessNotification('Space deleted successfully'));
        dispatch(stopLoadingSpaces());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
        dispatch(stopLoadingSpaces());
      });
  };
};

const loadingSpaces = () => {
  return {
    type: SET_SPACES_LOADING,
    payload: true,
  };
};

const stopLoadingSpaces = () => {
  return {
    type: STOP_SPACES_LOADING,
    payload: false,
  };
};

export const setSelectedApp = (data) => {
  return {
    type: SET_SELECTED_APP,
    payload: data,
  };
};

const addSpaceReducer = (data) => {
  return {
    type: ADD_SPACE,
    payload: data,
  };
};

const resetSpaces = () => {
  return {
    type: RESET_SPACES,
  };
};
