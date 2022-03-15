import axios from 'axios';
import { ADD_ORGANISATION_USERS, ADD_ORGANISATION_ROLE } from '../constants/organisations';
import { ADD_USERS, SET_USERS_LOADING, RESET_USERS, USERS_API } from '../constants/users';
import { buildObjectOfItems, deleteKeys, getIds } from '../utils/objects';
import { addErrorNotification, addSuccessNotification } from './notifications';

export const getUsers = () => {
  return (dispatch, getState) => {
    dispatch(loadingUsers());
    return axios
      .get(USERS_API + '/' + getState().organisations.selected + '/users')
      .then((response) => {
        dispatch(addOrganisationUsers(response.data));
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
  data.map((user) => {
    orgRole[user.id] = user.permission.role;
  });
  return {
    type: ADD_ORGANISATION_ROLE,
    payload: orgRole,
  };
};

export const addOrganisationUsers = (data) => ({
  type: ADD_ORGANISATION_USERS,
  payload: getIds(data),
});
