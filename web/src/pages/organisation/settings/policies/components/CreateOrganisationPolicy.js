import React from 'react';
import { Form, Input, Button, Select, Skeleton } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPermissionField from '../../../../../components/Policies';
import { maker, checker } from '../../../../../utils/sluger';
import { getOrganisationRoles } from '../../../../../actions/roles';
import { getOrganisation } from '../../../../../actions/organisations';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { Link, useHistory, useParams } from 'react-router-dom';
import { createOrganisationPolicy } from '../../../../../actions/policy';

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 5,
  },
};

export default function CreateOrganisationPolicyForm() {
  const dispatch = useDispatch();
  const { orgID } = useParams();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const history = useHistory();
  const { organisation, loadingOrg, role, loadingRole } = useSelector((state) => {
    return {
      organisation: state.organisations.details[orgID] ? state.organisations.details[orgID] : null,
      loadingOrg: state.applications.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });

  const { roles, loadingRoles } = useSelector((state) => {
    var roleIDs = state.organisations.details[orgID]?.roleIDs || [];
    return {
      roles: roleIDs.map((id) => state.roles.organisation[orgID][id]),
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
    dispatch(getOrganisationRoles(orgID));
  };

  const onCreate = (values) => {
    dispatch(createOrganisationPolicy(values)).then(() =>
      history.push(`/organisation/${orgID}/settings/policies`),
    );
  };

  const onFinish = (values) => {
    onCreate(values);
    onReset();
  };

  React.useEffect(() => {
    dispatch(getOrganisation(orgID));
    fetchRoles();
    //eslint-disable-next-line
  }, [dispatch, orgID]);

  return (
    <div>
      {loadingOrg || loadingRole || loadingRoles ? (
        <Skeleton />
      ) : role !== 'owner' ? (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      ) : (
        <>
          <div className="organisation-descriptions-header">
            <div className="organisation-descriptions-title">
              <h2 className="organisation-title-main">
                Create Organisation Policy - {organisation?.title}
              </h2>
            </div>
            <div>
              <Link key="1" to={`/organisation/${orgID}/settings/policies`}>
                <Button type="primary">Back to Policies</Button>
              </Link>
            </div>
          </div>
          <Form
            form={form}
            layout="vertical"
            name="create-organisation-policy"
            onFinish={(values) => {
              onCreate(values);
              onReset();
            }}
            style={{
              maxWidth: '600px',
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
              label="Select Roles"
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
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit" block form="create-organisation-policy">
                Create Policy
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
}
