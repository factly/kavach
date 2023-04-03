import React, { useState, useEffect } from 'react';
import { Card, Avatar, Row, Col } from 'antd';
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

  const [colSpan, setColSpan] = useState(12);

  const handleResize = () => {
    process.browser && window.innerWidth <= 500 ? setColSpan(24) : setColSpan(12);
  };

  useEffect(() => {
    process.browser && window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      process.browser && window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
      <Row gutter={[16, 16]}>
        <Col span={colSpan}>
          <Link to={`${baseLink}/users`}>
            <SettingsCard
              icon={<img src={SettingsIcon} alt="icon" />}
              title={<div className="organisation-setting-heading">Users</div>}
              description="User settings"
            />
          </Link>
        </Col>
        <Col span={colSpan}>
          <Link to={`${baseLink}/roles`}>
            <SettingsCard
              icon={<img src={SettingsIcon} alt="icon" />}
              title={<div className="organisation-setting-heading">Roles</div>}
              description="Role settings"
            />
          </Link>
        </Col>
        <Col span={colSpan}>
          <Link to={`${baseLink}/policies`}>
            <SettingsCard
              icon={<img src={SettingsIcon} alt="icon" />}
              title={<div className="organisation-setting-heading">Policies</div>}
              description="Policy settings"
            />
          </Link>
        </Col>
        {role === 'owner' ? (
          <Col span={colSpan}>
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
          <Col span={colSpan}>
            <Link to={`${baseLink}/spaces`}>
              <SettingsCard
                icon={<img src={SettingsIcon} alt="icon" />}
                title={<div className="organisation-setting-heading">Spaces</div>}
                description="Space Settings"
              />
            </Link>
          </Col>
        ) : null}
      </Row>
  );
}
