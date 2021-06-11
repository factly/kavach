import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { toggleSider } from '../../actions/settings';
import routes from '../../config/routes';

const { Sider } = Layout;

function Sidebar() {
  const {
    sider: { collapsed },
    navTheme,
  } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  return (
    <Sider
      breakpoint="lg"
      width="256"
      theme={navTheme}
      collapsible
      collapsed={collapsed}
      trigger={null}
      onBreakpoint={(broken) => {
        dispatch(toggleSider());
      }}
    >
      <Link to="/">
        <div className="menu-header" style={{ backgroundColor: '#1890ff' }}>
          <img
            alt="logo"
            hidden={!collapsed}
            className="menu-logo"
            src={require('../../assets/kavach_icon.png')}
          />
          <img
            alt="logo"
            hidden={collapsed}
            src={require('../../assets/kavach.png')}
            style={{ width: '60%' }}
          />
        </div>
      </Link>
      <Menu theme={navTheme} mode="inline" className="slider-menu">
        {routes
          .filter((each) => each.enableNavigation === true)
          .map((route, index) => {
            const { Icon } = route;
            return (
              <Menu.Item key={index}>
                <Link to={route.path}>
                  <Icon></Icon>
                  <span>{route.title}</span>
                </Link>
              </Menu.Item>
            );
          })}
      </Menu>
    </Sider>
  );
}

export default Sidebar;
