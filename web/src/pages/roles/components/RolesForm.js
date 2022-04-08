import React from 'react';
import { Card, Form, Input, Button, Select } from 'antd';
import { useSelector } from 'react-redux';
import { maker, checker } from '../../../utils/sluger';
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

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
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
          width: 400,
        }}
      >
        <h1>{'Create ' + type + ' role'}</h1>
        <Form
          name="role_create"
          layout="vertical"
          onFinish={(values) => onSubmit(values, type)}
          form={form}
          initialValues={{
            application: applications[0]?.id,
            space: spaceID,
          }}
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
            <Input onChange={(e) => onTitleChange(e.target.value)} placeholder="enter the name" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              {
                required: true,
                message: 'Please input the slug!',
              },
              {
                pattern: checker,
                message: 'Please enter valid slug!',
              },
            ]}
          >
            <Input placeholder="enter the slug"></Input>
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
            <Button type="primary" htmlType="submit" block form="role_create">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
