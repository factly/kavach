import axios from 'axios';
import {
  ADD_APPLICATION,
  ADD_APPLICATIONS,
  ADD_APPLICATIONS_REQUEST,
  SET_APPLICATIONS_LOADING,
  RESET_APPLICATIONS,
  APPLICATIONS_API,
} from '../constants/application';
import { ADD_APPLICATION_IDS } from '../constants/organisations';
import { buildObjectOfItems, deleteKeys, getIds, getValues } from '../utils/objects';
import { addMedia, addMediaList } from './media';
import { addErrorNotification, addSuccessNotification } from './notifications';
import { addSpaces } from './space';

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

export const addDefaultApplications = () => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .post(APPLICATIONS_API + '/' + getState().organisations.selected + '/applications/default')
      .then((response) => {
        dispatch(
          addMediaList(
            response.data
              .filter((application) => application.medium)
              .map((application) => application.medium),
          ),
        );
        dispatch(
          addApplicationList(
            response.data.map((application) => {
              return { ...application, medium: application.medium?.id };
            }),
          ),
        );
        dispatch(
          addApplicationsRequest({
            data: response.data.map((item) => item.id),
            total: response.data.total,
          }),
        );
        dispatch(stopApplicationLoading());
        dispatch(addSuccessNotification('Factly Applications Added'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
        dispatch(stopApplicationLoading());
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
        response.data.users = getIds(response.data.users);
        addApplication(response.data);
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
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .post(APPLICATIONS_API + '/' + getState().organisations.selected + '/applications', data)
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
  console.log('update user calledz');
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .put(
        APPLICATIONS_API + '/' + getState().organisations.selected + '/applications/' + data.id,
        data,
      )
      .then((response) => {
        console.log(response.data);
        if (response.data.medium_id) {
          dispatch(addMedia(response.data.medium));
        }
        deleteKeys([response.data], ['medium']);
        response.data.users = getIds(response.data.users);
        dispatch(addApplication(response.data));
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
      .delete(APPLICATIONS_API + '/' + getState().organisations.selected + '/applications/' + id)
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
