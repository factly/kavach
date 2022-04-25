import React from 'react';
import { Form, Input, Button, Card, Skeleton } from 'antd';
import SlugInput from '../../../../../../../components/FormItems/SlugInput';
import { maker } from '../../../../../../../utils/sluger';
import { editSpace, getSpaceByID } from '../../../../../../../actions/space';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

function SpaceDetails() {
  const [form] = Form.useForm();
  const { appID, spaceID } = useParams();
  const dispatch = useDispatch();
  const { TextArea } = Input;
  const onNameChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  React.useEffect(() => {
    dispatch(getSpaceByID(appID, spaceID));
    //eslint-disable-next-line
  }, [appID, spaceID]);

  const { space, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[spaceID],
      loading: state.spaces.loading,
    };
  });

  const handleSubmit = (data) => {
    const reqBody = { ...space, ...data };
    reqBody.users = null;
    dispatch(editSpace(spaceID, appID, reqBody));
  };

  return (
    <div>
      {!loading ? (
        <Card title="Edit basic space details" style={{ width: '50%' }}>
          <Form
            name="space-basic-details"
            form={form}
            initialValues={space}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: 'Name is required' },
                { min: 3, message: 'Name must be minimum 3 characters.' },
                { max: 50, message: 'Name must be maximum 50 characters.' },
              ]}
            >
              <Input placeholder="Name" onChange={(e) => onNameChange(e.target.value)} />
            </Form.Item>
            <SlugInput />
            <Form.Item name="description" label="Description">
              <TextArea />
            </Form.Item>
            <Form.Item name="site_title" label="Site Title">
              <Input placeholder="Site Title" />
            </Form.Item>
            <Form.Item name="site_address" label="Website">
              <Input placeholder="Site Address" />
            </Form.Item>
            <Form.Item name="tag_line" label="Tag Line">
              <Input placeholder="Tag Line" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" form="space-basic-details" block>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ) : (
        <Skeleton />
      )}
    </div>
  );
}

export default SpaceDetails;
