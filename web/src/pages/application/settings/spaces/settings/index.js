import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSpaceByID } from '../../../../../actions/space';
import SettingsList from '../../../../../components/Settings';
import { Descriptions, Divider, Space, Skeleton } from 'antd';

export default function SpaceSettings() {
  const { appID, spaceID } = useParams();
  const dispatch = useDispatch();
  const descriptionSpan = 3;
  const { space, loadingSpace } = useSelector((state) => {
    return {
      space: state.spaces.details[spaceID],
      loadingSpace: state.spaces.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getSpaceByID(appID, spaceID));
    //eslint-disable-next-line
  }, [appID, spaceID]);

  return (
    <div>
      {loadingSpace ? (
        <Skeleton />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Descriptions title={<h2> Manage Space </h2>} bordered={true}>
            <Descriptions.Item label="Name" span={descriptionSpan}>
              {space?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={descriptionSpan}>
              {space?.description}
            </Descriptions.Item>
            <Descriptions.Item label="Number of users" span={descriptionSpan}>
              {(space?.users?.length) ? space?.users?.length : 0}
            </Descriptions.Item>
            <Descriptions.Item label="Number of Tokens" span={descriptionSpan}>
              {space?.tokens?.length ? space.tokens.length : 0}
            </Descriptions.Item>
          </Descriptions>
          <Divider> Space Settings</Divider>
          <SettingsList type="space" appID={appID} spaceID={spaceID} />
        </Space>
      )}
    </div>
  );
}
