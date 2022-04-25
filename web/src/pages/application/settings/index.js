import React from 'react';
import { Link, useParams } from 'react-router-dom';
import SettingsList, { SettingsCard } from '../../../components/Settings';
import { Col, Row } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';

export default function ApplicationSettings() {
  const { id } = useParams();
  return (
    <div>
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
  );
}
