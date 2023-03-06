import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../../matchMedia.mock';
import EditRole from './EditRole';
import { Form, Input } from 'antd';
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
      spaceID: 1,
      roleID: 1,
    };
  }),
}));

import { updateSpaceRole, getSpaceRoleByID } from '../../../../../../../actions/roles';
import { getSpaceByID } from '../../../../../../../actions/space';

jest.mock('../../../../../../../actions/roles', () => ({
  updateSpaceRole: jest.fn(),
  getSpaceRoleByID: jest.fn(),
}));

jest.mock('../../../../../../../actions/space', () => ({
  getSpaceByID: jest.fn(),
}));
// role: state.roles.space[spaceID][roleID],
// loading: state.roles.loading,
// space: state.spaces.details[spaceID],
// loadingSpace: state.spaces.loading,
// userRole: state.profile.roles[state.organisations.selected],
// loadingUserRole: state.profile.loading,
let state = {
  roles: {
    space: {
      1: {
        1: {
          id: 1,
          name: 'Test Role',
          description: 'Test Role Description',
          space_id: 1,
        },
      },
    },
    loading: false,
  },
  spaces: {
    details: { 1: { id: 1, name: 'Test Space', description: 'Test Space Description' } },
    loading: false,
  },
  profile: {
    roles: { 1: 'owner' },
    loading: false,
  },
  organisations: {
    selected: 1,
  },
};

let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });

describe('Edit Role form', () => {
  describe('snapshots', () => {
    it('should match snapshot when loading roles and render Skeleton', () => {
      state.roles.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditRole />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });
    it('should match snapshot when loading space and render Skeleton', () => {
      state.roles.loading = false;
      state.spaces.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditRole />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });
    it('should match snapshot when loading user role and render Skeleton', () => {
      state.spaces.loading = false;
      state.profile.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditRole />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });

    it('should render Error component when use role is not owner', () => {
      state.profile.loading = false;
      state.profile.roles[1] = 'admin';
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditRole />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('ErrorComponent').length).toBe(1);
    });
    it('should render Edit form', () => {
      state.profile.roles[1] = 'owner';
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditRole />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('form').length).toBe(1);
    });
  });

  describe('functionality', () => {
    it('should call updateSpaceRole when form is submitted', (done) => {
      state.profile.roles[1] = 'owner';
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditRole />
          </Router>
        </Provider>,
      );
      act(() => {
        tree
          .find(Form.Item)
          .at(0)
          .find(Input)
          .simulate('change', { target: { value: 'Test Role' } });

        tree
          .find(Form.Item)
          .at(1)
          .find(Input)
          .simulate('change', { target: { value: 'test-slug' } });

        tree
          .find(Form.Item)
          .at(2)
          .find(Input.TextArea)
          .simulate('change', { target: { value: 'Test Role Description' } });

        tree.find('form').simulate('submit');
      });

      setTimeout(() => {
        expect(updateSpaceRole).toHaveBeenCalledWith(1, 1, 1, {
          name: 'Test Role',
          slug: 'test-slug',
          description: 'Test Role Description',
        });
        let spaceID = 1;
        let appID = 1;
        expect(push).toHaveBeenCalledWith(
          `/applications/${appID}/settings/spaces/${spaceID}/settings/roles`,
        );
        done();
      });
    });
  });
});
