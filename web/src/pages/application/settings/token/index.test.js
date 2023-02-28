{
	"credentials": "include",
},
import '../../../../matchMedia.mock';
import { Popconfirm, Button, Table } from 'antd';

import ApplicationTokens  from './index';

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

jest.mock('./components/TokenList', () => {
	return {
		__esModule: true,
		default: () => <div>TokenList</div>,
	}
});

let state = {
	organisations: {
		selected: 1,
	},
	applications: {
		details: {
			1: {
				id: 1, 	name: 'Test Application', 	description: 'Test Description', 	tokens: [1, 2], 			},
			},
		loading: false,
	},
	profile: {
		roles: {
			1: 'owner',
		},
		loading: false,
	},
};

describe('ApplicationTokens component', () => {
	let store;
	const mockedDispatch = jest.fn();
	mockedDispatch.mockReturnValue(Promise.resolve());
	useDispatch.mockReturnValue(mockedDispatch);
	store = mockStore({});
	const push = jest.fn();
	useHistory.mockReturnValueOnce({ push });

	it('should render component when loading is true', () => {
		store = mockStore({
			...state,
			applications: {
				...state.applications,
				loading: true,
			},
		});
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ApplicationTokens />
				</Router>
			</Provider>,
		);
		expect(wrapper).toMatchSnapshot();
		// skeleton should be rendered
		expect(wrapper.find('Skeleton').length).toBe(1);
	});
	it('should render component when loading role is true', () => {
		store = mockStore({
			...state,
			profile: {
				...state.profile,
				loading: true,
			},
		});
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ApplicationTokens />
				</Router>
			</Provider>,
		);
		expect(wrapper).toMatchSnapshot();
		// skeleton should be rendered
		expect(wrapper.find('Skeleton').length).toBe(1);
	});

	it('should render component when role is owner', () => {
		store = mockStore(state);
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ApplicationTokens />
				</Router>
			</Provider>,
		);
		expect(wrapper).toMatchSnapshot();
		// skeleton should be rendered
		expect(wrapper.find('Skeleton').length).toBe(0);
		// button at 1st index should be rendered with text ' Generate new tokens '
		expect(wrapper.find('Button').at(1).text()).toBe(' Generate new tokens ');
	});
	it('should render component when role is not owner', () => {
		store = mockStore({
			...state,
			profile: {
				...state.profile,
				roles: {
					1: 'admin',
				},
			},
		});
		const wrapper = mount(
			<Provider store={store}>
				<Router>
					<ApplicationTokens />
				</Router>
			</Provider>,
		);
		expect(wrapper).toMatchSnapshot();
		// skeleton should be rendered
		expect(wrapper.find('Skeleton').length).toBe(0);
		// button at 1st index should be rendered with text ' Generate new tokens '
		expect(wrapper.find('Button').length).toBe(1);
	});

});
