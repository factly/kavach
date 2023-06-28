import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import ApplicationRoleList from './RoleList';
import '../../../../../matchMedia.mock';
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
      policyID: 1,
    };
  }),
}));

import { deleteApplicationRole, getApplicationRoles } from '../../../../../actions/roles';
jest.mock('../../../../../actions/roles', () => {
  return {
    getApplicationRoles: jest.fn(),
    deleteApplicationRole: jest.fn(),
  };
});

let state = {
  applications: {
    details: {
      1: {
        id: 1,
        name: 'Test Application 1',
        description: 'Test Application 1 Description',
        roleIDs: [1, 2],
      },
    },
  },
  roles: {
    application: {
      1: {
        1: { id: 1, name: 'Test Role 1', description: 'Test Role 1 Description' },
        2: { id: 2, name: 'Test Role 2', description: 'Test Role 2 Description' },
      },
    },
    loading: false,
  },
};

describe('Role List Form component', () => {
  // snapshot test
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  const push = jest.fn();
  useHistory.mockReturnValue({ push });
  describe('snapshots', () => {
    it('should match snapshot when loading', () => {
      state.roles.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationRoleList appID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Spin').at(0).props().spinning).toBe(true);
    });
    it('should match snapshot when no roles', () => {
      state.roles.loading = false;
      let temp = state.applications.details[1].roleIDs;
      state.applications.details[1].roleIDs = undefined;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationRoleList appID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Spin').at(0).props().spinning).toBe(false);
      expect(tree.find('Empty').length).toBe(1);
      expect(tree.find('Table').props().dataSource).toEqual([]);
      state.applications.details[1].roleIDs = temp;
    });
    it('should match snapshot when roles is not empty', () => {
      state.roles.loading = false;
      state.roles.application = {
        1: {
          1: { id: 1, name: 'Test Role 1', description: 'Test Role 1 Description' },
          2: { id: 2, name: 'Test Role 2', description: 'Test Role 2 Description' },
        },
      };
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationRoleList appID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Spin').at(0).props().spinning).toBe(false);
      expect(tree.find('Empty').length).toBe(0);
      expect(tree.find('Table').props().dataSource).toEqual([
        { id: 1, name: 'Test Role 1', description: 'Test Role 1 Description' },
        { id: 2, name: 'Test Role 2', description: 'Test Role 2 Description' },
      ]);
      expect(tree.find('Link').length).toBe(4);
    });
    it('should match snapshot when prop role is not owner', () => {
      state.roles.loading = false;
      state.roles.application = {
        1: {
          1: { id: 1, name: 'Test Role 1', description: 'Test Role 1 Description' },
          2: { id: 2, name: 'Test Role 2', description: 'Test Role 2 Description' },
        },
      };
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationRoleList appID={1} role="admin" />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Spin').at(0).props().spinning).toBe(false);
      expect(tree.find('Empty').length).toBe(0);
      expect(tree.find('Table').props().dataSource).toEqual([
        { id: 1, name: 'Test Role 1', description: 'Test Role 1 Description' },
        { id: 2, name: 'Test Role 2', description: 'Test Role 2 Description' },
      ]);
      expect(tree.find('Link').length).toBe(2);
    });
  });
  // test form submission
  describe('functionality', () => {
    it('should call deleteApplicationRole when delete button is clicked', () => {
      state.roles.loading = false;
      state.roles.application = {
        1: {
          1: { id: 1, name: 'Test Role 1', description: 'Test Role 1 Description' },
          2: { id: 2, name: 'Test Role 2', description: 'Test Role 2 Description' },
        },
      };
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationRoleList appID={1} role="owner" />
          </Router>
        </Provider>,
      );
      tree.find('Button').at(1).simulate('click');
      tree.find(Popconfirm).at(0).props().onConfirm();
      expect(deleteApplicationRole).toHaveBeenCalledWith(1, 1);
    });
  });
});
