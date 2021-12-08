import React from 'react';
import ApplicationList from './components/ApplicationList';
import { Button, Skeleton} from 'antd';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addDefaultApplications, getApplications } from '../../actions/application';
import ErrorComponent from '../../components/ErrorsAndImage/ErrorComponent';
function Application() {
  const dispatch = useDispatch();
  var buttonFlag = true;
  React.useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const fetchApplications = () => {
    dispatch(getApplications());
  };

  const { applicationData, userDetails, loadingUsers, userID, loadingID } = useSelector((state) => {
    return {
      applicationData: state.applications,
      userDetails: state.users.details,
      loadingUsers: state.users.loading,
      userID: state.profile.details.id,
      loadingID: state.profile.loading,
    };
  });
  if (!loadingUsers && !loadingID) {
    if (userDetails[userID].permission.role === 'member') {
      buttonFlag = false;
    }
  }

  const addDefaultApps = () => {
    dispatch(addDefaultApplications()).then(() => window.location.reload());
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        {
          (buttonFlag) ?
            (applicationData.loading) ? 
              (<Skeleton/>)
              :(applicationData.req[0].data.length===0) ?
                  (
                  <div>
                    <Button onClick={addDefaultApps}>Add Factly Applications</Button>
                    <Link key="1" to="/applications/create">
                      <Button type="primary">New Application</Button>
                    </Link>
                  </div>
                  ):
                  (
                  <Link key="1" to="/applications/create">
                    <Button type="primary">New Application</Button>
                  </Link>
                  )
            :(null)
        }
      </div>
      {
        (applicationData.loading) ? 
          <Skeleton/> :
          (applicationData.req[0].data.length) ? <ApplicationList applicationList={applicationData} permission={buttonFlag}/> : <ErrorComponent title="You have 0 applications" link="/organisation" message="Go Home"/>
      }
    </div>
  );
}

export default Application;
