import React from 'react';
import { Skeleton, Space, Button } from 'antd';
import TokenList from './components/OrganisationTokenList';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

export default function OrganisationTokens() {
  const { orgID } = useParams();
  const { organisation, loadingOrg, role, loading } = useSelector((state) => {
    return {
      organisation: state.organisations.details[orgID],
      loadingOrg: state.organisations.loading,
      role: state.profile.roles[state.organisations.selected],
      loading: state.profile.loading,
    };
  });

  return (
    <Space direction="vertical">
      {loading || loadingOrg ? (
        <Skeleton />
      ) : (
        <>
          <div className="organisation-descriptions-header">
            <div className="organisation-descriptions-title">
              <h2 className="organisation-title-main">Tokens in {organisation?.title}</h2>
            </div>
            {role === 'owner' ? (
              <div>
                <Link
                  key="1"
                  to={{
                    pathname: `/organisation/${orgID}/settings/tokens/create`,
                  }}
                >
                  <Button type="primary">Create new Tokens</Button>
                </Link>
              </div>
            ) : null}
          </div>
          <TokenList orgID={orgID} role={role} />
        </>
      )}
    </Space>
  );
}
