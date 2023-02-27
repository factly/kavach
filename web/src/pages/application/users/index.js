import React from 'react';
import UsersList from './components/usersList';
import { Space, Form, Button, Select, Skeleton } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addApplicationUser } from '../../../actions/applicationUsers';
import { getUsers } from '../../../actions/users';
import { getApplicationUsers } from '../../../actions/applicationUsers';

function ApplicationUser() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [flag, setFlag] = React.useState(false);

  const { applicationUsers, organisationUsers, loading, role, loadingRole } = useSelector(
    (state) => {
      const orgUserIds = state.organisations.details[state.organisations.selected]?.users || [];
      const appUserIds = state.applications.details[id]?.users || [];
      return {
        applicationUsers: appUserIds?.map((id) => state.users.details[id]),
        organisationUsers: orgUserIds?.map((id) => state.users.details[id]),
        loading: state.users.loading,
        role: state.profile.roles[state.organisations.selected],
        loadingRole: state.profile.loading,
      };
    },
  );

  const fetchApplications = () => {
    dispatch(getApplicationUsers(id));
  };

  const fetchEntities = () => {
    dispatch(getUsers());
  };

  React.useEffect(() => {
    fetchEntities();
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const remainingUsers = organisationUsers.filter((user) => !applicationUsers.includes(user));
  // console.log(remainingUsers);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/applications/${id}/settings/`}>
        <Button type="primary">Back to Settings</Button>
      </Link>
      {loading || loadingRole ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {role === 'owner' ? (
            <Form
              form={form}
              name="filters"
              layout="inline"
              onFinish={(values) => {
                dispatch(
                  addApplicationUser({ application_id: parseInt(id, 10), user_id: values.user_id }),
                ).then(() => {
                  dispatch(getApplicationUsers(id));
                  setFlag((prev) => !prev);
                });
                form.resetFields();
              }}
              style={{ maxWidth: '100%' }}
            >
              <Form.Item name="user_id" label="Users">
                <Select bordered listHeight={128} style={{ width: 200 }} placeholder="select user">
                  {remainingUsers?.map((user, index) => (
                    <Select.Option value={user?.id} key={index}>
                      {user.email}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Invite Users
                </Button>
              </Form.Item>
            </Form>
          ) : null}
          <UsersList
            id={id}
            flag={flag}
            users={applicationUsers}
            total={applicationUsers.length}
            role={role}
          />
        </Space>
      )}
    </div>
  );
}

export default ApplicationUser;
