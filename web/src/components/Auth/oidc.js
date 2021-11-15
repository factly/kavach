import React from 'react';
import { Button } from 'antd';
import { GithubOutlined, GoogleOutlined } from '@ant-design/icons';

function OIDC({action, method, nodes, csrf}) {
  const getIcon = (provider)=>{
    switch (provider){ 
      case 'github':
        return <GithubOutlined/>
        break;
      case 'google':
        return <GoogleOutlined/>
    }
  }
  const withOIDC = (oidc_provider) => {
    var oidcForm = document.createElement('form');
    oidcForm.action = action;
    oidcForm.method = method;
    oidcForm.style.display = 'none';

    var csrfInput = document.createElement('input');
    csrfInput.name = csrf.attributes.name;
    csrfInput.value = csrf.attributes.value;

    var providerInput = document.createElement('input');
    providerInput.name = 'provider';
    providerInput.value = oidc_provider;

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
    <Button.Group className="oidc">
      {
        nodes.map((node, index)=>(<Button key={index} icon={getIcon(node.attributes.value)}>{node.attributes.value.charAt(0).toUpperCase()+node.attributes.value.slice(1)}</Button>))
      }
    </Button.Group>
  );
}

export default OIDC;
