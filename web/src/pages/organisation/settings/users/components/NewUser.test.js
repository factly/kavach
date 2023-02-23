import React from "react";
import thunk from "redux-thunk";
import { useDispatch } from 'react-redux';
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import { useHistory, useParams } from 'react-router-dom';
import '../../../../../matchMedia.mock.js'
import { act } from "react-dom/test-utils";

import { addUser } from '../../../../../actions/users';
import { CloseOutlined } from '@ant-design/icons';


import NewUser from "./NewUser";


const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock("react-redux", () => ({
	...jest.requireActual("react-redux"),
	useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useHistory: jest.fn(),
	useParams: jest.fn(() => ({
		orgID: 1,
		policyID: 1,
	})),
}));

jest.mock('../../../../../actions/users', () => ({
	addUser: jest.fn(() => {
		return Promise.resolve({})
	}),
}));


let state = {
	profile: {
		loading: false,
		roles: {
			1: "owner",
		},
	},
	organisations: {
		details: {
			1: {
				id: 1, name: "test organisation", tokens: [1, 2, 3],
			}
		},
		selected: 1,
		loading: false,
	},
};

describe("New User component", () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	store.dispatch = jest.fn(() => ({}));
	const push = jest.fn();
	useHistory.mockReturnValue({ push });

	describe('snapshots', () => {
		it('should match snapshot when loading', () => {
			state.profile.loading = true;
			store = mockStore(state);
			const component = mount(
				<Provider store={store}>
					<Router>
						<NewUser />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
			expect(component.find('Skeleton').length).toBe(1);
		})
		it('should match snapshot when role is not owner', () => {
			state.profile.loading = false;
			state.profile.roles[1] = "editor";
			store = mockStore(state);
			const component = mount(
				<Provider store={store}>
					<Router>
						<NewUser />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
			expect(component.find('ErrorComponent').length).toBe(1);
		})
		it('should match snapshot when role is owner', () => {
			state.profile.loading = false;
			state.profile.roles[1] = "owner";
			store = mockStore(state);
			const component = mount(
				<Provider store={store}>
					<Router>
						<NewUser />
					</Router>
				</Provider>
			);
			expect(component).toMatchSnapshot();
			expect(component.find('form').length).toBe(1);
		})
	})

	describe('functionality', () => {
		it("should call add user when 1 user is added", (done) => {
			state.profile.loading = false;
			state.profile.roles[1] = "owner";
			store = mockStore(state);
			const component = mount(
				<Provider store={store}>
					<Router>
						<NewUser />
					</Router>
				</Provider>
			);
			act(() => {
				component.find('input').at(0).simulate('change', { target: { value: 'testemail@gmail.com' } });
				component.find('input').at(1).simulate('change', { target: { value: "first" } });
				component.find('input').at(2).simulate('change', { target: { value: "last" } });
				component.find('Select').at(0).props().onChange("member");
				component.find('form').simulate('submit');
			})

			setTimeout(() => {
				expect(addUser).toHaveBeenCalledWith(
					{
						users: [
							{
								email: 'testemail@gmail.com',
								first_name: 'first',
								last_name: 'last',
								role: 'member'
							}
						],
					}, { push }
				);

				expect(push).toHaveBeenCalledWith('/organisation/1/settings/users');
				done();
			});
		})
		it("should call add user when multiple users are added", (done) => {
			state.profile.loading = false;
			state.profile.roles[1] = "owner";
			store = mockStore(state);
			const component = mount(
				<Provider store={store}>
					<Router>
						<NewUser />
					</Router>
				</Provider>
			);
			let usersFormInputs = 0;
			act(() => {
				usersFormInputs = component.find('InternalFormItem').length;
				component.find('Button').at(1).props().onClick();
			})
			component.update();
			act(() => {
				expect(component.find('InternalFormItem').length).toBe(usersFormInputs * 2);
				component.find('input').at(0).simulate('change', { target: { value: 'testemail@gmail.com' } });
				component.find('input').at(1).simulate('change', { target: { value: "first" } });
				component.find('input').at(2).simulate('change', { target: { value: "last" } });
				component.find('Select').at(0).props().onChange("member");
				component.find('form').simulate('submit');

				component.find('input').at(4).simulate('change', { target: { value: 'testemail2@gmail.com' } });
				component.find('input').at(5).simulate('change', { target: { value: "first2" } });
				component.find('input').at(6).simulate('change', { target: { value: "last2" } });
				component.find('Select').at(1).props().onChange("owner");
				component.find('form').simulate('submit');
			});

			setTimeout(() => {
				expect(addUser).toHaveBeenCalledWith(
					{
						users: [
							{
								email: 'testemail@gmail.com',
								first_name: 'first',
								last_name: 'last',
								role: 'member'
							},
							{
								email: 'testemail2@gmail.com',
								first_name: 'first2',
								last_name: 'last2',
								role: 'owner'
							}
						]
					}
					, { push }
				);

				expect(push).toHaveBeenCalledWith('/organisation/1/settings/users');
				done();
			});
		})
	})

	it("should remove another user field when remove button is clicked", () => {
		state.profile.loading = false;
		state.profile.roles[1] = "owner";
		store = mockStore(state);
		const component = mount(
			<Provider store={store}>
				<Router>
					<NewUser />
				</Router>
			</Provider>
		);
		let usersFormInputs = 0;
		act(() => {
			usersFormInputs = component.find('InternalFormItem').length;
			component.find('Button').at(1).props().onClick();
		})
		component.update();
		act(() => {
			expect(component.find('InternalFormItem').length).toBe(usersFormInputs * 2);
			component.find(CloseOutlined).at(1).props().onClick();
		})
		component.update();
		expect(component.find('InternalFormItem').length).toBe(usersFormInputs);
	});
})
