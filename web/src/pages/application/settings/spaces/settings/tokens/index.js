import React from 'react';
import { Skeleton, Space, Button } from 'antd';
import TokenList from './components/TokenList';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getSpaceByID } from '../../../../../../actions/space';

export default function SpaceTokens() {
  const { appID, spaceID } = useParams();
  const dispatch = useDispatch();
  const { role, loading, space, loadingSpace } = useSelector((state) => {
    return {
      role: state.profile.roles[state.organisations.selected],
      loading: state.profile.loading,
      space: state.spaces.details[spaceID],
      loadingSpace: state.spaces.loading,
    };
  });

  const fetchSpace = () => {
    dispatch(getSpaceByID(appID, spaceID));
  };

  React.useEffect(() => {
    fetchSpace();
    //eslint-disable-next-line
  }, []);
  return (
    <div 
      style={{
        display:'flex',
        flexDirection:'column',
        gap:'20px'
      }}
    >
      <Link key="1" to={`/applications/${appID}/settings/spaces/${spaceID}/settings`}>
        <Button type="primary"> Back to Settings </Button>
      </Link>
      <h2> Tokens in {space?.name}</h2>
      {loading || loadingSpace ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {role === 'owner' ? (
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Link
                key="1"
                to={{
                  pathname: `/applications/${appID}/settings/spaces/${spaceID}/settings/tokens/create`,
                }}
              >
                <Button type="primary"> Generate new tokens </Button>
              </Link>
            </div>
          ) : null}
          <TokenList appID={appID} spaceID={spaceID} role={role} />
        </Space>
      )}
    </div>
  );
}
