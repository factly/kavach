import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import routes from '../../config/routes';
import { setCollapse } from './../../actions/sidebar';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
const { Sider } = Layout;

function Sidebar() {
  const {
    // sider: { collapsed },
    navTheme,
  } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const { collapsed } = useSelector((state) => state.sidebar);
  const onCollapse = (collapsed) => {
    collapsed ? dispatch(setCollapse(true)) : dispatch(setCollapse(false));
  };
  const buttonStyle = {
    borderRadius: '50px',
    padding: '0.25rem 0.5rem',
  };
  return (
    <Sider
      breakpoint="xl"
      className="main-sidebar"
      width="256"
      theme={navTheme}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      collapsedWidth={48}
      trigger={null}
      style={{
        position: 'sticky',
        background: '#f0f2f5',
        left: 0,
        top: 0,
        overflow: 'auto',
        height: '100vh',
      }}
    >
      <Link to="/settings">
        <div className="menu-header">
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
      <Menu
        theme={navTheme}
        mode="inline"
        className="slider-menu"
        style={{ background: '#f0f2f5' }}
      >
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
      {!collapsed ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 24px',
            lineHeight: '40px',
            alignItems: 'center',
            width: '100%',
            position: 'absolute',
            bottom: '0',
            background: '#f0f2f5',
          }}
        >
          <div>
            <Button
              style={{ ...buttonStyle, marginLeft: '0.25rem' }}
              onClick={() => onCollapse(true)}
            >
              <MenuFoldOutlined />
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 8px',
            lineHeight: '40px',
            alignItems: 'center',
            width: '100%',
            position: 'absolute',
            bottom: '0',
            background: '#f0f2f5',
          }}
        >
          <Button style={buttonStyle} onClick={() => onCollapse(false)}>
            <MenuUnfoldOutlined />
          </Button>
        </div>
      )}
    </Sider>
  );
}

export default Sidebar;
