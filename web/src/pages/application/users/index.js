import React from 'react';
import UsersList from './components/usersList';
import { Space, Form, Button, Select } from 'antd';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addApplicationUser } from '../../../actions/applicationUsers';
import { getAllUsers } from '../../../actions/users';
import { getApplicationUsers } from '../../../actions/applicationUsers';
function Application({ id }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [flag, setFlag] = React.useState(false);
  const history = useHistory();

  let value = [undefined];

  const { users, loadingUsers } = useSelector(({ users, organisations: { selected } }) => {
    let details = [];
    let ids = [];
    ids = users.organisations[selected] ? users.organisations[selected] : [];
    details = value.filter((id) => users.details[id]).map((id) => users.details[id]);
    details = details.concat(
      ids.filter((id) => !value.includes(id)).map((id) => users.details[id]),
    );
    return { users: details, loadingUsers: users.loading };
  });

  React.useEffect(() => {
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const fetchEntities = () => {
    dispatch(getAllUsers());
  };

  const { applicationUsers, loadingApplicationUsers, total } = useSelector(
    ({ applicationUsers }) => {
      return {
        applicationUsers: applicationUsers.details[id] || [],
        loadingApplicationUsers: applicationUsers.loading,
        total: applicationUsers.details[id]?.length || 0,
      };
    },
  );
  React.useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  const fetchApplications = () => {
    dispatch(getApplicationUsers(id));
  };

  const remainingUsers = users.filter((data, index) =>
    applicationUsers.every((newData) => !(newData.email === data.email)),
  );

  return (
    <Space direction="vertical">
      <Form
        form={form}
        name="filters"
        layout="inline"
        onFinish={(values) => {
          return dispatch(
            addApplicationUser({ application_id: parseInt(id, 10), user_id: values.user_id }),
          ).then(() => {
            setFlag(!flag);
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

      <UsersList id={id} flag={flag} />
    </Space>
  );
}

export default Application;
