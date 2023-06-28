import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SettingsList from '../../../components/Settings';
import { Button, Skeleton, Descriptions, Space } from 'antd';
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
        <Space direction="vertical">
          <Descriptions
            className="application-index"
            title={<h2 className="application-title-main">Application Settings</h2>}
            bordered={true}
          >
            <Descriptions.Item
              label={<div className="application-table-label">Name</div>}
              span={descriptionSpan}
            >
              {application.name}
            </Descriptions.Item>
            <Descriptions.Item
              label={<div className="application-table-label">Description</div>}
              span={descriptionSpan}
            >
              {application.description}
            </Descriptions.Item>
            <Descriptions.Item
              label={<div className="application-table-label">Application URL</div>}
              span={descriptionSpan}
            >
              <a href={`${application?.url}`} target="_blank" rel="noopener noreferrer">
                {application?.url}
              </a>
            </Descriptions.Item>
            <Descriptions.Item
              label={<div className="application-table-label">Number of Tokens</div>}
              span={descriptionSpan}
            >
              {application?.tokens?.length ? application?.tokens?.length : 0}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            style={{ marginTop: '34px' }}
            title={<h2 className="application-title-main">Application Settings</h2>}
          ></Descriptions>
          <SettingsList type="application" appID={id} role={role} />
        </Space>
      )}
    </div>
  );
}
