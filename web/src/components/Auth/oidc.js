import React from 'react';
import { Button } from 'antd';
import { GithubOutlined, GoogleOutlined } from '@ant-design/icons';

function OIDC(props) {
  const withOIDC = (values) => {
    var oidcForm = document.createElement('form');
    oidcForm.action = props.config.action;
    oidcForm.method = props.config.method;
    oidcForm.style.display = 'none';

    var csrfInput = document.createElement('input');
    csrfInput.name = 'csrf_token';
    csrfInput.value = props.config.fields.find((value) => value.name === 'csrf_token').value;

    var providerInput = document.createElement('input');
    providerInput.name = 'provider';
    providerInput.value = values;

    oidcForm.appendChild(providerInput);
    oidcForm.appendChild(csrfInput);

    document.body.appendChild(oidcForm);

    oidcForm.submit();
  };

  return (
    <Button.Group className="oidc">
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
