import React from 'react';
import { Popconfirm, Button, Table, Space, Avatar, Tooltip } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getApplications, deleteApplication } from '../../../actions/application';
import { getOrganisations } from '../../../actions/organisations';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

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
        const maxAvatar = 4;
        return (
          <Avatar.Group>
            {record.users &&
              record.users.length > 0 &&
              record.users.slice(0, maxAvatar).map((each) => (
                <Tooltip title={each.email} placement="top">
                  {each.medium && each.medium.url ? (
                    <Avatar src={each.medium.url.proxy}></Avatar>
                  ) : (
                    <Avatar
                      style={{
                        backgroundColor:
                          '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
                      }}
                    >
                      {each.email.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                </Tooltip>
              ))}
            {record.users.length > 4 ? (
              <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                +{record.users.length - maxAvatar}
              </Avatar>
            ) : (
              <></>
            )}
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
              <Button>
                <EditOutlined />
              </Button>
            </Link>
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() =>
                dispatch(deleteApplication(record.id)).then(() => {
                  dispatch(getOrganisations());
                  fetchApplications();
                })
              }
            >
              <Link to="" className="ant-dropdown-link">
                <Button type="danger">
                  <DeleteOutlined />
                </Button>
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
