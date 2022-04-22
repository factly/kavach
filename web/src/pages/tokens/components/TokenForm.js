import React from 'react';
import { Card, Form, Input, Button, Select } from 'antd';
import { useSelector } from 'react-redux';

export default function FormComponent({ type, onSubmit, form }) {
  const [appID, setAppID] = React.useState(null);
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
          width: 400,
        }}
      >
        <h1>{'Create ' + type + ' token'}</h1>
        <Form
          name="token_create"
          layout="vertical"
          onFinish={(values) => onSubmit(values, type)}
          form={form}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                message: 'Please input token name!',
              },
            ]}
          >
            <Input />
          </Form.Item>
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
              <Select>
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
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                message: 'Please input token description!',
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block form="token_create">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
