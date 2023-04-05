import React from 'react';
import { Button, Form, Input, Card, Skeleton } from 'antd';
import { maker } from '../../../../../utils/sluger';
import SlugInput from '../../../../../components/FormItems/SlugInput';
import { useParams, useHistory, Link } from 'react-router-dom';
import { createSpace } from '../../../../../actions/space';
import { useDispatch, useSelector } from 'react-redux';
import { getApplication } from '../../../../../actions/application';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 5,
  },
};

export default function CreateSpace() {
  const [form] = Form.useForm();
  const { appID } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const onNameChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const onSubmit = (values) => {
    if (!values?.meta_fields || values.meta_fields === '') {
      values.meta_fields = {};
    } else {
      values.meta_fields = JSON.parse(values.meta_fields);
    }
    dispatch(createSpace(values, appID)).then(() => {
      history.push(`/applications/${appID}/settings/spaces`);
    });
  };

  const { application, loadingApp, role, loadingRole } = useSelector((state) => {
    return {
      application: state.applications.details[appID] ? state.applications.details[appID] : null,
      loadingApps: state.applications.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getApplication(appID));
  }, [dispatch, appID]);

  return (
    <div>
      {loadingApp || loadingApp || loadingRole ? <Skeleton /> : null}
      {role !== 'owner' ? (
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
              <h2 className="application-title-main">Create Space in - {application?.name}</h2>
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
            onFinish={(values) => onSubmit(values)}
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
            <Form.Item
              name="meta_fields"
              label="Meta"
              rules={[
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (value === '' || value === undefined) {
                      return Promise.resolve();
                    }
                    try {
                      JSON.parse(value);
                      return Promise.resolve();
                    } catch (error) {
                      return Promise.reject('Invalid JSON format: ', error);
                    }
                  },
                }),
              ]}
            >
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
    </div>
  );
}
