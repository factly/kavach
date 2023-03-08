import React from 'react'
import { mount, render } from 'enzyme'
import { BrowserRouter as Router } from 'react-router-dom';
import Recovery from './index'
import '../../matchMedia.mock'
// mock usestate
// jest.mock('react', () => ({
// 	...jest.requireActual('react'),
// 	useState: jest.fn((initialState) => [initialState, jest.fn()]),
// }))
// mock BrandingComponent
jest.mock('../../components/Branding', () => {
	return jest.fn().mockImplementation(() => {
		return <div className='BrandingComponent'>BrandingComponent</div>
	});
});
// mock Loading
jest.mock('../../components/Loading', () => {
	return jest.fn().mockImplementation(() => {
		return <div className='loading'>Loading</div>
	});
});

import { notification } from 'antd';
notification.success = jest.fn();
notification.error = jest.fn();


// mock global fetch
// mock window.location.search

describe('Recovery', () => {
	let component;
	delete window.location;
	window.location = {
		assign: jest.fn(),
	};
	window.location.search = '?flow=8060d57f-5c69-402f-9ecd-073e283f632a';
	beforeAll(() => {
		global.fetch = jest.fn().mockImplementation(() => {
			return Promise.resolve({
				status: 200,
				json: () => Promise.resolve({
					ui: {
						action: 'https://example.com/recover-password',
						method: 'post',
						nodes: [
							{ attributes: { name: 'csrf_token', value: '1234567890' } },
							{ attributes: { name: 'other_input', value: 'foo' } },
						],
						messages: [
							{
								id: 1060002,
								text: 'Please enter your email address.',
							},
						],
					}
				}),
			});
		});
	});

	beforeEach(() => {
		component = mount(
			<Router>
				<Recovery />
			</Router>
		);
	});

	afterAll(() => {
		global.fetch.mockClear();
		delete global.fetch;
	});

	it('should render component', () => {
		expect(component).toMatchSnapshot();
	});

	it('should call fetch with the correct arguments', () => {
		expect(global.fetch).toHaveBeenCalledWith(
			`${window.REACT_APP_KRATOS_PUBLIC_URL}/self-service/recovery/flows?id=8060d57f-5c69-402f-9ecd-073e283f632a`,
			{ credentials: 'include' }
		);
		expect(notification.success).toHaveBeenCalledWith({
			message: 'Success',
			description: 'successfull sent the recovery email',
		});
	});

	it('should render Loading component while loading', () => {
		component = mount(
			<Router>
				<Recovery />
			</Router>
		);
		expect(component.find('.BrandingComponent')).toHaveLength(1);
		expect(component.find('.loading')).toHaveLength(1);
	});

	it('should render form when loading is false', async () => {
		await new Promise((resolve) => setTimeout(resolve));
		component.update();
		// console.log(component.debug())
		expect(component.find('form')).toHaveLength(1);
	});

	it('should submit form with email input value', async (done) => {
		component = mount(
			<Router>
				<Recovery />
			</Router>
		);
		await new Promise((resolve) => setTimeout(resolve));
		component.update();
		const input = component.find('input').at(0);
		input.simulate('change', { target: { name: 'email', value: 'test@example.com' } });

		const form = component.find('form');
		form.simulate('submit');
		setTimeout(() => {
			expect(document.querySelector('form').getAttribute('action')).toEqual('https://example.com/recover-password');
			expect(document.querySelector('form').getAttribute('method')).toEqual('post');
			// display to be none
			expect(document.querySelector('form').style.display).toEqual('none');
			let inputs = document.querySelectorAll('input');
			expect(inputs[0].getAttribute('name')).toEqual('email');
			// expect(inputs[0].getAttribute('value')).toEqual('test@example.com');
			expect(inputs[1].getAttribute('name')).toEqual('csrf_token');
			// expect(inputs[1].getAttribute('value')).toEqual('1234567890');
			expect(inputs[2].getAttribute('name')).toEqual('method');
			// expect(inputs[2].getAttribute('value')).toEqual('link');
			done();
		}, 0);
	});

	it('should trigger storage event listener', async () => {
		component = mount(
			<Router>
				<Recovery />
			</Router>
		);
		// set a return_to value in local storage
		localStorage.setItem('returnTo', 'https://dega.factly.in/');
		// trigger the storage event listener
		window.dispatchEvent(new StorageEvent('storage', { key: 'returnTo' }));
		await new Promise((resolve) => setTimeout(resolve));
		component.update();

		// check that the window.location.assign method was called
		let image = component.find('img').at(0);
		expect(image.prop('src')).toEqual('https://images.factly.in/login/applications/logos/dega.png?rs:fill/h:35');
	});

	it('should call notification error when message id is not 1060002', async () => {

		global.fetch.mockClear();
		global.fetch = jest.fn().mockImplementation(() => {
			return Promise.resolve({
				status: 200,
				json: () => Promise.resolve({
					ui: {
						action: 'https://example.com/recover-password',
						method: 'post',
						nodes: [
							{ attributes: { name: 'csrf_token', value: '1234567890' } },
							{ attributes: { name: 'other_input', value: 'foo' } },
						],
						messages: [
							{
								id: 1060003,
							},
						],
					}
				}),
			});
		});
		component = mount(
			<Router>
				<Recovery />
			</Router>
		);
		expect(global.fetch).toHaveBeenCalledWith(
			`${window.REACT_APP_KRATOS_PUBLIC_URL}/self-service/recovery/flows?id=8060d57f-5c69-402f-9ecd-073e283f632a`,
			{ credentials: 'include' }
		);
		expect(notification.error).toHaveBeenCalledWith({
			message: 'Error',
			description: 'unable to send the recovery email',
		});
	});

	it('should call notification error when fetch fails', async () => {
		global.fetch.mockClear();
		global.fetch = jest.fn().mockImplementation(() => {
			return Promise.reject({
				status: 400,
				json: () => Promise.resolve({
					ui: {
						action: 'https://example.com/recover-password',
						method: 'post',
						nodes: [
							{ attributes: { name: 'csrf_token', value: '1234567890' } },
							{ attributes: { name: 'other_input', value: 'foo' } },
						],
						messages: [
							{
								id: 1060002,
								text: 'Please enter your email address.',
							},
						],
					}
				}),
			});
		});
		component = mount(
			<Router>
				<Recovery />
			</Router>
		);
		expect(global.fetch).toHaveBeenCalledWith(
			`${window.REACT_APP_KRATOS_PUBLIC_URL}/self-service/recovery/flows?id=8060d57f-5c69-402f-9ecd-073e283f632a`,
			{ credentials: 'include' }
		);
		expect(notification.error).toHaveBeenCalledWith({
			message: 'Error',
			description: 'unable to send the recovery email',
		});
	});
});

