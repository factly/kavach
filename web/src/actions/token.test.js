import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/token';
import * as types from '../constants/token';
import { ADD_NOTIFICATION } from '../constants/notifications';
import { ORGANISATIONS_API } from '../constants/organisations';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('Token actions', () => {
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
      type: types.SET_TOKENS_LOADING,
      payload: true,
    };
    expect(actions.loadingTokens()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_TOKENS_LOADING,
      payload: false,
    };
    expect(actions.stopTokenLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add token list', () => {
    const data = [
      { id: 1, name: 'Token 1' },
      { id: 2, name: 'Token 2' },
    ];
    const addTokensAction = {
      type: types.ADD_TOKENS,
      payload: data,
    };
    expect(actions.addTokensList(data)).toEqual(addTokensAction);
  });
  it('should create an action to add single token', () => {
    const data = { id: 1, name: 'Token 1' };
    const addTokenAction = {
      type: types.ADD_TOKEN,
      payload: data,
    };
    expect(actions.getTokenByID(data)).toEqual(addTokenAction);
  });
  it('should create an action to add token request', () => {
    const data = [{ query: 'query' }];
    const addTokenRequestAction = {
      type: types.ADD_TOKENS_REQUEST,
      payload: data,
    };
    expect(actions.addTokensRequest(data)).toEqual(addTokenRequestAction);
  });
  it('should create an action to reset token', () => {
    const resetTokensAction = {
      type: types.RESET_TOKENS,
    };
    expect(actions.resetTokens()).toEqual(resetTokensAction);
  });
  it('should create actions to create token success', () => {
    const token = { id: 1, name: 'Token 1' };
    const resp = { data: token };
    axios.post.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_TOKENS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Token Added',
        },
      },
    ];
    store
      .dispatch(actions.addToken(token, 1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      ORGANISATIONS_API + '/1' + '/applications' + '/1' + '/tokens',
      token,
    );
  });
  it('should create actions to create token failure', () => {
    const token = { id: 1, name: 'Token 1' };
    const errorMessage = 'Unable to create token';
    axios.post.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
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
      .dispatch(actions.addToken(token, 1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      ORGANISATIONS_API + '/1' + '/applications' + '/1' + '/tokens',
      token,
    );
  });
  it('should create actions to delete token success', () => {
    axios.delete.mockResolvedValueOnce();

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_TOKENS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Token Deleted',
        },
      },
    ];
    store
      .dispatch(actions.deleteToken(1, 1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(
      ORGANISATIONS_API + '/1' + '/applications' + '/1' + '/tokens' + '/1',
    );
  });
  it('should create actions to delete token success', () => {
    const errorMessage = 'Unable to delete token';
    axios.delete.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
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
      .dispatch(actions.deleteToken(1, 1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(
      ORGANISATIONS_API + '/1' + '/applications' + '/1' + '/tokens' + '/1',
    );
  });
});
