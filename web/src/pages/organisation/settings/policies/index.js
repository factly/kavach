import React from 'react';
import { Skeleton, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getOrganisation } from '../../../../actions/organisations';
import PolicyList from './components/PolicyList';
import { getOrganisationPolicy } from '../../../../actions/policy';

export default function OrganisationPolicies() {
  const { orgID } = useParams();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getOrganisation(orgID));
    dispatch(getOrganisationPolicy());
  }, [orgID, dispatch]);

  const { organisation, loadingOrg, role, loading } = useSelector((state) => {
    return {
      organisation: state.organisations.details[orgID],
      loadingOrg: state.organisations.loading,
      role: state.profile.roles[state.organisations.selected],
      loading: state.profile.loading,
    };
  });

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {loading && loadingOrg ? (
        <Skeleton />
      ) : (
        <>
          <div className="organisation-descriptions-header">
            <div className="organisation-descriptions-title">
              <h2 className="organisation-title-main">Policies in {organisation?.title}</h2>
            </div>
            {role === 'owner' && (
              <div>
                <Link key="1" to={`/organisation/${orgID}/settings/policies/create`}>
                  <Button type="primary" icon={<PlusOutlined />}>
                    Create New Policies
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <PolicyList orgID={orgID} role={role} key={`policyList-${orgID}`} />
        </>
      )}
    </Space>
  );
}
