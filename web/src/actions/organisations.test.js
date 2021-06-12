import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/organisations';
import * as types from '../constants/organisations';
import { ADD_NOTIFICATION } from '../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  ids: [],
  details: {},
  loading: true,
  selected: 0,
};

describe('organisations actions', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      organisations: initialState,
    });
  });
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_ORGANISATIONS_LOADING,
      payload: true,
    };
    expect(actions.loadingOrganisations()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_ORGANISATIONS_LOADING,
      payload: false,
    };
    expect(actions.stopOrganisationsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add organisations list', () => {
    const data = [
      { id: 1, name: 'organisation 1' },
      { id: 2, name: 'organisation 2' },
    ];

    const addOrganisationsAction = {
      type: types.ADD_ORGANISATIONS,
      payload: data,
    };
    expect(actions.addOrganisationsList(data)).toEqual(addOrganisationsAction);
  });
  it('should create an action to add single organisation', () => {
    const data = { id: 1, name: 'organisation 1' };

    const addOrganisationAction = {
      type: types.ADD_ORGANISATION,
      payload: data,
    };
    expect(actions.getOrganisationByID(data)).toEqual(addOrganisationAction);
  });
  it('should create an action to reset organisations', () => {
    const resetOrganisationsRequestAction = {
      type: types.RESET_ORGANISATIONS,
    };
    expect(actions.resetOrganisations()).toEqual(resetOrganisationsRequestAction);
  });
  it('should create an action to set selected organisations', () => {
    const setSelectedOrganisationAction = {
      type: types.SET_SELECTED_ORGANISATION,
      payload: 1,
    };
    expect(actions.setSelectedOrganisation(1)).toEqual(setSelectedOrganisationAction);
  });
  it('should create actions to fetch organisations success', () => {
    const organisations = [{ id: 1, name: 'Organisation' }];
    const resp = { data: organisations };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANISATIONS,
        payload: [{ id: 1, name: 'Organisation' }],
      },
    ];

    store
      .dispatch(actions.getOrganisations())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`${types.ORGANISATIONS_API}/my`);
  });
  it('should create actions to fetch organisations failure', () => {
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
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
      .dispatch(actions.getOrganisations())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`${types.ORGANISATIONS_API}/my`);
  });
  it('should create actions to get organisation by id success', () => {
    const organisation = { id: 1, name: 'Organisation' };
    const resp = { data: organisation };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANISATION,
        payload: { id: 1, name: 'Organisation' },
      },
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: false,
      },
    ];

    store
      .dispatch(actions.getOrganisation(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`${types.ORGANISATIONS_API}/1`);
  });
  it('should create actions to get organisation by id failure', () => {
    const errorMessage = 'Failed to get organisation by id';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
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
      .dispatch(actions.getOrganisation(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`${types.ORGANISATIONS_API}/1`);
  });
  it('should create actions to create organisation success', () => {
    const resp = { data: { id: 1, name: 'Organisation' } };
    axios.post.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANISATION,
        payload: { id: 1, name: 'Organisation' },
      },
      {
        type: types.SET_SELECTED_ORGANISATION,
        payload: 1,
      },
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Organisation added',
        },
      },
    ];

    store
      .dispatch(actions.addOrganisation({ name: 'Organisation' }))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.ORGANISATIONS_API, { name: 'Organisation' });
  });
  it('should create actions to create organisation failure', () => {
    const errorMessage = 'Failed to create organisation';
    axios.post.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
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
      .dispatch(actions.addOrganisation({ name: 'Organisation' }))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.ORGANISATIONS_API, { name: 'Organisation' });
  });
  it('should create actions to update organisation success', () => {
    const organisation = { id: 1, name: 'Organisation' };
    const resp = { data: organisation };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANISATION,
        payload: { id: 1, name: 'Organisation' },
      },
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Organisation Updated',
        },
      },
    ];

    store
      .dispatch(actions.updateOrganisation(organisation))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.ORGANISATIONS_API + '/1', organisation);
  });
  it('should create actions to update organisation failure', () => {
    const organisation = { id: 1, name: 'Organisation' };
    const errorMessage = 'Failed to update organisation';
    axios.put.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
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
      .dispatch(actions.updateOrganisation(organisation))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.ORGANISATIONS_API + '/1', organisation);
  });
  it('should create actions to delete organisation success', () => {
    axios.delete.mockResolvedValueOnce();

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_ORGANISATIONS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Organisation Deleted',
        },
      },
    ];

    store
      .dispatch(actions.deleteOrganisation(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(`${types.ORGANISATIONS_API}/1`);
  });
  it('should create actions to delete organisation failure', () => {
    const errorMessage = 'Failed to delete organisation';

    axios.delete.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
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
      .dispatch(actions.deleteOrganisation(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(`${types.ORGANISATIONS_API}/1`);
  });
});
