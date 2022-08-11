import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaces, deleteSpace } from '../../../../../actions/space';
import { Popconfirm, Button, Table, Avatar, Tooltip, Space } from 'antd';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

function SpaceList({ appID, role }) {
  const dispatch = useDispatch();
  const { spaces, loading } = useSelector((state) => {
    const spaceIDs = state.applications.details?.[appID]?.spaces || [];
    return {
      spaces: spaceIDs.map((id) => ({
        ...state.spaces.details?.[id],
        users: (state.spaces.details?.[id]?.users?.length) ? state.spaces.details?.[id]?.users.map((userID) => state.users.details[userID]): [],
      })),
      loading: state.spaces.loading,
    };
  });

  const fetchSpaces = () => {
    dispatch(getSpaces(appID));
  };

  const onDelete = (appID, id) => {
    dispatch(deleteSpace(appID, id)).then(() => fetchSpaces());
  };

  React.useEffect(() => {
    fetchSpaces();
    // eslint-disable-next-line
  }, [appID]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '16%',
      render: (_, record) => {
        return (
          <div>
            {role === 'owner' ? (
              <Link
                key={record.id}
                style={{
                  marginRight: 8,
                }}
                to={`/applications/${appID}/settings/spaces/${record?.id}/edit`}
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
      title: 'Space users',
      dataIndex: 'space_users',
      key: 'space_users',
      width: '24%',
      render: (_, record) => {
        return (
          <Avatar.Group maxCount={3} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
            {record.users?.map((user) => {
              return (
                <Tooltip title={user.email} placement="top" key={record.id}>
                  <Avatar
                    key={user.id}
                    style={{
                      backgroundColor:
                        '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
                    }}
                  >
                    {user.email.charAt(0)}
                  </Avatar>
                </Tooltip>
              );
            })}
          </Avatar.Group>
        );
      },
    },
    {
      title: 'Site Title',
      dataIndex: 'site_title',
      key: 'site_title',
      width: '20%',
    },
    {
      title: 'Tag line',
      dataIndex: 'tag_line',
      key: 'tag_line',
      width: '20%',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      fixed: 'right',
      align: 'center',
      width: 150,
      render: (_, record) => {
        return (
          <Space>
            <Link to={`/applications/${appID}/settings/spaces/${record.id}/settings`}>
              <Button primary="true" icon={<SettingOutlined />}>
                Settings
              </Button>
            </Link>
            <Popconfirm
              title="Are you sure you want to delete this?"
              onConfirm={() => onDelete(appID, record?.id)}
              disabled={role !== 'owner'}
            >
              <Button type="danger" icon={<DeleteOutlined />} disabled={role !== 'owner'}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      rowKey={'id'}
      bordered
      dataSource={spaces}
      columns={columns}
      loading={loading}
      style={{ width: '78vw' }}
    />
  );
}

export default SpaceList;
