import React, { useState } from 'react';
import { Form, Input, Button, notification } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import './index.css';
import { Link } from 'react-router-dom';
import BrandingComponent from '../../components/Branding';
import getApplicationSettings from '../../utils/getApplicationSettings';
import Loading from '../../components/Loading';

function Recovery() {
  const [ui, setUI] = React.useState({});
  const [applicationSettings, setApplicationSettings] = useState({
    applicationName: 'FACTLY',
    applicationLogoURL: window.REACT_APP_LOGO_URL,
    applicationURL: window.REACT_APP_PUBLIC_URL,
    loginMethod: 'all',
    enableRegistration: true,
  });

  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    function checkApplicationSettings() {
      const object = getApplicationSettings(localStorage.getItem('returnTo'));
      setApplicationSettings(object);
    }
    window.addEventListener('storage', checkApplicationSettings);
    return () => {
      window.removeEventListener('storage', checkApplicationSettings);
    };
  }, []);

  React.useEffect(() => {
    setLoading(true);
    var obj = {};
    window.location.search
      .split('?')
      .filter((each) => each.trim() !== '')
      .forEach((each) => {
        var temp = each.split('=');
        obj[temp[0]] = temp[1];
      });
    if (!obj['flow']) {
      window.location.href = window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/recovery/browser';
    }
    fetch(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/recovery/flows?id=' + obj['flow'], {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        setUI(res.ui);
        if (res.ui.messages) {
          if (res.ui.messages[0].id === 1060002) {
            notification.success({
              message: 'Success',
              description: 'successfull sent the recovery email',
            });
          } else {
            notification.error({
              message: 'Error',
              description: 'unable to send the recovery email',
            });
          }
        }
      })
      .catch(() => {
        notification.error({
          message: 'Error',
          description: 'unable to proceed further!',
        });
      })
      .finally(() => setLoading(false));
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
    <div className="auth">
      <BrandingComponent />
      {loading ? (
        <Loading />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            width: '50%',
          }}
        >
          <div style={
            { 
              marginTop: 'auto', 
              marginBottom: 'auto',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              gap:'8px' 
            }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center',
              }}
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
            <h2 style={{
              fontSize:'32px'
            }}>Reset your Password</h2>
            <Form name="recovery_email" onFinish={withEmail}>
              <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!' }]}>
                <Input prefix={<MailOutlined />} type="email" placeholder="Please enter your email" size="large" 
                style={{
                  width:'480px',
                }}/>
              </Form.Item>
              <Form.Item>
                <Button form="recovery_email" size="large" type="primary" htmlType="submit" shape="round" block>
                  Send recovery link
                </Button>
              </Form.Item>
            </Form>
            <Link to={'/auth/login'} style={
              {
                fontSize:'16px'
              }
            }> 
              Go back to login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recovery;
