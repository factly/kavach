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
import { addOrganisationToken } from '../../../../../actions/token';
import { getOrganisation } from '../../../../../actions/organisations';

import CreateForm from './CreateTokenForm';

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

jest.mock('../../../../../actions/token', () => ({
  addOrganisationToken: jest.fn(() => Promise.resolve({})),
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

describe('Organisation Token Create Form component', () => {
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
            <CreateForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Skeleton').length).toBe(1);
    });

    it(description + 'with loading profile as true', () => {
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
            <CreateForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Skeleton').length).toBe(1);
    });
    it(description + 'when org. in url params does not exist', () => {
      store = mockStore({
        ...state,
        organisations: {
          ...state.organisations,
          details: {},
        },
      });
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
    });
    it(description + 'with role not as owner', () => {
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
            <CreateForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('ErrorComponent').length).toBe(1);
    });
    it(description + 'with role as owner', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: 'owner',
          },
        },
      });
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateForm />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('form').length).toBe(1);
    });
  });

  describe('functionality', () => {
    it('should call addOrganisationToken on submit', (done) => {
      const setState = jest.fn();
      const useStateSpy = jest.spyOn(React, 'useState');

      useStateSpy.mockImplementation((init) => [init, setState]);
      store = mockStore(state);
      const component = mount(
        <Provider store={store}>
          <Router>
            <CreateForm />
          </Router>
        </Provider>,
      );

      act(() => {
        component
          .find('input')
          .at(0)
          .simulate('change', { target: { value: 'test token' } });
        component
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'test token' } });
        component.find('form').simulate('submit');
      });
      setTimeout(() => {
        expect(addOrganisationToken).toHaveBeenCalledWith(
          { name: 'test token', description: 'test token' },
          setState,
          setState,
        );

        component.find('Modal').at(0).props().onOk();
        expect(push).toHaveBeenCalledWith('/organisation/1/settings/tokens');
        done();
      });
    });
  });
});
