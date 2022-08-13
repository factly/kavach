import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { getOrganisationTokens, deleteOrganisationToken } from '../../../../../actions/token';
import { DeleteOutlined } from '@ant-design/icons';

export default function TokenList({ orgID, role }) {
  const dispatch = useDispatch();
  const { tokens, loading } = useSelector((state) => {
    var tokenIDs = state.organisations.details[orgID]?.tokens || [];
    return {
      tokens: tokenIDs.map((id) => state.tokens.organisation[orgID][id]),
      loading: state.tokens.loading,
    };
  });

  const fetchTokens = () => {
    dispatch(getOrganisationTokens());
    //eslint-disable-next-line
  };

  const onDelete = (id) => {
    dispatch(deleteOrganisationToken(id)).then(() => dispatch(getOrganisationTokens()));
  };

  React.useEffect(() => {
    fetchTokens();
    //eslint-disable-next-line
  }, [dispatch]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '25',
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
      width: '35%',
      align: 'center',
      render: (_, record) => {
        return (
          <span>
            <Popconfirm
              title="Sure to Revoke?"
              onConfirm={() => onDelete(record?.id)}
              key={record?.id}
            >
              <Button type="danger" disabled={role !== 'owner'} icon={<DeleteOutlined />}>
                Revoke
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        bordered
        columns={columns}
        dataSource={tokens}
        rowKey={'id'}
        loading={loading}
        style={{ width: '78vw' }}
      />
    </div>
  );
}
