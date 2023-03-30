import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaces, deleteSpace } from '../../../../../actions/space';
import { Popconfirm, Button, Table, Space } from 'antd';
import { DeleteOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

function SpaceList({ appID, role }) {
  const dispatch = useDispatch();
  const { spaces, loading } = useSelector((state) => {
    const spaceIDs = state.applications.details?.[appID]?.spaces || [];
    return {
      spaces: spaceIDs.map((id) => ({
        ...state.spaces.details?.[id],
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
      width: '20%',
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      fixed: 'right',
      align: 'center',
      width: '40%',
      render: (_, record) => {
        return (
          <Space>
            <Link to={`/applications/${appID}/settings/spaces/${record?.id}/edit`}>
              <Button
                primary="true"
                icon={<EditOutlined />}
                style={{ minWidth: '30%' }}
                disabled={role !== 'owner'}
              >
                Edit
              </Button>
            </Link>
            <Link to={`/applications/${appID}/settings/spaces/${record.id}/settings`}>
              <Button primary="true" icon={<SettingOutlined />} style={{ minWidth: '30%' }}>
                Settings
              </Button>
            </Link>
            <Popconfirm
              title="Are you sure you want to delete this?"
              onConfirm={() => onDelete(appID, record?.id)}
              disabled={role !== 'owner'}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={role !== 'owner'}
                style={{ minWidth: '30%' }}
              >
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
    />
  );
}

export default SpaceList;
