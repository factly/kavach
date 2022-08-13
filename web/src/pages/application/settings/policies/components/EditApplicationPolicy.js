import React from 'react';
import { Button, Card, Form, Input, Skeleton } from 'antd';
import { getApplicationPolicyByID, updateApplicationPolicy } from '../../../../../actions/policy';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPermissionField from '../../../../../components/Policies';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { getApplication } from '../../../../../actions/application';
import { checker, maker } from '../../../../../utils/sluger';

export default function EditApplicationPolicy() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { appID, policyID } = useParams();
  const history = useHistory();
  const { policy, loading, role, loadingRole, application, loadingApp } = useSelector((state) => {
    return {
      policy: state.policy.application[appID][policyID],
      loading: state.policy.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
      application: state.applications.details[appID],
      loadingApp: state.applications.loading,
    };
  });

  const onUpdate = (data) => {
    dispatch(updateApplicationPolicy(appID, policyID, data)).then(() =>
      history.push(`/applications/${appID}/settings/policies`),
    );
  };

  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const fetchPolicy = () => {
    dispatch(getApplicationPolicyByID(appID, policyID));
  };

  React.useEffect(() => {
    fetchPolicy();
    dispatch(getApplication(appID));
    // eslint-disable-next-line
  }, []);

  if (role === 'member') {
    return (
      <ErrorComponent
        status="403"
        title="Sorry you are not authorised to access this page"
        link="/organisation"
        message="Back Home"
      />
    );
  }

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
      {loading || loadingRole || loadingApp ? (
        <Skeleton />
      ) : (
        <Card
          title={`Edit Application Policy - ${application?.name}`}
          style={{
            width: '50%',
            alignSelf: 'center',
          }}
        >
          <Form
            name="update-application-policy"
            layout="vertical"
            onFinish={(values) => onUpdate(values).then(() => onReset())}
            form={form}
            initialValues={policy}
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
            <Form.Item>
              <Button type="primary" htmlType="submit" block form="update-application-policy">
                Update Policy
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
