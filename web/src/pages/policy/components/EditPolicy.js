import React from 'react';
import { Button, Card, Form, Input, Skeleton } from 'antd';
import {
  updateApplicationPolicy,
  updateOrganisationPolicy,
  updateSpacePolicy,
  getApplicationPolicyByID,
  getOrganisationPolicyByID,
  getSpacePolicyByID,
} from '../../../actions/policy';

import { useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPermissionField from './DynamicPermissionField';

export default function EditPolicy() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const location = useLocation();
  const type = location.state;
  const { id, appID, spaceID } = useParams();

  const onUpdate = (data) => {
    switch (type) {
      case 'organisation':
        dispatch(updateOrganisationPolicy(id, data));
        break;
      case 'application':
        dispatch(updateApplicationPolicy(id, appID, data));
        break;
      case 'space':
        dispatch(updateSpacePolicy(id, appID, spaceID, data));
        break;
      default:
        return;
    }
  };

  const { policy, loading } = useSelector((state) => {
    switch (type) {
      case 'organisation':
        return {
          policy: state.policy.organisation[state.organisations.selected][id],
          loading: state.policy.loading,
        };

      case 'application':
        return {
          policy: state.policy.application[appID][id],
          loading: state.policy.loading,
        };

      case 'space':
        return {
          policy: state.policy.space[spaceID][id],
          loading: state.policy.loading,
        };

      default:
        return {
          policy: {},
          loading: true,
        };
    }
  });

  const fetchPolicy = () => {
    switch (type) {
      case 'organisation':
        dispatch(getOrganisationPolicyByID(id));
        break;
      case 'application':
        dispatch(getApplicationPolicyByID(id, appID));
        break;
      case 'space':
        dispatch(getSpacePolicyByID(id, appID, spaceID));
        break;
      default:
        return;
    }
  };

  React.useEffect(() => {
    fetchPolicy();
    // eslint-disable-next-line
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
              name="policy_update"
              layout="vertical"
              onFinish={(values) => onUpdate(values)}
              form={form}
              initialValues={policy}
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  {
                    required: true,
                    message: 'Please input policy name!',
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
                    message: 'Please input policy description!',
                  },
                ]}
              >
                <Input.TextArea />
              </Form.Item>
              <DynamicPermissionField type="update" />
              {/* <Form.Item
              name="roles"
              labels="Roles"
              rules={[
                {
                  required: true,
                  message: 'Please chose the roles',
                },
              ]}
            >
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="select one role"
                optionLabelProp="label"
              >
                {roles.map((role) => (
                  <Select.Option value={role.id} key={role.id} label={role.name}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item> */}
              <Form.Item>
                <Button type="primary" htmlType="submit" block form="policy_update">
                  Update Policy
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      )}
    </>
  );
}
