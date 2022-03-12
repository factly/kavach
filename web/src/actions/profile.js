import axios from 'axios';
import {
  SET_PROFILE_LOADING,
  ADD_PROFILE,
  PROFILE_API,
  ADD_INVITE,
  DELETE_INVITE,
} from '../constants/profile';
import { buildObjectOfItems, deleteKeys, getIds } from '../utils/objects';
import { addApplicationsList, loadingApplications, stopApplicationLoading } from './application';
import { addMedia } from './media';
import { addErrorNotification, addSuccessNotification } from './notifications';
import {
  addOrganisationsList,
  getOrganisations,
  loadingOrganisations,
  stopOrganisationsLoading,
} from './organisations';
import { addSpaces, stopLoadingSpaces, loadingSpaces } from './space';
import { addUsersList, loadingUsers, stopUsersLoading } from './users';

export const getUserProfile = () => {
  return (dispatch, getState) => {
    dispatch(loadingProfile());
    return axios
      .get(PROFILE_API)
      .then((response) => {
        dispatch(getProfile(response.data));
        dispatch(stopProfileLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};
export const updateProfile = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingProfile());
    return axios
      .put(PROFILE_API, data)
      .then((response) => {
        dispatch(getProfile(response.data));
        dispatch(stopProfileLoading());
        dispatch(addSuccessNotification('Profile Updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getInvitation = () => {
  return (dispatch, getState) => {
    dispatch(loadingProfile);
    return axios
      .get(PROFILE_API + '/invite')
      .then((response) => {
        dispatch(getInvite(response.data));
        dispatch(stopProfileLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deleteInvitation = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingProfile);
    return axios
      .delete(PROFILE_API + '/invite/' + id)
      .then(() => {
        dispatch(deleteInvite(id));
        dispatch(stopProfileLoading());
        dispatch(addSuccessNotification('Request declined successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const acceptInvitation = (id, data) => {
  return (dispatch, getState) => {
    dispatch(loadingProfile);
    return axios
      .put(PROFILE_API + '/invite/' + id, data)
      .then(() => {
        dispatch(deleteInvite(id));
        dispatch(getOrganisations());
        dispatch(addSuccessNotification('Request accepted successfully'));
        dispatch(stopProfileLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getProfileDetails = () => {
  return (dispatch, getState) => {
    dispatch(loadingProfile);
    dispatch(loadingUsers());
    dispatch(loadingSpaces());
    dispatch(loadingOrganisations());
    dispatch(loadingApplications());
    return axios
      .get(PROFILE_API + '/details')
      .then((response) => {
        response.data.spaces.map((space) => {
          space.user_ids = getIds(space.users);
          dispatch(addUsersList(buildObjectOfItems(space.users)));
          if (space.logo_id !== null) {
            dispatch(addMedia(space.logo));
          }
          deleteKeys([space], ['logo']);
          if (space.logo_mobile_id !== null) {
            dispatch(addMedia(space.logo_mobile));
          }
          deleteKeys([space], ['logo_mobile']);
          if (space.fav_icon_id !== null) {
            dispatch(addMedia(space.fav_icon));
          }
          deleteKeys([space], ['fav_icon']);
          if (space.mobile_icon_id !== null) {
            dispatch(addMedia(space.mobile_icon));
          }
          deleteKeys([space], ['mobile_icon']);
          return null;
        });
        deleteKeys(response.data.spaces, ['users']);
        dispatch(addSpaces(buildObjectOfItems(response.data.spaces)));
        response.data.applications.map((application) => {
          if (application.medium_id !== null) {
            dispatch(addMedia(application.medium));
          }
          deleteKeys([application], ['medium']);
          application.user_ids = getIds(application.users);
          application.space_ids = [];
          response.data.spaces.map((space) => {
            if (space.application_id === application.id) {
              application.space_ids.push(space.id);
            }
            return null;
          });
          dispatch(addUsersList(buildObjectOfItems(application.users)));
          return null;
        });
        deleteKeys(response.data.applications, ['users']);
        dispatch(addApplicationsList(buildObjectOfItems(response.data.applications)));
        response.data.organisations.map((organisation) => {
          if (organisation.featured_medium_id !== null) {
            dispatch(addMedia(organisation.medium));
          }
          deleteKeys([organisation], ['medium']);
          organisation.application_ids = [];
          response.data.applications.map((application) => {
            if (application.organisation_id === organisation.id) {
              organisation.application_ids.push(application.id);
            }
            return null;
          });
          return null;
        });
        deleteKeys(response.data.organisations, ['users']);
        dispatch(addOrganisationsList(response.data.organisations));
        response.data.organisation_ids = getIds(response.data.organisations);
        deleteKeys([response.data], ['applications', 'spaces', 'organisations']);
        if (response.data.featured_medium_id !== null) {
          dispatch(addMedia(response.data.medium));
        }
        deleteKeys([response.data], ['medium']);
        dispatch(getProfile(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopProfileLoading());
        dispatch(stopUsersLoading());
        dispatch(stopLoadingSpaces());
        dispatch(stopOrganisationsLoading());
        dispatch(stopApplicationLoading());
      });
  };
};

export const loadingProfile = () => ({
  type: SET_PROFILE_LOADING,
  payload: true,
});

export const stopProfileLoading = () => ({
  type: SET_PROFILE_LOADING,
  payload: false,
});

export const getProfile = (data) => ({
  type: ADD_PROFILE,
  payload: data,
});

export const getInvite = (data) => ({
  type: ADD_INVITE,
  payload: data,
});

export const deleteInvite = (data) => ({
  type: DELETE_INVITE,
  payload: data,
});
