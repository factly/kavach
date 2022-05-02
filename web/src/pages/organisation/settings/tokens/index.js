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
    <div>
      {loading || loadingOrg ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          <Link key="1" to={`/organisation`}>
            <Button type="primary"> Goto Settings </Button>
          </Link>
          <h2>Tokens in {organisation?.title}</h2>
          <Space direction="vertical">
            {role === 'owner' ? (
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                <Link
                  key="1"
                  to={{
                    pathname: `/organisation/${orgID}/settings/tokens/create`,
                  }}
                >
                  <Button type="primary"> Generate new tokens </Button>
                </Link>
              </div>
            ) : null}
            <TokenList orgID={orgID} role={role} />
          </Space>
        </Space>
      )}
    </div>
  );
}
