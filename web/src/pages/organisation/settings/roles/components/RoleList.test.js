import React from 'react';
import thunk from 'redux-thunk';
import { useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { useHistory, useParams } from 'react-router-dom';
import '../../../../../matchMedia.mock.js';
import { Popconfirm } from 'antd';

import { deleteOrganisationRole, getOrganisationRoles } from '../../../../../actions/roles';
import RoleList from './RoleList';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn(() => ({
    orgID: 1,
    policyID: 1,
  })),
}));

jest.mock('../../../../../actions/roles', () => ({
  deleteOrganisationRole: jest.fn(() => Promise.resolve({})),
  getOrganisationRoles: jest.fn(() => Promise.resolve({})),
}));

let state = {
  organisations: {
    details: {
      1: { id: 1, name: 'test organisation', roleIDs: [1, 2, 3] },
    },
    selected: 1,
    loading: false,
  },
  roles: {
    organisation: {
      1: {
        1: { id: 1, name: 'test role 1' },
        2: { id: 2, name: 'test role 2' },
        3: { id: 3, name: 'test role 3' },
      },
    },
    loading: false,
  },
};

describe('RoleList component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  store.dispatch = jest.fn(() => ({}));
  const push = jest.fn();
  useHistory.mockReturnValue({ push });

  let description = 'should render without error ';
  describe('snapshots', () => {
    it(description + 'when loading', () => {
      store = mockStore({
        ...state,
        roles: {
          ...state.roles,
          loading: true,
        },
      });

      const component = mount(
        <Provider store={store}>
          <Router>
            <RoleList orgID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Spin').length).toBe(2);
      expect(component.find('Spin').at(0).props().spinning).toBe(true);
    });
    it(description + 'with no roles', () => {
      store = mockStore({
        ...state,
        organisations: {
          details: {
            1: { id: 1, name: 'test organisation' },
          },
        },
      });

      const component = mount(
        <Provider store={store}>
          <Router>
            <RoleList orgID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Spin').at(0).props().spinning).toBe(false);
      expect(component.find('Empty').length).toBe(1);
    });
    it(description + 'with tokens and role is not owner', () => {
      store = mockStore(state);

      const component = mount(
        <Provider store={store}>
          <Router>
            <RoleList orgID={1} role="member" />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Spin').at(0).props().spinning).toBe(false);
      expect(component.find('Table').length).toBe(1);
      const actions = component.find('Button');
      expect(actions.length).toBe(0);
    });
    it(description + 'with roles role is owner', () => {
      store = mockStore(state);

      const component = mount(
        <Provider store={store}>
          <Router>
            <RoleList orgID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Spin').at(0).props().spinning).toBe(false);
      expect(component.find('Table').length).toBe(1);
      const actions = component.find('Button');
      expect(actions.length).toBe(6);
      expect(actions.at(0).text()).toBe('View Users');
      expect(actions.at(1).text()).toBe('Delete');
    });
  });
  describe('functionality', () => {
    it('should delete role', () => {
      store = mockStore(state);

      const component = mount(
        <Provider store={store}>
          <Router>
            <RoleList orgID={1} role="owner" />
          </Router>
        </Provider>,
      );
      const actions = component.find('Button');
      expect(actions.length).toBe(6);
      expect(actions.at(1).text()).toBe('Delete');
      actions.at(1).simulate('click');
      const popconfirm = component.find(Popconfirm);
      expect(popconfirm.length).toBe(3);
      popconfirm.at(0).props().onConfirm();
      expect(deleteOrganisationRole).toHaveBeenCalledWith(1);
      expect(getOrganisationRoles).toHaveBeenCalledWith(1);
    });
  });
});
