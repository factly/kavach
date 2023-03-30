import React from 'react';
import { Form, Input, Button, DatePicker, Radio, Skeleton } from 'antd';
import dayjs from 'dayjs';
import MediaSelector from '../../components/MediaSelector';
import { maker, checker } from '../../utils/sluger';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, updateProfile } from '../../actions/profile';
import '../../styles/profile.css';

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 3,
  },
};

function Profile() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [valueChange, setValueChange] = React.useState(false);

  const { profile, loading } = useSelector((state) => {
    return {
      profile: state.profile.details ? state.profile.details : null,
      loading: state.profile.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  const update = (values) => {
    values.birth_date = values.birth_date ? values.birth_date : null;
    dispatch(updateProfile(values));
  };

  const onNameChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  if (loading) {
    return (
      <div className="content">
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="content">
      <div className="profile-descriptions-header">
        <div className="profile-descriptions-title">
          <h2 className="profile-title-main">Update Profile</h2>
        </div>
      </div>
      <div>
        <Form
          layout="vertical"
          form={form}
          name="update_profile"
          onFinish={update}
          initialValues={{
            ...profile,
            birth_date: profile && profile.birth_date ? dayjs(profile.birth_date) : null,
          }}
          onValuesChange={() => {
            setValueChange(true);
          }}
          style={{
            maxWidth: '600px',
          }}
        >
          <Form.Item label="Email" name="email">
            <Input placeholder="Email" disabled={true} />
          </Form.Item>
          <Form.Item
            label="First Name"
            name="first_name"
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>
          <Form.Item label="Last Name" name="last_name">
            <Input placeholder="Last name" />
          </Form.Item>
          <Form.Item
            name="display_name"
            label="Display Name"
            rules={[{ required: true, message: 'Please input your display name!' }]}
          >
            <Input placeholder="Display name" onChange={(e) => onNameChange(e.target.value)} />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
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
            <Input placeholder="slug" />
          </Form.Item>
          <Form.Item label="Birthdate" name="birth_date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Gender" name="gender">
            <Radio.Group>
              <Radio.Button value="male">Male</Radio.Button>
              <Radio.Button value="female">Female</Radio.Button>
              <Radio.Button value="other">Other</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="featured_medium_id" label="Display Image">
            <MediaSelector profile={true} />
          </Form.Item>
          <Form.Item label="Facebook Url" name={['social_media_urls', 'facebook']}>
            <Input placeholder="Facebook url" />
          </Form.Item>
          <Form.Item label="Twitter Url" name={['social_media_urls', 'twitter']}>
            <Input placeholder="Twitter url" />
          </Form.Item>
          <Form.Item label="LinkedIn Url" name={['social_media_urls', 'linkedin']}>
            <Input placeholder="LinkedIn url" />
          </Form.Item>
          <Form.Item label="Instagram Url" name={['social_media_urls', 'instagram']}>
            <Input placeholder="Instagram url" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Description" autoSize={{ minRows: 2, maxRows: 6 }} />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button disabled={!valueChange} form="update_profile" type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Profile;
