import React from 'react';
import { Button, Card, Form, Input, Skeleton } from 'antd';
import {
  updateApplicationRole,
  updateOrganisationRole,
  updateSpaceRole,
  getApplicationRoleByID,
  getOrganisationRoleByID,
  getSpaceRoleByID,
} from '../../../actions/roles';

import {  useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

export default function EditRoles() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const location = useLocation()
  const type = location.state
  const { id, appID, spaceID } = useParams();

  const onUpdate = (data) => {
    switch(type){
    	case 'organisation':
    		dispatch(updateOrganisationRole(id, data));
        break;
      case 'application':
        dispatch(updateApplicationRole(id, appID, data))
        break
      case 'space':
        dispatch(updateSpaceRole(id, appID, spaceID, data))
        break
      default:
        return
    }
  };

  const { role, loading } = useSelector((state) => {
    switch (type) {
      case 'organisation':
        return {
          role: state.roles.organisation[state.organisations.selected][id],
          loading: state.roles.loading,
        };

      case 'application':
        return {
          role: state.roles.application[appID][id],
          loading: state.roles.loading,
        };

      case 'space':
        return {
          role: state.roles.space[spaceID][id],
          loading: state.roles.loading,
        };

      default:
        return {
          role: {},
          loading: true
        };
    }
  });

  const fetchRole = () => {
    switch (type) {
      case 'organisation':
        dispatch(getOrganisationRoleByID(id));
        break;
      case 'application':
        dispatch(getApplicationRoleByID(id, appID));
        break;
      case 'space':
        dispatch(getSpaceRoleByID(id, appID, spaceID));
        break;
      default:
        return;
    }
  };

  React.useEffect(() => {
    fetchRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {loading ? (
        <Skeleton />
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Card
            style={{
              width: 400,
            }}
          >
            <h1>{'Update ' + type + ' role'}</h1>
            <Form
              name="role_update"
              layout="vertical"
              onFinish={(values) => onUpdate(values)}
              form={form}
              initialValues={{
                name: role.name,
                description: role.description,
              }}
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  {
                    required: true,
                    message: 'Please input role name!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  {
                    required: true,
                    message: 'Please input role description!',
                  },
                ]}
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block form="role_update">
                  Update
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      )}
    </>
  );
}
