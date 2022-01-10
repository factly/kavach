import React from 'react';
import { Card, Form, Input, Button, Space, Alert, Switch, Row, List, Col, Skeleton } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import createForm from '../../utils/form';
function Password() {
  const cardStyle = {
    width: 400,
  };
  const [ui, setUI] = React.useState({});
  const [state, setState] = React.useState('');
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
      window.location.href =
        window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/browser';
    }

    fetch(
      window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/flows?id=' + obj['flow'],
      {
        credentials: 'include',
      },
    )
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        setUI(res.ui);
        setState(res.state);
      })
      .catch(() => {
        window.location.href =
          window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/browser';
      });
  }, []);

  const getImageByText = (value) => {
    switch (value) {
      case 'google':
        return <img src={require('../../assets/google_logo.png')} alt="google" width="35%" />;
      case 'github':
        return <img src={require('../../assets/github_logo.png')} alt="github" width="35%" />;
      default:
        return null;
    }
  };
  function SocialItem({ provider, state }) {
    return (
      <Row
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Col span={18}>{getImageByText(provider)}</Col>
        <Col span={6}>
          <Switch
            checked={state === 'link' ? false : true}
            checkedChildren="linked"
            unCheckedChildren="unlinked"
            style={
              state === 'link' ? { backgroundColor: '#FF3632' } : { backgroundColor: '#52CA6D' }
            }
            onClick={() => onClick(provider, state)}
          ></Switch>
        </Col>
      </Row>
    );
  }

  const changePassword = (values) => {
    var updatePasswordForm = createForm(ui.action, ui.method);

    var emailInput = document.createElement('input');
    emailInput.name = 'password_identifier';
    emailInput.value = ui.nodes[1].attributes.value;

    var passwordInput = document.createElement('input');
    passwordInput.name = 'password';
    passwordInput.value = values.password;

    var csrfInput = document.createElement('input');
    csrfInput.name = 'csrf_token';
    csrfInput.value = ui.nodes.find(
      (value) => value.attributes.name === 'csrf_token',
    ).attributes.value;

    var methodInput = document.createElement('input');
    methodInput.name = 'method';
    methodInput.value = 'password';

    updatePasswordForm.appendChild(emailInput);
    updatePasswordForm.appendChild(passwordInput);
    updatePasswordForm.appendChild(methodInput);
    updatePasswordForm.appendChild(csrfInput);
    document.body.appendChild(updatePasswordForm);
    updatePasswordForm.submit();
  };

  const onClick = (provider, action) => {
    var oidcForm = createForm(ui.action, ui.method);

    var csrfInput = document.createElement('input');
    csrfInput.name = 'csrf_token';
    csrfInput.type = 'hidden';
    csrfInput.value = ui.nodes.find(
      (value) => value.attributes.name === 'csrf_token',
    ).attributes.value;

    var methodInput = document.createElement('input');
    methodInput.name = 'method';
    methodInput.value = 'oidc';

    var providerInput = document.createElement('input');
    providerInput.name = action; //two actions - 1)link 2)unlink
    providerInput.value = provider;

    oidcForm.appendChild(providerInput);
    oidcForm.appendChild(csrfInput);
    oidcForm.appendChild(methodInput);

    document.body.appendChild(oidcForm);

    oidcForm.submit();
  };

  const updateTOTP = (values) => {
    var totpForm = createForm(ui.action, ui.method);
    var csrfInput = document.createElement('input');
    csrfInput.name = 'csrf_token';
    csrfInput.type = 'hidden';
    csrfInput.value = ui.nodes.find(
      (value) => value.attributes.name === 'csrf_token',
    ).attributes.value;

    var totpMethod = document.createElement('input');
    totpMethod.name = 'method';
    totpMethod.value = 'totp';

    var totpInput = document.createElement('input');
    if (ui.nodes.filter((node) => node.attributes.node_type === 'img').length) {
      totpInput.name = 'totp_code';
      totpInput.value = values.totp_code;
    } else {
      totpInput.name = 'totp_unlink';
      totpInput.value = 'true';
    }

    totpForm.appendChild(csrfInput);
    totpForm.appendChild(totpMethod);
    totpForm.appendChild(totpInput);

    document.body.appendChild(totpForm);

    totpForm.submit();
  };
  return (
    <Space
      className="content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {ui && ui.messages ? (
        <Alert message={ui.messages[0].text} type={state === 'success' ? state : 'error'}></Alert>
      ) : null}
      {ui && ui.nodes ? (
        <div>
          <Card title="Update password" style={{ width: cardStyle.width }}>
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
              <Form.Item>
                <Button form="update_password" type="primary" htmlType="submit" block>
                  Update
                </Button>
              </Form.Item>
            </Form>
          </Card>
          <Card title="Manage 2FA Authentication" style={{ width: cardStyle.width }}>
            {ui !== {}
              ? ui.nodes
                  .filter((node) => node.group === 'totp')
                  .map((node) => {
                    if (node.messages.length === 0) {
                      return null;
                    } else {
                      return <Alert type="error" message={node.messages[0].text}></Alert>;
                    }
                  })
              : null}
            {ui.nodes.filter((node) => node.attributes.node_type === 'img').length ? (
              <div>
                <img
                  src={ui.nodes.find((node) => node.attributes.node_type === 'img').attributes.src}
                  alt="QRCODE"
                  style={{ width: 256, height: 256, marginLeft: 'auto', marginRight: 'auto' }}
                />
                <h4>This is your authenticator app secret. Use it if you cannot scan QR code:</h4>
                <h4>
                  <strong>
                    {
                      ui.nodes
                        .filter((node) => node.group === 'totp')
                        .find((node) => node.attributes.id === 'totp_secret_key').attributes.text
                        .text
                    }
                  </strong>
                </h4>
              </div>
            ) : null}
            <Form name="update_totp" onFinish={updateTOTP}>
              {ui.nodes.filter((node) => node.attributes.node_type === 'img').length ? (
                <div>
                  <Form.Item name="totp_code">
                    <Input type="text" placeholder="Verify Code" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                      Save
                    </Button>
                  </Form.Item>
                </div>
              ) : (
                <Form.Item name="totp_unlink">
                  <Button type="primary" htmlType="submit" block>
                    Unlink TOTP Authenticator App
                  </Button>
                </Form.Item>
              )}
            </Form>
          </Card>
          <Card title="Update social sign-in linking" style={{ width: cardStyle.width }}>
            <List
              itemLayout="horizontal"
              dataSource={ui && ui.nodes ? ui.nodes.filter((node) => node.group === 'oidc') : []}
              renderItem={(item) => {
                return (
                  <List.Item>
                    <SocialItem provider={item.attributes.value} state={item.attributes.name} />
                  </List.Item>
                );
              }}
            ></List>
          </Card>
        </div>
      ) : (
        <Skeleton />
      )}
    </Space>
  );
}

export default Password;
