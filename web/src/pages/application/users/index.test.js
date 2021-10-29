import React from 'react';
import { BrowserRouter as Router, useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../../matchMedia.mock';
import { addApplicationUser } from '../../../actions/applicationUsers';
import User from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../../actions/applicationUsers', () => ({
  addApplicationUser: jest.fn(),
  getApplicationUsers: jest.fn(),
}));

describe('Application User component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
    applicationUsers: {
      details: {
        1: [{ id: 1, email: 'user@gmail.com' }],
      },
      loading: false,
    },
    organisations: {
      ids: [1],
      details: {
        1: { id: 1, name: 'organisation', applications: [{ id: 1, name: 'Application1' }] },
      },
      loading: false,
      selected: 1,
    },
    users: {
      ids: [1],
      details: {
        1: { id: 1, name: 'name', email: 'user@gmail.com', permission: { role: 'member' } },
      },
      organisations: {
        1: [1],
      },
      loading: false,
    },
    applications: {
      req: [
        {
          data: [1, 2],
          query: {
            page: 1,
            limit: 5,
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
          users: [{ id: 1, email: 'user@gmail.com' }],
        },
      },
      loading: false,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <Router>
            <User />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should call addApplicationUser action', (done) => {
      addApplicationUser.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <User id={1} />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Selector')
          .at(0)
          .props()
          .onChange({ target: { value: 1 } });
        const submitButtom = wrapper.find('Button').at(0);
        expect(submitButtom.text()).toBe('Add user');
        submitButtom.simulate('submit');
      });
      setTimeout(() => {
        expect(addApplicationUser).toHaveBeenCalledWith({
          user_id: 1,
          application_id: 1,
        });
        expect(push).toHaveBeenCalledWith('/applications/1/edit');
        done();
      });
    });
  });
});
