import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../matchMedia.mock'
import SpaceEditForm from './SpaceEditForm';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
	...jest.requireActual('react-redux'),
	useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useHistory: jest.fn(),
	useParams: jest.fn(() => {
		return {
			appID: 1,
			spaceID: 1,
		};
	}),
}));

import { editSpace, getSpaceByID } from '../../../../../actions/space';
import { getApplication } from '../../../../../actions/application';

jest.mock('../../../../../actions/space', () => ({
	editSpace: jest.fn(),
	getSpaceByID: jest.fn(),
}));

jest.mock('../../../../../actions/application', () => ({
	getApplication: jest.fn(),
}));

// space: state.spaces.details[spaceID],
// loading: state.spaces.loading,
// application: state.applications.details[appID],
// loadingApp: state.applications.loading,
// role: state.profile.roles[state.organisations.selected],
// loadingRole: state.profile.loading,
let state = {
	spaces: {
		details: {
			1: {
				id: 1, name: 'Test Space', description: 'Test Space Description'
			},
		},
		loading: false,
	},
	applications: {
		details: {
			1: {
				id: 1, name: 'Test App', description: 'Test App Description'
			},
		},
		loading: false,
	},
	profile: {
		roles: {
			1: "owner"
		},
		loading: false,
	},
	organisations: {
		selected: 1,
	},
}

let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });

describe('Space Edit Form component', () => {
	describe('snapshot testing', () => {
		it('should render correctly when loading app', () => {
			store = mockStore({
				...state,
				applications: {
					...state.applications,
					loading: true,
				},
			});
			const tree = mount(
				<Provider store={store}>
					<Router>
						<SpaceEditForm />
					</Router>
				</Provider>
			)
			expect(tree).toMatchSnapshot()
			expect(tree.find('Skeleton').length).toBe(1)
		})
		it('should render correctly when loading space', () => {
			store = mockStore({
				...state,
				spaces: {
					...state.spaces,
					loading: true,
				},
			});
			const tree = mount(
				<Provider store={store}>
					<Router>
						<SpaceEditForm />
					</Router>
				</Provider>
			)
			expect(tree).toMatchSnapshot()
			expect(tree.find('Skeleton').length).toBe(1)
		})
		it('should render correctly when loading role', () => {
			store = mockStore({
				...state,
				profile: {
					...state.profile,
					loading: true,
				},
			});
			const tree = mount(
				<Provider store={store}>
					<Router>
						<SpaceEditForm />
					</Router>
				</Provider>
			)
			expect(tree).toMatchSnapshot()
			expect(tree.find('Skeleton').length).toBe(1)
		})

		it('should render when user is not owner', () => {
			store = mockStore({
				...state,
				profile: {
					...state.profile,
					roles: {
						1: "member"
					},
				},
			});
			const tree = mount(
				<Provider store={store}>
					<Router>
						<SpaceEditForm />
					</Router>
				</Provider>
			)
			expect(tree).toMatchSnapshot()
			expect(tree.find('ErrorComponent').length).toBe(1)
		})
		it('should render when user is owner', () => {
			store = mockStore({
				...state,
				profile: {
					...state.profile,
					roles: {
						1: "owner"
					},
				},
			});
			const tree = mount(
				<Provider store={store}>
					<Router>
						<SpaceEditForm />
					</Router>
				</Provider>
			)
			expect(tree).toMatchSnapshot()
			expect(tree.find('form').length).toBe(1)
		})
	})
	describe('function testing', () => {
		let wrapper;
		beforeEach(() => {
			store = mockStore({
				...state,
			});
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<SpaceEditForm />
					</Router>
				</Provider>
			);
			act(() => {
				wrapper.find('input').at(1).simulate('change', { target: { value: 'Test Name' } });
				wrapper.find('input').at(2).simulate('change', { target: { value: 'test-slug' } });
				wrapper.find('input').at(3).simulate('change', { target: { value: 'Test Description' } });
			})
		})
		afterEach(() => {
			editSpace.mockClear();
		})
		it('should call editSpace action when form is submitted without meta_fields', (done) => {
			act(() => {
				wrapper.find('form').at(0).simulate('submit');
			})
			setTimeout(() => {
				expect(editSpace).toHaveBeenCalledWith(1, 1, { application_name: "Test App", name: 'Test Name', slug: 'test-slug', description: 'Test Description', meta_fields: {} });
				expect(push).toHaveBeenCalledWith('/applications/1/settings/spaces/1/edit')
				done()
			})
		})
		it('should call editSpace action when form is submitted with meta_fields', (done) => {
			act(() => {
				wrapper.find('TextArea').at(0).simulate('change', { target: { value: '{"test": "test"}' } });
				wrapper.find('form').at(0).simulate('submit');
			})
			setTimeout(() => {
				expect(editSpace).toHaveBeenCalledWith(1, 1, {
					application_name: "Test App", name: 'Test Name', slug: 'test-slug', description: 'Test Description', meta_fields: {
						test: "test"
					}
				});
				expect(push).toHaveBeenCalledWith('/applications/1/settings/spaces/1/edit')
				done();
			})
		})
	})
})
