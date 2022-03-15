import axios from 'axios';
import {
  SET_SPACES_LOADING,
  SPACES_API,
  STOP_SPACES_LOADING,
  SET_SELECTED_APP,
  ADD_SPACES,
  ADD_SPACE,
} from '../constants/space';

import { ORGANISATIONS_API } from '../constants/organisations';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { buildObjectOfItems, deleteKeys, getIds, getValues } from '../utils/objects';
import { addUsersList } from './users';
import {  addMediaList } from './media';

export const createSpace = (data, id) => {
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
    dispatch(loadingSpaces());
    return axios
      .get(
        `${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${id}${SPACES_API}`,
      ) // eslint-disable-next-line
      .then((response) => {
        deleteKeys(response.data, ['application']);
        dispatch(addSpaces(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
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

export const loadingSpaces = () => {
  return {
    type: SET_SPACES_LOADING,
    payload: true,
  };
};

export const stopLoadingSpaces = () => {
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

export const addSpaces = (data) => (dispatch) => {
  dispatch(loadingSpaces());
  const media = getValues(data, ['logo', 'logo_mobile', 'fav_icon', 'mobile_icon']);
  dispatch(addMediaList(media));
  deleteKeys(data, ['logo', 'logo_mobile', 'fav_icon', 'mobile_icon', 'application']);
  const users = getValues(data, ['users']);
  dispatch(addUsersList(users));
  data.forEach((space) => {
    space.users = getIds(space.users);
  });
  dispatch({
    type: ADD_SPACES,
    payload: buildObjectOfItems(data),
  });
  dispatch(stopLoadingSpaces());
};

export const addSpace = (data) => {
  return {
    type: ADD_SPACE,
    payload: data,
  };
};
