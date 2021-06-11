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
});
