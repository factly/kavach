import React from 'react';
import ApplicationList from './components/ApplicationList';
import { Button, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getApplications } from '../../actions/application';
import ErrorComponent from '../../components/ErrorsAndImage/ErrorComponent';
import '../../styles/application.css';

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
      applicationData: applicationIds.map((id) => ({
        ...state.applications.details[id],
        medium: state.media.details?.[state.applications.details[id]?.medium_id],
      })),
      loadingApps: state.applications.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });

  return (
    <div>
      {loadingRole ? (
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <Skeleton />
        </div>
      ) : role === 'owner' ? (
        loadingApps ? (
          <div style={{ display: 'flex', justifyContent: 'end' }}>
            <Skeleton />
          </div>
        ) : (
          <div className="application-descriptions-header">
            <div className="application-descriptions-title">
              <h2 className="application-title-main">Applications</h2>
            </div>
            <div className="applications-descriptions-extra">
              <Link key="1" to="/applications/type">
                <Button type="primary">Manage Application</Button>
              </Link>
            </div>
          </div>
        )
      ) : null}

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
