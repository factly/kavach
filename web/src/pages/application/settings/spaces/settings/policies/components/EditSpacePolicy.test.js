import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../../matchMedia.mock';
import EditSpacePolicy from './EditSpacePolicy';
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
			policyID: 1,
		};
	}),
}));

import { getSpacePolicyByID, updateSpacePolicy } from '../../../../../../../actions/policy';

jest.mock('../../../../../../../actions/policy', () => ({
	getSpacePolicyByID: jest.fn(),
	updateSpacePolicy: jest.fn(),
}));

let state = {
	spaces: {
		details: {
			1: { id: 1, name: 'Space 1', description: 'Space 1 Description', roleIDs: [1, 2, 3, 4] },
		},
		loading: false,
	},
	policy: {
		space: {
			1: {
				1: {
					id: 1, name: 'Policy 1', description: 'Policy 1 Description', roles: [1, 2],
				}
			}
		},
		loading: false,
	},
	roles: {
		space: {
			1: {
				1: { id: 1, name: 'Role 1', description: 'Role 1 Description' },
				2: { id: 2, name: 'Role 2', description: 'Role 2 Description' },
				3: { id: 3, name: 'Role 3', description: 'Role 3 Description' },
				4: { id: 4, name: 'Role 4', description: 'Role 4 Description' },
			},
		},
	},
	profile: {
		roles: { 1: "owner" },
		loading: false,
	},
	organisations: { selected: 1 },
};


let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });
jest.mock('../../../../../../../components/Policies', () => {
	return {
		__esModule: true,
		default: (props) => {
			return <div id="policies">{props.children}</div>;
		},
	};
});

describe('Edit Space Policy component', () => {
	describe("snapshot testing", () => {
		it('should render the skeleton when loading policy', () => {
			state.policy.loading = true;
			store = mockStore(state);
			let component;
			act(() => {
				component = mount(
					<Provider store={store}>
						<Router>
							<EditSpacePolicy />
						</Router>
					</Provider>,
				);
			});
			expect(component).toMatchSnapshot();
			expect(component.find('Skeleton').length).toBe(1);
		});
		it('should render the skeleton when loading profile', () => {
			state.policy.loading = false;
			state.profile.loading = true;
			store = mockStore(state);
			let component;
			act(() => {
				component = mount(
					<Provider store={store}>
						<Router>
							<EditSpacePolicy />
						</Router>
					</Provider>,
				);
			});
			expect(component).toMatchSnapshot();
			expect(component.find('Skeleton').length).toBe(1);
		});
		it('should render the skeleton when loading space', () => {
			state.profile.loading = false;
			state.spaces.loading = true;
			store = mockStore(state);
			let component;
			act(() => {
				component = mount(
					<Provider store={store}>
						<Router>
							<EditSpacePolicy />
						</Router>
					</Provider>,
				);
			});
			expect(component).toMatchSnapshot();
			expect(component.find('Skeleton').length).toBe(1);
		});

		it('should render errorComponent when profile role is not owner', () => {
			state.spaces.loading = false;
			state.profile.roles = { 1: "member" };
			store = mockStore(state);
			let component;
			act(() => {
				component = mount(
					<Provider store={store}>
						<Router>
							<EditSpacePolicy />
						</Router>
					</Provider>,
				);
			});
			expect(component).toMatchSnapshot();
			expect(component.find('ErrorComponent').length).toBe(1);
		});
		it('should render when spaceID is not present', () => {
			let temp = state.spaces.details[1];
			state.spaces.details[1] = undefined;
			let temp2 = state.policy.space[1];
			state.policy.space[1] = undefined;
			store = mockStore(state);
			let component;
			act(() => {
				component = mount(
					<Provider store={store}>
						<Router>
							<EditSpacePolicy />
						</Router>
					</Provider>,
				);
			});
			expect(component).toMatchSnapshot();
			state.spaces.details[1] = temp;
			state.policy.space[1] = temp2;
		});
		it('should render editform', () => {
			state.profile.roles = { 1: "owner" };
			store = mockStore(state);
			let component;
			act(() => {
				component = mount(
					<Provider store={store}>
						<Router>
							<EditSpacePolicy />
						</Router>
					</Provider>,
				);
			});
			expect(component).toMatchSnapshot();
			expect(component.find('form').length).toBe(1);
		})
	});
	describe("function testing", () => {
		it('should call updateSpacePolicy when edit form is submitted', (done) => {
			state.profile.roles = { 1: "owner" };
			store = mockStore(state);
			let component;
			act(() => {
				component = mount(
					<Provider store={store}>
						<Router>
							<EditSpacePolicy />
						</Router>
					</Provider>,
				);
			});
			act(() => {
				component.find('input').at(0).simulate('change', { target: { value: 'Policy 1' } });
				component.find('input').at(1).simulate('change', { target: { value: 'policy-slug' } });
				component.find('TextArea').at(0).simulate('change', { target: { value: 'Test-description' } });
				component.find('Select').props().onChange(2);
				component.find('form').simulate('submit');
			})
			setTimeout(() => {
				expect(updateSpacePolicy).toHaveBeenCalledWith(1, 1, 1, {
					id: 1, name: 'Policy 1', slug: 'policy-slug', description: 'Test-description', roles: 2
				});

				expect(push).toHaveBeenCalledWith('/applications/1/settings/spaces/1/settings/policies');

				done();
			});
		});
	});
});
