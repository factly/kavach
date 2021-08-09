import React from 'react';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import '../../matchMedia.mock';
import OIDC from './oidc';

const config = {
  action:
    'http://127.0.0.1:4455/.ory/kratos/public/self-service/methods/oidc/auth/3b21e9d8-1b0a-4e12-8eb0-d77fdeede28e',
  method: 'POST',
  fields: [
    {
      name: 'csrf_token',
      type: 'hidden',
      required: true,
      value:
        'D5sFfeYIa9TxEij3vANoLDa9OIFip2jLmsF0O6lc/m50YjviU1/75iZPRP2WL6R94MOIXA+9mjlHj1MbVcpX+w==',
    },
    {
      name: 'provider',
      type: 'submit',
      value: 'github',
    },
    {
      name: 'provider',
      type: 'submit',
      value: 'google',
    },
  ],
};
describe('OIDC component', () => {
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let component;
      act(() => {
        component = mount(<OIDC config={config} />);
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
    it('should handle github', () => {
      act(() => {
        wrapper = mount(<OIDC config={config} />);
      });
      const githubBtn = wrapper.find('Button').at(0);
      expect(githubBtn.text()).toBe('Github');
      githubBtn.simulate('click');
    });
    it('should handle google', () => {
      act(() => {
        wrapper = mount(<OIDC config={config} />);
      });
      const githubBtn = wrapper.find('Button').at(1);
      expect(githubBtn.text()).toBe('Google');
      githubBtn.simulate('click');
    });
  });
});
