import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from './roles';
import * as types from '../constants/roles';
import { ADD_NOTIFICATION } from '../constants/notifications';
import { getIds, buildObjectOfItems } from '../utils/objects';
import { ORGANISATIONS_API } from '../constants/organisations';

const {
	ROLES_API,
	ROLES_LOADING,
	ADD_APPLICATION_ROLES,
	ADD_ORGANISATION_ROLES,
	ADD_SPACE_ROLES,
	ADD_ORGANISATION_ROLE_BY_ID,
	ADD_APPLICATION_ROLE_BY_ID,
	ADD_SPACE_ROLE_BY_ID,
	ADD_ORGANISATION_ROLE_USERS,
	ADD_APPLICATION_ROLE_USERS,
	ADD_SPACE_ROLE_USERS,
} = types;

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
	req: [],
	details: {},
	loading: true,
};
const errorMsg = 'Error Happened';

describe('role user actions', () => {
	let store;
	let errorAction;
	let testDescription = 'should create actions for function ';
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

	// ! ##########################################################################
	// ! ###################### Without Api ACTIONS ###############################
	// ! ##########################################################################
	it(testDescription + 'addOrganisationRoleUsers', () => {
		const orgID = 'orgID';
		const roleID = 'roleID';
		const data = [{ id: 'id', name: 'name' }]
		const expectedAction = {
			type: ADD_ORGANISATION_ROLE_USERS,
			payload: {
				orgID: orgID,
				roleID: roleID,
				data: data,
			},
		};
		expect(actions.addOrganisationRoleUsers(orgID, roleID, data)).toEqual(expectedAction);
	});
	it(testDescription + 'addApplicationRoleUsers', () => {
		const appID = 1;
		const roleID = 1;
		const data = [{ id: 1, name: 'test' }, { id: 2, name: 'test2' }];
		const expectedAction = {
			type: ADD_APPLICATION_ROLE_USERS,
			payload: {
				appID: appID,
				roleID: roleID,
				data: data,
			},
		};
		expect(actions.addApplicationRoleUsers(appID, roleID, data)).toEqual(expectedAction);
	});
	it(testDescription + 'addSpaceRoleUsers', () => {
		const spaceID = 1;
		const roleID = 1;
		const data = [{ id: 1, name: 'test' }, { id: 2, name: 'test2' }];
		const expectedAction = {
			type: ADD_SPACE_ROLE_USERS,
			payload: {
				spaceID: spaceID,
				roleID: roleID,
				data: data,
			},
		};
		expect(actions.addSpaceRoleUsers(spaceID, roleID, data)).toEqual(expectedAction);
	});

	//! ##########################################################################
	//! ############################## GET ACTIONS ###############################
	//! ##########################################################################
	//? ##############################ORGANISATION###############################
	it(testDescription + 'getOrganisationRoleUsers success', () => {
		const orgID = 1;
		const roleID = 'roleID';
		const users = [{ id: 1, name: 'user1' }, { id: 2, name: 'user2' }];

		axios.get.mockImplementationOnce(() => Promise.resolve({ data: users }));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{ type: 'ADD_USERS', payload: buildObjectOfItems(users) },
			{
				type: ADD_ORGANISATION_ROLE_USERS,
				payload: {
					orgID: orgID,
					roleID: roleID,
					data: getIds(users),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		]

		store.dispatch(actions.getOrganisationRoleUsers(roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${roleID}/users`);
	});
	it(testDescription + 'getOrganisationRoleUsers failure', () => {
		const orgID = 1;
		const roleID = 1;

		axios.get.mockRejectedValue(new Error(errorMsg));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{ ...errorAction },
			{ type: ROLES_LOADING, payload: false },
		]

		store.dispatch(actions.getOrganisationRoleUsers(roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${roleID}/users`);
	});
	//? ##############################APPLICATION################################
	it(testDescription + 'getApplicationRoleUsers success', () => {
		const orgID = 1;
		const appID = 1;
		const roleID = 1;
		const data = [{ id: 1, name: 'test' }, { id: 2, name: 'test2' }];
		axios.get.mockResolvedValue({ data: data });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_APPLICATION_ROLE_USERS,
				payload: {
					appID: appID,
					roleID: roleID,
					data: getIds(data),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getApplicationRoleUsers(appID, roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}/users`);
	});
	it(testDescription + 'getApplicationRoleUsers failure', () => {
		const orgID = 1;
		const appID = 1;
		const roleID = 1;
		axios.get.mockRejectedValue(new Error(errorMsg));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{ ...errorAction },
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getApplicationRoleUsers(appID, roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}/users`);
	});

	//? ################################SPACE####################################
	it(testDescription + 'getSpaceRoleUsers success', () => {
		const orgID = 1;
		const appID = 1;
		const spaceID = 1;
		const roleID = 1;
		const data = [{ id: 1, name: 'test' }, { id: 2, name: 'test2' }];
		axios.get.mockResolvedValue({ data: data });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_SPACE_ROLE_USERS,
				payload: {
					spaceID: spaceID,
					roleID: roleID,
					data: getIds(data),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getSpaceRoleUsers(appID, spaceID, roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/roles/${roleID}/users`);
	});
	it(testDescription + 'getSpaceRoleUsers failure', () => {
		const orgID = 1;
		const appID = 1;
		const spaceID = 1;
		const roleID = 1;
		axios.get.mockRejectedValue(new Error(errorMsg));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{ ...errorAction },
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getSpaceRoleUsers(appID, spaceID, roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/roles/${roleID}/users`);
	});
	// ! ##########################################################################
	// ! ############################ ADD ACTIONS #################################
	// ! ##########################################################################
	//? ##############################ORGANISATION###############################
	it(testDescription + 'addOrganisationRoleUserByID success', () => {
		const orgID = 1;
		const roleID = 1;
		const userID = 1;
		const data = { user_id: userID };

		axios.post.mockResolvedValue({ data: {} });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					message: 'User Added Successfully',
					type: 'success',
					title: 'Success',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.addOrganisationRoleUserByID(roleID, userID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.post).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${roleID}/users`, data);
	});
	it(testDescription + 'addOrganisationRoleUserByID failure', () => {
		const orgID = 1;
		const roleID = 1;
		const userID = 1;
		const data = { user_id: userID };

		axios.post.mockRejectedValue(new Error(errorMsg));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{ ...errorAction },
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.addOrganisationRoleUserByID(roleID, userID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.post).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${roleID}/users`, data);
	});
	//? ##############################APPLICATION################################
	it(testDescription + 'addApplicationRoleUserByID success', () => {
		const orgID = 1;
		const appID = 1;
		const roleID = 1;
		const userID = 1;
		const data = { user_id: userID };

		axios.post.mockResolvedValue({ data: {} });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					message: 'User Added Successfully',
					type: 'success',
					title: 'Success',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.addApplicationRoleUserByID(appID, roleID, userID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.post).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}/users`, data);
	});
	it(testDescription + 'addApplicationRoleUserByID failure', () => {
		const orgID = 1;
		const appID = 1;
		const roleID = 1;
		const userID = 1;
		const data = { user_id: userID };

		axios.post.mockRejectedValue(new Error(errorMsg));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{ ...errorAction },
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.addApplicationRoleUserByID(appID, roleID, userID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.post).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}/users`, data);
	});
	//? ################################SPACE####################################
	it(testDescription + 'addSpaceRoleUserByID success', () => {
		const orgID = 1;
		const appID = 1;
		const spaceID = 1;
		const roleID = 1;
		const userID = 1;
		const data = { user_id: userID };

		axios.post.mockResolvedValue({ data: {} });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					message: 'User Added Successfully',
					type: 'success',
					title: 'Success',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.addSpaceRoleUserByID(appID, spaceID, roleID, userID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.post).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/roles/${roleID}/users`, data);
	});
	it(testDescription + 'addSpaceRoleUserByID failure', () => {
		const orgID = 1;
		const appID = 1;
		const spaceID = 1;
		const roleID = 1;
		const userID = 1;
		const data = { user_id: userID };

		axios.post.mockRejectedValue(new Error(errorMsg));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{ ...errorAction },
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.addSpaceRoleUserByID(appID, spaceID, roleID, userID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.post).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/roles/${roleID}/users`, data);
	});

	// ! ##########################################################################
	// ! ############################ DELETE ACTIONS ##############################
	// ! ##########################################################################
//? ##############################ORGANISATION###############################
it(testDescription + 'deleteOrganisationRoleUserByID success', () => {
  const orgID = 1;
  const roleID = 1;
  const userID = 1;

  axios.delete.mockResolvedValueOnce({ data: {} });
  const expectedActions = [
    { type: types.ROLES_LOADING, payload: true },
    {
      type: ADD_NOTIFICATION,
      payload: {
        message: 'User Deleted Successfully',
        type: 'success',
        title: 'Success',
        time: Date.now(),
      },
    },
    { type: types.ROLES_LOADING, payload: false },
  ]

  store.dispatch(actions.deleteOrganisationRoleUserByID(roleID, userID)).then(() => {
    expect(store.getActions()).toEqual(expectedActions);
  });

  expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${roleID}/users/${userID}`);
});
it(testDescription + 'deleteOrganisationRoleUserByID failure', () => {
  const orgID = 1;
  const roleID = 1;
  const userID = 1;

  axios.delete.mockRejectedValueOnce(new Error(errorMsg));
  const expectedActions = [
    { type: types.ROLES_LOADING, payload: true },
    {...errorAction},
    { type: types.ROLES_LOADING, payload: false },
  ]

  store.dispatch(actions.deleteOrganisationRoleUserByID(roleID, userID)).then(() => {
    expect(store.getActions()).toEqual(expectedActions);
  });

  expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${roleID}/users/${userID}`);
});
//? ##############################APPLICATION################################
it(testDescription + 'deleteApplicationRoleUserByID success', () => {
  const orgID = 1;
  const appID = 1;
  const roleID = 1;
  const userID = 1;

  axios.delete.mockResolvedValueOnce({ data: {} });
  const expectedActions = [
    { type: types.ROLES_LOADING, payload: true },
    {
      type: ADD_NOTIFICATION,
      payload: {
        message: 'User Deleted Successfully',
        type: 'success',
        title: 'Success',
        time: Date.now(),
      },
    },
    { type: types.ROLES_LOADING, payload: false },
  ]

  store.dispatch(actions.deleteApplicationRoleUserByID(appID, roleID, userID)).then(() => {
    expect(store.getActions()).toEqual(expectedActions);
  });

  expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}/users/${userID}`);
});
it(testDescription + 'deleteApplicationRoleUserByID failure', () => {
  const orgID = 1;
  const appID = 1;
  const roleID = 1;
  const userID = 1;

  axios.delete.mockRejectedValueOnce(new Error(errorMsg));
  const expectedActions = [
    { type: types.ROLES_LOADING, payload: true },
    {...errorAction},
    { type: types.ROLES_LOADING, payload: false },
  ];

  store.dispatch(actions.deleteApplicationRoleUserByID(appID, roleID, userID)).then(() => {
    expect(store.getActions()).toEqual(expectedActions);
  });

  expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}/users/${userID}`);
});
//? ################################SPACE####################################
it(testDescription + 'deleteSpaceRoleUserByID success', () => {
  const orgID = 1;
  const appID = 1;
  const spaceID = 1;
  const roleID = 1;
  const userID = 1;

  axios.delete.mockResolvedValueOnce({ data: {} });
  const expectedActions = [
    { type: types.ROLES_LOADING, payload: true },
    {
      type: ADD_NOTIFICATION,
      payload: {
        message: 'User Deleted Successfully',
        type: 'success',
        title: 'Success',
        time: Date.now(),
      },
    },
    { type: types.ROLES_LOADING, payload: false },
  ]

  store.dispatch(actions.deleteSpaceRoleUserByID(appID, spaceID, roleID, userID)).then(() => {
    expect(store.getActions()).toEqual(expectedActions);
  });

  expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/roles/${roleID}/users/${userID}`);
});
it(testDescription + 'deleteSpaceRoleUserByID failure', () => {
  const orgID = 1;
  const appID = 1;
  const spaceID = 1;
  const roleID = 1;
  const userID = 1;

  axios.delete.mockRejectedValueOnce(new Error(errorMsg));
  const expectedActions = [
    { type: types.ROLES_LOADING, payload: true },
    {...errorAction},
    { type: types.ROLES_LOADING, payload: false },
  ]

  store.dispatch(actions.deleteSpaceRoleUserByID(appID, spaceID, roleID, userID)).then(() => {
    expect(store.getActions()).toEqual(expectedActions);
  });

  expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/spaces/${spaceID}/roles/${roleID}/users/${userID}`);
});


});
