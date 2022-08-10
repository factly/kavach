import React from 'react';
import { Card, Form, Input, Select, Button, Row, Col, Skeleton } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../../../../../actions/users';
import { useHistory, useParams } from 'react-router-dom';
import { CloseOutlined } from '@ant-design/icons';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';

const fontWeight = 'bold';
const layout = {
  iconCol: 2,
  roleCol: 3,
  otherCol: 6,
};

//FormHeader is used to create the header of the form
function FormHeader() {
  return (
    <>
      <Row gut ter={[8, 8]} style={{ fontWeight: fontWeight }}>
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
                        hidden={index === 0 ? true : false}
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
  const { orgID } = useParams();
  const [form] = Form.useForm();
  const { orgID } = useParams();
  const addNewUsers = (values) => {
    dispatch(addUser(values, history)).then(() => history.push(`/organisation/${orgID}/settings/users`));
  };

  const { role, loading } = useSelector((state) => {
    return {
      role: state.profile.roles[state.organisations.selected],
      loading: state.profile.loading,
    };
  });
  return (
    <div className="content">
      {loading ? (
        <Skeleton />
      ) : role === 'owner' ? (
        <Card title="Invite Users">
          <FormHeader />
          <Form form={form} onFinish={addNewUsers} initialValues={{ users: [''] }}>
            <FormList />
          </Form>
        </Card>
      ) : (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      )}
    </div>
  );
}

export default NewUser;
