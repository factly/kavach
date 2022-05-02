import React from 'react';
import { Table, Popconfirm, Button, Tag, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { deleteApplicationPolicy, getApplicationPolicy } from '../../../../../actions/policy';
import { getApplicationRoles } from '../../../../../actions/roles';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function PolicyList({ appID, role }) {
  const dispatch = useDispatch();
  const { policies, loading } = useSelector((state) => {
    var policyIDs = state.applications.details[appID]?.policyIDs || [];
    return {
      policies: policyIDs.map((id) => ({
        ...state.policy.application[appID][id],
        roles:
          state.policy.application[appID][id]?.roles.map((rId) => ({
            ...state.roles.application[appID]?.[rId],
          })) || [],
      })),
      loading: state.policy.loading,
    };
  });

  const fetchPolicy = () => {
    dispatch(getApplicationPolicy(appID));
  };

  const fetchRoles = () => {
    dispatch(getApplicationRoles(appID));
  };

  const onDelete = (id) => {
    dispatch(deleteApplicationPolicy(appID, id)).then(() => dispatch(getApplicationPolicy(appID)));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      width: '30%',
      render: (_, record) => {
        return record.roles.map((role) => {
          return (
            <Tag key={role.id} color="blue">
              {role.name}
            </Tag>
          );
        });
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '25%',
      render: (_, record) => {
        return (
          <Space>
            <Link
              to={{
                pathname: `/applications/${appID}/settings/policies/${record.id}/view`,
              }}
            >
              <Button> View </Button>
            </Link>
            <Link
              to={{
                pathname: `/applications/${appID}/settings/policies/${record.id}/edit`,
              }}
            >
              <Button icon={<EditOutlined />} disabled={role !== 'owner'}>
                Edit
              </Button>
            </Link>
            <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record.id)}>
              <Button type="danger" icon={<DeleteOutlined />} disabled={role !== 'owner'} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  React.useEffect(() => {
    fetchPolicy();
    fetchRoles();
    //eslint-disable-next-line
  }, [dispatch, appID]);

  return (
    <div>
      <Table
        bordered
        columns={columns}
        dataSource={policies}
        rowKey={'id'}
        loading={loading}
        style={{ width: '78vw' }}
      />
    </div>
  );
}
