import React from 'react';
import { Provider } from 'react-redux';
import { act } from '@testing-library/react';
import { mount, shallow } from 'enzyme';
import '../../matchMedia.mock';
import Password from './index';
import { Form, Input, Button } from 'antd';
global.fetch = jest.fn();

import resolvedResp from './resolvedResp';

describe('password component', () => {
  describe('snapshot component', () => {
    xit('should render the component', () => {
      let component;
      act(() => {
        component = shallow(<Password />);
      });
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
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
                      { name: Input.Password, type: Input.Password, required: true },
                      {
                        name: 'csrf_token',
                        required: true,
                        type: 'hidden',
                        value:
                          'hEfSSfeFIGFe3Nf7t6a/QqBVJa8RrHFnMLvRMOQrNioSPn8bOsYEoRU++s2XzWbNYeru/3rcr+ExpCGVcZP8pQ==',
                      },
                    ],
                  },
                  method: Input.Password,
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
            window.REACT_APP_KRATOS_PUBLIC_URL +
            '/self-service/settings/flows?id=' +
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
      await act(async () => {
        wrapper = mount(<Password />);
      });
      await act(async () => {
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            window.REACT_APP_KRATOS_PUBLIC_URL +
            '/self-service/settings/flows?id=' +
            '8060d57f-5c69-402f-9ecd-073e283f632a',
            {
              credentials: 'include',
            },
          ],
        ]);
        expect(window.location.href).toBe(
          window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/browser',
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
            window.REACT_APP_KRATOS_PUBLIC_URL +
            '/self-service/settings/flows?id=' +
            '8060d57f-5c69-402f-9ecd-073e283f632a',
            {
              credentials: 'include',
            },
          ],
          [
            window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/flows?id=' + undefined,
            {
              credentials: 'include',
            },
          ],
        ]);
        expect(window.location.href).toBe(
          window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/browser',
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
          json: () => Promise.resolve(resolvedResp),
        }),
      );
      await act(async () => {
        wrapper = mount(<Password />);
      });
      await act(async () => {
        wrapper.update();

        wrapper
          .find(Form.Item)
          .at(0)
          .find('input')
          .props()
          .onChange({ target: { value: 'neW@123password#456' } });
        wrapper
          .find(Form.Item)
          .at(1)
          .find("input[type='password']")
          .props()
          .onChange({ target: { value: 'neW@123password#456' } });

        const updateButton = wrapper.find('Button').at(0);
        updateButton.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(wrapper.find('List').length).toBe(1);
        expect(wrapper.find('List').props().dataSource).toEqual([{
          type: 'input',
          group: 'oidc',
          attributes: {
            name: 'google',
            type: 'email',
            value: 'google',
          },
        },
        {
          type: 'input',
          group: 'oidc',
          attributes: {
            name: 'github',
            type: 'email',
            value: 'github',
          },
        },
        {
          type: 'input',
          group: 'oidc',
          attributes: {
            name: 'default',
            type: 'email',
            value: 'default',
          },
        },]);
        expect(fetch.mock.calls).toEqual([
          [
            window.REACT_APP_KRATOS_PUBLIC_URL +
            '/self-service/settings/flows?id=' +
            '8060d57f-5c69-402f-9ecd-073e283f632a',
            {
              credentials: 'include',
            },
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
          json: () => Promise.resolve(resolvedResp),
        }),
      );
      await act(async () => {
        wrapper = mount(<Password />);
      });
      await act(async () => {
        wrapper.update();
        wrapper
          .find(Form.Item)
          .at(0)
          .find("input[type='password']")
          .props()
          .onChange({ target: { value: 'new@123pasword#456' } });
        wrapper
          .find(Form.Item)
          .at(1)
          .find("input[type='password']")
          .props()
          .onChange({ target: { value: 'new@123password#456' } });

        const updateButton = wrapper.find('Button').at(0);
        updateButton.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(fetch.mock.calls).toEqual([
          [
            window.REACT_APP_KRATOS_PUBLIC_URL +
            '/self-service/settings/flows?id=' +
            '8060d57f-5c69-402f-9ecd-073e283f632a',
            {
              credentials: 'include',
            },
          ],
        ]);
        done();
      }, 0);
    });
    it('should call updateTOTP when code verify', async (done) => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = '?flow=8060d57f-5c69-402f-9ecd-073e283f632a';
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(resolvedResp),
        }),
      );
      await act(async () => {
        wrapper = mount(<Password />);
      })
      await act(async () => {
        wrapper.update();
        wrapper.find('form').at(1).find("input").simulate('change', { target: { value: '123456' } });

        expect(wrapper.find('form').at(1).find('button').text()).toEqual('Save');
        wrapper.find('form').at(1).simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        const form = document.querySelectorAll('form')[1];
        const inputs = form.querySelectorAll('input');

        expect(inputs[0].name).toEqual('csrf_token');
        expect(inputs[1].name).toEqual('method');
        expect(inputs[2].name).toEqual('totp_code');
        done();
      }, 0);
    });
    it('should unlink TOTP', async (done) => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = '?flow=8060d57f-5c69-402f-9ecd-073e283f632a';
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({
            ...resolvedResp,
            ui: {
              nodes: resolvedResp.ui.nodes.filter((node) => {
                if (node.attributes.node_type === 'img') {
                  return false;
                }
                return true;
              }),
            },
          }),
        }),
      );
      await act(async () => {
        wrapper = mount(<Password />);
      })
      await act(async () => {
        wrapper.update();

        expect(wrapper.find('form').at(1).find('button').text()).toEqual('Unlink TOTP Authenticator App');
        wrapper.find('form').at(1).simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        const form = document.querySelectorAll('form')[2];
        const inputs = form.querySelectorAll('input');

        expect(inputs[0].name).toEqual('csrf_token');
        expect(inputs[1].name).toEqual('method');
        expect(inputs[2].name).toEqual('totp_unlink');
        done();
      }, 0);
    });

    it('should call onclick function for social login', async (done) => {
      delete window.location;
      window.location = {
        assign: jest.fn(),
      };
      window.location.search = '?flow=8060d57f-5c69-402f-9ecd-073e283f632a';
      fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(resolvedResp),
        }),
      );
      await act(async () => {
        wrapper = mount(<Password />);
      });

      await act(async () => {
        wrapper.update();
        wrapper.find('List').find('SocialItem').at(0).find('Switch').at(0).props().onClick();
        wrapper.update();
      });

      setTimeout(() => {
        const form = document.querySelectorAll('form')[3];
        const inputs = form.querySelectorAll('input');

        expect(inputs[0].name).toEqual('csrf_token');
        expect(inputs[1].name).toEqual('method');
        expect(inputs[2].name).toEqual('google');
        done();
      }, 0);
    });
  });
});
