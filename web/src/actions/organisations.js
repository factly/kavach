import axios from 'axios';
import {
  ADD_ORGANISATION,
  ADD_ORGANISATIONS,
  SET_ORGANISATIONS_LOADING,
  RESET_ORGANISATIONS,
  ORGANISATIONS_API,
  SET_SELECTED_ORGANISATION,
  ADD_MY_ORGANISATION_ROLE,
  ADD_ORGANISATION_TOKEN_IDS,
} from '../constants/organisations';
import { ADD_ORGANISATION_IDS } from '../constants/profile';
import { buildObjectOfItems, deleteKeys, getIds, getValues } from '../utils/objects';
import { addApplicationList } from './application';
import { addMedia, addMediaList } from './media';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addOrganisationPolicy } from './policy';
import { loadingProfile, stopProfileLoading } from './profile';
import { addOrganisationRoles } from './roles';
import { addUsersList } from './users';

export const resetOrganisations = () => ({
  type: RESET_ORGANISATIONS,
});

export const addOrganisationIds = (ids) => (dispatch) => {
  dispatch({
    type: ADD_ORGANISATION_IDS,
    payload: ids,
  });
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

export const addOrganisationByID = (data) => {
  return {
    type: ADD_ORGANISATION,
    payload: {
      id: data.id,
      data: data,
    },
  };
};

export const addMyOrganisationRole = (roles) => {
  return {
    type: ADD_MY_ORGANISATION_ROLE,
    payload: roles,
  };
};

export const getOrganisations = () => {
  return (dispatch, getState) => {
    dispatch(loadingOrganisations());
    dispatch(loadingProfile());
    return axios
      .get(ORGANISATIONS_API + '/my')
      .then((response) => {
        let roleMap = {};
        response.data.forEach((org) => {
          roleMap[org.organisation.id] = org.permission.role;
        });
        if(response.data?.length > 0){
          var orgList = response.data.map((org) => ({...org.organisation, applications: org.applications}))
          dispatch(addOrganisationsList(orgList));
          dispatch(addOrganisationIds(getIds(orgList)));
        }
        dispatch(addMyOrganisationRole(roleMap));
        


      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopOrganisationsLoading());
        dispatch(stopProfileLoading());
      });
  };
};

export const getOrganisation = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingOrganisations());
    return axios
      .get(ORGANISATIONS_API + '/' + id)
      .then((response) => {
        if (response.data.organisation?.featured_medium_id) {
          addMedia(response.data.organisation.medium);
        }
        if (response.data.organisation.roles?.length) {
          response.data.organisation.roles.forEach((role) => {
            dispatch(addUsersList(role.users));
            role.users = getIds(role.users);
          });
          dispatch(addOrganisationRoles(id, buildObjectOfItems(response.data.organisation.roles)));
          response.data.organisation.roleIDs = getIds(response.data.organisation.roles);
          delete response.data.organisation.roles
        }
        
        if (response.data.organisation.policies?.length) {
          dispatch(addOrganisationPolicy(id, response.data.organisation.policies));
          response.data.organisation.policyIDs = getIds(response.data.organisation.policies);
          delete response.data.organisation.policies;
        }
        
        let users = [];
        response.data.organisation.roles = {};
        response.data.organisation.organisation_users.map((item) => {
          users.push(item.user);
          response.data.organisation.roles[item.user.id] = item.role;
          return null;
        });
        response.data.organisation.role = response.data.permission.role;
        deleteKeys([response.data.organisation], ['organisation_users', 'medium']);
        response.data.applications = getIds(response.data.organisation.applications);
        response.data.organisation.users = getIds(users);
        dispatch(addUsersList(users))
        dispatch(addOrganisationByID(response.data.organisation));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopOrganisationsLoading());
      });
  };
};

export const addOrganisation = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingOrganisations());
    return axios
      .post(ORGANISATIONS_API, data)
      .then((response) => {
        dispatch(addOrganisationByID(response.data.organisation));
        dispatch(setSelectedOrganisation(response.data.organisation.id));
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
        dispatch(addOrganisationByID(response.data));
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

export const addOrganisationsList = (data, id) => (dispatch) => {
  const medium = getValues(data, 'medium');
  dispatch(addMediaList(medium));
  const applications = getValues(data, 'applications');
  dispatch(addApplicationList(applications));
  data.forEach((organisation) => {
    let users = [];
    organisation.roles = {};
    if (organisation && organisation.organisation_users) {
      organisation.organisation_users.map((item) => {
        if(item?.user){
          users.push(item.user);
          if (item.user.id === id) {
            organisation.role = item.role;
          }
          organisation.roles[item.user.id] = item.role;
        }else{
          organisation.roles[item.user_id] = item.role
        }
        return null;
      });
    }
    
    dispatch(addUsersList(users));
    organisation.users = getIds(users);
    organisation.applications = getIds(organisation.applications);
    if (organisation.roles?.length) {
     organisation.roles.forEach((role) => {
        role.users = getIds(role.users);
      });
      dispatch(addOrganisationRoles(id, buildObjectOfItems(organisation.roles)));
      organisation.roleIDs = getIds(organisation.roles);
      delete organisation.roles
    }
    if (organisation.policies?.length) {
      dispatch(addOrganisationPolicy(id, organisation.policies));
      organisation.policyIDs = getIds(organisation.policies);
      delete organisation.policies;
    }
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

export const addOrganisationTokenIDs = (tokenIDs) => {
  return {
    type: ADD_ORGANISATION_TOKEN_IDS,
    payload: tokenIDs,
  };
};
