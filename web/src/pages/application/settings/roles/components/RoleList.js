import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { deleteApplicationRole, getApplicationRoles } from '../../../../../actions/roles';
import { Link } from 'react-router-dom';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';

function ApplicationRoleList({ appID, role }) {
  const dispatch = useDispatch();
  const { roles, loading } = useSelector((state) => {
    var roleIDs = [];
    roleIDs = state.applications.details[appID]?.roleIDs || [];
    return {
      roles: roleIDs?.map((id) => ({
        ...state.roles.application[appID][id],
      })),
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
                  pathname: `/applications/${appID}/settings/roles/${record.id}/users`,
                }}
              >
                <Button icon={<UserOutlined />} primary="true">
                  View Users
                </Button>
              </Link>
              <Popconfirm
                title="Sure to Revoke?"
                onConfirm={() => onDelete(record.id)}
                disabled={role !== 'owner'}
              >
                <Button danger icon={<DeleteOutlined />} disabled={role !== 'owner'}>
                  {' '}
                  Delete{' '}
                </Button>
              </Popconfirm>
            </Space>
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
