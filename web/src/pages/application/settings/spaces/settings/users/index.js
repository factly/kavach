import React from 'react';
import { Form, Button, Select } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import UserList from './components/userList';
import { getSpaces } from '../../../../../../actions/space';
import { addSpaceUser } from '../../../../../../actions/spaceUser';

export default function SpaceUser() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { appID, spaceID } = useParams();

  const { appUsers, loadingApps, spaceUsers, loadingSpace, role } = useSelector((state) => {
    return {
      appUsers: state?.applications?.details[appID]?.users.map((id) => state.users.details[id]) || [],
      loadingApps: state?.applications?.loading,
      spaceUsers: state?.spaces?.details[spaceID]?.users.map((id) => state.users.details[id]) || [],
      loadingSpace: state?.spaces?.loading,
      role: state?.profile?.roles[state.organisations.selected],
    };
  });

  const remainingUsers =
    !loadingApps && !loadingSpace
      ? appUsers.filter((data, index) =>
          spaceUsers.every((newData) => !(newData.email === data.email)),
        )
      : [];

  const onSubmit = (values) => {
    console.log(values);
    dispatch(addSpaceUser(appID, spaceID, values)).then(() => dispatch(getSpaces(appID)));
    form.resetFields();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/applications/${appID}/settings/spaces/${spaceID}/settings`}>
        <Button type="primary"> Back to Settings </Button>
      </Link>
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
      <UserList spaceID={spaceID} role={role} />
    </div>
  );
}
