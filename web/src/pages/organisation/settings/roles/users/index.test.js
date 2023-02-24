import React from "react";
import thunk from "redux-thunk";
import { useDispatch } from 'react-redux';
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import { useHistory, useParams } from 'react-router-dom';
import '../../../../../matchMedia.mock.js'
import { act } from "react-dom/test-utils";
import { Popconfirm } from "antd";
import {
	addOrganisationRoleUserByID,
	getOrganisationRoleUsers,
} from '../../../../../actions/roles';

import OrganisationRoleUsers from "./index";

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
		orgID: "org123",
		roleID: "role123",
	})),
}));

jest.mock('../../../../../actions/roles', () => ({
	addOrganisationRoleUserByID: jest.fn(() => Promise.resolve({})),
	getOrganisationRoleUsers: jest.fn(() => Promise.resolve({})),
}));

const state = {
	roles: {
		organisation: {
			'org123': {
				'role123': {
					users: ['user456', 'user789']
				}
			}
		},
		loading: false
	},
	organisations: {
		details: {
			'org123': {
				users: ['user123', 'user456', 'user789']
			}
		},
		selected: 'org123'
	},
	users: {
		details: {
			'user123': { name: 'John Doe' },
			'user456': { name: 'Jane Smith' },
			'user789': { name: 'Bob Johnson' }
		}
	},
	profile: {
		roles: {
			'org123': 'admin'
		},
		loading: false
	}
};

describe("UserList component", () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	store.dispatch = jest.fn(() => ({}));
	const push = jest.fn();
	useHistory.mockReturnValue({ push });

	let description = 'should render without error '
	describe("snapshots", () => {
		it(description + "loading is true", () => {
			store = mockStore({
				...state,
				profile: {
					...state.profile,
					loading: true
				}
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<OrganisationRoleUsers />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
			expect(component.find('Skeleton').length).toBe(1);
		});
		it(description + "loading is true", () => {
			store = mockStore({
				...state,
				roles: {
					...state.roles,
					loading: true
				}
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<OrganisationRoleUsers />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
			expect(component.find('Skeleton').length).toBe(1);
		});
		it(description + "roleUserIDs orgUserIDs is not defined", () => {
			store = mockStore({
				...state,
				roles: {
					...state.roles,
					organisation: {
						'org123': {
							'role123': {}
						}
					}
				},
				organisations: {
					...state.organisations,
					details: {
						'org123': {}
					}
				}
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<OrganisationRoleUsers />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
			expect(component.find('Skeleton').length).toBe(0);
			expect(component.find('form').length).toBe(0);
			expect(component.find('UserList').length).toBe(1);
		});
		it(description + "userRole is not owner", () => {
			store = mockStore({
				...state,
				profile: {
					...state.profile,
					roles: {
						'org123': 'admin'
					}
				}
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<OrganisationRoleUsers />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
			expect(component.find('Skeleton').length).toBe(0);
			expect(component.find('form').length).toBe(0);
			expect(component.find('UserList').length).toBe(1);
		});
		it(description + "userRole is owner", () => {
			store = mockStore({
				...state,
				profile: {
					...state.profile,
					roles: {
						'org123': 'owner'
					}
				}
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<OrganisationRoleUsers />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
			expect(component.find('Skeleton').length).toBe(0);
			expect(component.find('form').length).toBe(1);
		});
	});

	describe("functionality", () => {
		it("should call addOrganisationRoleUserByID and getOrganisationRoleUsers when form is submitted", (done) => {
			store = mockStore({
				...state,
				profile: {
					...state.profile,
					roles: {
						'org123': 'owner'
					}
				}
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<OrganisationRoleUsers />
					</Router>
				</Provider>
			);
			const form = component.find('form');
			act(() => {
				component.find('Select').at(0).props().onChange('user123');
				form.simulate('submit');
			});

			setTimeout(() => {
				expect(addOrganisationRoleUserByID).toHaveBeenCalledWith('role123', 'user123');
				expect(getOrganisationRoleUsers).toHaveBeenCalledWith('role123');
				done();
			});
		});
	});
});
