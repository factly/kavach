import React from 'react';
import { DatePicker } from 'antd';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import moment from 'moment';

import '../../matchMedia.mock';
import Profile from './index';
import { getUserProfile, updateProfile } from '../../actions/profile';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

global.fetch = jest.fn();

let m = moment('12 Dec 2020 00:00:00 IST', 'DD MMM YYYY HH:mm:ss'); // Parse string in local time
const birthDate = m.format();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../actions/profile', () => ({
  getUserProfile: jest.fn(),
  updateProfile: jest.fn(),
}));

describe('Profiles index component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  store.dispatch = jest.fn(() => ({}));

  describe('snapshot testing', () => {
    it('should render the component', () => {
      store = mockStore({
        profile: {},
        media: {
          req: [],
          details: {},
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Profile />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      store = mockStore({
        profile: {
          details: {
            id: '1',
            first_name: 'abc',
            last_name: 'xyz',
            display_name: 'abc',
            slug: 'abc',
            email: 'abc@gmail.com',
            birth_date: birthDate,
            social_media_urls: {
              facebook: 'facebook/abc',
              twitter: 'twitter/abc',
              linkedin: 'linkedin/abc',
              instagram: 'instagram/abc',
            },
            description: 'Description',
          },
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Profile />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getUserProfile).toHaveBeenCalled();
    });
  });
  describe('component testing', () => {
    store = mockStore({
      profile: {
        details: {
          id: '1',
          first_name: 'abc',
          last_name: 'xyz',
          display_name: 'abc',
          slug: 'abc',
          email: 'abc@gmail.com',
          birth_date: undefined,
          social_media_urls: {
            facebook: 'facebook/abc',
            twitter: 'twitter/abc',
            linkedin: 'linkedin/abc',
            instagram: 'instagram/abc',
          },
          description: 'Description',
        },
        loading: false,
      },
      media: {
        req: [],
        details: {},
        loading: false,
      },
    });
    let wrapper;
    beforeEach(() => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Profile />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should submit form with data', (done) => {
      const date = Date.now();
      act(() => {
        // console.log(wrapper.find('input').debug());
        wrapper
          .find('input')
          .at(1)
          .simulate('change', { target: { value: 'firstname' } });
        wrapper
          .find('input')
          .at(2)
          .simulate('change', { target: { value: 'lastname' } });
        wrapper
          .find('input')
          .at(3)
          .simulate('change', { target: { value: 'new Display Name' } });
        wrapper
          .find(DatePicker)
          .props()
          .onChange({
            target: { value: undefined },
          });
        wrapper
          .find(DatePicker)
          .props()
          .onChange({
            target: { value: moment(date) },
          });
        wrapper
          .find('input')
          .at(6)
          .props()
          .onChange({ target: { value: 'male' } });

        const updateButtom = wrapper.find('Button').at(1);
        // console.log(updateButtom.debug());
        expect(updateButtom.text()).toBe('Update');
        updateButtom.simulate('submit');
      });

      wrapper.update();
      const expectedParams = {
        email: 'abc@gmail.com',
        first_name: 'firstname',
        last_name: 'lastname',
        display_name: 'new Display Name',
        slug: 'new-display-name',
        birth_date: moment(date),
        social_media_urls: {
          facebook: 'facebook/abc',
          twitter: 'twitter/abc',
          linkedin: 'linkedin/abc',
          instagram: 'instagram/abc',
        },
        description: 'Description',
        featured_medium_id: undefined,
        gender: 'male',
      };
      const updateButtom = wrapper.find('Button').at(1);
      setTimeout(() => {
        expect(getUserProfile).toHaveBeenCalled();
        expect(updateProfile).toHaveBeenCalledTimes(1);
        expect(updateButtom.props().disabled).toBe(false);
        expect(updateProfile).toHaveBeenCalledWith(expectedParams);
        done();
      });
    });
    it('should submit form with date as null', (done) => {
      act(() => {
        wrapper
          .find(DatePicker)
          .props()
          .onChange({
            target: { value: undefined },
          });
        const updateButtom = wrapper.find('Button').at(1);
        updateButtom.simulate('submit');
      });
      wrapper.update();
      setTimeout(() => {
        expect(updateProfile).toHaveBeenCalledWith({
          email: 'abc@gmail.com',
          first_name: 'abc',
          gender: undefined,
          last_name: 'xyz',
          slug: 'abc',
          birth_date: null,
          display_name: 'abc',
          social_media_urls: {
            facebook: 'facebook/abc',
            twitter: 'twitter/abc',
            linkedin: 'linkedin/abc',
            instagram: 'instagram/abc',
          },
          description: 'Description',
          featured_medium_id: undefined,
          gender: undefined,
        });
        done();
      });
    });
    it('should disable update button unless any change', () => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Profile />
          </Provider>,
        );
      });
      expect(wrapper.find('Button').at(1).props().disabled).toBe(true);
    });
  });
});
