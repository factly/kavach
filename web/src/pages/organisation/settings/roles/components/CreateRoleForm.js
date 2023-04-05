import React from 'react';
import { Form, Input, Button, Card, Skeleton } from 'antd';
import { createOrganisationRole } from '../../../../../actions/roles';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { getOrganisation } from '../../../../../actions/organisations';
import { checker, maker } from '../../../../../utils/sluger';

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 5,
  },
};

const CreateOrganisationRoleForm = () => {
  const dispatch = useDispatch();
  const { orgID } = useParams();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const onReset = () => {
    form.resetFields();
  };
  const history = useHistory();
  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const { organisation, loadingOrg, role, loadingRole } = useSelector((state) => {
    return {
      organisation: state.organisations.details[state.organisations.selected]
        ? state.organisations.details[state.organisations.selected]
        : null,
      loadingOrg: state.organisations.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getOrganisation(orgID));
  }, [dispatch, orgID]);

  const onCreate = (values) => {
    dispatch(createOrganisationRole(values)).then(() =>
      history.push(`/organisation/${orgID}/settings/roles`),
    );
  };

  return (
    <>
      {loadingOrg || loadingRole ? (
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
                Create Organisation Role - {organisation?.title}
              </h2>
            </div>
            <div>
              <Link key="1" to={`/organisation/${orgID}/settings/roles`}>
                <Button type="primary">Back to Roles</Button>
              </Link>
            </div>
          </div>
          <Form
            form={form}
            layout="vertical"
            name="create-organisation-role"
            onFinish={(values) => {
              onCreate(values);
              onReset();
            }}
            style={{ maxWidth: '600px' }}
          >
            {/* <Form.Item name="organisation_name" label="Application Name" initialValue={organisation.name}>
										<Input disabled={true} />
									</Form.Item> */}
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
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit" block form="create-organisation-role">
                Create Role
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </>
  );
};

export default CreateOrganisationRoleForm;
