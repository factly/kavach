import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../matchMedia.mock'
import Spaces from './index';
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
jest.mock('./components/SpaceList', () => {
  return jest.fn((props) => <div id="mockSpaceList" {...props} />);
});

jest.mock('../../../../actions/application', () => ({
  getApplication: jest.fn(),
}));

let state = {
  profile: {
    loading: false,
    roles: {
      1: 'owner',
    },
  },
  applications: {
    details: {
      1: {
        id: 1, name: 'Test App', description: 'Test App Description'
      },
    },
    loading: false,
  },
  organisations: {
    selected: 1,
  },
};

let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
useHistory.mockReturnValue({ push });

describe('Spaces Component', () => {
  it('should render component when role loading is true', () => {
    state.profile.loading = true;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <Spaces />
        </Router>
      </Provider>,
    );
    expect(wrapper.find('Skeleton').length).toBe(1);
  })
  it('should render component when application loading is true', () => {
    state.profile.loading = false;
    state.applications.loading = true;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <Spaces />
        </Router>
      </Provider>,
    );
    expect(wrapper.find('Skeleton').length).toBe(1);
  })

  it('should render component when role is not owner', () => {
    state.profile.loading = false;
    state.applications.loading = false;
    state.profile.roles[1] = 'editor';
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <Spaces />
        </Router>
      </Provider>,
    );
    expect(wrapper.find('Link').length).toBe(1);
  })
  it('should render component when role is owner', () => {
    state.profile.roles[1] = 'owner';
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <Spaces />
        </Router>
      </Provider>,
    );
    expect(wrapper.find('Link').length).toBe(2);
  })
})
