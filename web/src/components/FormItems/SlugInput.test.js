import React from "react";
import { render, shallow } from "enzyme";
import SlugInput from "./SlugInput";

describe('Slug Input Component', () => {
	it('should render and match snapshot', () => {
		const wrapper = render(<SlugInput />);
		expect(wrapper).toBeTruthy();
		expect(wrapper).toMatchSnapshot();
	});

	it('should render with props and match snapshot', () => {
		const props = { onChange: jest.fn(), inputProps: { placeholder: 'test' }, formItemProps: { label: 'test' } };
		const wrapper = render(<SlugInput {...props} />);
		expect(wrapper).toBeTruthy();
		expect(wrapper).toMatchSnapshot();
	});
	it('should render when onChange is not passed', () => {
		const props = { inputProps: { placeholder: 'test' }, formItemProps: { label: 'test' } };
		const wrapper = render(<SlugInput {...props} />);
		expect(wrapper).toBeTruthy();
		expect(wrapper).toMatchSnapshot();
	});
});
