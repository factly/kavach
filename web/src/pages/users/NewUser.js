import React from 'react';
import { Card, Form, Input, Select, Button } from 'antd';
import { useDispatch } from 'react-redux';
import { addUser } from '../../actions/users';
import { useHistory } from 'react-router-dom';

function NewUser() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();
  const addNewUser = (values) => {
    dispatch(addUser(values)).then(() => {
      history.push('/users');
    });
  };
  const layout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 15,
    },
  };
  return (
    <div className="content">
      <Card title="Add User" style={{ width: 450 }}>
        <Form
          {...layout}
          form={form}
          name="add_user"
          initialValues={{
            role: 'member',
          }}
          onFinish={addNewUser}
        >
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please enter First Name!' }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter Last Name!' }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your title!' },
              { type: 'email', message: 'Please input valid Email!' },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select placeholder="role">
              <Select.Option value="owner">Owner</Select.Option>
              <Select.Option value="member">Member</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button form="add_user" type="primary" htmlType="submit" block>
              Add
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default NewUser;
