import React from 'react';
import { Form, Input } from 'antd';

function SpaceMetadata({ headerCode, footerCode }) {
  return (
    <div>
      <Form.Item label="Header Code" name="header_code">
        <Input value={headerCode} />
      </Form.Item>
      <Form.Item label="Footer Code" name="footer_code">
        <Input value={footerCode} />
      </Form.Item>
      {
        // More meta fields will be added once monaco editor starts working
      }
    </div>
  );
}

export default SpaceMetadata;
