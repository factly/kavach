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
  updateApplication: jest.fn(),
}));

describe('Edit Application component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
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
  });
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
    it('should match component with empty data', () => {
      store = mockStore({
        applications: {
          req: [],
          details: {},
          loading: true,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditApplication />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      store = mockStore({
        applications: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditApplication />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
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
        media: {
          req: [],
          details: {},
          loading: true,
        },
      });
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
        });
        expect(push).toHaveBeenCalledWith('/applications');
        done();
      }, 0);
    });
  });
});
