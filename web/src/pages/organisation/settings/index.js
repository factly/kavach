import React from 'react';
import { Link } from 'react-router-dom';
import SettingsList, { SettingsCard } from '../../../components/Settings';
import { Col, Row } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export default function OrganisationSettings({ orgID }) {
  return (
    <div>
      <SettingsList type="organisation" orgID={orgID} />
      <Row style={{ marginTop: 16 }}>
        <Col span={12}>
          <Link to={`/organisation/edit`}>
            <SettingsCard
              icon={<EditOutlined style={{ color: '#4E89FF' }} />}
              title="Edit Organisation"
              description="Edit organisation details"
            />
          </Link>
        </Col>
      </Row>
    </div>
  );
}
