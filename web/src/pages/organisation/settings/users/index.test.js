import React from "react";
import thunk from "redux-thunk";
import { useDispatch } from 'react-redux';
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import { useHistory, Link } from 'react-router-dom';
import '../../../../matchMedia.mock.js'
import { act } from "react-dom/test-utils";
import { getUsers, deleteUser } from '../../../../actions/users';
import { Popconfirm } from "antd";

import OrganisationSettings from "./index";

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

jest.mock('../../../../actions/users', () => ({
	getUsers: jest.fn(() => Promise.resolve({})),
	deleteUser: jest.fn(() => Promise.resolve({})),
}));

let state = {
	organisations: {
		selected: "org1",
		details: {
			org1: {
				users: ["user1", "user2"],
				roles: {
					user1: "owner",
					user2: "member"
				}
			},
			org2: {
				users: ["user3"],
				roles: {
					user3: "member"
				}
			}
		}
	},
	users: {
		details: {
			user1: {
				id: "user1",
				name: "John Doe",
				email: "john.doe@example.com"
			},
			user2: {
				id: "user2",
				name: "Jane Smith",
				email: "jane.smith@example.com"
			},
			user3: {
				id: "user3",
				name: "Bob Johnson",
				email: "bob.johnson@example.com"
			}
		},
		loading: false
	},
	profile: {
		roles: {
			org1: "owner",
			org2: "member"
		},
		loading: false
	}
}
const tests = [
	// when user is not owner
	{
		name: "should match snapshot when user is not owner",
		state_temp: {
			...state,
			profile: {
				...state.profile,
				roles: {
					...state.profile.roles,
					org1: "member"
				}
			}
		},
		check: (wrapper) => {
			expect(wrapper.find("Link").length).toBe(0);
		}
	},
	// when loading is true
	{
		name: "should match snapshot when loading",
		state_temp: {
			...state,
			users: {
				...state.users,
				loading: true
			}
		},
		check: (wrapper) => {
			expect(wrapper.find("Spin").at(0).props().spinning).toBe(true);
		}
	},
	// when loading roles is true
	{
		name: "should match snapshot when loading roles",
		state_temp: {
			...state,
			profile: {
				...state.profile,
				loading: true
			}
		},
		check: (wrapper) => {
			expect(wrapper.find("Spin").at(0).props().spinning).toBe(false);
			expect(wrapper.find(Popconfirm).at(0).props().disabled).toBe(true);
		}
	},
	// when users is empty
	{
		name: "should match snapshot when users is empty",
		state_temp: {
			...state,
			organisations: {
				...state.organisations,
				details: {
					...state.organisations.details,
					org1: {
						...state.organisations.details.org1,
						users: []
					}
				}
			}
		},
		check: (wrapper) => {
			expect(wrapper.find("Empty").length).toBe(1);
		}
	},
	// when users is not empty
	{
		name: "should match snapshot when users is not empty",
		state_temp: state,
		check: (wrapper) => {
			expect(wrapper.find(Link).length).toBe(2);
		}
	}
]



describe("Organisation Settings Users", () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	store.dispatch = jest.fn(() => ({}));
	const push = jest.fn();
	useHistory.mockReturnValue({ push });

	describe('snapshots', () => {
		tests.forEach((test) => {
			it(test.name, () => {
				// console.log(test.state_temp)
				store = mockStore(Object.assign({}, test.state_temp));
				const wrapper = mount(
					<Provider store={store}>
						<Router>
							<OrganisationSettings />
						</Router>
					</Provider>
				)
				expect(wrapper).toMatchSnapshot();
				test.check(wrapper)
			})
		})
	})


	describe("functionality", () => {
		it("should call getUsers on render", () => {
			store = mockStore(state);
			mount(
				<Provider store={store}>
					<Router>
						<OrganisationSettings />
					</Router>
				</Provider>
			)
			expect(getUsers).toHaveBeenCalled();
		})

		it("should call deleteUser on delete", () => {
			store = mockStore(state);
			const component = mount(
				<Provider store={store}>
					<Router>
						<OrganisationSettings />
					</Router>
				</Provider>
			)
			const deleteButton = component.find('Button').at(0);
			act(() => {
				deleteButton.simulate('click');
				const popOver = component.find(Popconfirm).at(0)
				popOver.props().onConfirm();
			})
			expect(deleteUser).toHaveBeenCalledWith("user1");
		})
	})
})

