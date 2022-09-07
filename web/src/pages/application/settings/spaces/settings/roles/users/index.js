import React from 'react';
import { Space, Form, Button, Select, Skeleton } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaceUsers } from '../../../../../../../actions/spaceUser';
import { addSpaceRoleUserByID, getSpaceRoleUsers } from '../../../../../../../actions/roles';
import UserList from './components/SpaceRoleUserList';

export default function SpaceRoleUsers() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { appID, spaceID, roleID } = useParams();
  const { roleUsers, remainingSpaceUsers, loading, userRole, loadingUserRole } = useSelector(
    (state) => {
      var remUserIDs = [];
      var roleUserIDs = [];
      roleUserIDs = state.roles.space[spaceID][roleID]?.users || [];
      const spaceUserIDs = state.spaces.details[spaceID]?.users || [];
      if (spaceUserIDs?.length) {
        remUserIDs = spaceUserIDs.filter((uID) => roleUserIDs.every((rUID) => !(rUID === uID)));
      }
      return {
        roleUsers: roleUserIDs.map((id) => state.users.details[id]),
        remainingSpaceUsers: remUserIDs.map((id) => state.users.details[id]),
        loading: state.roles.loading,
        userRole: state.profile.roles[state.organisations.selected],
        loadingUserRole: state.profile.loading,
      };
    },
  );

  const fetchSpaceUsers = () => {
    dispatch(getSpaceUsers(appID, spaceID));
  };

  const fetchSpaceRoleUsers = () => {
    dispatch(getSpaceRoleUsers(appID, spaceID, roleID));
  };

  const onReset = () => {
    form.resetFields();
  };

  const onSubmit = (values) => {
    dispatch(addSpaceRoleUserByID(appID, spaceID, roleID, values.user_id)).then(() =>
      dispatch(getSpaceRoleUsers(appID, spaceID, roleID)),
    );
    onReset();
  };

  React.useEffect(() => {
    fetchSpaceUsers();
    fetchSpaceRoleUsers();
    // eslint-disable-next-line
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/applications/${appID}/settings/spaces/${spaceID}/settings/roles`}>
        <Button type="primary">Back to Roles</Button>
      </Link>
      {loading && loadingUserRole ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {userRole === 'owner' ? (
            <Form
              form={form}
              name="add-space-role-user"
              layout="inline"
              onFinish={(values) => {
                onSubmit(values);
              }}
            >
              <Form.Item name="user_id" label="Users">
                <Select bordered listHeight={128} style={{ width: 200 }} placeholder="select user">
                  {remainingSpaceUsers.map((user, index) => (
                    <Select.Option value={user.id} key={index}>
                      {user.email}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" form="add-space-role-user">
                  Add Users
                </Button>
              </Form.Item>
            </Form>
          ) : null}
          <UserList appID={appID} spaceID={spaceID} roleID={roleID} users={roleUsers} />
        </Space>
      )}
    </div>
  );
}
