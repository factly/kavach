import React from 'react';
import { Form, Input, Button, Card, Skeleton, Modal } from 'antd';
import { addApplicationToken } from '../../../../../actions/token';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { getApplication } from '../../../../../actions/application';
import ClipBoardCopy from '../../../../../utils/clipboardClick';

const tailLayout = {
  wrapperCol: {
    offset: 8,
  },
};

const CreateApplicationTokenForm = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [form] = Form.useForm();
  const history = useHistory();
  const { TextArea } = Input;
  const [token, setToken] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const onReset = () => {
    form.resetFields();
  };

  const onCreate = (values) => {
    dispatch(addApplicationToken(id, values, setToken, setShowModal));
  };

  const handleOk = () => {
    history.push(`/applications/${id}/settings/tokens`);
  };

  const { application, loadingApp, role, loadingRole } = useSelector((state) => {
    return {
      application: state.applications.details[id] ? state.applications.details[id] : null,
      loadingApps: state.applications.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getApplication(id));
  }, [dispatch, id]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/applications/${id}/settings/tokens`}>
        <Button type="primary"> Back to Tokens</Button>
      </Link>
      {loadingApp || loadingRole ? (
        <Skeleton />
      ) : role !== 'owner' ? (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      ) : (
        <Card
          title={`Create Application Token - ${application?.name}`}
          style={{
            width: '50%',
            alignSelf: 'center',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            name="create-application-token"
            onFinish={(values) => {
              onCreate(values);
              onReset();
            }}
          >
            <Form.Item
              name="application_name"
              label="Application Name"
              initialValue={application.name}
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                {
                  required: true,
                  message: 'Please enter the name!',
                },
                { min: 3, message: 'Name must be minimum 3 characters.' },
                { max: 50, message: 'Name must be maximum 50 characters.' },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: 'Please input token description!',
                },
              ]}
            >
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Generate Token
              </Button>
            </Form.Item>
          </Form>
          <Modal
            title="Generated Token"
            visible={showModal}
            width={650}
            closable={false}
            okText="Goto Tokens"
            onOk={handleOk}
            cancelButtonProps={{
              style: {
                display: 'none',
              },
            }}
          >
            <ClipBoardCopy text={showModal === true ? token : ''} />
          </Modal>
        </Card>
      )}
    </div>
  );
};

export default CreateApplicationTokenForm;
