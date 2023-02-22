import React from "react";
import thunk from "redux-thunk";
import { useDispatch } from 'react-redux';
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import { useHistory, useParams } from 'react-router-dom';
import '../../../../../../matchMedia.mock.js'
import { act } from "react-dom/test-utils";
import { Input, Form } from 'antd';
import { getOrganisationPolicyByID, updateOrganisationPolicy } from '../../../../../../actions/policy';
import { getOrganisation } from '../../../../../../actions/organisations';
import EditOrganisationPolicy from "../EditOrganistionPolicy";


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

jest.mock('../../../../../../actions/organisations', () => ({
	getOrganisation: jest.fn(),
}));

jest.mock('../../../../../../actions/policy', () => ({
	getOrganisationPolicyByID: jest.fn(),
	updateOrganisationPolicy: jest.fn(() => Promise.resolve({})),
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
	policy: {
		organisation: {
			1: {
				1: {
					id: 1,
					name: "test policy",
					roles: [4, 5, 6],
				},
			}
		},
		loading: false,
	},
	roles: {
		organisation: {
			1: {
				1: { id: 1, name: "roles test1" },
				2: { id: 2, name: "roles test2" },
				3: { id: 3, name: "roles test3" },
				4: { id: 4, name: "roles test4" },
				5: { id: 5, name: "roles test5" },
				6: { id: 6, name: "roles test6" },
			},
		},
		loading: false,
	},
	profile: {
		roles: {
			1: "owner",
			2: "admin",
		},
		loading: false,
	},
};


let loading_Tests = [
	{
		name: "loading policy",
		state1: Object.assign({}, {
			...state,
			policy: {
				...state.policy,
				loading: true,
			}
		})
	},
	{
		name: "loading Role",
		state1: Object.assign({}, {
			...state,
			profile: {
				...state.profile,
				loading: true,
			}
		})
	},
	{
		name: "loading Organisation",
		state1: Object.assign({}, {
			...state,
			organisations: {
				...state.organisations,
				loading: true,
			}
		})
	},
]

jest.mock('../../../../../../components/Policies', () => {
	return {
		__esModule: true,
		default: (props) => {
			return <div id="policies" onClick={props.onChange} />
		}
	}
})

describe("Organisation Policies Edit component", () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	store.dispatch = jest.fn(() => ({}));
	const push = jest.fn();
	useHistory.mockReturnValue({ push });

	let description = 'should render without error '
	describe("snapshot testing", () => {
		loading_Tests.forEach((test) => {
			it(description + `with loading ${test.name} is true`, () => {
				store = mockStore(test.state1);
				const tree = mount(
					<Provider store={store}>
						<Router>
							<EditOrganisationPolicy />
						</Router>
					</Provider>
				);
				expect(tree).toMatchSnapshot();
			});
		})
		it(description + `without roleIds`, () => {
			store = mockStore(Object.assign({}, {
				...state,
				policy: {
					...state.policy,
					organisation: {
						1: {
							1: {
								id: 1,
								name: "test policy",
								roles: [],
							},
						}
					},
				},
			}));

			const tree = mount(
				<Provider store={store}>
					<Router>
						<EditOrganisationPolicy />
					</Router>
				</Provider>
			);
			expect(tree).toMatchSnapshot();
		});
		it(description + `when role is not owner`, () => {
			store = mockStore(Object.assign({}, {
				...state,
				organisations: {
					...state.organisations,
					selected: 2,
				},
			}));

			const tree = mount(
				<Provider store={store}>
					<Router>
						<EditOrganisationPolicy />
					</Router>
				</Provider>
			);
			expect(tree).toMatchSnapshot();
		});
		it(description + `when role is owner`, () => {
			store = mockStore(Object.assign({}, {
				...state,
				organisations: {
					...state.organisations,
					selected: 1,
				},
			}));

			const tree = mount(
				<Provider store={store}>
					<Router>
						<EditOrganisationPolicy />
					</Router>
				</Provider>
			);
			expect(tree).toMatchSnapshot();
		});
	});

	describe("function testing", () => {
		it("should call getOrganisation and getOrganisationPolicyByID on render", () => {
			store = mockStore(state);
			mount(
				<Provider store={store}>
					<Router>
						<EditOrganisationPolicy />
					</Router>
				</Provider>
			);
			expect(getOrganisation).toHaveBeenCalledWith(1);
			expect(getOrganisationPolicyByID).toHaveBeenCalledWith(1);
		});

		it("should call updateOrganisationPolicy on submit", (done) => {
			store = mockStore(Object.assign({}, state));

			const tree = mount(
				<Provider store={store}>
					<Router>
						<EditOrganisationPolicy />

					</Router>
				</Provider>
			);
			act(() => {
				tree.find(Input).at(0).simulate('change', { target: { value: 'name' } });
				tree.find(Input).at(1).simulate('change', { target: { value: 'slug' } });
				tree.find('TextArea').at(0).simulate('change', { target: { value: 'description' } });
				tree.find('Select').at(0).props().onChange({ value: 1, label: 'test1' });
				const submitbtn = tree.find('button').at(1);
				expect(submitbtn.text()).toBe('Update Policy');
				tree.find(Form).simulate('submit');
			})
			setTimeout(() => {
			expect(updateOrganisationPolicy).toHaveBeenCalledWith(1, {
				name: 'name',
				id: 1,
				slug: 'slug',
				description: 'description',
				roles: { value: 1, label: 'test1' }
			});

			expect(push).toHaveBeenCalledWith('/organisation/1/settings/policies');
			done();
			});
		});
	});


})
