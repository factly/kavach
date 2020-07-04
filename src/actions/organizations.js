import axios from 'axios';
import {
  ADD_ORGANIZATION,
  ADD_ORGANIZATIONS,
  SET_ORGANIZATIONS_LOADING,
  RESET_ORGANIZATIONS,
  ORGANIZATIONS_API,
  SET_SELECTED_ORGANIZATION,
} from '../constants/organizations';

export const getOrganizations = () => {
  return (dispatch, getState) => {
    dispatch(loadingOrganizations());
    return axios
      .get(ORGANIZATIONS_API + '/my')
      .then((response) => {
        dispatch(addOrganizationsList(response.data));
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const getOrganization = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingOrganizations());
    return axios
      .get(ORGANIZATIONS_API + '/' + id)
      .then((response) => {
        dispatch(getOrganizationByID(response.data));
        dispatch(stopOrganizationsLoading());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const addOrganization = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingOrganizations());
    return axios
      .post(ORGANIZATIONS_API, data)
      .then((response) => {
        dispatch(getOrganizationByID(response.data));
        dispatch(setSelectedOrganization(response.data.id));
        dispatch(stopOrganizationsLoading());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const updateOrganization = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingOrganizations());
    return axios
      .put(ORGANIZATIONS_API + '/' + data.id, data)
      .then((response) => {
        dispatch(getOrganizationByID(response.data));
        dispatch(stopOrganizationsLoading());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const deleteOrganization = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingOrganizations());
    return axios
      .delete(ORGANIZATIONS_API + '/' + id)
      .then(() => {
        dispatch(resetOrganizations());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const setSelectedOrganization = (id) => ({
  type: SET_SELECTED_ORGANIZATION,
  payload: id,
});

const loadingOrganizations = () => ({
  type: SET_ORGANIZATIONS_LOADING,
  payload: true,
});

const stopOrganizationsLoading = () => ({
  type: SET_ORGANIZATIONS_LOADING,
  payload: false,
});

const getOrganizationByID = (data) => ({
  type: ADD_ORGANIZATION,
  payload: data,
});

const addOrganizationsList = (data) => ({
  type: ADD_ORGANIZATIONS,
  payload: data,
});

const resetOrganizations = () => ({
  type: RESET_ORGANIZATIONS,
});
