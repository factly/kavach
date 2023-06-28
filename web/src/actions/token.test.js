import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { buildObjectOfItems } from '../utils/objects';
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
  let fixedDate;
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
    fixedDate = new Date('2022-01-01T00:00:00.000Z').valueOf();
    jest.spyOn(Date, 'now').mockReturnValue(fixedDate);
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
  it('should create an action to add tokens to an organization', () => {
    const orgID = 1;
    const tokenData = [
      { id: 1, name: 'Token 1' },
      { id: 2, name: 'Token 2' },
    ];
    const expectedAction = {
      type: types.ADD_ORGANISATION_TOKENS,
      payload: {
        id: orgID,
        data: buildObjectOfItems(tokenData),
      },
    };

    expect(actions.addOrganisationTokens(orgID, tokenData)).toEqual(expectedAction);
  });

  it('should create an action to add tokens to an applications', () => {
    const appID = 1;
    const tokenData = [
      { id: 1, name: 'Token 1' },
      { id: 2, name: 'Token 2' },
    ];
    const expectedAction = {
      type: types.ADD_APPLICATION_TOKENS,
      payload: {
        id: appID,
        data: buildObjectOfItems(tokenData),
      },
    };

    expect(actions.addApplicationTokens(appID, tokenData)).toEqual(expectedAction);
  });

  it('should create an action to add tokens to a space', () => {
    const spaceID = 1;
    const data = [
      { id: 1, name: 'Token 1' },
      { id: 2, name: 'Token 2' },
    ];
    const expectedAction = {
      type: types.ADD_SPACE_TOKENS,
      payload: {
        spaceID: spaceID,
        data: data,
      },
    };

    expect(actions.addSpaceTokens(spaceID, data)).toEqual(expectedAction);
  });

  it('should create actions to fetch Organisation tokens', () => {
    const data = [
      { id: 1, name: 'Token 1' },
      { id: 2, name: 'Token 2' },
    ];
    const resp = { data };
    axios.get.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANISATION_TOKENS,
        payload: { id: 1, data: buildObjectOfItems(data) },
      },
      {
        type: 'ADD_ORGANISATION_TOKEN_IDS',
        payload: [1, 2],
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.getOrganisationTokens()).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/tokens`);
  });

  it('should create actions to fetch Organisation tokens when response is empty', () => {
    const data = [];
    const resp = { data };
    axios.get.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.getOrganisationTokens()).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/tokens`);
  });

  it('should create actions to fetch Organisation tokens failure', () => {
    const error = 'error';
    axios.get.mockRejectedValueOnce(new Error(error));

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
          message: error,
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.getOrganisationTokens()).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/tokens`);
  });
  it('should create actions to create Organisation token success', () => {
    const token = { id: 1, name: 'Token 1' };
    const resp = { data: { token } };
    const setToken = jest.fn();
    const setShowModal = jest.fn();
    axios.post.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Token Added Successfully',
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.addOrganisationToken(token, setToken, setShowModal)).then(() => {
      expect(setToken).toHaveBeenCalledWith(token);
      expect(setShowModal).toHaveBeenCalledWith(true);
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.post).toHaveBeenCalledWith(ORGANISATIONS_API + '/1' + '/tokens', token);
  });

  it('should create actions to create Organisation token failure', () => {
    const token = { id: 1, name: 'Token 1' };
    const errorMessage = 'Unable to create token';
    axios.post.mockRejectedValueOnce(new Error(errorMessage));
    const setToken = jest.fn();
    const setShowModal = jest.fn();

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
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.addOrganisationToken(token, setToken, setShowModal)).catch(() => {
      return expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.post).toHaveBeenCalledWith(ORGANISATIONS_API + '/1' + '/tokens', token);
  });
  it('should create actions to delete Organisation token success', () => {
    axios.delete.mockResolvedValueOnce();

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Token Deleted Successfully',
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.deleteOrganisationToken(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(ORGANISATIONS_API + '/1' + '/tokens' + '/1');
  });
  it('should create actions to delete Organisation token success', () => {
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
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.deleteOrganisationToken(1, 1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(ORGANISATIONS_API + '/1' + '/tokens' + '/1');
  });

  it('should create actions to fetch Space tokens', () => {
    const data = [
      { id: 1, name: 'Token 1' },
      { id: 2, name: 'Token 2' },
    ];
    const resp = { data };
    axios.get.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_SPACE_TOKENS,
        payload: { spaceID: 1, data: buildObjectOfItems(data) },
      },
      {
        type: 'ADD_SPACE_TOKEN_IDS',
        payload: { spaceID: 1, data: [1, 2] },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getSpaceTokens(1, 1)).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/spaces/1/tokens`);
  });

  it('should create actions for fetching space tokens failure', () => {
    const errorMessage = 'Error';
    axios.get.mockRejectedValueOnce(new Error(errorMessage));

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
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.getSpaceTokens()).then(() => {
      const actualActions = store.getActions();
      expect(actualActions).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/spaces/1/tokens`);
  });
  // addSpaceToken
  it('should create actions to create space token success', () => {
    const spaceID = 1;
    const appID = 1;
    const token = { id: 1, name: 'Token 1', description: 'some token' };
    const resp = { data: { token } };
    const setToken = jest.fn();
    const setShowModal = jest.fn();
    axios.post.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Token Added Successfully',
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];

    store
      .dispatch(actions.addSpaceToken(spaceID, appID, token, setToken, setShowModal))
      .then(() => {
        const res = store.getActions();
        expect(res).toEqual(expectedActions);
        expect(setToken).toHaveBeenCalledWith(token);
        expect(setShowModal).toHaveBeenCalledWith(true);
      });
    expect(axios.post).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/1/applications/1/spaces/1/tokens`,
      {
        name: 'Token 1',
        description: 'some token',
      },
    );
  });
  it('should create actions to create space token failure', () => {
    const token = { id: 1, name: 'Token 1', description: 'some token' };
    const resp = { data: { token } };
    const setToken = jest.fn();
    const setShowModal = jest.fn();
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
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.addSpaceToken(1, 1, token, setToken, setShowModal)).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.post).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/1/applications/1/spaces/1/tokens`,
      {
        name: 'Token 1',
        description: 'some token',
      },
    );
  });
  // deleteSpaceToken
  it('should create actions to delete space token success', () => {
    axios.delete.mockResolvedValueOnce({});
    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Token Deleted Successfully',
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.deleteSpaceToken(1, 1, 1)).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.delete).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/1/applications/1/spaces/1/tokens/1`,
    );
  });
  it('should create actions to delete space token failure', () => {
    axios.delete.mockRejectedValueOnce(new Error('Unable to delete token'));
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
          message: 'Unable to delete token',
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.deleteSpaceToken(1, 1, 1)).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.delete).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/1/applications/1/spaces/1/tokens/1`,
    );
  });

  // getApplicationTokens
  it('should create actions to fetch Application tokens', () => {
    const resp = { data: { nodes: [{ id: 1, name: 'Token 1' }] } };
    axios.get.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_APPLICATION_TOKENS,
        payload: {
          id: 1,
          data: buildObjectOfItems(resp.data.nodes),
        },
      },
      {
        type: 'ADD_APPLICATION_TOKEN_IDS',
        payload: {
          id: 1,
          data: resp.data.nodes.map((item) => item.id),
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.getApplicationTokens(1)).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/tokens`);
  });
  it('should create actions to fetch Application tokens failure', () => {
    axios.get.mockRejectedValueOnce(new Error('Unable to fetch tokens'));
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
          message: 'Unable to fetch tokens',
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.getApplicationTokens(1)).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/tokens`);
  });

  it('should create actions to create application token success', () => {
    const token = { id: 1, name: 'Token 1' };
    const resp = { data: { token } };
    const setToken = jest.fn();
    const setShowModal = jest.fn();
    axios.post.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Token Added',
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.addApplicationToken(1, token, setToken, setShowModal)).then(() => {
      expect(setToken).toHaveBeenCalledWith(token);
      expect(setShowModal).toHaveBeenCalledWith(true);
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.post).toHaveBeenCalledWith(
      ORGANISATIONS_API + '/1' + '/applications' + '/1' + '/tokens',
      token,
    );
  });

  it('should create actions to create application token failure', () => {
    const token = { id: 1, name: 'Token 1' };
    const errorMessage = 'Unable to create token';
    axios.post.mockRejectedValueOnce(new Error(errorMessage));
    const setToken = jest.fn();
    const setShowModal = jest.fn();

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
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.addApplicationToken(1, token, setToken, setShowModal)).catch(() => {
      return expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.post).toHaveBeenCalledWith(
      ORGANISATIONS_API + '/1' + '/applications' + '/1' + '/tokens',
      token,
    );
  });
  it('should create an action to add application token IDs', () => {
    const appID = 1;
    const data = [1, 2];
    const expectedAction = {
      type: 'ADD_APPLICATION_TOKEN_IDS',
      payload: {
        id: appID,
        data: data,
      },
    };
    expect(actions.addApplicationTokenIDs(appID, data)).toEqual(expectedAction);
  });
  //  deleteApplicationToken
  it('should create actions to delete application token success', () => {
    const resp = { data: { token: { id: 1, name: 'Token 1' } } };
    axios.delete.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_TOKENS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Token Deleted Successfully',
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.deleteApplicationToken(1, 1, 1)).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/tokens/1`);
  });
  it('should create actions to delete application token failure', () => {
    axios.delete.mockRejectedValueOnce(new Error('Unable to delete token'));
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
          message: 'Unable to delete token',
          time: fixedDate,
        },
      },
      {
        type: types.SET_TOKENS_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.deleteApplicationToken(1, 1, 1)).then(() => {
      const res = store.getActions();
      expect(res).toEqual(expectedActions);
    });
    expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/tokens/1`);
  });
});
