import React from 'react';
import { Form, Button, Select, Input, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

export default function DynamicPermissionField({ type }) {
  const PermissionForm = ({ permission, index, remove }) => {
    const colSpan = 9;
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
        <Col span={colSpan - 3} style>
          <Button
            type="danger"
            onClick={() => remove(permission?.name)}
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
            {type === 'create' ? <PermissionForm key={0} index={0} /> : null}
            {permissions.map((permission, index) => (
              <PermissionForm
                key={index}
                permission={permission}
                index={type === 'create' ? index + 1 : index}
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
