import React from 'react';
import { Button, Form, Input, Card, Skeleton } from 'antd';
import { maker } from '../../../../../utils/sluger';
import SlugInput from '../../../../../components/FormItems/SlugInput';
import { useParams, useHistory, Link } from 'react-router-dom';
import { editSpace, getSpaceByID } from '../../../../../actions/space';
import { useDispatch, useSelector } from 'react-redux';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { getApplication } from '../../../../../actions/application';

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 5,
  },
};

export default function EditSpaceForm() {
  const [form] = Form.useForm();
  const { appID, spaceID } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const onNameChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  React.useEffect(() => {
    dispatch(getApplication(appID));
    dispatch(getSpaceByID(appID, spaceID));
    //eslint-disable-next-line
  }, [appID, spaceID]);

  const { space, loading, application, loadingApp, role, loadingRole } = useSelector((state) => {
    return {
      space: state.spaces.details[spaceID],
      loading: state.spaces.loading,
      application: state.applications.details[appID],
      loadingApp: state.applications.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });

  const handleSubmit = (data) => {
    delete data.users;
    data.meta_fields = data.meta_fields ? JSON.parse(data.meta_fields) : {};
    dispatch(editSpace(spaceID, appID, data)).then(() =>
      history.push(`/applications/${appID}/settings/spaces/${spaceID}/edit`),
    );
  };

  return (
    <>
      {loading || loadingApp || loadingRole ? (
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
          <div className="application-descriptions-header">
            <div className="application-descriptions-title">
              <h2 className="application-title-main">Edit Space in - {application?.name}</h2>
            </div>
            <div>
              <Link key="1" to={`/applications/${appID}/settings/spaces`}>
                <Button type="primary">Back to Spaces</Button>
              </Link>
            </div>
          </div>
          <Form
            name="space_create"
            layout="vertical"
            form={form}
            initialValues={{
              ...space,
              meta_fields: space?.meta_fields ? JSON.stringify(space.meta_fields) : '',
            }}
            onFinish={(values) => handleSubmit(values)}
            style={{
              maxWidth: '600px',
            }}
          >
            <Form.Item
              name="application_name"
              label="Application Name"
              initialValue={application?.name}
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: 'Name is required' },
                { min: 3, message: 'Name must be minimum 3 characters.' },
                { max: 50, message: 'Name must be maximum 50 characters.' },
              ]}
            >
              <Input
                placeholder="enter a name for your space"
                onChange={(e) => onNameChange(e.target.value)}
              />
            </Form.Item>
            <SlugInput />
            <Form.Item name="description" label="Description">
              <Input placeholder="enter a description for your space" />
            </Form.Item>
            <Form.Item name="meta_fields" label="Meta">
              <Input.TextArea placeholder="enter meta_fields for your space" />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit" block>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </>
  );
}
