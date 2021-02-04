import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';

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
    const node = state.application.req[0];

    if (node)
      return {
        applications: node.data.map((element) => state.application.details[element]),
        loading: state.application.loading,
        total: node.total,
      };
    return { applications: [], loading: state.application.loading, total: 0 };
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
      render: (_, record) => {
        return (
          <span>
            <Link
              className="ant-dropdown-link"
              style={{
                marginRight: 8,
              }}
              to={`/application/${record.id}/users`}
            >
              {record.name}
            </Link>
          </span>
        );
      },
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '50%',
      ellipsis: true,
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <span>
            <Link
              className="ant-dropdown-link"
              style={{
                marginRight: 8,
              }}
              to={`/application/${record.id}/edit`}
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
