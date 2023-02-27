import React from 'react';
import { BrowserRouter as Router, useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import { Select } from 'antd';
import '../../../matchMedia.mock';
import { addApplicationUser } from '../../../actions/applicationUsers';
import { getApplicationUsers } from '../../../actions/applicationUsers';

import User from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../../actions/applicationUsers', () => ({
  addApplicationUser: jest.fn(),
  getApplicationUsers: jest.fn(),
}));

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
      1: { id: 1, name: 'organisation', applications: [{ id: 1, name: 'Application1' }], users: [1, 2, 3, 4, 5] },
    },
    loading: false,
    selected: 1,
  },
  users: {
    ids: [1],
    details: {
      1: { id: 1, name: 'name', email: 'user@gmail.com', permission: { role: 'member' } },
      2: { id: 2, name: 'name', email: 'user2@gmail.com', permission: { role: 'member' } },
      3: { id: 3, name: 'name', email: 'user3@gmail.com ', permission: { role: 'member' } },
      4: { id: 4, name: 'name', email: 'user3@gmail.com ', permission: { role: 'member' } },
      5: { id: 5, name: 'name', email: 'user3@gmail.com ', permission: { role: 'member' } },
      6: { id: 6, name: 'name', email: 'user3@gmail.com ', permission: { role: 'member' } },
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
        users: [1, 2, 3],
      },
    },
    loading: false,
  },
  profile: {
    loading: false,
    roles: {
      1: "owner"
    }
  },
}

describe('Application User component', () => {
  let store;
  let mockedDispatch;
  store = mockStore(state);
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it("render when loading user is true", () => {
      store = mockStore({
        ...state,
        users: {
          ...state.users,
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <User />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find("Skeleton").length).toBe(1);
    });
    it("render when loading role is true", () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <User />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find("Skeleton").length).toBe(1);
    });
    it("render when role is not owner", () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: "member"
          }
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <User />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find("form").length).toBe(0);
      // UserList
      expect(tree.find("UserList").length).toBe(1);
    });
    it("render when role is owner", () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: "owner"
          }
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <User />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find("form").length).toBe(1);
      // UserList
      expect(tree.find("UserList").length).toBe(1);
    });

    it("render when loading application and org. has no users", () => {
      store = mockStore({
        ...state,
        organisations: {
          ...state.organisations,
          details: {
            1: { id: 1, name: 'organisation', applications: [{ id: 1, name: 'Application1' }]},
          },
        },
        applications: {
          ...state.applications,
          details: {
            1: {
              id: 1,
              created_at: '2020-09-09T06:49:36.566567Z',
              updated_at: '2020-09-09T06:49:36.566567Z',
              name: 'Application1',
              description: 'description',
              url: 'url1',
            },
          },
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <User />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should call addApplicationUser action', (done) => {
      store = mockStore(state);

      const tree = mount(
        <Provider store={store}>
          <Router>
            <User />
          </Router>
        </Provider>,
      );
      act(() => {
        console.log(tree.find(Select.Option).at(0).debug())
        tree.find('Select').at(0).props().onChange(4);
        tree.find('form').at(0).simulate('submit');
      });

      setTimeout(() => {
        expect(addApplicationUser).toHaveBeenCalledWith({
          application_id: 1,
          user_id: 4,
        });
        done()
      })
    });
  });
});
