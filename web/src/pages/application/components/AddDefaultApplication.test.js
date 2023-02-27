import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import {
	addDefaultApplication,
	removeDefaultApplication,
} from '../../../actions/application';
import '../../../matchMedia.mock';
import { AddDefaultApplication } from "./AddDefaultApplication";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
	...jest.requireActual('react-redux'),
	useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useHistory: jest.fn(),
}));

jest.mock('../../../actions/application', () => ({
	...jest.requireActual('../../../actions/application'),
	getDefaultApplications: jest.fn(),
	getApplications: jest.fn(),
	addDefaultApplication: jest.fn(),
	removeDefaultApplication: jest.fn(),
}));
let state = {
	defaultapplications: {
		applications: [
			{
				id: 1,
				name: 'App 1',
				description: 'App 1 description',
			},
			{
				id: 2,
				name: 'App 2',
				description: 'App 2 description',
			},
		],
		loading: false,
	},
	applications: {
		loading: false,
	},
	organisations: {
		details: {
			1: {
				applications: [1, 2],
				name: 'Organisation 1',
				id: 1,
			},
		},
		selected: 1,
	},
}
describe('Application Detail component', () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	store.dispatch = jest.fn(() => ({}));
	let wrapper;

	describe("snapshots", () => {
		it('should render correctly when loading app is true', () => {
			state.applications.loading = true;
			store = mockStore(state);
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<AddDefaultApplication />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find("Skeleton").length).toBe(1);
		});
		it('should render correctly when loading default app is true', () => {
			state.applications.loading = false;
			state.defaultapplications.loading = true;
			store = mockStore(state);
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<AddDefaultApplication />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find("Skeleton").length).toBe(1);
		});
		// when no default app is present
		it('should render correctly when no default app is present', () => {
			state.defaultapplications.loading = false;
			state.defaultapplications.applications = undefined;
			const temp = state.applications.details;
			state.applications.details = undefined;
			store = mockStore(state);
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<AddDefaultApplication />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find("Skeleton").length).toBe(0);
			expect(wrapper.find("Empty").length).toBe(1);
			state.applications.details = temp;
		});

		// when default app is present
		it('should render correctly when default app is present', () => {
			state.defaultapplications.applications = [
				{
					id: 1,
					name: 'App 1',
					description: 'App 1 description',
				},
				{
					id: 2,
					name: 'App 2',
					description: 'App 2 description',
				},
				{
					id: 3,
					name: 'App 3',
					description: 'App 3 description',
				},
			];
			store = mockStore(state);
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<AddDefaultApplication />
					</Router>
				</Provider>
			);
			expect(wrapper).toMatchSnapshot();
			expect(wrapper.find("AppItem").length).toBe(3);
		});
	});

	describe("functionality", () => {
		it('should call addDefaultApplication when switch button is toggled to add', () => {
			// choose the last app and find the switch button and click
			store = mockStore(state);
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<AddDefaultApplication />
					</Router>
				</Provider>
			);
			wrapper.find("Switch").at(4).simulate('click');
			expect(addDefaultApplication).toHaveBeenCalledWith(3);
		});
		it('should call removeDefaultApplication when switch button is toggled to remove', () => {
			// choose the last app and find the switch button and click
			store = mockStore(state);
			wrapper = mount(
				<Provider store={store}>
					<Router>
						<AddDefaultApplication />
					</Router>
				</Provider>
			);
			wrapper.find("Switch").at(0).simulate('click');
			expect(removeDefaultApplication).toHaveBeenCalledWith(1);
		});
	});
});
