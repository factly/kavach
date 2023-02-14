import {
	ROLES_LOADING,
	ADD_APPLICATION_ROLES,
	ADD_ORGANISATION_ROLES,
	ADD_SPACE_ROLES,
	ADD_ORGANISATION_ROLE_BY_ID,
	ADD_APPLICATION_ROLE_BY_ID,
	ADD_SPACE_ROLE_BY_ID,
	ADD_SPACE_ROLE_USERS,
	ADD_APPLICATION_ROLE_USERS,
	ADD_ORGANISATION_ROLE_USERS,
} from '../constants/roles';
import reducer from './roles';
const initialState = {
	organisation: {},
	application: {},
	space: {},
	loading: true,
};

describe('roles Reducer', () => {
	it('should return the initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});
	it('should return default state', () => {
		expect(reducer(initialState, { type: 'UNKNOWN' })).toEqual(initialState);
	});
	it('should handle ROLES_LOADING', () => {
		let action = {
			type: ROLES_LOADING,
			payload: false,
		};
		expect(reducer(initialState, action)).toEqual({
			organisation: {},
			application: {},
			space: {},
			loading: false,
		});

		action = {
			type: ROLES_LOADING,
			payload: true,
		};

		expect(reducer({ ...initialState, loading: false }, action)).toEqual({
			organisation: {},
			application: {},
			space: {},
			loading: true,
		});
	});
	it('should handle ADD_ORGANISATION_ROLES', () => {
		const action = {
			type: ADD_ORGANISATION_ROLES,
			payload: {
				id: 'orgID',
				data: {
					'roleID1': { id: 'roleID1', name: 'roleName1' },
				}
			},
		}
		expect(reducer(initialState, action)).toEqual({
			...initialState,
			organisation: {
				...initialState.organisation,
				'orgID': { 'roleID1': { id: 'roleID1', name: 'roleName1' } },
			},
		});
	});
	it('should handle ADD_APPLICATION_ROLES', () => {
		const action = {
			type: ADD_APPLICATION_ROLES,
			payload: {
				id: 'appID',
				data: {
					'roleID1': { id: 'roleID1', name: 'roleName1' },
				}
			},
		}
		expect(reducer(initialState, action)).toEqual({
			...initialState,
			application: {
				...initialState.application,
				'appID': { 'roleID1': { id: 'roleID1', name: 'roleName1' } },
			},
		});
	});
	it('should handle ADD_SPACE_ROLES', () => {
		const action = {
			type: ADD_SPACE_ROLES,
			payload: {
				id: 'spaceID',
				data: {
					'roleID1': { id: 'roleID1', name: 'roleName1' },
				}
			},
		}
		expect(reducer(initialState, action)).toEqual({
			...initialState,
			space: {
				...initialState.space,
				'spaceID': { 'roleID1': { id: 'roleID1', name: 'roleName1' } },
			},
		});
	});
	it('should handle ADD_ORGANISATION_ROLE_BY_ID', () => {
		const action = {
			type: ADD_ORGANISATION_ROLE_BY_ID,
			payload: {
				orgID: 'orgID',
				roleID: 'roleID1',
				data: { id: 'roleID1', name: 'roleName1' },
			},
		}
		expect(reducer(initialState, action)).toEqual({
			...initialState,
			organisation: {
				...initialState.organisation,
				'orgID': { 'roleID1': { id: 'roleID1', name: 'roleName1' } },
			},
		});
	});
	it('should handle ADD_ORGANISATION_ROLE_BY_ID when role exists already', () => {
		const action = {
			type: ADD_ORGANISATION_ROLE_BY_ID,
			payload: {
				orgID: 'orgID',
				roleID: 'roleID1',
				data: { id: 'NEWroleID1', name: 'NEWroleName1' },
			},
		}
		expect(reducer({
			...initialState,
			organisation: {
				...initialState.organisation,
				'orgID': { 'roleID1': { id: 'roleID1', name: 'roleName1' } },
			},
		}, action)).toEqual({
			...initialState,
			organisation: {
				...initialState.organisation,
				'orgID': { 'roleID1': { id: 'NEWroleID1', name: 'NEWroleName1' } },
			},
		});
	});
	it('should handle ADD_APPLICATION_ROLE_BY_ID', () => {
		const action = {
			type: ADD_APPLICATION_ROLE_BY_ID,
			payload: {
				appID: 'appID',
				roleID: 'roleID1',
				data: { id: 'roleID1', name: 'roleName1' },
			},
		}
		expect(reducer(initialState, action)).toEqual({
			...initialState,
			application: {
				...initialState.application,
				'appID': { 'roleID1': { id: 'roleID1', name: 'roleName1' } },
			},
		});
	});
	it('should handle ADD_APPLICATION_ROLE_BY_ID when role exists already', () => {
		const action = {
			type: ADD_APPLICATION_ROLE_BY_ID,
			payload: {
				appID: 'appID',
				roleID: 'roleID1',
				data: { id: 'NEWroleID1', name: 'NEWroleName1' },
			},
		}
		expect(reducer({
			...initialState,
			application: {
				...initialState.application,
				'appID': { 'roleID1': { id: 'roleID1', name: 'roleName1' } },
			},
		}, action)).toEqual({
			...initialState,
			application: {
				...initialState.application,
				'appID': { 'roleID1': { id: 'NEWroleID1', name: 'NEWroleName1' } },
			},
		});
	});
	it('should handle ADD_SPACE_ROLE_BY_ID', () => {
		const action = {
			type: ADD_SPACE_ROLE_BY_ID,
			payload: {
				spaceID: 'spaceID',
				roleID: 'roleID1',
				data: { id: 'roleID1', name: 'roleName1' },
			},
		}
		expect(reducer(initialState, action)).toEqual({
			...initialState,
			space: {
				...initialState.space,
				'spaceID': { 'roleID1': { id: 'roleID1', name: 'roleName1' } },
			},
		});
	});
	it('should handle ADD_SPACE_ROLE_BY_ID when role exists already', () => {
		const action = {
			type: ADD_SPACE_ROLE_BY_ID,
			payload: {
				spaceID: 'spaceID',
				roleID: 'roleID1',
				data: { id: 'NEWroleID1', name: 'NEWroleName1' },
			},
		}
		expect(reducer({
			...initialState,
			space: {
				...initialState.space,
				'spaceID': { 'roleID1': { id: 'roleID1', name: 'roleName1' } },
			},
		}, action)).toEqual({
			...initialState,
			space: {
				...initialState.space,
				'spaceID': { 'roleID1': { id: 'NEWroleID1', name: 'NEWroleName1' } },
			},
		});
	});
	it('should handle ADD_ORGANISATION_ROLE_USERS', () => {
		const action = {
			type: ADD_ORGANISATION_ROLE_USERS,
			payload: {
				orgID: 'orgID',
				roleID: 'roleID1',
				data: {
					'userID1': { id: 'userID1', name: 'userName1' },
					'userID2': { id: 'userID2', name: 'userName2' },
				}
			}
		};
		expect(reducer(initialState, action)).toEqual({
			...initialState,
			organisation: {
				...initialState.organisation,
				'orgID': {
					'roleID1': {
						users: {
							'userID1': { id: 'userID1', name: 'userName1' },
							'userID2': { id: 'userID2', name: 'userName2' },
						}
					}
				},
			},
		});
	});
	it('should handle ADD_APPLICATION_ROLE_USERS', () => {
		const action = {
			type: ADD_APPLICATION_ROLE_USERS,
			payload: {
				appID: 'appID',
				roleID: 'roleID1',
				data: {
					'userID1': { id: 'userID1', name: 'userName1' },
					'userID2': { id: 'userID2', name: 'userName2' },
				}
			}
		};
		expect(reducer(initialState, action)).toEqual({
			...initialState,
			application: {
				...initialState.application,
				'appID': {
					'roleID1': {
						users: {
							'userID1': { id: 'userID1', name: 'userName1' },
							'userID2': { id: 'userID2', name: 'userName2' },
						}
					}
				},
			},
		});
	});
	it('should handle ADD_SPACE_ROLE_USERS', () => {
		const action = {
			type: ADD_SPACE_ROLE_USERS,
			payload: {
				spaceID: 'spaceID',
				roleID: 'roleID1',
				data: {
					'userID1': { id: 'userID1', name: 'userName1' },
					'userID2': { id: 'userID2', name: 'userName2' },
				}
			}
		};
		expect(reducer(initialState, action)).toEqual({
			...initialState,
			space: {
				...initialState.space,
				'spaceID': {
					'roleID1': {
						users: {
							'userID1': { id: 'userID1', name: 'userName1' },
							'userID2': { id: 'userID2', name: 'userName2' },
						}
					}
				},
			},
		});
	});
});
