import React from 'react';
import { BrowserRouter as Router, useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import { Button, Popconfirm, Table } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import CreateTokenForm from '../settings/token/components/CreateTokenForm';
import { deleteApplicationToken } from '../../../actions/token';
import '../../../matchMedia.mock';
import ApplicationDetail from './ApplicationDetail';
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
jest.mock('../../../actions/token', () => ({
  deleteApplicationToken: jest.fn(),
}));

jest.mock('../settings/token/components/CreateTokenForm', () => {
  return jest.fn((props) => <div id="mockedCreateTokenForm" {...props} />);
});

describe('Application Detail component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
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
          tokens: [{ id: '1', name: 'token 1' }],
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
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component when modal not visible', () => {
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationDetail
              data={{
                id: 1,
                created_at: '2020-09-09T06:49:36.566567Z',
                updated_at: '2020-09-09T06:49:36.566567Z',
                name: 'Application1',
                description: 'description',
                url: 'url1',
                tokens: [{ id: '1', name: 'token 1' }],
              }}
              visible={false}
              setVisible={jest.fn()}
              setTokenFlag={jest.fn()}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Modal').props().visible).toBe(false);
    });
    it('should render the component when modal visible', () => {
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationDetail
              data={{
                id: 1,
                created_at: '2020-09-09T06:49:36.566567Z',
                updated_at: '2020-09-09T06:49:36.566567Z',
                name: 'Application1',
                description: 'description',
                url: 'url1',
                tokens: [{ id: '1', name: 'token 1' }],
              }}
              visible={true}
              setVisible={jest.fn()}
              setTokenFlag={jest.fn()}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find('Modal').props().visible).toBe(true);
      expect(tree.find(Table).props().dataSource).toHaveLength(1);
      expect(tree.find(Table).props().dataSource).toEqual([{ id: '1', name: 'token 1' }]);
      expect(tree.find(CreateTokenForm).props().appID).toBe(1);
    });
    it('should render the component with no data', () => {
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ApplicationDetail visible={true} setVisible={jest.fn()} setTokenFlag={jest.fn()} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(tree.find(Table).props().dataSource).toHaveLength(0);
      expect(tree.find(CreateTokenForm).props().appID).toBe(null);
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should call setVisible', () => {
      const mockFn = jest.fn();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ApplicationDetail
                data={{
                  id: 1,
                  created_at: '2020-09-09T06:49:36.566567Z',
                  updated_at: '2020-09-09T06:49:36.566567Z',
                  name: 'Application1',
                  description: 'description',
                  url: 'url1',
                  tokens: [{ id: 1, name: 'token 1' }],
                }}
                visible={false}
                setTokenFlag={mockFn}
                setVisible={mockFn}
              />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(1);
      expect(button.text()).toEqual('New api key');
      button.simulate('click');
      expect(mockFn).toHaveBeenCalled();
      expect(mockFn).toHaveBeenCalledWith(true);
    });
    it('should handle close in modal', () => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ApplicationDetail
                data={{
                  id: 1,
                  created_at: '2020-09-09T06:49:36.566567Z',
                  updated_at: '2020-09-09T06:49:36.566567Z',
                  name: 'Application1',
                  description: 'description',
                  url: 'url1',
                  tokens: [{ id: 1, name: 'token 1' }],
                }}
                visible={true}
                setVisible={jest.fn()}
                setTokenFlag={jest.fn()}
              />
            </Router>
          </Provider>,
        );
      });

      expect(wrapper.find('Modal').props().visible).toBe(true);
      act(() => {
        wrapper.find('Modal').props().onOk();
        wrapper.find('Modal').find(CloseOutlined).simulate('click');
      });
      wrapper.update();
    });
    it('should delete token', () => {
      const go = jest.fn();
      useHistory.mockReturnValueOnce({ go });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ApplicationDetail
                data={{
                  id: 1,
                  created_at: '2020-09-09T06:49:36.566567Z',
                  updated_at: '2020-09-09T06:49:36.566567Z',
                  name: 'Application1',
                  description: 'description',
                  url: 'url1',
                  tokens: [{ id: 1, name: 'token 1' }],
                }}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const button = wrapper.find(Button).at(0);
        expect(button.text()).toEqual('Revoke');
        button.simulate('click');
      });
      wrapper.update();
      act(() => {
        const popconfirm = wrapper.find(Popconfirm);
        popconfirm
          .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
          .simulate('click');
      });
      expect(deleteApplicationToken).toHaveBeenCalled();
      expect(deleteApplicationToken).toHaveBeenCalledWith(1, 1);
    });
  });
});
