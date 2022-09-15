import React from 'react';
import { Button, Card, Form, Input, Select, Skeleton } from 'antd';
import { getOrganisationPolicyByID, updateOrganisationPolicy } from '../../../../../actions/policy';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPermissionField from '../../../../../components/Policies';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { getOrganisation } from '../../../../../actions/organisations';
import { checker, maker } from '../../../../../utils/sluger';
import { getIds } from '../../../../../utils/objects';

export default function EditOrganisationPolicy() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { orgID, policyID } = useParams();
  const history = useHistory();

  const { policy, loading, role, loadingRole, organisation, loadingOrg, roles } = useSelector((state) => {
    var roleIDs = state.organisations.details[orgID]?.roleIDs || [];
    return { 
      policy: {...state.policy.organisation?.[orgID]?.[policyID], roles: state.policy.organisation?.[orgID]?.[policyID]?.roles.map((rID) => state.roles.organisation?.[orgID]?.[rID])},
      loading: state.policy.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
      organisation: state.organisations.details[orgID],
      loadingOrg: state.organisations.loading,
      roles: roleIDs.map((id) => state.roles.organisation[orgID][id]),
      loadingRoles: state.roles.loading,
    };
  });

  const onUpdate = (data) => {
    dispatch(updateOrganisationPolicy(policyID, {...policy, ...data}))
    .then(() => history.push(`/organisation/${orgID}/settings/policies`));
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
    dispatch(getOrganisationPolicyByID(policyID));
  };

  React.useEffect(() => {
    fetchPolicy();
    dispatch(getOrganisation(orgID));
    // eslint-disable-next-line
  }, []);

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
      {loading || loadingOrg || loadingRole  ? (
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
          title={`Edit Organisation Policy - ${organisation?.title}`}
          style={{
            width: '50%',
            alignSelf: 'center',
          }}
        >
          <Form
            name="update-organisation-policy"
            layout="vertical"
            onFinish={(values) => onUpdate(values).then(() => onReset())}
            form={form}
            initialValues={{...policy, roles: getIds(policy?.roles)}}
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
                  <Select.Option value={role.id} key={role.id} label={role.name}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block form="update-organisation-policy">
                Update Policy
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
