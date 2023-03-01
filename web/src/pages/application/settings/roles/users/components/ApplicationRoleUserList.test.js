import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import UserList from './ApplicationRoleUserList';
import '../../../../../../matchMedia.mock';
import {Popconfirm} from 'antd';
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
      id: 1,
    };
  }),
}));
import {
  deleteApplicationRoleUserByID,
  getApplicationRoleUsers,
} from '../../../../../../actions/roles';

jest.mock('../../../../../../actions/roles', () => {
  return {
    getApplicationRoleUsers: jest.fn(),
    deleteApplicationRoleUserByID: jest.fn(),
  };
});

describe('Application Role Users List component', () => {
	let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  const push = jest.fn();
  useHistory.mockReturnValue({ push });
	let props = {
		roleID: 1,
		appID: 1,
		users: [
			{ id: 1, name: 'User 1', email: '@user1.com' },
			{ id: 2, name: 'User 2', email: '@user2.com' },
		],
	};
	it('should match snapshot with users', () => {
		const component = mount(
			<Provider store={store}>
				<Router>
					<UserList {...props} />
				</Router>
			</Provider>,
		);
		expect(component).toMatchSnapshot();
		expect(component.find('Table').length).toBe(1);
		expect(component.find('Table').props().dataSource).toEqual(props.users);
	});
	it('should match snapshot without users', () => {
		const component = mount(
			<Provider store={store}>
				<Router>
					<UserList {...props} users={[]} />
				</Router>
			</Provider>,
		);
		expect(component).toMatchSnapshot();
		expect(component.find('Table').length).toBe(1);
		expect(component.find('Table').props().dataSource).toEqual([]);
	});
	it('should call deleteApplicationRoleUserByID', (done) => {
		const component = mount(
			<Provider store={store}>
				<Router>
					<UserList {...props} />
				</Router>
			</Provider>,
		);
		const deleteButton = component.find('Button').at(1);
		deleteButton.simulate('click');
		component.find(Popconfirm).at(0).props().onConfirm();

		setTimeout(() => {
		expect(deleteApplicationRoleUserByID).toHaveBeenCalledWith(1, 1, 1);
		expect(getApplicationRoleUsers).toHaveBeenCalledWith(1, 1);
		done();
		});
	});
});
