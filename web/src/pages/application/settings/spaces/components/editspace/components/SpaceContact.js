import React from 'react';
import { Form, Skeleton, Card, Button, Input } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { editSpace, getSpaceByID } from '../../../../../../../actions/space';

export default function SpaceContact() {
  const [form] = Form.useForm();
  const { appID, spaceID } = useParams();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getSpaceByID(appID, spaceID));
    //eslint-disable-next-line
  }, [appID, spaceID]);
  const history = useHistory();
  const { space, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[spaceID],
      loading: state.spaces.loading,
    };
  });

  const handleSubmit = (data) => {
    const socialMedia = {
      facebook: data.facebook,
      twitter: data.twitter,
      slack: data.slack,
      instagram: data.instagram,
    };

    const contact = {
      telephone: data.telephone,
      mobile: data.mobile,
    };

    const reqBody = { ...space };
    reqBody.social_media_urls = socialMedia;
    reqBody.contact_info = contact;
    delete reqBody.users;
    dispatch(editSpace(spaceID, appID, reqBody)).then(() =>
      history.push(`/applications/${appID}/settings/spaces/${spaceID}/edit`),
    );
  };

  return (
    <div>
      {loading ? (
        <Skeleton />
      ) : (
        <Card title="Edit contact details" style={{ width: '50%' }}>
          <Form
            name="space-contact-details"
            form={form}
            initialValues={{
              telephone: space?.contact_info?.telephone,
              mobile: space?.contact_info?.mobile,
              facebook: space?.social_media_urls?.facebook,
              instagram: space?.social_media_urls?.instagram,
              twitter: space?.social_media_urls?.twitter,
              slack: space?.social_media_urls?.slack,
            }}
            onFinish={handleSubmit}
          >
            <Form.Item name="telephone" label="Telephone number">
              <Input placeholder="telephone" />
            </Form.Item>
            <Form.Item name="mobile" label="Mobile number">
              <Input placeholder="mobile" />
            </Form.Item>
            <Form.Item name="facebook" label="Facebook URL">
              <Input placeholder="facebook" />
            </Form.Item>
            <Form.Item name="twitter" label="Twitter URL">
              <Input placeholder="twitter" />
            </Form.Item>
            <Form.Item name="instagram" label="Instagram URL">
              <Input placeholder="instagram" />
            </Form.Item>
            <Form.Item name="slack" label="Slack URL">
              <Input placeholder="slack" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" form="space-contact-details" block>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
