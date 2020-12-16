import axios from 'axios';
import {
  ADD_APPLICATION,
  ADD_APPLICATIONS,
  ADD_APPLICATIONS_REQUEST,
  SET_APPLICATIONS_LOADING,
  RESET_APPLICATIONS,
  APPLICATIONS_API,
} from '../constants/application';
import { addMediaList } from './media';

export const getApplications = () => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
      return axios
        .get(APPLICATIONS_API + '/' + getState().organisations.selected + '/applications')
        .then((response) => {
          dispatch(
            addMediaList(
              response.data
                .filter((application) => application.medium)
                .map((application) => application.medium),
            ),
          );
          dispatch(
            addApplicationsList(
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
      })
      .catch((error) => {
        console.log(error);
      });
  };
};

export const addDefaultApplications = () => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
      return axios
        .post(APPLICATIONS_API + '/' + getState().organisations.selected + '/applications/default')
        .then((response) => {
          console.log('get apps' ,response);
          dispatch(
            addMediaList(
              response.data
                .filter((application) => application.medium)
                .map((application) => application.medium),
            ),
          );
          dispatch(
            addApplicationsList(
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
      })
      .catch((error) => {
        console.log(error);
      });
  };
};

export const getApplication = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .get(APPLICATIONS_API + '/' + getState().organisations.selected + '/applications/' + id)
      .then((response) => {
        if( response.data.medium) dispatch(addMediaList([response.data.medium]));
          dispatch(getApplicationByID({ ...response.data, medium: response.data.medium?.id }));
          dispatch(stopApplicationLoading());
      })
      .catch((error) => {
        console.log(error);
      });
  };
};

export const addApplication = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
      .post(APPLICATIONS_API + '/' + getState().organisations.selected + '/applications', data)
      .then(() => {
        dispatch(resetApplications());
        console.log("Application added");
      })
      .catch((error) => {
        console.log(error);
      });
  };
};

export const updateApplication = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingApplications());
    return axios
    .put(APPLICATIONS_API + '/' + getState().organisations.selected + '/applications/' + data.id, data)
    .then((response) => {
      if (response.data.medium) dispatch(addMediaList([response.data.medium]));
        dispatch(getApplicationByID({ ...response.data, medium: response.data.medium?.id }));
        dispatch(stopApplicationLoading());
        console.log('Application updated');
    })
    .catch((error) => {
      console.log(error);
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
        console.log('Application deleted');
      })
      .catch((error) => {
        console.log(error);
      });
  };
};

export const addApplications = (applications) => {
  return (dispatch) => {
    dispatch(
      addMediaList(
        applications.filter((application) => application.medium).map((application) => application.medium),
      ),
    );
    dispatch(
      addApplicationsList(
        applications.map((application) => {
          return { ...application, medium: application.medium?.id};
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

export const addApplicationsList = (data) => ({
  type: ADD_APPLICATIONS,
  payload: data,
});

export const addApplicationsRequest = (data) => ({
  type: ADD_APPLICATIONS_REQUEST,
  payload: data,
});

export const resetApplications = () => ({
  type: RESET_APPLICATIONS,
});