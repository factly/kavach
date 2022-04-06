import React from 'react';
import { Form, Button, Select, Input, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

export default function DynamicPermissionField() {
  const PermissionForm = ({ permission, index, remove }) => {
		const colSpan = 8
    return (
      <Row key={index} justify="center" align="middle" gutter={[10, 0]}>
        <Col span={colSpan}>
          <Form.Item
            name={[index, 'resource']}
            label="Resource"
            rules={[{ required: true, message: 'Please input resource' }]}
          >
            <Input placeholder="enter resource" />
          </Form.Item>
        </Col>
        <Col span={colSpan}>
          <Form.Item
            name={[index, 'actions']}
            label="Action"
            rules={[{ required: true, message: 'Please input action' }]}
          >
            <Select mode="tags" placeholder="select action" />
          </Form.Item>
        </Col>
        <Col span={colSpan} style>
          <Button
            type="danger"
            onClick={() => remove(permission.name)}
            icon={<MinusCircleOutlined />}
            hidden={index === 0}
          />
        </Col>
      </Row>
    );
  };

  return (
    <Form.List name="permissions">
      {(permissions, { add, remove }) => {
        return (
          <div>
            {permissions.map((permission, index) => (
              <PermissionForm
                permission={permission}
                permissions={permissions}
                index={index}
                remove={remove}
              />
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} style={{ width: '60%' }}>
                <PlusOutlined /> Add Resource
              </Button>
            </Form.Item>
          </div>
        );
      }}
    </Form.List>
  );
}
