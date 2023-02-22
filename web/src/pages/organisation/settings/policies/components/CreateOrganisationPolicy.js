import React from 'react';
import { Card, Form, Input, Button, Select, Skeleton } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPermissionField from '../../../../../components/Policies';
import { maker, checker } from '../../../../../utils/sluger';
import { getOrganisationRoles } from '../../../../../actions/roles';
import { getOrganisation } from '../../../../../actions/organisations';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { Link, useHistory, useParams } from 'react-router-dom';
import { createOrganisationPolicy } from '../../../../../actions/policy';

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/organisation/${orgID}/settings/policies`}>
        <Button type="primary">Back to Policies</Button>
      </Link>
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
        <Card
          title={`Create Organisation Policy - ${organisation?.title}`}
          style={{
            width: '50%',
            alignSelf: 'center',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            name="create-organisation-policy"
            onFinish={onFinish}
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
              <Button type="primary" htmlType="submit" block form="create-organisation-policy">
                Create Policy
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
