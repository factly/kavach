import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { act } from '@testing-library/react';
import { shallow, mount } from 'enzyme';

import '../../matchMedia.mock';
import OrganisationCreate from './index';
import { addOrganisation } from '../../actions/organisations';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../actions/organisations', () => ({
  addOrganisation: jest.fn(),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

describe('Organisations index component', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  store.dispatch = jest.fn(() => ({}));

  const push = jest.fn();
  useHistory.mockReturnValue({ push });
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <OrganisationCreate />
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    store = mockStore({
      organisations: {
        ids: [1],
        details: { 1: { id: 1, name: 'organisation' } },
        loading: false,
        selected: 1,
      },
      media: {
        req: [],
        details: {},
        loading: false,
      },
    });

    let wrapper;
    beforeEach(() => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <OrganisationCreate />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should submit form with data', (done) => {
      act(() => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'title' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'description' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(addOrganisation).toHaveBeenCalledTimes(1);
        expect(addOrganisation).toHaveBeenCalledWith({
          title: 'title',
          slug: 'title',
          description: 'description',
          featured_medium_id: undefined,
        });
        expect(push).toHaveBeenCalledWith('/settings');
        done();
      });
    });
  });
});
