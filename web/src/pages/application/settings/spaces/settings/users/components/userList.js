import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import { Popconfirm, Button, Table } from 'antd';
import { deleteSpaceUser } from '../../../../../../../actions/spaceUser';
import { getSpaces } from '../../../../../../../actions/space';

export default function UserList({ spaceID, role }) {
  const dispatch = useDispatch();
  const { appID } = useParams();
  const { spaceUsers, loading, total } = useSelector((state) => {
    return {
      spaceUsers: state.spaces.details[spaceID]?.users.map((id) => state.users.details[id]) || [],
      loading: state.spaces.loading,
      total: state.spaces.details[spaceID]?.length,
    };
  });

  const fetchSpaces = () => {
    dispatch(getSpaces(appID));
  };

  React.useEffect(() => {
    fetchSpaces();
    //eslint-disable-next-line
  }, []);

  const onDelete = (id) => {
    dispatch(deleteSpaceUser(appID, spaceID, id)).then(() => fetchSpaces(appID));
  };

  const columns = [
    { title: 'First Name', dataIndex: 'first_name', key: 'name' },
    { title: 'Last Name', dataIndex: 'last_name', key: 'last_name' },
    { title: 'E-mail', dataIndex: 'email', key: 'email' },

    {
      title: 'Action',
      dataIndex: 'operation',
      width: '20%',
      render: (_, record) => {
        return (
          <span>
            <Popconfirm title="Sure to Delete?" onConfirm={() => onDelete(record.id)}>
              <Link to="" className="ant-dropdown-link">
                <Button danger disabled={role !== 'owner'} icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Link>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <Table
      bordered
      columns={columns}
      dataSource={spaceUsers}
      loading={loading}
      rowKey={'id'}
      pagination={{
        total: total,
      }}
      style={{
        width: '78vw',
      }}
    />
  );
}
