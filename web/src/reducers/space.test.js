import reducer from './space'
import {
	ADD_SPACE,
	SET_SPACES_LOADING,
	RESET_SPACES,
	STOP_SPACES_LOADING,
	ADD_SPACES,
	ADD_SPACE_ROLE_IDS,
	ADD_SPACE_POLICY_IDS,
	ADD_SPACE_USERS,
	ADD_SPACE_TOKEN_IDS,
} from '../constants/space';
describe('space reducer', () => {
	let initialState;
	beforeEach(() => {
		initialState = {
			details: {},
			loading: true,
		};
	})
	it('should return the initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState)
	})
	it('should handle case when no state and action is passed is passed', () => {
		expect(reducer()).toEqual(initialState)
	});
	it('should return default state', () => {
		expect(reducer(initialState, { type: 'SOME_OTHER_ACTION' })).toEqual(initialState)
	})
	it('should handle SET_SPACES_LOADING', () => {
		const action = {
			type: SET_SPACES_LOADING,
			payload: true
		}
		expect(reducer({ ...initialState, loading: false }, action)).toEqual({
			...initialState,
			loading: true,
		})
	})
	it('should handle STOP_SPACES_LOADING', () => {
		const action = {
			type: STOP_SPACES_LOADING,
			payload: false
		}
		expect(reducer({ ...initialState, loading: true }, action)).toEqual({
			...initialState,
			loading: false,
		})
	})
	it('should handle ADD_SPACE', () => {
		const action = {
			type: ADD_SPACE,
			payload: [
				{
					id: 'space1',
					name: 'space1',
				},
				{
					id: 'space2',
					name: 'space2',
				},
			]
		}
		expect(reducer(initialState, action)).toEqual({
			...initialState,
			details: {
				'space1': {
					id: 'space1',
					name: 'space1',
				},
				'space2': {
					id: 'space2',
					name: 'space2',
				},
			}
		})
	})
	it('should handle ADD_SPACES', () => {
		const action = {
			type: ADD_SPACES,
			payload: {
				'space1': {
					id: 'space1',
					name: 'space1',
				},
				'space2': {
					id: 'space2',
					name: 'space2',
				},
			}
		}
		expect(reducer(initialState, action)).toEqual({
			...initialState,
			details: {
				'space1': {
					id: 'space1',
					name: 'space1',
				},
				'space2': {
					id: 'space2',
					name: 'space2',
				},
			}
		})
	})
	it('should handle ADD_SPACES when space exists already', () => {
		const action = {
			type: ADD_SPACES,
			payload: {
				'space1': {
					id: 'new space1',
					name: 'new space1',
				},
				'space2': {
					id: 'space2',
					name: 'space2',
				},
			}
		}
		expect(reducer({
			...initialState, details: {
				'space1': { id: 'space1', name: 'space1' }
			}
		}, action)).toEqual({
			...initialState,
			details: {
				'space1': {
					id: 'new space1',
					name: 'new space1',
				},
				'space2': {
					id: 'space2',
					name: 'space2',
				},
			}
		})
	})
	it('should handle ADD_SPACE_USERS', () => {
		const action = {
			type: ADD_SPACE_USERS,
			payload: {
				spaceID: 'space1',
				data: [
					{ id: 'user1', name: 'user1' },
					{ id: 'user2', name: 'user2' },
				],
			}
		}
		const state = {
			...initialState, details: {
				'space1': { id: 'space1', name: 'space1' }
			}
		}
		expect(reducer(state, action)).toEqual({
			...initialState,
			details: {
				'space1': {
					id: 'space1',
					name: 'space1',
					users: [
						{ id: 'user1', name: 'user1' },
						{ id: 'user2', name: 'user2' },
					],
				}
			}
		})
	})
	it('should handle RESET_SPACES', () => {
		const action = {
			type: RESET_SPACES,
		}
		expect(reducer({ ...initialState, details: { 'space1': { id: 'space1', name: 'space1' } } }, action)).toEqual({
			...initialState,
			details: {},
		})
	})
	it('should handle ADD_SPACE_ROLE_IDS', () => {
		const action = {
			type: ADD_SPACE_ROLE_IDS,
			payload: {
				id: 'space1',
				data: ['role1', 'role2'],
			}
		}
		const state = {
			...initialState, details: {
				'space1': { id: 'space1', name: 'space1' }
			}
		}
		expect(reducer(state, action)).toEqual({
			...initialState,
			details: {
				'space1': {
					id: 'space1',
					name: 'space1',
					roleIDs: ['role1', 'role2'],
				}
			}
		})
	})
	it('should handle ADD_SPACE_POLICY_IDS', () => {
		const action = {
			type: ADD_SPACE_POLICY_IDS,
			payload: {
				id: 'space1',
				data: ['policy1', 'policy2'],
			}
		}
		const state = {
			...initialState, details: {
				'space1': { id: 'space1', name: 'space1' }
			}
		}
		expect(reducer(state, action)).toEqual({
			...initialState,
			details: {
				'space1': {
					id: 'space1',
					name: 'space1',
					policyIDs: ['policy1', 'policy2'],
				}
			}
		})
	})
	it('should handle ADD_SPACE_TOKEN_IDS', () => {
		const action = {
			type: ADD_SPACE_TOKEN_IDS,
			payload: {
				spaceID: 'space1',
				data: ['token1', 'token2'],
			}
		}
		const state = {
			...initialState, details: {
				'space1': { id: 'space1', name: 'space1' }
			}
		}
		expect(reducer(state, action)).toEqual({
			...initialState,
			details: {
				'space1': {
					id: 'space1',
					name: 'space1',
					tokens: ['token1', 'token2'],
				}
			}
		})
	})
})
