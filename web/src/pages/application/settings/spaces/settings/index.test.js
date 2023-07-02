import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../matchMedia.mock';
import SpaceSettings from '.';

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

jest.mock('../../../../../actions/space', () => ({
  getSpaceByID: jest.fn(),
}));

// space: state.spaces.details[spaceID],
// loadingSpace: state.spaces.loading,
// role: state.profile.roles[state.organisations.selected],
// loading: state.profile.loading,
let state = {
  spaces: {
    details: {
      1: {
        id: 1,
        name: 'Test Space',
        description: 'Test Space Description',
      },
    },
    loading: false,
  },
  profile: {
    roles: {
      1: 'admin',
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

describe('Space Settings component', () => {
  it('should render component when the space is loading', () => {
    state.spaces.loading = true;
    store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <SpaceSettings />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Skeleton')).toHaveLength(1);
  });
  it('should render component when the role is loading', () => {
    state.spaces.loading = false;
    state.profile.loading = true;
    store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <SpaceSettings />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Skeleton')).toHaveLength(1);
  });
  it('should render component when the space is not loading and role is not loading', () => {
    state.spaces.loading = false;
    state.profile.loading = false;
    store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <SpaceSettings />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('SettingsList')).toHaveLength(1);
    expect(wrapper.find('SettingsList').props()).toEqual({
      type: 'space',
      appID: 1,
      spaceID: 1,
      role: 'admin',
    });
  });
});
