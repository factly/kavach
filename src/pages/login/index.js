import React from "react";
import "./login.css";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { Input, Form, Button, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

function Login() {
  const [config, setConfig] = React.useState({});

  const { Title } = Typography;

  React.useEffect(() => {
    var obj = {};

    window.location.search
      .split("?")
      .filter((each) => each.trim() !== "")
      .forEach((each) => {
        var temp = each.split("=");
        obj[temp[0]] = temp[1];
      });

    if (!obj["request"]) {
      window.location.href =
        process.env.REACT_APP_KRATOS_PUBLIC_URL +
        "/self-service/browser/flows/login";
    }

    fetch(
      process.env.REACT_APP_KRATOS_PUBLIC_URL +
        "/self-service/browser/flows/requests/login?request=" +
        obj["request"]
    )
      .then((res) => res.json())
      .then((res) => setConfig(res.methods.password.config));
  }, []);

  if (!config.action) return null;

  const onFinish = (values) => {
    var loginForm = document.createElement("form");
    loginForm.action = config.action;
    loginForm.method = config.method;
    loginForm.style.display = "none";

    var identifierInput = document.createElement("input");
    identifierInput.name = "identifier";
    identifierInput.value = values.email;

    var passwordInput = document.createElement("input");
    passwordInput.name = "password";
    passwordInput.value = values.password;

    var csrfInput = document.createElement("input");
    csrfInput.name = "csrf_token";
    csrfInput.value = config.fields[2].value;

    loginForm.appendChild(identifierInput);
    loginForm.appendChild(passwordInput);
    loginForm.appendChild(csrfInput);

    document.body.appendChild(loginForm);

    loginForm.submit();
  };

  return (
    <div className="login">
      <div className="top">
        <div className="header">
          <img alt="logo" className="logo" src={logo} />
          <span className="title">Go Commerce</span>
        </div>
        <div className="desc">From A to Z datasets</div>
      </div>
      <div className="login-form">
        <Title level={3} className="login-form-title">
          Admin Login
        </Title>
        <Form name="admin_login" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your Email!" },
              { type: "email", message: "Please input valid Email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div>
        <Title level={4}>
          <Link to="/auth/registration">Sign up</Link>
        </Title>
      </div>
    </div>
  );
}

export default Login;
