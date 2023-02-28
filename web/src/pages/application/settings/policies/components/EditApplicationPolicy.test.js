import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { act } from 'react-dom/test-utils';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { getApplicationPolicyByID, updateApplicationPolicy } from '../../../../../actions/policy';
import EditApplicationPolicy from './EditApplicationPolicy';
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
			policyID: 1,
		};
	}),
}));

jest.mock('../../../../../actions/policy', () => ({
	getApplicationPolicyByID: jest.fn(),
	updateApplicationPolicy: jest.fn(),
}));

let state = {
	organisations: {
		selected: 1,
	},
	applications: {
		details: {
			1: {
				id: 1, name: 'Test Application', description: 'Test Description', policies: [1, 2], roleIDs: [1, 2],
			},
		},
		loading: false,
	},
	policy: {
		application: {
			1: {
				1: { id: 1, name: 'Test Policy 1', description: 'Test Description 1', applicationID: 1, roles: [3, 4] },
			}
		},
		loading: false,
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
				1: { id: 1, name: 'Test Role 1', description: 'Test Description 1' },
				2: { id: 2, name: 'Test Role 2', description: 'Test Description 2' },
				3: { id: 3, name: 'Test Role 3', description: 'Test Description 3' },
				4: { id: 4, name: 'Test Role 4', description: 'Test Description 4' },
			},
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
describe('Application Policies Edit component', () => {

	describe('snapshot testing', () => {
		it('profile role is member errorcomponent is rendered', () => {
			store = mockStore({
				...state,
				profile: {
					roles: {
						1: 'member',
					},
					loading: false,
				},
			});
			const tree = mount(
				<Provider store={store}>
					<Router>
						<EditApplicationPolicy />
					</Router>
				</Provider>
			);
			expect(tree).toMatchSnapshot();
			expect(tree.find('ErrorComponent').length).toBe(1);
		})
		it('loadingapp is true skeleton is rendered', () => {
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
						<EditApplicationPolicy />
					</Router>
				</Provider>
			);
			expect(tree).toMatchSnapshot();
			expect(tree.find('Skeleton').length).toBe(1);
		})
		it('loading profile is true skeleton is rendered', () => {
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
						<EditApplicationPolicy />
					</Router>
				</Provider>
			);
			expect(tree).toMatchSnapshot();
			expect(tree.find('Skeleton').length).toBe(1);
		})
		it('loading policy is true  skeleton is rendered', () => {
			store = mockStore({
				...state,
				policy: {
					...state.policy,
					loading: true,
				},
			});
			const tree = mount(
				<Provider store={store}>
					<Router>
						<EditApplicationPolicy />
					</Router>
				</Provider>
			);
			expect(tree).toMatchSnapshot();
			expect(tree.find('Skeleton').length).toBe(1);
		})
		it('Edit form is rendered with all data', () => {
			store = mockStore(state);
			const tree = mount(
				<Provider store={store}>
					<Router>
						<EditApplicationPolicy />
					</Router>
				</Provider>
			);
			expect(tree).toMatchSnapshot();
			expect(tree.find('form').length).toBe(1);
		})
		it('Edit form is rendered when app not found', () => {
			store = mockStore({
				...state,
				applications: {
					...state.applications,
					details: {},
				},
			});
			const tree = mount(
				<Provider store={store}>
					<Router>
						<EditApplicationPolicy />
					</Router>
				</Provider>
			);
			expect(tree).toMatchSnapshot();
			expect(tree.find('form').length).toBe(1);
		})
	});

	describe('component testing', () => {
		// call the updateApplicationPolicy action with the correct params
		it('should call the updateApplicationPolicy action with the correct params', (done) => {
			store = mockStore(state);
			const wrapper = mount(
				<Provider store={store}>
					<Router>
						<EditApplicationPolicy />
					</Router>
				</Provider>
			);
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
				expect(mockedDispatch).toHaveBeenCalledWith(updateApplicationPolicy(1, { name: 'test-name', slug: 'test-slug', description: 'test-description', roles: [1] }));

				expect(push).toHaveBeenCalledWith('/applications/1/settings/policies');
				done();
			});
		});
	});
})

