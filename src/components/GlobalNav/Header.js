import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Divider, Row, Col } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, LogoutOutlined } from '@ant-design/icons';
import { toggleSider } from '../../actions/settings';

function Header() {
  const { Header: HeaderAnt } = Layout;
  // const [options, setOptions] = React.useState([]);
  const {
    settings: {
      sider: { collapsed },
    },
  } = useSelector((state) => state);
  const dispatch = useDispatch();
  const MenuFoldComponent = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined;

  return (
    <HeaderAnt className="layout-header">
      <Row>
        <Col xs={2} sm={4}>
          <MenuFoldComponent
            style={{ fontSize: '20px' }}
            className="trigger"
            onClick={() => dispatch(toggleSider())}
          />
          <Divider type="vertical" />
        </Col>
        <Col xs={22} sm={20}>
          <a href={process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/browser/flows/logout'}>
            <LogoutOutlined />
            Logout
          </a>
        </Col>
      </Row>
    </HeaderAnt>
  );
}

export default Header;
