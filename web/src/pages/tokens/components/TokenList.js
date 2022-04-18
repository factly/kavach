import React from 'react';
import { Popconfirm, Button, Table, Form, Select } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  deleteOrganisationToken,
  deleteSpaceToken,
  deleteApplicationToken,
  getApplicationTokens,
  getOrganisationTokens,
  getSpaceTokens,
} from '../../../actions/token';

export default function TokenList({ type }) {
  const dispatch = useDispatch();
  const [appID, setAppID] = React.useState(null);
  const [spaceID, setSpaceID] = React.useState(null);
  const { applications, loadingApps, spaces, loadingSpaces } = useSelector((state) => {
    return {
      applications: state.organisations.details[state.organisations.selected].applications.map(
        (id) => state.applications.details[id],
      ),
      loadingApps: state.organisations.loading,
      spaces:
        appID === null
          ? []
          : state.applications.details[appID].spaces.map((id) => state.spaces.details[id]),
      loadingSpaces: state.applications.loading,
    };
  });

  const { tokens, loading } = useSelector((state) => {
    var tokenIDs = [];
    switch (type) {
      case 'organisation':
        tokenIDs = state.organisations.details[state.organisations.selected]?.tokens || [];
        return {
          tokens: tokenIDs.map((id) => state.tokens.details[id]),
          loading: state.tokens.loading,
        };
      case 'application':
        tokenIDs = state.applications.details[appID]?.tokens || [];
        return {
          tokens: tokenIDs.map((id) => state.tokens.details[id]),
          loading: state.tokens.loading,
        };
      case 'space':
        tokenIDs = state.spaces.details[spaceID]?.tokens || [];
        return {
          tokens: tokenIDs.map((id) => state.tokens?.details[id]),
          loading: state.tokens.loading,
        };
      default:
        return {
          tokens: [],
          loading: true,
        };
    }
  });

  const onAppChange = (value) => {
    setAppID(value);
  };

  const onSpaceChange = (value) => {
    setSpaceID(value);
  };

  const fetchTokens = () => {
    switch (type) {
      case 'organisation':
        dispatch(getOrganisationTokens());
        break;
      case 'application':
        if (appID) {
          dispatch(getApplicationTokens(appID));
        }
        break;
      case 'space':
        if (spaceID) {
          dispatch(getSpaceTokens(appID, spaceID));
        }
        break;
      default:
        return;
    }
  };

  const onDelete = (id) => {
    switch (type) {
      case 'organisation':
        dispatch(deleteOrganisationToken(id)).then(() => dispatch(getOrganisationTokens()));
        break;
      case 'application':
        dispatch(deleteApplicationToken(appID, id)).then(() =>
          dispatch(getApplicationTokens(appID)),
        );
        break;
      case 'space':
        dispatch(deleteSpaceToken(id, appID, spaceID)).then(() =>
          dispatch(getSpaceTokens(appID, spaceID)),
        );
        break;
      default:
        return;
    }
  };

  React.useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line
  }, [dispatch, spaceID, appID, type]);

  React.useEffect(() => {
    setAppID(applications[0]?.id);
    setSpaceID(spaces[0]?.id);
    // eslint-disable-next-line
  }, [type]);

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
            <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record.id)}>
              <Link to="" className="ant-dropdown-link">
                <Button type="danger">
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
    <div>
      <Form>
        {(type === 'application' || type === 'space') && !loadingApps ? (
          <Form.Item
            label="Application"
            name="application"
            rules={[
              {
                required: true,
                message: 'Please input application name!',
              },
            ]}
            style={{
              width: 300,
            }}
          >
            <Select onChange={onAppChange} defaultValue={applications[0]?.id}>
              {applications.map((app) => {
                return (
                  <Select.Option key={app.id} value={app.id}>
                    {app.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        ) : null}
        {type === 'space' && !loadingSpaces ? (
          <Form.Item
            label="Space"
            name="space"
            rules={[
              {
                required: true,
                message: 'Please input space name!',
              },
            ]}
            style={{
              width: 300,
            }}
          >
            <Select onChange={onSpaceChange}>
              {spaces.map((space) => {
                return (
                  <Select.Option key={space.id} value={space.id}>
                    {space.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        ) : null}
      </Form>
      <Table bordered columns={columns} dataSource={tokens} rowKey={'id'} loading={loading} />
    </div>
  );
}
