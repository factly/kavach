import React from 'react';
import { Button, Skeleton, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
    <Space direction="vertical" style={{ width: '100%' }}>
      {loading || loadingApp ? (
        <Skeleton />
      ) : (
        <>
          <div className="application-descriptions-header">
            <div className="application-descriptions-title">
              <h2 className="application-title-main">Spaces in {application.name}</h2>
            </div>
            {role !== 'owner' ? null : (
              <div>
                <Link
                  key="1"
                  to={{
                    pathname: `/applications/${appID}/settings/spaces/create`,
                  }}
                >
                  <Button type="primary" icon={<PlusOutlined />}>
                    Create New Space
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <SpaceList appID={appID} role={role} />
        </>
      )}
    </Space>
  );
}
