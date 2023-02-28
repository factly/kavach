import React from 'react';
import { Card, Form, Input, Button, Select, Skeleton } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPermissionField from '../../../../../components/Policies';
import { maker, checker } from '../../../../../utils/sluger';
import { getApplicationRoles } from '../../../../../actions/roles';
import { getApplication } from '../../../../../actions/application';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { Link, useHistory, useParams } from 'react-router-dom';
import { createApplicationPolicy } from '../../../../../actions/policy';

export default function CreateApplicationPolicyForm() {
  const dispatch = useDispatch();
  const { appID } = useParams();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const history = useHistory();
  const { application, loadingApp, role, loadingRole } = useSelector((state) => {
    return {
      application: state.applications.details[appID] ? state.applications.details[appID] : null,
      loadingApp: state.applications.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });
  const { roles, loadingRoles } = useSelector((state) => {
    var roleIDs = state.applications.details[appID]?.roleIDs || [];
    return {
      roles: roleIDs.map((id) => state.roles.application[appID][id]),
      loadingRoles: state.roles.loading,
    };
  });

  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const fetchRoles = () => {
    dispatch(getApplicationRoles(appID));
  };

  const onCreate = (values) => {
    dispatch(createApplicationPolicy(appID, values)).then(() =>
      history.push(`/applications/${appID}/settings/policies`),
    );
  };

  React.useEffect(() => {
    dispatch(getApplication(appID));
    fetchRoles();
    //eslint-disable-next-line
  }, [dispatch, appID]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/applications/${appID}/settings/policies`}>
        <Button type="primary">Back to Policies</Button>
      </Link>
      {loadingApp || loadingRole || loadingRoles ? <Skeleton /> : null}
      {role !== 'owner' ? (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      ) : (
        <Card
          title={`Create Application Policy - ${application?.name}`}
          style={{
            width: '50%',
            alignSelf: 'center',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            name="create-application-policy"
            onFinish={(values) => {
              onCreate(values);
              onReset();
            }}
          >
            <Form.Item
              name="application_name"
              label="Application Name"
              initialValue={application?.name}
            >
              <Input disabled={true} />
            </Form.Item>
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
              <TextArea rows={4} />
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
              <Button type="primary" htmlType="submit" block form="create-application-policy">
                Create Policy
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
