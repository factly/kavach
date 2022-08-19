import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Loading = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
      }}
    >
      <Spin indicator={<LoadingOutlined style={{ fontSize: 64 }} spin />} />
    </div>
  );
};

export default Loading;
