import React from 'react';
import { Table, Popconfirm, Button, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { deleteSpacePolicy, getSpacePolicy } from '../../../../../../../actions/policy';
import { getSpaceRoles } from '../../../../../../../actions/roles';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { MINIMUM_WIDTH_ACTION_BUTTONS } from '../../../../../../../constants/styles/width';

export default function PolicyList({ appID, spaceID, role }) {
  const dispatch = useDispatch();
  const { policies, loading } = useSelector((state) => {
    const policyIDs = state.spaces.details[spaceID]?.policyIDs || [];

    return {
      policies: policyIDs?.map((id) => {
        return {
          ...state.policy.space?.[spaceID]?.[id],
          roles:
            state.policy.space[spaceID][id]?.roles?.map((rId) => ({
              ...state.roles.space?.[spaceID]?.[rId],
            })) || [],
        };
      }),
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
      title: 'Action',
      dataIndex: 'operation',
      width: '25%',
      align: 'center',
      render: (_, record) => {
        return (
          <Space>
            <Link
              to={{
                pathname: `/applications/${appID}/settings/spaces/${spaceID}/settings/policies/${record.id}/view`,
              }}
            >
              <Button
                icon={<EyeOutlined />}
                style={{
                  minWidth: MINIMUM_WIDTH_ACTION_BUTTONS,
                }}
              >
                View
              </Button>
            </Link>
            <Link
              to={{
                pathname: `/applications/${appID}/settings/spaces/${spaceID}/settings/policies/${record.id}/edit`,
              }}
            >
              <Button
                icon={<EditOutlined />}
                style={{
                  minWidth: MINIMUM_WIDTH_ACTION_BUTTONS,
                }}
                disabled={role !== 'owner'}
              >
                Edit
              </Button>
            </Link>
            <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record.id)}>
              <Button
                danger
                icon={<DeleteOutlined />}
                style={{
                  minWidth: MINIMUM_WIDTH_ACTION_BUTTONS,
                }}
                disabled={role !== 'owner'}
              >
                Delete
              </Button>
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
