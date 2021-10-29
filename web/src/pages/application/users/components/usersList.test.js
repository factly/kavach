import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table } from 'antd';

import '../../../../matchMedia.mock';
import ApplicationUserList from './usersList';
import { deleteApplication, getApplicationUsers } from '../../../../actions/applicationUsers';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../../actions/applicationUsers', () => ({
  getApplicationUsers: jest.fn(),
  deleteApplication: jest.fn(),
}));
let mockedDispatch, store;
let state = {
  applicationUsers: {
    details: {
      1: [{ id: 1, email: 'user@gmail.com' }],
    },
    loading: false,
  },
  organisations: {
    ids: [1],
    details: {
      1: { id: 1, name: 'organisation', applications: [{ id: 1, name: 'Application1' }] },
    },
    loading: false,
    selected: 1,
  },
  users: {
    ids: [1],
    details: {
      1: { id: 1, name: 'name', email: 'user@gmail.com', permission: { role: 'member' } },
    },
    organisations: {
      1: [1],
    },
    loading: false,
  },
  applications: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
          limit: 5,
        },
        total: 2,
      },
    ],
    details: {
      1: {
        id: 1,
        created_at: '2020-09-09T06:49:36.566567Z',
        updated_at: '2020-09-09T06:49:36.566567Z',
        name: 'Application1',
        description: 'description',
        url: 'url1',
        users: [{ id: 1, email: 'user@gmail.com' }],
      },
    },
    loading: false,
  },
};
describe('Application User List component', () => {
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationUserList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.applicationUsers.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationUserList id={1} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should delete applicationUser', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ApplicationUserList id={1} />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(0);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      expect(deleteApplication).toHaveBeenCalled();
      expect(deleteApplication).toHaveBeenCalledWith(1, 1);
      expect(getApplicationUsers).toHaveBeenCalledWith(1);
    });
  });
});
