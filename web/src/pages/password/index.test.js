import React from 'react';
import { Provider } from 'react-redux';
import { act } from '@testing-library/react';
import { mount, shallow } from 'enzyme';
import '../../matchMedia.mock';
import Password from './index';

global.fetch = jest.fn();

describe('password component', () => {
  describe('snapshot component', () => {
    it('should render the component', () => {
      let component;
      act(() => {
        component = shallow(<Password />);
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
                      'http://127.0.0.1:4455/.ory/kratos/public/self-service/settings/methods/password?flow=8060d57f-5c69-402f-9ecd-073e283f632a',
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
                request_url: 'http://127.0.0.1:4455/self-service/settings/browse',
                state: 'show_form',
                type: 'browser',
              },
            }),
        }),
      );
      await act(async () => {
        wrapper = mount(<Password />);
      });
      await act(async () => {
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/settings/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
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
      await act(async () => {
        wrapper = mount(<Password />);
      });
      await act(async () => {
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/settings/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
          ],
        ]);
        expect(window.location.href).toBe(
          process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/browser',
        );
        done();
      }, 0);
    });
    it('should handle flow object not found', async (done) => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = ' ';
      await act(async () => {
        wrapper = mount(<Password />);
      });
      await act(async () => {
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/settings/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
          ],
          [process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/flows?id=' + undefined],
        ]);
        expect(window.location.href).toBe(
          process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/browser',
        );
        done();
      }, 0);
    });
    it('should submit with new password', async (done) => {
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
              update_successful: true,
              methods: {
                oidc: {},
                password: {
                  config: {
                    action:
                      'http://127.0.0.1:4455/.ory/kratos/public/self-service/settings/methods/password?flow=8060d57f-5c69-402f-9ecd-073e283f632a',
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
                request_url: 'http://127.0.0.1:4455/self-service/settings/browse',
                state: 'show_form',
                type: 'browser',
              },
            }),
        }),
      );
      await act(async () => {
        wrapper = mount(<Password />);
      });
      await act(async () => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Password')
          .props()
          .onChange({ target: { value: 'new@123password#456' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Password')
          .props()
          .onChange({ target: { value: 'new@123password#456' } });

        const updateButton = wrapper.find('Button');
        updateButton.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/settings/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
          ],
        ]);
        done();
      }, 0);
    });
    it('should not submit with password mismatch', async (done) => {
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
                      'http://127.0.0.1:4455/.ory/kratos/public/self-service/settings/methods/password?flow=8060d57f-5c69-402f-9ecd-073e283f632a',
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
                request_url: 'http://127.0.0.1:4455/self-service/settings/browse',
                state: 'show_form',
                type: 'browser',
              },
            }),
        }),
      );
      await act(async () => {
        wrapper = mount(<Password />);
      });
      await act(async () => {
        wrapper
          .find('FormItem')
          .at(0)
          .find('Password')
          .props()
          .onChange({ target: { value: 'new@123password#456' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Password')
          .props()
          .onChange({ target: { value: 'new@123password' } });

        const updateButton = wrapper.find('Button');
        updateButton.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            process.env.REACT_APP_KRATOS_PUBLIC_URL +
              '/self-service/settings/flows?id=' +
              '8060d57f-5c69-402f-9ecd-073e283f632a',
          ],
        ]);
        done();
      }, 0);
    });
  });
});
