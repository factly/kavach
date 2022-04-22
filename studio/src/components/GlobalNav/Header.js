import React from 'react';
import { Layout, Divider } from 'antd';
import AccountMenu from './AccountMenu';

function Header() {
  return (
    <Layout.Header className="layout-header">
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Divider type="vertical" />
        <AccountMenu style={{ float: 'right' }} />
      </div>
    </Layout.Header>
  );
}

export default Header;
