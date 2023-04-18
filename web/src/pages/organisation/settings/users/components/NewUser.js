import React from 'react';
import { Space, Form, Input, Select, Button, Row, Col, Skeleton } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../../../../../actions/users';
import { Link, useHistory, useParams } from 'react-router-dom';
import { CloseOutlined } from '@ant-design/icons';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';

const fontWeight = 'bold';
const layout = {
  iconCol: 2,
  roleCol: 5,
  otherCol: 5,
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
                      <Select placeholder="Role">
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
                        hidden={index === 0 ? true : false}
                        style={{ marginLeft: 10 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}
            <Row style={{ display: 'flex', fontWeight: fontWeight }}>
              <Button onClick={() => add()}>Add More</Button>
              <Button
                type="primary"
                style={{ fontWeight: fontWeight, marginLeft: 'auto' }}
                htmlType="submit"
              >
                Send Invite
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
  const { orgID } = useParams();
  const [form] = Form.useForm();
  const addNewUsers = (values) => {
    dispatch(addUser(values, history)).then(() => {
      history.push(`/organisation/${orgID}/settings/users`);
      form.resetFields();
    });
  };

  const { role, loading } = useSelector((state) => {
    return {
      role: state.profile.roles[state.organisations.selected],
      loading: state.profile.loading,
    };
  });
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {loading ? (
        <Skeleton />
      ) : role === 'owner' ? (
        <>
          <div className="organisation-descriptions-header">
            <div className="organisation-descriptions-title">
              <h2 className="organisation-title-main">Invite Users</h2>
            </div>
          </div>
          <FormHeader />
          <Form form={form} onFinish={addNewUsers} initialValues={{ users: [''] }}>
            <FormList />
          </Form>
        </>
      ) : (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      )}
    </Space>
  );
}

export default NewUser;
