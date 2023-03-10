import React from 'react';
import { Card, Avatar, Row, Col } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import SettingsIcon from './img.svg';
import { Link } from 'react-router-dom';

export const SettingsCard = ({ icon, title, description }) => {
  const { Meta } = Card;
  return (
    <Card hoverable>
      <Meta
        avatar={<Avatar icon={icon} style={{ backgroundColor: 'transparent', color: '#ffb41f' }} />}
        title={title}
        description={description}
      />
    </Card>
  );
};

export default function SettingsList({ type, orgID, appID, spaceID, role }) {
  let baseLink = '';
  switch (type) {
    case 'organisation':
      baseLink = `/organisation/${orgID}/settings`;
      break;
    case 'application':
      baseLink = `/applications/${appID}/settings`;
      break;
    case 'space':
      baseLink = `/applications/${appID}/settings/spaces/${spaceID}/settings`;
      break;
    default:
      break;
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Link to={`${baseLink}/users`}>
            <SettingsCard
              icon={<img src={SettingsIcon} alt="icon" />}
              title={<div className="organisation-setting-heading">Users</div>}
              description="User settings"
            />
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`${baseLink}/roles`}>
            <SettingsCard
              icon={<img src={SettingsIcon} alt="icon" />}
              title={<div className="organisation-setting-heading">Roles</div>}
              description="Role settings"
            />
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`${baseLink}/policies`}>
            <SettingsCard
              icon={<img src={SettingsIcon} alt="icon" />}
              title={<div className="organisation-setting-heading">Policies</div>}
              description="Policy settings"
            />
          </Link>
        </Col>
        {role === 'owner' ? (
          <Col span={12}>
            <Link to={`${baseLink}/tokens`}>
              <SettingsCard
                icon={<img src={SettingsIcon} alt="icon" />}
                title={<div className="organisation-setting-heading">Tokens</div>}
                description="Token settings"
              />
            </Link>
          </Col>
        ) : null}
        {type === 'application' ? (
          <Col span={12}>
            <Link to={`${baseLink}/spaces`}>
              <SettingsCard
                icon={<ApartmentOutlined style={{ color: '#4E89FF' }} />}
                title={<div className="organisation-setting-heading">Spaces</div>}
                description="Space Settings"
              />
            </Link>
          </Col>
        ) : null}
      </Row>
    </div>
  );
}
