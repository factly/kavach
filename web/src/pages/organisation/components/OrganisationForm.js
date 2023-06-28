import React from 'react';
import { Button, Form, Input, Space, Skeleton } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addOrganisation, getOrganisations } from './../../../actions/organisations';
import { useHistory } from 'react-router-dom';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import ErrorComponent from '../../../components/ErrorsAndImage/ErrorComponent';

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 3,
  },
};

function OrganisationCreate() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();
  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };
  const { organisationCount, loading } = useSelector((state) => {
    return {
      organisationCount: state.organisations.ids ? state.organisations.ids.length : 0,
      loading: state.organisations.loading,
    };
  });
  return (
    <>
      {!loading ? (
        window.REACT_APP_ENABLE_MULTITENANCY === 'true' || organisationCount < 1 ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="organisation-descriptions-header">
              <div className="organisation-descriptions-title">
                <h2 className="organisation-title-main">Create new Organisation</h2>
              </div>
            </div>
            <Form
              form={form}
              name="organisation_create"
              layout="vertical"
              onFinish={(values) =>
                dispatch(addOrganisation(values))
                  .then(dispatch(getOrganisations()))
                  .then(history.push('/organisation'))
              }
              style={{
                maxWidth: '600px',
              }}
            >
              <Form.Item name="title" label="Title" required={true}>
                <Input placeholder="Title" onChange={(e) => onTitleChange(e.target.value)} />
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
                <Input placeholder="Slug"></Input>
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea placeholder="Description" />
              </Form.Item>
              <Form.Item label="Upload Image" name="featured_medium_id">
                <MediaSelector />
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Space>
                  <Button form="organisation_create" type="primary" htmlType="submit" block>
                    Save
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Space>
        ) : (
          <ErrorComponent
            status="403"
            title="You can only create one organisation"
            link="/settings"
            message="Back Home"
          />
        )
      ) : (
        <Skeleton />
      )}
    </>
  );
}

export default OrganisationCreate;
