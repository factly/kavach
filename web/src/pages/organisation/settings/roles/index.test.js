import React from 'react';
import thunk from "redux-thunk";
import { useDispatch } from 'react-redux';
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import { useHistory, useParams } from 'react-router-dom';
import '../../../../matchMedia.mock.js'
import { getOrganisation } from '../../../../actions/organisations';
import OrganisationRoleList from './components/RoleList.js';
import OrganisationRoles from "./index";

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

jest.mock('../../../../actions/organisations', () => ({
	getOrganisation: jest.fn(() => Promise.resolve({})),
}));

jest.mock('./components/RoleList', () => {
	return {
		__esModule: true,
		default: () => <div>Mocked Role List</div>,
	}
});

let state = {
	organisations: {
		details: {
			1: {
				id: 1, name: "test organisation", tokens: [1, 2, 3],
			}
		},
		selected: 1,
		loading: false,
	},
	profile: {
		roles: {
			1: "owner",
		},
		loading: false,
	},
};

describe("Organisation Roles List component", () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	store.dispatch = jest.fn(() => ({}));
	const push = jest.fn();
	useHistory.mockReturnValue({ push });
	it("should render the component when loading org is true", () => {
		const state1 = Object.assign({}, state);
		state1.organisations.loading = true;
		const store = mockStore(state1);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<OrganisationRoles />
				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find("Skeleton").length).toBe(1);

	})
	it("should render the component when loading profile is true", () => {
		const state1 = Object.assign({}, state);
		state1.organisations.loading = false;
		state1.profile.loading = true;
		const store = mockStore(state1);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<OrganisationRoles />
				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find("Skeleton").length).toBe(1);
	})

	// when role is not owner
	it("should render the component when role is not owner", () => {
		const state1 = {
			organisations: {
				details: {
					1: {
						id: 1, name: "test organisation", tokens: [1, 2, 3],
					}
				},
				selected: 1,
				loading: false,
			},
			profile: {
				roles: {
					1: "member",
				},
				loading: false,
			},
		}
		const store = mockStore(state1);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<OrganisationRoles />
				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find("Button").length).toBe(1);
		//RoleList should be rendered
	})

	// when role is owner
	it("should render the component when role is owner", () => {
		const store = mockStore({
			organisations: {
				details: {
					1: {
						id: 1, name: "test organisation", tokens: [1, 2, 3],
					}
				},
				selected: 1,
				loading: false,
			},
			profile: {
				roles: {
					1: "owner",
				},
				loading: false,
			},
		});
		const tree = mount(
			<Provider store={store}>
				<Router>
					<OrganisationRoles />
				</Router>
			</Provider>
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find("button").at(1).text()).toBe(" Create New Role ");
		// RoleList should be rendered
		expect(tree.find("Skeleton").length).toBe(0);
	})
})
