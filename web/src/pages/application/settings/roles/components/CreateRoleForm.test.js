import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import CreateApplicationRoleForm from './CreateRoleForm';
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
      id: 1,
    };
  }),
}));
import { createApplicationRole } from '../../../../../actions/roles';
import { getApplication } from '../../../../../actions/application';

jest.mock('../../../../../actions/roles', () => {
  return {
    createApplicationRole: jest.fn(),
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
};

describe('Create Role Form component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  const push = jest.fn();
  useHistory.mockReturnValue({ push });

  describe('snapshots', () => {
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
            <CreateApplicationRoleForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });

    it('should match snapshot when loading profile', () => {
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
            <CreateApplicationRoleForm />
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
            1: 'admin',
          },
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <CreateApplicationRoleForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('ErrorComponent').length).toBe(1);
    });

    it('should match snapshot when application is not found', () => {
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
            <CreateApplicationRoleForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });

    it('should match snapshot when form is rendered', () => {
      store = mockStore({
        ...state,
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <CreateApplicationRoleForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('form').length).toBe(1);
    });
  });
  // test form submission
  describe('functionality', () => {
    it('should call createApplicationRole when form is submitted', (done) => {
      store = mockStore({
        ...state,
      });
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <Router>
              <CreateApplicationRoleForm />
            </Router>
          </Provider>,
        );
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
        expect(createApplicationRole).toHaveBeenCalledWith(1, {
          name: 'Test Role 1',
          slug: 'test-slug',
          description: 'Test Role 1 Description',
          application_name: 'Test Application 1',
        });
        expect(push).toHaveBeenCalledWith('/applications/1/settings/roles/');
        done();
      });
    });
  });
});
