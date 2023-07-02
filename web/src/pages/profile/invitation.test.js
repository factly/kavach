import React from 'react';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import moment from 'moment';
import { getInvitation, acceptInvitation, deleteInvitation } from '../../actions/profile';
import '../../matchMedia.mock';
import Invitation from './invitation';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

global.fetch = jest.fn();

let m = moment('12 Dec 2020 00:00:00 IST', 'DD MMM YYYY HH:mm:ss'); // Parse string in local time

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../actions/profile', () => ({
  getInvitation: jest.fn(),
  deleteInvitation: jest.fn(),
  acceptInvitation: jest.fn(),
}));

describe('Invitation component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  store.dispatch = jest.fn(() => ({}));

  describe('snapshot testing', () => {
    test('should render when loading is true', () => {
      store = mockStore({
        profile: {
          invitations: [],
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Invitation />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    test('should render when loading is false invitation list is empty', () => {
      store = mockStore({
        profile: {
          invitations: [],
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Invitation />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    test('should render when invitations are not empty', () => {
      store = mockStore({
        profile: {
          invitations: [
            {
              id: 1,
              organisation: { id: 1, title: 'test Org' },
              role: { id: 1, title: 'test Role' },
              invited_by: { id: 1, email: 'test@factly.com' },
            },
          ],
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Invitation />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      store = mockStore({
        profile: {
          invitations: [
            {
              id: 1,
              organisation: { id: 1, title: 'test Org' },
              role: { id: 1, title: 'test Role' },
              invited_by: { id: 1, email: 'test@factly.com' },
            },
          ],
          loading: false,
        },
      });
    });
    test('should call fetchInvitations on load', () => {
      mount(
        <Provider store={store}>
          <Router>
            <Invitation />
          </Router>
        </Provider>,
      );
      expect(getInvitation).toHaveBeenCalled();
    });
    test('should call onAccept on accept button click', () => {
      let wrapper = mount(
        <Provider store={store}>
          <Invitation />
        </Provider>,
      );
      wrapper.find('button').at(0).simulate('click');
      expect(acceptInvitation).toHaveBeenCalledWith(1, {
        organisation_id: 1,
        inviter_id: 1,
        role: { id: 1, title: 'test Role' },
      });
    });
    test('should call onDecline on decline button click', () => {
      let wrapper = mount(
        <Provider store={store}>
          <Invitation />
        </Provider>,
      );
      wrapper.find('button').at(1).simulate('click');
      expect(deleteInvitation).toHaveBeenCalledWith(1);
    });
  });
});
