import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { useHistory } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import { Form, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { getApplication } from '../../../../../actions/application';
import { addApplicationToken } from '../../../../../actions/token';
import '../../../../../matchMedia.mock';
import CreateTokenForm from './CreateTokenForm';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn(() => ({
    id: 1,
  })),
}));

const setState = jest.fn();
const useStateSpy = jest.spyOn(React, 'useState');

useStateSpy.mockImplementation((init) => [init, setState]);

jest.mock('../../../../../actions/application', () => ({
  getApplication: jest.fn(),
}));

jest.mock('../../../../../actions/token', () => ({
  addApplicationToken: jest.fn(),
}));

let store;
let mockedDispatch;

let state = {
  organisations: {
    selected: 1,
  },
  applications: {
    details: {
      1: {
        id: 1,
        name: 'Test Application',
        description: 'Test Description',
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

describe('Create Token form component', () => {
  store = mockStore(state);
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <CreateTokenForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find("form").length).toBe(1);
    });
    it("should render skeleton when loading app", () => {
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
            <CreateTokenForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find("form").length).toBe(0);
      expect(tree.find("Skeleton").length).toBe(1);
    });
    it("should render skeleton when loading profile", () => {
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
            <CreateTokenForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find("form").length).toBe(0);
      expect(tree.find("Skeleton").length).toBe(1);
    });
    // render ErrorComponent when role is not owner
    it("should render error component when role is not owner", () => {
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
            <CreateTokenForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find("form").length).toBe(0);
      expect(tree.find("ErrorComponent").length).toBe(1);
    });
    // when application is not found
    it("should render error component when application is not found", () => {
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
            <CreateTokenForm />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find("form").length).toBe(1);
    });
  });
  describe('component testing', () => {
    let wrapper

    it('should not submit form with data', (done) => {
      store = mockStore(state);
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <CreateTokenForm />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        wrapper
          .find(Form.Item)
          .at(1)
          .find(Input)
          .simulate('change', { target: { value: 'Token Name' } });
        wrapper
          .find(Form.Item)
          .at(2)
          .find('TextArea')
          .simulate('change', { target: { value: 'New Description' } });
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Generate Token');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(addApplicationToken).toHaveBeenCalledWith(
          1,
          {
            application_name: "Test Application",
            name: 'Token Name',
            description: 'New Description',
          },
          setState,
          setState,
        );
        wrapper.find('Modal').props().onOk()
        expect(push).toHaveBeenCalledWith('/applications/1/settings/tokens');
        done();
      }, 0);
    });
  });
});
