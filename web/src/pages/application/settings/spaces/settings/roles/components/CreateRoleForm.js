import React from 'react';
import { Form, Input, Button, Card, Skeleton } from 'antd';
import { createSpaceRole } from '../../../../../../../actions/roles';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import { getSpaceByID } from '../../../../../../../actions/space';
import { checker, maker } from '../../../../../../../utils/sluger';
import ErrorComponent from '../../../../../../../components/ErrorsAndImage/ErrorComponent';

const CreateSpaceRoleForm = () => {
  const dispatch = useDispatch();
  const history = useHistory()
  const { appID, spaceID } = useParams();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const { space, loadingSpace, role, loadingRole } = useSelector((state) => {
    return {
      space: state.spaces.details[spaceID] ? state.spaces.details[spaceID] : null,
      loadingSpace: state.spaces.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getSpaceByID(appID, spaceID));
    //eslint-disable-next-line
  }, [dispatch, appID, spaceID]);

  const onCreate = (values) => {
    dispatch(createSpaceRole(appID, spaceID, values)).then(history.push(`/applications/${appID}/settings/spaces/${spaceID}/settings/roles/`));
  };

  return (
    <div
      style={{ 
        display:'flex',
        flexDirection:'column',
        gap:'20px'
      }}
    >
      <Link key="1" to={`/applications/${appID}/settings/spaces/${spaceID}/settings/roles`}>
        <Button type="primary">Back to Roles</Button>
      </Link>
      {loadingSpace || loadingRole ? <Skeleton /> : null}
      {role !== 'owner' ? (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      ) : (
        <Card title={`Create Space Role - ${space?.name}`} 
          style={{ 
            width: '50%',
            alignSelf:'center'
          }}>
          <Form
            form={form}
            layout="vertical"
            name="create-space-role"
            onFinish={(values) => {
              onCreate(values);
              onReset();
            }}
          >
            {/* <Form.Item name="application_name" label="Application Name" initialValue={application.name}>
										<Input disabled={true} />
									</Form.Item> */}
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
                  message: 'Please input role description!',
                },
              ]}
            >
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block form="create-space-role">
                Create Role
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default CreateSpaceRoleForm;
