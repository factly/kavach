import React from 'react';
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { PageHeader as AntPageHeader } from 'antd';
import _ from 'lodash';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import PageHeader from './index';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({ pathname: '/users' }),
}));

describe('Page Header component', () => {
  let store;

  describe('snapshot testing', () => {
    it('should render component', () => {
      store = mockStore({});
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PageHeader />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render component with route found', () => {
      useLocation.mockReturnValue({ pathname: '/users/create' });
      const state = {
        users: {
          loading: false,
        },
      };
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PageHeader />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;

    it('should display breadcrumb for edit page', () => {
      useLocation.mockReturnValue({ pathname: '/applications/1/edit' });
      const state = {
        applications: {
          details: {
            1: { id: 1, name: 'Application' },
          },
          loading: false,
        },
      };
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PageHeader />
            </Router>
          </Provider>,
        );
      });
      expect(wrapper.find(AntPageHeader).props().title).toBe('Edit Application');
    });
    it('should not display breadcrumb for edit page when record not found', () => {
      useLocation.mockReturnValue({ pathname: '/applications/2/edit' });
      const state = {
        applications: {
          details: {
            1: { id: 1, name: 'Application' },
          },
          loading: false,
        },
      };
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PageHeader />
            </Router>
          </Provider>,
        );
      });
      const expectedRoutes = [
        { path: '/', breadcrumbName: 'Home' },
        { path: '/applications', breadcrumbName: 'Applications' },
        { path: '/applications/:id/edit', breadcrumbName: 'Application' },
      ];
      expect(wrapper.find(AntPageHeader).props().breadcrumb.routes).not.toEqual(expectedRoutes);
    });
    it('should not display breadcrumb for edit page when route not found', () => {
      useLocation.mockReturnValue({ pathname: '/application/2/edit' });
      const state = {
        application: {
          details: {
            1: { id: 1, name: 'Application' },
          },
          loading: false,
        },
      };
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PageHeader />
            </Router>
          </Provider>,
        );
      });
      const expectedRoutes = [{ path: '/', breadcrumbName: 'Home' }];
      expect(wrapper.find(AntPageHeader).props().breadcrumb.routes).toEqual(expectedRoutes);
    });
  });
});
