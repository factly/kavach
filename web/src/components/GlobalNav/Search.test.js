import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import { mount } from 'enzyme';
import Search from './Search';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Account Menu component', () => {
  it('should render the component', () => {
    let store = mockStore({});
    let component = mount(
      <Provider store={store}>
        <Search />
      </Provider>,
    );
    expect(component).toMatchSnapshot();
  });
  it('should call onSearch', () => {
    let store = mockStore({});
    let component = mount(
      <Provider store={store}>
        <Search />
      </Provider>,
    );
    component.find('input').simulate('change', { target: { value: 'test' } });
    expect(component).toMatchSnapshot();
  });

  it('should call onSearch with empty string', () => {
    let store = mockStore({});
    let component = mount(
      <Provider store={store}>
        <Search />
      </Provider>,
    );
    component.find('input').simulate('change', { target: { value: '' } });
    expect(component).toMatchSnapshot();
  });

  it('should call Select with enter', () => {
    let store = mockStore({});
    let component = mount(
      <Provider store={store}>
        <Search />
      </Provider>,
    );
    component.find('input').simulate('change', { target: { value: 'test' } });
    component.find('input').simulate('keyDown', { keyCode: 13 });
    expect(component).toMatchSnapshot();
  });
});
