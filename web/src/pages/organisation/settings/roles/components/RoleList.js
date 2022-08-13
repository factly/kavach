import React from 'react';
import { Popconfirm, Button, Table, Avatar, Tooltip, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { deleteOrganisationRole, getOrganisationRoles } from '../../../../../actions/roles';
import { Link } from 'react-router-dom';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';

function OrganisationRoleList({ orgID, role }) {
  const dispatch = useDispatch();
  const { roles, loading } = useSelector((state) => {
    var roleIDs = [];
    roleIDs = state.organisations.details[state.organisations.selected]?.roleIDs || [];
    return {
      roles: roleIDs.map((id) => ({
        ...state.roles.organisation[state.organisations.selected][id],
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
                  pathname: `/organisation/${orgID}/settings/roles/${record.id}/edit`,
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
            {role === 'owner' ? (
              <Space>
                <Link
                  to={{
                    pathname: `/organisation/${orgID}/settings/roles/${record.id}/users`,
                  }}
                >
                  <Button icon={<UserOutlined />} primary="true">
                    View Users
                  </Button>
                </Link>
                <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record.id)}>
                  <Button type="danger" icon={<DeleteOutlined />}>
                    Delete
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
    dispatch(getOrganisationRoles());
  };

  const onDelete = (id) => {
    dispatch(deleteOrganisationRole(id)).then(() => dispatch(getOrganisationRoles()));
  };

  React.useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line
  }, [dispatch, orgID]);

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

export default OrganisationRoleList;
