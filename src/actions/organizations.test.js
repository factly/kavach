import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/organizations';
import * as types from '../constants/organizations';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  ids: [],
  details: {},
  loading: true,
};

describe('organizations actions', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      organizations: initialState,
    });
  });
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_ORGANIZATIONS_LOADING,
      payload: true,
    };
    expect(actions.loadingOrganizations()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_ORGANIZATIONS_LOADING,
      payload: false,
    };
    expect(actions.stopOrganizationsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add organizations list', () => {
    const data = [
      { id: 1, name: 'organization 1' },
      { id: 2, name: 'organization 2' },
    ];

    const addOrganizationsAction = {
      type: types.ADD_ORGANIZATIONS,
      payload: data,
    };
    expect(actions.addOrganizationsList(data)).toEqual(addOrganizationsAction);
  });
  it('should create an action to add single organization', () => {
    const data = { id: 1, name: 'organization 1' };

    const addOrganizationAction = {
      type: types.ADD_ORGANIZATION,
      payload: data,
    };
    expect(actions.getOrganizationByID(data)).toEqual(addOrganizationAction);
  });
  it('should create an action to reset organizations', () => {
    const resetOrganizationsRequestAction = {
      type: types.RESET_ORGANIZATIONS,
    };
    expect(actions.resetOrganizations()).toEqual(resetOrganizationsRequestAction);
  });
  it('should create an action to set selected organizations', () => {
    const setSelectedOrganizationAction = {
      type: types.SET_SELECTED_ORGANIZATION,
      payload: 1,
    };
    expect(actions.setSelectedOrganization(1)).toEqual(setSelectedOrganizationAction);
  });
  it('should create actions to fetch organizations success', () => {
    const organizations = [{ id: 1, name: 'Organization' }];
    const resp = { data: organizations };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANIZATIONS,
        payload: [{ id: 1, name: 'Organization' }],
      },
    ];

    store
      .dispatch(actions.getOrganizations())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`${types.ORGANIZATIONS_API}/my`);
  });
  it('should create actions to fetch organizations failure', () => {
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: true,
      },
    ];

    store
      .dispatch(actions.getOrganizations())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`${types.ORGANIZATIONS_API}/my`);
  });
  it('should create actions to get organization by id success', () => {
    const organization = { id: 1, name: 'Organization' };
    const resp = { data: organization };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANIZATION,
        payload: { id: 1, name: 'Organization' },
      },
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: false,
      },
    ];

    store
      .dispatch(actions.getOrganization(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`${types.ORGANIZATIONS_API}/1`);
  });
  it('should create actions to get organization by id failure', () => {
    axios.get.mockRejectedValue(new Error('Failed to get organization by id'));

    const expectedActions = [
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: true,
      },
    ];

    store
      .dispatch(actions.getOrganization(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`${types.ORGANIZATIONS_API}/1`);
  });
  it('should create actions to create organization success', () => {
    const resp = { data: { id: 1, name: 'Organization' } };
    axios.post.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANIZATION,
        payload: { id: 1, name: 'Organization' },
      },
      {
        type: types.SET_SELECTED_ORGANIZATION,
        payload: 1,
      },
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: false,
      },
    ];

    store
      .dispatch(actions.addOrganization({ name: 'Organization' }))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.ORGANIZATIONS_API, { name: 'Organization' });
  });
  it('should create actions to create organization failure', () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to create organization'));

    const expectedActions = [
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: true,
      },
    ];

    store
      .dispatch(actions.addOrganization({ name: 'Organization' }))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.ORGANIZATIONS_API, { name: 'Organization' });
  });
  it('should create actions to update organization success', () => {
    const organization = { id: 1, name: 'Organization' };
    const resp = { data: organization };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANIZATION,
        payload: { id: 1, name: 'Organization' },
      },
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: false,
      },
    ];

    store
      .dispatch(actions.updateOrganization(organization))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.ORGANIZATIONS_API + '/1', organization);
  });
  it('should create actions to update organization failure', () => {
    const organization = { id: 1, name: 'Organization' };
    const resp = { data: organization };
    axios.put.mockRejectedValueOnce(new Error('Failed to update organization'));

    const expectedActions = [
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: true,
      },
    ];

    store
      .dispatch(actions.updateOrganization(organization))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.ORGANIZATIONS_API + '/1', organization);
  });
  it('should create actions to delete organization success', () => {
    axios.delete.mockResolvedValueOnce();

    const expectedActions = [
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_ORGANIZATIONS,
      },
    ];

    store
      .dispatch(actions.deleteOrganization(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(`${types.ORGANIZATIONS_API}/1`);
  });
  it('should create actions to delete organization failure', () => {
    axios.delete.mockRejectedValueOnce(new Error('Failed to delete organization'));

    const expectedActions = [
      {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: true,
      },
    ];

    store
      .dispatch(actions.deleteOrganization(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(`${types.ORGANIZATIONS_API}/1`);
  });
});
