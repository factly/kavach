import React from 'react';
import { Button, Card, Form, Input, Skeleton } from 'antd';
import { updateOrganisationRole, getOrganisationRoleByID } from '../../../../../actions/roles';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checker, maker } from '../../../../../utils/sluger';
import { getOrganisation } from '../../../../../actions/organisations';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';

export default function EditOrganisationRole() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { orgID, roleID } = useParams();
  const { TextArea } = Input;
  const onReset = () => {
    form.restFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const onUpdate = (data) => {
    dispatch(updateOrganisationRole(roleID, data));
  };

  const { role, loading, organisation, loadingOrg, userRole, loadingUserRole } = useSelector(
    (state) => {
      return {
        role: state.roles.organisation[state.organisations.selected][roleID],
        loading: state.roles.loading,
        organisation: state.organisations.details[state.organisations.selected],
        loadingApp: state.organisations.loading,
        userRole: state.profile.roles[state.organisations.selected],
        loadingUserRole: state.profile.loading,
      };
    },
  );

  const fetchRole = () => {
    dispatch(getOrganisationRoleByID(roleID));
  };

  React.useEffect(() => {
    fetchRole();
    dispatch(getOrganisation(orgID));
    //eslint-disable-next-line
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
      {loading || loadingOrg || loadingUserRole ? (
        <Skeleton />
      ) : (
        <Card title={`Edit Organisation Role - ${organisation?.title}`} style={{ width: '50%' }}>
          <Form
            form={form}
            layout="vertical"
            name="update-organisation-role"
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
            <h3> Organisation : {organisation?.title}</h3>
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
              <Button type="primary" htmlType="submit" block form="update-organisation-role">
                Update Role
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
