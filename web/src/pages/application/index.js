import React from 'react';
import ApplicationList from './components/ApplicationList';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addDefaultApplications } from '../../actions/application';

function Application() {
  const dispatch = useDispatch();
  var buttonFlag = true
  const { application, userDetails, loadingUsers, userID, loadingID } = useSelector((state) => {
    return {
      application: state.applications.req[0],
      userDetails: state.users.details,
      loadingUsers: state.users.loading,
      userID: state.profile.details.id,
      loadingID: state.profile.loading
    };
  });

  if(!loadingUsers&&!loadingID){
    if(userDetails[userID].permission.role==='member'){
      buttonFlag = false
    }
  }

  const addDefaultApps = () => {
    dispatch(addDefaultApplications()).then(() => window.location.reload());
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        {application && application.data.length === 0 ? (
          <Button onClick={addDefaultApps}>Add Factly Applications</Button>
        ) : null}
        {
          buttonFlag ?
          (
            <Link key="1" to="/applications/create">
              <Button type="primary">New Application</Button>
            </Link>
          ):
          (null)
        }

      </div>
      <ApplicationList />
    </div>
  );
}

export default Application;
