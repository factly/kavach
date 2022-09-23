import React from 'react';
import { Table, Popconfirm, Button, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { deleteApplicationPolicy, getApplicationPolicy } from '../../../../../actions/policy';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { MINIMUM_WIDTH_ACTION_BUTTONS } from '../../../../../constants/styles/width';

export default function PolicyList({ appID, role }) {
  const dispatch = useDispatch();
  const { policies, loading } = useSelector((state) => {
    var policyIDs = state.applications.details?.[appID]?.policyIDs || [];
    return {
      policies: policyIDs?.map((id) => ({
        ...state.policy?.application?.[appID]?.[id],
      })),
      loading: state.policy.loading,
    };
  });

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
      width: '40%',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '40%',
      align: 'center',
      render: (_, record) => {
        return (
          <Space>
            <Link
              to={{
                pathname: `/applications/${appID}/settings/policies/${record.id}/view`,
              }}
            >
              <Button
                style={{
                  minWidth: MINIMUM_WIDTH_ACTION_BUTTONS,
                }}
                icon={<EyeOutlined />}
              >
                {' '}
                View{' '}
              </Button>
            </Link>
            <Link
              to={{
                pathname: `/applications/${appID}/settings/policies/${record.id}/edit`,
              }}
            >
              <Button
                icon={<EditOutlined />}
                disabled={role !== 'owner'}
                style={{
                  minWidth: MINIMUM_WIDTH_ACTION_BUTTONS,
                }}
              >
                Edit
              </Button>
            </Link>
            <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record.id)}>
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                disabled={role !== 'owner'}
                style={{
                  minWidth: MINIMUM_WIDTH_ACTION_BUTTONS,
                }}
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
