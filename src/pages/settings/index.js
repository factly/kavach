import React from 'react';
import { Button, Form, Input, Space, Divider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from './../../actions/organizations';

function OrganizationEdit() {
  const dispatch = useDispatch();

  const { organization, selected } = useSelector((state) => {
    return {
      organization: state.organizations.details[state.organizations.selected],
      selected: state.organizations.selected,
    };
  });

  React.useEffect(() => {
    dispatch(getOrganization(selected));
  }, [dispatch, selected]);

  return (
    <Space direction="vertical">
      <Form
        name="organization_edit"
        layout="vertical"
        onFinish={(values) => dispatch(updateOrganization({ ...organization, ...values }))}
        initialValues={organization}
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
          <Button form="organization_edit" type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form.Item>
      </Form>
      <Divider style={{ color: 'red' }} orientation="left">
        Danger zone
      </Divider>
      <Button
        danger
        onClick={() =>
          dispatch(deleteOrganization(organization.id)).then(() => window.location.reload(false))
        }
      >
        Default
      </Button>
    </Space>
  );
}

export default OrganizationEdit;
