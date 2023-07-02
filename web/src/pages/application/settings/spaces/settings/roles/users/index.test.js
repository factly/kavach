import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../../matchMedia.mock';
import SpaceRoleUsers from '.';

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
			roleID: 1,
		};
	}),
}));

import { addSpaceRoleUserByID, getSpaceRoleUsers } from '../../../../../../../actions/roles';
import { getSpaceUsers } from '../../../../../../../actions/spaceUser';

jest.mock('../../../../../../../actions/roles', () => ({
	addSpaceRoleUserByID: jest.fn(),
	getSpaceRoleUsers: jest.fn(),
}));

jest.mock('../../../../../../../actions/spaceUser', () => ({
	getSpaceUsers: jest.fn(),
}));

// var remUserIDs = [];
// var roleUserIDs = [];
// roleUserIDs = state.roles.space[spaceID][roleID]?.users || [];
// const spaceUserIDs = state.spaces.details[spaceID]?.users || [];
// if (spaceUserIDs?.length) {
// 	remUserIDs = spaceUserIDs.filter((uID) => roleUserIDs.every((rUID) => !(rUID === uID)));
// }
// return {
// 	roleUsers: roleUserIDs.map((id) => state.users.details[id]),
// 	remainingSpaceUsers: remUserIDs.map((id) => state.users.details[id]),
// 	loading: state.roles.loading,
// 	userRole: state.profile.roles[state.organisations.selected],
// 	loadingUserRole: state.profile.loading,
// };
let state = {
	roles: {
		space: {
			1: {
				1: {
					id: 1, name: 'Role 1', description: 'Role 1 Description', users: [1, 2]
				},
			},
		},
		loading: false,
	},
	spaces: {
		details: {
			1: {
				id: 1, name: 'Test Space', description: 'Test Space Description', users: [1, 2, 3, 4],
			},
		},
	},
	users: {
		details: {
			1: { id: 1, name: 'User 1', email: 'user1@gmail.com', },
			2: { id: 2, name: 'User 2', email: 'user2@gmail.com' },
			3: { id: 3, name: 'User 3', email: 'user3@gmail.com' },
			4: { id: 4, name: 'User 4', email: 'user4@gmail.com' },
		}
	},
	profile: {
		roles: {
			1: "owner",
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

describe('Space Role Users component', () => {
	it('should render component when roles loading is true', () => {
		state.roles.loading = true;
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoleUsers />
				</Router>
			</Provider>
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Skeleton').length).toBe(1);
	});
	it('should render component when profile loading is true', () => {
		state.roles.loading = false;
		state.profile.loading = true;
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoleUsers />
				</Router>
			</Provider>
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Skeleton').length).toBe(1);
	});

	it('should render component when role users are present', () => {
		state.roles.loading = false;
		state.profile.loading = false;
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoleUsers />
				</Router>
			</Provider>
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('UserList').length).toBe(1);
		expect(wrapper.find('UserList').props().users).toEqual(state.roles.space[1][1].users.map((id) => state.users.details[id]));
	});
	it('should render component when role users are not present', () => {
		state.roles.loading = false;
		state.profile.loading = false;
		const temp = state.roles.space[1];
		const temp2 = state.spaces.details[1];
		state.roles.space[1] = {};
		state.spaces.details[1] = {};
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoleUsers />
				</Router>
			</Provider>
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('UserList').length).toBe(1);
		expect(wrapper.find('UserList').props().users).toEqual([]);
		state.roles.space[1] = temp;
		state.spaces.details[1] = temp2;
	});
	it('should render form when user role is not owner', () => {
		state.profile.roles[1] = 'member';
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoleUsers />
				</Router>
			</Provider>
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('form').length).toBe(0);
	});
	it('should not render form when user role is owner', () => {
		state.profile.roles[1] = 'owner';
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoleUsers />
				</Router>
			</Provider>
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('form').length).toBe(1);
	});

	it('should call addSpaceRoleUserByID action when form is submitted', (done) => {
		state.profile.roles[1] = 'owner';
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoleUsers />
				</Router>
			</Provider>
		);

		act(() => {
			wrapper.find('Select').props().onChange(4);
			wrapper.find('form').simulate('submit');
		});
		setTimeout(() => {
			expect(addSpaceRoleUserByID).toHaveBeenCalledWith(1, 1, 1, 4);
			done();
		})
	});
});
