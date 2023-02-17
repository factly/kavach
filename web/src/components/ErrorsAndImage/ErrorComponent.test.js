import React from 'react';
import { shallow } from 'enzyme';

import ErrorComponent from './ErrorComponent';

describe('ErrorComponent', () => {

	it('should render the component', () => {
		const props = { status: 'warning', title: 'Warning', link: '/home', message: 'Go Home' };
		let component = shallow(<ErrorComponent {...props} />);
		expect(component).toMatchSnapshot();
	});

	it('should have link and message as extra', () => {
		const props = { status: 'warning', title: 'Warning', link: '/home', message: 'Go Home' };
		let component = shallow(<ErrorComponent {...props} />);

		expect(component.props().extra.props.to).toEqual('/home');
		expect(component.props().extra.props.children.props.type).toEqual('primary');
	});

	it('should render the component when status undefined', () => {
		const props = { title: 'Warning', link: '/home', message: 'Go Home' };
		let component = shallow(<ErrorComponent {...props} />);
		expect(component).toMatchSnapshot();
		expect(component.props().status).toEqual('warning');
	});

});
