import React from 'react';
import { Button, Form, Input, Skeleton } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addOrganisation, getOrganisations } from './../../../actions/organisations';
import { useHistory } from 'react-router-dom';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import ErrorComponent from '../../../components/ErrorsAndImage/ErrorComponent';

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
        process.env.REACT_APP_ENABLE_MULTITENANCY === 'true' || organisationCount < 1 ? (
          <Form
            form={form}
            name="organisation_create"
            layout="vertical"
            onFinish={(values) =>
              dispatch(addOrganisation(values))
                .then(dispatch(getOrganisations()))
                .then(history.push('/organisations'))
            }
            style={{
              width: '400px',
            }}
          >
            <Form.Item name="title" label="Title">
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
            <Form.Item>
              <Button form="organisation_create" type="primary" htmlType="submit" block>
                Save
              </Button>
            </Form.Item>
          </Form>
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
