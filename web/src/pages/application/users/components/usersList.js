import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';

import { useDispatch } from 'react-redux';
import { deleteApplication, getApplicationUsers } from '../../../../actions/applicationUsers';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function UserList({ id, flag, users, total, role }) {
  const dispatch = useDispatch();

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flag, id, role]);

  const columns = [
    { title: 'First Name', dataIndex: 'first_name', key: 'name' },
    { title: 'Last Name', dataIndex: 'last_name', key: 'last_name' },
    {
      title: 'Display Name',
      dataIndex: 'display_name',
      key: 'display_name',
      ellipsis: true,
    },
    { title: 'E-mail', dataIndex: 'email', key: 'email' },

    {
      title: 'Action',
      dataIndex: 'operation',
      width: '30%',
      render: (_, record) => {
        return (
          <span>
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() => {
                dispatch(deleteApplication(id, record.id)).then(() => {
                  dispatch(getApplicationUsers(id))
                });
              }}
            >
              <Link to="" className="ant-dropdown-link">
                <Button type="danger" disabled={role !== 'owner'}>
                  <DeleteOutlined />
                </Button>
              </Link>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <Space direction="vertical">
      <Table
        bordered
        columns={columns}
        dataSource={users}
        rowKey={'id'}
        pagination={{
          total: total,
        }}
      />
    </Space>
  );
}

export default UserList;
