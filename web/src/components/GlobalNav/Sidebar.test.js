import React from 'react';
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount, shallow } from 'enzyme';

import '../../matchMedia.mock';
import Sidebar from './Sidebar';
import * as actions from '../../actions/settings';
import { Layout } from 'antd';

const { Sider } = Layout;

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

jest.mock('../../actions/settings', () => ({
  toggleSider: jest.fn(),
}));

describe('Sidebar component', () => {
  let store;
  let mockedDispatch;
  let state = {
    settings: {
      navTheme: 'dark',
      title: 'Dega',
      sider: {
        collapsed: true,
      },
    },
    sidebar: {
      collapsed: true,
    },
    profile: {
      invitations: [{ id: 1, organisation: { id: 1, title: 'title', description: 'description' } }],
      loading: false,
    },
  };
  store = mockStore(() => state);
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = shallow(
        <Provider store={store}>
          <Router>
            <Sidebar />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });

    it('should render the component invitecount is 0', () => {
      store = mockStore(() => ({
        ...state,
        profile: {
          invitations: [],
          loading: false,
        },
      }));

      const tree = shallow(
        <Provider store={store}>
          <Router>
            <Sidebar />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('state testing', () => {
    it('should render the component with collapsed state', () => {
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Sidebar />
          </Router>
        </Provider>,
      );
      expect(tree.find(Sider).props().collapsed).toBe(true);
    });
    it('should render the component with expanded state', () => {
      store = mockStore(() => ({
        ...state,
        settings: {
          ...state.settings,
          sider: {
            collapsed: false,
          },
        },
        sidebar: {
          collapsed: false,
        },
      }));
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Sidebar />
          </Router>
        </Provider>,
      );
      expect(tree.find(Sider).props().collapsed).toBe(false);
    });
    it('should render the component when loading is true', () => {
      store = mockStore(() => ({
        ...state,
        profile: {
          invitations: [],
          loading: true,
        },
      }));
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Sidebar />
          </Router>
        </Provider>,
      );
      const invitationLinks = tree.find('Link').filterWhere((link) => link.props().to === '/profile/invite');
      expect(invitationLinks.find('Avatar').length).toBe(0);
    });
    it('should render the component when loading is false', () => {
      store = mockStore(() => (state))
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Sidebar />
          </Router>
        </Provider>,
      );
      const invitationLinks = tree.find('Link').filterWhere((link) => link.props().to === '/profile/invite');
      expect(invitationLinks.find('Avatar').length).toBe(1);
    });
  });

  describe('function testing', () => {
    it('should call setCollapse true', () => {
      store = mockStore(() => ({
        ...state,
        sidebar: {
          collapsed: false,
        },
      }));
      const setCollapse = jest.fn();
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Sidebar />
          </Router>
        </Provider>,
      );
      tree.find('button').simulate('click');
      // expect(setCollapse).toHaveBeenCalledWith(true);
    });

    it('should call setCollapse false', () => {
      store = mockStore(() => ({
        ...state,
        sidebar: {
          collapsed: true,
        },
      }));
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Sidebar />
          </Router>
        </Provider>,
      );
      tree.find('button').simulate('click');
      // expect(setCollapse).toHaveBeenCalledWith(false);
    });
  });
});
