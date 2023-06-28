import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { act } from 'react-dom/test-utils';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import EditForm from './EditRole';
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
      roleID: 1,
    };
  }),
}));
import { updateApplicationRole, getApplicationRoleByID } from '../../../../../actions/roles';
import { getApplication } from '../../../../../actions/application';

jest.mock('../../../../../actions/roles', () => {
  return {
    updateApplicationRole: jest.fn(),
    getApplicationRoleByID: jest.fn(),
  };
});

jest.mock('../../../../../actions/application', () => {
  return {
    getApplication: jest.fn(),
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

  roles: {
    application: {
      1: {
        1: {
          id: 1,
          name: 'Test Role 1',
          description: 'Test Role 1 Description',
        },
      },
    },
    loading: false,
  },
};

describe('Edit Role Form component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  const push = jest.fn();
  useHistory.mockReturnValue({ push });
  // snapshot test
  describe('snapshots', () => {
    it('should match snapshot when loading roles', () => {
      store = mockStore({
        ...state,
        roles: {
          ...state.roles,
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });
    it('should match snapshot when loading application', () => {
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
            <EditForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });
    it('should match snapshot when loading profile role', () => {
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
            <EditForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });
    it('should match snapshot when profile role is not owner', () => {
      store = mockStore({
        ...state,
        profile: {
          ...state.profile,
          roles: {
            1: 'admin',
          },
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('ErrorComponent').length).toBe(1);
    });
    it('should match snapshot when profile role is owner', () => {
      store = mockStore({
        ...state,
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('form').length).toBe(1);
    });
    // application not found
    it('should match snapshot when application not found', () => {
      store = mockStore({
        ...state,
        applications: {
          ...state.applications,
          details: {},
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  // test form submission
  describe('functionality', () => {
    it('should call updateApplicationRole on submit', (done) => {
      store = mockStore({
        ...state,
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <EditForm />
          </Router>
        </Provider>,
      );
      act(() => {
        tree
          .find('input')
          .at(1)
          .simulate('change', {
            target: { value: 'Test Role 1' },
          });
        tree
          .find('input')
          .at(2)
          .simulate('change', {
            target: { value: 'test-slug' },
          });
        tree
          .find('TextArea')
          .at(0)
          .simulate('change', {
            target: { value: 'Test Role 1 Description' },
          });
        tree.find('form').simulate('submit');
        tree.update();
      });
      setTimeout(() => {
        expect(updateApplicationRole).toHaveBeenCalledWith(1, 1, {
          name: 'Test Role 1',
          slug: 'test-slug',
          description: 'Test Role 1 Description',
          application_name: 'Test Application 1',
        });
        done();
      });
    });
  });
});
