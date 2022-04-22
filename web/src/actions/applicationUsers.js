import axios from 'axios';
import {
  ADD_APPLICATION_USER,
  ADD_APPLICATION_USERS,
  ADD_APPLICATION_USERS_REQUEST,
  SET_APPLICATION_USERS_LOADING,
  RESET_APPLICATION_USERS,
  APPLICATION_USERS_API,
  ADD_USER_IDS,
} from '../constants/applicationUser';
import { getIds } from '../utils/objects';
import { addMediaList } from './media';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { loadingUsers, stopUsersLoading } from './users';

export const getApplications = (appID) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .get(
        APPLICATION_USERS_API +
          '/' +
          getState().organisations.selected +
          '/applications/' +
          appID +
          '/users',
      )
      .then((response) => {
        dispatch(
          addApplicationList(
            response.data.users.map((user) => {
              return user;
            }),
          ),
        );
        dispatch(
          addApplicationsRequest({
            data: response.data.users.map((item) => item.id),
            application_id: response.data.application.id,
            total: response.data.total,
          }),
        );
        dispatch(stopApplicationLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getApplication = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .get(
        APPLICATION_USERS_API +
          '/' +
          getState().organisations.selected +
          '/applications/' +
          id +
          '/users',
      )
      .then((response) => {
        if (response.data.medium) dispatch(addMediaList([response.data.medium]));
        dispatch(getApplicationByID({ ...response.data, medium: response.data.medium?.id }));
        dispatch(stopApplicationLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addApplicationUser = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .post(
        APPLICATION_USERS_API +
          '/' +
          getState().organisations.selected +
          '/applications/' +
          data.application_id +
          '/users',
        data,
      )
      .then(() => {
        dispatch(resetApplications());
        dispatch(addSuccessNotification('Application User Added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const updateApplication = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .put(
        APPLICATION_USERS_API +
          '/' +
          getState().organisations.selected +
          '/applications/' +
          data.id,
        data,
      )
      .then((response) => {
        if (response.data.medium) dispatch(addMediaList([response.data.medium]));
        dispatch(getApplicationByID({ ...response.data, medium: response.data.medium?.id }));
        dispatch(stopApplicationLoading());
        dispatch(addSuccessNotification('Application Updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deleteApplication = (id, appID) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .delete(
        APPLICATION_USERS_API +
          '/' +
          getState().organisations.selected +
          '/applications/' +
          id +
          '/users/' +
          appID,
      )
      .then(() => {
        dispatch(resetApplications());
        dispatch(addSuccessNotification('Application User Deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getApplicationUsers = (appID) => {
  return (dispatch, getState) => {
    dispatch(loadingUsers());
    return axios
      .get(
        APPLICATION_USERS_API +
          '/' +
          getState().organisations.selected +
          '/applications/' +
          appID +
          '/users',
      )
      .then((res) => {
        dispatch(addUserIds(getIds(res.data.users), appID));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopUsersLoading());
      });
  };
};

export const addApplications = (applications) => {
  return (dispatch) => {
    dispatch(
      addMediaList(
        applications
          .filter((application) => application.medium)
          .map((application) => application.medium),
      ),
    );
    dispatch(
      addApplicationList(
        applications.map((application) => {
          return { ...application, medium: application.medium?.id };
        }),
      ),
    );
  };
};

export const loadingApplications = () => ({
  type: SET_APPLICATION_USERS_LOADING,
  payload: true,
});

export const stopApplicationLoading = () => ({
  type: SET_APPLICATION_USERS_LOADING,
  payload: false,
});

export const getApplicationByID = (data) => ({
  type: ADD_APPLICATION_USER,
  payload: data,
});

export const addApplicationList = (data) => ({
  type: ADD_APPLICATION_USERS,
  payload: data,
});

export const addApplicationsRequest = (data) => ({
  type: ADD_APPLICATION_USERS_REQUEST,
  payload: data,
});

const addUserIds = (data, appID) => ({
  type: ADD_USER_IDS,
  payload: {
    id: appID,
    data: data,
  },
});
export const resetApplications = () => ({
  type: RESET_APPLICATION_USERS,
});
