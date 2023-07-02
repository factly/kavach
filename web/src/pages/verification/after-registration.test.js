import React from "react";
import { mount, render } from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import VerificationAfterRegistration from "./index";
import "../../matchMedia.mock";

// mock 'react-lottie'
jest.mock("react-lottie", () => {
	return jest.fn().mockImplementation(({ props }) => {
		return (
			<div className="react-lottie" {...props}>
				react-lottie
			</div>
		)
	});
});


describe('VerificationAfterRegistration', () => {
	it("should render without errors", () => {
		const component = mount(
			<Router>
				<VerificationAfterRegistration />
			</Router>
		);
		expect(component).toMatchSnapshot();
		expect(component.find('mockConstructor').length).toBe(1);
	});
})
