import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/applicationUsers';
import * as types from '../constants/applicationUser';
import { ADD_MEDIA } from '../constants/media';
import { ADD_NOTIFICATION } from '../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  details: {},
  loading: true,
};

describe('Application User actions', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      applicationUsers: initialState,
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
      type: types.SET_APPLICATION_USERS_LOADING,
      payload: true,
    };
    expect(actions.loadingApplications()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_APPLICATION_USERS_LOADING,
      payload: false,
    };
    expect(actions.stopApplicationLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add applicationUser list', () => {
    const data = [
      { id: 1, application_id: '1', user_id: '1' },
      { id: 2, application_id: '2', user_id: '2' },
    ];
    const addApplicationUsersAction = {
      type: types.ADD_APPLICATION_USERS,
      payload: data,
    };
    expect(actions.addApplicationsList(data)).toEqual(addApplicationUsersAction);
  });
  it('should create an action to add single applicationUser', () => {
    const data = { id: 1, application_id: '1', user_id: '1' };
    const addApplicationUserAction = {
      type: types.ADD_APPLICATION_USER,
      payload: data,
    };
    expect(actions.getApplicationByID(data)).toEqual(addApplicationUserAction);
  });
  it('should create an action to add applicationUser request', () => {
    const data = [{ query: 'query' }];
    const addApplicationUserRequestAction = {
      type: types.ADD_APPLICATION_USERS_REQUEST,
      payload: data,
    };
    expect(actions.addApplicationsRequest(data)).toEqual(addApplicationUserRequestAction);
  });
  it('should create an action to reset applicationUser', () => {
    const resetApplicationUsersAction = {
      type: types.RESET_APPLICATION_USERS,
    };
    expect(actions.resetApplications()).toEqual(resetApplicationUsersAction);
  });
  it('should create actions to fetch applicationUsers success', () => {
    const applicationUsers = [{ id: 1, application_id: '1', user_id: '1' }];
    const resp = { data: { users: applicationUsers, application: { id: 1 }, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_APPLICATION_USERS,
        payload: applicationUsers,
      },
      {
        type: types.ADD_APPLICATION_USERS_REQUEST,
        payload: { data: [1], application_id: 1, total: 1 },
      },
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getApplications(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1' + '/applications/' + 1 + '/users',
    );
  });
  it('should create actions to fetch applicationUsers failure', () => {
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
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
      .dispatch(actions.getApplications(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1' + '/applications/' + 1 + '/users',
    );
  });
  it('should create action to getApplications success', () => {
    const medium = { id: 1, medium: 'Medium' };
    const application = { id: 1, name: 'ApplicationUser 1', medium };
    const resp = { data: application };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_APPLICATION_USER,
        payload: { id: 1, name: 'ApplicationUser 1', medium: 1 },
      },
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getApplication(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1/applications/' + 1 + '/users',
    );
  });
  it('should create action to getApplications failure', () => {
    const errorMessage = 'Unable to get application';
    axios.get.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
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
      .dispatch(actions.getApplication(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1/applications/' + 1 + '/users',
    );
  });
  it('should create action to getApplications without medium success', () => {
    const application = { id: 1, name: 'ApplicationUser 1' };
    const resp = { data: application };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_APPLICATION_USER,
        payload: { id: 1, name: 'ApplicationUser 1', medium: undefined },
      },
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getApplication(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1/applications/' + 1 + '/users',
    );
  });
  it('should create actions to add applicationUser success', () => {
    const applicationUser = { id: 1, application_id: '1', user_id: '1' };
    const resp = { data: applicationUser };
    axios.post.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_APPLICATION_USERS,
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
      .dispatch(actions.addApplicationUser(applicationUser))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1' + '/applications/' + 1 + '/users',
      applicationUser,
    );
  });
  it('should create actions to add applicationUser failure', () => {
    const applicationUser = { id: 1, application_id: '1', user_id: '1' };
    const errorMessage = 'Unable to create application';
    axios.post.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
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
      .dispatch(actions.addApplicationUser(applicationUser))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1' + '/applications/' + 1 + '/users',
      applicationUser,
    );
  });
  it('should create actions to update applicationUser success', () => {
    const medium = { id: 1, medium: 'Medium' };
    const applicationUser = { id: 1, application_id: '1', user_id: '1', medium };
    const resp = { data: applicationUser };
    axios.put.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_APPLICATION_USER,
        payload: { id: 1, application_id: '1', user_id: '1', medium: 1 },
      },
      {
        type: types.SET_APPLICATION_USERS_LOADING,
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
      .dispatch(actions.updateApplication(applicationUser))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1' + '/applications/' + 1,
      applicationUser,
    );
  });
  it('should create actions to update applicationUser without medium success', () => {
    const applicationUser = { id: 1, application_id: '1', user_id: '1' };
    const resp = { data: applicationUser };
    axios.put.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_APPLICATION_USER,
        payload: { id: 1, application_id: '1', user_id: '1', medium: undefined },
      },
      {
        type: types.SET_APPLICATION_USERS_LOADING,
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
      .dispatch(actions.updateApplication(applicationUser))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1' + '/applications/' + 1,
      applicationUser,
    );
  });
  it('should create actions to update applicationUser failure', () => {
    const medium = { id: 1, medium: 'Medium' };
    const applicationUser = { id: 1, application_id: '1', user_id: '1', medium };
    const errorMessage = 'Unable to update application';
    axios.put.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
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
      .dispatch(actions.updateApplication(applicationUser))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1' + '/applications/' + 1,
      applicationUser,
    );
  });
  it('should create actions to delete applicationUser success', () => {
    axios.delete.mockResolvedValueOnce();

    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_APPLICATION_USERS,
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
      .dispatch(actions.deleteApplication(1, 1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1' + '/applications/' + 1 + '/users/' + 1,
    );
  });
  it('should create actions to delete applicationUser failure', () => {
    const errorMessage = 'Unable to delete application user';
    axios.delete.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
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
      .dispatch(actions.deleteApplication(1, 1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1' + '/applications/' + 1 + '/users/' + 1,
    );
  });
  it('should create action to getApplicationUser success', () => {
    const application = { id: 1, name: 'ApplicationUser 1' };
    const resp = { data: { users: application } };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_APPLICATION_USERS,
        payload: { users: { id: 1, name: 'ApplicationUser 1' }, id: 1 },
      },
      {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getApplicationUsers(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1/applications/' + 1 + '/users',
    );
  });
  it('should create action to getApplicationUser failure', () => {
    const errorMessage = 'Unable to get application users';
    axios.get.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_APPLICATION_USERS_LOADING,
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
      .dispatch(actions.getApplicationUsers(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(
      types.APPLICATION_USERS_API + '/1/applications/' + 1 + '/users',
    );
  });
  it('should create action to addApplications', () => {
    const medium = { id: 1, medium: 'Medium' };
    const applicationUsers = [{ id: 1, application_id: '1', user_id: '1', medium: medium }];
    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_APPLICATION_USERS,
        payload: [{ id: 1, application_id: '1', user_id: '1', medium: 1 }],
      },
    ];
    const store = mockStore({ initialState });
    store.dispatch(actions.addApplications(applicationUsers));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
