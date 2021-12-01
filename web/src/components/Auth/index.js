import React from 'react';
import './index.css';
import { Link } from 'react-router-dom';
import { Input, Form, Button, Card, Row, Col, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import OIDC from './oidc';
import kavach_logo from '../../assets/kavach_icon.png'

function Auth(props) {
  const [ui, setUI] = React.useState({});
  const [errorMsg, setErrorMsg] = React.useState('');
  const title = process.env.REACT_APP_KAVACH_TITLE || "Kavach"
  const logo = process.env.REACT_APP_LOGO_URL || kavach_logo
  React.useEffect(() => {
    var obj = {};

    window.location.search
      .split('?')
      .filter((each) => each.trim() !== '')
      .forEach((each) => {
        var temp = each.split('=');
        obj[temp[0]] = temp[1];
      });

    const returnTo = obj['return_to'];
    const selfServiceURL = returnTo
      ? process.env.REACT_APP_KRATOS_PUBLIC_URL +
        '/self-service/' +
        props.flow +
        '/browser?return_to=' +
        returnTo
      : process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/' + props.flow + '/browser';

    if (!obj['flow']) {
      window.location.href = selfServiceURL;
    }
    fetch(
      process.env.REACT_APP_KRATOS_PUBLIC_URL +
        '/self-service/' +
        props.flow +
        '/flows' +
        '?id=' +
        obj['flow'],
      {
        credentials: 'include',
      },
    )
      .then((res) => {
        setErrorMsg('');
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        if (res.ui.nodes && res.ui.nodes[1].messages) {
          setErrorMsg(res.ui.nodes[1].messages ? '' : res.ui.nodes[1].messages[0].text);
        } else {
          setErrorMsg('');
        }
        setUI(res.ui);
      })
      .catch((err) => {
        window.location.href = selfServiceURL;
      });
  }, [props.flow]);

  const withPassword = (values) => {
    var authForm = document.createElement('form');
    authForm.action = ui.action;
    authForm.method = ui.method;
    authForm.style.display = 'none';

    var identifierInput = document.createElement('input');
    identifierInput.name = props.flow === 'login' ? 'password_identifier' : 'traits.email';
    identifierInput.value = values.email;

    var passwordInput = document.createElement('input');
    passwordInput.name = 'password';
    passwordInput.value = values.password;

    var csrfInput = document.createElement('input');
    csrfInput.name = 'csrf_token';
    csrfInput.type = 'hidden';
    csrfInput.value = ui.nodes.find(
      (value) => value.attributes.name === 'csrf_token',
    ).attributes.value;

    var methodInput = document.createElement('input');
    methodInput.name = 'method';
    methodInput.value = 'password';

    authForm.appendChild(identifierInput);
    authForm.appendChild(passwordInput);
    authForm.appendChild(csrfInput);
    authForm.appendChild(methodInput);

    document.body.appendChild(authForm);
    authForm.submit();
  };

  return (
    <div className="auth">
      <Row className="header">
        <Col span={6}>
          <img alt="logo" className="logo" src={logo} />
        </Col>
        <Col span={18}>
          <span className="title">{title}</span>
        </Col>
      </Row>
      <Card
        actions={
          ui?.nodes?.filter((each) => each.group === 'oidc').length > 0 ? [<OIDC ui={ui} />] : []
        }
        title={props.flow}
        style={{ width: 400 }}
      >
        <Form name="auth" onFinish={withPassword}>
          {ui.nodes && ui.nodes.messages ? (
            <Form.Item>
              {ui.nodes.messages.map((item, index) => (
                <Alert message={item.text} type="error" key={index} />
              ))}{' '}
            </Form.Item>
          ) : errorMsg !== '' ? (
            <Form.Item>
              <Alert message={errorMsg} type="error" />
            </Form.Item>
          ) : null}
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
              type="password"
              placeholder="Password"
              onChange={() => setErrorMsg('')}
            />
          </Form.Item>
          {props.flow === 'login' ? (
            ''
          ) : (
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please re-enter your Password!' },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (getFieldValue('password') !== value) {
                      return Promise.reject('Password do no match!');
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Confirm Password"
              />
            </Form.Item>
          )}
          <Form.Item>
            <Button form="auth" type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
          <Form.Item>
            {props.flow === 'login' ? (
              <Link to={'/auth/registration'}>Register now!</Link>
            ) : (
              <Link to={'/auth/login'}>Log In!</Link>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Auth;
