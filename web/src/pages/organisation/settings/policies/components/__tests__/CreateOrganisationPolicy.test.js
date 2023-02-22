import React from "react";
import CreateForm from "../CreateOrganisationPolicy";
import { Input, Form } from 'antd';
import thunk from "redux-thunk";
import { useDispatch } from 'react-redux';
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import { useHistory, useParams } from 'react-router-dom';
import '../../../../../../matchMedia.mock.js'
import { act } from "react-dom/test-utils";
import { getOrganisationRoles } from '../../../../../../actions/roles';
import { getOrganisation } from '../../../../../../actions/organisations';
import { createOrganisationPolicy } from '../../../../../../actions/policy';


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
	})),
}));

jest.mock('../../../../../../actions/roles', () => ({
	getOrganisationRoles: jest.fn(),
}));

jest.mock('../../../../../../actions/policy', () => ({
	createOrganisationPolicy: jest.fn(),
}));


jest.mock('../../../../../../actions/organisations', () => ({
	getOrganisation: jest.fn(),
}));
jest.mock('../../../../../../components/Policies', () => {
	return {
		__esModule: true,
		default: (props) => {
			return <div id="policies" onClick={props.onChange} />
		}
	}
})

let state = {
	organisations: {
		details: {
			1: {
				id: 1, name: "test", roleIDs: [1, 2, 3],
			},
		},
		selected: 1,
	},
	applications: {
		loading: false,
	},
	roles: {
		organisation: {
			1: {
				1: { id: 1, name: "test1" },
				2: { id: 2, name: "test2" },
				3: { id: 3, name: "test3" },
			},
		},
		loading: false,
	},
	profile: {
		roles: {
			1: "owner",
		},
		loading: false,
	},
}

describe("CreateOrganisationPolicy", () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	store.dispatch = jest.fn(() => ({}));
	const push = jest.fn();
	useHistory.mockReturnValue({ push });

	describe("snapshot tests", () => {
		const description = "should render component correctly ";
		beforeEach(() => {
			store = mockStore(Object.assign({}, state));
		});
		const loading_Tests = [
			{
				name: "loadingOrg",
				testStates: Object.assign({}, {
					...state,
					applications: {
						loading: true,
					}
				})
			},
			{
				name: "loadingRoles",
				testStates: Object.assign({}, {
					...state,
					roles: {
						...state.roles,
						loading: true,
					}
				})
			},
			{
				name: "loadingRole",
				testStates: Object.assign({}, {
					...state,
					profile: {
						...state.profile,
						loading: true,
					}
				})
			}
		]

		loading_Tests.forEach((test) => {
			it(`${description}when ${test.name} is true`, () => {
				store = mockStore(test.testStates);
				const wrapper = mount(
					<Provider store={store}>
						<Router>
							<CreateForm />
						</Router>
					</Provider>
				);
				expect(wrapper).toMatchSnapshot();
			});
		});
		it(description + "when role is not owner", () => {
			store = mockStore(Object.assign({}, {
				...state,
				profile: {
					roles: {
						1: "admin",
					},
					loading: false,
				},
			}));
			const wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateForm />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
		});
		it(description + "when not loading", () => {
			const wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateForm />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
		});
		it(description + "when orgaisation in url param is not available", () => {
			store = mockStore(Object.assign({}, {
				...state,
				organisations: {
					details: {
						2: {
							id: 2, name: "test", roleIDs: [1, 2, 3],
						},
					},
					selected: 2,
				},
			}));
			const wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateForm />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
		});
	});

	describe("functionality tests", () => {
		it("should fetch on render", () => {
			store = mockStore(Object.assign({}, state));
			const wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateForm />
					</Router>
				</Provider>
			);
			expect(getOrganisation).toHaveBeenCalledWith(1);
			expect(getOrganisationRoles).toHaveBeenCalledWith(1);
		});
		it("should handle submit", (done) => {
			store = mockStore(Object.assign({}, state));
			let wrapper = mount(
				<Provider store={store}>
					<Router>
						<CreateForm />
					</Router>
				</Provider>
			);

			act(() => {
				wrapper.find(Input).at(0).simulate('change', { target: { value: 'name' } });
				wrapper.find(Input).at(1).simulate('change', { target: { value: 'slug' } });
				wrapper.find('TextArea').at(0).simulate('change', { target: { value: 'description' } });
				wrapper.find('Select').at(0).props().onChange({ value: 1, label: 'test1' });
				const submitbtn = wrapper.find('button').at(1);
				expect(submitbtn.text()).toBe('Create Policy');
				wrapper.find(Form).simulate('submit');
			});

			setTimeout(() => {
				expect(createOrganisationPolicy).toHaveBeenCalledWith({
					name: 'name',
					slug: 'slug',
					description: 'description',
					roles: { value: 1, label: 'test1' }
				});

				expect(push).toHaveBeenCalledWith('/organisation/1/settings/policies');
				done()
			})
		});
	});
});

