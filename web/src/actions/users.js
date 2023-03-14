import axios from 'axios';
import { ADD_ORGANISATION_USERS, ADD_ORGANISATION_ROLE } from '../constants/organisations';
import { ADD_USERS, SET_USERS_LOADING, RESET_USERS, USERS_API } from '../constants/users';
import { buildObjectOfItems, deleteKeys, getIds } from '../utils/objects';
import { addMedia } from './media';
import { addErrorNotification, addSuccessNotification } from './notifications';

export const getUsers = () => {
  return (dispatch, getState) => {
    dispatch(loadingUsers());
    return axios
      .get(USERS_API + '/' + getState().organisations.selected + '/users')
      .then((response) => {
        dispatch(addOrganisationUsers(response.data));
        if (response.data.length > 0) {
          response.data.forEach((user) => {
            if (user.featured_medium_id) {
              addMedia(user.medium);
            }
          });
        }
        dispatch(addOrganisationRole(response.data));
        deleteKeys(response.data, ['permission', 'medium']);
        dispatch(addUsersList(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopUsersLoading());
      });
  };
};

export const addUser = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingUsers());
    return axios
      .post(USERS_API + '/' + getState().organisations.selected + `/users/?return_to=${window.REACT_APP_PUBLIC_URL}/profile/invite`, data)
      .then((res) => {
        dispatch(resetUsers());
        dispatch(stopUsersLoading());
        dispatch(addSuccessNotification('Users added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deleteUser = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingUsers());
    return axios
      .delete(USERS_API + '/' + getState().organisations.selected + '/users/' + id)
      .then(() => {
        dispatch(resetUsers());
        dispatch(stopUsersLoading());
        dispatch(addSuccessNotification('User deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const loadingUsers = () => ({
  type: SET_USERS_LOADING,
  payload: true,
});

export const stopUsersLoading = () => ({
  type: SET_USERS_LOADING,
  payload: false,
});

export const addUsersList = (data) => (dispatch) => {
  dispatch({
    type: ADD_USERS,
    payload: buildObjectOfItems(data),
  });
};

export const addOrganisationUsersList = (data) => ({
  type: ADD_ORGANISATION_USERS,
  payload: data,
});

export const resetUsers = () => ({
  type: RESET_USERS,
});

export const addOrganisationRole = (data) => (dispatch) => {
  const orgRole = {};
  data.forEach((user) => {
    if (user.permission?.role) {
      orgRole[user.id] = user.permission?.role;
    }
  });

  dispatch({
    type: ADD_ORGANISATION_ROLE,
    payload: orgRole,
  });
};

export const addOrganisationUsers = (data) => ({
  type: ADD_ORGANISATION_USERS,
  payload: getIds(data),
});
