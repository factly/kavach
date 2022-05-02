import React from 'react';
import { Skeleton, Space, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import ApplicationRoleList from './components/RoleList';
import { getApplication } from '../../../../actions/application';

function ApplicationRoles() {
  const { id } = useParams();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getApplication(id));
  }, [id, dispatch]);

  const { application, loadingApp, role, loading } = useSelector((state) => {
    return {
      application: state.applications.details[id],
      loadingApp: state.applications.loading,
      role: state.profile.roles[state.organisations.selected],
      loading: state.profile.loading,
    };
  });

  return (
    <div>
      <h2>Roles in {application.name}</h2>
      {loading && loadingApp ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {role === 'owner' ? (
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Link
                key="1"
                to={{
                  pathname: `/applications/${id}/settings/roles/create`,
                }}
              >
                <Button type="primary"> Create New Role </Button>
              </Link>
            </div>
          ) : null}
          <ApplicationRoleList appID={id} role={role} />
        </Space>
      )}
    </div>
  );
}

export default ApplicationRoles;
