import React from 'react';
import { Button, Popconfirm, Table, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
import { getUsers, deleteUser } from '../../../../actions/users';
import { Link, useParams } from 'react-router-dom';

function OrganisationUsers() {
  const dispatch = useDispatch();
  const { orgID } = useParams();
  const { users, loading, loadingRole, role } = useSelector((state) => {
    const organisationDetails = state.organisations.details[state.organisations.selected];
    return {
      users: organisationDetails?.users?.map((id) => ({
        ...state.users.details[id],
        role: state.organisations.details[state.organisations.selected]?.roles[id],
      })),
      role: state.profile.roles[state.organisations.selected],
      loading: state.users.loading,
      loadingRole: state.profile.loading,
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
      dataIndex: 'role',
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
      onFilter: (value, record) => record.role === value,
      width: '25%',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          key={record.id}
          title="Sure to delete?"
          onConfirm={() => {
            dispatch(deleteUser(record.id)).then(() => fetchUsers());
          }}
          disabled={!loadingRole ? (role === 'owner' ? false : true) : true}
        >
          <Button
            key={record.id}
            icon={<DeleteOutlined />}
            danger
            disabled={!loadingRole ? (role === 'owner' ? false : true) : true}
          >
            Delete
          </Button>
        </Popconfirm>
      ),
      width: '15%',
    },
  ];

  return (
    <Space direction="vertical">
      {role === 'owner' ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Link key="1" to={`/organisation`} style={{ alignSelf: 'flex-start' }}>
            <Button type="primary"> Back to Settings </Button>
          </Link>
          <Link
            key="2"
            to={`/organisation/${orgID}/settings/users/new`}
            style={{ alignSelf: 'flex-end' }}
          >
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
