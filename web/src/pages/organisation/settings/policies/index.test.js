import React from 'react';
import thunk from 'redux-thunk';
import { useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { useHistory, useParams } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { getOrganisation } from '../../../../actions/organisations';
import { getOrganisationPolicy } from '../../../../actions/policy';

import OrganisationPolicies from './index';

import '../../../../matchMedia.mock.js';
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
  })),
}));

jest.mock('../../../../actions/organisations', () => ({
  getOrganisation: jest.fn(),
}));

jest.mock('../../../../actions/policy', () => ({
  getOrganisationPolicy: jest.fn(),
}));

jest.mock('./components/PolicyList', () => {
  return {
    __esModule: true,
    default: (props) => {
      return <div id="policyList" onClick={props.onChange} />;
    },
  };
});

let state = {
  organisations: {
    details: {
      1: {
        id: 1,
        name: 'test',
        roleIDs: [1, 2, 3],
      },
    },
    loading: false,
    selected: 1,
  },
  profile: {
    roles: {
      1: 'owner',
    },
    loading: false,
  },
};

describe('OrganisationPolicies component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  store.dispatch = jest.fn(() => ({}));
  const push = jest.fn();
  useHistory.mockReturnValue({ push });
  const description = 'should render the OrganisationPolicies component';
  describe('snapshot testing', () => {
    it(description + ' when loadingorg', () => {
      store = mockStore({
        ...state,
        organisations: {
          ...state.organisations,
          loading: true,
        },
        profile: {
          ...state.profile,
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <OrganisationPolicies />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });

    it(description + ' when role is not owner', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: 'member',
          },
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <OrganisationPolicies />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it(description + ' when role is owner', () => {
      store = mockStore({
        ...state,
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <OrganisationPolicies />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });

  describe('function testing', () => {
    it('should call getOrganisation and getOrganisationPolicy om render', () => {
      store = mockStore({
        ...state,
      });
      mount(
        <Provider store={store}>
          <Router>
            <OrganisationPolicies />
          </Router>
        </Provider>,
      );
      expect(getOrganisation).toHaveBeenCalledWith(1);
      expect(getOrganisationPolicy).toHaveBeenCalledWith();
    });
  });
});
