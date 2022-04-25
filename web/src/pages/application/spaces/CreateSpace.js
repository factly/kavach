import React from 'react';
import { Button, Form, Input, Card } from 'antd';
import { maker } from '../../../utils/sluger';
import SlugInput from '../../../components/FormItems/SlugInput';
import { useParams, useHistory } from 'react-router-dom';
import { createSpace } from '../../../actions/space';
import { useDispatch } from 'react-redux';

function CreateSpace() {
  const [form] = Form.useForm();
  const { id } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const onNameChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const onSubmit = (values) => {
    dispatch(createSpace(values, id)).then(() => {
      history.push(`/applications/spaces`);
    });
  };

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
        <h1>Create Space</h1>
        <Form
          name="space_create"
          layout="vertical"
          form={form}
          onFinish={(values) => onSubmit(values)}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: 'Name is required' },
              { min: 3, message: 'Name must be minimum 3 characters.' },
              { max: 50, message: 'Name must be maximum 50 characters.' },
            ]}
          >
            <Input placeholder="Name" onChange={(e) => onNameChange(e.target.value)} />
          </Form.Item>
          <SlugInput />
          <Form.Item name="site_title" label="Site Title">
            <Input placeholder="Site Title" />
          </Form.Item>
          <Form.Item name="site_addess" label="Website">
            <Input placeholder="Site Address" />
          </Form.Item>
          <Form.Item name="tag_line" label="Tag Line">
            <Input placeholder="Tag Line" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateSpace;
