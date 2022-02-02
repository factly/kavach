import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

function ErrorComponent({ status, title, link, message }) {
  status = status || 'warning';
  return (
    <Result
      status={status}
      title={title}
      extra={
        <Link to={link}>
          <Button type="primary">{message}</Button>
        </Link>
      }
    />
  );
}

export default ErrorComponent;
