import React from 'react';
import { Card, List, Button, Select, Form, Input, Popconfirm, Divider } from 'antd';
import { DeleteOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';

function OrganizationCard(props) {
  const [users, setUsers] = React.useState([]);

  const [edit, setEdit] = React.useState(false);

  const owner = users.find((item) => item.role === 'owner' && item.user.ID === props.me.ID);

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/organizations/' + props.organization.ID + '/users')
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => setUsers(res))
      .catch((err) => {
        console.log(err);
      });
  }, [props.organization.ID]);

  const save = (value) => {
    console.log(value);
  };

  return (
    <Card
      title={
        edit ? (
          <Form
            name="organization_edit"
            layout="inline"
            onFinish={() => save}
            initialValues={{
              title: props.organization.title,
            }}
          >
            <Form.Item name="title">
              <Input placeholder="title" />
            </Form.Item>
          </Form>
        ) : (
          props.organization.title
        )
      }
      extra={
        owner ? (
          <div>
            <Button
              icon={edit ? <CloseOutlined /> : <EditOutlined />}
              onClick={() => setEdit(!edit)}
            />
            <Divider type="vertical" />
            <Popconfirm title="Sure to delete?" onConfirm={() => {}}>
              <Button icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        ) : null
      }
    >
      <List
        dataSource={users}
        header={
          owner ? (
            <Form
              name="add_user"
              layout="inline"
              initialValues={{
                role: 'member',
              }}
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
                  <Option value="owner">Owner</Option>
                  <Option value="member">Member</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button form="add_user" type="primary" htmlType="submit" block>
                  Add User
                </Button>
              </Form.Item>
            </Form>
          ) : null
        }
        renderItem={(item) => (
          <List.Item
            actions={
              owner
                ? [
                    <Select value={item.role} defaultValue="member">
                      <Option value="owner">Owner</Option>
                      <Option value="member">Member</Option>
                    </Select>,
                    <Popconfirm title="Sure to delete?" onConfirm={() => {}}>
                      <Button icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]
                : []
            }
          >
            <List.Item.Meta
              title={item.user.first_name + ' ABC ' + item.user.last_name}
              description={item.user.email}
            />
          </List.Item>
        )}
      />
    </Card>
  );
}

export default OrganizationCard;
