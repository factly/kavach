import React from 'react';
import { Descriptions, Tag, Table } from 'antd';
import { useLocation } from 'react-router-dom';

export default function ViewPolicy() {
  const location = useLocation();
  const { policy, type } = location.state;
  const span = 2
  const nestedTableColumns = [
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => {
        return record.actions.map((action) => {
          return (
            <Tag key={action} color="blue">
              {action}
            </Tag>
          );
        });
      },
    },
  ];
  return (
    <Descriptions title={`Policy detail`}  bordered>
      <Descriptions.Item label="Name" span={span}>{policy.name}</Descriptions.Item><br/>
      <Descriptions.Item label="Description" span={span}>{policy.description}</Descriptions.Item><br/>
      <Descriptions.Item label="Permissions" span={span}>
        <Table
          bordered={false}
          columns={nestedTableColumns}
          dataSource={policy.permissions}
          rowKey={'id'}
          pagination={false}
        />
      </Descriptions.Item><br/>
      <Descriptions.Item label="Roles" span={span}>
        {policy.roles.map((role) => {
          return (
            <Tag key={role.id} color="blue">
              {role.name}
            </Tag>
          );
        })}
      </Descriptions.Item>
    </Descriptions>
  );
}
