import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/users';
import * as types from '../constants/users';
import { ADD_NOTIFICATION } from '../constants/notifications';
import { ADD_ORGANISATION_USERS } from '../constants/organisations';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  ids: [],
  details: {},
  loading: true,
};

describe('users actions', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      users: initialState,
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
      type: types.SET_USERS_LOADING,
      payload: true,
    };
    expect(actions.loadingUsers()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_USERS_LOADING,
      payload: false,
    };
    expect(actions.stopUsersLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add users list', () => {
    const data = [
      { id: 1, name: 'user 1' },
      { id: 2, name: 'user 2' },
    ];

    const addUsersAction = {
      type: types.ADD_USERS,
      payload: data,
    };
    expect(actions.addUsersList(data)).toEqual(addUsersAction);
  });
  it('should create an action to reset users', () => {
    const resetUsersRequestAction = {
      type: types.RESET_USERS,
    };
    expect(actions.resetUsers()).toEqual(resetUsersRequestAction);
  });
  it('should create actions to fetch users success', () => {
    const users = [{ id: 1, name: 'User' }];
    const resp = { data: users };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_USERS,
        payload: [{ id: 1, name: 'User' }],
      },
      {
        type: types.SET_USERS_LOADING,
        payload: false,
      },
    ];

    store
      .dispatch(actions.getUsers())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`${types.USERS_API}/1/users`);
  });
  it('should create actions to fetch users failure', () => {
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
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
      .dispatch(actions.getUsers())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`${types.USERS_API}/1/users`);
  });
  it('should create actions to create user success', () => {
    const user = { name: 'User' };
    const resp = { data: user };
    axios.post.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_USERS,
      },
      {
        type: types.SET_USERS_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'User added',
        },
      },
    ];

    store
      .dispatch(actions.addUser(user))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(`${types.USERS_API}/1/users`, { name: 'User' });
  });
  it('should create actions to create user failure', () => {
    const user = { name: 'User' };
    const errorMessage = 'Failed to create user';

    axios.post.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
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
      .dispatch(actions.addUser(user))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(`${types.USERS_API}/1/users`, { name: 'User' });
  });
  it('should create actions to delete user success', () => {
    axios.delete.mockResolvedValueOnce();

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_USERS,
      },
      {
        type: types.SET_USERS_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'User deleted',
        },
      },
    ];

    store
      .dispatch(actions.deleteUser(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(`${types.USERS_API}/1/users/1`);
  });
  it('should create actions to delete user failure', () => {
    const errorMessage = 'Failed to delete user';
    axios.delete.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
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
      .dispatch(actions.deleteUser(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(`${types.USERS_API}/1/users/1`);
  });
  it('should create actions to get all users success', () => {
    const users = [{ id: 1, name: 'User' }];
    const resp = { data: users };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: ADD_ORGANISATION_USERS,
        payload: { org_id: 1, users: [{ id: 1, name: 'User' }] },
      },
      {
        type: types.SET_USERS_LOADING,
        payload: false,
      },
    ];

    store
      .dispatch(actions.getAllUsers())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`/organisations/1/users`);
  });
  it('should create actions to get all users failure', () => {
    const errorMessage = 'Unable to get application';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
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
      .dispatch(actions.getAllUsers())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`/organisations/1/users`);
  });
});
