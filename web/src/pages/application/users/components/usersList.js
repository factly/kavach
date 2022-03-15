import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { deleteApplication, getApplicationUsers } from '../../../../actions/applicationUsers';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function UserList({ id, flag, users, total }) {
  const dispatch = useDispatch();
  const fetchApplications = () => {
    dispatch(getApplicationUsers(id));
  };

  React.useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, flag]);

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
                dispatch(deleteApplication(id, record.id));
              }}
            >
              <Link to="" className="ant-dropdown-link">
                <Button type="danger">
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
