import React from 'react';
import { BrowserRouter as Router, useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditApplication from './EditApplication';
import * as actions from '../../actions/application';
import ApplicationEditForm from './components/ApplicationForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/application', () => ({
  getApplication: jest.fn(),
  getApplications: jest.fn(),
  updateApplication: jest.fn(),
}));

let state = {
  applicationUsers: {
    details: {
      1: [{ id: 1, email: 'user@gmail.com' }],
    },
    loading: false,
  },
  users: {
    ids: [1],
    details: {
      1: { id: 1, name: 'name', email: 'user@gmail.com', permission: { role: 'member' } },
    },
    organisations: {
      1: [1],
    },
    loading: false,
  },
  organisations: {
    ids: [1],
    details: {
      1: { id: 1, name: 'organisation', applications: [{ id: 1, name: 'Application1' }] },
    },
    loading: false,
    selected: 1,
  },
  applications: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
          limit: 5,
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
        users: [{ id: 1, email: 'user@gmail.com' }],
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
  media: {
    req: [],
    details: {},
    loading: true,
  },
  profile: {
    roles: {
      1: 'owner',
      2: 'member',
    },
    loading: false,
  },
};

describe('Edit Application component', () => {
  let store;
  let mockedDispatch;
  store = mockStore(state);
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditApplication />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading app', () => {
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
            <EditApplication />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });

    it('should match skeleton while loadingRole', () => {
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
            <EditApplication />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });

    it('should match skeleton when role is not owner', () => {
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
            <EditApplication />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('ErrorComponent').length).toBe(1);
    });

    it('should render when application is default application and selected org. is not 1', () => {
      store = mockStore({
        ...state,
        organisations: {
          ...state.organisations,
          selected: 3,
        },
        applications: {
          ...state.applications,
          details: {
            1: {
              ...state.applications.details[1],
              is_default: true,
            },
          },
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditApplication />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('ErrorComponent').length).toBe(1);
    });
    it('should render when application is default application and selected org. is 1', () => {
      store = mockStore({
        ...state,
        applications: {
          ...state.applications,
          details: {
            1: {
              ...state.applications.details[1],
              is_default: true,
            },
          },
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditApplication />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('ErrorComponent').length).toBe(0);
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore(state);
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getApplication.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditApplication />
            </Router>
          </Provider>,
        );
      });
      expect(actions.getApplication).toHaveBeenCalledWith('1');
    });
    it('should call updateApplication', (done) => {
      actions.updateApplication.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditApplication />
            </Router>
          </Provider>,
        );
      });
      wrapper.find(ApplicationEditForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.updateApplication).toHaveBeenCalledWith({
          id: 1,
          created_at: '2020-09-09T06:49:36.566567Z',
          updated_at: '2020-09-09T06:49:36.566567Z',
          name: 'Application1',
          description: 'description',
          url: 'url1',
          test: 'test',
          users: [
            {
              email: 'user@gmail.com',
              id: 1,
            },
          ],
        });
        expect(push).toHaveBeenCalledWith('/applications');
        done();
      }, 0);
    });
  });
});
