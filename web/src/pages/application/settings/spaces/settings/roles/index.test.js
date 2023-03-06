import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import SpaceRoles from '.';

import '../../../../../../matchMedia.mock';

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

import { getSpaceRoles } from '../../../../../../actions/roles';

jest.mock('../../../../../../actions/roles', () => ({
	getSpaceRoles: jest.fn(),
}));

jest.mock('./components/RoleList', () => {
	return jest.fn((props) => <div {...props}>SpaceRoleList</div>);
})

// space: state.spaces.details[spaceID],
// loadingSpace: state.spaces.loading,
// role: state.profile.roles[state.organisations.selected],
// loading: state.profile.loading,

let state = {
	spaces: {
		details: {
			1: {
				id: 1, name: 'Test Space', description: 'Test Space Description',
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
};
let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });

describe('Space Roles Component', () => {
	it('should match snapshot when loading', () => {
		state.spaces.loading = true;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoles />
				</Router>
			</Provider>,
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Skeleton').length).toBe(1);
	})
	it('should match snapshot when loading roles', () => {
		state.spaces.loading = false;
		state.profile.loading = true;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoles />
				</Router>
			</Provider>,
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Skeleton').length).toBe(1);
	})
	it('should match snapshot when no role is not owner', () => {
		state.spaces.loading = false;
		state.profile.loading = false;
		state.profile.roles[1] = 'admin';
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoles />
				</Router>
			</Provider>,
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Link').length).toBe(1);
	})

	it('should match snapshot when role is owner', () => {
		state.profile.roles[1] = 'owner';
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoles />
				</Router>
			</Provider>,
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Link').at(1).props().to).toEqual({
			pathname: '/applications/1/settings/spaces/1/settings/roles/create',
		})
	})
})
