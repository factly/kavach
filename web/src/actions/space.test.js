import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as types from '../constants/space';
import * as actions from '../actions/space';
import { ORGANISATIONS_API } from '../constants/organisations';
import { SPACES_API } from '../constants/space';
import { ADD_SPACE_IDS } from '../constants/application';
import { ADD_NOTIFICATION } from '../constants/notifications';
import { ADD_MEDIA } from '../constants/media';
import { ADD_USERS } from '../constants/users';
import { buildObjectOfItems, deleteKeys, getIds, getValues } from '../utils/objects';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('Space User Actions', () => {
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

  it('should create actions for setting loading space true', () => {
    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
    ];
    store.dispatch(actions.loadingSpaces());
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions for setting loading space false', () => {
    const expectedActions = [
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.stopLoadingSpaces());
    expect(store.getActions()).toEqual(expectedActions);
  });

  // set selected app
  it('should create actions for setting seleceted app', () => {
    const app = { id: 1, name: 'app' };
    const expectedActions = [
      {
        type: types.SET_SELECTED_APP,
        payload: app,
      },
    ];
    store.dispatch(actions.setSelectedApp(app));
    expect(store.getActions()).toEqual(expectedActions);
  });

  // create space
  it('should create actions for creating space success', () => {
    const appID = 1;
    const data = { id: 1, name: 'space' };
    const resp = { data: { id: 1, name: 'space' } };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Space added successfully',
          time: fixedDate,
        },
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.createSpace(data, appID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.post).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/1/applications/1${SPACES_API}`,
      data,
    );
  });
  it('should create actions for creating space failure', () => {
    const appID = 1;
    const data = { id: 1, name: 'space' };
    const error = 'Error creating space';
    axios.post.mockRejectedValueOnce(new Error(error));

    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
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
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.createSpace(data, appID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.post).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/1/applications/1${SPACES_API}`,
      data,
    );
  });

  // fetch space
  it('should create actions for fetch spaces without media and users success', () => {
    const appID = 1;
    const resp = {
      data: [
        { id: 1, name: 'space' },
        { id: 2, name: 'space2' },
      ],
    };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_SPACE_IDS,
        payload: {
          appID,
          data: getIds(resp.data),
        },
      },
      {
        type: ADD_MEDIA,
        payload: {},
      },
      {
        type: ADD_USERS,
        payload: {},
      },
      {
        type: types.ADD_SPACES,
        payload: buildObjectOfItems(resp.data),
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getSpaces(appID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1${SPACES_API}`);
  });

  it('should create actions for fetch spaces with media and users success', () => {
    const appId = 1;
    const spaces = [
      {
        id: 1,
        name: 'space',
        logo: { id: 8, name: 'link' },
        logo_mobile: { id: 5, name: 'link' },
        fav_icon: { id: 6, name: 'link' },
        mobile_icon: { id: 7, name: 'link' },
        users: [{ id: 1, name: 'user' }],
      },
      {
        id: 2,
        name: 'space2',
        logo: { id: 1, name: 'link' },
        logo_mobile: { id: 2, name: 'link' },
        fav_icon: { id: 3, name: 'link' },
        mobile_icon: { id: 4, name: 'link' },
        users: [{ id: 2, name: 'user2' }],
      },
    ];

    const resp = { data: spaces };
    axios.get.mockResolvedValue(resp);
    const media = [];
    ['logo', 'logo_mobile', 'fav_icon', 'mobile_icon'].forEach((key) => {
      spaces.forEach((space) => {
        if (space[key]) {
          media.push(space[key]);
        }
      });
    });

    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_SPACE_IDS,
        payload: {
          appID: appId,
          data: getIds(resp.data),
        },
      },
      {
        type: ADD_MEDIA,
        payload: buildObjectOfItems(media),
      },
      {
        type: ADD_USERS,
        payload: buildObjectOfItems(getValues(spaces, ['users'])),
      },
      {
        type: types.ADD_SPACES,
        payload: buildObjectOfItems(resp.data),
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getSpaces(appId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1${SPACES_API}`);
  });

  it('should create actions for fetch space failure', () => {
    const appID = 1;
    const error = 'error';
    axios.get.mockRejectedValueOnce(new Error(error));

    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
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
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getSpaces(appID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1${SPACES_API}`);
  });

  // fetch by id
  it('should create actions for fetch space by id without policies and roles success', () => {
    const appId = 1;
    const spaceId = 1;
    const space = {
      id: 1,
      name: 'space',
      logo: { id: 8, name: 'link' },
      logo_mobile: { id: 5, name: 'link' },
      fav_icon: { id: 6, name: 'link' },
      mobile_icon: { id: 7, name: 'link' },
      users: [{ id: 1, name: 'user' }],
    };
    const media = [];
    ['logo', 'logo_mobile', 'fav_icon', 'mobile_icon'].forEach((key) => {
      [space].forEach((space) => {
        if (space[key]) {
          media.push(space[key]);
        }
      });
    });
    const resultedSpace = {
      ...space,
      users: space.users.map((user) => user.id),
      tokens: [],
    };
    deleteKeys(
      [resultedSpace],
      ['logo', 'logo_mobile', 'fav_icon', 'mobile_icon', 'application', 'roles', 'policies'],
    );

    // const resp = { data: space };
    axios.get.mockResolvedValueOnce({ data: space });
    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: buildObjectOfItems(media),
      },
      {
        type: ADD_USERS,
        payload: buildObjectOfItems(getValues([space], ['users'])),
      },
      {
        type: types.ADD_SPACES,
        payload: buildObjectOfItems([resultedSpace]),
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getSpaceByID(appId, spaceId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1${SPACES_API}/1`);
  });

  it('should create actions for fetch space by id with policies,tokens and roles success', () => {
    const appId = 1;
    const spaceId = 1;
    const space = {
      id: 1,
      name: 'space',
      logo: { id: 8, name: 'link' },
      logo_mobile: { id: 5, name: 'link' },
      fav_icon: { id: 6, name: 'link' },
      mobile_icon: { id: 7, name: 'link' },
      roles: [
        { id: 1, name: 'role' },
        { id: 2, name: 'role' },
      ],
      policies: [
        { id: 1, name: 'policy' },
        { id: 2, name: 'policy' },
      ],
      tokens: [
        { id: 1, name: 'token' },
        { id: 2, name: 'token' },
      ],
      users: [{ id: 1, name: 'user' }],
    };
    const media = [];
    ['logo', 'logo_mobile', 'fav_icon', 'mobile_icon'].forEach((key) => {
      [space].forEach((space) => {
        if (space[key]) {
          media.push(space[key]);
        }
      });
    });
    const resultedSpace = {
      ...space,
      users: space.users.map((user) => user.id),
      tokens: space.tokens.map((token) => token.id),
      roleIDs: space.roles.map((role) => role.id),
      policyIDs: space.policies.map((policy) => policy.id),
    };
    deleteKeys(
      [resultedSpace],
      ['logo', 'logo_mobile', 'fav_icon', 'mobile_icon', 'application', 'roles', 'policies'],
    );
    // console.log(space);
    axios.get.mockResolvedValueOnce({ data: space });

    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: 'ADD_SPACE_ROLES',
        payload: {
          id: spaceId,
          data: buildObjectOfItems(space.roles),
        },
      },
      {
        type: 'ADD_SPACE_POLICY',
        payload: {
          id: spaceId,
          data: buildObjectOfItems(space.policies),
        },
      },
      {
        type: ADD_MEDIA,
        payload: buildObjectOfItems(media),
      },
      {
        type: ADD_USERS,
        payload: buildObjectOfItems(getValues([space], ['users'])),
      },
      {
        type: types.ADD_SPACES,
        payload: buildObjectOfItems([resultedSpace]),
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];
    store.dispatch(actions.getSpaceByID(appId, spaceId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1${SPACES_API}/1`);
  });

  it('should create actions for fetch space by id failure', () => {
    const appId = 1;
    const spaceId = 1;
    const error = 'Error occurred';
    axios.get.mockRejectedValueOnce(new Error(error));

    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          message: error,
          title: 'Error',
          time: fixedDate,
        },
      },
      {
        type: types.STOP_SPACES_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getSpaceByID(appId, spaceId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1${SPACES_API}/1`);
  });

  // update space
  it('should create actions for update space success', () => {
    const appID = 1;
    const id = 1;
    const space = { id: 1, name: 'test' };

    axios.put.mockResolvedValue({ data: space });
    const expectedActions = [
      { type: types.SET_SPACES_LOADING, payload: true },
      {
        type: ADD_NOTIFICATION,
        payload: {
          message: 'Space updated successfully',
          type: 'success',
          time: fixedDate,
          title: 'Success',
        },
      },
      { type: types.STOP_SPACES_LOADING, payload: false },
    ];

    store.dispatch(actions.editSpace(id, appID, space)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.put).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/spaces/1`, space);
  });

  it('should create actions for update space failure', () => {
    const appID = 1;
    const id = 1;
    const space = { id: 1, name: 'test' };
    const error = 'Error occurred';
    axios.put.mockRejectedValueOnce(new Error(error));

    const expectedActions = [
      { type: types.SET_SPACES_LOADING, payload: true },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          message: error,
          title: 'Error',
          time: fixedDate,
        },
      },
      { type: types.STOP_SPACES_LOADING, payload: false },
    ];

    store.dispatch(actions.editSpace(id, appID, space)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.put).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/spaces/1`, space);
  });

  // delete space

  it('should create actions for delete space success', () => {
    const spaceID = 1;
    const appID = 1;

    axios.delete.mockResolvedValue({});
    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          message: 'Space deleted successfully',
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
    store.dispatch(actions.deleteSpace(appID, spaceID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/spaces/1`);
  });
  it('should create actions for delete space failure', () => {
    const spaceID = 1;
    const appID = 1;

    axios.delete.mockRejectedValue(new Error('error'));
    const expectedActions = [
      {
        type: types.SET_SPACES_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          message: 'error',
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
    store.dispatch(actions.deleteSpace(appID, spaceID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/1/applications/1/spaces/1`);
  });

  // add spaces
  it('should create actions for add spaces', () => {});
  it('should create actions for add spaces', () => {
    const media = {
      logo: { id: 8, name: 'link' },
      logo_mobile: { id: 5, name: 'link' },
      fav_icon: { id: 6, name: 'link' },
      mobile_icon: { id: 7, name: 'link' },
    };
    const users = [
      { id: 1, name: 'user1' },
      { id: 2, name: 'user2' },
    ];
    const tokens = [
      { id: 1, name: 'token1' },
      { id: 2, name: 'token2' },
    ];
    const spaces = [
      { id: 1, name: 'space1', ...media },
      { id: 2, name: 'space2', users, tokens },
    ];
    const mediaList = [];
    ['logo', 'logo_mobile', 'fav_icon', 'mobile_icon'].forEach((key) => {
      spaces.forEach((space) => {
        if (space[key]) {
          mediaList.push(space[key]);
        }
      });
    });

    const resultedSpaces = [];
    spaces.forEach((space) => {
      resultedSpaces.push({
        ...space,
        users: getIds(space.users),
        tokens: getIds(space.tokens),
      });
    });
    deleteKeys(resultedSpaces, ['logo', 'logo_mobile', 'fav_icon', 'mobile_icon', 'application']);

    const expectedActions = [
      {
        type: 'ADD_MEDIA',
        payload: buildObjectOfItems(mediaList),
      },
      { type: 'ADD_USERS', payload: buildObjectOfItems(users) },
      { type: 'ADD_SPACES', payload: buildObjectOfItems(resultedSpaces) },
    ];

    store.dispatch(actions.addSpaces(spaces));
    expect(store.getActions()).toEqual(expectedActions);
  });
  // add space
  it('should create actions for add space', () => {
    const space = { id: 1, name: 'test' };
    const expectedActions = [
      {
        type: types.ADD_SPACE,
        payload: space,
      },
    ];

    store.dispatch(actions.addSpace(space));
    expect(store.getActions()).toEqual(expectedActions);
  });

  // add space token ids
  it('should create actions for add space token ids', () => {
    const spaceID = 1;
    const tokenIDs = [1, 2];
    const expectedActions = [
      {
        type: types.ADD_SPACE_TOKEN_IDS,
        payload: { spaceID: 1, data: tokenIDs },
      },
    ];

    store.dispatch(actions.addSpaceTokenIDs(spaceID, tokenIDs));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
