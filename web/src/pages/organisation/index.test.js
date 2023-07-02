import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { act } from '@testing-library/react';
import { shallow, mount } from 'enzyme';

import '../../matchMedia.mock';
import OrganisationCreate from './index';
import { addOrganisation } from '../../actions/organisations';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../actions/organisations', () => ({
  addOrganisation: jest.fn(),
  getOrganisations: jest.fn(),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

describe('Organisations index component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  store.dispatch = jest.fn(() => ({}));

  const push = jest.fn();
  useHistory.mockReturnValue({ push });
  describe('snapshot testing', () => {
    const description = 'should render the component ';
    it(description + 'when loading is true', () => {
      store = mockStore({
        organisations: {
          ids: [1],
          details: { 1: { id: 1, name: 'organisation' } },
          loading: true,
          selected: 1,
        },
        media: {
          req: [],
          details: {},
          loading: false,
        },
        profile: {
          roles: {
            1: 'member',
          },
        },
      });

      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <OrganisationCreate />
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
    });
    it(description + 'when loading is false', () => {
      store = mockStore({
        organisations: {
          ids: [1],
          details: { 1: { id: 1, name: 'organisation' } },
          loading: false,
          selected: 1,
        },
        media: {
          req: [],
          details: {},
          loading: false,
        },
        profile: {
          roles: {
            1: 'member',
          },
        },
      });

      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Router>
              <OrganisationCreate />
            </Router>
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
    });

    it(description + 'when loading is false and org count is 0', () => {
      store = mockStore({
        organisations: {
          ids: [],
          details: {},
          loading: false,
          selected: 1,
        },
        media: {
          req: [],
          details: {},
          loading: false,
        },
        profile: {
          roles: {
            1: 'member',
          },
        },
      });

      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Router>
              <OrganisationCreate />
            </Router>
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
    });
  });
});
