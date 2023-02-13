import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/organisations';
import * as types from '../constants/organisations';
import { ADD_NOTIFICATION } from '../constants/notifications';
import { buildObjectOfItems, deleteKeys, getIds } from '../utils/objects';

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
    Date.now = jest.fn(() => 123);
  });
  // ###################################################
  // #################  no Api calls ###################
  // ###################################################
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
  // !!!!!!!!!
  xit('should create an action to add organisations list', () => {
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
  it('should create an action to reset organisations', () => {
    const resetOrganisationsRequestAction = {
      type: types.RESET_ORGANISATIONS,
    };
    expect(actions.resetOrganisations()).toEqual(resetOrganisationsRequestAction);
  });
  it('should create an action to add organisation ids', () => {
    const addOrganisationIdsAction = {
      type: 'ADD_ORGANISATION_IDS',
      payload: [1, 2],
    };
    store.dispatch(actions.addOrganisationIds([1, 2]));
    expect(store.getActions()).toEqual([addOrganisationIdsAction]);
  });
  it('should create an action to add organisation by id', () => {
    const data = { id: 1, name: 'organisation 1' };

    const addOrganisationByIdAction = {
      type: types.ADD_ORGANISATION,
      payload: {
        id: data.id,
        data: data,
      },
    };
    expect(actions.addOrganisationByID(data)).toEqual(addOrganisationByIdAction);
  });
  it('should create an action to set selected organisations', () => {
    const setSelectedOrganisationAction = {
      type: types.SET_SELECTED_ORGANISATION,
      payload: 1,
    };
    expect(actions.setSelectedOrganisation(1)).toEqual(setSelectedOrganisationAction);
  });
  it('should create an action to add my Organisation role', () => {
    const roles = [{ id: 1, name: 'role 1' }];

    const addOrganisationRoleAction = {
      type: types.ADD_MY_ORGANISATION_ROLE,
      payload: roles,
    };
    expect(actions.addMyOrganisationRole(roles)).toEqual(addOrganisationRoleAction);
  });
  it('should create an action to add addOrganisationTokenIDs ', () => {
    const addOrganisationTokenIDsAction = {
      type: types.ADD_ORGANISATION_TOKEN_IDS,
      payload: [1, 2],
    };
    expect(actions.addOrganisationTokenIDs([1, 2])).toEqual(addOrganisationTokenIDsAction);
  });

  // ###################################################
  // #################  Api calls ######################
  // ###################################################
  it('should create actions to fetch organisations success', () => {
    const organisations = [
      {
        organisation: {
          id: 1,
          name: 'Organisation 1',
        },
        permission: {
          role: 'admin',
        },
        applications: [
          {
            id: 1,
            name: 'Application 1',
          },
          {
            id: 2,
            name: 'Application 2',
          },
        ],
      },
      {
        organisation: {
          id: 2,
          name: 'Organisation 2',
        },
        permission: {
          role: 'user',
        },
        applications: [
          {
            id: 3,
            name: 'Application 3',
          },
          {
            id: 4,
            name: 'Application 4',
          },
        ],
      },
    ];
    const resp = { data: organisations };
    jest.mock('../actions/organisations', () => ({
      addOrganisationsList: jest.fn(() => ({ type: 'ADD_ORGANISATIONS_LIST' })),
    }));
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: true,
      },
      {
        type: 'SET_PROFILE_LOADING',
        payload: true,
      },
      // skipped the actions created addOrganisationsList function
      // it will be tested seperately in other test
      {
        type: 'ADD_ORGANISATION_IDS',
        payload: [1, 2],
      },
      {
        type: 'ADD_MY_ORGANISATION_ROLE',
        payload: {
          1: 'admin',
          2: 'user',
        },
      },
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: false,
      },
      {
        type: 'SET_PROFILE_LOADING',
        payload: false,
      },
    ];

    store.dispatch(actions.getOrganisations()).then(() => {
      expectedActions.forEach((action) => {
        expect(store.getActions()).toContainEqual(action);
      });
    });
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
        type: 'SET_PROFILE_LOADING',
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
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: false,
      },
      {
        type: 'SET_PROFILE_LOADING',
        payload: false,
      },
    ];

    store
      .dispatch(actions.getOrganisations())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(`${types.ORGANISATIONS_API}/my`);
  });
  xit('should create actions to get organisation by id success', () => {
    const organisation = {
      organisation: {
        id: 1,
        name: 'Test Organisation',
        featured_medium_id: 2,
        medium: {
          id: 2,
          url: 'https://medium.com/test-image.jpg',
        },
        roles: [
          {
            id: 1,
            name: 'Test Role',
            users: [
              {
                id: 1,
                name: 'Test User',
              },
            ],
          },
        ],
        policies: [
          {
            id: 1,
            name: 'Test Policy',
          },
        ],
        organisation_users: [
          {
            id: 1,
            user: {
              id: 1,
              name: 'Test User',
            },
            role: 'Test Role',
          },
        ],
        applications: [
          {
            id: 1,
            name: 'Test Application',
          },
        ],
      },
      permission: {
        role: 'Test Role',
      },
    };
    const orgID = 1;
    const resp = { data: organisation };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: true,
      },
      {
        type: 'ADD_MEDIA',
        payload: buildObjectOfItems([organisation.organisation.medium]),
      },
      {
        type: 'ADD_USERS',
        payload: buildObjectOfItems(
          organisation.organisation.roles.map((role) => role.users).flat(),
        ),
      },
      {
        type: 'ADD_ORGANISATION_ROLES',
        payload: {
          id: organisation.organisation.id,
          data: buildObjectOfItems(organisation.organisation.roles),
        },
      },
      {
        type: 'ADD_ORGANISATION_ROLES',
        payload: {
          id: orgID,
          data: {},
        },
      },
      {
        type: 'ADD_ORGANISATION_POLICY',
        payload: {
          id: orgID,
          data: buildObjectOfItems(organisation.organisation.policies),
        },
      },
      {
        type: 'ADD_USERS',
        payload: buildObjectOfItems(
          organisation.organisation.organisation_users.map((ou) => ou.user),
        ),
      },
      {
        type: types.ADD_ORGANISATION,
        payload: {
          id: orgID,
          data: organisation.organisation,
        },
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
          time: Date.now(),
        },
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
  it('should create actions to create organisation success', () => {
    const resp = { data: { organisation: { id: 1, name: 'Organisation' } } };
    axios.post.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANISATION,
        payload: {
          id: 1,
          data: { id: 1, name: 'Organisation' },
        },
      },
      {
        type: types.SET_SELECTED_ORGANISATION,
        payload: 1,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Organisation added',
          time: Date.now(),
        },
      },
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: false,
      },
    ];

    store
      .dispatch(actions.addOrganisation({ name: 'Organisation', id: 1 }))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.ORGANISATIONS_API, {
      name: 'Organisation',
      id: 1,
    });
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
          time: Date.now(),
          message: errorMessage,
        },
      },
      {
        type: types.SET_ORGANISATIONS_LOADING,
        payload: false,
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
        payload: {
          id: 1,
          data: { id: 1, name: 'Organisation' },
        },
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
          time: Date.now(),
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
          time: Date.now(),
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
          time: Date.now(),
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
          time: Date.now(),
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
