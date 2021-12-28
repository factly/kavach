import React from 'react';
import { Menu } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Avatar } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from '../../actions/profile';
import { notification } from 'antd';

const AccountMenu = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => {
    return {
      profile: state.profile.details ? state.profile.details : null,
      loading: state.profile.loading,
    };
  });
  React.useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  const handleLogout = () => {
    fetch(process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/logout/browser', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        window.location.href = res.logout_url;
      })
      .catch(() => {
        notification.error({
          message: 'Error',
          description: 'Unable to logout',
        });
      });
  };
  return (
    <Menu mode="horizontal">
      <Menu.SubMenu
        key="submenu"
        title={
          <>
            {!loading && profile && profile.medium ? (
              <Avatar size="small" src={profile.medium.url?.proxy} />
            ) : (
              <UserOutlined />
            )}
          </>
        }
      >
        <Menu.Item key="password">
          <Link to="/password">
            <SafetyCertificateOutlined /> Security
          </Link>
        </Menu.Item>
        <Menu.Item key="profile">
          <Link to="/profile">
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
