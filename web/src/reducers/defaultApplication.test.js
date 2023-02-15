import {
	GET_DEFAULT_APPLICATIONS,
	SET_DEFAULT_APPLICATION_LOADING,
} from '../constants/application';
import reducer from './defaultApplication';

const initialState = {
	applications: [],
	loading: true,
};

describe('reducer reducer', () => {
	it('should return the initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});
	it('should handle case when no state and action is passed is passed', () => {
		expect(reducer()).toEqual(initialState)
	});
	it('should handle SET_DEFAULT_APPLICATION_LOADING', () => {
		expect(
			reducer(initialState, {
				type: SET_DEFAULT_APPLICATION_LOADING,
				payload: false,
			})
		).toEqual({
			...initialState,
			loading: false,
		});
		expect(reducer({ ...initialState, loading: false }, {
			type: SET_DEFAULT_APPLICATION_LOADING,
			payload: true,
		})).toEqual(initialState);
	});

	it('should handle GET_DEFAULT_APPLICATIONS', () => {
		expect(
			reducer(initialState, {
				type: GET_DEFAULT_APPLICATIONS,
				payload: [{ id: 1, name: 'test' }],
			})
		).toEqual({
			...initialState,
			applications: [{ id: 1, name: 'test' }],
		});
	});

	it('should handle default case', () => {
		expect(
			reducer(initialState, {
				type: 'default',
			})
		).toEqual(initialState);
	});
});
