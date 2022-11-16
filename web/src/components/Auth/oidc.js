import React from 'react';
import { Button } from 'antd';
import createForm from '../../utils/form';
import GoogleIcon from '../../assets/btn_google_light_normal_ios.svg';
import GithubIcon from '../../assets/GitHub-Mark-120px-plus.png';
import { Divider } from 'antd';
import { dispatchPosthogEvent } from '../../utils/posthog';
import { capitalizeFirstLetter } from '../../utils/strings';

function OIDC({ ui, flow = 'login', loginMethod = 'all' }) {
  const withOIDC = (values) => {
    var oidcForm = createForm(ui.action, ui.method);
    dispatchPosthogEvent(capitalizeFirstLetter(flow), {})
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
    <Button.Group
      className="oidc"
      style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexDirection: 'column' }}
    >
      {ui?.nodes
        ?.filter((each) => each.group === 'oidc')
        ?.filter((oidcNode) => oidcNode?.attributes.value === 'github')?.length > 0 ? (
          <Button
          onClick={() => withOIDC('github')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '48px',
            fontWeight: 'bold',
          }}
        >
          <img
            src={GithubIcon}
            alt="Continue with Github"
            style={{ height: '100%', padding: '9px' }}
          />{' '}
          <span>Continue with Github</span>
        </Button>
      ) : null}
      {ui?.nodes
        ?.filter((each) => each.group === 'oidc')
        ?.filter((oidcNode) => oidcNode?.attributes.value === 'google')?.length > 0 ? (
        <Button
          onClick={() => withOIDC('google')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '48px',
            fontWeight: 'bold',
          }}
        >
          <img src={GoogleIcon} alt="Continue with Google" style={{ height: '100%' }} />{' '}
          <span>Continue with Google</span>
        </Button>
      ) : null}
      {loginMethod === 'all' ? (
        <Divider plain>Or Sign {flow === 'registration' ? 'up' : 'in'} with Email</Divider>
      ) : null}
    </Button.Group>
  );
}

export default OIDC;
