import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/media';
import * as types from '../constants/media';
import { ADD_NOTIFICATION } from '../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('media actions', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ initialState });
  });
  it('should create actions to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_MEDIA_LOADING,
      payload: true,
    };
    expect(actions.loadingMedia()).toEqual(startLoadingAction);
  });
  it('should create actions to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_MEDIA_LOADING,
      payload: false,
    };
    expect(actions.stopMediaLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add media list', () => {
    const data = [
      { id: 1, medium: 'Medium 1' },
      { id: 2, medium: 'Medium 2' },
    ];
    const addMediasAction = {
      type: types.ADD_MEDIA,
      payload: data,
    };
    expect(actions.addMediaList(data)).toEqual(addMediasAction);
  });
  it('should create an action to reset media', () => {
    const resetMediaAction = {
      type: types.RESET_MEDIA,
    };
    expect(actions.resetMedia()).toEqual(resetMediaAction);
  });
  it('should create an action to add medium', () => {
    const data = { id: 1, medium: 'Medium 1' };
    const addMediumAction = {
      type: types.ADD_MEDIUM,
      payload: data,
    };
    expect(actions.getMediumByID(data)).toEqual(addMediumAction);
  });
  it('should create an action to add media request', () => {
    const data = [{ query: 'query' }];
    const addMediaRequestAction = {
      type: types.ADD_MEDIA_REQUEST,
      payload: data,
    };
    expect(actions.addMediaRequest(data)).toEqual(addMediaRequestAction);
  });
  it('should create actions to to fetch media success', () => {
    const query = { page: 1, limit: 5 };
    const media = [{ id: 1, medium: 'Medium' }];
    const resp = { data: { nodes: media, total: 1 } };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.ADD_MEDIA,
        payload: [{ id: 1, medium: 'Medium' }],
      },
      {
        type: types.ADD_MEDIA_REQUEST,
        payload: {
          data: [1],
          total: 1,
          query: query,
        },
      },
      {
        type: types.SET_MEDIA_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getMedia(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MEDIA_API, {
      params: query,
    });
  });
  it('should create actions to to fetch media failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
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
      .dispatch(actions.getMedia(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MEDIA_API, {
      params: query,
    });
  });
  it('should create actions to get medium success', () => {
    const medium = { id: 1, medium: 'Medium' };
    const resp = { data: medium };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.ADD_MEDIUM,
        payload: { id: 1, medium: 'Medium' },
      },
      {
        type: types.SET_MEDIA_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getMedium(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MEDIA_API + '/1');
  });
  it('should create actions to get medium failure', () => {
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
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
      .dispatch(actions.getMedium(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MEDIA_API + '/1');
  });
  it('should create actions to addMedium success', () => {
    const medium = { id: 1, medium: 'Medium' };
    axios.post.mockResolvedValue();
    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.RESET_MEDIA,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Media Added',
        },
      },
    ];
    store
      .dispatch(actions.addMedium(medium))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.MEDIA_API, medium);
  });
  it('should create actions to addMedium failure', () => {
    const medium = { id: 1, medium: 'Medium' };
    const errorMessage = 'Unable to add medium';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
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
      .dispatch(actions.addMedium(medium))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.MEDIA_API, medium);
  });
  it('should create actions to updateMedium success', () => {
    const medium = { id: 1, medium: 'Medium' };
    const resp = { data: medium };
    axios.put.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.ADD_MEDIUM,
        payload: { id: 1, medium: 'Medium' },
      },
      {
        type: types.SET_MEDIA_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Media Updated',
        },
      },
    ];
    store
      .dispatch(actions.updateMedium(medium))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.MEDIA_API + '/1', medium);
  });
  it('should create actions to updateMedium failure', () => {
    const medium = { id: 1, medium: 'Medium' };
    const errorMessage = 'Unable to update medium';
    axios.put.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
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
      .dispatch(actions.updateMedium(medium))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.MEDIA_API + '/1', medium);
  });
  it('should create actions to deleteMedium success', () => {
    axios.delete.mockResolvedValue();
    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.RESET_MEDIA,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Media Deleted',
        },
      },
    ];
    store
      .dispatch(actions.deleteMedium(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.MEDIA_API + '/1');
  });
  it('should create actions to deleteMedium failure', () => {
    const errorMessage = 'Unable to delete medium';
    axios.delete.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
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
      .dispatch(actions.deleteMedium(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.MEDIA_API + '/1');
  });
  it('should create action to addMediaList', () => {
    const media = [{ id: 1, medium: 'Medium' }];
    const expectedActions = [
      {
        type: types.ADD_MEDIA,
        payload: media,
      },
    ];
    store.dispatch(actions.addMedia(media));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
