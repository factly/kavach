import React from 'react';
import { Form, Input } from 'antd';
import SlugInput from '../../../../components/FormItems/SlugInput';
import { maker } from '../../../../utils/sluger';

const { TextArea } = Input;
function SpaceDetails({ name, slug, siteTitle, tagLine, description, form }) {
  const onNameChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };
  return (
    <div>
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
      <Form.Item name="description" label="Description">
        <TextArea />
      </Form.Item>
      <Form.Item name="site_title" label="Site Title">
        <Input placeholder="Site Title" />
      </Form.Item>
      <Form.Item name="site_address" label="Website">
        <Input placeholder="Site Address" />
      </Form.Item>
      <Form.Item name="tag_line" label="Tag Line">
        <Input placeholder="Tag Line" />
      </Form.Item>
    </div>
  );
}

export default SpaceDetails;
