import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/profile';
import * as types from '../constants/profile';
import { ADD_NOTIFICATION } from '../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  details: {},
  loading: true,
};

const errorMsg = 'Error';

describe('profile actions', () => {
  let store;
  let errorAction;
  beforeEach(() => {
    store = mockStore({ initialState });
    Date.now = jest.fn(() => '2019-04-01T10:20:30.000Z');
    errorAction = {
      type: ADD_NOTIFICATION,
      payload: {
        message: errorMsg,
        type: 'error',
        title: 'Error',
        time: Date.now(),
      },
    };
  });
  //! ######################################################################
  //! ############ DIRECT RETURNING ACTIONS WITHOUT API ####################
  //! ######################################################################
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_PROFILE_LOADING,
      payload: true,
    };
    expect(actions.loadingProfile()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_PROFILE_LOADING,
      payload: false,
    };
    expect(actions.stopProfileLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to ADD_PROFILE', () => {
    const data = { id: 1, email: 'abc@gmail.com', first_name: 'abc' };
    const addProfileAction = {
      type: types.ADD_PROFILE,
      payload: data,
    };
    expect(actions.addProfile(data)).toEqual(addProfileAction);
  });

  // ?#####################INVITE ACTION TEST#####################
  it('should create an action to add invite', () => {
    const data = [
      {
        id: 1,
        organisation: {
          id: 1,
          name: 'Test',
        },
      },
    ];
    const expectedAction = {
      type: types.ADD_INVITE,
      payload: data,
    };
    expect(actions.getInvite(data)).toEqual(expectedAction);
  });

  it('should create an action to delete invite', () => {
    const data = 1;
    const expectedAction = {
      type: types.DELETE_INVITE,
      payload: data,
    };
    expect(actions.deleteInvite(data)).toEqual(expectedAction);
  });

  //! ######################################################################
  //! ################# ACTIONS WITH GET API CALLS #########################
  //! ######################################################################
  // ? ################# PROFILE ###############################
  it('should create actions to fetch user profile success', () => {
    const profile = { id: 1, email: 'abc@gmail.com', first_name: 'abc' };
    const resp = { data: profile };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PROFILE_LOADING,
        payload: true,
      },
      {
        type: types.ADD_PROFILE,
        payload: { id: 1, email: 'abc@gmail.com', first_name: 'abc' },
      },
      {
        type: types.SET_PROFILE_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getUserProfile())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PROFILE_API);
  });
  it('should create actions to fetch user profile failure', () => {
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PROFILE_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
          time: Date.now(),
        },
      },
    ];
    store
      .dispatch(actions.getUserProfile())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PROFILE_API);
  });
  //? ###################Invitations################################

  it('should create actions to fetch user invitations success', () => {
    const invitations = [{ id: 1, organisation: { id: 1, name: 'Test' } }];
    const resp = { data: invitations };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      { type: types.SET_PROFILE_LOADING, payload: true },
      {
        type: types.ADD_INVITE,
        payload: [{ id: 1, organisation: { id: 1, name: 'Test' } }]
      },

      { type: types.SET_PROFILE_LOADING, payload: false },
    ];

    store.dispatch(actions.getInvitation()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(types.PROFILE_API + '/invite');
  });
  it('should create actions to fetch user invitations failure', () => {
    axios.get.mockRejectedValue(new Error(errorMsg));

    const expectedActions = [
      {
        type: types.SET_PROFILE_LOADING,
        payload: true,
      },
      { ...errorAction }
    ];
    store
      .dispatch(actions.getInvitation())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PROFILE_API + '/invite');
  });

  //TODO ######################################################################
  //TODO ################# ACTIONS WITH POST API CALLS ########################
  //TODO ######################################################################
  // ? ################# PROFILE ###############################
  it('should create actions to add user profile details success', () => { });
  it('should create actions to add user profile details failure', () => { });

  //! ######################################################################
  //! ################# ACTIONS WITH PUT API CALLS #########################
  //! ######################################################################
  // ? ################# PROFILE ###############################
  it('should create actions to update profile success', () => {
    const profile = { id: 1, email: 'abc@gmail.com', first_name: 'abc' };
    const resp = { data: profile };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PROFILE_LOADING,
        payload: true,
      },
      {
        type: types.ADD_PROFILE,
        payload: { id: 1, email: 'abc@gmail.com', first_name: 'abc' },
      },
      {
        type: types.SET_PROFILE_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Profile Updated',
          time: Date.now(),
        },
      },
    ];
    store
      .dispatch(actions.updateProfile(profile))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.PROFILE_API, profile);
  });
  it('should create actions to update profile failure', () => {
    const profile = { id: 1, email: 'abc@gmail.com', first_name: 'abc' };
    const errorMessage = 'Unable to update profile';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PROFILE_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          time: Date.now(),
          message: errorMessage,
        },
      },
    ];
    store
      .dispatch(actions.updateProfile(profile))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.PROFILE_API, profile);
  });
  // ? ################# Invitation ###############################
  it('should create actions to accept invitation success', () => {
    const invitation = { id: 1, organisation: { id: 1, name: 'Test' } };
    const resp = { data: invitation };
    axios.put.mockResolvedValue(resp);
    const expectedActions = [
      { type: types.SET_PROFILE_LOADING, payload: true },
      {
        type: types.DELETE_INVITE,
        payload: invitation.id,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Request accepted successfully',
          time: Date.now(),
        },
      },
      {
        type: types.SET_PROFILE_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.acceptInvitation(invitation.id, invitation)).then(() => {
      expectedActions.forEach((action) => {
        expect(store.getActions()).toContainEqual(action);
      });
    });
    expect(axios.put).toHaveBeenCalledWith(types.PROFILE_API + '/invite/' + invitation.id, invitation);
  });
  it('should create actions to accept invitation failure', () => {
    const invitation = { id: 1, organisation: { id: 1, name: 'Test' } };
    axios.put.mockRejectedValue(new Error(errorMsg));

    const expectedActions = [
      {
        type: types.SET_PROFILE_LOADING,
        payload: true,
      },
      { ...errorAction }
    ];
    store
      .dispatch(actions.acceptInvitation(invitation.id, invitation))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.PROFILE_API + '/invite/' + invitation.id, invitation);
  });

  //! ######################################################################
  //! ################# ACTIONS WITH DELETE API CALLS ######################
  //! ######################################################################
  // ? ################# Invitation ###############################
  it('should create actions to delete invitation success', () => {
    const resp = { data: 1 };
    axios.delete.mockResolvedValue(resp);
    const expectedActions = [
      { type: types.SET_PROFILE_LOADING, payload: true },
      {
        type: types.DELETE_INVITE,
        payload: 1,
      },
      {
        type: types.SET_PROFILE_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Request declined successfully',
          time: Date.now(),
        },
      },
    ];

    store.dispatch(actions.deleteInvitation(1)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
  it('should create actions to delete invitation failure', () => {
    axios.delete.mockRejectedValue(new Error(errorMsg));

    const expectedActions = [
      {
        type: types.SET_PROFILE_LOADING,
        payload: true,
      },
      { ...errorAction }
    ];
    store
      .dispatch(actions.deleteInvitation(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.PROFILE_API + '/invite/1');
  });
});
