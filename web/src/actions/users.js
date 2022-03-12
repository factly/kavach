import axios from 'axios';
import { ADD_ORGANISATION_USERS } from '../constants/organisations';
import { ADD_USERS, SET_USERS_LOADING, RESET_USERS, USERS_API } from '../constants/users';
import { buildObjectOfItems, getIds } from '../utils/objects';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { loadingOrganisations, stopOrganisationsLoading } from './organisations';

export const getUsers = () => {
  return (dispatch, getState) => {
    dispatch(loadingUsers());
    return axios
      .get(USERS_API + '/' + getState().organisations.selected + '/users')
      .then((response) => {
        dispatch(addUsersList(buildObjectOfItems(response.data)));
        dispatch(addOrganisationUsers(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopUsersLoading());
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
    dispatch(loadingUsers());
    dispatch(loadingOrganisations());
    return axios
      .get(`/organisations/${getState().organisations.selected}/users`)
      .then((res) => {
        dispatch(addUsersList(buildObjectOfItems(res.data)));
        dispatch(addOrganisationUsers(res.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopUsersLoading());
        dispatch(stopOrganisationsLoading());
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

const addOrganisationUsers = (data) => ({
  type: ADD_ORGANISATION_USERS,
  payload: getIds(data),
});
