import React from 'react';
import { Button, Form, Input, Select, Skeleton } from 'antd';
import { getApplicationPolicyByID, updateApplicationPolicy } from '../../../../../actions/policy';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPermissionField from '../../../../../components/Policies';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { checker, maker } from '../../../../../utils/sluger';
import { getIds } from '../../../../../utils/objects';

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 5,
  },
};

export default function EditApplicationPolicy() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { appID, policyID } = useParams();
  const history = useHistory();
  const { policy, loading, role, loadingRole, application, loadingApp, roles } = useSelector(
    (state) => {
      var roleIDs = state.applications.details[appID]?.roleIDs || [];
      return {
        policy: {
          ...state.policy?.application?.[appID]?.[policyID],
          roles: state.policy.application?.[appID]?.[policyID]?.roles?.map(
            (rID) => state.roles.application?.[appID]?.[rID],
          ),
        },
        loading: state.policy.loading,
        role: state.profile.roles[state.organisations.selected],
        loadingRole: state.profile.loading,
        application: state.applications.details[appID],
        loadingApp: state.applications.loading,
        roles: roleIDs.map((id) => state.roles.application?.[appID]?.[id]),
        loadingRoles: state.roles.loading,
      };
    },
  );

  const onUpdate = (data) => {
    dispatch(updateApplicationPolicy(appID, policyID, { ...policy, ...data })).then(
      () => history.push(`/applications/${appID}/settings/policies`),
      onReset(),
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
  // console.log(loading , loadingRole , loadingApp);

  return (
    <>
      {loading || loadingRole || loadingApp ? (
        <Skeleton />
      ) : (
        <>
          <div className="application-descriptions-header">
            <div className="application-descriptions-title">
              <h2 className="application-title-main">
                Edit Application Policy - {application?.name}
              </h2>
            </div>
            <div>
              <Link key="1" to={`/applications/${appID}/settings/policies`}>
                <Button type="primary">Back to Policies</Button>
              </Link>
            </div>
          </div>
          <Form
            name="update-application-policy"
            layout="vertical"
            onFinish={(values) => onUpdate(values)}
            form={form}
            initialValues={{ ...policy, roles: getIds(policy?.roles) }}
            style={{ maxWidth: '600px' }}
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
                placeholder="select role"
                optionLabelProp="label"
              >
                {roles?.map((role) => (
                  <Select.Option value={role?.id} key={role?.id} label={role?.name}>
                    {role?.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit" block form="update-application-policy">
                Update Policy
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </>
  );
}
