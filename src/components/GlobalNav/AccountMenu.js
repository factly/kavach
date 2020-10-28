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
  return (
    <Menu mode="horizontal">
      <Menu.SubMenu
        title={
          <>
            <UserOutlined />
          </>
        }
      >
        <Menu.Item>
          <Link to="/password">
            <SafetyCertificateOutlined /> Security
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/profile">
            <EditOutlined /> Profile
          </Link>
        </Menu.Item>
        <Menu.Item>
          <a href={window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/browser/flows/logout'}>
            <LogoutOutlined />
            Logout
          </a>
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};

export default AccountMenu;
