import React from 'react';
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import _ from 'lodash';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import PageHeader from './index';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({ pathname: '/users' }),
}));

describe('Page Header component', () => {
  describe('snapshot testing', () => {
    it('should render component', () => {
      const tree = mount(
        <Router>
          <PageHeader />
        </Router>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render component with no route found', () => {
      useLocation.mockReturnValue({ pathname: '/xyz' });
      const tree = mount(
        <Router>
          <PageHeader />
        </Router>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
});
