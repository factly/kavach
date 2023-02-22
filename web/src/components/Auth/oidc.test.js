import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

    it('should render the component when flow and loginmethod are not default', () => {
      let component;
      act(() => {
        component = mount(<OIDC config={config} flow="registration" loginMethod="oidc" />);
      });
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    it('renders a Github button when the UI object contains a Github node', () => {
      const ui = {
        action: '/',
        method: 'POST',
        nodes: [{ group: 'oidc', attributes: { value: 'github' } }]
      };
      render(<OIDC ui={ui} />);
      const githubButton = screen.getByText(/continue with github/i);
      expect(githubButton).toBeInTheDocument();
    });
    it('renders a Google button when the UI object contains a Google node', () => {
      const ui = {
        action: '/',
        method: 'POST',
        nodes: [{ group: 'oidc', attributes: { value: 'google' } }]
      };
      render(<OIDC ui={ui} />);
      const googleButton = screen.getByText(/continue with google/i);
      expect(googleButton).toBeInTheDocument();
    });
    it('calls withOIDC with the value "github" when the Github button is clicked', () => {
      const ui = {
        action: '/',
        method: 'POST',
        nodes: [{ group: 'oidc', attributes: { value: 'github', name: "csrf_token" } },]
      };
      const submitSpy = jest.spyOn(window.HTMLFormElement.prototype, 'submit');

      const wrapper = mount(<OIDC ui={ui} />);
      const githubButton = wrapper.find('button').at(0);
      githubButton.simulate('click');
      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });
    it('calls withOIDC with the value "google" when the Google button is clicked', () => {
      const ui = {
        action: '/',
        method: 'POST',
        nodes: [{ group: 'oidc', attributes: { value: 'google', name: "csrf_token" } },]
      };
      const submitSpy = jest.spyOn(window.HTMLFormElement.prototype, 'submit');

      const wrapper = mount(<OIDC ui={ui} />);
      const githubButton = wrapper.find('button').at(0);
      githubButton.simulate('click');
      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });
  });
});
