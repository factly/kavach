import React from 'react';
import { shallow } from 'enzyme';

import BrandingComponent from "./index";

describe("BrandingComponent", () => {
	it("should render the component", () => {
		let component = shallow(<BrandingComponent />);
		expect(component).toMatchSnapshot();
	});
});
