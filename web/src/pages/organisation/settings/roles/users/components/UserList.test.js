import React from "react";
import thunk from "redux-thunk";
import { useDispatch } from 'react-redux';
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { BrowserRouter as Router } from "react-router-dom";
import { useHistory, useParams } from 'react-router-dom';
import '../../../../../../matchMedia.mock.js'
import { Popconfirm } from "antd";
import {
	deleteOrganisationRoleUserByID,
	getOrganisationRoleUsers,
} from '../../../../../../actions/roles';

import UserList from "./OrganisationRoleUserList.js";

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock("react-redux", () => ({
	...jest.requireActual("react-redux"),
	useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useHistory: jest.fn(),
	useParams: jest.fn(() => ({
		orgID: 1,
		policyID: 1,
	})),
}));

jest.mock('../../../../../../actions/roles', () => ({
	deleteOrganisationRoleUserByID: jest.fn(() => Promise.resolve({})),
	getOrganisationRoleUsers: jest.fn(() => Promise.resolve({})),
}));

const users = [
	{
		id: 1,
		first_name: "test",
		last_name: "user",
		display_name: "test user",
		email: "testuser@gmail.com"
	},
	{
		id: 2,
		first_name: "test2",
		last_name: "user2",
		display_name: "test2 user2",
		email: "test2user@gmail.com"
	}
]

describe('UserList component', () => {
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	let store = mockStore({});
	store.dispatch = jest.fn(() => ({}));
	const push = jest.fn();
	useHistory.mockReturnValue({ push });
	let wrapper;
	beforeEach(() => {
		wrapper = mount(
			<Provider store={store}>
				<Router>
					<UserList users={users} roleID={1} />
				</Router>
			</Provider>
		);
	});
	it('should match the snapshot', () => {
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Table').length).toBe(1);
	});
	it('should match the snapshot with no users', () => {
		wrapper = mount(
			<Provider store={store}>
				<Router>
					<UserList users={[]} roleID={1} />
				</Router>
			</Provider>
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Table').length).toBe(1);
	});
	it('should call deleteOrganisationRoleUserByID and getOrganisationRoleUsers', () => {
		act(() => {
			wrapper.find(Popconfirm).at(0).props().onConfirm();
			expect(deleteOrganisationRoleUserByID).toHaveBeenCalledWith(1, 1);
		})
	});
})
