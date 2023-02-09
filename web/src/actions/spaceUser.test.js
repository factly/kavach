import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { getIds } from '../utils/objects';
import * as actions from '../actions/spaceUser';
import { ORGANISATIONS_API } from '../constants/organisations';
import * as types from '../constants/space';
import { ADD_NOTIFICATION } from '../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('spaceUser actions', () => {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an action to add space user by ids', () => {
    const spaceID = 1;
    const data = [1, 2, 3];
    const expectedAction = {
      type: types.ADD_SPACE_USERS,
      payload: {
        spaceID: spaceID,
        data: data,
      },
    };
    expect(actions.addSpaceUsersByID(spaceID, data)).toEqual(expectedAction);
  });

  it('should create an action to fetch space user success ', () => {
    const appID = 1;
    const spaceID = 1;
    const data = {
      data: [
        { id: 1, name: 'user1' },
        { id: 2, name: 'user2' },
        { id: 3, name: 'user3' },
      ],
    };
    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: types.ADD_SPACE_USERS,
        payload: {
          spaceID: spaceID,
          data: getIds(data.data),
        },
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];
    axios.get.mockImplementationOnce(() => Promise.resolve(data));
    store.dispatch(actions.getSpaceUsers(appID, spaceID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/spaces/1/users`);
  });
  it('should create an action to fetch space user failure ', () => {
    const appID = 1;
    const spaceID = 1;
    const error = 'Failed to fetch space users';
    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          message: error,
          type: 'error',
          title: 'Error',
          time: fixedDate,
        },
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];
    axios.get.mockRejectedValueOnce(new Error(error));
    store.dispatch(actions.getSpaceUsers(appID, spaceID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/spaces/1/users`);
  });

  it('should create an action to add space users success', () => {
    const appID = 1;
    const spaceID = 1;
    const data = { id: 1, name: 'user1' };
    axios.post.mockResolvedValueOnce(data);

    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          message: 'Space user added successfully',
          type: 'success',
          title: 'Success',
          time: fixedDate,
        },
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.addSpaceUser(appID, spaceID, data)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.post).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/1/applications/1/spaces/1/users`,
      data,
    );
  });
  it('should create an action to add space users failure', () => {
    const appID = 1;
    const spaceID = 1;
    const data = { id: 1, name: 'user1' };
    const error = 'Failed to add space user';
    axios.post.mockRejectedValueOnce(new Error(error));

    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          message: error,
          type: 'error',
          title: 'Error',
          time: fixedDate,
        },
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.addSpaceUser(appID, spaceID, data)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.post).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/1/applications/1/spaces/1/users`,
      data,
    );
  });

  it('should create an action to delete space user success', () => {
    const appID = 1;
    const spaceID = 1;
    const data = { id: 1, name: 'user1' };
    axios.delete.mockResolvedValueOnce(data.id);

    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          message: 'Space user deleted successfully',
          type: 'success',
          title: 'Success',
          time: fixedDate,
        },
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.deleteSpaceUser(appID, spaceID, data.id)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.delete).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/1/applications/1/spaces/1/users/1`,
    );
  });
  it('should create an action to delete space user failure', () => {
    const appID = 1;
    const spaceID = 1;
    const data = { id: 1, name: 'user1' };
    const error = 'Failed to delete space user';
    axios.delete.mockRejectedValueOnce(new Error(error));

    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          message: error,
          type: 'error',
          title: 'Error',
          time: fixedDate,
        },
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.deleteSpaceUser(appID, spaceID, data.id)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.delete).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/1/applications/1/spaces/1/users/1`,
    );
  });
});
