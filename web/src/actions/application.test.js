import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/application';
import * as types from '../constants/application';
import { ADD_MEDIA } from '../constants/media';
import { ADD_NOTIFICATION } from '../constants/notifications';

const middlewares = [thunk];
const mockStore  = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('Application actions', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ 
      application: initialState, 
      organisations: {
        ids: [1],
        details: { 1: { id: 1, name: 'organisation' } },
        loading: false,
        selected: 1,
      },
    });
  });
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_APPLICATIONS_LOADING,
      payload: true,
    };
    expect(actions.loadingApplications()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_APPLICATIONS_LOADING,
      payload: false,
    };
    expect(actions.stopApplicationLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add application list', () => {
    const data = [
      { id: 1, name: 'Application 1' },
      { id: 2, name: 'Application 2' },
    ];
    const addApplicationsAction = {
      type: types.ADD_APPLICATIONS,
      payload: data,
    };
    expect(actions.addApplicationsList(data)).toEqual(addApplicationsAction);
  });
  it('should create an action to add single application', () => {
    const data = { id: 1, name: 'Application 1' };
    const addApplicationAction = {
      type: types.ADD_APPLICATION,
      payload: data,
    };
    expect(actions.getApplicationByID(data)).toEqual(addApplicationAction);
  });
  it('should create an action to add application request', () => {
    const data = [{ query : 'query' }];
    const addApplicationRequestAction = {
      type: types.ADD_APPLICATIONS_REQUEST,
      payload: data,
    };
    expect(actions.addApplicationsRequest(data)).toEqual(addApplicationRequestAction);
  });
  it('should create an action to reset application', () => {
    const resetApplicationsAction = {
      type: types.RESET_APPLICATIONS,
    };
    expect(actions.resetApplications()).toEqual(resetApplicationsAction);
  });
  it('should create actions to fetch applications success', () => {
    const medium = { id: 1, medium: 'Medium' };    
    const applications = [{ id: 1, name: 'Application 1', medium }];
    const resp = { data: applications };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_APPLICATIONS,
        payload: [{ id: 1, name: 'Application 1', medium: 1 }],
      },
      {
        type: types.ADD_APPLICATIONS_REQUEST,
        payload: { data: [1] },
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getApplications())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.APPLICATIONS_API + '/1' + '/applications');  
  });
  it('should create actions to fetch applications failure', () => {
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },  
    ];
    store
      .dispatch(actions.getApplications())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.APPLICATIONS_API + '/1' + '/applications');  
  });
  it('should create actions to addDefaultApplications success', () => {
    const medium = { id: 1, medium: 'Medium' };    
    const applications = [{ id: 2, name: 'Default Application', medium }];
    const resp = { data: applications };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_APPLICATIONS,
        payload: [{ id: 2, name: 'Default Application', medium: 1 }],
      },
      {
        type: types.ADD_APPLICATIONS_REQUEST,
        payload: { data: [2] },
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Factly Applications Added',
        },
      },
    ];
    store
      .dispatch(actions.addDefaultApplications())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.APPLICATIONS_API + '/1' + '/applications/default');  
  });
  it('should create actions to addDefaultApplications failure', () => {
    const errorMessage = 'Unable to add default applications';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },  
    ];
    store
      .dispatch(actions.addDefaultApplications())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.APPLICATIONS_API + '/1' + '/applications/default');  
  });
  it('should create action to getApplication success', () => {
    const medium = { id: 1, medium: 'Medium' };    
    const application = { id: 1, name: 'Application 1', medium };
    const resp = { data: application };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_APPLICATION,
        payload: { id: 1, name: 'Application 1', medium: 1 },
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.getApplication(1))
    .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.APPLICATIONS_API+'/1/applications/'+ 1);
  });
  it('should create action to getApplication failure', () => {
    const errorMessage = 'Unable to get application';
    axios.get.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },  
    ];
    store.dispatch(actions.getApplication(1))
    .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.APPLICATIONS_API+'/1/applications/'+ 1);
  });
  it('should create action to getApplication without medium success', () => {
    const application = { id: 1, name: 'Application 1'};
    const resp = { data: application };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_APPLICATION,
        payload: { id: 1, name: 'Application 1' },
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.getApplication(1))
    .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.APPLICATIONS_API+'/1/applications/'+ 1);
  });
  it('should create actions to create application success', () => {
    const medium = { id: 1, medium: 'Medium' };    
    const application = { id: 1, name: 'Application 1', medium };
    const resp = { data: application };
    axios.post.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_APPLICATIONS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Application Added',
        },
      },
    ];
    store
      .dispatch(actions.addApplication(application))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.APPLICATIONS_API+'/1'+'/applications',application);
  });
  it('should create actions to create application failure', () => {
    const medium = { id: 1, medium: 'Medium' };    
    const application = { id: 1, name: 'Application 1', medium };
    const errorMessage = 'Unable to create application';
    axios.post.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },  
    ];
    store
      .dispatch(actions.addApplication(application))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.APPLICATIONS_API+'/1'+'/applications',application);
  });
  it('should create actions to update application success', () => {
    const medium = { id: 1, medium: 'Medium' };    
    const application = { id: 1, name: 'Application 1', medium };
    const resp = { data: application };
    axios.put.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_APPLICATION,
        payload: { id: 1, name: 'Application 1', medium: 1 },
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Application Updated',
        },
      },
    ];
    store
      .dispatch(actions.updateApplication(application))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.APPLICATIONS_API+'/1'+'/applications/'+1,application);
  });
  it('should create actions to update application failure', () => {
    const medium = { id: 1, medium: 'Medium' };    
    const application = { id: 1, name: 'Application 1', medium };
    const errorMessage = 'Unable to update application';
    axios.put.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },  
    ];
    store
      .dispatch(actions.updateApplication(application))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.APPLICATIONS_API+'/1'+'/applications/'+1,application);
  });
  it('should create actions to update application without medium success', () => {
    const application = { id: 1, name: 'Application 1'};
    const resp = { data: application };
    axios.put.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_APPLICATION,
        payload: { id: 1, name: 'Application 1'},
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Application Updated',
        },
      },
    ];
    store
      .dispatch(actions.updateApplication(application))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.APPLICATIONS_API+'/1'+'/applications/'+1,application);
  });
  it('should create actions to delete application success', () => {
    axios.delete.mockResolvedValueOnce();

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_APPLICATIONS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Application Deleted',
        },
      },
    ];
    store
      .dispatch(actions.deleteApplication(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.APPLICATIONS_API+'/1'+'/applications/'+1);
  });
  it('should create actions to delete application failure', () => {
    const errorMessage = 'Unable to get application';
    axios.delete.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },  
    ];
    store
      .dispatch(actions.deleteApplication(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.APPLICATIONS_API+'/1'+'/applications/'+1);
  });
  it('should create action to addApplication list', () => {
    const medium = { id: 1, medium: 'Medium' };    
    const applications = [{ id: 1, name: 'Application 1', medium }];
    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_APPLICATIONS,
        payload: [{ id: 1, name: 'Application 1', medium: 1 }],
      },
    ];
    store.dispatch(actions.addApplications(applications));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
