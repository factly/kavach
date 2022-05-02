import React from 'react';
import { Button, Card, Form, Input, Skeleton } from 'antd';
import { updateSpaceRole, getSpaceRoleByID } from '../../../../../../../actions/roles';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaceByID } from '../../../../../../../actions/space';
import ErrorComponent from '../../../../../../../components/ErrorsAndImage/ErrorComponent';
import { checker, maker } from '../../../../../../../utils/sluger';

export default function EditSpaceRole() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { appID, spaceID, roleID } = useParams();
  const { TextArea } = Input;
  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const onUpdate = (data) => {
    dispatch(updateSpaceRole(roleID, appID, spaceID));
  };

  const { role, loading, space, loadingSpace, userRole, loadingUserRole } = useSelector((state) => {
    return {
      role: state.roles.space[spaceID][roleID],
      loading: state.roles.loading,
      space: state.spaces.details[spaceID],
      loadingSpace: state.spaces.loading,
      userRole: state.profile.roles[state.organisations.selected],
      loadingUserRole: state.profile.loading,
    };
  });

  const fetchRole = () => {
    dispatch(getSpaceRoleByID(appID, spaceID, roleID));
  };

  React.useEffect(() => {
    fetchRole();
    dispatch(getSpaceByID(appID, spaceID));
    // eslint-disable-next-line
  }, []);

  if (!loadingUserRole) {
    if (userRole !== 'owner') {
      return (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      );
    }
  }

  return (
    <div>
      {loading && loadingSpace && loadingUserRole ? (
        <Skeleton />
      ) : (
        <Card title={`Edit Space Role - ${space?.name}`} style={{ width: '50%' }}>
          <Form
            form={form}
            layout="vertical"
            name="update-space-role"
            onFinish={(values) => {
              onUpdate(values);
              onReset();
            }}
            initialValues={{
              name: role.name,
              slug: role.slug,
              description: role.description,
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
            <Form.Item name="description" label="Description">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block form="update-space-role">
                Update Role
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
