import React from 'react';
import { Link, useParams } from 'react-router-dom';
import SettingsList, { SettingsCard } from '../../../components/Settings';
import { Col, Row, Skeleton, Descriptions, Divider, Space } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
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
          <Descriptions title={<h2> Manage Application </h2>} bordered={true}>
            <Descriptions.Item label="Name" span={descriptionSpan}>
              {application?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={descriptionSpan}>
              {application?.description}
            </Descriptions.Item>
            <Descriptions.Item label="Number of Spaces" span={descriptionSpan}>
              {application?.spaces?.length}
            </Descriptions.Item>
            <Descriptions.Item label="Number of Tokens" span={descriptionSpan}>
              {application?.tokens?.length}
            </Descriptions.Item>
            <Descriptions.Item label="Number of Tokens" span={descriptionSpan}>
              <a href={`https://${application?.url}`}>{application?.url}</a>
            </Descriptions.Item>
          </Descriptions>
          <Divider> Application Settings</Divider>
          <SettingsList type="application" appID={id} role={role} />
          <Row style={{ marginTop: 16 }}>
            <Col span={12}>
              <Link to={`/applications/${id}/settings/spaces`}>
                <SettingsCard
                  icon={<ApartmentOutlined style={{ color: '#4E89FF' }} />}
                  title="Spaces"
                  description="Space Settings"
                />
              </Link>
            </Col>
          </Row>
        </Space>
      )}
    </div>
  );
}
