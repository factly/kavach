import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteSpace, getSpaces } from '../../../actions/space';
import { Popconfirm, Button, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

function SpaceList({ appID }) {
  const dispatch = useDispatch();
  const { spaces, loading } = useSelector((state) => {
    return {
      spaces: state.spaces.ids.map((id) => state.spaces.details[id]),
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
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/applications/${appID}/spaces/${record.id}/edit`}
          >
            {record.name}
          </Link>
        );
      },
    },
    {
      title: 'Site Address',
      dataIndex: 'site_address',
      key: 'site_address',
      width: '24%',
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
          <Popconfirm
            title="Are you sure you want to delete this?"
            onConfirm={() => onDelete(appID, record.id)}
          >
            <Button type="danger" icon={<DeleteOutlined />} />
          </Popconfirm>
        );
      },
    },
  ];
  return <Table rowKey={'id'} bordered dataSource={spaces} columns={columns} loading={loading} />;
}

export default SpaceList;
