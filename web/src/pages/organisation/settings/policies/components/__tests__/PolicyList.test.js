import React from "react";
import { deleteOrganisationPolicy, getOrganisationPolicy } from '../../../../../../actions/policy';
import thunk from "redux-thunk";
import { useDispatch } from 'react-redux';
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import { useHistory, useParams } from 'react-router-dom';
import '../../../../../../matchMedia.mock.js'
import { act } from "react-dom/test-utils";
import { Popconfirm } from "antd";
import PolicyList from "../PolicyList";


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

jest.mock('../../../../../../actions/policy', () => ({
	getOrganisationPolicy: jest.fn(),
	deleteOrganisationPolicy: jest.fn(() => Promise.resolve({})),
}));

let state = {
	organisations: {
		details: {
			1: {
				id: 1, name: "test organisation", policyIDs: [1, 2, 3],
			},
		},
		selected: 1,
		loading: false,
	},
	policy: {
		organisation: {
			1: {
				1: { id: 1, name: "test policy", },
				2: { id: 2, name: "test policy 2", },
				3: { id: 3, name: "test policy 3", },
			},
		},
		loading: false,
	},
}

describe('Policy list component', () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	store.dispatch = jest.fn(() => ({}));
	const push = jest.fn();
	useHistory.mockReturnValue({ push });

	let description = 'should render without error '
	describe('snapshots', () => {
		it(description + 'when loading is true', () => {
			store = mockStore({
				...state,
				policy: {
					...state.policy,
					loading: true,
				},
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<PolicyList orgID={1} role="owner" />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
		})
		it(description + 'without policies', () => {
			store = mockStore({
				...state,
				policy: {
					...state.policy,
					organisation: {
						1: {},
					},
				},
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<PolicyList orgID={1} role="owner" />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
		})
		it(description + 'with policies', () => {
			store = mockStore({
				...state,
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<PolicyList orgID={1} role="owner" />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
			const btn = component.find('button').at(1)
			expect(btn.text()).toBe('Edit')
			expect(btn.props().disabled).toBe(false)

			const btn2 = component.find('button').at(2)
			expect(btn2.text()).toBe('Delete')
			expect(btn2.props().disabled).toBe(false)
		})
		it(description + 'with policies when role is member', () => {
			store = mockStore({
				...state,
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<PolicyList orgID={1} role="member" />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
			const btn = component.find('button').at(1)
			expect(btn.text()).toBe('Edit')
			expect(btn.props().disabled).toBe(true)

			const btn2 = component.find('button').at(2)
			expect(btn2.text()).toBe('Delete')
			expect(btn2.props().disabled).toBe(true)
		})
	})

	describe('functionality', () => {
		it('should call deleteOrganisationPolicy with confirmation and delete', () => {
			store = mockStore({
				...state,
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<PolicyList orgID={1} role="owner" />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
			const btn = component.find('button').at(2)
			expect(btn.text()).toBe('Delete')
			expect(btn.props().disabled).toBe(false)
			const popOver = component.find(Popconfirm).at(0)

			act(() => {
				btn.simulate('click')
				popOver.props().onConfirm()
			})

			expect(deleteOrganisationPolicy).toHaveBeenCalledWith(1)
			expect(getOrganisationPolicy).toHaveBeenCalledWith()
		})
	})
})

