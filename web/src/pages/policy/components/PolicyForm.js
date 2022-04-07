import React from 'react';
import { Card, Form, Input, Button, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPermissionField from './DynamicPermissionField';
import { getOrganisationRoles, getApplicationRoles, getSpaceRoles } from '../../../actions/roles';
export default function FormComponent({ type, onSubmit, form }) {
  const [appID, setAppID] = React.useState(null);
  const [spaceID, setSpaceID] = React.useState(null);
  const dispatch = useDispatch();
  const { applications, loading, spaces, loadingSpaces } = useSelector((state) => {
    return {
      applications: state.organisations.details[state.organisations.selected].applications.map(
        (id) => state.applications.details[id],
      ),
      loading: state.organisations.loading,
      spaces:
        appID === null
          ? []
          : state.applications.details[appID].spaces.map((id) => state.spaces.details[id]),
      loadingSpaces: state.applications.loading,
    };
  });

  const { roles, loadingRoles } = useSelector((state) => {
    var roleIDs = [];
    switch (type) {
      case 'organisation':
        roleIDs = state.organisations.details[state.organisations.selected]?.roleIDs || [];
        return {
          roles: roleIDs.map((id) => state.roles.organisation[state.organisations.selected][id]),
          loadingRoles: state.roles.loading,
        };
      case 'application':
        roleIDs = state.applications.details[appID]?.roleIDs || [];
        return {
          roles: roleIDs.map((id) => state.roles.application[appID][id]),
          loadingRoles: state.roles.loading,
        };
      case 'space':
        roleIDs = state.spaces.details[spaceID]?.roleIDs || [];
        return {
          roles: roleIDs.map((id) => state.roles.space[spaceID][id]),
          loadingRoles: state.roles.loading,
        };
      default:
        return {
          roles: [],
          loadingRoles: true,
        };
    }
  });

  const fetchRoles = () => {
    switch (type) {
      case 'organisation':
        dispatch(getOrganisationRoles());
        break;
      case 'application':
        if (appID) {
          dispatch(getApplicationRoles(appID));
        }
        break;
      case 'space':
        if (spaceID) {
          dispatch(getSpaceRoles(appID, spaceID));
        }
        break;
      default:
        return;
    }
  };

  const onChange = (value) => {
    setAppID(value);
  };

  const onSpaceChange = (value) => {
    setSpaceID(value);
  };

  React.useEffect(() => {
    setAppID(applications[0]?.id);
    setSpaceID(spaces[0]?.id);
    fetchRoles();
    // eslint-disable-next-line
  }, [type]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      {!loading && !loadingRoles && !loadingSpaces ? (
        <Card
          style={{
            width: 550,
          }}
        >
          <h1>{'Create ' + type + ' role'}</h1>
          <Form
            name="policy_create"
            layout="vertical"
            onFinish={(values) => onSubmit(values, type)}
            form={form}
            initialValues={{
              application: applications[0]?.id,
              space: spaceID,
            }}
          >
            {(type === 'application' || type === 'space') && !loading ? (
              <Form.Item
                label="Application"
                name="application"
                rules={[
                  {
                    required: true,
                    message: 'Please input application name!',
                  },
                ]}
              >
                <Select onChange={onChange}>
                  {applications.map((app) => {
                    return (
                      <Select.Option key={app.id} value={app.id}>
                        {app.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            ) : null}
            {type === 'space' && !loadingSpaces ? (
              <Form.Item
                label="Space"
                name="space"
                rules={[
                  {
                    required: true,
                    message: 'Please input space name!',
                  },
                ]}
              >
                <Select onChange={onSpaceChange}>
                  {spaces.map((space) => {
                    return (
                      <Select.Option key={space.id} value={space.id}>
                        {space.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            ) : null}
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
            <DynamicPermissionField type="create" />
            <Form.Item
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
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block form="policy_create">
                Create Policy
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ) : null}
    </div>
  );
}
