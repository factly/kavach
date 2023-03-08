import React from 'react';
import { Form, Input, Button, Card, Skeleton, Modal } from 'antd';
import { addSpaceToken } from '../../../../../../../actions/token';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import ErrorComponent from '../../../../../../../components/ErrorsAndImage/ErrorComponent';
import { getSpaceByID } from '../../../../../../../actions/space';
import ClipBoardCopy from '../../../../../../../utils/clipboardClick';

const tailLayout = {
  wrapperCol: {
    offset: 8,
  },
};

const CreateSpaceTokenForm = () => {
  const dispatch = useDispatch();
  const { appID, spaceID } = useParams();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const history = useHistory();
  const [token, setToken] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);

  const onReset = () => {
    form.resetFields();
  };

  const onCreate = (values) => {
    dispatch(addSpaceToken(appID, spaceID, values, setToken, setShowModal));
  };

  const handleOk = () => {
    history.push(`/applications/${appID}/settings/spaces/${spaceID}/settings/tokens`);
  };

  const { space, loadingSpace, role, loadingRole } = useSelector((state) => {
    return {
      space: state.spaces.details[spaceID],
      loadingSpace: state.spaces.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getSpaceByID(appID, spaceID));
    //eslint-disable-next-line
  }, [dispatch, spaceID, appID]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/applications/${appID}/settings/spaces/${spaceID}/settings`}>
        <Button type="primary">Back to Tokens</Button>
      </Link>
      {loadingRole || loadingSpace ? <Skeleton /> : null}
      {role !== 'owner' ? (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      ) : (
        <Card
          title={`Create Space Token - ${space?.name}`}
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
            <h3> Space : {space?.name}</h3>
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
            open={showModal}
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

export default CreateSpaceTokenForm;
