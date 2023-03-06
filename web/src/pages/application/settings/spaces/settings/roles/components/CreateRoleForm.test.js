import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../../matchMedia.mock';
import CreateSpaceRoleForm from './CreateRoleForm';
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
    };
  }),
}));

import { getSpaceByID } from '../../../../../../../actions/space';
import { createSpaceRole } from '../../../../../../../actions/roles';

jest.mock('../../../../../../../actions/space', () => ({
  getSpaceByID: jest.fn(),
}));

jest.mock('../../../../../../../actions/roles', () => ({
  createSpaceRole: jest.fn(),
}));

// space: state.spaces.details[spaceID] ? state.spaces.details[spaceID] : null,
// loadingSpace: state.spaces.loading,
// role: state.profile.roles[state.organisations.selected],
// loadingRole: state.profile.loading,
let state = {
  spaces: {
    details: {
      1: {
        id: 1,
        name: 'Test Space',
        description: 'Test Space Description',
      },
    },
    loading: false,
  },
  profile: {
    roles: {
      1: 'owner',
    },
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

describe('Create role form component', () => {
  describe('should match the snapshot', () => {
    it('when loadin space is true reder Skeleton', () => {
      store = mockStore({
        ...state,
        spaces: {
          ...state.spaces,
          loading: true,
        },
      });
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateSpaceRoleForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Skeleton').length).toBe(1);
    });
    it('when loading Role is true render Skeleron', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          loading: true,
        },
      });
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateSpaceRoleForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Skeleton').length).toBe(1);
    });
    it('when role is not owner render ErrorComponent', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: 'member',
          },
        },
      });
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateSpaceRoleForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('ErrorComponent').length).toBe(1);
    });
    it('when space not found', () => {
      store = mockStore({
        ...state,
        spaces: {
          ...state.spaces,
          details: {},
        },
      });
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateSpaceRoleForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
    });
    it('should render the form', () => {
      store = mockStore(state);
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateSpaceRoleForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('form').length).toBe(1);
    });
  });
  describe('functionality', () => {
    it('should call createSpaceRole on form submit', (done) => {
      store = mockStore(state);
      const wrapper = mount(
        <Provider store={store}>
          <Router>
            <CreateSpaceRoleForm />
          </Router>
        </Provider>,
      );
      act(() => {
        wrapper
          .find(Form.Item)
          .at(0)
          .find(Input)
          .simulate('change', { target: { value: 'Role Name' } });
        wrapper
          .find(Form.Item)
          .at(1)
          .find(Input)
          .simulate('change', { target: { value: 'role-slug' } });
        wrapper
          .find(Form.Item)
          .at(2)
          .find(Input.TextArea)
          .simulate('change', { target: { value: 'Role Description' } });
        wrapper.find('form').simulate('submit');
      });

      setTimeout(() => {
        expect(createSpaceRole).toHaveBeenCalledWith(1, 1, {
          name: 'Role Name',
          slug: 'role-slug',
          description: 'Role Description',
        });
        let appID = 1;
        let spaceID = 1;
        expect(push).toHaveBeenCalledWith(
          `/applications/${appID}/settings/spaces/${spaceID}/settings/roles/`,
        );
        done();
      });
    });
  });
});
