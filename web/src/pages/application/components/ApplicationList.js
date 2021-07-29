import React from 'react';
import { Popconfirm, Button, Table, Space, Avatar, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useDispatch, useSelector } from 'react-redux';
import { getApplications, deleteApplication } from '../../../actions/application';
import { Link } from 'react-router-dom';

function ApplicationList() {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 5,
  });

  const { applications, loading, total } = useSelector((state) => {
    const node = state.applications.req[0];

    if (node)
      return {
        applications: node.data.map((element) => state.applications.details[element]),
        loading: state.applications.loading,
        total: node.total,
      };
    return { applications: [], loading: state.applications.loading, total: 0 };
  });

  React.useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const fetchApplications = () => {
    dispatch(getApplications());
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: '15%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      ellipsis: true,
    },
    {
      title: 'Users',
      dataIndex: 'users',
      key: 'users',
      width: '30%',
      render: (_, record) => {
        return (
          <Avatar.Group maxCount={4} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
            <Tooltip title="Add user" placement="top">
              <Link
                className="ant-dropdown-link"
                style={{
                  marginRight: 8,
                }}
                to={`/applications/${record.id}/users`}
              >
                <Avatar icon={<PlusOutlined />} />
              </Link>
            </Tooltip>
            {record.users &&
              record.users.length > 0 &&
              record.users.map((each) => (
                <Tooltip title={each.email} placement="top">
                  <Avatar
                    style={{
                      backgroundColor:
                        '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
                    }}
                  >
                    {each.email.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
          </Avatar.Group>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '20%',
      render: (_, record) => {
        return (
          <span>
            <Link
              className="ant-dropdown-link"
              style={{
                marginRight: 8,
              }}
              to={`/applications/${record.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() =>
                dispatch(deleteApplication(record.id)).then(() => fetchApplications())
              }
            >
              <Link to="" className="ant-dropdown-link">
                <Button>Delete</Button>
              </Link>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <Space direction="vertical">
      <Table
        bordered
        columns={columns}
        dataSource={applications}
        loading={loading}
        rowKey={'id'}
        pagination={{
          total: total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
      />
    </Space>
  );
}

export default ApplicationList;
