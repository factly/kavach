import React from 'react';
import { BrowserRouter as Router, useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import { Button, Popconfirm, Table } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import '../../../matchMedia.mock';
import CreateTokenForm from './CreateTokenForm';
import { addToken } from '../../../actions/token';
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
jest.mock('../../../actions/token', () => ({
  addToken: jest.fn(),
}));
let store;
let mockedDispatch;

describe('Create Token form component', () => {
  store = mockStore({
    applications: {
      req: [],
      details: {},
      loading: true,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <CreateTokenForm />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper, props;
    beforeEach(() => {
      props = {
        appID: 1,
        setVisible: jest.fn(),
        setTokenFlag: jest.fn(),
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateTokenForm {...props} />
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
            <CreateTokenForm appID={1} setVisible={jest.fn()} setTokenFlag={jest.fn()} />
          </Provider>,
        );
      });

      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        expect(submitButtom.text()).toBe('Create API Token');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(addToken).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should not submit form with data', (done) => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateTokenForm appID={1} setVisible={jest.fn()} setTokenFlag={jest.fn()} />
          </Provider>,
        );
      });
      act(() => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'Token Name' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('TextArea')
          .simulate('change', { target: { value: 'New Description' } });
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(0);
        expect(submitButtom.text()).toBe('Create API Token');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(addToken).toHaveBeenCalledWith(
          {
            name: 'Token Name',
            description: 'New Description',
          },
          1,
        );
        done();
      }, 0);
    });
  });
});
