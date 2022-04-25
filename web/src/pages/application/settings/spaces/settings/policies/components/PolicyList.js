import React from 'react';
import { Table, Popconfirm, Button, Tag } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { deleteSpacePolicy, getSpacePolicy } from '../../../../../../../actions/policy';
import { getSpaceRoles } from '../../../../../../../actions/roles';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function PolicyList({ appID, spaceID, role }) {
  const dispatch = useDispatch();
  const { policies, loading } = useSelector((state) => {
    const policyIDs = state.spaces.details[spaceID]?.policyIDs || [];
    return {
      policy: policyIDs.map((id) => ({
        ...state.policy.space[spaceID][id],
        roles:
          state.policy.space[spaceID][id]?.roles.map((rId) => ({
            ...state.roles.space[spaceID]?.[rId],
          })) || [],
      })),
      loading: state.policy.loading,
    };
  });

  const fetchPolicy = () => {
    dispatch(getSpacePolicy(appID, spaceID));
  };

  const fetchRoles = () => {
    dispatch(getSpaceRoles(appID, spaceID));
  };

  const onDelete = (id) => {
    dispatch(deleteSpacePolicy(appID, spaceID, id)).then(() =>
      dispatch(getSpacePolicy(appID, spaceID)),
    );
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
          <div>
            <Link
              to={{
                pathname: `/applications/${appID}/settings/spaces/${spaceID}/settings/policies/${record.id}/view`,
              }}
            >
              <Button> View </Button>
            </Link>
            <Link
              to={{
                pathname: `/applications/${appID}/settings/spaces/${spaceID}/settings/policies/${record.id}/edit`,
              }}
            >
              <Button icon={<EditOutlined />} disabled={role !== 'owner'}>
                Edit
              </Button>
            </Link>
            <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record.id)}>
              <Button type="danger" icon={<DeleteOutlined />} disabled={role !== 'owner'} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    fetchPolicy();
    fetchRoles();
    //eslint-disable-next-line
  }, [dispatch, appID, spaceID]);

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
