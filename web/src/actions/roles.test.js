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

describe('roles actions', () => {
	let store;
	let fixedTime;
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
	});

	//! ######################################################################
	//! ############ DIRECT RETURNING ACTIONS WITHOUT API ####################
	//! ######################################################################
	it(testDescription + 'startLoadingRoles', () => {
		const expectedAction = {
			type: ROLES_LOADING,
			payload: true,
		};
		expect(actions.startLoadingRoles()).toEqual(expectedAction);
	});
	it(testDescription + 'stopLoadingRoles', () => {
		const expectedAction = {
			type: ROLES_LOADING,
			payload: false,
		};
		expect(actions.stopLoadingRoles()).toEqual(expectedAction);
	});
	it(testDescription + 'addOrganisationRoles', () => {
		const orgID = 1;
		const roles = [
			{ id: 1, name: 'role1' },
			{ id: 2, name: 'role2' },
		];
		const expectedAction = {
			type: ADD_ORGANISATION_ROLES,
			payload: {
				id: orgID,
				data: roles,
			},
		};
		expect(actions.addOrganisationRoles(1, roles)).toEqual(expectedAction);
	});
	it(testDescription + 'addApplicationRoles', () => {
		const appID = 1;
		const data = [
			{ id: 1, name: 'role1' },
			{ id: 2, name: 'role2' },
		];

		const expectedAction = {
			type: ADD_APPLICATION_ROLES,
			payload: {
				id: appID,
				data: data,
			},
		};

		expect(actions.addApplicationRoles(appID, data)).toEqual(expectedAction);
	});
	it(testDescription + 'addSpaceRoles', () => {
		const spaceID = 1;
		const data = [
			{ id: 1, name: 'role1' },
			{ id: 2, name: 'role2' },
		];
		const expectedAction = {
			type: ADD_SPACE_ROLES,
			payload: {
				id: spaceID,
				data: data,
			},
		};
		expect(actions.addSpaceRoles(spaceID, data)).toEqual(expectedAction);
	});
	it(testDescription + 'addOrganisationRoleIDs', () => {
		const data = [
			{ id: 1, name: 'role1' },
			{ id: 2, name: 'role2' },
		];

		const expectedAction = {
			type: 'ADD_ORGANISATION_ROLE_IDS',
			payload: getIds(data),
		};

		expect(actions.addOrganisationRoleIDs(getIds(data)));
	});
	it(testDescription + 'addApplicationRoleIDs', () => {
		const appID = 1;
		const data = [
			{ id: 1, name: 'role1' },
			{ id: 2, name: 'role2' },
		];
		const expectedAction = {
			type: 'ADD_APPLICATION_ROLE_IDS',
			payload: {
				id: appID,
				data: getIds(data),
			},
		};
		expect(actions.addApplicationRoleIDs(appID, getIds(data))).toEqual(expectedAction);
	});
	it(testDescription + 'addSpaceRoleIDs', () => {
		const spaceID = 1;
		const data = [
			{ id: 1, name: 'role1' },
			{ id: 2, name: 'role2' },
		];

		const expectedAction = {
			type: 'ADD_SPACE_ROLE_IDS',
			payload: {
				id: spaceID,
				data: getIds(data),
			},
		};

		expect(actions.addSpaceRoleIDs(spaceID, getIds(data))).toEqual(expectedAction);
	});
	it(testDescription + 'addOrganisationRoleByID', () => {
		const orgID = 1;
		const data = { id: 1, name: 'role1' };
		const roleID = 1;
		const expectedAction = {
			type: ADD_ORGANISATION_ROLE_BY_ID,
			payload: {
				orgID: orgID,
				roleID: roleID,
				data: data,
			},
		};
		expect(actions.addOrganisationRoleByID(orgID, roleID, data)).toEqual(expectedAction);
	});
	it(testDescription + 'addApplicationRoleByID', () => {
		const appID = 1;
		const data = { id: 1, name: 'role1' };
		const roleID = 1;
		const expectedAction = {
			type: ADD_APPLICATION_ROLE_BY_ID,
			payload: {
				appID: appID,
				roleID: roleID,
				data: data,
			},
		};
		expect(actions.addApplicationRoleByID(appID, roleID, data)).toEqual(expectedAction);
	});
	it(testDescription + 'addSpaceRoleByID', () => {
		const spaceID = 1;
		const data = { id: 1, name: 'role1' };
		const roleID = 1;
		const expectedAction = {
			type: ADD_SPACE_ROLE_BY_ID,
			payload: {
				roleID: roleID,
				spaceID: spaceID,
				data: data,
			},
		};
		expect(actions.addSpaceRoleByID(spaceID, roleID, data)).toEqual(expectedAction);
	});

	//! ######################################################################
	//! ######################### ORGANISATION ROLES #########################
	//! ######################################################################

	//? ######################## GET ACTIONS WITH API ########################
	it(testDescription + 'getOrganisationRoles without users success', () => {
		const orgID = 1;
		const roles = [
			{ id: 1, name: 'role1' },
			{ id: 2, name: 'role2' },
		];

		axios.get.mockResolvedValue({ data: roles });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_ORGANISATION_ROLES,
				payload: {
					id: orgID,
					data: buildObjectOfItems(roles),
				},
			},
			{
				type: 'ADD_ORGANISATION_ROLE_IDS',
				payload: getIds(roles),
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getOrganisationRoles(orgID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}${ROLES_API}`);
	});

	it(testDescription + 'getOrganisationRoles with users success', () => {
		const orgID = 1;
		const roles = [
			{ id: 1, name: 'role1', users: [{ id: 1, name: 'user1' }] },
			{ id: 2, name: 'role2', users: [{ id: 2, name: 'user2' }] },
		];
		const users = [
			{ id: 1, name: 'user1' },
			{ id: 2, name: 'user2' },
		];
		const expectedActionsUsers = users.map((user) => {
			return {
				type: 'ADD_USERS',
				payload: buildObjectOfItems([user]),
			};
		});
		axios.get.mockResolvedValue({ data: roles });

		let resultedRoles = roles.map((role) => {
			return {
				...role,
				users: getIds(role.users),
			};
		});

		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			...expectedActionsUsers,
			{
				type: ADD_ORGANISATION_ROLES,
				payload: {
					id: orgID,
					data: buildObjectOfItems(resultedRoles),
				},
			},
			{
				type: 'ADD_ORGANISATION_ROLE_IDS',
				payload: getIds(resultedRoles),
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getOrganisationRoles(orgID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}${ROLES_API}`);
	});

	it(testDescription + 'getOrganisationRoles failure', () => {
		const orgID = 1;
		const errorMessage = 'Error message';
		axios.get.mockRejectedValue(new Error(errorMessage));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'error',
					title: 'Error',
					message: errorMessage,
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getOrganisationRoles(orgID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}${ROLES_API}`);
	});

	//? ######################## GET ACTIONS BY ID ########################
	it(testDescription + 'getOrganisationRoleByID success', () => {
		const orgID = 1;
		const role = {
			id: 1,
			name: 'test',
			users: [
				{ id: 1, name: 'test' },
				{ id: 2, name: 'test2' },
			],
		};
		const roleID = role.id;
		axios.get.mockResolvedValue({ data: role });
		const resultedRole = {
			...role,
			users: getIds(role.users),
		};

		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_ORGANISATION_ROLE_BY_ID,
				payload: {
					orgID: orgID,
					roleID: roleID,
					data: resultedRole,
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getOrganisationRoleByID(roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${roleID}`);
	});

	it(testDescription + 'getOrganisationRoleByID failure', () => {
		const orgID = 1;
		const roleID = 1;
		const errorMessage = 'Error message';
		axios.get.mockRejectedValue(new Error(errorMessage));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'error',
					title: 'Error',
					message: errorMessage,
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getOrganisationRoleByID(roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${roleID}`);
	});

	//? ###################### CREATE ACTIONS WITH API #######################
	it(testDescription + 'createOrganisationRole success', () => {
		const orgID = 1;
		const role = { id: 1, name: 'role1' };
		axios.post.mockResolvedValue({ data: role });

		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'success',
					message: 'Role Added Successfully',
					time: Date.now(),
					title: 'Success',
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.createOrganisationRole(role)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.post).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}${ROLES_API}`, role);
	});
	it(testDescription + 'createOrganisationRole failure', () => {
		const orgID = 1;
		const role = { id: 1, name: 'role1' };
		const errorMessage = 'Error message';
		axios.post.mockRejectedValue(new Error(errorMessage));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'error',
					title: 'Error',
					message: errorMessage,
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.createOrganisationRole(orgID, role)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.post).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}${ROLES_API}`, role);
	});

	//? ###################### UPDATE ACTIONS WITH API #######################
	it(testDescription + 'updateOrganisationRole success', () => {
		const orgID = 1;
		const roleID = 1;
		const role = { id: 1, name: 'test' };

		axios.put.mockResolvedValue({ data: role });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'success',
					message: 'Role Updated Successfully',
					title: 'Success',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];
		store.dispatch(actions.updateOrganisationRole(roleID, role)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.put).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${role.id}`, role);
	});

	it(testDescription + 'updateOrganisationRole failure', () => {
		const orgID = 1;
		const roleID = 1;
		const role = { id: 1, name: 'test' };

		axios.put.mockImplementationOnce(() => Promise.reject(new Error('Error updating role')));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'error',
					message: 'Error updating role',
					title: 'Error',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];
		store.dispatch(actions.updateOrganisationRole(roleID, role)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.put).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${role.id}`, role);
	});

	//? ###################### DELETE ACTIONS WITH API #######################
	it(testDescription + 'deleteOrganisationRole success', () => {
		const orgID = 1;
		const roleID = 1;
		axios.delete.mockResolvedValue({ data: roleID });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'success',
					message: 'Role Deleted Successfully',
					title: 'Success',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];
		store.dispatch(actions.deleteOrganisationRole(roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${roleID}`);
	});
	it(testDescription + 'deleteOrganisationRole failure', () => {
		const orgID = 1;
		const roleID = 1;
		axios.delete.mockImplementationOnce(() => Promise.reject(new Error('Error deleting role')));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'error',
					message: 'Error deleting role',
					title: 'Error',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];
		store.dispatch(actions.deleteOrganisationRole(roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.delete).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/roles/${roleID}`);
	});

	//! #################################################################
	//! ################### APPLICATIONS ACTIONS ########################
	//! #################################################################

	//? ###################### GET ACTIONS WITH API #######################
	it(testDescription + 'getApplicationRoles without users success', () => {
		const orgID = 1;
		const appID = 1;
		const roles = [
			{ id: 1, name: 'role1' },
			{ id: 2, name: 'role2' },
		];
		const resultedRoles = [
			{ id: 1, name: 'role1' },
			{ id: 2, name: 'role2' },
		];

		axios.get.mockResolvedValue({ data: roles });

		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_APPLICATION_ROLES,
				payload: {
					id: appID,
					data: buildObjectOfItems(resultedRoles),
				},
			},
			{
				type: 'ADD_APPLICATION_ROLE_IDS',
				payload: {
					id: appID,
					data: getIds(resultedRoles),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];
		store.dispatch(actions.getApplicationRoles(appID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
		expect(axios.get).toHaveBeenCalledWith(
			`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles`,
		);
	});
	it(testDescription + 'getApplicationRoles with users success', () => {
		const orgID = 1;
		const appID = 1;
		const users = [
			{ id: 1, name: 'user1' },
			{ id: 2, name: 'user2' },
			{ id: 3, name: 'user3' },
			{ id: 4, name: 'user4' },
		];
		const roles = [
			{ id: 1, name: 'role1', users: [users[0], users[1]] },
			{ id: 2, name: 'role2', users: [users[2], users[3]] },
		];
		const resultedRoles = [
			{ id: 1, name: 'role1', users: [1, 2] },
			{ id: 2, name: 'role2', users: [3, 4] },
		];

		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_APPLICATION_ROLES,
				payload: {
					id: appID,
					data: buildObjectOfItems(resultedRoles),
				},
			},
			{
				type: 'ADD_APPLICATION_ROLE_IDS',
				payload: {
					id: appID,
					data: getIds(resultedRoles),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		axios.get.mockResolvedValue({ data: roles });

		store.dispatch(actions.getApplicationRoles(appID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.get).toHaveBeenCalledWith(
			`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles`,
		);
	});

	it(testDescription + 'getApplicationRoles failure', () => {
		const orgID = 1;
		const appID = 1;
		const errormessage = 'error message';
		axios.get.mockRejectedValue(new Error(errormessage));

		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					title: 'Error',
					message: errormessage,
					time: Date.now(),
					type: 'error',
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getApplicationRoles(appID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.get).toHaveBeenCalledWith(
			`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles`,
		);
	});

	//? ###################### GET BY ID ACTIONS WITH API #######################
	it(testDescription + 'getApplicationRoleByID without users success', () => {
		const role = { id: 1, name: 'role1' };
		const roleID = 1;
		const appID = 1;
		const orgID = 1;
		axios.get.mockResolvedValue({ data: role });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_APPLICATION_ROLE_BY_ID,
				payload: {
					appID: appID,
					roleID: roleID,
					data: role,
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getApplicationRoleByID(appID, roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.get).toHaveBeenCalledWith(
			`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}`,
		);
	});

	it(testDescription + 'getApplicationRoleByID with users success', () => {
		const users = [{ id: 1, name: 'user1' }, { id: 2, name: 'user2' }];
		const role = { id: 1, name: 'role1', users };
		const roleID = 1;
		const appID = 1;
		const orgID = 1;
		axios.get.mockResolvedValue({ data: role });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_APPLICATION_ROLE_BY_ID,
				payload: {
					appID: appID,
					roleID: roleID,
					data: {
						...role,
						users: getIds(users),
					},
				},
			},
			{ type: 'ROLES_LOADING', payload: false },
		];

		store.dispatch(actions.getApplicationRoleByID(appID, roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.get).toHaveBeenCalledWith(`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}`,);
	});
	it(testDescription + 'getApplicationRoleByID failure', () => {
		const role = { id: 1, name: 'role1' };
		const roleID = 1;
		const appID = 1;
		const error = 'error';
		const orgID = 1;
		axios.get.mockRejectedValue(new Error(error));

		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					message: error,
					type: 'error',
					time: Date.now(),
					title: 'Error',
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.getApplicationRoleByID(appID, roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.get).toHaveBeenCalledWith(
			`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}`,
		);
	});

	//? ###################### CREATE ACTIONS WITH API #######################
	it(testDescription + 'createApplicationRole success', () => {
		const orgID = 1;
		const appID = 1;
		const role = { id: 1, name: 'test' };

		axios.post.mockResolvedValue({ data: role });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					message: 'Role Added Successfully',
					type: 'success',
					title: 'Success',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.createApplicationRole(appID, role)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.post).toHaveBeenCalledWith(
			`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles`,
			role,
		);
	});

	it(testDescription + 'createApplicationRole failure', () => {
		const orgID = 1;
		const appID = 1;
		const role = { id: 1, name: 'test' };
		const errorMsg = 'error';

		axios.post.mockRejectedValue(new Error(errorMsg));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					message: errorMsg,
					type: 'error',
					title: 'Error',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.createApplicationRole(appID, role)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.post).toHaveBeenCalledWith(
			`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles`,
			role,
		);
	});

	//? ###################### UPDATE ACTIONS WITH API #######################
	it(testDescription + 'updateApplicationRole success', () => {
		const appID = 1;
		const orgID = 1;
		const role = { id: 1, name: 'test' };
		const roleID = role.id;

		axios.put.mockImplementationOnce(() => Promise.resolve({ data: role }));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					message: 'Role Updated Successfully',
					type: 'success',
					title: 'Success',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.updateApplicationRole(roleID, appID, role)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.put).toHaveBeenCalledWith(
			`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}`,
			role,
		);
	});
	it(testDescription + 'updateApplicationRole failure', () => {
		const appID = 1;
		const orgID = 1;
		const role = { id: 1, name: 'test' };
		const roleID = role.id;

		const errorMsg = 'error';
		axios.put.mockRejectedValue(new Error(errorMsg));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					message: errorMsg,
					type: 'error',
					title: 'Error',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.updateApplicationRole(roleID, appID, role)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.put).toHaveBeenCalledWith(
			`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}`,
			role,
		);
	});

	//? ###################### DELETE ACTIONS WITH API #######################
	it(testDescription + 'deleteApplicationRole success', () => {
		const appID = 1;
		const orgID = 1;
		const roleID = 1;

		axios.delete.mockResolvedValueOnce({ data: roleID });
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					message: 'Role Deleted Successfully',
					type: 'success',
					title: 'Success',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.deleteApplicationRole(appID, roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.delete).toHaveBeenCalledWith(
			`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}`,
		);
	});
	it(testDescription + 'deleteApplicationRole failure', () => {
		const appID = 1;
		const orgID = 1;
		const roleID = 1;
		const errorMsg = 'Error deleting role';

		axios.delete.mockRejectedValueOnce(new Error(errorMsg));
		const expectedActions = [
			{ type: ROLES_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					message: errorMsg,
					type: 'error',
					title: 'Error',
					time: Date.now(),
				},
			},
			{ type: ROLES_LOADING, payload: false },
		];

		store.dispatch(actions.deleteApplicationRole(appID, roleID)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});

		expect(axios.delete).toHaveBeenCalledWith(
			`${ORGANISATIONS_API}/${orgID}/applications/${appID}/roles/${roleID}`,
		);
	});
});
