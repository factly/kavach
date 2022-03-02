import React from 'react';
import { Steps, Form, Button, Card, Row, Skeleton } from 'antd';
import SpaceDetails from './components/SpaceDetails';
import SpaceMetadata from './components/SpaceMetaData';
import SpaceLogoForm from './components/SpaceLogoForm';
import SpaceContact from './components/SpaceContact';
import { useHistory, useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { editSpace } from '../../../actions/space';
function EditSpace() {
  const [form] = Form.useForm();
  const [current, setCurrent] = React.useState(0);
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const { space, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[id] ? state.spaces.details[id] : null,
      loading: state.spaces.loading,
    };
  });

  const handleFinish = (values) => {
    dispatch(editSpace(id, space.application.id, values)).then(() => {
      history.push(`/applications/${space.application.id}/spaces/${space.id}/edit`);
    });
  };

  const steps = [
    {
      title: 'Step 1',
      description: 'Edit the details of your space',
      component: <SpaceDetails form={form} />,
    },
    {
      title: 'Step 2',
      description: 'Choose the logos for your space',
      component: <SpaceLogoForm />,
    },
    {
      title: 'Step 3',
      description: 'Enter space contact details',
      component: <SpaceContact />,
    },
    {
      title: 'Step 4',
      description: 'Enter meta data for space',
      component: <SpaceMetadata />,
    },
  ];

  return (
    <>
      {loading ? (
        <Skeleton />
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Steps progressDot current={current}>
            {steps.map((step, index) => (
              <Steps.Step key={index} title={step.title} description={step.description} />
            ))}
          </Steps>
          <Card
            style={{
              width: 600,
            }}
          >
            <Form
              name="space_edit"
              layout="vertical"
              form={form}
              onFinish={() => handleFinish(form.getFieldsValue(true))}
              initialValues={{ ...space }}
            >
              {steps[current].component}
              {current === 3 ? (
                <Form.Item>
                  <Button type="primary" htmlType="submit" form="space_edit" block>
                    Submit
                  </Button>
                </Form.Item>
              ) : null}
            </Form>

            <Row
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Button
                onClick={() => setCurrent(current - 1)}
                type="primary"
                size="medium"
                disabled={current < 1}
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrent(current + 1)}
                type="primary"
                size="medium"
                disabled={current >= 3}
              >
                Next
              </Button>
            </Row>
          </Card>
        </div>
      )}
    </>
  );
}

export default EditSpace;
