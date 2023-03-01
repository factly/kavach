import React from 'react';
import thunk from 'redux-thunk';
import { useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { useHistory, useParams } from 'react-router-dom';
import '../../../../../matchMedia.mock.js';
import { act } from 'react-dom/test-utils';
import { createOrganisationRole } from '../../../../../actions/roles';
import { getOrganisation } from '../../../../../actions/organisations';

import CreateRoleForm from './CreateRoleForm';

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

jest.mock('../../../../../actions/organisations', () => ({
  getOrganisation: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../../../../../actions/roles', () => ({
  createOrganisationRole: jest.fn(() => Promise.resolve({})),
}));

let state = {
  organisations: {
    details: {
      1: {
        id: 1,
        name: 'test organisation',
        roleIDs: [1, 2, 3],
      },
    },
    selected: 1,
    loading: false,
  },
  profile: {
    loading: false,
    roles: {
      1: 'owner',
    },
  },
};

describe('Organisation Settings Roles Create Form component', () => {
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
    it(description + 'with loading org as true', () => {
      store = mockStore({
        ...state,
        organisations: {
          ...state.organisations,
          loading: true,
        },
      });
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateRoleForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Skeleton').length).toBe(1);
    });
    it(description + 'with loading profile', () => {
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
            <CreateRoleForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Skeleton').length).toBe(1);
    });
    it(description + 'with selected org as null', () => {
      store = mockStore({
        ...state,
        organisations: {
          ...state.organisations,
          selected: null,
        },
      });
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateRoleForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('ErrorComponent').length).toBe(1);
    });
    it(description + 'when role is not owner', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: 'admin',
          },
        },
      });
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateRoleForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('ErrorComponent').length).toBe(1);
    });
    it(description + 'when role is owner', () => {
      store = mockStore({
        ...state,
      });
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateRoleForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('form').length).toBe(1);
    });
  });

  describe('functionality', () => {
    it('should call createOrganisationRole on submit', (done) => {
      store = mockStore({
        ...state,
      });
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateRoleForm />
          </Router>
        </Provider>,
      );
      act(() => {
        // input name (0)
        component
          .find('input')
          .at(0)
          .simulate('change', { target: { value: 'test role' } });
        // input slug (1)
        component
          .find('input')
          .at(1)
          .simulate('change', { target: { value: 'test-role' } });
        // TextArea description (0)
        component
          .find('textarea')
          .at(0)
          .simulate('change', { target: { value: 'test description' } });
        // button submit (0) text = "Create Role"
        expect(component.find('Button').at(1).text()).toBe('Create Role');
        // simulate submit form
        component.find('form').simulate('submit');
      });

      setTimeout(() => {
        expect(createOrganisationRole).toHaveBeenCalledWith({
          name: 'test role',
          slug: 'test-role',
          description: 'test description',
        });

        expect(push).toHaveBeenCalledWith('/organisation/1/settings/roles');
        // exepct all fields to be empty
        expect(component.find('input').at(0).props().value).toBe('');
        expect(component.find('input').at(1).props().value).toBe('');
        expect(component.find('textarea').at(0).props().value).toBe('');
        done();
      });
    });
  });
});
