import axios from 'axios';
import { ADD_USERS, SET_USERS_LOADING, RESET_USERS, USERS_API } from '../constants/users';

export const getUsers = () => {
  return (dispatch, getState) => {
    dispatch(loadingUsers());
    return axios
      .get(USERS_API + '/' + getState().organizations.selected + '/users')
      .then((response) => {
        dispatch(addUsersList(response.data));
        dispatch(stopUsersLoading());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const addUser = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingUsers());
    return axios
      .post(USERS_API + '/' + getState().organizations.selected + '/users', data)
      .then(() => {
        dispatch(resetUsers());
        dispatch(stopUsersLoading());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const deleteUser = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingUsers());
    return axios
      .delete(USERS_API + '/' + getState().organizations.selected + '/users/' + id)
      .then(() => {
        dispatch(resetUsers());
        dispatch(stopUsersLoading());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

const loadingUsers = () => ({
  type: SET_USERS_LOADING,
  payload: true,
});

const stopUsersLoading = () => ({
  type: SET_USERS_LOADING,
  payload: false,
});

const addUsersList = (data) => ({
  type: ADD_USERS,
  payload: data,
});

const resetUsers = () => ({
  type: RESET_USERS,
});
