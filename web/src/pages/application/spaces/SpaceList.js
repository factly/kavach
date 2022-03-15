import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteSpace, getSpaces } from '../../../actions/space';
import { Popconfirm, Button, Table, Avatar, Tooltip, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

function SpaceList({ appID, role }) {
  const dispatch = useDispatch();
  const { spaces, loading, users } = useSelector((state) => {
    const spaceIDList = state.applications.details[appID]?.space_ids; // it is undefined if there are no spaces
    return {
      spaces: spaceIDList ? spaceIDList.map((id) => state.spaces.details[id]) : [],
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
  }, [dispatch, appID]);

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
                style={{
                  marginRight: 8,
                }}
                to={`/applications/${appID}/spaces/${record.id}/edit`}
              >
                {record.name}
              </Link>
            ) : (
              <h4>{record.name}</h4>
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
            {/* {record.users.map((user) => {
              return (
                <Tooltip title={user.email} placement="top">
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
            })} */}
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
            <Link to={`/applications/${appID}/spaces/${record.id}/users`}>
              <Button
                icon={<PlusOutlined />}
                style={{ backgroundColor: '#00FF00' }}
                disabled={role !== 'owner'}
              />
            </Link>
            <Popconfirm
              title="Are you sure you want to delete this?"
              onConfirm={() => onDelete(appID, record.id)}
              disabled={role !== 'owner'}
            >
              <Button type="danger" icon={<DeleteOutlined />} disabled={role !== 'owner'} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  return <Table rowKey={'id'} bordered dataSource={spaces} columns={columns} loading={loading} />;
}

export default SpaceList;