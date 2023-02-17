import React from "react";
import PlaceholderImage from "./PlaceholderImage";
import { render, shallow } from "enzyme";

describe("PlaceholderImage", () => {
	it("should render the component", () => {
		const props = { width: "100%", height: "auto", maxWidth: "240px" };
		let component = shallow(<PlaceholderImage {...props} />);
		expect(component).toMatchSnapshot();
	});

	it("should render the component when maxWidth undefined", () => {
		const props = { width: "100%", height: "auto" };
		let component = render(<PlaceholderImage {...props} />);
		expect(component).toMatchSnapshot();
		expect(component.attr("style")).toEqual("object-fit:contain;padding:1rem;max-width:240px");
	});
});
