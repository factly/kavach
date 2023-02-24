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

import { getOrganisation } from '../../../../../actions/organisations';
import { updateOrganisationRole, getOrganisationRoleByID } from '../../../../../actions/roles';
import EditRole from "./EditRole";



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
		roleID: 1,
	})),
}));

jest.mock('../../../../../actions/organisations', () => ({
	getOrganisation: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../../../../../actions/roles', () => ({
	updateOrganisationRole: jest.fn(() => Promise.resolve({})),
	getOrganisationRoleByID: jest.fn(() => Promise.resolve({})),
}));

let state = {
	organisations: {
		details: {
			1: {
				id: 1, name: "test organisation", roleIDs: [1, 2, 3],
			},
		},
		selected: 1,
		loading: false,
	},
	roles: {
		organisation: {
			1: {
				1: {
					name: 'test role', slug: "test-role", description: "test description", id: 1
				},
			},
		},
		loading: false,
	},
	profile: {
		loading: false,
		roles: {
			1: "owner"
		}
	},
};

let test = [
	{
		name: "loading role(org.) is true",
		initState: Object.assign({}, {
			...state,
			organisations: {
				...state.organisations,
				loading: true,
			},
		}),
		check: (wrapper) => {
			expect(wrapper.find('Skeleton').length).toBe(1);
		}
	},
	{
		name: "loading role(profile.) is true",
		initState: Object.assign({}, {
			...state,
			profile: {
				...state.profile,
				loading: true,
			},
		}),
		check: (wrapper) => {
			expect(wrapper.find('Skeleton').length).toBe(1);
		}
	},
	{
		name: "loading role(roles.) is true",
		initState: Object.assign({}, {
			...state,
			roles: {
				...state.roles,
				loading: true,
			},
		}),
		check: (wrapper) => {
			expect(wrapper.find('Skeleton').length).toBe(1);
		}
	},
	{
		name: "profile role is not owner",
		initState: Object.assign({}, {
			...state,
			profile: {
				...state.profile,
				roles: {
					1: "admin"
				}
			},
		}),
		check: (wrapper) => {
			expect(wrapper.find('ErrorComponent').length).toBe(1);
		}
	},
	{
		name: "selected organisation is not present",
		initState: Object.assign({}, {
			...state,
			organisations: {
				...state.organisations,
				selected: 2,
			},
		}),
		check: (wrapper) => {
			expect(wrapper.find('ErrorComponent').length).toBe(1);
		}
	},
	{
		name: "state has everything to render edit role page",
		initState: Object.assign({}, {
			...state,
		}),
		check: (wrapper) => {
			expect(wrapper.find('form').length).toBe(1);
		}
	},
];

describe("Edit Role component", () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	store.dispatch = jest.fn(() => ({}));
	const push = jest.fn();
	useHistory.mockReturnValue({ push });

	describe("snapshot testing", () => {
		test.forEach((t) => {
			it(t.name, () => {
				let store = mockStore(t.initState);
				let wrapper = mount(
					<Provider store={store}>
						<Router>
							<EditRole />
						</Router>
					</Provider>
				);
				expect(wrapper).toMatchSnapshot();
				t.check(wrapper);
			});
		});
	});

	describe("function testing", () => {
		it("should call updateOrganisationRole on form submit", (done) => {
			let store = mockStore(state);
			let component = mount(
				<Provider store={store}>
					<Router>
						<EditRole />
					</Router>
				</Provider>
			);
			act(() => {
				// input name (0)
				component.find('input').at(0).simulate('change', { target: { value: 'update role' } });
				// input slug (1)
				component.find('input').at(1).simulate('change', { target: { value: 'update-role' } });
				// TextArea description (0)
				component.find('textarea').at(0).simulate('change', { target: { value: 'update description' } });
				// button submit (0) text = "Create Role"
				expect(component.find('Button').at(1).text()).toBe("Update Role")
				// simulate submit form
				component.find('form').simulate('submit');
			})

			setTimeout(() => {
				expect(updateOrganisationRole).toHaveBeenCalledWith(1,{ name: 'update role', slug: 'update-role', description: 'update description' })
				expect(push).toHaveBeenCalledWith('/organisation/1/settings/roles')
				// exepct all fields to be empty
				expect(component.find('input').at(0).props().value).toBe('test role')
				expect(component.find('input').at(1).props().value).toBe('test-role')
				expect(component.find('textarea').at(0).props().value).toBe('test description')
				done();
			})
		});
	});
})
