import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { getApplicationPolicyByID } from '../../../../../actions/policy';
import ViewApplicationPolicy from './ViewApplicationPolicy';
import '../../../../../matchMedia.mock'
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
			appID: 1,
			policyID: 1,
		};
	}),
}));

jest.mock('../../../../../actions/policy', () => ({
	getApplicationPolicyByID: jest.fn(),
}));

let state = {
	policy: {
		application: {
			1: {
				1: { id: 1, name: 'Test Policy 1', description: 'Test Policy 1 Description', roles: [1, 2] },
			},
		}
	},
	roles: {
		applications: {
			1: {
				1: { id: 1, name: 'Test Role 1', description: 'Test Role 1 Description' },
				2: { id: 2, name: 'Test Role 2', description: 'Test Role 2 Description' },
			},
		},
	},
};

describe('Application Policy View component', () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	const push = jest.fn();
	useHistory.mockReturnValueOnce({ push });

	describe('snapshot testing', () => {});

	describe('component testing', () => {});
}); // 	let store;
