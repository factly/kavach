import React from 'react';
import { Button, Popconfirm, Table, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
import { getUsers, deleteUser } from '../../actions/users';
import { Link } from 'react-router-dom';

function OrganisationUsers() {
  const dispatch = useDispatch();

  const { organisation, users, role, loading, loadingRole } = useSelector((state) => {
    return {
      organisation: state.organisations.details[state.organisations.selected],
      users: state.organisations.details[state.organisations.selected]?.user_ids?.map(
        (id) => state.users.details[id],
      ),
      role: state.organisations.role,
      loading: state.users.loading,
      loadingRole: state.organisations.loading,
    };
  });
  console.log('this is users', users);
  const fetchUsers = React.useCallback(() => {
    dispatch(getUsers());
  }, [dispatch]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (text, record) => record.first_name + ' ' + record.last_name,
      width: '30%',
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
      width: '30%',
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: ['permission', 'role'],
      filters: [
        {
          text: 'Owner',
          value: 'owner',
        },
        {
          text: 'Member',
          value: 'member',
        },
      ],
      filterMultiple: false,
      onFilter: (value, record) => record.permission.role === value,
      width: '25%',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Popconfirm
          title="Sure to delete?"
          onConfirm={() => {
            dispatch(deleteUser(record.id)).then(() => fetchUsers());
          }}
          disabled={!loadingRole ? (role === 'owner' ? false : true) : true}
        >
          <Button
            icon={<DeleteOutlined />}
            type="danger"
            disabled={!loadingRole ? (role === 'owner' ? false : true) : true}
          />
        </Popconfirm>
      ),
      width: '15%',
    },
  ];

  return (
    <Space direction="vertical">
      {organisation.permission.role === 'owner' ? (
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <Link key="1" to="/users/new">
            <Button type="primary">Invite Users</Button>
          </Link>
        </div>
      ) : null}
      <Table
        bordered
        style={{ width: '78vw' }}
        rowKey={'id'}
        loading={loading}
        pagination={false}
        columns={columns}
        dataSource={users}
      />
    </Space>
  );
}

export default OrganisationUsers;
