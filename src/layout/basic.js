import React from 'react';
import { Layout, Card } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Header from '../components/GlobalNav/Header';
import Sidebar from '../components/GlobalNav/Sidebar';
import PageHeader from '../components/PageHeader';
import { getOrganisations } from '../actions/organisations';
import './basic.css';

function BasicLayout(props) {
  const { location } = props;
  const { children } = props;
  const selected = useSelector((state) => state.organisations.selected);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(getOrganisations());
  }, [dispatch]);

  return (
    <Layout hasSider={true}>
      <Sidebar />
      <Layout>
        <Header />
        <Layout.Content className="layout-content">
          <PageHeader location={location} />
          {selected > 0 || location.pathname === '/organisation' ? (
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
