import React from 'react';
import { Skeleton, Space, Button } from 'antd';
import TokenList from './components/TokenList';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

export default function ApplicationTokens() {
  const { id } = useParams();
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
        <Button type="primary"> Back to Settings </Button>
      </Link>
      <h2>Tokens in {application.name}</h2>
      {loading || loadingApp ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {role === 'owner' ? (
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Link
                key="1"
                to={{
                  pathname: `/applications/${id}/settings/tokens/create`,
                }}
              >
                <Button type="primary"> Generate new tokens </Button>
              </Link>
            </div>
          ) : null}
          <TokenList appID={id} application={application} role={role} />
        </Space>
      )}
    </Space>
  );
}
