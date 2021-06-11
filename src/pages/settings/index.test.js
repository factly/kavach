import React from 'react';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import OrganisationCreate from './index';
import {
  getOrganisation,
  updateOrganisation,
  deleteOrganisation,
} from '../../actions/organisations';

jest.mock('../../actions/organisations', () => ({
  getOrganisation: jest.fn(),
  updateOrganisation: jest.fn(),
  deleteOrganisation: jest.fn(),
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

describe('Organisations index component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      organisations: {
        ids: [1],
        details: { 1: { id: 1, title: 'title', slug: 'title', description: 'description' } },
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
      expect(getOrganisation).toHaveBeenCalledWith(1);

      const submitButtom = wrapper.find('Button').at(0);
      submitButtom.simulate('submit');

      setTimeout(() => {
        expect(updateOrganisation).toHaveBeenCalledTimes(1);
        expect(updateOrganisation).toHaveBeenCalledWith({
          id: 1,
          title: 'title',
          slug: 'title',
          description: 'description',
        });
        done();
      });
    });
    it('should submit form with updated data', (done) => {
      updateOrganisation.mockClear();
      act(() => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .simulate('change', { target: { value: 'new title' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'new description' } });

        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(updateOrganisation).toHaveBeenCalledTimes(1);
        expect(updateOrganisation).toHaveBeenCalledWith({
          id: 1,
          title: 'new title',
          slug: 'new-title',
          description: 'new description',
        });
        done();
      });
    });
    it('should call deleteOrganisation', (done) => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      const deleteButtom = wrapper.find('Button').at(1);
      deleteButtom.simulate('click');
      const modal = wrapper.find('Modal');
      expect(modal.props().visible).toBe(true);
      modal
        .find('FormItem')
        .at(0)
        .find('Input')
        .simulate('change',{ target: { value: 'title'}});
      modal
        .find('Button')
        .at(1)
        .simulate('click'); 

      wrapper.update();

      setTimeout(() => {
        expect(deleteOrganisation).toHaveBeenCalledTimes(1);
        expect(deleteOrganisation).toHaveBeenCalledWith(1);
        expect(window.location.reload).toHaveBeenCalled();
        done();
      });
    });
    it('should call deleteOrganisation with incorrect organisation name', (done) => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      const deleteButtom = wrapper.find('Button').at(1);
      deleteButtom.simulate('click');
      const modal = wrapper.find('Modal');
      expect(modal.props().visible).toBe(true);
      modal
        .find('FormItem')
        .at(0)
        .find('Input')
        .simulate('change',{ target: { value: 'abc'}});
      modal
        .find('Button')
        .at(1)
        .simulate('click'); 
      wrapper.update();

      setTimeout(() => {
        expect(modal.props().visible).toBe(true);
        done();
      });
    });
    it('should handle cancel for modal', () => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      const deleteButtom = wrapper.find('Button').at(1);
      deleteButtom.simulate('click');
      let modal = wrapper.find('Modal');
      expect(modal.props().visible).toBe(true);
      modal
        .find('FormItem')
        .at(0)
        .find('Input')
        .simulate('change',{ target: { value: 'title'}});
      expect(modal.find('Button').at(0).simulate('click').text()).toBe('Cancel');  
      modal
        .find('Button')
        .at(0)
        .simulate('click'); 

      wrapper.update();
      expect(modal.props().visible).toBe(true);
    });
  });
});
