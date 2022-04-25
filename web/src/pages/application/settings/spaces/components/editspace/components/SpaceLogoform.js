import React from 'react';
import { Form, Button, Skeleton, Card, Row, Col } from 'antd';
import { editSpace, getSpaceByID } from '../../../../../../../actions/space';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MediaSelector from '../../../../../../../components/MediaSelector';

export default function SpaceLogoForm() {
  const [form] = Form.useForm();
  const { appID, spaceID } = useParams();
  const dispatch = useDispatch();

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
    dispatch(editSpace(spaceID, appID, reqBody));
  };

  return (
    <div>
      {loading ? (
        <Skeleton />
      ) : (
        <Card title="Edit logo details" style={{ width: '50%' }}>
          <Form name="space-logo-details" form={form} initialValues={space} onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="logo_id" label="Logo">
                  <MediaSelector />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="logo_mobile_id" label="Logo Mobile">
                  <MediaSelector />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="fav_icon_id" label="FavIcon">
                  <MediaSelector />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="mobile_icon_id" label="Mobile Icon">
                  <MediaSelector />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" form="space-basic-details" block>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
