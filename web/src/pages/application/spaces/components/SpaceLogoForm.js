import React from 'react';
import MediaSelector from '../../../../components/MediaSelector';
import { Form, Row, Col } from 'antd';

function SpaceLogoForm() {
  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="logo_id" label="Logo">
            <MediaSelector />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="logo_mobile_id" label="Logo Mobile">
            <MediaSelector />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="fav_icon_id" label="FavIcon">
            <MediaSelector />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="mobile_icon_id" label="Mobile Icon">
            <MediaSelector />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}

export default SpaceLogoForm;
