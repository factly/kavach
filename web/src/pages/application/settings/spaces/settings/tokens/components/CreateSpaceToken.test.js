import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import '../../../../../../../matchMedia.mock';
import CreateSpaceToken from './CreateSpaceToken';
import { Form, Input } from 'antd';
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
import { addSpaceToken } from '../../../../../../../actions/token';
import { getSpaceByID } from '../../../../../../../actions/space';

jest.mock('../../../../../../../actions/token', () => ({
  addSpaceToken: jest.fn(),
}));
jest.mock('../../../../../../../actions/space', () => ({
  getSpaceByID: jest.fn(),
}));
const setState = jest.fn();
const useStateSpy = jest.spyOn(React, 'useState');

useStateSpy.mockImplementation((init) => [init, setState]);

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
      1: 'owner',
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

describe('Create Space Token component', () => {
  describe('snapshits', () => {
    it('should match snapshot when loading space', () => {
      state.spaces.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <CreateSpaceToken />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });
    it('should match snapshot when loading role', () => {
      state.spaces.loading = false;
      state.profile.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <CreateSpaceToken />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Skeleton').length).toBe(1);
    });
    it('should match snapshot when role is not owner', () => {
      state.spaces.loading = false;
      state.profile.loading = false;
      state.profile.roles[1] = 'member';
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <CreateSpaceToken />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('ErrorComponent').length).toBe(1);
    });
    it('should match snapshot when role is owner', () => {
      state.spaces.loading = false;
      state.profile.loading = false;
      state.profile.roles[1] = 'owner';
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <CreateSpaceToken />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('form').length).toBe(1);
    });
  });
  describe('functionality', () => {
    it('should call addSpaceToken when form is submitted', (done) => {
      state.spaces.loading = false;
      state.profile.loading = false;
      state.profile.roles[1] = 'owner';
      store = mockStore(state);
      const wrapper = mount(
        <Provider store={store}>
          <Router>
            <CreateSpaceToken />
          </Router>
        </Provider>,
      );
      act(() => {
        wrapper
          .find(Form.Item)
          .at(0)
          .find(Input)
          .simulate('change', { target: { value: 'Token Name' } });
        wrapper
          .find(Form.Item)
          .at(1)
          .find('TextArea')
          .simulate('change', { target: { value: 'New Description' } });
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Generate Token');
        submitButtom.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(addSpaceToken).toHaveBeenCalledWith(
          1,
          1,
          {
            description: 'New Description',
            name: 'Token Name',
          },
          setState,
          setState,
        );
        done();
      });
    });
  });
});
