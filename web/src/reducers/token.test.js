import {
	ADD_APPLICATION_TOKENS,
	ADD_TOKENS,
	SET_TOKENS_LOADING,
	ADD_ORGANISATION_TOKENS,
	ADD_SPACE_TOKENS,
} from '../constants/token';
import reducer from './token';


describe('token reducer', () => {
	let initialState;
	beforeEach(() => {
		initialState = {
			organisation: {},
			application: {},
			space: {},
			loading: true,
		};
	});
	it('should return the initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	})
	it('should return the state for default case', () => {
		expect(reducer(initialState, { type: 'default' })).toEqual(initialState);
	})
	it('should handle ADD_TOKENS', () => {
		const payload = {
			1: { id: 1, name: 'token 1' },
			2: { id: 2, name: 'token 2' },
		};
		expect(reducer(initialState, {
			type: ADD_TOKENS,
			payload,
		})).toEqual({ ...initialState, details: payload });
	})
	it('should handle SET_TOKENS_LOADING', () => {
		expect(reducer(initialState, {
			type: SET_TOKENS_LOADING,
			payload: false,
		})).toEqual({ ...initialState, loading: false });

		expect(reducer({ ...initialState, loading: false }, {
			type: SET_TOKENS_LOADING,
			payload: true,
		})).toEqual({ ...initialState, loading: true });
	})
	it('should handle ADD_ORGANISATION_TOKENS', () => {
		const payload = {
			id: 1,
			data: {
				1: { id: 1, name: 'token 1' },
				2: { id: 2, name: 'token 2' },
			},
		};
		expect(reducer(initialState, {
			type: ADD_ORGANISATION_TOKENS,
			payload,
		})).toEqual({
			...initialState,
			organisation: {
				[payload.id]: payload.data,
			},
		});
	})
	it('should handle ADD_ORGANISATION_TOKENS when token id exisits already', () => {
		const payload = {
			id: 1,
			data: {
				1: { id: 1, name: 'new token 1' },
				2: { id: 2, name: 'new token 2' },
			},
		};
		expect(reducer({ ...initialState, organisation: { 1: { 1: { id: 1, name: 'token 1' } } } }, {
			type: ADD_ORGANISATION_TOKENS,
			payload,
		})).toEqual({
			...initialState,
			organisation: {
				[payload.id]: payload.data,
			},
		});
	})
	it('should handle ADD_APPLICATION_TOKENS', () => {
		const payload = {
			id: 1,
			data: {
				1: { id: 1, payload: 'token 1' },
				2: { id: 2, payload: 'token 2' },
			},
		}
		expect(reducer(initialState, {
			type: ADD_APPLICATION_TOKENS,
			payload
		})).toEqual({
			...initialState,
			application: {
				[payload.id]: payload.data,
			}
		})

	})
	it('should handle ADD_APPLICATION_TOKENS when token id exisits already', () => {
		const payload = {
			id: 1,
			data: {
				1: { id: 1, name: 'new token 1' },
				2: { id: 2, name: 'new token 2' },
			},
		};
		expect(reducer({ ...initialState, application: { 1: { 1: { id: 1, name: 'token 1' } } } }, {
			type: ADD_APPLICATION_TOKENS,
			payload,
		})).toEqual({
			...initialState,
			application: {
				[payload.id]: payload.data,
			},
		});
	})
	it('should handle ADD_SPACE_TOKENS', () => {
		const payload = {
			spaceID: 1,
			data: {
				1: { id: 1, payload: 'token 1' },
				2: { id: 2, payload: 'token 2' },
			},
		}
		expect(reducer(initialState, {
			type: ADD_SPACE_TOKENS,
			payload
		})).toEqual({
			...initialState,
			space: {
				[payload.spaceID]: payload.data,
			}
		})
	})
	it('should handle ADD_SPACE_TOKENS when token id exisits already', () => {
		const payload = {
			spaceID: 1,
			data: {
				1: { id: 1, name: 'new token 1' },
				2: { id: 2, name: 'new token 2' },
			},
		};
		expect(reducer({ ...initialState, space: { 1: { 1: { id: 1, name: 'token 1' } } } }, {
			type: ADD_SPACE_TOKENS,
			payload,
		})).toEqual({
			...initialState,
			space: {
				[payload.spaceID]: payload.data,
			},
		});
	 })
})
