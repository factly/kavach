import React from 'react';
import { Button, Form, Input } from 'antd';
import { useDispatch } from 'react-redux';
import { addOrganization, getOrganizations } from './../../actions/organizations';
import { useHistory } from 'react-router-dom';

function OrganizationCreate() {
  const dispatch = useDispatch();
  const history = useHistory();
  return (
    <Form
      name="organization_create"
      layout="vertical"
      onFinish={(values) => dispatch(addOrganization(values)).then(history.push('/settings'))}
      style={{
        width: '400px',
      }}
    >
      <Form.Item name="title" label="Title">
        <Input placeholder="Title" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Description" />
      </Form.Item>
      <Form.Item>
        <Button form="organization_create" type="primary" htmlType="submit" block>
          Save
        </Button>
      </Form.Item>
    </Form>
  );
}

export default OrganizationCreate;
