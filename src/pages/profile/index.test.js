import React from 'react';
import { DatePicker } from 'antd';
import { act } from '@testing-library/react';
import { shallow, mount } from 'enzyme';
import moment from 'moment';

import '../../matchMedia.mock';
import Profile from './index';

global.fetch = jest.fn();

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
              birth_date: '2020-12-12',
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
          [process.env.REACT_APP_API_URL + '/profile'],
          [
            process.env.REACT_APP_API_URL + '/profile',
            {
              method: 'PUT',
              body: JSON.stringify({
                first_name: 'first_name',
                last_name: 'last_name',
                birth_date: moment('2020-12-12'),
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
              birth_date: '2020-12-12',
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
          .onChange({ target: { value: moment('2020-10-10') } });
        wrapper
          .find('FormItem')
          .at(3)
          .find('RadioGroup')
          .at(0)
          .props()
          .onChange({ target: { value: 'male' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [process.env.REACT_APP_API_URL + '/profile'],
          [
            process.env.REACT_APP_API_URL + '/profile',
            {
              method: 'PUT',
              body: JSON.stringify({
                first_name: 'new first_name',
                last_name: 'new last_name',
                birth_date: moment('2020-10-10'),
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
