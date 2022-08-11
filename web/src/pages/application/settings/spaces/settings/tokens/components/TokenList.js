import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { getSpaceTokens, deleteSpaceToken } from '../../../../../../../actions/token';

export default function TokenList({ appID, spaceID, role }) {
  const dispatch = useDispatch();
  const fetchTokens = () => {
    dispatch(getSpaceTokens(appID, spaceID));
  };

  const onDelete = (id) => {
    dispatch(deleteSpaceToken(id, appID, spaceID)).then(() =>
      dispatch(getSpaceTokens(appID, spaceID)),
    );
  };

  React.useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line
  }, [dispatch]);

  const { tokens, loading } = useSelector((state) => {
    var tokenIDs = [];
    tokenIDs = state.spaces.details[spaceID]?.tokens || [];
    return {
      tokens: tokenIDs.map((id) => state.tokens?.space[spaceID]?.[id]),
      loading: state.tokens.loading,
    };
  });

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
      render: (_, record) => {
        return (
          <span>
            <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record?.id)}>
              <Button type="danger" disabled={role !== 'owner'}>
                Revoke
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <Table
      bordered
      columns={columns}
      dataSource={tokens}
      rowKey={'id'}
      loading={loading}
      style={{ width: '78vw' }}
    />
  );
}
