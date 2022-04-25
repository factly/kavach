import React from 'react';
import { Card, Avatar, Row, Col } from 'antd';
import {
  UserOutlined,
  EuroCircleOutlined,
  UsergroupAddOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
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
              icon={<UserOutlined style={{ color: '#4E89FF' }} />}
              title="Users"
              description="User settings"
            />
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`${baseLink}/tokens`}>
            <SettingsCard
              icon={<EuroCircleOutlined style={{ color: '#4E89FF' }} />}
              title="Tokens"
              description="Token settings"
            />
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`${baseLink}/roles`}>
            <SettingsCard
              icon={<UsergroupAddOutlined style={{ color: '#4E89FF' }} />}
              title="Roles"
              description="Role settings"
            />
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`${baseLink}/policies`}>
            <SettingsCard
              icon={<FileProtectOutlined style={{ color: '#4E89FF' }} />}
              title="Policies"
              description="Policy settings"
            />
          </Link>
        </Col>
      </Row>
    </div>
  );
}
