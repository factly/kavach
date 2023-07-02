import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../matchMedia.mock';
import SpacePolicies from '.';

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
		};
	}),
}));
import { getSpaceByID } from '../../../../../../actions/space';
import PolicyList from './components/PolicyList';
import { getSpacePolicy } from '../../../../../../actions/policy';
import { getSpaceRoles } from '../../../../../../actions/roles';

jest.mock('../../../../../../actions/space', () => ({
	getSpaceByID: jest.fn(),
}));
jest.mock('../../../../../../actions/policy', () => ({
	getSpacePolicy: jest.fn(),
}));
jest.mock('../../../../../../actions/roles', () => ({
	getSpaceRoles: jest.fn(),
}));

jest.mock('./components/PolicyList', () => {
	return jest.fn((props) => <div id="policyList" {...props} />);
});

let state = {
	spaces: {
		details: {
			1: {
				id: 1, name: 'Test Space', description: 'Test Space Description',
			},
		},
		loading: false,
	},
	profile: {
		roles: {
			1: 'owner',
		},
		loading: false,
	},
	organisations: {
		selected: 1,
	},
};

let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });

describe('SpacePolicies Page', () => {
	it('should render skeleton when loading space', () => {
		state.spaces.loading = true;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpacePolicies />
				</Router>
			</Provider>,
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Skeleton').length).toBe(1);
	});

	it('should render skeleton when loading space roles', () => {
		state.spaces.loading = false;
		state.profile.loading = true;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpacePolicies />
				</Router>
			</Provider>,
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Skeleton').length).toBe(1);
	});

	it('should render Link to Create Policy when user is owner', () => {
		state.spaces.loading = false;
		state.profile.loading = false;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpacePolicies />
				</Router>
			</Provider>,
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Link').at(1).props().to).toBe('/applications/1/settings/spaces/1/settings/policies/create');
		expect(tree.find(PolicyList).props()).toEqual({
			spaceID: 1,
			appID: 1,
			role: 'owner',
		});
	});

	it('should not render Link to Create Policy when user is not owner', () => {
		state.profile.roles[1] = 'member';
		state.spaces.loading = false;
		state.profile.loading = false;
		store = mockStore(state);
		const tree = mount(
			<Provider store={store}>
				<Router>
					<SpacePolicies />
				</Router>
			</Provider>,
		);
		expect(tree).toMatchSnapshot();
		expect(tree.find('Link').length).toBe(1);
		expect(tree.find(PolicyList).length).toBe(1);
		expect(tree.find(PolicyList).props()).toEqual({
			spaceID: 1,
			appID: 1,
			role: 'member',
		});
	});
})
