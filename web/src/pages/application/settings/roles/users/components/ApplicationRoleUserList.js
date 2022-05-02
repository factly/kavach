import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useDispatch } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
import {
  deleteApplicationRoleUserByID,
  getApplicationRoleUsers,
} from '../../../../../../actions/roles';

export default function UserList({ users, appID, roleID }) {
  const dispatch = useDispatch();
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteUser = (id) => {
    dispatch(deleteApplicationRoleUserByID(appID, roleID, id)).then(() =>
      dispatch(getApplicationRoleUsers(appID, roleID)),
    );
  };

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
                deleteUser(record.id);
              }}
            >
              <Button type="danger">
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return <Table bordered columns={columns} dataSource={users} rowKey={'id'} />;
}
