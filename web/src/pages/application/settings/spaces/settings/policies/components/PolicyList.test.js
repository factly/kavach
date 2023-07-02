import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../../matchMedia.mock';
import PolicyList from './PolicyList';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
import { Popconfirm } from 'antd';

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
		};
	}),
}));

import { deleteSpacePolicy, getSpacePolicy } from '../../../../../../../actions/policy';
import { getSpaceRoles } from '../../../../../../../actions/roles';

jest.mock('../../../../../../../actions/policy', () => ({
	deleteSpacePolicy: jest.fn(),
	getSpacePolicy: jest.fn(),
}));

jest.mock('../../../../../../../actions/roles', () => ({
	getSpaceRoles: jest.fn(),
}));

let state = {
	spaces: {
		details: {
			1: {
				id: 1, name: 'Test Space', description: 'Test Space Description', policyIDs: [1, 2, 3],
			},
		},
		loading: false,
	},
	policy: {
		space: {
			1: {
				1: { id: 1, name: 'Policy 1', description: 'Policy 1 Description', roles: [1] },
				2: { id: 2, name: 'Policy 2', description: 'Policy 2 Description', roles: [2, 3] },
				3: { id: 3, name: 'Policy 3', description: 'Policy 3 Description' },
			},
		},
		loading: false,
	},
	roles: {
		space: {
			1: {
				1: { id: 1, name: 'Role 1', description: 'Role 1 Description' },
				2: { id: 2, name: 'Role 2', description: 'Role 2 Description' },
				3: { id: 3, name: 'Role 3', description: 'Role 3 Description' },
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

describe('Policy List component', () => {

	it("while loading policy is true", () => {
		state.policy.loading = true;
		store = mockStore(state);
		let component;
		act(() => {
			component = mount(
				<Provider store={store}>
					<Router>
						<PolicyList appID={1} spaceID={1} role="owner" />
					</Router>
				</Provider>
			);
		});
		expect(component.find('Spin').at(0).props().spinning).toBe(true);
	})
	it("while policies are not present", () => {
		state.policy.loading = false;
		let temp = state.spaces.details[1].policyIDs;
		state.spaces.details[1].policyIDs = undefined;
		store = mockStore(state);
		let component;
		act(() => {
			component = mount(
				<Provider store={store}>
					<Router>
						<PolicyList appID={1} spaceID={1} role="owner" />
					</Router>
				</Provider>
			);
		});
		expect(component.find('Spin').at(0).props().spinning).toBe(false);
		expect(component.find('Table').at(0).props().dataSource).toEqual([]);
		state.spaces.details[1].policyIDs = temp;
	})
	it("while policies are present", () => {
		store = mockStore(state);
		let component;
		act(() => {
			component = mount(
				<Provider store={store}>
					<Router>
						<PolicyList appID={1} spaceID={1} role="owner" />
					</Router>
				</Provider>
			);
		});
		expect(component.find('Spin').at(0).props().spinning).toBe(false);
		expect(component.find('Table').at(0).props().dataSource).toEqual([
			{
				id: 1,
				name: 'Policy 1',
				description: 'Policy 1 Description',
				roles: [
					{ id: 1, name: 'Role 1', description: 'Role 1 Description' }
				]
			},
			{
				id: 2,
				name: 'Policy 2',
				description: 'Policy 2 Description',
				roles: [
					{ id: 2, name: 'Role 2', description: 'Role 2 Description' },
					{ id: 3, name: 'Role 3', description: 'Role 3 Description' }
				]
			},
			{
				id: 3,
				name: 'Policy 3',
				description: 'Policy 3 Description',
				roles: []
			},
		]);
	})
	it("while role is not owner", () => {
		store = mockStore(state);
		let component;
		act(() => {
			component = mount(
				<Provider store={store}>
					<Router>
						<PolicyList appID={1} spaceID={1} role="user" />
					</Router>
				</Provider>
			);
		});
		expect(component.find('Button').at(1).props().disabled).toBe(true);
		expect(component.find('Button').at(2).props().disabled).toBe(true);
	})
	it("while role is owner delete button works and calls deleteSpacePolicy", (done) => {
		store = mockStore(state);
		let component;
		act(() => {
			component = mount(
				<Provider store={store}>
					<Router>
						<PolicyList appID={1} spaceID={1} role="owner" />
					</Router>
				</Provider>
			);
		});
		expect(component.find('Button').at(1).props().disabled).toBe(false);
		expect(component.find('Button').at(2).props().disabled).toBe(false);
		act(() => {
			component.find('Button').at(2).props().onClick();
			component.find(Popconfirm).at(0).props().onConfirm();
		});
		setTimeout(() => {
			expect(deleteSpacePolicy).toHaveBeenCalledWith(1, 1, 1);
			done();
		})
	})
});

