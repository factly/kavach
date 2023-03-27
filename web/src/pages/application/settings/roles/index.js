import React from 'react';
import { Skeleton, Space, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import ApplicationRoleList from './components/RoleList';
import { PlusOutlined } from '@ant-design/icons';
import { getApplication } from '../../../../actions/application';
import { getApplicationRoles } from '../../../../actions/roles';

function ApplicationRoles() {
  const { id } = useParams();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getApplication(id));
    dispatch(getApplicationRoles(id));
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
    <Space direction="vertical">
      {loading && loadingApp ? (
        <Skeleton />
      ) : (
        <>
          <div className="application-descriptions-header">
            <div className="application-descriptions-title">
              <h2 className="application-title-main">Roles</h2>
            </div>
            {role === 'owner' ? (
              <div>
                <Link
                  key="1"
                  to={{
                    pathname: `/applications/${id}/settings/roles/create`,
                  }}
                >
                  <Button icon={<PlusOutlined />} type="primary">
                    Create New Role
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
          <ApplicationRoleList appID={id} role={role} />
        </>
      )}
    </Space>
  );
}

export default ApplicationRoles;
