import axios from 'axios';
import {
  SET_PROFILE_LOADING,
  ADD_PROFILE,
  PROFILE_API,
  ADD_INVITE,
  DELETE_INVITE,
} from '../constants/profile';
import { deleteKeys, getIds } from '../utils/objects';
import { addMedia } from './media';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addOrganisationsList, getOrganisations } from './organisations';

export const getUserProfile = () => {
  return (dispatch, getState) => {
    dispatch(loadingProfile());
    return axios
      .get(PROFILE_API)
      .then((response) => {
        dispatch(addProfile(response.data));
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
        dispatch(addProfile(response.data));
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

export const addProfileDetails = () => {
  return (dispatch, getState) => {
    dispatch(loadingProfile);
    return axios
      .get(PROFILE_API + '/details')
      .then((response) => {
        if (response.data.featured_medium_id) {
          dispatch(addMedia(response.data.medium));
          deleteKeys([response.data], ['medium']);
        }
        dispatch(addOrganisationsList(response.data.organisations, response.data.id));
        response.data.organisations = getIds(response.data.organisations);
        dispatch(addProfile(response.data));
      })
      .finally(() => {
        dispatch(stopProfileLoading());
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

export const addProfile = (data) => ({
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

// response.data.organisations.map((organisation)=>{
//   if (organisation.featured_medium_id){
//     dispatch(addMedia(organisation.medium));
//     deleteKeys([organisation], 'medium');
//   }
//   organisation.user_ids = getIds(organisation.users);
//   dispatch(addUsersList(buildObjectOfItems(organisation.users)));
//   deleteKeys([organisation], ['users']);
//   organisation.applications.map((application)=>{
//     if (application.medium_id){
//       dispatch(addMedia(application.medium));
//       deleteKeys([application], 'medium');
//     }
//     application.spaces.map((space)=>{
//       if (space.logo_id) {
//         dispatch(addMedia(space.logo));
//       }
//       deleteKeys([space], ['logo']);
//       if (space.logo_mobile_id) {
//         dispatch(addMedia(space.logo_mobile));
//       }
//       deleteKeys([space], ['logo_mobile']);
//       if (space.fav_icon_id ) {
//         dispatch(addMedia(space.fav_icon));
//       }
//       deleteKeys([space], ['fav_icon']);
//       if (space.mobile_icon_id ) {
//         dispatch(addMedia(space.mobile_icon));
//       }
//       deleteKeys([space], ['mobile_icon']);
//       space.user_ids = getIds(space.users);
//       deleteKeys([space], ['users']);
//       return null
//     });
//     application.space_ids = getIds(application.spaces)
//     dispatch(addSpaces(buildObjectOfItems(application.spaces)));
//     deleteKeys([application], ['spaces']);
//     application.user_ids = getIds(application.users);
//     deleteKeys([application], ['users']);
//     return null
//   });
//   organisation.application_ids = getIds(organisation.applications);
//   dispatch(addApplicationList(buildObjectOfItems(organisation.applications)));
//   deleteKeys([organisation], ['applications']);
//   return null
// });
// response.data.organisation_ids = getIds(response.data.organisations);
// dispatch(addOrganisationsList(buildObjectOfItems(response.data.organisations)));
// deleteKeys([response.data], ['organisations']);
// dispatch(addProfile(response.data));
