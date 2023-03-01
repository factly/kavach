import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { act } from 'react-dom/test-utils';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import ApplicationPolicies from '.';
import '../../../../matchMedia.mock';
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
      id: 1,
    };
  }),
}));

let state = {
  applications: {
    details: {
      1: {
        id: 1,
        name: 'Test Application',
        description: 'Test Description',
        policies: [1, 2],
        roleIDs: [1, 2],
      },
    },
    loading: false,
  },
  profile: {
    roles: {
      1: 'owner',
    },
    loading: false,
  },
  organisations: {
    selected: 1,
  },
};

jest.mock('./components/PolicyList', () => {
  return jest.fn((props) => <div id="PolicyList" {...props} />);
});

describe('Index page component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  const push = jest.fn();
  useHistory.mockReturnValue({ push });

  it('should match snapshot when loadingApp is true', () => {
    store = mockStore({
      ...state,
      applications: {
        ...state.applications,
        loading: true,
      },
    });
    const tree = mount(
      <Provider store={store}>
        <Router>
          <ApplicationPolicies />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Skeleton').length).toBe(1);
  });
  it('should match snapshot when loading Profile is true', () => {
    store = mockStore({
      ...state,
      profile: {
        ...state.profile,
        loading: true,
      },
    });
    const tree = mount(
      <Provider store={store}>
        <Router>
          <ApplicationPolicies />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Skeleton').length).toBe(1);
  });
  it('should match snapshot when role is not owner', () => {
    store = mockStore({
      ...state,
      profile: {
        ...state.profile,
        roles: {
          1: 'user',
        },
      },
    });
    const tree = mount(
      <Provider store={store}>
        <Router>
          <ApplicationPolicies />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Link').length).toBe(1);
  });
  it('should match snapshot when role is owner', () => {
    store = mockStore({
      ...state,
      profile: {
        ...state.profile,
        roles: {
          1: 'owner',
        },
      },
    });
    const tree = mount(
      <Provider store={store}>
        <Router>
          <ApplicationPolicies />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
    expect(tree.find('Link').length).toBe(2);
    expect(tree.find('Link').at(1).text()).toBe(' Create New Policies ');
  });
});
