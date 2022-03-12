import React from 'react';
import UsersList from './components/usersList';
import { Space, Form, Button, Select } from 'antd';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addApplicationUser } from '../../../actions/applicationUsers';
import { getAllUsers } from '../../../actions/users';
import { getApplicationUsers } from '../../../actions/applicationUsers';
function ApplicationUser({ id }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [flag, setFlag] = React.useState(false);
  const history = useHistory();

  // const { users } = useSelector(({ users, organisations: { selected } }) => {
  //   let details = [];
  //   let ids = [];
  //   ids = users.organisations[selected] ? users.organisations[selected] : [];
  //   details = ids.map((id) => users.details[id]);
  //   return { users: details  };
  // });

  const { remainingUsers } = useSelector((state) => {
    const orgUserIds = state.organisations[state.organisations.selected]?.user_ids;
    const appUserIds = state.applications.details[id]?.user_ids;
    return {
      remainingUsers:
        orgUserIds && appUserIds
          ? orgUserIds
              .filter((id) => !appUserIds.includes(id))
              ?.map((id) => state.users.details[id])
          : [],
    };
  });
  const fetchApplications = () => {
    console.log('fetch application');
    dispatch(getApplicationUsers(id));
  };

  const fetchEntities = () => {
    console.log('fetch entities');
    dispatch(getAllUsers());
  };

  React.useEffect(() => {
    fetchEntities();
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // React.useEffect(() => {

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
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

      <UsersList id={id} flag={flag} />
    </Space>
  );
}

export default ApplicationUser;
