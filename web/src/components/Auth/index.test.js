import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import '../../matchMedia.mock';
import Auth from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

global.fetch = jest.fn();

let state = {
  settings: {
    title: 'Kavach',
  },
};
describe('Auth component', () => {
  let store;
  describe('snapshot component', () => {
    beforeEach(() => {
      store = mockStore(state);
    });
    it('should render the component', () => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = '?flow=8060d57f-5c69-402f-9ecd-073e283f632a';
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.reject({}),
        }),
      );
      let component;
      act(() => {
        component = mount(
          <Provider store={store}>
            <Router>
              <Auth />
            </Router>
          </Provider>,
        );
      });
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      act(() => {
        wrapper.unmount();
      });
    });
    it('should fetch data', async (done) => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = '?flow=8060d57f-5c69-402f-9ecd-073e283f632a';
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              expires_at: '2021-03-04T07:15:55.052524Z',
              id: '8060d57f-5c69-402f-9ecd-073e283f632a',
              identity: {
                id: '74ae7ba9-312e-4efe-85e7-61ab4bcd00d4',
                schema_id: 'default',
                schema_url: '',
                traits: {
                  email: 'mona@gmail.com',
                },
              },
              issued_at: '2021-03-04T06:15:55.052524Z',
              messages: null,
              methods: {
                oidc: {},
                password: {
                  config: {
                    action:
                      'http://127.0.0.1:4455/.ory/kratos/public/self-service/' +
                      'login' +
                      '/flows?id=' +
                      '8060d57f-5c69-402f-9ecd-073e283f632a',
                    method: 'POST',
                    fields: [
                      { name: 'password', type: 'password', required: true },
                      {
                        name: 'csrf_token',
                        required: true,
                        type: 'hidden',
                        value:
                          'hEfSSfeFIGFe3Nf7t6a/QqBVJa8RrHFnMLvRMOQrNioSPn8bOsYEoRU++s2XzWbNYeru/3rcr+ExpCGVcZP8pQ==',
                      },
                    ],
                  },
                  method: 'password',
                },
                profile: {},
                request_url: 'http://127.0.0.1:4455/self-service/login/',
                state: 'show_form',
                type: 'browser',
              },
            }),
        }),
      );
      store = mockStore(state);
      await act(async () => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Auth flow={'login'} />
            </Router>
          </Provider>,
        );
      });
      await act(async () => {
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/login/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
            {
              credentials: 'include',
            },
          ],
        ]);
        done();
      }, 0);
    });
    it('should submit with login credentials ', async (done) => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = '?flow=8060d57f-5c69-402f-9ecd-073e283f632a';
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              expires_at: '2021-03-04T07:15:55.052524Z',
              id: '8060d57f-5c69-402f-9ecd-073e283f632a',
              identity: {
                id: '74ae7ba9-312e-4efe-85e7-61ab4bcd00d4',
                schema_id: 'default',
                schema_url: '',
                traits: {
                  email: 'test@gmail.com',
                },
              },
              issued_at: '2021-03-04T06:15:55.052524Z',
              messages: null,
              update_successful: true,
              methods: {
                oidc: {},
                password: {
                  config: {
                    action:
                      'http://127.0.0.1:4455/.ory/kratos/public/self-service/' +
                      'login' +
                      '/flows?id=' +
                      '8060d57f-5c69-402f-9ecd-073e283f632a',
                    method: 'POST',
                    fields: [
                      { name: 'identifier', type: 'email', required: true },
                      { name: 'password', type: 'password', required: true },
                      {
                        name: 'csrf_token',
                        required: true,
                        type: 'hidden',
                        value:
                          'hEfSSfeFIGFe3Nf7t6a/QqBVJa8RrHFnMLvRMOQrNioSPn8bOsYEoRU++s2XzWbNYeru/3rcr+ExpCGVcZP8pQ==',
                      },
                    ],
                  },
                  method: 'password',
                },
                profile: {},
                request_url: 'http://127.0.0.1:4455/self-service/login',
                state: 'show_form',
                type: 'browser',
              },
            }),
        }),
      );
      store = mockStore(state);
      await act(async () => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Auth flow={'login'} />
            </Router>
          </Provider>,
        );
      });
      await act(async () => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .props()
          .onChange({ target: { value: 'test@gmail.com' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Password')
          .props()
          .onChange({ target: { value: '$User123#test' } });

        const updateButton = wrapper.find('Button');
        expect(updateButton.text()).toBe('Submit');
        updateButton.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/login/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
            {
              credentials: 'include',
            },
          ],
        ]);
        done();
      }, 0);
    });
    it('should handle with invalid login credentials ', async (done) => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = '?flow=8060d57f-5c69-402f-9ecd-073e283f632a';
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              expires_at: '2021-03-04T07:15:55.052524Z',
              id: '8060d57f-5c69-402f-9ecd-073e283f632a',
              identity: {
                id: '74ae7ba9-312e-4efe-85e7-61ab4bcd00d4',
                schema_id: 'default',
                schema_url: '',
                traits: {
                  email: 'test@gmail.com',
                },
              },
              issued_at: '2021-03-04T06:15:55.052524Z',
              messages: null,
              update_successful: true,
              methods: {
                oidc: {},
                password: {
                  config: {
                    messages: [
                      {
                        text: 'Invalid password',
                      },
                    ],
                    action:
                      'http://127.0.0.1:4455/.ory/kratos/public/self-service/' +
                      'login' +
                      '/flows?id=' +
                      '8060d57f-5c69-402f-9ecd-073e283f632a',
                    method: 'POST',
                    fields: [
                      { name: 'identifier', type: 'email', required: true },
                      {
                        name: 'password',
                        type: 'password',
                        required: true,
                        messages: [{ text: 'Invalid password' }],
                      },
                      {
                        name: 'csrf_token',
                        required: true,
                        type: 'hidden',
                        value:
                          'hEfSSfeFIGFe3Nf7t6a/QqBVJa8RrHFnMLvRMOQrNioSPn8bOsYEoRU++s2XzWbNYeru/3rcr+ExpCGVcZP8pQ==',
                      },
                    ],
                  },
                  method: 'password',
                },
                profile: {},
                request_url: 'http://127.0.0.1:4455/self-service/login',
                state: 'show_form',
                type: 'browser',
              },
            }),
        }),
      );
      store = mockStore(state);
      await act(async () => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Auth flow={'login'} />
            </Router>
          </Provider>,
        );
      });
      await act(async () => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .props()
          .onChange({ target: { value: 'test@gmail.com' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Password')
          .props()
          .onChange({ target: { value: '$User#test' } });

        const updateButton = wrapper.find('Button');
        expect(updateButton.text()).toBe('Submit');
        updateButton.simulate('submit');
        wrapper.update();
      });
      expect(wrapper.find('Alert').props().message).toBe('Invalid password');
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/login/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
            {
              credentials: 'include',
            },
          ],
        ]);
        done();
      }, 0);
    });
    it('should fetch data throws error', async (done) => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = '?flow=8060d57f-5c69-402f-9ecd-073e283f632a';
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 301,
          json: () => Promise.reject({}),
        }),
      );
      store = mockStore(state);
      await act(async () => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Auth flow={'login'} />
            </Router>
          </Provider>,
        );
      });
      await act(async () => {
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/login/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
            {
              credentials: 'include',
            },
          ],
        ]);
        expect(window.location.href).toBe(
          process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/login/browser',
        );
        done();
      }, 0);
    });
    it('should handle flow object not found', async (done) => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = '?return_to=return';
      store = mockStore(state);
      await act(async () => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Auth flow={'login'} />
            </Router>
          </Provider>,
        );
      });
      await act(async () => {
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/login/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
            {
              credentials: 'include',
            },
          ],
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/login/flows?id=' + undefined,
            {
              credentials: 'include',
            },
          ],
        ]);
        expect(window.location.href).toBe(
          process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/login/browser?return_to=return',
        );
        done();
      }, 0);
    });
    it('should handle password mismatch during registration', async (done) => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = '?flow=8060d57f-5c69-402f-9ecd-073e283f632a';
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              expires_at: '2021-03-04T07:15:55.052524Z',
              id: '8060d57f-5c69-402f-9ecd-073e283f632a',
              identity: {
                id: '74ae7ba9-312e-4efe-85e7-61ab4bcd00d4',
                schema_id: 'default',
                schema_url: '',
                traits: {
                  email: 'test@gmail.com',
                },
              },
              issued_at: '2021-03-04T06:15:55.052524Z',
              messages: null,
              update_successful: true,
              methods: {
                oidc: {},
                password: {
                  config: {
                    action:
                      'http://127.0.0.1:4455/.ory/kratos/public/self-service/' +
                      'registration' +
                      '/flows?id=' +
                      '8060d57f-5c69-402f-9ecd-073e283f632a',
                    method: 'POST',
                    fields: [
                      { name: 'identifier', type: 'email', required: true },
                      { name: 'password', type: 'password', required: true },
                      {
                        name: 'csrf_token',
                        required: true,
                        type: 'hidden',
                        value:
                          'hEfSSfeFIGFe3Nf7t6a/QqBVJa8RrHFnMLvRMOQrNioSPn8bOsYEoRU++s2XzWbNYeru/3rcr+ExpCGVcZP8pQ==',
                      },
                    ],
                  },
                  method: 'password',
                },
                profile: {},
                request_url: 'http://127.0.0.1:4455/self-service/registration',
                state: 'show_form',
                type: 'browser',
              },
            }),
        }),
      );
      store = mockStore(state);
      await act(async () => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Auth flow={'registration'} />
            </Router>
          </Provider>,
        );
      });
      await act(async () => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .props()
          .onChange({ target: { value: 'test@gmail.com' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Password')
          .props()
          .onChange({ target: { value: '$User123#test' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Input')
          .props()
          .onChange({ target: { value: '$Us123#test' } });

        const updateButton = wrapper.find('Button');
        expect(updateButton.text()).toBe('Submit');
        updateButton.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/registration/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
            {
              credentials: 'include',
            },
          ],
        ]);
        done();
      }, 0);
    });
    it('should handle successfull registration', async (done) => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = '?flow=8060d57f-5c69-402f-9ecd-073e283f632a';
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              expires_at: '2021-03-04T07:15:55.052524Z',
              id: '8060d57f-5c69-402f-9ecd-073e283f632a',
              identity: {
                id: '74ae7ba9-312e-4efe-85e7-61ab4bcd00d4',
                schema_id: 'default',
                schema_url: '',
                traits: {
                  email: 'test@gmail.com',
                },
              },
              issued_at: '2021-03-04T06:15:55.052524Z',
              messages: null,
              update_successful: true,
              methods: {
                oidc: {},
                password: {
                  config: {
                    action:
                      'http://127.0.0.1:4455/.ory/kratos/public/self-service/' +
                      'registration' +
                      '/flows?id=' +
                      '8060d57f-5c69-402f-9ecd-073e283f632a',
                    method: 'POST',
                    fields: [
                      { name: 'identifier', type: 'email', required: true },
                      { name: 'password', type: 'password', required: true },
                      {
                        name: 'csrf_token',
                        required: true,
                        type: 'hidden',
                        value:
                          'hEfSSfeFIGFe3Nf7t6a/QqBVJa8RrHFnMLvRMOQrNioSPn8bOsYEoRU++s2XzWbNYeru/3rcr+ExpCGVcZP8pQ==',
                      },
                    ],
                  },
                  method: 'password',
                },
                profile: {},
                request_url: 'http://127.0.0.1:4455/self-service/registration',
                state: 'show_form',
                type: 'browser',
              },
            }),
        }),
      );
      store = mockStore(state);
      await act(async () => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <Auth flow={'registration'} />
            </Router>
          </Provider>,
        );
      });
      await act(async () => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Input')
          .props()
          .onChange({ target: { value: 'test@gmail.com' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Password')
          .props()
          .onChange({ target: { value: '$User123#test' } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('Input')
          .props()
          .onChange({ target: { value: '$User123#test' } });

        const updateButton = wrapper.find('Button');
        expect(updateButton.text()).toBe('Submit');
        updateButton.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/registration/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
            {
              credentials: 'include',
            },
          ],
        ]);
        done();
      }, 0);
    });
  });
});
