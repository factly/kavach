import React from 'react';
import { useHistory } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import OrganisationSelector from './OrganisationSelector';
import * as actions from '../../actions/organisations';
import { Select } from 'antd';

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

jest.mock('../../actions/organisations', () => ({
  setSelectedOrganisation: jest.fn(),
}));

describe('OrganisationSelector component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    organisations: {
      ids: [1],
      details: {
        1: { id: 1, title: 'title', description: 'description', permission: { role: 'member' } },
      },
      loading: false,
      selected: 1,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component with empty data', () => {
      const tree = mount(
        <Provider store={store}>
          <OrganisationSelector />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      const tree = mount(
        <Provider store={store}>
          <OrganisationSelector />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    it('should call setSelectedOrganisation', (done) => {
      actions.setSelectedOrganisation.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });

      wrapper = mount(
        <Provider store={store}>
          <OrganisationSelector />
        </Provider>,
      );

      wrapper.find(Select).props().onChange({ space: 1 });
      wrapper.update();

      expect(actions.setSelectedOrganisation).toHaveBeenCalledWith({ space: 1 });
      done();
    });
  });
});
