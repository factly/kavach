import React from 'react';
import { Card, Form, Input, Select, Button, Row, Col, Icon, Space } from 'antd';
import { useDispatch } from 'react-redux';
import { addUser } from '../../actions/users';
import { useHistory } from 'react-router-dom';
import { CloseOutlined } from '@ant-design/icons';

const fontWeight = 'bold';
const layout = {
  iconCol: 2,
  roleCol: 3,
  otherCol: 6,
};

const space = {
  vertical: 16,
  horizantal: 8,
};

//FormHeader is used to create the header of the form
function FormHeader() {
  return (
    <>
      <Row gutter={[8, 8]} style={{ fontWeight: fontWeight }}>
        <Col span={layout.otherCol}>Email</Col>
        <Col span={layout.otherCol}>First name</Col>
        <Col span={layout.otherCol}>Last name</Col>
        <Col span={layout.roleCol}>Role</Col>
        <Col span={layout.iconCol}></Col>
      </Row>
    </>
  );
}

//FormList is used to create a dynamic list of forms
function FormList() {
  return (
    <Form.List name="users">
      {(fields, { add, remove }) => {
        return (
          <div>
            {fields.map((field, index) => (
              <div key={field.key}>
                <Row gutter={[8, 0]} style={{ fontWeight: fontWeight }} key={field.key}>
                  <Col span={layout.otherCol}>
                    <Form.Item
                      name={[index, 'email']}
                      rules={[
                        { required: true, message: 'Please input your email!', type: 'email' },
                      ]}
                    >
                      <Input placeholder="example@factly.in"></Input>
                    </Form.Item>
                  </Col>
                  <Col span={layout.otherCol}>
                    <Form.Item
                      name={[index, 'first_name']}
                      rules={[{ required: true, message: 'Please input your first name!' }]}
                    >
                      <Input placeholder=""></Input>
                    </Form.Item>
                  </Col>
                  <Col span={layout.otherCol}>
                    <Form.Item
                      name={[index, 'last_name']}
                      rules={[{ required: true, message: 'Please input your last name!' }]}
                    >
                      <Input placeholder=""></Input>
                    </Form.Item>
                  </Col>
                  <Col span={layout.roleCol}>
                    <Form.Item name={[index, 'role']}>
                      <Select placeholder="Role" style={{ width: 100 }}>
                        <Select.Option value="owner">Owner</Select.Option>
                        <Select.Option value="member">Member</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={1}>
                    <Form.Item noStyle>
                      <CloseOutlined
                        onClick={() => {
                          remove(field.name);
                        }}
                        hidden={index == 0 ? true : false}
                        style={{ marginLeft: 10 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}
            <Row style={{ display: 'flex', fontWeight: fontWeight }}>
              <Button onClick={() => add()}>Add another...</Button>
              <Button
                type="primary"
                style={{ fontWeight: fontWeight, marginLeft: 'auto', marginRight: 115 }}
                htmlType="submit"
              >
                Send Invites
              </Button>
            </Row>
          </div>
        );
      }}
    </Form.List>
  );
}

function NewUser() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();
  const addNewUsers = (values) => {
    dispatch(addUser(values, history));
  };

  return (
    <div className="content">
      <Card title="Invite Users">
        <FormHeader />
        <Form form={form} onFinish={addNewUsers} initialValues={{ users: [''] }}>
          <FormList />
        </Form>
      </Card>
    </div>
  );
}

export default NewUser;
