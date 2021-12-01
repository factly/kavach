import React, {useState} from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addOrganisation } from './../../actions/organisations';
import { useHistory } from 'react-router-dom';
import { maker, checker } from '../../utils/sluger';
import MediaSelector from '../../components/MediaSelector';

function OrganisationCreate() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const {organisationCount, loading} = useSelector((state)=>{
    const count = (state.organisations && state.organisations.ids) ? state.organisations.ids.length : null
    return {
      organisationCount: count,
      loading: state.organisations.loading,
    }
  })
  const onTitleChange = (form, string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const [isModalVisible, setModalVisible] = useState((organisationCount==0)?true:false)
  const changeModalVisibility = (visible)=>{
    setModalVisible(visible)
  }

  const handleFormSubmit = (values)=>{
    dispatch(addOrganisation(values)).then(history.push('/settings'))
  }
  React.useEffect(()=>{
    if(organisationCount==0){
      setModalVisible(true)
    }else{
      setModalVisible(false)
    }
  }, [organisationCount])

  const FormComponent = ({form, name})=>{
    return (
      <Form
        form={form}
        name={name}
        layout="vertical"
        onFinish={(values)=>handleFormSubmit(values)}
        style={{
          width: '400px',
        }}
      >
        <Form.Item name="title" label="Title">
          <Input placeholder="Title" onChange={(e) => onTitleChange(form ,e.target.value)} />
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
          <Button form={name} type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form.Item>
      </Form>
    )
  }
  return (
    <>
      <Modal
        visible={isModalVisible}
        closable={false}
        footer={null}
        >
        <h2>Create an Organisation</h2>
        <FormComponent form={modalForm} name="modal"/>
      </Modal>
      <FormComponent form={form} name="non-modal"/>
    </>
  );
}

export default OrganisationCreate;
