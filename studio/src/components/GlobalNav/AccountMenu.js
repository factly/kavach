import React from 'react';
import { Menu } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const AccountMenu = () => {
  const handleLogout = () => {};
  return (
    <Menu mode="horizontal">
      <Menu.SubMenu key="submenu" title={<UserOutlined />}>
        <Menu.Item key="password">
          <Link to="#">
            <SafetyCertificateOutlined /> Security
          </Link>
        </Menu.Item>
        <Menu.Item key="profile">
          <Link to="#">
            <EditOutlined /> Profile
          </Link>
        </Menu.Item>
        <Menu.Item key="logout" onClick={handleLogout}>
          <LogoutOutlined />
          Logout
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};

export default AccountMenu;
