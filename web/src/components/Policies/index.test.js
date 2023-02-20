import React from "react";
import { mount, shallow } from "enzyme";
import { render } from "@testing-library/react";
import { PermissionForm } from "./index";
import DynamicPermissionField from "./index";

describe("PermissionForm", () => {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: jest.fn().mockImplementation(query => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: jest.fn(), // Deprecated
			removeListener: jest.fn(), // Deprecated
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn(),
		})),
	});
	it("renders and matches snapshot", () => {
		const props = {
			permission: {
				name: "test",
				actions: ["read", "write"],
			},
			index: 0,
			remove: jest.fn(),
		};
		const wrapper = mount(<PermissionForm {...props} />);
		expect(wrapper).toMatchSnapshot();
	});

	it("calls remove function when remove button is clicked", () => {
		const props = {
			permission: {
				name: "test",
				actions: ["read", "write"],
			},
			index: 0,
			remove: jest.fn(),
		};
		const wrapper = mount(<PermissionForm {...props} />);
		wrapper.find("button").simulate("click");
		expect(props.remove).toHaveBeenCalled();
	});
});

describe("DynamicPermissionField", () => {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: jest.fn().mockImplementation(query => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: jest.fn(), // Deprecated
			removeListener: jest.fn(), // Deprecated
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn(),
		})),
	});
	it("renders and matches snapshot", () => {
		const props = {
			type: "create",
		};
		const wrapper = mount(<DynamicPermissionField {...props} />);
		expect(wrapper).toMatchSnapshot();
	});

	it("renders and matches snapshot", () => {
		const props = {
			type: "edit",
		};
		const wrapper = mount(<DynamicPermissionField {...props} />);
		expect(wrapper).toMatchSnapshot();
	});

	it("calls add function when add button is clicked", () => {
		const props = {
			type: "create",
		};
		const wrapper = mount(<DynamicPermissionField {...props} />);
		wrapper.find({ type: "dashed" }).simulate("click");
		expect(wrapper.find("button").length).toEqual(2);
	});

	test.todo('should render component when permissions are present');
});
