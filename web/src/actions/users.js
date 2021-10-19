import axios from 'axios';
import { ADD_ORGANISATION_USERS } from '../constants/organisations';
import { ADD_USERS, SET_USERS_LOADING, RESET_USERS, USERS_API } from '../constants/users';
import {
  addErrorNotification,
  addSuccessNotification,
  addWarningNotification,
} from './notifications';

export const getUsers = () => {
  return (dispatch, getState) => {
    dispatch(loadingUsers());
    return axios
      .get(USERS_API + '/' + getState().organisations.selected + '/users')
      .then((response) => {
        dispatch(addUsersList(response.data));
        dispatch(stopUsersLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addUser = (data, history) => {
  return (dispatch, getState) => {
    dispatch(loadingUsers());
    return axios
      .post(USERS_API + '/' + getState().organisations.selected + '/users', data)
      .then((res) => {
        dispatch(resetUsers());
        dispatch(stopUsersLoading());
        dispatch(addSuccessNotification('Users added'));
        history.push('/users');
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getAllUsers = () => {
  return (dispatch, getState) => {
    return axios
      .get(`/organisations/${getState().organisations.selected}/users`)
      .then((res) => {
        dispatch(
          addOrganisationUsersList({
            users: res.data,
            org_id: getState().organisations.selected,
          }),
        );
        dispatch(stopUsersLoading());
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

export const addUsersList = (data) => ({
  type: ADD_USERS,
  payload: data,
});

export const addOrganisationUsersList = (data) => ({
  type: ADD_ORGANISATION_USERS,
  payload: data,
});

export const resetUsers = () => ({
  type: RESET_USERS,
});
