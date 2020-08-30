import React from 'react';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { act } from '@testing-library/react';
import { shallow, mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import OrganizationCreate from './index';
import {
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from '../../actions/organizations';

jest.mock('../../actions/organizations', () => ({
  getOrganization: jest.fn(),
  updateOrganization: jest.fn(),
  deleteOrganization: jest.fn(),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

delete window.location;
window.location = { reload: jest.fn() };

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Organizations index component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      organizations: {
        ids: [1],
        details: { 1: { id: 1, title: 'title', description: 'description' } },
        loading: false,
        selected: 1,
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
        component = shallow(
          <Provider store={store}>
            <OrganizationCreate />
          </Provider>,
        );
      });
      component.dive();
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <OrganizationCreate />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should submit form with data', (done) => {
      expect(getOrganization).toHaveBeenCalledWith(1);

      const submitButtom = wrapper.find('Button').at(0);
      submitButtom.simulate('submit');

      setTimeout(() => {
        expect(updateOrganization).toHaveBeenCalledTimes(1);
        expect(updateOrganization).toHaveBeenCalledWith({
          id: 1,
          title: 'title',
          description: 'description',
        });
        done();
      });
    });
    it('should submit form with updated data', (done) => {
      updateOrganization.mockClear();
      act(() => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'new title' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'new description' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(updateOrganization).toHaveBeenCalledTimes(1);
        expect(updateOrganization).toHaveBeenCalledWith({
          id: 1,
          title: 'new title',
          description: 'new description',
        });
        done();
      });
    });
    it('should call deleteOrganization', (done) => {
      const deleteButtom = wrapper.find('Button').at(1);
      deleteButtom.simulate('click');
      wrapper.update();

      setTimeout(() => {
        expect(deleteOrganization).toHaveBeenCalledTimes(1);
        expect(deleteOrganization).toHaveBeenCalledWith(1);
        expect(window.location.reload).toHaveBeenCalledWith(false);
        done();
      });
    });
  });
});
