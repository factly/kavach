import React from 'react';
import './registration.css';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { Input, Form, Button, Card, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

function Registration() {
  const [config, setConfig] = React.useState({});

  React.useEffect(() => {
    var obj = {};

    window.location.search
      .split('?')
      .filter((each) => each.trim() !== '')
      .forEach((each) => {
        var temp = each.split('=');
        obj[temp[0]] = temp[1];
      });

    if (!obj['request']) {
      window.location.href =
        process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/browser/flows/registration';
    }

    fetch(
      process.env.REACT_APP_KRATOS_PUBLIC_URL +
        '/self-service/browser/flows/requests/registration?request=' +
        obj['request'],
    )
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => setConfig(res.methods.password.config))
      .catch((err) => {
        console.log(err);
        window.location.href =
          process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/browser/flows/registration';
      });
  }, []);

  if (!config.action) return null;

  const onFinish = (values) => {
    var loginForm = document.createElement('form');
    loginForm.action = config.action;
    loginForm.method = config.method;
    loginForm.style.display = 'none';

    var identifierInput = document.createElement('input');
    identifierInput.name = 'traits.email';
    identifierInput.value = values.email;

    var passwordInput = document.createElement('input');
    passwordInput.name = 'password';
    passwordInput.value = values.password;

    var csrfInput = document.createElement('input');
    csrfInput.name = 'csrf_token';
    csrfInput.value = config.fields.find((value) => value.name === 'csrf_token').value;

    loginForm.appendChild(identifierInput);
    loginForm.appendChild(passwordInput);
    loginForm.appendChild(csrfInput);

    document.body.appendChild(loginForm);

    loginForm.submit();
  };

  return (
    <div className="registration">
      <div className="content">
      <Row className="header">
        <Col span={6}>
          <img alt="logo" className="logo" src={logo} />
        </Col>
        <Col span={18}>
          <span className="title">Identity</span>
        </Col>
      </Row>
      <Card
        actions={[<Link to={'/auth/login'}>Log In!</Link>]}
        title="Registration"
        style={{ width: 400 }}
      >
        <Form name="registration" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your Email!' },
              { type: 'email', message: 'Please input valid Email!' },
            ]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Button form="registration" type="primary" htmlType="submit" block>
              Register
            </Button>
          </Form.Item>
        </Form>
      </Card>
      </div>
    </div>
  );
}

export default Registration;
