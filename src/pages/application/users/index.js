import React from 'react';
import UsersList from './components/usersList';
import { Space, Form, Button } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import Selector from '../../../components/Selector';
import { useDispatch } from 'react-redux';
import { addApplicationUser } from '../../../actions/applicationUsers';

function Application() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const history = useHistory();

  const { id } = useParams();

  return (
    <Space direction="vertical">
      <Form
        form={form}
        name="filters"
        layout="inline"
        onFinish={(values) =>
          dispatch(
            addApplicationUser({ application_id: parseInt(id, 10), user_id: values.user_id }),
          ).then(() => history.push(`/applications`))
        }
        style={{ maxWidth: '100%' }}
      >
        <Form.Item name="user_id" label="Users">
          <Selector />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add user
          </Button>
        </Form.Item>
      </Form>

      <UsersList id={id} />
    </Space>
  );
}

export default Application;
