import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Application from './index';
import * as actions from '../../actions/application';
import { act } from 'react-dom/test-utils';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

jest.mock('../../actions/application', () => ({
  getApplications: jest.fn(),
  addApplication: jest.fn(),
  addDefaultApplications: jest.fn(),
}));
let state = {
  organisations: {
    details: {
      1: {
        id: 1,
        name: 'Organisation1',
        applications: [1, 2],
      },
    },
    selected: 1,
  },
  applications: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
        },
        total: 2,
      },
    ],
    details: {
      1: {
        id: 1,
        created_at: '2020-09-09T06:49:36.566567Z',
        updated_at: '2020-09-09T06:49:36.566567Z',
        name: 'Application1',
        description: 'description',
        url: 'url1',
      },
      2: {
        id: 2,
        created_at: '2020-09-09T06:49:54.027402Z',
        updated_at: '2020-09-09T06:49:54.027402Z',
        name: 'Application2',
        description: 'description',
        url: 'url2',
      },
    },
    loading: false,
  },
  profile: {
    loading: false,
    roles: {
      1: 'owner',
    },
  },
  media: {
    req: [],
    details: {},
    loading: true,
  },
};

describe('Application component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  describe('snapshot testing', () => {
    it('should render the component when loading apps', () => {
      store = mockStore({
        ...state,
        applications: {
          ...state.applications,
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Application />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(2);
    });
    it('should render the component when loading Roles', () => {
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
            <Application />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });

    it('should render the component when role is not owner', () => {
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
            <Application />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Link').at(0).text()).not.toBe('Manage Application');
    });

    it('should render the component when role is owner', () => {
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
            <Application />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Link').at(0).text()).toBe('Manage Application');
    });
    it('should render the component with data', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Application />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      // ApplicationList
      expect(tree.find('ApplicationList').length).toBe(1);
    });

    it('should render the component with data and no applications', () => {
      store = mockStore({
        ...state,
        organisations: {
          ...state.organisations,
          details: {
            1: {
              id: 1,
              name: 'Organisation1',
              applications: [],
            },
          },
        },
      });

      const tree = mount(
        <Provider store={store}>
          <Router>
            <Application />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      // ApplicationList
      expect(tree.find('ApplicationList').length).toBe(0);
      // errorComponent
      expect(tree.find('ErrorComponent').length).toBe(1);
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should add default applications', (done) => {
      mockedDispatch = jest.fn(() => Promise.resolve({}));
      useDispatch.mockReturnValue(mockedDispatch);
      store = mockStore(state);
      wrapper = mount(
        <Provider store={store}>
          <Router>
            <Application />
          </Router>
        </Provider>,
      );
      setTimeout(() => {
        expect(actions.getApplications).toHaveBeenCalled();
        done();
      }, 0);
    });
  });
});
