import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';

import { useDispatch } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
import {
  deleteApplicationRoleUserByID,
  deleteOrganisationRoleUserByID,
  deleteSpaceRoleUserByID,
  getApplicationRoleUsers,
  getOrganisationRoleUsers,
  getSpaceRoleUsers,
} from '../../../../actions/roles';

function UserList({ users, orgID, appID, spaceID, roleID, type }) {
  const dispatch = useDispatch();

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const deleteUser = (id) => {
    switch (type) {
      case 'organisation':
        dispatch(deleteOrganisationRoleUserByID(roleID, id)).then(() =>
          dispatch(getOrganisationRoleUsers(roleID)),
        );
        break;
      case 'application':
        dispatch(deleteApplicationRoleUserByID(appID, roleID, id)).then(() =>
          dispatch(getApplicationRoleUsers(appID, roleID)),
        );
        break;
      case 'space':
        dispatch(deleteSpaceRoleUserByID(appID, spaceID, roleID, id)).then(() =>
          dispatch(getSpaceRoleUsers(appID, spaceID, roleID)),
        );
        break;
      default:
        return;
    }
  };
  return (
    <Space direction="vertical">
      <Table bordered columns={columns} dataSource={users} rowKey={'id'} />
    </Space>
  );
}

export default UserList;
