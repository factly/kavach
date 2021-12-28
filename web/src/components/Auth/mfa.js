import React from 'react';
import { Button, Alert, Card, Form, Input, Space } from 'antd';
import createForm from '../../utils/form';

export default function MFA({ ui }) {
  const withTOTP = (values) => {
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
    totpInput.name = 'totp_code';
    totpInput.value = values.totp_code;

    totpForm.appendChild(csrfInput);
    totpForm.appendChild(totpMethod);
    totpForm.appendChild(totpInput);

    document.body.appendChild(totpForm);

    totpForm.submit();
  };
  return (
    <Card title="Two Factor Authenticator" style={{ width: 400 }}>
      <Space direction="vertical">
        {ui !== {} ? (
          <Alert type={ui.messages[0].type} message={ui.messages[0].text}></Alert>
        ) : null}
        <Form name="mfa_authentication" onFinish={withTOTP}>
          <Form.Item name="totp_code">
            <Input type="text" placeholder="Authentication Code" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" placeholder="submit" htmlType="submit" block>
              submit
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
}
