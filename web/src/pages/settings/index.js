import React , { useState } from 'react';
import { Button, Form, Input, Space, Divider, Modal, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  getOrganisation,
  updateOrganisation,
  deleteOrganisation,
} from './../../actions/organisations';
import { maker, checker } from '../../utils/sluger';
import MediaSelector from '../../components/MediaSelector';

function OrganisationEdit() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    if( organisation.title === form.getFieldValue('organisationName')) {
      onConfirmDeleteOrganisation();
      setIsModalVisible(false);
    }
    else {
      message.error('Entered wrong organisation name!')
      setIsModalVisible(true);
    }
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onConfirmDeleteOrganisation = () => {
    dispatch(deleteOrganisation(organisation.id)).then(() => { 
      history.push('/organisation');
      window.location.reload();
    });
  }

  const { organisation, selected } = useSelector((state) => {
    return {
      organisation: state.organisations.details[state.organisations.selected],
      selected: state.organisations.selected,
    };
  });

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  React.useEffect(() => {
    dispatch(getOrganisation(selected));
  }, [dispatch, selected]);

  return (
    <Space direction="vertical">
      <Form
        form={form}
        name="organisation_edit"
        layout="vertical"
        onFinish={(values) => dispatch(updateOrganisation({ ...organisation, ...values }))}
        initialValues={organisation}
        style={{
          width: '400px',
        }}
      >
        <Form.Item name="title" label="Title">
          <Input placeholder="Title" onChange={(e) => onTitleChange(e.target.value)}/>
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
          <Button form="organisation_edit" type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form.Item>
      </Form>
      <Divider style={{ color: 'red' }} orientation="left">
        Danger zone
      </Divider>
      <Button onClick={showModal}>
        Delete
      </Button>
      <Modal visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <h3>Delete Organisation</h3>
        <Form
          form={form}
          name="organisation_delete"
        >
          <Form.Item name="organisationName" >
            <Input placeholder="Organisation Name" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default OrganisationEdit;
