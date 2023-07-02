import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import ApplicationRoles from './index';
import ApplicationRoleList from './components/RoleList';
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
import { getApplication } from '../../../../actions/application';
import { getApplicationRoles } from '../../../../actions/roles';

jest.mock('../../../../actions/application', () => {
  return {
    getApplication: jest.fn(),
  };
});

jest.mock('../../../../actions/roles', () => {
  return {
    getApplicationRoles: jest.fn(),
  };
});

let state = {
  organisations: {
    selected: 1,
  },
  applications: {
    details: {
      1: {
        id: 1,
        name: 'Test Application 1',
        description: 'Test Application 1 Description',
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
};

jest.mock('./components/RoleList', () => {
  return jest.fn((props) => <div id="mockedComponent" {...props} />);
});

describe('Application Roles index component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  const push = jest.fn();
  useHistory.mockReturnValue({ push });

  it('should render the component when loading app is true', () => {
    state.applications.loading = true;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <ApplicationRoles />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Skeleton')).toHaveLength(0);
  });
  it('should render the component when loading profile is true', () => {
    state.applications.loading = false;
    state.profile.loading = true;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <ApplicationRoles />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Skeleton')).toHaveLength(0);
  });
  it('should render the component when loading profile and role is true', () => {
    state.applications.loading = true;
    state.profile.loading = true;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <ApplicationRoles />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Skeleton')).toHaveLength(1);
  });
  it('should render the component when role is not owner', () => {
    state.applications.loading = false;
    state.profile.loading = false;
    state.profile.roles[1] = 'admin';
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <ApplicationRoles />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Link')).toHaveLength(1);
    expect(wrapper.find(ApplicationRoleList)).toHaveLength(1);
    expect(wrapper.find(ApplicationRoleList).props()).toHaveProperty('role', 'admin');
  });
  it('should render the component when role is owner', () => {
    state.applications.loading = false;
    state.profile.loading = false;
    state.profile.roles[1] = 'owner';
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <ApplicationRoles />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Link')).toHaveLength(2);
    expect(wrapper.find(ApplicationRoleList)).toHaveLength(1);
    expect(wrapper.find(ApplicationRoleList).props()).toHaveProperty('role', 'owner');
  });
});
