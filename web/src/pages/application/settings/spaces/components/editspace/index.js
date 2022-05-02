import React from 'react';
import { Row, Col } from 'antd';
import { Link, useParams } from 'react-router-dom';
import {
  ContactsOutlined,
  FileImageOutlined,
  SaveOutlined,
  AreaChartOutlined,
} from '@ant-design/icons';
import { SettingsCard } from '../../../../../../components/Settings';
export default function EditSpace() {
  const { appID, spaceID } = useParams();
  const baseLink = `/applications/${appID}/settings/spaces/${spaceID}/edit`;
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Link to={`${baseLink}/details`}>
            <SettingsCard
              icon={<SaveOutlined style={{ color: '#4E89FF' }} />}
              title="Basic space details"
              description="You can edit basic space details like name, site title, site URL, etc."
            />
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`${baseLink}/logos`}>
            <SettingsCard
              icon={<FileImageOutlined style={{ color: '#4E89FF' }} />}
              title="Logo Details"
              description="You can edit logo related details here."
            />
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`${baseLink}/contacts`}>
            <SettingsCard
              icon={<ContactsOutlined style={{ color: '#4E89FF' }} />}
              title="Social Contacts"
              description="You can edit social contacts details related to social media and contacts here."
            />
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`${baseLink}/metadata`}>
            <SettingsCard
              icon={<AreaChartOutlined style={{ color: '#4E89FF' }} />}
              title="Meta data"
              description="You can add meta data related to your site like Analytics, here."
            />
          </Link>
        </Col>
      </Row>
    </div>
  );
}
