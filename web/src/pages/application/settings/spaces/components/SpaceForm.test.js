import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../matchMedia.mock'
import SpaceForm from './SpaceForm'
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
		};
	}),
}));

import { createSpace } from '../../../../../actions/space';
import { getApplication } from '../../../../../actions/application';

jest.mock('../../../../../actions/space', () => ({
	createSpace: jest.fn(),
}));
jest.mock('../../../../../actions/application', () => ({
	getApplication: jest.fn(),
}));

//  application: state.applications.details[appID] ? state.applications.details[appID] : null,
// loadingApps: state.applications.loading,
// role: state.profile.roles[state.organisations.selected],
// loadingRole: state.profile.loading,
let state = {
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
};

let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });

describe('Space creation Form', () => {
	describe('snapshots', () => {
		it("should render correctly when loading Apps", () => {
			store = mockStore({
				...state,
				applications: {
					...state.applications,
					loading: true,
				},
			});
			const wrapper = mount(
				<Provider store={store}>
					<Router>
						<SpaceForm />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find('Skeleton')).toHaveLength(1);
		})
		it("should render correctly when loading Role", () => {
			store = mockStore({
				...state,
				profile: {
					...state.profile,
					loading: true,
				},
			});
			const wrapper = mount(
				<Provider store={store}>
					<Router>
						<SpaceForm />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find('Skeleton')).toHaveLength(1);
		})

		it("should render corretly when role is not owner", () => {
			store = mockStore({
				...state,
				profile: {
					...state.profile,
					roles: {
						1: "member"
					},
				},
			});
			const wrapper = mount(
				<Provider store={store}>
					<Router>
						<SpaceForm />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find('ErrorComponent')).toHaveLength(1);
		})
		it("should render corretly when role is owner", () => {
			store = mockStore({
				...state,
			});
			const wrapper = mount(
				<Provider store={store}>
					<Router>
						<SpaceForm />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find('form')).toHaveLength(1);
		})
		it("should render corretly when app not found", () => {
			store = mockStore({
				...state,
				applications: {
					...state.applications,
					details: {},
				},
			});
			const wrapper = mount(
				<Provider store={store}>
					<Router>
						<SpaceForm />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
		})
	})

	describe('functionality', () => {
		let wrapper;
		beforeEach(() => {
			store = mockStore({
				...state,
			});
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<SpaceForm />
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
			createSpace.mockClear();
		})
		it("should call createSpace action on submit without meta_fields", (done) => {
			act(() => {
				wrapper.find('form').simulate('submit');
			})
			setTimeout(() => {
				expect(createSpace).toHaveBeenCalledWith({
					name: 'Test Name',
					slug: 'test-slug',
					description: 'Test Description',
					application_name: 'Test App',
					meta_fields: {},
				}, 1)
				expect(push).toHaveBeenCalledWith('/applications/1/settings/spaces');

				done();
			})
		})
		it("should call createSpace action on submit with meta_fields as empty string", (done) => {
			act(() => {
				wrapper.find('TextArea').at(0).simulate('change', { target: { value: '' } });
				wrapper.find('form').simulate('submit');
			})
			setTimeout(() => {
				expect(createSpace).toHaveBeenCalledWith({
					name: 'Test Name',
					slug: 'test-slug',
					description: 'Test Description',
					application_name: 'Test App',
					meta_fields: {},
				}, 1)
				expect(push).toHaveBeenCalledWith('/applications/1/settings/spaces');

				done();
			})
		})
		it("should call createSpace action on submit with meta_fields", (done) => {
			act(() => {
				wrapper.find('TextArea').at(0).simulate('change', { target: { value: '{"test": "test"}' } });
				wrapper.find('form').simulate('submit');
			})
			setTimeout(() => {
				expect(createSpace).toHaveBeenCalledWith({
					name: 'Test Name',
					slug: 'test-slug',
					description: 'Test Description',
					application_name: 'Test App',
					meta_fields: { test: "test" },
				}, 1)
				expect(push).toHaveBeenCalledWith('/applications/1/settings/spaces');

				done();
			})
		})
		it("should fail validation when invalid JSON string is entered for meta_fields", (done) => {
			act(() => {
				wrapper.find('TextArea').at(0).simulate('change', { target: { value: 'invalid' } });
				wrapper.find('form').simulate('submit');
			})
			setTimeout(() => {
				expect(createSpace).not.toHaveBeenCalled();
				done();
			})
		})
	})
})
