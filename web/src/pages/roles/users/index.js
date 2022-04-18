import React from 'react';
import UsersList from './components/UserList';
import { Space, Form, Button, Select, Skeleton } from 'antd';
import { useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers } from '../../../actions/users';
import { getApplicationUsers } from '../../../actions/applicationUsers';
import { getSpaceUsers } from '../../../actions/spaceUser';
import {
  addApplicationRoleUserByID,
  addOrganisationRoleUserByID,
  addSpaceRoleUserByID,
  getApplicationRoleUsers,
  getOrganisationRoleUsers,
  getSpaceRoleUsers,
} from '../../../actions/roles';

export default function RoleUsers() {
  const [form] = Form.useForm();
  const location = useLocation();
  const type = location.state;
  const dispatch = useDispatch();
  const { id, spaceID, appID, orgID } = useParams();
  const { roleUsers, remUsers, loading } = useSelector((state) => {
    var remUserIDs = [];
    var roleUserIDs = [];
    switch (type) {
      case 'organisation':
        roleUserIDs = state.roles.organisation[state.organisations.selected][id].users || [];
        const orgUserIDs = state.organisations.details[state.organisations.selected].users || [];
        remUserIDs = orgUserIDs.filter((uID) => roleUserIDs.every((rUID) => !(rUID === uID)));
        return {
          roleUsers: roleUserIDs.map((id) => state.users.details[id]),
          remUsers: remUserIDs.map((id) => state.users.details[id]),
          loading: state.roles.loading,
        };
      case 'application':
        roleUserIDs = state.roles.application[appID][id].users || [];
        const appUserIDs = state.applications.details[appID].users || [];
        remUserIDs = appUserIDs.filter((uID) => roleUserIDs.every((rUID) => !(rUID === uID)));
        return {
          roleUsers: roleUserIDs.map((id) => state.users.details[id]),
          remUsers: remUserIDs.map((id) => state.users.details[id]),
          loading: state.roles.loading,
        };
      case 'space':
        roleUserIDs = state.roles.organisation[spaceID][id].users || [];
        const spaceUserIDs = state.spaces.details[spaceID].users || [];
        remUserIDs = spaceUserIDs.filter((uID) => roleUserIDs.every((rUID) => !(rUID === uID)));
        return {
          roleUsers: roleUserIDs.map((id) => state.users.details[id]),
          remUsers: remUserIDs.map((id) => state.users.details[id]),
          loading: state.roles.loading,
        };
      default:
        return {
          roleUsers: [],
          remUsers: [],
          loading: true,
        };
    }
  });

  const fetchUsers = () => {
    switch (type) {
      case 'organisation':
        dispatch(getUsers());
        break;
      case 'application':
        if (appID) {
          dispatch(getApplicationUsers(appID));
        }
        break;
      case 'space':
        if (spaceID) {
          dispatch(getSpaceUsers(appID, spaceID));
        }
        break;
      default:
        return;
    }
  };

  const fetchRoleUsers = () => {
    switch (type) {
      case 'organisation':
        dispatch(getOrganisationRoleUsers(id));
        break;
      case 'application':
        if (appID) {
          dispatch(getApplicationRoleUsers(appID, id));
        }
        break;
      case 'space':
        if (spaceID) {
          dispatch(getSpaceRoleUsers(appID, spaceID, id));
        }
        break;
      default:
        return;
    }
  };

  const onSubmit = (values) => {
    switch (type) {
      case 'organisation':
        dispatch(addOrganisationRoleUserByID(id, values.user_id)).then(() =>
          dispatch(getOrganisationRoleUsers(id)),
        );
        break;
      case 'application':
        if (appID) {
          dispatch(addApplicationRoleUserByID(appID, id, values.user_id)).then(() =>
            dispatch(getApplicationRoleUsers(appID, id)),
          );
        }
        break;
      case 'space':
        if (spaceID) {
          dispatch(addSpaceRoleUserByID(appID, spaceID, id, values.user_id)).then(() =>
            dispatch(getSpaceRoleUsers(appID, spaceID, id)),
          );
        }
        break;
      default:
        return;
    }
    form.resetFields();
  };

  React.useEffect(() => {
    fetchUsers();
    fetchRoleUsers();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {loading ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          <Form
            form={form}
            name="filters"
            layout="inline"
            onFinish={(values) => {
              onSubmit(values);
            }}
            style={{ maxWidth: '100%' }}
          >
            <Form.Item name="user_id" label="Users">
              <Select bordered listHeight={128} style={{ width: 200 }} placeholder="select user">
                {remUsers.map((user, index) => (
                  <Select.Option value={user.id} key={index}>
                    {user.email}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Add Users
              </Button>
            </Form.Item>
          </Form>
          <UsersList
            users={roleUsers}
            orgID={orgID}
            spaceID={spaceID}
            appID={appID}
            roleID={id}
            type={type}
          />
        </Space>
      )}
    </>
  );
}
