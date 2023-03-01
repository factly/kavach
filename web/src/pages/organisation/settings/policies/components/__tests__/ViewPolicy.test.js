import React from 'react';
import { getOrganisationPolicyByID } from '../../../../../../actions/policy';
import thunk from 'redux-thunk';
import { useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { useHistory, useParams } from 'react-router-dom';
import '../../../../../../matchMedia.mock.js';
import { act } from 'react-dom/test-utils';

import ViewOrganisationPolicy from '../ViewOrganisationPolicy';

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

jest.mock('../../../../../../actions/policy', () => ({
  getOrganisationPolicyByID: jest.fn(),
}));

let state = {
  policy: {
    organisation: {
      1: {
        1: {
          id: 1,
          name: 'test policy',
          roles: [1, 2],
        },
      },
    },
    loading: false,
  },
  roles: {
    organisation: {
      1: {
        1: {
          id: 1,
          name: 'test role',
        },
        2: {
          id: 2,
          name: 'test role 2',
        },
      },
    },
    loading: false,
  },
};

describe('View Policy component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  store.dispatch = jest.fn(() => ({}));
  const push = jest.fn();
  useHistory.mockReturnValue({ push });

  describe('snapshot testing', () => {
    it('should match the snapshot when loading', () => {
      store = mockStore({
        ...state,
        policy: {
          ...state.policy,
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ViewOrganisationPolicy />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match the snapshot when loaded', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ViewOrganisationPolicy />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match the snapshot when loaded when POLICY not avaialble', () => {
      store = mockStore({
        ...state,
        policy: {
          ...state.policy,
          organisation: {
            1: {
              2: {
                id: 2,
                name: 'test policy',
              },
            },
          },
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ViewOrganisationPolicy />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match the snapshot when loaded when POLICY has permissions', () => {
      store = mockStore({
        ...state,
        policy: {
          ...state.policy,
          organisation: {
            1: {
              1: {
                ...state.policy.organisation[1][1],
                permissions: [{ actions: ['test action', 'test action 2'] }],
              },
            },
          },
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ViewOrganisationPolicy />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
});
