import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Divider, Button } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { toggleSider } from '../../actions/settings';
import AccountMenu from './AccountMenu';
import OrganisationSelector from './OrganisationSelector';
import { Link } from 'react-router-dom';

function Header() {
  const collapsed = useSelector((state) => state.settings.sider.collapsed);
  const dispatch = useDispatch();
  const MenuFoldComponent = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined;

  return (
    <Layout.Header className="layout-header">
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <MenuFoldComponent
          style={{ fontSize: '20px', marginRight: 'auto' }}
          className="trigger"
          onClick={() => dispatch(toggleSider())}
        />
        <Divider type="vertical" />
        <Link to="/organisation">
          <Button>New</Button>
        </Link>
        <OrganisationSelector />
        <Divider type="vertical" />
        <AccountMenu style={{ float: 'right' }} />
      </div>
    </Layout.Header>
  );
}

export default Header;
