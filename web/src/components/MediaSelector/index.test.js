import React from 'react';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Radio } from 'antd';

import '../../matchMedia.mock';
import MediaSelector from './index';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../actions/media', () => ({
  ...jest.requireActual('../../actions/media'),
  getMedium: jest.fn(),
  getMedia: jest.fn(),
}));
let state = {
  organisations: {
    ids: [1],
    details: { 1: { id: 1, name: 'organisation' } },
    loading: false,
    selected: 1,
  },
  media: {
    req: [
      {
        data: [1, 2],
        query: { page: 1, limit: 8 },
        total: 2,
      },
    ],
    details: {
      1: {
        id: 1,
        name: 'Medium -1',
        url: 'some-url',
        file_size: 'file_size',
        caption: 'caption',
        description: 'description',
      },
      2: {
        id: 2,
        name: 'Medium - 2',
        url: 'some-url',
        file_size: 'file_size',
        caption: 'caption',
        description: 'description',
      },
    },
    loading: false,
  },
};

describe('MediaSelector component', () => {
  let store;
  let mockedDispatch;

  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore(() => {});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });

    it('should match component with data', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <MediaSelector value={1} />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore(state);
      store.dispatch = jest.fn(() => ({}));
      mockedDispatch = jest.fn(() => Promise.resolve({}));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should handle open and close modal', () => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaSelector />
          </Provider>,
        );
      });
      const selectButton = wrapper.find('Button').at(0);
      expect(selectButton.text()).toBe(' Select');
      selectButton.simulate('click');
      expect(wrapper.find('Modal').props().visible).toBe(true);
      const closeButton = wrapper.find('Button').at(0);
      expect(closeButton.text()).toBe('Return');
      closeButton.simulate('click');
      expect(wrapper.find('Modal').props().visible).toBe(false);
    });
    it('should select image', () => {
      const onChange = jest.fn();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaSelector value={1} onChange={onChange} />
          </Provider>,
        );
      });
      const selectButton = wrapper.find('Button').at(0);
      expect(selectButton.text()).toBe(' Select');
      selectButton.simulate('click');
      wrapper.find('Avatar').at(1).simulate('click');
      const okButton = wrapper.find('Button').at(1);
      expect(okButton.text()).toBe('Ok');
      okButton.simulate('click');
      expect(onChange).toHaveBeenCalledWith(2);
    });
    it('should handle Tab change and unselect image', () => {
      const onChange = jest.fn();
      process.env.REACT_APP_COMPANION_URL = 'http://127.0.0.1:3020';
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaSelector value={1} onChange={onChange} />
          </Provider>,
        );
      });
      const selectButton = wrapper.find('Button').at(0);
      expect(selectButton.text()).toBe(' Select');
      selectButton.simulate('click');
      wrapper.find('Avatar').at(0).simulate('click');
      wrapper
        .find(Radio.Group)
        .at(0)
        .props()
        .onChange({ target: { value: 'upload' } });
      wrapper.find('Modal').props().onCancel();
      expect(onChange).not.toHaveBeenCalled();
    });
    it('should handle for profile', () => {
      const onChange = jest.fn();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <MediaSelector onChange={onChange} profile={true} />
          </Provider>,
        );
      });
      const selectButton = wrapper.find('Button').at(0);
      expect(selectButton.text()).toBe(' Select');
      selectButton.simulate('click');
      wrapper
        .find(Radio.Group)
        .at(0)
        .props()
        .onChange({ target: { value: 'invalid' } });
      const okButton = wrapper.find('Button').at(1);
      expect(okButton.text()).toBe('Ok');
      okButton.simulate('click');
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });
});
