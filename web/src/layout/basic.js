import React from 'react';
import { Layout, Card, notification } from 'antd';
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

  const { type, message, description, time } = useSelector((state) => state.notifications);

  React.useEffect(() => {
    dispatch(getOrganisations());
  }, [dispatch]);
  React.useEffect(() => {
    if (type && message && description && selected !== 0) {
      notification[type]({
        message: message,
        description: description,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description, time]);

  return (
    <Layout hasSider={true}>
      <Sidebar />
      <Layout style={{ background: '#fff' }}>
        <Header />
        <Layout.Content className="layout-content">
            <div key={selected.toString()} className="wrap-children-content">
              {children}
            </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

export default withRouter(BasicLayout);
