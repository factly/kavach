import React from 'react';
import { Card, Form, Input, Button, Row, Col, notification } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

function Verification() {
  const [ui, setUI] = React.useState({});
  const title = window.REACT_APP_KAVACH_TITLE || 'Kavach';

  React.useEffect(() => {
    var obj = {};
    window.location.search
      .split('?')
      .filter((each) => each.trim() !== '')
      .forEach((each) => {
        var temp = each.split('=');
        obj[temp[0]] = temp[1];
      });
    fetch(
      window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/verification/flows?id=' + obj['flow'],
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
        if (res && res.state === 'sent_email') {
          notification['success']({
            message: 'Email successfully sent',
          });
        }
        if (res && res.state === 'passed_challenge') {
          window.location.href = window.REACT_APP_PUBLIC_URL + '/auth/login';
        }
      })
      .catch(() => {
        window.location.href =
          window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/verification/browser';
      });
  }, []);

  const withEmail = (values) => {
    var recoverPasswordForm = document.createElement('form');
    recoverPasswordForm.action = ui.action;
    recoverPasswordForm.method = ui.method;
    recoverPasswordForm.style.display = 'none';

    var emailInput = document.createElement('input');
    emailInput.name = 'email';
    emailInput.value = values.email;

    var csrfInput = document.createElement('input');
    csrfInput.name = 'csrf_token';
    csrfInput.value = ui.nodes.find((value) => {
      if (value.attributes.name === 'csrf_token') {
        return value;
      } else {
        return null;
      }
    }).attributes.value;

    var methodInput = document.createElement('input');
    methodInput.name = 'method';
    methodInput.value = 'link';

    recoverPasswordForm.appendChild(emailInput);
    recoverPasswordForm.appendChild(csrfInput);
    recoverPasswordForm.appendChild(methodInput);
    document.body.appendChild(recoverPasswordForm);
    recoverPasswordForm.submit();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Row className="header">
        <Col span={6}>
          <img alt="logo" className="logo" src={require('../../assets/kavach_icon.png')} />
        </Col>
        <Col span={18}>
          <span className="title">{title}</span>
        </Col>
      </Row>
      <Card title="Verify your account" style={{ width: 400 }}>
        <Form name="verification_email" onFinish={withEmail}>
          <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!' }]}>
            <Input prefix={<UserOutlined />} type="email" placeholder="Email" />
          </Form.Item>
          <Form.Item>
            <Button form="verification_email" type="primary" htmlType="submit" block>
              Send verification link
            </Button>
          </Form.Item>
          <Form.Item>
            <Link to={'/auth/login'}>
              <Button type="primary" block>
                Go back
              </Button>
            </Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Verification;
