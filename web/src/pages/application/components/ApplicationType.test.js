import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import '../../../matchMedia.mock';
import { ApplicationType } from './ApplicationType';
import { compose } from 'redux';

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

describe('ApplicationType component', () => {
  it('should render the component', () => {
    let store = mockStore({});

    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <ApplicationType />
        </Router>
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
