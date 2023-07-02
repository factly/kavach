import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions/policy';
import * as types from '../constants/policy';
import { ADD_NOTIFICATION } from '../constants/notifications';
import { buildObjectOfItems, getIds } from '../utils/objects';
import { ORGANISATIONS_API } from '../constants/organisations';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

const errorMsg = 'Error';
const testDescription = 'should create an action to ';

describe('profile actions', () => {
  let store;
  let errorAction;
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
  it(testDescription + 'startLoadingPolicy to true', () => {
    const expectedAction = {
      type: types.POLICY_LOADING,
      payload: true,
    };
    expect(actions.startLoadingPolicy()).toEqual(expectedAction);
  });
  it(testDescription + 'stopLoadingPolicy to false', () => {
    const expectedAction = {
      type: types.POLICY_LOADING,
      payload: false,
    };
    expect(actions.stopLoadingPolicy()).toEqual(expectedAction);
  });
  it(testDescription + 'addOrganisationPolicy without roles', () => {
    const orgID = 1;
    const policy = { id: 1, name: 'test', roles: [] };

    const expectedActions = [
      {
        type: 'ADD_ORGANISATION_ROLES',
        payload: {
          id: orgID,
          data: {},
        },
      },
      {
        type: types.ADD_ORGANISATION_POLICY,
        payload: {
          id: orgID,
          data: buildObjectOfItems([policy]),
        },
      },
    ];
    store.dispatch(actions.addOrganisationPolicy(orgID, [policy]));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it(testDescription + 'addOrganisationPolicy with roles', () => {
    const orgID = 1;
    const policy = {
      id: 1,
      name: 'test',
      roles: [
        {
          id: 1,
          name: 'test',
          users: [
            { id: 1, name: 'test' },
            { id: 2, name: 'test' },
          ],
        },
      ],
    };

    const policyRoles = policy.roles.map((role) => {
      return {
        ...role,
        users: getIds(role.users),
      };
    });

    const expectedActions = [
      {
        type: 'ADD_ORGANISATION_ROLES',
        payload: {
          id: orgID,
          data: buildObjectOfItems(policyRoles),
        },
      },
      {
        type: types.ADD_ORGANISATION_POLICY,
        payload: {
          id: orgID,
          data: buildObjectOfItems([{ ...policy, roles: getIds(policy.roles) }]),
        },
      },
    ];
    store.dispatch(actions.addOrganisationPolicy(orgID, [policy]));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it(testDescription + 'addApplicationPolicy', () => {
    const appID = 1;
    const policy = { id: 1, name: 'test', roles: [] };

    const expectedActions = [
      {
        type: types.ADD_APPLICATION_POLICY,
        payload: {
          id: appID,
          data: policy,
        },
      },
    ];
    store.dispatch(actions.addApplicationPolicy(appID, policy));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it(testDescription + 'addSpacePolicy', () => {
    const spaceID = 1;
    const policy = { id: 1, name: 'test', roles: [] };

    const expectedActions = [
      {
        type: types.ADD_SPACE_POLICY,
        payload: {
          id: spaceID,
          data: policy,
        },
      },
    ];
    store.dispatch(actions.addSpacePolicy(spaceID, policy));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it(testDescription + 'addOrganisationPolicyIDs', () => {
    const policyIDs = [1, 2, 3];

    const expectedActions = [
      {
        type: 'ADD_ORGANISATION_POLICY_IDS',
        payload: policyIDs,
      },
    ];
    store.dispatch(actions.addOrganisationPolicyIDs(policyIDs));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it(testDescription + 'addApplicationPolicyIDs', () => {
    const appID = 1;
    const policyIDs = [1, 2, 3];

    const expectedActions = [
      {
        type: 'ADD_APPLICATION_POLICY_IDS',
        payload: {
          id: appID,
          data: policyIDs,
        },
      },
    ];
    store.dispatch(actions.addApplicationPolicyIDs(appID, policyIDs));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it(testDescription + 'addSpacePolicyIDs', () => {
    const spaceID = 1;
    const policyIDs = [1, 2, 3];

    const expectedActions = [
      {
        type: 'ADD_SPACE_POLICY_IDS',
        payload: {
          id: spaceID,
          data: policyIDs,
        },
      },
    ];
    store.dispatch(actions.addSpacePolicyIDs(spaceID, policyIDs));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it(testDescription + 'addOrganisationPolicyByID', () => {
    const orgID = 1;
    const roleID = 1;
    const policy = { id: 1, name: 'test' };

    const expectedActions = [
      {
        type: 'ADD_ORGANISATION_POLICY_BY_ID',
        payload: {
          orgID,
          roleID,
          data: policy,
        },
      },
    ];

    store.dispatch(actions.addOrganisationPolicyByID(orgID, roleID, policy));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it(testDescription + 'addApplicationPolicyByID', () => {
    const appID = 1;
    const roleID = 1;
    const policy = { id: 1, name: 'test' };

    const expectedActions = [
      {
        type: 'ADD_APPLICATION_POLICY_BY_ID',
        payload: {
          appID,
          roleID,
          data: policy,
        },
      },
    ];

    store.dispatch(actions.addApplicationPolicyByID(appID, roleID, policy));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it(testDescription + 'addSpacePolicyByID', () => {
    const spaceID = 1;
    const roleID = 1;
    const policy = { id: 1, name: 'test' };

    const expectedActions = [
      {
        type: 'ADD_SPACE_POLICY_BY_ID',
        payload: {
          spaceID,
          roleID,
          data: policy,
        },
      },
    ];

    store.dispatch(actions.addSpacePolicyByID(spaceID, roleID, policy));
    expect(store.getActions()).toEqual(expectedActions);
  });

  // !####################################################################
  // !####################### API Actions ################################
  // !####################################################################

  // !####################################################################
  // ?####################### ORGANISATION ###############################
  // !####################################################################

  // ?#######################     GET      ###############################
  it(testDescription + 'getOrganisationPolicy success', () => {
    const orgID = 1;
    const policy = {
      id: 1,
      name: 'test',
      roles: [
        {
          id: 1,
          name: 'test',
          users: [
            { id: 1, name: 'test' },
            { id: 2, name: 'test' },
          ],
        },
      ],
    };

    const policyRoles = policy.roles.map((role) => {
      return {
        ...role,
        users: getIds(role.users),
      };
    });

    axios.get.mockResolvedValue({ data: [policy] });
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      {
        type: 'ADD_ORGANISATION_ROLES',
        payload: {
          id: orgID,
          data: buildObjectOfItems(policyRoles),
        },
      },
      {
        type: types.ADD_ORGANISATION_POLICY,
        payload: {
          id: orgID,
          data: buildObjectOfItems([{ ...policy, roles: getIds(policy.roles) }]),
        },
      },
      {
        type: 'ADD_ORGANISATION_POLICY_IDS',
        payload: getIds([policy]),
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getOrganisationPolicy()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/policy`);
  });
  it(testDescription + 'getOrganisationPolicy failure', () => {
    const orgID = 1;

    axios.get.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      { ...errorAction },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getOrganisationPolicy()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/policy`);
  });

  // ?#######################  GET BY ID   ###############################
  it(testDescription + 'getOrganisationPolicyByID success', () => {
    const orgID = 1;
    const policyID = 1;
    const policy = { id: 1, name: 'test', roles: [{ id: 1, name: 'test' }] };

    axios.get.mockResolvedValue({ data: policy });
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      {
        type: 'ADD_ORGANISATION_POLICY_BY_ID',
        payload: {
          orgID: 1,
          roleID: 1,
          data: { ...policy, roles: getIds(policy.roles) },
        },
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getOrganisationPolicyByID(orgID, policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/policy/${policyID}`);
  });
  it(testDescription + 'getOrganisationPolicyByID failure', () => {
    const orgID = 1;
    const policyID = 1;

    axios.get.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      { ...errorAction },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getOrganisationPolicyByID(orgID, policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/policy/${policyID}`);
  });

  // ?#######################     POST     ###############################
  it(testDescription + 'createOrganisationPolicy success', () => {
    const orgID = 1;
    const policy = { id: 1, name: 'test' };

    axios.post.mockResolvedValue({ data: policy });
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      {
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy Added Successfully',
          time: Date.now(),
        },
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.createOrganisationPolicy(policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.post).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/policy`, policy);
  });
  it(testDescription + 'createOrganisationPolicy failure', () => {
    const orgID = 1;
    const policy = { id: 1, name: 'test' };

    axios.post.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      { ...errorAction },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.createOrganisationPolicy(policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.post).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/policy`, policy);
  });

  // ?#######################     PUT      ###############################
  it(testDescription + 'updateOrganisationPolicy success', () => {
    const orgID = 1;
    const policy = { id: 1, name: 'test' };

    axios.put.mockResolvedValue({ data: policy });
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      {
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy Updated Successfully',
          time: Date.now(),
        },
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.updateOrganisationPolicy(policy.id, policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.put).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/policy/${policy.id}`,
      policy,
    );
  });
  it(testDescription + 'updateOrganisationPolicy failure', () => {
    const orgID = 1;
    const policy = { id: 1, name: 'test' };

    axios.put.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      { ...errorAction },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.updateOrganisationPolicy(policy.id, policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.put).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/policy/${policy.id}`,
      policy,
    );
  });

  // ?#######################     DELETE   ###############################
  it(testDescription + 'deleteOrganisationPolicy success', () => {
    const orgID = 1;
    const policyID = 1;

    axios.delete.mockResolvedValue({ data: policyID });
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      {
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy Deleted Successfully',
          time: Date.now(),
        },
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.deleteOrganisationPolicy(policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/policy/${policyID}`);
  });
  it(testDescription + 'deleteOrganisationPolicy failure', () => {
    const orgID = 1;
    const policyID = 1;

    axios.delete.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      { ...errorAction },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.deleteOrganisationPolicy(policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/policy/${policyID}`);
  });
  // !####################################################################
  // ?#######################   APPLICATION     ###############################
  // !####################################################################
  // ?#######################     GET      ###############################
  it(testDescription + 'getApplicationPolicy success', () => {
    const orgID = 1;
    const spaceID = 1;
    const appID = 1;
    const roles = [
      { id: 1, name: 'test' },
      { id: 2, name: 'test2' },
    ];
    const policies = [
      { id: 1, name: 'test', roles },
      { id: 2, name: 'test2', roles },
    ];

    const resultedPolicies = policies.map((policy) => {
      return {
        ...policy,
        roles: getIds(policy.roles),
      };
    });
    axios.get.mockResolvedValue({ data: policies });
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      {
        type: types.ADD_APPLICATION_POLICY,
        payload: {
          id: appID,
          data: buildObjectOfItems(resultedPolicies),
        },
      },
      {
        type: 'ADD_APPLICATION_POLICY_IDS',
        payload: {
          id: appID,
          data: getIds(policies),
        },
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getApplicationPolicy(appID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/policy`,
    );
  });
  it(testDescription + 'getApplicationPolicy failure', () => {
    const orgID = 1;
    const spaceID = 1;
    const appID = 1;

    axios.get.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      { ...errorAction },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getApplicationPolicy(appID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/policy`,
    );
  });
  // ?####################### GET BY ID   ###############################
  it(testDescription + 'getApplicationPolicyByID success', () => {
    const orgID = 1;
    const appID = 1;
    const policyID = 1;
    const policy = {
      id: 1,
      name: 'test',
      roles: [
        { id: 1, name: 'test' },
        { id: 2, name: 'test2' },
      ],
    };
    axios.get.mockResolvedValue({ data: policy });
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      {
        type: types.ADD_APPLICATION_POLICY_BY_ID,
        payload: {
          appID: appID,
          roleID: policyID,
          data: { ...policy, roles: getIds(policy.roles) },
        },
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getApplicationPolicyByID(appID, policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/policy/${policyID}`,
    );
  });
  it(testDescription + 'getApplicationPolicyByID failure', () => {
    const orgID = 1;
    const appID = 1;
    const policyID = 1;

    axios.get.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      { ...errorAction },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getApplicationPolicyByID(appID, policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/policy/${policyID}`,
    );
  });

  // ?#######################    POST      ###############################
  it(testDescription + 'createApplicationPolicy success', () => {
    const orgID = 1;
    const appID = 1;
    const policy = { id: 1, name: 'test' };

    axios.post.mockResolvedValue({ data: policy });
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      {
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy Added Successfully',
          time: Date.now(),
        },
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.createApplicationPolicy(appID, policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.post).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/policy`,
      policy,
    );
  });
  it(testDescription + 'createApplicationPolicy failure', () => {
    const orgID = 1;
    const appID = 1;
    const policy = { id: 1, name: 'test' };

    axios.post.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      { ...errorAction },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.createApplicationPolicy(appID, policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.post).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/policy`,
      policy,
    );
  });

  // ?#######################     PUT      ###############################
  it(testDescription + 'updateApplicationPolicy success', () => {
    const orgID = 1;
    const appID = 1;
    const policy = { id: 1, name: 'test' };

    axios.put.mockResolvedValue({ data: policy });
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      {
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy Updated Successfully',
          time: Date.now(),
        },
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.updateApplicationPolicy(appID, policy.id, policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.put).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/policy/${policy.id}`,
      policy,
    );
  });
  it(testDescription + 'updateApplicationPolicy failure', () => {
    const orgID = 1;
    const appID = 1;
    const policy = { id: 1, name: 'test' };

    axios.put.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      { ...errorAction },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.updateApplicationPolicy(appID, policy.id, policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.put).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/policy/${policy.id}`,
      policy,
    );
  });

  // ?#######################   DELETE     ###############################
  it(testDescription + 'deleteApplicationPolicy success', () => {
    const orgID = 1;
    const appID = 1;
    const policyID = 1;

    axios.delete.mockResolvedValue({ data: policyID });
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      {
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy Deleted Successfully',
          time: Date.now(),
        },
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.deleteApplicationPolicy(appID, policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.delete).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/policy/${policyID}`,
    );
  });
  it(testDescription + 'deleteApplicationPolicy failure', () => {
    const orgID = 1;
    const appID = 1;
    const policyID = 1;

    axios.delete.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      {
        type: types.POLICY_LOADING,
        payload: true,
      },
      { ...errorAction },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.deleteApplicationPolicy(appID, policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.delete).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/policy/${policyID}`,
    );
  });

  // !####################################################################
  // ?####################### SPACE ################################
  // !####################################################################
  // ?#######################     GET      ###############################
  it(testDescription + 'getSpacePolicy success', () => {
    const orgID = 1;
    const spaceID = 1;
    const appID = 1;
    const policy = {
      id: 1,
      name: 'test',
      roles: [
        { id: 1, name: 'test' },
        { id: 2, name: 'test 2' },
      ],
    };

    axios.get.mockResolvedValue({ data: [policy] });
    const expectedActions = [
      { type: types.POLICY_LOADING, payload: true },
      {
        type: types.ADD_SPACE_POLICY,
        payload: {
          id: spaceID,
          data: buildObjectOfItems([{ ...policy, roles: getIds(policy.roles) }]),
        },
      },
      {
        type: 'ADD_SPACE_POLICY_IDS',
        payload: {
          id: spaceID,
          data: getIds([policy]),
        },
      },
      { type: types.POLICY_LOADING, payload: false },
    ];

    store.dispatch(actions.getSpacePolicy(appID, spaceID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/policy`,
    );
  });
  it(testDescription + 'getSpacePolicy failure', () => {
    const orgID = 1;
    const spaceID = 1;
    const appID = 1;

    axios.get.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      { type: types.POLICY_LOADING, payload: true },
      { ...errorAction },
      { type: types.POLICY_LOADING, payload: false },
    ];

    store.dispatch(actions.getSpacePolicy(appID, spaceID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/policy`,
    );
  });

  // ?####################### GET BY ID   ###############################
  it(testDescription + 'getSpacePolicyByID success', () => {
    const orgID = 1;
    const appID = 1;
    const spaceID = 1;
    const policyID = 1;

    const policy = {
      id: 1,
      name: 'test',
      roles: [
        { id: 1, name: 'test' },
        { id: 2, name: 'test 2' },
      ],
    };

    axios.get.mockResolvedValue({ data: policy });
    const expectedActions = [
      { type: types.POLICY_LOADING, payload: true },
      {
        type: 'ADD_SPACE_POLICY_BY_ID',
        payload: {
          roleID: policyID,
          spaceID: spaceID,
          data: { ...policy, roles: getIds(policy.roles) },
        },
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.getSpacePolicyByID(appID, spaceID, policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/policy/${policyID}`,
    );
  });
  it(testDescription + 'getSpacePolicyByID failure', () => {
    const orgID = 1;
    const appID = 1;
    const spaceID = 1;
    const policyID = 1;

    axios.get.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      { type: types.POLICY_LOADING, payload: true },
      { ...errorAction },
      { type: types.POLICY_LOADING, payload: false },
    ];

    store.dispatch(actions.getSpacePolicyByID(appID, spaceID, policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/policy/${policyID}`,
    );
  });

  // ?#######################    POST      ###############################
  it(testDescription + 'createSpacePolicy success', () => {
    const orgID = 1;
    const appID = 1;
    const spaceID = 1;

    const policy = {
      id: 1,
      name: 'test',
      roles: [
        { id: 1, name: 'test' },
        { id: 2, name: 'test 2' },
      ],
    };

    axios.post.mockResolvedValue({ data: policy });
    const expectedActions = [
      { type: types.POLICY_LOADING, payload: true },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy Added Successfully',
          time: Date.now(),
        },
      },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.createSpacePolicy(appID, spaceID, policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.post).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/policy`,
      policy,
    );
  });
  it(testDescription + 'createSpacePolicy failure', () => {
    const orgID = 1;
    const appID = 1;
    const spaceID = 1;

    const policy = {
      id: 1,
      name: 'test',
      roles: [
        { id: 1, name: 'test' },
        { id: 2, name: 'test 2' },
      ],
    };

    axios.post.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      { type: types.POLICY_LOADING, payload: true },
      { ...errorAction },
      {
        type: types.POLICY_LOADING,
        payload: false,
      },
    ];

    store.dispatch(actions.createSpacePolicy(appID, spaceID, policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.post).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/policy`,
      policy,
    );
  });

  // ?#######################     PUT      ###############################
  it(testDescription + 'updateSpacePolicy success', () => {
    const orgID = 1;
    const appID = 1;
    const spaceID = 1;
    const policyID = 1;

    const policy = {
      id: 1,
      name: 'test',
      roles: [
        { id: 1, name: 'test' },
        { id: 2, name: 'test 2' },
      ],
    };

    axios.put.mockResolvedValue({ data: policy });
    const expectedActions = [
      { type: types.POLICY_LOADING, payload: true },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy Updated Successfully',
          time: Date.now(),
        },
      },
      { type: types.POLICY_LOADING, payload: false },
    ];

    store.dispatch(actions.updateSpacePolicy(policyID, appID, spaceID, policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.put).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/policy/${policyID}`,
      policy,
    );
  });
  it(testDescription + 'updateSpacePolicy failure', () => {
    const orgID = 1;
    const appID = 1;
    const spaceID = 1;
    const policyID = 1;

    const policy = {
      id: 1,
      name: 'test',
      roles: [
        { id: 1, name: 'test' },
        { id: 2, name: 'test 2' },
      ],
    };

    axios.put.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      { type: types.POLICY_LOADING, payload: true },
      { ...errorAction },
      { type: types.POLICY_LOADING, payload: false },
    ];

    store.dispatch(actions.updateSpacePolicy(policyID, appID, spaceID, policy)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.put).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/policy/${policyID}`,
      policy,
    );
  });

  // ?#######################   DELETE     ###############################
  it(testDescription + 'deleteSpacePolicy success', () => {
    const orgID = 1;
    const appID = 1;
    const spaceID = 1;
    const policyID = 1;

    axios.delete.mockResolvedValue({ data: {} });
    const expectedActions = [
      { type: types.POLICY_LOADING, payload: true },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy Deleted Successfully',
          time: Date.now(),
        },
      },
      { type: types.POLICY_LOADING, payload: false },
    ];

    store.dispatch(actions.deleteSpacePolicy(appID, spaceID, policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.delete).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/policy/${policyID}`,
    );
  });
  it(testDescription + 'deleteSpacePolicy failure', () => {
    const orgID = 1;
    const appID = 1;
    const spaceID = 1;
    const policyID = 1;

    axios.delete.mockRejectedValue(new Error(errorMsg));
    const expectedActions = [
      { type: types.POLICY_LOADING, payload: true },
      { ...errorAction },
      { type: types.POLICY_LOADING, payload: false },
    ];

    store.dispatch(actions.deleteSpacePolicy(appID, spaceID, policyID)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });

    expect(axios.delete).toHaveBeenCalledWith(
      `${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/policy/${policyID}`,
    );
  });
});
