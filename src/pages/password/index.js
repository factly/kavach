import React from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { LockOutlined } from '@ant-design/icons';

function Password() {
  const [password, setPassword] = React.useState({});

  React.useEffect(() => {
    var obj = {};

    window.location.search
      .split('?')
      .filter((each) => each.trim() !== '')
      .forEach((each) => {
        var temp = each.split('=');
        obj[temp[0]] = temp[1];
      });

    if (!obj['flow']) {
      window.location.href = window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/browser';
    }

    fetch(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/flows?id=' + obj['flow'])
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        setPassword(res.methods.password);
        if (res.update_successful) {
          notification.success({
            message: 'Success',
            description: 'Password has been successful updated',
          });
        }
      })
      .catch((err) => {
        window.location.href =
          window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/browser';
      });
  }, []);

  const changePassword = (values) => {
    var updatePasswordForm = document.createElement('form');
    updatePasswordForm.action = password.config.action;
    updatePasswordForm.method = password.config.method;
    updatePasswordForm.style.display = 'none';

    var passwordInput = document.createElement('input');
    passwordInput.name = 'password';
    passwordInput.value = values.password;

    var csrfInput = document.createElement('input');
    csrfInput.name = 'csrf_token';
    csrfInput.value = password.config.fields.find((value) => value.name === 'csrf_token').value;

    updatePasswordForm.appendChild(passwordInput);
    updatePasswordForm.appendChild(csrfInput);

    document.body.appendChild(updatePasswordForm);

    updatePasswordForm.submit();
  };

  return (
    <div className="content">
      <Card title="Update Password" style={{ width: 400 }}>
        <Form name="update_password" onFinish={changePassword}>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[{ required: true, message: 'Please re-enter your Password!' },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if(getFieldValue('password') !== value) {
                  return Promise.reject('Password do no match!');
                }
                  return Promise.resolve();
              }
            })
          ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Confirm Password"
            />
          </Form.Item>
          <Form.Item>
            <Button form="update_password" type="primary" htmlType="submit" block>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Password;
