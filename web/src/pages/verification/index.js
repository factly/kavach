import React, { useState } from 'react';
import { Form, Input, Button, notification, message, Alert } from 'antd';
import { MailOutlined, SafetyOutlined } from '@ant-design/icons';
import '../recovery/index.css';
import { Link } from 'react-router-dom';
import BrandingComponent from '../../components/Branding';
import getApplicationSettings from '../../utils/getApplicationSettings';
import Loading from '../../components/Loading';

function Verification() {
  const [ui, setUI] = React.useState({});
  const [state, setState] = React.useState('choose_method');
  // this field controls the visibility of the resend verification code button which resend the verification code when you click it
  const [isResendVisible, setIsResendVisible] = useState(false);

  // code controls the initial value for the code field in verification flow
  const [code, setCode] = useState('')
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
        setState(res?.state);
        if (res?.ui?.nodes?.filter((node) => node.group === 'code')?.length === 4) {
          setIsResendVisible(true);
        }

        if(res?.ui?.nodes?.[0]?.attributes?.value && res?.ui?.nodes?.[0]?.attributes?.name === 'code'){
          setCode(res?.ui?.nodes?.[0]?.attributes?.value)
        }

        if (res && res.state === 'passed_challenge') {
          notification['success']({
            message: 'Email successfully verified',
          });
          setTimeout(() => {
            window.location.href = window.REACT_APP_PUBLIC_URL + '/auth/login';
          }, 500)
        }
      })
      .catch(() => {
        window.location.href =
          window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/verification/browser';
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const withEmail = (values) => {
    var sendVerificationCodeToEmailForm = document.createElement('form');
    sendVerificationCodeToEmailForm.action = ui.action;
    sendVerificationCodeToEmailForm.method = ui.method;
    sendVerificationCodeToEmailForm.style.display = 'none';

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
    methodInput.value = 'code';

    sendVerificationCodeToEmailForm.appendChild(emailInput);
    sendVerificationCodeToEmailForm.appendChild(csrfInput);
    sendVerificationCodeToEmailForm.appendChild(methodInput);
    document.body.appendChild(sendVerificationCodeToEmailForm);
    sendVerificationCodeToEmailForm.submit();
  };

  // withCode is a handler for verifying the verification code
  const withCode = (values) => {
    var verifyAccountUsingCodeForm = document.createElement('form');
    verifyAccountUsingCodeForm.action = ui.action;
    verifyAccountUsingCodeForm.method = ui.method;
    verifyAccountUsingCodeForm.style.display = 'none';

    var codeInput = document.createElement('input');
    codeInput.name = 'code';
    codeInput.value = values?.code?.trim();

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
    methodInput.value = 'code';

    verifyAccountUsingCodeForm.appendChild(codeInput);
    verifyAccountUsingCodeForm.appendChild(csrfInput);
    verifyAccountUsingCodeForm.appendChild(methodInput);
    document.body.appendChild(verifyAccountUsingCodeForm);
    verifyAccountUsingCodeForm.submit();
  };

  const resendVerificationCode = () => {
    var email = '';

    // the node count which belongs to group code will be 4 only if it has an email to resend the verification email in the body
    if (ui?.nodes?.filter((node) => node.group === 'code')?.length === 4) {
      email = ui?.nodes?.filter((node) => node.group === 'code')?.[3]?.attributes.value;
    }

    // this if block validates whether the ui node has email or not. if the email is not there it triggers a error notification that verification code cannot be resent
    if (email === '' || email === undefined) {
      notification['error']({
        message: 'Unable to resend code. Please reload the page or try again.',
      });
      return;
    } else {
      withEmail({
        email: email,
      });
    }
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
          <div
            style={{
              marginTop: 'auto',
              marginBottom: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
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
            <h2
              style={{
                fontSize: '32px',
              }}
            >
              Verify your email
            </h2>
            {state === 'sent_email' && (
              <Alert
                message={ui?.messages[0]?.text}
                type={(ui?.messages[0]?.type !== 'error') ? "success": 'error'}
                style={{
                  width: '480px',
                }}
              />
            )}
            <Form
              name="verification_email"
              onFinish={state !== 'sent_email' ? withEmail : withCode}
            >
              {state === 'choose_method' ? (
                <>
                  <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Please input your Email!' }]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      type="email"
                      placeholder="Please enter your email"
                      size="large"
                      style={{
                        width: '480px',
                      }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      form="verification_email"
                      size="large"
                      type="primary"
                      htmlType="submit"
                      shape="round"
                      block
                    >
                      Send verification link
                    </Button>
                  </Form.Item>
                </>
              ) : (
                <>
                  {/* Form for validating verification code */}
                  <Form.Item
                    name={'code'}
                    rules={[{ required: true, message: 'Please input your verification code!' }]}
                    initialValue={code !== '' ? code: ''}
                  >
                    <Input
                      prefix={<SafetyOutlined />}
                      type="text"
                      placeholder="Enter the verification code"
                      size="large"
                      style={{
                        width: '480px',
                      }}
                    ></Input>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      form="verification_email"
                      size="large"
                      type="primary"
                      htmlType="submit"
                      shape="round"
                      block
                    >
                      Verify Code
                    </Button>
                  </Form.Item>
                  {isResendVisible && (
                    <Button
                      size="large"
                      type="primary"
                      shape="round"
                      onClick={resendVerificationCode}
                      block
                    >
                      Resend Code
                    </Button>
                  )}
                </>
              )}
            </Form>
            <Link
              to={'/auth/login'}
              style={{
                fontSize: '16px',
              }}
            >
              Go back to login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Verification;
