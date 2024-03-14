import React from 'react';
import { Space, Form, Button, Select, Skeleton } from 'antd';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getApplicationUsers } from '../../../../../actions/applicationUsers';
import { addApplicationRoleUserByID, getApplicationRoleUsers } from '../../../../../actions/roles';
import UserList from './components/ApplicationRoleUserList';
import { Link } from 'react-router-dom';

export default function ApplicationRoleUsers() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { appID, roleID } = useParams();
  const { roleUsers, remainingAppUsers, loading, userRole, loadingUserRole } = useSelector(
    (state) => {
      var remUserIDs = [];
      var roleUserIDs = [];
      roleUserIDs = state.roles.application?.[appID]?.[roleID].users || [];
      const appUserIDs = state.applications.details[appID]?.users || [];
      remUserIDs = appUserIDs.filter((uID) => roleUserIDs.every((rUID) => !(rUID === uID)));
      return {
        roleUsers: roleUserIDs.map((id) => state.users.details[id]),
        remainingAppUsers: remUserIDs.map((id) => state.users.details[id]),
        loading: state.roles.loading,
        userRole: state.profile.roles[state.organisations.selected],
        loadingUserRole: state.profile.loading,
      };
    },
  );

  const fetchApplicationUsers = () => {
    dispatch(getApplicationUsers(appID));
  };

  const fetchApplicationRoleUsers = () => {
    dispatch(getApplicationRoleUsers(appID, roleID));
  };

  const onReset = () => {
    form.resetFields();
  };

  const onSubmit = (values) => {
    dispatch(addApplicationRoleUserByID(appID, roleID, values.user_id)).then(() =>
      dispatch(getApplicationRoleUsers(appID, roleID)),
    );
    onReset();
  };

  React.useEffect(() => {
    fetchApplicationUsers();
    fetchApplicationRoleUsers();
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
      <Link key="1" to={`/applications/${appID}/settings/roles`}>
        <Button type="primary">Back to Roles</Button>
      </Link>
      {loading && loadingUserRole ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {userRole === 'owner' ? (
            <Form
              form={form}
              name="add-application-role-user"
              layout="inline"
              onFinish={(values) => {
                onSubmit(values);
              }}
            >
              <Form.Item name="user_id" label="Users">
                <Select bordered listHeight={128} style={{ width: 200 }} placeholder="select user">
                  {remainingAppUsers.map((user, index) => (
                    <Select.Option value={user.id} key={index}>
                      {user.email}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" form="add-application-role-user">
                  Add Users
                </Button>
              </Form.Item>
            </Form>
          ) : null}
          <UserList appID={appID} roleID={roleID} users={roleUsers} />
        </Space>
      )}
    </div>
  );
}
