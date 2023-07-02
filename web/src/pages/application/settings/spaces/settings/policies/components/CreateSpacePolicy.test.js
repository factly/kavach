import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../../matchMedia.mock';
import CreateSpacePolicy from './CreateSpacePolicy';
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

import { getSpaceRoles } from '../../../../../../../actions/roles';
import { getSpaceByID } from '../../../../../../../actions/space';
import { createSpacePolicy } from '../../../../../../../actions/policy';

jest.mock('../../../../../../../actions/roles', () => ({
	getSpaceRoles: jest.fn(),
}));

jest.mock('../../../../../../../actions/space', () => ({
	getSpaceByID: jest.fn(),
}));

jest.mock('../../../../../../../actions/policy', () => ({
	createSpacePolicy: jest.fn(),
}));

// loadingSpace: state.spaces.loading,
// space: state.spaces.details[spaceID] ? state.spaces.details[spaceID] : null,
// loadingRole: state.profile.loading,
// role: state.profile.roles[state.organisations.selected],

let state = {
	spaces: {
		details: {
			1: {
				id: 1,
				name: 'Test Space',
				description: 'Test Space Description',
				roleIDs: [1, 2],
			},
		},
		loading: false,
	},
	profile: {
		roles: {
			1: 'owner',
		},
		loading: false,
	},
	organisations: {
		selected: 1,
	},
	roles: {
		space: {
			1: {
				1: { id: 1, name: 'owner', description: 'Owner' },
				2: { id: 2, name: 'editor', description: 'Editor' },
				3: { id: 3, name: 'viewer', description: 'Viewer' },
			}
		},
		loading: false,
	},
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

describe('Create Space Policy component', () => {
	describe("snapshot testing", () => {
		// loadingSpace || loadingRole || loadingRoles ? <Skeleton />
		it('should match snapshot when loadingSpace is true', () => {
			state.spaces.loading = true;
			store = mockStore(state);
			const tree = mount(
				<Provider store={store}>
					<Router>
						<CreateSpacePolicy />
					</Router>
				</Provider>,
			);
			expect(tree).toMatchSnapshot();
			expect(tree.find('Skeleton').length).toBe(1);
		});
		it('should match snapshot when loadingRole is true', () => {
			state.spaces.loading = false;
			state.profile.loading = true;
			store = mockStore(state);
			const tree = mount(
				<Provider store={store}>
					<Router>
						<CreateSpacePolicy />
					</Router>
				</Provider>,
			);
			expect(tree).toMatchSnapshot();
			expect(tree.find('Skeleton').length).toBe(1);
		});
		it('should match snapshot when loadingRoles is true', () => {
			state.profile.loading = false;
			state.roles.loading = true;
			store = mockStore(state);
			const tree = mount(
				<Provider store={store}>
					<Router>
						<CreateSpacePolicy />
					</Router>
				</Provider>,
			);
			expect(tree).toMatchSnapshot();
			expect(tree.find('Skeleton').length).toBe(1);
		});
		it('should match snapshot when profile role is not owner', () => {
			state.roles.loading = false;
			state.profile.roles[1] = 'member';
			store = mockStore(state);
			const tree = mount(
				<Provider store={store}>
					<Router>
						<CreateSpacePolicy />
					</Router>
				</Provider>,
			);
			expect(tree).toMatchSnapshot();
			expect(tree.find('ErrorComponent').length).toBe(1);
		});
		it('should match snapshot when form is rendered', () => {
			state.profile.roles[1] = 'owner';
			store = mockStore(state);
			const tree = mount(
				<Provider store={store}>
					<Router>
						<CreateSpacePolicy />
					</Router>
				</Provider>,
			);
			expect(tree).toMatchSnapshot();
			expect(tree.find('form').length).toBe(1);
		});
	});
	describe("function testing", () => {
		it('should call createSpacePolicy when form is submitted', (done) => {
			state.profile.roles[1] = 'owner';
			store = mockStore(state);
			const wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateSpacePolicy />
					</Router>
				</Provider>,
			);
			act(() => {
				wrapper.find('input').at(0).simulate('change', { target: { value: 'Test-name' } });
				wrapper.find('input').at(1).simulate('change', { target: { value: 'test-slug' } });
				wrapper.find('TextArea').at(0).simulate('change', { target: { value: 'Test-description' } });
				wrapper.find('Select').props().onChange(1);
				wrapper.find('form').simulate('submit');
			});
			setTimeout(() => {
				expect(createSpacePolicy).toHaveBeenCalledWith(1, 1, {
					name: 'Test-name',
					slug: 'test-slug',
					description: 'Test-description',
					roles: 1,
				});

				expect(push).toHaveBeenCalledWith('/applications/1/settings/spaces/1/settings/policies');
				done();
			})
		});
	});
});
