import React from 'react';
import { Skeleton, Space, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getSpaceByID } from '../../../../../../actions/space';
import PolicyList from './components/PolicyList';
import { getSpacePolicy } from '../../../../../../actions/policy';

export default function SpacePolicies() {
  const { appID, spaceID } = useParams();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getSpacePolicy(appID, spaceID));
    dispatch(getSpaceByID(appID, spaceID));
  }, [appID, spaceID, dispatch]);

  const { space, loadingSpace, role, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[spaceID],
      loadingApp: state.applications.loading,
      role: state.profile.roles[state.organisations.selected],
      loading: state.profile.loading,
    };
  });

  return (
    <Space direction="vertical">
      <Link key="1" to={`/applications/${appID}/settings/spaces/${spaceID}/settings`}>
        <Button type="primary"> Goto Settings </Button>
      </Link>
      <h2>Policies in {space?.name}</h2>
      {loading && loadingSpace ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {role === 'owner' ? (
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Link
                key="1"
                to={`/applications/${appID}/settings/spaces/${spaceID}/settings/policies/create`}
              >
                <Button type="primary"> Create New Policies </Button>
              </Link>
            </div>
          ) : null}
          <PolicyList appID={appID} spaceID={spaceID} role={role} />
        </Space>
      )}
    </Space>
  );
}
