import React from 'react';
import { Button, Form, Input } from 'antd';
import { useDispatch } from 'react-redux';
import { addOrganisation } from './../../actions/organisations';
import { useHistory } from 'react-router-dom';
import { maker, checker } from '../../utils/sluger';
import MediaSelector from '../../components/MediaSelector';

function OrganisationCreate() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();
  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };
  return (
    <Form
      form={form}
      name="organisation_create"
      layout="vertical"
      onFinish={(values) => dispatch(addOrganisation(values)).then(history.push('/settings'))}
      style={{
        width: '400px',
      }}
    >
      <Form.Item name="title" label="Title">
        <Input placeholder="Title" onChange={(e) => onTitleChange(e.target.value)} />
      </Form.Item>
      <Form.Item
        name="slug"
        label="Slug"
        rules={[
          {
            required: true,
            message: 'Please input the slug!',
          },
          {
            pattern: checker,
            message: 'Please enter valid slug!',
          },
        ]}
      >
        <Input placeholder="Slug"></Input>
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Description" />
      </Form.Item>
      <Form.Item label="Upload Image" name="featured_medium_id">
        <MediaSelector />
      </Form.Item>
      <Form.Item>
        <Button form="organisation_create" type="primary" htmlType="submit" block>
          Save
        </Button>
      </Form.Item>
    </Form>
  );
}

export default OrganisationCreate;
