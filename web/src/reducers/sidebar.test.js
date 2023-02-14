import { SET_COLLAPSE } from './../constants/sidebar';
import sidebarReducer from './sidebar';
const initialState = {
	collapsed: false,
};

describe('sidebar reducer', () => {
	it('should return the initial state', () => {
		expect(sidebarReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle default case', () => {
		expect(
			sidebarReducer(initialState, {
				type: 'DEFAULT',
			})
		).toEqual(initialState);
	});

	it('should handle SET_COLLAPSE', () => {
		expect(
			sidebarReducer(initialState, {
				type: SET_COLLAPSE,
				payload: true,
			})
		).toEqual({
			collapsed: true,
		});

		expect(
			sidebarReducer({
				collapsed: true,
			}, {
				type: SET_COLLAPSE,
				payload: false,
			})
		).toEqual({
			collapsed: false,
		});
	});
})
