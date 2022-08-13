import React from 'react';
import { Button, Card, Form, Input, Skeleton } from 'antd';
import { updateApplicationRole, getApplicationRoleByID } from '../../../../../actions/roles';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checker, maker } from '../../../../../utils/sluger';
import { getApplication } from '../../../../../actions/application';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';

export default function EditApplicationRole() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { appID, roleID } = useParams();
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
    dispatch(updateApplicationRole(roleID, appID, data));
  };

  const { role, loading, application, loadingApp, userRole, loadingUserRole } = useSelector(
    (state) => {
      return {
        role: state.roles.application[appID][roleID],
        loading: state.roles.loading,
        application: state.applications.details[appID],
        loadingApp: state.applications.loading,
        userRole: state.profile.roles[state.organisations.selected],
        loadingUserRole: state.profile.loading,
      };
    },
  );

  const fetchRole = () => {
    dispatch(getApplicationRoleByID(appID, roleID));
  };

  React.useEffect(() => {
    fetchRole();
    dispatch(getApplication(appID));
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
    <div
      style={{
        display:'flex',
        flexDirection:'column',
        gap:'20px'
      }}
    >
      <Link key="1" to={`/applications/${appID}/settings/roles`}>
        <Button type="primary">Back to Roles</Button>
      </Link>
      {loading && loadingApp && loadingUserRole ? (
        <Skeleton />
      ) : (
        <Card title={`Edit Application Role - ${application?.name}`} 
          style={
            { 
              width: '50%',
              alignSelf:'center'
           }}>
          <Form
            form={form}
            layout="vertical"
            name="update-application-role"
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
            <Form.Item
              name="application_name"
              label="Application Name"
              initialValue={application.name}
            >
              <Input disabled={true} />
            </Form.Item>
            {/* <h3> Application : {application?.name}</h3> */}
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
              <Button type="primary" htmlType="submit" block form="update-application-role">
                Update Role
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
