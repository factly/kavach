import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../../../../matchMedia.mock';
import { Popconfirm } from 'antd';

import { deleteApplicationToken } from '../../../../../actions/token';

import TokenList from './TokenList';

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

jest.mock('../../../../../actions/token', () => ({
	getApplicationTokens: jest.fn(),
	deleteApplicationToken: jest.fn(),
}));


let state = {
	applications: {
		details: {
			1: {
				id: 1,
				name: 'Test Application',
				description: 'Test Description',
				tokens: [1, 2],
			},
		},
	},
	tokens: {
		application: {
			1: {
				1: { name: 'Test Token 1', description: 'Test Description 1', id: 1 },
				2: { name: 'Test Token 2', description: 'Test Description 2', id: 2 },
			},
		},
		loading: false,
	},
};

describe('TokenList component', () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	describe('snapshot testing', () => {
		// loading true
		it('should match the snapshot when laoding', () => {
			store = mockStore({
				...state,
				tokens: {
					...state.tokens,
					loading: true,
				},
			});
			const tree = mount(
				<Provider store={store}>
					<Router>
						<TokenList appID={1} />
					</Router>
				</Provider>,
			);
			expect(tree).toMatchSnapshot();
			// spinning prop is true
			expect(tree.find('Spin').at(0).props().spinning).toBe(true);
		});
		// tokens empty
		it('should match the snapshot when tokens are empty', () => {
			store = mockStore({
				...state,
				applications: {
					...state.applications,
					details: {
						1: {}
					},
				},
			});
			const tree = mount(
				<Provider store={store}>
					<Router>
						<TokenList appID={1} />
					</Router>
				</Provider>,
			);
			expect(tree).toMatchSnapshot();
			// console.log(tree.html());
			expect(tree.find('Empty').length).toBe(1);
		});
		// tokens not empty
		it('should match the snapshot when tokens are not empty', () => {
			store = mockStore(state);
			const tree = mount(
				<Provider store={store}>
					<Router>
						<TokenList appID={1} />
					</Router>
				</Provider>,
			);
			expect(tree).toMatchSnapshot();
			// TABLE should HAVE 2 ROWS
			expect(tree.find('Table').at(0).props().dataSource.length).toBe(2);
		});
	});

	describe('component testing', () => {
		// delete token
		it('should call deleteApplicationToken', () => {
			store = mockStore(state);
			const tree = mount(
				<Provider store={store}>
					<Router>
						<TokenList appID={1} />
					</Router>
				</Provider>,
			);

			// delete button should be there
			expect(tree.find('Button').at(0).props().type).toBe('danger');
			// text should be Revoke
			expect(tree.find('Button').at(0).text()).toBe('Revoke');
			// click on delete button
			tree.find(Popconfirm).at(0).props().onConfirm();

			// deleteApplicationToken should be called
			expect(deleteApplicationToken).toHaveBeenCalledWith(1, 1);
		});
	});
});
