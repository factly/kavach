import React from 'react';
import ApplicationList from './components/ApplicationList';
import {Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addDefaultApplications } from '../../actions/application';
function Application() {
  const dispatch = useDispatch();
  const { application } = useSelector((state) => {
    return {
      application: state.application.req[0],
    };
  });
    
  const addDefaultApps = () => {
    dispatch(addDefaultApplications()).then(() => window.location.reload());
  }
  return (
    <Space direction="vertical">
      <Space direction="horizontal">
        <Link key="1" to="/application/create">
          <Button>
            Create New
          </Button>
        </Link>
          { application && application.data.length === 0 ? 
            <Button onClick={addDefaultApps}>
              Add Factly Applications
            </Button> : null
          }  
      </Space>    
      <ApplicationList />
    </Space>
  );
}

export default Application;