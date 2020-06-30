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
  const selected = useSelector((state) => state.organizations.selected);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(getOrganizations());
  }, [dispatch]);

  return (
    <Layout hasSider={true}>
      <Sidebar />
      <Layout>
        <Header />
        <Layout.Content className="layout-content">
          <PageHeader location={location} />
          {selected > 0 ? (
            <Card key={selected.toString()} className="wrap-children-content">
              {children}
            </Card>
          ) : null}
        </Layout.Content>
        <Layout.Footer>Footer</Layout.Footer>
      </Layout>
    </Layout>
  );
}

export default withRouter(BasicLayout);
