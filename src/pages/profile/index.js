import React from 'react';
import { Card, Form, Input, Button } from 'antd';

function Profile() {
  const [profile, setProfile] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/profile')
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
          setProfile(res)
          setLoading(false)
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const updateProfile = (values) => {
    fetch(process.env.REACT_APP_API_URL + '/profile', {
      method: 'PUT',
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        setProfile(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
  return (
    <div className="content">
      <Card title="Update Profile" style={{ width: 400 }} loading={loading}>
        <Form 
            name="update_profile" 
            onFinish={updateProfile} 
            initialValues={profile}
        >
          <Form.Item
            name="first_name"
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>
          <Form.Item
            name="last_name"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input placeholder="Last name" />
          </Form.Item>
          <Form.Item>
            <Button form="update_profile" type="primary" htmlType="submit" block>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Profile;
