import axios from 'axios';
import {
  ADD_ORGANISATION,
  ADD_ORGANISATIONS,
  SET_ORGANISATIONS_LOADING,
  RESET_ORGANISATIONS,
  ORGANISATIONS_API,
  SET_SELECTED_ORGANISATION,
} from '../constants/organisations';
import { ADD_ORGANISATION_IDS } from '../constants/profile';
import { buildObjectOfItems, deleteKeys, getIds, getValues } from '../utils/objects';
import { addApplicationList } from './application';
import { addMedia, addMediaList } from './media';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addUsersList } from './users';

export const getOrganisations = () => {
  return (dispatch, getState) => {
    dispatch(loadingOrganisations());
    return axios
      .get(ORGANISATIONS_API + '/my')
      .then((response) => {
        dispatch(addOrganisationsList(response.data));
        dispatch(addOrganisationIds(getIds(response.data)));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopOrganisationsLoading());
      });
  };
};

export const getOrganisation = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingOrganisations());
    return axios
      .get(ORGANISATIONS_API + '/' + id)
      .then((response) => {
        if (response.featured_medium_id) {
          addMedia(response.data.medium);
        }
        let users = [];
        response.data.roles = {};
        response.data.organisation_users.map((item) => {
          users.push(item.user);
          response.data.roles[item.user.id] = item.role;
          return null;
        });
        response.data.role = response.data.permission.role;
        deleteKeys([response.data], ['permission', 'organisation_users']);
        response.data.applications = getIds(response.data.applications);
        response.data.users = getIds(users);
        dispatch(getOrganisationByID(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(()=>{
        dispatch(stopOrganisationsLoading());
      })
      ;
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
        dispatch(addSuccessNotification('Organisation added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopOrganisationsLoading());
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
        dispatch(addSuccessNotification('Organisation Updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
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
        dispatch(addSuccessNotification('Organisation Deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
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

export const addOrganisationsList = (data, id) => (dispatch) => {
  const medium = getValues(data, 'medium');
  dispatch(addMediaList(medium));
  const applications = getValues(data, 'applications');
  dispatch(addApplicationList(applications));
  data.forEach((organisation) => {
    let users = [];
    organisation.roles = {};
    organisation.organisation_users.map((item) => {
      users.push(item.user);
      if (item.user.id === id) {
        organisation.role = item.role;
      }
      organisation.roles[item.user.id] = item.role;
      return null;
    });
    dispatch(addUsersList(users));
    organisation.users = getIds(users);
    organisation.applications = getIds(organisation.applications);
    deleteKeys([organisation], ['organisation_users', 'medium']);
  });
  const ids = getIds(data);
  dispatch({
    type: ADD_ORGANISATIONS,
    payload: {
      data: buildObjectOfItems(data),
      ids: ids,
    },
  });
};

export const resetOrganisations = () => ({
  type: RESET_ORGANISATIONS,
});

export const addOrganisationIds = (ids) => (dispatch) => {
  dispatch({
    type: ADD_ORGANISATION_IDS,
    payload: ids,
  });
};
