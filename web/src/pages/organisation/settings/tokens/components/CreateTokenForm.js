import React from 'react';
import { Form, Input, Button, Card, Skeleton, Modal } from 'antd';
import { addOrganisationToken } from '../../../../../actions/token';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import ErrorComponent from '../../../../../components/ErrorsAndImage/ErrorComponent';
import { getOrganisation } from '../../../../../actions/organisations';
import ClipBoardCopy from '../../../../../utils/clipboardClick';

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 5,
  },
};

const CreateOrganisationToken = () => {
  const dispatch = useDispatch();
  const { orgID } = useParams();
  const [form] = Form.useForm();
  const history = useHistory();
  const [token, setToken] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const { TextArea } = Input;
  const onReset = () => {
    form.resetFields();
  };

  const onCreate = (values) => {
    dispatch(addOrganisationToken(values, setToken, setShowModal));
  };

  const { organisation, loadingOrg, role, loadingRole } = useSelector((state) => {
    return {
      organisation: state.organisations.details[orgID] ? state.organisations.details[orgID] : null,
      loadingApps: state.organisations.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
    };
  });

  const handleOk = () => {
    history.push(`/organisation/${orgID}/settings/tokens`);
  };

  React.useEffect(() => {
    dispatch(getOrganisation(orgID));
  }, [dispatch, orgID]);

  return (
    <>
      {loadingOrg || loadingRole ? (
        <Skeleton />
      ) : role === 'owner' ? (
        <>
          <div className="organisation-descriptions-header">
            <div className="organisation-descriptions-title">
              <h2 className="organisation-title-main">
                Create Organisation Token - {organisation?.title}
              </h2>
            </div>
          </div>
          <Form
            form={form}
            layout="vertical"
            name="create-organisation-token"
            onFinish={(values) => {
              onCreate(values);
              onReset();
            }}
            style={{
              maxWidth: '600px',
            }}
          >
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
              <Button type="primary" htmlType="submit" form="create-organisation-token">
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
        </>
      ) : (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      )}
    </>
  );
};

export default CreateOrganisationToken;
