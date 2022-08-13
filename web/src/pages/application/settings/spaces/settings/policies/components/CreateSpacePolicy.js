import React from 'react';
import { Card, Form, Input, Button, Select, Skeleton } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPermissionField from '../../../../../../../components/Policies';
import { maker, checker } from '../../../../../../../utils/sluger';
import { getSpaceRoles } from '../../../../../../../actions/roles';
import { getSpaceByID } from '../../../../../../../actions/space';
import ErrorComponent from '../../../../../../../components/ErrorsAndImage/ErrorComponent';
import { Link, useHistory, useParams } from 'react-router-dom';
import { createSpacePolicy } from '../../../../../../../actions/policy';

export default function CreateSpacePolicyForm() {
  const dispatch = useDispatch();
  const { appID, spaceID } = useParams();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const history = useHistory();
  const { space, loadingSpace, role, loadingRole } = useSelector((state) => {
    return {
      space: state.spaces.details[spaceID] ? state.spaces.details[spaceID] : null,
      loadingSpace: state.spaces.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });

  const { roles, loadingRoles } = useSelector((state) => {
    var roleIDs = state.spaces.details[spaceID]?.roleIDs || [];
    return {
      roles: roleIDs.map((id) => state.roles.space[spaceID][id]),
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
    dispatch(getSpaceRoles(appID, spaceID));
  };

  const onCreate = (values) => {
    dispatch(createSpacePolicy(appID, spaceID, values)).then(() =>
      history.push(`/applications/${appID}/settings/spaces/${spaceID}/settings/policies`),
    );
  };

  React.useEffect(() => {
    dispatch(getSpaceByID(appID, spaceID));
    fetchRoles();
    //eslint-disable-next-line
  }, [dispatch, appID, spaceID]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/applications/${appID}/settings/spaces/${spaceID}/settings/policies`}>
        <Button type="primary">Back to Policies</Button>
      </Link>
      {loadingSpace || loadingRole || loadingRoles ? <Skeleton /> : null}
      {role !== 'owner' ? (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      ) : (
        <Card
          title={`Create Space Policy - ${space?.name}`}
          style={{
            width: '50%',
            alignSelf: 'center',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            name="create-space-policy"
            onFinish={(values) => {
              onCreate(values);
              onReset();
            }}
          >
            <h3> Space : {space?.name}</h3>
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
                  <Select.Option value={role?.id} key={role?.id} label={role?.name}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block form="create-space-policy">
                Create Policy
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
