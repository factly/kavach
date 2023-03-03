import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../matchMedia.mock'
import { Popconfirm } from 'antd';
import SpaceUser from '.';

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

import { getSpaces } from '../../../../../../actions/space';
import { addSpaceUser } from '../../../../../../actions/spaceUser';
jest.mock('../../../../../../actions/space', () => ({
	getSpaces: jest.fn(),
}));

jest.mock('../../../../../../actions/spaceUser', () => ({
	addSpaceUser: jest.fn(),
}));
// appUsers: state.applications.details[appID]?.users.map((id) => state.users.details[id]) || [],
// loadingApps: state.applications.loading,
// spaceUsers: state.spaces.details[spaceID]?.users.map((id) => state.users.details[id]) || [],
// loadingSpace: state.spaces.loading,
// role: state.profile.roles[state.organisations.selected],
let state = {
	applications: {
		details: {
			1: {
				id: 1, name: 'Test App', description: 'Test App Description', users: [1, 2, 3, 4]
			},
		},
		loading: false,
	},
	users: {
		details: {
			1: { id: 1, name: 'User 1', email: 'user1@gmail.com' },
			2: { id: 2, name: 'User 2', email: 'user2@gmail.com' },
			3: { id: 3, name: 'User 3', email: 'user3@gmail.com' },
			4: { id: 4, name: 'User 4', email: 'user4@gmail.com' },
			5: { id: 5, name: 'User 5', email: 'user5@gmail.com' },
		},
	},
	spaces: {
		details: {
			1: {
				id: 1, name: 'Test Space', description: 'Test Space Description', users: [1, 2]
			},
		},
		loading: false,
	},
	profile: { roles: { 1: 'admin' } },
	organisations: { selected: 1 },
}

jest.mock('./components/userList', () => {
	return jest.fn((props) => <div id="userList" {...props} />);
});
let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });
describe('Space Users component', () => {
	it('should render correcty when loadingapps is true', () => {
		state.applications.loading = true;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpaceUser />
				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Select').props().children).toHaveLength(0);
	});
	it('should render correcty when loadingspace is true', () => {
		state.applications.loading = false;
		state.spaces.loading = true;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpaceUser />
				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Select').props().children).toHaveLength(0);
	});
	it('should render correcty when applicatioon user and space user not exists', () => {
		state.applications.loading = false;
		state.spaces.loading = false;
		let temp1 = state.applications.details[1]
		let temp2 = state.spaces.details[1]
		state.applications.details[1] = undefined;
		state.spaces.details[1] = undefined;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpaceUser />
				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Select').props().children).toHaveLength(0);

		state.applications.details[1] = temp1;
		state.spaces.details[1] = temp2;
	});
	it('should render correcty when loadingspace and loadingapps is false', () => {
		state.applications.loading = false;
		state.spaces.loading = false;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpaceUser />
				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Select').props().children).toHaveLength(2);
	});
	it('should call addSpaceUser when add user form is submitted', (done) => {
		state.applications.loading = false;
		state.spaces.loading = false;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpaceUser />
				</Router>
			</Provider>
		);
		act(() => {
			tree.find('Select').props().onChange(4);
			tree.find('form').simulate('submit');
		});
		setTimeout(() => {
			expect(addSpaceUser).toHaveBeenCalledWith(1, 1, {
				user_id: 4,
			});
			done();
		});
	});
});
