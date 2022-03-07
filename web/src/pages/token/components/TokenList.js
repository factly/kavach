import React from 'react';
import { Popconfirm, Button, Table, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getOrganisationTokens } from '../../../actions/token';

export default function TokenList({ type }) {
  const dispatch = useDispatch();
  const { tokens, loading } = useSelector((state) => {
    switch (type) {
      case 'organisation':
        return {
          tokens: state.tokens.organisations,
          loading: state.tokens.loading,
        };

      case 'application':
        return {
          tokens: state.tokens.applications,
          loading: state.tokens.loading,
        };

      case 'space':
        return {
          tokens: state.tokens.spaces,
          loading: state.tokens.loading,
        };
      default:
        return {
          tokens: [],
          loading: false,
        };
    }
  });

  const fetchTokens = () => {
    dispatch(getOrganisationTokens());
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
      width: '15%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '15%',
    },
    {
      title: 'Api Token',
      dataIndex: 'token',
      key: 'token',
      width: '15%',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '20%',
      render: (_, record) => {
        return (
          <span>
            <Popconfirm
              title="Sure to Revoke?"
              //   onConfirm={() => dispatch(deleteToken(record.id, data.id)).then(() => history.go(0))}
            >
              <Link to="" className="ant-dropdown-link">
                <Button danger type="text">
                  Revoke
                </Button>
              </Link>
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
        style={{ width: '300px' }}
        loading={loading}
        style={{
          display:'flex',
          justifyContent: 'center'
        }}
      />
  );
}
