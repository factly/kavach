import React from 'react';
import { Button } from 'antd';
import { GithubOutlined, GoogleOutlined } from '@ant-design/icons';

function OIDC({ action, method, provider, csrf }) {
  const withOIDC = (values) => {
    var oidcForm = document.createElement('form');
    oidcForm.action = action;
    oidcForm.method = method;
    oidcForm.style.display = 'none';

    var csrfInput = document.createElement('input');
    csrfInput.name = csrf.attributes.name;
    csrfInput.value = csrf.attributes.value;

    var providerInput = document.createElement('input');
    providerInput.name = provider.attributes.name;
    providerInput.value = values;

    var methodInput = document.createElement('input');
    methodInput.name = 'method';
    methodInput.value = 'oidc';

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
