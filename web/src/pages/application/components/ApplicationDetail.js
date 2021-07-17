import React from 'react';
import { Button, Descriptions, Table, Popconfirm, Typography, Modal } from 'antd';
import { deleteToken } from '../../../actions/token';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import CreateTokenForm from '../token/CreateTokenForm';

const ApplicationDetail = ({ data = {}, visible, setVisible }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
    },
    {
      title: 'Api Token',
      dataIndex: 'token',
      key: 'token',
      width: '15%',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '20%',
      render: (_, record) => {
        return (
          <span>
            <Popconfirm
              title="Sure to Revoke?"
              onConfirm={() => dispatch(deleteToken(record.id, data.id)).then(() => history.go(0))}
            >
              <Link to="" className="ant-dropdown-link">
                <Button danger type="text">
                  Revoke
                </Button>
              </Link>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <>
      <Descriptions bordered={true}>
        <Descriptions.Item label="Name">{data.name}</Descriptions.Item>
        <Descriptions.Item label="Slug">{data.slug}</Descriptions.Item>
        <Descriptions.Item label="Organisation Id">{data.organisation_id}</Descriptions.Item>
        <Descriptions.Item label="Users">0</Descriptions.Item>
        <Descriptions.Item label="URL">{data.url}</Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 20 }}>
        <Typography.Title level={5}>Tokens</Typography.Title>
      </div>
      <Table bordered columns={columns} dataSource={data.tokens} rowKey={'id'} pagination={false} />

      <Button style={{ marginTop: 5 }} onClick={() => setVisible(true)}>
        {<PlusOutlined />}New api key
      </Button>

      <Modal
        visible={visible}
        title="Generate Api key"
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setVisible(false);
              history.go(0);
            }}
          >
            Return
          </Button>,
        ]}
      >
        <CreateTokenForm appID={data.id} setVisible={setVisible} />
      </Modal>
    </>
  );
};

export default ApplicationDetail;
