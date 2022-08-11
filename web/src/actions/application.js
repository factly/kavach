import axios from 'axios';
import {
  ADD_APPLICATION,
  ADD_APPLICATIONS,
  ADD_APPLICATIONS_REQUEST,
  SET_APPLICATIONS_LOADING,
  RESET_APPLICATIONS,
  APPLICATIONS_API,
  ADD_SPACE_IDS,
  SET_DEFAULT_APPLICATION_LOADING,
  GET_DEFAULT_APPLICATIONS,
} from '../constants/application';
import { ADD_APPLICATION_IDS, ORGANISATIONS_API } from '../constants/organisations';
import { buildObjectOfItems, deleteKeys, getIds, getValues } from '../utils/objects';
import { addMedia, addMediaList } from './media';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addSpaces } from './space';
import { addApplicationTokens } from './token';
import { addUsersList } from './users';
export const getApplications = () => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .get(APPLICATIONS_API + '/' + getState().organisations.selected + '/applications')
      .then((response) => {
        dispatch(addApplicationList(response.data));
        dispatch(addApplicationIds(getIds(response.data)));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopApplicationLoading());
      });
  };
};

export const addDefaultApplication = (appID) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .post(
        ORGANISATIONS_API +
          '/' +
          getState().organisations.selected +
          '/applications/' +
          appID +
          '/default',
      )
      .then(() => {
        dispatch(addSuccessNotification('Application Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopApplicationLoading());
      });
  };
};

export const removeDefaultApplication = (appID) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .delete(
        ORGANISATIONS_API +
          '/' +
          getState().organisations.selected +
          '/applications/' +
          appID +
          '/default',
      )
      .then(() => {
        dispatch(addSuccessNotification('Application removed succesfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopApplicationLoading());
      });
  };
};

export const getDefaultApplications = () => {
  return (dispatch, getState) => {
    dispatch(setDefaultApplicationsLoading());
    return axios
      .get(ORGANISATIONS_API + '/' + getState().organisations.selected + '/applications/default')
      .then((response) => {
        dispatch(addDefaultApplicationsList(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopDefaultApplicationLoading());
      });
  };
};

export const getApplication = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .get(APPLICATIONS_API + '/' + getState().organisations.selected + '/applications/' + id)
      .then((response) => {
        if (response.data.medium_id) {
          dispatch(addMedia(response.data.medium));
        }
        deleteKeys([response.data], ['medium']);
        dispatch(addUsersList(response.data.users));
        response.data.users = getIds(response.data.users);
        response.data.spaces = getIds(response.data.spaces)
        response.data.tokens = getIds(response.data.tokens)
        const spaces = getValues([response.data], 'spaces');
        // dispatch(addSpaces(spaces));
        dispatch(addApplication(response.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopApplicationLoading());
      });
  };
};

export const createApplication = (data) => {
  data.is_default = false;
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .post(ORGANISATIONS_API + '/' + getState().organisations.selected + '/applications', data)
      .then(() => {
        dispatch(resetApplications());
        dispatch(addSuccessNotification('Application Added'));
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
        ORGANISATIONS_API + '/' + getState().organisations.selected + '/applications/' + data.id,
        data,
      )
      .then(() => {
        dispatch(addSuccessNotification('Application Updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopApplicationLoading());
      });
  };
};

export const deleteApplication = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .delete(ORGANISATIONS_API + '/' + getState().organisations.selected + '/applications/' + id)
      .then(() => {
        dispatch(resetApplications());
        dispatch(addSuccessNotification('Application Deleted'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
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
  type: SET_APPLICATIONS_LOADING,
  payload: true,
});

export const stopApplicationLoading = () => ({
  type: SET_APPLICATIONS_LOADING,
  payload: false,
});

export const getApplicationByID = (data) => ({
  type: ADD_APPLICATION,
  payload: data,
});

export const addApplicationList = (data) => (dispatch) => {
  dispatch(loadingApplications());
  const medium = getValues(data, 'medium');
  dispatch(addMediaList(medium));
  deleteKeys(data, ['medium']);
  const spaces = getValues(data, 'spaces');
  dispatch(addSpaces(spaces));

  data.forEach((application) => {
    application.spaces = getIds(application.spaces);
    application.users = getIds(application.users);
    dispatch(addApplicationTokens(application.id, application.tokens));
    application.tokens = getIds(application.tokens);
  });

  dispatch({
    type: ADD_APPLICATIONS,
    payload: buildObjectOfItems(data),
  });
  dispatch(stopApplicationLoading());
};

export const addApplicationsRequest = (data) => ({
  type: ADD_APPLICATIONS_REQUEST,
  payload: data,
});

export const resetApplications = () => ({
  type: RESET_APPLICATIONS,
});

export const addApplicationIds = (data) => ({
  type: ADD_APPLICATION_IDS,
  payload: data,
});

export const addApplication = (data) => ({
  type: ADD_APPLICATION,
  payload: data,
});

export const addSpaceIDs = (appID, data) => ({
  type: ADD_SPACE_IDS,
  payload: {
    appID: appID,
    data: data,
  },
});

export const setDefaultApplicationsLoading = () => ({
  type: SET_DEFAULT_APPLICATION_LOADING,
  payload: true,
});

export const stopDefaultApplicationLoading = () => ({
  type: SET_DEFAULT_APPLICATION_LOADING,
  payload: false,
});

export const addDefaultApplicationsList = (data) => ({
  type: GET_DEFAULT_APPLICATIONS,
  payload: data,
});
