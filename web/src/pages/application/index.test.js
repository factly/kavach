import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Application from './index';
import * as actions from '../../actions/application';
import { act } from 'react-dom/test-utils';

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

jest.mock('../../actions/application', () => ({
  getApplications: jest.fn(),
  addApplication: jest.fn(),
  addDefaultApplications: jest.fn(),
}));

describe('Application component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  describe('snapshot testing', () => {
    it('should render the component', () => {
      store = mockStore({
        applications: {
          req: [],
          details: {},
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Application />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      store = mockStore({
        applications: {
          req: [
            {
              data: [1, 2],
              query: {
                page: 1,
              },
              total: 2,
            },
          ],
          details: {
            1: {
              id: 1,
              created_at: '2020-09-09T06:49:36.566567Z',
              updated_at: '2020-09-09T06:49:36.566567Z',
              name: 'Application1',
              description: 'description',
              url: 'url1',
            },
            2: {
              id: 2,
              created_at: '2020-09-09T06:49:54.027402Z',
              updated_at: '2020-09-09T06:49:54.027402Z',
              name: 'Application2',
              description: 'description',
              url: 'url2',
            },
          },
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Application />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should add default applications', (done) => {
      mockedDispatch = jest.fn(() => Promise.resolve({}));
      useDispatch.mockReturnValue(mockedDispatch);

      store = mockStore({
        applications: {
          req: [
            {
              data: [],
            },
          ],
          details: {},
          loading: false,
        },
      });
      wrapper = mount(
        <Provider store={store}>
          <Router>
            <Application />
          </Router>
        </Provider>,
      );
      act(() => {
        const addDefaultButton = wrapper.find('Button').at(1);
        expect(addDefaultButton.text()).toBe('Add Factly Applications');
        addDefaultButton.simulate('click');
      });
      setTimeout(() => {
        expect(actions.addDefaultApplications).toHaveBeenCalled();
        done();
      }, 0);
    });
  });
});
