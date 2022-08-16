import React, { useState } from 'react';
import './index.css';
import { Link } from 'react-router-dom';
import { Input, Form, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getErrorMsgByCode } from '../../utils/errorcode';
import OIDC from './oidc';
import kavach_logo from '../../assets/kavach.png';
import createForm from '../../utils/form';
import MFA from './mfa';
import passwordValidation from '../../utils/password-validation';
import posthog from 'posthog-js';
import Lottie from 'react-lottie';
import animationData from './login.json';
import getApplicationSettings from '../../utils/getApplicationSettings';

function Auth(props) {
  const [ui, setUI] = React.useState({});
  const [applicationSettings, setApplicationSettings] = useState({
    applicationName: 'Kavach',
    applicationLogoURL: kavach_logo,
    applicationURL: window.REACT_APP_PUBLIC_URL,
    loginMethod: 'all',
    enableRegistration: true,
  });

  const [aal2, setaal2] = React.useState(false); // aal stands for authenticator assurance level
  var afterRegistrationReturnToURL = localStorage.getItem('returnTo')
    ? localStorage.getItem('returnTo')
    : null;

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

    let selfServiceURL;
    if (returnTo) {
      selfServiceURL =
        window.REACT_APP_KRATOS_PUBLIC_URL +
        '/self-service/' +
        props.flow +
        '/browser?return_to=' +
        returnTo;
    } else if (afterRegistrationReturnToURL) {
      selfServiceURL =
        window.REACT_APP_KRATOS_PUBLIC_URL +
        '/self-service/' +
        props.flow +
        '/browser?return_to=' +
        afterRegistrationReturnToURL;
    } else {
      selfServiceURL =
        window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/' + props.flow + '/browser';
    }

    if (!obj['flow']) {
      window.location.href = selfServiceURL;
    } else {
      fetch(
        window.REACT_APP_KRATOS_PUBLIC_URL +
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
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error(res.json());
          }
        })
        .then((res) => {
          setUI(res.ui);
          setaal2(res.requested_aal === 'aal2');
          if (props.flow === 'login' && res.return_to) {
            localStorage.setItem('returnTo', res.return_to);
          }
        })
        .catch((err) => {
          window.location.href = window.REACT_APP_PUBLIC_URL + '/error';
        });
    }
  }, [props.flow, afterRegistrationReturnToURL]);

  React.useEffect(() => {
    const object = getApplicationSettings(afterRegistrationReturnToURL);
    setApplicationSettings(object);
  }, [afterRegistrationReturnToURL]);

  const handleClose = () => {
    if (afterRegistrationReturnToURL) {
      window.location.href = afterRegistrationReturnToURL;
    }
  };

  const withPassword = (values) => {
    posthog.capture('Login Event', { email: values?.email });
    var authForm = createForm(ui.action, ui.method);

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

    // adding first name and last name if the flow is for registration
    if (props.flow !== 'login') {
      var fnameInput = document.createElement('input');
      fnameInput.name = 'traits.name.first';
      fnameInput.value = values.first_name || '';

      var lnameInput = document.createElement('input');
      lnameInput.name = 'traits.name.last';
      lnameInput.value = values.last_name || '';

      authForm.appendChild(fnameInput);
      authForm.appendChild(lnameInput);
    }

    document.body.appendChild(authForm);
    authForm.submit();
  };

  return (
    <div className="auth">
      <div
        style={{ width: '50%', background: '#3A54AA', display: 'flex', justifyContent: 'center' }}
      >
        <Lottie
          options={{
            loop: false,
            autoplay: true,
            animationData: animationData,
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          width: '50%',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'flex-end',
            marginTop: '10px',
            marginRight: '20px',
          }}
        >
          <CloseCircleOutlined style={{ fontSize: '36px' }} onClick={handleClose} />
        </div>
        <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>x
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}
          >
            {applicationSettings?.applicationLogoURL ? (
              <img
                alt="logo"
                className="logo"
                src={applicationSettings.applicationLogoURL}
                style={{ maxWidth: '360px', height: 'auto' }}
              />
            ) : (
              <span className="title">{applicationSettings.applicationName}</span>
            )}
          </div>
          {aal2 ? (
            <MFA ui={ui} />
          ) : (
            <div style={{ maxWidth: 600, minWidth: 400, margin: '2rem' }}>
              <Form name="auth" onFinish={withPassword}>
                {ui.messages
                  ? ui.messages.map((message, index) => (
                      <Alert message={getErrorMsgByCode(message.id)} type="error" key={index} />
                    ))
                  : null}
                <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                  {ui?.nodes?.filter((each) => each.group === 'oidc').length > 0 &&
                  (applicationSettings.loginMethod === 'all' ||
                    applicationSettings.loginMethod === 'oidc')
                    ? [
                        <OIDC
                          ui={ui}
                          flow={props.flow}
                          loginMethod={applicationSettings.loginMethod}
                        />,
                      ]
                    : null}
                </div>
                {ui.nodes && ui.nodes.messages ? (
                  <Form.Item>
                    {ui.nodes.messages.map((message, index) => (
                      <Alert message={getErrorMsgByCode(message.id)} type="error" key={index} />
                    ))}
                    :{' '}
                  </Form.Item>
                ) : null}
                {ui.nodes
                  ? ui.nodes.map((node, index) => {
                      return node.messages.length > 0 ? (
                        <Alert message={node.messages[0].text} type="error" key={index} />
                      ) : null;
                    })
                  : null}
                {props.flow !== 'login' &&
                (applicationSettings.loginMethod === 'all' ||
                  applicationSettings.loginMethod === 'password') ? (
                  <div>
                    <Form.Item
                      name="first_name"
                      rules={[{ required: true, message: 'Please input your First Name!' }]}
                    >
                      <Input
                        size='large'
                        prefix={<UserOutlined className="site-form-item-icon" />}
                        placeholder="First Name"
                      />
                    </Form.Item>
                    <Form.Item name="last_name">
                      <Input
                        size='large'
                        prefix={<UserOutlined className="site-form-item-icon" />}
                        placeholder="Last Name"
                      />
                    </Form.Item>
                  </div>
                ) : null}
                {applicationSettings.loginMethod === 'all' ||
                applicationSettings.loginMethod === 'password' ? (
                  <div>
                    <Form.Item
                      name="email"
                      rules={[
                        { required: true, message: 'Please input your Email!' },
                        { type: 'email', message: 'Please input valid Email!' },
                      ]}
                    >
                      <Input
                        size='large'
                        prefix={<UserOutlined className="site-form-item-icon" />}
                        placeholder="Email"
                      />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={
                        props.flow !== 'login'
                          ? [
                              { required: true, message: 'Please input your Password!' },
                              ({ getFieldValue }) => ({
                                validator(rule, value) {
                                  if (passwordValidation(value) !== null) {
                                    return Promise.reject(passwordValidation(value));
                                  }
                                  return Promise.resolve();
                                },
                              }),
                            ]
                          : [{ required: true, message: 'Please input your Password!' }]
                      }
                    >
                      <Input.Password
                        size='large'
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Password"
                      />
                    </Form.Item>
                  </div>
                ) : null}
                {props.flow === 'login' ? (
                  ''
                ) : applicationSettings.loginMethod === 'all' ||
                  applicationSettings.loginMethod === 'password' ? (
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
                      size='large'
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder="Confirm Password"
                    />
                  </Form.Item>
                ) : null}
                {applicationSettings.loginMethod === 'all' ||
                applicationSettings.loginMethod === 'password' ? (
                  <Form.Item>
                    <Button size="large" form="auth" type="primary" htmlType="submit" block>
                      {props.flow === 'login' ? 'Login' : 'Register'}
                    </Button>
                  </Form.Item>
                ) : null}
                {ui && ui.messages ? (
                  ui.messages[0].id === 4000010 ? (
                    <Form.Item>
                      <Link to={'/auth/verification'}>
                        <Button type="primary" block>
                          Verify your Email
                        </Button>
                      </Link>
                    </Form.Item>
                  ) : null
                ) : null}
              </Form>
            </div>
          )}
          <div style={{
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            justifyContent:'center',
            fontSize: '16px',
            fontWeight: 1000
          }}>
            {
              props.flow === 'login' ? (
              <div 
                style={{
                  display:'flex',
                  flexDirection:'column',
                  alignItems:'center',
                  gap:'4px'
                }}
              >
                {
                  applicationSettings.enableRegistration ? <Link to={'/auth/registration'} >Don't have an account yet? <u>Sign up</u></Link> : null
                }
                <Link to={'/auth/recovery'}>Forgot Password?</Link>
              </div>) : 
              (
              <Link to={'/auth/login'}> Already have an account? <u>Log in</u> </Link>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
