import reducer from './settings';
import * as types from '../constants/settings';

const initialState = {
  navTheme: 'light',
  primaryColor: '#242b47',
  layout: 'sidemenu',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: false,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title: 'Kavach',
  pwa: false,
  iconfontUrl: '',
  sider: {
    collapsed: true,
  },
};

describe('settings reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should handle case when no state and action is passed is passed', () => {
    expect(reducer()).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        navTheme: 'light',
        primaryColor: '#242b47',
        layout: 'sidemenu',
        contentWidth: 'Fluid',
        fixedHeader: false,
        fixSiderbar: false,
        colorWeak: false,
        menu: {
          locale: false,
        },
        title: 'Dega',
        pwa: false,
        iconfontUrl: '',
        sider: {
          collapsed: false,
        },
      }),
    ).toEqual({
      navTheme: 'light',
      primaryColor: '#242b47',
      layout: 'sidemenu',
      contentWidth: 'Fluid',
      fixedHeader: false,
      fixSiderbar: false,
      colorWeak: false,
      menu: {
        locale: false,
      },
      title: 'Dega',
      pwa: false,
      iconfontUrl: '',
      sider: {
        collapsed: false,
      },
    });
  });
  it('should change sider to true when false', () => {
    expect(
      reducer(
        {
          navTheme: 'light',
          primaryColor: '#242b47',
          layout: 'sidemenu',
          contentWidth: 'Fluid',
          fixedHeader: false,
          fixSiderbar: false,
          colorWeak: false,
          menu: {
            locale: true,
          },
          title: 'Dega Admin',
          pwa: false,
          iconfontUrl: '',
          sider: {
            collapsed: false,
          },
        },
        {
          type: types.TOGGLE_SIDER,
        },
      ),
    ).toEqual({
      navTheme: 'light',
      primaryColor: '#242b47',
      layout: 'sidemenu',
      contentWidth: 'Fluid',
      fixedHeader: false,
      fixSiderbar: false,
      colorWeak: false,
      menu: {
        locale: true,
      },
      title: 'Dega Admin',
      pwa: false,
      iconfontUrl: '',
      sider: {
        collapsed: true,
      },
    });
  });
  it('should change sider to false when true', () => {
    expect(
      reducer(
        {
          navTheme: 'light',
          primaryColor: '#242b47',
          layout: 'sidemenu',
          contentWidth: 'Fluid',
          fixedHeader: false,
          fixSiderbar: false,
          colorWeak: false,
          menu: {
            locale: true,
          },
          title: 'Dega Admin',
          pwa: false,
          iconfontUrl: '',
          sider: {
            collapsed: true,
          },
        },
        {
          type: types.TOGGLE_SIDER,
        },
      ),
    ).toEqual({
      navTheme: 'light',
      primaryColor: '#242b47',
      layout: 'sidemenu',
      contentWidth: 'Fluid',
      fixedHeader: false,
      fixSiderbar: false,
      colorWeak: false,
      menu: {
        locale: true,
      },
      title: 'Dega Admin',
      pwa: false,
      iconfontUrl: '',
      sider: {
        collapsed: false,
      },
    });
  });
});
