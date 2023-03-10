import React from 'react';
import { Row, Col, Button } from 'antd';
import { UserOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { SettingsCard } from '../../../components/Settings';

export const ApplicationType = () => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexDirection: 'column',
      }}
    >
      {/* <Link key="1" to={`/applications`}>
        <Button type="primary"> Back to Settings </Button>
      </Link> */}
      <h2 className="application-main-title">Choose Application Type</h2>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Link to={`/applications/create?is_default=true`}>
            <SettingsCard
              icon={<CloudDownloadOutlined style={{ color: '#4E89FF' }} />}
              title="Default Applications"
              description="In this section you can add and delete applications to your organisation which are managed by the admin."
            />
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`/applications/create`}>
            <SettingsCard
              icon={<UserOutlined style={{ color: '#4E89FF' }} />}
              title="Custom Applications"
              description="In this section you can extend applications in the currently selected organisation which will be managed by you."
            />
          </Link>
        </Col>
      </Row>
    </div>
  );
};
