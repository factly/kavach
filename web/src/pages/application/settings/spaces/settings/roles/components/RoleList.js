import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { deleteSpaceRole, getSpaceRoles } from '../../../../../../../actions/roles';
import { Link } from 'react-router-dom';
import { UserOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

function SpaceRoleList({ appID, spaceID, role }) {
  const dispatch = useDispatch();
  const { roles, loading } = useSelector((state) => {
    var roleIDs = [];
    roleIDs = state.spaces.details[spaceID]?.roleIDs || [];
    return {
      roles: roleIDs.map((id) => {
        return {
          ...state.roles.space[spaceID][id],
        };
      }),
      loading: state.roles.loading,
    };
  });
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (_, record) => {
        return (
          <div key={record.id}>
            {role === 'owner' ? (
              <Link
                key={record.id}
                style={{
                  marginRight: 8,
                }}
                to={{
                  pathname: `/applications/${appID}/settings/spaces/${spaceID}/settings/roles/${record.id}/edit`,
                }}
              >
                {record?.name}
              </Link>
            ) : (
              <h4 key={record.id}>{record?.name}</h4>
            )}
          </div>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '40%',
      align: 'center',
      render: (_, record) => {
        return (
          <span>
            <Space>
              <Link
                to={{
                  pathname: `/applications/${appID}/settings/spaces/${spaceID}/settings/roles/${record.id}/users`,
                }}
              >
                <Button icon={<UserOutlined />} primary="true">
                  Users
                </Button>
              </Link>
              <Link
                key={record.id}
                style={{
                  marginRight: 8,
                }}
                to={{
                  pathname: `/applications/${appID}/settings/spaces/${spaceID}/settings/roles/${record.id}/edit`,
                }}
              >
                <Button icon={<EditOutlined />} primary="true" disabled={role !== 'owner'}>
                  Edit
                </Button>
              </Link>
              <Popconfirm
                title="Sure to Revoke?"
                onConfirm={() => onDelete(record.id)}
                disabled={role !== 'owner'}
              >
                <Button type="danger" icon={<DeleteOutlined />} disabled={role !== 'owner'}>
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          </span>
        );
      },
    },
  ];

  const fetchRoles = () => {
    dispatch(getSpaceRoles(appID, spaceID));
  };

  const onDelete = (id) => {
    dispatch(deleteSpaceRole(appID, spaceID, id)).then(() =>
      dispatch(getSpaceRoles(appID, spaceID)),
    );
  };

  React.useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line
  }, [dispatch, appID, spaceID]);

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

export default SpaceRoleList;
