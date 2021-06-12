import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../../matchMedia.mock';
import ApplicationForm from './ApplicationForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;
const data = {
  name: 'name',
  description: 'description',
  url: 'url',
};

describe('Application create form component', () => {
  store = mockStore({
    application: {
      req: [],
      details: {},
      loading: true,
    },
    media: {
      req: [],
      details: {},
      loading: false,
    },
  });
  describe('snapshot testing', () => {
    beforeEach(() => {
      onCreate = jest.fn();
      onCreate.mockImplementationOnce(
        (values) => new Promise((resolve, reject) => resolve(values)),
      );
    });
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <ApplicationForm />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with empty data', () => {
      const tree = mount(
        <Provider store={store}>
          <ApplicationForm data={[]} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      const tree = mount(
        <Provider store={store}>
          <ApplicationForm data={data} onCreate={onCreate} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper, props;
    beforeEach(() => {
      props = {
        onCreate: jest.fn(),
        data: {
          name: 'name',
          description: 'description',
          url: 'url',
        },
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <ApplicationForm {...props} />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should not submit form with empty data', (done) => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <ApplicationForm onCreate={props.onCreate} />
          </Provider>,
        );
      });

      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Submit');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should submit form with data', (done) => {
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Submit');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith(props.data);
        done();
      }, 0);
    });
    it('should submit form with updated data', (done) => {
      act(() => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'ApplicationName' } });
        wrapper
          .find('FormItem')
          .at(3)
          .find('Input')
          .simulate('change', { target: { value: 'new url' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('TextArea')
          .simulate('change', { target: { value: 'New Description' } });

        const submitButtom = wrapper.find('Button').at(1);
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          name: 'ApplicationName',
          description: 'New Description',
          url: 'new url',
        });
        done();
      }, 0);
    });
  });
});
