import React from 'react';
import UsersList from './components/usersList';
import { Space, Form, Button, Select, Skeleton } from 'antd';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addApplicationUser } from '../../../actions/applicationUsers';
import { getUsers } from '../../../actions/users';
import { getApplicationUsers } from '../../../actions/applicationUsers';
function ApplicationUser({ id }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [flag, setFlag] = React.useState(false);
  const history = useHistory();

  const { applicationUsers, organisationUsers, loading } = useSelector((state) => {
    const orgUserIds = state.organisations[state.organisations.selected]?.users;
    const appUserIds = state.applications.details[id]?.users;
    return {
      applicationUsers: appUserIds.map((id) => state.users.details[id]),
      organisationUsers: orgUserIds.map((id) => state.users.details[id]),
      loading: state.users.loading,
    };
  });
  console.log({
    applicationUsers,
    organisationUsers,
  });
  const fetchApplications = () => {
    dispatch(getApplicationUsers(id));
  };

  const fetchEntities = () => {
    dispatch(getUsers());
  };

  React.useEffect(() => {
    fetchEntities();
    fetchApplications();
  }, [dispatch]);

  const remainingUsers = []
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
              dispatch(
                addApplicationUser({ application_id: parseInt(id, 10), user_id: values.user_id }),
              ).then(() => {
                setFlag((prev) => !prev);
                history.push(`/applications/${id}/edit`);
              });
            }}
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
                Invite Users
              </Button>
            </Form.Item>
          </Form>
          <UsersList id={id} flag={flag} users={applicationUsers} total={applicationUsers.length}/>
        </Space>
      )}
    </>
  );
}

export default ApplicationUser;
