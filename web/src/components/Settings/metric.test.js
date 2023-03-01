import React from 'react';
import { mount } from 'enzyme';

import Metric from './metric';

describe('Metric', () => {
  it('should render and match snapshot with props passed', () => {
    const wrapper = mount(<Metric count={1} header="Test" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render and match snapshot without optional props passed', () => {
    const wrapper = mount(<Metric header={'test'} />);
    expect(wrapper).toMatchSnapshot();
  });
});
