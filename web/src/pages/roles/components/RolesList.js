import React from 'react';
import { Popconfirm, Button, Table, Form, Select, Avatar, Tooltip } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  deleteApplicationRole,
  deleteOrganisationRole,
  deleteSpaceRole,
  getApplicationRoles,
  getOrganisationRoles,
  getSpaceRoles,
} from '../../../actions/roles';
import { Link } from 'react-router-dom';

// RolesList displays the roles in the form of table
export default function RolesList({ type }) {
  const dispatch = useDispatch();
  const [appID, setAppID] = React.useState(null);
  const [spaceID, setSpaceID] = React.useState(null);
  const { applications, loadingApps, spaces, loadingSpaces, userRole, orgID } = useSelector((state) => {
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
      userRole: state.organisations.details[state.organisations.selected].role,
      orgID: state.organisations.selected
    };
  });

  const { roles, loading } = useSelector((state) => {
    var roleIDs = [];
    switch (type) {
      case 'organisation':
        roleIDs = state.organisations.details[state.organisations.selected]?.roleIDs || [];
        return {
          roles: roleIDs.map((id) => ({
            ...state.roles.organisation[state.organisations.selected][id],
            users:
              state.roles.organisation[state.organisations.selected][id]?.users.map(
                (id) => state.users.details[id],
              ) || [],
          })),
          loading: state.roles.loading,
        };
      case 'application':
        roleIDs = state.applications.details[appID]?.roleIDs || [];
        return {
          roles: roleIDs.map((id) => ({
            ...state.roles.application[appID][id],
            users:
              state.roles.application[appID][id]?.users.map((id) => state.users.details[id]) || [],
          })),
          loading: state.roles.loading,
        };
      case 'space':
        roleIDs = state.spaces.details[spaceID]?.roleIDs || [];
        return {
          roles: roleIDs.map((id) => ({
            ...state.roles.space[spaceID][id],
            users: state.roles.space[spaceID][id]?.users.map((id) => state.users.details[id]) || [],
          })),
          loading: state.roles.loading,
        };
      default:
        return {
          roles: [],
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

  const fetchRoles = () => {
    switch (type) {
      case 'organisation':
        dispatch(getOrganisationRoles());
        break;
      case 'application':
        if (appID) {
          dispatch(getApplicationRoles(appID));
        }
        break;
      case 'space':
        if (spaceID) {
          dispatch(getSpaceRoles(appID, spaceID));
        }
        break;
      default:
        return;
    }
  };

  const onDelete = (id) => {
    switch (type) {
      case 'organisation':
        dispatch(deleteOrganisationRole(id)).then(() => dispatch(getOrganisationRoles()));
        break;
      case 'application':
        dispatch(deleteApplicationRole(appID, id)).then(() => dispatch(getApplicationRoles(appID)));
        break;
      case 'space':
        dispatch(deleteSpaceRole(id, appID, spaceID)).then(() =>
          dispatch(getSpaceRoles(appID, spaceID)),
        );
        break;
      default:
        return;
    }
  };

  function getPathfromType(type, id){
    switch (type) {
      case 'organisation':
        return `/organisations/${orgID}/roles/${id}/edit`;
      case 'application':
        return `/organisations/${orgID}/applications/${appID}/roles/${id}/edit`;
      case 'space':
        return `/organisations/${orgID}/applications/${appID}/spaces/${spaceID}/roles/${id}/edit`;
      default:
        return null;
    }
  }
  React.useEffect(() => {
    fetchRoles();
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
      render: (_, record) => {
        return (
          <div>
            {userRole === 'owner' ? (
              <Link
                style={{
                  marginRight: 8,
                }}
                to={
                  {
                    pathname: getPathfromType(type, record?.id),
                    state: type
                  }
                }
              >
                {record?.name}
              </Link>
            ) : (
              <h4>{record?.name}</h4>
            )}
          </div>
        );
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '15%',
    },
    {
      title: 'Users',
      dataIndex: 'users',
      key: 'users',
      width: '15%',
      render: (_, record) => {
        return (
          <Avatar.Group maxCount={3} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
            {record.users.map((user) => {
              return (
                <Tooltip title={user.email} placement="top">
                  <Avatar
                    key={user.id}
                    style={{
                      backgroundColor:
                        '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
                    }}
                  >
                    {user.email.charAt(0)}
                  </Avatar>
                </Tooltip>
              );
            })}
          </Avatar.Group>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '20%',
      render: (_, record) => {
        return (
          <span>
            <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record.id)}>
              <Button danger type="text">
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
      <Table bordered columns={columns} dataSource={roles} rowKey={'id'} loading={loading} />
    </div>
  );
}
