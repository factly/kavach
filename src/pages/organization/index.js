import React from 'react';
import { Button, Form, Input } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { getOrganization } from './../../actions/organizations';

function Organizations() {
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
    <Form
      name="organization_edit"
      layout="vertical"
      onFinish={(values) => console.log(values)}
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
  );
}

export default Organizations;
