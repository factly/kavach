import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import FormComponent from "./OrganisationForm"
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import thunk from "redux-thunk";
import { useHistory } from 'react-router-dom';
import { Provider, useDispatch } from "react-redux";
import configureMockStore from 'redux-mock-store';
import '../../../matchMedia.mock'
import { addOrganisation } from "../../../actions/organisations";
jest.mock('../../../actions/organisations', () => ({
	addOrganisation: jest.fn(),
	getOrganisations: jest.fn(),
}));
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

describe("Organisation Form", () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	store.dispatch = jest.fn(() => ({}));
	const push = jest.fn();
	useHistory.mockReturnValue({ push });

	describe("Snapshot tests", () => {
		const description = "should render the component "
		it(description + "when loading is true", () => {
			store = mockStore({
				organisations: {
					loading: true,
				},
			});

			const component = mount(
				<Provider store={store}>
					<FormComponent />
				</Provider>
			)
			expect(component).toMatchSnapshot()
		})
		it(description + "when loading is false REACT_APP_ENABLE_MULTITENANCY is 'false' orgCount >= 1", () => {
			window.REACT_APP_ENABLE_MULTITENANCY = 'false'
			store = mockStore({
				organisations: {
					loading: false,
					ids: [1, 2, 3],
				},
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<FormComponent />
					</Router>
				</Provider>
			)
			expect(component).toMatchSnapshot()
		})
		it(description + "when loading is false REACT_APP_ENABLE_MULTITENANCY is 'true' orgCount < 1", () => {
			window.REACT_APP_ENABLE_MULTITENANCY = 'true'
			store = mockStore({
				organisations: {
					loading: false,
					ids: [],
				},

				media: {
					details: {
						1: { id: 1, media_type: 'image', media_url: 'http://example.com', },
					},
				},
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<FormComponent />
					</Router>
				</Provider>
			)
			expect(component).toMatchSnapshot()
		})
		it(description + "when loading is false REACT_APP_ENABLE_MULTITENANCY is 'false' orgCount < 1", () => {
			window.REACT_APP_ENABLE_MULTITENANCY = 'false'
			store = mockStore({
				organisations: {
					loading: false,
					ids: [],
				},
				media: {
					details: {
						1: { id: 1, media_type: 'image', media_url: 'http://example.com', },
					},
				},
			});
			const component = mount(
				<Provider store={store}>
					<Router>
						<FormComponent />
					</Router>
				</Provider>
			)
			expect(component).toMatchSnapshot()
		})
	})
	describe("Function tests", () => {
		// mock the MediaSelector component
		jest.doMock('../../../components/MediaSelector/index', () => {
			return jest.fn().mockImplementation(() => {
				return <div>MediaSelector</div>
			})
		})

		it("should handle submit for form", (done) => {
			store = mockStore({
				organisations: {
					loading: false,
					ids: [],
				},
				media: {
					req: [],
					details: {
						1: { id: 1, media_type: 'image', media_url: 'http://example.com', },
					},
				},
			});

			const component = mount(
				<Provider store={store}>
					<Router>
						<FormComponent />
					</Router>
				</Provider>
			)

			act(() => {
				component.find('input').at(0).simulate('change', { target: { value: 'title' } })
				component.find('input').at(1).simulate('change', { target: { value: 'slug' } })
				component.find('TextArea').simulate('change', { target: { value: 'description' } })
				const btn = component.find({ htmlType: 'submit' })
				expect(btn.text()).toBe('Save')
				component.find('form').simulate('submit')
			})
			setTimeout(() => {
				expect(addOrganisation).toHaveBeenCalled()
				expect(addOrganisation).toHaveBeenCalledWith({
					title: 'title',
					slug: 'slug',
					description: 'description',
					featured_medium_id: undefined
				})
				expect(push).toHaveBeenCalledWith('/organisation')
				done()
			})
		})
	})
})
