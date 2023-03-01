import React from 'react';
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount, shallow } from 'enzyme';

import '../../matchMedia.mock';
import Header from './Header';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import * as actions from '../../actions/settings';

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

describe('Header component', () => {
  let store;
  let mockedDispatch;

  let state;

  beforeEach(() => {
    state = {
      settings: {
        navTheme: 'dark',
        title: 'Dega',
        sider: {
          collapsed: true,
        },
      },
      organisations: {
        ids: [1],
        details: {
          1: {
            id: 1,
            title: 'title',
            description: 'description',
            permission: { role: 'member' },
            applications: [1, 2],
          },
        },
        loading: false,
        selected: 1,
      },
      applications: {
        details: {
          1: {
            id: 1,
            name: 'app1',
            description: 'description',
            permission: { role: 'member' },
            medium_id: 2,
          },
          2: {
            id: 2,
            name: 'app2',
            description: 'description',
            permission: { role: 'member' },
            medium_id: 1,
          },
        },
      },
      profile: {
        details: {
          id: '1',
          first_name: 'abc',
          last_name: 'xyz',
          display_name: 'abc',
          slug: 'abc',
          email: 'abc@gmail.com',
          social_media_urls: {},
          description: 'Description',
        },
        loading: false,
      },
      media: {
        details: {
          1: { id: 1, url: { proxy: 'imageUrl' } },
          2: { id: 2, url: { proxy: 'imageUrl' } },
        },
      },
    };
    store = mockStore(() => state);
    store.dispatch = jest.fn(() => ({}));
  });
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = shallow(
        <Provider store={store}>
          <Router>
            <Header />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should render correctly when organisations is present and when REACT_APP_ENABLE_MULTITENANCY is false', () => {
      window.REACT_APP_ENABLE_MULTITENANCY = 'false';
      wrapper = mount(
        <Provider store={store}>
          <Router>
            <Header />
          </Router>
        </Provider>,
      );

      expect(wrapper.find('Link').length).toBe(0);
    });
    it('should render correctly when organisations is present and when REACT_APP_ENABLE_MULTITENANCY is true', () => {
      window.REACT_APP_ENABLE_MULTITENANCY = 'true';
      wrapper = mount(
        <Provider store={store}>
          <Router>
            <Header />
          </Router>
        </Provider>,
      );
      expect(wrapper.find('Link').length).toBe(1);
    });
    it('should render correctly when organisations is not present and when REACT_APP_ENABLE_MULTITENANCY is false', () => {
      window.REACT_APP_ENABLE_MULTITENANCY = 'false';
      store = mockStore(() => {
        return {
          ...state,
          organisations: {
            details: {},
            loading: false,
            selected: 1,
          },
        };
      });

      wrapper = mount(
        <Provider store={store}>
          <Router>
            <Header />
          </Router>
        </Provider>,
      );

      expect(wrapper.find('Link').length).toBe(1);
    });
    it('should show application menu if applications not null and REACT_APP_ENABLE_IMGPROXY is enabled', () => {
      state = {
        settings: {
          navTheme: 'dark',
          title: 'Dega',
          sider: {
            collapsed: true,
          },
        },
        organisations: {
          ids: [1],
          details: {
            1: {
              id: 1,
              title: 'title',
              description: 'description',
              permission: { role: 'member' },
              applications: [1, 2],
            },
          },
          loading: false,
          selected: 1,
        },
        applications: {
          details: {
            1: {
              id: 1,
              name: 'app1',
              description: 'description',
              permission: { role: 'member' },
              medium_id: 2,
            },
            2: {
              id: 2,
              name: 'app2',
              description: 'description',
              permission: { role: 'member' },
              medium_id: 1,
            },
          },
        },
        profile: {
          details: {
            id: '1',
            first_name: 'abc',
            last_name: 'xyz',
            display_name: 'abc',
            slug: 'abc',
            email: 'abc@gmail.com',
            social_media_urls: {},
            description: 'Description',
          },
          loading: false,
        },
        media: {
          details: {
            1: { id: 1, url: { proxy: 'imageUrl', raw: 'rawurl' } },
            2: { id: 2 },
          },
        },
      };
      window.REACT_APP_ENABLE_IMGPROXY = 'true';
      store = mockStore(() => state);
      const wrapper = mount(
        <Provider store={store}>
          <Router>
            <Header />
          </Router>
        </Provider>,
      );
      wrapper.find('Popover').simulate('click');
      wrapper.update();
      expect(wrapper.find('img')).toHaveLength(1);
      expect(wrapper.find('img').prop('src')).toBe('imageUrl');
      expect(wrapper.find('Avatar').length).toBe(1);
      expect(wrapper.find('Avatar').prop('shape')).toBe('square');
      expect(wrapper.find('Avatar').text()).toBe('a');
      expect(wrapper.find('List').find('a').length).toBe(2);
    });
    it('should show application menu if applications not null and REACT_APP_ENABLE_IMGPROXY is disable and one of app do not have url', () => {
      state = {
        settings: {
          navTheme: 'dark',
          title: 'Dega',
          sider: {
            collapsed: true,
          },
        },
        organisations: {
          ids: [1],
          details: {
            1: {
              id: 1,
              title: 'title',
              description: 'description',
              permission: { role: 'member' },
              applications: [1, 2],
            },
          },
          loading: false,
          selected: 1,
        },
        applications: {
          details: {
            1: {
              id: 1,
              name: 'app1',
              description: 'description',
              permission: { role: 'member' },
              medium_id: 2,
            },
            2: {
              id: 2,
              name: 'app2',
              description: 'description',
              permission: { role: 'member' },
              medium_id: 1,
            },
          },
        },
        profile: {
          details: {
            id: '1',
            first_name: 'abc',
            last_name: 'xyz',
            display_name: 'abc',
            slug: 'abc',
            email: 'abc@gmail.com',
            social_media_urls: {},
            description: 'Description',
          },
          loading: false,
        },
        media: {
          details: {
            1: { id: 1, url: { proxy: 'imageUrl', raw: 'rawurl' } },
            2: { id: 2 },
          },
        },
      };
      window.REACT_APP_ENABLE_IMGPROXY = false;
      store = mockStore(() => state);
      const wrapper = mount(
        <Provider store={store}>
          <Router>
            <Header />
          </Router>
        </Provider>,
      );

      wrapper.find('Popover').simulate('click');
      wrapper.update();
      expect(wrapper.find('img')).toHaveLength(1);
      expect(wrapper.find('img').prop('src')).toBe('rawurl');
      expect(wrapper.find('List').find('a').length).toBe(2);
    });
    it('should not show application menu if no organisation selected', () => {
      state = {
        settings: {
          navTheme: 'dark',
          title: 'Dega',
          sider: {
            collapsed: true,
          },
        },
        organisations: {
          ids: [1],
          details: {
            1: {
              id: 1,
              title: 'title',
              description: 'description',
              permission: { role: 'member' },
              applications: [
                { id: 1, name: 'Dega', url: 'http://1233434/1323' },
                { id: 2, name: 'Bindu', url: 'http://1233434/454567' },
              ],
            },
          },
          loading: false,
          selected: 0,
        },
        profile: {
          details: {
            id: '1',
            first_name: 'abc',
            last_name: 'xyz',
            display_name: 'abc',
            slug: 'abc',
            email: 'abc@gmail.com',
            social_media_urls: {},
            description: 'Description',
          },
          loading: false,
        },
      };
      store = mockStore(() => state);
      const wrapper = mount(
        <Provider store={store}>
          <Router>
            <Header />
          </Router>
        </Provider>,
      );
      expect(wrapper.find('Popover').length).toBe(0);
    });
  });
});
