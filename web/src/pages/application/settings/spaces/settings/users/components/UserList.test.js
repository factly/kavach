import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../../matchMedia.mock';
import { Popconfirm } from 'antd';
import UserList from './userList';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

import { deleteSpaceUser } from '../../../../../../../actions/spaceUser';
import { getSpaces } from '../../../../../../../actions/space';

jest.mock('../../../../../../../actions/spaceUser', () => ({
  deleteSpaceUser: jest.fn(),
}));

jest.mock('../../../../../../../actions/space', () => ({
  getSpaces: jest.fn(),
}));

let state = {
  spaces: {
    details: {
      1: {
        id: 1,
        name: 'Test Space',
        description: 'Test Space Description',
        users: [1, 2],
      },
    },
    loading: false,
  },
  users: {
    details: {
      1: {
        id: 1,
        first_name: 'Test',
        last_name: 'User1',
        email: 'user@1.com',
      },
      2: {
        id: 2,
        first_name: 'Test',
        last_name: 'User2',
        email: 'user@2.com',
      },
    },
  },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn(),
}));
let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });
useParams.mockReturnValue({ appID: 1, spaceID: 1 });

describe('User List component', () => {
  it('should render the component when space is loading', () => {
    state.spaces.loading = true;
    store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserList spaceID={1} role="owner" />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Spin').at(0).props().spinning).toBe(true);
  });
  it('should render when space user is empty', () => {
    state.spaces.loading = false;
    let temp = state.spaces.details[1].users;
    state.spaces.details[1].users = [];
    store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserList spaceID={1} role="owner" />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Spin').at(0).props().spinning).toBe(false);
    expect(wrapper.find('Empty').length).toBe(1);
    state.spaces.details[1].users = temp;
  });
  it('should render when space user is not empty', () => {
    state.spaces.loading = false;
    store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserList spaceID={1} role="owner" />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Spin').at(0).props().spinning).toBe(false);
    expect(wrapper.find('Button').at(0).props().disabled).toBe(false);
    expect(wrapper.find('Table').at(0).props().dataSource).toEqual([
      {
        id: 1,
        first_name: 'Test',
        last_name: 'User1',
        email: 'user@1.com',
      },
      {
        id: 2,
        first_name: 'Test',
        last_name: 'User2',
        email: 'user@2.com',
      },
    ]);
  });
  it('should reder when role is not owner', () => {
    state.spaces.loading = false;
    store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserList spaceID={1} role="user" />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Button').at(0).props().disabled).toBe(true);
  });

  it('should call deleteSpaceUser action when delete button is clicked', () => {
    state.spaces.loading = false;
    store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserList spaceID={1} role="owner" />
        </Router>
      </Provider>,
    );
    act(() => {
      expect(wrapper.find('Button').at(0).props().disabled).toBe(false);
      expect(wrapper.find('Button').at(0).text()).toBe('Delete');
      wrapper.find(Popconfirm).at(0).props().onConfirm();
    });
    expect(deleteSpaceUser).toHaveBeenCalledWith(1, 1, 1);
  });
});
