import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';
import ApplicationSettings from './index';
import { Descriptions } from 'antd';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
	...jest.requireActual('react-redux'),
	useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useHistory: jest.fn(),
	useParams: jest.fn(() => {
    return {
      id: 1,
    };
  }),
}));

import { getApplication } from '../../../actions/application';

jest.mock('../../../actions/application', () => ({
	getApplication: jest.fn(),
}));

let state = {
	organisations: {
		selected: 1,
	},
	profile: {
		roles: {
			1: 'owner',
		},
		loading: false,
	},
	applications: {
		loading: false,
		details: {
			1: {
				id: 1, name: 'Application1', description: 'description', url: 'url1', medium_id: 1,
			},
		},
	},
};

jest.mock('../../../components/Settings', () => {
	return jest.fn((props) => <div id="settings" {...props} />);
});

let store;
const mockedDispatch = jest.fn();
mockedDispatch.mockReturnValue(Promise.resolve());
useDispatch.mockReturnValue(mockedDispatch);
store = mockStore({});
const push = jest.fn();
describe('Application Settings component', () => {
	it('should render the component with loading app', () => {
		state.applications.loading = true;
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ApplicationSettings  />
				</Router>
			</Provider>,
		);
		expect(wrapper.find('Skeleton').length).toBe(1);
	});
	it('should render the component with loading profile', () => {
		state.applications.loading = false;
		state.profile.loading = true;
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ApplicationSettings  />
				</Router>
			</Provider>,
		);
		expect(wrapper.find('Skeleton').length).toBe(1);
	});
	it('should render the component when role is not owner', () => {
		state.profile.loading = false;
		state.profile.roles[1] = 'admin';
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ApplicationSettings  />
				</Router>
			</Provider>,
		);
		expect(wrapper.find('mockConstructor').length).toBe(1);
		expect(wrapper.find('mockConstructor').props().role).toBe('admin');
	});
	it('should render the component when role is owner', () => {
		state.profile.roles[1] = 'owner';
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ApplicationSettings  />
				</Router>
			</Provider>,
		);
		expect(wrapper.find('mockConstructor').length).toBe(1);
		expect(wrapper.find('mockConstructor').props().role).toBe('owner');
		console.log(wrapper.debug());
		expect(wrapper.find('Row').at(3).text()).toBe('Number of Tokens0');
	});
	it('should render the component when app has tokens', () => {
		state.applications.details[1].tokens = [1, 2];
		const store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ApplicationSettings  />
				</Router>
			</Provider>,
		);
		expect(wrapper.find('Row').at(3).text()).toBe('Number of Tokens2');
	});
});
