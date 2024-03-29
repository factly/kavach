import React from 'react';
import { useHistory } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount, shallow } from 'enzyme';

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
  useLocation: jest.fn().mockReturnValue({
    pathname: '/organisation/1',
  }),
}));

jest.mock('../../actions/organisations', () => ({
  setSelectedOrganisation: jest.fn(),
}));

describe('OrganisationSelector component', () => {
  let store;
  let mockedDispatch;

  store = mockStore({
    profile: {
      details: {
        organisations: [1, 2, 3], // replace with an array of organization IDs
      },
    },
    organisations: {
      details: {
        1: { id: 1, title: 'Organization 1', featured_medium_id: 1 },
        2: { id: 2, title: 'Organization 2', featured_medium_id: 2 },
        3: { id: 3, title: 'Organization 3', featured_medium_id: null },
      },
      selected: 1, // replace with the ID of the selected organization
    },
    media: {
      details: {
        1: { id: 1, url: { raw: 'https://example.com/image1.jpg' } },
        2: { id: 2, url: { raw: 'https://example.com/image2.jpg' } },
      },
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component with data', () => {
      const tree = mount(
        <Provider store={store}>
          <OrganisationSelector />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component without data', () => {
      store = mockStore({
        profile: {
          details: {
            organisations: [],
          },
        },
      });
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
    it('should call setSelectedOrganisation', () => {
      store = mockStore({
        profile: {
          details: {
            organisations: [1, 2, 3], // replace with an array of organization IDs
          },
        },
        organisations: {
          details: {
            1: { id: 1, title: 'Organization 1', featured_medium_id: 1 },
            2: { id: 2, title: 'Organization 2', featured_medium_id: 2 },
            3: { id: 3, title: 'Organization 3', featured_medium_id: null },
          },
          selected: 1, // replace with the ID of the selected organization
        },
        media: {
          details: {
            1: { id: 1, url: { raw: 'https://example.com/image1.jpg' } },
            2: { id: 2, url: { raw: 'https://example.com/image2.jpg' } },
          },
        },
      });
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
    });
  });
});
