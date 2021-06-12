import React from 'react';
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount, shallow } from 'enzyme';

import '../../matchMedia.mock';
import Sidebar from './Sidebar';
import * as actions from '../../actions/settings';
import { Layout } from 'antd';

const { Sider } = Layout;

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

jest.mock('../../actions/settings', () => ({
  toggleSider: jest.fn(),
}));

describe('Sidebar component', () => {
  let store;
  let mockedDispatch;
  let state = {
    settings: {
      navTheme: 'dark',
      title: 'Dega',
      sider: {
        collapsed: true,
      },
    },
  };
  store = mockStore(() => state);
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = shallow(
        <Provider store={store}>
          <Router>
            <Sidebar />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should call toggleSider', (done) => {
      actions.toggleSider.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      store = mockStore(state);

      wrapper = mount(
        <Provider store={store}>
          <Router>
            <Sidebar />
          </Router>
        </Provider>,
      );

      wrapper.find(Sider).props().onBreakpoint();
      wrapper.update();

      expect(actions.toggleSider).toHaveBeenCalledWith();
      done();
    });
  });
});
