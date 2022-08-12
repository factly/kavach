import React from 'react';
import { Popconfirm, Button, Table, Avatar, Tooltip, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { deleteApplicationRole, getApplicationRoles } from '../../../../../actions/roles';
import { Link } from 'react-router-dom';
import { UserAddOutlined, DeleteOutlined } from '@ant-design/icons';

function ApplicationRoleList({ appID, role }) {
  const dispatch = useDispatch();
  const { roles, loading } = useSelector((state) => {
    var roleIDs = [];
    roleIDs = state.applications.details[appID]?.roleIDs || [];
    return {
      roles: roleIDs?.map((id) => ({
        ...state.roles.application[appID][id],
        users:
          state.roles.application[appID][id]?.users?.map((userID) => state.users.details[userID]) ||
          [],
      })),
      loading: state.roles.loading,
    };
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      render: (_, record) => {
        return (
          <div>
            {role === 'owner' ? (
              <Link
                style={{
                  marginRight: 8,
                }}
                to={{
                  pathname: `/applications/${appID}/settings/roles/${record.id}/edit`,
                }}
              >
                {record?.name}
              </Link>
            ) : (
              <h4>{record?.name}</h4>
            )}
          </div>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '15%',
    },
    {
      title: 'Users',
      dataIndex: 'users',
      key: 'users',
      width: '15%',
      render: (_, record) => {
        return (
          <Avatar.Group maxCount={3} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
            {record?.users?.map((user) => {
              return (
                <Tooltip title={user?.email} placement="top" key={'role-' + user?.id}>
                  <Avatar
                    key={user?.id}
                    style={{
                      backgroundColor:
                        '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
                    }}
                  >
                    {user?.email?.charAt(0)}
                  </Avatar>
                </Tooltip>
              );
            })}
          </Avatar.Group>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '20%',
      render: (_, record) => {
        return (
          <span>
            {role === 'owner' ? (
              <Space>
                <Link
                  to={{
                    pathname: `/applications/${appID}/settings/roles/${record.id}/users`,
                  }}
                >
                  <Button icon={<UserAddOutlined />} primary="true">
                    Add users
                  </Button>
                </Link>
                <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record.id)}>
                  <Button type="danger" icon={<DeleteOutlined />}>
                    {' '}
                    Delete{' '}
                  </Button>
                </Popconfirm>
              </Space>
            ) : null}
          </span>
        );
      },
    },
  ];

  const fetchRoles = () => {
    dispatch(getApplicationRoles(appID));
  };

  const onDelete = (id) => {
    dispatch(deleteApplicationRole(appID, id)).then(() => dispatch(getApplicationRoles(appID)));
  };

  React.useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line
  }, [dispatch, appID]);
  return (
    <div>
      <Table
        bordered
        columns={columns}
        dataSource={roles}
        rowKey={'id'}
        loading={loading}
        style={{ width: '78vw' }}
      />
    </div>
  );
}

export default ApplicationRoleList;
