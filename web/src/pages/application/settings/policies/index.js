import React from 'react';
import { Skeleton, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getApplication } from '../../../../actions/application';
import PolicyList from './components/PolicyList';
import { getApplicationPolicy } from '../../../../actions/policy';
import { getApplicationRoles } from '../../../../actions/roles';

export default function ApplicationPolicies() {
  const { id } = useParams();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getApplication(id));
    dispatch(getApplicationRoles(id));
    dispatch(getApplicationPolicy(id));
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
    <Space direction="vertical" style={{ width: '100%' }}>
      {loading && loadingApp ? (
        <Skeleton />
      ) : (
        <>
          <div className="organisation-descriptions-header">
            <div className="organisation-descriptions-title">
              <h2 className="organisation-title-main">Policies in {application.name}</h2>
            </div>
            {role === 'owner' ? (
              <div>
                <Link key="1" to={`/applications/${id}/settings/policies/create`}>
                  <Button type="primary" icon={<PlusOutlined />}>
                    Create New Policies
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
          <PolicyList appID={id} role={role} />
        </>
      )}
    </Space>
  );
}
