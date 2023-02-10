import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { buildObjectOfItems, getIds } from '../utils/objects';
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
  let fixedDate;
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
    fixedDate = new Date('2022-01-01T00:00:00.000Z').valueOf();
    jest.spyOn(Date, 'now').mockReturnValue(fixedDate);
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
      payload: buildObjectOfItems(data),
    };

    store.dispatch(actions.addUsersList(data));
    const res = store.getActions();
    expect(res[0]).toEqual(addUsersAction);
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
      { type: 'ADD_ORGANISATION_USERS', payload: [1] },
      { type: 'ADD_ORGANISATION_ROLE', payload: {} },
      {
        type: types.ADD_USERS,
        payload: buildObjectOfItems([{ id: 1, name: 'User' }]),
      },
      {
        type: types.SET_USERS_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getUsers()).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${types.USERS_API}/1/users`);
  });
  it('should create actions to fetch users with optional fields success', () => {
    const medium = { id: 1, name: 'Medinum 1' };
    const users = [
      { id: 1, name: 'User', permission: { role: 'admin' }, medium, featured_medium_id: medium.id },
    ];
    const resp = { data: users };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
        payload: true,
      },
      { type: 'ADD_ORGANISATION_USERS', payload: [1] },
      { type: 'ADD_ORGANISATION_ROLE', payload: { 1: 'admin' } },
      {
        type: types.ADD_USERS,
        payload: buildObjectOfItems([{ id: 1, name: 'User', featured_medium_id: medium.id }]),
      },
      {
        type: types.SET_USERS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.getUsers()).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${types.USERS_API}/1/users`);
  });
  it('should create actions to fetch users as empty success', () => {
    const users = [];
    const resp = { data: users };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
        payload: true,
      },
      { type: 'ADD_ORGANISATION_USERS', payload: [] },
      { type: 'ADD_ORGANISATION_ROLE', payload: {} },
      {
        type: types.ADD_USERS,
        payload: buildObjectOfItems([]),
      },
      {
        type: types.SET_USERS_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getUsers()).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
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
          time: fixedDate,
        },
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
          message: 'Users added',
          time: fixedDate,
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
          time: fixedDate,
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
          time: fixedDate,
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
          time: fixedDate,
        },
      },
    ];

    store
      .dispatch(actions.deleteUser(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(`${types.USERS_API}/1/users/1`);
  });
  xit('should create actions to get all users success', () => {
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
  xit('should create actions to get all users failure', () => {
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
  it('should create actions to add users list to organisation', () => {
    const data = [
      { id: 1, name: 'User' },
      { id: 2, name: 'User2' },
    ];

    const expectedAction = {
      type: ADD_ORGANISATION_USERS,
      payload: data,
    };
    expect(actions.addOrganisationUsersList(data)).toEqual(expectedAction);
  });
  it('should create actions to add user ids to organisation', () => {
    const data = [
      { id: 1, name: 'User' },
      { id: 2, name: 'User2' },
    ];

    const expectedAction = {
      type: ADD_ORGANISATION_USERS,
      payload: getIds(data),
    };
    expect(actions.addOrganisationUsers(data)).toEqual(expectedAction);
  });
  it('should create actions to add user role to organisation', () => {
    const data = [
      { id: 1, name: 'User', permission: { role: 'admin' } },
      { id: 2, name: 'User2', permission: { role: 'member' } },
    ];
    const orgRole = { 1: 'admin', 2: 'member' };

    const expectedAction = {
      type: 'ADD_ORGANISATION_ROLE',
      payload: orgRole,
    };
    store.dispatch(actions.addOrganisationRole(data));
    expect(store.getActions()).toEqual([expectedAction]);
  });
});

// addOrganisationRole
// addOrganisationUsers
