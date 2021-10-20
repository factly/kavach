import React from 'react';
import ApplicationList from './components/ApplicationList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addDefaultApplications } from '../../actions/application';
function Application() {
  const dispatch = useDispatch();
  const { application } = useSelector((state) => {
    return {
      application: state.applications.req[0],
    };
  });

  const addDefaultApps = () => {
    dispatch(addDefaultApplications()).then(() => window.location.reload());
  };
  return (
    <Space direction="vertical">
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        {application && application.data.length === 0 ? (
          <Button onClick={addDefaultApps}>Add Factly Applications</Button>
        ) : null}
        <Link key="1" to="/applications/create">
          <Button type="primary">New Application</Button>
        </Link>
      </div>
      <ApplicationList />
    </Space>
  );
}

export default Application;
