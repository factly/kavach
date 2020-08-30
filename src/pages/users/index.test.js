import React from 'react';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { act } from '@testing-library/react';
import { shallow, mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Popconfirm } from 'antd';

import '../../matchMedia.mock';
import OrganizationUsers from './index';
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
    organizations: {
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
    organizations: {
      ids: [1],
      details: {
        1: { id: 1, title: 'title', description: 'description', permission: { role: 'owner' } },
      },
      loading: false,
      selected: 1,
    },
    users: {
      ids: [1],
      details: {
        1: {
          id: 1,
          first_name: 'first_name',
          last_name: 'last_name',
          email: 'email',
          permission: { role: 'owner' },
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
        component = shallow(
          <Provider store={ownerStore}>
            <OrganizationUsers />
          </Provider>,
        );
      });
      component.dive();
      expect(component).toMatchSnapshot();
    });
    it('should render the component for member user', () => {
      let component;

      act(() => {
        component = shallow(
          <Provider store={memberStore}>
            <OrganizationUsers />
          </Provider>,
        );
      });
      component.dive();
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing for owner', () => {
    let wrapper;
    beforeEach(async () => {
      await act(async () => {
        wrapper = mount(
          <Provider store={ownerStore}>
            <OrganizationUsers />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should add user', async (done) => {
      expect(getUsers).toHaveBeenCalled();
      await act(async () => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'email@email.com' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 'member' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });
      await act(async () => {
        wrapper.update();
      });

      setTimeout(() => {
        expect(addUser).toHaveBeenCalledWith({
          email: 'email@email.com',
          role: 'member',
        });
        expect(getUsers).toHaveBeenCalled();
        done();
      });
    });
    it('should delete user', async (done) => {
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
