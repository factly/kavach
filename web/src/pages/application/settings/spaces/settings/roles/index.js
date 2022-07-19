import React from 'react';
import { Skeleton, Space, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import SpaceRoleList from './components/RoleList';
import { getSpaceByID } from '../../../../../../actions/space';

export default function SpaceRoles() {
  const { appID, spaceID } = useParams();
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(getSpaceByID(appID, spaceID));
  }, [dispatch, appID, spaceID]);

  const { space, loadingSpace, role, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[spaceID],
      loadingSpace: state.spaces.loading,
      role: state.profile.roles[state.organisations.selected],
      loading: state.profile.loading,
    };
  });

  return (
    <Space direction="vertical">
      <Link key="1" to={`/applications/${appID}/settings/spaces/${spaceID}/settings`}>
        <Button type="primary"> Goto Settings </Button>
      </Link>
      <h2>Roles in {space?.name}</h2>
      {loading && loadingSpace ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {role === 'owner' ? (
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Link
                key="1"
                to={{
                  pathname: `/applications/${appID}/settings/spaces/${spaceID}/settings/roles/create`,
                }}
              >
                <Button type="primary"> Create New Role </Button>
              </Link>
            </div>
          ) : null}
          <SpaceRoleList appID={appID} role={role} spaceID={spaceID} />
        </Space>
      )}
    </Space>
  );
}
