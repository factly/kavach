import React from 'react';
import { Table, Popconfirm, Button, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { deleteOrganisationPolicy, getOrganisationPolicy } from '../../../../../actions/policy';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { MINIMUM_WIDTH_ACTION_BUTTONS } from '../../../../../constants/styles/width';

export default function PolicyList({ orgID, role }) {
  const dispatch = useDispatch();
  const { policies, loading } = useSelector((state) => {
    var policyIDs = state.organisations.details[orgID]?.policyIDs || [];
    return {
      policies: policyIDs?.map((id) => ({
        ...state.policy.organisation?.[orgID]?.[id],
      })),
      loading: state.policy.loading,
    };
  });

  const fetchPolicy = () => {
    dispatch(getOrganisationPolicy());
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
      width: '40%',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '40%',
      align: 'center',
      render: (_, record) => {
        return (
          <Space key={`policy-${record.id}`}>
            <Link
              to={{
                pathname: `/organisation/${orgID}/settings/policies/${record.id}/view`,
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
                pathname: `/organisation/${orgID}/settings/policies/${record.id}/edit`,
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
                type="danger"
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
    // fetchRoles();
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
