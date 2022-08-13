import React from 'react';
import { Skeleton, Space, Button} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getOrganisation } from '../../../../actions/organisations';
import PolicyList from './components/PolicyList';
import { getOrganisationRoles } from '../../../../actions/roles';
import { getOrganisationPolicy } from '../../../../actions/policy';

export default function OrganisationPolicies() {
  const { orgID } = useParams();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getOrganisation(orgID));
    // dispatch(getOrganisationRoles())
    dispatch(getOrganisationPolicy())
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
    <Space direction="vertical">
      <Link key="1" to={`/organisation`}>
        <Button type="primary"> Back to Settings </Button>
      </Link>
      <h2
        style={{
          marginTop: 20
        }}
        >Policies in {organisation?.title}</h2>
      {loading && loadingOrg ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {role === 'owner' ? (
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Link key="1" to={`/organisation/${orgID}/settings/policies/create`}>
                <Button type="primary"> Create New Policies </Button>
              </Link>
            </div>
          ) : null}
          <PolicyList orgID={orgID} role={role} key={`policyList-${orgID}`}/>
        </Space>
      )}
    </Space>
  );
}
