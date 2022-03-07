import React from 'react';
import { Card, Form, Input, Button } from 'antd';

export default function FormComponent({ type, onSubmit, form }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Card
        style={{
          width: 400,
        }}
      >
        <h1>{'Create ' + type + ' token'}</h1>
        <Form
          name="token_create"
          layout="vertical"
          onFinish={(values) => onSubmit(values, type)}
          form={form}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                message: 'Please input token name!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                message: 'Please input token description!',
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block form="token_create">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
