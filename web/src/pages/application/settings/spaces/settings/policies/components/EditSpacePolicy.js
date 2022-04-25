import React from 'react';
import { Button, Card, Form, Input, Skeleton } from 'antd';
import { getSpacePolicyByID, updateSpacePolicy } from '../../../../../../../actions/policy';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DynamicPermissionField from '../../../../../../../components/Policies';
import ErrorComponent from '../../../../../../../components/ErrorsAndImage/ErrorComponent';
import { getSpaceByID } from '../../../../../../../actions/space';
import { checker, maker } from '../../../../../../../utils/sluger';

export default function EditSpacePolicy() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { appID, spaceID, policyID } = useParams();

  const { policy, loading, role, loadingRole, space, loadingSpace } = useSelector((state) => {
    return {
      policy: state.policy.space[spaceID][policyID],
      loading: state.policy.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
      space: state.spaces.details[spaceID],
      loadingSpace: state.spaces.loading,
    };
  });

  const onUpdate = (data) => {
    dispatch(updateSpacePolicy(policyID, appID, spaceID, data));
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
    dispatch(getSpacePolicyByID(appID, spaceID, policyID));
  };

  React.useEffect(() => {
    fetchPolicy();
    dispatch(getSpaceByID(appID, spaceID));
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
    <div>
      {loading || loadingRole || loadingSpace ? (
        <Skeleton />
      ) : (
        <Card title={`Edit Space Policy - ${space?.name}`} style={{ width: '50%' }}>
          <Form
            name="update-space-policy"
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
              <Button type="primary" htmlType="submit" block form="update-space-policy">
                Update Policy
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
