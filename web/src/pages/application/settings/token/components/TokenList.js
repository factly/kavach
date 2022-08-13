import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { getApplicationTokens, deleteApplicationToken } from '../../../../../actions/token';
import { DeleteOutlined } from '@ant-design/icons';

export default function TokenList({ appID, role }) {
  const dispatch = useDispatch();
  const { tokens, loading } = useSelector((state) => {
    var tokenIDs = [];
    tokenIDs = state.applications.details[appID]?.tokens || [];
    return {
      tokens: tokenIDs.map((id) => state.tokens.application[appID][id]),
      loading: state.tokens.loading,
    };
  });

  const fetchTokens = () => {
    dispatch(getApplicationTokens(appID));
    //eslint-disable-next-line
  };

  const onDelete = (id) => {
    dispatch(deleteApplicationToken(appID, id)).then(() => dispatch(getApplicationTokens(appID)));
  };

  React.useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line
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
      align:'center',
      render: (_, record) => {
        return (
          <span>
            <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record?.id)}>
              <Button type="danger" disabled={role !== 'owner'} icon={<DeleteOutlined/>}>
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
