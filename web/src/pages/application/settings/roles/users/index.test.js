import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import ApplicationRoleUsers from './index';
import '../../../../../matchMedia.mock';

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
      roleID: 1,
    };
  }),
}));
import { getApplicationUsers } from '../../../../../actions/applicationUsers';
import { addApplicationRoleUserByID, getApplicationRoleUsers } from '../../../../../actions/roles';

jest.mock('../../../../../actions/applicationUsers', () => {
  return {
    getApplicationUsers: jest.fn(),
  };
});

jest.mock('../../../../../actions/roles', () => {
  return {
    getApplicationRoleUsers: jest.fn(),
    addApplicationRoleUserByID: jest.fn(),
  };
});

const state = {
  roles: {
    loading: false,
    application: {
      1: {
        1: {
          users: [1, 2] // replace with the desired user IDs for testing
        }
      }
    }
  },
  applications: {
    details: {
      1: {
        users: [1, 2, 3, 4] // replace with the desired user IDs for testing
      }
    }
  },
  users: {
    details: {
      1: { id: 1, name: 'User 1' },
      2: { id: 2, name: 'User 2' },
      3: { id: 3, name: 'User 3' },
      4: { id: 4, name: 'User 4' }
    }
  },
  profile: {
    roles: {
      1: 'owner' // replace with the desired role for testing
    },
    loading: false
  },
  organisations: {
    selected: 1,
  }
};

describe('Application Role Users component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  const push = jest.fn();
  useHistory.mockReturnValue({ push });

  describe('snapshots', () => {
    it('should match snapshot when loading roles is true', () => {
      store = mockStore({
        ...state,
        roles: {
          ...state.roles,
          loading: true,
        },
      });
      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Router>
              <ApplicationRoleUsers />
            </Router>
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
      expect(component.find('Skeleton').length).toBe(0);
    });
    it('should match snapshot when loading profile is true', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          loading: true,
        },
      });
      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Router>
              <ApplicationRoleUsers />
            </Router>
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
      expect(component.find('Skeleton').length).toBe(0);
    });
    it('should match snapshot when loading profile and roles is true', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          loading: true,
        },
        roles: {
          ...state.roles,
          loading: true,
        },
      });
      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Router>
              <ApplicationRoleUsers />
            </Router>
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
      expect(component.find('Skeleton').length).toBe(1);
    });
    it('should match snapshot when user role is not owner', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: 'admin',
          },
        },
      });
      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Router>
              <ApplicationRoleUsers />
            </Router>
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
      expect(component.find('form').length).toBe(0);
      // UserList
      expect(component.find('UserList').props().users).toEqual([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ]);
    });
    it('should match snapshot when user role is owner', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: 'owner',
          },
        },
      });
      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Router>
              <ApplicationRoleUsers />
            </Router>
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
      expect(component.find('form').length).toBe(1);
      // UserList
      expect(component.find('UserList').props().users).toEqual([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ]);
    });

    it('should match snapshot when roleUserIDs and applicationUserIDs are empty', () => {
      store = mockStore({
        ...state,
        roles: {
          ...state.roles,
          application: {
            1: {
              1: {
                users: undefined,
              },
            },
          },
        },
        applications: {
          details: {
            1: {
              users: undefined,
            },
          },
        },
      });
      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Router>
              <ApplicationRoleUsers />
            </Router>
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
      expect(component.find('form').length).toBe(1);
      // UserList
      expect(component.find('UserList').props().users).toEqual([]);
    });
  });
  describe(' functionality', () => {
    it('should call addApplicationRoleUserByID with correct params', (done) => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: 'owner',
          },
        },
      });
      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Router>
              <ApplicationRoleUsers />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        component.find('Select').props().onChange({ target: { value: 3 } });

        component.find('form').simulate('submit');
      });

      setTimeout(() => {
        expect(addApplicationRoleUserByID).toHaveBeenCalledWith(1, 1, 3);
        expect(getApplicationRoleUsers).toHaveBeenCalledWith(1, 1);
        done();
      })
    });

  });
});
