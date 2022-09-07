import React from 'react';
import { Space, Form, Button, Select, Skeleton } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers } from '../../../../../actions/users';
import {
  addOrganisationRoleUserByID,
  getOrganisationRoleUsers,
} from '../../../../../actions/roles';
import UserList from './components/OrganisationRoleUserList';

export default function OrganisationRoleUsers() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { orgID, roleID } = useParams();

  const { roleUsers, remainingOrgUsers, loading, userRole, loadingUserRole } = useSelector(
    (state) => {
      var remUserIDs = [];
      var roleUserIDs = [];
      roleUserIDs = state.roles.organisation[orgID][roleID].users || [];
      const orgUserIDs = state.organisations.details[orgID].users || [];
      remUserIDs = orgUserIDs.filter((uID) => roleUserIDs.every((rUID) => !(rUID === uID)));
      return {
        roleUsers: roleUserIDs.map((id) => state.users.details[id]),
        remainingOrgUsers: remUserIDs.map((id) => state.users.details[id]),
        loading: state.roles.loading,
        userRole: state.profile.roles[state.organisations.selected],
        loadingUserRole: state.profile.loading,
      };
    },
  );

  const fetchOrganisationUsers = () => {
    dispatch(getUsers(roleID));
  };

  const fetchOrganisationRoleUsers = () => {
    dispatch(getOrganisationRoleUsers(roleID));
  };

  const onReset = () => {
    form.resetFields();
  };

  const onSubmit = (values) => {
    dispatch(addOrganisationRoleUserByID(roleID, values.user_id)).then(() =>
      dispatch(getOrganisationRoleUsers(roleID)),
    );
    onReset();
  };

  React.useEffect(() => {
    fetchOrganisationRoleUsers();
    fetchOrganisationUsers();
    //eslint-disable-next-line
  }, [orgID, roleID, dispatch]);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/organisation/${orgID}/settings/roles`}>
        <Button type="primary">Back to Roles</Button>
      </Link>
      {loading || loadingUserRole ? (
        <Skeleton />
      ) : userRole !== 'owner' ? (
        <UserList roleID={roleID} users={roleUsers} />
      ) : (
        <Space direction="vertical">
          <Form
            form={form}
            name="add-organisation-role-user"
            layout="inline"
            onFinish={(values) => {
              onSubmit(values);
            }}
          >
            <Form.Item name="user_id" label="Users">
              <Select bordered listHeight={128} style={{ width: 200 }} placeholder="select user">
                {remainingOrgUsers.map((user, index) => (
                  <Select.Option value={user?.id} key={index}>
                    {user?.email}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" form="add-organisation-role-user">
                Add Users
              </Button>
            </Form.Item>
          </Form>
          <UserList roleID={roleID} users={roleUsers} />
        </Space>
      )}
    </div>
  );
}
