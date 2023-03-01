import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import MFA from './mfa';
import '../../matchMedia.mock';
import { mount } from 'enzyme';

describe('MFA', () => {
  const mockUI = {
    action: '/mfa-authentication',
    method: 'POST',
    nodes: [
      {
        group: 'csrf_token',
        attributes: {
          name: 'csrf_token',
          value: 'mock-csrf-token',
        },
      },
    ],
    messages: [{ type: 'success', text: 'Mock success message' }],
  };

  it('renders the authentication form', () => {
    const wrapper = mount(<MFA ui={mockUI} />);
    expect(wrapper.find('form')).toHaveLength(1);
    expect(wrapper.find('input')).toHaveLength(1);
    expect(wrapper.find('button')).toHaveLength(1);

    expect(wrapper).toMatchSnapshot();
  });
  it('submits the TOTP code', () => {
    const mockValues = { totp_code: '123456' };
    const submitSpy = jest.spyOn(window.HTMLFormElement.prototype, 'submit');
    const wrapper = mount(<MFA ui={mockUI} />);
    wrapper.find('input').simulate('change', { target: { value: mockValues.totp_code } });
    wrapper.find('form').simulate('submit');
    // Restore the original implementation of submit() after the test
    submitSpy.mockRestore();
  });

  it('renders an alert message if UI messages exist', () => {
    render(<MFA ui={mockUI} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Mock success message')).toBeInTheDocument();
  });

  it('does not render an alert message if UI messages do not exist', () => {
    render(<MFA ui={{}} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
