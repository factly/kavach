import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../matchMedia.mock';
import SpaceList from './SpaceList';
import { Popconfirm } from 'antd';

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
		};
	}),
}));

import { getSpaces, deleteSpace } from '../../../../../actions/space';
jest.mock('../../../../../actions/space', () => ({
	getSpaces: jest.fn(),
	deleteSpace: jest.fn(),
}));

// const spaceIDs = state.applications.details?.[appID]?.spaces || [];
//     return {
//       spaces: spaceIDs.map((id) => ({
//         ...state.spaces.details?.[id],
//       })),
//       loading: state.spaces.loading,
//     };

let state = {
	applications: {
		details: {
			1: {
				id: 1, name: 'Test App', description: 'Test App Description', spaces: [1, 2]
			},
		},
		loading: false,
	},
	spaces: {
		details: {
			1: {
				id: 1, name: 'Test Space', description: 'Test Space Description', applicationIDs: [1]
			},
			2: {
				id: 2, name: 'Test Space 2', description: 'Test Space Description 2', applicationIDs: [1]
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

describe('Spaces List component', () => {
	it('should render corrctly with spaces', () => {
		store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceList appID={1} role="owner" />
				</Router>
			</Provider>
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Table').length).toBe(1);
		expect(wrapper.find('Table').props().dataSource).toStrictEqual([
			{
				id: 1,
				name: 'Test Space',
				description: 'Test Space Description',
				applicationIDs: [1]
			},
			{
				id: 2,
				name: 'Test Space 2',
				description: 'Test Space Description 2',
				applicationIDs: [1]
			}
		]);
	});
	it('should render corrctly with no spaces', () => {
		store = mockStore({
			...state,
			applications: {
				...state.applications,
				details: {
					1: {},
				},
			}
		});
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceList appID={1} role="owner" />
				</Router>
			</Provider>
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Table').length).toBe(1);
		expect(wrapper.find('Table').props().dataSource).toStrictEqual([]);
	});
	it('should render corrctly with loading', () => {
		store = mockStore({
			...state,
			spaces: {
				...state.spaces,
				loading: true,
			}
		});
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceList appID={1} role="owner" />
				</Router>
			</Provider>
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Spin').at(0).props().spinning).toBe(true);
		expect(wrapper.find('Link').length).toBe(6);

	});
	it('should render corrctly when role is not owner', () => {
		store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceList appID={1} role="editor" />
				</Router>
			</Provider>
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Link').length).toBe(4);
		expect(wrapper.find('Button').at(0).props().disabled).toBe(true);
	});

	it('should delete space and call the action', (done) => {
		store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceList appID={1} role="owner" />
				</Router>
			</Provider>
		);
		act(() => {
			const deleteButton = wrapper.find('Button').at(2);
			expect(deleteButton.text()).toBe('Delete');
			deleteButton.simulate('click');
			wrapper.find(Popconfirm).at(0).props().onConfirm();
		});

		setTimeout(() => {
			expect(deleteSpace).toHaveBeenCalledWith(1,1);
			done();
		});
	});
});
