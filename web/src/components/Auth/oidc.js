import React from 'react';
import { Button } from 'antd';
import { GithubOutlined, GoogleOutlined } from '@ant-design/icons';
import createForm from '../../utils/form';

function OIDC({ ui }) {
  const withOIDC = (values) => {
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
    providerInput.name = 'provider';
    providerInput.value = values;

    oidcForm.appendChild(providerInput);
    oidcForm.appendChild(csrfInput);
    oidcForm.appendChild(methodInput);

    document.body.appendChild(oidcForm);

    oidcForm.submit();
  };

  return (
    <Button.Group className="oidc" style={{ display: 'flex', justifyContent: 'center' }}>
      <Button icon={<GithubOutlined />} onClick={() => withOIDC('github')}>
        Github
      </Button>
      <Button icon={<GoogleOutlined />} onClick={() => withOIDC('google')}>
        Google
      </Button>
    </Button.Group>
  );
}

export default OIDC;
