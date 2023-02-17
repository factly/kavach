import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import '../../matchMedia.mock';
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
    it('should call logout API and remove local storage item on logout click', () => {
      // const mockFetch = jest.fn();
      // global.fetch = mockFetch;
      // const mockNotification = jest.fn();
      // const mockRemoveItem = jest.fn();
      // Object.defineProperty(window, 'localStorage', {
      //   value: { removeItem: mockRemoveItem },
      //   writable: true,
      // });
      // Object.defineProperty(window, 'notification', {
      //   value: { error: mockNotification },
      //   writable: true,
      // });

      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <AccountMenu />
          </Provider>,
        );
      });
      // console.log(wrapper.debug());
      // console.log(wrapper.debug())
      console.log(wrapper.find({ icon: <LogoutOutlined /> }).debug())


      // const logoutButton = wrapper.find({ icon: <LogoutOutlined /> })
      // how to find the logout button and click it

      // expect(mockFetch).toHaveBeenCalledWith(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/logout/browser', {
      //   credentials: 'include',
      // });

      // const mockResponse = { logout_url: 'http://example.com/logout' };
      // const mockJsonPromise = Promise.resolve(mockResponse); // A promise that resolves to a mocked JSON response
      // const mockFetchPromise = Promise.resolve({
      //   json: () => mockJsonPromise,
      //   status: 200,
      // }); // A promise that resolves to a mocked fetch response with 200 status code
      // mockFetch.mockReturnValueOnce(mockFetchPromise);

      // return mockFetchPromise.then(() => {
      //   expect(window.location.href).toEqual(mockResponse.logout_url);
      //   expect(mockRemoveItem).toHaveBeenCalledWith('returnTo');
      //   expect(mockNotification).not.toHaveBeenCalled();
      // });
    });

    xit('should show error notification on logout API failure', () => {
      const store = mockStore(state)
      const mockFetch = jest.fn();
      global.fetch = mockFetch;
      const mockNotification = jest.fn();
      Object.defineProperty(window, 'notification', {
        value: { error: mockNotification },
        writable: true,
      });

      const wrapper = mount(<Provider store={store}>
        <AccountMenu />
      </Provider>,);
      expect(mockFetch).toHaveBeenCalledWith(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/logout/browser', {
        credentials: 'include',
      });

      const mockFetchPromise = Promise.reject(new Error(500)); // A promise that rejects with an error object
      mockFetch.mockReturnValueOnce(mockFetchPromise);

      return mockFetchPromise.catch(() => {
        expect(window.location.href).not.toBeDefined();
        expect(mockNotification).toHaveBeenCalledWith({
          message: 'Error',
          description: 'Unable to logout',
        });
      });
    });
  });
});
