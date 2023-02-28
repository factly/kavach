import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { getApplicationRoles } from '../../../../../actions/roles';
import { getApplication } from '../../../../../actions/application';
import { createApplicationPolicy } from '../../../../../actions/policy';
import CreateApplicationPolicy from './CreateApplicationPolicy';
import '../../../../../matchMedia.mock'
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

jest.mock('../../../../../actions/roles', () => ({
	getApplicationRoles: jest.fn(),
}));

jest.mock('../../../../../actions/application', () => ({
	getApplication: jest.fn(),
}));

jest.mock('../../../../../actions/policy', () => ({
	...jest.requireActual('../../../../../actions/policy'),
	createApplicationPolicy: jest.fn(),
}));

let state = {
	organisations: {
		selected: 1,
	},
	applications: {
		details: {
			1: {
				id: 1,
				name: 'Test App',
				description: 'Test App Description',
				roleIDs: [1, 2],
			},
		},
		loading: false
	},
	profile: {
		roles: {
			1: 'owner',
		},
		loading: false,
	},
	roles: {
		application: {
			1: {
				1: { id: 1, name: 'Test Role 1', description: 'Test Role 1 Description' },
				2: { id: 2, name: 'Test Role 2', description: 'Test Role 2 Description' },
			}
		},
		loading: false,
	}
};

jest.mock('../../../../../components/Policies', () => {
	return jest.fn((props) => (
		<div id="mockPolicies" {...props} />
	));
})
let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });
describe('Application Policies Create component', () => {
	let wrapper;
	describe('snapshot testing', () => {
		// loading app true
		// loading roles true
		// loading role true
		it("should render the component when loading app is true", () => {
			store = mockStore({
				...state,
				applications: {
					...state.applications,
					loading: true,
				}
			})
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateApplicationPolicy />
					</Router>
				</Provider>
			)

			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find('Skeleton')).toHaveLength(1);
		});
		it("should render the component when loading  roles is true", () => {
			store = mockStore({
				...state,
				roles: {
					...state.roles,
					loading: true,
				}
			})
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateApplicationPolicy />
					</Router>
				</Provider>
			)
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find('Skeleton')).toHaveLength(1);
		});
		it("should render the component when loading profile role is true", () => {
			store = mockStore({
				...state,
				profile: {
					...state.profile,
					loading: true,
				}
			})
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateApplicationPolicy />
					</Router>
				</Provider>
			)
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find('Skeleton')).toHaveLength(1);
		});
		it("should render the component when profile role is not owner", () => {
			store = mockStore({
				...state,
				profile: {
					...state.profile,
					roles: {
						1: 'admin',
					},
				}
			})
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateApplicationPolicy />
					</Router>
				</Provider>
			)
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find('ErrorComponent')).toHaveLength(1);
		});
		it("should render the component when profile role is owner", () => {
			store = mockStore({
				...state,
			})
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateApplicationPolicy />
					</Router>
				</Provider>
			)
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find('form')).toHaveLength(1);
		});

		// when application not found
		it("should render the component when application not found", () => {
			store = mockStore({
				...state,
				applications: {
					...state.applications,
					details: {},
				}
			})
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateApplicationPolicy />
					</Router>
				</Provider>
			)
			expect(wrapper).toMatchSnapshot();
		});
	});


	describe('component testing', () => {
		it('should call createApplicationPolicy', (done) => {
			store = mockStore({
				...state,
			})
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateApplicationPolicy />
					</Router>
				</Provider>
			)
			act(() => {
				// find input 2nd 3rd and 4th add values test-name, test-slug,test-description, and found select and add value 1
				wrapper.find('input').at(1).simulate('change', { target: { value: 'test-name' } });
				wrapper.find('input').at(2).simulate('change', { target: { value: 'test-slug' } });
				wrapper.find('TextArea').at(0).simulate('change', { target: { value: 'test-description' } });
				wrapper.find('Select').at(0).props().onChange({ target: { value: 1, label: 'Test Role 1' } });
				// submit form
				wrapper.find('form').simulate('submit');
			});

			setTimeout(() => {
				expect(createApplicationPolicy).toHaveBeenCalledWith(1, { name: 'test-name',"application_name": "Test App", slug: 'test-slug', description: 'test-description', roles : 1 });

				expect(push).toHaveBeenCalledWith('/applications/1/settings/policies');
				done();
			});
		});
	});
});
