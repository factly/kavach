import axios from 'axios';
import {
  SET_SPACES_LOADING,
  RESET_SPACES,
  SPACES_API,
  STOP_SPACES_LOADING,
  SET_SELECTED_APP,
  ADD_SPACES,
} from '../constants/space';

import { ORGANISATIONS_API } from '../constants/organisations';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { buildObjectOfItems, deleteKeys, getIds } from '../utils/objects';
import { addUsersList } from './users';
import { ADD_SPACE_IDS } from '../constants/application';
import { addMedia } from './media';
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
        response.data.map((space) => {
          space.user_ids = getIds(space.users);
          dispatch(addUsersList(buildObjectOfItems(space.users)));
          if (space.logo_id !== null) {
            dispatch(addMedia(space.logo));
          }
          deleteKeys([space], ['logo']);
          if (space.logo_mobile_id !== null) {
            dispatch(addMedia(space.logo_mobile));
          }
          deleteKeys([space], ['logo_mobile']);
          if (space.fav_icon_id !== null) {
            dispatch(addMedia(space.fav_icon));
          }
          deleteKeys([space], ['fav_icon']);
          if (space.mobile_icon_id !== null) {
            dispatch(addMedia(space.mobile_icon));
          }
          deleteKeys([space], ['mobile_icon']);
          return null;
        })
        deleteKeys(response.data, ['users']);
        dispatch(addSpaces(buildObjectOfItems(response.data)));
        const spaceIds = getIds(response.data);
        dispatch(addSpaceIds(spaceIds, id));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      }).finally(()=>{
        dispatch(stopLoadingSpaces());
      })
      ;
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

const addSpaceIds = (data, id) => {
  return {
    type: ADD_SPACE_IDS,
    payload: {
      id: id,
      space_ids: data,
    },
  };
};

const resetSpaces = () => {
  return {
    type: RESET_SPACES,
  };
};

export const addSpaces = (data) => {
  return {
    type: ADD_SPACES,
    payload: data,
  };
};
