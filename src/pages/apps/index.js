import { Card, Space } from 'antd';
import React from 'react';

function Apps() {
  const { Meta } = Card;
  return (
    <Space size={'middle'}>
      <a href={process.env.REACT_APP_DEGA_PUBLIC_URL + '/posts'}>
        <Card
          bordered={false}
          style={{ width: 200 }}
          cover={
            <img
              alt="example"
              style={{ width: 200, height: 200 }}
              src={require('../../assets/dega.png')}
            />
          }
        >
          <Meta title="Dega" description="Admin Portal for Dega CMS " />
        </Card>
      </a>
      <a href={window.REACT_APP_BINDU_PUBLIC_URL + '/templates'}>
        <Card
          style={{ width: 200 }}
          bordered={false}
          cover={
            <img
              alt="bindu"
              style={{ width: 200, height: 200 }}
              src={require('../../assets/bindu.png')}
            />
          }
        >
          <Meta title="Bindu" description="Admin Portal for Bindu" />
        </Card>
      </a>
    </Space>
  );
}

export default Apps;
