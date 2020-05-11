import React from 'react';
import { Layout, Button, Divider } from 'antd';
import './basic.css';
import logo from '../assets/logo.svg';
import { LogoutOutlined } from '@ant-design/icons';

function BasicLayout(props) {
  const { Header, Footer, Content } = Layout;
  const { children } = props;

  return (
    <Layout>
      <Header className="layout-header">
        <div>
          <img alt="logo" className="menu-logo" src={logo} />
          <Divider type="vertical" />
          <a href={process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/browser/flows/logout'}>
            <Button>
              <LogoutOutlined />
              Logout
            </Button>
          </a>
        </div>
      </Header>
      <Content className="layout-content">{children}</Content>
      <Footer>Footer</Footer>
    </Layout>
  );
}

export default BasicLayout;
