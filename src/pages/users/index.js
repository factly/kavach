import React from 'react';
import { Button, Popconfirm, Table, Form, Input, Select, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
import { getUsers, deleteUser, addUser } from '../../actions/users';

function OrganisationUsers() {
  const [form] = Form.useForm();

  const dispatch = useDispatch();

  const { organisation, users, loading } = useSelector((state) => {
    return {
      organisation: state.organisations.details[state.organisations.selected],
      users: state.users.ids.map((id) => state.users.details[id]),
      loading: state.users.loading,
    };
  });

  const fetchUsers = React.useCallback(() => {
    dispatch(getUsers());
  }, [dispatch]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (text, record) => record.first_name + ' ' + record.last_name,
      width: '30%',
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
      width: '30%',
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: ['permission', 'role'],
      filters: [
        {
          text: 'Owner',
          value: 'owner',
        },
        {
          text: 'Member',
          value: 'member',
        },
      ],
      filterMultiple: false,
      onFilter: (value, record) => record.permission.role === value,
      width: '25%',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Popconfirm
          title="Sure to delete?"
          onConfirm={() => dispatch(deleteUser(record.id)).then(fetchUsers())}
        >
          <Button icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
      width: '15%',
    },
  ];

  return (
    <Space direction="vertical">
      {organisation.permission.role === 'owner' ? (
        <Form
          form={form}
          name="add_user"
          layout="inline"
          initialValues={{
            role: 'member',
          }}
          onFinish={(values) =>
            dispatch(addUser(values)).then(() => {
              fetchUsers();
              form.resetFields();
            })
          }
        >
          <Form.Item
            name="email"
            placeholder="email"
            rules={[
              { required: true, message: 'Please input your title!' },
              { type: 'email', message: 'Please input valid Email!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="role">
            <Select placeholder="role">
              <Select.Option value="owner">Owner</Select.Option>
              <Select.Option value="member">Member</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button form="add_user" type="primary" htmlType="submit" block>
              Add User
            </Button>
          </Form.Item>
        </Form>
      ) : null}
      <Table
        rowKey={'id'}
        loading={loading}
        pagination={false}
        columns={columns}
        dataSource={users}
      />
    </Space>
  );
}

export default OrganisationUsers;
