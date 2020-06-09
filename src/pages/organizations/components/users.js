import React from 'react';
import { Button, Select, Form, Input, Popconfirm, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

function OrganizationUsers(props) {
  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/organizations/' + props.organization.id + '/users')
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        setUsers(res);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.organization.id]);

  const addUser = (values) => {
    setLoading(true);
    fetch(process.env.REACT_APP_API_URL + '/organizations/' + props.organization.id + '/users', {
      method: 'POST',
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (res.status === 201) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        var newData = users;
        newData.splice(0, 0, res);
        setUsers(newData);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const removeUser = (id) => {
    setLoading(true);
    fetch(
      process.env.REACT_APP_API_URL + '/organizations/' + props.organization.id + '/users/' + id,
      {
        method: 'DELETE',
      },
    )
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        var deleteIndex = users.findIndex((item) => item.id === id);
        if (deleteIndex > -1) {
          var newData = users;
          newData.splice(deleteIndex, 1);
          setUsers(newData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (text, record) => record.user.first_name + ' ' + record.user.last_name,
    },
    {
      title: 'Email',
      key: 'email',
      render: (text, record) => record.user.email,
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Popconfirm title="Sure to delete?" onConfirm={() => removeUser(record.id)}>
          <Button icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      {props.organization.permission.role === 'owner' ? (
        <Form
          name="add_user"
          layout="inline"
          initialValues={{
            role: 'member',
          }}
          onFinish={(values) => addUser(values)}
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
      <Table loading={loading} pagination={false} columns={columns} dataSource={users} />
    </div>
  );
}

export default OrganizationUsers;
