import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Divider, Space, Button } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { toggleSider } from '../../actions/settings';
import Search from './Search';
import AccountMenu from './AccountMenu';
import OrganizationSelector from './OrganizationSelector';
import { Link } from 'react-router-dom';

function Header() {
  const collapsed = useSelector((state) => state.settings.sider.collapsed);
  const dispatch = useDispatch();
  const MenuFoldComponent = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined;

  return (
    <Layout.Header className="layout-header">
      <Space direction="horizontal">
        <MenuFoldComponent
          style={{ fontSize: '20px' }}
          className="trigger"
          onClick={() => dispatch(toggleSider())}
        />
        <Divider type="vertical" />
        <Link to="/organization">
          <Button>New</Button>
        </Link>
        <OrganizationSelector />
        <Divider type="vertical" />
        <Search />
        <Divider type="vertical" />
        <AccountMenu style={{ float: 'right' }} />
      </Space>
    </Layout.Header>
  );
}

export default Header;
