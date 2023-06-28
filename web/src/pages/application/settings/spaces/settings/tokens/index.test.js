import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import '../../../../../../matchMedia.mock';
import SpaceTokens from './index';
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

import { getSpaceByID } from '../../../../../../actions/space';

jest.mock('../../../../../../actions/space', () => ({
  getSpaceByID: jest.fn(),
}));

let state = {
  organisations: {
    selected: 1,
  },
  profile: {
    loading: false,
    roles: {
      1: 'owner',
    },
  },
  spaces: {
    ids: [1, 2],
    loading: false,
    details: {
      1: {
        id: 1,
        name: 'Test Space 1',
        description: 'Test Space 1 Description',
        application_id: 1,
      },
    },
  },
};

jest.mock('./components/TokenList', () => {
  return jest.fn((props) => <div id="mockTokenList" {...props} />);
});

let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });

describe('Space tokens Index component', () => {
  it('should render component when loading spaces', () => {
    state.spaces.loading = true;
    store = mockStore(state);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <SpaceTokens />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Skeleton').length).toBe(1);
  });
  it('should render component when loading roles', () => {
    state.spaces.loading = false;
    state.profile.loading = true;
    store = mockStore(state);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <SpaceTokens />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Skeleton').length).toBe(1);
  });

  it('should render component when role is not owner', () => {
    state.profile.loading = false;
    state.profile.roles = {
      1: 'user',
    };
    store = mockStore(state);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <SpaceTokens />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Button').length).toBe(1);
  });
  it('should render component when role is owner', () => {
    state.profile.loading = false;
    state.profile.roles = {
      1: 'owner',
    };
    store = mockStore(state);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <SpaceTokens />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Button').length).toBe(2);
    expect(tree.find('Button').at(1).text()).toBe(' Generate new tokens ');
  });
});
