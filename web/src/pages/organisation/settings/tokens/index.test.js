import React from 'react';
import thunk from 'redux-thunk';
import { useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { useHistory, useParams } from 'react-router-dom';
import '../../../../matchMedia.mock.js';
import { act } from 'react-dom/test-utils';

import OrganisationTokens from './index';

jest.mock('./components/OrganisationTokenList', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Token List</div>,
  };
});

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

let state = {
  organisations: {
    details: {
      1: {
        id: 1,
        name: 'test organisation',
        tokens: [1, 2, 3],
      },
    },
    selected: 1,
    loading: false,
  },
  profile: {
    roles: {
      1: 'owner',
    },
    loading: false,
  },
};

describe('Organisation Token List component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  store.dispatch = jest.fn(() => ({}));
  const push = jest.fn();
  useHistory.mockReturnValue({ push });

  describe('snapshots', () => {
    it('should render while loadingorg is true', () => {
      store = mockStore({
        ...state,
        organisations: {
          ...state.organisations,
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <OrganisationTokens />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });
    it('should render while loading is true', () => {
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
            <OrganisationTokens />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });

    it('should render while role is not owner', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: 'admin',
          },
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <OrganisationTokens />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      const btn = tree.find('Button');
      expect(btn.length).toBe(1);
    });

    it('should render while role is owner', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: 'owner',
          },
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <OrganisationTokens />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      const btn = tree.find('Button');
      expect(btn.length).toBe(2);
      expect(btn.at(1).text()).toBe(' Generate new tokens ');
    });
  });
});
