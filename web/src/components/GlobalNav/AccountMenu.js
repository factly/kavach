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

  return (
    <Menu mode="horizontal">
      <Menu.SubMenu
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
