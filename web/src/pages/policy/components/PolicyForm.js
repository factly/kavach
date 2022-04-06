import React from 'react';
import { Card, Form, Input, Button, Select } from 'antd';
import { useSelector } from 'react-redux';
import DynamicPermissionField from './DynamicPermissionField';

export default function FormComponent({ type, onSubmit, form }) {
  const [appID, setAppID] = React.useState(null);
  const [spaceID, setSpaceID] = React.useState(null);
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

  const onChange = (value) => {
    setAppID(value);
  };

  const onSpaceChange = (value) => {
    setSpaceID(value);
  };

  React.useEffect(() => {
    setAppID(applications[0]?.id);
    setSpaceID(spaces[0]?.id);
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
      <Card
        style={{
          width: 700,
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
          <DynamicPermissionField />
          <Form.Item
            name="roles"
            labels="Roles"
            rules={[
                {
                  required: true,
                  message: 'Please chose the roles'
                }
              ]}>
            <Select
              mode='multiple'
              style={{ width: '100%' }}
              placeholder="select one role"
              optionLabelProp="label"
            >

            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block form="policy_create">
              Create Policy
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
