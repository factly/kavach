import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table, Skeleton, Tooltip } from 'antd';

import '../../../matchMedia.mock';
import ApplicationList from './ApplicationList';
import { getApplications, deleteApplication } from '../../../actions/application';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/application', () => ({
  getApplications: jest.fn(),
  deleteApplication: jest.fn(),
}));

let mockedDispatch, store;

let state = {
  organisations: {
    selected: 1,
    details: {
      1: {
        id: 1,
        name: 'Organisation 1',
        slug: 'organisation-1',
        applications: [1, 2],
      }
    },
    loading: false,
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
};

describe('Application List component', () => {
  let props;
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
      props = {
        applicationList: [
          {
            id: 1,
            created_at: '2020-09-09T06:49:36.566567Z',
            updated_at: '2020-09-09T06:49:36.566567Z',
            name: 'Application1',
            description: 'description',
            url: 'url1',
            is_default: true,
          },
          {
            id: 2,
            created_at: '2020-09-09T06:49:54.027402Z',
            updated_at: '2020-09-09T06:49:54.027402Z',
            name: 'Application2',
            description: 'description',
            url: 'url2',
            is_default: false,
          }
        ],
        permission: true,
        loading: true,
      }
    });
    it('should match component when loading', () => {
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
            <ApplicationList {...props} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find(Skeleton).length).toBe(1);
    });

    it('should match component when org is loading', () => {
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
            <ApplicationList {...props} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find(Skeleton).length).toBe(1);
    });
    it('should match component with all data', () => {
      store = mockStore({
        ...state,
        applications: {
          ...state.applications,
          loading: false,
        },
        organisations: {
          ...state.organisations,
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationList
              {...props}
              loading={false}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find("ApplicationCard").length).toBe(2);
    });
    it('should match component with no data', () => {
      store = mockStore({
        ...state,
        applications: {
          ...state.applications,
          loading: false,
          req: [
            {
              data: [],
              query: {
                page: 1,
                limit: 5,
              },
              total: 0,
            },
          ],
          details: {},
        },
        organisations: {
          ...state.organisations,
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationList
              {...props}
              applicationList={[]}
              loading={false}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find("ApplicationCard").length).toBe(0);
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should delete application', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ApplicationList {...props} permission={true} loading={false}
              />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      expect(link.prop('to')).toEqual('/applications/1/edit');
      const link2 = wrapper.find(Link).at(1);
      link2.simulate('click');
      wrapper.find(Popconfirm).at(0).props().onConfirm();
      expect(deleteApplication).toBeCalled();
      expect(deleteApplication).toBeCalledWith(1);
      wrapper.find(Popconfirm).at(1).props().onConfirm();
      expect(deleteApplication).toBeCalled();
      expect(deleteApplication).toBeCalledWith(2);
    });
  });
  it('should not allow to delete application when application is not default and org id is not 1', () => {
    store = mockStore({
      ...state,
      organisations: {
        ...state.organisations,
        selected: 2,
      },
    });
    let wrapper;
    act(() => {
      wrapper = mount(
        <Provider store={store}>
          <Router>
            <ApplicationList {...props} permission={true} loading={false}
            />
          </Router>
        </Provider>,
      );
    });
    const link = wrapper.find(Link).at(0);
    expect(link.prop('to')).toEqual('/applications/1/edit');
    const link2 = wrapper.find(Tooltip).at(0);

    expect(link2.prop('title')).toEqual("You don't have permission to delete an application");
  });
});
