import React from 'react';
import { useParams } from 'react-router-dom';
import SettingsList from '../../../components/Settings';
import { Skeleton, Descriptions, Divider, Space } from 'antd';
import { getApplication } from '../../../actions/application';
import { useDispatch, useSelector } from 'react-redux';

export default function ApplicationSettings() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const descriptionSpan = 3;
  const { application, loadingApp, role, loading } = useSelector((state) => {
    return {
      application: state.applications.details[id],
      loadingApp: state.applications.loading,
      role: state.profile.roles[state.organisations.selected],
      loading: state.profile.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getApplication(id));
    //eslint-disable-next-line
  }, [id]);

  return (
    <div>
      {loading || loadingApp ? (
        <Skeleton />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Descriptions title={<h2> Application Settings </h2>} bordered={true}>
            <Descriptions.Item label="Name" span={descriptionSpan}>
              {application.name}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={descriptionSpan}>
              {application.description}
            </Descriptions.Item>
            <Descriptions.Item label="Application URL" span={descriptionSpan}>
              <a href={`${application?.url}`} target="_blank" rel="noopener noreferrer">
                {application?.url}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Number of Tokens" span={descriptionSpan}>
              {application?.tokens?.length ? application?.tokens?.length : 0}
            </Descriptions.Item>
          </Descriptions>
          <Divider> Application Settings</Divider>
          <SettingsList type="application" appID={id} role={role} />
        </Space>
      )}
    </div>
  );
}
