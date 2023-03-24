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
      {loading || loadingApp ? (
        <Skeleton />
      ) : (
        <>
          <div className="application-descriptions-header">
            <div className="application-descriptions-title">
              <h2 className="application-title-main">Tokens in {application.name}</h2>
            </div>
            {role === 'owner' ? (
              <div>
                <Link
                  key="1"
                  to={{
                    pathname: `/applications/${id}/settings/tokens/create`,
                  }}
                >
                  <Button type="primary">Create new Tokens</Button>
                </Link>
              </div>
            ) : null}
          </div>
          <TokenList appID={id} application={application} role={role} />
        </>
      )}
    </Space>
  );
}
