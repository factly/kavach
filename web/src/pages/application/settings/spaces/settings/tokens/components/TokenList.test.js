import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../../matchMedia.mock';
import TokenList from './TokenList';
import { Popconfirm } from 'antd';
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
      spaceID: 1,
    };
  }),
}));

import { getSpaceTokens, deleteSpaceToken } from '../../../../../../../actions/token';

jest.mock('../../../../../../../actions/token', () => ({
  getSpaceTokens: jest.fn(),
  deleteSpaceToken: jest.fn(),
}));

let state = {
  spaces: {
    details: {
      1: { id: 1, name: 'Test Space', description: 'Test Space Description', tokens: [1, 2, 3] },
    },
    loading: false,
  },
  tokens: {
    space: {
      1: {
        1: {
          id: 1,
          name: 'Test Token',
          description: 'Test Token Description',
          token: 'test-token',
          space_id: 1,
        },
        2: {
          id: 1,
          name: 'Test Token',
          description: 'Test Token Description',
          token: 'test-token',
          space_id: 1,
        },
        3: {
          id: 1,
          name: 'Test Token',
          description: 'Test Token Description',
          token: 'test-token',
          space_id: 1,
        },
      },
    },
    loading: false,
  },
};
let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });
describe('Token list component', () => {
  it('should match snapshot when loading tokens', () => {
    state.tokens.loading = true;
    store = mockStore(state);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <TokenList appID={1} spaceID={1} role="owner" />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Spin').at(0).props().spinning).toBe(true);
  });
  it('should match snapshot when no tokens', () => {
    state.tokens.loading = false;
    state.spaces.details[1].tokens = [];
    state.tokens.space[1] = {};
    store = mockStore(state);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <TokenList appID={1} spaceID={1} role="owner" />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Table').at(0).props().dataSource).toEqual([]);
  });
  it('should match snapshot when tokens are present', () => {
    state.tokens.loading = false;
    state.spaces.details[1].tokens = [1, 2, 3];
    state.tokens.space[1] = {
      1: {
        id: 1,
        name: 'Test Token',
        description: 'Test Token Description',
        token: 'test-token',
        space_id: 1,
      },
      2: {
        id: 1,
        name: 'Test Token',
        description: 'Test Token Description',
        token: 'test-token',
        space_id: 1,
      },
      3: {
        id: 1,
        name: 'Test Token',
        description: 'Test Token Description',
        token: 'test-token',
        space_id: 1,
      },
    };
    store = mockStore(state);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <TokenList appID={1} spaceID={1} role="owner" />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Table').at(0).props().dataSource).toEqual([
      {
        id: 1,
        name: 'Test Token',
        description: 'Test Token Description',
        token: 'test-token',
        space_id: 1,
      },
      {
        id: 1,
        name: 'Test Token',
        description: 'Test Token Description',
        token: 'test-token',
        space_id: 1,
      },
      {
        id: 1,
        name: 'Test Token',
        description: 'Test Token Description',
        token: 'test-token',
        space_id: 1,
      },
    ]);
    expect(tree.find('Table').find('Button').at(0).props().disabled).toBe(false);
  });
  it('should match snapshot when role is not owner', () => {
    store = mockStore(state);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <TokenList appID={1} spaceID={1} role="editor" />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Table').find('Button').at(0).props().disabled).toBe(true);
  });

  it('should call deleteSpaceToken when delete button is clicked', (done) => {
    store = mockStore(state);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <TokenList appID={1} spaceID={1} role="owner" />
        </Router>
      </Provider>,
    );
    act(() => {
      expect(tree.find('Button').at(0).text()).toBe('Revoke');
      tree.find('Button').at(0).simulate('click');
      // click on delete button
      tree.find(Popconfirm).at(0).props().onConfirm();
    });
    setTimeout(() => {
      expect(deleteSpaceToken).toHaveBeenCalledWith(1, 1, 1);
      done();
    });
  });
});
