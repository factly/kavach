import React from 'react';
import { Skeleton, Space, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getApplication } from '../../../../actions/application';
import PolicyList from './components/PolicyList';

export default function ApplicationPolicies() {
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
    <Space direction="vertical">
      <Link key="1" to={`/applications/${id}/settings`}>
        <Button type="primary"> Goto Settings </Button>
      </Link>
      <h2>Policies in {application.name}</h2>
      {loading && loadingApp ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {role === 'owner' ? (
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Link key="1" to={`/applications/${id}/settings/policies/create`}>
                <Button type="primary"> Create New Policies </Button>
              </Link>
            </div>
          ) : null}
          <PolicyList appID={id} role={role} />
        </Space>
      )}
    </Space>
  );
}
