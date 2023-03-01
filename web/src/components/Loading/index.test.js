import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import Loading from './index';

describe('Loading tests', () => {
  it('should render and match snapshot', () => {
    let component = mount(<Loading />);
    expect(component).toMatchSnapshot();
  });
});
