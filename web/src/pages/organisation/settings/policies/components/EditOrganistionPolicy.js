import React from 'react';
import { Button, Card, Form, Input, Skeleton } from 'antd';
import { getOrganisationPolicyByID, updateOrganisationPolicy } from '../../../../../actions/policy';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPermissionField from '../../../../../components/Policies';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { getOrganisation } from '../../../../../actions/organisations';
import { checker, maker } from '../../../../../utils/sluger';

export default function EditOrganisationPolicy() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { orgID, policyID } = useParams();

  const { policy, loading, role, loadingRole, organisation, loadingOrg } = useSelector((state) => {
    return {
      policy: state.policy.organisation[orgID][policyID],
      loading: state.policy.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
      organisation: state.organisations.details[orgID],
      loadingOrg: state.organisations.loading,
    };
  });

  const onUpdate = (data) => {
    dispatch(updateOrganisationPolicy(policyID, data));
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
    <div>
      {loading || loadingOrg || loadingRole ? (
        <Skeleton />
      ) : role !== 'owner' ? (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      ) : (
        <Card title={`Edit Organisation Policy - ${organisation?.title}`} style={{ width: '50%' }}>
          <Form
            name="update-organisation-policy"
            layout="vertical"
            onFinish={(values) => onUpdate(values).then(() => onReset())}
            form={form}
            initialValues={policy}
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
