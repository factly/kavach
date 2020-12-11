import React from 'react';
import { Button, Popconfirm, Table, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
import { getUsers, deleteUser } from '../../actions/users';
import { Link } from 'react-router-dom';

function OrganisationUsers() {

  const dispatch = useDispatch();

  const { organisation, users, loading } = useSelector((state) => {
    return {
      organisation: state.organisations.details[state.organisations.selected],
      users: state.users.ids.map((id) => state.users.details[id]),
      loading: state.users.loading,
    };
  });

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
        >
          <Button icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
      width: '15%',
    },
  ];

  return (
    <Space direction="vertical">
      {organisation.permission.role === 'owner' ? (
         <Link key="1" to="/users/new">
         <Button>
           Add User
         </Button>
       </Link>
      ) : null}
      <Table
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
