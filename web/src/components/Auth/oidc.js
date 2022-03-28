import React from 'react';
import { Button } from 'antd';
import { GithubOutlined, GoogleOutlined } from '@ant-design/icons';
import createForm from '../../utils/form';
import GoogleIcon from '../../assets/btn_google_light_normal_ios.svg';
import GithubIcon from '../../assets/GitHub-Mark-120px-plus.png'
import { Divider } from 'antd';

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
    <Button.Group className="oidc" style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexDirection: 'column' }}>
      <Button onClick={() => withOIDC('github')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '48px', fontWeight: 'bold', }}>
        <img src={GithubIcon} alt="Continue with Google" style={{ height: '100%', padding: '9px' }} /> <span>Continue with Github</span>
      </Button>
      <Button onClick={() => withOIDC('google')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '48px', fontWeight: 'bold', }}>
        <img src={GoogleIcon} alt="Continue with Google" style={{ height: '100%' }} /> <span>Continue with Google</span>
      </Button>
      <Divider plain>Or Sign in with Email</Divider>
    </Button.Group>
  );
}

export default OIDC;
