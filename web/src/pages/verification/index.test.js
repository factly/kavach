import React from 'react'
import { mount, render } from 'enzyme'
import { BrowserRouter as Router } from 'react-router-dom';
import Verification from './index'
import '../../matchMedia.mock'

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

describe('Verification', () => {
	let component;
	let ui = {
		action: 'https://example.com/verify',
		method: 'post',
		nodes: [
			{ attributes: { name: 'code', value: '1234567890' } },
			{ attributes: { name: 'csrf_token', value: 'tokendadd' } },
			{ attributes: { name: 'other_input', value: 'foo' } },
			{ group: "code", attributes: { name: 'code', value: 'foo1@gamil.com' } },
			{ group: "code", attributes: { name: 'code', value: 'foo2@gamil.com' } },
			{ group: "code", attributes: { name: 'code', value: 'foo3@gamil.com' } },
			{ group: "code", attributes: { name: 'code', value: 'foo4@gamil.com' } },
		],
		messages: [
			{
				id: 1060002,
				text: 'Please enter your email address.',
			},
		],
	};
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
					ui: ui,
					state: 'choose_method'
				}),
			});
		});
	});

	beforeEach(() => {
		component = mount(
			<Router>
				<Verification />
			</Router>
		);
	});

	afterAll(() => {
		global.fetch.mockClear();
	});
	it("render component", () => {
		expect(component).toMatchSnapshot();
	})
	it("should call fetch correct arguments", () => {
		expect(global.fetch).toHaveBeenCalledWith(
			window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/verification/flows?id=' + "8060d57f-5c69-402f-9ecd-073e283f632a",
			{
				credentials: 'include',
			},
		)
	})
	it("should render BrandingComponent and Loading", () => {
		expect(component.find('.BrandingComponent').length).toBe(1);
		expect(component.find('.loading').length).toBe(1);
	})
	it("should render form fetch is success", async () => {
		await new Promise(resolve => setTimeout(resolve, 0));
		component.update();
		expect(component.find('form').length).toBe(1);
		expect(component.find('form').find('input').props().placeholder).toEqual('Please enter your email');
	})
	it("should submit form", async (done) => {
		await new Promise(resolve => setTimeout(resolve, 0));
		component.update();
		component.find('form').find('input').at(0).simulate('change', { target: { value: 'test@gmail.com' } });
		component.find('form').simulate('submit');
		setTimeout(() => {
			expect(document.querySelector('form').getAttribute('action')).toEqual('https://example.com/verify');
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
	})
	it("should render Alert and add notificatication and fetch is success state is sent_email", async () => {
		global.fetch = jest.fn().mockImplementation(() => {
			return Promise.resolve({
				status: 200,
				json: () => Promise.resolve({
					ui: ui,
					state: 'sent_email'
				}),
			});
		});

		component = mount(
			<Router>
				<Verification />
			</Router>
		);

		await new Promise(resolve => setTimeout(resolve, 0));
		component.update();
		expect(component.find('Alert').length).toBe(1);
		expect(component.find('form').length).toBe(1);
		expect(component.find('form').find('input').props().placeholder).toEqual('Enter the verification code');
		expect(component.find('form').find('button').length).toBe(2);
	})
	it("Should resend code when resend button is clicked email is available", async (done) => {
		await new Promise(resolve => setTimeout(resolve, 0));
		component.update();
		component.find('form').find('button').at(1).simulate('click');

		setTimeout(() => {
			expect(document.querySelector('form').getAttribute('action')).toEqual('https://example.com/verify');
			expect(document.querySelector('form').getAttribute('method')).toEqual('post');
			// display to be none
			expect(document.querySelector('form').style.display).toEqual('none');
			let inputs = document.querySelectorAll('input');
			expect(inputs[0].getAttribute('name')).toEqual('email');

			expect(inputs[1].getAttribute('name')).toEqual('csrf_token');

			expect(inputs[2].getAttribute('name')).toEqual('method');
			done();
		}, 0);
	})

	it("Should resend code when resend button is clicked email is not available", async (done) => {
		global.fetch = jest.fn().mockImplementation(() => {
			return Promise.resolve({
				status: 200,
				json: () => Promise.resolve({
					ui: {
						...ui,
						nodes: [
							{ attributes: { name: 'code', value: '1234567890' } },
							{ attributes: { name: 'csrf_token', value: 'tokendadd' } },
							{ attributes: { name: 'other_input', value: 'foo' } },
							{ group: "code", attributes: { name: 'code', value: 'foo1@gamil.com' } },
							{ group: "code", attributes: { name: 'code', value: 'foo2@gamil.com' } },
							{ group: "code", attributes: { name: 'code', value: '' } },
							{ group: "code", attributes: { name: 'code', value: '' } },
						]
					},
					state: 'sent_email'
				}),
			});
		});

		component = mount(
			<Router>
				<Verification />
			</Router>
		);

		await new Promise(resolve => setTimeout(resolve, 0));
		component.update();
		component.find('form').find('button').at(1).simulate('click');

		setTimeout(() => {
			expect(notification['error']).toHaveBeenCalledWith({
				message: 'Unable to resend code. Please reload the page or try again.',
			});
			done();
		}, 0);
	})
	it('should trigger storage event listener', async () => {
		component = mount(
			<Router>
				<Verification />
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
	it("should submit code form", async (done) => {

		global.fetch = jest.fn().mockImplementation(() => {
			return Promise.resolve({
				status: 200,
				json: () => Promise.resolve({
					ui: ui,
					state: 'sent_email'
				}),
			});
		});

		component = mount(
			<Router>
				<Verification />
			</Router>
		);

		await new Promise(resolve => setTimeout(resolve, 0));
		component.update();
		component.find('form').find('input').at(0).simulate('change', { target: { value: '123450' } });
		// console.log(component.find('form').html());
		component.find('form').simulate('submit');

		setTimeout(() => {
			let form2 = document.querySelectorAll('form')[2];

			expect(form2.getAttribute('action')).toEqual('https://example.com/verify');
			expect(form2.getAttribute('method')).toEqual('post');

			// display to be none
			expect(form2.style.display).toEqual('none');
			// class to be verify-account-using-code-form
			expect(form2.classList[0]).toEqual('verify-account-using-code-form');
			let inputs = form2.querySelectorAll('input');
			expect(inputs[0].getAttribute('name')).toEqual('code');
			expect(inputs[1].getAttribute('name')).toEqual('csrf_token');
			expect(inputs[2].getAttribute('name')).toEqual('method');
			done();
		}, 0);
	})
	it("should add notificatication when state is passed_challenge and fetch is success", async (done) => {
		global.fetch = jest.fn().mockImplementation(() => {
			return Promise.resolve({
				status: 200,
				json: () => Promise.resolve({
					ui: {
						...ui,
						nodes: [],
					},
					state: 'passed_challenge'
				}),
			});
		});

		component = mount(
			<Router>
				<Verification />
			</Router>
		);

		await new Promise(resolve => setTimeout(resolve, 0));
		component.update();

		setTimeout(() => {
			expect(notification['success']).toHaveBeenCalledWith({
				message: 'Email successfully verified',
			});
			expect(window.location.href).toEqual(window.REACT_APP_KRATOS_PUBLIC_URL + '/auth/login');
			done();
		}, 1000);
	})
	it("should add notificatication and fetch is error", async (done) => {
		global.fetch = jest.fn().mockImplementation(() => {
			return Promise.reject({
				status: 400,
				json: () => Promise.resolve({
					ui: {
						...ui,
						nodes: [],
					},
				}),
			});
		});

			component = mount(
				<Router>
					<Verification />
				</Router>
			);

			await new Promise(resolve => setTimeout(resolve, 0));
			component.update();

			setTimeout(() => {
				expect(window.location.href).toEqual(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/verification/browser');
				done();
			});
		})

		it("should throw error when fetch is not success and status is not 200", async (done) => {
			global.fetch = jest.fn().mockImplementation(() => {
				return Promise.resolve({
					status: 400,
					json: () => Promise.resolve({
						ui: {
							...ui,
							nodes: [],
						},
					}),
				});
			});

			component = mount(
				<Router>
					<Verification />
				</Router>
			);

			// await new Promise(resolve => setTimeout(resolve, 0));
			// component.update();

			setTimeout(() => {
				expect(window.location.href).toEqual(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/verification/browser');
				done();
			});
		})
	})

