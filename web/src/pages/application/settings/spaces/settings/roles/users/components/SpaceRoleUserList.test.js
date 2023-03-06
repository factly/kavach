import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../../../matchMedia.mock';
import SpaceRoleUserList from './SpaceRoleUserList';
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
			spaceID: 1,
		};
	}),
}));

import { deleteSpaceRoleUserByID, getSpaceRoleUsers } from '../../../../../../../../actions/roles';

jest.mock('../../../../../../../../actions/roles', () => ({
	deleteSpaceRoleUserByID: jest.fn(),
	getSpaceRoleUsers: jest.fn(),
}));

let props = {
	roleID: 1,
	appID: 1,
	spaceID: 1,
	users: [
		{
			id: 1,
			first_name: 'Test',
			last_name: 'User',
			display_name: 'Test User',
			email: 'user1@gmail.com',
		},
		{
			id: 2,
			first_name: 'Test',
			last_name: 'User 2',
			display_name: 'Test User 2',
			email: 'user2@gmail.com',
		},
	],
};

let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });

describe('Space User List component', () => {
	it('should render the component with users', () => {
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoleUserList {...props} />
				</Router>
			</Provider>,
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Table').props().dataSource).toEqual(props.users);
	});
	it('should render the component without users', () => {
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoleUserList {...props} users={[]} />
				</Router>
			</Provider>,
		);
		expect(wrapper).toMatchSnapshot();
		expect(wrapper.find('Table').props().dataSource).toEqual([]);
	});
	it('should handle delete user', (done) => {
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<SpaceRoleUserList {...props} />
				</Router>
			</Provider>,
		);
		act(() => {
			const deleteButton = wrapper.find('Button').at(0);
			wrapper.find(Popconfirm).at(0).props().onConfirm();
		});

		setTimeout(() => {
			expect(deleteSpaceRoleUserByID).toHaveBeenCalledWith(1, 1, 1, 1);
			expect(getSpaceRoleUsers).toHaveBeenCalledWith(1, 1, 1);
			done();
		});
	});
})
