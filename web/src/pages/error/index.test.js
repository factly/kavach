import React from 'react';
import { render, screen } from '@testing-library/react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import KratosError from './index';

describe('KratosError', () => {
	// Mock the window object and the fetch function for all tests
	const originalWindow = { ...window };
	beforeEach(() => {
		window = { ...originalWindow };
		global.fetch = jest.fn(() =>
			Promise.resolve({
				status: 200,
				json: () => Promise.resolve({ error: { code: 404, message: 'Page not found' } }),
			})
		);
	});
	afterAll(() => {
		window = originalWindow;
	});

	it('renders the component without errors', () => {
		render(<Router><KratosError /></Router>);
		expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
	});

	it('matches the snapshot', () => {
		const { asFragment } = render(<Router><KratosError /></Router>);
		expect(asFragment()).toMatchSnapshot();
	});

	it('displays the error message and link correctly', async () => {
		render(<Router><KratosError /></Router>);
		expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
		expect(screen.getByText(/go to login/i)).toBeInTheDocument();
		userEvent.click(screen.getByRole('button', { name: /go to login/i }));
		expect(window.location.pathname).toBe('/auth/login');
	});

	it('calls the Kratos API with the correct URL', async () => {
		render(<Router><KratosError /></Router>);
		expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/self-service\/errors\?error=\w+/));
	});

	describe('when the API call succeeds', () => {
		beforeEach(() => {
			global.fetch = jest.fn(() =>
				Promise.resolve({
					status: 200,
					json: () => Promise.resolve({ error: { code: 404, message: 'Page not found' } }),
				})
			);
		});
		it('parses the query string from the window location', () => {
			const search = '?id=123&foobar';
			Object.defineProperty(window, 'location', {
				value: { search },
			});

			render(<Router><KratosError /></Router>);
			expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('123&foobar'));
		});

		it('sets the title and status state correctly based on the API response', async () => {
			let wrapper = mount(<Router><KratosError /></Router>);
			await new Promise((resolve) => setTimeout(resolve, 1000));
			wrapper.update();
			expect(wrapper.find('ErrorComponent').props().title).toEqual('Page not found');
		});
	});

	describe('when the API call fails', () => {
		beforeEach(() => {
			global.fetch = jest.fn(() => Promise.reject(new Error('API error')));
		});

		it('logs an error message to the console', async () => {
			render(<Router><KratosError /></Router>);
			console.error = jest.fn();
			await expect(global.fetch).toHaveBeenCalledWith(expect.any(String));
			await new Promise((resolve) => setTimeout(resolve, 1000));
			await expect(console.error).toHaveBeenCalledWith('API error');
		});
	});

	describe('when the API response has an error status code', () => {
		beforeEach(() => {
			global.fetch = jest.fn(() => Promise.resolve({ status: 500 }));
		});

		it('throws an error with the HTTP status code', async () => {
			render(<Router><KratosError /></Router>);
			console.error = jest.fn();
			await expect(global.fetch).toHaveBeenCalledWith(expect.any(String));
			await expect(console.error).toHaveBeenCalledWith('Something went wrong Error code: ' + 500);
		});
	});
});
