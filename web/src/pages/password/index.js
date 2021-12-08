import React from 'react';
import { Card, Form, Input, Button, notification, Space, Alert, Switch, Row, List, Col} from 'antd';
import { LockOutlined} from '@ant-design/icons';
function Password() {
  const [ui, setUI] = React.useState({});
  React.useEffect(() => {
    var obj = {};

    window.location.search
      .split('?')
      .filter((each) => each.trim() !== '')
      .forEach((each) => {
        var temp = each.split('=');
        obj[temp[0]] = temp[1];
      });

    if (!obj['flow']) {
      window.location.href = process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/browser';
    }

    fetch(process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/flows?id=' + obj['flow'], {
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
        if (res.state === 'success') {
          notification.success({
            message: 'Success',
            description: 'Password has been successful updated',
          });
        }
      })
      .catch((err) => {
        window.location.href = process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/settings/browser';
      });
  }, []);

  const getImageByText = (value) =>{
    switch(value){
        case "google":
            return <img src={require('../../assets/google_logo.png')} alt="google" width='35%'/>
        case "github":
            return <img src={require('../../assets/github_logo.png')} alt="github" width='35%'/>
        default:
            return <></>
    }
  }
  function SocialItem({provider, state}){
    return (
      <Row style={{display:'flex', flexDirection:'row', width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>
        <Col span={18}>
          {
            getImageByText(provider)
          }
        </Col>
        <Col span={6} >
          <Switch
            checked={(state==='link') ? false : true}
            checkedChildren="linked"
            unCheckedChildren="unlinked"
            style={(state==='link')?{backgroundColor:'#FF3632'}:{backgroundColor:'#52CA6D'}}
            onClick={()=>onClick(provider, state)}
            >
          </Switch>
        </Col>
      </Row>
    )
  }
      
  const changePassword = (values) => {
    var updatePasswordForm = document.createElement('form');
    updatePasswordForm.action = ui.action;
    updatePasswordForm.method = ui.method;
    updatePasswordForm.style.display = 'none';

    var emailInput = document.createElement('input');
    emailInput.name = 'password_identifier';
    emailInput.value = ui.nodes[1].attributes.value;

    var passwordInput = document.createElement('input');
    passwordInput.name = 'password';
    passwordInput.value = values.password;

    var csrfInput = document.createElement('input');
    csrfInput.name = 'csrf_token';
    csrfInput.value = ui.nodes.find(
      (value) => value.attributes.name === 'csrf_token',
    ).attributes.value;

    var methodInput = document.createElement('input');
    methodInput.name = 'method';
    methodInput.value = 'password';

    updatePasswordForm.appendChild(emailInput);
    updatePasswordForm.appendChild(passwordInput);
    updatePasswordForm.appendChild(methodInput);
    updatePasswordForm.appendChild(csrfInput);
    document.body.appendChild(updatePasswordForm);
    updatePasswordForm.submit();
  };

  const onClick = (provider, action)=>{
    var oidcForm = document.createElement('form');
    oidcForm.action = ui.action;
    oidcForm.method = ui.method;
    oidcForm.style.display = 'none';

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
    providerInput.name = action; //two actions - 1)link 2)unlink
    providerInput.value = provider;

    oidcForm.appendChild(providerInput);
    oidcForm.appendChild(csrfInput);
    oidcForm.appendChild(methodInput);

    document.body.appendChild(oidcForm);

    oidcForm.submit();
  }

  return (
    <Space 
      className="content" style={{
      display:'flex',
      flexDirection:'column',
      height:'100%',
      justifyContent:'space-around',
      alignItems:'center'
      
    }}>
      {
        (ui && ui.messages) ? <Alert message={ui.node.messages[0].text}></Alert> : null
      }
      <Card 
        title="Update password"
        style={{ width: 400 }}>
        <Form name="update_password" onFinish={changePassword}>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please re-enter your Password!' },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (getFieldValue('password') !== value) {
                    return Promise.reject('Password do no match!');
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Confirm Password"
            />
          </Form.Item>
          <Form.Item>
            <Button form="update_password" type="primary" htmlType="submit" block>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Card
        title="Update social sign-in linking" 
        style={{width:400}}
      >
        <List
          itemLayout='horizontal'
          dataSource={ui&&ui.nodes ? ui.nodes.filter((node)=>node.group==="oidc"): []}
          renderItem={
            item=>{
              return <List.Item>
                        <SocialItem provider={item.attributes.value} state={item.attributes.name}/>
                     </List.Item>
            }
          }
          >
        </List>
      </Card>
    </Space>
  );
}

export default Password;
