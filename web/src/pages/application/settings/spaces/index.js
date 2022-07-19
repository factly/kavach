import React from 'react';
import { Button, Skeleton, Space } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getApplication } from '../../../../actions/application';
import SpaceList from './components/SpaceList';

export default function Spaces() {
  const dispatch = useDispatch();
  const { appID } = useParams();
  const { role, loading, application, loadingApp } = useSelector((state) => {
    return {
      role: state.profile.roles[state.organisations.selected],
      loading: state.profile.loading,
      application: state.applications.details[appID],
      loadingApp: state.applications.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getApplication(appID));
  }, [appID, dispatch]);

  return (
    <Space direction="vertical">      
      <Link key="1" to={`/applications/${appID}/settings`}>
        <Button type="primary"> Goto Settings </Button>
      </Link>
      <h2>Spaces in {application.name}</h2>
      {loading || loadingApp ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {role !== 'owner' ? null : (
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Link
                key="1"
                to={{
                  pathname: `/applications/${appID}/settings/spaces/create`,
                }}
              >
                <Button type="primary"> Create New Space </Button>
              </Link>
            </div>
          )}
          <SpaceList appID={appID} role={role} />
        </Space>
      )}
    </Space>
  );
}
