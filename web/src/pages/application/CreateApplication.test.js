import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import CreateApplication from './CreateApplication';
import * as actions from '../../actions/application';
import ApplicationCreateForm from './components/ApplicationForm';

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

jest.mock('../../actions/application', () => ({
  addApplication: jest.fn(),
}));

describe('Application Create component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    application: {
      req: [],
      details: {},
      loading: true,
    },
    media: {
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
          <CreateApplication />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call addApplication', (done) => {
      actions.addApplication.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <CreateApplication />
          </Provider>,
        );
      });
      wrapper.find(ApplicationCreateForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.addApplication).toHaveBeenCalledWith({ test: 'test' });
        expect(push).toHaveBeenCalledWith('/applications');
        done();
      }, 0);
    });
  });
});
