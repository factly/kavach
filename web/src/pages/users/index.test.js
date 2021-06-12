import React from 'react';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from '@testing-library/react';
import { shallow, mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Popconfirm, Table } from 'antd';

import '../../matchMedia.mock';
import OrganisationUsers from './index';
import { getUsers, deleteUser, addUser } from '../../actions/users';

jest.mock('../../actions/users', () => ({
  getUsers: jest.fn(),
  addUser: jest.fn(),
  deleteUser: jest.fn(),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Users index component', () => {
  const memberStore = mockStore({
    organisations: {
      ids: [1],
      details: {
        1: { id: 1, title: 'title', description: 'description', permission: { role: 'member' } },
      },
      loading: false,
      selected: 1,
    },
    users: {
      ids: [1],
      details: { 1: { id: 1, name: 'name', email: 'email', permission: { role: 'member' } } },
      loading: false,
    },
  });
  const ownerStore = mockStore({
    organisations: {
      ids: [1],
      details: {
        1: { id: 1, title: 'title', description: 'description', permission: { role: 'owner' } },
      },
      loading: false,
      selected: 1,
    },
    users: {
      ids: [1, 2],
      details: {
        1: {
          id: 1,
          first_name: 'first_name',
          last_name: 'last_name',
          email: 'email',
          permission: { role: 'owner' },
        },
        2: {
          id: 2,
          first_name: 'name_first',
          last_name: 'name_last',
          email: 'email@gmail.com',
          permission: { role: 'member' },
        },
      },
      loading: false,
    },
  });
  beforeEach(() => {
    const mockedDispatch = jest.fn();
    mockedDispatch.mockReturnValue(Promise.resolve());
    useDispatch.mockReturnValue(mockedDispatch);
  });
  describe('snapshot testing', () => {
    it('should render the component for owner user', () => {
      let component;

      act(() => {
        component = mount(
          <Provider store={ownerStore}>
            <Router>
              <OrganisationUsers />
            </Router>
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
      expect(component.find('Button').at(0).text()).toBe('Add User');
    });
    it('should render the component for member user', () => {
      let component;

      act(() => {
        component = mount(
          <Provider store={memberStore}>
            <Router>
              <OrganisationUsers />
            </Router>
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
      expect(component.find('Button').at(0).text()).not.toBe('Add User');
    });
  });
  describe('component testing for owner', () => {
    let wrapper;
    beforeEach(() => {
      act(() => {
        wrapper = mount(
          <Provider store={ownerStore}>
            <Router>
              <OrganisationUsers />
            </Router>
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should delete user', (done) => {
      expect(getUsers).toHaveBeenCalled();
      const deleteButtom = wrapper.find('Button').at(1);
      deleteButtom.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');

      setTimeout(() => {
        expect(deleteUser).toHaveBeenCalledWith(1);
        expect(getUsers).toHaveBeenCalled();
        done();
      });
    });
  });
});
