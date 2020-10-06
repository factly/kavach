import React from 'react';
import { DatePicker, Radio } from 'antd';
import { act } from '@testing-library/react';
import { shallow, mount } from 'enzyme';
import moment from 'moment';

import '../../matchMedia.mock';
import Profile from './index';

global.fetch = jest.fn();

let m = moment('12 Dec 2020 00:00:00 IST', 'DD MMM YYYY HH:mm:ss'); // Parse string in local time
const birthDate = m.format();

describe('Profiles index component', () => {
  describe('snapshot testing', () => {
    it('should render the component', async () => {
      let component;
      await act(async () => {
        component = shallow(<Profile />);
      });
      await act(async () => {
        component.update();
      });
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      act(() => {
        wrapper.unmount();
      });
    });
    it('should submit form with data', async (done) => {
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              first_name: 'first_name',
              last_name: 'last_name',
              birth_date: birthDate,
              gender: 'other',
            }),
        }),
      );
      await act(async () => {
        wrapper = mount(<Profile />);
      });
      await act(async () => {
        wrapper.update();
      });
      await act(async () => {
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [window.REACT_APP_API_URL + '/profile'],
          [
            window.REACT_APP_API_URL + '/profile',
            {
              method: 'PUT',
              body: JSON.stringify({
                first_name: 'first_name',
                last_name: 'last_name',
                birth_date: birthDate,
                gender: 'other',
              }),
            },
          ],
        ]);
        done();
      });
    });
    it('should submit form with data', async (done) => {
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              first_name: 'first_name',
              last_name: 'last_name',
              birth_date: birthDate,
              gender: 'other',
            }),
        }),
      );
      await act(async () => {
        wrapper = mount(<Profile />);
      });
      await act(async () => {
        wrapper.update();
      });
      await act(async () => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'new first_name' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Input')
          .at(0)
          .simulate('change', { target: { value: 'new last_name' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find(DatePicker)
          .at(0)
          .props()
          .onChange({ target: { value: moment('2020-12-12') } });
        wrapper
          .find('FormItem')
          .at(3)
          .find(Radio.Group)
          .at(0)
          .props()
          .onChange({ target: { value: 'male' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [window.REACT_APP_API_URL + '/profile'],
          [
            window.REACT_APP_API_URL + '/profile',
            {
              method: 'PUT',
              body: JSON.stringify({
                first_name: 'new first_name',
                last_name: 'new last_name',
                birth_date: birthDate,
                gender: 'male',
              }),
            },
          ],
        ]);
        done();
      });
    });
  });
});
