import {
	POLICY_LOADING,
	ADD_APPLICATION_POLICY,
	ADD_ORGANISATION_POLICY,
	ADD_SPACE_POLICY,
	ADD_ORGANISATION_POLICY_BY_ID,
	ADD_APPLICATION_POLICY_BY_ID,
	ADD_SPACE_POLICY_BY_ID,
} from '../constants/policy';
import reducer from './policy';

const initialState = {
	organisation: {},
	application: {},
	space: {},
	loading: true,
}
describe('policy reducer', () => {
	it('should return the initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});
	it('should return the state for default case', () => {
		expect(
			reducer({
				...initialState,
				organisation: { 1: { id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty' } },
				loading: false,
			}),
		).toEqual({
			...initialState,
			organisation: { 1: { id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty' } },
			loading: false,
		}
		);
	});
	it('should handle POLICY_LOADING', () => {
		expect(
			reducer(initialState, {
				type: POLICY_LOADING,
				payload: true,
			}),
		).toEqual({
			...initialState,
			loading: true,
		});
		expect(
			reducer(initialState, {
				type: POLICY_LOADING,
				payload: false,
			}),
		).toEqual({
			...initialState,
			loading: false,
		});
	});
	it('should handle ADD_ORGANISATION_POLICY', () => {
		expect(
			reducer(initialState, {
				type: ADD_ORGANISATION_POLICY,
				payload: {
					id: 1, data: {
						id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty'
					}
				},
			}),
		).toEqual({
			...initialState,
			organisation: {
				1: { id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty' },
			},
		});
	});
	it('should handle ADD_APPLICATION_POLICY', () => {
		expect(
			reducer(initialState, {
				type: ADD_APPLICATION_POLICY,
				payload: {
					id: 1, data: {
						id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty'
					}
				},
			}),
		).toEqual({
			...initialState,
			application: {
				1: { id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty' },
			},
		});
	});
	it('should handle ADD_SPACE_POLICY', () => {
		expect(
			reducer(initialState, {
				type: ADD_SPACE_POLICY,
				payload: {
					id: 1, data: {
						id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty'
					}
				},
			}),
		).toEqual({
			...initialState,
			space: {
				1: { id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty' },
			},
		});
	});
	it('should handle ADD_ORGANISATION_POLICY_BY_ID', () => {
		expect(
			reducer(initialState, {
				type: ADD_ORGANISATION_POLICY_BY_ID,
				payload: {
					orgID: 1, roleID: 1, data: {
						id: 1, email: 'qwerty@gamil.com', first_name: 'qwerty'
					}
				},
			}),
		).toEqual({
			...initialState,
			organisation: {
				1: {
					1: { id: 1, email: 'qwerty@gamil.com', first_name: 'qwerty' }
				},
			},
		});
	});
	it('should handle ADD_APPLICATION_POLICY_BY_ID', () => {
		expect(
			reducer(initialState, {
				type: ADD_APPLICATION_POLICY_BY_ID,
				payload: {
					appID: 1, roleID: 1, data: {
						id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty'
					}
				},
			}),
		).toEqual({
			...initialState,
			application: {
				1: {
					1: { id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty' }
				},
			},
		});
	});
	it('should handle ADD_SPACE_POLICY_BY_ID', () => {
		expect(
			reducer(initialState, {
				type: ADD_SPACE_POLICY_BY_ID,
				payload: {
					spaceID: 1, roleID: 1, data: {
						id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty'
					}
				},
			}),
		).toEqual({
			...initialState,
			space: {
				1: {
					1: { id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty' }
				},
			},
		});
	});
});
