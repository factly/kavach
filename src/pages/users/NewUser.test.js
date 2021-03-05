import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import NewUser from './NewUser';
import { addUser } from '../../actions/users';

jest.mock('../../actions/users', () => ({
  addUser: jest.fn(),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let store;
describe('New User create component', () => {
  beforeEach(() => {
    store = mockStore({
      organisations: {
        ids: [1],
        details: {
          1: { id: 1, title: 'title', description: 'description', permission: { role: 'owner' } },
        },
        loading: false,
        selected: 1,
      },
      users: {
        ids: [1],
        details: {
          1: {
            id: 1,
            first_name: 'first_name',
            last_name: 'last_name',
            email: 'email',
            permission: { role: 'owner' },
          },
        },
        loading: false,
      },
    });
    const mockedDispatch = jest.fn();
    mockedDispatch.mockReturnValue(Promise.resolve());
    useDispatch.mockReturnValue(mockedDispatch);
  });
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let component;
      act(() => {
        component =  mount(
          <Provider store={store}>
            <NewUser />
          </Provider>
        );
      });
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should add new user', () => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store} >
            <NewUser />
          </Provider>
        );
      });
      act(() => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target : { value : 'ABC' } } );
        wrapper
          .find('FormItem')
          .at(1)
          .find('Input')
          .simulate('change', { target : { value : 'XYZ' } } );          
        wrapper
          .find('FormItem')
          .at(2)
          .find('Input')
          .simulate('change', { target : { value : 'new@gamil.com' } } );   
        wrapper
          .find('FormItem')
          .at(3)
          .find('Select')
          .props()
          .onChange({ target : { value : 'member' }});
        const addButton = wrapper.find('Button').at(0);
        expect(addButton.text()).toBe('Add');
        addButton.simulate('submit');
      });
      wrapper.update();          
      setTimeout(() => {
        expect(addUser).toHaveBeenCalledTimes(1);
        expect(addUser).toHaveBeenCalledWith({
          first_name: 'ABC',
          last_name: 'XYZ',
          email: 'new@gamil.com',
          role: 'member'
        });
        expect(push).toHaveBeenCalledWith('/users');
      },0);
    });
  });
});