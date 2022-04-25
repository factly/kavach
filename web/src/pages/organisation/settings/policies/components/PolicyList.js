import React from 'react';
import { Table, Popconfirm, Button, Tag, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { deleteOrganisationPolicy, getOrganisationPolicy } from '../../../../../actions/policy';
import { getOrganisationRoles } from '../../../../../actions/roles';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function PolicyList({ orgID, role }) {
  const dispatch = useDispatch();
  const { policies, loading } = useSelector((state) => {
    var policyIDs = state.organisations.details[orgID]?.policyIDs || [];
    return {
      policies: policyIDs.map((id) => ({
        ...state.policy.organisation[orgID][id],
        roles:
          state.policy.organisation[orgID][id]?.roles.map((rId) => ({
            ...state.roles.organisation[orgID]?.[rId],
          })) || [],
      })),
      loading: state.policy.loading,
    };
  });

  const fetchPolicy = () => {
    dispatch(getOrganisationPolicy());
  };

  const fetchRoles = () => {
    dispatch(getOrganisationRoles());
  };

  const onDelete = (id) => {
    dispatch(deleteOrganisationPolicy(id)).then(() => dispatch(getOrganisationPolicy()));
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
                pathname: `/organisation/${orgID}/settings/policies/${record.id}/view`,
              }}
            >
              <Button> View </Button>
            </Link>
            <Link
              to={{
                pathname: `/organisation/${orgID}/settings/policies/${record.id}/edit`,
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
  }, [dispatch, orgID]);

  return (
    <Table
      bordered
      columns={columns}
      dataSource={policies}
      rowKey={'id'}
      loading={loading}
      style={{ width: '78vw' }}
    />
  );
}
