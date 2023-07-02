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
import { getOrganisationTokens, deleteOrganisationToken } from '../../../../../actions/token';
import { Popconfirm } from 'antd';

import TokenList from './OrganisationTokenList';

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

jest.mock('../../../../../actions/token', () => ({
  getOrganisationTokens: jest.fn(() => Promise.resolve({})),
  deleteOrganisationToken: jest.fn(() => Promise.resolve({})),
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
  tokens: {
    organisation: {
      1: {
        1: { id: 1, name: 'test token 1' },
        2: { id: 2, name: 'test token 2' },
        3: { id: 3, name: 'test token 3' },
      },
    },
    loading: false,
  },
};

describe('Token List Component', () => {
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
        tokens: {
          ...state.tokens,
          loading: true,
        },
      });
      store.dispatch = jest.fn(() => ({}));
      const component = mount(
        <Provider store={store}>
          <Router>
            <TokenList orgID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Spin').length).toBe(2);
    });
    it(description + 'with no tokens', () => {
      store = mockStore({
        ...state,
        organisations: {
          details: {
            1: { id: 1, name: 'test organisation' },
          },
        },
      });
      store.dispatch = jest.fn(() => ({}));
      const component = mount(
        <Provider store={store}>
          <Router>
            <TokenList orgID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Empty').length).toBe(1);
    });
    it(description + 'with tokens', () => {
      store = mockStore({
        ...state,
      });
      store.dispatch = jest.fn(() => ({}));
      const component = mount(
        <Provider store={store}>
          <Router>
            <TokenList orgID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Table').length).toBe(1);
      const deleteButton = component.find('Button').at(0);
      expect(deleteButton.length).toBe(1);
      expect(deleteButton.text()).toBe('Revoke');
      expect(deleteButton.props().disabled).toBe(false);
    });

    it(description + 'with tokens and role is not owner', () => {
      store = mockStore({
        ...state,
      });
      store.dispatch = jest.fn(() => ({}));
      const component = mount(
        <Provider store={store}>
          <Router>
            <TokenList orgID={1} role="admin" />
          </Router>
        </Provider>,
      );
      expect(component).toMatchSnapshot();
      expect(component.find('Table').length).toBe(1);
      const deleteButton = component.find('Button').at(0);
      expect(deleteButton.length).toBe(1);
      expect(deleteButton.text()).toBe('Revoke');
      expect(deleteButton.props().disabled).toBe(true);
    });
  });

  describe('functionality', () => {
    it('should call getOrganisationTokens on render', () => {
      store = mockStore({
        ...state,
      });
      store.dispatch = jest.fn(() => ({}));
      mount(
        <Provider store={store}>
          <Router>
            <TokenList orgID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(getOrganisationTokens).toHaveBeenCalledWith();
    });
    it('should call deleteOrganisationToken when deleted', () => {
      store = mockStore({
        ...state,
      });
      store.dispatch = jest.fn(() => ({}));
      const component = mount(
        <Provider store={store}>
          <Router>
            <TokenList orgID={1} role="owner" />
          </Router>
        </Provider>,
      );
      const deleteButton = component.find('Button').at(0);
      act(() => {
        deleteButton.simulate('click');
        const popOver = component.find(Popconfirm).at(0);
        popOver.props().onConfirm();
      });
      expect(deleteOrganisationToken).toHaveBeenCalledWith(1);
      expect(getOrganisationTokens).toHaveBeenCalled();
    });
  });
});
