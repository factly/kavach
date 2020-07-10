import React from 'react';
import { Button, Form, Input, Space, Divider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  getOrganisation,
  updateOrganisation,
  deleteOrganisation,
} from './../../actions/organisations';

function OrganisationEdit() {
  const dispatch = useDispatch();

  const { organisation, selected } = useSelector((state) => {
    return {
      organisation: state.organisations.details[state.organisations.selected],
      selected: state.organisations.selected,
    };
  });

  React.useEffect(() => {
    dispatch(getOrganisation(selected));
  }, [dispatch, selected]);

  return (
    <Space direction="vertical">
      <Form
        name="organisation_edit"
        layout="vertical"
        onFinish={(values) => dispatch(updateOrganisation({ ...organisation, ...values }))}
        initialValues={organisation}
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
          <Button form="organisation_edit" type="primary" htmlType="submit" block>
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
          dispatch(deleteOrganisation(organisation.id)).then(window.location.reload(false))
        }
      >
        Default
      </Button>
    </Space>
  );
}

export default OrganisationEdit;
