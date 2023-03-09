import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import '../../../matchMedia.mock';
import {
  getOrganisation,
  updateOrganisation,
  deleteOrganisation,
} from './../../../actions/organisations';
import thunk from 'redux-thunk';
import OrganisationEdit from './EditOrganisation';
import { act } from 'react-dom/test-utils';

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

jest.mock('./../../../actions/organisations', () => ({
  getOrganisation: jest.fn(),
  updateOrganisation: jest.fn(),
  deleteOrganisation: jest.fn(),
}));

jest.doMock('../../../components/MediaSelector/', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return <div>MediaSelector</div>;
    }),
  }
});
describe('Organisation Form', () => {
  let store;
  const mockedDispatch = jest.fn();
  mockedDispatch.mockReturnValue(Promise.resolve());
  useDispatch.mockReturnValue(mockedDispatch);
  store = mockStore({});
  store.dispatch = jest.fn(() => ({}));
  const push = jest.fn();
  useHistory.mockReturnValue({ push });

  describe('Snapshot tests', () => {
    const description = 'should render the component ';
    describe(description + 'when role loading is true', () => {
      test('should match snapshot when role is not admin', () => {
        store = mockStore({
          organisations: {
            details: {
              1: { id: 1, name: 'test Organisation' },
            },
            loading: true,
            selected: 1,
          },
          profile: {
            roles: {
              1: 'member',
            },
            loading: true,
          },
        });

        const component = mount(
          <Provider store={store}>
            <Router>
              <OrganisationEdit />
            </Router>
          </Provider>,
        );
        expect(component).toMatchSnapshot();
        expect(component.find('ErrorComponent').length).toBe(1);
      });
    });
    describe(description + 'when role loading is false', () => {
      describe('should match snapshot when role is admin', () => {
        test('should match snapshot when loading organisation is true', () => {
          store = mockStore({
            organisations: {
              details: {
                1: { id: 1, name: 'test Organisation' },
              },
              loading: true,
              selected: 1,
            },
            profile: {
              roles: {
                1: 'admin',
              },
              loading: false,
            },
          });

          const component = mount(
            <Provider store={store}>
              <Router>
                <OrganisationEdit />
              </Router>
            </Provider>,
          );
          expect(component).toMatchSnapshot();
          expect(component.find('Skeleton').length).toBe(0);
        });
        test('should match snapshot when loading organisation is false', () => {
          jest.doMock('../../../components/MediaSelector/index', () => {
            return jest.fn().mockImplementation(() => {
              return <div>MediaSelector</div>;
            });
          });
          store = mockStore({
            organisations: {
              details: {
                1: { id: 1, name: 'test Organisation' },
              },
              loading: false,
              selected: 1,
            },
            profile: {
              roles: {
                1: 'admin',
              },
              loading: false,
            },
            media: {
              req: [],
              details: {
                1: { id: 1, media_type: 'image', media_url: 'http://example.com' },
              },
            },
          });

          const component = mount(
            <Provider store={store}>
              <Router>
                <OrganisationEdit />
              </Router>
            </Provider>,
          );
          expect(component).toMatchSnapshot();
        });
      });
    });
  });

  describe('Function tests', () => {


    jest.mock('./../../../actions/organisations', () => ({
      getOrganisation: jest.fn(),
      updateOrganisation: jest.fn(),
      deleteOrganisation: jest.fn(),
    }));
    it('should call updateOrganisation', async (done) => {
      store = mockStore({
        organisations: {
          details: {
            1: { id: 1, title: 'test Organisation' },
          },
          loading: false,
          selected: 1,
        },
        profile: {
          roles: {
            1: 'admin',
          },
          loading: false,
        },
        media: {
          req: [],
          details: {
            1: { id: 1, media_type: 'image', media_url: 'http://example.com' },
          },
        },
      });

      let component = mount(
        <Provider store={store}>
          <Router>
            <OrganisationEdit />
          </Router>
        </Provider>,
      );
      act(() => {

        component
          .find('input')
          .at(0)
          .simulate('change', { target: { value: 'test Organisation' } });
        component
          .find('input')
          .at(1)
          .simulate('change', { target: { value: 'slug' } });
        component.find('TextArea').at(0).simulate('change', { target: { value: 'Description' } });
        const btn = component.find({ htmlType: 'submit' });
        expect(btn.text()).toBe('Save');
        component.find('form').simulate('submit');
      });

      setTimeout(() => {
        expect(updateOrganisation).toHaveBeenCalledWith({ id: 1, title: 'test Organisation', slug: 'slug', description: 'Description', featured_medium_id: undefined })
        expect(push).toHaveBeenCalledWith('/organisation')
        done();
      });
    });
    test('should call deleteOrganisation', async (done) => {
      store = mockStore({
        organisations: {
          details: {
            1: { id: 1, title: 'test Organisation' },
          },
          loading: false,
          selected: 1,
        },
        profile: {
          roles: {
            1: 'admin',
          },
          loading: false,
        },
        media: {
          req: [],
          details: {
            1: { id: 1, media_type: 'image', media_url: 'http://example.com' },
          },
        },
      });

      let component = mount(
        <Provider store={store}>
          <Router>
            <OrganisationEdit />
          </Router>
        </Provider>,
      );
      act(async () => {
        const btn = component.find({ type: 'danger' });
        expect(btn.text()).toBe(' Delete');
        btn.simulate('click');
        await component.update();
        component
          .find('Modal')
          .find('input')
          .at(0)
          .simulate('change', { target: { value: 'test Fail' } });

        component.find('Modal').find('Button').at(1).simulate('click');
        expect(deleteOrganisation).not.toHaveBeenCalledWith(1);

        component.find('Modal').find('Button').at(0).simulate('click');
        await component.update();

        component.find({ type: 'danger' }).simulate('click');
        component
          .find('Modal')
          .find('input')
          .at(0)
          .simulate('change', { target: { value: 'test Organisation' } });

        component.find('Modal').find('Button').at(1).simulate('click');
      });

      component.update();

      setTimeout(() => {
        expect(deleteOrganisation).toHaveBeenCalledWith(1);
        expect(push).toHaveBeenCalledWith('/organisation');
        done();
      });
    });
  });
});

// test.todo("find bug in test where test doesn't call updateOrganisation");
