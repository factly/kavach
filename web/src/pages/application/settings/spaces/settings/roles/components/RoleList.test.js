import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../../matchMedia.mock'
import RoleList from './RoleList'
import { Popconfirm } from 'antd';
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

import { deleteSpaceRole, getSpaceRoles } from '../../../../../../../actions/roles';

jest.mock('../../../../../../../actions/roles', () => ({
	deleteSpaceRole: jest.fn(),
	getSpaceRoles: jest.fn(),
}));

let state = {
	roles: {
		space: {
			1: {
				1: {
					id: 1, name: 'Test Role', description: 'Test Role Description', spaceID: 1
				},
				2: {
					id: 2, name: 'Test Role 2', description: 'Test Role Description 2', spaceID: 1
				},
			},
		},
		loading: false,
	},
	spaces: {
		details: {
			1: {
				id: 1, name: 'Test Space', description: 'Test Space Description', roleIDs: [1, 2]
			},
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

describe('Roles List component', () => {
	it("should render the component when loading roles", () => {
		state.roles.loading = true;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<RoleList appID={1} spaceID={1} role="owner" />

				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Spin').at(1).props().spinning).toBe(true);
	});
	it("should render the component when roles are present", () => {
		state.roles.loading = false;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<RoleList appID={1} spaceID={1} role="owner" />
				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Table').props().dataSource).toEqual([
			{ id: 1, name: 'Test Role', description: 'Test Role Description', spaceID: 1 },
			{ id: 2, name: 'Test Role 2', description: 'Test Role Description 2', spaceID: 1 },
		]);
		expect(tree.find("Button").at(1).props().disabled).toBe(false);
		expect(tree.find("Button").at(2).props().disabled).toBe(false);
	});
	it("should render the component when roles are not present", () => {
		state.roles.loading = false;
		let temp = state.spaces.details;
		state.spaces.details = {};
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<RoleList appID={1} spaceID={1} role="owner" />
				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Table').props().dataSource).toEqual([]);
		state.spaces.details = temp;
	});
	it("should render the component when user role is not owner", () => {
		const tree = mount(
			<Provider store={store}>
				<Router>
					<RoleList appID={1} spaceID={1} role="editor" />
				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find("Button").at(1).props().disabled).toBe(true);
	});
	it("should call the delete role function when button is clicked", (done) => {
		const tree = mount(
			<Provider store={store}>
				<Router>
					<RoleList appID={1} spaceID={1} role="owner" />
				</Router>
			</Provider>
		);
		act(() => {
			expect(tree.find("Button").at(2).text()).toBe('Delete');
			tree.find("Button").at(2).simulate('click');
			tree.find(Popconfirm).at(0).props().onConfirm();
		})
		setTimeout(() => {
			expect(deleteSpaceRole).toHaveBeenCalledWith(1, 1, 1);
			done();
		})
	});
})
