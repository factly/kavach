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
    it('should render the component with all props', () => {
      store = mockStore(state);
      const props = {
        id: 1,
        flag: true,
        users: [
          {
            id: 1,
            email: 'user1@gmail.com',
            first_name: 'user1',
            last_name: 'factly',
            diaplay_name: 'user1-factly',
          },
          {
            id: 2,
            email: 'user2@gmailcom',
            first_name: 'user1',
            last_name: 'factly',
            diaplay_name: 'user1-factly',
          },
        ],
        total: 2,
        role: 'owner',
      };
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationUserList {...props} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();

      const button = tree.find(Button).at(0);
      expect(button.props().disabled).toBe(false);
    });
    it('should render the component with no users', () => {
      store = mockStore(state);
      const props = {
        id: 1,
        flag: true,
        users: [],
        total: 0,
        role: 'owner',
      };
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationUserList {...props} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();

      expect(tree.find('Empty').length).toBe(1);
    });
    it('should render the component with role as member', () => {
      store = mockStore(state);
      const props = {
        id: 1,
        flag: true,
        users: [
          {
            id: 1,
            email: 'user1@gmail.com',
            first_name: 'user1',
            last_name: 'factly',
            diaplay_name: 'user1-factly',
          },
          {
            id: 2,
            email: 'user2@gmailcom',
            first_name: 'user1',
            last_name: 'factly',
            diaplay_name: 'user1-factly',
          },
        ],
        total: 2,
        role: 'member',
      };
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationUserList {...props} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();

      const button = tree.find(Button).at(0);
      expect(button.props().disabled).toBe(true);
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should delete applicationUser', (done) => {
      store = mockStore(state);
      let wrapper;
      const props = {
        id: 1,
        flag: true,
        users: [
          {
            id: 1,
            email: 'user1@gmail.com',
            first_name: 'user1',
            last_name: 'factly',
            diaplay_name: 'user1-factly',
          },
          {
            id: 2,
            email: 'user2@gmailcom',
            first_name: 'user1',
            last_name: 'factly',
            diaplay_name: 'user1-factly',
          },
        ],
        total: 2,
        role: 'owner',
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ApplicationUserList {...props} />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(0);
      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');
      setTimeout(() => {
        expect(deleteApplication).toHaveBeenCalled();
        expect(deleteApplication).toHaveBeenCalledWith(1, 1);
        expect(getApplicationUsers).toHaveBeenCalledWith(1);
        done();
      });
    });
  });
});
