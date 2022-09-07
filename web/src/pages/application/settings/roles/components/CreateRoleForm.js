import React from 'react';
import { Form, Input, Button, Card, Skeleton } from 'antd';
import { createApplicationRole } from '../../../../../actions/roles';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { getApplication } from '../../../../../actions/application';
import { checker, maker } from '../../../../../utils/sluger';

const CreateApplicationRoleForm = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const history = useHistory();
  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const { application, loadingApp, role, loadingRole } = useSelector((state) => {
    return {
      application: state.applications.details[id] ? state.applications.details[id] : null,
      loadingApps: state.applications.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getApplication(id));
  }, [dispatch, id]);

  const onCreate = (values) => {
    dispatch(createApplicationRole(id, values)).then(() =>
      history.push(`/applications/${id}/settings/roles/`),
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/applications/${id}/settings/roles`}>
        <Button type="primary">Back to Roles</Button>
      </Link>
      {loadingApp || loadingRole ? <Skeleton /> : null}
      {role !== 'owner' ? (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      ) : (
        <Card
          title={`Create Application Role - ${application?.name}`}
          style={{
            width: '50%',
            alignSelf: 'center',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            name="create-application-role"
            onFinish={(values) => {
              onCreate(values);
              onReset();
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
            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: 'Please input role description!',
                },
              ]}
            >
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block form="create-application-role">
                Create Role
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default CreateApplicationRoleForm;
