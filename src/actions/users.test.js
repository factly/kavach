import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/users';
import * as types from '../constants/users';

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
      organizations: {
        ids: [1],
        details: { 1: { id: 1, name: 'organization' } },
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
    ];

    store
      .dispatch(actions.addUser(user))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(`${types.USERS_API}/1/users`, { name: 'User' });
  });
  it('should create actions to create user failure', () => {
    const user = { name: 'User' };
    axios.post.mockRejectedValueOnce(new Error('Failed to create user'));

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
        payload: true,
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
    ];

    store
      .dispatch(actions.deleteUser(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(`${types.USERS_API}/1/users/1`);
  });
  it('should create actions to delete user failure', () => {
    axios.delete.mockRejectedValueOnce(new Error('Failed to delete user'));

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
        payload: true,
      },
    ];

    store
      .dispatch(actions.deleteUser(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(`${types.USERS_API}/1/users/1`);
  });
});
