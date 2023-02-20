import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import '../../matchMedia.mock';
import { notification } from 'antd';
import { shallow, mount } from 'enzyme';
import AccountMenu from './AccountMenu';
import { act } from 'react-dom/test-utils';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
let state = {
  profile: {
    details: {
      id: '1',
      first_name: 'abc',
      last_name: 'xyz',
      display_name: 'abc',
      slug: 'abc',
      email: 'abc@gmail.com',
      social_media_urls: {},
      medium: {
        url: {
          proxy: 'imageUrl',
          raw: 'rawUrl',
        },
      },
      description: 'Description',
    },
    loading: false,
  },
};
describe('Account Menu component', () => {
  let store;
  let mockedDispatch;
  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  describe('snapshot testing', () => {
    it('should render the component', () => {
      store = mockStore(state);
      let component = shallow(
        <Provider store={store}>
          <AccountMenu />
        </Provider>,
      );
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should display User profile', () => {
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <AccountMenu />
          </Provider>,
        );
      });
      expect(wrapper.find(UserOutlined).length).toBe(0);
    });
    it('should display User profile with default User Icon when IMG PROXY IS DISABLED', () => {
      store = mockStore(state);
      window.REACT_APP_ENABLE_IMGPROXY = false;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <AccountMenu />
          </Provider>,
        );
      });
      expect(wrapper.find('SubMenu').get(4).props.title.props.children.props.children.props.src).toBe('rawUrl');
    });
    it('should display User profile with default User Icon when IMG PROXY IS Enable', () => {
      store = mockStore(state);
      window.REACT_APP_ENABLE_IMGPROXY = true;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <AccountMenu />
          </Provider>,
        );
      });
      expect(wrapper.find('SubMenu').get(4).props.title.props.children.props.children.props.src).toBe('imageUrl');
    });
    it('should display User profile with default User Icon when no medium', () => {
      const state2 = { ...state };
      state2.profile.details = {
        id: '1',
        first_name: 'abc',
        last_name: 'xyz',
        display_name: 'abc',
        slug: 'abc',
        email: 'abc@gmail.com',
        social_media_urls: {},
        description: 'Description',
      };
      store = mockStore(state2);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <AccountMenu />
          </Provider>,
        );
      });
      expect(wrapper.find(UserOutlined).length).toBe(1);
    });
    it('should display User profile with default User Icon when no profile found', () => {
      const state2 = { ...state };
      state2.profile = {};
      store = mockStore(state2);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <AccountMenu />
          </Provider>,
        );
      });
      expect(wrapper.find(UserOutlined).length).toBe(1);
    });
  });
  describe('func. testing', () => {
    let wrapper;
    it('should call logout API and remove local storage item on logout click', async () => {
      const mockRemoveItem = jest.fn();
      Object.defineProperty(window, 'localStorage', {
        value: { removeItem: mockRemoveItem },
        writable: true,
      });
      const mockData = { logout_url: 'http://localhost/' };

      const mockFetch = jest.fn(() => Promise.resolve({
        json: () => Promise.resolve(mockData),
        status: 200,
      }));

      global.fetch = mockFetch;

      store = mockStore(state);
      await act(async () => {
        wrapper = mount(
          <Provider store={store}>
            <AccountMenu />
          </Provider>,
        );
      });
      wrapper.find('SubMenu').get(4).props.children[2].props.onClick();
      expect(mockFetch).toHaveBeenCalledWith(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/logout/browser', {
        credentials: 'include',
      });

      return new Promise(resolve => {
        setTimeout(() => {
          expect(mockRemoveItem).toHaveBeenCalledWith('returnTo');
          expect(window.location.href).toEqual(mockData.logout_url);
          resolve();
        }, 1000);
      });
    });
    it('should throw error when responese status is not 200', () => {
      const mockNotification = jest.fn();
      const mockRemoveItem = jest.fn();
      Object.defineProperty(window, 'localStorage', {
        value: { removeItem: mockRemoveItem },
        writable: true,
      });
      const mockData = { logout_url: 'http://localhost/' };

      const mockFetch = jest.fn(() => Promise.resolve({
        json: () => Promise.resolve(mockData),
        status: 500,
      }));

      global.fetch = mockFetch;

      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <AccountMenu />
          </Provider>,
        );
      });
      wrapper.find('SubMenu').get(4).props.children[2].props.onClick();
      expect(mockFetch).toHaveBeenCalledWith(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/logout/browser', {
        credentials: 'include',
      });

      return new Promise(resolve => {
        setTimeout(() => {
          expect(mockRemoveItem).not.toHaveBeenCalled();
          resolve();
        }, 1000);
      });
    });

    it('should show error notification on logout API failure', () => {
      notification.error = jest.fn();
      const store = mockStore(state);
      const mockFetch = jest.fn();
      global.fetch = mockFetch;
      const mockFetchPromise = Promise.reject(new Error(500)); // A promise that rejects with an error object
      mockFetch.mockReturnValueOnce(mockFetchPromise);
      const wrapper = mount(<Provider store={store}>
        <AccountMenu />
      </Provider>);

      wrapper.find('SubMenu').get(4).props.children[2].props.onClick();
      expect(mockFetch).toHaveBeenCalledWith(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/logout/browser', {
        credentials: 'include',
      });

      return new Promise(resolve => {
        setTimeout(() => {
          expect(notification.error).toHaveBeenCalledWith({
            message: 'Error',
            description: 'Unable to logout',
          });
          resolve();
        }, 1000);
      });
    });

  });
});
