import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { deleteApplicationPolicy, getApplicationPolicy } from '../../../../../actions/policy';
import PolicyList from './PolicyList';
import { Popconfirm } from 'antd';
import '../../../../../matchMedia.mock';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn(() => {
    return {
      appID: 1,
    };
  }),
}));

jest.mock('../../../../../actions/policy', () => ({
  deleteApplicationPolicy: jest.fn(),
  getApplicationPolicy: jest.fn(),
}));

let state = {
  applications: {
    details: {
      1: {
        id: 1,
        name: 'Test App',
        description: 'Test App Description',
        policyIDs: [1, 2],
      },
    },
  },
  policy: {
    application: {
      1: {
        1: { id: 1, name: 'Test Policy 1', description: 'Test Policy 1 Description' },
        2: { id: 2, name: 'Test Policy 2', description: 'Test Policy 2 Description' },
      },
    },
    loading: false,
  },
};

describe('Policy List component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  const push = jest.fn();
  useHistory.mockReturnValue({ push });

  describe('snapshot testing', () => {
    it('should match the snapshot when loading', () => {
      store = mockStore({
        ...state,
        policy: {
          ...state.policy,
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PolicyList appID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Spin').at(0).props().spinning).toBe(true);
    });
    it('should match the snapshot when role is not owner', () => {
      store = mockStore({
        ...state,
        policy: {
          ...state.policy,
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PolicyList appID={1} role="editor" />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Button').at(1).props().disabled).toBe(true);
    });
    it('should match the snapshot when policy is empty', () => {
      store = mockStore({
        ...state,
        applications: {},
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PolicyList appID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();

      expect(tree.find('Table').at(0).props().dataSource).toEqual([]);
    });
    it('should match the snapshot when policy is not empty', () => {
      store = mockStore({
        ...state,
        policy: {
          ...state.policy,
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PolicyList appID={1} role="owner" />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Table').at(0).props().dataSource).toEqual([
        { id: 1, name: 'Test Policy 1', description: 'Test Policy 1 Description' },
        { id: 2, name: 'Test Policy 2', description: 'Test Policy 2 Description' },
      ]);
    });
  });

  describe('component testing', () => {
    // should call deleteApplicationPolicy action
    it('should call deleteApplicationPolicy action', () => {
      store = mockStore({
        ...state,
        policy: {
          ...state.policy,
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PolicyList appID={1} role="owner" />
          </Router>
        </Provider>,
      );
      let btn = tree.find('Button').at(2);
      expect(btn.text()).toBe('Delete');
      btn.simulate('click');
      tree.find(Popconfirm).at(0).props().onConfirm();
      expect(deleteApplicationPolicy).toHaveBeenCalledWith(1, 1);
    });
  });
});
