import React from 'react';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import Selector from './index';
import { mount } from 'enzyme';

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

jest.mock('../../actions/users', () => ({
  getAllUsers: jest.fn(),
}));

let state = {
  organisations: {
    ids: [1],
    details: { 1: { id: 1, name: 'organisation' } },
    loading: false,
    selected: 1,
  },
  users: {
    ids: [1, 2],
    organisations: {
      1: [1, 2],
    },
    details: {
      1: {
        id: 1,
        created_at: '2020-07-17T10:14:44.251814Z',
        updated_at: '2020-07-17T10:14:44.251814Z',
        deleted_at: null,
        first_name: 'User-1',
        last_name: 'lastname-1',
        email: 'user1@gmail.com',
      },
      2: {
        id: 1,
        created_at: '2020-07-17T10:14:44.251814Z',
        updated_at: '2020-07-17T10:14:44.251814Z',
        deleted_at: null,
        first_name: 'User-1',
        last_name: 'lastname-2',
        email: 'user2@gmail.com',
      },
    },
    loading: false,
  },
};

describe('Categories List component', () => {
  let store = mockStore({});
  let mockedDispatch;

  describe('Snapshot testing', () => {
    beforeEach(() => {
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      let component;
      store = mockStore(state);
      act(() => {
        component = mount(
          <Provider store={store}>
            <Selector />
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Selector />
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
    });
    it('should render the component with no data', () => {
      let component;
      const state2 = { ...state };
      state2.users.organisations = {};
      const store2 = mockStore(state2);
      act(() => {
        component = mount(
          <Provider store={store2}>
            <Selector />
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
    });
  });
  describe('Component testing', () => {
    let wrapper;
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('handle value change', () => {
      const onChange = jest.fn();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Selector onChange={onChange} value={1} />
          </Provider>,
        );
      });
      wrapper.find('Select').at(0).props().onChange(2);
      expect(onChange).toHaveBeenCalledWith(2);
    });
  });
});
