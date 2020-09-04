import axios from 'axios';
import {
  ADD_ORGANISATION,
  ADD_ORGANISATIONS,
  SET_ORGANISATIONS_LOADING,
  RESET_ORGANISATIONS,
  ORGANISATIONS_API,
  SET_SELECTED_ORGANISATION,
} from '../constants/organisations';

export const getOrganisations = () => {
  return (dispatch, getState) => {
    dispatch(loadingOrganisations());
    return axios
      .get(ORGANISATIONS_API + '/my')
      .then((response) => {
        dispatch(addOrganisationsList(response.data));
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const getOrganisation = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingOrganisations());
    return axios
      .get(ORGANISATIONS_API + '/' + id)
      .then((response) => {
        dispatch(getOrganisationByID(response.data));
        dispatch(stopOrganisationsLoading());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const addOrganisation = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingOrganisations());
    return axios
      .post(ORGANISATIONS_API, data)
      .then((response) => {
        dispatch(getOrganisationByID(response.data));
        dispatch(setSelectedOrganisation(response.data.id));
        dispatch(stopOrganisationsLoading());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const updateOrganisation = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingOrganisations());
    return axios
      .put(ORGANISATIONS_API + '/' + data.id, data)
      .then((response) => {
        dispatch(getOrganisationByID(response.data));
        dispatch(stopOrganisationsLoading());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const deleteOrganisation = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingOrganisations());
    return axios
      .delete(ORGANISATIONS_API + '/' + id)
      .then(() => {
        dispatch(resetOrganisations());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
};

export const setSelectedOrganisation = (id) => ({
  type: SET_SELECTED_ORGANISATION,
  payload: id,
});

export const loadingOrganisations = () => ({
  type: SET_ORGANISATIONS_LOADING,
  payload: true,
});

export const stopOrganisationsLoading = () => ({
  type: SET_ORGANISATIONS_LOADING,
  payload: false,
});

export const getOrganisationByID = (data) => ({
  type: ADD_ORGANISATION,
  payload: data,
});

export const addOrganisationsList = (data) => ({
  type: ADD_ORGANISATIONS,
  payload: data,
});

export const resetOrganisations = () => ({
  type: RESET_ORGANISATIONS,
});
