import React from 'react';
import { Layout, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import Sidebar from '../components/GlobalNav/Sidebar';
import Header from '../components/GlobalNav/Header';
import './basic.css';
import { useSelector, useDispatch } from 'react-redux';
import { getOrganizations } from '../actions/organizations';
import PageHeader from '../components/PageHeader';

function BasicLayout(props) {
  const { location } = props;
  const { children } = props;
  const { navTheme } = useSelector((state) => state.settings);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(getOrganizations());
  }, [dispatch]);

  return (
    <Layout hasSider={true}>
      <Sidebar navTheme={navTheme} />
      <Layout>
        <Header />
        <Layout.Content className="layout-content">
          <PageHeader location={location} />
          <Card className="wrap-children-content">{children}</Card>
        </Layout.Content>
        <Layout.Footer>Footer</Layout.Footer>
      </Layout>
    </Layout>
  );
}

export default withRouter(BasicLayout);
