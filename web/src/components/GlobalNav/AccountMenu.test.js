import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { UserOutlined } from '@ant-design/icons';
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
});
