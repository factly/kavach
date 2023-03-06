import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { Tag } from 'antd';
import '../../../../../../../matchMedia.mock';
import ViewSpacePolicy from './ViewSpacePolicy';
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
			policyID: 1,
		};
	}),
}));


jest.mock('../../../../../../../actions/policy', () => ({
	getSpacePolicyByID: jest.fn(),
}));

let state = {
	policy: {
		space: {
			1: {
				1: {
					id: 1, name: 'Policy 1', description: 'Policy 1 Description', roles: [1, 2], permissions: [
						{actions: ['read'], subject: 'space', subjectID: 1},
						{actions: ['write'], subject: 'space', subjectID: 2},
					]
				}
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

describe('View Space Policy component', () => {
	// render skeleton when loading policy
	it('should render skeleton when loading policy', () => {
		state.policy.loading = true;
		store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ViewSpacePolicy />
				</Router>
			</Provider>,
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Skeleton')).toHaveLength(1);
	});
	// render policy details with roles and permissions
	it('should render policy details with roles and permissions', () => {
		state.policy.loading = false;
		store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ViewSpacePolicy />
				</Router>
			</Provider>,
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Skeleton')).toHaveLength(0);
		expect(wrapper.find(Tag)).toHaveLength(4);
		expect(wrapper.find('Table')).toHaveLength(1);
		expect(wrapper.find('Table').props().dataSource).toEqual([
			{actions: ['read'], subject: 'space', subjectID: 1},
			{actions: ['write'], subject: 'space', subjectID: 2},
		])
	});
	// render policy details without roles and permissions
	it('should render policy details without roles and permissions', () => {
		state.policy.loading = false;
		state.policy.space[1][1] = undefined;
		store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ViewSpacePolicy />
				</Router>
			</Provider>,
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Skeleton')).toHaveLength(0);
		expect(wrapper.find(Tag)).toHaveLength(0);
		expect(wrapper.find('Table')).toHaveLength(1);
		expect(wrapper.find('Table').props().dataSource).toEqual([]);
	});
});
