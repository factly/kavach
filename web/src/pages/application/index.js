import React from 'react';
import ApplicationList from './components/ApplicationList';
import { Button, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addDefaultApplications, getApplications } from '../../actions/application';
import ErrorComponent from '../../components/ErrorsAndImage/ErrorComponent';
function Application() {
  const dispatch = useDispatch();
  React.useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const fetchApplications = () => {
    dispatch(getApplications());
  };

  const { applicationData, loadingApps, role, loadingRole } = useSelector((state) => {
    const applicationIds = state.organisations.details[state.organisations.selected]?.applications;
    return {
      applicationData: applicationIds.map((id) => state.applications.details[id]),
      loadingApps: state.applications.loading,
      role: state.organisations.details[state.organisations.selected].role,
      loadingRole: state.organisations.loading,
    };
  });

  const addDefaultApps = () => {
    dispatch(addDefaultApplications()).then(() => window.location.reload());
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        {loadingRole ? (
          <Skeleton />
        ) : role === 'owner' ? (
          loadingApps ? (
            <Skeleton />
          ) : applicationData.length === 0 ? (
            <div>
              <Button onClick={addDefaultApps}>Add Factly Applications</Button>
              <Link key="1" to="/applications/create">
                <Button type="primary">New Application</Button>
              </Link>
            </div>
          ) : (
            <Link key="1" to="/applications/create">
              <Button type="primary">New Application</Button>
            </Link>
          )
        ) : null}
      </div>
      {loadingApps ? (
        <Skeleton />
      ) : applicationData.length ? (
        <ApplicationList
          applicationList={applicationData}
          permission={loadingRole ? false : role === 'owner'}
          loading={loadingApps}
        />
      ) : (
        <ErrorComponent title="You have 0 applications" link="/organisation" message="Go Home" />
      )}
    </div>
  );
}

export default Application;
