import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/application';
import * as types from '../constants/application';
import { ADD_MEDIA } from '../constants/media';
import { ADD_NOTIFICATION } from '../constants/notifications';
import { ADD_SPACES } from '../constants/space';
import { ADD_APPLICATION_TOKENS } from '../constants/token';
import { ADD_USERS } from '../constants/users';
import { buildObjectOfItems, deleteKeys, getIds } from '../utils/objects';
import { addMediaList } from './media';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('Application actions', () => {
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
    Date.now = jest.fn(() => 123);
  });
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_APPLICATIONS_LOADING,
      payload: true,
    };
    expect(actions.loadingApplications()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_APPLICATIONS_LOADING,
      payload: false,
    };
    expect(actions.stopApplicationLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to setDefaultApplicationsLoading', () => {
    const startLoadingAction = {
      type: types.SET_DEFAULT_APPLICATION_LOADING,
      payload: true,
    };
    expect(actions.setDefaultApplicationsLoading()).toEqual(startLoadingAction);
  });
  it('should create an action to stopDefaultApplicationsLoading', () => {
    const stopLoadingAction = {
      type: types.SET_DEFAULT_APPLICATION_LOADING,
      payload: false,
    };
    expect(actions.stopDefaultApplicationLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add application list', () => {
    const data = [
      {
        id: '1',
        medium: { id: '1', name: 'Medium 1' },
        spaces: [
          { id: 'space1', name: 'Space 1' },
          { id: 'space2', name: 'Space 2' },
        ],
        users: [
          { id: 'user1', name: 'User 1' },
          { id: 'user2', name: 'User 2' },
        ],
        tokens: [
          { id: 'token1', name: 'Token 1' },
          { id: 'token2', name: 'Token 2' },
        ],
      },
    ];
    const expectedActions = [
      { type: types.SET_APPLICATIONS_LOADING, payload: true },
      {
        type: ADD_MEDIA,
        payload: buildObjectOfItems([{ id: '1', name: 'Medium 1' }]),
      },
      {
        type: ADD_MEDIA,
        payload: buildObjectOfItems([]),
      },
      {
        type: ADD_USERS,
        payload: buildObjectOfItems([]),
      },
      {
        type: ADD_SPACES,
        payload: buildObjectOfItems(data[0].spaces),
      },
      {
        type: ADD_APPLICATION_TOKENS,
        payload: {
          id: '1',
          data: buildObjectOfItems(data[0].tokens),
        },
      },
      {
        type: types.ADD_APPLICATIONS,
        payload: buildObjectOfItems(
          data.map((item) => {
            const newItem = {
              ...item,
              spaces: getIds(item.spaces),
              users: getIds(item.users),
              tokens: getIds(item.tokens),
            };
            delete newItem.medium;
            return newItem;
          }),
        ),
      },
      { type: types.SET_APPLICATIONS_LOADING, payload: false },
    ];

    store.dispatch(actions.addApplicationList(data));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create an action to add single application', () => {
    const data = { id: 1, name: 'Application 1' };
    const addApplicationAction = {
      type: types.ADD_APPLICATION,
      payload: data,
    };
    expect(actions.getApplicationByID(data)).toEqual(addApplicationAction);
  });
  it('should create an action to add application request', () => {
    const data = [{ query: 'query' }];
    const addApplicationRequestAction = {
      type: types.ADD_APPLICATIONS_REQUEST,
      payload: data,
    };
    expect(actions.addApplicationsRequest(data)).toEqual(addApplicationRequestAction);
  });
  it('should create an action to reset application', () => {
    const resetApplicationsAction = {
      type: types.RESET_APPLICATIONS,
    };
    expect(actions.resetApplications()).toEqual(resetApplicationsAction);
  });
  it('should create actions to fetch applications success', () => {
    const applications = [{ id: 1, name: 'Application 1' }];
    jest.mock('../actions/application', () => ({
      addApplicationList: jest.fn(() => ({
        type: 'ADD_APPLICATIONS',
        payload: 'mock payload'
      })),
    }));
    axios.get.mockResolvedValue({ data: applications });

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: 'ADD_APPLICATION_IDS',
        payload: getIds(applications),
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getApplications())
      .then(() => {
        expectedActions.forEach((action) => {
          expect(store.getActions()).toContainEqual(action);
        });
        expect(axios.get).toHaveBeenCalledWith(types.APPLICATIONS_API + '/1' + '/applications');
      });
  });
  it('should create actions to fetch applications failure', () => {
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
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
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getApplications())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.APPLICATIONS_API + '/1' + '/applications');
  });
  it('should create actions to addDefaultApplications success', () => {
    const medium = { id: 1, medium: 'Medium' };
    const application = { id: 2, name: 'Default Application', medium };
    const resp = { data: application };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Application Added Successfully',
          time: Date.now(),
        },
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.addDefaultApplication(application.id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.APPLICATIONS_API + '/1' + '/applications/' + application.id + '/default',
    );
  });
  it('should create actions to addDefaultApplications failure', () => {
    const errorMessage = 'Unable to add default applications';
    const medium = { id: 1, medium: 'Medium' };
    const application = { id: 2, name: 'Default Application', medium };
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
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
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.addDefaultApplication(application.id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.APPLICATIONS_API + '/1' + '/applications/' + application.id + '/default',
    );
  });
  it('should create action to getApplication success', () => {
    const app = {
      id: 123,
      name: 'Test Application',
      medium_id: 456,
      roles: [
        { id: 1, name: 'Admin', users: [1, 2, 3] },
        { id: 2, name: 'User', users: [4, 5, 6] },
      ],
      medium: [{
        id: 456,
        name: 'medium'
      }],
      policies: [
        { id: 1, name: 'Policy 1' },
        { id: 2, name: 'Policy 2' },
      ],
      users: [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
        { id: 3, name: 'User 3' },
        { id: 4, name: 'User 4' },
        { id: 5, name: 'User 5' },
        { id: 6, name: 'User 6' },
      ],
      tokens: [
        { id: 1, name: 'Token 1' },
        { id: 2, name: 'Token 2' },
        { id: 3, name: 'Token 3' },
      ],
      spaces: [
        { id: 1, name: 'Space 1' },
        { id: 2, name: 'Space 2' },
      ],
    };
    const resultedApp = { ...app }
    const resp = { data: app };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      }, { type: 'ADD_MEDIA', payload: buildObjectOfItems(resultedApp.medium) },
      {
        type: 'ADD_APPLICATION_ROLES',
        payload: { id: 1, data: buildObjectOfItems(resultedApp.roles) }
      },
      {
        type: 'ADD_USERS',
        payload: buildObjectOfItems(resultedApp.users)
      },
      { type: 'ADD_MEDIA', payload: {} },
      { type: 'ADD_USERS', payload: {} },
      {
        type: 'ADD_SPACES',
        payload: buildObjectOfItems(resultedApp.spaces)
      },
      {
        type: 'ADD_APPLICATION',
        payload: {
          id: 123,
          name: 'Test Application',
          medium_id: 456,
          users: [1, 2, 3, 4, 5, 6],
          tokens: [1, 2, 3],
          spaces: [1, 2],
          roleIDs: [1, 2],
          policyIDs: [1, 2],
        }
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getApplication(1))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      });
    expect(axios.get).toHaveBeenCalledWith(types.APPLICATIONS_API + '/1/applications/' + 1);
  });
  it('should create action to getApplication failure', () => {
    const errorMessage = 'Unable to get application';
    axios.get.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
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
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getApplication(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.APPLICATIONS_API + '/1/applications/' + 1);
  });
  it('should create action to getApplication without medium success', () => {
    const application = { id: 1, name: 'Application 1' };
    const resp = { data: application };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      { type: 'ADD_APPLICATION_ROLES', payload: { id: 1, data: {} } },
      { type: 'ADD_USERS', payload: {} },
      { type: 'ADD_MEDIA', payload: {} },
      { type: 'ADD_USERS', payload: {} },
      { type: 'ADD_SPACES', payload: {} },
      {
        type: 'ADD_APPLICATION',
        payload: {
          id: 1,
          name: 'Application 1',
          roleIDs: [],
          policyIDs: [],
          users: [],
          tokens: [],
          spaces: []
        }
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.getApplication(1))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      });
    expect(axios.get).toHaveBeenCalledWith(types.APPLICATIONS_API + '/1/applications/' + 1);
  });
  it('should create actions to create application success', () => {
    const medium = { id: 1, medium: 'Medium' };
    const application = { id: 1, name: 'Application 1', medium };
    const resp = { data: application };
    axios.post.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_APPLICATIONS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          time: Date.now(),
          message: 'Application Added',
        },
      },
    ];
    store
      .dispatch(actions.createApplication(application))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.APPLICATIONS_API + '/1' + '/applications',
      application,
    );
  });
  it('should create actions to create application failure', () => {
    const medium = { id: 1, medium: 'Medium' };
    const application = { id: 1, name: 'Application 1', medium };
    const errorMessage = 'Unable to create application';
    axios.post.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
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
      .dispatch(actions.createApplication(application))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.APPLICATIONS_API + '/1' + '/applications',
      application,
    );
  });
  it('should create actions to update application success', () => {
    const medium = { id: 1, medium: 'Medium' };
    const application = { id: 1, name: 'Application 1', medium };
    const resp = { data: application };
    axios.put.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          time: Date.now(),
          message: 'Application Updated',
        },
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.updateApplication(application))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(
      types.APPLICATIONS_API + '/1' + '/applications/' + 1,
      application,
    );
  });
  it('should create actions to update application failure', () => {
    const medium = { id: 1, medium: 'Medium' };
    const application = { id: 1, name: 'Application 1', medium };
    const errorMessage = 'Unable to update application';
    axios.put.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
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
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.updateApplication(application))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(
      types.APPLICATIONS_API + '/1' + '/applications/' + 1,
      application,
    );
  });
  it('should create actions to update application without medium success', () => {
    const application = { id: 1, name: 'Application 1' };
    const resp = { data: application };
    axios.put.mockResolvedValueOnce(resp);

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          time: Date.now(),
          message: 'Application Updated',
        },
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];
    store
      .dispatch(actions.updateApplication(application))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(
      types.APPLICATIONS_API + '/1' + '/applications/' + 1,
      application,
    );
  });
  it('should create actions to delete application success', () => {
    axios.delete.mockResolvedValueOnce();

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_APPLICATIONS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          time: Date.now(),
          message: 'Application Deleted',
        },
      },
    ];
    store
      .dispatch(actions.deleteApplication(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.APPLICATIONS_API + '/1' + '/applications/' + 1);
  });
  it('should create actions to delete application failure', () => {
    const errorMessage = 'Unable to get application';
    axios.delete.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_APPLICATIONS_LOADING,
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
      .dispatch(actions.deleteApplication(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.APPLICATIONS_API + '/1' + '/applications/' + 1);
  });
  it('should create an action to add applications', () => {
    const applications = [
      {
        id: '1',
        medium: { id: '1', name: 'Medium 1' },
        spaces: [
          { id: 'space1', name: 'Space 1' },
          { id: 'space2', name: 'Space 2' },
        ],
        users: [
          { id: 'user1', name: 'User 1' },
          { id: 'user2', name: 'User 2' },
        ],
        tokens: [
          { id: 'token1', name: 'Token 1' },
          { id: 'token2', name: 'Token 2' },
        ],
      },
    ];
    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: buildObjectOfItems([{ id: '1', name: 'Medium 1' }]),
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: buildObjectOfItems(['1']),
      },
      {
        type: ADD_MEDIA,
        payload: buildObjectOfItems([]),
      },
      {
        type: ADD_USERS,
        payload: buildObjectOfItems([]),
      },
      {
        type: ADD_SPACES,
        payload: buildObjectOfItems(applications[0].spaces),
      },
      {
        type: ADD_APPLICATION_TOKENS,
        payload: {
          id: '1',
          data: buildObjectOfItems(applications[0].tokens),
        },
      },
      {
        type: types.ADD_APPLICATIONS,
        payload: buildObjectOfItems(
          applications.map((application) => {
            const newApplication = {
              ...application,
              users: getIds(application.users),
              spaces: getIds(application.spaces),
              tokens: getIds(application.tokens),
            };
            delete newApplication.medium;
            return newApplication;
          }),
        ),
      },
      {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.addApplications(applications));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should create an action to fetch default applications success', () => {
    const applications = [
      { id: 1, name: 'Application 1' },
      { id: 2, name: 'Application 2' },
      { id: 3, name: 'Application 3' },
    ];
    const resp = { data: applications };
    axios.get.mockResolvedValueOnce(resp);

    const expectedActions = [
      { type: 'SET_DEFAULT_APPLICATION_LOADING', payload: true },
      {
        type: 'GET_DEFAULT_APPLICATIONS',
        payload: applications,
      },
      { type: 'SET_DEFAULT_APPLICATION_LOADING', payload: false }
    ];

    store
      .dispatch(actions.getDefaultApplications())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
  });

  it('should create an action to fetch default applications failure', () => {
    const errorMessage = 'Unable to get applications';
    axios.get.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      { type: 'SET_DEFAULT_APPLICATION_LOADING', payload: true },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          time: Date.now(),
          message: errorMessage,
        },
      },
      { type: 'SET_DEFAULT_APPLICATION_LOADING', payload: false }
    ];

    store
      .dispatch(actions.getDefaultApplications())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
  });

  it('should create an action to delete default applications success', () => {
    axios.delete.mockResolvedValueOnce();

    const expectedActions = [
      { type: 'SET_APPLICATIONS_LOADING', payload: true },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          time: Date.now(),
          message: 'Application removed succesfully',
        },
      },
      { type: 'SET_APPLICATIONS_LOADING', payload: false }
    ];

    store
      .dispatch(actions.removeDefaultApplication(1))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
  });
  it('should create an action to delete default applications failure', () => {
    const errorMessage = 'Unable to delete application';
    axios.delete.mockRejectedValueOnce(new Error(errorMessage));

    const expectedActions = [
      { type: 'SET_APPLICATIONS_LOADING', payload: true },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          time: Date.now(),
          message: errorMessage,
        },
      },
      { type: 'SET_APPLICATIONS_LOADING', payload: false }
    ];

    store
      .dispatch(actions.removeDefaultApplication(1))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
  });
  it('should create action for addApplicationIds', () => {
    const data = [1,2,3]
    const expectedAction = {
      type: 'ADD_APPLICATION_IDS',
      payload: data
    }

    expect(actions.addApplicationIds(data)).toEqual(expectedAction)
  })
  it('should create action for addApplication', () => {
    const data = {id: 1}
    const expectedAction = {
      type: 'ADD_APPLICATION',
      payload: data
    }

    expect(actions.addApplication(data)).toEqual(expectedAction)
  })
  it('should create action for addSpaceIDs', () => {
    const data = [1,2,3]
    const expectedAction = {
      type: 'ADD_SPACE_IDS',
      payload: {
        appID: 1,
        data: data
      }
    }

    expect(actions.addSpaceIDs(1, data)).toEqual(expectedAction)
  })
  it('should create action for addDefaultApplicationsList', () => {
    const data = [1,2,3]
    const expectedAction = {
      type: 'GET_DEFAULT_APPLICATIONS',
      payload: data
    }

    expect(actions.addDefaultApplicationsList(data)).toEqual(expectedAction)
  })
});



