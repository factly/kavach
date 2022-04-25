import React from 'react';
import { Link, useParams } from 'react-router-dom';
import SettingsList, { SettingsCard } from '../../../components/Settings';
import { Col, Row, Skeleton } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import { getApplication } from '../../../actions/application';
import { useDispatch, useSelector } from 'react-redux';

export default function ApplicationSettings() {
  const { id } = useParams();
  const dispatch = useDispatch();

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
        <div>
          {/* <Descriptions
            title={<h2> Manage Application </h2>}
            bordered={true}
            extra={
              <Link to={`/organisation/edit`}>
                <Button icon={<EditOutlined />} type="primary">
                  Edit Organisation
                </Button>
              </Link>
            }
          >
            <Descriptions.Item label="Name" span={descriptionSpan}>
              {application?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={descriptionSpan}>
              {application?.description}
            </Descriptions.Item>
            <Descriptions.Item label="Permissions" span={descriptionSpan}>
              {organisation?.permission?.role}
            </Descriptions.Item>
            <Descriptions.Item label="Number of applications" span={descriptionSpan}>
              {organisation?.applications?.length}
            </Descriptions.Item>
          </Descriptions>
          <Divider> Application Settings</Divider> */}
          <SettingsList type="application" appID={id} />
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
        </div>
      )}
    </div>
  );
}
