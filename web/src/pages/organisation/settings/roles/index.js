import React from 'react';
import { Skeleton, Space, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getOrganisation } from '../../../../actions/organisations';
import OrganisationRoleList from './components/RoleList';

function OrganisationRoles() {
  const { orgID } = useParams();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getOrganisation(orgID));
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
        <Button type="primary"> Goto Settings </Button>
      </Link>
      <h2>Roles in {organisation?.title}</h2>
      {loading && loadingOrg ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {role === 'owner' ? (
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Link
                key="1"
                to={{
                  pathname: `/organisation/${orgID}/settings/roles/create`,
                }}
              >
                <Button type="primary"> Create New Role </Button>
              </Link>
            </div>
          ) : null}
          <OrganisationRoleList orgID={orgID} role={role} />
        </Space>
      )}
    </Space>
  );
}

export default OrganisationRoles;
