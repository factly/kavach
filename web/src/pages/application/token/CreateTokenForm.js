import React from 'react';
import { Form, Input, Button } from 'antd';
import { addApplicationToken } from '../../../actions/token';
import { useDispatch } from 'react-redux';

const tailLayout = {
  wrapperCol: {
    offset: 8,
  },
};

const CreateTokenForm = ({ appID, setVisible, setTokenFlag }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { TextArea } = Input;

  const onReset = () => {
    form.resetFields();
  };

  const onCreate = (values) => {
    dispatch(addApplicationToken(values, appID)).then(() => {
      setVisible(false);
      setTokenFlag(true);
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="create-token"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item
        name="name"
        label="Name"
        rules={[
          {
            required: true,
            message: 'Please enter the name!',
          },
          { min: 3, message: 'Name must be minimum 3 characters.' },
          { max: 50, message: 'Name must be maximum 50 characters.' },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Create API Token
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateTokenForm;
