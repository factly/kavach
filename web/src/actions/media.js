import axios from 'axios';
import {
  ADD_MEDIUM,
  ADD_MEDIA,
  ADD_MEDIA_REQUEST,
  SET_MEDIA_LOADING,
  RESET_MEDIA,
  MEDIA_API,
} from '../constants/media';
import { buildObjectOfItems } from '../utils/objects';

import { addErrorNotification, addSuccessNotification } from './notifications';

export const getMedia = (query) => {
  return (dispatch) => {
    dispatch(loadingMedia());
    return axios
      .get(MEDIA_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addMediaList(response.data.nodes));
        dispatch(
          addMediaRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopMediaLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getMedium = (id) => {
  return (dispatch) => {
    dispatch(loadingMedia());
    return axios
      .get(MEDIA_API + '/' + id)
      .then((response) => {
        dispatch(getMediumByID(response.data));
        dispatch(stopMediaLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addMedium = (data) => {
  return (dispatch) => {
    dispatch(loadingMedia());
    return axios
      .post(MEDIA_API, data)
      .then(() => {
        dispatch(resetMedia());
        dispatch(addSuccessNotification('Media Added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const updateMedium = (data) => {
  return (dispatch) => {
    dispatch(loadingMedia());
    return axios
      .put(MEDIA_API + '/' + data.id, data)
      .then((response) => {
        dispatch(getMediumByID(response.data));
        dispatch(stopMediaLoading());
        dispatch(addSuccessNotification('Media Updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deleteMedium = (id) => {
  return (dispatch) => {
    dispatch(loadingMedia());
    return axios
      .delete(MEDIA_API + '/' + id)
      .then(() => {
        dispatch(resetMedia());
        dispatch(addSuccessNotification('Media Deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addMedia = (media) => {
  return (dispatch) => {
    dispatch(addMediaList(media));
  };
};

export const loadingMedia = () => ({
  type: SET_MEDIA_LOADING,
  payload: true,
});

export const stopMediaLoading = () => ({
  type: SET_MEDIA_LOADING,
  payload: false,
});

export const getMediumByID = (data) => ({
  type: ADD_MEDIUM,
  payload: data,
});

export const addMediaList = (data) => (dispatch) => {
  dispatch({
    type: ADD_MEDIA,
    payload: buildObjectOfItems(data),
  });
};

export const addMediaRequest = (data) => ({
  type: ADD_MEDIA_REQUEST,
  payload: data,
});

export const resetMedia = () => ({
  type: RESET_MEDIA,
});
