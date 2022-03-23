import React from 'react';
import { Space, Form, Button, Select } from 'antd';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import UserList from './components/userList';
import { getSpaces } from '../../../../actions/space';
import { addSpaceUser } from '../../../../actions/spaceUser';

function SpaceUser() {
  const [form] = Form.useForm();
  const { appID, id } = useParams();

  const dispatch = useDispatch();

  const { appUsers, loadingApps, spaceUsers, loadingSpace } = useSelector((state) => {
    return {
      appUsers: state.applications.details[appID]?.users.map((id) => state.users.details[id]) || [],
      loadingApps: state.applications.loading,
      spaceUsers: state.spaces.details[id]?.users.map((id) => state.users.details[id]) || [],
      loadingSpace: state.spaces.loading,
    };
  });

  const remainingUsers =
    !loadingApps && !loadingSpace
      ? appUsers.filter((data, index) =>
          spaceUsers.every((newData) => !(newData.email === data.email)),
        )
      : [];

  const onSubmit = (values) => {
    dispatch(addSpaceUser(appID, id, values)).then(() => dispatch(getSpaces(appID)));
  };

  return (
    <Space direction="vertical">
      <Form
        form={form}
        name="filters"
        layout="inline"
        onFinish={(values) => onSubmit(values)}
        style={{ maxWidth: '100%' }}
      >
        <Form.Item name="user_id" label="Users">
          <Select bordered listHeight={128} style={{ width: 200 }} placeholder="select user">
            {remainingUsers.map((user, index) => (
              <Select.Option value={user.id} key={index}>
                {user.email}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Space User
          </Button>
        </Form.Item>
      </Form>
      <UserList spaceID={id} />
    </Space>
  );
}

export default SpaceUser;
